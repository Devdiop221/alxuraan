import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { useTheme } from '../context/ThemeContext';
import PlayerScreen from '../screens/PlayerScreen';
import QarisScreen from '../screens/QarisScreen';
import SurahsScreen from '../screens/SurahsScreen';

const Stack = createStackNavigator();

export default function SurashNavigator() {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      h
      screenOptions={{
        cardStyle: { backgroundColor: theme === 'dark' ? '#000' : '#fff' },
        headerStyle: {
          backgroundColor: theme === 'dark' ? '#1f2937' : '#f9fafb',
        },
        headerTintColor: theme === 'dark' ? '#fff' : '#000',
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="Qaris"
        component={QarisScreen}
        options={{ title: 'Récitateurs' }}
      />
      <Stack.Screen
        name="Surahs"
        component={SurahsScreen}
        options={{ title: 'Sourates' }}
      />
      <Stack.Screen
        name="Player"
        component={PlayerScreen}
        options={{ title: 'Lecteur' }}
      />
    </Stack.Navigator>
  );
}