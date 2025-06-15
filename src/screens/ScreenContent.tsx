import { Text, Image, Pressable, View } from 'react-native';

import { LineChart } from 'react-native-chart-kit';

export const ScreenContent = () => {
  const onPressFunction = () => {
    console.log('Button Pressed!');
  };
  return (
    <View className="flex flex-1 flex-col items-center justify-center gap-4 border bg-white">
      <Text className="text-xl font-bold">Welcome to Togheta</Text>
      <Image className="h-36 w-36 rounded-full" source={require('../../assets/image.png')} />
      <Pressable onPress={onPressFunction} className="rounded-lg bg-blue-500 px-4 py-2">
        <Text className="text-white">I'm pressable!</Text>
      </Pressable>
    </View>
  );
};
const styles = {
  container: `items-center flex-1 justify-center`,
  separator: `h-[1px] my-7 w-4/5 bg-gray-200`,
  title: `text-xl font-bold text-red-500`,
};
