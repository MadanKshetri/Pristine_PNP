import {
  GetJobDto,
  UpdateChecklistSowRequestDto,
} from "@/fetchers/queriesSchemas";
import { AppAlertDialog, Card } from "@/src/components/ui";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useJobActions } from "../hooks";
import type { JobChecklist } from "../types";

interface ChecklistItemProps {
  checklist: JobChecklist;
  index: number;
  jobStatus: GetJobDto["status"];
  onUpdate: () => void;
  isReadOnly?: boolean;
}

export const ChecklistItem: React.FC<ChecklistItemProps> = ({
  checklist,
  index,
  jobStatus,
  onUpdate,
  isReadOnly = false,
}) => {
  const { updateChecklist, isUpdatingChecklist } = useJobActions();
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    actions: any[];
  }>({
    isOpen: false,
    title: "",
    description: "",
    actions: [],
  });

  const showAlert = (
    title: string,
    description: string,
    actions: any[] = [{ text: "OK" }],
  ) => {
    setAlertConfig({
      isOpen: true,
      title,
      description,
      actions,
    });
  };

  const closeAlert = () => {
    setAlertConfig((prev) => ({ ...prev, isOpen: false }));
  };

  const getStatusColor = (status: UpdateChecklistSowRequestDto["status"]) => {
    switch (status) {
      case "Completed":
        return {
          bgColor: "#D1FAE5",
          textColor: "#047857",
          icon: "checkmark-circle",
        };
      case "Ongoing":
        return { bgColor: "#DBEAFE", textColor: "#1D4ED8", icon: "time" };
      case "Cancelled":
        return {
          bgColor: "#FEE2E2",
          textColor: "#DC2626",
          icon: "close-circle",
        };
      default:
        return {
          bgColor: "#F3F4F6",
          textColor: "#374151",
          icon: "ellipse-outline",
        };
    }
  };

  const statusStyle = getStatusColor(checklist.status);

  const handlePickImage = async () => {
    if (jobStatus === "scheduled") {
      showAlert(
        "Job Not Started",
        "Please start the job before uploading photos.",
      );
      return;
    }

    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      showAlert(
        "Permission Required",
        "Camera roll permission is needed to upload photos.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setSelectedImages([...selectedImages, asset.uri]);
      try {
        const res = await updateChecklist(checklist.id, checklist.status, {
          uri: asset.uri,
          name: (asset as any).fileName || "photo.jpg",
          type: (asset as any).mimeType || "image/jpeg",
        });
        if (res.success) {
          onUpdate();
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        showAlert("Error", "Failed to upload image");
      } finally {
        setSelectedImages([]);
      }
    }
  };

  const handleTakePhoto = async () => {
    if (jobStatus === "scheduled") {
      showAlert(
        "Job Not Started",
        "Please start the job before taking photos.",
      );
      return;
    }

    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      showAlert(
        "Permission Required",
        "Camera permission is needed to take photos.",
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setSelectedImages([...selectedImages, asset.uri]);
      try {
        const res = await updateChecklist(checklist.id, checklist.status, {
          uri: asset.uri,
          name: (asset as any).fileName || "photo.jpg",
          type: (asset as any).mimeType || "image/jpeg",
        });
        if (res.success) {
          onUpdate();
        }
      } catch (error) {
        console.error("Error uploading photo:", error);
        showAlert("Error", "Failed to upload photo");
      } finally {
        setSelectedImages([]);
      }
    }
  };

  const handleChangeStatus = async (
    newStatus: UpdateChecklistSowRequestDto["status"],
  ) => {
    if (jobStatus === "scheduled" && newStatus !== "Pending") {
      showAlert("Job Not Started", "Please start the job first.");
      return;
    }

    const result = await updateChecklist(checklist.id, newStatus);
    if (result.success) {
      onUpdate();
    }
  };

  const showStatusMenu = () => {
    if (jobStatus !== "In Progress") {
      return;
    }

    const options: {
      label: string;
      value: UpdateChecklistSowRequestDto["status"];
    }[] = [
      { label: "Pending", value: "Pending" },
      { label: "In Progress", value: "Ongoing" },
      { label: "Completed", value: "Completed" },
      { label: "Cancelled", value: "Cancelled" },
    ];

    showAlert("Update Status", "Select a new status for this checklist item", [
      ...options.map((option) => {
        const style = getStatusColor(option.value);
        return {
          render: (onClose: () => void) => (
            <TouchableOpacity
              onPress={() => {
                handleChangeStatus(option.value);
                onClose();
              }}
              style={{
                backgroundColor: style.bgColor,
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 8,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 8,
                width: "100%",
              }}
              activeOpacity={0.8}
            >
              <Ionicons
                name={style.icon as any}
                size={18}
                color={style.textColor}
                style={{ marginRight: 8 }}
              />
              <Text
                style={{
                  color: style.textColor,
                  fontSize: 16,
                  fontWeight: "600",
                }}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ),
        };
      }),
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const showPhotoOptions = () => {
    showAlert("Add Photo", "Choose an option", [
      { text: "Take Photo", onPress: handleTakePhoto },
      { text: "Choose from Library", onPress: handlePickImage },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <Card style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.titleRow}>
            <View style={styles.indexBubble}>
              <Text style={styles.indexText}>{index + 1}</Text>
            </View>
            <Text style={styles.title}>{checklist.name}</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={showStatusMenu}
          disabled={isUpdatingChecklist || isReadOnly}
          style={[styles.statusChip, { backgroundColor: statusStyle.bgColor }]}
          activeOpacity={0.8}
        >
          <View style={styles.statusInner}>
            <Ionicons
              name={statusStyle.icon as any}
              size={14}
              color={statusStyle.textColor}
            />
            <Text style={[styles.statusText, { color: statusStyle.textColor }]}>
              {checklist.status}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Existing Attachments */}
      {checklist.attachments && checklist.attachments.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Attachments ({checklist.attachments.length})
          </Text>
          <View style={styles.attachmentsWrap}>
            {checklist.attachments.map((attachment, idx) => (
              <View key={idx} style={styles.attachmentItem}>
                <Image
                  source={{ uri: attachment.url }}
                  style={styles.attachmentImage}
                  resizeMode="cover"
                />
              </View>
            ))}
          </View>
        </View>
      )}

      {/* New Selected Images */}
      {selectedImages.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            New Photos ({selectedImages.length})
          </Text>
          <View style={styles.attachmentsWrap}>
            {selectedImages.map((uri, idx) => (
              <View key={idx} style={styles.newImageItem}>
                <Image
                  source={{ uri }}
                  style={styles.attachmentImage}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={() =>
                    setSelectedImages(
                      selectedImages.filter((_, i) => i !== idx),
                    )
                  }
                  style={styles.removeBtn}
                  activeOpacity={0.8}
                >
                  <Ionicons name="close" size={14} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Actions */}
      {!isReadOnly && (
        <View style={styles.actionsRow}>
          <TouchableOpacity
            onPress={showPhotoOptions}
            style={[
              styles.photoBtn,
              jobStatus !== "scheduled" && !isUpdatingChecklist
                ? styles.photoBtnEnabled
                : styles.photoBtnDisabled,
            ]}
            activeOpacity={0.9}
          >
            {isUpdatingChecklist ? (
              <ActivityIndicator size="small" color="#3B82F6" />
            ) : (
              <>
                <Ionicons
                  name="camera"
                  size={18}
                  color={
                    jobStatus !== "scheduled" && !isUpdatingChecklist
                      ? "#3B82F6"
                      : "#9CA3AF"
                  }
                />
                <Text
                  style={[
                    styles.photoBtnText,
                    {
                      color:
                        jobStatus !== "scheduled" && !isUpdatingChecklist
                          ? "#2563EB"
                          : "#9CA3AF",
                    },
                  ]}
                >
                  Add Photo
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      <AppAlertDialog
        isOpen={alertConfig.isOpen}
        onClose={closeAlert}
        title={alertConfig.title}
        description={alertConfig.description}
        actions={alertConfig.actions}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  card: { padding: 14, borderRadius: 12 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerLeft: { flex: 1, paddingRight: 16 },
  titleRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  indexBubble: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  indexText: { fontSize: 12, fontWeight: "700", color: "#1D4ED8" },
  title: { fontSize: 16, fontWeight: "700", color: "#111827", flex: 1 },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  statusInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: 100,
  },
  statusText: { fontSize: 12, fontWeight: "600", marginLeft: 6 },
  section: { marginBottom: 12 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  attachmentsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  attachmentItem: {
    width: 80,
    height: 80,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
  },
  newImageItem: {
    width: 80,
    height: 80,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
    position: "relative",
  },
  attachmentImage: { width: "100%", height: "100%" },
  removeBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#EF4444",
    borderRadius: 999,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  actionsRow: { flexDirection: "row", gap: 8, marginTop: 12 },
  photoBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 2,
  },
  photoBtnEnabled: { borderColor: "#3B82F6", backgroundColor: "#EFF6FF" },
  photoBtnDisabled: { borderColor: "#D1D5DB", backgroundColor: "#F3F4F6" },
  photoBtnText: { fontSize: 14, fontWeight: "700", marginLeft: 8 },
});
