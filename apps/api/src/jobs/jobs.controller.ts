/**
 * @fileoverview Jobs controller for handling job-related HTTP endpoints.
 */

import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Request,
  Sse,
  MessageEvent,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Observable, interval, map } from 'rxjs';
import { JobsService } from './jobs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('jobs')
@Controller('jobs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get job status' })
  @ApiResponse({ status: 200, description: 'Job status' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async getJob(@Param('id') id: string) {
    return this.jobsService.getJob(id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel a running job' })
  @ApiResponse({ status: 200, description: 'Job cancelled' })
  async cancelJob(@Param('id') id: string) {
    return this.jobsService.cancelJob(id);
  }

  @Sse(':id/progress')
  @ApiOperation({ summary: 'Stream job progress updates via SSE' })
  progress(@Param('id') id: string): Observable<MessageEvent> {
    // In production, this would connect to Redis pub/sub
    // For now, poll the database
    return interval(2000).pipe(
      map(async () => {
        const job = await this.jobsService.getJob(id);
        return {
          data: {
            jobId: id,
            status: job?.status || 'UNKNOWN',
            stage: job?.stage || 'UNKNOWN',
            progress: job?.progress || 0,
            error: job?.error,
          },
        };
      }),
    );
  }
}
