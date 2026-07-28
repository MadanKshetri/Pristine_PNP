import { z } from "zod";

export const CreateJobSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  siteId: z.string().min(1, "Site ID is required"),
  customerId: z.string().min(1, "Customer ID is required"),
  assignedCleanerId: z.string().optional(),
  startAt: z.date({ message: "Start date is required" }),
  assets: z.array(z.any()).optional(),
});
