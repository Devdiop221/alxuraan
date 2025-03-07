import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, TouchableOpacity, FlatList, ActivityIndicator, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Search, Filter, BookOpen } from 'lucide-react-native';
import debounce from 'lodash/debounce';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { CustomText } from '../components/ui/Typography';
import { COLORS, SPACING, BORDER_RADIUS, GRADIENTS, SHADOWS } from '../components/ui/Theme';
import HadithService from '../services/hadithService';

const ITEMS_PER_PAGE = 20;

export default function HadithCollection({ route, navigation }) {
  const { collection } = route.params;
  const [hadiths, setHadiths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('fr');
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('Collection reçue:', collection);
    loadSettings();
    loadHadiths();
  }, []);

  const loadSettings = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('@hadith_language');
      if (savedLanguage) {
        console.log('Langue chargée:', savedLanguage);
        setSelectedLanguage(savedLanguage);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
    }
  };

  const loadHadiths = async (pageNumber = 1, shouldRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      const response = await HadithService.getHadithsByChapter(
        collection.key,
        1, // Chapitre par défaut
        {
          language: selectedLanguage,
          page: pageNumber,
          limit: ITEMS_PER_PAGE
        }
      );

      if (shouldRefresh) {
        setHadiths(response.hadiths || []);
      } else {
        setHadiths(prev => [...prev, ...(response.hadiths || [])]);
      }

      setHasMore(response.pagination.currentPage < response.pagination.totalPages);
      setPage(pageNumber);
    } catch (error) {
      console.error('Erreur lors du chargement des hadiths:', error);
      setError("Une erreur s'est produite lors du chargement des hadiths");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    console.log('Rafraîchissement demandé');
    setRefreshing(true);
    loadHadiths(1, true);
  };

  const handleLoadMore = () => {
    console.log('Chargement de plus de hadiths demandé');
    if (!loading && hasMore) {
      loadHadiths(page + 1);
    }
  };

  const searchHadiths = debounce(async (query) => {
    console.log('Recherche de hadiths:', query);
    if (!query.trim()) {
      handleRefresh();
      return;
    }

    try {
      setLoading(true);
      const searchResults = await HadithService.searchHadiths(query, {
        collection: collection.key,
        language: selectedLanguage,
        page: 1,
        limit: ITEMS_PER_PAGE
      });

      console.log('Résultats de recherche:', searchResults.results?.length || 0);

      setHadiths(searchResults.results || []);
      setHasMore(false);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      setError("Une erreur s'est produite lors de la recherche");
    } finally {
      setLoading(false);
    }
  }, 500);

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
      <CustomText
        style={{
          textAlign: 'right',
          fontFamily: 'arabic',
          fontSize: 18,
          lineHeight: 32,
          marginBottom: SPACING.sm,
        }}
        color={COLORS.textPrimary}>
        {item.hadithArabic}
      </CustomText>
      <CustomText
        style={{ marginBottom: SPACING.sm }}
        color={COLORS.textSecondary}
        numberOfLines={3}>
        {item.translations[selectedLanguage]}
      </CustomText>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: SPACING.sm,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
      }}>
        <CustomText size="sm" color={COLORS.textSecondary}>
          {item.narrator || 'Narrateur non spécifié'}
        </CustomText>
        <CustomText size="sm" color={COLORS.textSecondary}>
          Hadith n°{item.hadithNumber}
        </CustomText>
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!loading || refreshing) return null;
    return (
      <View style={{ paddingVertical: SPACING.md }}>
        <ActivityIndicator size="large" color={COLORS.textPrimary} />
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={{
      alignItems: 'center',
      paddingVertical: SPACING.xl,
    }}>
      <BookOpen size={48} color={COLORS.textSecondary} style={{ marginBottom: SPACING.md }} />
      <CustomText color={COLORS.textSecondary}>
        {searchQuery
          ? 'Aucun hadith trouvé pour cette recherche'
          : 'Aucun hadith disponible dans cette collection'}
      </CustomText>
    </View>
  );

  return (
    <LinearGradient colors={GRADIENTS.primary} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1, padding: SPACING.md }}>
          {/* Header avec informations de débogage */}
          <View style={{ marginBottom: SPACING.lg }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: SPACING.md,
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
              <View style={{ flex: 1 }}>
                <CustomText size="xl" weight="bold" color={COLORS.textPrimary}>
                  {collection.name}
                </CustomText>
                <CustomText size="sm" color={COLORS.textSecondary}>
                  {collection.description}
                </CustomText>
                {__DEV__ && (
                  <CustomText size="xs" color={COLORS.textSecondary}>
                    Collection Key: {collection.key}, Language: {selectedLanguage}
                  </CustomText>
                )}
              </View>
            </View>

            {/* Barre de recherche */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: COLORS.cardBackground,
              borderRadius: BORDER_RADIUS.full,
              paddingHorizontal: SPACING.md,
              ...SHADOWS.sm,
            }}>
              <Search size={20} color={COLORS.textSecondary} />
              <TextInput
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  searchHadiths(text);
                }}
                placeholder="Rechercher dans cette collection..."
                placeholderTextColor={COLORS.textSecondary}
                style={{
                  flex: 1,
                  color: COLORS.textPrimary,
                  paddingVertical: SPACING.sm,
                  paddingHorizontal: SPACING.sm,
                  fontSize: 16,
                }}
              />
            </View>
          </View>

          {error ? (
            <View style={{
              alignItems: 'center',
              paddingVertical: SPACING.xl,
            }}>
              <CustomText color={COLORS.error}>{error}</CustomText>
              {__DEV__ && (
                <CustomText size="xs" color={COLORS.error} style={{ marginTop: SPACING.sm }}>
                  Collection: {collection.key}, Page: {page}, Items: {hadiths.length}
                </CustomText>
              )}
              <TouchableOpacity
                onPress={handleRefresh}
                style={{
                  marginTop: SPACING.md,
                  padding: SPACING.sm,
                  backgroundColor: COLORS.primary,
                  borderRadius: BORDER_RADIUS.md,
                }}>
                <CustomText color={COLORS.white}>Réessayer</CustomText>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={hadiths}
              renderItem={renderHadithItem}
              keyExtractor={(item) => `${item.collection}-${item.hadithNumber}`}
              onRefresh={handleRefresh}
              refreshing={refreshing}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.5}
              ListFooterComponent={renderFooter}
              ListEmptyComponent={renderEmpty}
              contentContainerStyle={{
                paddingBottom: SPACING.xl,
                flexGrow: 1,
              }}
            />
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}