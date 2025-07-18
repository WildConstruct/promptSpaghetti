/**
 * Visual regression tests for cross-platform components
 */

import React from 'react';
import { render } from '@testing-library/react';
import {
  mockPlatform,
  platformPresets,
  mockViewport,
  viewportPresets,
  setupVisualRegression,
  cleanup
} from '../setup/test-framework';
import {
  Grid,
  Row,
  Col,
  ResponsiveImage,
  MobileButton,
  MobileCard,
  IOSNavigationBar,
  IOSTabBar,
  MaterialAppBar,
  MaterialBottomNav,
  MaterialFAB,
  DesktopTooltip,
  PlatformButton,
  AdaptiveNavigation
} from '../../index';

// Mock visual regression service
const visualRegression = setupVisualRegression();

describe('Visual Regression Tests', () => {
  afterEach(() => {
    cleanup();
  });
  
  describe('Responsive Components', () => {
    const viewports = [
      { name: 'mobile', ...viewportPresets.mobile },
      { name: 'tablet', ...viewportPresets.tablet },
      { name: 'desktop', ...viewportPresets.desktop }
    ];
    
    viewports.forEach(viewport => {
      it(`should match Grid layout on ${viewport.name}`, async () => {
        mockViewport(viewport.width, viewport.height);
        
        const { container } = render(
          <Grid gutter={16}>
            <Row>
              <Col xs={12} sm={6} md={4} lg={3}>
                <div style={{ background: '#f0f0f0', padding: '20px' }}>
                  Column 1
                </div>
              </Col>
              <Col xs={12} sm={6} md={4} lg={3}>
                <div style={{ background: '#e0e0e0', padding: '20px' }}>
                  Column 2
                </div>
              </Col>
              <Col xs={12} sm={6} md={4} lg={3}>
                <div style={{ background: '#d0d0d0', padding: '20px' }}>
                  Column 3
                </div>
              </Col>
              <Col xs={12} sm={6} md={4} lg={3}>
                <div style={{ background: '#c0c0c0', padding: '20px' }}>
                  Column 4
                </div>
              </Col>
            </Row>
          </Grid>
        );
        
        await visualRegression.capture(
          `grid-layout-${viewport.name}`,
          container as HTMLElement
        );
      });
      
      it(`should match ResponsiveImage on ${viewport.name}`, async () => {
        mockViewport(viewport.width, viewport.height);
        
        const { container } = render(
          <ResponsiveImage
            src="/test-image.jpg"
            alt="Test Image"
            sizes={{
              xs: '100vw',
              sm: '50vw',
              md: '33vw',
              lg: '25vw'
            }}
            aspectRatio={16 / 9}
          />
        );
        
        await visualRegression.capture(
          `responsive-image-${viewport.name}`,
          container as HTMLElement
        );
      });
    });
  });
  
  describe('iOS Components', () => {
    beforeEach(() => {
      mockPlatform(platformPresets.iPhone);
      mockViewport(viewportPresets.mobile.width, viewportPresets.mobile.height);
    });
    
    it('should match iOS navigation bar', async () => {
      const { container } = render(
        <IOSNavigationBar
          title="My App"
          leftItems={[<button key="menu">☰</button>]}
          rightItems={[<button key="search">🔍</button>]}
        />
      );
      
      await visualRegression.capture('ios-navigation-bar', container as HTMLElement);
    });
    
    it('should match iOS navigation bar large title', async () => {
      const { container } = render(
        <IOSNavigationBar
          title="Large Title"
          large={true}
        />
      );
      
      await visualRegression.capture('ios-navigation-bar-large', container as HTMLElement);
    });
    
    it('should match iOS tab bar', async () => {
      const { container } = render(
        <IOSTabBar
          items={[
            { id: 'home', label: 'Home', icon: '🏠', badge: 3 },
            { id: 'search', label: 'Search', icon: '🔍' },
            { id: 'profile', label: 'Profile', icon: '👤' },
            { id: 'settings', label: 'Settings', icon: '⚙️' }
          ]}
          activeItem="home"
          onItemSelect={() => {}}
        />
      );
      
      await visualRegression.capture('ios-tab-bar', container as HTMLElement);
    });
  });
  
  describe('Android Components', () => {
    beforeEach(() => {
      mockPlatform(platformPresets.android);
      mockViewport(viewportPresets.mobile.width, viewportPresets.mobile.height);
    });
    
    it('should match Material app bar', async () => {
      const { container } = render(
        <MaterialAppBar
          title="Material App"
          navigationIcon={<span>☰</span>}
          actions={[
            <button key="search">🔍</button>,
            <button key="more">⋮</button>
          ]}
        />
      );
      
      await visualRegression.capture('material-app-bar', container as HTMLElement);
    });
    
    it('should match Material bottom navigation', async () => {
      const { container } = render(
        <MaterialBottomNav
          items={[
            { id: 'home', label: 'Home', icon: '🏠', activeIcon: '🏡' },
            { id: 'explore', label: 'Explore', icon: '🧭' },
            { id: 'notifications', label: 'Notifications', icon: '🔔', badge: 5 },
            { id: 'profile', label: 'Profile', icon: '👤' }
          ]}
          activeItem="home"
          onItemSelect={() => {}}
        />
      );
      
      await visualRegression.capture('material-bottom-nav', container as HTMLElement);
    });
    
    it('should match Material FAB variants', async () => {
      const { container } = render(
        <div style={{ display: 'flex', gap: '20px', padding: '20px' }}>
          <MaterialFAB icon="+" size="small" />
          <MaterialFAB icon="+" size="medium" />
          <MaterialFAB icon="+" size="large" />
          <MaterialFAB icon="+" label="Add Item" extended={true} />
        </div>
      );
      
      await visualRegression.capture('material-fab-variants', container as HTMLElement);
    });
  });
  
  describe('Desktop Components', () => {
    beforeEach(() => {
      mockPlatform(platformPresets.desktop);
      mockViewport(viewportPresets.desktop.width, viewportPresets.desktop.height);
    });
    
    it('should match desktop tooltip', async () => {
      const { container } = render(
        <div style={{ padding: '50px' }}>
          <DesktopTooltip content="This is a helpful tooltip">
            <button style={{ padding: '10px 20px' }}>
              Hover for tooltip
            </button>
          </DesktopTooltip>
        </div>
      );
      
      // Note: Actual hover state would need to be simulated
      await visualRegression.capture('desktop-tooltip', container as HTMLElement);
    });
  });
  
  describe('Platform Buttons', () => {
    const platforms = [
      { name: 'ios', preset: platformPresets.iPhone },
      { name: 'android', preset: platformPresets.android },
      { name: 'desktop', preset: platformPresets.desktop }
    ];
    
    platforms.forEach(platform => {
      it(`should match ${platform.name} button styles`, async () => {
        mockPlatform(platform.preset);
        
        const { container } = render(
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '20px' }}>
            <PlatformButton variant="primary">Primary Button</PlatformButton>
            <PlatformButton variant="secondary">Secondary Button</PlatformButton>
            <PlatformButton variant="text">Text Button</PlatformButton>
            <PlatformButton variant="primary" disabled>Disabled Button</PlatformButton>
            <PlatformButton variant="primary" size="small">Small Button</PlatformButton>
            <PlatformButton variant="primary" size="large">Large Button</PlatformButton>
          </div>
        );
        
        await visualRegression.capture(
          `platform-buttons-${platform.name}`,
          container as HTMLElement
        );
      });
    });
  });
  
  describe('Adaptive Navigation', () => {
    const navigationItems = [
      { id: 'home', label: 'Home', icon: '🏠' },
      { id: 'search', label: 'Search', icon: '🔍' },
      { id: 'notifications', label: 'Notifications', icon: '🔔', badge: 3 },
      { id: 'profile', label: 'Profile', icon: '👤' },
      { id: 'settings', label: 'Settings', icon: '⚙️' }
    ];
    
    it('should match mobile navigation', async () => {
      mockPlatform(platformPresets.iPhone);
      mockViewport(viewportPresets.mobile.width, viewportPresets.mobile.height);
      
      const { container } = render(
        <AdaptiveNavigation
          title="Mobile App"
          items={navigationItems}
          activeItem="home"
          onNavigate={() => {}}
        />
      );
      
      await visualRegression.capture('adaptive-navigation-mobile', container as HTMLElement);
    });
    
    it('should match tablet navigation rail', async () => {
      mockPlatform(platformPresets.android);
      mockViewport(viewportPresets.tablet.width, viewportPresets.tablet.height);
      
      const { container } = render(
        <AdaptiveNavigation
          title="Tablet App"
          items={navigationItems}
          activeItem="search"
          onNavigate={() => {}}
        />
      );
      
      await visualRegression.capture('adaptive-navigation-tablet', container as HTMLElement);
    });
    
    it('should match desktop side navigation', async () => {
      mockPlatform(platformPresets.desktop);
      mockViewport(viewportPresets.desktop.width, viewportPresets.desktop.height);
      
      const { container } = render(
        <AdaptiveNavigation
          title="Desktop App"
          items={navigationItems}
          activeItem="settings"
          onNavigate={() => {}}
        />
      );
      
      await visualRegression.capture('adaptive-navigation-desktop', container as HTMLElement);
    });
  });
  
  describe('Theme Variations', () => {
    it('should match light theme components', async () => {
      document.documentElement.setAttribute('data-theme', 'light');
      
      const { container } = render(
        <div style={{ padding: '20px', background: 'var(--color-background)' }}>
          <MobileCard
            title="Light Theme Card"
            description="This card should render in light theme"
            footer={
              <div style={{ display: 'flex', gap: '10px' }}>
                <MobileButton variant="primary" size="small">Action</MobileButton>
                <MobileButton variant="secondary" size="small">Cancel</MobileButton>
              </div>
            }
          >
            <div style={{ padding: '20px', background: 'var(--color-surface)' }}>
              Card content in light theme
            </div>
          </MobileCard>
        </div>
      );
      
      await visualRegression.capture('theme-light', container as HTMLElement);
    });
    
    it('should match dark theme components', async () => {
      document.documentElement.setAttribute('data-theme', 'dark');
      
      const { container } = render(
        <div style={{ padding: '20px', background: 'var(--color-background)' }}>
          <MobileCard
            title="Dark Theme Card"
            description="This card should render in dark theme"
            footer={
              <div style={{ display: 'flex', gap: '10px' }}>
                <MobileButton variant="primary" size="small">Action</MobileButton>
                <MobileButton variant="secondary" size="small">Cancel</MobileButton>
              </div>
            }
          >
            <div style={{ padding: '20px', background: 'var(--color-surface)' }}>
              Card content in dark theme
            </div>
          </MobileCard>
        </div>
      );
      
      await visualRegression.capture('theme-dark', container as HTMLElement);
    });
  });
  
  describe('Component States', () => {
    it('should match hover states', async () => {
      mockPlatform(platformPresets.desktop);
      
      const { container } = render(
        <div style={{ display: 'flex', gap: '20px', padding: '20px' }}>
          <button className="desktop-button">Normal</button>
          <button className="desktop-button hover">Hover</button>
          <button className="desktop-button active">Active</button>
          <button className="desktop-button focus">Focus</button>
          <button className="desktop-button" disabled>Disabled</button>
        </div>
      );
      
      await visualRegression.capture('component-states', container as HTMLElement);
    });
  });
});

/**
 * Visual regression comparison tests
 */
describe('Visual Regression Comparisons', () => {
  it('should detect visual changes', async () => {
    // This would compare against baseline images in a real implementation
    const result = await visualRegression.compare(
      'test-component',
      'baseline.png',
      'current.png'
    );
    
    expect(result.match).toBe(true);
    expect(result.diff).toBeLessThan(0.01); // Less than 1% difference
  });
});