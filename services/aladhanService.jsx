import axios from 'axios';

const ALADHAN_BASE_URL = 'https://api.aladhan.com/v1';

// Service pour API Aladhan (calendrier et prières)
export const aladhanService = {
  // Obtenir la date hijri actuelle
  getCurrentHijriDate: async () => {
    try {
      const response = await axios.get(`${ALADHAN_BASE_URL}/gToH`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching hijri date:', error);
      throw error;
    }
  },

  // Convertir date grégorienne en hijri
  convertToHijri: async (gregorianDate) => {
    try {
      const formattedDate = gregorianDate.toISOString().split('T')[0];
      const response = await axios.get(`${ALADHAN_BASE_URL}/gToH/${formattedDate}`);
      return response.data.data;
    } catch (error) {
      console.error('Error converting to hijri:', error);
      throw error;
    }
  },

  // Convertir date hijri en grégorienne
  convertToGregorian: async (day, month, year) => {
    try {
      const response = await axios.get(`${ALADHAN_BASE_URL}/hToG/${day}/${month}/${year}`);
      return response.data.data;
    } catch (error) {
      console.error('Error converting to gregorian:', error);
      throw error;
    }
  },

  // Obtenir les horaires de prière pour une localisation
  getPrayerTimes: async (latitude, longitude, method = 2) => {
    try {
      const response = await axios.get(`${ALADHAN_BASE_URL}/timingsByCity`, {
        params: {
          latitude,
          longitude,
          method, // Méthode de calcul (2 = ISNA)
        },
      });
      return response.data.data.timings;
    } catch (error) {
      console.error('Error fetching prayer times:', error);
      throw error;
    }
  },

  // Obtenir les horaires de prière pour un mois entier
  getMonthlyPrayerTimes: async (latitude, longitude, year, month, method = 2) => {
    try {
      const response = await axios.get(`${ALADHAN_BASE_URL}/calendar`, {
        params: {
          latitude,
          longitude,
          month,
          year,
          method,
        },
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching monthly prayer times:', error);
      throw error;
    }
  },

  // Récupérer les méthodes de calcul disponibles
  getCalculationMethods: async () => {
    try {
      const response = await axios.get(`${ALADHAN_BASE_URL}/methods`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching calculation methods:', error);
      throw error;
    }
  },
};
