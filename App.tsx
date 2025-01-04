import React, { useEffect, useState } from 'react';
import Home from './src/modules/home/view/Home.tsx';
import messaging from '@react-native-firebase/messaging';
import useNetworkStatus from './src/hooks/useNetworkStatus.tsx';
import { Text, View, Alert, StatusBar } from 'react-native';
import NoConnection from './src/assets/images/icons/no-connection.svg';
import GlobalStyles from './src/globals/styles.ts';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import notifee, { AuthorizationStatus } from '@notifee/react-native';

const App = () => {
    const isConnected = useNetworkStatus();
    const [fcm, setFcm] = useState('');

    async function requestUserPermission() {
        try {
            const settings = await notifee.requestPermission({
                alert: true,
                criticalAlert: true,
                badge: true,
                sound: true,
                announcement: true,
            });
            if (settings.authorizationStatus === AuthorizationStatus.DENIED) {
                Alert.alert('Permission Denied', 'You need to enable notifications for this app.');
            } else if (settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
                settings.authorizationStatus === AuthorizationStatus.PROVISIONAL) {
                await getFCMToken();
            } else {
                console.log('Notification permission has already been granted.');
            }
        } catch (error) {
            console.error('Error requesting permission:', error);
        }
    }

    const getFCMToken = async () => {
        const token = await messaging().getToken();
        setFcm(token);
    };

    const subscribeToTopic = async () => {
        await messaging().subscribeToTopic('all');
    };

    useEffect(() => {
        (async () => {
            await requestUserPermission();
            await getFCMToken();
            await subscribeToTopic();
        })();
    }, []);

    useEffect(() => {
        const unsubscribe = messaging().onMessage(async (remoteMessage) => {
            // Here, you can display a local notification using notifee
            await notifee.displayNotification({
                title: remoteMessage.notification?.title || 'New Notification',
                body: remoteMessage.notification?.body || 'You have received a new message',
                android: {
                    channelId: 'default',
                },
                
            });
        });

        // const backgroundMessageHandler = messaging().setBackgroundMessageHandler(async (remoteMessage) => {
        //     console.log('Message handled in the background!', remoteMessage);
        //     // You can also handle background messages here if needed
        // });

        return () => {
            unsubscribe();
        };
    }, []);

    useEffect(() => {
        const enableFullScreen = async () => {
            await SystemNavigationBar.leanBack(true);
            await SystemNavigationBar.fullScreen(true);
            await SystemNavigationBar.stickyImmersive(true);
            await SystemNavigationBar.navigationShow();
        };
        enableFullScreen();
        return () => {
            SystemNavigationBar.leanBack(false);
        };
    }, []);
console.log(fcm)
    return isConnected ? (
        <Home fcm={fcm} />
    ) : (
        <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: GlobalStyles.colors.PrimaryColor,
        }}>
            <NoConnection width={150} />
            <Text style={{ marginBottom: 250 }}>İnternet bağlantınız yok. Lütfen yeniden deneyin !</Text>
        </View>
    );
};

export default App;