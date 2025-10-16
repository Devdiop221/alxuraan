import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Platform, Dimensions, TouchableOpacity } from "react-native";
import { BookOpen, Clock, Radio, Settings, Star, BookMarked } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../components/ui/Theme';

import QuranNavigator from './QuranNavigator';
import SurashNavigator from './SurashNavigator';
import PrayerTimesScreen from '../screens/PrayerTimesScreen';
import DhikrScreen from '../screens/DhikrScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import SettingsScreen from '../screens/SettingsScreen';
import PlayerMini from '../components/PlayerMini';
import { usePlayer } from '../context/PlayerContext';
import HadithNavigator from './HadithNavigator';

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');
const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 85 : 65;
const TAB_BAR_PADDING_BOTTOM = Platform.OS === 'ios' ? 25 : 10;

const TAB_COLORS = {
  Récitateurs: ['#928DAB', '#928DAB'],
  Coran: ['#928DAB', '#928DAB'],
  Prières: ['#928DAB', '#928DAB'],
  Dhikr: ['#928DAB', '#928DAB'],
  Favoris: ['#928DAB', '#928DAB'],
  Paramètres: ['#928DAB', '#928DAB'],
};

const TabBar = ({ state, descriptors, navigation }) => {
  return (
    <View
      style={{
        position: 'absolute',
        bottom: SPACING.md,
        left: SPACING.md,
        right: SPACING.md,
      }}>
      <LinearGradient
        colors={['#1F1A2C', '#1F1A2C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          flexDirection: 'row',
          height: TAB_BAR_HEIGHT,
          borderRadius: BORDER_RADIUS.xl,
          padding: SPACING.xs,
          backgroundColor: '#1F1A2C',
          borderWidth: 1,
          borderColor: '#1F1A2C',
          ...SHADOWS.large,
        }}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const iconColor = isFocused ? '#FFFFFF' : COLORS.textSecondary;
          const strokeWidth = isFocused ? 2.5 : 1.5;
          const gradientColors = TAB_COLORS[route.name];

          let Icon;
          switch (route.name) {
            case 'Récitateurs':
              Icon = Radio;
              break;
            case 'Coran':
              Icon = BookOpen;
              break;
            case 'Prières':
              Icon = Clock;
              break;
            case 'Dhikr':
              Icon = Star;
              break;
            case 'Favoris':
              Icon = BookMarked;
              break;
            case 'Paramètres':
              Icon = Settings;
              break;
            default:
              Icon = BookOpen;
          }

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 50,
                  height: 50,
                }}>
                {isFocused ? (
                  <LinearGradient
                    colors={gradientColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      borderRadius: BORDER_RADIUS.full,
                      alignItems: 'center',
                      justifyContent: 'center',
                      ...SHADOWS.small,
                    }}>
                    <Icon size={24} color={iconColor} strokeWidth={strokeWidth} />
                  </LinearGradient>
                ) : (
                  <Icon size={24} color={iconColor} strokeWidth={strokeWidth} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </LinearGradient>
    </View>
  );
};

export default function AppNavigator() {
  const { currentAudio, closePlayer } = usePlayer();

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <Tab.Navigator
        tabBar={props => <TabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tab.Screen name="Récitateurs" component={SurashNavigator} />
        <Tab.Screen name="Coran" component={QuranNavigator} />
        <Tab.Screen name="Prières" component={PrayerTimesScreen} />
        <Tab.Screen name="Dhikr" component={HadithNavigator} />
        <Tab.Screen name="Favoris" component={FavoritesScreen} />
        <Tab.Screen name="Paramètres" component={SettingsScreen} />
      </Tab.Navigator>

      {currentAudio && (
        <View style={{
          position: 'absolute',
          bottom: TAB_BAR_HEIGHT + SPACING.md * 2,
          left: 0,
          right: 0,
          zIndex: 1000,
          paddingHorizontal: SPACING.sm,
          paddingBottom: SPACING.xs,
        }}>
          <PlayerMini
            audioUrl={currentAudio.audioUrl}
            surahName={currentAudio.surahName}
            surahNumber={currentAudio.surahNumber}
            onClose={closePlayer}
          />
        </View>
      )}
    </View>
  );
}