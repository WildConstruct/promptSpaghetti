-- Migration: Add tables for theme customization feature

CREATE TABLE theme_config (
  id SERIAL PRIMARY KEY,
  colors JSONB,
  typography JSONB,
  branding JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE uploaded_fonts (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(255),
  original_name VARCHAR(255),
  file_path VARCHAR(500),
  font_family VARCHAR(100),
  font_weight VARCHAR(50),
  uploaded_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE logo (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(255),
  file_path VARCHAR(500),
  uploaded_at TIMESTAMP DEFAULT NOW()
);
