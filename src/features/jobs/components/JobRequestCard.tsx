import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { JobRequest } from "../types";

interface JobRequestCardProps {
  request: JobRequest;
  onPress?: (requestId: string) => void;
}

export const JobRequestCard: React.FC<JobRequestCardProps> = ({
  request,
  onPress,
}) => {
  const scheduledAt = new Date(request.startAt);
  const dateLabel = format(scheduledAt, "EEE, MMM d");
  const timeLabel = format(scheduledAt, "h:mm a");
  const siteAddress = request.site?.location?.address ?? "";

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={onPress ? 0.9 : 1}
      onPress={() => onPress?.(request.id)}
      disabled={!onPress}
    >
      <View style={styles.badgeRow}>
        <View style={styles.statusPill}>
          <Text style={styles.statusText}>Job Request</Text>
        </View>
        <Text style={styles.dateText}>{dateLabel}</Text>
      </View>

      <Text style={styles.title}>{request.title}</Text>

      <View style={styles.siteRow}>
        <View style={styles.iconChip}>
          <Ionicons name="business-outline" size={16} color="#2563EB" />
        </View>
        <View style={styles.siteTexts}>
          <Text style={styles.siteTitle}>{request.site?.title}</Text>
          {!!siteAddress && (
            <Text style={styles.siteAddress} numberOfLines={2}>
              {siteAddress}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.timeRow}>
        <Ionicons name="time-outline" size={16} color="#0f172a" />
        <Text style={styles.timeText}>{timeLabel}</Text>
      </View>

      {request.description ? (
        <Text style={styles.description} numberOfLines={3}>
          {request.description}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    gap: 12,
  },
  badgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#EFF6FF",
  },
  statusText: {
    color: "#1D4ED8",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  dateText: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "600",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },
  siteRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  iconChip: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  siteTexts: {
    flex: 1,
    gap: 4,
  },
  siteTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  siteAddress: {
    fontSize: 13,
    color: "#475569",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  timeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
  },
  description: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 18,
  },
});
