import React, { useState, useEffect, useRef } from 'react';
import { View, FlatList, SafeAreaView, TouchableOpacity, TextInput, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Mic, ChevronRight, Search, X } from 'lucide-react-native';
import axios from 'axios';

import { CustomLoadingIndicator } from '../components/ui/LoadingIndicator';
import { CustomText } from '../components/ui/Typography';
import { COLORS, SPACING, BORDER_RADIUS, GRADIENTS, SHADOWS } from '../components/ui/Theme';

const { width } = Dimensions.get('window');

// Fonction pour normaliser le texte (enlever les accents et mettre en minuscule)
const normalizeText = (text) => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

// Fonction pour calculer la pertinence d'un résultat
const calculateRelevance = (item, searchTerms) => {
  let score = 0;
  const normalizedName = normalizeText(item.name);
  const normalizedLanguage = normalizeText(item.language);

  searchTerms.forEach(term => {
    // Correspondance exacte du nom
    if (normalizedName.includes(term)) {
      score += 3;
      // Bonus si le terme est au début du nom
      if (normalizedName.startsWith(term)) {
        score += 2;
      }
    }

    // Correspondance de la langue
    if (normalizedLanguage.includes(term)) {
      score += 2;
    }

    // Correspondance partielle du nom
    if (term.length > 2 && normalizedName.split(' ').some(word => word.startsWith(term))) {
      score += 1;
    }
  });

  return score;
};

export default function QarisScreen({ navigation }) {
  const [qaris, setQaris] = useState([]);
  const [filteredQaris, setFilteredQaris] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const searchInputRef = useRef(null);

  useEffect(() => {
    const fetchQaris = async () => {
      try {
        const response = await axios.get(
          'https://raw.githubusercontent.com/islamic-network/cdn/master/info/cdn_surah_audio.json'
        );
        setQaris(response.data);
        setFilteredQaris(response.data);
        setLoading(false);

        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]).start();
      } catch (error) {
        console.error('Error fetching qaris:', error);
        setError(
          error.response?.status === 404
            ? "L'URL audio n'a pas été trouvée sur le serveur. Veuillez vérifier l'URL et réessayer."
            : 'Erreur lors du chargement des récitateurs. Veuillez réessayer.'
        );
        setLoading(false);
      }
    };

    fetchQaris();
  }, []);

  const handleSearch = (text) => {
    setSearchQuery(text);

    if (!text.trim()) {
      setFilteredQaris(qaris);
      return;
    }

    // Diviser la recherche en termes et les normaliser
    const searchTerms = normalizeText(text)
      .split(' ')
      .filter(term => term.length > 0);

    // Filtrer et trier les résultats par pertinence
    const results = qaris
      .map(qari => ({
        ...qari,
        relevance: calculateRelevance(qari, searchTerms)
      }))
      .filter(qari => qari.relevance > 0)
      .sort((a, b) => b.relevance - a.relevance)
      .map(({ relevance, ...qari }) => qari);

    setFilteredQaris(results);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setFilteredQaris(qaris);
    searchInputRef.current?.focus();
  };

  const renderHeader = () => (
    <View style={{
      padding: SPACING.md,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.divider,
      marginBottom: SPACING.md,
    }}>
      <CustomText size="2xl" weight="bold" color={COLORS.textPrimary} style={{ marginBottom: SPACING.md }}>
        Récitateurs
      </CustomText>

      <View style={{
        flexDirection: 'row',
        gap: SPACING.sm,
        marginBottom: SPACING.sm,
      }}>
        <View style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: COLORS.searchBg,
          borderRadius: BORDER_RADIUS.md,
          paddingHorizontal: SPACING.sm,
        }}>
          <Search size={20} color={COLORS.textSecondary} style={{ marginRight: SPACING.sm }} />
          <TextInput
            ref={searchInputRef}
            placeholder="Rechercher un récitateur..."
            placeholderTextColor={COLORS.textSecondary}
            value={searchQuery}
            onChangeText={handleSearch}
            autoFocus={false}
            style={{
              flex: 1,
              height: 44,
              color: COLORS.textPrimary,
              fontSize: SPACING.base,
            }}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={clearSearch}
              style={{
                padding: SPACING.xs,
              }}>
              <X size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <CustomText color={COLORS.textSecondary}>
        {filteredQaris.length} récitateurs disponibles
      </CustomText>
    </View>
  );

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
          {renderHeader()}
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
              {error}
            </CustomText>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{
                backgroundColor: COLORS.buttonBg,
                padding: SPACING.md,
                borderRadius: BORDER_RADIUS.md,
              }}>
              <CustomText color={COLORS.textPrimary}>Retour</CustomText>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={GRADIENTS.primary} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <FlatList
          data={filteredQaris}
          ListHeaderComponent={renderHeader}
          renderItem={({ item, index }) => (
            <Animated.View
              style={{
                marginHorizontal: SPACING.md,
                marginBottom: SPACING.sm,
                opacity: fadeAnim,
                transform: [{
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, index * 20]
                  })
                }]
              }}>
              <TouchableOpacity
                onPress={() => navigation.navigate('Surahs', { edition: item.identifier })}
                style={{
                  transform: [{ scale: 0.98 }],
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
                  }}>
                    <View style={{
                      width: 48,
                      height: 48,
                      borderRadius: BORDER_RADIUS.full,
                      backgroundColor: COLORS.buttonBg,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: SPACING.md,
                    }}>
                      <Mic size={24} color={COLORS.textPrimary} />
                    </View>

                    <View style={{ flex: 1 }}>
                      <CustomText
                        size="lg"
                        weight="bold"
                        color={COLORS.textPrimary}
                        style={{ marginBottom: SPACING.xs }}>
                        {item.name}
                      </CustomText>
                      <CustomText
                        size="sm"
                        color={COLORS.textSecondary}>
                        {item.language}
                      </CustomText>
                    </View>

                    <ChevronRight size={24} color={COLORS.textSecondary} />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          )}
          keyExtractor={(item) => item.identifier}
          contentContainerStyle={{ paddingBottom: SPACING.md }}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}
