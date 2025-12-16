/**
 * @fileoverview Collaborators repository for data access.
 */

import { Injectable } from '@nestjs/common';
import { Collaborator } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';

export type CollaboratorRole = 'VIEWER' | 'EDITOR' | 'ADMIN';

@Injectable()
export class CollaboratorsRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find collaborator by project and user
   */
  async findByProjectAndUser(projectId: string, userId: string): Promise<Collaborator | null> {
    return this.prisma.collaborator.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });
  }

  /**
   * Find all collaborators for a project
   */
  async findByProject(projectId: string) {
    return this.prisma.collaborator.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { invitedAt: 'desc' },
    });
  }

  /**
   * Find all projects where user is a collaborator
   */
  async findProjectsByUser(userId: string) {
    return this.prisma.collaborator.findMany({
      where: {
        userId,
        acceptedAt: { not: null },
      },
      include: {
        project: true,
      },
      orderBy: { acceptedAt: 'desc' },
    });
  }

  /**
   * Find pending invitations for a user
   */
  async findPendingInvitations(userId: string) {
    return this.prisma.collaborator.findMany({
      where: {
        userId,
        acceptedAt: null,
      },
      include: {
        project: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { invitedAt: 'desc' },
    });
  }

  /**
   * Create a new collaborator invitation
   */
  async create(
    projectId: string,
    userId: string,
    role: CollaboratorRole,
  ): Promise<Collaborator> {
    return this.prisma.collaborator.create({
      data: {
        projectId,
        userId,
        role,
      },
    });
  }

  /**
   * Accept an invitation
   */
  async accept(id: string): Promise<Collaborator> {
    return this.prisma.collaborator.update({
      where: { id },
      data: { acceptedAt: new Date() },
    });
  }

  /**
   * Update collaborator role
   */
  async updateRole(id: string, role: CollaboratorRole): Promise<Collaborator> {
    return this.prisma.collaborator.update({
      where: { id },
      data: { role },
    });
  }

  /**
   * Remove a collaborator
   */
  async remove(id: string): Promise<Collaborator> {
    return this.prisma.collaborator.delete({
      where: { id },
    });
  }

  /**
   * Find by ID
   */
  async findById(id: string): Promise<Collaborator | null> {
    return this.prisma.collaborator.findUnique({
      where: { id },
      include: {
        project: true,
        user: true,
      },
    });
  }

  /**
   * Check if user has access to project (as owner or collaborator)
   */
  async hasAccess(projectId: string, userId: string): Promise<boolean> {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
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
    });
    return project !== null;
  }

  /**
   * Get user's role for a project
   */
  async getUserRole(projectId: string, userId: string): Promise<CollaboratorRole | 'OWNER' | null> {
    // Check if user is owner
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, userId },
    });
    if (project) return 'OWNER';

    // Check if user is collaborator
    const collaborator = await this.findByProjectAndUser(projectId, userId);
    if (collaborator?.acceptedAt) {
      return collaborator.role as CollaboratorRole;
    }

    return null;
  }
}
