import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HadithService from '../services/HadithService';

/**
 * Hook pour obtenir un hadith spécifique
 * @param {string} collectionKey - Nom de la collection (bukhari, muslim, etc.)
 * @param {number} hadithNumber - Numéro du hadith
 * @returns {Object} - Données du hadith et état de chargement
 */
export const useHadith = (collectionKey, hadithNumber) => {
  const [hadith, setHadith] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState('fr');

  useEffect(() => {
    loadLanguageSettings();
    if (collectionKey && hadithNumber) {
      fetchHadith();
    }
  }, [collectionKey, hadithNumber, language]);

  const loadLanguageSettings = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('@hadith_language');
      if (savedLanguage) {
        setLanguage(savedLanguage);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres de langue:', error);
    }
  };

  const fetchHadith = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await HadithService.getHadithByNumber(collectionKey, hadithNumber);
      setHadith(data);
    } catch (error) {
      console.error('Erreur lors de la récupération du hadith:', error);
      setError("Une erreur s'est produite lors de la récupération du hadith");
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    if (collectionKey && hadithNumber) {
      fetchHadith();
    }
  };

  return {
    hadith,
    loading,
    error,
    refresh,
    language
  };
};
