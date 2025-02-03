const API_BASE_URL = 'https://quranenc.com/api/v1/translation';

/**
 * Récupère la traduction d'une sourate spécifique.
 * @param {number} suraNumber - Le numéro de la sourate (1 à 114).
 * @returns {Promise<Array>} - Un tableau d'objets contenant les versets de la sourate.
 */
export const getSuraTranslation = async (suraNumber) => {
  try {
    const response = await fetch(`${API_BASE_URL}/sura/french_hameedullah/${suraNumber}`);
    const data = await response.json();
    return data.result; // Retourne les versets de la sourate
  } catch (error) {
    console.error('Erreur lors de la récupération de la traduction de la sourate:', error);
    return []; // Retourne un tableau vide en cas d'erreur
  }
};

/**
 * Récupère la traduction d'un verset spécifique.
 * @param {number} suraNumber - Le numéro de la sourate (1 à 114).
 * @param {number} ayaNumber - Le numéro du verset.
 * @returns {Promise<Object>} - Un objet contenant le texte arabe et la traduction du verset.
 */
export const getAyaTranslation = async (suraNumber, ayaNumber) => {
  try {
    const response = await fetch(`${API_BASE_URL}/aya/french_hameedullah/${suraNumber}/${ayaNumber}`);
    const data = await response.json();
    return data.result; // Retourne le verset spécifique
  } catch (error) {
    console.error('Erreur lors de la récupération de la traduction du verset:', error);
    return null; // Retourne null en cas d'erreur
  }
};

const SURA_NAMES_URL = 'https://api.alquran.cloud/v1/surah';

/**
 * Récupère les noms des sourates en arabe et en français.
 * @returns {Promise<Array>} - Un tableau d'objets contenant les noms des sourates.
 */
export const getSuraNames = async () => {
  try {
    const response = await fetch(SURA_NAMES_URL);
    const data = await response.json();
    return data.data; // Retourne les noms des sourates
  } catch (error) {
    console.error('Erreur lors de la récupération des noms des sourates:', error);
    return []; // Retourne un tableau vide en cas d'erreur
  }
};