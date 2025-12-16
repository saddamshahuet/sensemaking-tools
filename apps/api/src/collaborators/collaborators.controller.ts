/**
 * @fileoverview Collaborators controller for project sharing.
 */

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CollaboratorsService } from './collaborators.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InviteCollaboratorDto, UpdateRoleDto } from './dto';

@ApiTags('collaborators')
@Controller('collaborators')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CollaboratorsController {
  constructor(private readonly collaboratorsService: CollaboratorsService) {}

  @Post('projects/:projectId/invite')
  @ApiOperation({ summary: 'Invite a user to collaborate on a project' })
  @ApiResponse({ status: 201, description: 'Invitation sent' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 409, description: 'User already a collaborator' })
  async invite(
    @Request() req: { user: { id: string } },
    @Param('projectId') projectId: string,
    @Body() inviteDto: InviteCollaboratorDto,
  ) {
    return this.collaboratorsService.invite(
      projectId,
      req.user.id,
      inviteDto.email,
      inviteDto.role,
    );
  }

  @Get('projects/:projectId')
  @ApiOperation({ summary: 'Get all collaborators for a project' })
  @ApiResponse({ status: 200, description: 'List of collaborators' })
  async getProjectCollaborators(
    @Request() req: { user: { id: string } },
    @Param('projectId') projectId: string,
  ) {
    return this.collaboratorsService.getProjectCollaborators(projectId, req.user.id);
  }

  @Get('invitations')
  @ApiOperation({ summary: 'Get pending invitations for current user' })
  @ApiResponse({ status: 200, description: 'List of pending invitations' })
  async getPendingInvitations(@Request() req: { user: { id: string } }) {
    return this.collaboratorsService.getPendingInvitations(req.user.id);
  }

  @Post(':id/accept')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Accept a collaboration invitation' })
  @ApiResponse({ status: 200, description: 'Invitation accepted' })
  @ApiResponse({ status: 404, description: 'Invitation not found' })
  async accept(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
  ) {
    return this.collaboratorsService.accept(id, req.user.id);
  }

  @Post(':id/decline')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Decline a collaboration invitation' })
  @ApiResponse({ status: 204, description: 'Invitation declined' })
  @ApiResponse({ status: 404, description: 'Invitation not found' })
  async decline(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
  ) {
    await this.collaboratorsService.decline(id, req.user.id);
  }

  @Put(':id/role')
  @ApiOperation({ summary: 'Update collaborator role' })
  @ApiResponse({ status: 200, description: 'Role updated' })
  @ApiResponse({ status: 403, description: 'Not authorized' })
  async updateRole(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.collaboratorsService.updateRole(id, req.user.id, updateRoleDto.role);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a collaborator from project' })
  @ApiResponse({ status: 204, description: 'Collaborator removed' })
  @ApiResponse({ status: 403, description: 'Not authorized' })
  async remove(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
  ) {
    await this.collaboratorsService.remove(id, req.user.id);
  }
}
