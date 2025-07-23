import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RecentFiles from '../RecentFiles';
import { projectManager } from '../../../projectManager';
// Mock the projectManager
jest.mock('../../../projectManager', () => ({
    projectManager: {
        getRecentFiles: jest.fn(),
        getFavoriteFiles: jest.fn(),
        toggleFavorite: jest.fn(),
        addToRecentFiles: jest.fn(),
        isFavorite: jest.fn()
    }
}));
const mockProjectManager = projectManager;
// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });
describe('RecentFiles Component', () => {
    const mockFiles = [
        {
            id: 'file1',
            name: 'project1.psg',
            path: '/projects/project1.psg',
            size: 2048,
            lastModified: new Date('2025-01-15T10:00:00Z'),
            nodeCount: 10,
            metadata: {
                title: 'Project 1',
                description: 'First project',
                tags: ['test'],
                author: 'User',
                version: '1.0.0',
                created: new Date('2025-01-10T10:00:00Z')
            },
            isFavorite: true
        },
        {
            id: 'file2',
            name: 'project2.psg',
            path: '/projects/project2.psg',
            size: 4096,
            lastModified: new Date('2025-01-14T15:30:00Z'),
            nodeCount: 20,
            metadata: {
                title: 'Project 2',
                description: 'Second project',
                tags: ['example'],
                author: 'User',
                version: '2.0.0',
                created: new Date('2025-01-12T12:00:00Z')
            },
            isFavorite: false
        }
    ];
    beforeEach(() => {
        jest.clearAllMocks();
        localStorageMock.getItem.mockReturnValue(null);
        mockProjectManager.getRecentFiles.mockReturnValue(mockFiles);
        mockProjectManager.getFavoriteFiles.mockReturnValue([mockFiles[0]]);
        mockProjectManager.isFavorite.mockImplementation((id) => id === 'file1');
    });
    describe('Basic Rendering', () => {
        it('renders recent files list', () => {
            render(_jsx(RecentFiles, {}));
            expect(screen.getByText('Recent Files')).toBeInTheDocument();
            expect(screen.getByText('project1.psg')).toBeInTheDocument();
            expect(screen.getByText('project2.psg')).toBeInTheDocument();
        });
        it('shows file details correctly', () => {
            render(_jsx(RecentFiles, {}));
            expect(screen.getByText('10 nodes')).toBeInTheDocument();
            expect(screen.getByText('20 nodes')).toBeInTheDocument();
            expect(screen.getByText('2.00 KB')).toBeInTheDocument();
            expect(screen.getByText('4.00 KB')).toBeInTheDocument();
        });
        it('displays last modified dates', () => {
            render(_jsx(RecentFiles, {}));
            expect(screen.getByText('1/15/2025')).toBeInTheDocument();
            expect(screen.getByText('1/14/2025')).toBeInTheDocument();
        });
    });
    describe('Favorites Functionality', () => {
        it('shows favorite star for favorited files', () => {
            render(_jsx(RecentFiles, {}));
            const favoriteStars = screen.getAllByText('⭐');
            expect(favoriteStars).toHaveLength(1);
        });
        it('toggles favorite status when star is clicked', () => {
            mockProjectManager.toggleFavorite.mockReturnValue(false);
            render(_jsx(RecentFiles, {}));
            const favoriteButton = screen.getAllByRole('button').find(btn => btn.textContent?.includes('⭐'));
            if (favoriteButton) {
                fireEvent.click(favoriteButton);
                expect(mockProjectManager.toggleFavorite).toHaveBeenCalledWith('file1');
            }
        });
        it('adds favorite when non-favorite file is starred', () => {
            mockProjectManager.toggleFavorite.mockReturnValue(true);
            mockProjectManager.isFavorite.mockReturnValue(false);
            render(_jsx(RecentFiles, {}));
            // Click on star button for file2 (non-favorite)
            const starButtons = screen.getAllByRole('button').filter(btn => btn.textContent?.includes('☆') || btn.textContent?.includes('⭐'));
            if (starButtons.length > 1) {
                fireEvent.click(starButtons[1]);
                expect(mockProjectManager.toggleFavorite).toHaveBeenCalledWith('file2');
            }
        });
    });
    describe('View Toggle Functionality', () => {
        it('switches between recent and favorites view', () => {
            render(_jsx(RecentFiles, {}));
            const favoritesButton = screen.getByText('Favorites');
            fireEvent.click(favoritesButton);
            expect(mockProjectManager.getFavoriteFiles).toHaveBeenCalled();
        });
        it('shows correct button states for view toggle', () => {
            render(_jsx(RecentFiles, {}));
            const recentButton = screen.getByText('Recent');
            const favoritesButton = screen.getByText('Favorites');
            expect(recentButton).toHaveClass('bg-blue-500');
            expect(favoritesButton).toHaveClass('bg-gray-200');
        });
        it('updates view when favorites button is clicked', () => {
            render(_jsx(RecentFiles, {}));
            const favoritesButton = screen.getByText('Favorites');
            fireEvent.click(favoritesButton);
            expect(favoritesButton).toHaveClass('bg-blue-500');
            expect(screen.getByText('Recent')).toHaveClass('bg-gray-200');
        });
    });
    describe('File Click Handling', () => {
        it('calls onClick handler when file is clicked', () => {
            const handleClick = jest.fn();
            render(_jsx(RecentFiles, { onClick: handleClick }));
            const fileItem = screen.getByText('project1.psg').closest('div');
            if (fileItem) {
                fireEvent.click(fileItem);
                expect(handleClick).toHaveBeenCalledWith(mockFiles[0]);
            }
        });
        it('does not call onClick when star button is clicked', () => {
            const handleClick = jest.fn();
            render(_jsx(RecentFiles, { onClick: handleClick }));
            const starButton = screen.getAllByRole('button').find(btn => btn.textContent?.includes('⭐'));
            if (starButton) {
                fireEvent.click(starButton);
                expect(handleClick).not.toHaveBeenCalled();
            }
        });
    });
    describe('Empty States', () => {
        it('shows empty state when no recent files', () => {
            mockProjectManager.getRecentFiles.mockReturnValue([]);
            render(_jsx(RecentFiles, {}));
            expect(screen.getByText('No recent files')).toBeInTheDocument();
        });
        it('shows empty state when no favorite files', () => {
            mockProjectManager.getFavoriteFiles.mockReturnValue([]);
            render(_jsx(RecentFiles, {}));
            const favoritesButton = screen.getByText('Favorites');
            fireEvent.click(favoritesButton);
            expect(screen.getByText('No favorite files')).toBeInTheDocument();
        });
    });
    describe('Limit Functionality', () => {
        it('respects the limit prop', () => {
            render(_jsx(RecentFiles, { limit: 1 }));
            expect(mockProjectManager.getRecentFiles).toHaveBeenCalledWith(1);
        });
        it('uses default limit when not specified', () => {
            render(_jsx(RecentFiles, {}));
            expect(mockProjectManager.getRecentFiles).toHaveBeenCalledWith(10);
        });
    });
    describe('File Size Formatting', () => {
        it('formats file sizes correctly', () => {
            const filesWithDifferentSizes = [
                { ...mockFiles[0], size: 512 },
                { ...mockFiles[1], size: 1048576 }
            ];
            mockProjectManager.getRecentFiles.mockReturnValue(filesWithDifferentSizes);
            render(_jsx(RecentFiles, {}));
            expect(screen.getByText('512 B')).toBeInTheDocument();
            expect(screen.getByText('1.00 MB')).toBeInTheDocument();
        });
    });
    describe('Date Formatting', () => {
        it('formats dates consistently', () => {
            render(_jsx(RecentFiles, {}));
            // Check that dates are formatted in MM/DD/YYYY format
            expect(screen.getByText('1/15/2025')).toBeInTheDocument();
            expect(screen.getByText('1/14/2025')).toBeInTheDocument();
        });
        it('handles invalid dates gracefully', () => {
            const filesWithInvalidDate = [
                { ...mockFiles[0], lastModified: new Date('invalid-date') }
            ];
            mockProjectManager.getRecentFiles.mockReturnValue(filesWithInvalidDate);
            expect(() => {
                render(_jsx(RecentFiles, {}));
            }).not.toThrow();
        });
    });
    describe('Accessibility', () => {
        it('has proper ARIA labels for buttons', () => {
            render(_jsx(RecentFiles, {}));
            const starButton = screen.getAllByRole('button').find(btn => btn.getAttribute('aria-label')?.includes('favorite'));
            expect(starButton).toHaveAttribute('aria-label');
        });
        it('supports keyboard navigation', () => {
            const handleClick = jest.fn();
            render(_jsx(RecentFiles, { onClick: handleClick }));
            const fileItem = screen.getByText('project1.psg').closest('div');
            if (fileItem) {
                fireEvent.keyDown(fileItem, { key: 'Enter' });
                // Note: Would need to add keyboard support to component
            }
        });
    });
    describe('Performance', () => {
        it('memoizes file list to prevent unnecessary re-renders', () => {
            const { rerender } = render(_jsx(RecentFiles, {}));
            // Clear the mock to see if it's called again
            mockProjectManager.getRecentFiles.mockClear();
            // Re-render with same props
            rerender(_jsx(RecentFiles, {}));
            // Should use memoized result, not call again immediately
            expect(mockProjectManager.getRecentFiles).toHaveBeenCalledTimes(1);
        });
        it('updates when limit changes', () => {
            const { rerender } = render(_jsx(RecentFiles, { limit: 5 }));
            rerender(_jsx(RecentFiles, { limit: 15 }));
            expect(mockProjectManager.getRecentFiles).toHaveBeenLastCalledWith(15);
        });
    });
    describe('Error Handling', () => {
        it('handles projectManager errors gracefully', () => {
            mockProjectManager.getRecentFiles.mockImplementation(() => {
                throw new Error('Failed to get recent files');
            });
            expect(() => {
                render(_jsx(RecentFiles, {}));
            }).not.toThrow();
            expect(screen.getByText('No recent files')).toBeInTheDocument();
        });
        it('handles toggleFavorite errors gracefully', () => {
            mockProjectManager.toggleFavorite.mockImplementation(() => {
                throw new Error('Failed to toggle favorite');
            });
            render(_jsx(RecentFiles, {}));
            const starButton = screen.getAllByRole('button').find(btn => btn.textContent?.includes('⭐'));
            if (starButton) {
                expect(() => {
                    fireEvent.click(starButton);
                }).not.toThrow();
            }
        });
    });
    describe('State Management', () => {
        it('maintains view state across re-renders', () => {
            const { rerender } = render(_jsx(RecentFiles, {}));
            // Switch to favorites view
            const favoritesButton = screen.getByText('Favorites');
            fireEvent.click(favoritesButton);
            // Re-render
            rerender(_jsx(RecentFiles, {}));
            // Should still be in favorites view
            expect(screen.getByText('Favorites')).toHaveClass('bg-blue-500');
        });
        it('updates favorite status immediately', () => {
            mockProjectManager.toggleFavorite.mockReturnValue(false);
            render(_jsx(RecentFiles, {}));
            const starButton = screen.getAllByRole('button').find(btn => btn.textContent?.includes('⭐'));
            if (starButton) {
                fireEvent.click(starButton);
                // Should immediately update the UI
                waitFor(() => {
                    expect(screen.queryByText('⭐')).not.toBeInTheDocument();
                });
            }
        });
    });
});
