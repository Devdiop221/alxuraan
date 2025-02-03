import React from 'react';
import { Text } from 'react-native';

import { Colors } from './Colors';
import { FontFamily, FontSize } from './Fonts';

export const CustomText = ({
  children,
  size = 'md',
  color = 'text',
  weight = 'regular',
  italic = false,
  style = {},
}) => {
  // Mapping des poids et styles à la famille de polices Poppins
  const getFontFamily = () => {
    if (weight === 'bold' && italic) return FontFamily.Poppins.boldItalic;
    if (weight === 'bold') return FontFamily.Poppins.bold;
    if (italic) return FontFamily.Poppins.italic;
    return FontFamily.Poppins.regular;
  };

  return (
    <Text
      style={[
        {
          color: Colors[color] || color,
          fontSize: FontSize[size] || FontSize.md,
          fontFamily: getFontFamily(),
        },
        style,
      ]}
     >
      {children}
    </Text>
  );
};
