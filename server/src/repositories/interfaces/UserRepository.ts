import { User, UserId, CreateUserRequest } from '../../types';

/**
 * Repository interface for user management and authentication integration
 */
}
}
export interface UserRepository {
  /**
   * Create a new user
   */
  create(user: CreateUserRequest): Promise<User>;

  /**
   * Find user by ID
   */
  findById(id: UserId): Promise<User | null>;

  /**
   * Find user by email address
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Update user information
   */
  update(id: UserId, updates: Partial<User>): Promise<User>;

  /**
   * Delete a user (soft delete recommended)
   */
  delete(id: UserId): Promise<boolean>;

  /**
   * Check if user exists
   */
  exists(id: UserId): Promise<boolean>;

  /**
   * Authenticate user credentials
   */
  authenticate(email: string, password: string): Promise<User | null>;

  /**
   * Update user password with proper hashing
   */
  updatePassword(id: UserId, newPassword: string): Promise<boolean>;

  /**
   * Get users by organization (if applicable)
   */
  findByOrganization(organizationId: string): Promise<User[]>;

  /**
   * Get user statistics for analytics
   */
  getUserStats(id: UserId): Promise<UserStats>;
}
}
}

/**
 * User statistics for analytics
 */
}
}
export interface UserStats {
  totalGraphs: number;
  totalExecutions: number;
  lastLoginAt: Date | null;
  accountCreatedAt: Date;
}
}
}