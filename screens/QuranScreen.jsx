import React, { useEffect, useState } from 'react';
import { FlatList, View, TextInput, TouchableOpacity, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, ArrowLeft } from 'lucide-react-native';

import { CustomLoadingIndicator } from '../components/ui/LoadingIndicator';
import { CustomText } from '../components/ui/Typography';
import { COLORS, SPACING, BORDER_RADIUS, GRADIENTS, SHADOWS } from '../components/ui/Theme';
import { getSuraNames } from '../services/quranService';

export default function QuranScreen({ navigation }) {
  const [sourates, setSourates] = useState([]);
  const [filteredSourates, setFilteredSourates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadSuraNames = async () => {
      try {
        const names = await getSuraNames();
        setSourates(names);
        setFilteredSourates(names);
      } catch (error) {
        console.error('Error loading sura names:', error);
      } finally {
        setLoading(false);
      }
    };
    loadSuraNames();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredSourates(sourates);
      return;
    }

    const searchLower = searchQuery.toLowerCase();
    const filtered = sourates.filter(sura =>
      sura.name_fr.toLowerCase().includes(searchLower) ||
      sura.name_ar.includes(searchQuery) ||
      sura.name_wo?.toLowerCase().includes(searchLower) ||
      sura.description?.toLowerCase().includes(searchLower) ||
      sura.id.toString() === searchQuery
    );
    setFilteredSourates(filtered);
  }, [searchQuery, sourates]);

  const handleSuraPress = (sura) => {
    navigation.navigate('SourateDetail', {
      suraNumber: sura.id,
      suraNameAr: sura.name_ar,
      suraNameFr: sura.name_fr,
      suraNameWo: sura.name_wo,
      description: sura.description,
      type: sura.type,
      hasWolofTranslation: sura.hasWolofTranslation
    });
  };

  if (loading) {
    return (
      <LinearGradient
        colors={GRADIENTS.primary}
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <CustomLoadingIndicator />
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
            marginBottom: SPACING.md
          }}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ marginRight: SPACING.md }}>
              <ArrowLeft size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <CustomText size="2xl" color={COLORS.textPrimary} weight="bold">
              Sourates
            </CustomText>
          </View>

          <View style={{
            backgroundColor: COLORS.searchBg,
            borderRadius: BORDER_RADIUS.md,
            padding: SPACING.base,
            marginBottom: SPACING.md,
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            <Search size={20} color={COLORS.textSecondary} style={{ marginRight: SPACING.sm }} />
            <TextInput
              placeholder="Rechercher une sourate"
              placeholderTextColor={COLORS.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{
                flex: 1,
                color: COLORS.textPrimary,
                fontSize: SPACING.base,
              }}
            />
          </View>
        </View>

        <FlatList
          data={filteredSourates}
          keyExtractor={(item) => `surah-${item.id}`}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleSuraPress(item)}
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
                <View style={{
                  padding: SPACING.md,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <View style={{ flex: 1 }}>
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: SPACING.xs
                    }}>
                      <View style={{
                        backgroundColor: COLORS.buttonBg,
                        paddingHorizontal: SPACING.sm,
                        paddingVertical: SPACING.xs,
                        borderRadius: BORDER_RADIUS.base,
                        marginRight: SPACING.sm,
                      }}>
                        <CustomText size="sm" color={COLORS.textPrimary}>
                          {item.id}
                        </CustomText>
                      </View>
                      <CustomText size="lg" color={COLORS.textPrimary} weight="bold">
                        {item.name_fr}
                      </CustomText>
                      {item.hasWolofTranslation && (
                        <View style={{
                          backgroundColor: COLORS.wolofBadge,
                          paddingHorizontal: SPACING.sm,
                          paddingVertical: SPACING.xs,
                          borderRadius: BORDER_RADIUS.base,
                          marginLeft: SPACING.sm,
                        }}>
                          <CustomText size="xs" color={COLORS.primary} weight="bold">
                            WL
                          </CustomText>
                        </View>
                      )}
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <CustomText size="lg" color={COLORS.textPrimary} style={{ marginRight: SPACING.sm }}>
                        {item.name_ar}
                      </CustomText>
                      <CustomText size="xs" color={COLORS.textSecondary}>
                        {item.verses} Versets, {item.type}
                      </CustomText>
                    </View>
                    {item.name_wo && (
                      <CustomText size="sm" color={COLORS.textSecondary} style={{ marginTop: SPACING.xs }}>
                        {item.name_wo}
                      </CustomText>
                    )}
                    {item.description && (
                      <CustomText size="xs" color={COLORS.textSecondary} style={{ marginTop: SPACING.xs }}>
                        {item.description}
                      </CustomText>
                    )}
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: SPACING.md }}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}
