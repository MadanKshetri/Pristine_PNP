import { useStaffIncidentConrollerIncidents } from "@/fetchers/queriesComponents";
import type { StaffGetIncidentDto } from "@/fetchers/queriesSchemas";
import { Card } from "@/src/components/ui";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import { AlertTriangle, Calendar, MapPin, Plus } from "lucide-react-native";
import React from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface StaffIncidentListViewProps {
  /**
   * Distance (px) to lift the floating "+" button off the bottom edge.
   * When rendered inside a bottom-tab screen the content already sits above
   * the tab bar, so a small gap is enough. When rendered as a standalone
   * screen (e.g. from Profile) it falls back to the safe-area inset.
   */
  fabBottomOffset?: number;
}

export function StaffIncidentListView({
  fabBottomOffset,
}: StaffIncidentListViewProps = {}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const bottomOffset = fabBottomOffset ?? insets.bottom + 16;
  const { data, isLoading, refetch } = useStaffIncidentConrollerIncidents({
    queryParams: { status: "Open" },
  });

  const incidents = data?.data || [];

  const handleAddPress = () => {
    router.push("/incidents/staff-create" as any);
  };

  const renderItem = ({ item }: { item: StaffGetIncidentDto }) => (
    <Card variant="elevated" className="mb-4 mx-4" padding="md">
      <View className="flex-row items-center">
        <View className="bg-red-50 p-2.5 rounded-full mr-3.5">
          <AlertTriangle size={22} color="#EF4444" />
        </View>
        <Text className="text-base font-bold text-gray-900 flex-1 leading-6">
          {item.title}
        </Text>
      </View>

      <View className="flex-row justify-between items-center pt-3.5 mt-3.5 border-t border-gray-100">
        {(item.site as any)?.title && (
          <View className="flex-row items-center flex-1 mr-3">
            <MapPin size={15} color="#6B7280" className="mr-1.5" />
            <Text
              className="text-xs text-gray-500 font-medium flex-1"
              numberOfLines={1}
            >
              {(item.site as any).title}
            </Text>
          </View>
        )}

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
      <FlatList
        data={incidents}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: bottomOffset + 72 },
        ]}
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
              <Text className="text-sm text-gray-500 text-center mb-6">
                You haven't submitted any feedback or requests yet.
              </Text>
              <TouchableOpacity
                onPress={handleAddPress}
                className="bg-blue-600 px-6 py-3 rounded-full flex-row items-center"
              >
                <Plus size={20} color="#FFF" className="mr-2" />
                <Text className="text-white font-bold">New Request</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
      />
      <TouchableOpacity
        onPress={handleAddPress}
        style={[styles.addButton, { bottom: bottomOffset }]}
        activeOpacity={0.7}
      >
        <Plus size={24} color="#FFFFFF" strokeWidth={3} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  addButton: {
    position: "absolute",
    right: 20,
    backgroundColor: "#3B82F6",
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
  },
  listContent: {
    paddingVertical: 16,
  },
});
