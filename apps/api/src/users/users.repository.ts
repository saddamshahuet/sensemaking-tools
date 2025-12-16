/**
 * @fileoverview Users repository implementing data access for User entity.
 * Follows the repository pattern for clean separation of concerns.
 */

import { Injectable } from '@nestjs/common';
import { User, Prisma } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import {
  IBaseRepository,
  PaginationOptions,
  PaginatedResult,
  calculatePagination,
  calculateSkip,
} from '../common/base.repository';

/**
 * Data transfer object for creating a new user
 */
export interface CreateUserDto {
  email: string;
  name: string;
  passwordHash: string;
}

/**
 * Data transfer object for updating a user
 */
export interface UpdateUserDto {
  email?: string;
  name?: string;
  passwordHash?: string;
}

/**
 * User type without sensitive data
 */
export type SafeUser = Omit<User, 'passwordHash'>;

@Injectable()
export class UsersRepository implements IBaseRepository<User, CreateUserDto, UpdateUserDto> {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find a user by ID
   */
  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Find a user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Find all users with pagination
   */
  async findAll(options: PaginationOptions = {}): Promise<PaginatedResult<User>> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        skip: calculateSkip(page, limit),
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.user.count(),
    ]);

    return {
      data,
      meta: calculatePagination(total, page, limit),
    };
  }

  /**
   * Create a new user
   */
  async create(data: CreateUserDto): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash: data.passwordHash,
      },
    });
  }

  /**
   * Update an existing user
   */
  async update(id: string, data: UpdateUserDto): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a user by ID
   */
  async delete(id: string): Promise<User> {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  /**
   * Check if a user exists by ID
   */
  async exists(id: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });
    return user !== null;
  }

  /**
   * Check if an email is already taken
   */
  async emailExists(email: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    return user !== null;
  }

  /**
   * Get user without sensitive password hash
   */
  async findByIdSafe(id: string): Promise<SafeUser | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
