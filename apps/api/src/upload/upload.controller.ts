/**
 * @fileoverview Upload controller for handling CSV file upload HTTP endpoints.
 */

import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Express } from 'express';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// Max file size: 100MB
const MAX_FILE_SIZE = 100 * 1024 * 1024;

/**
 * Sanitize filename to prevent directory traversal and other security issues
 */
function sanitizeFilename(filename: string): string {
  // Remove path separators and dangerous characters
  return filename
    .replace(/[/\\:*?"<>|]/g, '_')
    .replace(/\.\./g, '_')
    .replace(/^\./, '_')
    .slice(0, 255); // Limit filename length
}

@ApiTags('uploads')
@Controller('uploads')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post(':projectId')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: MAX_FILE_SIZE,
      },
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(csv|tsv)$/i)) {
          return callback(new BadRequestException('Only CSV and TSV files are allowed'), false);
        }
        callback(null, true);
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a CSV file for analysis' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file' })
  async uploadFile(
    @Request() req: { user: { id: string } },
    @Param('projectId') projectId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Sanitize the filename
    const safeFilename = sanitizeFilename(file.originalname);

    // In production, upload to S3/GCS and get the key
    // For now, we'll use a mock S3 key with sanitized filename
    const s3Key = `uploads/${projectId}/${Date.now()}-${safeFilename}`;

    // Parse CSV to get row count (simplified - in production use a streaming parser)
    const content = file.buffer.toString('utf-8');
    const lines = content.split('\n').filter((line) => line.trim());
    const rowCount = Math.max(0, lines.length - 1); // Subtract header row
    const headers = lines[0]?.split(',').map((h) => h.trim().toLowerCase()) || [];

    // Create upload record
    const upload = await this.uploadService.createUpload(
      req.user.id,
      projectId,
      s3Key.split('/').pop() || safeFilename,
      safeFilename,
      s3Key,
      rowCount,
      file.size,
    );

    // Validate CSV structure
    const validation = await this.uploadService.validateUpload(upload.id, headers);

    return {
      ...upload,
      validation,
      headers,
      rowCount,
    };
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get all uploads for a project' })
  @ApiResponse({ status: 200, description: 'List of uploads' })
  async getProjectUploads(@Param('projectId') projectId: string) {
    return this.uploadService.getUploadsForProject(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get upload by ID' })
  @ApiResponse({ status: 200, description: 'Upload found' })
  @ApiResponse({ status: 404, description: 'Upload not found' })
  async getUpload(@Param('id') id: string) {
    return this.uploadService.getUpload(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an upload' })
  @ApiResponse({ status: 200, description: 'Upload deleted' })
  async deleteUpload(@Param('id') id: string) {
    return this.uploadService.deleteUpload(id);
  }
}
