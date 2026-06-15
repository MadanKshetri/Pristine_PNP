import { ScreenHeader } from "@/src/components/ui";
import { StaffIncidentListView } from "@/src/features/incidents/components/StaffIncidentListView";
import React from "react";
import { StyleSheet, View } from "react-native";

export default function StaffIncidentListScreen() {
  return (
    <View style={styles.container}>
      <ScreenHeader title="My Reports" showBackButton />
      <StaffIncidentListView />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
});
