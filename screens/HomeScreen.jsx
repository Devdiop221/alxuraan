import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, Image, ScrollView, FlatList, Linking, RefreshControl } from 'react-native';
import * as Location from 'expo-location';
import { aladhanService } from '../services/aladhanService';
import { notificationService } from '../services/notificationService';
import { Feather, MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import PrayerTimes from '../components/PrayerTimes';
import LiveStreams from '../components/LiveStreams';
import Features from '../components/Features';
import { quranService } from '../services/quranService';

const HomeScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [hijriDate, setHijriDate] = useState(null);
  const [nextPrayer, setNextPrayer] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [location, setLocation] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [refreshing, setRefreshing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [address, setAddress] = useState(null);
  const [lastReadSurah, setLastReadSurah] = useState(null);

  // Updated streaming data with Masjid Al-Nabawi and Masjid Al-Haram
  const liveStreams = [
    {
      id: '1',
      title: 'Masjid Al-Nabawi Live',
      speaker: 'Prophet\'s Mosque, Medina',
      viewers: 5200,
      thumbnail: require('../assets/images/stream-thumbnail-1.jpeg'),
      isLive: true,
      youtubeUrl: 'https://www.youtube.com/live/j_JS9cYi234?si=fE9_n9W6mWTIKtjK',
    },
    {
      id: '2',
      title: 'Masjid Al-Haram Live',
      speaker: 'Grand Mosque, Mecca',
      viewers: 7800,
      thumbnail: require('../assets/images/stream-thumbnail-2.jpg'),
      isLive: true,
      youtubeUrl: 'https://www.youtube.com/live/tko4c06NJeA?si=ULNX3o7MC8M9fWVY',
    },
  ];

  useEffect(() => {
    let mounted = true;
    let timer = null;

    const fetchData = async () => {
      try {
        // Obtenir la localisation
        const locationData = await aladhanService.getUserLocation();
        if (mounted) {
          setLocation(locationData);
        }

        // Obtenir l'adresse
        const addressData = await aladhanService.getAddressFromCoords(
          locationData.latitude,
          locationData.longitude
        );
        if (mounted) {
          setAddress(addressData);
        }

        // Obtenir les horaires de prière
        const times = await aladhanService.getPrayerTimes(
          locationData.latitude,
          locationData.longitude
        );

        // Obtenir la date hijri
        const hijri = await aladhanService.getCurrentHijriDate();
        if (mounted) setHijriDate(hijri);

        // Obtenir la dernière sourate lue (à implémenter avec AsyncStorage)
        const lastRead = await quranService.getSurahDetails(1); // Temporairement la sourate 1
        if (mounted) setLastReadSurah(lastRead);

        // Demander les permissions de notification
        const notificationPermission = await notificationService.requestPermissions();
        if (mounted) setNotificationsEnabled(notificationPermission);

        if (mounted) {
          setPrayerTimes(times);
          setLoading(false);

          // Planifier les notifications si les permissions sont accordées
          if (notificationPermission) {
            await notificationService.scheduleAllPrayerNotifications(times);
          }
        }
      } catch (err) {
        if (mounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    fetchData();

    const updateNextPrayer = () => {
      if (!prayerTimes) return;

      const now = new Date();
      const prayers = [
        { name: 'Fajr', time: convertToDate(prayerTimes.Fajr) },
        { name: 'Dhuhr', time: convertToDate(prayerTimes.Dhuhr) },
        { name: 'Asr', time: convertToDate(prayerTimes.Asr) },
        { name: 'Maghrib', time: convertToDate(prayerTimes.Maghrib) },
        { name: 'Isha', time: convertToDate(prayerTimes.Isha) },
      ];

      const upcomingPrayers = prayers.filter(prayer => prayer.time > now);

      if (upcomingPrayers.length > 0) {
        const next = upcomingPrayers[0];
        setNextPrayer(next.name);

        const diff = next.time - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        setTimeRemaining(`${hours} hour${hours !== 1 ? 's' : ''} ${minutes} min left`);
      } else {
        setNextPrayer('Fajr');
        setTimeRemaining('Tomorrow');
      }
    };

    if (prayerTimes) {
      updateNextPrayer();
      timer = setInterval(updateNextPrayer, 60000);
    }

    return () => {
      mounted = false;
      if (timer) clearInterval(timer);
    };
  }, [prayerTimes]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      const locationData = await aladhanService.getUserLocation();
      const times = await aladhanService.getPrayerTimes(
        locationData.latitude,
        locationData.longitude
      );
      setPrayerTimes(times);
      if (notificationsEnabled) {
        await notificationService.scheduleAllPrayerNotifications(times);
      }
    } catch (err) {
      setError(err.message);
    }
    setRefreshing(false);
  }, [notificationsEnabled]);

  const convertToDate = (timeStr) => {
    const today = new Date();
    const [hours, minutes] = timeStr.split(':');

    return new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      parseInt(hours),
      parseInt(minutes)
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-teal-600">
        <ActivityIndicator size="large" color="#ffffff" />
        <Text className="text-white mt-4">Chargement des horaires de prière...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-teal-600">
        <Text className="text-white">Erreur : {error}</Text>
      </View>
    );
  }

  const formatTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);

    if (hour === 0) {
      return `12:${minutes} AM`;
    } else if (hour < 12) {
      return `${hour}:${minutes} AM`;
    } else if (hour === 12) {
      return `12:${minutes} PM`;
    } else {
      return `${hour - 12}:${minutes} PM`;
    }
  };

  // Fonction pour formater l'adresse
  const formatAddress = () => {
    if (!address) return 'Localisation inconnue';

    const parts = [];
    if (address.city) parts.push(address.city);
    if (address.region) parts.push(address.region);
    if (address.country) parts.push(address.country);

    return parts.length > 0 ? parts.join(', ') : 'Localisation inconnue';
  };

  // Feature buttons data
  const features = [
    { id: '1', title: 'Coran', icon: 'book', color: '#00A79D' },
    { id: '2', title: 'Adhan', icon: 'volume-2', color: '#00A79D' },
    { id: '3', title: 'Qibla', icon: 'compass', color: '#00A79D' },
    { id: '4', title: 'Don', icon: 'heart', color: '#00A79D' },
    { id: '5', title: 'Tout', icon: 'grid', color: '#00A79D' },
  ];

  const handleFeaturePress = (featureTitle) => {
    console.log(`${featureTitle} pressed`);
    // TODO: Implement feature navigation
  };

  // Render prayer time icons based on prayer name
  const renderPrayerIcon = (name) => {
    switch(name) {
      case 'Fajr':
        return <Feather name="sunrise" size={20} color="white" />;
      case 'Dhuhr':
        return <Feather name="sun" size={20} color="white" />;
      case 'Asr':
        return <Feather name="sun" size={20} color="white" />;
      case 'Maghrib':
        return <Feather name="sunset" size={20} color="white" />;
      case 'Isha':
        return <Feather name="moon" size={20} color="white" />;
      default:
        return null;
    }
  };

  // Render feature icon
  const renderFeatureIcon = (iconName) => {
    return <Feather name={iconName} size={24} color="white" />;
  };

  // Handle opening YouTube links
  const openYoutubeStream = (url) => {
    Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
  };

  // Stream item component - Updated to handle YouTube links
  const StreamItem = ({ item }) => (
    <TouchableOpacity
      className="mr-4 w-64 rounded-lg overflow-hidden"
      onPress={() => openYoutubeStream(item.youtubeUrl)}
    >
      <View className="relative">
        <Image
          source={item.thumbnail}
          className="w-64 h-32 rounded-lg"
          defaultSource={require('../assets/images/stream-thumbnail-1.jpeg')}
        />
        {item.isLive && (
          <View className="absolute top-2 left-2 bg-red-500 px-2 py-0.5 rounded">
            <Text className="text-white text-xs font-bold">LIVE</Text>
          </View>
        )}
        <View className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 rounded">
          <Text className="text-white text-xs">{item.viewers.toLocaleString()} viewers</Text>
        </View>
      </View>
      <Text className="text-white font-semibold mt-1">{item.title}</Text>
      <Text className="text-white text-opacity-80 text-sm">{item.speaker}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      className="flex-1 bg-teal-600"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header Section */}
      <View className="p-4 flex-row justify-between items-center">
        <View>
          <Text className="text-white text-lg font-semibold">
            {hijriDate && `${hijriDate.day} ${hijriDate.month.en} ${hijriDate.year} H`}
          </Text>
          <Text className="text-white">
            {formatAddress()}
          </Text>
        </View>
        <TouchableOpacity
          className="p-2"
          onPress={() => notificationService.testNotification()}
        >
          <Feather name="bell" size={24} color={notificationsEnabled ? "white" : "#BDBDBD"} />
        </TouchableOpacity>
      </View>

      {/* Current Time and Next Prayer Section */}
      <View className="items-center py-8">
        <Text className="text-white text-6xl font-bold mb-1">
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
        <Text className="text-white text-lg">
          {nextPrayer} {timeRemaining}
        </Text>
      </View>

      {/* Prayer Times Section */}
      <PrayerTimes
        prayerTimes={prayerTimes}
        nextPrayer={nextPrayer}
        formatTime={formatTime}
      />

      {/* Progress Indicator */}
      <View className="px-4 mb-6">
        <View className="w-full h-1 bg-teal-700 rounded-full">
          <View className="h-1 bg-white rounded-full" style={{ width: '30%' }}></View>
        </View>
      </View>

      {/* Features Section */}
      <Features
        features={features}
        onFeaturePress={handleFeaturePress}
      />

      {/* Live Streams Section */}
      <LiveStreams streams={liveStreams} />

      {/* Bottom Navigation */}
      <View className="flex-row justify-between px-8 py-4 bg-white rounded-t-xl">
        <TouchableOpacity
          className="items-center"
          onPress={() => setActiveTab('home')}
        >
          <Feather name="home" size={24} color={activeTab === 'home' ? '#00A79D' : '#BDBDBD'} />
        </TouchableOpacity>
        <TouchableOpacity
          className="items-center"
          onPress={() => setActiveTab('compass')}
        >
          <Feather name="compass" size={24} color={activeTab === 'compass' ? '#00A79D' : '#BDBDBD'} />
        </TouchableOpacity>
        <TouchableOpacity
          className="items-center"
          onPress={() => setActiveTab('chat')}
        >
          <Feather name="message-square" size={24} color={activeTab === 'chat' ? '#00A79D' : '#BDBDBD'} />
        </TouchableOpacity>
        <TouchableOpacity
          className="items-center"
          onPress={() => setActiveTab('profile')}
        >
          <Feather name="user" size={24} color={activeTab === 'profile' ? '#00A79D' : '#BDBDBD'} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default HomeScreen;