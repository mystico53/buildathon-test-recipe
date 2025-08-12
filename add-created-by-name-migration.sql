-- Migration: Add created_by_name column to workspace_items table
-- Run this if you already have the workspace_items table created

ALTER TABLE workspace_items ADD COLUMN IF NOT EXISTS created_by_name text;