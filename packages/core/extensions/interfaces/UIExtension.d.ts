/**
 * UI Extension Interface - Epic 8.4 Story 8.4.2
 * Defines interfaces for extending the user interface system
 */
import React from 'react';
import { BaseExtension, ExtensionContext, ExtensionValidationResult } from './ExtensionInterfaces';

export interface UIExtension extends BaseExtension {
    readonly extensionType: 'ui';
    getComponentDefinitions(): UIComponentDefinition[];
    createComponentInstance(componentId: string, props: any): React.ComponentType<any>;
    getThemeContributions(): ThemeContribution[];
    getCommandContributions(): CommandContribution[];
    getMenuContributions(): MenuContribution[];
    getKeybindingContributions(): KeybindingContribution[];
    onUIInitialized?(context: ExtensionContext): void;
    onUIDestroyed?(context: ExtensionContext): void;
    onThemeChanged?(theme: Theme): void;

export interface UIComponentDefinition {
    id: string;
    name: string;
    category: UIComponentCategory;
    description: string;
    version: string;
    component: React.ComponentType<any>;
    propsSchema?: any;
    ui: UIComponentUIConfiguration;
    runtime: UIComponentRuntimeConfiguration;
    metadata: UIComponentMetadata;

export declare enum UIComponentCategory {
    EDITOR = "editor",
    PANEL = "panel",
    MODAL = "modal",
    TOOLBAR = "toolbar",
    MENU = "menu",
    WIDGET = "widget",
    OVERLAY = "overlay",
    CUSTOM = "custom"

export interface UIComponentUIConfiguration {
    layout?: UIComponentLayout;
    styling?: UIComponentStyling;
    responsive?: UIComponentResponsive;
    accessibility?: UIComponentAccessibility;

export interface UIComponentLayout {
    position?: 'fixed' | 'absolute' | 'relative' | 'sticky';
    zIndex?: number;
    width?: string | number;
    height?: string | number;
    minWidth?: string | number;
    maxWidth?: string | number;
    minHeight?: string | number;
    maxHeight?: string | number;
    resizable?: boolean;
    draggable?: boolean;

export interface UIComponentStyling {
    className?: string;
    style?: React.CSSProperties;
    theme?: string;
    variant?: string;
    customCSS?: string;

export interface UIComponentResponsive {
    breakpoints?: {
        mobile?: UIComponentLayout;
        tablet?: UIComponentLayout;
        desktop?: UIComponentLayout;
    };
    hideOnMobile?: boolean;
    hideOnTablet?: boolean;
    hideOnDesktop?: boolean;

export interface UIComponentAccessibility {
    role?: string;
    ariaLabel?: string;
    ariaDescribedBy?: string;
    tabIndex?: number;
    focusable?: boolean;
    keyboardNavigation?: boolean;
    screenReaderSupport?: boolean;

export interface UIComponentRuntimeConfiguration {
    lazy?: boolean;
    suspense?: boolean;
    errorBoundary?: boolean;
    performance?: UIComponentPerformance;
    state?: UIComponentStateConfiguration;
    events?: UIComponentEventConfiguration;

export interface UIComponentPerformance {
    memo?: boolean;
    virtualizeList?: boolean;
    debounceUpdates?: number;
    throttleUpdates?: number;
    measurePerformance?: boolean;

export interface UIComponentStateConfiguration {
    persist?: boolean;
    scope?: 'global' | 'session' | 'local';
    initialState?: any;
    reducer?: (state: any, action: any) => any;

export interface UIComponentEventConfiguration {
    preventDefault?: string[];
    stopPropagation?: string[];
    capture?: string[];
    passive?: string[];

export interface UIComponentMetadata {
    author: string;
    license: string;
    repository?: string;
    documentation?: string;
    examples?: UIComponentExample[];
    screenshots?: string[];
    compatibility?: {
        minVersion: string;
        maxVersion?: string;
        browsers?: string[];
        devices?: string[];
    };
    tags?: string[];
    keywords?: string[];

export interface UIComponentExample {
    name: string;
    description: string;
    props: any;
    code?: string;
    preview?: string;

export interface ThemeContribution {
    id: string;
    name: string;
    description: string;
    type: 'light' | 'dark' | 'auto';
    colors: ThemeColors;
    typography: ThemeTypography;
    spacing: ThemeSpacing;
    shadows: ThemeShadows;
    borders: ThemeBorders;
    transitions: ThemeTransitions;
    custom?: Record<string, any>;

export interface ThemeColors {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    warning: string;
    success: string;
    info: string;
    extended?: Record<string, string>;

export interface ThemeTypography {
    fontFamily: string;
    fontSize: {,
        xs: string;
        sm: string;
        md: string;
        lg: string;
        xl: string;
        '2xl': string;
        '3xl': string;
    };
    fontWeight: {,
        light: number;
        normal: number;
        medium: number;
        semibold: number;
        bold: number;
    };
    lineHeight: {,
        tight: number;
        normal: number;
        relaxed: number;
    };
    letterSpacing: {,
        tight: string;
        normal: string;
        wide: string;
    };

export interface ThemeSpacing {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    custom?: Record<string, string>;

export interface ThemeShadows {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    none: string;
    custom?: Record<string, string>;

export interface ThemeBorders {
    width: {,
        thin: string;
        normal: string;
        thick: string;
    };
    radius: {,
        none: string;
        sm: string;
        md: string;
        lg: string;
        full: string;
    };
    style: {,
        solid: string;
        dashed: string;
        dotted: string;
    };

export interface ThemeTransitions {
    duration: {,
        fast: string;
        normal: string;
        slow: string;
    };
    easing: {,
        linear: string;
        ease: string;
        easeIn: string;
        easeOut: string;
        easeInOut: string;
    };

export interface CommandContribution {
    id: string;
    title: string;
    description?: string;
    category?: string;
    icon?: string;
    handler: CommandHandler;
    enablement?: CommandEnablement;
    keybinding?: string;
    context?: string[];

export interface CommandHandler {
    (context: ExtensionContext, ...args: any[]): Promise<any> | any;

export interface CommandEnablement {
    when?: string;
    contexts?: string[];
    permissions?: string[];

export interface MenuContribution {
    id: string;
    label: string;
    icon?: string;
    order?: number;
    type: 'item' | 'submenu' | 'separator';
    command?: string;
    submenu?: MenuContribution[];
    when?: string;
    menu: MenuTarget;

export declare enum MenuTarget {
    MAIN_MENU = "main",
    CONTEXT_MENU = "context",
    TOOLBAR = "toolbar",
    PALETTE = "palette",
    INSPECTOR = "inspector",
    GRAPH = "graph",
    CUSTOM = "custom"

export interface KeybindingContribution {
    id: string;
    key: string;
    command: string;
    when?: string;
    args?: any[];
    mac?: string;
    win?: string;
    linux?: string;

export interface Theme {
    id: string;
    name: string;
    type: 'light' | 'dark' | 'auto';
    colors: ThemeColors;
    typography: ThemeTypography;
    spacing: ThemeSpacing;
    shadows: ThemeShadows;
    borders: ThemeBorders;
    transitions: ThemeTransitions;
    custom?: Record<string, any>;

export interface UIContextManager {
    registerComponent(definition: UIComponentDefinition): void;
    unregisterComponent(componentId: string): void;
    getComponent(componentId: string): UIComponentDefinition | undefined;
    getAllComponents(): UIComponentDefinition[];
    registerTheme(theme: ThemeContribution): void;
    unregisterTheme(themeId: string): void;
    getTheme(themeId: string): ThemeContribution | undefined;
    getAllThemes(): ThemeContribution[];
    setActiveTheme(themeId: string): void;
    getActiveTheme(): ThemeContribution | undefined;
    registerCommand(command: CommandContribution): void;
    unregisterCommand(commandId: string): void;
    executeCommand(commandId: string, ...args: any[]): Promise<any>;
    getCommand(commandId: string): CommandContribution | undefined;
    getAllCommands(): CommandContribution[];
    registerMenu(menu: MenuContribution): void;
    unregisterMenu(menuId: string): void;
    getMenu(menuId: string): MenuContribution | undefined;
    getMenusByTarget(target: MenuTarget): MenuContribution[];
    registerKeybinding(keybinding: KeybindingContribution): void;
    unregisterKeybinding(keybindingId: string): void;
    getKeybinding(keybindingId: string): KeybindingContribution | undefined;
    getAllKeybindings(): KeybindingContribution[];
    on(event: string, listener: (...args: any[]) => void): void;
    off(event: string, listener: (...args: any[]) => void): void;
    emit(event: string, ...args: any[]): void;

export interface UIComponentFactory {
    create(componentId: string, props: any): React.ComponentType<any>;
    canCreate(componentId: string): boolean;
    getPropsSchema(componentId: string): any;
    validateProps(componentId: string, props: any): ExtensionValidationResult;

export declare namespace UIExtensionHelpers {
    function createTheme(partial: Partial<ThemeContribution>): ThemeContribution;
    function createCommand(partial: Partial<CommandContribution>): CommandContribution;
    function createMenu(partial: Partial<MenuContribution>): MenuContribution;
    function validateUIComponent(definition: UIComponentDefinition): ExtensionValidationResult;

//# sourceMappingURL=UIExtension.d.ts.map