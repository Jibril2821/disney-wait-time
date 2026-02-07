-- 待ち時間スナップショット用テーブル（1回の取得 = 1行）
-- Supabase ダッシュボードの SQL Editor で実行してください

create table if not exists public.wait_time_snapshots (
  id uuid primary key default gen_random_uuid(),
  park_id text not null check (park_id in ('land', 'sea')),
  date text not null,
  time text not null,
  timestamp timestamptz not null,
  rides jsonb not null default '[]',
  created_at timestamptz default now()
);

-- 日付・公園・時刻で検索しやすいようにインデックス
create index if not exists idx_wait_time_snapshots_park_date
  on public.wait_time_snapshots (park_id, date);
create index if not exists idx_wait_time_snapshots_timestamp
  on public.wait_time_snapshots (timestamp);

-- RLS が有効な場合は以下のポリシーを追加（SQL Editor で実行）
-- 「new row violates row-level security policy」が出たときに実行

alter table public.wait_time_snapshots enable row level security;

drop policy if exists "Allow insert for wait_time_snapshots" on public.wait_time_snapshots;
create policy "Allow insert for wait_time_snapshots"
  on public.wait_time_snapshots for insert
  with check (true);

drop policy if exists "Allow select for wait_time_snapshots" on public.wait_time_snapshots;
create policy "Allow select for wait_time_snapshots"
  on public.wait_time_snapshots for select
  using (true);

-- ========== マスタデータ（park-data.js と同期） ==========

-- パーク
create table if not exists public.parks (
  park_id text primary key check (park_id in ('land', 'sea')),
  name text not null,
  icon text,
  api_id int not null,
  folder text not null
);

-- エリア（TDL_AREAS / TDS_AREAS）
create table if not exists public.areas (
  park_id text not null references public.parks(park_id) on delete cascade,
  area_key text not null,
  name text not null,
  icon text,
  primary key (park_id, area_key)
);

-- アトラクション（TDL_RIDE_INFO / TDS_RIDE_INFO）。API の ride id と表示名・エリアを紐付け
create table if not exists public.rides (
  park_id text not null references public.parks(park_id) on delete cascade,
  ride_id int not null,
  area_key text not null,
  name text not null,
  primary key (park_id, ride_id),
  foreign key (park_id, area_key) references public.areas(park_id, area_key) on delete restrict
);

-- マスタ用 RLS（参照のみなら anon で可、登録はサービスロール想定）
alter table public.parks enable row level security;
alter table public.areas enable row level security;
alter table public.rides enable row level security;

create policy "Allow select parks" on public.parks for select using (true);
create policy "Allow select areas" on public.areas for select using (true);
create policy "Allow select rides" on public.rides for select using (true);

-- マスタはスクリプトから登録するため INSERT 許可（必要ならサービスロールのみで運用しポリシーは不要）
drop policy if exists "Allow insert parks" on public.parks;
create policy "Allow insert parks" on public.parks for insert with check (true);
drop policy if exists "Allow insert areas" on public.areas;
create policy "Allow insert areas" on public.areas for insert with check (true);
drop policy if exists "Allow insert rides" on public.rides;
create policy "Allow insert rides" on public.rides for insert with check (true);
