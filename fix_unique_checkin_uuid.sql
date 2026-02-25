-- Stabilize check-in uniqueness: one row per participant (uuid)
-- Keep newest check-in row and remove older duplicates.
WITH ranked_checkins AS (
  SELECT
    id,
    uuid,
    ROW_NUMBER() OVER (
      PARTITION BY uuid
      ORDER BY check_in DESC NULLS LAST, id DESC
    ) AS rn
  FROM daftar_hadir
  WHERE uuid IS NOT NULL
)
DELETE FROM daftar_hadir dh
USING ranked_checkins rc
WHERE dh.id = rc.id
  AND rc.rn > 1;

-- Enforce one check-in per participant at DB level.
CREATE UNIQUE INDEX IF NOT EXISTS daftar_hadir_uuid_unique_idx
  ON daftar_hadir (uuid)
  WHERE uuid IS NOT NULL;
