/**
 * @fileoverview Realtime controller for SSE endpoints.
 */

import {
  Controller,
  Get,
  Param,
  Sse,
  UseGuards,
  MessageEvent,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Observable, interval } from 'rxjs';
import { map, switchMap, takeWhile } from 'rxjs/operators';
import { from } from 'rxjs';
import { RealtimeService, JobProgressEvent } from './realtime.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../common/prisma.service';

@ApiTags('realtime')
@Controller('realtime')
export class RealtimeController {
  constructor(
    private readonly realtimeService: RealtimeService,
    private readonly prisma: PrismaService,
  ) {}

  @Sse('jobs/:jobId/progress')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Stream job progress updates via SSE' })
  jobProgress(@Param('jobId') jobId: string): Observable<MessageEvent> {
    // If Redis is available, use pub/sub
    if (this.realtimeService.isAvailable()) {
      return this.realtimeService.getJobProgressStream(jobId).pipe(
        map((event: JobProgressEvent) => ({
          data: event,
        })),
        takeWhile((event) => {
          const progress = (event.data as JobProgressEvent).progress;
          return progress < 100 && !(event.data as JobProgressEvent).error;
        }, true),
      );
    }

    // Fallback to polling if Redis is not available
    return this.pollJobProgress(jobId);
  }

  @Sse('jobs/all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Stream all job progress updates via SSE' })
  allJobsProgress(): Observable<MessageEvent> {
    if (this.realtimeService.isAvailable()) {
      return this.realtimeService.getAllJobProgressStream().pipe(
        map((event: JobProgressEvent) => ({
          data: event,
        })),
      );
    }

    // Return empty stream if Redis is not available
    return new Observable();
  }

  /**
   * Fallback polling mechanism when Redis is not available
   */
  private pollJobProgress(jobId: string): Observable<MessageEvent> {
    return interval(2000).pipe(
      switchMap(() =>
        from(
          this.prisma.processingJob.findUnique({
            where: { id: jobId },
          }),
        ),
      ),
      map((job) => {
        if (!job) {
          return {
            data: {
              jobId,
              stage: 'UNKNOWN',
              progress: 0,
              error: 'Job not found',
              timestamp: new Date().toISOString(),
            },
          };
        }

        return {
          data: {
            jobId,
            stage: job.stage || 'UNKNOWN',
            progress: job.progress,
            error: job.error || undefined,
            timestamp: new Date().toISOString(),
          },
        };
      }),
      takeWhile((event) => {
        const data = event.data as { progress: number; error?: string };
        return data.progress < 100 && !data.error;
      }, true),
    );
  }
}
