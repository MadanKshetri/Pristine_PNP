import {
  useAdminSiteControllerSites,
  useStaffControllerGetSites,
} from "@/fetchers/queriesComponents";
import type { ListSiteDto, StaffListSiteDto } from "@/fetchers/queriesSchemas";
import { ScreenHeader } from "@/src/components/ui";
import { useAuthStore } from "@/src/lib/store/authStore";
import { MapPin } from "lucide-react-native";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ManagerSitesTab() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isManager =
    user?.role === "manager" || user?.role === "customer manager";

  const {
    data: staffSitesData,
    isLoading: isStaffLoading,
    refetch: refetchStaff,
  } = useStaffControllerGetSites(
    {},
    {
      enabled: !isManager,
    },
  );

  const {
    data: managerSitesData,
    isLoading: isManagerLoading,
    refetch: refetchManager,
  } = useAdminSiteControllerSites(
    {
      queryParams: {
        page: 0,
        take: 100,
      },
    },
    {
      enabled: isManager,
    },
  );

  const sites = useMemo(() => {
    if (isManager) {
      return managerSitesData?.data || [];
    }
    return staffSitesData?.data || [];
  }, [isManager, managerSitesData, staffSitesData]);

  const isLoading = isManager ? isManagerLoading : isStaffLoading;
  const refetch = isManager ? refetchManager : refetchStaff;

  const renderItem = ({ item }: { item: ListSiteDto | StaffListSiteDto }) => (
    <TouchableOpacity
      style={styles.siteCard}
      activeOpacity={0.7}
      onPress={() => router.push(`/sites/${item.id}` as any)}
    >
      <View style={styles.siteHeader}>
        <View style={styles.siteIconWrap}>
          <MapPin size={16} color="#0f172a" />
        </View>
        <View style={styles.siteTitleWrap}>
          <Text style={styles.siteTitle}>{item.title}</Text>
          <Text style={styles.siteAddress}>{item.location.address}</Text>
        </View>
      </View>

      {item.description && (
        <Text style={styles.siteDescription}>{item.description}</Text>
      )}

      {item.customer && (
        <View style={styles.siteFooter}>
          <Text style={styles.siteFooterLabel}>Client</Text>
          <Text style={styles.siteFooterValue}>{item.customer.name}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerWrap}>
        <ScreenHeader title="Sites" showBackButton={true} />
      </View>
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
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyTitle}>No sites found</Text>
              <Text style={styles.emptyText}>
                Sites assigned to you will appear here.
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
    backgroundColor: "#f8fafc",
  },
  headerWrap: {
    paddingBottom: 4,
  },
  headerSubtitle: {
    color: "#64748b",
    fontSize: 13,
    marginLeft: 16,
    marginBottom: 8,
  },
  listContent: {
    paddingBottom: 24,
    paddingTop: 12,
  },
  emptyWrap: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
  },
  siteCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  siteHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  siteIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  siteTitleWrap: {
    flex: 1,
  },
  siteTitle: {
    color: "#0f172a",
    fontSize: 16,
    fontWeight: "700",
  },
  siteAddress: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 4,
  },
  siteDescription: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 10,
  },
  siteFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  siteFooterLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "600",
  },
  siteFooterValue: {
    fontSize: 12,
    color: "#0f172a",
    fontWeight: "600",
  },
});
