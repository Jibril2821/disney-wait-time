-- ============================================================
-- wait_time_snapshots とマスタ（parks / areas / rides）の結合
-- Supabase の SQL Editor で実行可能です。
-- ============================================================

-- 例1: スナップショットごとに「アトラクション単位」で展開し、マスタの名前・エリアを付与
-- （1行のスナップショットが、アトラクション数だけ行に展開される）
SELECT
  s.id AS snapshot_id,
  s.park_id,
  p.name AS park_name,
  s.date,
  s.time,
  s.timestamp,
  (elem->>'id')::int AS ride_id,
  r.name AS ride_name,
  r.area_key,
  a.name AS area_name,
  a.icon AS area_icon,
  (elem->>'is_open')::boolean AS is_open,
  (elem->>'wait_time')::int AS wait_time
FROM wait_time_snapshots s
JOIN parks p ON p.park_id = s.park_id
CROSS JOIN LATERAL jsonb_array_elements(s.rides) AS elem
LEFT JOIN rides r ON r.park_id = s.park_id AND r.ride_id = (elem->>'id')::int
LEFT JOIN areas a ON a.park_id = r.park_id AND a.area_key = r.area_key
ORDER BY s.timestamp DESC, r.area_key, r.ride_id
LIMIT 500;


-- 例2: 特定日・特定パークのスナップショット＋マスタ結合
SELECT
  s.time,
  r.name AS ride_name,
  a.name AS area_name,
  (elem->>'wait_time')::int AS wait_time,
  (elem->>'is_open')::boolean AS is_open
FROM wait_time_snapshots s
CROSS JOIN LATERAL jsonb_array_elements(s.rides) AS elem
LEFT JOIN rides r ON r.park_id = s.park_id AND r.ride_id = (elem->>'id')::int
LEFT JOIN areas a ON a.park_id = r.park_id AND a.area_key = r.area_key
WHERE s.park_id = 'land'
  AND s.date = '2026-02-07'
ORDER BY s.time, a.name, r.name;


-- 例3: ビューとして定義（index.html から Supabase で結合データ取得するために使用）
CREATE OR REPLACE VIEW public.wait_times_with_master AS
SELECT
  s.id AS snapshot_id,
  s.park_id,
  p.name AS park_name,
  s.date,
  s.time,
  s.timestamp,
  (elem->>'id')::int AS ride_id,
  r.name AS ride_name,
  r.area_key,
  a.name AS area_name,
  a.icon AS area_icon,
  (elem->>'is_open')::boolean AS is_open,
  (elem->>'wait_time')::int AS wait_time
FROM wait_time_snapshots s
JOIN parks p ON p.park_id = s.park_id
CROSS JOIN LATERAL jsonb_array_elements(s.rides) AS elem
LEFT JOIN rides r ON r.park_id = s.park_id AND r.ride_id = (elem->>'id')::int
LEFT JOIN areas a ON a.park_id = r.park_id AND a.area_key = r.area_key;
