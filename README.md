# 東京ディズニーリゾート 待ち時間トラッカー

東京ディズニーランド・東京ディズニーシーの待ち時間をリアルタイムで確認し、履歴を記録するツールです。

## 機能

- 🏰 **リアルタイム待ち時間** - ランド・シー両パークの待ち時間を確認
- 📊 **履歴記録** - 30分ごとに自動でデータを収集・保存
- 📈 **グラフ表示** - 待ち時間の推移をグラフで確認

## ファイル構成

```
├── index.html          # メイン画面（待ち時間確認）
├── history.html        # 履歴ビューア（グラフ表示）
├── collect-data.js     # データ収集スクリプト
├── setup-scheduler.bat # Windows用タスク登録
├── data/               # 収集したデータ（JSON）
└── .github/workflows/  # GitHub Actions設定
```

## 使い方

### 1. 待ち時間を確認する

`index.html` をブラウザで開くだけ！

### 2. 履歴を記録する

#### GitHub Actions（推奨）

1. このリポジトリをForkまたはクローン
2. GitHubにプッシュするだけで30分ごとに自動収集開始
3. Actions → Collect Disney Wait Times で手動実行も可能

#### ローカルで実行（Windows）

1. [Node.js](https://nodejs.org/) をインストール
2. `setup-scheduler.bat` を管理者として実行
3. 30分ごとに自動でデータ収集開始

### 3. 履歴を確認する

`history.html` をブラウザで開き、`data/` フォルダのJSONファイルを読み込む

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
 
