import axios from 'axios';

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
   * Obtenir les détails d'une mosquée
   * @param {string} placeId - ID du lieu Google Places
   * @param {string} apiKey - Clé API Google Places
   * @returns {Promise} - Promesse contenant les détails de la mosquée
   */
  getMosqueDetails: async (placeId, apiKey) => {
    try {
      const response = await axios.get(`https://maps.googleapis.com/maps/api/place/details/json`, {
        params: {
          place_id: placeId,
          fields:
            'name,formatted_address,formatted_phone_number,opening_hours,photos,rating,website',
          key: apiKey,
        },
      });
      return response.data.result;
    } catch (error) {
      console.error('Erreur lors de la récupération des détails de la mosquée:', error);
      throw error;
    }
  },
};
