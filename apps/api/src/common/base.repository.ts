/**
 * @fileoverview Base repository interface defining common CRUD operations.
 * This follows the repository pattern for clean data access abstraction.
 */

/**
 * Generic interface for pagination parameters
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Generic interface for paginated results
 */
export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Base repository interface with common CRUD operations.
 * Implementations should extend this for specific entity repositories.
 */
export interface IBaseRepository<T, CreateDto, UpdateDto> {
  /**
   * Find a single entity by ID
   */
  findById(id: string): Promise<T | null>;

  /**
   * Find all entities with optional pagination
   */
  findAll(options?: PaginationOptions): Promise<PaginatedResult<T>>;

  /**
   * Create a new entity
   */
  create(data: CreateDto): Promise<T>;

  /**
   * Update an existing entity
   */
  update(id: string, data: UpdateDto): Promise<T>;

  /**
   * Delete an entity by ID
   */
  delete(id: string): Promise<T>;

  /**
   * Check if an entity exists by ID
   */
  exists(id: string): Promise<boolean>;
}

/**
 * Helper function to calculate pagination metadata
 */
export function calculatePagination(
  total: number,
  page: number = 1,
  limit: number = 10,
): PaginatedResult<never>['meta'] {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Helper function to calculate skip offset for Prisma queries
 */
export function calculateSkip(page: number = 1, limit: number = 10): number {
  return (page - 1) * limit;
}
