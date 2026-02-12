import { useAdminCustomerControllerCustomers } from "@/fetchers/queriesComponents";
import { ScreenHeader } from "@/src/components/ui";
import { useAuthStore } from "@/src/lib/store/authStore";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";

export default function CustomersTab() {
  const user = useAuthStore((state) => state.user);
  const isManager =
    user?.role === "manager" || user?.role === "customer manager";

  const { data, isLoading, refetch } = useAdminCustomerControllerCustomers(
    {
      queryParams: {
        take: 50,
        page: 0,
      },
    },
    { enabled: isManager },
  );

  const customers = data?.data || [];

  if (!isManager) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Customers" showBackButton={true} />
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>
            You do not have access to customer listings.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerWrap}>
        <ScreenHeader title="Customers" showBackButton={true} />
        <View style={styles.headerNote}>
          <Ionicons name="shield-checkmark-outline" size={18} color="#3B82F6" />
          <Text style={styles.headerNoteText}>Managed accounts</Text>
        </View>
      </View>
      <FlatList
        data={customers}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconWrap}>
                <Ionicons name="business" size={18} color="#3B82F6" />
              </View>
              <View style={styles.cardTitleBlock}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                {item.email && (
                  <Text style={styles.cardSubtitle}>{item.email}</Text>
                )}
              </View>
            </View>
            <View style={styles.cardFooter}>
              <Text style={styles.cardMetaLabel}>Owner</Text>
              <Text style={styles.cardMetaValue}>
                {item.createdBy?.name || "Unknown"}
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyTitle}>No customers found</Text>
              <Text style={styles.emptyText}>
                Customers assigned to you will appear here.
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
    paddingBottom: 8,
  },
  headerNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 6,
  },
  headerNoteText: {
    color: "#1E40AF",
    fontWeight: "600",
    fontSize: 12,
  },
  listContent: {
    paddingVertical: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  cardTitleBlock: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  cardMetaLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "600",
  },
  cardMetaValue: {
    fontSize: 12,
    color: "#0f172a",
    fontWeight: "600",
  },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
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
});
