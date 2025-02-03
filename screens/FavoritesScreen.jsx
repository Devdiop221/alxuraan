import React from 'react';
import { FlatList,  View, Text, TouchableOpacity} from 'react-native';


import { useTheme } from '../context/ThemeContext';
import useStore from '../store/store';

export default function FavoritesScreen({ navigation }) {
  const { theme } = useTheme();
  const { favorites } = useStore();

  const handleAyaPress = (suraNumber, ayaNumber) => {
    navigation.navigate('AyaDetail', { suraNumber, ayaNumber });
  };

  return (
    <View className={`flex-1 p-4 ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}>
      <Text className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
        Mes Favoris
      </Text>
      {favorites.length === 0 ? (
        <Text className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
          Aucun verset favori pour le moment.
        </Text>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => `${item.suraNumber}-${item.ayaNumber}`}
          renderItem={({ item }) => (
            <TouchableOpacity
              className={`rounded-lg p-4 mb-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`}
              onPress={() => handleAyaPress(item.suraNumber, item.ayaNumber)}>
              <Text className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                Sourate {item.suraNumber}, Verset {item.ayaNumber}
              </Text>
              <Text className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {item.arabicText}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}