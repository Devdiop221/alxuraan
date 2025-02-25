import axios from 'axios';

const ALQURAN_CLOUD_BASE_URL = 'https://api.alquran.cloud/v1';
const QURAN_COM_BASE_URL = 'https://api.quran.com/api/v4';

export const quranService = {
  // Récupérer liste des sourates
  getSurahs: async () => {
    try {
      const response = await axios.get(`${ALQURAN_CLOUD_BASE_URL}/surah`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching surahs:', error);
      throw error;
    }
  },

  // Récupérer une sourate spécifique
  getSurah: async (surahNumber, edition = 'quran-uthmani') => {
    try {
      const response = await axios.get(`${ALQURAN_CLOUD_BASE_URL}/surah/${surahNumber}/${edition}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching surah:', error);
      throw error;
    }
  },

  // Récupérer un verset spécifique
  getVerse: async (surahNumber, verseNumber, edition = 'quran-uthmani') => {
    try {
      const response = await axios.get(
        `${ALQURAN_CLOUD_BASE_URL}/ayah/${surahNumber}:${verseNumber}/${edition}`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching verse:', error);
      throw error;
    }
  },

  // Récupérer plusieurs traductions pour un verset
  getVerseTranslations: async (
    surahNumber,
    verseNumber,
    editions = ['fr.hamidullah', 'en.sahih']
  ) => {
    try {
      const responses = await Promise.all(
        editions.map((edition) =>
          axios.get(`${ALQURAN_CLOUD_BASE_URL}/ayah/${surahNumber}:${verseNumber}/${edition}`)
        )
      );
      return responses.map((response) => response.data.data);
    } catch (error) {
      console.error('Error fetching verse translations:', error);
      throw error;
    }
  },

  // Récupérer les traductions disponibles
  getAvailableTranslations: async () => {
    try {
      const response = await axios.get(`${ALQURAN_CLOUD_BASE_URL}/edition/format/text`);
      return response.data.data.filter((edition) => edition.type === 'translation');
    } catch (error) {
      console.error('Error fetching available translations:', error);
      throw error;
    }
  },

  // Récupérer un audio de récitation
  getRecitation: async (surahNumber, reciterId = 7) => {
    // 7 = Mishari Rashid al-Afasy
    try {
      // API Quran.com pour les récitations audio
      const response = await axios.get(
        `${QURAN_COM_BASE_URL}/chapter_recitations/${reciterId}/${surahNumber}`
      );
      return response.data.audio_file;
    } catch (error) {
      console.error('Error fetching recitation:', error);
      throw error;
    }
  },

  // Obtenir les récitateurs disponibles
  getAvailableReciters: async () => {
    try {
      const response = await axios.get(`${QURAN_COM_BASE_URL}/resources/recitations`);
      return response.data.recitations;
    } catch (error) {
      console.error('Error fetching available reciters:', error);
      throw error;
    }
  },

  // Recherche de mots ou phrases dans le Coran
  searchQuran: async (query, language = 'en') => {
    try {
      const response = await axios.get(`${QURAN_COM_BASE_URL}/search`, {
        params: {
          q: query,
          language,
        },
      });
      return response.data.search.results;
    } catch (error) {
      console.error('Error searching Quran:', error);
      throw error;
    }
  },
};
