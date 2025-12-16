/**
 * @fileoverview Jobs service for managing background processing jobs.
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get job by ID
   */
  async getJob(jobId: string) {
    return this.prisma.processingJob.findUnique({
      where: { id: jobId },
      include: {
        report: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
                userId: true,
              },
            },
          },
        },
        csvUpload: true,
      },
    });
  }

  /**
   * Update job progress
   */
  async updateProgress(
    jobId: string,
    stage: string,
    progress: number,
    error?: string,
  ) {
    const data: {
      stage: string;
      progress: number;
      error?: string;
      status?: string;
      startedAt?: Date;
      completedAt?: Date;
    } = {
      stage,
      progress,
    };

    if (error) {
      data.error = error;
      data.status = 'FAILED';
    } else if (progress === 0) {
      data.status = 'RUNNING';
      data.startedAt = new Date();
    } else if (progress >= 100) {
      data.status = 'COMPLETED';
      data.completedAt = new Date();
    }

    return this.prisma.processingJob.update({
      where: { id: jobId },
      data,
    });
  }

  /**
   * Cancel a job
   */
  async cancelJob(jobId: string) {
    return this.prisma.processingJob.update({
      where: { id: jobId },
      data: {
        status: 'CANCELLED',
        completedAt: new Date(),
      },
    });
  }

  /**
   * Get pending jobs
   */
  async getPendingJobs(limit: number = 10) {
    return this.prisma.processingJob.findMany({
      where: {
        status: 'QUEUED',
      },
      take: limit,
      orderBy: { createdAt: 'asc' },
      include: {
        report: {
          include: {
            project: true,
          },
        },
        csvUpload: true,
      },
    });
  }

  /**
   * Get running jobs
   */
  async getRunningJobs() {
    return this.prisma.processingJob.findMany({
      where: {
        status: 'RUNNING',
      },
      include: {
        report: true,
      },
    });
  }
}
