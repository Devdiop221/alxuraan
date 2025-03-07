import React from 'react';
import { View, Text, TouchableOpacity, Image, FlatList, Linking } from 'react-native';

const StreamItem = ({ item }) => (
  <TouchableOpacity
    className="mr-4 w-64 overflow-hidden rounded-lg"
    onPress={() => Linking.openURL(item.youtubeUrl)}>
    <View className="relative">
      <Image
        source={item.thumbnail}
        className="h-32 w-64 rounded-lg"
        defaultSource={require('../assets/images/stream-thumbnail-1.jpeg')}
      />
      {item.isLive && (
        <View className="absolute left-2 top-2 rounded bg-red-500 px-2 py-0.5">
          <Text className="text-xs font-bold text-white">EN DIRECT</Text>
        </View>
      )}
      <View className="absolute bottom-2 left-2 rounded bg-black bg-opacity-50 px-2">
        <Text className="text-xs text-white">{item.viewers.toLocaleString()} spectateurs</Text>
      </View>
    </View>
    <Text className="mt-1 font-semibold text-white">{item.title}</Text>
    <Text className="text-sm text-white text-opacity-80">{item.speaker}</Text>
  </TouchableOpacity>
);

const LiveStreams = ({ streams }) => {
  return (
    <View className="mx-4 mb-6">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-lg font-bold text-white">Flux en direct des mosquées sacrées</Text>
        <TouchableOpacity>
          <Text className="text-white">Voir tout</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={streams}
        renderItem={({ item }) => <StreamItem item={item} />}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 8 }}
      />
    </View>
  );
};

export default LiveStreams;
