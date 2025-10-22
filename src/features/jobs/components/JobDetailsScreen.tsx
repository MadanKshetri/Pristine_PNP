import { Button, Card } from '@/src/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useJobActions, useJobDetails } from '../hooks';
import { ChecklistItem } from './ChecklistItem';

interface JobDetailsScreenProps {
  jobId: string;
}

export const JobDetailsScreen: React.FC<JobDetailsScreenProps> = ({ jobId }) => {
  const router = useRouter();
  const { job, isLoading, error, refetch } = useJobDetails(jobId);
  const { startJob, isStartingJob } = useJobActions();

  const handleStartJob = async () => {
    Alert.alert(
      'Start Job',
      'Are you sure you want to start this job? Your location will be recorded.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start',
          onPress: async () => {
            const result = await startJob(jobId);
            if (result.success) {
              refetch();
            }
          },
        },
      ]
    );
  };

  const getJobStatusBadge = (): { label: string; color: string } => {
    if (!job) return { label: 'Unknown', color: 'gray' };

    const hasStarted = job.startAt !== null;
    const allCompleted = job.checklists.every((c) => c.status === 'Completed');
    const hasInProgress = job.checklists.some((c) => c.status === 'Ongoing');

    if (allCompleted) {
      return { label: 'Completed', color: 'green' };
    } else if (hasInProgress || hasStarted) {
      return { label: 'In Progress', color: 'blue' };
    } else {
      return { label: 'Not Started', color: 'yellow' };
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-sm text-gray-500 mt-3">Loading job details...</Text>
      </View>
    );
  }

  if (error || !job) {
    const errorMessage = error 
      ? (error as any)?.payload || 'Failed to load job details.'
      : 'Job not found. It may have been deleted or you may not have access.';
    
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 px-6">
        <View className="w-24 h-24 rounded-full bg-red-50 items-center justify-center mb-6">
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        </View>
        <Text className="text-xl font-bold text-gray-900 mb-2">
          {error ? 'Error Loading Job' : 'Job Not Found'}
        </Text>
        <Text className="text-sm text-gray-600 text-center mb-6 px-4">
          {errorMessage}
        </Text>
        <View className="flex-row gap-3">
          <Button onPress={() => router.back()} variant="outline">
            <Text className="text-gray-700 font-semibold">Go Back</Text>
          </Button>
          {error && (
            <Button onPress={() => refetch()} variant="primary">
              <Text className="text-white font-semibold">Retry</Text>
            </Button>
          )}
        </View>
      </View>
    );
  }

  const statusBadge = getJobStatusBadge();
  const hasStarted = job.startAt !== null;
  const canStart = !hasStarted;

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 pt-6 pb-4 border-b border-gray-200">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center mb-4"
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
          <Text className="text-base font-semibold text-gray-900 ml-2">
            Back to Jobs
          </Text>
        </TouchableOpacity>

        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1 pr-4">
            <Text className="text-2xl font-bold text-gray-900 mb-2">
              {job.title}
            </Text>
            <Text className="text-sm text-gray-500">Job #{job.jobNumber}</Text>
          </View>
          <View
            className={`px-4 py-2 rounded-full ${
              statusBadge.color === 'green'
                ? 'bg-green-100'
                : statusBadge.color === 'blue'
                ? 'bg-blue-100'
                : 'bg-yellow-100'
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                statusBadge.color === 'green'
                  ? 'text-green-700'
                  : statusBadge.color === 'blue'
                  ? 'text-blue-700'
                  : 'text-yellow-700'
              }`}
            >
              {statusBadge.label}
            </Text>
          </View>
        </View>

        {job.description && (
          <Text className="text-sm text-gray-600 mt-2">{job.description}</Text>
        )}
      </View>

      <View className="px-6 py-6">
        {/* Site Information */}
        {job.site && (
          <Card className="mb-6 p-5">
            <View className="flex-row items-center mb-3">
              <Ionicons name="location" size={20} color="#3B82F6" />
              <Text className="text-lg font-bold text-gray-900 ml-2">
                Site Location
              </Text>
            </View>
            <Text className="text-base text-gray-900 font-medium mb-1">
              {job.site.address}
            </Text>
            <Text className="text-sm text-gray-600">{job.site.city}</Text>
          </Card>
        )}

        {/* Job Timestamps */}
        <Card className="mb-6 p-5">
          <View className="flex-row items-center mb-3">
            <Ionicons name="time" size={20} color="#3B82F6" />
            <Text className="text-lg font-bold text-gray-900 ml-2">
              Timeline
            </Text>
          </View>
          <View className="space-y-2">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-sm text-gray-600">Created</Text>
              <Text className="text-sm font-medium text-gray-900">
                {format(new Date(job.createdAt), 'MMM dd, yyyy h:mm a')}
              </Text>
            </View>
            {hasStarted && job.startAt && (
              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-gray-600">Started</Text>
                <Text className="text-sm font-medium text-green-600">
                  {format(new Date(job.startAt), 'MMM dd, yyyy h:mm a')}
                </Text>
              </View>
            )}
          </View>
        </Card>

        {/* Start Job Button */}
        {canStart && (
          <Button
            onPress={handleStartJob}
            isLoading={isStartingJob}
            disabled={isStartingJob}
            variant="primary"
            size="lg"
            fullWidth
            className="mb-6"
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="play-circle" size={20} color="#FFFFFF" />
              <Text className="text-white text-lg font-bold ml-2">
                Start Job
              </Text>
            </View>
          </Button>
        )}

        {/* Checklists */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={20} color="#3B82F6" />
              <Text className="text-lg font-bold text-gray-900 ml-2">
                Checklist
              </Text>
            </View>
            <Text className="text-sm text-gray-500">
              {job.checklists.filter((c) => c.status === 'Completed').length} /{' '}
              {job.checklists.length} completed
            </Text>
          </View>

          {job.checklists.map((checklist, index) => (
            <ChecklistItem
              key={checklist.id}
              checklist={checklist}
              index={index}
              jobStarted={hasStarted}
              onUpdate={refetch}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
};
