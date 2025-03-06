import React, { useEffect, useState } from 'react';
import { ScrollView, View, SafeAreaView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Bookmark, Share2, BookmarkCheck } from 'lucide-react-native';
import { Share } from 'react-native';

import { CustomLoadingIndicator } from '../components/ui/LoadingIndicator';
import { CustomText } from '../components/ui/Typography';
import { COLORS, SPACING, BORDER_RADIUS, GRADIENTS, SHADOWS } from '../components/ui/Theme';
import wolofData from '../data/quran_wolof.json';
import { getSuraTranslation } from '../services/quranService';
import useStore from '../store/store';

export default function SourateDetail({ route }) {
  const { suraNumber, suraNameAr, suraNameFr } = route.params;
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { favorites, addFavorite, removeFavorite } = useStore();
  const [suraName, setSuraName] = useState({
    name_ar: suraNameAr,
    name_fr: suraNameFr,
    name_wo: '',
  });

  useEffect(() => {
    const loadSura = async () => {
      const data = await getSuraTranslation(suraNumber);
      const wolofSura = wolofData.find((sura) => sura.id === suraNumber);

      const mergedVerses = data.map((verse, index) => ({
        ...verse,
        wolof: wolofSura ? wolofSura.verses[index]?.wolof : '',
      }));

      setSuraName((prev) => ({
        ...prev,
        name_wo: wolofSura?.name || `Sourate ${suraNumber}`,
      }));

      setVerses(mergedVerses);
      setLoading(false);
    };
    loadSura();
  }, [suraNumber]);

  const handleShare = async (verse, index) => {
    try {
      const message = `${verse.arabic_text}\n\n${verse.translation}${verse.wolof ? '\n\n' + verse.wolof : ''}\n\nSourate ${suraNumber}, Verset ${index + 1}`;
      await Share.share({ message });
    } catch (error) {
      console.error('Erreur lors du partage:', error);
    }
  };

  const isVerseInFavorites = (verseNumber) => {
    return favorites.some(fav =>
      fav.suraNumber === suraNumber &&
      fav.ayaNumber === verseNumber
    );
  };

  const toggleFavorite = (verse, index) => {
    const verseData = {
      suraNumber,
      ayaNumber: index + 1,
      arabicText: verse.arabic_text,
      translation: verse.translation,
      wolofText: verse.wolof,
    };

    if (isVerseInFavorites(index + 1)) {
      removeFavorite(suraNumber, index + 1);
    } else {
      addFavorite(verseData);
    }
  };

  if (loading) {
    return <CustomLoadingIndicator />;
  }

  return (
    <LinearGradient colors={GRADIENTS.primary} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{
          borderBottomWidth: 1,
          borderBottomColor: COLORS.divider,
          padding: SPACING.md
        }}>
          <CustomText
            size="2xl"
            weight="bold"
            style={{ textAlign: 'center' }}
            color={COLORS.textPrimary}>
            {suraName.name_ar} - {suraName.name_fr}
          </CustomText>
          <CustomText
            size="lg"
            style={{ textAlign: 'center' }}
            color={COLORS.textSecondary}>
            {suraName.name_wo}
          </CustomText>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: SPACING.md }}>
          {verses.map((verse, index) => (
            <LinearGradient
              key={index}
              colors={GRADIENTS.card}
              style={{
                marginBottom: SPACING.md,
                padding: SPACING.md,
                borderRadius: BORDER_RADIUS.md,
                ...SHADOWS.base,
              }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: SPACING.base,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{
                    backgroundColor: COLORS.buttonBg,
                    paddingHorizontal: SPACING.base,
                    paddingVertical: SPACING.xs,
                    borderRadius: BORDER_RADIUS.lg,
                    marginRight: SPACING.sm,
                  }}>
                    <CustomText color={COLORS.textPrimary} size="sm">
                      {index + 1}:{suraNumber}
                    </CustomText>
                  </View>
                  {verse.wolof && (
                    <View style={{
                      backgroundColor: COLORS.wolofBadge,
                      paddingHorizontal: SPACING.sm,
                      paddingVertical: SPACING.xs,
                      borderRadius: BORDER_RADIUS.base,
                    }}>
                      <CustomText size="xs" color={COLORS.primary} weight="bold">
                        WL
                      </CustomText>
                    </View>
                  )}
                </View>

                <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
                  <TouchableOpacity
                    onPress={() => handleShare(verse, index)}
                    style={{
                      padding: SPACING.xs,
                      backgroundColor: COLORS.buttonBg,
                      borderRadius: BORDER_RADIUS.full,
                    }}>
                    <Share2 size={20} color={COLORS.textPrimary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => toggleFavorite(verse, index)}
                    style={{
                      padding: SPACING.xs,
                      backgroundColor: COLORS.buttonBg,
                      borderRadius: BORDER_RADIUS.full,
                    }}>
                    {isVerseInFavorites(index + 1) ? (
                      <BookmarkCheck size={20} color={COLORS.primary} />
                    ) : (
                      <Bookmark size={20} color={COLORS.textPrimary} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <CustomText
                size="xl"
                style={{
                  textAlign: 'right',
                  marginBottom: SPACING.base,
                  lineHeight: SPACING.xl * 1.5,
                }}
                color={COLORS.textPrimary}>
                {verse.arabic_text}
              </CustomText>
              <CustomText
                size="lg"
                style={{
                  textAlign: 'left',
                  marginBottom: verse.wolof ? SPACING.sm : 0,
                  lineHeight: SPACING.lg * 1.5,
                }}
                color={COLORS.textSecondary}>
                {verse.translation}
              </CustomText>
              {verse.wolof && (
                <CustomText
                  size="base"
                  style={{
                    textAlign: 'left',
                    lineHeight: SPACING.base * 1.5,
                  }}
                  color={COLORS.textSecondary}>
                  {verse.wolof}
                </CustomText>
              )}
            </LinearGradient>
          ))}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
