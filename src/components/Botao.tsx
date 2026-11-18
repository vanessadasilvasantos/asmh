import { Text, View, Pressable} from 'react-native';

export default function Botao() {
  return (
    <View className="flex-1 items-center justify-center bg-blue-500">
      <Pressable>
        <Text className="text-xl font-bold text-white">Hello World</Text>
      </Pressable>
    </View>
  );
}
