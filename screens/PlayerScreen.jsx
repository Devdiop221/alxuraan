import { MaterialIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';
import React, { useState, useEffect } from 'react';
import { Alert, SafeAreaView, View } from 'react-native';

import { CustomButton } from '../components/ui/Button';
import { Colors } from '../components/ui/Colors';
import { CustomLoadingIndicator } from '../components/ui/LoadingIndicator';
import { CustomText } from '../components/ui/Typography';

export default function PlayerScreen({ route, navigation }) {
  const { audioUrl, surahName, surahNumber } = route.params;
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAudio = async () => {
      if (!audioUrl) {
        setError('URL audio invalide');
        setLoading(false);
        return;
      }

      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
        });

        const { sound: audioSound, status } = await Audio.Sound.createAsync(
          { uri: audioUrl },
          { shouldPlay: false },
          onPlaybackStatusUpdate
        );

        setSound(audioSound);
        setDuration(status.durationMillis || 0);
        setLoading(false);
      } catch (error) {
        console.error('Error loading audio:', error);
        if (error.code === -1100) {
          setError(
            "L'URL audio n'a pas été trouvée sur le serveur. Veuillez vérifier l'URL et réessayer."
          );
        } else {
          setError("Erreur lors du chargement de l'audio. Veuillez réessayer.");
        }
        setLoading(false);
      }
    };

    loadAudio();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [audioUrl]);

  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setIsPlaying(status.isPlaying);

      if (status.didJustFinish) {
        setIsPlaying(false);
      }
    }
  };

  const playPauseAudio = async () => {
    if (!sound) {
      Alert.alert('Erreur', "Le lecteur audio n'est pas prêt.");
      return;
    }

    try {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    } catch (error) {
      console.error('Error playing/pausing audio:', error);
      setError("Erreur lors de la lecture de l'audio.");
    }
  };

  const formatTime = (millis) => {
    if (!millis) return '00:00';
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

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

  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: Colors.background,
      }}>
      <CustomText size="2xl" weight="bold" style={{ marginBottom: 10 }}>
        {surahName}
      </CustomText>
      <CustomText size="lg" style={{ marginBottom: 20 }}>
        Sourate {surahNumber}
      </CustomText>

      <Slider
        value={position}
        maximumValue={duration}
        onValueChange={(value) => {
          if (sound) {
            sound.setPositionAsync(value);
          }
        }}
        style={{ width: '100%', marginBottom: 20 }}
      />

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
        <CustomText>{formatTime(position)}</CustomText>
        <CustomText>{formatTime(duration)}</CustomText>
      </View>

      <CustomButton
        onPress={playPauseAudio}
        variant="primary"
        style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center' }}>
        <MaterialIcons name={isPlaying ? 'pause' : 'play-arrow'} size={24} color="white" />
        <CustomText size="md" style={{ marginLeft: 10 }}>
          {isPlaying ? 'Pause' : 'Lecture'}
        </CustomText>
      </CustomButton>
    </SafeAreaView>
  );
}
