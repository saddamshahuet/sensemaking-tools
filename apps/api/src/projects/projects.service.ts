/**
 * @fileoverview Projects service implementing business logic for project management.
 */

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Project } from '@prisma/client';
import {
  ProjectsRepository,
  CreateProjectDto,
  UpdateProjectDto,
  ProjectFilterOptions,
} from './projects.repository';
import { PaginatedResult } from '../common/base.repository';

@Injectable()
export class ProjectsService {
  constructor(private readonly projectsRepository: ProjectsRepository) {}

  /**
   * Create a new project for a user
   */
  async create(
    userId: string,
    name: string,
    description?: string,
    additionalContext?: string,
  ): Promise<Project> {
    return this.projectsRepository.create({
      userId,
      name,
      description,
      additionalContext,
    });
  }

  /**
   * Find all projects for a user (owned and shared)
   */
  async findAllForUser(
    userId: string,
    options: { page?: number; limit?: number; search?: string } = {},
  ): Promise<PaginatedResult<Project>> {
    return this.projectsRepository.findAll({
      ...options,
      userId,
    });
  }

  /**
   * Find projects shared with user
   */
  async findSharedWithUser(
    userId: string,
    options: { page?: number; limit?: number } = {},
  ): Promise<PaginatedResult<Project>> {
    return this.projectsRepository.findByCollaborator(userId, options);
  }

  /**
   * Find a project by ID
   */
  async findById(id: string, userId?: string): Promise<Project> {
    const project = await this.projectsRepository.findById(id);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // If userId is provided, check access
    if (userId) {
      const hasAccess = await this.projectsRepository.userHasAccess(id, userId);
      if (!hasAccess) {
        throw new ForbiddenException('You do not have access to this project');
      }
    }

    return project;
  }

  /**
   * Find a project by ID with all related data
   */
  async findByIdWithRelations(id: string, userId: string) {
    const hasAccess = await this.projectsRepository.userHasAccess(id, userId);
    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this project');
    }

    const project = await this.projectsRepository.findByIdWithRelations(id);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  /**
   * Update a project (owner only)
   */
  async update(
    id: string,
    userId: string,
    data: { name?: string; description?: string; additionalContext?: string },
  ): Promise<Project> {
    // Check ownership
    const project = await this.projectsRepository.findByIdAndUserId(id, userId);
    if (!project) {
      throw new ForbiddenException('You can only update projects you own');
    }

    return this.projectsRepository.update(id, data);
  }

  /**
   * Soft delete a project (owner only)
   */
  async delete(id: string, userId: string): Promise<void> {
    // Check ownership
    const project = await this.projectsRepository.findByIdAndUserId(id, userId);
    if (!project) {
      throw new ForbiddenException('You can only delete projects you own');
    }

    await this.projectsRepository.delete(id);
  }

  /**
   * Check if user has access to project
   */
  async checkAccess(projectId: string, userId: string): Promise<boolean> {
    return this.projectsRepository.userHasAccess(projectId, userId);
  }
}
