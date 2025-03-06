import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import QariListScreen from '../screens/QariListScreen';
import QariDetailScreen from '../screens/QariDetailScreen';
import { COLORS } from '../components/ui/Theme';

const Stack = createStackNavigator();

export default function QariNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: 'transparent' },
      }}>
      <Stack.Screen name="QariList" component={QariListScreen} />
      <Stack.Screen name="QariDetail" component={QariDetailScreen} />
    </Stack.Navigator>
  );
}