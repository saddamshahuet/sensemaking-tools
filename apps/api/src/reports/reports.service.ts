/**
 * @fileoverview Reports service implementing business logic for report management.
 */

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Report } from '@prisma/client';
import { ReportsRepository, CreateReportDto, UpdateReportDto } from './reports.repository';
import { ProjectsService } from '../projects/projects.service';
import { PaginatedResult } from '../common/base.repository';

@Injectable()
export class ReportsService {
  constructor(
    private readonly reportsRepository: ReportsRepository,
    private readonly projectsService: ProjectsService,
  ) {}

  /**
   * Create a new report for a project
   */
  async create(
    userId: string,
    projectId: string,
    name: string,
    csvFileUrl?: string,
  ): Promise<Report> {
    // Check user has access to project
    const hasAccess = await this.projectsService.checkAccess(projectId, userId);
    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return this.reportsRepository.create({
      projectId,
      name,
      csvFileUrl,
    });
  }

  /**
   * Find all reports for a project
   */
  async findByProject(
    userId: string,
    projectId: string,
    options: { page?: number; limit?: number } = {},
  ): Promise<PaginatedResult<Report>> {
    // Check user has access to project
    const hasAccess = await this.projectsService.checkAccess(projectId, userId);
    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return this.reportsRepository.findByProjectId(projectId, options);
  }

  /**
   * Find a report by ID
   */
  async findById(id: string, userId: string) {
    const report = await this.reportsRepository.findByIdWithRelations(id);
    if (!report) {
      throw new NotFoundException('Report not found');
    }

    // Check user has access to the project
    const hasAccess = await this.projectsService.checkAccess(
      report.project.id,
      userId,
    );
    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this report');
    }

    return report;
  }

  /**
   * Get report with summary
   */
  async findByIdWithSummary(id: string, userId: string) {
    const report = await this.reportsRepository.findByIdWithSummary(id);
    if (!report) {
      throw new NotFoundException('Report not found');
    }

    // Check user has access
    const hasAccess = await this.projectsService.checkAccess(
      report.project.id,
      userId,
    );
    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this report');
    }

    return report;
  }

  /**
   * Update a report
   */
  async update(
    id: string,
    userId: string,
    data: { name?: string },
  ): Promise<Report> {
    const report = await this.reportsRepository.findByIdWithRelations(id);
    if (!report) {
      throw new NotFoundException('Report not found');
    }

    // Check user owns the project
    if (report.project.userId !== userId) {
      throw new ForbiddenException('You can only update reports in projects you own');
    }

    return this.reportsRepository.update(id, data);
  }

  /**
   * Delete a report
   */
  async delete(id: string, userId: string): Promise<void> {
    const report = await this.reportsRepository.findByIdWithRelations(id);
    if (!report) {
      throw new NotFoundException('Report not found');
    }

    // Check user owns the project
    if (report.project.userId !== userId) {
      throw new ForbiddenException('You can only delete reports in projects you own');
    }

    await this.reportsRepository.delete(id);
  }

  /**
   * Start processing a report
   */
  async startProcessing(
    reportId: string,
    userId: string,
    csvUploadId?: string,
  ) {
    const report = await this.reportsRepository.findByIdWithRelations(reportId);
    if (!report) {
      throw new NotFoundException('Report not found');
    }

    // Check user has access
    const hasAccess = await this.projectsService.checkAccess(
      report.project.id,
      userId,
    );
    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this report');
    }

    // Create processing job
    const job = await this.reportsRepository.createProcessingJob(
      reportId,
      csvUploadId,
    );

    // Update report status
    await this.reportsRepository.updateStatus(reportId, 'PROCESSING');

    return job;
  }

  /**
   * Get processing job status
   */
  async getProcessingJobStatus(jobId: string, userId: string) {
    const job = await this.reportsRepository.findProcessingJobById(jobId);
    if (!job) {
      throw new NotFoundException('Processing job not found');
    }

    // Check user has access to the project
    const hasAccess = await this.projectsService.checkAccess(
      job.report.projectId,
      userId,
    );
    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this job');
    }

    return job;
  }
}
