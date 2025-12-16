/**
 * @fileoverview Realtime service for Redis pub/sub integration.
 */

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import IORedis from 'ioredis';
import { Subject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export interface JobProgressEvent {
  jobId: string;
  stage: string;
  progress: number;
  error?: string;
  timestamp: string;
}

@Injectable()
export class RealtimeService implements OnModuleInit, OnModuleDestroy {
  private subscriber: IORedis | null = null;
  private publisher: IORedis | null = null;
  private progressSubject = new Subject<JobProgressEvent>();

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const redisUrl = this.configService.get<string>('REDIS_URL') || 'redis://localhost:6379';
    
    try {
      // Create subscriber connection
      this.subscriber = new IORedis(redisUrl);
      
      // Create publisher connection
      this.publisher = new IORedis(redisUrl);

      // Subscribe to job progress channel
      await this.subscriber.subscribe('jobs:progress');

      // Handle incoming messages
      this.subscriber.on('message', (channel, message) => {
        if (channel === 'jobs:progress') {
          try {
            const event: JobProgressEvent = JSON.parse(message);
            this.progressSubject.next(event);
          } catch (e) {
            console.error('Failed to parse job progress event:', e);
          }
        }
      });

      console.log('[Realtime] Redis pub/sub initialized');
    } catch (error) {
      console.warn('[Realtime] Redis not available, real-time updates disabled:', error);
    }
  }

  async onModuleDestroy() {
    if (this.subscriber) {
      await this.subscriber.unsubscribe('jobs:progress');
      this.subscriber.quit();
    }
    if (this.publisher) {
      this.publisher.quit();
    }
    this.progressSubject.complete();
  }

  /**
   * Get observable for job progress updates
   */
  getJobProgressStream(jobId: string): Observable<JobProgressEvent> {
    return this.progressSubject.asObservable().pipe(
      filter((event) => event.jobId === jobId),
    );
  }

  /**
   * Get observable for all job progress updates
   */
  getAllJobProgressStream(): Observable<JobProgressEvent> {
    return this.progressSubject.asObservable();
  }

  /**
   * Publish a job progress event
   */
  async publishJobProgress(event: JobProgressEvent): Promise<void> {
    if (!this.publisher) return;
    
    await this.publisher.publish('jobs:progress', JSON.stringify(event));
    await this.publisher.publish(`job:${event.jobId}:progress`, JSON.stringify(event));
  }

  /**
   * Check if Redis is available
   */
  isAvailable(): boolean {
    return this.subscriber !== null && this.publisher !== null;
  }
}
