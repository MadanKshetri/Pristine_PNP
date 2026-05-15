import { useAdminCustomerControllerCustomer } from "@/fetchers/queriesComponents";
import { ScreenHeader } from "@/src/components/ui";
import { useActivityFilters } from "@/src/hooks/useActivityFilters";
import { useAuthStore } from "@/src/lib/store/authStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Briefcase, Building2, Mail, MapPin } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function CustomerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const { setFilter, setShouldResetOnNavigate } = useActivityFilters();

  const isManager = user?.role === "manager";

  const {
    data: customerResponse,
    isLoading,
    error,
  } = useAdminCustomerControllerCustomer(
    { pathParams: { id } },
    { enabled: !!id },
  );

  const customer = customerResponse?.data;

  const handleViewJobs = () => {
    if (!id) return;
    if (isManager) {
      setFilter("customerId", id);
      setShouldResetOnNavigate(false);
      router.push(`/(app)/(manager-tabs)/jobs?tab=list&customerId=${id}`);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (error || !customer) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Failed to load customer details.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title={customer.name} showBackButton />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Customer Information</Text>

          <View style={styles.infoRow}>
            <Building2 size={18} color="#64748b" />
            <Text style={styles.infoText}>{customer.name}</Text>
          </View>

          {customer.email && (
            <View style={styles.infoRow}>
              <Mail size={18} color="#64748b" />
              <Text style={styles.infoText}>{customer.email}</Text>
            </View>
          )}

          {customer.sites && customer.sites.length > 0 && (
            <View style={styles.infoGroup}>
              <Text style={styles.label}>Sites ({customer.sites.length})</Text>
              {customer.sites.map((site) => (
                <View key={site.id} style={styles.siteItem}>
                  <MapPin size={16} color="#94a3b8" style={{ marginTop: 2 }} />
                  <Text style={styles.siteText}>{site.name}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.jobsButton}
          onPress={handleViewJobs}
          activeOpacity={0.8}
        >
          <Briefcase size={20} color="#ffffff" />
          <Text style={styles.jobsButtonText}>View Jobs for this Customer</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  errorText: {
    fontSize: 16,
    color: "#ef4444",
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 15,
    color: "#475569",
    lineHeight: 22,
  },
  infoGroup: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  label: {
    fontSize: 12,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
    fontWeight: "600",
  },
  siteItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 8,
  },
  siteText: {
    flex: 1,
    fontSize: 14,
    color: "#475569",
    lineHeight: 20,
  },
  jobsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3b82f6",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  jobsButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
