import { ScreenHeader } from "@/src/components/ui";
import { useJobsByRole } from "@/src/features/jobs/hooks/useJobsByRole";
import { useAuthStore } from "@/src/lib/store/authStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ManagerJobsTab() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isManager =
    user?.role === "manager" || user?.role === "customer manager";

  const { jobs, isLoading, refetch } = useJobsByRole({
    page: 0,
    take: 50,
  });

  if (!isManager) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Jobs" showBackButton={true} />
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>Access restricted</Text>
          <Text style={styles.emptyText}>
            You do not have access to manager jobs.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refetch} />
      }
    >
      <View style={styles.headerWrap}>
        <ScreenHeader title="Jobs" showBackButton={true} />
        <View style={styles.headerRow}>
          <Text style={styles.subtitle}>Jobs assigned to your customers</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() =>
              router.push({
                pathname: "/jobs/create",
                params: { date: new Date().toISOString() },
              })
            }
          >
            <Ionicons name="add" size={18} color="#ffffff" />
            <Text style={styles.createText}>New</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.listWrap}>
        {jobs.map((job) => (
          <TouchableOpacity
            key={job.id}
            style={styles.jobCard}
            onPress={() => router.push(`/job/${job.id}` as never)}
            activeOpacity={0.9}
          >
            <View style={styles.jobHeader}>
              <View style={styles.jobTitleBlock}>
                <Text style={styles.jobTitle}>{job.title}</Text>
                <Text style={styles.jobNumber}>#{job.jobNumber}</Text>
              </View>
              <View style={styles.statusPill}>
                <Text style={styles.statusText}>{job.status}</Text>
              </View>
            </View>
            <Text style={styles.jobMeta}>{job.site?.title || "No site"}</Text>
            <Text style={styles.jobMetaSub}>
              {job.site?.address.address || "No address"}
            </Text>
            <View style={styles.staffRow}>
              <Ionicons
                name={job.assignedStaff ? "person" : "person-outline"}
                size={13}
                color={job.assignedStaff ? "#0D9488" : "#9CA3AF"}
              />
              <Text
                style={[
                  styles.staffText,
                  !job.assignedStaff && styles.staffTextUnassigned,
                ]}
              >
                {job.assignedStaff ? job.assignedStaff.name : "Unassigned"}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
        {!isLoading && jobs.length === 0 && (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTitle}>No jobs found</Text>
            <Text style={styles.emptyText}>
              Create a job request to get started.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
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
  headerRow: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  subtitle: {
    color: "#64748b",
    fontSize: 13,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#3B82F6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  createText: {
    color: "#ffffff",
    fontWeight: "700",
  },
  listWrap: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  jobCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  jobHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  jobTitleBlock: {
    flex: 1,
    marginRight: 10,
  },
  jobTitle: {
    color: "#0f172a",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  jobNumber: {
    color: "#64748b",
    fontSize: 12,
  },
  statusPill: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    color: "#3B82F6",
    fontSize: 11,
    fontWeight: "600",
  },
  jobMeta: {
    color: "#64748b",
    fontSize: 12,
    marginBottom: 4,
  },
  jobMetaSub: {
    color: "#9CA3AF",
    fontSize: 11,
  },
  staffRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 6,
  },
  staffText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0D9488",
  },
  staffTextUnassigned: {
    color: "#9CA3AF",
    fontWeight: "400",
    fontStyle: "italic",
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
});
