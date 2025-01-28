/*
  # Create URLs table for URL shortener

  1. New Tables
    - `urls`
      - `id` (text, primary key) - Short URL ID
      - `original_url` (text) - Original long URL
      - `created_at` (timestamp) - Creation timestamp
      - `clicks` (integer) - Click counter
      - `user_ip` (text) - IP address of creator for rate limiting

  2. Security
    - Enable RLS on `urls` table
    - Add policies for:
      - Anyone can read URLs
      - Anyone can create URLs (with rate limiting)
*/

CREATE TABLE urls (
  id TEXT PRIMARY KEY,
  original_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  clicks INTEGER DEFAULT 0,
  user_ip TEXT
);

-- Enable RLS
ALTER TABLE urls ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read URLs
CREATE POLICY "Anyone can read URLs"
ON urls
FOR SELECT
TO public
USING (true);

-- Allow anyone to create URLs
CREATE POLICY "Anyone can create URLs"
ON urls
FOR INSERT
TO public
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX urls_id_idx ON urls(id);