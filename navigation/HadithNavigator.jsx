import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import DhikrScreen from '../screens/DhikrScreen';
import SearchHadith from '../screens/SearchHadith';
import HadithSettings from '../screens/HadithSettings';
import HadithDetail from '../screens/HadithDetail';
import CollectionBooksScreen from '../screens/CollectionBooksScreen';
import HadithCollectionScreen from '../screens/HadithCollectionScreen';

const Stack = createStackNavigator();

export default function HadithNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: 'transparent' },
      }}>
      <Stack.Screen name="HadithHome" component={DhikrScreen} />
      <Stack.Screen name="SearchHadith" component={SearchHadith} />
      <Stack.Screen name="HadithSettings" component={HadithSettings} />
      <Stack.Screen name="HadithDetail" component={HadithDetail} />
      <Stack.Screen name="CollectionBooks" component={CollectionBooksScreen} />
      <Stack.Screen name="HadithsByBook" component={HadithCollectionScreen} />
    </Stack.Navigator>
  );
}