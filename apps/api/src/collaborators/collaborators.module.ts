/**
 * @fileoverview Collaborators module for project sharing functionality.
 */

import { Module } from '@nestjs/common';
import { CollaboratorsService } from './collaborators.service';
import { CollaboratorsController } from './collaborators.controller';
import { CollaboratorsRepository } from './collaborators.repository';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [CollaboratorsController],
  providers: [CollaboratorsService, CollaboratorsRepository],
  exports: [CollaboratorsService, CollaboratorsRepository],
})
export class CollaboratorsModule {}
