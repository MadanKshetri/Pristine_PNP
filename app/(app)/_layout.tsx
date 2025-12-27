import { useAuthStore } from "@/src/lib/store/authStore";
import { Redirect, Stack } from "expo-router";

export default function AppLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="incidents" />
      <Stack.Screen name="job" />
    </Stack>
  );
}
