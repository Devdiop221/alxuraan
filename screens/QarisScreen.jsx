import React, { useState, useEffect, useRef } from 'react';
import { View, FlatList, SafeAreaView, TouchableOpacity, TextInput, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Mic, ChevronRight, Search, X } from 'lucide-react-native';
import axios from 'axios';

import { CustomLoadingIndicator } from '../components/ui/LoadingIndicator';
import { CustomText } from '../components/ui/Typography';
import { COLORS, SPACING, BORDER_RADIUS, GRADIENTS, SHADOWS } from '../components/ui/Theme';
import { translateReciterName, searchReciters } from '../utils/reciterNames';

const { width } = Dimensions.get('window');

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
        let response;
        let transformedData = [];

        try {
          // Essayer d'abord l'API MP3Quran
          response = await axios.get('https://mp3quran.net/api/v3/reciters');

          if (response.data && response.data.reciters) {
            // Transformer les données pour correspondre au format attendu
            transformedData = response.data.reciters.map(reciter => ({
              identifier: reciter.id.toString(),
              name: translateReciterName(reciter.name), // Traduire le nom
              originalName: reciter.name, // Garder le nom original
              language: 'Arabe',
              moshaf: reciter.moshaf || []
            }));
          }
        } catch (mp3QuranError) {
          console.log('MP3Quran API failed, trying fallback...');

          // Fallback vers une liste statique de récitateurs populaires
          const fallbackReciters = [
            {
              identifier: '1',
              originalName: 'عبد الباسط عبد الصمد',
              language: 'Arabe',
              moshaf: [{
                id: 1,
                name: 'مرتل',
                server: 'https://server8.mp3quran.net/abd_basit/Alafasy_128_kbps/',
              }]
            },
            {
              identifier: '2',
              originalName: 'مشاري بن راشد العفاسي',
              language: 'Arabe',
              moshaf: [{
                id: 2,
                name: 'مرتل',
                server: 'https://server8.mp3quran.net/afs/',
              }]
            },
            {
              identifier: '3',
              originalName: 'ماهر المعيقلي',
              language: 'Arabe',
              moshaf: [{
                id: 3,
                name: 'مرتل',
                server: 'https://server12.mp3quran.net/maher/',
              }]
            },
            {
              identifier: '4',
              originalName: 'سعد الغامدي',
              language: 'Arabe',
              moshaf: [{
                id: 4,
                name: 'مرتل',
                server: 'https://server7.mp3quran.net/s_gmd/',
              }]
            },
            {
              identifier: '5',
              originalName: 'عبد الرحمن السديس',
              language: 'Arabe',
              moshaf: [{
                id: 5,
                name: 'مرتل',
                server: 'https://server11.mp3quran.net/sds/',
              }]
            }
          ];

          // Traduire les noms du fallback
          transformedData = fallbackReciters.map(reciter => ({
            ...reciter,
            name: translateReciterName(reciter.originalName)
          }));
        }

        setQaris(transformedData);
        setFilteredQaris(transformedData);
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
    try {
      setSearchQuery(text);

      if (!text || !text.trim()) {
        setFilteredQaris(qaris);
        return;
      }

      // Vérifier que qaris est un tableau valide
      if (!qaris || !Array.isArray(qaris)) {
        console.warn('Qaris non valide pour la recherche');
        setFilteredQaris([]);
        return;
      }

      // Utiliser la fonction de recherche améliorée
      const results = searchReciters(qaris, text);
      setFilteredQaris(results || []);

    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      // En cas d'erreur, afficher tous les récitateurs
      setFilteredQaris(qaris || []);
    }
  };

  const clearSearch = () => {
    try {
      setSearchQuery('');
      setFilteredQaris(qaris || []);
      searchInputRef.current?.focus();
    } catch (error) {
      console.error('Erreur lors du nettoyage de recherche:', error);
    }
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
                onPress={() => navigation.navigate('ReciterRecitationsSimple', {
                  reciter: item,
                  apiSource: 'mp3quran'
                })}
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
