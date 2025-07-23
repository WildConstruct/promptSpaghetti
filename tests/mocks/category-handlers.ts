/**
 * MSW Category Management API Handlers
 * 
 * Mock handlers for category-related endpoints including category management,
 * hierarchical structures, and template categorization.
 */

import { rest } from 'msw';
import { faker } from '@faker-js/faker';

// Mock category database
const mockCategories = new Map<number, unknown>();
const mockCategoryStats = new Map<number, unknown>();

// Initialize with sample categories
const sampleCategories = [
  {
    id: 1,
    name: 'Business',
    slug: 'business',
    description: 'Templates for business communications, proposals, and operations',
    icon: 'briefcase',
    color: '#3B82F6',
    parentId: null,
    sortOrder: 1,
    isActive: true,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date()
  },
  {
    id: 2,
    name: 'Marketing',
    slug: 'marketing',
    description: 'Marketing campaigns, social media, and promotional content',
    icon: 'megaphone',
    color: '#10B981',
    parentId: 1, // Child of Business
    sortOrder: 1,
    isActive: true,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date()
  },
  {
    id: 3,
    name: 'Sales',
    slug: 'sales',
    description: 'Sales pitches, proposals, and customer outreach',
    icon: 'trending-up',
    color: '#F59E0B',
    parentId: 1, // Child of Business
    sortOrder: 2,
    isActive: true,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date()
  },
  {
    id: 4,
    name: 'Development',
    slug: 'development',
    description: 'Code documentation, technical specifications, and development workflows',
    icon: 'code',
    color: '#8B5CF6',
    parentId: null,
    sortOrder: 2,
    isActive: true,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date()
  },
  {
    id: 5,
    name: 'Frontend',
    slug: 'frontend',
    description: 'UI/UX, component documentation, and frontend frameworks',
    icon: 'monitor',
    color: '#06B6D4',
    parentId: 4, // Child of Development
    sortOrder: 1,
    isActive: true,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date()
  },
  {
    id: 6,
    name: 'Backend',
    slug: 'backend',
    description: 'API documentation, database schemas, and server architecture',
    icon: 'server',
    color: '#DC2626',
    parentId: 4, // Child of Development
    sortOrder: 2,
    isActive: true,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date()
  },
  {
    id: 7,
    name: 'Education',
    slug: 'education',
    description: 'Learning materials, courses, and educational content',
    icon: 'academic-cap',
    color: '#7C3AED',
    parentId: null,
    sortOrder: 3,
    isActive: true,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date()
  },
  {
    id: 8,
    name: 'Personal',
    slug: 'personal',
    description: 'Personal productivity, journaling, and life organization',
    icon: 'user',
    color: '#EC4899',
    parentId: null,
    sortOrder: 4,
    isActive: true,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date()
  }
];

// Populate mock databases
sampleCategories.forEach(category => {
  mockCategories.set(category.id, category);
  mockCategoryStats.set(category.id, {
    categoryId: category.id,
    templateCount: faker.number.int({ min: 0, max: 150 }),
    totalDownloads: faker.number.int({ min: 0, max: 5000 }),
    averageRating: faker.number.float({ min: 3.0, max: 5.0, fractionDigits: 1 }),
    activeTemplates: faker.number.int({ min: 0, max: 120 }),
    featuredTemplates: faker.number.int({ min: 0, max: 10 }),
    lastUpdated: faker.date.recent({ days: 7 })
  });
});

export     const includeHierarchy = url.searchParams.get('hierarchy') === 'true';
    const includeStats = url.searchParams.get('stats') === 'true';
    const parentId = url.searchParams.get('parentId');
    const isActive = url.searchParams.get('isActive');

    let categories = Array.from(mockCategories.values());

    // Filter by parent ID
    if (parentId !== null) {
      const parentIdNum = parentId === 'null' ? null : parseInt(parentId);
      categories = categories.filter(cat => cat.parentId === parentIdNum);
    }

    // Filter by active status
    if (isActive !== null) {
      const activeFilter = isActive === 'true';
      categories = categories.filter(cat => cat.isActive === activeFilter);
    }

    // Sort by sortOrder, then by name
    categories.sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) {
        return a.sortOrder - b.sortOrder;
      }
      return a.name.localeCompare(b.name);
    });

    // Build hierarchy if requested
    if (includeHierarchy) {
      const categoryMap = new Map();
      const rootCategories = [];

      // First pass: create map and identify root categories
      categories.forEach(cat => {
        const categoryData = { ...cat, children: [] };
        if (includeStats) {
          categoryData.stats = mockCategoryStats.get(cat.id);
        }
        categoryMap.set(cat.id, categoryData);
        
        if (cat.parentId === null) {
          rootCategories.push(categoryData);
        }
      });

      // Second pass: build parent-child relationships
      categories.forEach(cat => {
        if (cat.parentId !== null) {
          const parent = categoryMap.get(cat.parentId);
          const child = categoryMap.get(cat.id);
          if (parent && child) {
            parent.children.push(child);
          }
        }
      });

      return res(
        ctx.status(200),
        ctx.json({
          categories: rootCategories,
          total: categories.length
        })
      );
    }

    // Return flat list
    const responseCategories = categories.map(cat => {
      const categoryData = { ...cat };
      if (includeStats) {
        categoryData.stats = mockCategoryStats.get(cat.id);
      }
      return categoryData;
    });

    return res(
      ctx.status(200),
      ctx.json({
        categories: responseCategories,
        total: responseCategories.length
      })
    );
  }),

  // GET /api/categories/:id - Get specific category
  rest.get('/api/categories/:id', (req, res, ctx) => {
    const { id } = req.params;
    const categoryId = parseInt(id as string);
    const category = mockCategories.get(categoryId);

    if (!category) {
      return res(
        ctx.status(404),
        ctx.json({
          error: 'Not Found',
          message: 'Category not found'
        })
      );
    }

    const url = new URL(req.url);
    const includeStats = url.searchParams.get('stats') === 'true';
    const includeChildren = url.searchParams.get('children') === 'true';

    const responseCategory = { ...category };

    if (includeStats) {
      responseCategory.stats = mockCategoryStats.get(categoryId);
    }

    if (includeChildren) {
      const children = Array.from(mockCategories.values())
        .filter(cat => cat.parentId === categoryId)
        .sort((a, b) => a.sortOrder - b.sortOrder);
      responseCategory.children = children;
    }

    return res(
      ctx.status(200),
      ctx.json({ category: responseCategory })
    );
  }),

  // POST /api/categories - Create new category
  rest.post('/api/categories', async (req, res, ctx) => {
    try {
      const categoryData = await req.json();

      // Validation
      if (!categoryData.name) {
        return res(
          ctx.status(400),
          ctx.json({
            error: 'Validation Error',
            message: 'Category name is required'
          })
        );
      }

      // Check name uniqueness
      const existingCategory = Array.from(mockCategories.values())
        .find(cat => cat.name.toLowerCase() === categoryData.name.toLowerCase());
      
      if (existingCategory) {
        return res(
          ctx.status(409),
          ctx.json({
            error: 'Conflict',
            message: 'Category name already exists'
          })
        );
      }

      // Generate slug from name
      const slug = categoryData.slug || categoryData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Check slug uniqueness
      const existingSlug = Array.from(mockCategories.values())
        .find(cat => cat.slug === slug);
      
      if (existingSlug) {
        return res(
          ctx.status(409),
          ctx.json({
            error: 'Conflict',
            message: 'Category slug already exists'
          })
        );
      }

      // Validate parent category if provided
      if (categoryData.parentId) {
        const parentCategory = mockCategories.get(categoryData.parentId);
        if (!parentCategory) {
          return res(
            ctx.status(400),
            ctx.json({
              error: 'Validation Error',
              message: 'Parent category not found'
            })
          );
        }
      }

      const newCategory = {
        id: mockCategories.size + 1,
        name: categoryData.name,
        slug,
        description: categoryData.description || '',
        icon: categoryData.icon || 'folder',
        color: categoryData.color || '#6B7280',
        parentId: categoryData.parentId || null,
        sortOrder: categoryData.sortOrder || 999,
        isActive: categoryData.isActive !== false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockCategories.set(newCategory.id, newCategory);
      
      // Initialize stats
      mockCategoryStats.set(newCategory.id, {
        categoryId: newCategory.id,
        templateCount: 0,
        totalDownloads: 0,
        averageRating: 0,
        activeTemplates: 0,
        featuredTemplates: 0,
        lastUpdated: new Date()
      });

      return res(
        ctx.status(201),
        ctx.json({
          category: newCategory,
          message: 'Category created successfully'
        })
      );

    } catch {
      return res(
        ctx.status(500),
        ctx.json({
          error: 'Internal Server Error',
          message: 'Category creation failed'
        })
      );
    }
  }),

  // PUT /api/categories/:id - Update category
  rest.put('/api/categories/:id', async (req, res, ctx) => {
    const { id } = req.params;
    const categoryId = parseInt(id as string);
    const category = mockCategories.get(categoryId);

    if (!category) {
      return res(
        ctx.status(404),
        ctx.json({
          error: 'Not Found',
          message: 'Category not found'
        })
      );
    }

    try {
      const updates = await req.json();

      // Check name uniqueness if changed
      if (updates.name && updates.name !== category.name) {
        const existingCategory = Array.from(mockCategories.values())
          .find(cat => cat.name.toLowerCase() === updates.name.toLowerCase() && cat.id !== categoryId);
        
        if (existingCategory) {
          return res(
            ctx.status(409),
            ctx.json({
              error: 'Conflict',
              message: 'Category name already exists'
            })
          );
        }
      }

      // Validate parent category change
      if (updates.parentId !== undefined) {
        if (updates.parentId === categoryId) {
          return res(
            ctx.status(400),
            ctx.json({
              error: 'Validation Error',
              message: 'Category cannot be its own parent'
            })
          );
        }

        if (updates.parentId && !mockCategories.get(updates.parentId)) {
          return res(
            ctx.status(400),
            ctx.json({
              error: 'Validation Error',
              message: 'Parent category not found'
            })
          );
        }

        // Check for circular references
        let currentParentId = updates.parentId;
        while (currentParentId) {
          if (currentParentId === categoryId) {
            return res(
              ctx.status(400),
              ctx.json({
                error: 'Validation Error',
                message: 'Circular parent-child relationship detected'
              })
            );
          }
          const parentCategory = mockCategories.get(currentParentId);
          currentParentId = parentCategory ? parentCategory.parentId : null;
        }
      }

      const updatedCategory = {
        ...category,
        ...updates,
        id: category.id, // Prevent ID changes
        slug: updates.slug || category.slug, // Keep existing slug if not provided
        updatedAt: new Date()
      };

      mockCategories.set(categoryId, updatedCategory);

      return res(
        ctx.status(200),
        ctx.json({
          category: updatedCategory,
          message: 'Category updated successfully'
        })
      );

    } catch {
      return res(
        ctx.status(500),
        ctx.json({
          error: 'Internal Server Error',
          message: 'Category update failed'
        })
      );
    }
  }),

  // DELETE /api/categories/:id - Delete category
  rest.delete('/api/categories/:id', (req, res, ctx) => {
    const { id } = req.params;
    const categoryId = parseInt(id as string);
    const category = mockCategories.get(categoryId);

    if (!category) {
      return res(
        ctx.status(404),
        ctx.json({
          error: 'Not Found',
          message: 'Category not found'
        })
      );
    }

    // Check if category has children
    const hasChildren = Array.from(mockCategories.values())
      .some(cat => cat.parentId === categoryId);

    if (hasChildren) {
      return res(
        ctx.status(400),
        ctx.json({
          error: 'Bad Request',
          message: 'Cannot delete category with child categories'
        })
      );
    }

    // Check if category has templates (mock check)
    const stats = mockCategoryStats.get(categoryId);
    if (stats && stats.templateCount > 0) {
      return res(
        ctx.status(400),
        ctx.json({
          error: 'Bad Request',
          message: 'Cannot delete category with existing templates'
        })
      );
    }

    mockCategories.delete(categoryId);
    mockCategoryStats.delete(categoryId);

    return res(
      ctx.status(200),
      ctx.json({
        message: 'Category deleted successfully'
      })
    );
  }),

  // GET /api/categories/:id/stats - Get category statistics
  rest.get('/api/categories/:id/stats', (req, res, ctx) => {
    const { id } = req.params;
    const categoryId = parseInt(id as string);
    const category = mockCategories.get(categoryId);

    if (!category) {
      return res(
        ctx.status(404),
        ctx.json({
          error: 'Not Found',
          message: 'Category not found'
        })
      );
    }

    const stats = mockCategoryStats.get(categoryId);
    
    return res(
      ctx.status(200),
      ctx.json({ stats })
    );
  }),

  // POST /api/categories/reorder - Reorder categories
  rest.post('/api/categories/reorder', async (req, res, ctx) => {
    try {
      const { categoryOrders } = await req.json();

      if (!Array.isArray(categoryOrders)) {
        return res(
          ctx.status(400),
          ctx.json({
            error: 'Validation Error',
            message: 'Category orders must be an array'
          })
        );
      }

      // Update sort orders
      categoryOrders.forEach(({ id, sortOrder }) => {
        const category = mockCategories.get(id);
        if (category) {
          category.sortOrder = sortOrder;
          category.updatedAt = new Date();
          mockCategories.set(id, category);
        }
      });

      return res(
        ctx.status(200),
        ctx.json({
          message: 'Categories reordered successfully'
        })
      );

    } catch {
      return res(
        ctx.status(500),
        ctx.json({
          error: 'Internal Server Error',
          message: 'Category reordering failed'
        })
      );
    }
  }),

  // GET /api/categories/tree - Get full category tree
  rest.get('/api/categories/tree', (req, res, ctx) => {
    const categories = Array.from(mockCategories.values())
      .filter(cat => cat.isActive);

    const categoryMap = new Map();
    const rootCategories = [];

    // Build category map
    categories.forEach(cat => {
      const categoryData = {
        ...cat,
        children: [],
        stats: mockCategoryStats.get(cat.id)
      };
      categoryMap.set(cat.id, categoryData);
      
      if (cat.parentId === null) {
        rootCategories.push(categoryData);
      }
    });

    // Build parent-child relationships
    categories.forEach(cat => {
      if (cat.parentId !== null) {
        const parent = categoryMap.get(cat.parentId);
        const child = categoryMap.get(cat.id);
        if (parent && child) {
          parent.children.push(child);
        }
      }
    });

    // Sort all levels
    const sortCategories = (cats) => {
      cats.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
      cats.forEach(cat => {
        if (cat.children && cat.children.length > 0) {
          sortCategories(cat.children);
        }
      });
    };

    sortCategories(rootCategories);

    return res(
      ctx.status(200),
      ctx.json({
        tree: rootCategories,
        totalCategories: categories.length
      })
    );
  })
];

// Export function to reset mock data for tests
export function resetCategoryData() {
  mockCategories.clear();
  mockCategoryStats.clear();
  
  sampleCategories.forEach(category => {
    mockCategories.set(category.id, { ...category });
    mockCategoryStats.set(category.id, {
      categoryId: category.id,
      templateCount: faker.number.int({ min: 0, max: 150 }),
      totalDownloads: faker.number.int({ min: 0, max: 5000 }),
      averageRating: faker.number.float({ min: 3.0, max: 5.0, fractionDigits: 1 }),
      activeTemplates: faker.number.int({ min: 0, max: 120 }),
      featuredTemplates: faker.number.int({ min: 0, max: 10 }),
      lastUpdated: faker.date.recent({ days: 7 })
    });
  });
}