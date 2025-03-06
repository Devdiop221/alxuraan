import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../components/ui/Theme';
import PlayerScreen from '../screens/PlayerScreen';
import QarisScreen from '../screens/QarisScreen';
import SurahsScreen from '../screens/SurahsScreen';

const Stack = createStackNavigator();

export default function SurashNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        cardStyle: { backgroundColor: COLORS.background },
        headerStyle: {
          backgroundColor: COLORS.cardBackground,
          elevation: 0,
          shadowOpacity: 0,
          height: 60,
        },
        headerTitleStyle: {
          color: COLORS.textPrimary,
          fontSize: 18,
          fontWeight: '600',
        },
        headerTintColor: COLORS.primary,
        headerBackTitleVisible: false,
        headerLeftContainerStyle: {
          paddingLeft: SPACING.md,
        },
        headerRightContainerStyle: {
          paddingRight: SPACING.md,
        },
        cardStyleInterpolator: ({ current: { progress }, next }) => ({
          cardStyle: {
            transform: [
              {
                translateX: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [300, 0],
                }),
              },
            ],
            opacity: progress,
          },
          overlayStyle: {
            opacity: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.5],
            }),
          },
        }),
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="Qaris"
        component={QarisScreen}
      />
      <Stack.Screen
        name="Surahs"
        component={SurahsScreen}
      />
      <Stack.Screen
        name="Player"
        component={PlayerScreen}
      />
    </Stack.Navigator>
  );
}