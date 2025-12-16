/**
 * @fileoverview Reports repository implementing data access for Report entity.
 */

import { Injectable } from '@nestjs/common';
import { Report, Prisma } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import {
  IBaseRepository,
  PaginationOptions,
  PaginatedResult,
  calculatePagination,
  calculateSkip,
} from '../common/base.repository';

/**
 * Data transfer object for creating a new report
 */
export interface CreateReportDto {
  projectId: string;
  name: string;
  csvFileUrl?: string;
}

/**
 * Data transfer object for updating a report
 */
export interface UpdateReportDto {
  name?: string;
  status?: string;
  outputJson?: Record<string, unknown>;
}

/**
 * Filter options for finding reports
 */
export interface ReportFilterOptions extends PaginationOptions {
  projectId?: string;
  status?: string;
}

@Injectable()
export class ReportsRepository implements IBaseRepository<Report, CreateReportDto, UpdateReportDto> {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find a report by ID
   */
  async findById(id: string): Promise<Report | null> {
    return this.prisma.report.findUnique({
      where: { id },
    });
  }

  /**
   * Find a report by ID with relations
   */
  async findByIdWithRelations(id: string) {
    return this.prisma.report.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            userId: true,
            additionalContext: true,
          },
        },
        processingJobs: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        summary: true,
      },
    });
  }

  /**
   * Find all reports with pagination
   */
  async findAll(options: ReportFilterOptions = {}): Promise<PaginatedResult<Report>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      projectId,
      status,
    } = options;

    const where: Prisma.ReportWhereInput = {
      ...(projectId && { projectId }),
      ...(status && { status }),
    };

    const [data, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        skip: calculateSkip(page, limit),
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          processingJobs: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      }),
      this.prisma.report.count({ where }),
    ]);

    return {
      data,
      meta: calculatePagination(total, page, limit),
    };
  }

  /**
   * Find reports by project ID
   */
  async findByProjectId(
    projectId: string,
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<Report>> {
    return this.findAll({ ...options, projectId });
  }

  /**
   * Create a new report
   */
  async create(data: CreateReportDto): Promise<Report> {
    return this.prisma.report.create({
      data: {
        projectId: data.projectId,
        name: data.name,
        csvFileUrl: data.csvFileUrl,
        status: 'PENDING',
      },
    });
  }

  /**
   * Update an existing report
   */
  async update(id: string, data: UpdateReportDto): Promise<Report> {
    return this.prisma.report.update({
      where: { id },
      data,
    });
  }

  /**
   * Update report status
   */
  async updateStatus(id: string, status: string): Promise<Report> {
    return this.prisma.report.update({
      where: { id },
      data: { status },
    });
  }

  /**
   * Delete a report by ID
   */
  async delete(id: string): Promise<Report> {
    return this.prisma.report.delete({
      where: { id },
    });
  }

  /**
   * Check if a report exists by ID
   */
  async exists(id: string): Promise<boolean> {
    const report = await this.prisma.report.findUnique({
      where: { id },
      select: { id: true },
    });
    return report !== null;
  }

  /**
   * Get report with summary data
   */
  async findByIdWithSummary(id: string) {
    return this.prisma.report.findUnique({
      where: { id },
      include: {
        summary: true,
        project: {
          select: {
            id: true,
            name: true,
            userId: true,
          },
        },
      },
    });
  }

  /**
   * Create processing job for report
   */
  async createProcessingJob(reportId: string, csvUploadId?: string) {
    return this.prisma.processingJob.create({
      data: {
        reportId,
        csvUploadId,
        status: 'QUEUED',
        progress: 0,
      },
    });
  }

  /**
   * Update processing job
   */
  async updateProcessingJob(
    jobId: string,
    data: {
      status?: string;
      stage?: string;
      progress?: number;
      error?: string;
      startedAt?: Date;
      completedAt?: Date;
    },
  ) {
    return this.prisma.processingJob.update({
      where: { id: jobId },
      data,
    });
  }

  /**
   * Get processing job by ID
   */
  async findProcessingJobById(jobId: string) {
    return this.prisma.processingJob.findUnique({
      where: { id: jobId },
      include: {
        report: {
          select: {
            id: true,
            projectId: true,
            name: true,
          },
        },
      },
    });
  }
}
