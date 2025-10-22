import { useAuthStore } from '@/src/lib/store/authStore';
import { Redirect, Stack } from 'expo-router';

export default function AuthLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Redirect to home if already authenticated
  if (isAuthenticated) {
    return <Redirect href="/(tabs)/home" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="otp-verify" />
    </Stack>
  );
}
