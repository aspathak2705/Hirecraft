-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  target_role text NOT NULL,
  message text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create audits table
CREATE TABLE IF NOT EXISTS audits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  score integer NOT NULL,
  answers jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS (Row Level Security)
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;

-- Allow anonymous public submissions
CREATE POLICY "Allow public insert to bookings" ON bookings 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert to audits" ON audits 
  FOR INSERT WITH CHECK (true);

-- Allow authenticated/admin users to read records
CREATE POLICY "Allow authenticated read to bookings" ON bookings 
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read to audits" ON audits 
  FOR SELECT TO authenticated USING (true);
