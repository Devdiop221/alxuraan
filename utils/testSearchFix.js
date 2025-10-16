// Test des corrections de recherche
import { searchReciters, normalizeForSearch, translateReciterName } from './reciterNames';

export const testSearchSafety = () => {
  console.log('🧪 Test de sécurité de la recherche...');

  // Test avec données invalides
  const invalidTests = [
    { reciters: null, query: 'test', description: 'reciters null' },
    { reciters: undefined, query: 'test', description: 'reciters undefined' },
    { reciters: 'invalid', query: 'test', description: 'reciters string' },
    { reciters: [], query: null, description: 'query null' },
    { reciters: [], query: undefined, description: 'query undefined' },
    { reciters: [], query: '', description: 'query vide' },
    { reciters: [], query: '   ', description: 'query espaces' },
  ];

  invalidTests.forEach(test => {
    try {
      const result = searchReciters(test.reciters, test.query);
      console.log(`✅ ${test.description}: ${Array.isArray(result) ? result.length : 'non-array'} résultats`);
    } catch (error) {
      console.error(`❌ ${test.description}: ${error.message}`);
    }
  });

  // Test avec récitateurs invalides
  const invalidReciters = [
    null,
    undefined,
    'string',
    123,
    { name: null },
    { originalName: null },
    {}
  ];

  try {
    const result = searchReciters(invalidReciters, 'test');
    console.log(`✅ Récitateurs invalides: ${result.length} résultats`);
  } catch (error) {
    console.error(`❌ Récitateurs invalides: ${error.message}`);
  }

  return { success: true, message: 'Tests de sécurité terminés' };
};

export const testNormalization = () => {
  console.log('🧪 Test de normalisation...');

  const testCases = [
    null,
    undefined,
    '',
    '   ',
    'Mishary Al-Afasy',
    'مشاري العفاسي',
    'Abdul-Basit',
    'Test with éàçents',
    123,
    {}
  ];

  testCases.forEach(testCase => {
    try {
      const result = normalizeForSearch(testCase);
      console.log(`✅ "${testCase}" → "${result}"`);
    } catch (error) {
      console.error(`❌ "${testCase}": ${error.message}`);
    }
  });

  return { success: true, message: 'Tests de normalisation terminés' };
};

export const testValidSearch = () => {
  console.log('🧪 Test de recherche valide...');

  const validReciters = [
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

  const searchQueries = [
    'mishary',
    'abdul',
    'maher',
    'afasy',
    'basit',
    'al',
    'arabe',
    'xyz' // Pas de résultat attendu
  ];

  searchQueries.forEach(query => {
    try {
      const results = searchReciters(validReciters, query);
      console.log(`🔍 "${query}": ${results.length} résultats`);
      results.forEach(result => {
        console.log(`   → ${result.displayName || result.name} (score: ${result.searchScore})`);
      });
    } catch (error) {
      console.error(`❌ Recherche "${query}": ${error.message}`);
    }
  });

  return { success: true, message: 'Tests de recherche valide terminés' };
};

export const runAllSearchTests = () => {
  console.log('🧪 Tests complets de recherche...');

  const safetyTest = testSearchSafety();
  const normalizationTest = testNormalization();
  const validSearchTest = testValidSearch();

  return {
    safety: safetyTest,
    normalization: normalizationTest,
    validSearch: validSearchTest,
    overall: 'Tous les tests de recherche terminés ✅'
  };
};

if (typeof window === 'undefined') {
  // Node.js environment
  runAllSearchTests();
}