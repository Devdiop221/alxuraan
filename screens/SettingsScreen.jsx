import React, { useContext } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function SettingsScreen() {
  const { theme, toggleTheme } = useTheme();

  return (
    <View className={`flex-1 justify-center items-center ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}>
      <Text className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
        Thème actuel : {theme}
      </Text>
      <TouchableOpacity
        onPress={toggleTheme}
        className="mt-5 p-3 bg-blue-500 rounded-lg">
        <Text className="text-white">Basculer le thème</Text>
      </TouchableOpacity>

      {/* Additional user account settings */}
      <View className="mt-10 w-full px-4">
        <Text className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
          Paramètres du compte
        </Text>
        <TouchableOpacity className="mt-3 p-3 bg-green-500 rounded-lg">
          <Text className="text-white">Modifier le profil</Text>
        </TouchableOpacity>
        <TouchableOpacity className="mt-3 p-3 bg-red-500 rounded-lg">
          <Text className="text-white">Déconnexion</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}