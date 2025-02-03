import React, { useContext } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// Importation des composants personnalisés
import { CustomText } from "../components/ui/Typography";
import { Colors } from "../components/ui/Colors";

export default function SettingsScreen() {
  const { theme, toggleTheme } = useTheme();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme === 'dark' ? Colors.background : Colors.background }}>
      <CustomText size="2xl" weight="bold" style={{ marginBottom: 16 }} color={theme === 'dark' ? Colors.text : Colors.text}>
        Thème actuel : {theme}
      </CustomText>
      <TouchableOpacity
        onPress={toggleTheme}
        style={{ marginTop: 20, padding: 12, backgroundColor: Colors.primary, borderRadius: 8 }}>
        <CustomText color={Colors.background}>Basculer le thème</CustomText>
      </TouchableOpacity>

      {/* Additional user account settings */}
      <View style={{ marginTop: 40, width: '100%', paddingHorizontal: 16 }}>
        <CustomText size="xl" weight="bold" style={{ marginBottom: 16 }} color={theme === 'dark' ? Colors.text : Colors.text}>
          Paramètres du compte
        </CustomText>
        <TouchableOpacity style={{ marginTop: 12, padding: 12, backgroundColor: Colors.success, borderRadius: 8 }}>
          <CustomText color={Colors.background}>Modifier le profil</CustomText>
        </TouchableOpacity>
        <TouchableOpacity style={{ marginTop: 12, padding: 12, backgroundColor: Colors.error, borderRadius: 8 }}>
          <CustomText color={Colors.background}>Déconnexion</CustomText>
        </TouchableOpacity>
      </View>
    </View>
  );
}