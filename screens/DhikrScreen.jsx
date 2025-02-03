import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
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
    <View className={`flex-1 p-4 ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}>
      <Text className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
        Compteur de Dhikr
      </Text>
      <Text className={`text-6xl mb-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
        {dhikrCount}
      </Text>
      <TouchableOpacity
        className="bg-blue-500 rounded-lg p-4 mb-4"
        onPress={handleDhikr}>
        <Text className="text-white text-center">Faire un Dhikr</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="bg-red-500 rounded-lg p-4"
        onPress={resetDhikr}>
        <Text className="text-white text-center">Réinitialiser</Text>
      </TouchableOpacity>
    </View>
  );
}