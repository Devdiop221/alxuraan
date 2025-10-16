import React, { useState, useRef, useCallback, useEffect } from 'react';
import { TouchableOpacity, View, Alert } from 'react-native';
import { Audio } from 'expo-av';
import { Play, Pause, Square, Loader } from 'lucide-react-native';

import { COLORS, SPACING } from './ui/Theme';

export default function SimpleAudioControls({
  audioUrl,
  title,
  onStateChange,
  size = 24,
  style
}) {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);
  const mountedRef = useRef(true);
  const statusCheckInterval = useRef(null);

  // Nettoyer le son quand le composant se démonte
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (statusCheckInterval.current) {
        clearInterval(statusCheckInterval.current);
      }
      if (sound) {
        sound.unloadAsync().catch(console.warn);
      }
    };
  }, [sound]);

  // Notifier les changements d'état
  const notifyStateChange = useCallback((newState) => {
    if (onStateChange && mountedRef.current) {
      onStateChange(newState);
    }
  }, [onStateChange]);

  // Configuration audio
  const configureAudio = async () => {
    try {
      if (Audio?.setAudioModeAsync) {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      }
    } catch (error) {
      console.warn('Configuration audio échouée:', error);
    }
  };

  // Vérification périodique du statut (méthode robuste)
  const startStatusCheck = useCallback(() => {
    if (statusCheckInterval.current) {
      clearInterval(statusCheckInterval.current);
    }

    statusCheckInterval.current = setInterval(async () => {
      if (!sound || !mountedRef.current) return;

      try {
        const status = await sound.getStatusAsync();

        if (status.isLoaded) {
          const currentlyPlaying = status.isPlaying || false;

          // Détecter la fin de lecture
          const isFinished = status.didJustFinish ||
                           (status.durationMillis && status.positionMillis &&
                            status.positionMillis >= status.durationMillis - 100); // 100ms de marge

          if (isFinished && !hasFinished) {
            console.log('🎵 Fin de lecture détectée par vérification périodique');
            setHasFinished(true);
            setIsPlaying(false);

            // Arrêter l'interval
            if (statusCheckInterval.current) {
              clearInterval(statusCheckInterval.current);
              statusCheckInterval.current = null;
            }

            notifyStateChange({
              isPlaying: false,
              isLoading: false,
              error: null,
              hasFinished: true
            });
          } else if (currentlyPlaying !== isPlaying) {
            setIsPlaying(currentlyPlaying);
            notifyStateChange({
              isPlaying: currentlyPlaying,
              isLoading: false,
              error: null,
              hasFinished: false
            });
          }
        }
      } catch (error) {
        console.warn('Erreur vérification statut:', error);
      }
    }, 500); // Vérifier toutes les 500ms
  }, [sound, isPlaying, hasFinished, notifyStateChange]);

  // Arrêter la vérification périodique
  const stopStatusCheck = useCallback(() => {
    if (statusCheckInterval.current) {
      clearInterval(statusCheckInterval.current);
      statusCheckInterval.current = null;
    }
  }, []);

  // Callback pour les mises à jour de lecture (backup)
  const onPlaybackStatusUpdate = useCallback((status) => {
    if (!mountedRef.current) return;

    if (status.isLoaded) {
      const playing = status.isPlaying || false;

      // Détecter la fin
      const isFinished = status.didJustFinish ||
                        (status.durationMillis && status.positionMillis &&
                         status.positionMillis >= status.durationMillis - 100);

      if (isFinished && !hasFinished) {
        console.log('🎵 Fin de lecture détectée par callback');
        setHasFinished(true);
        setIsPlaying(false);
        stopStatusCheck();

        notifyStateChange({
          isPlaying: false,
          isLoading: false,
          error: null,
          hasFinished: true
        });
      } else if (playing !== isPlaying && !isFinished) {
        setIsPlaying(playing);
        notifyStateChange({
          isPlaying: playing,
          isLoading: false,
          error: null,
          hasFinished: false
        });
      }
    } else if (status.error) {
      console.error('Erreur de lecture:', status.error);
      setIsPlaying(false);
      setIsLoading(false);
      stopStatusCheck();

      notifyStateChange({
        isPlaying: false,
        isLoading: false,
        error: status.error,
        hasFinished: false
      });
    }
  }, [isPlaying, hasFinished, notifyStateChange, stopStatusCheck]);

  // Jouer l'audio
  const playAudio = async () => {
    try {
      if (!audioUrl) {
        Alert.alert('Erreur', 'URL audio manquante');
        return;
      }

      setIsLoading(true);
      notifyStateChange({ isPlaying: false, isLoading: true, error: null });

      // Configurer l'audio
      await configureAudio();

      // Si le son a fini, le recréer
      if (hasFinished || !sound) {
        // Nettoyer l'ancien son si nécessaire
        if (sound) {
          try {
            await sound.unloadAsync();
          } catch (error) {
            console.warn('Erreur nettoyage ancien son:', error);
          }
        }

        // Créer un nouveau son
        console.log('🎵 Chargement audio:', audioUrl);

        if (!Audio?.Sound?.createAsync) {
          throw new Error('Expo AV non disponible');
        }

        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: audioUrl },
          { shouldPlay: true }
        );

        // Attacher le callback
        await newSound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);

        if (mountedRef.current) {
          setSound(newSound);
          setIsPlaying(true);
          setHasFinished(false);
          startStatusCheck();

          notifyStateChange({
            isPlaying: true,
            isLoading: false,
            error: null,
            hasFinished: false
          });
        }
      } else {
        // Reprendre le son existant
        await sound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
        await sound.playAsync();

        if (mountedRef.current) {
          setIsPlaying(true);
          setHasFinished(false);
          startStatusCheck();

          notifyStateChange({
            isPlaying: true,
            isLoading: false,
            error: null,
            hasFinished: false
          });
        }
      }

    } catch (error) {
      console.error('❌ Erreur lecture audio:', error);

      if (mountedRef.current) {
        setIsLoading(false);
        setIsPlaying(false);
        stopStatusCheck();

        notifyStateChange({
          isPlaying: false,
          isLoading: false,
          error: error.message || 'Erreur de lecture',
          hasFinished: false
        });
      }

      Alert.alert(
        'Erreur de lecture',
        'Impossible de lire ce fichier audio. Vérifiez votre connexion internet.'
      );
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  // Mettre en pause
  const pauseAudio = async () => {
    try {
      if (sound) {
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          await sound.pauseAsync();
          setIsPlaying(false);
          stopStatusCheck();

          notifyStateChange({
            isPlaying: false,
            isLoading: false,
            error: null,
            hasFinished: false
          });
        }
      }
    } catch (error) {
      console.error('Erreur pause:', error);
    }
  };

  // Arrêter complètement
  const stopAudio = async () => {
    try {
      console.log('🛑 Arrêt manuel du son...');

      stopStatusCheck();

      if (sound) {
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          // Supprimer le callback d'abord
          await sound.setOnPlaybackStatusUpdate(null);
          await sound.stopAsync();
          await sound.unloadAsync();
        }

        if (mountedRef.current) {
          setSound(null);
          setIsPlaying(false);
          setHasFinished(false);

          notifyStateChange({
            isPlaying: false,
            isLoading: false,
            error: null,
            hasFinished: false
          });

          console.log('✅ Son arrêté et nettoyé manuellement');
        }
      }
    } catch (error) {
      console.error('Erreur arrêt:', error);
      // Forcer le nettoyage même en cas d'erreur
      if (mountedRef.current) {
        setSound(null);
        setIsPlaying(false);
        setHasFinished(false);
        stopStatusCheck();

        notifyStateChange({
          isPlaying: false,
          isLoading: false,
          error: null,
          hasFinished: false
        });
      }
    }
  };

  // Gérer play/pause
  const handlePlayPause = () => {
    if (isLoading) return;

    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  };

  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>
      {/* Bouton Play/Pause */}
      <TouchableOpacity
        onPress={handlePlayPause}
        disabled={isLoading}
        style={{
          width: size + 16,
          height: size + 16,
          borderRadius: (size + 16) / 2,
          backgroundColor: isPlaying ? COLORS.primary : COLORS.buttonBg,
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: SPACING.xs,
          opacity: isLoading ? 0.6 : 1,
        }}>
        {isLoading ? (
          <Loader size={size * 0.7} color={COLORS.white} />
        ) : isPlaying ? (
          <Pause
            size={size * 0.7}
            color={COLORS.white}
            fill={COLORS.white}
          />
        ) : (
          <Play
            size={size * 0.7}
            color={COLORS.textPrimary}
            fill={COLORS.textPrimary}
          />
        )}
      </TouchableOpacity>

      {/* Bouton Stop (visible si son chargé ou en cours) */}
      {(isPlaying || sound) && (
        <TouchableOpacity
          onPress={stopAudio}
          disabled={isLoading}
          style={{
            width: size + 8,
            height: size + 8,
            borderRadius: (size + 8) / 2,
            backgroundColor: COLORS.error + '20',
            justifyContent: 'center',
            alignItems: 'center',
            opacity: isLoading ? 0.6 : 1,
          }}>
          <Square
            size={size * 0.5}
            color={COLORS.error}
            fill={COLORS.error}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}