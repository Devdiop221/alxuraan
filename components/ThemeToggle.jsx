import { Button, Text } from '@tamagui/core';
import React from 'react';

import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button onPress={toggleTheme} backgroundColor="gray" borderRadius={8} padding={16}>
      <Text fontSize={16} color={theme === 'light' ? 'black' : 'white'}>
        Basculer en mode {theme === 'light' ? 'sombre' : 'clair'}
      </Text>
    </Button>
  );
}
