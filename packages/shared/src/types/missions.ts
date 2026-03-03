import { z } from 'zod';

export const missionStatusSchema = z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED']);
export type MissionStatus = z.infer<typeof missionStatusSchema>;

export const missionSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  region: z.string(),
  status: missionStatusSchema,
  scheduledStart: z.string().datetime({ offset: true }),
  scheduledEnd: z.string().datetime({ offset: true }),
  lat: z.number(),
  lng: z.number(),
});
export type Mission = z.infer<typeof missionSchema>;
