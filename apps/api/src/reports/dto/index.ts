/**
 * @fileoverview Report DTOs for request validation.
 */

import { IsString, MinLength, MaxLength, IsOptional, IsNumber, Min, Max, IsUrl, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateReportDto {
  @ApiProperty({ description: 'Project ID' })
  @IsString()
  projectId: string;

  @ApiProperty({ description: 'Report name', example: 'November Feedback Analysis' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ description: 'CSV file URL' })
  @IsOptional()
  @IsString()
  csvFileUrl?: string;
}

export class UpdateReportDto {
  @ApiPropertyOptional({ description: 'Report name' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name?: string;
}

export class ReportQueryDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 10, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

export class StartProcessingDto {
  @ApiPropertyOptional({ description: 'CSV upload ID to process' })
  @IsOptional()
  @IsString()
  csvUploadId?: string;
}
