import {
  fetchAdminSiteControllerSiteCleaners,
  fetchAdminSiteControllerSites,
  useAdminJobControllerCreateJob,
} from "@/fetchers/queriesComponents";
import { Button, Input, ScreenHeader } from "@/src/components/ui";
import FormInput from "@/components/ui/form-input";
import { CreateJobSchema } from "@/src/schema";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { z } from "zod";
import AsyncSelect from "@/components/ui/async-select";
import { INPUT_CLASSNAME } from "@/src/utils/constants";

export const CreateJobForm: React.FC = () => {
  const router = useRouter();

  const form = useForm<z.infer<typeof CreateJobSchema>>({
    resolver: zodResolver(CreateJobSchema),
    mode: "onSubmit",
    defaultValues: {
      title: "",
      assignedCleanerId: undefined,
      customerId: "",
      description: "",
      siteId: "",
      startAt: new Date(),
    },
  });

  const { control, handleSubmit } = form;

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(new Date());

  const queryClient = useQueryClient();

  const createJobMutation = useAdminJobControllerCreateJob();

  const selectedSiteId = form.watch("siteId");

  const handleCreate = handleSubmit(async (data) => {
    try {
      await createJobMutation.mutateAsync(
        {
          body: {
            siteId: data.siteId,
            customerId: data.customerId,
            description: data.description,
            title: data.title,
            startAt: date.toISOString(),
            checklists: [],
          },
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "job"] });
          },
        },
      );

      Alert.alert("Success", "Job created successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Failed to create job");
    }
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScreenHeader title="Create Job" showBackButton={true} />

      <View className="flex flex-col gap-2 p-4">
        <FormInput
          control={control}
          required
          name="title"
          label="Job Title"
          placeholder="e.g. AC Repair"
        />

        <View>
          <Text style={styles.label}>Date *</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.selectText}>{format(date, "PPP")}</Text>
            <Ionicons name="calendar-outline" size={20} color="#64748b" />
          </TouchableOpacity>
        </View>

        <FormInput
          name="siteId"
          required
          label="Site"
          control={control}
          render={({ field }) => {
            return (
              <AsyncSelect
                withSearch={true}
                placeholder="Select a site"
                className={{
                  trigger: INPUT_CLASSNAME,
                  triggerActive: "bg-white border-gray-300",
                }}
                fetcher={{
                  fn: fetchAdminSiteControllerSites,
                  queryKey: ["admin", "site"],
                  renderables: {
                    getLabelFromItem: (item) => item.title,
                    getValueFromItem: (item) => item.id,
                  },
                  onItemSelect: (item) => {
                    form.setValue("customerId", item.customer.id);
                    field.onChange(item.id);
                  },
                  search: "search",
                }}
              />
            );
          }}
        />

        <FormInput
          name="assignedCleanerId"
          control={control}
          label="Assign Cleaner"
          disabled={!selectedSiteId}
          render={({ field }) => {
            return (
              <AsyncSelect
                withSearch={true}
                disabled={!selectedSiteId}
                className={{
                  trigger: INPUT_CLASSNAME,
                  triggerActive: "bg-white border-gray-300",
                }}
                fetcher={{
                  fn: fetchAdminSiteControllerSiteCleaners,
                  params: {
                    pathParams: {
                      siteId: selectedSiteId,
                    },
                  },
                  queryKey: ["admin", "site", selectedSiteId, "cleaners"],
                  renderables: {
                    getLabelFromItem: (item) => item.name,
                    getValueFromItem: (item) => item.id,
                  },
                  onItemSelect: (item) => {
                    form.setValue("assignedCleanerId", item.id);
                    field.onChange(item.id);
                  },
                }}
              />
            );
          }}
        />

        <View style={styles.formGroup}>
          <FormInput
            control={control}
            name="description"
            label="Description"
            render={(props) => (
              <Input
                placeholder="Describe the job requirements..."
                value={props?.field.value}
                onChangeText={props?.field.onChange}
                multiline
                numberOfLines={4}
                style={styles.textArea}
                textAlignVertical="top"
              />
            )}
          />
        </View>

        <Button
          onPress={handleCreate}
          disabled={createJobMutation.isPending}
          style={styles.submitButton}
        >
          {createJobMutation.isPending ? "Creating..." : "Create Job"}
        </Button>
      </View>

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
    paddingTop: 12,
  },
  submitButton: {
    marginTop: 20,
  },
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
