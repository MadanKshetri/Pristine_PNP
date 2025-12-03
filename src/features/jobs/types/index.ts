import { StaffJobControllerJobsQueryParams } from "@/fetchers/queriesComponents";
import type {
  GetJobChecklistDto,
  GetJobDto,
  ListJobDto,
} from "@/fetchers/queriesSchemas";

// Re-export types from auto-generated schemas
export type Job = ListJobDto;
export type JobDetails = GetJobDto;
export type JobChecklist = GetJobChecklistDto;

export interface JobFilters {
  status?: StaffJobControllerJobsQueryParams["status"];
  search?: string;
  page?: number;
  take?: number;
  startDate?: string;
  endDate?: string;
}

// Location data for starting a job
export interface JobStartLocation {
  latitude: number;
  longitude: number;
}
