-- Enable Row Level Security on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Projects policies
CREATE POLICY "Enable read access for all users" ON projects
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for users based on user_id" ON projects
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete for users based on user_id" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- Votes policies
CREATE POLICY "Enable read access for all users" ON votes
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete for users based on user_id" ON votes
  FOR DELETE USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Enable read access for all users" ON comments
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for users based on user_id" ON comments
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete for users based on user_id" ON comments
  FOR DELETE USING (auth.uid() = user_id);

-- Profiles policies
CREATE POLICY "Enable read access for all users" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users based on id" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
