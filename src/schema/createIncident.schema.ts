import { z } from "zod";

export const CreateIncidentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  siteId: z.string().min(1, "Site is required"),
  priority: z.enum(["Low", "Medium", "High"]).default("Low"),
  type: z.enum(["Issue", "Request", "Seeking Information"]).default("Issue"),
  attachments: z.array(z.any()).optional(),
});
