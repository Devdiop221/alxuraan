import AsyncStorage from '@react-native-async-storage/async-storage';

// Import collections metadata
const collectionsMetadata = require('../data/hadith/collections.json');

/**
 * Mapping entre les codes de langue et les préfixes dans collections.json
 */
const LANGUAGE_PREFIX_MAP = {
  'fr': 'fra',
  'ar': 'ara',
  'en': 'eng'
};

/**
 * Obtient l'URL CDN pour charger les données hadith
 * @param {string} collectionName - Nom de la collection (ex: 'bukhari', 'muslim')
 * @param {string} language - Code langue ('fr', 'ar', 'en')
 * @param {boolean} minified - Utiliser la version minifiée
 * @returns {string|null} - URL du CDN ou null si non trouvée
 */
const getHadithCDNUrl = (collectionName, language = 'fr', minified = true) => {
  // Normaliser le nom de la collection
  const normalizedName = collectionName.toLowerCase().replace('albukhari', 'bukhari');

  // Chercher dans les métadonnées
  const collection = collectionsMetadata[normalizedName];
  if (!collection) {
    console.warn(`Collection ${collectionName} non trouvée dans collections.json`);
    return null;
  }

  // Obtenir le préfixe de langue
  const langPrefix = LANGUAGE_PREFIX_MAP[language] || 'fra';

  // Trouver l'édition correspondante
  const edition = collection.collection.find(ed =>
    ed.language.toLowerCase() === (language === 'fr' ? 'french' : language === 'ar' ? 'arabic' : 'english')
  );

  if (!edition) {
    console.warn(`Langue ${language} non trouvée pour ${collectionName}`);
    return null;
  }

  return minified ? edition.linkmin : edition.link;
};

// Mapping des clés de collection vers les noms de fichiers
const COLLECTION_FILE_MAP = {
  'sahih-al-bukhari': 'bukhari',
  'sahih-bukhari': 'bukhari',
  'bukhari': 'bukhari',
  'albukhari': 'bukhari',
  'sahih-muslim': 'muslim',
  'muslim': 'muslim',
  'sunan-abu-dawood': 'abudawud',
  'abu-dawood': 'abudawud',
  'abudawud': 'abudawud',
  'sunan-an-nasai': 'nasai',
  'nasai': 'nasai',
  'sunan-ibn-majah': 'ibnmajah',
  'ibn-majah': 'ibnmajah',
  'ibnmajah': 'ibnmajah',
  'malik': 'malik',
  'muwatta-malik': 'malik',
  'nawawi': 'nawawi',
  'forty-nawawi': 'nawawi',
  'qudsi': 'qudsi',
  'hadith-qudsi': 'qudsi',
  'qodsi': 'qudsi',
  'dehlawi': 'dehlawi',
  'forty-dehlawi': 'dehlawi',
};

// Collections disponibles
const AVAILABLE_COLLECTIONS = [
  {
    name: "Sahih al-Bukhari",
    description: "La collection la plus authentique de hadiths",
    key: "sahih-al-bukhari",
    fileName: "bukhari"
  },
  {
    name: "Sahih Muslim",
    description: "La deuxième collection la plus authentique",
    key: "sahih-muslim",
    fileName: "muslim"
  },
  {
    name: "Sunan Abu Dawood",
    description: "Collection importante de hadiths juridiques",
    key: "sunan-abu-dawood",
    fileName: "abudawud"
  },
  {
    name: "Sunan an-Nasa'i",
    description: "Collection de hadiths sur le fiqh",
    key: "sunan-an-nasai",
    fileName: "nasai"
  },
  {
    name: "Sunan Ibn Majah",
    description: "L'une des six collections canoniques",
    key: "sunan-ibn-majah",
    fileName: "ibnmajah"
  },
  {
    name: "Muwatta Malik",
    description: "L'un des premiers recueils de hadiths",
    key: "malik",
    fileName: "malik"
  },
  {
    name: "Les 40 Hadiths de Nawawi",
    description: "40 hadiths fondamentaux de l'Islam",
    key: "nawawi",
    fileName: "nawawi"
  },
  {
    name: "Hadiths Qudsi",
    description: "Paroles sacrées transmises par le Prophète",
    key: "qudsi",
    fileName: "qudsi"
  },
  {
    name: "40 Hadiths de Dehlawi",
    description: "Collection de 40 hadiths sélectionnés",
    key: "dehlawi",
    fileName: "dehlawi"
  }
];

// Cache en mémoire pour les données chargées
let collectionsCache = {};

/**
 * Charge et met en cache une collection de hadiths depuis le CDN
 * @param {string} fileName - Nom du fichier (ex: 'albukhari', 'muslim')
 * @param {string} language - Langue ('ar' ou 'fr')
 * @returns {Promise<Object>} - Données de la collection
 */
const loadCollectionData = async (fileName, language = 'fr') => {
  const cacheKey = `${fileName}-${language}`;

  // Vérifier le cache en mémoire d'abord
  if (collectionsCache[cacheKey]) {
    console.log(`📦 Utilisation du cache mémoire pour: ${cacheKey}`);
    return collectionsCache[cacheKey];
  }

  // Vérifier le cache AsyncStorage
  const storageKey = `@hadith_cdn_${cacheKey}`;
  try {
    const cachedData = await AsyncStorage.getItem(storageKey);
    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      collectionsCache[cacheKey] = parsed;
      console.log(`📦 Utilisation du cache AsyncStorage pour: ${cacheKey}`);
      return parsed;
    }
  } catch (error) {
    console.warn('Erreur lors de la lecture du cache:', error);
  }

  // Charger depuis le CDN
  console.log(`🌐 Chargement depuis le CDN: ${cacheKey}`);
  const cdnUrl = getHadithCDNUrl(fileName, language, true);

  if (!cdnUrl) {
    console.error(`Collection ${fileName}-${language} non trouvée dans collections.json`);
    throw new Error(`Collection ${fileName} non disponible pour la langue ${language}`);
  }

  try {
    const response = await fetch(cdnUrl);

    if (!response.ok) {
      throw new Error(`Erreur HTTP ${response.status} lors du chargement de ${fileName}`);
    }

    const data = await response.json();

    // Mettre en cache
    collectionsCache[cacheKey] = data;

    // Sauvegarder dans AsyncStorage (de manière asynchrone, sans attendre)
    AsyncStorage.setItem(storageKey, JSON.stringify(data)).catch((err) =>
      console.warn('Erreur lors de la sauvegarde en cache:', err)
    );

    console.log(`✅ Collection chargée depuis CDN: ${cacheKey}`);
    return data;
  } catch (error) {
    console.error(`Erreur lors du chargement de ${fileName}-${language}:`, error);
    throw new Error(`Impossible de charger la collection ${fileName}: ${error.message}`);
  }
};

/**
 * Obtient le nom de fichier à partir de la clé de collection
 */
const getFileNameFromKey = (collectionKey) => {
  const normalizedKey = collectionKey.toLowerCase();
  return COLLECTION_FILE_MAP[normalizedKey] || normalizedKey;
};

/**
 * Combine les données arabes et françaises d'un hadith
 */
const combineHadithData = (frenchHadith, arabicHadith) => {
  if (!frenchHadith) return null;

  return {
    hadithnumber: frenchHadith.hadithnumber,
    arabicnumber: frenchHadith.arabicnumber,
    hadithArabic: arabicHadith?.text || '',
    hadithFrench: frenchHadith.text || '',
    text: frenchHadith.text, // Pour compatibilité
    translations: {
      ar: arabicHadith?.text || '',
      fr: frenchHadith.text || '',
      en: frenchHadith.text || '', // Fallback sur français
    },
    grades: frenchHadith.grades || [],
    reference: frenchHadith.reference || {},
    narrator: extractNarrator(frenchHadith.text),
    grade: getMainGrade(frenchHadith.grades),
  };
};

/**
 * Extrait le narrateur du texte du hadith
 */
const extractNarrator = (text) => {
  if (!text) return 'Non spécifié';

  // Cherche le pattern "Rapporté par X" ou "Narré par X"
  const match = text.match(/(?:Rapporté|Narré) par ([^:]+)/i);
  if (match && match[1]) {
    return match[1].trim();
  }

  return 'Non spécifié';
};

/**
 * Obtient le grade principal d'un hadith
 */
const getMainGrade = (grades) => {
  if (!grades || grades.length === 0) return 'Non classé';

  // Cherche le grade d'Al-Albani en priorité
  const albaniGrade = grades.find((g) => g.name === 'Al-Albani');
  if (albaniGrade) return albaniGrade.grade;

  // Sinon retourne le premier grade
  return grades[0].grade;
};

// Hadith Service avec données locales
const HadithService = {
  /**
   * Obtient toutes les collections disponibles
   */
  getCollections: async () => {
    try {
      // Charger les métadonnées de chaque collection
      const collectionsWithMeta = await Promise.all(
        AVAILABLE_COLLECTIONS.map(async (collection) => {
          try {
            const data = await loadCollectionData(collection.fileName, 'fr');
            return {
              ...collection,
              name: data.metadata?.name || collection.name,
              numberOfHadith: data.hadiths?.length || 0,
              totalBooks: Object.keys(data.metadata?.sections || {}).length,
            };
          } catch (error) {
            console.warn(`Impossible de charger ${collection.fileName}:`, error);
            return {
              ...collection,
              numberOfHadith: 0,
              totalBooks: 0,
            };
          }
        })
      );

      return {
        collections: collectionsWithMeta.filter(c => c.numberOfHadith > 0)
      };
    } catch (error) {
      console.error('Error fetching collections:', error);
      throw error;
    }
  },

  /**
   * Obtient une collection spécifique
   */
  getCollection: async (collectionKey) => {
    try {
      const fileName = getFileNameFromKey(collectionKey);
      const data = await loadCollectionData(fileName, 'fr');

      return {
        name: data.metadata?.name || collectionKey,
        sections: data.metadata?.sections || {},
        section_details: data.metadata?.section_details || {},
        totalHadith: data.hadiths?.length || 0,
      };
    } catch (error) {
      console.error(`Error fetching collection ${collectionKey}:`, error);
      throw error;
    }
  },

  /**
   * Obtient un hadith par son numéro
   */
  getHadithByNumber: async (collectionKey, hadithNumber, options = {}) => {
    try {
      const fileName = getFileNameFromKey(collectionKey);
      const language = options.language || 'fr';

      // Charger les deux versions
      const [frenchData, arabicData] = await Promise.all([
        loadCollectionData(fileName, 'fr'),
        loadCollectionData(fileName, 'ar')
      ]);

      // Trouver le hadith par numéro
      const frenchHadith = frenchData.hadiths?.find(h => h.hadithnumber === hadithNumber);
      const arabicHadith = arabicData.hadiths?.find(h => h.hadithnumber === hadithNumber);

      if (!frenchHadith) {
        throw new Error(`Hadith ${hadithNumber} non trouvé dans ${collectionKey}`);
      }

      const combined = combineHadithData(frenchHadith, arabicHadith);

      return {
        collection: collectionKey,
        hadithNumber: hadithNumber,
        ...combined,
        collectionInfo: {
          name: frenchData.metadata?.name || collectionKey,
          key: collectionKey,
        },
      };
    } catch (error) {
      console.error(`Error fetching hadith ${collectionKey}/${hadithNumber}:`, error);
      throw error;
    }
  },

  /**
   * Obtient un hadith aléatoire
   */
  getRandomHadith: async () => {
    try {
      // Choisir une collection aléatoire
      const randomCollection = AVAILABLE_COLLECTIONS[
        Math.floor(Math.random() * AVAILABLE_COLLECTIONS.length)
      ];

      const fileName = randomCollection.fileName;
      const [frenchData, arabicData] = await Promise.all([
        loadCollectionData(fileName, 'fr'),
        loadCollectionData(fileName, 'ar')
      ]);

      if (!frenchData.hadiths || frenchData.hadiths.length === 0) {
        throw new Error('Aucun hadith disponible');
      }

      // Choisir un hadith aléatoire
      const randomIndex = Math.floor(Math.random() * frenchData.hadiths.length);
      const frenchHadith = frenchData.hadiths[randomIndex];
      const arabicHadith = arabicData.hadiths?.find(
        h => h.hadithnumber === frenchHadith.hadithnumber
      );

      const combined = combineHadithData(frenchHadith, arabicHadith);

      return {
        hadith: {
          id: `${fileName}-${frenchHadith.hadithnumber}`,
          collection: randomCollection.name,
          collectionKey: randomCollection.key,
          book: `Livre ${frenchHadith.reference?.book || 1}`,
          chapter: getSectionName(frenchData.metadata, frenchHadith),
          ...combined,
        }
      };
    } catch (error) {
      console.error('Error fetching random hadith:', error);
      throw error;
    }
  },

  /**
   * Recherche de hadiths
   */
  searchHadiths: async (query, options = {}) => {
    try {
      const language = options.language || 'fr';
      const collection = options.collection || '';
      const page = options.page || 1;
      const limit = options.limit || 10;

      // Déterminer les collections à rechercher
      const collectionsToSearch = collection
        ? [AVAILABLE_COLLECTIONS.find(c => c.key === collection || c.fileName === getFileNameFromKey(collection))]
        : AVAILABLE_COLLECTIONS;

      const allResults = [];
      const searchTerms = query.toLowerCase().split(' ').filter(t => t.length > 2);

      // Rechercher dans chaque collection
      for (const coll of collectionsToSearch.filter(Boolean)) {
        try {
          const fileName = coll.fileName;
          const [frenchData, arabicData] = await Promise.all([
            loadCollectionData(fileName, 'fr'),
            loadCollectionData(fileName, 'ar')
          ]);

          // Rechercher dans les hadiths
          const matches = frenchData.hadiths?.filter(hadith => {
            const textToSearch = (hadith.text || '').toLowerCase();
            return searchTerms.some(term => textToSearch.includes(term));
          }) || [];

          // Combiner avec les données arabes
          const combinedMatches = matches.map(frenchHadith => {
            const arabicHadith = arabicData.hadiths?.find(
              h => h.hadithnumber === frenchHadith.hadithnumber
            );
            const combined = combineHadithData(frenchHadith, arabicHadith);

            return {
              collection: coll.key,
              hadithNumber: frenchHadith.hadithnumber,
              ...combined,
              collectionInfo: {
                name: frenchData.metadata?.name || coll.name,
                key: coll.key,
              },
            };
          });

          allResults.push(...combinedMatches);
        } catch (error) {
          console.warn(`Erreur lors de la recherche dans ${coll.fileName}:`, error);
        }
      }

      // Pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedResults = allResults.slice(startIndex, endIndex);

      return {
        results: paginatedResults,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(allResults.length / limit),
          totalResults: allResults.length,
        },
      };
    } catch (error) {
      console.error(`Error searching hadiths for "${query}":`, error);
      throw error;
    }
  },

  /**
   * Obtient les chapitres/sections d'une collection
   */
  getCollectionChapters: async (collectionKey) => {
    try {
      const fileName = getFileNameFromKey(collectionKey);
      const data = await loadCollectionData(fileName, 'fr');

      const sections = data.metadata?.sections || {};
      const sectionDetails = data.metadata?.section_details || {};

      const books = Object.keys(sections).map(sectionId => {
        const details = sectionDetails[sectionId] || {};
        // Calculer le nombre de hadiths dans cette section
        const numberOfHadith = details.hadithnumber_first && details.hadithnumber_last
          ? details.hadithnumber_last - details.hadithnumber_first + 1
          : 0;

        return {
          id: parseInt(sectionId),
          name: sections[sectionId],
          numberOfHadith,
          details,
        };
      });

      return {
        books,
        collection: {
          name: data.metadata?.name || collectionKey,
          key: collectionKey,
        },
      };
    } catch (error) {
      console.error(`Error fetching chapters for ${collectionKey}:`, error);
      throw error;
    }
  },

  /**
   * Obtient les hadiths d'un chapitre
   */
  getHadithsByChapter: async (collectionKey, chapterId, options = {}) => {
    try {
      const fileName = getFileNameFromKey(collectionKey);
      const language = options.language || 'fr';
      const page = options.page || 1;
      const limit = options.limit || 20;

      // Charger les données
      const [frenchData, arabicData] = await Promise.all([
        loadCollectionData(fileName, 'fr'),
        loadCollectionData(fileName, 'ar')
      ]);

      const sectionDetails = frenchData.metadata?.section_details?.[chapterId];

      if (!sectionDetails) {
        console.warn(`Section ${chapterId} non trouvée dans ${collectionKey}`);
        // Retourner tous les hadiths si la section n'est pas trouvée
        const allHadiths = frenchData.hadiths || [];
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;

        const paginatedHadiths = allHadiths.slice(startIndex, endIndex).map(frenchHadith => {
          const arabicHadith = arabicData.hadiths?.find(
            h => h.hadithnumber === frenchHadith.hadithnumber
          );
          const combined = combineHadithData(frenchHadith, arabicHadith);

          return {
            collection: collectionKey,
            hadithNumber: frenchHadith.hadithnumber,
            bookNumber: frenchHadith.reference?.book || 1,
            ...combined,
            collectionInfo: {
              name: frenchData.metadata?.name || collectionKey,
              key: collectionKey,
            },
          };
        });

        return {
          hadiths: paginatedHadiths,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(allHadiths.length / limit),
            totalResults: allHadiths.length,
          },
          chapter: {
            id: chapterId,
            name: frenchData.metadata?.sections?.[chapterId] || 'Chapitre inconnu',
          },
        };
      }

      // Filtrer les hadiths de cette section
      const { hadithnumber_first, hadithnumber_last } = sectionDetails;
      const chapterHadiths = frenchData.hadiths?.filter(
        h => h.hadithnumber >= hadithnumber_first && h.hadithnumber <= hadithnumber_last
      ) || [];

      // Pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedHadiths = chapterHadiths.slice(startIndex, endIndex);

      // Combiner avec les données arabes
      const combinedHadiths = paginatedHadiths.map(frenchHadith => {
        const arabicHadith = arabicData.hadiths?.find(
          h => h.hadithnumber === frenchHadith.hadithnumber
        );
        const combined = combineHadithData(frenchHadith, arabicHadith);

        return {
          collection: collectionKey,
          hadithNumber: frenchHadith.hadithnumber,
          bookNumber: frenchHadith.reference?.book || chapterId,
          ...combined,
          collectionInfo: {
            name: frenchData.metadata?.name || collectionKey,
            key: collectionKey,
          },
        };
      });

      return {
        hadiths: combinedHadiths,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(chapterHadiths.length / limit),
          totalResults: chapterHadiths.length,
        },
        chapter: {
          id: chapterId,
          name: frenchData.metadata?.sections?.[chapterId] || 'Chapitre inconnu',
          details: sectionDetails,
        },
      };
    } catch (error) {
      console.error(`Error fetching hadiths for chapter ${chapterId} in ${collectionKey}:`, error);
      throw error;
    }
  },
};

/**
 * Obtient le nom de la section pour un hadith
 */
const getSectionName = (metadata, hadith) => {
  if (!metadata?.section_details || !metadata?.sections) {
    return 'Chapitre inconnu';
  }

  const hadithNumber = hadith.hadithnumber;

  // Trouver la section qui contient ce hadith
  for (const [sectionId, details] of Object.entries(metadata.section_details)) {
    if (hadithNumber >= details.hadithnumber_first && hadithNumber <= details.hadithnumber_last) {
      return metadata.sections[sectionId] || 'Chapitre inconnu';
    }
  }

  return 'Chapitre inconnu';
};

export default HadithService;