-- FIX RLS v4: ENABLE DELETE for daftar_nama
DROP POLICY IF EXISTS "Enable delete access for all users" ON daftar_nama;
CREATE POLICY "Enable delete access for all users" ON daftar_nama FOR DELETE USING (true);
