import { useState, useEffect } from 'react';
import { aladhanService as PrayerTimesService } from "../services/aladhanService";

/**
 * Hook pour obtenir la date hijri actuelle
 * @returns {Object} - Date hijri et état de chargement
 */
export const useHijriDate = () => {
  const [hijriDate, setHijriDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHijriDate();
  }, []);

  // Fonction pour récupérer la date hijri actuelle
  const fetchHijriDate = async () => {
    try {
      setLoading(true);
      const today = new Date();
      const formattedDate = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
      const data = await PrayerTimesService.convertToHijri(formattedDate);
      setHijriDate(data.data);
      setLoading(false);
    } catch (error) {
      setError('Erreur lors de la récupération de la date hijri');
      setLoading(false);
    }
  };

  // Fonction pour actualiser la date hijri
  const refreshHijriDate = () => {
    fetchHijriDate();
  };

  return { hijriDate, loading, error, refreshHijriDate };
};
