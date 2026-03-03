import 'dotenv/config';
import { Queue, Worker, Job } from 'bullmq';
import { z } from 'zod';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT || 6379),
};

const reportQueueName = process.env.REPORT_QUEUE || 'report.submitted';

const reportJobSchema = z.object({
  reportId: z.string(),
  missionId: z.string(),
  content: z.string(),
});

export const reportQueue = new Queue(reportQueueName, { connection });

const worker = new Worker(
  reportQueueName,
  async (job: Job) => {
    const payload = reportJobSchema.parse(job.data);
    // For now, mock the AI summarization work
    const summary = `Summary placeholder for report ${payload.reportId}`;
    console.log(`[worker] processed report job`, { payload, summary });
    return { summary };
  },
  { connection }
);

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed`, err);
});

console.log('EcoFieldOps worker listening on queue:', reportQueueName);
