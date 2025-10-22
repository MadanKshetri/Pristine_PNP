import { Card } from '@/src/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import type { Job } from '../types';

interface JobCardProps {
  job: Job;
  onPress: (jobId: string) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onPress }) => {
  const hasStarted = job.startAt !== null;

  return (
    <TouchableOpacity onPress={() => onPress(job.id)}>
      <Card className="mb-4 p-5">
        {/* Job Header */}
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-900 mb-1">
              {job.title}
            </Text>
            <Text className="text-sm text-gray-500">
              Job #{job.jobNumber}
            </Text>
          </View>
          <View
            className={`px-3 py-1 rounded-full ${
              hasStarted ? 'bg-green-100' : 'bg-yellow-100'
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                hasStarted ? 'text-green-700' : 'text-yellow-700'
              }`}
            >
              {hasStarted ? 'Started' : 'Not Started'}
            </Text>
          </View>
        </View>

        {/* Description */}
        {job.description && (
          <Text className="text-sm text-gray-600 mb-3" numberOfLines={2}>
            {job.description}
          </Text>
        )}

        {/* Site Info */}
        {job.site && (
          <View className="flex-row items-center mb-3 p-3 bg-gray-50 rounded-lg">
            <Ionicons name="location" size={16} color="#6B7280" />
            <View className="ml-2 flex-1">
              <Text className="text-sm font-medium text-gray-900">
                {job.site.address}
              </Text>
              <Text className="text-xs text-gray-500">{job.site.city}</Text>
            </View>
          </View>
        )}

        {/* Footer */}
        <View className="flex-row justify-between items-center mt-2 pt-3 border-t border-gray-100">
          <View className="flex-row items-center">
            <Ionicons name="calendar-outline" size={14} color="#6B7280" />
            <Text className="text-xs text-gray-500 ml-1">
              Created {format(new Date(job.createdAt), 'MMM dd, yyyy')}
            </Text>
          </View>
          {hasStarted && job.startAt && (
            <View className="flex-row items-center">
              <Ionicons name="time-outline" size={14} color="#10B981" />
              <Text className="text-xs text-green-600 ml-1">
                Started {format(new Date(job.startAt), 'MMM dd, h:mm a')}
              </Text>
            </View>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
};
