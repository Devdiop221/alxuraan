import React from 'react';
import { FlatList, TouchableOpacity, SafeAreaView, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Bookmark, Share2 } from 'lucide-react-native';
import { Share } from 'react-native';

import { CustomText } from '../components/ui/Typography';
import { COLORS, SPACING, BORDER_RADIUS, GRADIENTS, SHADOWS } from '../components/ui/Theme';
import useStore from '../store/store';

export default function FavoritesScreen({ navigation }) {
  const { favorites, removeFavorite } = useStore();

  const handleAyaPress = (suraNumber, ayaNumber) => {
    navigation.navigate('SourateDetail', {
      suraNumber,
      initialAyaNumber: ayaNumber
    });
  };

  const handleShare = async (verse) => {
    try {
      await Share.share({
        message: `${verse.arabicText}\n\n${verse.translation}\n\nSourate ${verse.suraNumber}, Verset ${verse.ayaNumber}`,
      });
    } catch (error) {
      console.error('Error sharing verse:', error);
    }
  };

  const renderHeader = () => (
    <View style={{
      padding: SPACING.md,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.divider,
    }}>
      <CustomText size="2xl" weight="bold" color={COLORS.textPrimary} style={{ marginBottom: SPACING.xs }}>
        Mes Favoris
      </CustomText>

      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <CustomText color={COLORS.textSecondary}>
          {favorites.length} versets sauvegardés
        </CustomText>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: SPACING.xl,
    }}>
      <Bookmark size={48} color={COLORS.textSecondary} style={{ marginBottom: SPACING.md }} />
      <CustomText
        size="xl"
        weight="bold"
        color={COLORS.textPrimary}
        style={{ textAlign: 'center', marginBottom: SPACING.sm }}>
        Aucun favori
      </CustomText>
      <CustomText
        color={COLORS.textSecondary}
        style={{ textAlign: 'center' }}>
        Ajoutez des versets à vos favoris pour les retrouver ici
      </CustomText>
    </View>
  );

  return (
    <LinearGradient colors={GRADIENTS.primary} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <FlatList
          data={favorites}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyState}
          keyExtractor={(item) => `${item.suraNumber}-${item.ayaNumber}`}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleAyaPress(item.suraNumber, item.ayaNumber)}
              style={{
                marginHorizontal: SPACING.md,
                marginBottom: SPACING.sm,
              }}>
              <LinearGradient
                colors={GRADIENTS.card}
                style={{
                  borderRadius: BORDER_RADIUS.md,
                  overflow: 'hidden',
                  ...SHADOWS.base,
                }}>
                <View style={{ padding: SPACING.md }}>
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
                      borderRadius: BORDER_RADIUS.base,
                    }}>
                      <CustomText size="sm" color={COLORS.textPrimary}>
                        {item.suraNumber}:{item.ayaNumber}
                      </CustomText>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleShare(item)}
                      style={{
                        padding: SPACING.xs,
                        backgroundColor: COLORS.buttonBg,
                        borderRadius: BORDER_RADIUS.full,
                      }}>
                      <Share2 size={16} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                  </View>

                  <CustomText
                    size="lg"
                    style={{
                      textAlign: 'right',
                      marginBottom: SPACING.sm,
                    }}
                    color={COLORS.textPrimary}>
                    {item.arabicText}
                  </CustomText>

                  <CustomText
                    size="sm"
                    style={{ textAlign: 'left' }}
                    color={COLORS.textSecondary}>
                    {item.translation}
                  </CustomText>

                  {item.wolofText && (
                    <View style={{
                      marginTop: SPACING.sm,
                      paddingTop: SPACING.sm,
                      borderTopWidth: 1,
                      borderTopColor: COLORS.divider,
                    }}>
                      <CustomText
                        size="sm"
                        style={{ textAlign: 'left' }}
                        color={COLORS.textSecondary}>
                        {item.wolofText}
                      </CustomText>
                    </View>
                  )}
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: SPACING.md,
          }}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}
