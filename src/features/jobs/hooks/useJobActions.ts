import {
  useStaffJobControllerStartJob,
  useStaffJobControllerUpdateChecklistSow,
  useStaffJobControllerUpdateJob,
} from "@/fetchers/queriesComponents";
import {
  StaffUpdateJobStatusRequestDto,
  UpdateChecklistSowRequestDto,
} from "@/fetchers/queriesSchemas";
import * as Location from "expo-location";
import { Alert } from "react-native";

export const useJobActions = () => {
  const startJobMutation = useStaffJobControllerStartJob();
  const updateJobStatusMutation = useStaffJobControllerUpdateJob();
  const updateChecklistMutation = useStaffJobControllerUpdateChecklistSow();

  const startJob = async (jobId: string, token: string) => {
    try {
      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== Location.PermissionStatus.GRANTED) {
        Alert.alert(
          "Permission Required",
          "Location permission is needed to start a job.",
        );
        return { success: false };
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({});

      // Start the job
      const result = await startJobMutation.mutateAsync({
        body: {
          jobId,
          token,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          startedAt: new Date().toISOString(),
        },
      });

      Alert.alert("Success", "Job started successfully!");
      return { success: true, data: result };
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Failed to start job");
      return { success: false, error };
    }
  };

  const updateJobStatus = async (
    jobId: string,
    status: StaffUpdateJobStatusRequestDto["status"],
  ) => {
    try {
      const result = await updateJobStatusMutation.mutateAsync({
        body: {
          status,
        },
        pathParams: { id: jobId },
      });
      Alert.alert("Success", "Job status updated successfully!");
      return { success: true, data: result };
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Failed to update job status");
      return { success: false, error };
    }
  };

  const updateChecklist = async (
    checklistId: string,
    status: UpdateChecklistSowRequestDto["status"],
    attachment?: { uri: string; name?: string; type?: string },
  ) => {
    try {
      const variables = attachment
        ? {
            pathParams: { id: checklistId },
            // cast as any to satisfy generated types; fetcher already supports FormData
            body: (() => {
              const form = new FormData();
              form.append("id", checklistId);
              status && form.append("status", status);
              attachment &&
                form.append("attachments", {
                  // React Native FormData file
                  uri: attachment.uri,
                  name: attachment.name || "photo.jpg",
                  type: attachment.type || "image/jpeg",
                } as any);
              return form as any;
            })(),
          }
        : {
            pathParams: { id: checklistId },
            body: {
              id: checklistId,
              status,
            },
          };

      const result = await updateChecklistMutation.mutateAsync(
        variables as any,
      );

      return { success: true, data: result };
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Failed to update checklist");
      return { success: false, error };
    }
  };

  return {
    startJob,
    updateJobStatus,
    updateChecklist,
    isStartingJob: startJobMutation.isPending,
    isUpdatingJobStatus: updateJobStatusMutation.isPending,
    isUpdatingChecklist: updateChecklistMutation.isPending,
  };
};
