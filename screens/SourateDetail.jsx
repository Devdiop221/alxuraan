import { Bookmark, Headphones } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ScrollView, View, SafeAreaView } from 'react-native';

import { Colors } from '../components/ui/Colors';
import { CustomLoadingIndicator } from '../components/ui/LoadingIndicator';
import { CustomText } from '../components/ui/Typography';
import { useTheme } from '../context/ThemeContext';
import wolofData from '../data/quran_wolof.json';
import { getSuraTranslation } from '../services/quranService';

// Importation des composants personnalisés

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
    return <CustomLoadingIndicator />;
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: Colors.background,
      }}>
      <ScrollView
        style={{
          flex: 1,
          backgroundColor: theme === 'dark' ? Colors.background : Colors.background,
        }}>
        <View style={{ borderBottomWidth: 1, borderBottomColor: Colors.gray300, padding: 16 }}>
          <CustomText
            size="2xl"
            weight="bold"
            style={{ textAlign: 'center' }}
            color={theme === 'dark' ? Colors.text : Colors.text}>
            {suraName.name_ar} - {suraName.name_fr}
          </CustomText>
          <CustomText
            size="lg"
            style={{ textAlign: 'center' }}
            color={theme === 'dark' ? Colors.gray400 : Colors.gray600}>
            {suraName.name_wo}
          </CustomText>
        </View>

        <View style={{ padding: 16 }}>
          {verses.map((verse, index) => (
            <View
              key={index}
              style={{
                marginBottom: 16,
                padding: 16,
                borderRadius: 8,
                backgroundColor: theme === 'dark' ? Colors.gray700 : Colors.gray200,
                borderWidth: 1,
                borderColor: theme === 'dark' ? Colors.gray600 : Colors.gray300,
              }}>
              <CustomText
                size="xl"
                style={{ textAlign: 'right' }}
                color={theme === 'dark' ? Colors.white : Colors.black}>
                {index + 1}. {verse.arabic_text}
              </CustomText>
              <CustomText
                size="lg"
                style={{ textAlign: 'left' }}
                color={theme === 'dark' ? Colors.gray400 : Colors.gray600}>
                {verse.translation}
              </CustomText>
              <CustomText
                size="base"
                style={{ textAlign: 'left', marginTop: 8 }}
                color={theme === 'dark' ? Colors.gray400 : Colors.gray600}>
                {verse.wolof}
              </CustomText>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
