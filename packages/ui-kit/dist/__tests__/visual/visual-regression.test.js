import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { render } from '@testing-library/react';
import { mockPlatform, platformPresets, mockViewport, viewportPresets, setupVisualRegression, cleanup } from '../setup/test-framework';
import { Grid, Row, Col, ResponsiveImage, MobileButton, MobileCard, IOSNavigationBar, IOSTabBar, MaterialAppBar, MaterialBottomNav, MaterialFAB, DesktopTooltip, PlatformButton, AdaptiveNavigation } from '../../index';
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
                const { container } = render(_jsx(Grid, { gutter: 16, children: _jsxs(Row, { children: [_jsx(Col, { xs: 12, sm: 6, md: 4, lg: 3, children: _jsx("div", { style: { background: '#f0f0f0', padding: '20px' }, children: "Column 1" }) }), _jsx(Col, { xs: 12, sm: 6, md: 4, lg: 3, children: _jsx("div", { style: { background: '#e0e0e0', padding: '20px' }, children: "Column 2" }) }), _jsx(Col, { xs: 12, sm: 6, md: 4, lg: 3, children: _jsx("div", { style: { background: '#d0d0d0', padding: '20px' }, children: "Column 3" }) }), _jsx(Col, { xs: 12, sm: 6, md: 4, lg: 3, children: _jsx("div", { style: { background: '#c0c0c0', padding: '20px' }, children: "Column 4" }) })] }) }));
                await visualRegression.capture(`grid-layout-${viewport.name}`, container);
            });
            it(`should match ResponsiveImage on ${viewport.name}`, async () => {
                mockViewport(viewport.width, viewport.height);
                const { container } = render(_jsx(ResponsiveImage, { src: "/test-image.jpg", alt: "Test Image", sizes: {
                        xs: '100vw',
                        sm: '50vw',
                        md: '33vw',
                        lg: '25vw'
                    }, aspectRatio: 16 / 9 }));
                await visualRegression.capture(`responsive-image-${viewport.name}`, container);
            });
        });
    });
    describe('iOS Components', () => {
        beforeEach(() => {
            mockPlatform(platformPresets.iPhone);
            mockViewport(viewportPresets.mobile.width, viewportPresets.mobile.height);
        });
        it('should match iOS navigation bar', async () => {
            const { container } = render(_jsx(IOSNavigationBar, { title: "My App", leftItems: [_jsx("button", { children: "\u2630" }, "menu")], rightItems: [_jsx("button", { children: "\uD83D\uDD0D" }, "search")] }));
            await visualRegression.capture('ios-navigation-bar', container);
        });
        it('should match iOS navigation bar large title', async () => {
            const { container } = render(_jsx(IOSNavigationBar, { title: "Large Title", large: true }));
            await visualRegression.capture('ios-navigation-bar-large', container);
        });
        it('should match iOS tab bar', async () => {
            const { container } = render(_jsx(IOSTabBar, { items: [
                    { id: 'home', label: 'Home', icon: '🏠', badge: 3 },
                    { id: 'search', label: 'Search', icon: '🔍' },
                    { id: 'profile', label: 'Profile', icon: '👤' },
                    { id: 'settings', label: 'Settings', icon: '⚙️' }
                ], activeItem: "home", onItemSelect: () => { } }));
            await visualRegression.capture('ios-tab-bar', container);
        });
    });
    describe('Android Components', () => {
        beforeEach(() => {
            mockPlatform(platformPresets.android);
            mockViewport(viewportPresets.mobile.width, viewportPresets.mobile.height);
        });
        it('should match Material app bar', async () => {
            const { container } = render(_jsx(MaterialAppBar, { title: "Material App", navigationIcon: _jsx("span", { children: "\u2630" }), actions: [
                    _jsx("button", { children: "\uD83D\uDD0D" }, "search"),
                    _jsx("button", { children: "\u22EE" }, "more")
                ] }));
            await visualRegression.capture('material-app-bar', container);
        });
        it('should match Material bottom navigation', async () => {
            const { container } = render(_jsx(MaterialBottomNav, { items: [
                    { id: 'home', label: 'Home', icon: '🏠', activeIcon: '🏡' },
                    { id: 'explore', label: 'Explore', icon: '🧭' },
                    { id: 'notifications', label: 'Notifications', icon: '🔔', badge: 5 },
                    { id: 'profile', label: 'Profile', icon: '👤' }
                ], activeItem: "home", onItemSelect: () => { } }));
            await visualRegression.capture('material-bottom-nav', container);
        });
        it('should match Material FAB variants', async () => {
            const { container } = render(_jsxs("div", { style: { display: 'flex', gap: '20px', padding: '20px' }, children: [_jsx(MaterialFAB, { icon: "+", size: "small" }), _jsx(MaterialFAB, { icon: "+", size: "medium" }), _jsx(MaterialFAB, { icon: "+", size: "large" }), _jsx(MaterialFAB, { icon: "+", label: "Add Item", extended: true })] }));
            await visualRegression.capture('material-fab-variants', container);
        });
    });
    describe('Desktop Components', () => {
        beforeEach(() => {
            mockPlatform(platformPresets.desktop);
            mockViewport(viewportPresets.desktop.width, viewportPresets.desktop.height);
        });
        it('should match desktop tooltip', async () => {
            const { container } = render(_jsx("div", { style: { padding: '50px' }, children: _jsx(DesktopTooltip, { content: "This is a helpful tooltip", children: _jsx("button", { style: { padding: '10px 20px' }, children: "Hover for tooltip" }) }) }));
            // Note: Actual hover state would need to be simulated
            await visualRegression.capture('desktop-tooltip', container);
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
                const { container } = render(_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '10px', padding: '20px' }, children: [_jsx(PlatformButton, { variant: "primary", children: "Primary Button" }), _jsx(PlatformButton, { variant: "secondary", children: "Secondary Button" }), _jsx(PlatformButton, { variant: "text", children: "Text Button" }), _jsx(PlatformButton, { variant: "primary", disabled: true, children: "Disabled Button" }), _jsx(PlatformButton, { variant: "primary", size: "small", children: "Small Button" }), _jsx(PlatformButton, { variant: "primary", size: "large", children: "Large Button" })] }));
                await visualRegression.capture(`platform-buttons-${platform.name}`, container);
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
            const { container } = render(_jsx(AdaptiveNavigation, { title: "Mobile App", items: navigationItems, activeItem: "home", onNavigate: () => { } }));
            await visualRegression.capture('adaptive-navigation-mobile', container);
        });
        it('should match tablet navigation rail', async () => {
            mockPlatform(platformPresets.android);
            mockViewport(viewportPresets.tablet.width, viewportPresets.tablet.height);
            const { container } = render(_jsx(AdaptiveNavigation, { title: "Tablet App", items: navigationItems, activeItem: "search", onNavigate: () => { } }));
            await visualRegression.capture('adaptive-navigation-tablet', container);
        });
        it('should match desktop side navigation', async () => {
            mockPlatform(platformPresets.desktop);
            mockViewport(viewportPresets.desktop.width, viewportPresets.desktop.height);
            const { container } = render(_jsx(AdaptiveNavigation, { title: "Desktop App", items: navigationItems, activeItem: "settings", onNavigate: () => { } }));
            await visualRegression.capture('adaptive-navigation-desktop', container);
        });
    });
    describe('Theme Variations', () => {
        it('should match light theme components', async () => {
            document.documentElement.setAttribute('data-theme', 'light');
            const { container } = render(_jsx("div", { style: { padding: '20px', background: 'var(--color-background)' }, children: _jsx(MobileCard, { title: "Light Theme Card", description: "This card should render in light theme", footer: _jsxs("div", { style: { display: 'flex', gap: '10px' }, children: [_jsx(MobileButton, { variant: "primary", size: "small", children: "Action" }), _jsx(MobileButton, { variant: "secondary", size: "small", children: "Cancel" })] }), children: _jsx("div", { style: { padding: '20px', background: 'var(--color-surface)' }, children: "Card content in light theme" }) }) }));
            await visualRegression.capture('theme-light', container);
        });
        it('should match dark theme components', async () => {
            document.documentElement.setAttribute('data-theme', 'dark');
            const { container } = render(_jsx("div", { style: { padding: '20px', background: 'var(--color-background)' }, children: _jsx(MobileCard, { title: "Dark Theme Card", description: "This card should render in dark theme", footer: _jsxs("div", { style: { display: 'flex', gap: '10px' }, children: [_jsx(MobileButton, { variant: "primary", size: "small", children: "Action" }), _jsx(MobileButton, { variant: "secondary", size: "small", children: "Cancel" })] }), children: _jsx("div", { style: { padding: '20px', background: 'var(--color-surface)' }, children: "Card content in dark theme" }) }) }));
            await visualRegression.capture('theme-dark', container);
        });
    });
    describe('Component States', () => {
        it('should match hover states', async () => {
            mockPlatform(platformPresets.desktop);
            const { container } = render(_jsxs("div", { style: { display: 'flex', gap: '20px', padding: '20px' }, children: [_jsx("button", { className: "desktop-button", children: "Normal" }), _jsx("button", { className: "desktop-button hover", children: "Hover" }), _jsx("button", { className: "desktop-button active", children: "Active" }), _jsx("button", { className: "desktop-button focus", children: "Focus" }), _jsx("button", { className: "desktop-button", disabled: true, children: "Disabled" })] }));
            await visualRegression.capture('component-states', container);
        });
    });
});
/**
 * Visual regression comparison tests
 */
describe('Visual Regression Comparisons', () => {
    it('should detect visual changes', async () => {
        // This would compare against baseline images in a real implementation
        const result = await visualRegression.compare('test-component', 'baseline.png', 'current.png');
        expect(result.match).toBe(true);
        expect(result.diff).toBeLessThan(0.01); // Less than 1% difference
    });
});
//# sourceMappingURL=visual-regression.test.js.map