/**
 * 東京ディズニーリゾート 待ち時間データ収集スクリプト
 * データ取得後、自動でGitHubにコミット＆プッシュ
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PARKS = {
    land: {
        name: '東京ディズニーランド',
        apiUrl: 'https://queue-times.com/parks/274/queue_times.json',
        folder: 'TDL' // data/TDL/YYYY/MM/land_YYYY-MM-DD.json
    },
    sea: {
        name: '東京ディズニーシー',
        apiUrl: 'https://queue-times.com/parks/275/queue_times.json',
        folder: 'TDS' // data/TDS/YYYY/MM/sea_YYYY-MM-DD.json
    }
};

const DATA_DIR = path.join(__dirname, 'data');

// データ保存ディレクトリの作成
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

async function fetchParkData(park) {
    try {
        const response = await fetch(park.apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`[ERROR] ${park.name}のデータ取得に失敗:`, error.message);
        return null;
    }
}

function getJapanDate(date) {
    // 日本時間でのDate部分を取得
    return date.toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' }); // YYYY-MM-DD
}

function getJapanTime(date) {
    // 日本時間でのHH:MMを取得
    return date.toLocaleTimeString('ja-JP', { 
        timeZone: 'Asia/Tokyo', 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
    }); // HH:MM
}

function getJapanTimestamp(date) {
    // 日本時間でのISO形式タイムスタンプを取得
    const options = {
        timeZone: 'Asia/Tokyo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };
    const parts = date.toLocaleString('ja-JP', options).split(/[\/\s:]/);
    // parts: [YYYY, MM, DD, HH, mm, ss]
    return `${parts[0]}-${parts[1]}-${parts[2]}T${parts[3]}:${parts[4]}:${parts[5]}+09:00`;
}

async function collectData() {
    const now = new Date();
    const dateStr = getJapanDate(now);
    const timeStr = getJapanTime(now);
    const timestampStr = getJapanTimestamp(now);
    
    console.log(`\n========================================`);
    console.log(`[${now.toLocaleString('ja-JP')}] データ収集開始`);
    console.log(`========================================\n`);

    for (const [parkId, park] of Object.entries(PARKS)) {
        console.log(`📍 ${park.name} のデータを取得中...`);
        
        const data = await fetchParkData(park);
        if (!data) continue;

        // 日付ごとのファイルに保存
        // 例: data/TDL/2026/02/land_2026-02-05.json, data/TDS/2026/02/sea_2026-02-05.json
        const [year, month, day] = dateStr.split('-'); // YYYY, MM, DD
        const parkDir = path.join(DATA_DIR, park.folder || parkId.toUpperCase(), year, month);
        if (!fs.existsSync(parkDir)) {
            fs.mkdirSync(parkDir, { recursive: true });
        }
        const fileName = `${parkId}_${dateStr}.json`;
        const filePath = path.join(parkDir, fileName);

        let dailyData = { date: dateStr, park: park.name, records: [] };
        
        // 既存ファイルがあれば読み込み
        if (fs.existsSync(filePath)) {
            try {
                dailyData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            } catch (e) {
                console.error(`[WARN] 既存ファイルの読み込みに失敗、新規作成します`);
            }
        }

        // 新しいレコードを追加
        const record = {
            time: timeStr,
            timestamp: timestampStr,
            rides: data.rides.map(ride => ({
                id: ride.id,
                name: ride.name,
                is_open: ride.is_open,
                wait_time: ride.wait_time
            }))
        };

        dailyData.records.push(record);

        // ファイルに保存
        fs.writeFileSync(filePath, JSON.stringify(dailyData, null, 2), 'utf-8');
        
        const openCount = data.rides.filter(r => r.is_open).length;
        const avgWait = data.rides.filter(r => r.is_open && r.wait_time > 0);
        const avg = avgWait.length > 0 
            ? Math.round(avgWait.reduce((sum, r) => sum + r.wait_time, 0) / avgWait.length)
            : 0;

        console.log(`  ✅ 保存完了: ${fileName}`);
        console.log(`     運営中: ${openCount}/${data.rides.length}, 平均待ち時間: ${avg}分\n`);
    }

    console.log(`========================================`);
    console.log(`データ収集完了！`);
    console.log(`保存先: ${DATA_DIR}`);
    console.log(`========================================\n`);
    
    return true; // 成功
}

function gitCommitAndPush() {
    const now = new Date();
    // 日本時間の年月日・時刻を手動で整形（例: 2026/2/5 17:31）
    const jst = new Date(now.getTime() + (9 * 60 * 60 * 1000));
    const year = jst.getUTCFullYear();
    const month = jst.getUTCMonth() + 1; // 1-12
    const day = jst.getUTCDate();
    const hours = jst.getUTCHours();
    const minutes = jst.getUTCMinutes().toString().padStart(2, '0');
    const timeStr = `${year}/${month}/${day} ${hours}:${minutes}`;
    
    console.log(`\n🔄 GitHubにプッシュ中...`);
    
    try {
        // 作業ディレクトリをスクリプトのディレクトリに変更
        process.chdir(__dirname);
        
        // git add
        execSync('git add data/', { stdio: 'pipe' });
        
        // 変更があるか確認
        try {
            execSync('git diff --staged --quiet', { stdio: 'pipe' });
            console.log(`  ℹ️  変更なし、スキップします\n`);
            return;
        } catch (e) {
            // 変更がある場合はエラーになる（正常）
        }

        // 変更がある場合、リモートの最新を取り込んでからコミット
        try {
            console.log(`  📥 リモートの最新を取得中...`);
            execSync('git pull --rebase', { stdio: 'pipe' });
            console.log(`  ✅ 最新化完了`);
        } catch (pullError) {
            // リモート未設定・ネットワークエラー等は無視してコミット継続
            console.log(`  ⚠️  pull スキップ（リモート未設定の可能性）`);
        }
        
        // git commit
        const commitMessage = `📊 待ち時間データ更新 - ${timeStr}`;
        execSync(`git commit -m "${commitMessage}"`, { stdio: 'pipe' });
        console.log(`  ✅ コミット完了`);
        
        // git push
        execSync('git push', { stdio: 'pipe' });
        console.log(`  ✅ プッシュ完了\n`);
        
        console.log(`========================================`);
        console.log(`GitHubへの同期完了！`);
        console.log(`========================================\n`);
        
    } catch (error) {
        console.error(`  ❌ Gitエラー:`, error.message);
        console.error(`  ヒント: git設定やネットワーク接続を確認してください\n`);
    }
}

// 時間チェック（9時〜21時の間のみ実行）
function isWithinOperatingHours() {
    const now = new Date();
    const hour = parseInt(now.toLocaleString('ja-JP', { 
        timeZone: 'Asia/Tokyo', 
        hour: '2-digit', 
        hour12: false 
    }));
    return hour >= 9 && hour < 21;
}

// 実行
async function main() {
    // 9時〜21時の範囲外なら終了
    if (!isWithinOperatingHours()) {
        const now = new Date();
        console.log(`[${now.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}] 営業時間外のためスキップ（9:00〜21:00のみ実行）`);
        return;
    }

    const success = await collectData().catch(err => {
        console.error(err);
        return false;
    });
    
    if (success) {
        gitCommitAndPush();
    }
}

main();
