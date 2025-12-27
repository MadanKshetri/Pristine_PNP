import { queryClient } from "@/src/lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";

import "@/app/global.css";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";

// Initialize OneSignal
// TODO: Replace with your actual OneSignal App ID
// OneSignal.Debug.setLogLevel(LogLevel.Verbose);
// OneSignal.initialize("06fcdf57-4e3d-4b0b-ab4e-7191d8026efd");
// OneSignal.Notifications.requestPermission(true);

export default function RootLayout() {
  // useEffect(() => {
  //   if (isAuthenticated && user?.id) {
  //     OneSignal.login(user.id);
  //   }
  // }, [isAuthenticated, user]);

  // Prevent rendering until authentication state is loaded

  return (
    <GluestackUIProvider mode="light">
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(app)" />
        </Stack>
      </QueryClientProvider>
    </GluestackUIProvider>
  );
}
