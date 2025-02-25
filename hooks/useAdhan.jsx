import { useState } from 'react';

import { adhanService as AdhanPlayer } from '../services/adhanService';

/**
 * Hook pour gérer la lecture de l'adhan
 * @returns {Object} - Fonctions et état pour gérer l'adhan
 */
export const useAdhan = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [adhanType, setAdhanType] = useState('normal');
  const [error, setError] = useState(null);

  // Fonction pour jouer l'adhan
  const playAdhan = async (type = 'normal') => {
    try {
      setAdhanType(type);
      await AdhanPlayer.playAdhan(type);
      setIsPlaying(true);
    } catch (error) {
      setError("Erreur lors de la lecture de l'adhan");
    }
  };

  // Fonction pour arrêter l'adhan
  const stopAdhan = async () => {
    try {
      await AdhanPlayer.stopAdhan();
      setIsPlaying(false);
    } catch (error) {
      setError("Erreur lors de l'arrêt de l'adhan");
    }
  };

  return { isPlaying, adhanType, error, playAdhan, stopAdhan };
};
