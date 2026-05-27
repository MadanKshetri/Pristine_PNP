import { Card, ScreenHeader } from "@/src/components/ui";
import { useAuth } from "@/src/features/auth";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
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

  const navigateToIncidents = () => {
    if (user?.role === "manager" || user?.role === "customer manager") {
      router.push("/incidents/manager-list");
    } else {
      router.push("/incidents/staff-list");
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ScreenHeader title="Profile" showBackButton={true} />

      <View className="px-5 py-6">
        {/* Compact User Info Card */}
        <Card
          variant="elevated"
          padding="sm"
          className="mb-6 flex-row items-center p-4 bg-white rounded-2xl shadow-sm border border-gray-100"
        >
          <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mr-4 overflow-hidden border-2 border-blue-50">
            {user?.image?.url ? (
              <Image
                source={{ uri: user.image.url }}
                className="w-full h-full"
                contentFit="cover"
                transition={200}
              />
            ) : (
              <Ionicons name="person" size={32} color="#3B82F6" />
            )}
          </View>

          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-900 leading-tight mb-1">
              {user?.fullName || "User"}
            </Text>
            <Text className="text-sm text-gray-500 mb-2 font-medium">
              {user?.email || "email@example.com"}
            </Text>
            <View className="flex-row">
              <View className="bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                <Text className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  {user?.role || "user"}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Workplace Menu */}
        <Text className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 ml-1">
          Workplace
        </Text>
        <Card
          variant="default"
          padding="none"
          className="mb-6 overflow-hidden border border-gray-100 bg-white"
        >
          <TouchableOpacity
            onPress={navigateToIncidents}
            className="flex-row items-center p-4 border-b border-gray-50 active:bg-gray-50"
          >
            <View className="w-9 h-9 bg-red-50 rounded-lg items-center justify-center mr-3">
              <Ionicons name="warning-outline" size={20} color="#EF4444" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-medium text-gray-900">
                Incident Reports
              </Text>
              <Text className="text-xs text-gray-500">
                {user?.role === "manager" || user?.role === "customer manager"
                  ? "View and manage reports"
                  : "Report an issue at a site"}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
          </TouchableOpacity>
        </Card>

        {/* Job Management Menu (Managers Only) */}
        {(user?.role === "manager" || user?.role === "customer manager") && (
          <>
            <Text className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 ml-1">
              Job Management
            </Text>
            <Card
              variant="default"
              padding="none"
              className="mb-6 overflow-hidden border border-gray-100 bg-white"
            >
              <TouchableOpacity
                onPress={() => router.push("/jobs/requests" as any)}
                className="flex-row items-center p-4 active:bg-gray-50"
              >
                <View className="w-9 h-9 bg-blue-50 rounded-lg items-center justify-center mr-3">
                  <Ionicons
                    name="briefcase-outline"
                    size={20}
                    color="#3B82F6"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-medium text-gray-900">
                    Job Requests
                  </Text>
                  <Text className="text-xs text-gray-500">
                    View your requested jobs
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
              </TouchableOpacity>
            </Card>
          </>
        )}

        {/* Account Menu */}
        <Text className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 ml-1">
          Account
        </Text>
        <Card
          variant="default"
          padding="none"
          className="mb-6 overflow-hidden border border-gray-100 bg-white"
        >
          <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-50 active:bg-gray-50">
            <View className="w-9 h-9 bg-gray-50 rounded-lg items-center justify-center mr-3">
              <Ionicons name="settings-outline" size={20} color="#6B7280" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-medium text-gray-900">
                Settings
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center p-4 active:bg-gray-50">
            <View className="w-9 h-9 bg-gray-50 rounded-lg items-center justify-center mr-3">
              <Ionicons name="help-circle-outline" size={20} color="#6B7280" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-medium text-gray-900">
                Help & Support
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
          </TouchableOpacity>
        </Card>

        <TouchableOpacity
          onPress={handleLogout}
          className="flex-row items-center justify-center p-4 rounded-xl bg-red-50 active:bg-red-100"
        >
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text className="text-base font-semibold text-red-600 ml-2">
            Log Out
          </Text>
        </TouchableOpacity>
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
