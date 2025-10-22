import { format } from 'date-fns';
import { Clock, MapPin } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { Job } from '../types';

interface JobCardProps {
  job: Job;
  onPress: (jobId: string) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onPress }) => {
  const hasStarted = job.startAt !== null;

  return (
    <TouchableOpacity onPress={() => onPress(job.id)} activeOpacity={0.7}>
      <View style={styles.jobCard}>
        <View style={styles.jobCardHeader}>
          <View style={styles.jobTitleContainer}>
            <Text style={styles.jobTitle}>{job.title}</Text>
            <Text style={styles.jobNumber}>Job #{job.jobNumber}</Text>
          </View>
          <View style={hasStarted ? styles.statusBadgeStarted : styles.statusBadgePending}>
            <Text style={hasStarted ? styles.statusTextStarted : styles.statusTextPending}>
              {hasStarted ? 'Started' : 'Pending'}
            </Text>
          </View>
        </View>

        {job.description && (
          <Text style={styles.jobDescription} numberOfLines={2}>
            {job.description}
          </Text>
        )}

        {job.site && (
          <View style={styles.siteInfo}>
            <MapPin size={16} color="#64748b" strokeWidth={2} />
            <View style={styles.siteTextContainer}>
              <Text style={styles.siteAddress} numberOfLines={1}>
                {job.site.address}
              </Text>
              <Text style={styles.siteCity}>{job.site.city}</Text>
            </View>
          </View>
        )}

        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <Clock size={14} color="#64748b" strokeWidth={2} />
            <Text style={styles.footerText}>
              {format(new Date(job.createdAt), 'MMM dd, yyyy')}
            </Text>
          </View>
          {hasStarted && job.startAt && (
            <View style={styles.startedBadge}>
              <Clock size={14} color="#10B981" strokeWidth={2} />
              <Text style={styles.startedText}>
                {format(new Date(job.startAt), 'MMM dd, h:mm a')}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
  jobNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  statusBadgeStarted: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusTextStarted: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1e40af',
  },
  statusBadgePending: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusTextPending: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400e',
  },
  jobDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 12,
  },
  siteInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
  },
  siteTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  siteAddress: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  siteCity: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
    marginLeft: 6,
  },
  startedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  startedText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065f46',
    marginLeft: 6,
  },
});
