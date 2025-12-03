import { ScreenHeader } from "@/src/components/ui";
import { User } from "@/src/lib/store/authStore";
import { debounce } from "@/src/utils/debounce";
import { addDays, format, parseISO, startOfWeek } from "date-fns";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { Job, JobFilters } from "../types";
import { WeekCalendarStrip } from "./WeekCalendarStrip";
import { WeekScheduleList } from "./WeekScheduleList";
import { WeekSummary } from "./WeekSummary";

export const JobListWithCalendar = ({
  jobs,
  handleSearch,
  error,
  isLoading,
  refetch,
  search,
}: {
  jobs: Job[];
  user: User;
  handleSearch: React.Dispatch<React.SetStateAction<JobFilters>>;
  error: any;
  isLoading: boolean;
  refetch: () => void;
  search?: string;
}) => {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<string | null>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [searchText, setSearchText] = useState<string>(search || "");

  const handleJobSearch = useMemo(
    () =>
      debounce((text: string) => {
        handleSearch({ search: text });
      }, 300),
    [handleSearch]
  );

  const handleJobPress = (jobId: string) => {
    router.push(`/job/${jobId}` as any);
  };

  const currentWeekEnd = addDays(currentWeekStart, 6);

  // Filter jobs for the current week to calculate summary
  const weeklyJobs = useMemo(() => {
    // In a real app, we might want to fetch jobs for the week range.
    // Here we assume 'jobs' contains enough data or we filter what we have.
    // For the summary count, we'll just count jobs that fall in this week.
    return jobs.filter((job) => {
      const jobDate = job.startAt
        ? parseISO(job.startAt)
        : parseISO(job.createdAt);
      return jobDate >= currentWeekStart && jobDate <= currentWeekEnd;
    });
  }, [jobs, currentWeekStart, currentWeekEnd]);

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
    <View style={styles.container}>
      <ScreenHeader title="Schedule" showBackButton={true} />

      <WeekCalendarStrip
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        currentWeekStart={currentWeekStart}
        onWeekChange={setCurrentWeekStart}
        markedDates={{}} // Pass marked dates if needed
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        <WeekScheduleList
          weekStart={currentWeekStart}
          jobs={jobs}
          onJobPress={handleJobPress}
        />

        <WeekSummary
          weekStart={currentWeekStart}
          weekEnd={currentWeekEnd}
          totalShifts={weeklyJobs.length}
        />

        {/* Extra padding for bottom nav or FAB */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    backgroundColor: "#fff",
    // paddingHorizontal: 16,
    // paddingTop: 10,
  },
  headerIcons: {
    flexDirection: "row",
    gap: 16,
  },
  iconButton: {
    padding: 4,
  },
  backButton: {
    // styles for back button if custom
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
