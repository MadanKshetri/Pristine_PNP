import { HomeScreen } from '@/src/features/home';
import { useJobsByRole } from '@/src/features/jobs/hooks/useJobsByRole';
import { useAuthStore } from '@/src/lib/store/authStore';

export default function HomeTab() {
  const { jobs, isLoading } = useJobsByRole();

  const user = useAuthStore((state) => state.user);
  if (!user) {
    return <div>Loading...</div>;
  }
  return <HomeScreen jobs={jobs} isLoading={isLoading}  user={user} />;
}
