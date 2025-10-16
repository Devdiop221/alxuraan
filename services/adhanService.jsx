import { Audio } from 'expo-audio';

// Service pour gérer les adhans
export const adhanService = {
  // Liste des adhans disponibles
  getAdhanList: () => {
    return [
      {
        id: 1,
        name: 'Adhan Makkah',
        source: require('../assets/adhans/adhan_makkah.mp3'),
        muezzin: 'Sheikh Ali Ahmed Mulla',
      },
      {
        id: 2,
        name: 'Adhan Madinah',
        source: require('../assets/adhans/adhan_madinah.mp3'),
        muezzin: 'Sheikh Essam Bukhari',
      },
      // Ajoutez d'autres adhans selon vos besoins
    ];
  },

  // Jouer un adhan
  playAdhan: async (adhanSource) => {
    try {
      const { sound } = await Audio.Sound.createAsync(adhanSource);
      await sound.playAsync();
      return sound;
    } catch (error) {
      console.error('Error playing adhan:', error);
      throw error;
    }
  },

  // Arrêter un adhan
  stopAdhan: async (sound) => {
    if (sound) {
      try {
        await sound.stopAsync();
        await sound.unloadAsync();
      } catch (error) {
        console.error('Error stopping adhan:', error);
        throw error;
      }
    }
  },
};
