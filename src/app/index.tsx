import { useState } from 'react';
import MeuPontos from '@/sections/MeusPontos';
import Produtos from '@/sections/Produtos';
import { Pressable, Text, View } from 'react-native';

export default function Index() {
  const [activeSection, setActiveSection] = useState<'points' | 'products'>('points');

  return (
    <View className="flex-1 bg-slate-950">
      <View className="flex-row border-b border-slate-800 px-5 pt-14">
        <Pressable
          className={`flex-1 items-center border-b-2 pb-4 ${
            activeSection === 'points' ? 'border-indigo-400' : 'border-transparent'
          }`}
          onPress={() => setActiveSection('points')}>
          <Text className={activeSection === 'points' ? 'font-semibold text-white' : 'text-slate-400'}>
            Meus Pontos
          </Text>
        </Pressable>
        <Pressable
          className={`flex-1 items-center border-b-2 pb-4 ${
            activeSection === 'products' ? 'border-indigo-400' : 'border-transparent'
          }`}
          onPress={() => setActiveSection('products')}>
          <Text className={activeSection === 'products' ? 'font-semibold text-white' : 'text-slate-400'}>
            Produtos
          </Text>
        </Pressable>
      </View>

      {activeSection === 'points' ? <MeuPontos /> : <Produtos />}
    </View>
  );
}
