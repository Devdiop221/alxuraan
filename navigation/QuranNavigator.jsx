import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../components/ui/Theme';
import QuranScreen from '../screens/QuranScreen';
import SourateDetail from '../screens/SourateDetail';

const Stack = createStackNavigator();

export default function QuranNavigator() {
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
        cardStyleInterpolator: ({ current: { progress } }) => ({
          cardStyle: {
            opacity: progress,
          },
        }),
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="Quran"
        component={QuranScreen}
      />
      <Stack.Screen
        name="SourateDetail"
        component={SourateDetail}
      />
    </Stack.Navigator>
  );
}