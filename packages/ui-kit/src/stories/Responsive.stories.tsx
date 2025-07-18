/**
 * Responsive framework stories
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { 
  Grid, 
  Row, 
  Col, 
  Container,
  CollapsiblePanel,
  AdaptiveLayout,
  ResponsiveDrawer,
  ResponsiveTabs
} from '../responsive';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useEnhancedResponsive, useBreakpointValue } from '../responsive/utilities';

const meta: Meta = {
  title: 'Responsive/Overview',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

// Helper component to show current breakpoint
const BreakpointIndicator = () => {
  const { breakpoint, width, height, device } = useEnhancedResponsive();
  
  return (
    <div style={{
      position: 'fixed',
      top: 10,
      right: 10,
      padding: '8px 16px',
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      borderRadius: 4,
      fontSize: 12,
      zIndex: 9999
    }}>
      <div>Breakpoint: <strong>{breakpoint}</strong></div>
      <div>Viewport: {width} × {height}</div>
      <div>Device: {device?.type}</div>
    </div>
  );
};

// Grid System Demo
export const GridSystemDemo: StoryObj = {
  render: () => (
    <>
      <BreakpointIndicator />
      <Container maxWidth="xl">
        <h2>Responsive Grid System</h2>
        <p>Resize your viewport to see the grid adapt</p>
        
        <Row spacing={2}>
          <Col xs={12} md={6} lg={4}>
            <Card>
              <h3>Column 1</h3>
              <p>12 cols on mobile, 6 on tablet, 4 on desktop</p>
            </Card>
          </Col>
          <Col xs={12} md={6} lg={4}>
            <Card>
              <h3>Column 2</h3>
              <p>12 cols on mobile, 6 on tablet, 4 on desktop</p>
            </Card>
          </Col>
          <Col xs={12} md={12} lg={4}>
            <Card>
              <h3>Column 3</h3>
              <p>12 cols on mobile/tablet, 4 on desktop</p>
            </Card>
          </Col>
        </Row>
        
        <h3 style={{ marginTop: 32 }}>Nested Grid</h3>
        <Row spacing={3}>
          <Col xs={12} lg={8}>
            <Card>
              <h4>Main Content</h4>
              <Row spacing={2}>
                <Col xs={6}>
                  <div style={{ background: '#f0f0f0', padding: 16 }}>
                    Nested Col 1
                  </div>
                </Col>
                <Col xs={6}>
                  <div style={{ background: '#f0f0f0', padding: 16 }}>
                    Nested Col 2
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
          <Col xs={12} lg={4}>
            <Card>
              <h4>Sidebar</h4>
              <p>Stacks on mobile, side-by-side on desktop</p>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  ),
};

// Adaptive Layout Demo
export const AdaptiveLayoutDemo: StoryObj = {
  render: () => {
    const [sidebarOpen, setSidebarOpen] = React.useState(false);
    
    return (
      <>
        <BreakpointIndicator />
        <AdaptiveLayout
          header={
            <div style={{ padding: 16, background: '#f0f0f0' }}>
              <h2>Adaptive Layout Header</h2>
            </div>
          }
          sidebar={
            <div style={{ padding: 16 }}>
              <h3>Sidebar</h3>
              <p>Auto-collapses on mobile</p>
              <Button onClick={() => setSidebarOpen(false)}>
                Close Sidebar
              </Button>
            </div>
          }
          sidebarCollapseOn={['xs', 'sm']}
          main={
            <Container>
              <h2>Main Content Area</h2>
              <p>The sidebar automatically collapses on small screens.</p>
              <Button onClick={() => setSidebarOpen(true)}>
                Open Sidebar
              </Button>
              
              <Row spacing={2} style={{ marginTop: 24 }}>
                <Col xs={12} md={6}>
                  <Card>
                    <h3>Feature 1</h3>
                    <p>Responsive card content</p>
                  </Card>
                </Col>
                <Col xs={12} md={6}>
                  <Card>
                    <h3>Feature 2</h3>
                    <p>Responsive card content</p>
                  </Card>
                </Col>
              </Row>
            </Container>
          }
          footer={
            <div style={{ padding: 16, background: '#f0f0f0', textAlign: 'center' }}>
              Footer Content
            </div>
          }
        />
      </>
    );
  },
};

// Collapsible Panels Demo
export const CollapsiblePanelsDemo: StoryObj = {
  render: () => (
    <>
      <BreakpointIndicator />
      <Container maxWidth="lg">
        <h2>Collapsible Panels</h2>
        <p>Panels can auto-collapse based on breakpoints</p>
        
        <div style={{ marginTop: 24 }}>
          <CollapsiblePanel
            title="Always Collapsible"
            icon="📁"
            actions={<Button size="sm">Action</Button>}
          >
            <p>This panel is always collapsible. Click the header to toggle.</p>
          </CollapsiblePanel>
          
          <CollapsiblePanel
            title="Collapses on Mobile"
            icon="📱"
            collapseOn={['xs', 'sm']}
            defaultOpen={true}
          >
            <p>This panel automatically collapses on mobile devices.</p>
            <p>Resize your viewport to see it in action.</p>
          </CollapsiblePanel>
          
          <CollapsiblePanel
            title="Not Collapsible"
            icon="🔒"
            collapsible={false}
          >
            <p>This panel cannot be collapsed by the user.</p>
          </CollapsiblePanel>
        </div>
      </Container>
    </>
  ),
};

// Responsive Tabs Demo
export const ResponsiveTabsDemo: StoryObj = {
  render: () => {
    const tabs = [
      {
        id: 'overview',
        label: 'Overview',
        icon: '📊',
        content: (
          <div>
            <h3>Overview Content</h3>
            <p>This is the overview tab content.</p>
          </div>
        ),
      },
      {
        id: 'details',
        label: 'Details',
        icon: '📋',
        content: (
          <div>
            <h3>Details Content</h3>
            <p>This is the details tab content.</p>
          </div>
        ),
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: '⚙️',
        content: (
          <div>
            <h3>Settings Content</h3>
            <p>This is the settings tab content.</p>
          </div>
        ),
      },
      {
        id: 'help',
        label: 'Help',
        icon: '❓',
        content: (
          <div>
            <h3>Help Content</h3>
            <p>This is the help tab content.</p>
          </div>
        ),
        disabled: true,
      },
    ];
    
    return (
      <>
        <BreakpointIndicator />
        <Container maxWidth="lg">
          <h2>Responsive Tabs</h2>
          <p>Tabs stack vertically on mobile devices</p>
          
          <div style={{ marginTop: 24 }}>
            <h3>Default Variant</h3>
            <ResponsiveTabs tabs={tabs} variant="default" />
          </div>
          
          <div style={{ marginTop: 48 }}>
            <h3>Pills Variant</h3>
            <ResponsiveTabs tabs={tabs} variant="pills" />
          </div>
          
          <div style={{ marginTop: 48 }}>
            <h3>Underline Variant</h3>
            <ResponsiveTabs tabs={tabs} variant="underline" />
          </div>
          
          <div style={{ marginTop: 48 }}>
            <h3>Vertical Orientation</h3>
            <ResponsiveTabs tabs={tabs} orientation="vertical" stackOn={[]} />
          </div>
        </Container>
      </>
    );
  },
};

// Responsive Values Demo
export const ResponsiveValuesDemo: StoryObj = {
  render: () => {
    const padding = useBreakpointValue({
      xs: 8,
      sm: 12,
      md: 16,
      lg: 24,
      xl: 32,
    }, 16);
    
    const columns = useBreakpointValue({
      xs: 1,
      sm: 2,
      md: 3,
      lg: 4,
    }, 1);
    
    return (
      <>
        <BreakpointIndicator />
        <Container>
          <h2>Responsive Values</h2>
          <p>Values change based on breakpoint</p>
          
          <div style={{
            padding: padding,
            background: '#f0f0f0',
            borderRadius: 8,
            marginTop: 24
          }}>
            <p>Current padding: {padding}px</p>
            <p>Current columns: {columns}</p>
          </div>
          
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              gap: 16,
              marginTop: 24
            }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i}>
                <h4>Item {i + 1}</h4>
                <p>Grid item</p>
              </Card>
            ))}
          </div>
        </Container>
      </>
    );
  },
};