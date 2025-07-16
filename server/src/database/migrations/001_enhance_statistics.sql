-- Migration to enhance statistics table with new effectiveness metrics
-- Story 8.2.4 - Enhanced Statistics and Tracking

-- Add new columns to correction_statistics table
ALTER TABLE correction_statistics ADD COLUMN quality_score REAL DEFAULT 0.0;
ALTER TABLE correction_statistics ADD COLUMN impact_rating REAL DEFAULT 1.0;
ALTER TABLE correction_statistics ADD COLUMN false_positive_count INTEGER DEFAULT 0;
ALTER TABLE correction_statistics ADD COLUMN user_feedback_score REAL;
ALTER TABLE correction_statistics ADD COLUMN avg_characters_saved REAL DEFAULT 0.0;
ALTER TABLE correction_statistics ADD COLUMN complexity_score REAL DEFAULT 1.0;

-- Update existing records with default values
UPDATE correction_statistics 
SET quality_score = 50.0, 
    impact_rating = 2.0, 
    false_positive_count = 0,
    avg_characters_saved = 0.0,
    complexity_score = 1.0
WHERE quality_score IS NULL OR quality_score = 0.0;