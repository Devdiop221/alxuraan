import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

// Configuration des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const notificationService = {
  // Demander la permission pour les notifications
  requestPermissions: async () => {
    if (!Device.isDevice) {
      console.log('Les notifications ne fonctionnent pas sur les émulateurs');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  },

  // Planifier une notification pour une prière
  schedulePrayerNotification: async (prayerName, prayerTime) => {
    const trigger = new Date(prayerTime);
    // Planifier la notification 15 minutes avant l'heure de prière
    trigger.setMinutes(trigger.getMinutes() - 15);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Rappel de prière : ${prayerName}`,
        body: `La prière de ${prayerName} est dans 15 minutes`,
        sound: true,
      },
      trigger,
    });
  },

  // Planifier toutes les notifications pour la journée
  scheduleAllPrayerNotifications: async (prayerTimes) => {
    // Annuler toutes les notifications existantes
    await Notifications.cancelAllScheduledNotificationsAsync();

    const prayers = [
      { name: 'Fajr', time: prayerTimes.Fajr },
      { name: 'Dhuhr', time: prayerTimes.Dhuhr },
      { name: 'Asr', time: prayerTimes.Asr },
      { name: 'Maghrib', time: prayerTimes.Maghrib },
      { name: 'Isha', time: prayerTimes.Isha },
    ];

    for (const prayer of prayers) {
      await notificationService.schedulePrayerNotification(prayer.name, prayer.time);
    }
  },

  // Tester une notification immédiate
  testNotification: async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Test de notification',
        body: 'Ceci est un test de notification',
        sound: true,
      },
      trigger: null, // null signifie que la notification sera envoyée immédiatement
    });
  },
};