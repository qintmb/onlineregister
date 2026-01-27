-- FIX RLS v3: ENABLE DELETE for TABLE and STORAGE

-- 1. Allow public delete to daftar_hadir table
DROP POLICY IF EXISTS "Allow public delete access" ON daftar_hadir;
CREATE POLICY "Allow public delete access" ON daftar_hadir FOR DELETE USING (true);

-- 2. Allow public delete to ttd bucket in storage.objects
DROP POLICY IF EXISTS "Allow public delete bucket ttd" ON storage.objects;
CREATE POLICY "Allow public delete bucket ttd" ON storage.objects 
FOR DELETE 
TO public 
USING (bucket_id = 'ttd');

-- 3. Just to be sure, verify SELECT and INSERT are also there (idempotent)
DROP POLICY IF EXISTS "Allow public select access" ON daftar_hadir;
CREATE POLICY "Allow public select access" ON daftar_hadir FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert access" ON daftar_hadir;
CREATE POLICY "Allow public insert access" ON daftar_hadir FOR INSERT WITH CHECK (true);
