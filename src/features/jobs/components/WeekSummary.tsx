import { format } from "date-fns";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface WeekSummaryProps {
  weekStart: Date;
  weekEnd: Date;
  totalShifts: number;
}

export const WeekSummary: React.FC<WeekSummaryProps> = ({
  weekStart,
  weekEnd,
  totalShifts,
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
      >
        <Text style={styles.title}>
          Week summary{" "}
          <Text style={styles.dateRange}>
            {format(weekStart, "MMM dd")} - {format(weekEnd, "MMM dd")}
          </Text>{" "}
          • {totalShifts} shifts
        </Text>
        {expanded ? (
          <ChevronUp size={20} color="#666" />
        ) : (
          <ChevronDown size={20} color="#666" />
        )}
      </TouchableOpacity>

      {expanded && (
        <View style={styles.content}>
          <Text style={styles.summaryText}>
            You have {totalShifts} shifts scheduled for this week.
            {/* Add more summary details here if needed */}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E0E0E0",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
  },
  dateRange: {
    fontWeight: "400",
    color: "#333",
  },
  content: {
    marginTop: 10,
  },
  summaryText: {
    fontSize: 14,
    color: "#666",
  },
});
