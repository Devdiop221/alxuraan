import React from 'react';
import { FlatList, View, TouchableOpacity, SafeAreaView } from "react-native";

import { useTheme } from '../context/ThemeContext';
import useStore from '../store/store';

// Importation des composants personnalisés
import { CustomText } from "../components/ui/Typography";
import { Colors } from "../components/ui/Colors";

export default function FavoritesScreen({ navigation }) {
  const { theme } = useTheme();
  const { favorites } = useStore();

  const handleAyaPress = (suraNumber, ayaNumber) => {
    navigation.navigate('AyaDetail', { suraNumber, ayaNumber });
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 16, backgroundColor: theme === 'dark' ? Colors.background : Colors.background }}>
      <CustomText size="2xl" weight="bold" style={{ marginBottom: 16 }} color={theme === 'dark' ? Colors.text : Colors.text}>
        Mes Favoris
      </CustomText>
      {favorites.length === 0 ? (
        <CustomText size="lg" color={theme === 'dark' ? Colors.text : Colors.text}>
          Aucun verset favori pour le moment.
        </CustomText>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => `${item.suraNumber}-${item.ayaNumber}`}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{ borderRadius: 8, padding: 16, marginBottom: 8, backgroundColor: theme === 'dark' ? Colors.gray700 : Colors.gray200 }}
              onPress={() => handleAyaPress(item.suraNumber, item.ayaNumber)}>
              <CustomText size="lg" color={theme === 'dark' ? Colors.white : Colors.black}>
                Sourate {item.suraNumber}, Verset {item.ayaNumber}
              </CustomText>
              <CustomText size="sm" color={theme === 'dark' ? Colors.gray400 : Colors.gray600}>
                {item.arabicText}
              </CustomText>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}