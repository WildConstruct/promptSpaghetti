/**
 * Tests for responsive components
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { 
  mockViewport, 
  viewportPresets,
  mockMatchMedia,
  cleanup
} from '../setup/test-framework';
import {
  Grid,
  Row,
  Col,
  Container,
  ResponsiveImage,
  CollapsiblePanel,
  AdaptiveLayout,
  ResponsiveDrawer,
  ResponsiveTabs
} from '../../responsive/components';
import { useBreakpoint, useMediaQuery, useResponsive } from '../../responsive/hooks';

describe('Responsive Components', () => {
  afterEach(() => {
    cleanup();
  });
  
  describe('Grid System', () => {
    it('should render with default props', () => {
      render(
        <Grid>
          <Row>
            <Col>Content</Col>
          </Row>
        </Grid>
      );
      
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
    
    it('should apply responsive column spans', () => {
      const { container } = render(
        <Grid>
          <Row>
            <Col xs={12} sm={6} md={4} lg={3}>
              Responsive Column
            </Col>
          </Row>
        </Grid>
      );
      
      const col = container.querySelector('.col');
      expect(col).toHaveClass('col-xs-12', 'col-sm-6', 'col-md-4', 'col-lg-3');
    });
    
    it('should apply gutter spacing', () => {
      const { container } = render(
        <Grid gutter={24}>
          <Row>
            <Col span={6}>Column 1</Col>
            <Col span={6}>Column 2</Col>
          </Row>
        </Grid>
      );
      
      const row = container.querySelector('.row');
      expect(row).toHaveStyle('margin-left: -12px');
      expect(row).toHaveStyle('margin-right: -12px');
    });
    
    it('should support fluid container', () => {
      const { container } = render(
        <Container fluid>
          <div>Fluid Content</div>
        </Container>
      );
      
      const containerEl = container.querySelector('.container');
      expect(containerEl).toHaveClass('container-fluid');
    });
  });
  
  describe('Responsive Hooks', () => {
    it('should detect current breakpoint', () => {
      const TestComponent = () => {
        const breakpoint = useBreakpoint();
        return <div>{breakpoint}</div>;
      };
      
      // Test mobile
      mockViewport(viewportPresets.mobile.width, viewportPresets.mobile.height);
      const { rerender } = render(<TestComponent />);
      expect(screen.getByText('xs')).toBeInTheDocument();
      
      // Test tablet
      mockViewport(viewportPresets.tablet.width, viewportPresets.tablet.height);
      rerender(<TestComponent />);
      expect(screen.getByText('md')).toBeInTheDocument();
      
      // Test desktop
      mockViewport(viewportPresets.desktop.width, viewportPresets.desktop.height);
      rerender(<TestComponent />);
      expect(screen.getByText('xl')).toBeInTheDocument();
    });
    
    it('should handle media queries', () => {
      const TestComponent = () => {
        const isMobile = useMediaQuery('(max-width: 767px)');
        const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
        const isDesktop = useMediaQuery('(min-width: 1024px)');
        
        return (
          <div>
            {isMobile && <span>Mobile</span>}
            {isTablet && <span>Tablet</span>}
            {isDesktop && <span>Desktop</span>}
          </div>
        );
      };
      
      // Test mobile
      mockMatchMedia(true);
      mockViewport(375, 667);
      render(<TestComponent />);
      expect(screen.getByText('Mobile')).toBeInTheDocument();
    });
    
    it('should provide responsive utilities', () => {
      const TestComponent = () => {
        const { isMobile, isTablet, isDesktop, orientation } = useResponsive();
        
        return (
          <div>
            <div data-testid="device-type">
              {isMobile && 'Mobile'}
              {isTablet && 'Tablet'}
              {isDesktop && 'Desktop'}
            </div>
            <div data-testid="orientation">{orientation}</div>
          </div>
        );
      };
      
      mockViewport(viewportPresets.mobile.width, viewportPresets.mobile.height);
      render(<TestComponent />);
      
      expect(screen.getByTestId('device-type')).toHaveTextContent('Mobile');
      expect(screen.getByTestId('orientation')).toHaveTextContent('portrait');
    });
  });
  
  describe('CollapsiblePanel', () => {
    it('should toggle collapse state based on breakpoint', async () => {
      const { container } = render(
        <CollapsiblePanel
          title="Test Panel"
          collapseAt="md"
          defaultCollapsed={false}
        >
          <div>Panel Content</div>
        </CollapsiblePanel>
      );
      
      // Desktop - should be expanded
      mockViewport(viewportPresets.desktop.width, viewportPresets.desktop.height);
      expect(screen.getByText('Panel Content')).toBeVisible();
      
      // Mobile - should be collapsed
      mockViewport(viewportPresets.mobile.width, viewportPresets.mobile.height);
      await waitFor(() => {
        const content = container.querySelector('.panel-content');
        expect(content).toHaveStyle('max-height: 0px');
      });
    });
  });
  
  describe('AdaptiveLayout', () => {
    it('should switch layouts based on breakpoint', () => {
      render(
        <AdaptiveLayout
          mobile={<div>Mobile Layout</div>}
          tablet={<div>Tablet Layout</div>}
          desktop={<div>Desktop Layout</div>}
        />
      );
      
      // Test mobile
      mockViewport(viewportPresets.mobile.width, viewportPresets.mobile.height);
      expect(screen.getByText('Mobile Layout')).toBeInTheDocument();
      
      // Test tablet
      mockViewport(viewportPresets.tablet.width, viewportPresets.tablet.height);
      expect(screen.getByText('Tablet Layout')).toBeInTheDocument();
      
      // Test desktop
      mockViewport(viewportPresets.desktop.width, viewportPresets.desktop.height);
      expect(screen.getByText('Desktop Layout')).toBeInTheDocument();
    });
  });
  
  describe('ResponsiveDrawer', () => {
    it('should render as overlay on mobile', () => {
      mockViewport(viewportPresets.mobile.width, viewportPresets.mobile.height);
      
      const { container } = render(
        <ResponsiveDrawer
          open={true}
          onClose={() => {}}
        >
          <div>Drawer Content</div>
        </ResponsiveDrawer>
      );
      
      const drawer = container.querySelector('.responsive-drawer');
      expect(drawer).toHaveClass('overlay');
    });
    
    it('should render as permanent on desktop', () => {
      mockViewport(viewportPresets.desktop.width, viewportPresets.desktop.height);
      
      const { container } = render(
        <ResponsiveDrawer
          open={true}
          onClose={() => {}}
        >
          <div>Drawer Content</div>
        </ResponsiveDrawer>
      );
      
      const drawer = container.querySelector('.responsive-drawer');
      expect(drawer).toHaveClass('permanent');
    });
  });
  
  describe('ResponsiveTabs', () => {
    const tabs = [
      { id: 'tab1', label: 'Tab 1', content: <div>Content 1</div> },
      { id: 'tab2', label: 'Tab 2', content: <div>Content 2</div> },
      { id: 'tab3', label: 'Tab 3', content: <div>Content 3</div> },
      { id: 'tab4', label: 'Tab 4', content: <div>Content 4</div> },
      { id: 'tab5', label: 'Tab 5', content: <div>Content 5</div> }
    ];
    
    it('should render as dropdown on mobile', () => {
      mockViewport(viewportPresets.mobile.width, viewportPresets.mobile.height);
      
      const { container } = render(
        <ResponsiveTabs
          tabs={tabs}
          activeTab="tab1"
          onChange={() => {}}
        />
      );
      
      expect(container.querySelector('.tab-dropdown')).toBeInTheDocument();
    });
    
    it('should render as horizontal tabs on desktop', () => {
      mockViewport(viewportPresets.desktop.width, viewportPresets.desktop.height);
      
      const { container } = render(
        <ResponsiveTabs
          tabs={tabs}
          activeTab="tab1"
          onChange={() => {}}
        />
      );
      
      expect(container.querySelector('.tab-list')).toBeInTheDocument();
      expect(container.querySelectorAll('.tab-button')).toHaveLength(5);
    });
  });
  
  describe('ResponsiveImage', () => {
    it('should render srcSet for different screen densities', () => {
      const { container } = render(
        <ResponsiveImage
          src="/image.jpg"
          alt="Test Image"
          sizes={{
            xs: '100vw',
            sm: '50vw',
            md: '33vw',
            lg: '25vw'
          }}
        />
      );
      
      const img = container.querySelector('img');
      expect(img).toHaveAttribute('srcset');
      expect(img).toHaveAttribute('sizes');
    });
    
    it('should lazy load by default', () => {
      const { container } = render(
        <ResponsiveImage
          src="/image.jpg"
          alt="Test Image"
        />
      );
      
      const img = container.querySelector('img');
      expect(img).toHaveAttribute('loading', 'lazy');
    });
  });
});

describe('Responsive Edge Cases', () => {
  afterEach(() => {
    cleanup();
  });
  
  it('should handle orientation changes', async () => {
    const TestComponent = () => {
      const { orientation } = useResponsive();
      return <div>{orientation}</div>;
    };
    
    // Portrait
    mockViewport(375, 667);
    const { rerender } = render(<TestComponent />);
    expect(screen.getByText('portrait')).toBeInTheDocument();
    
    // Landscape
    mockViewport(667, 375);
    rerender(<TestComponent />);
    await waitFor(() => {
      expect(screen.getByText('landscape')).toBeInTheDocument();
    });
  });
  
  it('should handle very small viewports', () => {
    mockViewport(320, 480); // Old iPhone size
    
    const { container } = render(
      <Grid>
        <Row>
          <Col xs={12}>
            <div>Small Screen Content</div>
          </Col>
        </Row>
      </Grid>
    );
    
    expect(screen.getByText('Small Screen Content')).toBeInTheDocument();
    const col = container.querySelector('.col');
    expect(col).toHaveClass('col-xs-12');
  });
  
  it('should handle very large viewports', () => {
    mockViewport(3840, 2160); // 4K display
    
    const TestComponent = () => {
      const breakpoint = useBreakpoint();
      return <div>{breakpoint}</div>;
    };
    
    render(<TestComponent />);
    expect(screen.getByText('xxl')).toBeInTheDocument();
  });
  
  it('should handle rapid viewport changes', async () => {
    const TestComponent = () => {
      const breakpoint = useBreakpoint();
      return <div data-testid="breakpoint">{breakpoint}</div>;
    };
    
    render(<TestComponent />);
    
    // Rapid changes
    mockViewport(375, 667);
    mockViewport(768, 1024);
    mockViewport(1920, 1080);
    mockViewport(375, 667);
    
    await waitFor(() => {
      expect(screen.getByTestId('breakpoint')).toHaveTextContent('xs');
    });
  });
});