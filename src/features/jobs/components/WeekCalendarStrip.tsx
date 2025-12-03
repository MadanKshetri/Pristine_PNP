import { addDays, addWeeks, format, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface WeekCalendarStripProps {
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
  currentWeekStart: Date;
  onWeekChange: (weekStart: Date) => void;
  markedDates?: { [date: string]: any };
}

export const WeekCalendarStrip: React.FC<WeekCalendarStripProps> = ({
  selectedDate,
  onDateSelect,
  currentWeekStart,
  onWeekChange,
  markedDates,
}) => {
  // Generate 7 days for the current week
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }).map((_, index) => {
      const date = addDays(currentWeekStart, index);
      return {
        date,
        dayName: format(date, "EEE"),
        dayNumber: format(date, "d"),
        fullDate: format(date, "yyyy-MM-dd"),
      };
    });
  }, [currentWeekStart]);

  const handleDatePress = (date: string) => {
    onDateSelect(date);
  };

  const handlePreviousWeek = () => {
    onWeekChange(addWeeks(currentWeekStart, -1));
  };

  const handleNextWeek = () => {
    onWeekChange(addWeeks(currentWeekStart, 1));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.navButton} onPress={handlePreviousWeek}>
          <ChevronLeft size={24} color="#007AFF" />
        </TouchableOpacity>

        <Text style={styles.monthTitle}>
          {format(currentWeekStart, "MMMM yyyy")}
        </Text>

        <TouchableOpacity style={styles.navButton} onPress={handleNextWeek}>
          <ChevronRight size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.daysContainer}>
        {weekDays.map((day) => {
          const isSelected = selectedDate === day.fullDate;
          const isToday = isSameDay(day.date, new Date());
          const hasDot = markedDates && markedDates[day.fullDate];

          return (
            <TouchableOpacity
              key={day.fullDate}
              style={[styles.dayItem, isSelected && styles.selectedDayItem]}
              onPress={() => handleDatePress(day.fullDate)}
            >
              <Text
                style={[
                  styles.dayName,
                  isSelected && styles.selectedDayText,
                  !isSelected && isToday && styles.todayText,
                ]}
              >
                {day.dayName}
              </Text>
              <View
                style={[
                  styles.dayNumberContainer,
                  isSelected && styles.selectedDayNumberContainer,
                ]}
              >
                <Text
                  style={[
                    styles.dayNumber,
                    isSelected && styles.selectedDayText,
                    !isSelected && isToday && styles.todayText,
                  ]}
                >
                  {day.dayNumber}
                </Text>
              </View>
              {hasDot && !isSelected && <View style={styles.dot} />}
              {isSelected && <View style={styles.indicator} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    paddingVertical: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  navButton: {
    padding: 4,
  },
  daysContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 10,
  },
  dayItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    width: 50,
  },
  selectedDayItem: {},
  dayName: {
    fontSize: 12,
    color: "#8E8E93",
    marginBottom: 4,
  },
  dayNumberContainer: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  selectedDayNumberContainer: {
    backgroundColor: "#0EA5E9",
    borderRadius: 20,
  },
  dayNumber: {
    fontWeight: "500",
    color: "#000",
  },
  selectedDayText: {
    color: "#ffffff",
  },
  todayText: {
    padding: 4,
    color: "#007AFF",
    fontWeight: "700",
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#0EA5E9",
    marginTop: 4,
  },
  indicator: {
    width: 20,
    height: 3,
    backgroundColor: "#0EA5E9",
    marginTop: 4,
    borderRadius: 1.5,
  },
});
