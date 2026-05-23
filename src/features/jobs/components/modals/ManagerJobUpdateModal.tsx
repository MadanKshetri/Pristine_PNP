import { Button, Input } from "@/src/components/ui";
import React, { useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useJobActions } from "../../hooks/useJobActions";
import { TModalProps } from "@/src/modal/registry";

interface ManagerJobUpdateModalData {
  jobId: string;
  status: "Completed" | "Cancelled";
  onSuccess: () => void;
}

export const ManagerJobUpdateModal: React.FC<
  TModalProps<ManagerJobUpdateModalData>
> = ({ data, close }) => {
  const { jobId, status, onSuccess } = data;
  const { adminUpdateJob, isAdminUpdatingJob } = useJobActions();
  const [remarks, setRemarks] = useState("");

  const handleUpdate = async () => {
    const result = await adminUpdateJob(jobId, status, remarks);
    if (result.success) {
      onSuccess();
      close();
    }
  };

  const isComplete = status === "Completed";
  const actionText = isComplete ? "Complete" : "Cancel";

  return (
    <View className="w-full p-4">
      <View className="mb-4">
        <Text className="text-lg font-bold text-slate-900 mb-1">
          {actionText} Job
        </Text>
        <Text className="text-sm text-slate-500">
          Are you sure you want to {actionText.toLowerCase()} this job? You can
          optionally provide a reason below.
        </Text>
      </View>

      <View className="mb-6">
        <Text className="text-sm font-medium text-slate-700 mb-2">
          Remarks / Reason (Optional)
        </Text>
        <Input
          value={remarks}
          onChangeText={setRemarks}
          placeholder="Enter details..."
          multiline
          numberOfLines={3}
          style={{ minHeight: 80, textAlignVertical: "top" }}
        />
      </View>

      <View className="flex-row gap-2 justify-between">
        <Button
          className="w-1/2"
          variant="outline"
          onPress={close}
          disabled={isAdminUpdatingJob}
        >
          <Text className="text-slate-700 font-semibold text-center">Back</Text>
        </Button>
        <Button
          variant="primary"
          className={`w-1/2 ${isComplete ? "bg-emerald-600 border-emerald-600" : "bg-red-600 border-red-600"}`}
          onPress={handleUpdate}
          disabled={isAdminUpdatingJob}
        >
          {isAdminUpdatingJob ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text className="text-white font-semibold text-center">
              {actionText}
            </Text>
          )}
        </Button>
      </View>
    </View>
  );
};
