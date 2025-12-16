/**
 * @fileoverview Upload service for handling CSV file uploads.
 */

import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { ProjectsService } from '../projects/projects.service';

/**
 * Required columns for CSV validation
 */
const REQUIRED_COLUMNS = ['comment-id', 'comment_text'];
const OPTIONAL_COLUMNS = ['topic', 'subtopic'];

@Injectable()
export class UploadService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projectsService: ProjectsService,
  ) {}

  /**
   * Create a CSV upload record
   */
  async createUpload(
    userId: string,
    projectId: string,
    filename: string,
    originalFilename: string,
    s3Key: string,
    rowCount: number,
    fileSize: number,
  ) {
    // Check user has access to project
    const hasAccess = await this.projectsService.checkAccess(projectId, userId);
    if (!hasAccess) {
      throw new BadRequestException('You do not have access to this project');
    }

    return this.prisma.csvUpload.create({
      data: {
        projectId,
        filename,
        originalFilename,
        s3Key,
        rowCount,
        fileSize,
        status: 'PENDING',
      },
    });
  }

  /**
   * Validate CSV upload
   */
  async validateUpload(uploadId: string, headers: string[]) {
    const missingColumns = REQUIRED_COLUMNS.filter(
      (col) => !headers.includes(col),
    );

    if (missingColumns.length > 0) {
      await this.prisma.csvUpload.update({
        where: { id: uploadId },
        data: {
          status: 'INVALID',
          validationError: `Missing required columns: ${missingColumns.join(', ')}`,
        },
      });
      return {
        valid: false,
        error: `Missing required columns: ${missingColumns.join(', ')}`,
      };
    }

    await this.prisma.csvUpload.update({
      where: { id: uploadId },
      data: {
        status: 'VALIDATED',
      },
    });

    return { valid: true };
  }

  /**
   * Get upload by ID
   */
  async getUpload(uploadId: string) {
    return this.prisma.csvUpload.findUnique({
      where: { id: uploadId },
    });
  }

  /**
   * Get uploads for a project
   */
  async getUploadsForProject(projectId: string) {
    return this.prisma.csvUpload.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Delete an upload
   */
  async deleteUpload(uploadId: string) {
    return this.prisma.csvUpload.delete({
      where: { id: uploadId },
    });
  }
}
