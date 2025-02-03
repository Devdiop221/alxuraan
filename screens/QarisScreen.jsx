import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { FlatList, ActivityIndicator, View, Text, TouchableOpacity } from 'react-native';

export default function QarisScreen({ navigation }) {
  const [qaris, setQaris] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQaris = async () => {
      try {
        const response = await axios.get(
          'https://raw.githubusercontent.com/islamic-network/cdn/master/info/cdn_surah_audio.json'
        );
        setQaris(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching qaris:', error);
        setError('Erreur lors du chargement des récitateurs. Veuillez réessayer.');
        setLoading(false);
      }
    };

    fetchQaris();
  }, []);

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

  const renderQari = ({ item }) => (
    <View className="m-2 p-4 rounded-lg bg-gray-200">
      <Text className="text-lg font-bold">{item.name}</Text>
      <Text className="text-gray-600">{item.language}</Text>
      <TouchableOpacity
        onPress={() => navigation.navigate('Surahs', { edition: item.identifier })}
        className="mt-2 p-2 bg-blue-500 rounded-lg">
        <Text className="text-white text-center">Voir les sourates</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      <FlatList data={qaris} renderItem={renderQari} keyExtractor={(item) => item.identifier} />
    </View>
  );
}