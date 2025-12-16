/**
 * @fileoverview API Keys repository for data access.
 */

import { Injectable } from '@nestjs/common';
import { ApiKey } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class ApiKeysRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generate a new API key
   */
  generateApiKey(): { key: string; hash: string } {
    const key = `sk_${crypto.randomBytes(32).toString('hex')}`;
    const hash = crypto.createHash('sha256').update(key).digest('hex');
    return { key, hash };
  }

  /**
   * Find API key by hash
   */
  async findByHash(keyHash: string): Promise<ApiKey | null> {
    return this.prisma.apiKey.findFirst({
      where: {
        keyHash,
        revokedAt: null,
      },
    });
  }

  /**
   * Find all API keys for a user
   */
  async findByUserId(userId: string): Promise<ApiKey[]> {
    return this.prisma.apiKey.findMany({
      where: {
        userId,
        revokedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Create a new API key
   */
  async create(userId: string, name: string, keyHash: string): Promise<ApiKey> {
    return this.prisma.apiKey.create({
      data: {
        userId,
        name,
        keyHash,
      },
    });
  }

  /**
   * Update last used timestamp
   */
  async updateLastUsed(id: string): Promise<void> {
    await this.prisma.apiKey.update({
      where: { id },
      data: { lastUsedAt: new Date() },
    });
  }

  /**
   * Revoke an API key
   */
  async revoke(id: string): Promise<ApiKey> {
    return this.prisma.apiKey.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }

  /**
   * Delete an API key
   */
  async delete(id: string): Promise<ApiKey> {
    return this.prisma.apiKey.delete({
      where: { id },
    });
  }

  /**
   * Find by ID
   */
  async findById(id: string): Promise<ApiKey | null> {
    return this.prisma.apiKey.findUnique({
      where: { id },
    });
  }

  /**
   * Validate API key and get user
   */
  async validateAndGetUser(apiKey: string) {
    const hash = crypto.createHash('sha256').update(apiKey).digest('hex');
    const key = await this.findByHash(hash);
    
    if (!key) {
      return null;
    }

    // Update last used
    await this.updateLastUsed(key.id);

    return this.prisma.user.findUnique({
      where: { id: key.userId },
    });
  }
}
