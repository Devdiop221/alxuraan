const API_BASE_URL = 'https://quranenc.com/api/v1/translation';
const SURA_NAMES_URL = 'https://api.alquran.cloud/v1/surah';
const AUDIO_BASE_URL = 'https://api.alquran.cloud/v1/ayah';

import wolofData from '../data/quran_wolof.json';

// Cache pour les traductions Wolof
let wolofTranslationsCache = null;

// Initialiser le cache des traductions Wolof
const initWolofCache = () => {
  if (wolofTranslationsCache) return;

  wolofTranslationsCache = {};
  wolofData.forEach(sura => {
    wolofTranslationsCache[sura.id] = {
      name_wl: sura.name || '',
      verses: sura.verses || []
    };
  });
};

// Nombre de versets par sourate
export const VERSE_COUNTS = {
  1: 7, 2: 286, 3: 200, 4: 176, 5: 120, 6: 165, 7: 206,
  8: 75, 9: 129, 10: 109, 11: 123, 12: 111, 13: 43, 14: 52,
  15: 99, 16: 128, 17: 111, 18: 110, 19: 98, 20: 135, 21: 112,
  22: 78, 23: 118, 24: 64, 25: 77, 26: 227, 27: 93, 28: 88,
  29: 69, 30: 60, 31: 34, 32: 30, 33: 73, 34: 54, 35: 45,
  36: 83, 37: 182, 38: 88, 39: 75, 40: 85, 41: 54, 42: 53,
  43: 89, 44: 59, 45: 37, 46: 35, 47: 38, 48: 29, 49: 18,
  50: 45, 51: 60, 52: 49, 53: 62, 54: 55, 55: 78, 56: 96,
  57: 29, 58: 22, 59: 24, 60: 13, 61: 14, 62: 11, 63: 11,
  64: 18, 65: 12, 66: 12, 67: 30, 68: 52, 69: 52, 70: 44,
  71: 28, 72: 28, 73: 20, 74: 56, 75: 40, 76: 31, 77: 50,
  78: 40, 79: 46, 80: 42, 81: 29, 82: 19, 83: 36, 84: 25,
  85: 22, 86: 17, 87: 19, 88: 26, 89: 30, 90: 20, 91: 15,
  92: 21, 93: 11, 94: 8, 95: 8, 96: 19, 97: 5, 98: 8,
  99: 8, 100: 11, 101: 11, 102: 8, 103: 3, 104: 9, 105: 5,
  106: 4, 107: 7, 108: 3, 109: 6, 110: 3, 111: 5, 112: 4,
  113: 5, 114: 6
};

// Cache pour les noms des sourates
let suraNameCache = null;

/**
 * Récupère les noms des sourates en arabe et en français.
 * @returns {Promise<Array>} - Un tableau d'objets contenant les noms des sourates.
 */
export const getSuraNames = async () => {
  try {
    const response = await fetch(SURA_NAMES_URL);
    const data = await response.json();

    if (!data.data || !Array.isArray(data.data)) {
      throw new Error('Format de données invalide');
    }

    // Formater et enrichir les données
    const formattedSuras = data.data.map(sura => {
      const wolofSura = wolofData.find(ws => ws.id === sura.number);
      return {
        id: sura.number,
        name_ar: sura.name,
        name_fr: sura.englishName,
        name_wo: wolofSura?.name || `Sourate ${sura.number}`,
        verses: VERSE_COUNTS[sura.number] || 0,
        type: sura.revelationType === 'Meccan' ? 'Mecquoise' : 'Médinoise',
        description: sura.englishNameTranslation,
        hasWolofTranslation: !!wolofSura
      };
    });

    return formattedSuras;
  } catch (error) {
    console.error('Erreur lors de la récupération des noms des sourates:', error);
    return [];
  }
};

/**
 * Récupère la traduction d'une sourate spécifique.
 * @param {number} suraNumber - Le numéro de la sourate (1 à 114).
 * @returns {Promise<Array>} - Un tableau d'objets contenant les versets de la sourate.
 */
export const getSuraTranslation = async (suraNumber) => {
  try {
    if (!suraNumber || suraNumber < 1 || suraNumber > 114) {
      throw new Error('Numéro de sourate invalide');
    }

    const response = await fetch(`${API_BASE_URL}/sura/french_hameedullah/${suraNumber}`);
    const data = await response.json();

    if (!data.result || !Array.isArray(data.result)) {
      throw new Error('Format de données invalide');
    }

    // Récupérer les traductions Wolof
    const wolofSura = wolofData.find(sura => sura.id === suraNumber);
    const wolofVerses = wolofSura?.verses || [];

    return data.result.map((verse, index) => ({
      ...verse,
      audio_url: `${AUDIO_BASE_URL}/${suraNumber}:${verse.id}/audio`,
      wolof: wolofVerses[index]?.text || '',
      has_wolof: !!wolofVerses[index]?.text
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération de la traduction de la sourate:', error);
    return [];
  }
};

/**
 * Récupère la traduction d'un verset spécifique.
 * @param {number} suraNumber - Le numéro de la sourate (1 à 114).
 * @param {number} ayaNumber - Le numéro du verset.
 * @returns {Promise<Object>} - Un objet contenant le texte arabe et la traduction.
 */
export const getAyaTranslation = async (suraNumber, ayaNumber) => {
  try {
    if (!suraNumber || !ayaNumber || suraNumber < 1 || suraNumber > 114) {
      throw new Error('Paramètres invalides');
    }

    const response = await fetch(`${API_BASE_URL}/aya/french_hameedullah/${suraNumber}/${ayaNumber}`);
    const data = await response.json();

    if (!data.result) {
      throw new Error('Format de données invalide');
    }

    return {
      ...data.result,
      audio_url: `${AUDIO_BASE_URL}/${suraNumber}:${ayaNumber}/audio`
    };
  } catch (error) {
    console.error('Erreur lors de la récupération de la traduction du verset:', error);
    return null;
  }
};

/**
 * Vérifie si un numéro de sourate est valide.
 * @param {number} suraNumber - Le numéro de la sourate à vérifier.
 * @returns {boolean} - True si le numéro est valide, false sinon.
 */
export const isValidSuraNumber = (suraNumber) => {
  return Number.isInteger(suraNumber) && suraNumber >= 1 && suraNumber <= 114;
};

/**
 * Obtient le nombre de versets d'une sourate.
 * @param {number} suraNumber - Le numéro de la sourate.
 * @returns {number} - Le nombre de versets ou 0 si la sourate est invalide.
 */
export const getVerseCount = (suraNumber) => {
  return VERSE_COUNTS[suraNumber] || 0;
};

/**
 * Vérifie si une sourate a une traduction en Wolof.
 * @param {number} suraNumber - Le numéro de la sourate.
 * @returns {boolean} - True si la sourate a une traduction en Wolof.
 */
export const hasWolofTranslation = (suraNumber) => {
  initWolofCache();
  return !!wolofTranslationsCache[suraNumber]?.verses?.length;
};