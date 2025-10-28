export interface ThemeBranding {
  defaultText?: string;
  [key: string]: string | undefined;
}

export interface ThemeTypography {
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  lineHeight?: string;
  [key: string]: string | undefined;
}

export type ThemeColors = Record<string, string>;

export interface ThemeFont {
  id: string;
  filename: string;
  fontFamily: string;
  fontWeight: string;
  uploadedAt: string;
}

export interface ThemeConfig {
  colors: ThemeColors;
  typography: ThemeTypography;
  branding: ThemeBranding;
  fonts?: ThemeFont[];
}
