import 'react-native-get-random-values';
/**
 * @format
 */

import { AppRegistry, LogBox } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Abaikan warning SafeAreaView bawaan yang dipicu oleh internal @gluestack-ui
LogBox.ignoreLogs([
  'SafeAreaView has been deprecated and will be removed in a future release',
]);

AppRegistry.registerComponent(appName, () => App);
