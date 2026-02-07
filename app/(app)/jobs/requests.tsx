import { useManagerJobRequestControllerJobRequests } from "@/fetchers/queriesComponents";
import { ScreenHeader } from "@/src/components/ui";
import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { JobRequestCard } from "@/src/features/jobs/components/JobRequestCard";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function JobRequestsScreen() {
  const router = useRouter();
  const { user } = useAuth(); // Assuming useAuth hook is available and provides user

  React.useEffect(() => {
    if (
      user &&
      user.role !== "manager" &&
      user.role !== "customer manager"
    ) {
      router.replace("/" as any);
    }
  }, [user, router]);

  const { data, isLoading, refetch } =
    useManagerJobRequestControllerJobRequests({
      queryParams: {
        // We can add filters here if needed, but for now fetch all
      },
    });

  const jobs = data?.data || [];

  const handleAddRequest = () => {
    router.push("/jobs/request" as any);
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Job Requests"
        showBackButton={true}
        rightAction={<Ionicons name="add" size={24} color="#3B82F6" />}
        onRightAction={handleAddRequest}
      />
      <FlatList
        data={jobs}
        renderItem={({ item }) => <JobRequestCard request={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No job requests found</Text>
              <Text style={styles.emptySubText}>
                Create a new job request to get started
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={handleAddRequest}
              >
                <Text style={styles.emptyButtonText}>+ Create Request</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  listContent: {
    paddingVertical: 16,
  },
  emptyContainer: {
    flex: 1,
    paddingTop: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 24,
    textAlign: "center",
  },
  emptyButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
