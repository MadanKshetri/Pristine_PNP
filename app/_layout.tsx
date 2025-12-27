import { queryClient } from "@/src/lib/queryClient";
import { useAuthStore } from "@/src/lib/store/authStore";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";

import "@/app/global.css";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";

import { LogLevel, OneSignal } from "react-native-onesignal";

// Initialize OneSignal
// TODO: Replace with your actual OneSignal App ID
OneSignal.Debug.setLogLevel(LogLevel.Verbose);
OneSignal.initialize("06fcdf57-4e3d-4b0b-ab4e-7191d8026efd");
OneSignal.Notifications.requestPermission(true);

export default function RootLayout() {
  const { isAuthenticated, user, isHydrated } = useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    user: state.user,
    isHydrated: state.isHydrated,
  }));
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isHydrated) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(tabs)/home");
    }
  }, [isAuthenticated, segments, router, isHydrated]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      OneSignal.login(user.id);
    }
  }, [isAuthenticated, user]);

  // Prevent rendering until authentication state is loaded
  if (!isHydrated) {
    return null;
  }

  return (
    <GluestackUIProvider mode="light">
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </QueryClientProvider>
    </GluestackUIProvider>
  );
}
