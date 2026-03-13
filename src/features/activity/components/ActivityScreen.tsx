import { LoadingSpinner } from "@/src/components/ui";
import { useAuthStore } from "@/src/lib/store/authStore";
import { Ionicons } from "@expo/vector-icons";
import { format, isToday, isYesterday } from "date-fns";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useMemo, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { ListActivityDto } from "@/fetchers/queriesSchemas";
import { useActivityByRole } from "../hooks";
import { styles } from "./activityScreenStyles";

/* ── Helpers ───────────────────────────────────────── */

type ActivityType = string;

const ACTIVITY_ICON_MAP: Record<
  string,
  { icon: keyof typeof Ionicons.glyphMap; bg: string; color: string }
> = {
  job: { icon: "briefcase", bg: "#DBEAFE", color: "#2563EB" },
  checklist: { icon: "checkmark-circle", bg: "#D1FAE5", color: "#059669" },
  site: { icon: "location", bg: "#E0E7FF", color: "#4F46E5" },
  customer: { icon: "people", bg: "#FCE7F3", color: "#DB2777" },
  user: { icon: "person", bg: "#FEF3C7", color: "#D97706" },
  staff: { icon: "person", bg: "#FEF3C7", color: "#D97706" },
  auth: { icon: "lock-closed", bg: "#F3E8FF", color: "#7C3AED" },
};

const DEFAULT_ICON = {
  icon: "pulse" as keyof typeof Ionicons.glyphMap,
  bg: "#F1F5F9",
  color: "#64748B",
};

function getActivityVisual(type: Record<string, any>) {
  // The `type` field is a Record. Try common keys or the first key's value.
  const typeStr =
    typeof type === "string"
      ? type
      : (type?.entity || type?.type || Object.keys(type)[0] || "")
          .toString()
          .toLowerCase();
  return ACTIVITY_ICON_MAP[typeStr] || DEFAULT_ICON;
}

function formatActivityTime(dateStr: string): string {
  const d = new Date(dateStr);
  return format(d, "h:mm a");
}

function getDateLabel(dateStr: string): string {
  const d = new Date(dateStr);
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "EEEE, MMM d");
}

/** Group activities by date label */
function groupByDate(
  activities: ListActivityDto[],
): { label: string; items: ListActivityDto[] }[] {
  const map = new Map<string, ListActivityDto[]>();
  for (const a of activities) {
    const label = getDateLabel(a.createdAt);
    const arr = map.get(label) || [];
    arr.push(a);
    map.set(label, arr);
  }
  return Array.from(map.entries()).map(([label, items]) => ({ label, items }));
}

/* ── Component ─────────────────────────────────────── */

export const ActivityScreen: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const isManager =
    user?.role === "manager" || user?.role === "customer manager";

  const [search, setSearch] = useState("");
  const [page] = useState(0);

  const { activities, isLoading, isRefetching, refetch, total } =
    useActivityByRole({
      page,
      take: 50,
      ...(search.trim() ? { search: search.trim() } : {}),
    });

  const grouped = useMemo(() => groupByDate(activities), [activities]);

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <View style={styles.container}>
      {/* ── Gradient Header ────────────────────────── */}
      <SafeAreaView edges={["top"]} style={{ backgroundColor: "#3B82F6" }}>
        <LinearGradient
          colors={
            isManager
              ? ["#3B82F6", "#2563EB", "#1D4ED8"]
              : ["#0D9488", "#0F766E", "#115E59"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerTopRow}>
            <View style={styles.headerTitleWrap}>
              <View style={styles.headerIconCircle}>
                <Ionicons name="notifications" size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.headerTitle}>Activity</Text>
            </View>
            {total > 0 && (
              <View style={styles.headerBadge}>
                <Text style={styles.headerBadgeText}>
                  {total} {total === 1 ? "event" : "events"}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.headerSubtitle}>
            {isManager
              ? "Recent activity across your organization"
              : "Your recent activity and updates"}
          </Text>
        </LinearGradient>
      </SafeAreaView>

      {/* ── Search Bar ─────────────────────────────── */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search activity..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearch("")}
              style={styles.searchClear}
            >
              <Ionicons name="close-circle" size={18} color="#CBD5E1" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Activity List ──────────────────────────── */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />
        }
      >
        {isLoading && activities.length === 0 ? (
          <View style={styles.loadingWrap}>
            <LoadingSpinner />
          </View>
        ) : activities.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconWrap}>
              <Ionicons
                name="notifications-off-outline"
                size={36}
                color="#94A3B8"
              />
            </View>
            <Text style={styles.emptyTitle}>No activity yet</Text>
            <Text style={styles.emptyText}>
              {search.trim()
                ? "No results match your search. Try a different keyword."
                : "When actions happen in the system, they will appear here."}
            </Text>
          </View>
        ) : (
          <View style={styles.listWrap}>
            {grouped.map((group) => (
              <View key={group.label}>
                {/* Date Separator */}
                <View style={styles.dateSectionHeader}>
                  <View style={styles.dateDot} />
                  <Text style={styles.dateSectionText}>{group.label}</Text>
                  <View style={styles.dateLine} />
                </View>

                {/* Activity Cards */}
                {group.items.map((activity) => {
                  const visual = getActivityVisual(activity.type);
                  return (
                    <View key={activity.id} style={styles.activityCard}>
                      {/* Icon */}
                      <View
                        style={[
                          styles.activityIconWrap,
                          { backgroundColor: visual.bg },
                        ]}
                      >
                        <Ionicons
                          name={visual.icon}
                          size={20}
                          color={visual.color}
                        />
                      </View>

                      {/* Content */}
                      <View style={styles.activityContent}>
                        <View style={styles.activityTitleRow}>
                          <Text
                            style={styles.activityTitle}
                            numberOfLines={2}
                          >
                            {activity.title}
                          </Text>
                          <Text style={styles.activityTime}>
                            {formatActivityTime(activity.createdAt)}
                          </Text>
                        </View>

                        {activity.description ? (
                          <Text
                            style={styles.activityDescription}
                            numberOfLines={2}
                          >
                            {activity.description}
                          </Text>
                        ) : null}

                        {/* Footer chips */}
                        <View style={styles.activityFooter}>
                          {activity.user && (
                            <View style={styles.activityChip}>
                              <Ionicons
                                name="person-circle-outline"
                                size={14}
                                color="#64748B"
                              />
                              <Text style={styles.activityChipText}>
                                {activity.user.name}
                              </Text>
                            </View>
                          )}
                          {activity.customer && (
                            <View style={styles.activityChip}>
                              <Ionicons
                                name="business-outline"
                                size={13}
                                color="#64748B"
                              />
                              <Text style={styles.activityChipText}>
                                {activity.customer.name}
                              </Text>
                            </View>
                          )}
                          {activity.diff && activity.diff.length > 0 && (
                            <View style={styles.diffBadge}>
                              <Ionicons
                                name="git-compare-outline"
                                size={12}
                                color="#C2410C"
                              />
                              <Text style={styles.diffBadgeText}>
                                {activity.diff.length}{" "}
                                {activity.diff.length === 1
                                  ? "change"
                                  : "changes"}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};
