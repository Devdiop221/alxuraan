import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { MosquesService } from '../api/mosquesService';

/**
 * Hook pour obtenir les mosquées à proximité
 * @param {string} apiKey - Clé API Google Places
 * @param {number} radius - Rayon de recherche en mètres (par défaut: 5000)
 * @returns {Object} - Données des mosquées et état de chargement
 */
export const useNearbyMosques = (apiKey, radius = 5000) => {
  const [mosques, setMosques] = useState([]);
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

  // Obtenir les mosquées à proximité lorsque la localisation est disponible
  useEffect(() => {
    if (location && apiKey) {
      fetchNearbyMosques();
    }
  }, [location, apiKey, radius]);

  // Fonction pour récupérer les mosquées à proximité
  const fetchNearbyMosques = async () => {
    if (!location || !apiKey) return;

    try {
      setLoading(true);
      const { latitude, longitude } = location.coords;
      const data = await MosquesService.getNearbyMosques(latitude, longitude, radius, apiKey);
      setMosques(data);
      setLoading(false);
    } catch (error) {
      setError('Erreur lors de la récupération des mosquées');
      setLoading(false);
    }
  };

  // Fonction pour actualiser les mosquées
  const refreshMosques = () => {
    if (location && apiKey) {
      fetchNearbyMosques();
    }
  };

  return { mosques, loading, error, refreshMosques };
};
