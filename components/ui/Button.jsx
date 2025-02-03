// components/ui/Button.js
import React from 'react';
import { TouchableOpacity } from 'react-native';

import { Colors } from './Colors';
import { CustomText } from './Typography';

export const CustomButton = ({
  children,
  onPress,
  variant = 'primary',
  disabled = false,
  style = {},
  textStyle = {},
}) => {
  const variantStyles = {
    primary: {
      backgroundColor: disabled ? Colors.disabled : Colors.primary,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    secondary: {
      backgroundColor: disabled ? Colors.disabled : Colors.secondary,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: disabled ? Colors.disabled : Colors.primary,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
  };

  return (
    <TouchableOpacity
      onPress={!disabled ? onPress : null}
      style={[variantStyles[variant] || variantStyles.primary, style]}
      >
      <CustomText
        color={variant === 'outline' ? 'primary' : 'background'}
        weight="semibold"
        style={textStyle}>
        {children}
      </CustomText>
    </TouchableOpacity>
  );
};
