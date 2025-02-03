import React, { useEffect, useState } from 'react';
import { SafeAreaView, View } from 'react-native';

import { Colors } from '../components/ui/Colors';
import { CustomLoadingIndicator } from '../components/ui/LoadingIndicator';
import { CustomText } from '../components/ui/Typography';
import { useTheme } from '../context/ThemeContext';
import {
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
    return <CustomLoadingIndicator />;
  }

  return (
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
        color={theme === 'dark' ? Colors.text : Colors.text}>
        Horaires de Prière
      </CustomText>
      {prayerTimes && (
        <View>
          <CustomText
            size="lg"
            style={{ marginBottom: 8 }}
            color={theme === 'dark' ? Colors.text : Colors.text}>
            Fajr: {prayerTimes.Fajr}
          </CustomText>
          <CustomText
            size="lg"
            style={{ marginBottom: 8 }}
            color={theme === 'dark' ? Colors.text : Colors.text}>
            Dhuhr: {prayerTimes.Dhuhr}
          </CustomText>
          <CustomText
            size="lg"
            style={{ marginBottom: 8 }}
            color={theme === 'dark' ? Colors.text : Colors.text}>
            Asr: {prayerTimes.Asr}
          </CustomText>
          <CustomText
            size="lg"
            style={{ marginBottom: 8 }}
            color={theme === 'dark' ? Colors.text : Colors.text}>
            Maghrib: {prayerTimes.Maghrib}
          </CustomText>
          <CustomText
            size="lg"
            style={{ marginBottom: 8 }}
            color={theme === 'dark' ? Colors.text : Colors.text}>
            Isha: {prayerTimes.Isha}
          </CustomText>
        </View>
      )}
    </SafeAreaView>
  );
}
