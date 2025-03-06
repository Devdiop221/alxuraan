import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';

const PrayerTimes = ({ prayerTimes, nextPrayer, formatTime }) => {
  const prayers = [
    { name: 'Fajr', icon: 'sunrise', time: prayerTimes?.Fajr },
    { name: 'Dhuhr', icon: 'sun', time: prayerTimes?.Dhuhr },
    { name: 'Asr', icon: 'sun', time: prayerTimes?.Asr },
    { name: 'Maghrib', icon: 'sunset', time: prayerTimes?.Maghrib },
    { name: 'Isha', icon: 'moon', time: prayerTimes?.Isha },
  ];

  return (
    <View className="flex-row justify-between px-4 mb-6">
      {prayers.map((prayer) => (
        <View
          key={prayer.name}
          className={`items-center p-2 rounded-lg ${
            nextPrayer === prayer.name ? 'bg-teal-500' : ''
          }`}
        >
          <Feather name={prayer.icon} size={20} color="white" />
          <Text className="text-white mt-1">{prayer.name}</Text>
          <Text className="text-white font-bold">
            {formatTime(prayer.time).replace(' AM', '').replace(' PM', '')}
          </Text>
        </View>
      ))}
    </View>
  );
};

export default PrayerTimes;