/**
 * @fileoverview Collaborator DTOs for request validation.
 */

import { IsEmail, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum CollaboratorRole {
  VIEWER = 'VIEWER',
  EDITOR = 'EDITOR',
  ADMIN = 'ADMIN',
}

export class InviteCollaboratorDto {
  @ApiProperty({ description: 'Email of the user to invite', example: 'collaborator@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Role to assign', enum: CollaboratorRole, example: 'EDITOR' })
  @IsEnum(CollaboratorRole)
  role: CollaboratorRole;
}

export class UpdateRoleDto {
  @ApiProperty({ description: 'New role to assign', enum: CollaboratorRole })
  @IsEnum(CollaboratorRole)
  role: CollaboratorRole;
}
