import React, { useEffect, useState, useRef } from 'react';
import { SafeAreaView, View, Alert, Button, ScrollView, RefreshControl } from 'react-native';
import * as Notifications from 'expo-notifications';

import { Colors } from '../components/ui/Colors';
import { CustomLoadingIndicator } from '../components/ui/LoadingIndicator';
import { CustomText } from '../components/ui/Typography';
import { useTheme } from '../context/ThemeContext';
import {
  schedulePrayerTimeNotifications,
  getUserLocation,
  getPrayerTimesByCoords,
  setupNotifications
} from '../services/prayerTimesService';

// Configurer les notifications
setupNotifications();

export default function PrayerTimesScreen() {
  const { theme } = useTheme();
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Référence pour les écouteurs de notification
  const notificationListener = useRef();
  const responseListener = useRef();

  // Fonction pour charger les horaires de prière
  const loadPrayerTimes = async () => {
    try {
      setErrorMessage(null);
      const location = await getUserLocation();

      if (location) {
        const { latitude, longitude } = location;
        const times = await getPrayerTimesByCoords(latitude, longitude);
        setPrayerTimes(times);

        // Planifier les notifications
        await schedulePrayerTimeNotifications(times);
      } else {
        setErrorMessage("Impossible d'obtenir votre localisation. Veuillez vérifier vos paramètres.");
      }
    } catch (error) {
      console.error("Erreur lors du chargement des horaires:", error);
      setErrorMessage("Une erreur s'est produite lors du chargement des horaires de prière.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fonction pour rafraîchir les données
  const onRefresh = async () => {
    setRefreshing(true);
    await loadPrayerTimes();
  };

  // Configurer les notifications et charger les données au démarrage
  useEffect(() => {
    // Charger les horaires de prière
    loadPrayerTimes();

    // Configurer les écouteurs de notification
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification reçue:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Réponse de notification:', response);
    });

    // Nettoyage lors du démontage du composant
    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  // Fonction pour tester les notifications
  const testNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Test de notification",
        body: "Cette notification est un test pour les horaires de prière",
        sound: true,
      },
      trigger: { seconds: 2 },
    });
    Alert.alert('Notification envoyée', 'Vous devriez recevoir une notification dans quelques secondes.');
  };

  if (loading) {
    return <CustomLoadingIndicator />;
  }

  const textColor = theme === 'dark' ? Colors.text : Colors.text;
  const prayerNames = {
    Fajr: "Fajr (Aube)",
    Dhuhr: "Dhuhr (Midi)",
    Asr: "Asr (Après-midi)",
    Maghrib: "Maghrib (Coucher du soleil)",
    Isha: "Isha (Nuit)"
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      <SafeAreaView
        style={{
          flex: 1,
          padding: 16,
          backgroundColor: theme === 'dark' ? Colors.background : Colors.background,
        }}>
        <CustomText
          size="2xl"
          weight="bold"
          style={{ marginBottom: 16 }}
          color={textColor}>
          Horaires de Prière
        </CustomText>

        {errorMessage && (
          <View style={{ marginBottom: 16, padding: 12, backgroundColor: '#ffdddd', borderRadius: 8 }}>
            <CustomText color="#ff0000">{errorMessage}</CustomText>
          </View>
        )}

        {prayerTimes && (
          <View style={{ marginBottom: 20 }}>
            {Object.entries(prayerNames).map(([key, name]) => (
              <View
                key={key}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 12,
                  padding: 12,
                  backgroundColor: theme === 'dark' ? '#333' : '#f5f5f5',
                  borderRadius: 8
                }}>
                <CustomText
                  size="lg"
                  weight="medium"
                  color={textColor}>
                  {name}
                </CustomText>
                <CustomText
                  size="lg"
                  weight="bold"
                  color={theme === 'dark' ? '#90EE90' : '#006400'}>
                  {prayerTimes[key]}
                </CustomText>
              </View>
            ))}
          </View>
        )}

        <View style={{ marginTop: 20 }}>
          <Button
            title="Tester les notifications"
            onPress={testNotification}
            color={theme === 'dark' ? '#5588ee' : '#2266aa'}
          />
        </View>
      </SafeAreaView>
    </ScrollView>
  );
}
