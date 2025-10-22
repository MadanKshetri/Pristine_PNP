import { Input, ScreenHeader } from '@/src/components/ui';
import { format, isSameDay, parseISO, startOfDay } from 'date-fns';
import { useRouter } from 'expo-router';
import { Clock, MapPin } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useJobs } from '../hooks';
import type { Job } from '../types';

interface MarkedDates {
  [date: string]: {
    marked: boolean;
    dotColor: string;
    selected?: boolean;
    selectedColor?: string;
  };
}

export const JobListWithCalendar: React.FC = () => {
  const router = useRouter();
  const { jobs, isLoading, error, refetch, filters, updateFilters } = useJobs();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const handleJobPress = (jobId: string) => {
    router.push(`/job/${jobId}` as any);
  };

  const handleSearch = (text: string) => {
    updateFilters({ search: text, page: 1 });
  };

  // Create marked dates object for calendar
  const markedDates = useMemo(() => {
    const marked: MarkedDates = {};
    
    jobs.forEach((job: Job) => {
      // Mark created date
      const createdDate = format(parseISO(job.createdAt), 'yyyy-MM-dd');
      marked[createdDate] = {
        marked: true,
        dotColor: '#3b82f6',
      };
      
      // Mark start date if exists
      if (job.startAt) {
        const startDate = format(parseISO(job.startAt), 'yyyy-MM-dd');
        marked[startDate] = {
          marked: true,
          dotColor: '#10b981',
        };
      }
    });

    // Highlight selected date
    if (selectedDate && marked[selectedDate]) {
      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: '#e0e7ff',
      };
    }

    return marked;
  }, [jobs, selectedDate]);

  // Filter jobs by selected date
  const filteredJobs = useMemo(() => {
    if (!selectedDate) return jobs;

    return jobs.filter((job: Job) => {
      const selectedDay = startOfDay(parseISO(selectedDate));
      const createdDay = startOfDay(parseISO(job.createdAt));
      const startDay = job.startAt ? startOfDay(parseISO(job.startAt)) : null;

      return (
        isSameDay(selectedDay, createdDay) ||
        (startDay && isSameDay(selectedDay, startDay))
      );
    });
  }, [jobs, selectedDate]);

  const onDayPress = (day: DateData) => {
    const date = day.dateString;
    setSelectedDate(selectedDate === date ? null : date);
  };

  const formatDate = (datetime: string) => {
    const date = new Date(datetime);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (error && !isLoading) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Error Loading Jobs</Text>
        <Text style={styles.errorText}>
          {(error as any)?.payload || 'Something went wrong. Please try again.'}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Jobs Calendar"
        subtitle={selectedDate
          ? `Jobs for ${formatDate(selectedDate)}`
          : `${jobs.length} total jobs`}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.searchContainer}>
          <Input
            placeholder="Search jobs..."
            value={filters.search || ''}
            onChangeText={handleSearch}
          />
        </View>

        <View style={styles.calendarContainer}>
          <Calendar
            onDayPress={onDayPress}
            markedDates={markedDates}
            theme={{
              backgroundColor: '#ffffff',
              calendarBackground: '#ffffff',
              textSectionTitleColor: '#64748b',
              selectedDayBackgroundColor: '#3b82f6',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#3b82f6',
              dayTextColor: '#0f172a',
              textDisabledColor: '#cbd5e1',
              dotColor: '#3b82f6',
              monthTextColor: '#0f172a',
              textDayFontWeight: '600',
              textMonthFontWeight: '700',
              textDayHeaderFontWeight: '600',
              textDayFontSize: 15,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 13,
            }}
            style={styles.calendar}
          />
        </View>

        {selectedDate && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setSelectedDate(null)}>
            <Text style={styles.clearButtonText}>View All Jobs</Text>
          </TouchableOpacity>
        )}

        <View style={styles.jobsContainer}>
          <View style={styles.jobsHeader}>
            <Text style={styles.jobsTitle}>
              {selectedDate ? 'Jobs for Selected Date' : 'All Jobs'}
            </Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{filteredJobs.length}</Text>
            </View>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text style={styles.loadingText}>Loading jobs...</Text>
            </View>
          ) : filteredJobs.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {selectedDate
                  ? 'No jobs scheduled for this date'
                  : filters.search
                  ? 'No matching jobs found'
                  : 'No jobs assigned'}
              </Text>
            </View>
          ) : (
            filteredJobs.map((job: Job) => (
              <TouchableOpacity
                key={job.id}
                onPress={() => handleJobPress(job.id)}
                activeOpacity={0.7}>
                <View style={styles.jobCard}>
                  <View style={styles.jobCardHeader}>
                    <View style={styles.jobTitleContainer}>
                      <Text style={styles.jobTitle}>{job.title}</Text>
                      <Text style={styles.jobDate}>{formatDate(job.createdAt)}</Text>
                    </View>
                    <View
                      style={
                        job.startAt
                          ? styles.statusBadgeInProgress
                          : styles.statusBadgeScheduled
                      }>
                      <Text
                        style={
                          job.startAt
                            ? styles.statusTextInProgress
                            : styles.statusTextScheduled
                        }>
                        {job.startAt ? 'Started' : 'Pending'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.jobDetails}>
                    {job.site && (
                      <View style={styles.detailRow}>
                        <MapPin size={16} color="#64748b" strokeWidth={2} />
                        <Text style={styles.detailText}>
                          {job.site.address}, {job.site.city}
                        </Text>
                      </View>
                    )}

                    {job.startAt && (
                      <View style={styles.detailRow}>
                        <Clock size={16} color="#64748b" strokeWidth={2} />
                        <Text style={styles.detailText}>
                          Started {format(new Date(job.startAt), 'MMM dd, h:mm a')}
                        </Text>
                      </View>
                    )}
                  </View>

                  {job.description && (
                    <View style={styles.descriptionContainer}>
                      <Text style={styles.descriptionText} numberOfLines={2}>
                        {job.description}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 24,
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  calendarContainer: {
    margin: 16,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  calendar: {
    borderRadius: 20,
    padding: 10,
  },
  clearButton: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  jobsContainer: {
    paddingHorizontal: 16,
  },
  jobsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  jobsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginRight: 8,
  },
  countBadge: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3730a3',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  jobCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  jobCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  jobTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  jobDate: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  statusBadgeInProgress: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusTextInProgress: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1e40af',
  },
  statusBadgeScheduled: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusTextScheduled: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400e',
  },
  jobDetails: {
    gap: 12,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
    marginLeft: 10,
    flex: 1,
  },
  descriptionContainer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  descriptionText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  bottomPadding: {
    height: 24,
  },
});
