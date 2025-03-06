import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, SafeAreaView, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Eye, EyeOff, MinusCircle, PlusCircle, Bookmark, Share2 } from 'lucide-react-native';

import { CustomLoadingIndicator } from '../components/ui/LoadingIndicator';
import { CustomText } from '../components/ui/Typography';
import { COLORS, SPACING, BORDER_RADIUS, GRADIENTS, SHADOWS } from '../components/ui/Theme';
import { quranService } from '../services/quranService';

export default function SurahDetailScreen({ route, navigation }) {
  const { surahNumber } = route.params;
  const [surah, setSurah] = useState(null);
  const [verses, setVerses] = useState([]);
  const [translations, setTranslations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTranslation, setShowTranslation] = useState(true);
  const [fontSize, setFontSize] = useState(18);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadSurahDetails();
  }, [surahNumber]);

  useEffect(() => {
    if (!loading && surah) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [loading, surah]);

  const loadSurahDetails = async () => {
    try {
      setLoading(true);
      const [surahData, versesData, translationData] = await Promise.all([
        quranService.getSurahDetails(surahNumber),
        quranService.getSurahVerses(surahNumber),
        quranService.getSurahTranslation(surahNumber),
      ]);

      setSurah(surahData);
      setVerses(versesData);
      setTranslations(translationData.ayahs);
    } catch (err) {
      setError(err.message);
      console.error('Erreur lors du chargement des détails de la sourate:', err);
    } finally {
      setLoading(false);
    }
  };

  const increaseFontSize = () => {
    setFontSize(prev => Math.min(prev + 2, 32));
  };

  const decreaseFontSize = () => {
    setFontSize(prev => Math.max(prev - 2, 14));
  };

  if (loading) {
    return (
      <LinearGradient colors={GRADIENTS.primary} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <CustomLoadingIndicator />
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient colors={GRADIENTS.primary} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1, padding: SPACING.md }}>
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: SPACING.xl,
          }}>
            <CustomText
              color={COLORS.error}
              size="lg"
              weight="bold"
              style={{ textAlign: 'center', marginBottom: SPACING.md }}>
              Erreur : {error}
            </CustomText>
            <TouchableOpacity
              onPress={loadSurahDetails}
              style={{
                backgroundColor: COLORS.buttonBg,
                padding: SPACING.md,
                borderRadius: BORDER_RADIUS.md,
              }}>
              <CustomText color={COLORS.textPrimary}>Réessayer</CustomText>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={GRADIENTS.primary} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={{
          padding: SPACING.md,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.divider,
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: SPACING.md,
          }}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ marginRight: SPACING.md }}>
              <ArrowLeft size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <CustomText size="xl" weight="bold" color={COLORS.textPrimary}>
                {surah.name}
              </CustomText>
              <CustomText size="sm" color={COLORS.textSecondary}>
                {surah.englishName} • {surah.numberOfAyahs} versets
              </CustomText>
            </View>
          </View>

          {/* Controls */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <TouchableOpacity
              onPress={() => setShowTranslation(!showTranslation)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: COLORS.buttonBg,
                padding: SPACING.sm,
                borderRadius: BORDER_RADIUS.full,
              }}>
              {showTranslation ? (
                <Eye size={20} color={COLORS.textPrimary} />
              ) : (
                <EyeOff size={20} color={COLORS.textPrimary} />
              )}
              <CustomText
                color={COLORS.textPrimary}
                size="sm"
                style={{ marginLeft: SPACING.xs }}>
                {showTranslation ? "Masquer" : "Afficher"}
              </CustomText>
            </TouchableOpacity>

            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: SPACING.sm,
            }}>
              <TouchableOpacity
                onPress={decreaseFontSize}
                style={{
                  padding: SPACING.xs,
                  backgroundColor: COLORS.buttonBg,
                  borderRadius: BORDER_RADIUS.full,
                }}>
                <MinusCircle size={20} color={COLORS.textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={increaseFontSize}
                style={{
                  padding: SPACING.xs,
                  backgroundColor: COLORS.buttonBg,
                  borderRadius: BORDER_RADIUS.full,
                }}>
                <PlusCircle size={20} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Content */}
        <ScrollView style={{ flex: 1 }}>
          <Animated.View
            style={{
              opacity: fadeAnim,
              padding: SPACING.md,
            }}>
            {verses.map((verse, index) => (
              <View
                key={verse.number}
                style={{
                  marginBottom: SPACING.md,
                }}>
                <LinearGradient
                  colors={GRADIENTS.card}
                  style={{
                    borderRadius: BORDER_RADIUS.lg,
                    padding: SPACING.md,
                    ...SHADOWS.base,
                  }}>
                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: SPACING.sm,
                  }}>
                    <View style={{
                      backgroundColor: COLORS.buttonBg,
                      paddingHorizontal: SPACING.sm,
                      paddingVertical: SPACING.xs,
                      borderRadius: BORDER_RADIUS.full,
                    }}>
                      <CustomText size="sm" color={COLORS.textPrimary}>
                        {verse.numberInSurah}
                      </CustomText>
                    </View>
                    <View style={{
                      flexDirection: 'row',
                      gap: SPACING.sm,
                    }}>
                      <TouchableOpacity
                        style={{
                          padding: SPACING.xs,
                          backgroundColor: COLORS.buttonBg,
                          borderRadius: BORDER_RADIUS.full,
                        }}>
                        <Bookmark size={16} color={COLORS.textPrimary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{
                          padding: SPACING.xs,
                          backgroundColor: COLORS.buttonBg,
                          borderRadius: BORDER_RADIUS.full,
                        }}>
                        <Share2 size={16} color={COLORS.textPrimary} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <CustomText
                    size="xl"
                    style={{
                      fontSize,
                      textAlign: 'right',
                      marginBottom: showTranslation ? SPACING.md : 0,
                      lineHeight: fontSize * 1.8,
                    }}
                    color={COLORS.textPrimary}>
                    {verse.text}
                  </CustomText>

                  {showTranslation && translations[index] && (
                    <View style={{
                      paddingTop: SPACING.sm,
                      borderTopWidth: 1,
                      borderTopColor: COLORS.divider,
                    }}>
                      <CustomText
                        size="base"
                        style={{
                          lineHeight: SPACING.xl,
                        }}
                        color={COLORS.textSecondary}>
                        {translations[index].text}
                      </CustomText>
                    </View>
                  )}
                </LinearGradient>
              </View>
            ))}
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}