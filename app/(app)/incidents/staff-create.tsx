import {
  useStaffControllerGetSites,
  useStaffIncidentConrollerCreate,
} from "@/fetchers/queriesComponents";
import { Button, Input, ScreenHeader } from "@/src/components/ui";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ChevronDown, MapPin, X } from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function StaffCreateIncidentScreen() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [isSiteModalVisible, setIsSiteModalVisible] = useState(false);

  // Fetch Sites
  const { data: sitesData } = useStaffControllerGetSites({});
  const sites = sitesData?.data || [];

  const selectedSite = sites.find((s) => s.id === selectedSiteId);

  // Create Incident Mutation
  const createMutation = useStaffIncidentConrollerCreate({
    onSuccess: () => {
      Alert.alert("Success", "Incident report submitted successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    },
    onError: (error: any) => {
      Alert.alert(
        "Error",
        error?.payload?.message || "Failed to submit incident report",
      );
    },
  });

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert("Validation Error", "Please enter a title");
      return;
    }
    if (!selectedSiteId) {
      Alert.alert("Validation Error", "Please select a site");
      return;
    }

    createMutation.mutate({
      body: {
        title,
        description,
        siteId: selectedSiteId,
      },
    });
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Report Incident" />

      <ScrollView className="px-6 py-6" showsVerticalScrollIndicator={false}>
        <View className="mb-6">
          <Text className="text-sm font-bold text-gray-700 mb-2 ml-1">
            TITLE
          </Text>
          <Input
            placeholder="e.g., Leaking pipe in main hall"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View className="mb-6">
          <Text className="text-sm font-bold text-gray-700 mb-2 ml-1">
            SITE
          </Text>
          <TouchableOpacity
            onPress={() => setIsSiteModalVisible(true)}
            className="flex-row items-center border border-gray-200 bg-white rounded-xl h-12 px-4"
          >
            <MapPin size={18} color={selectedSite ? "#1F2937" : "#9CA3AF"} />
            <Text
              className={`flex-1 ml-2 text-base ${
                selectedSite ? "text-gray-900" : "text-gray-400"
              }`}
            >
              {selectedSite ? selectedSite.title : "Select a site"}
            </Text>
            <ChevronDown size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <View className="mb-8">
          <Text className="text-sm font-bold text-gray-700 mb-2 ml-1">
            DESCRIPTION
          </Text>
          <Input
            placeholder="Describe the incident details..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            className="h-32 py-3"
            textAlignVertical="top"
          />
        </View>

        <Button onPress={handleSubmit} isLoading={createMutation.isPending}>
          Submit Report
        </Button>
      </ScrollView>

      {/* Site Selection Modal */}
      <Modal
        visible={isSiteModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsSiteModalVisible(false)}
      >
        <View className="flex-1 bg-white">
          <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
            <Text className="text-lg font-bold text-gray-900">Select Site</Text>
            <TouchableOpacity
              onPress={() => setIsSiteModalVisible(false)}
              className="p-2 bg-gray-100 rounded-full"
            >
              <X size={20} color="#1F2937" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: 16 }}>
            {sites.map((site) => (
              <TouchableOpacity
                key={site.id}
                onPress={() => {
                  setSelectedSiteId(site.id);
                  setIsSiteModalVisible(false);
                }}
                className={`flex-row items-center p-4 mb-3 rounded-xl border ${
                  selectedSiteId === site.id
                    ? "bg-blue-50 border-blue-200"
                    : "bg-white border-gray-200"
                }`}
              >
                <MapPin
                  size={20}
                  color={selectedSiteId === site.id ? "#3B82F6" : "#6B7280"}
                />
                <View className="ml-3 flex-1">
                  <Text
                    className={`text-base font-semibold ${
                      selectedSiteId === site.id
                        ? "text-blue-900"
                        : "text-gray-900"
                    }`}
                  >
                    {site.title}
                  </Text>
                  <Text className="text-sm text-gray-500 mt-0.5">
                    {site.location.address}
                  </Text>
                </View>
                {selectedSiteId === site.id && (
                  <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
                )}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={() => setIsSiteModalVisible(false)}
              className="mt-2 py-4 items-center justify-center rounded-xl bg-gray-100 active:bg-gray-200"
            >
              <Text className="text-base font-semibold text-gray-700">
                Cancel
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
});
