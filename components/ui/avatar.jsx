import { Image, View } from 'react-native';

export const Avatar = ({ source, size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <View className={`overflow-hidden rounded-full ${sizes[size]} ${className}`}>
      <Image source={source} className="h-full w-full" resizeMode="cover" />
    </View>
  );
};
