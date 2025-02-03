import create from 'zustand';
import { setItem, getItem } from '../utils/storage';

const useStore = create((set) => ({
  favorites: [],
  loadFavorites: async () => {
    const savedFavorites = await getItem('favorites');
    if (savedFavorites) {
      set({ favorites: savedFavorites });
    }
  },
  addFavorite: async (favorite) => {
    set((state) => {
      const newFavorites = [...state.favorites, favorite];
      setItem('favorites', newFavorites); // Sauvegarder dans AsyncStorage
      return { favorites: newFavorites };
    });
  },
  removeFavorite: async (suraNumber, ayaNumber) => {
    set((state) => {
      const newFavorites = state.favorites.filter(
        (fav) => !(fav.suraNumber === suraNumber && fav.ayaNumber === ayaNumber)
      );
      setItem('favorites', newFavorites); // Sauvegarder dans AsyncStorage
      return { favorites: newFavorites };
    });
  },
}));

// Charger les favoris au démarrage
useStore.getState().loadFavorites();

export default useStore;