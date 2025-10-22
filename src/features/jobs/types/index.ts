import type { GetJobChecklistDto, GetJobDto, ListJobDto } from '@/fetchers/queriesSchemas';

// Re-export types from auto-generated schemas
export type Job = ListJobDto;
export type JobDetails = GetJobDto;
export type JobChecklist = GetJobChecklistDto;

// Job status enum matching backend
export type JobStatus = 'Pending' | 'Ongoing' | 'Completed' | 'Cancelled';

// Filter types for job list
export type JobFilterStatus = 'all' | JobStatus;

export interface JobFilters {
  status?: JobFilterStatus;
  search?: string;
  page?: number;
  take?: number;
}

// Location data for starting a job
export interface JobStartLocation {
  latitude: number;
  longitude: number;
}
