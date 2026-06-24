import { FilterBar } from "@/components/ui/filter/filter-bar";
import { Tabs } from "@/components/ui/tab-link";
import { fetchStaffControllerGetSites } from "@/fetchers/queriesComponents";
import { ScreenHeader } from "@/src/components/ui";
import { StaffIncidentListView } from "@/src/features/incidents/components/StaffIncidentListView";
import { JobsCalendarView } from "@/src/features/jobs/components/JobsCalendarView";
import { JobsListView } from "@/src/features/jobs/components/JobsListView";
import { useActivityFilters } from "@/src/hooks/useActivityFilters";
import { useAuthStore } from "@/src/lib/store/authStore";
import { createFilterConfig } from "@/src/types/filter";
import { useLocalSearchParams } from "expo-router";
import { Filter } from "lucide-react-native";
import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function JobsScreen() {
  const user = useAuthStore((state) => state.user);

  const { tab } = useLocalSearchParams<{ tab?: "calendar" | "list" | "incidents" }>();

  const { filters, setFilter, resetAll, activeCount } = useActivityFilters();

  const [showFilters, setShowFilters] = useState(activeCount > 0);

  const [activeTab, setActiveTab] = useState<"calendar" | "list" | "incidents">(
    tab === "list" ? "list" : tab === "incidents" ? "incidents" : "calendar",
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
        title: "Jobs",
        render: () => <JobsListView />,
      },
      {
        key: "incidents",
        title: "Feedback & Requests",
        render: () => <StaffIncidentListView />,
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
        rightAction={
          <Filter size={24} color={showFilters ? "#3B82F6" : "#1F2937"} />
        }
        onRightAction={() => setShowFilters(!showFilters)}
        showBackButton={true}
      />

      {showFilters && (
        <FilterBar
          configs={[
            createFilterConfig({
              id: "siteId",
              label: "Site",
              type: "single",
              fetcher: {
                fn: fetchStaffControllerGetSites,
                queryKey: ["sites"],
                search: "search",
                renderables: {
                  getValueFromItem: (item) => item.id,
                  getLabelFromItem: (item) => item.title,
                },
              },
            }),
          ]}
          state={filters}
          onChange={(id, value) => setFilter(id, value)}
          onReset={resetAll}
          activeCount={activeCount}
        />
      )}

      <Tabs
        tabs={tabs}
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as "calendar" | "list" | "incidents")}
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
