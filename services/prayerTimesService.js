import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import axios from 'axios';
import AdhanService from './AdhanService';

// Configuration des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Configuration des sons et du comportement des notifications
export const setupNotifications = async () => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      throw new Error('Permission de notification non accordée');
    }

    // Configurer le gestionnaire de notification pour jouer l'adhan
    Notifications.addNotificationReceivedListener(async (notification) => {
      const data = notification.request.content.data;
      if (data && data.playAdhan) {
        await AdhanService.playAdhan();
      }
    });

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('adhan', {
        name: 'Adhan',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'adhan.wav', // Assurez-vous d'avoir ce fichier dans vos assets
      });
    }
  } catch (error) {
    console.error('Erreur lors de la configuration des notifications:', error);
    throw error;
  }
};

// Obtenir la localisation de l'utilisateur
export const getUserLocation = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permission de localisation refusée');
    }

    const location = await Location.getCurrentPositionAsync({});
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.error('Erreur lors de la récupération de la localisation:', error);
    throw error;
  }
};

// Obtenir les horaires de prière
export const getPrayerTimesByCoords = async (latitude, longitude) => {
  try {
    const today = new Date();
    const response = await axios.get(
      `http://api.aladhan.com/v1/timings/${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`,
      {
        params: {
          latitude,
          longitude,
          method: 3, // Méthode de calcul (3 = Muslim World League)
        },
      }
    );
    return response.data.data.timings;
  } catch (error) {
    console.error('Erreur lors de la récupération des horaires:', error);
    throw error;
  }
};

// Convertir l'heure au format HH:mm en Date
const getDateFromTimeString = (timeString) => {
  const [hours, minutes] = timeString.split(':');
  const date = new Date();
  date.setHours(parseInt(hours, 10));
  date.setMinutes(parseInt(minutes, 10));
  date.setSeconds(0);
  return date;
};

// Planifier les notifications pour chaque prière
export const schedulePrayerTimeNotifications = async (prayerTimes) => {
  try {
    // Annuler toutes les notifications existantes
    await Notifications.cancelAllScheduledNotificationsAsync();

    const prayers = {
      Fajr: "l'aube",
      Dhuhr: "midi",
      Asr: "l'après-midi",
      Maghrib: "le coucher du soleil",
      Isha: "la nuit"
    };

    for (const [prayer, time] of Object.entries(prayerTimes)) {
      if (prayers[prayer]) {
        const prayerDate = getDateFromTimeString(time);
        const now = new Date();

        // Si l'heure de prière est déjà passée aujourd'hui, planifier pour demain
        if (prayerDate < now) {
          prayerDate.setDate(prayerDate.getDate() + 1);
        }

        const trigger = prayerDate.getTime() - now.getTime();
        if (trigger > 0) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: `C'est l'heure de la prière de ${prayers[prayer]} (${prayer})`,
              body: `Il est ${time}. Que la paix et la bénédiction d'Allah soient sur vous.`,
              data: { playAdhan: true },
              sound: 'default',
              priority: Notifications.AndroidNotificationPriority.MAX,
            },
            trigger: {
              seconds: trigger / 1000,
            },
          });

          // Notification 10 minutes avant
          if (trigger > 600000) { // 10 minutes en millisecondes
            await Notifications.scheduleNotificationAsync({
              content: {
                title: `Rappel : Prière de ${prayers[prayer]} dans 10 minutes`,
                body: `La prière de ${prayer} sera à ${time}`,
                priority: Notifications.AndroidNotificationPriority.HIGH,
                sound: 'default',
              },
              trigger: {
                seconds: (trigger - 600000) / 1000,
              },
            });
          }
        }
      }
    }
  } catch (error) {
    console.error('Erreur lors de la planification des notifications:', error);
    throw error;
  }
};