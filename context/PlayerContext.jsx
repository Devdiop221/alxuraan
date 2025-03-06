import React, { createContext, useContext, useState } from 'react';

const PlayerContext = createContext();

export function PlayerProvider({ children }) {
  const [currentAudio, setCurrentAudio] = useState(null);

  const playAudio = (audioUrl, surahName, surahNumber) => {
    setCurrentAudio({
      audioUrl,
      surahName,
      surahNumber,
    });
  };

  const closePlayer = () => {
    setCurrentAudio(null);
  };

  return (
    <PlayerContext.Provider value={{ currentAudio, playAudio, closePlayer }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer doit être utilisé à l\'intérieur d\'un PlayerProvider');
  }
  return context;
}