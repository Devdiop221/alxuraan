import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, Text } from 'react-native';

import { useTheme } from '../context/ThemeContext';
import {
  getPrayerTimes,
  schedulePrayerTimeNotifications,
  getUserLocation,
  getPrayerTimesByCoords,
} from '../services/prayerTimesService';

export default function PrayerTimesScreen() {
  const { theme } = useTheme();
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPrayerTimes = async () => {
      const location = await getUserLocation();
      if (location) {
        const { latitude, longitude } = location;
        const times = await getPrayerTimesByCoords(latitude, longitude);
        setPrayerTimes(times);
        setLoading(false);

        // Planifier les notifications
        await schedulePrayerTimeNotifications(times);
      }
    };
    loadPrayerTimes();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <View className={`flex-1 p-4 ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}>
      <Text className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
        Horaires de Prière
      </Text>
      {prayerTimes && (
        <View>
          <Text className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
            Fajr: {prayerTimes.Fajr}
          </Text>
          <Text className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
            Dhuhr: {prayerTimes.Dhuhr}
          </Text>
          <Text className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
            Asr: {prayerTimes.Asr}
          </Text>
          <Text className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
            Maghrib: {prayerTimes.Maghrib}
          </Text>
          <Text className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
            Isha: {prayerTimes.Isha}
          </Text>
        </View>
      )}
    </View>
  );
}