import { useJobControllerStartJob, useJobControllerUpdateChecklistSow } from '@/fetchers/queriesComponents';
import * as Location from 'expo-location';
import { Alert } from 'react-native';

export const useJobActions = () => {
  const startJobMutation = useJobControllerStartJob();
  const updateChecklistMutation = useJobControllerUpdateChecklistSow();

  const startJob = async (jobId: string) => {
    try {
      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== Location.PermissionStatus.GRANTED) {
        Alert.alert(
          'Permission Required',
          'Location permission is needed to start a job.'
        );
        return { success: false };
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({});
      
      // Start the job
      const result = await startJobMutation.mutateAsync({
        body: {
          jobId,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          startedAt: new Date().toISOString(),
        },
      });

      Alert.alert('Success', 'Job started successfully!');
      return { success: true, data: result };
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to start job');
      return { success: false, error };
    }
  };

  const updateChecklist = async (
    checklistId: string,
    status: 'Pending' | 'Ongoing' | 'Completed' | 'Cancelled',
    attachments?: Blob
  ) => {
    try {
      const result = await updateChecklistMutation.mutateAsync({
        pathParams: { id: checklistId },
        body: {
          id: checklistId,
          status,
          attachments,
        },
      });

      return { success: true, data: result };
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to update checklist');
      return { success: false, error };
    }
  };

  return {
    startJob,
    updateChecklist,
    isStartingJob: startJobMutation.isPending,
    isUpdatingChecklist: updateChecklistMutation.isPending,
  };
};
