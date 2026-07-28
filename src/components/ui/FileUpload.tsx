import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { StyleProp, TextStyle, ViewStyle } from "react-native";

/**
 * A single file tracked by {@link FileUpload}.
 *
 * Newly picked (local) files carry a device `uri`; files already stored on the
 * backend carry a remote `url`. Both are supported so the same field can render
 * previously uploaded attachments alongside freshly selected ones.
 *
 * The shape ({ uri, name, type }) is intentionally compatible with
 * `parseToFormData` (see `src/utils/form.util.ts`), which duck-types file
 * fields by their `uri` before appending them to a multipart body.
 */
export interface UploadFile {
  /** Local device uri (newly picked files) or remote url used for preview. */
  uri: string;
  /** Original file name. */
  name: string;
  /** Mime type, e.g. "image/jpeg" or "application/pdf". */
  type: string;
  /** File size in bytes, when known. */
  size?: number;
  /** Set when the file already lives on the backend (already uploaded). */
  url?: string;
  /** Optional backend identifier for an already-uploaded file. */
  id?: string;
}

export type FileUploadMode = "image" | "document" | "all";

export interface FileUploadProps {
  /** Controlled value. Provide together with {@link onChange}. */
  value?: UploadFile[];
  /** Initial value when used uncontrolled. */
  defaultValue?: UploadFile[];
  /** Called with the full next list whenever files are added or removed. */
  onChange?: (files: UploadFile[]) => void;
  /** @deprecated Prefer {@link onChange}. Kept for backwards compatibility. */
  onFileSelect?: (files: UploadFile[]) => void;

  /** What can be picked. Defaults to "image". */
  mode?: FileUploadMode;
  /** Maximum number of files. A value of 1 replaces the current file. */
  maxFiles?: number;
  /** Per-file size limit in megabytes. */
  maxSizeInMB?: number;
  /** Mime filters passed to the document picker (mode "document"/"all"). */
  allowedTypes?: string[];
  /** Image compression quality (0-1) for camera/library picks. */
  imageQuality?: number;

  label?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  buttonText?: string;

  containerStyle?: StyleProp<ViewStyle>;
  buttonStyle?: StyleProp<ViewStyle>;
  buttonTextStyle?: StyleProp<TextStyle>;
}

const IMAGE_EXTENSION = /\.(png|jpe?g|gif|webp|heic|heif|bmp)$/i;

const isImageFile = (file: UploadFile): boolean => {
  if (file.type?.startsWith("image/")) return true;
  const candidate = file.url ?? file.uri ?? file.name ?? "";
  return IMAGE_EXTENSION.test(candidate);
};

const previewUriOf = (file: UploadFile): string => file.url ?? file.uri;

const nameFromUri = (uri: string, fallback: string): string => {
  const last = uri.split("/").pop();
  return last && last.length > 0 ? last.split("?")[0] : fallback;
};

const formatFileSize = (bytes?: number | null): string => {
  if (!bytes || bytes <= 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const FileUpload = ({
  value,
  defaultValue = [],
  onChange,
  onFileSelect,
  mode = "image",
  maxFiles = 5,
  maxSizeInMB = 10,
  allowedTypes = ["*/*"],
  imageQuality = 0.8,
  label,
  helperText,
  error,
  disabled = false,
  buttonText,
  containerStyle,
  buttonStyle,
  buttonTextStyle,
}: FileUploadProps) => {
  const isControlled = value !== undefined;
  const [internalFiles, setInternalFiles] = useState<UploadFile[]>(defaultValue);
  const files = isControlled ? (value as UploadFile[]) : internalFiles;

  const single = maxFiles === 1;
  const isFull = files.length >= maxFiles;

  const emit = (next: UploadFile[]) => {
    if (!isControlled) setInternalFiles(next);
    onChange?.(next);
    onFileSelect?.(next);
  };

  const validateAndAppend = (picked: UploadFile[]) => {
    if (picked.length === 0) return;

    const maxBytes = maxSizeInMB * 1024 * 1024;
    const tooLarge = picked.filter((f) => (f.size ?? 0) > maxBytes);
    if (tooLarge.length > 0) {
      Alert.alert(
        "File Too Large",
        `Each file must be smaller than ${maxSizeInMB}MB.`,
      );
      return;
    }

    // Single-file fields replace the existing selection instead of appending.
    const next = single ? picked.slice(0, 1) : [...files, ...picked];

    if (next.length > maxFiles) {
      Alert.alert("Limit Reached", `You can select up to ${maxFiles} file(s).`);
      return;
    }

    emit(next);
  };

  const pickFromLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission Required",
        "Photo library access is needed to select images.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsMultipleSelection: !single,
      selectionLimit: single ? 1 : Math.max(1, maxFiles - files.length),
      quality: imageQuality,
    });
    if (result.canceled) return;

    validateAndAppend(
      result.assets.map((asset) => ({
        uri: asset.uri,
        name: asset.fileName ?? nameFromUri(asset.uri, "photo.jpg"),
        type: asset.mimeType ?? "image/jpeg",
        size: asset.fileSize,
      })),
    );
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission Required",
        "Camera access is needed to take photos.",
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: imageQuality,
      allowsEditing: single,
    });
    if (result.canceled) return;

    const asset = result.assets[0];
    if (!asset) return;

    validateAndAppend([
      {
        uri: asset.uri,
        name: asset.fileName ?? nameFromUri(asset.uri, "photo.jpg"),
        type: asset.mimeType ?? "image/jpeg",
        size: asset.fileSize,
      },
    ]);
  };

  const pickDocuments = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: allowedTypes,
      multiple: !single,
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;

    validateAndAppend(
      (result.assets ?? []).map((asset) => ({
        uri: asset.uri,
        name: asset.name ?? nameFromUri(asset.uri, "file"),
        type: asset.mimeType ?? "application/octet-stream",
        size: asset.size ?? undefined,
      })),
    );
  };

  const handleAddPress = () => {
    if (disabled || isFull) return;

    const actions: { text: string; onPress: () => void }[] = [];
    if (mode === "image" || mode === "all") {
      actions.push({ text: "Take Photo", onPress: takePhoto });
      actions.push({ text: "Choose from Library", onPress: pickFromLibrary });
    }
    if (mode === "document" || mode === "all") {
      actions.push({ text: "Browse Files", onPress: pickDocuments });
    }

    // A single available action needs no chooser.
    if (actions.length === 1) {
      actions[0].onPress();
      return;
    }

    Alert.alert("Add Attachment", "Choose a source", [
      ...actions.map((a) => ({ text: a.text, onPress: a.onPress })),
      { text: "Cancel", style: "cancel" as const },
    ]);
  };

  const removeAt = (index: number) => {
    emit(files.filter((_, i) => i !== index));
  };

  const defaultButtonText =
    buttonText ??
    (mode === "document"
      ? "Attach Document"
      : mode === "all"
        ? "Add Attachment"
        : "Add Photo");

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      {files.length > 0 && (
        <View style={styles.grid}>
          {files.map((file, index) => {
            const image = isImageFile(file);
            const sizeLabel = formatFileSize(file.size);
            return (
              <View key={`${previewUriOf(file)}-${index}`} style={styles.tile}>
                {image ? (
                  <Image
                    source={{ uri: previewUriOf(file) }}
                    style={styles.thumbnail}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.docTile}>
                    <Ionicons name="document-text" size={26} color="#2563EB" />
                    <Text style={styles.docName} numberOfLines={2}>
                      {file.name}
                    </Text>
                    {!!sizeLabel && (
                      <Text style={styles.docSize}>{sizeLabel}</Text>
                    )}
                  </View>
                )}

                {file.url && (
                  <View style={styles.uploadedBadge}>
                    <Ionicons
                      name="cloud-done"
                      size={12}
                      color="#FFFFFF"
                    />
                  </View>
                )}

                {!disabled && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeAt(index)}
                    activeOpacity={0.8}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Ionicons name="close" size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                )}
              </View>
            );
          })}

          {!disabled && !isFull && (
            <TouchableOpacity
              style={styles.addTile}
              onPress={handleAddPress}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={26} color="#2563EB" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {files.length === 0 && (
        <TouchableOpacity
          style={[
            styles.button,
            disabled && styles.buttonDisabled,
            error ? styles.buttonError : null,
            buttonStyle,
          ]}
          onPress={handleAddPress}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <Ionicons
            name={mode === "document" ? "attach" : "camera-outline"}
            size={18}
            color="#2563EB"
          />
          <Text style={[styles.buttonText, buttonTextStyle]}>
            {defaultButtonText}
          </Text>
        </TouchableOpacity>
      )}

      {maxFiles > 1 && files.length > 0 && (
        <Text style={styles.counter}>
          {files.length}/{maxFiles} selected
        </Text>
      )}

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helper}>{helperText}</Text>
      ) : null}
    </View>
  );
};

const TILE_SIZE = 88;

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    width: "100%",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  button: {
    backgroundColor: "#F9FAFB",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonError: {
    borderColor: "#EF4444",
  },
  buttonText: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "600",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
    position: "relative",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  docTile: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 6,
  },
  docName: {
    fontSize: 10,
    color: "#374151",
    textAlign: "center",
    marginTop: 4,
  },
  docSize: {
    fontSize: 9,
    color: "#9CA3AF",
    marginTop: 2,
  },
  uploadedBadge: {
    position: "absolute",
    bottom: 4,
    left: 4,
    backgroundColor: "rgba(37, 99, 235, 0.9)",
    borderRadius: 999,
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  removeButton: {
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
  addTile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: 10,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#CBD5E1",
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
  },
  counter: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 8,
  },
  helper: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 6,
  },
  error: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 6,
  },
});

export default FileUpload;
