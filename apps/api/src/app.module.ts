/**
 * @fileoverview Root application module that imports all feature modules.
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { ReportsModule } from './reports/reports.module';
import { UploadModule } from './upload/upload.module';
import { JobsModule } from './jobs/jobs.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    // Configuration management
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    // Feature modules
    CommonModule,
    AuthModule,
    UsersModule,
    ProjectsModule,
    ReportsModule,
    UploadModule,
    JobsModule,
  ],
})
export class AppModule {}
