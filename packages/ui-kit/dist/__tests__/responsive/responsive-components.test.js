import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { mockViewport, viewportPresets, mockMatchMedia, cleanup } from '../setup/test-framework';
import { Grid, Row, Col, Container, ResponsiveImage, CollapsiblePanel, AdaptiveLayout, ResponsiveDrawer, ResponsiveTabs } from '../../responsive/components';
import { useBreakpoint, useMediaQuery, useResponsive } from '../../responsive/hooks';
describe('Responsive Components', () => {
    afterEach(() => {
        cleanup();
    });
    describe('Grid System', () => {
        it('should render with default props', () => {
            render(_jsx(Grid, { children: _jsx(Row, { children: _jsx(Col, { children: "Content" }) }) }));
            expect(screen.getByText('Content')).toBeInTheDocument();
        });
        it('should apply responsive column spans', () => {
            const { container } = render(_jsx(Grid, { children: _jsx(Row, { children: _jsx(Col, { xs: 12, sm: 6, md: 4, lg: 3, children: "Responsive Column" }) }) }));
            const col = container.querySelector('.col');
            expect(col).toHaveClass('col-xs-12', 'col-sm-6', 'col-md-4', 'col-lg-3');
        });
        it('should apply gutter spacing', () => {
            const { container } = render(_jsx(Grid, { gutter: 24, children: _jsxs(Row, { children: [_jsx(Col, { span: 6, children: "Column 1" }), _jsx(Col, { span: 6, children: "Column 2" })] }) }));
            const row = container.querySelector('.row');
            expect(row).toHaveStyle('margin-left: -12px');
            expect(row).toHaveStyle('margin-right: -12px');
        });
        it('should support fluid container', () => {
            const { container } = render(_jsx(Container, { fluid: true, children: _jsx("div", { children: "Fluid Content" }) }));
            const containerEl = container.querySelector('.container');
            expect(containerEl).toHaveClass('container-fluid');
        });
    });
    describe('Responsive Hooks', () => {
        it('should detect current breakpoint', () => {
            const TestComponent = () => {
                const breakpoint = useBreakpoint();
                return _jsx("div", { children: breakpoint });
            };
            // Test mobile
            mockViewport(viewportPresets.mobile.width, viewportPresets.mobile.height);
            const { rerender } = render(_jsx(TestComponent, {}));
            expect(screen.getByText('xs')).toBeInTheDocument();
            // Test tablet
            mockViewport(viewportPresets.tablet.width, viewportPresets.tablet.height);
            rerender(_jsx(TestComponent, {}));
            expect(screen.getByText('md')).toBeInTheDocument();
            // Test desktop
            mockViewport(viewportPresets.desktop.width, viewportPresets.desktop.height);
            rerender(_jsx(TestComponent, {}));
            expect(screen.getByText('xl')).toBeInTheDocument();
        });
        it('should handle media queries', () => {
            const TestComponent = () => {
                const isMobile = useMediaQuery('(max-width: 767px)');
                const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
                const isDesktop = useMediaQuery('(min-width: 1024px)');
                return (_jsxs("div", { children: [isMobile && _jsx("span", { children: "Mobile" }), isTablet && _jsx("span", { children: "Tablet" }), isDesktop && _jsx("span", { children: "Desktop" })] }));
            };
            // Test mobile
            mockMatchMedia(true);
            mockViewport(375, 667);
            render(_jsx(TestComponent, {}));
            expect(screen.getByText('Mobile')).toBeInTheDocument();
        });
        it('should provide responsive utilities', () => {
            const TestComponent = () => {
                const { isMobile, isTablet, isDesktop, orientation } = useResponsive();
                return (_jsxs("div", { children: [_jsxs("div", { "data-testid": "device-type", children: [isMobile && 'Mobile', isTablet && 'Tablet', isDesktop && 'Desktop'] }), _jsx("div", { "data-testid": "orientation", children: orientation })] }));
            };
            mockViewport(viewportPresets.mobile.width, viewportPresets.mobile.height);
            render(_jsx(TestComponent, {}));
            expect(screen.getByTestId('device-type')).toHaveTextContent('Mobile');
            expect(screen.getByTestId('orientation')).toHaveTextContent('portrait');
        });
    });
    describe('CollapsiblePanel', () => {
        it('should toggle collapse state based on breakpoint', async () => {
            const { container } = render(_jsx(CollapsiblePanel, { title: "Test Panel", collapseAt: "md", defaultCollapsed: false, children: _jsx("div", { children: "Panel Content" }) }));
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
            render(_jsx(AdaptiveLayout, { mobile: _jsx("div", { children: "Mobile Layout" }), tablet: _jsx("div", { children: "Tablet Layout" }), desktop: _jsx("div", { children: "Desktop Layout" }) }));
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
            const { container } = render(_jsx(ResponsiveDrawer, { open: true, onClose: () => { }, children: _jsx("div", { children: "Drawer Content" }) }));
            const drawer = container.querySelector('.responsive-drawer');
            expect(drawer).toHaveClass('overlay');
        });
        it('should render as permanent on desktop', () => {
            mockViewport(viewportPresets.desktop.width, viewportPresets.desktop.height);
            const { container } = render(_jsx(ResponsiveDrawer, { open: true, onClose: () => { }, children: _jsx("div", { children: "Drawer Content" }) }));
            const drawer = container.querySelector('.responsive-drawer');
            expect(drawer).toHaveClass('permanent');
        });
    });
    describe('ResponsiveTabs', () => {
        const tabs = [
            { id: 'tab1', label: 'Tab 1', content: _jsx("div", { children: "Content 1" }) },
            { id: 'tab2', label: 'Tab 2', content: _jsx("div", { children: "Content 2" }) },
            { id: 'tab3', label: 'Tab 3', content: _jsx("div", { children: "Content 3" }) },
            { id: 'tab4', label: 'Tab 4', content: _jsx("div", { children: "Content 4" }) },
            { id: 'tab5', label: 'Tab 5', content: _jsx("div", { children: "Content 5" }) }
        ];
        it('should render as dropdown on mobile', () => {
            mockViewport(viewportPresets.mobile.width, viewportPresets.mobile.height);
            const { container } = render(_jsx(ResponsiveTabs, { tabs: tabs, activeTab: "tab1", onChange: () => { } }));
            expect(container.querySelector('.tab-dropdown')).toBeInTheDocument();
        });
        it('should render as horizontal tabs on desktop', () => {
            mockViewport(viewportPresets.desktop.width, viewportPresets.desktop.height);
            const { container } = render(_jsx(ResponsiveTabs, { tabs: tabs, activeTab: "tab1", onChange: () => { } }));
            expect(container.querySelector('.tab-list')).toBeInTheDocument();
            expect(container.querySelectorAll('.tab-button')).toHaveLength(5);
        });
    });
    describe('ResponsiveImage', () => {
        it('should render srcSet for different screen densities', () => {
            const { container } = render(_jsx(ResponsiveImage, { src: "/image.jpg", alt: "Test Image", sizes: {
                    xs: '100vw',
                    sm: '50vw',
                    md: '33vw',
                    lg: '25vw'
                } }));
            const img = container.querySelector('img');
            expect(img).toHaveAttribute('srcset');
            expect(img).toHaveAttribute('sizes');
        });
        it('should lazy load by default', () => {
            const { container } = render(_jsx(ResponsiveImage, { src: "/image.jpg", alt: "Test Image" }));
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
            return _jsx("div", { children: orientation });
        };
        // Portrait
        mockViewport(375, 667);
        const { rerender } = render(_jsx(TestComponent, {}));
        expect(screen.getByText('portrait')).toBeInTheDocument();
        // Landscape
        mockViewport(667, 375);
        rerender(_jsx(TestComponent, {}));
        await waitFor(() => {
            expect(screen.getByText('landscape')).toBeInTheDocument();
        });
    });
    it('should handle very small viewports', () => {
        mockViewport(320, 480); // Old iPhone size
        const { container } = render(_jsx(Grid, { children: _jsx(Row, { children: _jsx(Col, { xs: 12, children: _jsx("div", { children: "Small Screen Content" }) }) }) }));
        expect(screen.getByText('Small Screen Content')).toBeInTheDocument();
        const col = container.querySelector('.col');
        expect(col).toHaveClass('col-xs-12');
    });
    it('should handle very large viewports', () => {
        mockViewport(3840, 2160); // 4K display
        const TestComponent = () => {
            const breakpoint = useBreakpoint();
            return _jsx("div", { children: breakpoint });
        };
        render(_jsx(TestComponent, {}));
        expect(screen.getByText('xxl')).toBeInTheDocument();
    });
    it('should handle rapid viewport changes', async () => {
        const TestComponent = () => {
            const breakpoint = useBreakpoint();
            return _jsx("div", { "data-testid": "breakpoint", children: breakpoint });
        };
        render(_jsx(TestComponent, {}));
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
//# sourceMappingURL=responsive-components.test.js.map