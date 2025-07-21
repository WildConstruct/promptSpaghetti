-- User test data seed
-- Provides initial user data for database testing

INSERT INTO users (id, email, username, first_name, last_name, role, is_active, created_at, updated_at) VALUES
(1, 'admin@test.com', 'admin', 'Admin', 'User', 'admin', true, NOW() - INTERVAL '30 days', NOW()),
(2, 'john.doe@test.com', 'johndoe', 'John', 'Doe', 'user', true, NOW() - INTERVAL '15 days', NOW()),
(3, 'jane.smith@test.com', 'janesmith', 'Jane', 'Smith', 'moderator', true, NOW() - INTERVAL '10 days', NOW()),
(4, 'inactive@test.com', 'inactive', 'Inactive', 'User', 'user', false, NOW() - INTERVAL '5 days', NOW());

-- Reset sequence to continue from highest ID
SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) + 1 FROM users), 1), false);