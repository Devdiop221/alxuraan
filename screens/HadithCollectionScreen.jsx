import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Book, ChevronRight, Search } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { CustomText } from '../components/ui/Typography';
import { COLORS, SPACING, BORDER_RADIUS, GRADIENTS, SHADOWS } from '../components/ui/Theme';
import HadithService from '../services/HadithService';

export default function HadithCollectionScreen({ route, navigation }) {
  const { collection } = route.params;
  const [hadiths, setHadiths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('fr');

  useEffect(() => {
    loadSettings();
    loadHadiths();
  }, []);

  const loadSettings = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('@hadith_language');
      if (savedLanguage) {
        setSelectedLanguage(savedLanguage);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
    }
  };

  const loadHadiths = async (pageNumber = 1, shouldRefresh = false) => {
    try {
      if (shouldRefresh) {
        setHadiths([]);
        setPage(1);
        pageNumber = 1;
      }

      const response = await HadithService.getHadithsByChapter(collection, 1, {
        language: selectedLanguage,
        page: pageNumber,
        limit: 20
      });

      if (response.hadiths.length === 0) {
        setHasMore(false);
      } else {
        setHadiths(prev => shouldRefresh ? response.hadiths : [...prev, ...response.hadiths]);
        setPage(pageNumber);
        setHasMore(response.pagination.currentPage < response.pagination.totalPages);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des hadiths:', error);
      setError("Une erreur s'est produite lors du chargement des hadiths");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadHadiths(1, true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadHadiths(page + 1);
    }
  };

  const renderHadithItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('HadithDetail', { hadith: item })}
      style={{
        backgroundColor: COLORS.cardBackground,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        marginBottom: SPACING.sm,
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
          marginRight: SPACING.md,
        }}>
          <Book size={20} color={COLORS.textPrimary} />
        </View>
        <View style={{ flex: 1 }}>
          <CustomText weight="bold" color={COLORS.textPrimary}>
            Hadith n°{item.hadithNumber}
          </CustomText>
          <CustomText size="sm" color={COLORS.textSecondary}>
            Livre {item.bookNumber}
          </CustomText>
        </View>
        <ChevronRight size={20} color={COLORS.textSecondary} />
      </View>

      <CustomText
        color={COLORS.textPrimary}
        numberOfLines={3}
        style={{ marginBottom: SPACING.xs }}>
        {item.hadithArabic}
      </CustomText>

      <CustomText
        color={COLORS.textSecondary}
        size="sm"
        numberOfLines={2}>
        {item.hadithEnglish}
      </CustomText>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={{ padding: SPACING.md }}>
        <ActivityIndicator size="small" color={COLORS.textPrimary} />
      </View>
    );
  };

  if (loading && page === 1) {
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
            marginBottom: SPACING.lg,
          }}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{
                padding: SPACING.xs,
                marginRight: SPACING.md,
              }}>
              <ArrowLeft size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <CustomText size="xl" weight="bold" color={COLORS.textPrimary}>
              {collection}
            </CustomText>
          </View>
        </View>

        <FlatList
          data={hadiths}
          renderItem={renderHadithItem}
          keyExtractor={(item, index) => `${item.collection}-${item.hadithNumber}-${index}`}
          contentContainerStyle={{ padding: SPACING.md }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            !loading && (
              <View style={{ padding: SPACING.xl, alignItems: 'center' }}>
                <CustomText color={COLORS.textSecondary}>
                  Aucun hadith trouvé
                </CustomText>
              </View>
            )
          }
        />
      </SafeAreaView>
    </LinearGradient>
  );
}