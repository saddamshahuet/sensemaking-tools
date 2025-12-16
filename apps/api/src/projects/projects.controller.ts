/**
 * @fileoverview Projects controller handling HTTP endpoints for project management.
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
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateProjectDto, UpdateProjectDto, ProjectQueryDto } from './dto';

@ApiTags('projects')
@Controller('projects')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  @ApiResponse({ status: 201, description: 'Project created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Request() req: { user: { id: string } },
    @Body() createProjectDto: CreateProjectDto,
  ) {
    return this.projectsService.create(
      req.user.id,
      createProjectDto.name,
      createProjectDto.description,
      createProjectDto.additionalContext,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all projects for current user' })
  @ApiResponse({ status: 200, description: 'List of projects' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  async findAll(
    @Request() req: { user: { id: string } },
    @Query() query: ProjectQueryDto,
  ) {
    return this.projectsService.findAllForUser(req.user.id, {
      page: query.page,
      limit: query.limit,
      search: query.search,
    });
  }

  @Get('shared')
  @ApiOperation({ summary: 'Get projects shared with current user' })
  @ApiResponse({ status: 200, description: 'List of shared projects' })
  async findShared(
    @Request() req: { user: { id: string } },
    @Query() query: ProjectQueryDto,
  ) {
    return this.projectsService.findSharedWithUser(req.user.id, {
      page: query.page,
      limit: query.limit,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a project by ID' })
  @ApiResponse({ status: 200, description: 'Project found' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async findById(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
  ) {
    return this.projectsService.findByIdWithRelations(id, req.user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a project' })
  @ApiResponse({ status: 200, description: 'Project updated' })
  @ApiResponse({ status: 403, description: 'Can only update projects you own' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async update(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return this.projectsService.update(id, req.user.id, updateProjectDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a project' })
  @ApiResponse({ status: 204, description: 'Project deleted' })
  @ApiResponse({ status: 403, description: 'Can only delete projects you own' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async delete(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
  ) {
    await this.projectsService.delete(id, req.user.id);
  }
}
