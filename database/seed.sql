-- Sample data for local development.
-- Password for this seed user is "password123" (bcrypt hash below).
INSERT INTO users (name, email, password)
VALUES ('Demo User', 'demo@homedrive.local', '$2b$10$CwTycUXWue0Thq9StjUM0uJ8b7ZoQ4Q3pBidHY9pfvXRLBOWpHu3S')
ON CONFLICT (email) DO NOTHING;

INSERT INTO folders (user_id, name, parent_id)
SELECT id, 'Documents', NULL FROM users WHERE email = 'demo@homedrive.local'
ON CONFLICT DO NOTHING;

INSERT INTO folders (user_id, name, parent_id)
SELECT id, 'Photos', NULL FROM users WHERE email = 'demo@homedrive.local'
ON CONFLICT DO NOTHING;
