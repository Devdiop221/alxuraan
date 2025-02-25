import axios from 'axios';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';

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
      { key: 'Fajr', name: 'Fajr (Aube)' },
      { key: 'Dhuhr', name: 'Dhuhr (Midi)' },
      { key: 'Asr', name: 'Asr (Après-midi)' },
      { key: 'Maghrib', name: 'Maghrib (Coucher du soleil)' },
      { key: 'Isha', name: 'Isha (Nuit)' }
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

      // Si l'heure est déjà passée, ne pas programmer de notification
      if (prayerDate <= new Date()) continue;

      // Calculer le délai en secondes
      const secondsUntilPrayer = Math.floor((prayerDate.getTime() - Date.now()) / 1000);

      // Programmer la notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `C'est l'heure de la prière: ${prayer.name}`,
          body: `Il est ${time}`,
          sound: true,
        },
        trigger: {
          seconds: secondsUntilPrayer,
        },
      });

      console.log(`Notification programmée pour ${prayer.key} à ${time}`);
    }
  } catch (error) {
    console.error('Erreur lors de la planification des notifications:', error);
  }
};

/**
 * Configurer le gestionnaire de notifications
 */
export const setupNotifications = () => {
  // Configuration des notifications
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
};
