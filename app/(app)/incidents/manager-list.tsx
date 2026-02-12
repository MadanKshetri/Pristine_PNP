import { useAdminIncidentConrollerIncidents } from "@/fetchers/queriesComponents";
import type { ManagerGetIncidentDto } from "@/fetchers/queriesSchemas";
import { Card, ScreenHeader } from "@/src/components/ui";
import { format } from "date-fns";
import { AlertTriangle, Calendar, MapPin, User } from "lucide-react-native";
import React from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";

export default function ManagerIncidentListScreen() {
  const { data, isLoading, refetch } = useAdminIncidentConrollerIncidents({});

  const incidents = data?.data || [];

  const renderItem = ({ item }: { item: ManagerGetIncidentDto }) => (
    <Card variant="elevated" className="mb-4 mx-4" padding="md">
      <View className="flex-row items-center mb-4">
        <View className="bg-red-50 p-2.5 rounded-full mr-3.5">
          <AlertTriangle size={22} color="#EF4444" />
        </View>
        <Text className="text-lg font-bold text-gray-900 flex-1 leading-6">
          {item.title}
        </Text>
      </View>

      {item.description && (
        <Text className="text-gray-600 text-sm mb-4 leading-relaxed">
          {item.description}
        </Text>
      )}

      {/* Site Details */}
      {(item.site as any)?.title && (
        <View className="flex-row items-start mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
          <MapPin size={18} color="#4B5563" className="mr-2.5 mt-0.5" />
          <View className="flex-1">
            <Text className="text-sm font-semibold text-gray-900 mb-0.5">
              {(item.site as any).title}
            </Text>
            {(item.site as any)?.address && (
              <Text className="text-xs text-gray-500 leading-4">
                {(item.site as any).address}
              </Text>
            )}
          </View>
        </View>
      )}

      <View className="flex-row justify-between items-center pt-3.5 border-t border-gray-100">
        <View className="flex-row items-center">
          <User size={15} color="#6B7280" className="mr-1.5" />
          <Text className="text-xs text-gray-500 font-medium">
            {item.reportedBy?.name || "Unknown"}
          </Text>
        </View>

        <View className="flex-row items-center">
          <Calendar size={15} color="#6B7280" className="mr-1.5" />
          <Text className="text-xs text-gray-500 font-medium">
            {item.createdAt
              ? format(new Date(item.createdAt), "MMM d, yyyy")
              : "-"}
          </Text>
        </View>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <ScreenHeader title="Incident Reports" />

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
                No Incidents Reported
              </Text>
              <Text className="text-sm text-gray-500 text-center">
                There are currently no active incident reports to display.
              </Text>
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
    backgroundColor: "#F9FAFB",
  },
  listContent: {
    paddingVertical: 16,
  },
});
