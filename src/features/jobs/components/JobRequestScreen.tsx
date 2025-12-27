import {
  useAdminJobControllerCreateJob,
  useManagerControllerGetSiteSummary,
} from "@/fetchers/queriesComponents";
import {
  CreateJobRequestDto,
  ManagerListSiteDto,
} from "@/fetchers/queriesSchemas";
import { Button, Input, ScreenHeader } from "@/src/components/ui";
import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";

export const JobRequestScreen: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();

  React.useEffect(() => {
    if (user && user.role !== "manager") {
      router.replace("/" as any);
    }
  }, [user]);

  const params = useLocalSearchParams();
  const initialDate = params.date
    ? new Date(params.date as string)
    : new Date();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedSite, setSelectedSite] = useState<ManagerListSiteDto | null>(
    null
  );
  const [showSitePicker, setShowSitePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Date and Time
  const [date, setDate] = useState(initialDate);

  const { data: sitesData, isLoading: isLoadingSites } =
    useManagerControllerGetSiteSummary({});
  const createJobMutation = useAdminJobControllerCreateJob();

  const sites = sitesData?.data || [];

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a job title");
      return;
    }
    if (!selectedSite) {
      Alert.alert("Error", "Please select a site");
      return;
    }
    if (!selectedSite.customer) {
      // Should not happen for manager sites usually
      Alert.alert("Error", "Selected site does not have a valid customer");
      return;
    }

    try {
      const payload: CreateJobRequestDto = {
        title,
        description,
        siteId: selectedSite.id,
        customerId: selectedSite.customer.id,
        startAt: date.toISOString(),
        checklists: [],
      };

      await createJobMutation.mutateAsync({
        body: payload,
      });

      Alert.alert("Success", "Job request submitted successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Failed to create job request");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScreenHeader title="Request Job" showBackButton={true} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Date *</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.selectText}>{format(date, "PPP")}</Text>
            <Ionicons name="calendar-outline" size={20} color="#64748b" />
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Site *</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowSitePicker(true)}
          >
            <Text
              style={[
                styles.selectText,
                !selectedSite && styles.placeholderText,
              ]}
            >
              {selectedSite ? selectedSite.title : "Select a site"}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#64748b" />
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Job Title *</Text>
          <Input
            placeholder="e.g. Broken AC Repair"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Description</Text>
          <Input
            placeholder="Describe the issue or requirement..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            style={styles.textArea}
            textAlignVertical="top"
          />
        </View>

        <Button
          onPress={handleCreate}
          disabled={createJobMutation.isPending || isLoadingSites}
          style={styles.submitButton}
        >
          {createJobMutation.isPending ? "Submitting..." : "Submit Request"}
        </Button>
      </ScrollView>

      {/* Site Picker Modal */}
      <Modal
        visible={showSitePicker}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowSitePicker(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowSitePicker(false)}
        >
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Site</Text>
              <TouchableOpacity onPress={() => setShowSitePicker(false)}>
                <Ionicons name="close" size={24} color="#0f172a" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {isLoadingSites ? (
                <Text style={styles.loadingText}>Loading sites...</Text>
              ) : sites.length === 0 ? (
                <Text style={styles.emptyText}>No sites found</Text>
              ) : (
                sites.map((site) => (
                  <TouchableOpacity
                    key={site.id}
                    style={styles.siteItem}
                    onPress={() => {
                      setSelectedSite(site);
                      setShowSitePicker(false);
                    }}
                  >
                    <Text style={styles.siteItemText}>{site.title}</Text>
                    {site.location?.address && (
                      <Text style={styles.siteItemAddress}>
                        {site.location.address}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowDatePicker(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowDatePicker(false)}
        >
          <Pressable
            style={[styles.modalContent, { height: "auto" }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Ionicons name="close" size={24} color="#0f172a" />
              </TouchableOpacity>
            </View>
            <View style={{ padding: 20 }}>
              <Calendar
                current={format(date, "yyyy-MM-dd")}
                onDayPress={(day: { dateString: string }) => {
                  setDate(new Date(day.dateString));
                  setShowDatePicker(false);
                }}
                markedDates={{
                  [format(date, "yyyy-MM-dd")]: {
                    selected: true,
                    disableTouchEvent: true,
                    selectedColor: "orange",
                  },
                }}
                theme={{
                  selectedDayBackgroundColor: "#3B82F6",
                  todayTextColor: "#3B82F6",
                  arrowColor: "#3B82F6",
                }}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  content: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },
  readOnlyInput: {
    backgroundColor: "#f1f5f9",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  readOnlyText: {
    color: "#64748b",
    fontSize: 16,
  },
  selectButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  selectText: {
    fontSize: 16,
    color: "#0f172a",
  },
  placeholderText: {
    color: "#94a3b8",
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12, // for multiline text alignment
  },
  submitButton: {
    marginTop: 20,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },
  modalList: {
    padding: 20,
  },
  loadingText: {
    textAlign: "center",
    color: "#64748b",
    marginTop: 20,
  },
  emptyText: {
    textAlign: "center",
    color: "#64748b",
    marginTop: 20,
  },
  siteItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  siteItemText: {
    fontSize: 16,
    color: "#0f172a",
    fontWeight: "500",
  },
  siteItemAddress: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
});
