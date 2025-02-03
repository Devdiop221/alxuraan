import React from 'react';
import { ActivityIndicator, View } from 'react-native';

import { Colors } from './Colors';

export const CustomLoadingIndicator = ({
  size = 'large',
  color = 'primary',
  style = {},
}) => {
  return (
    <View
      style={[
        {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        },
        style,
      ]}>
      <ActivityIndicator size={size} color={Colors[color] || color}/>
    </View>
  );
};
