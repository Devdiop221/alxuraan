import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';

const API_BASE_URL = 'https://api.aladhan.com/v1/timingsByCity';

export const getPrayerTimesByCoords = async (latitude, longitude) => {
  try {
    const response = await fetch(
      `https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=2`
    );
    const data = await response.json();
    return data.data.timings;
  } catch (error) {
    console.error('Erreur lors de la récupération des horaires de prière:', error);
    return null;
  }
};

export const getPrayerTimes = async (city, country) => {
  try {
    const response = await fetch(`${API_BASE_URL}?city=${city}&country=${country}&method=2`);
    const data = await response.json();
    return data.data.timings;
  } catch (error) {
    console.error('Erreur lors de la récupération des horaires de prière:', error);
    return null;
  }
};

export const schedulePrayerTimeNotifications = async (prayerTimes) => {
  const prayerNames = {
    Fajr: 'Fajr',
    Dhuhr: 'Dhuhr',
    Asr: 'Asr',
    Maghrib: 'Maghrib',
    Isha: 'Isha',
  };

  for (const [key, time] of Object.entries(prayerTimes)) {
    if (prayerNames[key]) {
      const notificationTime = new Date();
      const [hours, minutes] = time.split(':');
      notificationTime.setHours(hours, minutes, 0, 0);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Temps de prière : ${prayerNames[key]}`,
          body: `Il est l'heure de la prière de ${prayerNames[key]}.`,
          sound: true,
        },
        trigger: notificationTime,
      });
    }
  }
};

export const getUserLocation = async () => {
  try {
    const location = await Location.getCurrentPositionAsync({});
    return location.coords;
  } catch (error) {
    console.error('Erreur lors de la récupération de la localisation:', error);
    return null;
  }
};
