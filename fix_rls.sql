-- PERBAIKAN RLS & STORAGE

-- Pastikan tabel daftar_hadir bisa di-insert public
DROP POLICY IF EXISTS "Allow public insert access" ON daftar_hadir;
CREATE POLICY "Allow public insert access" ON daftar_hadir
  FOR INSERT WITH CHECK (true);

-- Membuat bucket 'ttd' jika belum ada (lewat API biasanya, tapi ini untuk SQL editor)
-- Note: Insert ke storage.buckets mungkin butuh permission superadmin/service role
INSERT INTO storage.buckets (id, name, public)
VALUES ('ttd', 'ttd', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Membersihkan policy lama jika ada
DROP POLICY IF EXISTS "Allow public uploads 1" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads 2" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads bucket ttd" ON storage.objects;

-- Membuat policy public upload ke bucket 'ttd'
CREATE POLICY "Allow public uploads bucket ttd" ON storage.objects
FOR INSERT TO public WITH CHECK (bucket_id = 'ttd');

-- Membuat policy public read ke bucket 'ttd'
DROP POLICY IF EXISTS "Allow public select bucket ttd" ON storage.objects;
CREATE POLICY "Allow public select bucket ttd" ON storage.objects
FOR SELECT TO public USING (bucket_id = 'ttd');
