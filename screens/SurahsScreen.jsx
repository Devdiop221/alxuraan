import React, { useState, useEffect, useRef } from 'react';
import { FlatList, SafeAreaView, View, TextInput, Dimensions, Animated, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Search, ArrowUp, ArrowDown, Play, Book } from 'lucide-react-native';
import axios from 'axios';

import { CustomLoadingIndicator } from '../components/ui/LoadingIndicator';
import { CustomText } from '../components/ui/Typography';
import { COLORS, SPACING, BORDER_RADIUS, GRADIENTS, SHADOWS } from '../components/ui/Theme';
import { usePlayer } from '../context/PlayerContext';

const { width } = Dimensions.get('window');

export default function SurahsScreen({ route, navigation }) {
  const { edition } = route.params;
  const { playAudio } = usePlayer();
  const [surahs, setSurahs] = useState([]);
  const [filteredSurahs, setFilteredSurahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    const fetchSurahs = async () => {
      try {
        const response = await axios.get('https://api.alquran.cloud/v1/surah');
        const sortedData = response.data.data.sort((a, b) => a.number - b.number);
        setSurahs(sortedData);
        setFilteredSurahs(sortedData);
        setLoading(false);

        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]).start();
      } catch (error) {
        console.error('Error fetching surahs:', error);
        setError('Erreur lors du chargement des sourates. Veuillez réessayer.');
        setLoading(false);
      }
    };

    fetchSurahs();
  }, [edition]);

  const handleSearch = (text) => {
    setSearchQuery(text);
    const filtered = surahs.filter(surah =>
      surah.englishName.toLowerCase().includes(text.toLowerCase()) ||
      surah.englishNameTranslation.toLowerCase().includes(text.toLowerCase()) ||
      surah.number.toString().includes(text)
    );
    setFilteredSurahs(filtered);
  };

  const toggleSort = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newOrder);
    const sorted = [...filteredSurahs].sort((a, b) =>
      newOrder === 'asc' ? a.number - b.number : b.number - a.number
    );
    setFilteredSurahs(sorted);
  };

  const handlePlaySurah = (surah) => {
    const audioUrl = `https://cdn.islamic.network/quran/audio-surah/128/${edition}/${surah.number}.mp3`;
    playAudio(audioUrl, surah.englishName, surah.number);
  };

  const renderHeader = () => (
    <View style={{
      padding: SPACING.md,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.divider,
    }}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
      }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginRight: SPACING.md }}>
          <ArrowLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <CustomText size="2xl" weight="bold" color={COLORS.textPrimary}>
            Les Sourates
          </CustomText>
          <CustomText size="sm" color={COLORS.textSecondary}>
            {filteredSurahs.length} sourates disponibles
          </CustomText>
        </View>
      </View>

      <View style={{
        flexDirection: 'row',
        gap: SPACING.sm,
      }}>
        <View style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: COLORS.searchBg,
          borderRadius: BORDER_RADIUS.md,
          paddingHorizontal: SPACING.sm,
        }}>
          <Search size={20} color={COLORS.textSecondary} style={{ marginRight: SPACING.sm }} />
          <TextInput
            placeholder="Rechercher une sourate..."
            placeholderTextColor={COLORS.textSecondary}
            value={searchQuery}
            onChangeText={handleSearch}
            style={{
              flex: 1,
              height: 44,
              color: COLORS.textPrimary,
              fontSize: SPACING.base,
            }}
          />
        </View>
        <TouchableOpacity
          onPress={toggleSort}
          style={{
            width: 44,
            height: 44,
            backgroundColor: COLORS.buttonBg,
            borderRadius: BORDER_RADIUS.full,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          {sortOrder === 'asc' ? (
            <ArrowUp size={20} color={COLORS.textPrimary} />
          ) : (
            <ArrowDown size={20} color={COLORS.textPrimary} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <LinearGradient colors={GRADIENTS.primary} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <CustomLoadingIndicator />
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient colors={GRADIENTS.primary} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1, padding: SPACING.md }}>
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: SPACING.xl,
          }}>
            <CustomText
              color={COLORS.error}
              size="lg"
              weight="bold"
              style={{ textAlign: 'center', marginBottom: SPACING.md }}>
              {error}
            </CustomText>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{
                backgroundColor: COLORS.buttonBg,
                padding: SPACING.md,
                borderRadius: BORDER_RADIUS.md,
              }}>
              <CustomText color={COLORS.textPrimary}>Retour</CustomText>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={GRADIENTS.primary} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <FlatList
          data={filteredSurahs}
          ListHeaderComponent={renderHeader}
          renderItem={({ item, index }) => (
            <Animated.View
              style={{
                marginHorizontal: SPACING.md,
                marginBottom: SPACING.sm,
                opacity: fadeAnim,
                transform: [{
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, index * 20]
                  })
                }]
              }}>
              <TouchableOpacity
                onPress={() => navigation.navigate('SurahDetail', { surahNumber: item.number })}>
                <LinearGradient
                  colors={GRADIENTS.card}
                  style={{
                    borderRadius: BORDER_RADIUS.md,
                    overflow: 'hidden',
                    ...SHADOWS.base,
                  }}>
                  <View style={{
                    padding: SPACING.md,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                    <View style={{
                      width: 48,
                      height: 48,
                      borderRadius: BORDER_RADIUS.full,
                      backgroundColor: COLORS.buttonBg,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: SPACING.md,
                    }}>
                      <Book size={24} color={COLORS.textPrimary} />
                    </View>

                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <CustomText
                          size="lg"
                          weight="bold"
                          color={COLORS.textPrimary}
                          style={{ marginRight: SPACING.xs }}>
                          {item.englishName}
                        </CustomText>
                        <CustomText
                          size="sm"
                          color={COLORS.textSecondary}>
                          ({item.number})
                        </CustomText>
                      </View>
                      <CustomText
                        size="sm"
                        color={COLORS.textSecondary}>
                        {item.englishNameTranslation}
                      </CustomText>
                    </View>

                    <TouchableOpacity
                      onPress={() => handlePlaySurah(item)}
                      style={{
                        width: 40,
                        height: 40,
                        backgroundColor: COLORS.buttonBg,
                        borderRadius: BORDER_RADIUS.full,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <Play size={20} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          )}
          keyExtractor={(item) => item.number.toString()}
          contentContainerStyle={{ paddingBottom: SPACING.md }}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}
