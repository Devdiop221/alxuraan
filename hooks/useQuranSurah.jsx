import { useState, useEffect } from 'react';
import { quranService as QuranService } from "../services/alxuraanService";

/**
 * Hook pour obtenir une sourate du Coran
 * @param {number} surahNumber - Numéro de la sourate (1-114)
 * @param {string} edition - Édition du Coran (par défaut: quran-uthmani)
 * @returns {Object} - Données de la sourate et état de chargement
 */
export const useQuranSurah = (surahNumber, edition = 'quran-uthmani') => {
  const [surah, setSurah] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (surahNumber) {
      fetchSurah();
    }
  }, [surahNumber, edition]);

  // Fonction pour récupérer la sourate
  const fetchSurah = async () => {
    try {
      setLoading(true);
      const data = await QuranService.getSurah(surahNumber, edition);
      setSurah(data.data);
      setLoading(false);
    } catch (error) {
      setError('Erreur lors de la récupération de la sourate');
      setLoading(false);
    }
  };

  return { surah, loading, error };
};
