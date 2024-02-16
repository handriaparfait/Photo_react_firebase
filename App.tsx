/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

//import { getStorage } from '@react-native-firebase/storage';


import Home from './Components/Home';

function App() {

  return (
    <View style={{ justifyContent : 'center', alignItems : 'center', flex : 1 }}>
        <Home></Home>
    </View>
  );
}

export default App;
