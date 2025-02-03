import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { View, FlatList, SafeAreaView } from 'react-native';

// Importation des composants personnalisés
import { CustomButton } from '../components/ui/Button';
import { CustomCard } from '../components/ui/Card';
import { Colors } from '../components/ui/Colors';
import { CustomLoadingIndicator } from '../components/ui/LoadingIndicator';
import { CustomText } from '../components/ui/Typography';

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
        if (error.response && error.response.status === 404) {
          setError(
            "L'URL audio n'a pas été trouvée sur le serveur. Veuillez vérifier l'URL et réessayer."
          );
        } else {
          setError('Erreur lors du chargement des récitateurs. Veuillez réessayer.');
        }
        setLoading(false);
      }
    };

    fetchQaris();
  }, []);

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

  const renderQari = ({ item }) => (
    <CustomCard
      style={{
        marginVertical: 10,
        marginHorizontal: 15,
      }}>
      <CustomText size="lg" weight="bold" style={{ marginBottom: 5 }}>
        {item.name}
      </CustomText>

      <CustomText size="md" color="textSecondary" style={{ marginBottom: 10 }}>
        {item.language}
      </CustomText>

      <CustomButton
        onPress={() => navigation.navigate('Surahs', { edition: item.identifier })}
        variant="primary">
        Voir les sourates
      </CustomButton>
    </CustomCard>
  );

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: Colors.background,
      }}>
      <FlatList
        data={qaris}
        renderItem={renderQari}
        keyExtractor={(item) => item.identifier}
        contentContainerStyle={{
          paddingTop: 10,
          paddingBottom: 20,
        }}
      />
    </SafeAreaView>
  );
}
