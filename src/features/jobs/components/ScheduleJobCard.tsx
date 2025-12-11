import { format } from "date-fns";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Job } from "../types";

interface ScheduleJobCardProps {
  job: Job;
  onPress: (jobId: string) => void;
}

export const ScheduleJobCard: React.FC<ScheduleJobCardProps> = ({
  job,
  onPress,
}) => {
  const startTime = job.startAt
    ? new Date(job.startAt)
    : new Date(job.createdAt);
  const endTime = new Date(startTime.getTime() + 8 * 60 * 60 * 1000);

  const formattedTimeRange = `${format(startTime, "h:mm a")} - ${format(endTime, "h:mm a")}`;

  // Determine status color and text
  const getStatusStyle = () => {
    const status = job.status;
    if (status === "Completed") {
      return { bg: "#D1FAE5", text: "#065F46", label: "Completed" };
    } else if (status === "In Progress") {
      return { bg: "#DBEAFE", text: "#1E40AF", label: "In Progress" };
    } else {
      return { bg: "#FEF3C7", text: "#92400E", label: "Scheduled" };
    }
  };

  const statusStyle = getStatusStyle();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(job.id)}
      activeOpacity={0.9}
    >
      <View style={styles.leftBorder} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.timeText}>{formattedTimeRange}</Text>
          <View
            style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}
          >
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {statusStyle.label}
            </Text>
          </View>
        </View>

        <View style={styles.details}>
          {job.site && (
            <Text style={styles.addressText} numberOfLines={2}>
              {job.site.address.address}
            </Text>
          )}
          {job.title && <Text style={styles.titleText}>{job.title}</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  leftBorder: {
    width: 6,
    backgroundColor: "#4F7942",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  timeText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  details: {
    gap: 4,
  },
  addressText: {
    fontSize: 14,
    color: "#333",
  },
  titleText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
});
