/**
 * @fileoverview Authentication service handling login, registration, and JWT.
 */

import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { SafeUser } from '../users/users.repository';

export interface JwtPayload {
  sub: string;
  email: string;
}

export interface AuthResponse {
  accessToken: string;
  user: SafeUser;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Register a new user
   */
  async register(email: string, name: string, password: string): Promise<AuthResponse> {
    // Create user (service handles duplicate email check)
    const user = await this.usersService.create(email, name, password);

    // Generate JWT token
    const accessToken = this.generateToken(user);

    return {
      accessToken,
      user,
    };
  }

  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    const user = await this.usersService.validateCredentials(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const accessToken = this.generateToken(user);

    return {
      accessToken,
      user,
    };
  }

  /**
   * Validate user for Passport LocalStrategy
   */
  async validateUser(email: string, password: string): Promise<SafeUser | null> {
    return this.usersService.validateCredentials(email, password);
  }

  /**
   * Validate JWT payload and return user
   */
  async validateJwtPayload(payload: JwtPayload): Promise<SafeUser | null> {
    try {
      return await this.usersService.findById(payload.sub);
    } catch {
      return null;
    }
  }

  /**
   * Generate JWT token for user
   */
  private generateToken(user: SafeUser): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };
    return this.jwtService.sign(payload);
  }

  /**
   * Refresh JWT token
   */
  async refreshToken(userId: string): Promise<{ accessToken: string }> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const accessToken = this.generateToken(user);
    return { accessToken };
  }
}
