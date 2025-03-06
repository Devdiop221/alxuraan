import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, ScrollView, TouchableOpacity, Share, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Heart, Share2, Copy, BookOpen } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';

import { CustomText } from '../components/ui/Typography';
import { COLORS, SPACING, BORDER_RADIUS, GRADIENTS, SHADOWS } from '../components/ui/Theme';
import HadithService from '../services/HadithService';

export default function HadithDetail({ route, navigation }) {
  const { hadith: initialHadith } = route.params;
  const [hadith, setHadith] = useState(initialHadith);
  const [loading, setLoading] = useState(false);
  const [fontSize, setFontSize] = useState('normal');
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('fr');

  const fontSizes = {
    small: { arabic: 16, translation: 14 },
    normal: { arabic: 20, translation: 16 },
    large: { arabic: 24, translation: 18 },
  };

  useEffect(() => {
    loadSettings();
    checkFavorite();
    loadFullHadith();
  }, []);

  const loadSettings = async () => {
    try {
      const [savedFontSize, savedLanguage] = await Promise.all([
        AsyncStorage.getItem('@hadith_font_size'),
        AsyncStorage.getItem('@hadith_language')
      ]);
      if (savedFontSize) setFontSize(savedFontSize);
      if (savedLanguage) setSelectedLanguage(savedLanguage);
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
    }
  };

  const loadFullHadith = async () => {
    try {
      setLoading(true);
      const fullHadith = await HadithService.getHadithByNumber(
        initialHadith.collection,
        initialHadith.hadithNumber,
        { language: selectedLanguage }
      );
      setHadith(fullHadith);
    } catch (error) {
      console.error('Erreur lors du chargement du hadith complet:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkFavorite = async () => {
    try {
      const favorites = await AsyncStorage.getItem('@hadith_favorites');
      const favoritesList = favorites ? JSON.parse(favorites) : [];
      setIsFavorite(favoritesList.some(fav =>
        fav.collection === hadith.collection && fav.hadithNumber === hadith.hadithNumber
      ));
    } catch (error) {
      console.error('Erreur lors de la vérification des favoris:', error);
    }
  };

  const toggleFavorite = async () => {
    try {
      const favorites = await AsyncStorage.getItem('@hadith_favorites');
      let favoritesList = favorites ? JSON.parse(favorites) : [];

      if (isFavorite) {
        favoritesList = favoritesList.filter(fav =>
          !(fav.collection === hadith.collection && fav.hadithNumber === hadith.hadithNumber)
        );
      } else {
        favoritesList.push({
          collection: hadith.collection,
          hadithNumber: hadith.hadithNumber,
          timestamp: Date.now()
        });
      }

      await AsyncStorage.setItem('@hadith_favorites', JSON.stringify(favoritesList));
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Erreur lors de la modification des favoris:', error);
    }
  };

  const shareHadith = async () => {
    try {
      const textToShare = `${hadith.hadithArabic}\n\n${hadith.translations[selectedLanguage]}\n\n- ${hadith.collection} #${hadith.hadithNumber}`;
      await Share.share({
        message: textToShare,
      });
    } catch (error) {
      console.error('Erreur lors du partage:', error);
    }
  };

  const copyToClipboard = async () => {
    try {
      const textToCopy = `${hadith.hadithArabic}\n\n${hadith.translations[selectedLanguage]}\n\n- ${hadith.collection} #${hadith.hadithNumber}`;
      await Clipboard.setStringAsync(textToCopy);
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={GRADIENTS.primary} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.textPrimary} />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={GRADIENTS.primary} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ padding: SPACING.md }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: SPACING.xl,
          }}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{
                padding: SPACING.xs,
                backgroundColor: COLORS.buttonBg,
                borderRadius: BORDER_RADIUS.full,
              }}>
              <ArrowLeft size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
              <TouchableOpacity
                onPress={toggleFavorite}
                style={{
                  padding: SPACING.xs,
                  backgroundColor: COLORS.buttonBg,
                  borderRadius: BORDER_RADIUS.full,
                }}>
                <Heart
                  size={24}
                  color={isFavorite ? COLORS.primary : COLORS.textPrimary}
                  fill={isFavorite ? COLORS.primary : 'none'}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={shareHadith}
                style={{
                  padding: SPACING.xs,
                  backgroundColor: COLORS.buttonBg,
                  borderRadius: BORDER_RADIUS.full,
                }}>
                <Share2 size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={copyToClipboard}
                style={{
                  padding: SPACING.xs,
                  backgroundColor: COLORS.buttonBg,
                  borderRadius: BORDER_RADIUS.full,
                }}>
                <Copy size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
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
                marginBottom: SPACING.md,
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
                  <BookOpen size={20} color={COLORS.textPrimary} />
                </View>
                <View>
                  <CustomText weight="bold" color={COLORS.textPrimary}>
                    {hadith.collection} #{hadith.hadithNumber}
                  </CustomText>
                  <CustomText size="sm" color={COLORS.textSecondary}>
                    {hadith.reference.book && `Livre ${hadith.reference.book}`}
                    {hadith.reference.chapter && `, Chapitre ${hadith.reference.chapter}`}
                  </CustomText>
                </View>
              </View>

              <CustomText
                style={{
                  fontSize: fontSizes[fontSize].arabic,
                  textAlign: 'right',
                  marginBottom: SPACING.lg,
                  lineHeight: fontSizes[fontSize].arabic * 1.6,
                }}
                color={COLORS.textPrimary}>
                {hadith.hadithArabic}
              </CustomText>

              <CustomText
                style={{
                  fontSize: fontSizes[fontSize].translation,
                  marginBottom: SPACING.md,
                  lineHeight: fontSizes[fontSize].translation * 1.6,
                }}
                color={COLORS.textPrimary}>
                {hadith.translations[selectedLanguage]}
              </CustomText>

              {hadith.narrator && (
                <CustomText size="sm" color={COLORS.textSecondary}>
                  Rapporté par : {hadith.narrator}
                </CustomText>
              )}

              {hadith.grade && (
                <CustomText size="sm" color={COLORS.textSecondary}>
                  Grade : {hadith.grade}
                </CustomText>
              )}
            </View>

            {hadith.metadata && (
              <View style={{
                backgroundColor: COLORS.cardBackground,
                borderRadius: BORDER_RADIUS.lg,
                padding: SPACING.lg,
                marginBottom: SPACING.md,
                ...SHADOWS.sm,
              }}>
                <CustomText weight="bold" color={COLORS.textPrimary} style={{ marginBottom: SPACING.sm }}>
                  Informations supplémentaires
                </CustomText>

                {hadith.metadata.categories?.length > 0 && (
                  <View style={{ marginBottom: SPACING.xs }}>
                    <CustomText size="sm" color={COLORS.textSecondary}>
                      Catégories : {hadith.metadata.categories.join(', ')}
                    </CustomText>
                  </View>
                )}

                {hadith.metadata.topics?.length > 0 && (
                  <View style={{ marginBottom: SPACING.xs }}>
                    <CustomText size="sm" color={COLORS.textSecondary}>
                      Sujets : {hadith.metadata.topics.join(', ')}
                    </CustomText>
                  </View>
                )}

                {hadith.metadata.tags?.length > 0 && (
                  <View>
                    <CustomText size="sm" color={COLORS.textSecondary}>
                      Tags : {hadith.metadata.tags.join(', ')}
                    </CustomText>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
