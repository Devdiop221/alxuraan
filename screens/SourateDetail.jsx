import { Bookmark, Headphones } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ScrollView, ActivityIndicator, View, Text } from 'react-native';

import { useTheme } from '../context/ThemeContext';
import wolofData from '../data/quran_wolof.json';
import { getSuraTranslation } from '../services/quranService';

export default function SourateDetail({ route }) {
  const { suraNumber, suraNameAr, suraNameFr } = route.params;
  const { theme } = useTheme();
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [suraName, setSuraName] = useState({
    name_ar: suraNameAr,
    name_fr: suraNameFr,
    name_wo: '',
  });

  useEffect(() => {
    const loadSura = async () => {
      const data = await getSuraTranslation(suraNumber);
      const wolofSura = wolofData.find((sura) => sura.id === suraNumber);

      const mergedVerses = data.map((verse, index) => ({
        ...verse,
        wolof: wolofSura ? wolofSura.verses[index]?.wolof : '',
      }));

      setSuraName((prev) => ({
        ...prev,
        name_wo: wolofSura?.name || `Sourate ${suraNumber}`,
      }));

      setVerses(mergedVerses);
      setLoading(false);
    };
    loadSura();
  }, [suraNumber]);

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <ScrollView className={`flex-1 ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}>
      <View className="border-b border-gray-300 p-4">
        <Text className={`text-2xl font-bold text-center ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
          {suraName.name_ar} - {suraName.name_fr}
        </Text>
        <Text className={`text-lg text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          {suraName.name_wo}
        </Text>
      </View>

      <View className="p-4">
        {verses.map((verse, index) => (
          <View
            key={index}
            className={`mb-4 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}>
            <Text className={`text-xl text-right ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
              {index + 1}. {verse.arabic_text}
            </Text>
            <Text className={`text-lg text-left ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {verse.translation}
            </Text>
            <Text className={`text-base text-left ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
              {verse.wolof}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}