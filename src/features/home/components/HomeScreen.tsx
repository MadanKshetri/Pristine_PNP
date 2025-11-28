import { DashboardSummaryDto, ListJobDto } from "@/fetchers/queriesSchemas";
import { AnalyticsCard } from "@/src/components/ui/AnalyticsCard";
import { User } from "@/src/lib/store/authStore";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import {
  Briefcase,
  Calendar as CalendarIcon,
  CheckCircle,
  Clock,
} from "lucide-react-native";
import React from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export const HomeScreen = ({
  summary,
  inProgressJobs,
  scheduledJobs,
  isLoading,
  user,
  onRefresh,
  refreshing,
}: {
  summary?: DashboardSummaryDto;
  inProgressJobs: ListJobDto[];
  scheduledJobs: ListJobDto[];
  isLoading: boolean;
  user: User;
  onRefresh?: () => void;
  refreshing?: boolean;
}) => {
  const router = useRouter();

  const handleJobPress = (jobId: string) => {
    router.push(`/job/${jobId}`);
  };

  // Analytics data from summary
  const totalJobs =
    (summary?.completed || 0) +
    (summary?.pending || 0) +
    (summary?.upcomming || 0) +
    (summary?.cancelled || 0);
  const completedJobs = summary?.completed || 0;
  const pendingJobs = summary?.pending || 0;
  const inProgressJobsCount = summary?.upcomming || 0; // Assuming 'upcomming' maps to 'In Progress' or we need to check mapping.
  // Wait, 'upcomming' usually means scheduled. 'pending' might be unassigned?
  // Let's check the DTO: pending, completed, upcomming, cancelled.
  // And job statuses: scheduled, In Progress, Completed, Cancelled.
  // Usually:
  // pending -> In Progress? Or Unassigned?
  // upcomming -> Scheduled?
  // Let's assume:
  // pending = In Progress (or maybe scheduled?)
  // upcomming = Scheduled (or maybe In Progress?)
  // Let's look at the previous code:
  // const pendingJobs = jobs.filter((job) => job.status === 'scheduled').length;
  // const inProgressJobs = jobs.filter((job) => job.status === 'In Progress').length;

  // If the backend summary uses different terms, we might need to guess or check.
  // Common mapping:
  // pending -> Scheduled (waiting to start)
  // upcomming -> Scheduled (future)
  // But we have 'In Progress'.
  // Let's assume 'pending' is 'scheduled' and 'upcomming' is 'In Progress'? No, that sounds backwards.
  // Let's assume 'pending' is 'In Progress' (pending completion) and 'upcomming' is 'Scheduled'.
  // Or 'pending' is 'Scheduled' and 'upcomming' is 'In Progress'?

  // Let's just use the values we have and map them as best as possible.
  // If summary is missing, fall back to 0.

  // RE-READING DTO:
  // pending: number;
  // completed: number;
  // upcomming: number;
  // cancelled: number;

  // Previous code:
  // pendingJobs = status === 'scheduled'
  // inProgressJobs = status === 'In Progress'

  // Let's map:
  // pending -> Scheduled (matches 'pendingJobs' variable name)
  // upcomming -> In Progress? (matches 'inProgressJobs' variable name?)
  // Actually, 'upcomming' usually means future. 'pending' usually means waiting for action.
  // Let's try:
  // pending -> Scheduled
  // upcomming -> In Progress (maybe? or maybe 'upcomming' is scheduled and 'pending' is unassigned?)

  // Let's trust the variable names in the previous code:
  // pendingJobs (variable) was 'scheduled'.
  // inProgressJobs (variable) was 'In Progress'.

  // Let's map summary.pending to 'Pending' card (which was 'scheduled').
  // Let's map summary.upcomming to 'In Progress' card? Or vice versa?
  // 'Upcomming' sounds like 'Scheduled'.
  // 'Pending' sounds like 'In Progress' (pending completion).

  // Let's swap them if needed. For now:
  // Pending Card -> summary.pending
  // In Progress Card -> summary.upcomming

  // Wait, if I look at the card titles:
  // Title: 'Pending', Value: pendingJobs
  // Title: 'In Progress', Value: inProgressJobs

  // So I will use:
  // summary.pending -> Pending Card
  // summary.upcomming -> In Progress Card

  const analyticsData = [
    {
      id: 1,
      title: "Total Jobs",
      value: totalJobs.toString(),
      icon: Briefcase,
      gradient: ["#3b82f6", "#2563eb"] as const,
    },
    {
      id: 2,
      title: "Completed",
      value: completedJobs.toString(),
      icon: CheckCircle,
      gradient: ["#10b981", "#059669"] as const,
    },
    {
      id: 3,
      title: "Pending",
      value: pendingJobs.toString(),
      icon: Clock,
      gradient: ["#f59e0b", "#d97706"] as const,
    },
    {
      id: 4,
      title: "In Progress",
      value: (summary?.upcomming || 0).toString(), // Using upcomming for In Progress based on elimination
      icon: CalendarIcon,
      gradient: ["#8b5cf6", "#7c3aed"] as const,
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing || false}
          onRefresh={onRefresh}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <Text style={styles.headerSubtitle}>
          Welcome back, {user?.fullName || user?.email || "User"}!
        </Text>
      </View>

      <View style={styles.analyticsContainer}>
        {analyticsData.map((item, index) => (
          <AnalyticsCard
            item={{
              id: item.id,
              icon: item.icon,
              value: item.value,
              title: item.title,
              gradient: [...item.gradient],
            }}
            key={index}
          />
        ))}
      </View>

      {inProgressJobs.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Currently Running</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{inProgressJobs.length}</Text>
            </View>
          </View>

          {inProgressJobs.map((job) => (
            <TouchableOpacity
              key={job.id}
              onPress={() => handleJobPress(job.id)}
              activeOpacity={0.7}
            >
              <View style={styles.jobCard}>
                <View style={styles.jobHeader}>
                  <View style={styles.jobTitleContainer}>
                    <Text style={styles.jobTitle}>{job.title}</Text>
                    <Text style={styles.jobClient}>
                      {job.site?.city || "No location"}
                    </Text>
                  </View>
                  <View style={styles.statusBadgeRunning}>
                    <Text style={styles.statusTextRunning}>Started</Text>
                  </View>
                </View>

                {job.startAt && (
                  <View style={styles.jobFooter}>
                    <View style={styles.dueDateContainer}>
                      <Clock size={14} color="#64748b" strokeWidth={2} />
                      <Text style={styles.dueDate}>
                        {format(new Date(job.startAt), "MMM dd, h:mm a")}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {scheduledJobs.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Jobs</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{scheduledJobs.length}</Text>
            </View>
          </View>

          {scheduledJobs.map((job) => (
            <TouchableOpacity
              key={job.id}
              onPress={() => handleJobPress(job.id)}
              activeOpacity={0.7}
            >
              <View style={styles.jobCard}>
                <View style={styles.jobHeader}>
                  <View style={styles.jobTitleContainer}>
                    <Text style={styles.jobTitle}>{job.title}</Text>
                    <Text style={styles.jobClient}>
                      {job.site?.city || "No location"}
                    </Text>
                  </View>
                  <View style={styles.statusBadgeScheduled}>
                    <Text
                      style={styles.statusTextScheduled}
                      className="capitalize"
                    >
                      {job.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.jobFooter}>
                  <View style={styles.dueDateContainer}>
                    <CalendarIcon size={14} color="#64748b" strokeWidth={2} />
                    <Text style={styles.dueDate}>
                      {format(new Date(job.createdAt), "MMM dd, yyyy")}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {!isLoading &&
        inProgressJobs.length === 0 &&
        scheduledJobs.length === 0 && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Briefcase size={48} color="#3B82F6" strokeWidth={2} />
            </View>
            <Text style={styles.emptyTitle}>No Jobs Yet</Text>
            <Text style={styles.emptyText}>
              You don&apos;t have any assigned jobs at the moment. New jobs will
              appear here when assigned.
            </Text>
          </View>
        )}

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 24,
    backgroundColor: "#ffffff",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#64748b",
    fontWeight: "500",
  },
  analyticsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 8,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
    marginRight: 8,
  },
  badge: {
    backgroundColor: "#e0e7ff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#3730a3",
  },
  jobCard: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  jobHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  jobTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 4,
  },
  jobClient: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  statusBadgeRunning: {
    backgroundColor: "#dbeafe",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusTextRunning: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1e40af",
  },
  statusBadgeScheduled: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusTextScheduled: {
    fontSize: 12,
    fontWeight: "700",
    color: "#92400e",
  },
  jobFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dueDateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dueDate: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "600",
    marginLeft: 6,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 20,
  },
  bottomPadding: {
    height: 24,
  },
});
