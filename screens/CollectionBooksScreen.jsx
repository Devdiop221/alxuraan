import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BookOpen, ChevronRight, ArrowLeft } from 'lucide-react-native';

import { CustomText } from '../components/ui/Typography';
import { COLORS, SPACING, BORDER_RADIUS, GRADIENTS, SHADOWS } from '../components/ui/Theme';
import HadithService from '../services/hadithService';

const { width } = Dimensions.get('window');
const BOOK_WIDTH = (width - SPACING.md * 3) / 2; // 2 livres par ligne avec espacement

export default function CollectionBooksScreen({ route, navigation }) {
  const { collectionKey, collectionName, totalBooks } = route.params;
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await HadithService.getCollectionChapters(collectionKey);
      console.log('Livres chargés:', response);

      if (response && response.books) {
        // La réponse a la structure: { books: [...], collection: {...} }
        setBooks(response.books);
      } else {
        console.log('Format de réponse invalide:', response);
        setError('Format de réponse invalide');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des livres:', error);
      setError("Une erreur s'est produite lors du chargement des livres");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, [collectionKey]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadBooks();
  };

  const handleBookPress = (book) => {
    navigation.navigate('HadithsByBook', {
      collectionKey,
      bookId: book.id,
      bookName: book.name
    });
  };

  if (loading) {
    return (
      <LinearGradient colors={GRADIENTS.primary} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.textPrimary} />
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient colors={GRADIENTS.primary} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <CustomText color={COLORS.error} style={{ marginBottom: SPACING.md }}>
          {error}
        </CustomText>
        <TouchableOpacity
          onPress={handleRefresh}
          style={{
            backgroundColor: COLORS.buttonBg,
            padding: SPACING.sm,
            borderRadius: BORDER_RADIUS.md,
          }}>
          <CustomText color={COLORS.textPrimary}>Réessayer</CustomText>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={GRADIENTS.primary} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header fixe */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: SPACING.md,
          backgroundColor: COLORS.cardBackground,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.border,
        }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              padding: SPACING.xs,
              backgroundColor: COLORS.buttonBg,
              borderRadius: BORDER_RADIUS.full,
              marginRight: SPACING.md,
            }}>
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <View>
            <CustomText size="xl" weight="bold" color={COLORS.textPrimary}>
              {collectionName}
            </CustomText>
            <CustomText size="sm" color={COLORS.textSecondary}>
              {books.length} livres disponibles
            </CustomText>
          </View>
        </View>

        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          style={{ flex: 1 }}>
          <View style={{ padding: SPACING.md }}>
            {/* Grille de livres */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -SPACING.xs }}>
              {books.map((book) => (
                <TouchableOpacity
                  key={book.id}
                  onPress={() => handleBookPress(book)}
                  style={{
                    width: BOOK_WIDTH,
                    backgroundColor: COLORS.cardBackground,
                    borderRadius: BORDER_RADIUS.md,
                    padding: SPACING.sm,
                    margin: SPACING.xs,
                    ...SHADOWS.sm,
                  }}>
                  <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: BORDER_RADIUS.full,
                    backgroundColor: COLORS.buttonBg,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: SPACING.xs,
                    alignSelf: 'center',
                  }}>
                    <BookOpen size={20} color={COLORS.textPrimary} />
                  </View>
                  <View>
                    <CustomText
                      weight="bold"
                      color={COLORS.textPrimary}
                      numberOfLines={2}
                      style={{ textAlign: 'center', marginBottom: SPACING.xs }}>
                      {book.name}
                    </CustomText>
                    <CustomText
                      size="sm"
                      color={COLORS.textSecondary}
                      style={{ textAlign: 'center' }}>
                      {book.numberOfHadith} hadiths
                    </CustomText>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}