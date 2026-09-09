-- Extended database schema for HireCraft Career Positioning Diagnostic & Lead Intelligence System

-- 1. Create diagnostic_sessions table
CREATE TABLE IF NOT EXISTS diagnostic_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Contact details
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  
  -- Career snapshot
  career_stage text NOT NULL,
  opportunity_type text NOT NULL,
  
  -- Target Direction
  target_role text NOT NULL,
  opportunity_timeline text NOT NULL,
  
  -- Links & Upload references
  linkedin_url text,
  portfolio_url text,
  github_url text,
  resume_url text,
  jd_url text,
  jd_text text,
  
  -- Career context answers
  achievement_context text,
  problem_solving_context text,
  recruiter_memory_context text,
  underselling_context text,
  
  -- Rule-based / AI Diagnostic output scores (0-100)
  career_direction_score integer DEFAULT 0,
  impact_evidence_score integer DEFAULT 0,
  opportunity_alignment_score integer DEFAULT 0,
  differentiation_score integer DEFAULT 0,
  
  -- Generated positioning snapshot
  current_signal text,
  positioning_summary text,
  primary_opportunity text,
  
  -- Internal Lead Qualification metadata
  lead_segment text,
  urgency text,
  diagnostic_complexity text,
  status text DEFAULT 'New', -- 'New', 'Contacted', 'Consultation Scheduled', 'In Progress', 'Converted', 'Closed'
  internal_notes text
);

-- Enable RLS on diagnostic_sessions
ALTER TABLE diagnostic_sessions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous public submission of diagnostic sessions
CREATE POLICY "Allow public insert to diagnostic_sessions" ON diagnostic_sessions
  FOR INSERT WITH CHECK (true);

-- Allow public read of their own session or public read (simplified for token/session view)
CREATE POLICY "Allow public select on diagnostic_sessions" ON diagnostic_sessions
  FOR SELECT USING (true);

-- Allow update of diagnostic_sessions (for updating consultation request details / status)
CREATE POLICY "Allow public update to diagnostic_sessions" ON diagnostic_sessions
  FOR UPDATE USING (true);

-- Create Storage bucket for resumes and JDs if executing in Supabase dashboard:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('hirecraft_docs', 'hirecraft_docs', true);
