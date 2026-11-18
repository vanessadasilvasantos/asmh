import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import type { Difficulty, PointTransaction, Product, ProductivityData, Task } from '@/types/productivity';

const STORAGE_KEY = '@asmh/productivity-data';

const initialData: ProductivityData = {
  balance: 0,
  lastBalanceResetDate: getToday(),
  tasks: [],
  products: [],
  transactions: [],
};

type NewTask = Pick<Task, 'title' | 'difficulty' | 'color' | 'points'>;
type NewProduct = Pick<Product, 'name' | 'cost'>;

type ProductivityContextValue = ProductivityData & {
  isReady: boolean;
  addTask: (task: NewTask) => void;
  toggleTask: (taskId: string) => { success: boolean; reason?: 'insufficient-balance' };
  deleteTask: (taskId: string) => { success: boolean; reason?: 'insufficient-balance' };
  addProduct: (product: NewProduct) => void;
  redeemProduct: (productId: string) => boolean;
  deleteProduct: (productId: string) => void;
};

const ProductivityContext = createContext<ProductivityContextValue | null>(null);

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getToday() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${now.getFullYear()}-${month}-${day}`;
}

function createTransaction(
  type: PointTransaction['type'],
  amount: number,
  description: string,
  referenceId: string,
): PointTransaction {
  return {
    id: createId('transaction'),
    type,
    amount,
    description,
    referenceId,
    createdAt: new Date().toISOString(),
  };
}

function resetBalanceForNewDay(data: ProductivityData) {
  const today = getToday();

  if (data.lastBalanceResetDate === today) {
    return data;
  }

  return {
    ...data,
    balance: 0,
    lastBalanceResetDate: today,
    transactions:
      data.balance > 0
        ? [
            createTransaction(
              'daily-reset',
              -data.balance,
              'Saldo diário reiniciado',
              `daily-reset-${today}`,
            ),
            ...data.transactions,
          ]
        : data.transactions,
  };
}

export function ProductivityProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ProductivityData>(initialData);
  const [isReady, setIsReady] = useState(false);
  const dataRef = useRef<ProductivityData>(initialData);

  useEffect(() => {
    async function loadData() {
      try {
        const storedValue = await AsyncStorage.getItem(STORAGE_KEY);

        if (storedValue) {
          const storedData = JSON.parse(storedValue) as Partial<ProductivityData>;
          const nextData = resetBalanceForNewDay({
            balance: Math.max(0, storedData.balance ?? 0),
            lastBalanceResetDate: storedData.lastBalanceResetDate ?? '',
            tasks: storedData.tasks ?? [],
            products: storedData.products ?? [],
            transactions: storedData.transactions ?? [],
          });
          dataRef.current = nextData;
          setData(nextData);
        }
      } catch {
        dataRef.current = initialData;
        setData(initialData);
      } finally {
        setIsReady(true);
      }
    }

    void loadData();
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data, isReady]);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    function scheduleNextReset() {
      const now = new Date();
      const nextDay = new Date(now);
      nextDay.setHours(24, 0, 0, 250);

      timeout = setTimeout(() => {
        const nextData = resetBalanceForNewDay(dataRef.current);
        dataRef.current = nextData;
        setData(nextData);
        scheduleNextReset();
      }, nextDay.getTime() - now.getTime());
    }

    scheduleNextReset();
    return () => clearTimeout(timeout);
  }, []);

  const value = useMemo<ProductivityContextValue>(
    () => ({
      ...data,
      isReady,
      addTask(task) {
        const normalizedTitle = task.title.trim();

        if (!normalizedTitle || !Number.isFinite(task.points) || task.points <= 0) {
          return;
        }

        const current = resetBalanceForNewDay(dataRef.current);
        const nextData = {
          ...current,
          tasks: [
            {
              ...task,
              id: createId('task'),
              title: normalizedTitle,
              points: Math.floor(task.points),
              createdAt: getToday(),
              completed: false,
            },
            ...current.tasks,
          ],
        };
        dataRef.current = nextData;
        setData(nextData);
      },
      toggleTask(taskId) {
        const current = resetBalanceForNewDay(dataRef.current);
        const task = current.tasks.find((item) => item.id === taskId);

        if (!task) {
          return { success: false };
        }

        const willComplete = !task.completed;
        const amount = willComplete ? task.points : -task.points;
        const nextData = {
          ...current,
          balance: Math.max(0, current.balance + amount),
          tasks: current.tasks.map((item) =>
            item.id === task.id ? { ...item, completed: willComplete } : item,
          ),
          transactions: [
            createTransaction(
              willComplete ? 'task-completed' : 'task-uncompleted',
              amount,
              willComplete ? `Tarefa concluída: ${task.title}` : `Tarefa desmarcada: ${task.title}`,
              task.id,
            ),
            ...current.transactions,
          ],
        };
        dataRef.current = nextData;
        setData(nextData);

        return { success: true };
      },
      deleteTask(taskId) {
        const current = resetBalanceForNewDay(dataRef.current);
        const task = current.tasks.find((item) => item.id === taskId);

        if (!task) {
          return { success: false };
        }

        if (task.completed && current.balance < task.points) {
          return { success: false, reason: 'insufficient-balance' };
        }

        const nextData = {
          ...current,
          balance: task.completed ? current.balance - task.points : current.balance,
          tasks: current.tasks.filter((item) => item.id !== task.id),
          transactions: task.completed
            ? [
                createTransaction(
                  'task-deleted',
                  -task.points,
                  `Tarefa excluída: ${task.title}`,
                  task.id,
                ),
                ...current.transactions,
              ]
            : current.transactions,
        };
        dataRef.current = nextData;
        setData(nextData);

        return { success: true };
      },
      addProduct(product) {
        const normalizedName = product.name.trim();

        if (!normalizedName || !Number.isFinite(product.cost) || product.cost <= 0) {
          return;
        }

        const current = resetBalanceForNewDay(dataRef.current);
        const nextData = {
          ...current,
          products: [
            {
              id: createId('product'),
              name: normalizedName,
              cost: Math.floor(product.cost),
              createdAt: new Date().toISOString(),
            },
            ...current.products,
          ],
        };
        dataRef.current = nextData;
        setData(nextData);
      },
      redeemProduct(productId) {
        const current = resetBalanceForNewDay(dataRef.current);
        const product = current.products.find((item) => item.id === productId);

        if (!product || current.balance < product.cost) {
          return false;
        }

        const nextData = {
          ...current,
          balance: current.balance - product.cost,
          transactions: [
            createTransaction(
              'product-redeemed',
              -product.cost,
              `Produto resgatado: ${product.name}`,
              product.id,
            ),
            ...current.transactions,
          ],
        };
        dataRef.current = nextData;
        setData(nextData);

        return true;
      },
      deleteProduct(productId) {
        const current = resetBalanceForNewDay(dataRef.current);
        const nextData = {
          ...current,
          products: current.products.filter((product) => product.id !== productId),
        };
        dataRef.current = nextData;
        setData(nextData);
      },
    }),
    [data, isReady],
  );

  return <ProductivityContext.Provider value={value}>{children}</ProductivityContext.Provider>;
}

export function useProductivity() {
  const context = useContext(ProductivityContext);

  if (!context) {
    throw new Error('useProductivity must be used within ProductivityProvider.');
  }

  return context;
}

export const difficultyLabels: Record<Difficulty, string> = {
  easy: 'Fácil',
  medium: 'Média',
  hard: 'Difícil',
};
