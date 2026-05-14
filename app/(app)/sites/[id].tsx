import {
  useAdminSiteControllerSite,
  useStaffControllerGetSite,
} from "@/fetchers/queriesComponents";
import { ScreenHeader } from "@/src/components/ui";
import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { useActivityFilters } from "@/src/hooks/useActivityFilters";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Briefcase, MapPin } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function SiteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { setFilter, setShouldResetOnNavigate } = useActivityFilters();

  const {
    data: siteResponse,
    isLoading,
    error,
  } = useAdminSiteControllerSite(
    { pathParams: { id } },
    { enabled: !!id && user?.role === "manager" },
  );

  const { data: siteStaffResponse, isLoading: isLoadingStaffSite } =
    useStaffControllerGetSite(
      { pathParams: { siteId: id } },
      { enabled: !!id && user?.role === "cleaner" },
    );

  const site =
    user?.role === "manager" ? siteResponse?.data : siteStaffResponse?.data;

  const handleViewJobs = () => {
    if (!id) return;
    setFilter("siteId", id);
    setShouldResetOnNavigate(false);
    if (user?.role === "manager") {
      router.push(`/(app)/(manager-tabs)/jobs?tab=list`);
    } else {
      router.push(`/(app)/(cleaner-tabs)/jobs?tab=list`);
    }
  };

  if (isLoading || isLoadingStaffSite) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (error || !site) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Failed to load site details.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title={site.title} showBackButton />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Site Information</Text>

          <View style={styles.infoRow}>
            <MapPin size={18} color="#64748b" />
            <Text style={styles.infoText}>{site.location?.address}</Text>
          </View>

          {site.description && (
            <View style={styles.infoRow}>
              <Text style={styles.infoText}>{site.description}</Text>
            </View>
          )}

          {site.customer && (
            <View style={styles.infoGroup}>
              <Text style={styles.label}>Client</Text>
              <Text style={styles.value}>{site.customer.name}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.jobsButton}
          onPress={handleViewJobs}
          activeOpacity={0.8}
        >
          <Briefcase size={20} color="#ffffff" />
          <Text style={styles.jobsButtonText}>View Jobs for this Site</Text>
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
    marginBottom: 4,
    fontWeight: "600",
  },
  value: {
    fontSize: 15,
    color: "#1e293b",
    fontWeight: "500",
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
