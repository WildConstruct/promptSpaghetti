// Basic type definitions for repository interfaces

export type GraphId = string;
export type UserId = string;

/**
 * Graph entity structure
 */
}
}
export interface Graph {
  id: GraphId;
  name: string;
  userId: UserId;
  data: unknown; // JSON graph data
  version: number;
  createdAt: Date;
  updatedAt: Date;
}
}
}

/**
 * User entity structure
 */
}
}
export interface User {
  id: UserId;
  email: string;
  name: string;
  passwordHash?: string;
  organizationId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}
}
}

/**
 * Create user request
 */
}
}
export interface CreateUserRequest {
  email: string;
  name: string;
  password: string;
  organizationId?: string;
}
}
}