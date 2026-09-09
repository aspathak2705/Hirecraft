-- Extended database schema for HireCraft Career Positioning & Document Evidence Intelligence System (Phase 2)

-- 1. Create diagnostic_sessions table
CREATE TABLE IF NOT EXISTS diagnostic_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Contact details
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  
  -- Career snapshot & Target direction
  career_stage text NOT NULL,
  opportunity_type text NOT NULL,
  target_role text NOT NULL,
  opportunity_timeline text NOT NULL,
  
  -- Online Artifact Links
  linkedin_url text,
  portfolio_url text,
  github_url text,
  
  -- Storage paths (Private Storage - NO public URLs)
  resume_storage_path text,
  resume_file_name text,
  resume_file_size integer,
  resume_file_type text,

  jd_storage_path text,
  jd_file_name text,
  jd_file_size integer,
  jd_file_type text,
  jd_text text,
  
  -- Persisted Career context answers
  achievement_context text,
  problem_solving_context text,
  recruiter_memory_context text,
  underselling_context text,
  
  -- Performance breakdown scores (0-100)
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
  status text DEFAULT 'New', -- 'New', 'Consultation Requested', 'Contacted', 'Consultation Scheduled', 'In Progress', 'Converted', 'Closed'
  internal_notes text
);

-- 2. Create documents table (Document Metadata & Text Extraction)
CREATE TABLE IF NOT EXISTS documents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  diagnostic_session_id uuid REFERENCES diagnostic_sessions(id) ON DELETE CASCADE,
  document_type text NOT NULL, -- 'resume', 'job_description'
  file_name text NOT NULL,
  mime_type text NOT NULL,
  file_size integer NOT NULL,
  storage_path text NOT NULL,
  processing_status text DEFAULT 'uploaded', -- 'uploaded', 'processing', 'processed', 'failed', 'requires_review'
  processing_error text,
  raw_extracted_text text,
  normalized_text text,
  extracted_text_length integer DEFAULT 0,
  checksum text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create document_sections table (Detected Resume Sections)
CREATE TABLE IF NOT EXISTS document_sections (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE,
  section_type text NOT NULL, -- 'experience', 'projects', 'skills', 'education', 'certifications', 'summary', 'unknown'
  section_title text NOT NULL,
  content text NOT NULL,
  start_offset integer DEFAULT 0,
  end_offset integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create evidence_items table (Extracted Evidence Ledger & Traceability)
CREATE TABLE IF NOT EXISTS evidence_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  diagnostic_session_id uuid REFERENCES diagnostic_sessions(id) ON DELETE CASCADE,
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE,
  evidence_type text NOT NULL, -- 'quantitative_metric', 'impact_signal', 'technology', 'experience', 'project', 'education', 'certification', 'user_context'
  category text, -- 'Programming Language', 'Cloud', 'Framework', 'Leadership', 'Metrics', etc.
  source_text text NOT NULL,
  normalized_text text NOT NULL,
  confidence text DEFAULT 'medium', -- 'high', 'medium', 'low'
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create job_opportunities table (Structured Job Descriptions)
CREATE TABLE IF NOT EXISTS job_opportunities (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  diagnostic_session_id uuid REFERENCES diagnostic_sessions(id) ON DELETE CASCADE,
  job_title text,
  company text,
  jd_text text,
  jd_storage_path text,
  processing_status text DEFAULT 'processed',
  required_skills jsonb DEFAULT '[]'::jsonb,
  preferred_skills jsonb DEFAULT '[]'::jsonb,
  responsibilities jsonb DEFAULT '[]'::jsonb,
  experience_requirements text,
  domain_terms jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Create admin_roles table (Explicit Admin Role Mapping for RLS)
CREATE TABLE IF NOT EXISTS admin_roles (
  user_id uuid PRIMARY KEY,
  role text DEFAULT 'admin' NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Create career_intelligence table (Versioned Grounded LLM Career Positioning Intelligence)
CREATE TABLE IF NOT EXISTS career_intelligence (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  diagnostic_session_id uuid REFERENCES diagnostic_sessions(id) ON DELETE CASCADE,
  model text DEFAULT 'nvidia/nemotron-3-super-120b-a12b:free' NOT NULL,
  provider text DEFAULT 'openrouter' NOT NULL,
  analysis_version text DEFAULT 'v1.0' NOT NULL,
  analysis_status text DEFAULT 'completed' NOT NULL, -- 'queued', 'processing', 'completed', 'failed'
  
  -- Structured Intelligence Output
  positioning_summary text,
  current_professional_signal text,
  target_role_interpretation text,
  career_narrative text,
  primary_positioning_opportunity text,
  
  -- Grounded Arrays / Objects
  strengths jsonb DEFAULT '[]'::jsonb,
  differentiators jsonb DEFAULT '[]'::jsonb,
  evidence_gaps jsonb DEFAULT '[]'::jsonb,
  positioning_risks jsonb DEFAULT '[]'::jsonb,
  recruiter_perception jsonb DEFAULT '{}'::jsonb,
  opportunity_alignment jsonb DEFAULT '{}'::jsonb,
  recommendations jsonb DEFAULT '[]'::jsonb,
  achievement_investigation_questions jsonb DEFAULT '[]'::jsonb,
  career_dna jsonb DEFAULT '{}'::jsonb,
  
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_documents_session ON documents(diagnostic_session_id);
CREATE INDEX IF NOT EXISTS idx_sections_document ON document_sections(document_id);
CREATE INDEX IF NOT EXISTS idx_evidence_session ON evidence_items(diagnostic_session_id);
CREATE INDEX IF NOT EXISTS idx_evidence_document ON evidence_items(document_id);
CREATE INDEX IF NOT EXISTS idx_career_intelligence_session ON career_intelligence(diagnostic_session_id);

-- Enable RLS on all tables
ALTER TABLE diagnostic_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_intelligence ENABLE ROW LEVEL SECURITY;

-- Security Policies (RLS)
-- 1. Public (anon) users can submit (INSERT) their diagnostic session & related telemetry
CREATE POLICY "Public insert diagnostic_sessions" ON diagnostic_sessions FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public insert documents" ON documents FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public insert document_sections" ON document_sections FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public insert evidence_items" ON evidence_items FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public insert job_opportunities" ON job_opportunities FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public insert career_intelligence" ON career_intelligence FOR INSERT TO public WITH CHECK (true);

-- 2. Restrict SELECT/UPDATE of sensitive diagnostic, document, evidence, and AI intelligence tables to authenticated users/admins
CREATE POLICY "Authenticated admin select diagnostic_sessions" ON diagnostic_sessions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated admin update status and notes" ON diagnostic_sessions FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated admin select documents" ON documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated admin select document_sections" ON document_sections FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated admin select evidence_items" ON evidence_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated admin select job_opportunities" ON job_opportunities FOR SELECT TO authenticated USING (true);

CREATE POLICY "Public select career_intelligence" ON career_intelligence FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated admin select career_intelligence" ON career_intelligence FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin select admin_roles" ON admin_roles FOR SELECT TO authenticated USING (true);

-- Private Storage Bucket Initialization Note:
-- Bucket name: 'hirecraft_docs'
-- Setting: public = false (PRIVATE BUCKET)
-- Access: Signed URLs with expiration
