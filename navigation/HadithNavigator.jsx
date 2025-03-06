import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import HadithScreen from '../screens/HadithScreen';
import SearchHadith from '../screens/SearchHadith';
import HadithSettings from '../screens/HadithSettings';
import HadithDetail from '../screens/HadithDetail';
import HadithCollection from '../screens/HadithCollection';

const Stack = createStackNavigator();

export default function HadithNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: 'transparent' },
      }}>
      <Stack.Screen name="HadithHome" component={HadithScreen} />
      <Stack.Screen name="SearchHadith" component={SearchHadith} />
      <Stack.Screen name="HadithSettings" component={HadithSettings} />
      <Stack.Screen name="HadithDetail" component={HadithDetail} />
      <Stack.Screen name="HadithCollection" component={HadithCollection} />
    </Stack.Navigator>
  );
}