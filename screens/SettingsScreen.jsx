import React from 'react';
import { View, TouchableOpacity, SafeAreaView, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Moon, Sun, User, Info, LogOut, ChevronRight, Bell } from 'lucide-react-native';

import { CustomText } from '../components/ui/Typography';
import { COLORS, SPACING, BORDER_RADIUS, GRADIENTS } from '../components/ui/Theme';
import { useTheme } from '../context/ThemeContext';

const SettingItem = ({ icon: Icon, title, subtitle, onPress, rightElement }) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      padding: SPACING.md,
      backgroundColor: COLORS.cardBackground,
      borderRadius: BORDER_RADIUS.md,
      marginBottom: SPACING.sm,
    }}>
    <View style={{
      width: 40,
      height: 40,
      borderRadius: BORDER_RADIUS.full,
      backgroundColor: COLORS.buttonBg,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: SPACING.md,
    }}>
      <Icon size={24} color={COLORS.textPrimary} />
    </View>
    <View style={{ flex: 1 }}>
      <CustomText weight="bold" color={COLORS.textPrimary}>
        {title}
      </CustomText>
      {subtitle && (
        <CustomText size="sm" color={COLORS.textSecondary}>
          {subtitle}
        </CustomText>
      )}
    </View>
    {rightElement || (
      <ChevronRight size={20} color={COLORS.textSecondary} />
    )}
  </TouchableOpacity>
);

export default function SettingsScreen() {
  const { theme, toggleTheme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

  const handleLogout = () => {
    // TODO: Implémenter la déconnexion
  };

  return (
    <LinearGradient colors={GRADIENTS.primary} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ padding: SPACING.md }}>
          <CustomText
            size="2xl"
            weight="bold"
            style={{ marginBottom: SPACING.xl }}
            color={COLORS.textPrimary}>
            Paramètres
          </CustomText>

          <View style={{ marginBottom: SPACING.xl }}>
            <CustomText
              size="lg"
              weight="bold"
              style={{ marginBottom: SPACING.md }}
              color={COLORS.textPrimary}>
              Préférences
            </CustomText>

            <SettingItem
              icon={theme === 'dark' ? Moon : Sun}
              title="Thème"
              subtitle={theme === 'dark' ? 'Mode sombre' : 'Mode clair'}
              onPress={toggleTheme}
            />

            <SettingItem
              icon={Bell}
              title="Notifications"
              subtitle="Activer les rappels quotidiens"
              rightElement={
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: COLORS.divider, true: COLORS.primary }}
                  thumbColor={COLORS.textPrimary}
                />
              }
            />
          </View>

          <View style={{ marginBottom: SPACING.xl }}>
            <CustomText
              size="lg"
              weight="bold"
              style={{ marginBottom: SPACING.md }}
              color={COLORS.textPrimary}>
              Compte
            </CustomText>

            <SettingItem
              icon={User}
              title="Profil"
              subtitle="Modifier vos informations"
            />

            <SettingItem
              icon={Info}
              title="À propos"
              subtitle="Informations sur l'application"
            />

            <SettingItem
              icon={LogOut}
              title="Déconnexion"
              onPress={handleLogout}
              rightElement={null}
            />
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
