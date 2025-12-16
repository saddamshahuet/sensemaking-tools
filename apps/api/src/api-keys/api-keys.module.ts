/**
 * @fileoverview API Keys module for managing external API access.
 */

import { Module } from '@nestjs/common';
import { ApiKeysService } from './api-keys.service';
import { ApiKeysController } from './api-keys.controller';
import { ApiKeysRepository } from './api-keys.repository';

@Module({
  controllers: [ApiKeysController],
  providers: [ApiKeysService, ApiKeysRepository],
  exports: [ApiKeysService, ApiKeysRepository],
})
export class ApiKeysModule {}
