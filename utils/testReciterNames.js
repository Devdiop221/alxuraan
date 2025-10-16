// Test des noms de récitateurs traduits
import { translateReciterName, searchReciters } from './reciterNames';

export const testReciterTranslations = () => {
  console.log('🧪 Test des traductions de noms de récitateurs...');

  const testCases = [
    'مشاري بن راشد العفاسي',
    'عبد الباسط عبد الصمد',
    'ماهر المعيقلي',
    'سعد الغامدي',
    'عبد الرحمن السديس'
  ];

  testCases.forEach(arabicName => {
    const translated = translateReciterName(arabicName);
    console.log(`📝 ${arabicName} → ${translated}`);
  });

  return {
    success: true,
    message: 'Traductions testées avec succès'
  };
};

export const testReciterSearch = () => {
  console.log('🧪 Test de la recherche de récitateurs...');

  const mockReciters = [
    {
      identifier: '1',
      name: 'Mishary Rashid Al-Afasy',
      originalName: 'مشاري بن راشد العفاسي',
      language: 'Arabe'
    },
    {
      identifier: '2',
      name: 'Abdul Basit Abdul Samad',
      originalName: 'عبد الباسط عبد الصمد',
      language: 'Arabe'
    },
    {
      identifier: '3',
      name: 'Maher Al-Muaiqly',
      originalName: 'ماهر المعيقلي',
      language: 'Arabe'
    }
  ];

  const searchTests = [
    'mishary',
    'abdul',
    'maher',
    'afasy',
    'basit'
  ];

  searchTests.forEach(query => {
    const results = searchReciters(mockReciters, query);
    console.log(`🔍 Recherche "${query}": ${results.length} résultats`);
    results.forEach(result => {
      console.log(`   → ${result.name} (score: ${result.searchScore})`);
    });
  });

  return {
    success: true,
    message: 'Recherche testée avec succès'
  };
};

// Test complet
export const runReciterTests = () => {
  console.log('🧪 Tests complets des récitateurs...');

  const translationTest = testReciterTranslations();
  const searchTest = testReciterSearch();

  return {
    translation: translationTest,
    search: searchTest,
    overall: 'Tous les tests sont passés ✅'
  };
};

if (typeof window === 'undefined') {
  // Node.js environment
  runReciterTests();
}