import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { aladhanService as PrayerTimesService } from "../services/aladhanService";

/**
 * Hook pour obtenir les horaires de prière basés sur la position actuelle
 * @param {number} method - Méthode de calcul (par défaut: 2 - ISNA)
 * @returns {Object} - Données des horaires de prière et état de chargement
 */
export const usePrayerTimes = (method = 2) => {
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);

  // Obtenir la localisation actuelle
  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Permission de localisation refusée');
          setLoading(false);
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        setLocation(location);
      } catch (error) {
        setError('Erreur lors de la récupération de la localisation');
        setLoading(false);
      }
    })();
  }, []);

  // Obtenir les horaires de prière lorsque la localisation est disponible
  useEffect(() => {
    if (location) {
      fetchPrayerTimes();
    }
  }, [location, method]);

  // Fonction pour récupérer les horaires de prière
  const fetchPrayerTimes = async () => {
    if (!location) return;

    try {
      setLoading(true);
      const { latitude, longitude } = location.coords;
      const data = await PrayerTimesService.getPrayerTimes(latitude, longitude, method);
      setPrayerTimes(data.data);
      setLoading(false);
    } catch (error) {
      setError('Erreur lors de la récupération des horaires de prière');
      setLoading(false);
    }
  };

  // Fonction pour actualiser les horaires de prière
  const refreshPrayerTimes = () => {
    if (location) {
      fetchPrayerTimes();
    }
  };

  return { prayerTimes, loading, error, refreshPrayerTimes };
};
