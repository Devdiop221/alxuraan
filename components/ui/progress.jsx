import { View } from 'react-native';

export const Progress = ({ value, max = 100, className = '' }) => {
  const percentage = (value / max) * 100;

  return (
    <View className={`h-2 w-full overflow-hidden rounded-full bg-gray-200 ${className}`}>
      <View className="h-full rounded-full bg-gray-900" style={{ width: `${percentage}%` }} />
    </View>
  );
};
