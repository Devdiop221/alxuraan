import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Music, Volume2, Clock, Play } from 'lucide-react-native';

import { CustomText } from './ui/Typography';
import { COLORS, SPACING, BORDER_RADIUS, GRADIENTS, SHADOWS } from './ui/Theme';
import SimpleAudioControls from './SimpleAudioControls';

export default function RecitationsList({
  recitations = [], // Valeur par défaut pour éviter les erreurs
  reciter,
  apiSource,
  onRecitationPress,
  style
}) {
  const [playingStates, setPlayingStates] = useState({});

  // Vérification de sécurité pour les récitations
  const safeRecitations = Array.isArray(recitations) ? recitations : [];

  const updatePlayingState = (recitationId, state) => {
    setPlayingStates(prev => ({
      ...prev,
      [recitationId]: state
    }));
  };

  const generateAudioUrl = (recitation) => {
    if (apiSource === 'quranfoundation') {
      // Pour Quran Foundation, l'URL sera générée dynamiquement
      return `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${recitation.surahNumber}.mp3`;
    } else {
      // Pour MP3Quran, utiliser l'URL directe
      return recitation.audioUrl;
    }
  };

  const renderRecitation = ({ item, index }) => {
    const playingState = playingStates[item.id] || {};
    const isPlaying = playingState.isPlaying;
    const isLoading = playingState.isLoading;

    return (
      <TouchableOpacity
        onPress={() => onRecitationPress && onRecitationPress(item)}
        style={{
          marginHorizontal: SPACING.md,
          marginBottom: SPACING.sm,
          opacity: isPlaying ? 0.9 : 1
        }}>
        <LinearGradient
          colors={isPlaying ? [COLORS.primary + '20', COLORS.primary + '10'] : GRADIENTS.card}
          style={{
            borderRadius: BORDER_RADIUS.md,
            overflow: 'hidden',
            ...SHADOWS.base,
            borderWidth: isPlaying ? 1 : 0,
            borderColor: isPlaying ? COLORS.primary : 'transparent'
          }}>
          <View style={{
            padding: SPACING.md,
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            {/* Numéro de sourate */}
            <View style={{
              width: 40,
              height: 40,
              borderRadius: BORDER_RADIUS.full,
              backgroundColor: isPlaying ? COLORS.primary : COLORS.buttonBg,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: SPACING.md,
            }}>
              <CustomText
                size="sm"
                weight="bold"
                color={isPlaying ? COLORS.white : COLORS.textPrimary}>
                {item.surahNumber}
              </CustomText>
            </View>

            {/* Informations */}
            <View style={{ flex: 1 }}>
              <CustomText
                size="md"
                weight="bold"
                color={COLORS.textPrimary}
                style={{ marginBottom: SPACING.xs }}
                numberOfLines={1}>
                {item.englishName}
              </CustomText>
              <CustomText
                size="sm"
                color={COLORS.textSecondary}
                style={{ marginBottom: SPACING.xs }}
                numberOfLines={1}>
                {item.arabicName}
              </CustomText>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Volume2 size={12} color={COLORS.textSecondary} />
                <CustomText
                  size="xs"
                  color={COLORS.textSecondary}
                  style={{ marginLeft: SPACING.xs }}>
                  {item.versesCount} versets
                </CustomText>
                {item.duration && (
                  <>
                    <Clock size={12} color={COLORS.textSecondary} style={{ marginLeft: SPACING.sm }} />
                    <CustomText
                      size="xs"
                      color={COLORS.textSecondary}
                      style={{ marginLeft: SPACING.xs }}>
                      {item.duration}
                    </CustomText>
                  </>
                )}
              </View>
            </View>

            {/* Contrôles audio */}
            <SimpleAudioControls
              audioUrl={generateAudioUrl(item)}
              title={item.name}
              onStateChange={(state) => updatePlayingState(item.id, state)}
            />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={safeRecitations}
      renderItem={renderRecitation}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={{ paddingVertical: SPACING.md }}
      showsVerticalScrollIndicator={false}
      style={style}
      ListEmptyComponent={() => (
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: SPACING.xl,
          minHeight: 200
        }}>
          <Music size={64} color={COLORS.textSecondary} />
          <CustomText
            size="lg"
            color={COLORS.textSecondary}
            style={{ textAlign: 'center', marginTop: SPACING.md }}>
            Aucune récitation disponible
          </CustomText>
          <CustomText
            size="sm"
            color={COLORS.textSecondary}
            style={{ textAlign: 'center', marginTop: SPACING.sm }}>
            Vérifiez votre connexion internet
          </CustomText>
        </View>
      )}
      ListHeaderComponent={() => (
        <View style={{
          backgroundColor: COLORS.primary + '10',
          marginHorizontal: SPACING.md,
          marginBottom: SPACING.md,
          padding: SPACING.md,
          borderRadius: BORDER_RADIUS.md,
          flexDirection: 'row',
          alignItems: 'center',
        }}>
          <Play size={20} color={COLORS.primary} />
          <CustomText
            size="sm"
            color={COLORS.primary}
            weight="bold"
            style={{ marginLeft: SPACING.xs, flex: 1 }}>
            Cliquez sur les contrôles pour écouter • {safeRecitations.length} sourates
          </CustomText>
        </View>
      )}
    />
  );
}