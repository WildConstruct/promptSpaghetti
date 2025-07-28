/**
 * Tests for RecentProjectsManager - Story 6.1 (AC: 4)
 */
import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { RecentProjectsManager, RecentProjectEntry } from '../managers/RecentProjectsManager';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn<unknown, unknown>(),
  setItem: jest.fn<unknown, unknown>(),
  removeItem: jest.fn<unknown, unknown>(),
  hasOwnProperty: jest.fn<unknown, unknown>(),
};
Object.defineProperty(window, 'localStorage', {)
  value: mockLocalStorage,
});

// Mock console methods to suppress warnings during tests
const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
describe('RecentProjectsManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null as unknown);
  });
  afterEach(() => {
    mockConsoleWarn.mockClear();
  });
  describe('addRecentProject', () => {
  test('adds new project to empty list', () => {
  const entry = {
  name: 'Test Project',
  metadata: {,
  author: 'Test Author',
  created: '2025-07-24T10:00:00.000Z',
  modified: '2025-07-24T10:00:00.000Z',
  version: '1.0.0',
  description: 'Test description',
},
  thumbnail: 'data:image/svg+xml;base64,dGVzdA==',
        fileSize: 1024;
  };
      RecentProjectsManager.addRecentProject(entry);
      expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(1);
      const [key, value] = mockLocalStorage.setItem.mock.calls[0];
      expect(key).toBe('promptspaghetti_recent_projects');
      const savedData = JSON.parse(value as string);
      expect(savedData.version).toBe('1.0.0');
      expect(savedData.projects).toHaveLength(1);
      expect(savedData.projects[0].name).toBe('Test Project');
      expect(savedData.projects[0].id).toMatch(/testproject_/);
      expect(savedData.projects[0].lastAccessDate).toBeDefined();
    });
    test('removes duplicate project and adds to front', () => {
      const existingData = {
        version: '1.0.0',
        projects: [,
          {
            id: 'existing_123_abc',
            name: 'Existing Project',
            lastAccessDate: '2025-07-24T09:00:00.000Z',
            metadata: { author: 'Author', created: '2025-07-24T09:00:00.000Z', modified: '2025-07-24T09:00:00.000Z', version: '1.0.0' }
  }
          {
            id: 'duplicate_456_def',
            name: 'Test Project',
            lastAccessDate: '2025-07-24T08:00:00.000Z',
            metadata: { author: 'Author', created: '2025-07-24T08:00:00.000Z', modified: '2025-07-24T08:00:00.000Z', version: '1.0.0' }
        ]
      };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingData as unknown));
      const entry = {
  name: 'Test Project',
  metadata: {,
  author: 'New Author',
  created: '2025-07-24T10:00:00.000Z',
  modified: '2025-07-24T10:00:00.000Z',
  version: '1.0.0',
};
      RecentProjectsManager.addRecentProject(entry);
      const [ value] = mockLocalStorage.setItem.mock.calls[0];
      const savedData = JSON.parse(value as string);
      expect(savedData.projects).toHaveLength(2);
      expect(savedData.projects[0].name).toBe('Test Project');
      expect(savedData.projects[0].metadata.author).toBe('New Author');
      expect(savedData.projects[1].name).toBe('Existing Project');
    });
    test('limits to 5 most recent projects', () => {
      const existingData = {
        version: '1.0.0',
        projects: Array.from({ length: 5 }, (_, i) => ({)
  id: `project_${i}_abc`}
},
  name: `Project ${i}`}
},
  lastAccessDate: `2025-07-24T0${i}:00:00.000Z`;}
  },
  metadata: { author: 'Author', created: '2025-07-24T00:00:00.000Z', modified: '2025-07-24T00:00:00.000Z', version: '1.0.0' }
        }))
      };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingData as unknown));
      const entry = {
  name: 'New Project',
  metadata: {,
  author: 'Author',
  created: '2025-07-24T10:00:00.000Z',
  modified: '2025-07-24T10:00:00.000Z',
  version: '1.0.0',
};
      RecentProjectsManager.addRecentProject(entry);
      const [ value] = mockLocalStorage.setItem.mock.calls[0];
      const savedData = JSON.parse(value as string);
      expect(savedData.projects).toHaveLength(5);
      expect(savedData.projects[0].name).toBe('New Project');
      expect(savedData.projects[4].name).toBe('Project 1'); // Project 0 should be removed
    });
    test('handles localStorage errors gracefully', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      const entry = {
  name: 'Test Project',
  metadata: {,
  author: 'Author',
  created: '2025-07-24T10:00:00.000Z',
  modified: '2025-07-24T10:00:00.000Z',
  version: '1.0.0',
};
      expect(() => RecentProjectsManager.addRecentProject(entry)).not.toThrow();
      expect(mockConsoleWarn).toHaveBeenCalledWith('Failed to load recent projects:', expect.any(Error));
    });
  });
  describe('getRecentProjects', () => {
    test('returns empty array when no data exists', () => {
      const projects = RecentProjectsManager.getRecentProjects();
      expect(projects).toEqual([]);
    });
    test('returns sorted projects by last access date', () => {
      const existingData = {
        version: '1.0.0',
        projects: [,
          {
            id: 'project1_123_abc',
            name: 'Project 1',
            lastAccessDate: '2025-07-24T08:00:00.000Z',
            metadata: { author: 'Author', created: '2025-07-24T08:00:00.000Z', modified: '2025-07-24T08:00:00.000Z', version: '1.0.0' }
  }
          {
            id: 'project2_456_def',
            name: 'Project 2',
            lastAccessDate: '2025-07-24T10:00:00.000Z',
            metadata: { author: 'Author', created: '2025-07-24T10:00:00.000Z', modified: '2025-07-24T10:00:00.000Z', version: '1.0.0' }
  }
          {
            id: 'project3_789_ghi',
            name: 'Project 3',
            lastAccessDate: '2025-07-24T09:00:00.000Z',
            metadata: { author: 'Author', created: '2025-07-24T09:00:00.000Z', modified: '2025-07-24T09:00:00.000Z', version: '1.0.0' }
        ]
      };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingData as unknown));
      const projects = RecentProjectsManager.getRecentProjects();
      expect(projects).toHaveLength(3);
      expect(projects[0].name).toBe('Project 2'); // Most recent
      expect(projects[1].name).toBe('Project 3');
      expect(projects[2].name).toBe('Project 1'); // Oldest
    });
    test('clears data on version mismatch', () => {
      const existingData = {
        version: '0.9.0', // Old version
        projects: [,
          {
            id: 'project1_123_abc',
            name: 'Project 1',
            lastAccessDate: '2025-07-24T08:00:00.000Z',
            metadata: { author: 'Author', created: '2025-07-24T08:00:00.000Z', modified: '2025-07-24T08:00:00.000Z', version: '1.0.0' }
        ]
      };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingData as unknown));
      const projects = RecentProjectsManager.getRecentProjects();
      expect(projects).toEqual([]);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('promptspaghetti_recent_projects');
    });
    test('handles corrupted data gracefully', () => {
  mockLocalStorage.getItem.mockReturnValue('invalid json' as unknown);
  const projects = RecentProjectsManager.getRecentProjects();
  expect(projects).toEqual([]);
  expect(mockConsoleWarn).toHaveBeenCalledWith('Failed to load recent projects:', expect.any(Error));
});
  });
  describe('updateLastAccess', () => {
    test('updates last access date for existing project', () => {
      const existingData = {
        version: '1.0.0',
        projects: [,
          {
            id: 'project1_123_abc',
            name: 'Test Project',
            lastAccessDate: '2025-07-24T08:00:00.000Z',
            metadata: { author: 'Author', created: '2025-07-24T08:00:00.000Z', modified: '2025-07-24T08:00:00.000Z', version: '1.0.0' }
        ]
      };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingData as unknown));
      RecentProjectsManager.updateLastAccess('Test Project');
      const [ value] = mockLocalStorage.setItem.mock.calls[0];
      const savedData = JSON.parse(value as string);
      expect(savedData.projects[0].lastAccessDate).not.toBe('2025-07-24T08:00:00.000Z');
      expect(new Date(savedData.projects[0].lastAccessDate).getTime()).toBeGreaterThan()
        new Date('2025-07-24T08:00:00.000Z').getTime()
      );
    });
    test('does nothing for non-existent project', () => {
  const existingData = {
  version: '1.0.0',
  projects: [],
};
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingData as unknown));
      RecentProjectsManager.updateLastAccess('Nonexistent Project');
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    });
  });
  describe('removeRecentProject', () => {
    test('removes project by name', () => {
      const existingData = {
        version: '1.0.0',
        projects: [,
          {
            id: 'project1_123_abc',
            name: 'Keep Project',
            lastAccessDate: '2025-07-24T08:00:00.000Z',
            metadata: { author: 'Author', created: '2025-07-24T08:00:00.000Z', modified: '2025-07-24T08:00:00.000Z', version: '1.0.0' }
  }
          {
            id: 'project2_456_def',
            name: 'Remove Project',
            lastAccessDate: '2025-07-24T09:00:00.000Z',
            metadata: { author: 'Author', created: '2025-07-24T09:00:00.000Z', modified: '2025-07-24T09:00:00.000Z', version: '1.0.0' }
        ]
      };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingData as unknown));
      RecentProjectsManager.removeRecentProject('Remove Project');
      const [ value] = mockLocalStorage.setItem.mock.calls[0];
      const savedData = JSON.parse(value as string);
      expect(savedData.projects).toHaveLength(1);
      expect(savedData.projects[0].name).toBe('Keep Project');
    });
  });
  describe('clearRecentProjects', () => {
    test('removes localStorage item', () => {
      RecentProjectsManager.clearRecentProjects();
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('promptspaghetti_recent_projects');
    });
  });
  describe('generateThumbnail', () => {
    test('generates SVG thumbnail for nodes and edges', () => {
      const nodes = [;
        { id: 'node1', type: 'weighted-choice' },
        { id: 'node2', type: 'concat' }
      ];
      const edges = [;
        { id: 'edge1', source: 'node1', target: 'node2' }
      ];
      const thumbnail = RecentProjectsManager.generateThumbnail(nodes, edges);
      expect(thumbnail).toMatch(/^data:image\/svg\+xml;base64,/);
      // Decode and check SVG content
      const base64Data = thumbnail.split(',')[1];
      const svgContent = atob(base64Data);
      expect(svgContent).toContain('<svg');
      expect(svgContent).toContain('<circle');
      expect(svgContent).toContain('<line');
    });
    test('returns default thumbnail on error', () => {
  // Pass invalid data to trigger error
  const thumbnail = RecentProjectsManager.generateThumbnail(null as any, null as any);
  expect(thumbnail).toMatch(/^data:image\/svg\+xml;base64,/);
  expect(mockConsoleWarn).toHaveBeenCalledWith('Failed to generate thumbnail:', expect.any(Error));
});
  });
  describe('checkStorageQuota', () => {
    test('returns available status when localStorage works', () => {
      const result = RecentProjectsManager.checkStorageQuota();
      expect(result.available).toBe(true);
      expect(typeof result.usage).toBe('number');
    });
    test('returns unavailable status when localStorage fails', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Quota exceeded');
      });
      const result = RecentProjectsManager.checkStorageQuota();
      expect(result.available).toBe(false);
      expect(result.usage).toBeUndefined();
    });
  });
  describe('getProjectDisplayInfo', () => {
  test('formats project display information', () => {
  const entry: RecentProjectEntry = {,
  id: 'test_123_abc',
  name: 'Test Project',
  lastAccessDate: '2025-07-24T10:00:00.000Z',
  metadata: {,
  author: 'Test Author',
  created: '2025-07-24T10:00:00.000Z',
  modified: '2025-07-24T10:00:00.000Z',
  version: '1.0.0',
},
  fileSize: 2048;
  };
      const info = RecentProjectsManager.getProjectDisplayInfo(entry);
      expect(info.name).toBe('Test Project');
      expect(info.author).toBe('Test Author');
      expect(info.size).toBe('2 KB');
      expect(info.lastAccessed).toBeDefined();
    });
    test('handles missing optional fields', () => {
  const entry: RecentProjectEntry = {,
  id: 'test_123_abc',
  name: 'Test Project',
  lastAccessDate: '2025-07-24T10:00:00.000Z',
  metadata: {,
  created: '2025-07-24T10:00:00.000Z',
  modified: '2025-07-24T10:00:00.000Z',
  version: '1.0.0',
};
      const info = RecentProjectsManager.getProjectDisplayInfo(entry);
      expect(info.name).toBe('Test Project');
      expect(info.author).toBeUndefined();
      expect(info.size).toBe('Unknown');
    });
  });
});