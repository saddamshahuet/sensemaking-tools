/**
 * @fileoverview Worker process entry point for background job processing.
 * This worker connects to BullMQ and processes sensemaking jobs.
 */

import { Worker, Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import IORedis from 'ioredis';
import { SensemakingProcessor, ProcessingJobData } from './processors/sensemaking.processor';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const QUEUE_NAME = 'sensemaking';

const prisma = new PrismaClient();
const connection = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });

const processor = new SensemakingProcessor(prisma);

async function processJob(job: Job<ProcessingJobData>) {
  console.log(`[Worker] Processing job ${job.id}: ${job.name}`);
  
  try {
    await processor.process(job);
    console.log(`[Worker] Job ${job.id} completed successfully`);
  } catch (error) {
    console.error(`[Worker] Job ${job.id} failed:`, error);
    throw error;
  }
}

const worker = new Worker<ProcessingJobData>(
  QUEUE_NAME,
  processJob,
  {
    connection,
    concurrency: 2,
  }
);

worker.on('completed', (job) => {
  console.log(`[Worker] Job ${job.id} has completed`);
});

worker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job?.id} has failed:`, err);
});

worker.on('error', (err) => {
  console.error('[Worker] Worker error:', err);
});

console.log(`[Worker] Sensemaking worker started, listening on queue: ${QUEUE_NAME}`);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[Worker] Received SIGTERM, shutting down...');
  await worker.close();
  await prisma.$disconnect();
  connection.quit();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('[Worker] Received SIGINT, shutting down...');
  await worker.close();
  await prisma.$disconnect();
  connection.quit();
  process.exit(0);
});
