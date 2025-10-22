import { JobDetailsScreen } from '@/src/features/jobs';
import { useLocalSearchParams } from 'expo-router';

export default function JobDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();

  if (!id) {
    return null;
  }

  return <JobDetailsScreen jobId={id} />;
}
