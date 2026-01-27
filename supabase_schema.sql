-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabel daftar_nama (data peserta untuk search)
CREATE TABLE IF NOT EXISTS daftar_nama (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama VARCHAR(255) NOT NULL,
  jabatan VARCHAR(255) NOT NULL,
  departemen_instansi VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) for daftar_nama
ALTER TABLE daftar_nama ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access to daftar_nama (for search)
CREATE POLICY "Allow public read access" ON daftar_nama
  FOR SELECT USING (true);

-- Tabel daftar_hadir (data registrasi yang masuk)
CREATE TABLE IF NOT EXISTS daftar_hadir (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  uuid UUID REFERENCES daftar_nama(id),
  nama VARCHAR(255) NOT NULL,
  jabatan VARCHAR(255) NOT NULL,
  departemen_instansi VARCHAR(255) NOT NULL,
  photo_ttd_url TEXT NOT NULL,
  check_in TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) for daftar_hadir
ALTER TABLE daftar_hadir ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public insert access to daftar_hadir
CREATE POLICY "Allow public insert access" ON daftar_hadir
  FOR INSERT WITH CHECK (true);