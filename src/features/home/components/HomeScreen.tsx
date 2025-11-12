import { ListJobDto } from '@/fetchers/queriesSchemas';
import { User } from '@/src/lib/store/authStore';
import { format } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Briefcase, Calendar as CalendarIcon, CheckCircle, Clock } from 'lucide-react-native';
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

// export const HomeScreen: React.FC = () => {
//   const user = useAuthStore((state) => state.user);
//   // const { jobs, isLoading } = useJobs();

//   console.log('User in HomeScreen:', user);
//   const customerId = user?.customerId;
//   const {
//     data: managerJobsData,
//     isLoading,
//   } = useCustomerJobControllerJobs(
//     {
//       queryParams: {
//         customerId: customerId || '',
//       }
//     },
//     {
//       enabled: !!customerId,
//     }
//   )

//   const { data: cleanerJobsData } = useJobControllerJobs({
//     queryParams: {
//       staffId: user?.id,
//     }
//   },{
//     enabled: user?.role && user.role === 'general',
//   });
//   console.log(managerJobsData?.data.length);

//   const managerJobList = managerJobsData?.data || [];
//   const cleanerJobData = cleanerJobsData?.data || [];

//   return (
//     user?.customerId ?
//     <HomeScreenData jobs={managerJobList} isLoading={isLoading} user={user} /> :
//     <HomeScreenData jobs={cleanerJobData} isLoading={isLoading} user={user!} />
//   )


// };

export const HomeScreen = ({ jobs , isLoading , user }: { jobs: ListJobDto[] , isLoading: boolean, user:User }) => {
  const router = useRouter();
  const totalJobs = jobs.length;
  console.log(jobs.map((job) => job.status));
  const completedJobs = jobs.filter((job) => job.status === 'Completed').length;
  const pendingJobs = jobs.filter((job) => job.status === 'scheduled').length;
  const inProgressJobs = jobs.filter((job) => job.status === 'In Progress').length;

  const currentJobs = jobs.filter((job) => job.status === 'In Progress').slice(0, 3);
  const upcomingJobs = jobs.filter((job) => job.status === 'scheduled').slice(0, 3);


  const handleJobPress = (jobId: string) => {
    router.push(`/job/${jobId}`);
  };

  const analyticsData = [
    {
      id: 1,
      title: 'Total Jobs',
      value: totalJobs.toString(),
      icon: Briefcase,
      gradient: ['#3b82f6', '#2563eb'] as const,
    },
    {
      id: 2,
      title: 'Completed',
      value: completedJobs.toString(),
      icon: CheckCircle,
      gradient: ['#10b981', '#059669'] as const,
    },
    {
      id: 3,
      title: 'Pending',
      value: pendingJobs.toString(),
      icon: Clock,
      gradient: ['#f59e0b', '#d97706'] as const,
    },
    {
      id: 4,
      title: 'In Progress',
      value: inProgressJobs.toString(),
      icon: CalendarIcon,
      gradient: ['#8b5cf6', '#7c3aed'] as const,
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <Text style={styles.headerSubtitle}>
          Welcome back, {user?.fullName || user?.email || 'User'}!
        </Text>
      </View>

      <View style={styles.analyticsContainer}>
        {analyticsData.map((item, index) => (
          <View
            key={item.id}
            style={[
              styles.analyticsCardWrapper,
              index % 2 === 0 ? styles.leftCard : styles.rightCard,
            ]}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push('/(tabs)/jobs')}>
              <LinearGradient
                colors={item.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.analyticsCard}>
                <View style={styles.cardIconContainer}>
                  <item.icon size={28} color="#ffffff" strokeWidth={2.5} />
                </View>
                <Text style={styles.cardValue}>{item.value}</Text>
                <Text style={styles.cardTitle}>{item.title}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {currentJobs.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Currently Running</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{currentJobs.length}</Text>
            </View>
          </View>

          {currentJobs.map((job) => (
            <TouchableOpacity
              key={job.id}
              onPress={() => handleJobPress(job.id)}
              activeOpacity={0.7}>
              <View style={styles.jobCard}>
                <View style={styles.jobHeader}>
                  <View style={styles.jobTitleContainer}>
                    <Text style={styles.jobTitle}>{job.title}</Text>
                    <Text style={styles.jobClient}>
                      {job.site?.city || 'No location'}
                    </Text>
                  </View>
                  <View style={styles.statusBadgeRunning}>
                    <Text style={styles.statusTextRunning}>Started</Text>
                  </View>
                </View>

                {job.startAt && (
                  <View style={styles.jobFooter}>
                    <View style={styles.dueDateContainer}>
                      <Clock size={14} color="#64748b" strokeWidth={2} />
                      <Text style={styles.dueDate}>
                        {format(new Date(job.startAt), 'MMM dd, h:mm a')}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {upcomingJobs.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Jobs</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{upcomingJobs.length}</Text>
            </View>
          </View>

          {upcomingJobs.map((job) => (
            <TouchableOpacity
              key={job.id}
              onPress={() => handleJobPress(job.id)}
              activeOpacity={0.7}>
              <View style={styles.jobCard}>
                <View style={styles.jobHeader}>
                  <View style={styles.jobTitleContainer}>
                    <Text style={styles.jobTitle}>{job.title}</Text>
                    <Text style={styles.jobClient}>
                      {job.site?.city || 'No location'}
                    </Text>
                  </View>
                  <View style={styles.statusBadgeScheduled}>
                    <Text style={styles.statusTextScheduled} className="capitalize">{job.status}</Text>
                  </View>
                </View>

                <View style={styles.jobFooter}>
                  <View style={styles.dueDateContainer}>
                    <CalendarIcon size={14} color="#64748b" strokeWidth={2} />
                    <Text style={styles.dueDate}>
                      {format(new Date(job.createdAt), 'MMM dd, yyyy')}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {!isLoading && totalJobs === 0 && (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Briefcase size={48} color="#3B82F6" strokeWidth={2} />
          </View>
          <Text style={styles.emptyTitle}>No Jobs Yet</Text>
          <Text style={styles.emptyText}>
            You don&apos;t have any assigned jobs at the moment. New jobs will appear here when assigned.
          </Text>
        </View>
      )}

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

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
  analyticsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 20,
    marginBottom: 8,
  },
  analyticsCardWrapper: {
    marginBottom: 16,
  },
  leftCard: {
    paddingRight: 8,
  },
  rightCard: {
    paddingLeft: 8,
  },
  analyticsCard: {
    width: cardWidth,
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  cardIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginRight: 8,
  },
  badge: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3730a3',
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
  jobHeader: {
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
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  jobClient: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  statusBadgeRunning: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusTextRunning: {
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
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dueDate: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
    marginLeft: 6,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomPadding: {
    height: 24,
  },
});
