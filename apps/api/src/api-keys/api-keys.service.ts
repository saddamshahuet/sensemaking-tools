/**
 * @fileoverview API Keys service for managing external API access.
 */

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ApiKeysRepository } from './api-keys.repository';

@Injectable()
export class ApiKeysService {
  constructor(private readonly apiKeysRepository: ApiKeysRepository) {}

  /**
   * Create a new API key
   * Returns the plain key only once - it cannot be retrieved again
   */
  async create(userId: string, name: string) {
    const { key, hash } = this.apiKeysRepository.generateApiKey();
    const apiKey = await this.apiKeysRepository.create(userId, name, hash);

    return {
      id: apiKey.id,
      name: apiKey.name,
      key, // This is the only time the plain key is returned
      createdAt: apiKey.createdAt,
    };
  }

  /**
   * Get all API keys for a user (without the actual key values)
   */
  async findAllForUser(userId: string) {
    const keys = await this.apiKeysRepository.findByUserId(userId);
    return keys.map((key) => ({
      id: key.id,
      name: key.name,
      lastUsedAt: key.lastUsedAt,
      createdAt: key.createdAt,
      // Mask the key - only show first 7 chars (sk_xxx...)
      keyPreview: `sk_${'*'.repeat(32)}`,
    }));
  }

  /**
   * Revoke an API key
   */
  async revoke(id: string, userId: string): Promise<void> {
    const key = await this.apiKeysRepository.findById(id);
    if (!key) {
      throw new NotFoundException('API key not found');
    }
    if (key.userId !== userId) {
      throw new ForbiddenException('You can only revoke your own API keys');
    }

    await this.apiKeysRepository.revoke(id);
  }

  /**
   * Delete an API key
   */
  async delete(id: string, userId: string): Promise<void> {
    const key = await this.apiKeysRepository.findById(id);
    if (!key) {
      throw new NotFoundException('API key not found');
    }
    if (key.userId !== userId) {
      throw new ForbiddenException('You can only delete your own API keys');
    }

    await this.apiKeysRepository.delete(id);
  }

  /**
   * Validate an API key and return the associated user
   */
  async validateApiKey(apiKey: string) {
    return this.apiKeysRepository.validateAndGetUser(apiKey);
  }
}
