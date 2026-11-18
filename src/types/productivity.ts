export type Difficulty = 'easy' | 'medium' | 'hard';

export type Task = {
  id: string;
  title: string;
  difficulty: Difficulty;
  color: string;
  points: number;
  createdAt: string;
  completed: boolean;
};

export type Product = {
  id: string;
  name: string;
  cost: number;
  createdAt: string;
};

export type PointTransaction = {
  id: string;
  type: 'task-completed' | 'task-uncompleted' | 'task-deleted' | 'product-redeemed' | 'daily-reset';
  amount: number;
  description: string;
  referenceId: string;
  createdAt: string;
};

export type ProductivityData = {
  balance: number;
  lastBalanceResetDate: string;
  tasks: Task[];
  products: Product[];
  transactions: PointTransaction[];
};
