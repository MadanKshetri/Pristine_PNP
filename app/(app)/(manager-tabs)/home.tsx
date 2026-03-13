import { LoadingSpinner, ScreenHeader } from "@/src/components/ui";
import { useJobsByRole } from "@/src/features/jobs/hooks/useJobsByRole";
import { useAuthStore } from "@/src/lib/store/authStore";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ManagerHomeTab() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const {
    jobs: recentJobs,
    isLoading: isLoadingJobs,
    isRefetching: isRefetchingJobs,
    refetch: refetchJobs,
  } = useJobsByRole({
    page: 0,
    take: 5,
  });

  // const summaryItems = summaryData?.data || [];
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  if (!user) {
    return (
      <View style={styles.loaderWrap}>
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefetchingJobs}
          onRefresh={() => {
            refetchJobs();
          }}
        />
      }
    >
      <View style={styles.hero}>
        <LinearGradient
          colors={["#3B82F6", "#2563EB", "#1D4ED8"]}
          // colors={["#3B82F6", "#2563EB", "#1D4ED8"]}
          // colors={["#000000", "#ffffff", "#ffffff"]}

          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroGradient}
        >
          <ScreenHeader
            title="Manager Overview"
            showBackButton={false}
            safeAreaStyle={{ backgroundColor: "transparent" }}
            textStyles={{ color: "#ffffff", fontSize: 24 }}
          />
          <Text style={styles.heroSubtitle}>{greeting}</Text>
          <Text style={styles.heroTitle}>{user.fullName}</Text>
          <View style={styles.heroActions}>
            <TouchableOpacity
              style={styles.heroPrimary}
              onPress={() => router.push("/(app)/(manager-tabs)/jobs" as never)}
              activeOpacity={0.9}
            >
              <Ionicons name="briefcase" size={18} color="#3B82F6" />
              <Text style={styles.heroPrimaryText}>View Jobs</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.heroSecondary}
              onPress={() => router.push("/jobs/create" as never)}
              activeOpacity={0.9}
            >
              <Ionicons name="add" size={18} color="#ffffff" />
              <Text style={styles.heroSecondaryText}>New Job</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent jobs</Text>
        <TouchableOpacity
          onPress={() => router.push("/(app)/(manager-tabs)/jobs" as never)}
        >
          <Text style={styles.sectionAction}>View all</Text>
        </TouchableOpacity>
      </View>

      {isLoadingJobs && !recentJobs.length ? (
        <View style={styles.loaderWrap}>
          <LoadingSpinner />
        </View>
      ) : recentJobs.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="briefcase-outline" size={40} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>No jobs yet</Text>
          <Text style={styles.emptyText}>
            Jobs assigned to your team will show here.
          </Text>
        </View>
      ) : (
        <View style={styles.jobsList}>
          {recentJobs.map((job) => (
            <TouchableOpacity
              key={job.id}
              style={styles.jobCard}
              onPress={() => router.push(`/job/${job.id}` as never)}
              activeOpacity={0.9}
            >
              <View style={styles.jobHeaderRow}>
                <Text style={styles.jobTitle}>{job.title}</Text>
                <View style={styles.jobPill}>
                  <Text style={styles.jobPillText}>{job.status}</Text>
                </View>
              </View>
              <Text style={styles.jobMeta}>
                #{job.jobNumber} · {job.site?.title || "No site"}
              </Text>
              <Text style={styles.jobMetaSub}>
                {format(new Date(job.createdAt), "MMM dd, yyyy")}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Quick access</Text>
      </View>
      <View style={styles.quickGrid}>
        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => router.push("/(app)/(manager-tabs)/sites" as never)}
        >
          <Ionicons name="location-outline" size={20} color="#3B82F6" />
          <Text style={styles.quickTitle}>Sites</Text>
          <Text style={styles.quickMeta}>View assigned sites</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickCard}
          onPress={() =>
            router.push("/(app)/(manager-tabs)/customers" as never)
          }
        >
          <Ionicons name="people-outline" size={20} color="#3B82F6" />
          <Text style={styles.quickTitle}>Customers</Text>
          <Text style={styles.quickMeta}>Accounts you manage</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomSpace} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  hero: {
    paddingBottom: 16,
  },
  heroGradient: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 28,
  },
  heroSubtitle: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    marginTop: 12,
  },
  heroTitle: {
    color: "#ffffff",
    fontSize: 26,
    fontWeight: "700",
    marginTop: 6,
  },
  heroActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 18,
  },
  heroPrimary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ffffff",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  heroPrimaryText: {
    color: "#3B82F6",
    fontWeight: "700",
  },
  heroSecondary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  heroSecondaryText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    color: "#0f172a",
    fontSize: 18,
    fontWeight: "700",
  },
  sectionAction: {
    color: "#3B82F6",
    fontSize: 13,
    fontWeight: "600",
  },
  jobsList: {
    paddingHorizontal: 20,
    marginTop: 12,
    gap: 12,
  },
  jobCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  jobHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  jobTitle: {
    color: "#0f172a",
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
    marginRight: 8,
  },
  jobPill: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  jobPillText: {
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
  quickGrid: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    marginTop: 12,
  },
  quickCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  quickTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
    marginTop: 8,
  },
  quickMeta: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
  },
  emptyState: {
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 32,
  },
  emptyTitle: {
    color: "#0f172a",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 12,
  },
  emptyText: {
    color: "#64748b",
    textAlign: "center",
    marginTop: 6,
  },
  loaderWrap: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomSpace: {
    height: 40,
  },
});
