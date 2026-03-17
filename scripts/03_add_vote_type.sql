-- Migration: Add vote type and denormalized score columns
-- Run this in Supabase SQL Editor

-- Add type column to votes table
ALTER TABLE votes ADD COLUMN IF NOT EXISTS type VARCHAR(4) NOT NULL DEFAULT 'up' CHECK (type IN ('up', 'down'));

-- Drop old unique constraint and create new one including type
-- (allow changing vote type by deleting and re-inserting)
-- The unique constraint on (project_id, user_id) already prevents duplicate votes

-- Add denormalized count columns to projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS upvotes INTEGER NOT NULL DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS downvotes INTEGER NOT NULL DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS score INTEGER NOT NULL DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS short_description VARCHAR(200);

-- Add profile fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS github_url VARCHAR(500);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS portfolio_url VARCHAR(500);

-- Create index on score for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_projects_score ON projects(score DESC);

-- Function to recalculate project vote counts
CREATE OR REPLACE FUNCTION recalculate_project_votes(p_project_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE projects SET
    upvotes = COALESCE((SELECT COUNT(*) FROM votes WHERE project_id = p_project_id AND type = 'up'), 0),
    downvotes = COALESCE((SELECT COUNT(*) FROM votes WHERE project_id = p_project_id AND type = 'down'), 0),
    score = COALESCE((SELECT COUNT(*) FROM votes WHERE project_id = p_project_id AND type = 'up'), 0) -
            COALESCE((SELECT COUNT(*) FROM votes WHERE project_id = p_project_id AND type = 'down'), 0)
  WHERE id = p_project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-update on vote changes
CREATE OR REPLACE FUNCTION update_project_votes_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM recalculate_project_votes(OLD.project_id);
    RETURN OLD;
  ELSE
    PERFORM recalculate_project_votes(NEW.project_id);
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_vote_change ON votes;
CREATE TRIGGER on_vote_change
  AFTER INSERT OR UPDATE OR DELETE ON votes
  FOR EACH ROW EXECUTE FUNCTION update_project_votes_trigger();

-- Backfill existing votes (all existing votes become 'up' type)
-- and recalculate scores
DO $$
DECLARE
  proj RECORD;
BEGIN
  FOR proj IN SELECT DISTINCT id FROM projects LOOP
    PERFORM recalculate_project_votes(proj.id);
  END LOOP;
END $$;
