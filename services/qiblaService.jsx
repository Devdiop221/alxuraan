import * as Location from 'expo-location';
import { Magnetometer } from 'expo-sensors';
import * as geolib from 'geolib';
import { useEffect, useState } from 'react';

// Coordonnées de la Kaaba
const KAABA_COORDS = {
  latitude: 21.422487,
  longitude: 39.826206,
};

export const qiblaService = {
  // Obtenir la direction de la qibla
  getQiblaDirection: async () => {
    try {
      // Demander la permission de localisation
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        throw new Error('Location permission not granted');
      }

      // Obtenir la position actuelle
      const location = await Location.getCurrentPositionAsync({});
      const currentCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      // Calculer le bearing vers la Kaaba
      const bearing = geolib.getRhumbLineBearing(currentCoords, KAABA_COORDS);

      return {
        bearing,
        distance: geolib.getDistance(currentCoords, KAABA_COORDS) / 1000, // Distance en km
        currentCoords,
        kaabaCoords: KAABA_COORDS,
      };
    } catch (error) {
      console.error('Error getting qibla direction:', error);
      throw error;
    }
  },

  // Démarrer le suivi du magnétomètre pour la boussole
  startMagnetometerUpdates: (callback) => {
    Magnetometer.setUpdateInterval(100); // Mettre à jour toutes les 100ms

    const subscription = Magnetometer.addListener((data) => {
      // Calculer l'angle de la boussole
      const angle = Math.atan2(data.y, data.x) * (180 / Math.PI);
      callback(angle);
    });

    return subscription;
  },

  // Arrêter le suivi du magnétomètre
  stopMagnetometerUpdates: (subscription) => {
    if (subscription) {
      subscription.remove();
    }
  },
};

// Exemple d'un hook personnalisé pour utiliser le service Qibla
export const useQibla = () => {
  const [qiblaData, setQiblaData] = useState(null);
  const [compassHeading, setCompassHeading] = useState(0);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const initQibla = async () => {
      try {
        setLoading(true);
        const data = await qiblaService.getQiblaDirection();

        if (mounted) {
          setQiblaData(data);

          // Démarrer le magnétomètre
          const sub = qiblaService.startMagnetometerUpdates((heading) => {
            if (mounted) {
              setCompassHeading(heading);
            }
          });

          setSubscription(sub);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    initQibla();

    return () => {
      mounted = false;
      if (subscription) {
        qiblaService.stopMagnetometerUpdates(subscription);
      }
    };
  }, []);

  // Calculer l'angle de la qibla par rapport à la direction actuelle
  const qiblaAngle = qiblaData ? (qiblaData.bearing - compassHeading + 360) % 360 : 0;

  return { qiblaData, compassHeading, qiblaAngle, loading, error };
};
