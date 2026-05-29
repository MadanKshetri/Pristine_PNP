import AsyncSelect from "@/components/ui/async-select";
import FormInput from "@/components/ui/form-input";
import StaticSelect from "@/components/ui/static-select";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import {
  fetchStaffControllerGetSites,
  useStaffIncidentConrollerCreate,
} from "@/fetchers/queriesComponents";
import { Button, ScreenHeader } from "@/src/components/ui";
import { CreateIncidentSchema } from "@/src/schema";
import { INPUT_CLASSNAME } from "@/src/utils/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React from "react";
import { useForm } from "react-hook-form";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

export default function StaffCreateIncidentScreen() {
  const router = useRouter();

  const form = useForm({
    mode: "onSubmit",
    resolver: zodResolver(CreateIncidentSchema),
    defaultValues: {
      description: undefined,
      priority: "Low",
      siteId: "",
      title: "",
      type: "Issue",
    },
  });

  const { handleSubmit } = form;

  // Create Incident Mutation
  const createMutation = useStaffIncidentConrollerCreate({
    onSuccess: () => {
      Alert.alert("Success", "Incident report submitted successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    },
    onError: (error: any) => {
      console.error("Error creating incident report:", error);

      Alert.alert(
        "Error",
        error?.payload?.message || "Failed to submit incident report",
      );
    },
  });

  const handleFormSubmit = handleSubmit(async (data) => {
    createMutation.mutate({
      body: {
        title: data.title.trim(),
        description: data.description,
        siteId: data.siteId,
        priority: data.priority,
        type: data.type,
      },
    });
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-white"
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <View style={styles.container}>
        <ScreenHeader title="Report Incident" />

        <ScrollView className="px-6 py-6" showsVerticalScrollIndicator={false}>
          <FormInput
            control={form.control}
            required
            name="title"
            label="Incident Title"
          />

          <FormInput
            name="siteId"
            required
            label="Site"
            control={form.control}
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
                    fn: fetchStaffControllerGetSites,
                    queryKey: ["admin", "site"],
                    renderables: {
                      getLabelFromItem: (item) => item.title,
                      getValueFromItem: (item) => item.id,
                    },
                    onItemSelect: (item) => {
                      form.setValue("siteId", item.id);
                      field.onChange(item.id);
                    },
                    search: "search",
                  }}
                />
              );
            }}
          />

          <FormInput
            name="priority"
            control={form.control}
            label="Priority"
            render={({ field }) => {
              return (
                <StaticSelect
                  placeholder="Select priority"
                  withSearch={false}
                  className={{
                    trigger: INPUT_CLASSNAME,
                    triggerActive: "bg-white border-gray-300",
                  }}
                  options={[
                    { label: "Low", value: "Low" },
                    { label: "Medium", value: "Medium" },
                    { label: "High", value: "High" },
                  ]}
                  value={field.value}
                  onChange={field.onChange}
                />
              );
            }}
          />

          <FormInput
            name="type"
            control={form.control}
            label="Type"
            render={({ field }) => {
              return (
                <StaticSelect
                  placeholder="Select type"
                  withSearch={false}
                  className={{
                    trigger: INPUT_CLASSNAME,
                    triggerActive: "bg-white border-gray-300",
                  }}
                  options={[
                    { label: "Issue", value: "Issue" },
                    { label: "Request", value: "Request" },
                    {
                      label: "Seeking Information",
                      value: "Seeking Information",
                    },
                  ]}
                  value={field.value}
                  onChange={field.onChange}
                />
              );
            }}
          />

          <FormInput
            control={form.control}
            name="description"
            label="Description"
            render={({ field }) => (
              <Textarea size="md">
                <TextareaInput
                  onChange={field.onChange}
                  value={field.value}
                  placeholder="Describe the incident in detail"
                />
              </Textarea>
            )}
          />

          <Button
            onPress={handleFormSubmit}
            isLoading={createMutation.isPending}
          >
            Submit Report
          </Button>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
});
