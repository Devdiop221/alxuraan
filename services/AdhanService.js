import { Audio } from 'expo-audio';

// Liste des adhans disponibles avec leurs URLs
const ADHANS = {
  makkah: {
    name: "Adhan Makkah",
    url: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3"
  },
  madinah: {
    name: "Adhan Madinah",
    url: "https://server8.mp3quran.net/ayyub/001.mp3"
  },
  alAqsa: {
    name: "Adhan Al-Aqsa",
    url: "https://server12.mp3quran.net/maher/001.mp3"
  },
  mischari: {
    name: "Sheikh Mishary Rashid Alafasy",
    url: "https://server7.mp3quran.net/basit/001.mp3"
  }
};

class AdhanService {
  constructor() {
    this.sound = null;
    this.isPlaying = false;
    this.selectedAdhan = 'makkah';
    this.loadingPromise = null;
  }

  // Initialiser le son avec retry
  async loadSound(adhanType = 'makkah', retryCount = 3) {
    try {
      // Si un chargement est déjà en cours, attendez qu'il se termine
      if (this.loadingPromise) {
        await this.loadingPromise;
        return;
      }

      this.loadingPromise = (async () => {
        if (this.sound) {
          await this.sound.unloadAsync();
          this.sound = null;
        }

        // Configurer le mode audio avant de charger le son
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
          playThroughEarpieceAndroid: false,
        });

        let lastError;
        for (let i = 0; i < retryCount; i++) {
          try {
            const { sound } = await Audio.Sound.createAsync(
              { uri: ADHANS[adhanType].url },
              { shouldPlay: false },
              (status) => {
                if (status.error) {
                  console.error('Erreur de lecture:', status.error);
                }
              },
              true
            );

            this.sound = sound;
            this.selectedAdhan = adhanType;
            return;
          } catch (error) {
            lastError = error;
            console.warn(`Tentative ${i + 1}/${retryCount} échouée:`, error);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Attendre 1s avant de réessayer
          }
        }
        throw lastError;
      })();

      await this.loadingPromise;
    } catch (error) {
      console.error('Erreur lors du chargement de l\'adhan:', error);
      throw new Error(`Impossible de charger l'adhan: ${error.message}`);
    } finally {
      this.loadingPromise = null;
    }
  }

  // Jouer l'adhan
  async playAdhan() {
    try {
      if (!this.sound) {
        await this.loadSound(this.selectedAdhan);
      }

      const status = await this.sound.getStatusAsync();

      if (status.isLoaded) {
        if (status.isPlaying) {
          await this.sound.stopAsync();
        }
        await this.sound.setPositionAsync(0);
        await this.sound.playAsync();
        this.isPlaying = true;

        // Écouter la fin de la lecture
        this.sound.setOnPlaybackStatusUpdate(async (status) => {
          if (status.didJustFinish) {
            this.isPlaying = false;
            await this.sound.unloadAsync();
            this.sound = null;
          }
        });
      } else {
        // Si le son n'est pas chargé, réessayer de le charger
        await this.loadSound(this.selectedAdhan);
        await this.playAdhan();
      }
    } catch (error) {
      console.error('Erreur lors de la lecture de l\'adhan:', error);
      // Essayer de recharger le son en cas d'erreur
      this.sound = null;
      throw error;
    }
  }

  // Arrêter l'adhan
  async stopAdhan() {
    try {
      if (this.sound) {
        const status = await this.sound.getStatusAsync();
        if (status.isLoaded && status.isPlaying) {
          await this.sound.stopAsync();
        }
        await this.sound.unloadAsync();
        this.sound = null;
        this.isPlaying = false;
      }
    } catch (error) {
      console.error('Erreur lors de l\'arrêt de l\'adhan:', error);
      this.sound = null;
      throw error;
    }
  }

  // Changer le type d'adhan
  async changeAdhan(adhanType) {
    if (ADHANS[adhanType]) {
      await this.stopAdhan();
      await this.loadSound(adhanType);
    }
  }

  // Obtenir la liste des adhans disponibles
  getAvailableAdhans() {
    return Object.entries(ADHANS).map(([key, value]) => ({
      id: key,
      ...value
    }));
  }

  // Nettoyer les ressources
  async cleanup() {
    try {
      await this.stopAdhan();
    } catch (error) {
      console.error('Erreur lors du nettoyage:', error);
    }
  }
}

export default new AdhanService();