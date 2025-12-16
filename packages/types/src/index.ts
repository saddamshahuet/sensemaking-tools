/**
 * @fileoverview Shared types for the Sensemaker application.
 * This module provides TypeScript interfaces and types used across
 * the frontend, backend, and worker components.
 */

// Re-export core sensemaker types from the library
// These will be used throughout the application

/**
 * User entity for authentication and authorization
 */
export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User creation data transfer object
 */
export interface CreateUserDto {
  email: string;
  name: string;
  password: string;
}

/**
 * User login data transfer object
 */
export interface LoginDto {
  email: string;
  password: string;
}

/**
 * Authentication response containing JWT tokens
 */
export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: Omit<User, 'passwordHash'>;
}

/**
 * Project entity representing a collection of reports
 */
export interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string;
  additionalContext?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Project creation data transfer object
 */
export interface CreateProjectDto {
  name: string;
  description?: string;
  additionalContext?: string;
}

/**
 * Project update data transfer object
 */
export interface UpdateProjectDto {
  name?: string;
  description?: string;
  additionalContext?: string;
}

/**
 * Processing job status enumeration
 */
export enum JobStatus {
  QUEUED = 'QUEUED',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

/**
 * Processing job stages
 */
export enum JobStage {
  PARSING_CSV = 'PARSING_CSV',
  LEARNING_TOPICS = 'LEARNING_TOPICS',
  CATEGORIZING_COMMENTS = 'CATEGORIZING_COMMENTS',
  GENERATING_SUMMARY = 'GENERATING_SUMMARY',
  COMPLETE = 'COMPLETE',
}

/**
 * Report entity representing an analyzed CSV
 */
export interface Report {
  id: string;
  projectId: string;
  name: string;
  status: JobStatus;
  csvFileUrl?: string;
  outputJson?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Report creation data transfer object
 */
export interface CreateReportDto {
  projectId: string;
  name: string;
}

/**
 * Processing job entity
 */
export interface ProcessingJob {
  id: string;
  reportId: string;
  status: JobStatus;
  stage?: JobStage;
  progress: number;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
}

/**
 * Job progress update payload
 */
export interface JobProgressUpdate {
  jobId: string;
  status: JobStatus;
  stage: JobStage;
  progress: number;
  message?: string;
}

/**
 * CSV upload entity
 */
export interface CsvUpload {
  id: string;
  projectId: string;
  filename: string;
  originalFilename: string;
  s3Key: string;
  rowCount: number;
  fileSize: number;
  status: 'PENDING' | 'VALIDATED' | 'INVALID';
  validationError?: string;
  createdAt: Date;
}

/**
 * Collaborator role enumeration
 */
export enum CollaboratorRole {
  VIEWER = 'VIEWER',
  EDITOR = 'EDITOR',
  ADMIN = 'ADMIN',
}

/**
 * Collaborator entity
 */
export interface Collaborator {
  id: string;
  projectId: string;
  userId: string;
  role: CollaboratorRole;
  invitedAt: Date;
  acceptedAt?: Date;
}

/**
 * API key entity
 */
export interface ApiKey {
  id: string;
  userId: string;
  name: string;
  keyHash: string;
  lastUsedAt?: Date;
  createdAt: Date;
}

/**
 * Create API key data transfer object
 */
export interface CreateApiKeyDto {
  name: string;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * API error response
 */
export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
  details?: Record<string, unknown>;
}

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
}
