import { Search, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { FlatList, View, TextInput, TouchableOpacity, SafeAreaView } from 'react-native';

import { Colors } from '../components/ui/Colors';
import { CustomLoadingIndicator } from '../components/ui/LoadingIndicator';
import { CustomText } from '../components/ui/Typography';
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
    <SafeAreaView
      style={{
        flex: 1,
        padding: 16,
        backgroundColor: theme === 'dark' ? Colors.background : Colors.background,
      }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: Colors.gray200,
          borderRadius: 8,
          padding: 8,
          marginBottom: 16,
        }}>
        <Search size={20} color={theme === 'dark' ? Colors.white : Colors.black} />
        <TextInput
          placeholder="Rechercher une sourate..."
          placeholderTextColor={theme === 'dark' ? Colors.gray400 : Colors.gray600}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={{ flex: 1, marginLeft: 8, color: theme === 'dark' ? Colors.white : Colors.black }}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 8 }}>
            <X size={20} color={theme === 'dark' ? Colors.white : Colors.black} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredSourates}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleSuraPress(item)}
            style={{
              padding: 16,
              marginBottom: 8,
              borderRadius: 8,
              backgroundColor: theme === 'dark' ? Colors.gray700 : Colors.gray200,
            }}>
            <View>
              <CustomText
                size="lg"
                weight="bold"
                color={theme === 'dark' ? Colors.white : Colors.black}>
                {item.id}. {item.name_fr} ({item.name_ar})
              </CustomText>
              <CustomText size="sm" color={theme === 'dark' ? Colors.gray400 : Colors.gray600}>
                {item.verses} versets
              </CustomText>
            </View>
          </TouchableOpacity>
        )}
        onEndReached={loadSourates}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading ? <CustomLoadingIndicator /> : null}
      />
    </SafeAreaView>
  );
}
