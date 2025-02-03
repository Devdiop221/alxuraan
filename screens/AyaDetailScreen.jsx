import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView } from "react-native";

import { useTheme } from '../context/ThemeContext';
import { getAyaTranslation } from '../services/quranService';
import useStore from '../store/store';

// Importation des composants personnalisés
import { CustomButton } from "../components/ui/Button";
import { CustomText } from "../components/ui/Typography";
import { CustomLoadingIndicator } from "../components/ui/LoadingIndicator";
import { Colors } from "../components/ui/Colors";

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
    return <CustomLoadingIndicator />;
  }

  return (
    <SafeAreaView style={{
      flex: 1,
      padding: 16,
      backgroundColor: theme === 'dark' ? Colors.background : Colors.background
    }}>
      <CustomText
        fontSize={24}
        fontWeight="bold"
        marginBottom={16}
        color={theme === 'dark' ? Colors.text : Colors.text}>
        Sourate {suraNumber}, Verset {ayaNumber}
      </CustomText>
      {aya && (
        <View>
          <CustomText
            fontSize={24}
            textAlign="right"
            marginBottom={16}
            color={theme === 'dark' ? Colors.text : Colors.text}>
            {aya.arabic_text}
          </CustomText>
          <CustomText fontSize={18} marginBottom={16} color={theme === 'dark' ? Colors.text : Colors.text}>
            {aya.translation}
          </CustomText>
          <CustomButton
            backgroundColor={isFavorite ? Colors.error : Colors.primary}
            borderRadius={8}
            padding={16}
            onPress={handleFavoritePress}>
            <CustomText color={Colors.background} textAlign="center">
              {isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            </CustomText>
          </CustomButton>
        </View>
      )}
    </SafeAreaView>
  );
}