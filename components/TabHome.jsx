import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Linking,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { aladhanService } from '../services/aladhanService';
import { mosquesService } from '../services/mosquesService';

const TabHome = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hijriDate, setHijriDate] = useState(null);
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [location, setLocation] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [liveStreams, setLiveStreams] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtenir la localisation
      const locationData = await aladhanService.getUserLocation();
      setLocation(locationData);

      // Obtenir les horaires de prière
      const times = await aladhanService.getPrayerTimes(
        locationData.coords.latitude,
        locationData.coords.longitude
      );
      setPrayerTimes(times);

      // Obtenir la date Hijri
      const hijri = await aladhanService.getCurrentHijriDate();
      setHijriDate(hijri);

      // Obtenir les streams en direct
      const streams = await mosquesService.getLiveStreams();
      setLiveStreams(streams);

    } catch (err) {
      setError(err.message);
      console.error('Erreur lors du chargement des données:', err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const formatTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);

    if (hour === 0) {
      return `12:${minutes}`;
    } else if (hour < 12) {
      return `${hour}:${minutes}`;
    } else if (hour === 12) {
      return `12:${minutes}`;
    } else {
      return `${hour - 12}:${minutes}`;
    }
  };

  const openYoutubeStream = (url) => {
    Linking.openURL(url).catch(err => console.error("Impossible d'ouvrir le lien", err));
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <ActivityIndicator size="large" color="#00A79D" />
        <Text className="mt-4 text-gray-600">Chargement...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <Text className="text-red-500">Erreur : {error}</Text>
        <TouchableOpacity
          className="mt-4 bg-teal-500 px-4 py-2 rounded-lg"
          onPress={loadData}
        >
          <Text className="text-white">Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-100"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Date Hijri */}
      <View className="bg-teal-600 p-4">
        <Text className="text-white text-lg font-semibold">
          {hijriDate && `${hijriDate.day} ${hijriDate.month.en} ${hijriDate.year} H`}
        </Text>
      </View>

      {/* Horaires de prière */}
      <View className="p-4 bg-white m-4 rounded-lg">
        <Text className="text-lg font-bold mb-4">Horaires de prière</Text>
        <View className="flex-row justify-between">
          {prayerTimes && Object.entries(prayerTimes).map(([prayer, time]) => (
            <View key={prayer} className="items-center">
              <Text className="text-gray-600">{prayer}</Text>
              <Text className="font-bold">{formatTime(time)}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Boutons d'accès rapide */}
      <View className="p-4 bg-white mx-4 rounded-lg">
        <Text className="text-lg font-bold mb-4">Accès rapide</Text>
        <View className="flex-row justify-between">
          <TouchableOpacity
            className="items-center"
            onPress={() => navigation.navigate('Quran')}
          >
            <View className="w-12 h-12 bg-teal-500 rounded-full items-center justify-center mb-2">
              <Feather name="book" size={24} color="white" />
            </View>
            <Text className="text-sm">Coran</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="items-center"
            onPress={() => navigation.navigate('Qaris')}
          >
            <View className="w-12 h-12 bg-teal-500 rounded-full items-center justify-center mb-2">
              <Feather name="mic" size={24} color="white" />
            </View>
            <Text className="text-sm">Qaris</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="items-center"
            onPress={() => navigation.navigate('Dhikr')}
          >
            <View className="w-12 h-12 bg-teal-500 rounded-full items-center justify-center mb-2">
              <Feather name="heart" size={24} color="white" />
            </View>
            <Text className="text-sm">Dhikr</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="items-center"
            onPress={() => navigation.navigate('Favorites')}
          >
            <View className="w-12 h-12 bg-teal-500 rounded-full items-center justify-center mb-2">
              <Feather name="star" size={24} color="white" />
            </View>
            <Text className="text-sm">Favoris</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Streams en direct */}
      <View className="p-4 bg-white mx-4 rounded-lg">
        <Text className="text-lg font-bold mb-4">Diffusions en direct</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {liveStreams.map((stream) => (
            <TouchableOpacity
              key={stream.id}
              className="mr-4 w-64 rounded-lg overflow-hidden"
              onPress={() => openYoutubeStream(stream.youtubeUrl)}
            >
              <View className="relative">
                <Image
                  source={{ uri: stream.thumbnail }}
                  className="w-64 h-32 rounded-lg"
                  defaultSource={require('../assets/images/stream-thumbnail-1.jpeg')}
                />
                {stream.isLive && (
                  <View className="absolute top-2 left-2 bg-red-500 px-2 py-0.5 rounded">
                    <Text className="text-white text-xs font-bold">LIVE</Text>
                  </View>
                )}
                <View className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 rounded">
                  <Text className="text-white text-xs">{stream.viewers.toLocaleString()} spectateurs</Text>
                </View>
              </View>
              <Text className="font-semibold mt-1">{stream.title}</Text>
              <Text className="text-gray-500 text-sm">{stream.speaker}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
};

export default TabHome;