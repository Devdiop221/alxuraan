import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

const Features = ({ features, onFeaturePress }) => {
  const renderFeatureIcon = (iconName) => {
    return <Feather name={iconName} size={24} color="white" />;
  };

  return (
    <View className="mx-4 mb-6 p-4 bg-white rounded-xl">
      <Text className="text-lg font-bold mb-4">Toutes les fonctionnalités</Text>
      <View className="flex-row flex-wrap justify-between">
        {features.map(feature => (
          <TouchableOpacity
            key={feature.id}
            className="w-16 items-center mb-4"
            onPress={() => onFeaturePress(feature.title)}
          >
            <View className="w-12 h-12 rounded-lg bg-teal-500 items-center justify-center mb-1">
              {renderFeatureIcon(feature.icon)}
            </View>
            <Text className="text-center text-xs">{feature.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default Features;