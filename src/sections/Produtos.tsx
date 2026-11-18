import { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { useProductivity } from '@/providers/ProductivityProvider';

export default function Produtos() {
  const { balance, products, addProduct, redeemProduct, deleteProduct } = useProductivity();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');

  useEffect(() => {
    if (!isModalVisible) {
      setName('');
      setCost('');
    }
  }, [isModalVisible]);

  function handleAddProduct() {
    const parsedCost = Number(cost);

    if (!name.trim() || !Number.isInteger(parsedCost) || parsedCost <= 0) {
      Alert.alert('Revise o produto', 'Informe um nome e uma quantidade inteira de pontos maior que zero.');
      return;
    }

    addProduct({ name, cost: parsedCost });
    setIsModalVisible(false);
  }

  function handleRedeem(productId: string, productName: string, productCost: number) {
    if (balance < productCost) {
      Alert.alert('Pontos insuficientes', 'Conclua mais tarefas para resgatar este produto.');
      return;
    }

    Alert.alert('Confirmar resgate', `Usar ${productCost} pontos para resgatar “${productName}”?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Resgatar',
        style: 'destructive',
        onPress: () => {
          if (redeemProduct(productId)) {
            Alert.alert('Resgate realizado', `“${productName}” foi resgatado com sucesso.`);
          }
        },
      },
    ]);
  }

  function handleDeleteProduct(productId: string, productName: string) {
    Alert.alert('Excluir produto', `Deseja excluir “${productName}”?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => deleteProduct(productId),
      },
    ]);
  }

  return (
    <ScrollView className="flex-1" contentContainerClassName="gap-6 px-5 py-6 pb-12">
      <View className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
        <Text className="text-sm font-medium text-slate-400">Saldo para resgates</Text>
        <Text className="mt-1 text-3xl font-bold text-white">{balance} pontos</Text>
      </View>

      <Pressable className="items-center rounded-2xl bg-white py-4" onPress={() => setIsModalVisible(true)}>
        <Text className="font-semibold text-slate-950">+ Adicionar produto</Text>
      </Pressable>

      <View className="gap-3">
        <Text className="text-lg font-bold text-white">Seus produtos</Text>
        {products.length === 0 ? (
          <View className="rounded-2xl border border-dashed border-slate-700 p-5">
            <Text className="text-center text-slate-400">Cadastre uma recompensa para começar.</Text>
          </View>
        ) : (
          products.map((product) => (
            <View key={product.id} className="gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-4">
              <View>
                <Text className="text-base font-semibold text-white">{product.name}</Text>
                <Text className="mt-1 text-sm text-indigo-300">{product.cost} pontos</Text>
              </View>
              <View className="flex-row gap-3">
                <Pressable
                  className={`flex-1 items-center rounded-xl py-3 ${balance >= product.cost ? 'bg-indigo-500' : 'bg-slate-800'}`}
                  onPress={() => handleRedeem(product.id, product.name, product.cost)}>
                  <Text className={balance >= product.cost ? 'font-semibold text-white' : 'font-semibold text-slate-500'}>
                    Resgatar
                  </Text>
                </Pressable>
                <Pressable
                  className="items-center justify-center rounded-xl border border-rose-400/40 px-4"
                  onPress={() => handleDeleteProduct(product.id, product.name)}>
                  <Text className="font-semibold text-rose-300">Excluir</Text>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </View>

      <Modal animationType="slide" transparent visible={isModalVisible} onRequestClose={() => setIsModalVisible(false)}>
        <View className="flex-1 justify-end bg-black/60">
          <View className="gap-5 rounded-t-3xl bg-slate-900 px-5 pb-10 pt-6">
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-bold text-white">Novo produto</Text>
              <Pressable onPress={() => setIsModalVisible(false)}><Text className="text-slate-400">Cancelar</Text></Pressable>
            </View>
            <TextInput
              className="rounded-xl bg-slate-800 px-4 py-4 text-white"
              placeholder="Nome do produto"
              placeholderTextColor="#94A3B8"
              value={name}
              onChangeText={setName}
              autoFocus
            />
            <TextInput
              className="rounded-xl bg-slate-800 px-4 py-4 text-white"
              placeholder="Pontos necessários"
              placeholderTextColor="#94A3B8"
              value={cost}
              onChangeText={setCost}
              keyboardType="number-pad"
            />
            <Pressable className="items-center rounded-xl bg-indigo-500 py-4" onPress={handleAddProduct}>
              <Text className="font-bold text-white">Salvar produto</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
