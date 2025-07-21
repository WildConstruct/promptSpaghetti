-- Category test data seed
-- Provides hierarchical category data for testing

INSERT INTO categories (id, name, slug, description, parent_id, sort_order, is_active, created_at, updated_at) VALUES
(1, 'Business', 'business', 'Business templates and documents', NULL, 1, true, NOW() - INTERVAL '25 days', NOW()),
(2, 'Development', 'development', 'Software development templates', NULL, 2, true, NOW() - INTERVAL '25 days', NOW()),
(3, 'Marketing', 'marketing', 'Marketing campaign templates', 1, 1, true, NOW() - INTERVAL '20 days', NOW()),
(4, 'Sales', 'sales', 'Sales process templates', 1, 2, true, NOW() - INTERVAL '20 days', NOW()),
(5, 'Frontend', 'frontend', 'Frontend development templates', 2, 1, true, NOW() - INTERVAL '18 days', NOW()),
(6, 'Backend', 'backend', 'Backend development templates', 2, 2, true, NOW() - INTERVAL '18 days', NOW()),
(7, 'Education', 'education', 'Educational templates', NULL, 3, true, NOW() - INTERVAL '15 days', NOW()),
(8, 'Archived', 'archived', 'Archived category', NULL, 999, false, NOW() - INTERVAL '30 days', NOW());

-- Reset sequence
SELECT setval('categories_id_seq', COALESCE((SELECT MAX(id) + 1 FROM categories), 1), false);