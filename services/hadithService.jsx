import axios from 'axios';

/**
 * Service pour accéder aux hadiths utilisant l'API Sunnah.com
 */
export const HadithService = {
  /**
   * Initialiser les headers avec la clé API
   * @param {string} apiKey - Clé API Sunnah.com
   * @returns {Object} - Headers pour les requêtes
   */
  getHeaders: (apiKey) => {
    return {
      'X-API-Key': apiKey,
      'Content-Type': 'application/json',
    };
  },

  /**
   * Obtenir une collection de hadiths
   * @param {string} collection - Nom de la collection (bukhari, muslim, etc.)
   * @param {string} apiKey - Clé API Sunnah.com
   * @returns {Promise} - Promesse contenant la liste des collections
   */
  getCollection: async (collection, apiKey) => {
    try {
      const response = await axios.get(`https://api.sunnah.com/v1/collections/${collection}`, {
        headers: HadithService.getHeaders(apiKey),
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de la collection:', error);
      throw error;
    }
  },

  /**
   * Obtenir un hadith spécifique
   * @param {string} collection - Nom de la collection (bukhari, muslim, etc.)
   * @param {number} hadithNumber - Numéro du hadith
   * @param {string} apiKey - Clé API Sunnah.com
   * @returns {Promise} - Promesse contenant le hadith
   */
  getHadith: async (collection, hadithNumber, apiKey) => {
    try {
      const response = await axios.get(
        `https://api.sunnah.com/v1/collections/${collection}/hadiths/${hadithNumber}`,
        { headers: HadithService.getHeaders(apiKey) }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du hadith:', error);
      throw error;
    }
  },

  /**
   * Rechercher des hadiths par mot-clé
   * @param {string} query - Terme de recherche
   * @param {string} apiKey - Clé API Sunnah.com
   * @param {number} page - Numéro de page
   * @param {number} limit - Nombre de résultats par page
   * @returns {Promise} - Promesse contenant les résultats de recherche
   */
  searchHadiths: async (query, apiKey, page = 1, limit = 10) => {
    try {
      const response = await axios.get(`https://api.sunnah.com/v1/hadiths/search`, {
        headers: HadithService.getHeaders(apiKey),
        params: {
          q: query,
          page,
          limit,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la recherche de hadiths:', error);
      throw error;
    }
  },
};
