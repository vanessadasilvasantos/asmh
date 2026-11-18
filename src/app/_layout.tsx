import '../../global.css';

import { Stack } from 'expo-router';

import { ProductivityProvider } from '@/providers/ProductivityProvider';

export default function RootLayout() {
  return (
    <ProductivityProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </ProductivityProvider>
  );
}
