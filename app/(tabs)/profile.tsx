import { Button, Card, ScreenHeader } from "@/src/components/ui";
import { useAuth } from "@/src/features/auth";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          logout();
          router.replace("/");
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <ScreenHeader title="Profile" />

      <View className="px-6 py-8">
        {/* User Info Card */}
        <Card variant="elevated" padding="lg" className="mb-6">
          <View className="items-center mb-6">
            {/* Avatar */}
            <View className="w-24 h-24 bg-blue-100 rounded-full items-center justify-center mb-4 mt-4">
              <Ionicons name="person" size={48} color="#3B82F6" />
            </View>

            {/* Name */}
            <Text className="text-2xl font-bold text-gray-900 mb-1">
              {user?.fullName || "User"}
            </Text>

            {/* Email */}
            <Text className="text-base text-gray-600 mb-2">
              {user?.email || "email@example.com"}
            </Text>

            {/* Role Badge */}
            <View className="bg-blue-100 px-4 py-1.5 rounded-full">
              <Text className="text-sm font-semibold text-blue-600 capitalize">
                {user?.role || "user"}
              </Text>
            </View>
          </View>
        </Card>

        {/* Quick Actions */}
        <Card variant="elevated" padding="md" className="mb-6 p-4">
          <Text className="text-xl font-semibold text-gray-900 mb-3">
            Quick Actions
          </Text>

          {/* Settings Button */}
          <View className="border-b border-gray-100 pb-3 mb-3">
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="settings-outline" size={20} color="#6B7280" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-900">
                  Settings
                </Text>
                <Text className="text-xs text-gray-500">App preferences</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </View>
          </View>

          {/* Help Button */}
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
              <Ionicons name="help-circle-outline" size={20} color="#6B7280" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-medium text-gray-900">
                Help & Support
              </Text>
              <Text className="text-xs text-gray-500">Get assistance</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </View>
        </Card>

        {/* Logout Button */}
        <Button
          variant="danger"
          onPress={handleLogout}
          fullWidth
          size="lg"
          className="bg-red-500"
        >
          <View className="flex-row items-center justify-center">
            <Ionicons name="log-out-outline" size={20} color="#000000" />
            <Text className="text-lg font-bold ml-2">Logout</Text>
          </View>
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
});
