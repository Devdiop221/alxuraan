import { useState, useEffect } from 'react';
import { HadithService } from '../services/hadithService';

/**
 * Hook pour obtenir un hadith spécifique
 * @param {string} collection - Nom de la collection (bukhari, muslim, etc.)
 * @param {number} hadithNumber - Numéro du hadith
 * @param {string} apiKey - Clé API Sunnah.com
 * @returns {Object} - Données du hadith et état de chargement
 */
export const useHadith = (collection, hadithNumber, apiKey) => {
  const [hadith, setHadith] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (collection && hadithNumber && apiKey) {
      fetchHadith();
    }
  }, [collection, hadithNumber, apiKey]);

  // Fonction pour récupérer le hadith
  const fetchHadith = async () => {
    try {
      setLoading(true);
      const data = await HadithService.getHadith(collection, hadithNumber, apiKey);
      setHadith(data.data);
      setLoading(false);
    } catch (error) {
      setError('Erreur lors de la récupération du hadith');
      setLoading(false);
    }
  };

  return { hadith, loading, error };
};
