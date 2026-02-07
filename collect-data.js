/**
 * 東京ディズニーリゾート 待ち時間データ収集スクリプト
 * 取得データを Supabase に登録（オプションで GitHub にコミット＆プッシュ）
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY)
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    : null;

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

const LOG_DIR = 'C:/logs';

// ログディレクトリの作成
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
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

// ログを C:/logs の日付別ファイルに追記（console にもそのまま出力）
let logStream = null;
function initLogStream() {
    const now = new Date();
    const dateStr = getJapanDate(now);
    const logPath = path.join(LOG_DIR, `collect-data_${dateStr}.log`);
    logStream = fs.createWriteStream(logPath, { flags: 'a' });
    const originalLog = console.log;
    const originalError = console.error;
    function writeToFile(level, args) {
        if (!logStream) return;
        const msg = args.map(a => (typeof a === 'object' && a !== null && a instanceof Error)
            ? a.message + (a.stack ? '\n' + a.stack : '')
            : (typeof a === 'object' && a !== null) ? JSON.stringify(a) : String(a)).join(' ');
        const timestamp = getJapanTimestamp(new Date());
        logStream.write(`[${timestamp}] [${level}] ${msg}\n`);
    }
    console.log = function (...args) {
        writeToFile('INFO', args);
        originalLog.apply(console, args);
    };
    console.error = function (...args) {
        writeToFile('ERROR', args);
        originalError.apply(console, args);
    };
}
initLogStream();

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

        const rides = data.rides.map(ride => ({
            id: ride.id,
            name: ride.name,
            is_open: ride.is_open,
            wait_time: ride.wait_time
        }));

        if (supabase) {
            const { error } = await supabase.from('wait_time_snapshots').insert({
                park_id: parkId,
                date: dateStr,
                time: timeStr,
                timestamp: timestampStr,
                rides
            });
            if (error) {
                console.error(`  ❌ Supabase 登録失敗:`, error.message);
                continue;
            }
        } else {
            console.error(`  ⚠️ SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY が未設定です。.env を設定してください。`);
            continue;
        }

        const openCount = data.rides.filter(r => r.is_open).length;
        const avgWait = data.rides.filter(r => r.is_open && r.wait_time > 0);
        const avg = avgWait.length > 0
            ? Math.round(avgWait.reduce((sum, r) => sum + r.wait_time, 0) / avgWait.length)
            : 0;

        console.log(`  ✅ DB登録完了: ${park.name} (${timeStr})`);
        console.log(`     運営中: ${openCount}/${data.rides.length}, 平均待ち時間: ${avg}分`);
    }

    console.log(`========================================`);
    console.log(`データ収集完了！（Supabase に登録済み）`);
    console.log(`========================================`);
    
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
    
    console.log(`🔄 GitHubにプッシュ中...`);
    
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
            // リモートは変更されていない
            console.log(`  ✅  pull スキップ（リモート未変更・コミット続行）`);
        }
        
        // git commit
        const commitMessage = `📊 待ち時間データ更新 - ${timeStr}`;
        execSync(`git commit -m "${commitMessage}"`, { stdio: 'pipe' });
        console.log(`  ✅ コミット完了`);
        
        // git push
        execSync('git push', { stdio: 'pipe' });
        console.log(`  ✅ プッシュ完了`);
        
        console.log(`========================================`);
        console.log(`GitHubへの同期完了！`);
        console.log(`========================================`);
        
    } catch (error) {
        console.error(`  ❌ Gitエラー:`, error.message);
        console.error(`  ヒント: git設定やネットワーク接続を確認してください\n`);
    }
}

// 時間チェック（9時〜21時を含む間のみ実行。21:00ピッタリも実行する）
function isWithinOperatingHours() {
    const now = new Date();
    const hour = parseInt(now.toLocaleString('ja-JP', { 
        timeZone: 'Asia/Tokyo', 
        hour: '2-digit', 
        hour12: false 
    }));
    return hour >= 9 && hour <= 21;
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
