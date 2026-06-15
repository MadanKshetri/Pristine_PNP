import { ScreenHeader } from "@/src/components/ui";
import { ManagerIncidentListView } from "@/src/features/incidents/components/ManagerIncidentListView";
import React from "react";
import { StyleSheet, View } from "react-native";

export default function ManagerIncidentListScreen() {
  return (
    <View style={styles.container}>
      <ScreenHeader title="Incident Reports" showBackButton />
      <ManagerIncidentListView />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
});
