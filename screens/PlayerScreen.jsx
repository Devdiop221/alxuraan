import { MaterialIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';
import React, { useState, useEffect, useRef } from 'react';
import { Alert, SafeAreaView, View, StyleSheet, Animated, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { CustomButton } from '../components/ui/Button';
import { Colors } from '../components/ui/Colors';
import { CustomLoadingIndicator } from '../components/ui/LoadingIndicator';
import { CustomText } from '../components/ui/Typography';

const { width } = Dimensions.get('window');

export default function PlayerScreen({ route, navigation }) {
  const { audioUrl, surahName, surahNumber } = route.params;
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

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

        // Démarrer l'animation après le chargement
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }),
        ]).start();
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
      <View style={styles.errorContainer}>
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
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#4FACFE', '#00F2FE']}
        style={styles.gradient}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}>
              <MaterialIcons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <CustomText size="2xl" weight="bold" style={styles.title}>
              {surahName}
            </CustomText>
            <CustomText size="lg" style={styles.subtitle}>
              Sourate {surahNumber}
            </CustomText>
          </View>

          <View style={styles.playerContainer}>
            <View style={styles.progressContainer}>
              <Slider
                value={position}
                maximumValue={duration}
                onValueChange={(value) => {
                  if (sound) {
                    sound.setPositionAsync(value);
                  }
                }}
                style={styles.slider}
                minimumTrackTintColor="#FFFFFF"
                maximumTrackTintColor="rgba(255,255,255,0.3)"
                thumbTintColor="#FFFFFF"
              />
              <View style={styles.timeContainer}>
                <CustomText style={styles.timeText}>{formatTime(position)}</CustomText>
                <CustomText style={styles.timeText}>{formatTime(duration)}</CustomText>
              </View>
            </View>

            <TouchableOpacity
              style={styles.playButton}
              onPress={playPauseAudio}>
              <MaterialIcons
                name={isPlaying ? 'pause' : 'play-arrow'}
                size={32}
                color="#4FACFE"
              />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 8,
  },
  title: {
    color: 'white',
    marginTop: 40,
    marginBottom: 8,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
  },
  playerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    width: '100%',
    marginBottom: 40,
  },
  slider: {
    width: '100%',
    height: 40,
    marginBottom: 10,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  timeText: {
    color: 'white',
    fontSize: 14,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 16,
  },
});
