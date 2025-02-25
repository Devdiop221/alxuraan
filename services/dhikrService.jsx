import axios from 'axios';

// Comme il n'existe pas d'API dédiée pour les dhikrs, nous pouvons créer notre propre service
// qui stocke les dhikrs localement ou accède à une API personnalisée

export const dhikrService = {
  // Récupérer les noms d'Allah
  getAllahNames: async () => {
    // Ces noms pourraient être stockés localement ou récupérés d'une API
    try {
      // Exemple d'utilisation d'une API fictive (à remplacer par votre propre implémentation)
      const response = await axios.get('https://api.example.com/allah-names');
      return response.data;
    } catch (error) {
      console.error('Error fetching Allah names:', error);

      // En cas d'erreur, retourner des données locales
      return [
        { id: 1, arabic: 'الرَّحْمَنُ', transliteration: 'Ar-Rahman', meaning: 'Le Tout Miséricordieux' },
        { id: 2, arabic: 'الرَّحِيمُ', transliteration: 'Ar-Rahim', meaning: 'Le Très Miséricordieux' },
        // ... autres noms
      ];
    }
  },

  // Récupérer les dhikrs du matin
  getMorningDhikrs: async () => {
    // Implémentation similaire avec données locales de secours
    return [
      {
        id: 1,
        arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ...',
        transliteration: 'Asbahna wa asbahal mulku lillah...',
        translation: 'Nous voilà au matin et à ce matin la royauté appartient à Allah...',
        repetitions: 1
      },
      // ... autres dhikrs
    ];
  },

  // Récupérer les dhikrs du soir
  getEveningDhikrs: async () => {
    // Similaire aux dhikrs du matin
    return [
      {
        id: 1,
        arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ...',
        transliteration: 'Amsayna wa amsal mulku lillah...',
        translation: 'Nous voilà au soir et ce soir la royauté appartient à Allah...',
        repetitions: 1
      },
      // ... autres dhikrs
    ];
  },

  // Récupérer les dhikrs après la prière
  getPrayerDhikrs: async () => {
    return [
      {
        id: 1,
        arabic: 'أَسْتَغْفِرُ اللَّهَ',
        transliteration: 'Astaghfirullah',
        translation: 'Je demande pardon à Allah',
        repetitions: 3
      },
      // ... autres dhikrs
    ];
  }
};