import axios from 'axios';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';

const BACKGROUND_FETCH_TASK = 'BACKGROUND_FETCH_TASK';

// Enregistrer la tâche de fond
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    const location = await getUserLocation();
    if (location) {
      const { latitude, longitude } = location;
      const times = await getPrayerTimesByCoords(latitude, longitude);
      await schedulePrayerTimeNotifications(times);
    }
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('Erreur lors de la mise à jour des notifications:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// Enregistrer la tâche de fond
export const registerBackgroundFetch = async () => {
  try {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
      minimumInterval: 60 * 60, // 1 heure
      stopOnTerminate: false,
      startOnBoot: true,
    });
    console.log('Tâche de fond enregistrée avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de la tâche de fond:', error);
  }
};

/**
 * Obtenir la localisation de l'utilisateur
 * @returns {Promise<{latitude: number, longitude: number}|null>} Coordonnées ou null
 */
export const getUserLocation = async () => {
  try {
    // Demander la permission d'accéder à la localisation
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.error('Permission de localisation refusée');
      return null;
    }

    // Obtenir la position actuelle
    const location = await Location.getCurrentPositionAsync({});
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.error('Erreur lors de la récupération de la localisation:', error);
    return null;
  }
};

/**
 * Obtenir les horaires de prière pour une localisation donnée
 * @param {number} latitude - Latitude de la position
 * @param {number} longitude - Longitude de la position
 * @param {number} method - Méthode de calcul (1: MWL, 2: ISNA, 3: Egypt, etc.)
 * @returns {Promise<Object>} - Horaires de prière
 */
export const getPrayerTimesByCoords = async (latitude, longitude, method = 2) => {
  try {
    const response = await axios.get('https://api.aladhan.com/v1/timings', {
      params: {
        latitude,
        longitude,
        method,
      },
    });
    return response.data.data.timings;
  } catch (error) {
    console.error('Erreur lors de la récupération des horaires de prière:', error);
    throw error;
  }
};

/**
 * Planifier des notifications pour les heures de prière
 * @param {Object} prayerTimes - Objet contenant les horaires de prière
 */
export const schedulePrayerTimeNotifications = async (prayerTimes) => {
  try {
    // Demander la permission pour les notifications
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.error('Permission de notification refusée');
      return;
    }

    // Annuler toutes les notifications précédentes
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Récupérer la date d'aujourd'hui
    const today = new Date();

    // Liste des prières et leurs noms en français
    const prayers = [
      { key: 'Fajr', name: 'Fajr (Aube)', icon: 'sunrise' },
      { key: 'Dhuhr', name: 'Dhuhr (Midi)', icon: 'sun' },
      { key: 'Asr', name: 'Asr (Après-midi)', icon: 'sun' },
      { key: 'Maghrib', name: 'Maghrib (Coucher du soleil)', icon: 'sunset' },
      { key: 'Isha', name: 'Isha (Nuit)', icon: 'moon' }
    ];

    // Programmer une notification pour chaque prière
    for (const prayer of prayers) {
      const time = prayerTimes[prayer.key];
      if (!time) continue;

      // Analyser l'heure de la prière
      const [hours, minutes] = time.split(':').map(Number);

      // Créer une date pour la notification
      const prayerDate = new Date(today);
      prayerDate.setHours(hours, minutes, 0);

      // Si l'heure est déjà passée, programmer pour le lendemain
      if (prayerDate <= new Date()) {
        prayerDate.setDate(prayerDate.getDate() + 1);
      }

      // Programmer la notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `C'est l'heure de la prière: ${prayer.name}`,
          body: `Il est ${time}`,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          date: prayerDate,
          channelId: 'prayer-times',
        },
      });

      // Programmer une notification de rappel 15 minutes avant
      const reminderDate = new Date(prayerDate);
      reminderDate.setMinutes(reminderDate.getMinutes() - 15);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Rappel: ${prayer.name} dans 15 minutes`,
          body: `La prière de ${prayer.name} est à ${time}`,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          date: reminderDate,
          channelId: 'prayer-times',
        },
      });

      console.log(`Notifications programmées pour ${prayer.key} à ${time}`);
    }
  } catch (error) {
    console.error('Erreur lors de la planification des notifications:', error);
  }
};

/**
 * Configurer le gestionnaire de notifications
 */
export const setupNotifications = async () => {
  // Configuration des notifications
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  // Créer le canal de notification pour Android
  await Notifications.setNotificationChannelAsync('prayer-times', {
    name: 'Horaires de prière',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF231F7C',
    sound: true,
  });

  // Enregistrer la tâche de fond
  await registerBackgroundFetch();
};
