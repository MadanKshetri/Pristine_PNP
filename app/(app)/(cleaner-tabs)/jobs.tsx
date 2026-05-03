import { Tabs } from "@/components/ui/tab-link";
import { ScreenHeader } from "@/src/components/ui";
import { JobsCalendarView } from "@/src/features/jobs/components/JobsCalendarView";
import { JobsListView } from "@/src/features/jobs/components/JobsListView";
import { useAuthStore } from "@/src/lib/store/authStore";
import { useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function JobsScreen() {
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
