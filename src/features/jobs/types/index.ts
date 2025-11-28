import type {
  GetJobChecklistDto,
  GetJobDto,
  ListJobDto,
} from "@/fetchers/queriesSchemas";

import type { ManagerJobControllerJobsQueryParams } from "@/fetchers/queriesComponents";

// Re-export types from auto-generated schemas
export type Job = ListJobDto;
export type JobDetails = GetJobDto;
export type JobChecklist = GetJobChecklistDto;

export interface JobFilters {
  status?: ManagerJobControllerJobsQueryParams["status"];
  search?: string;
  page?: number;
  take?: number;
}

// Location data for starting a job
export interface JobStartLocation {
  latitude: number;
  longitude: number;
}
