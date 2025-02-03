import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { FlatList, SafeAreaView, View, Alert } from 'react-native';


import { CustomButton } from '../components/ui/Button';
import { CustomCard } from '../components/ui/Card';
import { Colors } from '../components/ui/Colors';
import { CustomLoadingIndicator } from '../components/ui/LoadingIndicator';
import { CustomText } from '../components/ui/Typography';

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
    return <CustomLoadingIndicator />;
  }

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: Colors.background,
        }}>
        <CustomText color="error" size="lg" weight="bold" style={{ marginBottom: 20 }}>
          {error}
        </CustomText>
        <CustomButton onPress={() => navigation.goBack()} variant="primary">
          Retour
        </CustomButton>
      </View>
    );
  }

  const renderSurah = ({ item }) => {
    const audioUrl = `https://cdn.islamic.network/quran/audio-surah/128/${edition}/${item.number}.mp3`;

    const handleAudioError = (error) => {
      console.error('Error loading audio:', error);
      if (error.code === -1100) {
        Alert.alert(
          'Erreur',
          "L'URL audio n'a pas été trouvée sur le serveur. Veuillez vérifier l'URL et réessayer."
        );
      } else {
        Alert.alert('Erreur', "Erreur lors du chargement de l'audio. Veuillez réessayer.");
      }
    };

    return (
      <CustomCard
        style={{
          marginVertical: 10,
          marginHorizontal: 15,
        }}>
        <CustomText size="lg" weight="bold" style={{ marginBottom: 5 }}>
          {item.number}. {item.englishName}
        </CustomText>

        <CustomText size="md" color="textSecondary" style={{ marginBottom: 10 }}>
          {item.englishNameTranslation}
        </CustomText>

        <CustomButton
          onPress={() => {
            try {
              navigation.navigate('Player', {
                audioUrl,
                surahName: item.englishName,
                surahNumber: item.number,
              });
            } catch (error) {
              handleAudioError(error);
            }
          }}
          variant="primary">
          Écouter
        </CustomButton>
      </CustomCard>
    );
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: Colors.background,
      }}>
      <FlatList
        data={surahs}
        renderItem={renderSurah}
        keyExtractor={(item) => item.number.toString()}
        contentContainerStyle={{
          paddingTop: 10,
          paddingBottom: 20,
        }}
      />
    </SafeAreaView>
  );
}
