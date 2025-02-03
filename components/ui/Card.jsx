import React from 'react';
import { View } from 'react-native';

import { Colors } from './Colors';

export const CustomCard = ({ children, style = {}, elevation = 2}) => {
  return (
    <View
      style={[
        {
          backgroundColor: Colors.background,
          borderRadius: 10,
          padding: 15,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: elevation },
          shadowOpacity: 0.1,
          shadowRadius: elevation,
          elevation,
          borderWidth: 1,
          borderColor: Colors.border,
        },
        style,
      ]}
      >
      {children}
    </View>
  );
};
