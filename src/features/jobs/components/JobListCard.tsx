import { format } from "date-fns";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { Job } from "../types";

interface JobListCardProps {
  job: Job;
  onPress: (jobId: string) => void;
}

const getStatusStyle = (status: Job["status"]) => {
  if (status === "Completed") {
    return { bg: "#D1FAE5", text: "#065F46" };
  }
  if (status === "In Progress") {
    return { bg: "#DBEAFE", text: "#1E40AF" };
  }
  if (status === "Cancelled") {
    return { bg: "#FEE2E2", text: "#991B1B" };
  }
  return { bg: "#FEF3C7", text: "#92400E" };
};

export const JobListCard: React.FC<JobListCardProps> = ({ job, onPress }) => {
  const jobDate = job.startAt ? new Date(job.startAt) : new Date(job.createdAt);
  const endTime = new Date(jobDate.getTime() + 8 * 60 * 60 * 1000);
  const statusStyle = getStatusStyle(job.status);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(job.id)}
      activeOpacity={0.9}
    >
      <View style={styles.headerRow}>
        <View style={styles.titleBlock}>
          <Text style={styles.title} numberOfLines={1}>
            {job.title}
          </Text>
          <Text style={styles.jobNumber}>#{job.jobNumber}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.statusText, { color: statusStyle.text }]}>
            {job.status}
          </Text>
        </View>
      </View>

      <View style={styles.metaWrap}>
        <Text style={styles.metaLabel}>Date</Text>
        <Text style={styles.metaValue}>{format(jobDate, "EEE, MMM d, yyyy")}</Text>
      </View>

      <View style={styles.metaWrap}>
        <Text style={styles.metaLabel}>Time</Text>
        <Text style={styles.metaValue}>
          {`${format(jobDate, "h:mm a")} - ${format(endTime, "h:mm a")}`}
        </Text>
      </View>

      <View style={styles.metaWrap}>
        <Text style={styles.metaLabel}>Site</Text>
        <Text style={styles.metaValue} numberOfLines={2}>
          {job.site?.address.address || "No address available"}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  titleBlock: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 2,
  },
  jobNumber: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  metaWrap: {
    marginTop: 4,
  },
  metaLabel: {
    fontSize: 11,
    color: "#94A3B8",
    textTransform: "uppercase",
    fontWeight: "700",
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 13,
    color: "#334155",
    fontWeight: "500",
  },
});
