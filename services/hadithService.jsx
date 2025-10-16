import AsyncStorage from '@react-native-async-storage/async-storage';

// API Constants
const RAPID_API_KEY = '0531dd984amsha2e296452693364p1bb81djsnbd9dc9624ece'; // Replace with your actual RapidAPI key
const RAPID_API_HOST = 'hadith2.p.rapidapi.com';
const BASE_URL = 'https://hadith2.p.rapidapi.com';

// Default headers for all API requests
const getHeaders = () => {
  return {
    'X-RapidAPI-Key': RAPID_API_KEY,
    'X-RapidAPI-Host': RAPID_API_HOST,
    'Content-Type': 'application/json',
  };
};

// Utility function to make API requests with robust error handling
const apiRequest = async (endpoint, options = {}) => {
  try {
    // Check for cached data first
    const cacheKey = `@hadith_cache_${endpoint}`;
    const cachedData = await AsyncStorage.getItem(cacheKey);

    // If we have valid cached data, return it
    if (cachedData) {
      const parsedData = JSON.parse(cachedData);
      // Check if cache is still valid (less than 24 hours old)
      if (parsedData.timestamp && Date.now() - parsedData.timestamp < 24 * 60 * 60 * 1000) {
        console.log('📦 Utilisation du cache pour:', endpoint);
        return parsedData.data;
      }
    }

    // Make the API request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 secondes timeout

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: getHeaders(),
      signal: controller.signal,
      ...options,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // Gestion spécifique des erreurs 504 (Gateway Timeout)
      if (response.status === 504) {
        console.warn('⚠️ Timeout du serveur (504), utilisation du cache ou fallback');

        // Essayer d'utiliser un cache expiré si disponible
        if (cachedData) {
          const parsedData = JSON.parse(cachedData);
          console.log('📦 Utilisation du cache expiré pour:', endpoint);
          return parsedData.data;
        }

        throw new Error(`Server timeout (504) - Service temporairement indisponible`);
      }

      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    // Cache the successful response
    const cacheData = {
      timestamp: Date.now(),
      data: data,
    };
    await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));

    console.log('✅ Données récupérées et mises en cache pour:', endpoint);

    return data;
  } catch (error) {
    console.error(`Error in API request to ${endpoint}:`, error);

    // En cas d'erreur, essayer de retourner des données de fallback
    if (endpoint === '/collection') {
      console.log('🔄 Utilisation des données de fallback pour les collections');
      return getFallbackCollections();
    }

    if (endpoint.includes('/random')) {
      console.log('🔄 Utilisation du hadith de fallback');
      return getFallbackRandomHadith();
    }

    throw error;
  }
};

// Données de fallback pour les collections
const getFallbackCollections = () => ({
  collections: [
    {
      name: "Sahih al-Bukhari",
      numberOfHadith: 7277,
      totalBooks: 97,
      key: "sahih-al-bukhari"
    },
    {
      name: "Sahih Muslim",
      numberOfHadith: 7459,
      totalBooks: 57,
      key: "sahih-muslim"
    },
    {
      name: "Sunan Abu Dawood",
      numberOfHadith: 5274,
      totalBooks: 43,
      key: "sunan-abu-dawood"
    },
    {
      name: "Jami at-Tirmidhi",
      numberOfHadith: 3956,
      totalBooks: 49,
      key: "jami-at-tirmidhi"
    },
    {
      name: "Sunan an-Nasa'i",
      numberOfHadith: 5761,
      totalBooks: 51,
      key: "sunan-an-nasai"
    },
    {
      name: "Sunan Ibn Majah",
      numberOfHadith: 4341,
      totalBooks: 37,
      key: "sunan-ibn-majah"
    }
  ]
});

// Hadith de fallback
const getFallbackRandomHadith = () => ({
  hadith: {
    id: "fallback-1",
    text: "Le Prophète (que la paix et les bénédictions d'Allah soient sur lui) a dit : « Les actions ne valent que par les intentions, et chacun n'aura que ce qu'il a eu l'intention de faire. »",
    reference: "Sahih al-Bukhari 1, Sahih Muslim 1907",
    collection: "Sahih al-Bukhari",
    book: "Livre de la Révélation",
    chapter: "Comment la révélation a commencé",
    narrator: "Umar ibn al-Khattab",
    grade: "Sahih (Authentique)",
    language: "fr"
  }
});

// Hadith Service with RapidAPI integration
const HadithService = {
  // Get all available collections
  getCollections: async () => {
    try {
      const response = await apiRequest('/collection');
      console.log("Collections", response);

      // Retourner directement la réponse de l'API
      return response;

    } catch (error) {
      console.error('Error fetching collections:', error);
      throw error;
    }
  },

  // Get a specific collection
  getCollection: async (collectionKey) => {
    try {
      const response = await apiRequest(`/collection/${collectionKey}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching collection ${collectionKey}:`, error);
      throw error;
    }
  },

  // Get hadith by number within a collection
  getHadithByNumber: async (collectionKey, hadithNumber, options = {}) => {
    try {
      const language = options.language || 'en';
      const response = await apiRequest(
        `/hadith/${collectionKey}/${hadithNumber}?language=${language}`
      );

      // Transform to our app format
      return {
        collection: collectionKey,
        hadithNumber: hadithNumber,
        hadithArabic: response.data.text.ar || response.data.text.arabic || '',
        translations: {
          ar: response.data.text.ar || response.data.text.arabic || '',
          en: response.data.text.en || response.data.text.english || '',
          fr: response.data.text.fr || response.data.text.french || '',
        },
        narrator: response.data.narrator || 'Unknown',
        grade: response.data.grade || 'Unknown',
        collectionInfo: {
          name: response.data.collection || collectionKey,
          key: collectionKey,
        },
      };
    } catch (error) {
      console.error(`Error fetching hadith ${collectionKey}/${hadithNumber}:`, error);
      throw error;
    }
  },

  // Get a random hadith
  getRandomHadith: async () => {
    try {
      // Ajout d'un timestamp pour éviter la mise en cache
      const timestamp = Date.now();
      const response = await apiRequest(`/random?t=${timestamp}`);
      console.log('Réponse API random hadith:', response);

      // Retourner directement la réponse de l'API
      return response;

    } catch (error) {
      console.error('Error fetching random hadith:', error);
      throw error;
    }
  },

  // Search hadiths
  searchHadiths: async (query, options = {}) => {
    try {
      const language = options.language || 'en';
      const collection = options.collection || '';
      const page = options.page || 1;
      const limit = options.limit || 10;

      let endpoint = `/search?q=${encodeURIComponent(query)}&language=${language}&page=${page}&limit=${limit}`;
      if (collection) {
        endpoint += `&collection=${collection}`;
      }

      const response = await apiRequest(endpoint);

      // Transform to our app format
      return {
        results: response.data.hadiths.map((hadith) => ({
          collection: hadith.collection.id || 'unknown',
          hadithNumber: hadith.number || 1,
          hadithArabic: hadith.text.ar || hadith.text.arabic || '',
          translations: {
            ar: hadith.text.ar || hadith.text.arabic || '',
            en: hadith.text.en || hadith.text.english || '',
            fr: hadith.text.fr || hadith.text.french || '',
          },
          narrator: hadith.narrator || 'Unknown',
          grade: hadith.grade || 'Unknown',
          collectionInfo: {
            name: hadith.collection.name || 'Unknown Collection',
            key: hadith.collection.id || 'unknown',
          },
        })),
        pagination: response.data.pagination || {
          currentPage: page,
          totalPages: 1,
          totalResults: response.data.hadiths.length,
        },
      };
    } catch (error) {
      console.error(`Error searching hadiths for "${query}":`, error);
      throw error;
    }
  },

  // Get chapters/books for a collection
  getCollectionChapters: async (collectionKey) => {
    try {
      const response = await apiRequest(`/collection/${collectionKey}/books`);
      console.log('Réponse API collection books:', response);
      return response;
    } catch (error) {
      console.error(`Error fetching chapters for ${collectionKey}:`, error);
      throw error;
    }
  },

  // Get hadiths by chapter/book
  getHadithsByChapter: async (collectionKey, chapterId, options = {}) => {
    try {
      const language = options.language || 'en';
      const page = options.page || 1;
      const limit = options.limit || 20;

      const response = await apiRequest(
        `/collection/${collectionKey}/book/${chapterId}?language=${language}&page=${page}&limit=${limit}`
      );

      return {
        hadiths: response.data.hadiths.map((hadith) => ({
          collection: collectionKey,
          hadithNumber: hadith.number || 1,
          hadithArabic: hadith.text.ar || hadith.text.arabic || '',
          translations: {
            ar: hadith.text.ar || hadith.text.arabic || '',
            en: hadith.text.en || hadith.text.english || '',
            fr: hadith.text.fr || hadith.text.french || '',
          },
          narrator: hadith.narrator || 'Unknown',
          grade: hadith.grade || 'Unknown',
          collectionInfo: {
            name: response.data.collection.name || collectionKey,
            key: collectionKey,
          },
        })),
        pagination: response.data.pagination || {
          currentPage: page,
          totalPages: 1,
          totalResults: response.data.hadiths.length,
        },
        chapter: response.data.book || { name: 'Unknown Chapter' },
      };
    } catch (error) {
      console.error(`Error fetching hadiths for chapter ${chapterId} in ${collectionKey}:`, error);
      throw error;
    }
  },
};

export default HadithService;
