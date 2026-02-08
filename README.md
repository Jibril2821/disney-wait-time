# 東京ディズニーリゾート 待ち時間トラッカー

東京ディズニーランド・東京ディズニーシーの待ち時間をリアルタイムで確認し、履歴を記録するツールです。

## 機能

- 🏰 **リアルタイム待ち時間** - ランド・シー両パークの待ち時間を確認
- 📊 **履歴記録** - 30分ごとに自動でデータを収集・保存
- 📈 **グラフ表示** - 待ち時間の推移をグラフで確認

## ファイル構成

```
├── index.html                    # メイン画面（待ち時間確認）
├── history.html                  # 履歴ビューア（グラフ表示）
├── park-data.js                  # 待ち時間の色設定・スタイル注入・色分けクラス取得
├── master-from-supabase.js       # Supabase マスタを取得し window にセット（画面用）
├── supabase-config.js            # Supabase URL / anon キー（画面用）
├── collect-data.js               # データ収集スクリプト（Supabase に登録）
├── setup-scheduler.bat           # Windows用タスク登録
├── supabase/
│   └── schema.sql                # DB テーブル定義
├── scripts/
│   └── seed-master-to-supabase.js # マスタを Supabase に登録（upsert、再実行可）
├── data/                         # （旧）収集データ（JSON）※現在は Supabase に登録
└── .github/workflows/            # GitHub Actions設定
```

## マスタデータと画面の関係

パーク・エリア・アトラクションの**マスタは Supabase が正**です。画面は起動時に Supabase から取得して使います。

| 役割 | ファイル・DB | 説明 |
|------|----------------|------|
| **マスタの保存** | Supabase の `parks` / `areas` / `rides` | パーク名・エリア・アトラクション一覧を保持 |
| **マスタの登録** | `scripts/seed-master-to-supabase.js` | マスタ定義を DB に **upsert** で登録。再実行しても一意制約違反にならない |
| **マスタの取得（画面）** | `master-from-supabase.js` | Supabase からマスタを取得し、`window.PARKS` / `TDL_AREAS` / `TDS_AREAS` / `TDL_RIDE_INFO` / `TDS_RIDE_INFO` にセットする橋渡し |
| **画面での利用** | `index.html` / `history.html` | 表示前に `loadMasterFromSupabase()` を `await` し、上記グローバルでパーク名・エリア・アトラクション名を参照 |

- **park-data.js** はマスタを持たず、**待ち時間の色**（`WAIT_TIME_COLORS`）と **スタイル注入**（`injectWaitTimeColorStyles`）、**色分けクラス取得**（`getWaitClassGlobal`）のみを提供します。
- マスタの追加・変更は `scripts/seed-master-to-supabase.js` を編集してから `npm run seed-master` を実行してください。

## 使い方

### 1. 待ち時間を確認する

`index.html` をブラウザで開くだけ！

### 2. 履歴を記録する（Supabase）

収集した待ち時間データは **Supabase** のデータベースに登録されます。

#### 初回セットアップ

1. [Supabase](https://supabase.com/) でプロジェクトを作成
2. ダッシュボードの **SQL Editor** で `supabase/schema.sql` の内容を実行し、テーブルを作成
3. **Project Settings → API** で URL と `service_role` キーをコピー
4. プロジェクト直下に `.env` を作成（`.env.example` をコピーして値を設定）:
   ```
   SUPABASE_URL=https://xxxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
5. `npm install` で依存関係をインストール

#### 実行方法

- **ローカル（Windows）**: [Node.js](https://nodejs.org/) をインストール後、`setup-scheduler.bat` を管理者として実行すると 30 分ごとに自動収集
- **手動実行**: `npm run collect`
- **GitHub Actions**: リポジトリの Secrets に `SUPABASE_URL` と `SUPABASE_SERVICE_ROLE_KEY` を登録すれば Actions からも DB に登録可能

### 3. マスタデータを Supabase に登録する

（全体の流れは **「マスタデータと画面の関係」** を参照。）

1. `supabase/schema.sql` で `parks` / `areas` / `rides` テーブルを作成済みであること
2. `scripts/seed-master-to-supabase.js` 内のマスタ定義を必要に応じて編集し、`npm run seed-master` を実行

※ マスタの追加・変更は `scripts/seed-master-to-supabase.js` を編集してから seed を実行。upsert のため再実行しても一意制約違反にはなりません。

### 4. 履歴を確認する

- **Supabase**: ダッシュボードの Table Editor で `wait_time_snapshots` を参照
- **従来**: `history.html` で `data/` の JSON を読み込む（過去データがある場合）

### 5. スナップショットとマスタの結合クエリ

**Supabase では、`wait_time_snapshots` とマスタ（`parks` / `areas` / `rides`）を結合した SQL をそのまま実行できます。**

- **SQL Editor**: ダッシュボードの **SQL Editor** に任意の SELECT を貼り付けて実行可能です。
- 結合例は `supabase/query-join.sql` にあります。  
  - スナップショットの `rides`（JSONB 配列）を `jsonb_array_elements` で行に展開し、`rides.ride_id` でマスタの `rides` と結合、さらに `areas` でエリア名を付与するクエリです。
- 結合結果を **ビュー** `wait_times_with_master` として定義してあり（`query-join.sql` の例3）、index.html からこのビューでデータを取得できます。

### 6. index.html で Supabase の結合データを表示する

待ち時間を Supabase の結合データ（ビュー）から表示するには次のとおりです。

1. **ビューの作成**: Supabase の SQL Editor で `supabase/query-join.sql` の **例3**（`CREATE OR REPLACE VIEW public.wait_times_with_master ...`）を実行する。
2. **フロント用設定**: `supabase-config.example.js` をコピーして `supabase-config.js` を作成し、Supabase の **Project Settings → API** で確認した **URL** と **anon (public) キー** を設定する。
3. **表示**: `index.html` を開くと、設定が読み込まれている場合は Supabase から最新スナップショットの待ち時間（マスタ結合済み）を取得して表示する。設定が空の場合は従来どおりローカル JSON または外部 API を使用する。

## GitHub Pages でホスト

1. Settings → Pages → Source を `main` ブランチに設定
2. `https://YOUR_USERNAME.github.io/YOUR_REPO/` でアクセス可能

## データ形式

```json
{
  "date": "2026-02-05",
  "park": "東京ディズニーランド",
  "records": [
    {
      "time": "09:00",
      "timestamp": "2026-02-05T00:00:00.000Z",
      "rides": [
        {
          "id": 8255,
          "name": "Enchanted Tale of Beauty and the Beast",
          "is_open": true,
          "wait_time": 90
        }
      ]
    }
  ]
}
```

## API

データ取得元: [Queue-Times.com](https://queue-times.com/)

- 東京ディズニーランド: `https://queue-times.com/parks/274/queue_times.json`
- 東京ディズニーシー: `https://queue-times.com/parks/275/queue_times.json`

## ライセンス

MIT
 
