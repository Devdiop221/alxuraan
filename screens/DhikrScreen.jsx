import React, { useState } from 'react';
import { SafeAreaView, View } from "react-native";
import { useTheme } from '../context/ThemeContext';

// Importation des composants personnalisés
import { CustomButton } from "../components/ui/Button";
import { CustomText } from "../components/ui/Typography";
import { Colors } from "../components/ui/Colors";

export default function DhikrScreen() {
  const { theme } = useTheme();
  const [dhikrCount, setDhikrCount] = useState(0);

  const handleDhikr = () => {
    setDhikrCount((prev) => prev + 1);
  };

  const resetDhikr = () => {
    setDhikrCount(0);
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 16, backgroundColor: theme === 'dark' ? Colors.background : Colors.background }}>
      <CustomText size="2xl" weight="bold" style={{ marginBottom: 16 }} color={theme === 'dark' ? Colors.text : Colors.text}>
        Compteur de Dhikr
      </CustomText>
      <CustomText size="6xl" style={{ marginBottom: 16 }} color={theme === 'dark' ? Colors.text : Colors.text}>
        {dhikrCount}
      </CustomText>
      <CustomButton
        onPress={handleDhikr}
        variant="primary"
        style={{ marginBottom: 16 }}>
        Faire un Dhikr
      </CustomButton>
      <CustomButton
        onPress={resetDhikr}
        variant="secondary">
        Réinitialiser
      </CustomButton>
    </SafeAreaView>
  );
}