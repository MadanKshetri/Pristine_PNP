import { addDays, format, isSameDay, parseISO } from "date-fns";

import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Job } from "../types";
import { ScheduleJobCard } from "./ScheduleJobCard";

interface WeekScheduleListProps {
  weekStart: Date;
  jobs: Job[];
  onJobPress: (jobId: string) => void;
  onRequestJob?: (date: Date) => void;
}

export const WeekScheduleList: React.FC<WeekScheduleListProps> = ({
  weekStart,
  jobs,
  onJobPress,
  onRequestJob,
}) => {
  const weekDays = Array.from({ length: 7 }).map((_, index) =>
    addDays(weekStart, index)
  );

  return (
    <View style={styles.container}>
      {weekDays.map((date) => {
        const dayJobs = jobs.filter((job) => {
          // Logic to match job to date.
          // Assuming job.startAt is the key. If not, use createdAt or other logic.
          const jobDate = job.startAt
            ? parseISO(job.startAt)
            : parseISO(job.createdAt);
          return isSameDay(date, jobDate);
        });

        return (
          <View key={date.toISOString()} style={styles.dayRow}>
            <View style={styles.dateColumn}>
              <Text style={styles.dayNumber}>{format(date, "d")}</Text>
              <Text style={styles.dayName}>{format(date, "EEE")}</Text>
            </View>

            <View style={styles.contentColumn}>
              {dayJobs.length > 0 ? (
                dayJobs.map((job) => (
                  <ScheduleJobCard
                    key={job.id}
                    job={job}
                    onPress={onJobPress}
                  />
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No jobs scheduled</Text>
                  {onRequestJob && (
                    <TouchableOpacity
                      style={styles.requestButton}
                      onPress={() => onRequestJob(date)}
                    >
                      <Text style={styles.requestButtonText}>
                        + Request Job
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  dayRow: {
    flexDirection: "row",
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  dateColumn: {
    width: 50,
    alignItems: "center",
    paddingTop: 10,
  },
  dayNumber: {
    fontSize: 20,
    fontWeight: "400",
    color: "#8E8E93",
  },
  dayName: {
    fontSize: 12,
    color: "#8E8E93",
    marginTop: 4,
  },
  contentColumn: {
    flex: 1,
    paddingLeft: 10,
  },
  emptyState: {
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  emptyText: {
    fontSize: 14,
    color: "#8E8E93",
    fontStyle: "italic",
    marginBottom: 8,
  },
  requestButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  requestButtonText: {
    color: "#3B82F6",
    fontSize: 14,
    fontWeight: "600",
  },
});
