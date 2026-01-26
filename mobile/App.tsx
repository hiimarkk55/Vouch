/**
 * ABSOLUTE MINIMUM TEST
 * Just React Native core - no custom code
 */

import React from 'react';
import { View, Text } from 'react-native';

export default function App() {
  return (
    <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: '#00FFFF', fontSize: 24 }}>VOUCH</Text>
      <Text style={{ color: '#00FF41', fontSize: 16, marginTop: 20 }}>SDK 51 TEST</Text>
    </View>
  );
}
