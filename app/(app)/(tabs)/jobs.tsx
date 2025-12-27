import { StaffJobControllerJobsQueryParams } from "@/fetchers/queriesComponents";
import { ScreenHeader } from "@/src/components/ui";
import { WeekCalendarStrip } from "@/src/features/jobs/components/WeekCalendarStrip";
import { WeekScheduleList } from "@/src/features/jobs/components/WeekScheduleList";
import { WeekSummary } from "@/src/features/jobs/components/WeekSummary";
import { useJobsByRole } from "@/src/features/jobs/hooks/useJobsByRole";
import { useAuthStore } from "@/src/lib/store/authStore";
import { addDays, format, startOfWeek } from "date-fns";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function JobsScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [selectedDate, setSelectedDate] = useState<string | null>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  // Calculate week end and date filters
  const currentWeekEnd = addDays(currentWeekStart, 6);

  const filters: StaffJobControllerJobsQueryParams = useMemo(
    () => ({
      status: JSON.stringify(["Scheduled", "In Progress"]) as any,
      dateFrom: format(currentWeekStart, "yyyy-MM-dd"),
      dateTo: format(currentWeekEnd, "yyyy-MM-dd"),
    }),
    [currentWeekStart, currentWeekEnd]
  );

  const { jobs, error, isLoading, refetch } = useJobsByRole(filters);

  const handleJobPress = (jobId: string) => {
    router.push(`/job/${jobId}` as any);
  };

  // Filter jobs for the current week to calculate summary
  const weeklyJobs = useMemo(() => {
    return jobs.filter((job) => {
      const jobDate = job.startAt
        ? new Date(job.startAt)
        : new Date(job.createdAt);
      return jobDate >= currentWeekStart && jobDate <= currentWeekEnd;
    });
  }, [jobs, currentWeekStart, currentWeekEnd]);

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error && !isLoading) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Error Loading Jobs</Text>
        <Text style={styles.errorText}>
          {(error as any)?.payload || "Something went wrong. Please try again."}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refetch} />
      }
    >
      <View style={styles.container}>
        <ScreenHeader title="Schedule" showBackButton={true} />

        <WeekCalendarStrip
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          currentWeekStart={currentWeekStart}
          onWeekChange={setCurrentWeekStart}
          markedDates={{}}
        />

        <WeekScheduleList
          weekStart={currentWeekStart}
          jobs={jobs}
          onJobPress={handleJobPress}
          onRequestJob={
            user?.role === "manager"
              ? (date) =>
                  router.push({
                    pathname: "/jobs/request",
                    params: { date: date.toISOString() },
                  })
              : undefined
          }
        />

        <WeekSummary
          weekStart={currentWeekStart}
          weekEnd={currentWeekEnd}
          totalShifts={weeklyJobs.length}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
});
