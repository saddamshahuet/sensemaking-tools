/**
 * @fileoverview Reports controller handling HTTP endpoints for report management.
 */

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateReportDto, UpdateReportDto, ReportQueryDto } from './dto';

@ApiTags('reports')
@Controller('reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new report' })
  @ApiResponse({ status: 201, description: 'Report created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Access denied to project' })
  async create(
    @Request() req: { user: { id: string } },
    @Body() createReportDto: CreateReportDto,
  ) {
    return this.reportsService.create(
      req.user.id,
      createReportDto.projectId,
      createReportDto.name,
      createReportDto.csvFileUrl,
    );
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get all reports for a project' })
  @ApiResponse({ status: 200, description: 'List of reports' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findByProject(
    @Request() req: { user: { id: string } },
    @Param('projectId') projectId: string,
    @Query() query: ReportQueryDto,
  ) {
    return this.reportsService.findByProject(req.user.id, projectId, {
      page: query.page,
      limit: query.limit,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a report by ID' })
  @ApiResponse({ status: 200, description: 'Report found' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async findById(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
  ) {
    return this.reportsService.findById(id, req.user.id);
  }

  @Get(':id/summary')
  @ApiOperation({ summary: 'Get report with summary data' })
  @ApiResponse({ status: 200, description: 'Report with summary' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  async findWithSummary(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
  ) {
    return this.reportsService.findByIdWithSummary(id, req.user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a report' })
  @ApiResponse({ status: 200, description: 'Report updated' })
  @ApiResponse({ status: 403, description: 'Can only update reports you own' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  async update(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Body() updateReportDto: UpdateReportDto,
  ) {
    return this.reportsService.update(id, req.user.id, updateReportDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a report' })
  @ApiResponse({ status: 204, description: 'Report deleted' })
  @ApiResponse({ status: 403, description: 'Can only delete reports you own' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  async delete(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
  ) {
    await this.reportsService.delete(id, req.user.id);
  }

  @Post(':id/process')
  @ApiOperation({ summary: 'Start processing a report' })
  @ApiResponse({ status: 201, description: 'Processing started' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  async startProcessing(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Body() body: { csvUploadId?: string },
  ) {
    return this.reportsService.startProcessing(id, req.user.id, body.csvUploadId);
  }

  @Get('jobs/:jobId/status')
  @ApiOperation({ summary: 'Get processing job status' })
  @ApiResponse({ status: 200, description: 'Job status' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async getJobStatus(
    @Request() req: { user: { id: string } },
    @Param('jobId') jobId: string,
  ) {
    return this.reportsService.getProcessingJobStatus(jobId, req.user.id);
  }
}
