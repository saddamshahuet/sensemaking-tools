/**
 * @fileoverview Users service implementing business logic for user management.
 */

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UsersRepository, CreateUserDto, UpdateUserDto, SafeUser } from './users.repository';

const SALT_ROUNDS = 12;

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  /**
   * Create a new user with hashed password
   */
  async create(email: string, name: string, password: string): Promise<SafeUser> {
    // Check if email is already taken
    const existingUser = await this.usersRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await this.usersRepository.create({
      email,
      name,
      passwordHash,
    });

    // Return user without password hash
    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }

  /**
   * Find a user by ID
   */
  async findById(id: string): Promise<SafeUser> {
    const user = await this.usersRepository.findByIdSafe(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  /**
   * Find a user by email (includes password hash for auth)
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
  }

  /**
   * Update user profile
   */
  async update(id: string, data: { name?: string; email?: string }): Promise<SafeUser> {
    // Check if user exists
    const existingUser = await this.usersRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // If email is being changed, check it's not taken
    if (data.email && data.email !== existingUser.email) {
      const emailTaken = await this.usersRepository.emailExists(data.email);
      if (emailTaken) {
        throw new ConflictException('Email already in use');
      }
    }

    const updatedUser = await this.usersRepository.update(id, data);
    const { passwordHash: _, ...safeUser } = updatedUser;
    return safeUser;
  }

  /**
   * Update user password
   */
  async updatePassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new ConflictException('Current password is incorrect');
    }

    // Hash and update new password
    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await this.usersRepository.update(id, { passwordHash });
  }

  /**
   * Validate user credentials
   */
  async validateCredentials(email: string, password: string): Promise<SafeUser | null> {
    const user = await this.usersRepository.findByEmail(email);
    if (!user) {
      return null;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return null;
    }

    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }

  /**
   * Delete a user
   */
  async delete(id: string): Promise<void> {
    const exists = await this.usersRepository.exists(id);
    if (!exists) {
      throw new NotFoundException('User not found');
    }
    await this.usersRepository.delete(id);
  }
}
