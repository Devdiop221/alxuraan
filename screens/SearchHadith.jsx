import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  Keyboard
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, ArrowLeft, X, Filter, Heart } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { CustomText } from '../components/ui/Typography';
import { COLORS, SPACING, BORDER_RADIUS, GRADIENTS, SHADOWS } from '../components/ui/Theme';
import HadithService from '../services/hadithService';

export default function SearchHadith({ navigation }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('fr');
  const [selectedCollection, setSelectedCollection] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [collections, setCollections] = useState([]);

  useEffect(() => {
    loadSettings();
    loadFavorites();
    loadSearchHistory();
    loadCollections();
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

  const loadFavorites = async () => {
    try {
      const savedFavorites = await AsyncStorage.getItem('@hadith_favorites');
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des favoris:', error);
    }
  };

  const loadSearchHistory = async () => {
    try {
      const history = await AsyncStorage.getItem('@hadith_search_history');
      if (history) {
        setSearchHistory(JSON.parse(history));
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique de recherche:', error);
    }
  };

  const loadCollections = async () => {
    try {
      const collectionsData = await HadithService.getCollections();
      setCollections(collectionsData);
    } catch (error) {
      console.error('Erreur lors du chargement des collections:', error);
    }
  };

  const saveSearchHistory = async (newQuery) => {
    try {
      // Add to beginning, remove duplicates, limit to 10 items
      const newHistory = [
        newQuery,
        ...searchHistory.filter(item => item !== newQuery)
      ].slice(0, 10);

      setSearchHistory(newHistory);
      await AsyncStorage.setItem('@hadith_search_history', JSON.stringify(newHistory));
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'historique:', error);
    }
  };

  const clearSearchHistory = async () => {
    try {
      setSearchHistory([]);
      await AsyncStorage.removeItem('@hadith_search_history');
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'historique:', error);
    }
  };

  const searchHadiths = async (searchQuery = query, resetResults = true) => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      setError(null);

      if (resetResults) {
        setPage(1);
        setResults([]);
      }

      const currentPage = resetResults ? 1 : page;

      const searchResults = await HadithService.searchHadiths(searchQuery, {
        language: selectedLanguage,
        collection: selectedCollection,
        page: currentPage,
        limit: 10
      });

      if (resetResults) {
        setResults(searchResults.results);
      } else {
        setResults([...results, ...searchResults.results]);
      }

      // Check if there are more pages
      setHasMore(
        searchResults.pagination.currentPage < searchResults.pagination.totalPages
      );

      if (resetResults) {
        saveSearchHistory(searchQuery);
      }

      if (currentPage === 1 && searchResults.results.length === 0) {
        setError('Aucun résultat trouvé');
      }
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      setError('Une erreur est survenue lors de la recherche');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      searchHadiths(query, false);
    }
  };

  const handleSearch = () => {
    Keyboard.dismiss();
    searchHadiths();
  };

  const handleHistoryItemPress = (historyItem) => {
    setQuery(historyItem);
    searchHadiths(historyItem);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setError(null);
  };

  const toggleFavorite = async (hadith) => {
    try {
      const newFavorites = [...favorites];
      const index = newFavorites.findIndex(fav =>
        fav.collection === hadith.collection && fav.hadithNumber === hadith.hadithNumber
      );

      if (index === -1) {
        newFavorites.push({
          collection: hadith.collection,
          hadithNumber: hadith.hadithNumber,
          timestamp: Date.now()
        });
      } else {
        newFavorites.splice(index, 1);
      }

      setFavorites(newFavorites);
      await AsyncStorage.setItem('@hadith_favorites', JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Erreur lors de la modification des favoris:', error);
    }
  };

  const isFavorite = (hadith) => {
    return favorites.some(fav =>
      fav.collection === hadith.collection && fav.hadithNumber === hadith.hadithNumber
    );
  };

  const renderSearchFilters = () => (
    <View style={{
      backgroundColor: COLORS.cardBackground,
      padding: SPACING.md,
      borderRadius: BORDER_RADIUS.md,
      marginBottom: SPACING.md,
    }}>
      <CustomText weight="bold" color={COLORS.textPrimary} style={{ marginBottom: SPACING.xs }}>
        Filtres de recherche
      </CustomText>

      <View style={{ marginBottom: SPACING.sm }}>
        <CustomText size="sm" color={COLORS.textSecondary} style={{ marginBottom: SPACING.xs }}>
          Collection
        </CustomText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs }}>
          <TouchableOpacity
            onPress={() => setSelectedCollection('')}
            style={{
              paddingHorizontal: SPACING.sm,
              paddingVertical: SPACING.xs,
              borderRadius: BORDER_RADIUS.sm,
              backgroundColor: selectedCollection === '' ? COLORS.primary : COLORS.buttonBg,
            }}>
            <CustomText
              size="sm"
              color={selectedCollection === '' ? COLORS.buttonText : COLORS.textSecondary}>
              Toutes
            </CustomText>
          </TouchableOpacity>

          {collections.map(collection => (
            <TouchableOpacity
              key={collection.key}
              onPress={() => setSelectedCollection(collection.key)}
              style={{
                paddingHorizontal: SPACING.sm,
                paddingVertical: SPACING.xs,
                borderRadius: BORDER_RADIUS.sm,
                backgroundColor: selectedCollection === collection.key
                  ? COLORS.primary
                  : COLORS.buttonBg,
              }}>
              <CustomText
                size="sm"
                color={selectedCollection === collection.key
                  ? COLORS.buttonText
                  : COLORS.textSecondary}>
                {collection.name}
              </CustomText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={{ marginBottom: SPACING.sm }}>
        <CustomText size="sm" color={COLORS.textSecondary} style={{ marginBottom: SPACING.xs }}>
          Langue
        </CustomText>
        <View style={{ flexDirection: 'row', gap: SPACING.xs }}>
          {['fr', 'en', 'ar'].map(lang => (
            <TouchableOpacity
              key={lang}
              onPress={() => setSelectedLanguage(lang)}
              style={{
                paddingHorizontal: SPACING.sm,
                paddingVertical: SPACING.xs,
                borderRadius: BORDER_RADIUS.sm,
                backgroundColor: selectedLanguage === lang ? COLORS.primary : COLORS.buttonBg,
              }}>
              <CustomText
                size="sm"
                color={selectedLanguage === lang ? COLORS.buttonText : COLORS.textSecondary}>
                {lang.toUpperCase()}
              </CustomText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        onPress={() => {
          setShowFilters(false);
          if (query.trim()) {
            searchHadiths();
          }
        }}
        style={{
          backgroundColor: COLORS.primary,
          padding: SPACING.sm,
          borderRadius: BORDER_RADIUS.md,
          alignItems: 'center',
        }}>
        <CustomText weight="bold" color={COLORS.buttonText}>
          Appliquer les filtres
        </CustomText>
      </TouchableOpacity>
    </View>
  );

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
      {/* Hadith content */}
      {selectedLanguage === 'ar' ? (
        <CustomText
          style={{
            marginBottom: SPACING.sm,
            textAlign: 'right',
            fontFamily: 'arabic',
            fontSize: 18,
            lineHeight: 30
          }}
          color={COLORS.textPrimary}
          numberOfLines={3}>
          {item.hadithArabic}
        </CustomText>
      ) : (
        <CustomText
          color={COLORS.textSecondary}
          style={{ marginBottom: SPACING.sm }}
          numberOfLines={3}>
          {item.translations[selectedLanguage]}
        </CustomText>
      )}

      {/* Hadith info */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: SPACING.sm,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
      }}>
        <View>
          <CustomText size="sm" color={COLORS.textSecondary}>
            {item.collectionInfo.name} #{item.hadithNumber}
          </CustomText>
          <CustomText size="xs" color={COLORS.textSecondary}>
            Grade: {item.grade}
          </CustomText>
        </View>
        <TouchableOpacity
          onPress={() => toggleFavorite(item)}
          style={{
            padding: SPACING.xs,
            backgroundColor: COLORS.buttonBg,
            borderRadius: BORDER_RADIUS.full,
          }}>
          <Heart
            size={18}
            color={isFavorite(item) ? COLORS.primary : COLORS.textPrimary}
            fill={isFavorite(item) ? COLORS.primary : 'none'}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderSearchHistory = () => (
    <View style={{ marginTop: SPACING.md }}>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.sm,
      }}>
        <CustomText weight="bold" color={COLORS.textPrimary}>
          Recherches récentes
        </CustomText>
        {searchHistory.length > 0 && (
          <TouchableOpacity onPress={clearSearchHistory}>
            <CustomText size="sm" color={COLORS.primary}>
              Effacer
            </CustomText>
          </TouchableOpacity>
        )}
      </View>

      {searchHistory.length === 0 ? (
        <CustomText size="sm" color={COLORS.textSecondary}>
          Pas d'historique de recherche
        </CustomText>
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs }}>
          {searchHistory.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleHistoryItemPress(item)}
              style={{
                backgroundColor: COLORS.buttonBg,
                paddingHorizontal: SPACING.sm,
                paddingVertical: SPACING.xs,
                borderRadius: BORDER_RADIUS.full,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Search size={14} color={COLORS.textSecondary} style={{ marginRight: 4 }} />
              <CustomText size="sm" color={COLORS.textSecondary}>
                {item}
              </CustomText>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <LinearGradient colors={GRADIENTS.primary} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ padding: SPACING.md, flex: 1 }}>
          {/* Header */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: SPACING.md,
          }}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{
                padding: SPACING.xs,
                marginRight: SPACING.sm,
                backgroundColor: COLORS.buttonBg,
                borderRadius: BORDER_RADIUS.full,
              }}>
              <ArrowLeft size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <CustomText size="xl" weight="bold" color={COLORS.textPrimary}>
              Recherche de Hadiths
            </CustomText>
          </View>

          {/* Search Bar */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: SPACING.md,
          }}>
            <View style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: COLORS.inputBackground,
              borderRadius: BORDER_RADIUS.md,
              paddingHorizontal: SPACING.sm,
              height: 50,
            }}>
              <Search size={20} color={COLORS.textSecondary} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Rechercher des hadiths"
                placeholderTextColor={COLORS.textSecondary}
                style={{
                  flex: 1,
                  marginLeft: SPACING.sm,
                  color: COLORS.textPrimary,
                  fontSize: 16,
                }}
                returnKeyType="search"
                onSubmitEditing={handleSearch}
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={clearSearch}>
                  <X size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              onPress={() => setShowFilters(!showFilters)}
              style={{
                marginLeft: SPACING.sm,
                backgroundColor: COLORS.buttonBg,
                borderRadius: BORDER_RADIUS.full,
                padding: SPACING.sm,
              }}>
              <Filter size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Filters */}
          {showFilters && renderSearchFilters()}

          {/* Results or Search History */}
          {results.length > 0 ? (
            <FlatList
              data={results}
              renderItem={renderHadithItem}
              keyExtractor={(item, index) => `${item.collection}-${item.hadithNumber}-${index}`}
              onEndReached={loadMore}
              onEndReachedThreshold={0.5}
              ListFooterComponent={
                loading ? (
                  <ActivityIndicator
                    size="small"
                    color={COLORS.textPrimary}
                    style={{ marginVertical: SPACING.md }}
                  />
                ) : null
              }
            />
          ) : (
            <View style={{ flex: 1 }}>
              {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <ActivityIndicator size="large" color={COLORS.textPrimary} />
                </View>
              ) : error ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <CustomText color={COLORS.error}>{error}</CustomText>
                </View>
              ) : (
                renderSearchHistory()
              )}
            </View>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}