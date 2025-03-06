import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Globe, Type, Moon, Bell, Share } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { CustomText } from '../components/ui/Typography';
import { COLORS, SPACING, BORDER_RADIUS, GRADIENTS, SHADOWS } from '../components/ui/Theme';
import HadithService from '../services/HadithService';

export default function HadithSettings({ navigation }) {
  const [fontSize, setFontSize] = useState('normal');
  const [selectedLanguage, setSelectedLanguage] = useState('fr');
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [availableLanguages] = useState(Object.entries(HadithService.languages));
  const [cacheInfo, setCacheInfo] = useState(null);

  useEffect(() => {
    loadSettings();
    loadCacheInfo();
  }, []);

  const loadSettings = async () => {
    try {
      const [savedFontSize, savedLanguage, savedDarkMode, savedNotifications] = await Promise.all([
        AsyncStorage.getItem('@hadith_font_size'),
        AsyncStorage.getItem('@hadith_language'),
        AsyncStorage.getItem('@hadith_dark_mode'),
        AsyncStorage.getItem('@hadith_notifications')
      ]);

      if (savedFontSize) setFontSize(savedFontSize);
      if (savedLanguage) setSelectedLanguage(savedLanguage);
      if (savedDarkMode) setDarkMode(JSON.parse(savedDarkMode));
      if (savedNotifications) setNotifications(JSON.parse(savedNotifications));
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
    }
  };

  const loadCacheInfo = async () => {
    try {
      const collectionsCache = await AsyncStorage.getItem(HadithService.cacheConfig.collections.key);
      const hadithsCache = await AsyncStorage.getItem(HadithService.cacheConfig.hadiths.key);

      setCacheInfo({
        collections: collectionsCache ? JSON.parse(collectionsCache).timestamp : null,
        hadiths: hadithsCache ? JSON.parse(hadithsCache).timestamp : null
      });
    } catch (error) {
      console.error('Erreur lors du chargement des informations du cache:', error);
    }
  };

  const clearCache = async () => {
    try {
      await HadithService.clearCache();
      await loadCacheInfo();
    } catch (error) {
      console.error('Erreur lors du vidage du cache:', error);
    }
  };

  const fontSizes = {
    small: { arabic: 16, translation: 14 },
    normal: { arabic: 20, translation: 16 },
    large: { arabic: 24, translation: 18 },
  };

  const handleLanguageChange = async (language) => {
    setSelectedLanguage(language);
    try {
      await AsyncStorage.setItem('@hadith_language', language);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la langue:', error);
    }
  };

  const handleFontSizeChange = async (size) => {
    setFontSize(size);
    try {
      await AsyncStorage.setItem('@hadith_font_size', size);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la taille de police:', error);
    }
  };

  const handleDarkModeToggle = async () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    try {
      await AsyncStorage.setItem('@hadith_dark_mode', JSON.stringify(newMode));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du mode sombre:', error);
    }
  };

  const handleNotificationsToggle = async () => {
    const newState = !notifications;
    setNotifications(newState);
    try {
      await AsyncStorage.setItem('@hadith_notifications', JSON.stringify(newState));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des notifications:', error);
    }
  };

  const renderSettingSection = ({ icon: Icon, title, description, children }) => (
    <View style={{
      backgroundColor: COLORS.cardBackground,
      borderRadius: BORDER_RADIUS.lg,
      padding: SPACING.lg,
      marginBottom: SPACING.md,
      ...SHADOWS.sm,
    }}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.sm,
      }}>
        <View style={{
          width: 40,
          height: 40,
          borderRadius: BORDER_RADIUS.full,
          backgroundColor: COLORS.buttonBg,
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: SPACING.sm,
        }}>
          <Icon size={20} color={COLORS.textPrimary} />
        </View>
        <View>
          <CustomText weight="bold" color={COLORS.textPrimary}>
            {title}
          </CustomText>
          <CustomText size="sm" color={COLORS.textSecondary}>
            {description}
          </CustomText>
        </View>
      </View>
      {children}
    </View>
  );

  return (
    <LinearGradient colors={GRADIENTS.primary} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ padding: SPACING.md }}>
          {/* Header */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: SPACING.xl,
          }}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{
                padding: SPACING.xs,
                backgroundColor: COLORS.buttonBg,
                borderRadius: BORDER_RADIUS.full,
                marginRight: SPACING.md,
              }}>
              <ArrowLeft size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <CustomText size="xl" weight="bold" color={COLORS.textPrimary}>
              Paramètres
            </CustomText>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Langue */}
            {renderSettingSection({
              icon: Globe,
              title: 'Langue',
              description: 'Choisissez la langue de traduction',
              children: (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm }}>
                  {availableLanguages.map(([code, name]) => (
                    <TouchableOpacity
                      key={code}
                      onPress={() => handleLanguageChange(code)}
                      style={{
                        backgroundColor: selectedLanguage === code ? COLORS.primary : COLORS.buttonBg,
                        paddingHorizontal: SPACING.md,
                        paddingVertical: SPACING.xs,
                        borderRadius: BORDER_RADIUS.full,
                      }}>
                      <CustomText
                        size="sm"
                        color={selectedLanguage === code ? COLORS.white : COLORS.textPrimary}>
                        {name}
                      </CustomText>
                    </TouchableOpacity>
                  ))}
                </View>
              ),
            })}

            {/* Taille du texte */}
            {renderSettingSection({
              icon: Type,
              title: 'Taille du texte',
              description: 'Ajustez la taille du texte',
              children: (
                <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
                  {Object.keys(fontSizes).map((size) => (
                    <TouchableOpacity
                      key={size}
                      onPress={() => handleFontSizeChange(size)}
                      style={{
                        backgroundColor: fontSize === size ? COLORS.primary : COLORS.buttonBg,
                        paddingHorizontal: SPACING.md,
                        paddingVertical: SPACING.xs,
                        borderRadius: BORDER_RADIUS.full,
                      }}>
                      <CustomText
                        size="sm"
                        color={fontSize === size ? COLORS.white : COLORS.textPrimary}>
                        {size.charAt(0).toUpperCase() + size.slice(1)}
                      </CustomText>
                    </TouchableOpacity>
                  ))}
                </View>
              ),
            })}

            {/* Mode sombre */}
            {renderSettingSection({
              icon: Moon,
              title: 'Mode sombre',
              description: 'Activez le mode sombre',
              children: (
                <Switch
                  value={darkMode}
                  onValueChange={handleDarkModeToggle}
                  trackColor={{ false: COLORS.border, true: COLORS.primary }}
                  thumbColor={COLORS.white}
                />
              ),
            })}

            {/* Notifications */}
            {renderSettingSection({
              icon: Bell,
              title: 'Notifications',
              description: 'Recevez un hadith quotidien',
              children: (
                <Switch
                  value={notifications}
                  onValueChange={handleNotificationsToggle}
                  trackColor={{ false: COLORS.border, true: COLORS.primary }}
                  thumbColor={COLORS.white}
                />
              ),
            })}

            {/* Cache */}
            {renderSettingSection({
              icon: Share,
              title: 'Cache',
              description: 'Gérer le cache des hadiths',
              children: (
                <View>
                  {cacheInfo && (
                    <View style={{ marginBottom: SPACING.sm }}>
                      <CustomText size="sm" color={COLORS.textSecondary}>
                        Collections: {cacheInfo.collections ? new Date(cacheInfo.collections).toLocaleDateString() : 'Vide'}
                      </CustomText>
                      <CustomText size="sm" color={COLORS.textSecondary}>
                        Hadiths: {cacheInfo.hadiths ? new Date(cacheInfo.hadiths).toLocaleDateString() : 'Vide'}
                      </CustomText>
                    </View>
                  )}
                  <TouchableOpacity
                    onPress={clearCache}
                    style={{
                      backgroundColor: COLORS.buttonBg,
                      paddingHorizontal: SPACING.md,
                      paddingVertical: SPACING.xs,
                      borderRadius: BORDER_RADIUS.full,
                      alignSelf: 'flex-start',
                    }}>
                    <CustomText size="sm" color={COLORS.textPrimary}>
                      Vider le cache
                    </CustomText>
                  </TouchableOpacity>
                </View>
              ),
            })}
          </ScrollView>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}