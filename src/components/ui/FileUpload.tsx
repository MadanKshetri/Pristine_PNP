import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import type { StyleProp, TextStyle, ViewStyle } from "react-native";
import * as DocumentPicker from "expo-document-picker";

type PickedFile = DocumentPicker.DocumentPickerAsset;

type FileUploadProps = {
  onFileSelect?: (files: PickedFile[]) => void;
  maxFiles?: number;
  allowedTypes?: string[];
  maxSizeInMB?: number;
  buttonText?: string;
  buttonStyle?: StyleProp<ViewStyle>;
  buttonTextStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
};

const FileUpload = ({
  onFileSelect,
  maxFiles = 5,
  allowedTypes = ["*/*"],
  maxSizeInMB = 10,
  buttonText = "Choose File",
  buttonStyle,
  buttonTextStyle,
  containerStyle,
}: FileUploadProps) => {
  const [selectedFiles, setSelectedFiles] = useState<PickedFile[]>([]);

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: allowedTypes,
        multiple: maxFiles > 1,
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const files = result.assets ?? [];

      if (selectedFiles.length + files.length > maxFiles) {
        Alert.alert(
          "Limit Reached",
          `You can only upload up to ${maxFiles} files`,
        );
        return;
      }

      const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
      const invalidFiles = files.filter(
        (f: PickedFile) => (f.size ?? 0) > maxSizeInBytes,
      );

      if (invalidFiles.length > 0) {
        Alert.alert(
          "File Too Large",
          `Files must be smaller than ${maxSizeInMB}MB`,
        );
        return;
      }

      const newFiles = [...selectedFiles, ...files];
      setSelectedFiles(newFiles);

      if (onFileSelect) {
        onFileSelect(newFiles);
      }
    } catch (_err) {
      Alert.alert("Error", "Failed to pick file");
    }
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    if (onFileSelect) {
      onFileSelect(newFiles);
    }
  };

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes || bytes <= 0) return "Unknown size";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <TouchableOpacity
        style={[styles.button, buttonStyle]}
        onPress={handleFilePick}
        disabled={selectedFiles.length >= maxFiles}
      >
        <Text style={[styles.buttonText, buttonTextStyle]}>{buttonText}</Text>
      </TouchableOpacity>

      {selectedFiles.length > 0 && (
        <View style={styles.fileList}>
          <Text style={styles.fileListTitle}>
            Selected Files ({selectedFiles.length}/{maxFiles})
          </Text>
          {selectedFiles.map((file, index) => (
            <View key={index} style={styles.fileItem}>
              <View style={styles.fileInfo}>
                <Text style={styles.fileName} numberOfLines={1}>
                  {file.name ?? "Untitled"}
                </Text>
                <Text style={styles.fileSize}>
                  {formatFileSize(file.size)}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeFile(index)}
              >
                <Text style={styles.removeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  fileList: {
    marginTop: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  fileListTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  fileItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  fileInfo: {
    flex: 1,
    marginRight: 12,
  },
  fileName: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 12,
    color: "#999",
  },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FF3B30",
    alignItems: "center",
    justifyContent: "center",
  },
  removeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default FileUpload;

// USAGE EXAMPLE:
//
// import FileUpload from './FileUpload';
// import DocumentPicker from 'react-native-document-picker';
//
// function MyScreen() {
//   const handleFileSelect = (files) => {
//     console.log('Selected files:', files);
//     // Upload files to your server
//   };
//
//   return (
//     <FileUpload
//       onFileSelect={handleFileSelect}
//       maxFiles={3}
//       maxSizeInMB={5}
//       allowedTypes={[DocumentPicker.types.pdf, DocumentPicker.types.images]}
//       buttonText="📎 Select Files"
//     />
//   );
// }
