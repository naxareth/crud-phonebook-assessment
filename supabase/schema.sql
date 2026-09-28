-- Phonebook Database Schema (Supabase PostgreSQL)
-- Assessment: Full Stack Development Intern Assessment
-- Table: contacts

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop table if resetting
-- DROP TABLE IF EXISTS contacts;

CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL CHECK (char_length(trim(name)) > 0),
    phone TEXT NOT NULL CHECK (char_length(trim(phone)) > 0),
    email TEXT CHECK (email IS NULL OR char_length(trim(email)) > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for ordering by name ascending (case-insensitive)
CREATE INDEX IF NOT EXISTS idx_contacts_name ON contacts (lower(name) ASC);

-- Enable Row Level Security (RLS)
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Note on RLS and Security Architecture:
-- In our server-backed architecture (React -> Express -> Supabase),
-- Express connects to Supabase using a server-side secret/service-role key, which bypasses RLS
-- and performs all validation server-side.
-- Direct anonymous access from the browser is not permitted.

-- Seed initial demo contacts with deterministic IDs for idempotent schema execution
INSERT INTO contacts (id, name, phone, email) VALUES
    ('a0000000-0000-0000-0000-000000000001', 'Arthur Pendelton', '+1 (555) 234-5678', 'arthur.p@example.com'),
    ('a0000000-0000-0000-0000-000000000002', 'Beatrix Thorne', '+44 20 7946 0912', 'beatrix@thorne-books.co.uk'),
    ('a0000000-0000-0000-0000-000000000003', 'Clara Oswald', '07700 900461', 'clara.oswald@example.org'),
    ('a0000000-0000-0000-0000-000000000004', 'David Chen', '+1 (555) 890-1234', NULL),
    ('a0000000-0000-0000-0000-000000000005', 'Eleanor Vance', '+1 (555) 432-8765', 'eleanor.vance@hillhouse.net'),
    ('a0000000-0000-0000-0000-000000000006', 'Julian Croft', '+61 2 9876 5432', 'j.croft@archivedept.gov.au')
ON CONFLICT (id) DO NOTHING;
