import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import ConfettiBurst from '@/components/ConfettiBurst';
import { difficultyLabels, useProductivity } from '@/providers/ProductivityProvider';
import type { Difficulty } from '@/types/productivity';

const taskColors = ['#818CF8', '#34D399', '#FBBF24', '#FB7185', '#38BDF8'];

const dailyMotivations = [
  'Você cumpriu tudo o que planejou. Aproveite essa conquista.',
  'Consistência é o que transforma metas em resultados.',
  'Mais um dia vencido. Seu futuro agradece.',
  'Pequenas ações, grandes avanços. Continue assim!',
  'Disciplina feita hoje, liberdade construída amanhã.',
  'Você honrou seus compromissos. Isso é progresso de verdade.',
  'Que orgulho: todas as prioridades do dia estão concluídas.',
];

function getToday() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function getTodayLabel() {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  }).format(new Date());
}

function getDailyMotivation() {
  const today = new Date();
  const dayNumber = Math.floor(
    Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) / (1000 * 60 * 60 * 24),
  );

  return dailyMotivations[dayNumber % dailyMotivations.length];
}

export default function MeuPontos() {
  const { balance, tasks, isReady, addTask, toggleTask, deleteTask } = useProductivity();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [color, setColor] = useState(taskColors[0]);
  const [points, setPoints] = useState('');
  const [confettiTrigger, setConfettiTrigger] = useState(0);

  const todayTasks = useMemo(
    () =>
      tasks
        .filter((task) => task.createdAt === getToday())
        .sort((firstTask, secondTask) => Number(firstTask.completed) - Number(secondTask.completed)),
    [tasks],
  );
  const allTasksCompleted = todayTasks.length > 0 && todayTasks.every((task) => task.completed);

  useEffect(() => {
    if (!isModalVisible) {
      setTitle('');
      setDifficulty('easy');
      setColor(taskColors[0]);
      setPoints('');
    }
  }, [isModalVisible]);

  function handleAddTask() {
    const parsedPoints = Number(points);

    if (!title.trim() || !Number.isInteger(parsedPoints) || parsedPoints <= 0) {
      Alert.alert('Revise a tarefa', 'Informe um nome e uma quantidade inteira de pontos maior que zero.');
      return;
    }

    addTask({ title, difficulty, color, points: parsedPoints });
    setIsModalVisible(false);
  }

  function handleToggleTask(taskId: string) {
    const task = tasks.find((item) => item.id === taskId);
    const wasCompleted = task?.completed;
    const result = toggleTask(taskId);

    if (result.success && task && !wasCompleted) {
      setConfettiTrigger((current) => current + 1);
    }

  }

  function handleDeleteTask(taskId: string, taskTitle: string) {
    Alert.alert('Excluir tarefa', `Deseja excluir “${taskTitle}”?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          const result = deleteTask(taskId);

          if (!result.success && result.reason === 'insufficient-balance') {
            Alert.alert(
              'Não é possível excluir',
              'Os pontos dessa tarefa já foram usados em um resgate.',
            );
          }
        },
      },
    ]);
  }

  if (!isReady) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color="#A5B4FC" />
      </View>
    );
  }

  return (
    <View className="flex-1">
      <ScrollView className="flex-1" contentContainerClassName="gap-6 px-5 py-6 pb-12">
        <View className="overflow-hidden rounded-3xl bg-indigo-500 p-6">
        <Text className="text-sm capitalize text-indigo-100">{getTodayLabel()}</Text>
        <Text className="text-sm font-medium text-indigo-100">Saldo disponível</Text>
        <Text className="mt-2 text-4xl font-bold text-white">{balance} pontos</Text>
        <Text className="mt-5 text-sm text-indigo-100">Use seus pontos para resgatar recompensas.</Text>
        </View>

        <Pressable className="items-center rounded-2xl bg-white py-4" onPress={() => setIsModalVisible(true)}>
        <Text className="font-semibold text-slate-950">+ Adicionar tarefa</Text>
        </Pressable>

        <View className="gap-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-bold text-white">Tarefas de hoje</Text>
          <Text className="text-sm text-slate-400">{todayTasks.length} cadastrada{todayTasks.length === 1 ? '' : 's'}</Text>
        </View>

        {todayTasks.length === 0 ? (
          <View className="rounded-2xl border border-dashed border-slate-700 p-5">
            <Text className="text-center text-slate-400">Nenhuma tarefa cadastrada para hoje.</Text>
          </View>
        ) : (
          todayTasks.map((task) => (
            <View
              key={task.id}
              className={`flex-row items-center gap-4 rounded-2xl border p-4 ${
                task.completed ? 'border-slate-800 bg-slate-900/60' : 'border-slate-800 bg-slate-900'
              }`}>
              <Pressable
                className={`h-6 w-6 items-center justify-center rounded-full border-2 ${
                  task.completed ? 'border-transparent bg-emerald-400' : 'border-slate-500'
                }`}
                onPress={() => handleToggleTask(task.id)}>
                {task.completed ? <Text className="text-xs font-bold text-slate-950">✓</Text> : null}
              </Pressable>
              <View className="min-w-0 flex-1">
                <View className="flex-row items-center gap-2">
                  <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: task.color }} />
                  <Text className={`flex-1 text-base font-semibold ${task.completed ? 'text-slate-500 line-through' : 'text-white'}`}>
                    {task.title}
                  </Text>
                </View>
                <Text className="mt-1 text-sm text-slate-400">{difficultyLabels[task.difficulty]} · {task.points} pontos</Text>
              </View>
              <Pressable onPress={() => handleDeleteTask(task.id, task.title)}>
                <Text className="text-sm font-semibold text-rose-300">Excluir</Text>
              </Pressable>
            </View>
          ))
        )}

        {allTasksCompleted ? (
          <View className="rounded-2xl border border-indigo-400/30 bg-indigo-400/10 p-5">
            <Text className="text-center text-base font-bold text-indigo-200">Dia concluído! ✨</Text>
            <Text className="mt-1 text-center text-sm text-indigo-100">
              {getDailyMotivation()}
            </Text>
          </View>
        ) : null}
        </View>

        <Modal animationType="slide" transparent visible={isModalVisible} onRequestClose={() => setIsModalVisible(false)}>
        <View className="flex-1 justify-end bg-black/60">
          <View className="gap-5 rounded-t-3xl bg-slate-900 px-5 pb-10 pt-6">
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-bold text-white">Nova tarefa</Text>
              <Pressable onPress={() => setIsModalVisible(false)}><Text className="text-slate-400">Cancelar</Text></Pressable>
            </View>

            <TextInput
              className="rounded-xl bg-slate-800 px-4 py-4 text-white"
              placeholder="Nome da tarefa"
              placeholderTextColor="#94A3B8"
              value={title}
              onChangeText={setTitle}
              autoFocus
            />

            <View className="gap-2">
              <Text className="text-sm font-medium text-slate-300">Dificuldade</Text>
              <View className="flex-row gap-2">
                {(Object.keys(difficultyLabels) as Difficulty[]).map((item) => (
                  <Pressable
                    key={item}
                    className={`flex-1 rounded-xl py-3 ${difficulty === item ? 'bg-indigo-500' : 'bg-slate-800'}`}
                    onPress={() => setDifficulty(item)}>
                    <Text className="text-center font-medium text-white">{difficultyLabels[item]}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View className="gap-2">
              <Text className="text-sm font-medium text-slate-300">Cor da tarefa</Text>
              <View className="flex-row gap-3">
                {taskColors.map((item) => (
                  <Pressable
                    key={item}
                    className={`h-10 w-10 items-center justify-center rounded-full ${color === item ? 'border-2 border-white' : ''}`}
                    style={{ backgroundColor: item }}
                    onPress={() => setColor(item)}>
                    {color === item ? <Text className="font-bold text-slate-950">✓</Text> : null}
                  </Pressable>
                ))}
              </View>
            </View>

            <TextInput
              className="rounded-xl bg-slate-800 px-4 py-4 text-white"
              placeholder="Quantidade de pontos"
              placeholderTextColor="#94A3B8"
              value={points}
              onChangeText={setPoints}
              keyboardType="number-pad"
            />

            <Pressable className="items-center rounded-xl bg-indigo-500 py-4" onPress={handleAddTask}>
              <Text className="font-bold text-white">Salvar tarefa</Text>
            </Pressable>
          </View>
        </View>
        </Modal>
      </ScrollView>
      <ConfettiBurst trigger={confettiTrigger} />
    </View>
  );
}
