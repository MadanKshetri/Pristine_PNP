import { useAdminIncidentConrollerIncidents } from "@/fetchers/queriesComponents";
import type { AdminListIncidentDto } from "@/fetchers/queriesSchemas";
import { IncidentCard } from "./IncidentCard";
import { AlertTriangle } from "lucide-react-native";
import React from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";

export function ManagerIncidentListView() {
  const { data, isLoading, refetch } = useAdminIncidentConrollerIncidents({
    queryParams: { status: "Open" },
  });

  const incidents = data?.data || [];

  const renderItem = ({ item }: { item: AdminListIncidentDto }) => (
    <IncidentCard incident={item} />
  );

  return (
    <FlatList
      data={incidents}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refetch} />
      }
      ListEmptyComponent={
        !isLoading ? (
          <View className="flex-1 items-center justify-center py-20 px-4">
            <View className="bg-gray-100 w-16 h-16 rounded-full items-center justify-center mb-4">
              <AlertTriangle size={32} color="#9CA3AF" />
            </View>
            <Text className="text-lg font-semibold text-gray-900 mb-2">
              Nothing Here Yet
            </Text>
            <Text className="text-sm text-gray-500 text-center">
              There are currently no open feedback or requests to display.
            </Text>
          </View>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingVertical: 16,
  },
});
