/**
 * @fileoverview Sensemaking processor for handling CSV analysis jobs.
 * This processor integrates with the core sensemaking library.
 */

import { Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';

/**
 * Job data structure for sensemaking processing
 */
export interface ProcessingJobData {
  jobId: string;
  reportId: string;
  projectId: string;
  csvUploadId?: string;
  additionalContext?: string;
}

/**
 * Processing stages for progress tracking
 */
export enum ProcessingStage {
  PARSING_CSV = 'PARSING_CSV',
  LEARNING_TOPICS = 'LEARNING_TOPICS',
  CATEGORIZING_COMMENTS = 'CATEGORIZING_COMMENTS',
  GENERATING_SUMMARY = 'GENERATING_SUMMARY',
  COMPLETE = 'COMPLETE',
}

/**
 * Sensemaking processor class
 */
export class SensemakingProcessor {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Process a sensemaking job
   */
  async process(job: Job<ProcessingJobData>): Promise<void> {
    const { jobId, reportId, projectId, csvUploadId, additionalContext } = job.data;

    try {
      // Update job status to running
      await this.updateJobProgress(jobId, ProcessingStage.PARSING_CSV, 5);

      // In a real implementation, this would:
      // 1. Download CSV from S3
      // 2. Parse CSV into Comment[]
      // 3. Initialize Sensemaker with model settings
      // 4. Call learnTopics(), categorizeComments(), summarize()
      // 5. Store results in database

      // For now, simulate processing stages
      await this.updateJobProgress(jobId, ProcessingStage.LEARNING_TOPICS, 30);
      await this.simulateDelay(2000);

      await this.updateJobProgress(jobId, ProcessingStage.CATEGORIZING_COMMENTS, 60);
      await this.simulateDelay(2000);

      await this.updateJobProgress(jobId, ProcessingStage.GENERATING_SUMMARY, 90);
      await this.simulateDelay(1000);

      // Mark as complete
      await this.updateJobProgress(jobId, ProcessingStage.COMPLETE, 100);

      // Update report status
      await this.prisma.report.update({
        where: { id: reportId },
        data: { status: 'COMPLETED' },
      });

    } catch (error) {
      // Update job with error
      await this.prisma.processingJob.update({
        where: { id: jobId },
        data: {
          status: 'FAILED',
          error: error instanceof Error ? error.message : 'Unknown error',
          completedAt: new Date(),
        },
      });

      // Update report status
      await this.prisma.report.update({
        where: { id: reportId },
        data: { status: 'FAILED' },
      });

      throw error;
    }
  }

  /**
   * Update job progress in database
   */
  private async updateJobProgress(
    jobId: string,
    stage: ProcessingStage,
    progress: number,
  ): Promise<void> {
    const data: {
      stage: string;
      progress: number;
      status?: string;
      startedAt?: Date;
      completedAt?: Date;
    } = {
      stage,
      progress,
    };

    if (progress === 5) {
      data.status = 'RUNNING';
      data.startedAt = new Date();
    } else if (progress >= 100) {
      data.status = 'COMPLETED';
      data.completedAt = new Date();
    }

    await this.prisma.processingJob.update({
      where: { id: jobId },
      data,
    });

    console.log(`[Processor] Job ${jobId}: ${stage} (${progress}%)`);
  }

  /**
   * Simulate processing delay (for demo purposes)
   */
  private simulateDelay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
