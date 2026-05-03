import { WeekCalendarStrip } from "@/src/features/jobs/components/WeekCalendarStrip";
import { WeekScheduleList } from "@/src/features/jobs/components/WeekScheduleList";
import { WeekSummary } from "@/src/features/jobs/components/WeekSummary";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useJobsByRole } from "../hooks/useJobsByRole";
import { useCallback, useMemo, useState } from "react";
import { addDays, format, startOfWeek } from "date-fns";
import { StaffJobControllerJobsQueryParams } from "@/fetchers/queriesComponents";
import { useRouter } from "expo-router";

export function JobsCalendarView() {
  const [selectedDate, setSelectedDate] = useState<string | null>(
    format(new Date(), "yyyy-MM-dd"),
  );
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 }),
  );

  const router = useRouter();

  // Calculate week end and date filters
  const currentWeekEnd = addDays(currentWeekStart, 6);

  const weeklyFilters: StaffJobControllerJobsQueryParams = useMemo(
    () => ({
      status: JSON.stringify(["Scheduled", "In Progress"]) as any,
      dateFrom: currentWeekStart.toISOString(),
      dateTo: currentWeekEnd.toISOString(),
    }),
    [currentWeekStart, currentWeekEnd],
  );

  const handleJobPress = useCallback(
    (jobId: string) => {
      router.push(`/job/${jobId}` as any);
    },
    [router],
  );

  const { jobs, error, isLoading, isRefetching, refetch } =
    useJobsByRole(weeklyFilters);

  if (error && !isLoading) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Error Loading Jobs</Text>
        <Text style={styles.errorText}>
          {(error as any)?.payload || "Something went wrong. Please try again."}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={refetch}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
    >
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
        onRequestJob={() => {}}
      />

      <WeekSummary
        weekStart={currentWeekStart}
        weekEnd={currentWeekEnd}
        totalShifts={jobs.length}
      />

      <TouchableOpacity
        style={styles.calendarRefreshButton}
        onPress={refetch}
        disabled={isRefetching}
        activeOpacity={0.9}
      >
        <Text style={styles.calendarRefreshText}>
          {isRefetching ? "Refreshing..." : "Refresh Calendar"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 16,
  },
  calendarRefreshButton: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 14,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  calendarRefreshText: {
    color: "#1D4ED8",
    fontSize: 13,
    fontWeight: "700",
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
