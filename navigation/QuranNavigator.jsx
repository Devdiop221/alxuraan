import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { useTheme } from '../context/ThemeContext';
import QuranScreen from '../screens/QuranScreen';
import SourateDetail from '../screens/SourateDetail';

const Stack = createStackNavigator();

export default function QuranNavigator() {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
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
        name="Quran"
        component={QuranScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SourateDetail"
        component={SourateDetail}
      />
    </Stack.Navigator>
  );
}