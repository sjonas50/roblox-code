-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- Profiles policies
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Projects policies
-- Users can view their own projects
CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own projects
CREATE POLICY "Users can create own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own projects
CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own projects
CREATE POLICY "Users can delete own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- Public projects can be viewed by anyone
CREATE POLICY "Public projects are viewable" ON projects
  FOR SELECT USING (is_public = true);

-- Scripts policies
-- Users can view scripts in their projects
CREATE POLICY "Users can view scripts in own projects" ON scripts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = scripts.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Users can view scripts in public projects
CREATE POLICY "Public project scripts are viewable" ON scripts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = scripts.project_id
      AND projects.is_public = true
    )
  );

-- Users can create scripts in their projects
CREATE POLICY "Users can create scripts in own projects" ON scripts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = scripts.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Users can update scripts in their projects
CREATE POLICY "Users can update scripts in own projects" ON scripts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = scripts.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Users can delete scripts in their projects
CREATE POLICY "Users can delete scripts in own projects" ON scripts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = scripts.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Code versions policies
-- Users can view versions of scripts in their projects
CREATE POLICY "Users can view versions of own scripts" ON code_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM scripts
      JOIN projects ON projects.id = scripts.project_id
      WHERE scripts.id = code_versions.script_id
      AND projects.user_id = auth.uid()
    )
  );

-- Users can create versions of scripts in their projects
CREATE POLICY "Users can create versions of own scripts" ON code_versions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM scripts
      JOIN projects ON projects.id = scripts.project_id
      WHERE scripts.id = code_versions.script_id
      AND projects.user_id = auth.uid()
    )
    AND created_by = auth.uid()
  );

-- Generation sessions policies
-- Users can view their own generation sessions
CREATE POLICY "Users can view own generation sessions" ON generation_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own generation sessions
CREATE POLICY "Users can create own generation sessions" ON generation_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Templates policies
-- Public templates can be viewed by anyone
CREATE POLICY "Public templates are viewable" ON templates
  FOR SELECT USING (is_public = true);

-- Users can view their own templates
CREATE POLICY "Users can view own templates" ON templates
  FOR SELECT USING (auth.uid() = created_by);

-- Users can create templates
CREATE POLICY "Users can create templates" ON templates
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Users can update their own templates
CREATE POLICY "Users can update own templates" ON templates
  FOR UPDATE USING (auth.uid() = created_by);

-- Users can delete their own templates
CREATE POLICY "Users can delete own templates" ON templates
  FOR DELETE USING (auth.uid() = created_by);

-- Template scripts policies
-- Can view scripts of public templates
CREATE POLICY "Public template scripts are viewable" ON template_scripts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM templates
      WHERE templates.id = template_scripts.template_id
      AND templates.is_public = true
    )
  );

-- Can view scripts of own templates
CREATE POLICY "Users can view own template scripts" ON template_scripts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM templates
      WHERE templates.id = template_scripts.template_id
      AND templates.created_by = auth.uid()
    )
  );

-- Users can manage scripts in their templates
CREATE POLICY "Users can manage own template scripts" ON template_scripts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM templates
      WHERE templates.id = template_scripts.template_id
      AND templates.created_by = auth.uid()
    )
  );

-- Usage tracking policies
-- Users can view their own usage
CREATE POLICY "Users can view own usage" ON usage_tracking
  FOR SELECT USING (auth.uid() = user_id);

-- System can insert usage tracking
CREATE POLICY "System can track usage" ON usage_tracking
  FOR INSERT WITH CHECK (auth.uid() = user_id);