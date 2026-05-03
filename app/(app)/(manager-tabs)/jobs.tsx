import { Tabs } from "@/components/ui/tab-link";
import { ScreenHeader } from "@/src/components/ui";
import { JobsCalendarView } from "@/src/features/jobs/components/JobsCalendarView";
import { JobsListView } from "@/src/features/jobs/components/JobsListView";
import { useAuthStore } from "@/src/lib/store/authStore";
import { useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function ManagerJobsTab() {
  // const router = useRouter();
  // const user = useAuthStore((state) => state.user);
  // const isManager = user?.role === "manager";

  const user = useAuthStore((state) => state.user);

  const { tab } = useLocalSearchParams<{ tab?: "calendar" | "list" }>();

  const [activeTab, setActiveTab] = useState<"calendar" | "list">(
    tab === "list" ? "list" : "calendar",
  );
  const tabs = useMemo(
    () => [
      {
        key: "calendar",
        title: "Calendar",
        render: () => <JobsCalendarView />,
      },
      {
        key: "list",
        title: "List",
        render: () => <JobsListView />,
      },
    ],
    [],
  );

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={
          user?.role === "manager" || user?.role === "customer manager"
            ? "Jobs"
            : "Schedule"
        }
        showBackButton={true}
      />

      <Tabs
        tabs={tabs}
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as "calendar" | "list")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
});

const styless = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  headerWrap: {
    paddingBottom: 4,
  },
  headerRow: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  subtitle: {
    color: "#64748b",
    fontSize: 13,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#3B82F6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  createText: {
    color: "#ffffff",
    fontWeight: "700",
  },
  listWrap: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  jobCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  jobHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  jobTitleBlock: {
    flex: 1,
    marginRight: 10,
  },
  jobTitle: {
    color: "#0f172a",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  jobNumber: {
    color: "#64748b",
    fontSize: 12,
  },
  statusPill: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    color: "#3B82F6",
    fontSize: 11,
    fontWeight: "600",
  },
  jobMeta: {
    color: "#64748b",
    fontSize: 12,
    marginBottom: 4,
  },
  jobMetaSub: {
    color: "#9CA3AF",
    fontSize: 11,
  },
  staffRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 6,
  },
  staffText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0D9488",
  },
  staffTextUnassigned: {
    color: "#9CA3AF",
    fontWeight: "400",
    fontStyle: "italic",
  },
  emptyWrap: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
  },
});
