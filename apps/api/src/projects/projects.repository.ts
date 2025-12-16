/**
 * @fileoverview Projects repository implementing data access for Project entity.
 */

import { Injectable } from '@nestjs/common';
import { Project, Prisma } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import {
  IBaseRepository,
  PaginationOptions,
  PaginatedResult,
  calculatePagination,
  calculateSkip,
} from '../common/base.repository';

/**
 * Data transfer object for creating a new project
 */
export interface CreateProjectDto {
  userId: string;
  name: string;
  description?: string;
  additionalContext?: string;
}

/**
 * Data transfer object for updating a project
 */
export interface UpdateProjectDto {
  name?: string;
  description?: string;
  additionalContext?: string;
}

/**
 * Filter options for finding projects
 */
export interface ProjectFilterOptions extends PaginationOptions {
  userId?: string;
  includeDeleted?: boolean;
  search?: string;
}

@Injectable()
export class ProjectsRepository implements IBaseRepository<Project, CreateProjectDto, UpdateProjectDto> {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find a project by ID
   */
  async findById(id: string): Promise<Project | null> {
    return this.prisma.project.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  /**
   * Find a project by ID with owner check
   */
  async findByIdAndUserId(id: string, userId: string): Promise<Project | null> {
    return this.prisma.project.findFirst({
      where: {
        id,
        userId,
        deletedAt: null,
      },
    });
  }

  /**
   * Find all projects for a user with pagination
   */
  async findAll(options: ProjectFilterOptions = {}): Promise<PaginatedResult<Project>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      userId,
      includeDeleted = false,
      search,
    } = options;

    const where: Prisma.ProjectWhereInput = {
      ...(userId && { userId }),
      ...(includeDeleted ? {} : { deletedAt: null }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        skip: calculateSkip(page, limit),
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: {
              reports: true,
              csvUploads: true,
            },
          },
        },
      }),
      this.prisma.project.count({ where }),
    ]);

    return {
      data,
      meta: calculatePagination(total, page, limit),
    };
  }

  /**
   * Find projects where user is a collaborator
   */
  async findByCollaborator(userId: string, options: PaginationOptions = {}): Promise<PaginatedResult<Project>> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;

    const where: Prisma.ProjectWhereInput = {
      deletedAt: null,
      collaborators: {
        some: {
          userId,
          acceptedAt: { not: null },
        },
      },
    };

    const [data, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        skip: calculateSkip(page, limit),
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.project.count({ where }),
    ]);

    return {
      data,
      meta: calculatePagination(total, page, limit),
    };
  }

  /**
   * Create a new project
   */
  async create(data: CreateProjectDto): Promise<Project> {
    return this.prisma.project.create({
      data: {
        userId: data.userId,
        name: data.name,
        description: data.description,
        additionalContext: data.additionalContext,
      },
    });
  }

  /**
   * Update an existing project
   */
  async update(id: string, data: UpdateProjectDto): Promise<Project> {
    return this.prisma.project.update({
      where: { id },
      data,
    });
  }

  /**
   * Soft delete a project
   */
  async delete(id: string): Promise<Project> {
    return this.prisma.project.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  /**
   * Hard delete a project (for cleanup)
   */
  async hardDelete(id: string): Promise<Project> {
    return this.prisma.project.delete({
      where: { id },
    });
  }

  /**
   * Check if a project exists by ID
   */
  async exists(id: string): Promise<boolean> {
    const project = await this.prisma.project.findUnique({
      where: { id },
      select: { id: true },
    });
    return project !== null;
  }

  /**
   * Check if user has access to project (owner or collaborator)
   */
  async userHasAccess(projectId: string, userId: string): Promise<boolean> {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        deletedAt: null,
        OR: [
          { userId },
          {
            collaborators: {
              some: {
                userId,
                acceptedAt: { not: null },
              },
            },
          },
        ],
      },
      select: { id: true },
    });
    return project !== null;
  }

  /**
   * Get project with related data
   */
  async findByIdWithRelations(id: string) {
    return this.prisma.project.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        reports: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        csvUploads: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        collaborators: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            reports: true,
            csvUploads: true,
            topics: true,
            comments: true,
          },
        },
      },
    });
  }
}
