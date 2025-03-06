import axios from 'axios';

const MOSQUES_API_BASE_URL = 'https://api.example.com/mosques'; // À remplacer par l'API réelle

/**
 * Service pour localiser les mosquées utilisant Google Places API
 */
export const MosquesService = {
  /**
   * Rechercher les mosquées à proximité
   * @param {number} latitude - Latitude de la position
   * @param {number} longitude - Longitude de la position
   * @param {number} radius - Rayon de recherche en mètres (max: 50000)
   * @param {string} apiKey - Clé API Google Places
   * @returns {Promise} - Promesse contenant les mosquées à proximité
   */
  getNearbyMosques: async (latitude, longitude, radius = 5000, apiKey) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json`,
        {
          params: {
            location: `${latitude},${longitude}`,
            radius,
            type: 'mosque',
            key: apiKey,
          },
        }
      );
      return response.data.results;
    } catch (error) {
      console.error('Erreur lors de la recherche des mosquées:', error);
      throw error;
    }
  },

  /**
   * Obtenir les streams en direct des mosquées sacrées
   * @returns {Promise} - Promesse contenant les streams en direct
   */
  getLiveStreams: async () => {
    try {
      // En attendant l'API réelle, on retourne des données statiques
      return [
        {
          id: '1',
          title: 'Masjid Al-Nabawi Live',
          speaker: "Mosquée du Prophète, Médine",
          viewers: 5200,
          thumbnail: 'https://example.com/thumbnails/masjid-nabawi.jpg',
          isLive: true,
          youtubeUrl: 'https://www.youtube.com/live/j_JS9cYi234?si=fE9_n9W6mWTIKtjK',
        },
        {
          id: '2',
          title: 'Masjid Al-Haram Live',
          speaker: 'Grande Mosquée, La Mecque',
          viewers: 7800,
          thumbnail: 'https://example.com/thumbnails/masjid-haram.jpg',
          isLive: true,
          youtubeUrl: 'https://www.youtube.com/live/tko4c06NJeA?si=ULNX3o7MC8M9fWVY',
        },
      ];
    } catch (error) {
      console.error('Erreur lors de la récupération des streams:', error);
      throw error;
    }
  },

  /**
   * Obtenir les informations d'une mosquée spécifique
   * @param {string} mosqueId - ID de la mosquée
   * @returns {Promise} - Promesse contenant les informations de la mosquée
   */
  getMosqueDetails: async (mosqueId) => {
    try {
      const response = await axios.get(`${MOSQUES_API_BASE_URL}/${mosqueId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des détails de la mosquée:', error);
      throw error;
    }
  },

  /**
   * Obtenir les horaires d'une mosquée spécifique
   * @param {string} mosqueId - ID de la mosquée
   * @returns {Promise} - Promesse contenant les horaires de prière
   */
  getMosquePrayerTimes: async (mosqueId) => {
    try {
      const response = await axios.get(`${MOSQUES_API_BASE_URL}/${mosqueId}/prayer-times`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des horaires de prière:', error);
      throw error;
    }
  },

  /**
   * Obtenir les événements d'une mosquée
   * @param {string} mosqueId - ID de la mosquée
   * @returns {Promise} - Promesse contenant les événements
   */
  getMosqueEvents: async (mosqueId) => {
    try {
      const response = await axios.get(`${MOSQUES_API_BASE_URL}/${mosqueId}/events`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des événements:', error);
      throw error;
    }
  },
};
