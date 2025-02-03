import { YStack, Text, Button } from 'tamagui';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';

import { useTheme } from '../context/ThemeContext';
import { getAyaTranslation } from '../services/quranService';
import useStore from '../store/store';

export default function AyaDetailScreen({ route }) {
  const { suraNumber, ayaNumber } = route.params;
  const { theme } = useTheme();
  const [aya, setAya] = useState(null);
  const [loading, setLoading] = useState(true);
  const { favorites, addFavorite, removeFavorite } = useStore();

  useEffect(() => {
    const loadAya = async () => {
      const data = await getAyaTranslation(suraNumber, ayaNumber);
      setAya(data);
      setLoading(false);
    };
    loadAya();
  }, [suraNumber, ayaNumber]);

  const isFavorite = favorites.some(
    (fav) => fav.suraNumber === suraNumber && fav.ayaNumber === ayaNumber
  );

  const handleFavoritePress = () => {
    if (isFavorite) {
      removeFavorite(suraNumber, ayaNumber);
    } else {
      addFavorite({
        suraNumber,
        ayaNumber,
        arabicText: aya.arabic_text,
        translation: aya.translation,
      });
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <YStack flex={1} padding={16} backgroundColor={theme === 'dark' ? '#000' : '#fff'}>
      <Text
        fontSize={24}
        fontWeight="bold"
        marginBottom={16}
        color={theme === 'dark' ? '#fff' : '#000'}>
        Sourate {suraNumber}, Verset {ayaNumber}
      </Text>
      {aya && (
        <YStack>
          <Text
            fontSize={24}
            textAlign="right"
            marginBottom={16}
            color={theme === 'dark' ? '#fff' : '#000'}>
            {aya.arabic_text}
          </Text>
          <Text fontSize={18} marginBottom={16} color={theme === 'dark' ? '#fff' : '#000'}>
            {aya.translation}
          </Text>
          <Button
            backgroundColor={isFavorite ? 'red' : 'blue'}
            borderRadius={8}
            padding={16}
            onPress={handleFavoritePress}>
            <Text color="#fff" textAlign="center">
              {isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            </Text>
          </Button>
        </YStack>
      )}
    </YStack>
  );
}
