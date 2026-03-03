import { z } from 'zod';
import { missionSchema } from './missions';

export const reportSchema = z.object({
  id: z.string().uuid(),
  missionId: z.string().uuid(),
  author: z.string(),
  submittedAt: z.string().datetime({ offset: true }),
  summary: z.string().optional(),
  details: z.string(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('LOW'),
});
export type Report = z.infer<typeof reportSchema>;

export const missionWithReportsSchema = missionSchema.extend({
  reports: z.array(reportSchema),
});
export type MissionWithReports = z.infer<typeof missionWithReportsSchema>;
