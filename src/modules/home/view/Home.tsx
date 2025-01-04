import React, {useEffect, useRef, useState} from 'react';
import WebView from 'react-native-webview';
import {
  Linking,
  StatusBar,
  View,
  BackHandler,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import SplashScreen from 'react-native-splash-screen';
import messaging from '@react-native-firebase/messaging';
import GlobalStyles from '../../../globals/styles.ts';
import LoadingScreen from '../../../component/LoadingScreen.tsx';

interface IRemoteNotification {
  collapseKey: string;
  data: {
    link: string;
  };
  from: string;
  messageId: string;
  notification: {
    android: {
      sound: string;
    };
    body: string;
    title: string;
  };
  sentTime: number;
  ttl: number;
}

const Home = ({fcm}: {fcm: string}) => {
  const [urls, setUrls] = useState<Array<{url?: string}>>([]);
  const [baseUrl, setBaseUrl] = useState<Array<{url?: string}>>([]);
  const [currentUrl, setCurrentUrl] = useState('');
  const [notificationLink, setNotificationLink] = useState('');
  const [initialLoad, setInitialLoad] = useState(true);
  const [loading, setLoading] = useState(true);
  const webViewRef = useRef<WebView | null>(null);

  const fetchUrls = () => {
    return firestore()
      .collection('urls')
      .onSnapshot(querySnapshot => {
        const urlList: Array<{url?: string; id: string}> = [];
        querySnapshot?.forEach(documentSnapshot => {
          urlList.push({
            ...documentSnapshot.data(),
            id: documentSnapshot.id,
          });
        });
        setUrls(urlList);
      });
  };

  const fetchBaseUrl = () => {
    return firestore()
      .collection('baseUrl')
      .onSnapshot(querySnapshot => {
        const url: Array<{url?: string; id: string}> = [];
        querySnapshot?.forEach(documentSnapshot => {
          url.push({
            ...documentSnapshot.data(),
            id: documentSnapshot.id,
          });
        });
        setBaseUrl(url);
      });
  };

  useEffect(() => {
    const subscriber = fetchUrls();
    return () => subscriber();
  }, []);

  useEffect(() => {
    const subscriber = fetchBaseUrl();
    return () => subscriber();
  }, []);

  useEffect(() => {
    if (baseUrl[0]?.url && initialLoad) {
      setCurrentUrl(`${baseUrl[0]?.url}${fcm}`);
      setInitialLoad(false);
      SplashScreen.hide();
    }
  }, [baseUrl, fcm, initialLoad]);

  useEffect(() => {
    // Listener for background notifications
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      if (remoteMessage?.data?.link) {
        setNotificationLink(remoteMessage?.data?.link);
      }
    });

    const notificationOpenedListener = messaging().onNotificationOpenedApp(
      remoteMessage => {
        if (remoteMessage?.data?.link) {
          setNotificationLink(remoteMessage?.data?.link);
        }
      },
    );

    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          setNotificationLink(remoteMessage?.data?.link);
        }
      });

    return () => {
      notificationOpenedListener();
    };
  }, []);

  useEffect(() => {
    const onBackPress = () => {
      if (webViewRef.current) {
        if (notificationLink) {
          // Navigate back to the baseUrl if notificationLink is set
          setCurrentUrl(baseUrl[0]?.url || ''); // Default URL if no baseUrl
          setNotificationLink(''); // Clear the notification link after navigating
        } else {
          webViewRef.current.goBack(); // Default back behavior
        }
        return true; // Prevent default back action
      }
      return false; // Allow default back action if WebView is not available
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress,
    );

    return () => backHandler.remove();
  }, [webViewRef, notificationLink, baseUrl]);

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      Alert.alert(
        remoteMessage.notification?.title || 'New Notification',
        remoteMessage.notification?.body || 'You have received a new message',
        [
          {
            text: 'View Details',
            onPress: () => {
              setCurrentUrl(remoteMessage?.data?.link);
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ],
        {cancelable: true},
      );
    });

    return () => unsubscribe();
  }, []);
console.log('base', baseUrl)
console.log('urls', urls)
  return (
    <View
      style={{
        flex: 1,
      }}>
      <StatusBar
        backgroundColor={loading ? '#fff' : GlobalStyles.colors.PrimaryColor}
        barStyle={'light-content'}
      />
      {loading && <LoadingScreen />}
      {currentUrl && (
        <WebView
          pullToRefreshEnabled={false}
          onLoadEnd={() => {
            setLoading(false);
          }}
          cacheEnabled={true}
          ref={webViewRef}
          allowsBackForwardNavigationGestures={true}
          onNavigationStateChange={async navState => {
            const newUrl = navState.url;
            const isSupportedUrl = urls.some(item => {
              const itemUrl = item.url?.toLowerCase();
              const lowerNewUrl = newUrl.toLowerCase();
              return lowerNewUrl.includes(itemUrl || '');
            });
            if (isSupportedUrl) {
              setCurrentUrl(newUrl);
            } else {
              await Linking.openURL(newUrl);
            }
          }}
          onError={syntheticEvent => {
            const {nativeEvent} = syntheticEvent;
            console.error('WebView error: ', nativeEvent);
          }}
          onHttpError={syntheticEvent => {
            const {nativeEvent} = syntheticEvent;
            console.error('HTTP error: ', nativeEvent);
            Alert.alert(`Hata`, `Bir hata oluştu: ${nativeEvent.description}`);
          }}
          source={{
            uri: notificationLink ? notificationLink : currentUrl,
          }}
          style={{
            flex: 1,
          }}
        />
      )}
    </View>
  );
};

export default Home;
