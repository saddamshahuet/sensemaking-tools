/**
 * @fileoverview API Keys controller for managing external API access.
 */

import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ApiKeysService } from './api-keys.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateApiKeyDto } from './dto';

@ApiTags('api-keys')
@Controller('api-keys')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new API key' })
  @ApiResponse({ status: 201, description: 'API key created. The key value is only shown once.' })
  async create(
    @Request() req: { user: { id: string } },
    @Body() createApiKeyDto: CreateApiKeyDto,
  ) {
    return this.apiKeysService.create(req.user.id, createApiKeyDto.name);
  }

  @Get()
  @ApiOperation({ summary: 'List all API keys for current user' })
  @ApiResponse({ status: 200, description: 'List of API keys' })
  async findAll(@Request() req: { user: { id: string } }) {
    return this.apiKeysService.findAllForUser(req.user.id);
  }

  @Post(':id/revoke')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke an API key' })
  @ApiResponse({ status: 204, description: 'API key revoked' })
  @ApiResponse({ status: 404, description: 'API key not found' })
  async revoke(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
  ) {
    await this.apiKeysService.revoke(id, req.user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an API key' })
  @ApiResponse({ status: 204, description: 'API key deleted' })
  @ApiResponse({ status: 404, description: 'API key not found' })
  async delete(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
  ) {
    await this.apiKeysService.delete(id, req.user.id);
  }
}
