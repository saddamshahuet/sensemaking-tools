/**
 * @fileoverview Collaborators service for project sharing functionality.
 */

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { CollaboratorsRepository, CollaboratorRole } from './collaborators.repository';
import { UsersRepository } from '../users/users.repository';

@Injectable()
export class CollaboratorsService {
  constructor(
    private readonly collaboratorsRepository: CollaboratorsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  /**
   * Invite a user to collaborate on a project
   */
  async invite(
    projectId: string,
    inviterUserId: string,
    inviteeEmail: string,
    role: CollaboratorRole,
  ) {
    // Check if inviter has permission to invite (must be owner or admin)
    const inviterRole = await this.collaboratorsRepository.getUserRole(projectId, inviterUserId);
    if (!inviterRole || (inviterRole !== 'OWNER' && inviterRole !== 'ADMIN')) {
      throw new ForbiddenException('Only project owners and admins can invite collaborators');
    }

    // Find the user to invite by email
    const invitee = await this.usersRepository.findByEmail(inviteeEmail);
    if (!invitee) {
      throw new NotFoundException('User not found with this email');
    }

    // Check if user is already a collaborator
    const existing = await this.collaboratorsRepository.findByProjectAndUser(projectId, invitee.id);
    if (existing) {
      throw new ConflictException('User is already a collaborator on this project');
    }

    // Check if trying to invite themselves
    if (invitee.id === inviterUserId) {
      throw new BadRequestException('You cannot invite yourself');
    }

    // Create the invitation
    return this.collaboratorsRepository.create(projectId, invitee.id, role);
  }

  /**
   * Accept a collaboration invitation
   */
  async accept(collaboratorId: string, userId: string) {
    const collaborator = await this.collaboratorsRepository.findById(collaboratorId);
    if (!collaborator) {
      throw new NotFoundException('Invitation not found');
    }

    if (collaborator.userId !== userId) {
      throw new ForbiddenException('This invitation is not for you');
    }

    if (collaborator.acceptedAt) {
      throw new ConflictException('Invitation already accepted');
    }

    return this.collaboratorsRepository.accept(collaboratorId);
  }

  /**
   * Decline a collaboration invitation
   */
  async decline(collaboratorId: string, userId: string) {
    const collaborator = await this.collaboratorsRepository.findById(collaboratorId);
    if (!collaborator) {
      throw new NotFoundException('Invitation not found');
    }

    if (collaborator.userId !== userId) {
      throw new ForbiddenException('This invitation is not for you');
    }

    await this.collaboratorsRepository.remove(collaboratorId);
  }

  /**
   * Get all collaborators for a project
   */
  async getProjectCollaborators(projectId: string, userId: string) {
    // Check if user has access to project
    const hasAccess = await this.collaboratorsRepository.hasAccess(projectId, userId);
    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return this.collaboratorsRepository.findByProject(projectId);
  }

  /**
   * Get pending invitations for current user
   */
  async getPendingInvitations(userId: string) {
    return this.collaboratorsRepository.findPendingInvitations(userId);
  }

  /**
   * Update collaborator role
   */
  async updateRole(
    collaboratorId: string,
    userId: string,
    newRole: CollaboratorRole,
  ) {
    const collaborator = await this.collaboratorsRepository.findById(collaboratorId);
    if (!collaborator) {
      throw new NotFoundException('Collaborator not found');
    }

    // Check if user is owner or admin of the project
    const userRole = await this.collaboratorsRepository.getUserRole(
      collaborator.projectId,
      userId,
    );
    if (!userRole || (userRole !== 'OWNER' && userRole !== 'ADMIN')) {
      throw new ForbiddenException('Only project owners and admins can update roles');
    }

    // Cannot change role if user is an admin changing another admin (only owner can)
    if (userRole === 'ADMIN' && collaborator.role === 'ADMIN') {
      throw new ForbiddenException('Only the project owner can change admin roles');
    }

    return this.collaboratorsRepository.updateRole(collaboratorId, newRole);
  }

  /**
   * Remove a collaborator from project
   */
  async remove(collaboratorId: string, userId: string) {
    const collaborator = await this.collaboratorsRepository.findById(collaboratorId);
    if (!collaborator) {
      throw new NotFoundException('Collaborator not found');
    }

    // User can remove themselves, or owner/admin can remove others
    if (collaborator.userId === userId) {
      // User is leaving the project
      await this.collaboratorsRepository.remove(collaboratorId);
      return;
    }

    // Check if user is owner or admin of the project
    const userRole = await this.collaboratorsRepository.getUserRole(
      collaborator.projectId,
      userId,
    );
    if (!userRole || (userRole !== 'OWNER' && userRole !== 'ADMIN')) {
      throw new ForbiddenException('Only project owners and admins can remove collaborators');
    }

    // Admin cannot remove other admins
    if (userRole === 'ADMIN' && collaborator.role === 'ADMIN') {
      throw new ForbiddenException('Only the project owner can remove admins');
    }

    await this.collaboratorsRepository.remove(collaboratorId);
  }
}
