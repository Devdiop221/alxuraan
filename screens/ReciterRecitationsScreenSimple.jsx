import React, { useState, useEffect } from 'react';
import { View, SafeAreaView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft } from 'lucide-react-native';

import { CustomLoadingIndicator } from '../components/ui/LoadingIndicator';
import { CustomText } from '../components/ui/Typography';
import { COLORS, SPACING, BORDER_RADIUS, GRADIENTS } from '../components/ui/Theme';
import { quranService } from '../services/alxuraanService';
import RecitationsList from '../components/RecitationsList';

export default function ReciterRecitationsScreenSimple({ navigation, route }) {
  // Vérification de sécurité pour les paramètres
  const params = route?.params || {};
  const { reciter, apiSource = 'mp3quran' } = params;

  const [recitations, setRecitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Vérification de sécurité pour le récitateur
  if (!reciter) {
    return (
      <LinearGradient colors={GRADIENTS.primary} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.md }}>
          <CustomText color={COLORS.error} size="lg" style={{ textAlign: 'center', marginBottom: SPACING.md }}>
            Récitateur non trouvé
          </CustomText>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              backgroundColor: COLORS.primary,
              paddingHorizontal: SPACING.lg,
              paddingVertical: SPACING.md,
              borderRadius: BORDER_RADIUS.md,
            }}>
            <CustomText color={COLORS.white} weight="bold">
              Retour
            </CustomText>
          </TouchableOpacity>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  useEffect(() => {
    fetchRecitations();
  }, []);

  const fetchRecitations = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer les sourates avec vérification de sécurité
      const surahsData = await quranService.getSurahs();

      // Vérification de sécurité pour les données des sourates
      if (!surahsData || !Array.isArray(surahsData)) {
        console.error('Données des sourates invalides:', surahsData);
        throw new Error('Données des sourates invalides');
      }

      if (surahsData.length === 0) {
        console.warn('Aucune sourate trouvée');
        setRecitations([]);
        return;
      }

      if (apiSource === 'quranfoundation') {
        // Pour Quran Foundation, créer une liste basée sur les sourates
        const recitationsList = surahsData.map(surah => {
          // Vérification de sécurité pour chaque sourate
          if (!surah || typeof surah !== 'object') {
            console.warn('Sourate invalide:', surah);
            return null;
          }

          return {
            id: surah.number || Math.random(),
            name: `${surah.englishName || 'Sourate'} (${surah.name || 'غير معروف'})`,
            arabicName: surah.name || 'غير معروف',
            englishName: surah.englishName || 'Unknown',
            surahNumber: surah.number || 1,
            versesCount: surah.numberOfAyahs || 0,
            audioUrl: null, // Sera généré dynamiquement
            duration: null,
            source: 'quranfoundation'
          };
        }).filter(Boolean); // Filtrer les éléments null

        setRecitations(recitationsList);
      } else {
        // Pour MP3Quran, utiliser les moshaf du récitateur
        if (reciter && reciter.moshaf && Array.isArray(reciter.moshaf) && reciter.moshaf.length > 0) {
          const moshaf = reciter.moshaf[0]; // Prendre la première récitation

          // Vérification de sécurité pour le moshaf
          if (!moshaf || !moshaf.server) {
            console.error('Moshaf invalide:', moshaf);
            throw new Error('Configuration de récitation invalide');
          }

          const recitationsList = surahsData.map(surah => {
            // Vérification de sécurité pour chaque sourate
            if (!surah || typeof surah !== 'object') {
              console.warn('Sourate invalide:', surah);
              return null;
            }

            return {
              id: `${moshaf.id || 'unknown'}_${surah.number || Math.random()}`,
              name: `${surah.englishName || 'Sourate'} (${surah.name || 'غير معروف'})`,
              arabicName: surah.name || 'غير معروف',
              englishName: surah.englishName || 'Unknown',
              surahNumber: surah.number || 1,
              versesCount: surah.numberOfAyahs || 0,
              audioUrl: `${moshaf.server}${(surah.number || 1).toString().padStart(3, '0')}.mp3`,
              duration: null,
              source: 'mp3quran'
            };
          }).filter(Boolean); // Filtrer les éléments null

          setRecitations(recitationsList);
        } else {
          console.error('Récitateur sans moshaf valide:', reciter);
          throw new Error('Aucune récitation disponible pour ce récitateur');
        }
      }

    } catch (error) {
      console.error('Error fetching recitations:', error);
      setError(error.message || 'Erreur lors du chargement des récitations');
      setRecitations([]); // S'assurer que recitations est un tableau vide
    } finally {
      setLoading(false);
    }
  };

  const handleRecitationPress = (recitation) => {
    console.log('Récitation sélectionnée:', recitation.name);
    // Optionnel: navigation vers un écran de détail
  };

  if (loading) {
    return (
      <LinearGradient colors={GRADIENTS.primary} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <CustomLoadingIndicator size="large" />
          <CustomText color={COLORS.textSecondary} style={{ marginTop: SPACING.md }}>
            Chargement des récitations...
          </CustomText>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient colors={GRADIENTS.primary} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.md }}>
          <CustomText color={COLORS.error} size="lg" style={{ textAlign: 'center', marginBottom: SPACING.md }}>
            {error}
          </CustomText>
          <TouchableOpacity
            onPress={fetchRecitations}
            style={{
              backgroundColor: COLORS.primary,
              paddingHorizontal: SPACING.lg,
              paddingVertical: SPACING.md,
              borderRadius: BORDER_RADIUS.md,
            }}>
            <CustomText color={COLORS.white} weight="bold">
              Réessayer
            </CustomText>
          </TouchableOpacity>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={GRADIENTS.primary} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: SPACING.md,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.divider,
        }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              width: 40,
              height: 40,
              borderRadius: BORDER_RADIUS.full,
              backgroundColor: COLORS.buttonBg,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: SPACING.md,
            }}>
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <CustomText size="xl" weight="bold" color={COLORS.textPrimary}>
              {reciter.name || reciter.reciter_name}
            </CustomText>
            <CustomText size="sm" color={COLORS.textSecondary}>
              {recitations.length} récitations • {apiSource === 'quranfoundation' ? 'Quran Foundation' : 'MP3Quran'}
            </CustomText>
          </View>
        </View>

        {/* Liste des récitations */}
        <RecitationsList
          recitations={recitations}
          reciter={reciter}
          apiSource={apiSource}
          onRecitationPress={handleRecitationPress}
          style={{ flex: 1 }}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}