import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import QuranNavigator from './QuranNavigator';
import SurashNavigator from './SurashNavigator';
import PrayerTimesScreen from '../screens/PrayerTimesScreen';
import DhikrScreen from '../screens/DhikrScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { BookOpen, Clock, Heart, Radio, Settings } from 'lucide-react-native'; // Icônes corrigées
import { useTheme } from '../context/ThemeContext';
import { View } from "react-native";

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  const { theme } = useTheme();

  return (
    <View style={{
      flex: 1,
      backgroundColor: theme === 'dark' ? '#000' : '#fff',
    }} >
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            const iconColor = theme === 'dark' ? '#fff' : '#000';
            if (route.name === 'Coran') {
              return <BookOpen size={size} color={iconColor} />;
            } else if (route.name === 'Prières') {
              return <Clock size={size} color={iconColor} />;
            } else if (route.name === 'Dhikr') {
              return <Heart size={size} color={iconColor} />;
            } else if (route.name === 'Favoris') {
              return <Heart size={size} color={iconColor} />;
            } else if (route.name === 'Paramètres') {
              return <Settings size={size} color={iconColor} />;
            } else if (route.name === 'Qaris') {
              return <Radio size={size} color={iconColor} />; // Icône corrigée
            }
          },
          tabBarActiveTintColor: theme === 'dark' ? '#3b82f6' : '#2563eb',
          tabBarInactiveTintColor: theme === 'dark' ? '#9ca3af' : '#6b7280',
          tabBarStyle: {
            backgroundColor: theme === 'dark' ? '#1f2937' : '#f9fafb',
          },
          headerShown: false,
        })}
      >
        <Tab.Screen name="Qaris" component={SurashNavigator} />
        <Tab.Screen name="Coran" component={QuranNavigator} />
        <Tab.Screen name="Prières" component={PrayerTimesScreen} />
        <Tab.Screen name="Dhikr" component={DhikrScreen} />
        <Tab.Screen name="Favoris" component={FavoritesScreen} />
        <Tab.Screen name="Paramètres" component={SettingsScreen} />
      </Tab.Navigator>
    </View>
  );
}