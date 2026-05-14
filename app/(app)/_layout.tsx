import { StoreResetListener } from "@/components/misc/store-reset-listener";
import { useAuthStore } from "@/src/lib/store/authStore";
import { Redirect, Stack } from "expo-router";

export default function AppLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  const isManager = user?.role === "manager";

  return (
    <>
      <StoreResetListener />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(cleaner-tabs)" redirect={isManager} />
        <Stack.Screen name="(manager-tabs)" redirect={!isManager} />
        <Stack.Screen name="incidents" />
        <Stack.Screen name="job" />
        <Stack.Screen name="jobs" />
      </Stack>
    </>
  );
}
