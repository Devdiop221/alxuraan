import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Book, ChevronRight, Search, RefreshCw, BookOpen, Filter, Heart } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { CustomText } from '../components/ui/Typography';
import { COLORS, SPACING, BORDER_RADIUS, GRADIENTS, SHADOWS } from '../components/ui/Theme';
import HadithService from '../services/hadithService';

const { width } = Dimensions.get('window');

// Données de secours pour les collections
const FALLBACK_COLLECTIONS = [
  {
    name: "Sahih al-Bukhari",
    numberOfHadith: 7277,
    totalBooks: 97
  },
  {
    name: "Sahih Muslim",
    numberOfHadith: 7459,
    totalBooks: 57
  }
];

export default function HadithScreen({ navigation }) {
  const [collections, setCollections] = useState(FALLBACK_COLLECTIONS);
  const [featuredHadith, setFeaturedHadith] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('fr');
  const [favorites, setFavorites] = useState([]);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    loadSettings();
    loadInitialData();
    loadFavorites();
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

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      let collectionsData = [];
      let randomHadith = null;

      try {
        const response = await HadithService.getCollections();
        collectionsData = response.collections.map(collection => ({
          key: collection.name.toLowerCase().replace(/\s/g, '-'),
          name: collection.name,
          description: `Collection de ${collection.numberOfHadith} hadiths répartis en ${collection.totalBooks} livres`,
          totalHadith: collection.numberOfHadith,
          totalBooks: collection.totalBooks,
          languages: ['ar', 'fr', 'en'],
          available: true
        }));
      } catch (error) {
        console.error('Erreur lors de la récupération des collections:', error);
        collectionsData = FALLBACK_COLLECTIONS;
      }

      try {
        randomHadith = await HadithService.getRandomHadith(selectedLanguage);
      } catch (error) {
        console.error('Erreur lors de la récupération du hadith aléatoire:', error);
        randomHadith = null;
      }

      setCollections(collectionsData);
      setFeaturedHadith(randomHadith);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      if (retryCount < 3) {
        setRetryCount(prev => prev + 1);
        setTimeout(loadInitialData, 1000 * (retryCount + 1));
      } else {
        setError("Une erreur s'est produite lors du chargement des données");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setRetryCount(0);
    refreshFeaturedHadith();
    setRefreshing(false);
  };

  const refreshFeaturedHadith = async () => {
    try {
      setLoading(true);
      const response = await HadithService.getRandomHadith(selectedLanguage);
      console.log('Nouveau hadith chargé:', response);
      if (response) {
        setFeaturedHadith({
          hadith: response.hadith,
          narrator: response.narrator,
          reference: response.reference
        });
      }
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du hadith:', error);
    } finally {
      setLoading(false);
    }
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

  const handleCollectionPress = (collection) => {
    // Mapping des noms de collection vers leurs identifiants
    const collectionMapping = {
      "Sahih al-Bukhari": "bukhari",
      "Sahih Muslim": "muslim",
      "Sunan an-Nasa'i": "nasai",
      "Sunan Abi Dawud": "abudawud",
      "Jami at-Tirmidhi": "tirmidhi",
      "Sunan Ibn Majah": "ibnmajah"
    };

    const collectionKey = collectionMapping[collection.name] || collection.key;

    navigation.navigate('CollectionBooks', {
      collectionKey,
      collectionName: collection.name,
      totalBooks: collection.totalBooks
    });
  };

  if (loading) {
    return (
      <LinearGradient colors={GRADIENTS.primary} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.textPrimary} />
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient colors={GRADIENTS.primary} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <CustomText color={COLORS.error} style={{ marginBottom: SPACING.md }}>
          {error}
        </CustomText>
        <TouchableOpacity
          onPress={handleRefresh}
          style={{
            backgroundColor: COLORS.buttonBg,
            padding: SPACING.sm,
            borderRadius: BORDER_RADIUS.md,
          }}>
          <CustomText color={COLORS.textPrimary}>Réessayer</CustomText>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={GRADIENTS.primary} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          style={{ flex: 1 }}>
          <View style={{ padding: SPACING.md }}>
            {/* Header */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: SPACING.xl,
            }}>
              <View>
                <CustomText size="2xl" weight="bold" color={COLORS.textPrimary}>
                  Hadiths
                </CustomText>
                <CustomText size="sm" color={COLORS.textSecondary}>
                  Explorez les traditions prophétiques
                </CustomText>
              </View>
              <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('SearchHadith')}
                  style={{
                    padding: SPACING.xs,
                    backgroundColor: COLORS.buttonBg,
                    borderRadius: BORDER_RADIUS.full,
                  }}>
                  <Search size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => navigation.navigate('HadithSettings')}
                  style={{
                    padding: SPACING.xs,
                    backgroundColor: COLORS.buttonBg,
                    borderRadius: BORDER_RADIUS.full,
                  }}>
                  <Filter size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Hadith du jour */}
            {featuredHadith && (
              <View
                style={{
                  backgroundColor: COLORS.cardBackground,
                  borderRadius: BORDER_RADIUS.lg,
                  padding: SPACING.lg,
                  marginBottom: SPACING.xl,
                  ...SHADOWS.lg,
                }}>
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: SPACING.md,
                }}>
                  <View>
                    <CustomText size="lg" weight="bold" color={COLORS.textPrimary}>
                      Hadith du jour
                    </CustomText>
                    <CustomText size="sm" color={COLORS.textSecondary}>
                      {featuredHadith.reference}
                    </CustomText>
                  </View>
                  <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
                    <TouchableOpacity
                      onPress={refreshFeaturedHadith}
                      style={{
                        padding: SPACING.xs,
                        backgroundColor: COLORS.buttonBg,
                        borderRadius: BORDER_RADIUS.full,
                      }}>
                      <RefreshCw size={20} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => toggleFavorite(featuredHadith)}
                      style={{
                        padding: SPACING.xs,
                        backgroundColor: COLORS.buttonBg,
                        borderRadius: BORDER_RADIUS.full,
                      }}>
                      <Heart
                        size={20}
                        color={isFavorite(featuredHadith) ? COLORS.primary : COLORS.textPrimary}
                        fill={isFavorite(featuredHadith) ? COLORS.primary : 'none'}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                <CustomText
                  color={COLORS.textSecondary}
                  style={{ marginBottom: SPACING.md }}
                  numberOfLines={3}>
                  {featuredHadith.hadith}
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
                    {featuredHadith.narrator}
                  </CustomText>
                </View>
              </View>
            )}

            {/* Collections de Hadiths */}
            <View style={{ marginBottom: SPACING.xl }}>
              <CustomText size="xl" weight="bold" color={COLORS.textPrimary} style={{ marginBottom: SPACING.md }}>
                Collections
              </CustomText>
              {collections.map((collection) => (
                <TouchableOpacity
                  key={collection.key}
                  onPress={() => handleCollectionPress(collection)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: COLORS.cardBackground,
                    borderRadius: BORDER_RADIUS.md,
                    padding: SPACING.md,
                    marginBottom: SPACING.sm,
                    ...SHADOWS.sm,
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
                    <BookOpen size={20} color={COLORS.textPrimary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <CustomText weight="bold" color={COLORS.textPrimary}>
                      {collection.name}
                    </CustomText>

                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <CustomText size="sm" color={COLORS.textSecondary}>
                      {collection.totalHadith} hadiths
                    </CustomText>
                    <CustomText size="xs" color={COLORS.textSecondary}>
                      {collection.totalBooks} livres
                    </CustomText>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
