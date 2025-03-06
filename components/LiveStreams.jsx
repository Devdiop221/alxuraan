import React from 'react';
import { View, Text, TouchableOpacity, Image, FlatList, Linking } from 'react-native';

const StreamItem = ({ item }) => (
  <TouchableOpacity
    className="mr-4 w-64 rounded-lg overflow-hidden"
    onPress={() => Linking.openURL(item.youtubeUrl)}
  >
    <View className="relative">
      <Image
        source={item.thumbnail}
        className="w-64 h-32 rounded-lg"
        defaultSource={require('../assets/images/stream-thumbnail-1.jpeg')}
      />
      {item.isLive && (
        <View className="absolute top-2 left-2 bg-red-500 px-2 py-0.5 rounded">
          <Text className="text-white text-xs font-bold">EN DIRECT</Text>
        </View>
      )}
      <View className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 rounded">
        <Text className="text-white text-xs">{item.viewers.toLocaleString()} spectateurs</Text>
      </View>
    </View>
    <Text className="text-white font-semibold mt-1">{item.title}</Text>
    <Text className="text-white text-opacity-80 text-sm">{item.speaker}</Text>
  </TouchableOpacity>
);

const LiveStreams = ({ streams }) => {
  return (
    <View className="mx-4 mb-6">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-white text-lg font-bold">Flux en direct des mosquées sacrées</Text>
        <TouchableOpacity>
          <Text className="text-white">Voir tout</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={streams}
        renderItem={({ item }) => <StreamItem item={item} />}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 8 }}
      />
    </View>
  );
};

export default LiveStreams;