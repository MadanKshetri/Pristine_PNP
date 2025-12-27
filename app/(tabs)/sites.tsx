import {
  useManagerControllerGetSiteSummary,
  useStaffControllerGetSiteSummary,
} from "@/fetchers/queriesComponents";
import type {
  ManagerListSiteDto,
  StaffListSiteDto,
} from "@/fetchers/queriesSchemas";
import { Card, ScreenHeader } from "@/src/components/ui";
import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { MapPin } from "lucide-react-native";
import React, { useMemo } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";

export default function SitesScreen() {
  const { user } = useAuth();
  const isManager = user?.role === "manager";
  const isStaff = user?.role === "general";

  const {
    data: staffSitesData,
    isLoading: isStaffLoading,
    refetch: refetchStaff,
  } = useStaffControllerGetSiteSummary(
    {},
    {
      enabled: isStaff,
    }
  );

  const {
    data: managerSitesData,
    isLoading: isManagerLoading,
    refetch: refetchManager,
  } = useManagerControllerGetSiteSummary(
    {},
    {
      enabled: isManager,
    }
  );

  const sites = useMemo(() => {
    if (isManager) {
      return managerSitesData?.data || [];
    }
    return staffSitesData?.data || [];
  }, [isManager, managerSitesData, staffSitesData]);

  const isLoading = isManager ? isManagerLoading : isStaffLoading;
  const refetch = isManager ? refetchManager : refetchStaff;

  const renderItem = ({
    item,
  }: {
    item: ManagerListSiteDto | StaffListSiteDto;
  }) => (
    <Card variant="elevated" className="mb-4 mx-4">
      <View className="flex-row justify-between items-start mb-2">
        <Text className="text-lg font-bold text-gray-900 flex-1 mr-2 px-1">
          {item.title}
        </Text>
      </View>

      {item.description && (
        <Text className="text-gray-500 text-sm mb-3 px-1">
          {item.description}
        </Text>
      )}

      <View className="flex-row items-center mt-2 px-1">
        <MapPin size={16} color="#64748b" className="mr-2" />
        <Text className="text-gray-600 text-sm flex-1 ml-2">
          {item.location.address}
        </Text>
      </View>

      {item.customer && (
        <View className="mt-3 pt-3 border-t border-gray-100 flex-row justify-between items-center px-1">
          <Text className="text-xs text-gray-400 font-medium uppercase tracking-wider">
            Client
          </Text>
          <Text className="text-sm text-gray-700 font-medium">
            {item.customer.name}
          </Text>
        </View>
      )}
    </Card>
  );

  return (
    <View style={styles.container}>
      <ScreenHeader title="Sites" showBackButton={true} />
      <FlatList
        data={sites}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View className="flex-1 items-center justify-center py-20">
              <Text className="text-gray-500 text-lg">No sites found</Text>
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
    backgroundColor: "#f8fafc",
  },
  listContent: {
    paddingBottom: 24,
    paddingTop: 16,
  },
});
