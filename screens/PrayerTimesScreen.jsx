import React, { useEffect, useState, useRef } from 'react';
import { SafeAreaView, View, TouchableOpacity, ScrollView, RefreshControl, Animated, Dimensions, Switch, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Bell, ArrowLeft, Sunrise, Sun, Sunset, Moon, BellOff } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { CustomLoadingIndicator } from '../components/ui/LoadingIndicator';
import { CustomText } from '../components/ui/Typography';
import { COLORS, SPACING, BORDER_RADIUS, GRADIENTS, SHADOWS } from '../components/ui/Theme';
import {
  schedulePrayerTimeNotifications,
  getUserLocation,
  getPrayerTimesByCoords,
  setupNotifications
} from '../services/prayerTimesService';

const { width } = Dimensions.get('window');

const PRAYER_CONFIG = {
  Fajr: {
    name: "Fajr",
    nameFr: "Aube",
    icon: Sunrise,
    gradient: ['#FF6B6B', '#FF8E53'],
  },
  Dhuhr: {
    name: "Dhuhr",
    nameFr: "Midi",
    icon: Sun,
    gradient: ['#FFD93D', '#FFA41B'],
  },
  Asr: {
    name: "Asr",
    nameFr: "Après-midi",
    icon: Sun,
    gradient: ['#4FACFE', '#00F2FE'],
  },
  Maghrib: {
    name: "Maghrib",
    nameFr: "Coucher du soleil",
    icon: Sunset,
    gradient: ['#FF6B6B', '#FF8E53'],
  },
  Isha: {
    name: "Isha",
    nameFr: "Nuit",
    icon: Moon,
    gradient: ['#4FACFE', '#00F2FE'],
  },
};

export default function PrayerTimesScreen({ navigation }) {
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const notificationListener = useRef();
  const responseListener = useRef();

  // Charger l'état des notifications au démarrage
  useEffect(() => {
    const loadNotificationSettings = async () => {
      try {
        const enabled = await AsyncStorage.getItem('notificationsEnabled');
        setNotificationsEnabled(enabled === 'true');
      } catch (error) {
        console.error('Erreur lors du chargement des paramètres de notification:', error);
      }
    };

    loadNotificationSettings();
  }, []);

  // Gérer le changement d'état des notifications
  const toggleNotifications = async (value) => {
    try {
      setNotificationsEnabled(value);
      await AsyncStorage.setItem('notificationsEnabled', value.toString());

      if (value) {
        await setupNotifications();
        if (prayerTimes) {
          await schedulePrayerTimeNotifications(prayerTimes);
        }
      } else {
        await Notifications.cancelAllScheduledNotificationsAsync();
      }
    } catch (error) {
      console.error('Erreur lors de la modification des notifications:', error);
      setErrorMessage("Erreur lors de la modification des paramètres de notification");
    }
  };

  const loadPrayerTimes = async () => {
    try {
      setErrorMessage(null);
      const location = await getUserLocation();

      if (location) {
        const { latitude, longitude } = location;
        const times = await getPrayerTimesByCoords(latitude, longitude);
        setPrayerTimes(times);

        if (notificationsEnabled) {
          await schedulePrayerTimeNotifications(times);
        }
      } else {
        setErrorMessage("Impossible d'obtenir votre localisation. Veuillez vérifier vos paramètres.");
      }
    } catch (error) {
      console.error("Erreur lors du chargement des horaires:", error);
      setErrorMessage("Une erreur s'est produite lors du chargement des horaires de prière.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!loading && prayerTimes) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading, prayerTimes]);

  useEffect(() => {
    loadPrayerTimes();

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification reçue:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Réponse de notification:', response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  const testNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Test de notification",
        body: "Cette notification est un test pour les horaires de prière",
        sound: true,
      },
      trigger: { seconds: 2 },
    });
  };

  if (loading) {
    return (
      <LinearGradient colors={GRADIENTS.primary} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <CustomLoadingIndicator />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={GRADIENTS.primary} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={loadPrayerTimes} />
          }>
          <View style={{ padding: SPACING.md }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: SPACING.xl,
            }}>
              <CustomText size="2xl" weight="bold" color={COLORS.textPrimary}>
                Horaires de Prière
              </CustomText>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {notificationsEnabled ? (
                  <Bell size={24} color={COLORS.textPrimary} />
                ) : (
                  <BellOff size={24} color={COLORS.textSecondary} />
                )}
                <Switch
                  value={notificationsEnabled}
                  onValueChange={toggleNotifications}
                  style={{ marginLeft: SPACING.sm }}
                  trackColor={{ false: COLORS.divider, true: COLORS.primary }}
                  thumbColor={notificationsEnabled ? COLORS.accent : COLORS.textSecondary}
                />
              </View>
            </View>

            {errorMessage && (
              <Animated.View
                style={{
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                  backgroundColor: COLORS.error,
                  padding: SPACING.md,
                  borderRadius: BORDER_RADIUS.md,
                  marginBottom: SPACING.md,
                }}>
                <CustomText color={COLORS.textPrimary}>{errorMessage}</CustomText>
              </Animated.View>
            )}

            {prayerTimes && (
              <Animated.View
                style={{
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                }}>
                {Object.entries(PRAYER_CONFIG).map(([key, config], index) => {
                  const Icon = config.icon;
                  return (
                    <Animated.View
                      key={key}
                      style={{
                        marginBottom: SPACING.md,
                        transform: [{
                          translateY: slideAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, index * 20]
                          })
                        }]
                      }}>
                      <LinearGradient
                        colors={config.gradient}
                        style={{
                          borderRadius: BORDER_RADIUS.lg,
                          padding: SPACING.md,
                          ...SHADOWS.base,
                        }}>
                        <View style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}>
                          <View style={{
                            width: 56,
                            height: 56,
                            borderRadius: BORDER_RADIUS.full,
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginRight: SPACING.md,
                          }}>
                            <Icon size={32} color={COLORS.textPrimary} />
                          </View>
                          <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                              <CustomText
                                size="xl"
                                weight="bold"
                                color={COLORS.textPrimary}
                                style={{ marginRight: SPACING.xs }}>
                                {config.name}
                              </CustomText>
                              <CustomText
                                size="sm"
                                color={COLORS.textSecondary}>
                                ({config.nameFr})
                              </CustomText>
                            </View>
                            <CustomText
                              size="2xl"
                              weight="bold"
                              color={COLORS.textPrimary}>
                              {prayerTimes[key]}
                            </CustomText>
                          </View>
                        </View>
                      </LinearGradient>
                    </Animated.View>
                  );
                })}
              </Animated.View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
