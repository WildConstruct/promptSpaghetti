-- Template test data seed
-- Provides sample template data for comprehensive testing

INSERT INTO templates (id, name, description, category_id, author_id, version, is_public, graph_data, variables, usage_count, average_rating, download_count, favorite_count, created_at, updated_at) VALUES
(1, 'Business Proposal', 'Professional business proposal template', 1, 1, '1.0.0', true, '{"nodes": [{"id": "1", "type": "input", "data": {"label": "Company Name"}}], "edges": []}', '[]', 150, 4.5, 1200, 45, NOW() - INTERVAL '20 days', NOW()),
(2, 'Marketing Email', 'Email marketing campaign template', 3, 2, '1.2.0', true, '{"nodes": [{"id": "1", "type": "input", "data": {"label": "Subject Line"}}], "edges": []}', '[]', 89, 4.2, 750, 32, NOW() - INTERVAL '15 days', NOW()),
(3, 'API Documentation', 'REST API documentation template', 6, 2, '2.1.0', true, '{"nodes": [{"id": "1", "type": "input", "data": {"label": "Endpoint"}}], "edges": []}', '[]', 45, 4.8, 320, 18, NOW() - INTERVAL '10 days', NOW()),
(4, 'Sales Pitch', 'Compelling sales pitch template', 4, 3, '1.0.0', true, '{"nodes": [{"id": "1", "type": "input", "data": {"label": "Product Name"}}], "edges": []}', '[]', 67, 3.9, 450, 25, NOW() - INTERVAL '12 days', NOW()),
(5, 'React Component', 'React component documentation template', 5, 1, '1.5.0', true, '{"nodes": [{"id": "1", "type": "input", "data": {"label": "Component Name"}}], "edges": []}', '[]', 123, 4.6, 890, 56, NOW() - INTERVAL '8 days', NOW()),
(6, 'Private Template', 'Internal use only template', 1, 1, '1.0.0', false, '{"nodes": [], "edges": []}', '[]', 5, 5.0, 8, 2, NOW() - INTERVAL '5 days', NOW()),
(7, 'Course Outline', 'Educational course structure template', 7, 2, '1.1.0', true, '{"nodes": [{"id": "1", "type": "input", "data": {"label": "Course Title"}}], "edges": []}', '[]', 34, 4.3, 210, 12, NOW() - INTERVAL '7 days', NOW());

-- Reset sequence
SELECT setval('templates_id_seq', COALESCE((SELECT MAX(id) + 1 FROM templates), 1), false);