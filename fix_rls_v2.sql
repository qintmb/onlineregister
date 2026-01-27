-- FIX RLS v2: ENABLE SELECT & INSERT

-- Fix daftar_hadir policies
DROP POLICY IF EXISTS "Allow public insert access" ON daftar_hadir;
CREATE POLICY "Allow public insert access" ON daftar_hadir FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public select access" ON daftar_hadir;
CREATE POLICY "Allow public select access" ON daftar_hadir FOR SELECT USING (true);

-- Fix daftar_nama policies (just in case)
DROP POLICY IF EXISTS "Enable read access for all users" ON daftar_nama;
CREATE POLICY "Enable read access for all users" ON daftar_nama FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert access for all users" ON daftar_nama;
CREATE POLICY "Enable insert access for all users" ON daftar_nama FOR INSERT WITH CHECK (true);

-- Storage policies (ttd) already covered in previous script but ensuring Select
DROP POLICY IF EXISTS "Allow public select bucket ttd" ON storage.objects;
CREATE POLICY "Allow public select bucket ttd" ON storage.objects FOR SELECT TO public USING (bucket_id = 'ttd');
