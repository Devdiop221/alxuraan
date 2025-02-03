import AsyncStorage from '@react-native-async-storage/async-storage';

// Sauvegarder une valeur
export const setItem = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des données:', error);
  }
};

// Récupérer une valeur
export const getItem = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Erreur lors de la récupération des données:', error);
    return null;
  }
};

// Supprimer une valeur
export const removeItem = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Erreur lors de la suppression des données:', error);
  }
};

// Supprimer toutes les valeurs
export const clearStorage = async () => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Erreur lors de la suppression de toutes les données:', error);
  }
};
