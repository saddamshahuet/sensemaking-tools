/**
 * @fileoverview API Key DTOs for request validation.
 */

import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateApiKeyDto {
  @ApiProperty({ description: 'Name for the API key', example: 'Production API Key' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;
}
