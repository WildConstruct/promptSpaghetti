/**
 * Tests for platform-specific adaptations
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {
  mockPlatform,
  platformPresets,
  mockViewport,
  viewportPresets,
  mockSafeAreaInsets,
  cleanup,
} from '../setup/test-framework';
import {
  IOSNavigationBar,
  IOSTabBar,
  IOSSwitch,
  IOSActionSheet,
  IOSSafeAreaProvider,
  MaterialAppBar,
  MaterialBottomNav,
  MaterialFAB,
  MaterialSwitch,
  MaterialSnackbar,
  DesktopTooltip,
  DesktopContextMenu,
  KeyboardShortcutsManager,
  PlatformButton,
  PlatformScrollView,
  AdaptiveNavigation,
  usePlatformFeatures,
} from '../../platform';

describe('iOS Adaptations', () => {
  beforeEach(() => {
    mockPlatform(platformPresets.iPhone);
    mockViewport(viewportPresets.mobile.width, viewportPresets.mobile.height);
  });

  afterEach(() => {
    cleanup();
  });

  describe('iOS Navigation', () => {
    it('should render navigation bar with safe area', () => {
      mockSafeAreaInsets({ top: 44, bottom: 34 });

      render(
        <IOSSafeAreaProvider>
          <IOSNavigationBar title="Test App" onBack={() => {}} />
        </IOSSafeAreaProvider>
      );

      expect(screen.getByText('Test App')).toBeInTheDocument();
      expect(screen.getByText('Back')).toBeInTheDocument();
    });

    it('should handle large title scrolling', async () => {
      const { container } = render(<IOSNavigationBar title="Large Title" large={true} />);

      const nav = container.querySelector('.ios-navigation-bar');
      expect(nav).toHaveStyle('height: 96px');

      // Simulate scroll
      fireEvent.scroll(window, { target: { scrollY: 100 } });

      await waitFor(() => {
        expect(nav).toHaveClass('scrolled');
      });
    });
  });

  describe('iOS Tab Bar', () => {
    it('should render tab bar with badges', () => {
      const items = [
        { id: 'home', label: 'Home', icon: '🏠', badge: 3 },
        { id: 'search', label: 'Search', icon: '🔍' },
        { id: 'profile', label: 'Profile', icon: '👤' },
      ];

      render(
        <IOSSafeAreaProvider>
          <IOSTabBar items={items} activeItem="home" onItemSelect={() => {}} />
        </IOSSafeAreaProvider>
      );

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  describe('iOS Switch', () => {
    it('should toggle state', () => {
      const onChange = jest.fn();

      const { rerender } = render(<IOSSwitch checked={false} onChange={onChange} />);

      const switchButton = screen.getByRole('switch');
      fireEvent.click(switchButton);

      expect(onChange).toHaveBeenCalledWith(true);

      rerender(<IOSSwitch checked={true} onChange={onChange} />);
      expect(switchButton).toHaveAttribute('aria-checked', 'true');
    });
  });

  describe('iOS Action Sheet', () => {
    it('should render action sheet with cancel button', () => {
      const actions = [
        { text: 'Delete', style: 'destructive' as const, onPress: jest.fn() },
        { text: 'Cancel', style: 'cancel' as const, onPress: jest.fn() },
      ];

      render(
        <IOSSafeAreaProvider>
          <IOSActionSheet
            visible={true}
            title="Confirm Action"
            message="Are you sure?"
            actions={actions}
            onDismiss={() => {}}
          />
        </IOSSafeAreaProvider>
      );

      expect(screen.getByText('Confirm Action')).toBeInTheDocument();
      expect(screen.getByText('Are you sure?')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toHaveStyle('color: var(--color-danger)');
    });
  });
});

describe('Android Adaptations', () => {
  beforeEach(() => {
    mockPlatform(platformPresets.android);
    mockViewport(viewportPresets.mobile.width, viewportPresets.mobile.height);
  });

  afterEach(() => {
    cleanup();
  });

  describe('Material App Bar', () => {
    it('should render with elevation on scroll', async () => {
      const { container } = render(<MaterialAppBar title="Material App" type="small" />);

      const appBar = container.querySelector('.material-app-bar');
      expect(appBar).toHaveStyle('box-shadow: none');

      // Simulate scroll
      fireEvent.scroll(window, { target: { scrollY: 100 } });

      await waitFor(() => {
        expect(appBar).toHaveStyle('box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.06)');
      });
    });

    it('should support different app bar types', () => {
      const { container, rerender } = render(<MaterialAppBar title="Test" type="large" />);

      const appBar = container.querySelector('.material-app-bar');
      expect(appBar).toHaveStyle('height: 152px');

      rerender(<MaterialAppBar title="Test" type="medium" />);
      expect(appBar).toHaveStyle('height: 112px');
    });
  });

  describe('Material Bottom Navigation', () => {
    it('should show active indicator animation', () => {
      const items = [
        { id: 'home', label: 'Home', icon: '🏠' },
        { id: 'explore', label: 'Explore', icon: '🧭' },
      ];

      const { container } = render(<MaterialBottomNav items={items} activeItem="home" onItemSelect={() => {}} />);

      const indicator = container.querySelector('.nav-indicator');
      expect(indicator).toHaveStyle('width: 64px');
      expect(indicator).toHaveStyle('opacity: 1');
    });
  });

  describe('Material FAB', () => {
    it('should render different sizes', () => {
      const { container, rerender } = render(<MaterialFAB icon="+" size="small" />);

      let fab = container.querySelector('.material-fab');
      expect(fab).toHaveStyle('width: 40px');
      expect(fab).toHaveStyle('height: 40px');

      rerender(<MaterialFAB icon="+" size="large" />);
      fab = container.querySelector('.material-fab');
      expect(fab).toHaveStyle('width: 96px');
      expect(fab).toHaveStyle('height: 96px');
    });

    it('should support extended FAB', () => {
      const { container } = render(<MaterialFAB icon="+" label="Add Item" extended={true} />);

      expect(screen.getByText('Add Item')).toBeInTheDocument();
      const fab = container.querySelector('.material-fab');
      expect(fab).toHaveClass('extended');
    });
  });

  describe('Material Snackbar', () => {
    it('should auto-dismiss after duration', async () => {
      const onDismiss = jest.fn();

      render(
        <MaterialSnackbar
          message="Item deleted"
          duration={100} // Short duration for testing
          onDismiss={onDismiss}
        />
      );

      expect(screen.getByText('Item deleted')).toBeInTheDocument();

      await waitFor(
        () => {
          expect(onDismiss).toHaveBeenCalled();
        },
        { timeout: 200 }
      );
    });
  });
});

describe('Desktop Adaptations', () => {
  beforeEach(() => {
    mockPlatform(platformPresets.desktop);
    mockViewport(viewportPresets.desktop.width, viewportPresets.desktop.height);
  });

  afterEach(() => {
    cleanup();
  });

  describe('Desktop Tooltip', () => {
    it('should show tooltip on hover with delay', async () => {
      render(
        <DesktopTooltip content="Helpful information" delay={100}>
          <button>Hover me</button>
        </DesktopTooltip>
      );

      const button = screen.getByText('Hover me');
      fireEvent.mouseEnter(button);

      await waitFor(
        () => {
          expect(screen.getByText('Helpful information')).toBeInTheDocument();
        },
        { timeout: 200 }
      );

      fireEvent.mouseLeave(button);

      await waitFor(() => {
        expect(screen.queryByText('Helpful information')).not.toBeInTheDocument();
      });
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('should handle keyboard shortcuts', () => {
      const manager = new KeyboardShortcutsManager();
      const handler = jest.fn();

      manager.register({
        id: 'save',
        key: 's',
        modifiers: ['ctrl'],
        description: 'Save',
        handler,
      });

      // Simulate Ctrl+S
      fireEvent.keyDown(window, {
        key: 's',
        ctrlKey: true,
      });

      expect(handler).toHaveBeenCalled();

      manager.destroy();
    });

    it('should handle Mac command key', () => {
      mockPlatform(platformPresets.mac);

      const manager = new KeyboardShortcutsManager();
      const handler = jest.fn();

      manager.register({
        id: 'save',
        key: 's',
        modifiers: ['ctrl'], // Maps to Cmd on Mac
        description: 'Save',
        handler,
      });

      // Simulate Cmd+S
      fireEvent.keyDown(window, {
        key: 's',
        metaKey: true,
      });

      expect(handler).toHaveBeenCalled();

      manager.destroy();
    });
  });

  describe('Context Menu', () => {
    it('should show context menu on right click', () => {
      const items = [
        { label: 'Cut', onClick: jest.fn() },
        { label: 'Copy', onClick: jest.fn() },
        { label: 'Paste', onClick: jest.fn() },
      ];

      render(
        <DesktopContextMenu items={items}>
          <div>Right click me</div>
        </DesktopContextMenu>
      );

      const target = screen.getByText('Right click me');
      fireEvent.contextMenu(target);

      expect(screen.getByText('Cut')).toBeInTheDocument();
      expect(screen.getByText('Copy')).toBeInTheDocument();
      expect(screen.getByText('Paste')).toBeInTheDocument();
    });
  });
});

describe('Platform Detection', () => {
  it('should detect platform features correctly', () => {
    const TestComponent = () => {
      const features = usePlatformFeatures();

      return (
        <div>
          <div data-testid="platform">{features.platform}</div>
          <div data-testid="os">{features.os}</div>
          <div data-testid="is-mobile">{features.isMobile.toString()}</div>
          <div data-testid="supports-touch">{features.supportsTouch.toString()}</div>
        </div>
      );
    };

    // Test iOS
    mockPlatform(platformPresets.iPhone);
    const { rerender } = render(<TestComponent />);

    expect(screen.getByTestId('platform')).toHaveTextContent('mobile');
    expect(screen.getByTestId('os')).toHaveTextContent('iOS');
    expect(screen.getByTestId('is-mobile')).toHaveTextContent('true');

    // Test Desktop
    mockPlatform(platformPresets.desktop);
    rerender(<TestComponent />);

    expect(screen.getByTestId('platform')).toHaveTextContent('desktop');
    expect(screen.getByTestId('os')).toHaveTextContent('Windows');
    expect(screen.getByTestId('is-mobile')).toHaveTextContent('false');
  });
});

describe('Adaptive Components', () => {
  afterEach(() => {
    cleanup();
  });

  it('should render platform-specific button styles', () => {
    const { container, rerender } = render(<PlatformButton variant="primary">Click me</PlatformButton>);

    // iOS
    mockPlatform(platformPresets.iPhone);
    rerender(<PlatformButton variant="primary">Click me</PlatformButton>);

    let button = container.querySelector('.platform-button');
    expect(button).toHaveStyle('border-radius: 10px');
    expect(button).toHaveStyle('font-weight: 600');

    // Android
    mockPlatform(platformPresets.android);
    rerender(<PlatformButton variant="primary">Click me</PlatformButton>);

    button = container.querySelector('.platform-button');
    expect(button).toHaveStyle('border-radius: 20px');
    expect(button).toHaveStyle('text-transform: uppercase');
  });

  it('should adapt navigation based on screen size', () => {
    const items = [
      { id: 'home', label: 'Home', icon: '🏠' },
      { id: 'about', label: 'About', icon: 'ℹ️' },
    ];

    // Mobile - bottom navigation
    mockViewport(viewportPresets.mobile.width, viewportPresets.mobile.height);
    const { container, rerender } = render(
      <AdaptiveNavigation items={items} activeItem="home" onNavigate={() => {}} />
    );

    expect(container.querySelector('.ios-tab-bar')).toBeInTheDocument();

    // Desktop - side navigation
    mockViewport(viewportPresets.desktop.width, viewportPresets.desktop.height);
    rerender(<AdaptiveNavigation items={items} activeItem="home" onNavigate={() => {}} />);

    expect(container.querySelector('.adaptive-navigation-side')).toBeInTheDocument();
  });
});
