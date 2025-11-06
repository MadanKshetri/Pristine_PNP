import { JobFilters, JobListWithCalendar } from "@/src/features/jobs";
import { useJobsByRole } from "@/src/features/jobs/hooks/useJobsByRole";
import { useAuthStore } from "@/src/lib/store/authStore";
import { useState } from "react";

export default function JobsScreen() {

const [filters, setFilters] = useState<JobFilters>({});
  const user = useAuthStore((state) => state.user);
  const { jobs, error, isLoading, refetch } = useJobsByRole(filters);
  
  if (!user) {
    return <div>Loading...</div>;
  }


  return <JobListWithCalendar jobs={jobs} error={error} isLoading={isLoading} refetch={refetch} user={user}  handleSearch={setFilters} search={filters.search} />;
}
