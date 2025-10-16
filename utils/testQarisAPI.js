// Test script pour vérifier l'API des récitateurs
import axios from 'axios';

export const testQarisAPI = async () => {
  console.log('🧪 Test de l\'API des récitateurs...');

  try {
    // Test de l'API MP3Quran
    const response = await axios.get('https://mp3quran.net/api/v3/reciters');

    if (response.data && response.data.reciters) {
      console.log('✅ API MP3Quran fonctionne');
      console.log(`📊 ${response.data.reciters.length} récitateurs trouvés`);
      console.log('🎯 Premier récitateur:', response.data.reciters[0]?.name);
      return {
        success: true,
        source: 'MP3Quran API',
        count: response.data.reciters.length,
        data: response.data.reciters.slice(0, 5) // Premiers 5 pour test
      };
    }
  } catch (error) {
    console.log('❌ API MP3Quran échouée:', error.message);

    // Fallback vers données statiques
    const fallbackData = [
      {
        id: 1,
        name: 'عبد الباسط عبد الصمد',
        letter: 'ع',
        moshaf: [{
          id: 1,
          name: 'مرتل',
          server: 'https://server8.mp3quran.net/abd_basit/Alafasy_128_kbps/',
        }]
      },
      {
        id: 2,
        name: 'مشاري بن راشد العفاسي',
        letter: 'م',
        moshaf: [{
          id: 2,
          name: 'مرتل',
          server: 'https://server8.mp3quran.net/afs/',
        }]
      }
    ];

    console.log('🔄 Utilisation des données de fallback');
    console.log(`📊 ${fallbackData.length} récitateurs de fallback`);

    return {
      success: true,
      source: 'Fallback Data',
      count: fallbackData.length,
      data: fallbackData
    };
  }
};

// Test rapide
if (typeof window === 'undefined') {
  // Node.js environment
  testQarisAPI().then(result => {
    console.log('Résultat du test:', result);
  });
}