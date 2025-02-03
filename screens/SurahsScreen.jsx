import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { FlatList, ActivityIndicator, View, Text, TouchableOpacity } from 'react-native';

export default function SurahsScreen({ route, navigation }) {
  const { edition } = route.params;
  const [surahs, setSurahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSurahs = async () => {
      try {
        const response = await axios.get('https://api.alquran.cloud/v1/surah');
        setSurahs(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching surahs:', error);
        setError('Erreur lors du chargement des sourates. Veuillez réessayer.');
        setLoading(false);
      }
    };

    fetchSurahs();
  }, [edition]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500">{error}</Text>
      </View>
    );
  }

  const renderSurah = ({ item }) => {
    const audioUrl = `https://cdn.islamic.network/quran/audio-surah/128/${edition}/${item.number}.mp3`;

    return (
      <View className="m-2 p-4 rounded-lg bg-gray-200">
        <Text className="text-lg font-bold">
          {item.number}. {item.englishName}
        </Text>
        <Text className="text-gray-600">{item.englishNameTranslation}</Text>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('Player', {
              audioUrl,
              surahName: item.englishName,
              surahNumber: item.number,
            });
          }}
          className="mt-2 p-2 bg-blue-500 rounded-lg">
          <Text className="text-white text-center">Écouter</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={surahs}
        renderItem={renderSurah}
        keyExtractor={(item) => item.number.toString()}
      />
    </View>
  );
}