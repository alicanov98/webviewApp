/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import messaging from '@react-native-firebase/messaging';

// Reactotron
if (__DEV__) {
    import('./config/reactotronConfig').then(() =>
        console.log('Reactotron Configured'),
    );
}
AppRegistry.registerComponent(appName, () => App);

// AppRegistry.registerHeadlessTask('ReactNativeFirebaseMessagingHeadlessTask', () => messaging().setBackgroundMessageHandler);