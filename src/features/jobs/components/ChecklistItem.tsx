import { Card } from '@/src/components/ui';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Text, TouchableOpacity, View } from 'react-native';
import { useJobActions } from '../hooks';
import type { JobChecklist, JobStatus } from '../types';

interface ChecklistItemProps {
  checklist: JobChecklist;
  index: number;
  jobStarted: boolean;
  onUpdate: () => void;
  isReadOnly?: boolean;
}

export const ChecklistItem: React.FC<ChecklistItemProps> = ({
  checklist,
  index,
  jobStarted,
  onUpdate,
  isReadOnly = false,
}) => {
  const { updateChecklist, isUpdatingChecklist } = useJobActions();
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const getStatusColor = (status: JobStatus) => {
    switch (status) {
      case 'Completed':
        return { bg: 'bg-green-100', text: 'text-green-700', icon: 'checkmark-circle' };
      case 'Ongoing':
        return { bg: 'bg-blue-100', text: 'text-blue-700', icon: 'time' };
      case 'Cancelled':
        return { bg: 'bg-red-100', text: 'text-red-700', icon: 'close-circle' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', icon: 'ellipse-outline' };
    }
  };

  const statusStyle = getStatusColor(checklist.status);

  const handlePickImage = async () => {
    if (!jobStarted) {
      Alert.alert('Job Not Started', 'Please start the job before uploading photos.');
      return;
    }

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Camera roll permission is needed to upload photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImages([...selectedImages, result.assets[0].uri]);
    }
  };

  const handleTakePhoto = async () => {
    if (!jobStarted) {
      Alert.alert('Job Not Started', 'Please start the job before taking photos.');
      return;
    }

    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Camera permission is needed to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImages([...selectedImages, result.assets[0].uri]);
    }
  };

  const handleChangeStatus = async (newStatus: JobStatus) => {
    if (!jobStarted && newStatus !== 'Pending') {
      Alert.alert('Job Not Started', 'Please start the job first.');
      return;
    }

    const result = await updateChecklist(checklist.id, newStatus);
    if (result.success) {
      onUpdate();
    }
  };

  const showStatusMenu = () => {
    const options: { label: string; value: JobStatus }[] = [
      { label: 'Pending', value: 'Pending' },
      { label: 'In Progress', value: 'Ongoing' },
      { label: 'Completed', value: 'Completed' },
      { label: 'Cancelled', value: 'Cancelled' },
    ];

    Alert.alert(
      'Update Status',
      'Select a new status for this checklist item',
      [
        ...options.map((option) => ({
          text: option.label,
          onPress: () => handleChangeStatus(option.value),
        })),
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const showPhotoOptions = () => {
    Alert.alert(
      'Add Photo',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: handleTakePhoto },
        { text: 'Choose from Library', onPress: handlePickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <Card className="">
      {/* Header */}
      <View className="flex-row justify-between items-start ">
        <View className="flex-1 pr-4">
          <View className="flex-row items-center mb-2">
            <View className="w-6 h-6 rounded-full bg-blue-100 items-center justify-center mr-2">
              <Text className="text-xs font-bold text-blue-700">{index + 1}</Text>
            </View>
            <Text className="text-base font-bold text-gray-900 flex-1">
              {checklist.name}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={showStatusMenu}
          disabled={isUpdatingChecklist || isReadOnly}
          className={`px-3 py-1 rounded-full ${statusStyle.bg}`}
        >
          <View className="flex flex-row items-center mt-2 justify-center w-24">
            <Ionicons
              name={statusStyle.icon as any}
              size={14}
              color={statusStyle.text.includes('green') ? '#059669' : 
                     statusStyle.text.includes('blue') ? '#2563EB' :
                     statusStyle.text.includes('red') ? '#DC2626' : '#6B7280'}
            />
            <Text className={`text-xs font-semibold ml-1 ${statusStyle.text}`}>
              {checklist.status}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Existing Attachments */}
      {checklist.attachments && checklist.attachments.length > 0 && (
        <View className="mb-3">
          <Text className="text-sm font-semibold text-gray-700 mb-2">
            Attachments ({checklist.attachments.length})
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {checklist.attachments.map((attachment, idx) => (
              <View key={idx} className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                <Image
                  source={{ uri: attachment.url }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>
            ))}
          </View>
        </View>
      )}

      {/* New Selected Images */}
      {selectedImages.length > 0 && (
        <View className="mb-3">
          <Text className="text-sm font-semibold text-gray-700 mb-2">
            New Photos ({selectedImages.length})
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {selectedImages.map((uri, idx) => (
              <View key={idx} className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 relative">
                <Image
                  source={{ uri }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={() => setSelectedImages(selectedImages.filter((_, i) => i !== idx))}
                  className="absolute top-1 right-1 bg-red-500 rounded-full w-5 h-5 items-center justify-center"
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
        <View className="flex-row gap-2 mt-3">
          <TouchableOpacity
            onPress={showPhotoOptions}
            disabled={!jobStarted || isUpdatingChecklist}
            className={`flex-1 flex-row items-center justify-center py-3 rounded-lg border-2 ${
              jobStarted ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-100'
            }`}
          >
            {isUpdatingChecklist ? (
              <ActivityIndicator size="small" color="#3B82F6" />
            ) : (
              <>
                <Ionicons 
                  name="camera" 
                  size={18} 
                  color={jobStarted ? '#3B82F6' : '#9CA3AF'} 
                />
                <Text className={`text-sm font-semibold ml-2 ${
                  jobStarted ? 'text-blue-600' : 'text-gray-400'
                }`}>
                  Add Photo
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </Card>
  );
};
