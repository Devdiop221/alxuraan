import { Search, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { FlatList, ActivityIndicator, View, Text, TextInput, TouchableOpacity } from 'react-native';

import { useTheme } from '../context/ThemeContext';
import { getSuraNames } from '../services/quranService';

const PAGE_SIZE = 10;

export default function QuranScreen({ navigation }) {
  const { theme } = useTheme();
  const [sourates, setSourates] = useState([]);
  const [filteredSourates, setFilteredSourates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [suraNames, setSuraNames] = useState([]);

  useEffect(() => {
    const loadSuraNames = async () => {
      const names = await getSuraNames();
      setSuraNames(names);
    };
    loadSuraNames();
  }, []);

  const loadSourates = async () => {
    if (loading || sourates.length >= 114) return;
    setLoading(true);

    const startIndex = (page - 1) * PAGE_SIZE + 1;
    const endIndex = Math.min(startIndex + PAGE_SIZE - 1, 114);

    const newSourates = [];
    for (let suraNumber = startIndex; suraNumber <= endIndex; suraNumber++) {
      const suraName = suraNames.find((s) => s.id === suraNumber);
      newSourates.push({
        id: suraNumber,
        name_ar: suraName?.name_ar || `Sourate ${suraNumber}`,
        name_fr: suraName?.name_fr || `Sourate ${suraNumber}`,
        verses: suraNumber === 1 ? 7 : 286,
      });
    }

    setSourates((prev) => [...prev, ...newSourates]);
    setFilteredSourates((prev) => [...prev, ...newSourates]);
    setPage((prev) => prev + 1);
    setLoading(false);
  };

  useEffect(() => {
    if (suraNames.length > 0) {
      loadSourates();
    }
  }, [suraNames]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = sourates.filter((sura) =>
        sura.name_fr.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSourates(filtered);
    } else {
      setFilteredSourates(sourates);
    }
  }, [searchQuery, sourates]);

  const handleSuraPress = (sura) => {
    navigation.navigate('SourateDetail', {
      suraNumber: sura.id,
      suraNameAr: sura.name_ar,
      suraNameFr: sura.name_fr,
    });
  };

  return (
    <View className={`flex-1 p-4 ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}>
      <View className="flex-row items-center bg-gray-200 rounded-lg p-2 mb-4">
        <Search size={20} color={theme === 'dark' ? '#fff' : '#000'} />
        <TextInput
          placeholder="Rechercher une sourate..."
          placeholderTextColor={theme === 'dark' ? '#9ca3af' : '#6b7280'}
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="flex-1 ml-2"
          style={{ color: theme === 'dark' ? '#fff' : '#000' }}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} className="p-2">
            <X size={20} color={theme === 'dark' ? '#fff' : '#000'} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredSourates}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleSuraPress(item)}
            className={`p-4 mb-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <View>
              <Text className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                {item.id}. {item.name_fr} ({item.name_ar})
              </Text>
              <Text className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {item.verses} versets
              </Text>
            </View>
          </TouchableOpacity>
        )}
        onEndReached={loadSourates}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading ? <ActivityIndicator size="large" /> : null}
      />
    </View>
  );
}