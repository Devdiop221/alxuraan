import React, { useState } from 'react';
import { SafeAreaView } from 'react-native';


import { CustomButton } from '../components/ui/Button';
import { Colors } from '../components/ui/Colors';
import { CustomText } from '../components/ui/Typography';
import { useTheme } from '../context/ThemeContext';

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
    <SafeAreaView
      style={{
        flex: 1,
        padding: 16,
        backgroundColor: theme === 'dark' ? Colors.background : Colors.background,
      }}>
      <CustomText
        size="2xl"
        weight="bold"
        style={{ marginBottom: 16 }}
        color={theme === 'dark' ? Colors.text : Colors.text}>
        Compteur de Dhikr
      </CustomText>
      <CustomText
        size="6xl"
        style={{ marginBottom: 16 }}
        color={theme === 'dark' ? Colors.text : Colors.text}>
        {dhikrCount}
      </CustomText>
      <CustomButton onPress={handleDhikr} variant="primary" style={{ marginBottom: 16 }}>
        Faire un Dhikr
      </CustomButton>
      <CustomButton onPress={resetDhikr} variant="secondary">
        Réinitialiser
      </CustomButton>
    </SafeAreaView>
  );
}
