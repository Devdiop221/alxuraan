import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HadithService from './HadithService';

class NotificationService {
  constructor() {
    this.configure();
  }

  configure = async () => {
    // Configuration des notifications
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    // Demander les permissions si nécessaire
    await this.requestPermissions();
  };

  requestPermissions = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      await AsyncStorage.setItem('@hadith_notifications', 'false');
      return false;
    }

    return true;
  };

  scheduleDaily = async () => {
    try {
      // Annuler les notifications existantes
      await Notifications.cancelAllScheduledNotificationsAsync();

      // Vérifier si les notifications sont activées
      const notificationsEnabled = await AsyncStorage.getItem('@hadith_notifications');
      if (notificationsEnabled !== 'true') return;

      // Récupérer la langue préférée
      const language = await AsyncStorage.getItem('@hadith_language') || 'fr';

      // Programmer la notification quotidienne
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Hadith du jour',
          body: 'Découvrez un nouveau hadith inspirant',
          data: { type: 'daily_hadith' },
        },
        trigger: {
          hour: 9, // 9h du matin
          minute: 0,
          repeats: true,
        },
      });
    } catch (error) {
      console.error('Erreur lors de la programmation des notifications:', error);
    }
  };

  cancelAll = async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Erreur lors de l\'annulation des notifications:', error);
    }
  };

  // Gérer la notification lorsqu'elle est reçue
  handleNotification = async (notification) => {
    if (notification.data.type === 'daily_hadith') {
      try {
        const language = await AsyncStorage.getItem('@hadith_language') || 'fr';
        const hadith = await HadithService.getRandomHadith(language);

        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Hadith du jour',
            body: hadith.translations[language],
            data: { hadith },
          },
          trigger: null, // Notification immédiate
        });
      } catch (error) {
        console.error('Erreur lors de la récupération du hadith:', error);
      }
    }
  };
}

export default new NotificationService();