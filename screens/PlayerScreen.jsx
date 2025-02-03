import { MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Alert, Text, View, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';

export default function PlayerScreen({ route }) {
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
        setError("Erreur lors du chargement de l'audio. Veuillez réessayer.");
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

  return (
    <View className="flex-1 justify-center items-center p-5">
      <Text className="text-2xl font-bold mb-2">{surahName}</Text>
      <Text className="text-lg mb-5">Sourate {surahNumber}</Text>

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

      <View className="flex-row justify-between w-full">
        <Text>{formatTime(position)}</Text>
        <Text>{formatTime(duration)}</Text>
      </View>

      <TouchableOpacity onPress={playPauseAudio} className="mt-5 p-3 bg-blue-500 rounded-lg flex-row items-center">
        <MaterialIcons name={isPlaying ? 'pause' : 'play-arrow'} size={24} color="white" />
        <Text className="text-black ml-2">{isPlaying ? 'Pause' : 'Lecture'}</Text>
      </TouchableOpacity>
    </View>
  );
}