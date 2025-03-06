import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Platform } from 'react-native';
import { Play, Pause, Volume2, VolumeX, FastForward, X } from 'lucide-react-native';
import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';

import { CustomText } from './ui/Typography';
import { COLORS, SPACING, BORDER_RADIUS, GRADIENTS, SHADOWS } from './ui/Theme';

export default function PlayerMini({ audioUrl, surahName, surahNumber, onClose }) {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const loadAudio = async () => {
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
      } catch (error) {
        console.error('Error loading audio:', error);
      }
    };

    if (audioUrl) {
      loadAudio();
    }

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
    if (!sound) return;
    try {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    } catch (error) {
      console.error('Error playing/pausing audio:', error);
    }
  };

  const toggleMute = async () => {
    if (!sound) return;
    try {
      await sound.setIsMutedAsync(!isMuted);
      setIsMuted(!isMuted);
    } catch (error) {
      console.error('Error toggling mute:', error);
    }
  };

  const changePlaybackRate = async () => {
    if (!sound) return;
    const rates = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
    const currentIndex = rates.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % rates.length;
    const newRate = rates[nextIndex];

    try {
      await sound.setRateAsync(newRate, true);
      setPlaybackRate(newRate);
    } catch (error) {
      console.error('Error changing playback rate:', error);
    }
  };

  const formatTime = (millis) => {
    if (!millis) return '00:00';
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <View style={{
      borderRadius: BORDER_RADIUS.lg,
      overflow: 'hidden',
      marginHorizontal: SPACING.sm,
      marginBottom: SPACING.xs,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 4,
        },
        android: {
          elevation: 4,
        },
      }),
    }}>
      <LinearGradient colors={GRADIENTS.primary} style={{ padding: SPACING.sm }}>
        <View style={{ alignItems: 'center' }}>
          <View style={{
            width: '100%',
            marginBottom: SPACING.xs,
          }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: SPACING.xs,
            }}>
              <View>
                <CustomText
                  size="sm"
                  weight="bold"
                  color={COLORS.textPrimary}
                  style={{ marginBottom: 1 }}>
                  {surahName}
                </CustomText>
                <CustomText
                  size="xs"
                  color={COLORS.textSecondary}>
                  Sourate {surahNumber}
                </CustomText>
              </View>
              <TouchableOpacity
                onPress={onClose}
                style={{
                  padding: SPACING.xs,
                  backgroundColor: COLORS.buttonBg,
                  borderRadius: BORDER_RADIUS.full,
                }}>
                <X size={16} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={{ width: '100%', marginBottom: SPACING.xs }}>
              <Slider
                value={position}
                maximumValue={duration}
                onValueChange={(value) => {
                  if (sound) {
                    sound.setPositionAsync(value);
                  }
                }}
                style={{ height: 24, marginBottom: 2 }}
                minimumTrackTintColor={COLORS.primary}
                maximumTrackTintColor={COLORS.divider}
                thumbTintColor={COLORS.textPrimary}
              />
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingHorizontal: SPACING.xs,
              }}>
                <CustomText size="xs" color={COLORS.textSecondary}>
                  {formatTime(position)}
                </CustomText>
                <CustomText size="xs" color={COLORS.textSecondary}>
                  {formatTime(duration)}
                </CustomText>
              </View>
            </View>
          </View>

          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: SPACING.sm,
          }}>
            <TouchableOpacity
              onPress={toggleMute}
              style={{
                padding: SPACING.sm,
                backgroundColor: COLORS.buttonBg,
                borderRadius: BORDER_RADIUS.full,
              }}>
              {isMuted ? (
                <VolumeX size={16} color={COLORS.textPrimary} />
              ) : (
                <Volume2 size={16} color={COLORS.textPrimary} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={playPauseAudio}
              style={{
                width: 40,
                height: 40,
                backgroundColor: COLORS.textPrimary,
                borderRadius: BORDER_RADIUS.full,
                justifyContent: 'center',
                alignItems: 'center',
                ...SHADOWS.base,
              }}>
              {isPlaying ? (
                <Pause size={20} color={COLORS.primary} />
              ) : (
                <Play size={20} color={COLORS.primary} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={changePlaybackRate}
              style={{
                padding: SPACING.sm,
                backgroundColor: COLORS.buttonBg,
                borderRadius: BORDER_RADIUS.full,
              }}>
              <FastForward size={16} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}