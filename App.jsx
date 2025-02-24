import { NavigationContainer } from '@react-navigation/native';
import * as Font from 'expo-font';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';

import { ThemeProvider } from './context/ThemeContext';
import AppNavigator from './navigation/AppNavigator';
import './global.css';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  // Configurer les notifications
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  // Demander les permissions
  async function requestNotificationPermissions() {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Les permissions pour les notifications ont été refusées.');
    }
  }

  // Demander les permissions de localisation
  async function requestLocationPermissions() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Les permissions pour la localisation ont été refusées.');
    }
  }

  useEffect(() => {
    async function prepare() {
      try {
        await requestNotificationPermissions();
        await requestLocationPermissions();

        // Charger les polices
        await Font.loadAsync({
          'Poppins-Regular': require('./assets/fonts/Poppins-Regular.ttf'),
          'Poppins-Bold': require('./assets/fonts/Poppins-Bold.ttf'),
          'Poppins-Italic': require('./assets/fonts/Poppins-Italic.ttf'),
          'Poppins-BoldItalic': require('./assets/fonts/Poppins-BoldItalic.ttf'),
        });

        // Simuler une tâche asynchrone
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (appIsReady) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null; // Ou un écran de chargement personnalisé
  }

  return (
    <ThemeProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </ThemeProvider>
  );
}
