import { Button, Input } from '@/src/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    Text,
    View,
} from 'react-native';
import { useJobs } from '../hooks';
import { JobCard } from './JobCard';

export const JobListScreen: React.FC = () => {
  const router = useRouter();
  const { jobs, isLoading, error, refetch, filters, updateFilters, isEmpty } = useJobs();

  const handleJobPress = (jobId: string) => {
    router.push(`/job/${jobId}` as any);
  };

  const handleSearch = (text: string) => {
    updateFilters({ search: text, page: 1 });
  };

  // Show error only for real errors (not empty data)
  if (error && !isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 px-6">
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text className="text-lg font-bold text-gray-900 mt-4 mb-2">
          Error Loading Jobs
        </Text>
        <Text className="text-sm text-gray-600 text-center mb-6">
          {(error as any)?.payload || 'Something went wrong. Please try again.'}
        </Text>
        <Button onPress={() => refetch()} variant="primary">
          <Text className="text-white font-semibold">Retry</Text>
        </Button>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header with Search */}
      <View className="bg-white px-6 pt-4 pb-4 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900 mb-4">My Jobs</Text>
        <Input
          placeholder="Search jobs..."
          value={filters.search || ''}
          onChangeText={handleSearch}
          leftIcon={
            <Ionicons name="search" size={20} color="#9CA3AF" />
          }
          className="bg-gray-50"
        />
      </View>

      {/* Job List */}
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-sm text-gray-500 mt-3">Loading jobs...</Text>
        </View>
      ) : isEmpty || jobs.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6">
          <View className="w-24 h-24 rounded-full bg-blue-50 items-center justify-center mb-6">
            <Ionicons name="briefcase-outline" size={48} color="#3B82F6" />
          </View>
          <Text className="text-xl font-bold text-gray-900 mb-2">
            {filters.search ? 'No Matching Jobs' : 'No Jobs Assigned'}
          </Text>
          <Text className="text-sm text-gray-600 text-center mb-6 px-4">
            {filters.search
              ? 'No jobs match your search criteria. Try using different keywords.'
              : 'You currently have no assigned jobs. New jobs will appear here when they are assigned to you.'}
          </Text>
          {filters.search && (
            <Button
              onPress={() => updateFilters({ search: '' })}
              variant="outline"
            >
              <Text className="text-blue-500 font-semibold">Clear Search</Text>
            </Button>
          )}
        </View>
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <JobCard job={item} onPress={handleJobPress} />
          )}
          contentContainerStyle={{ padding: 24 }}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={refetch}
              tintColor="#3B82F6"
            />
          }
        />
      )}
    </View>
  );
};
