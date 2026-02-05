/**
 * 東京ディズニーリゾート 待ち時間データ収集スクリプト
 * 30分ごとにタスクスケジューラで実行して履歴を記録
 */

const fs = require('fs');
const path = require('path');

const PARKS = {
    land: {
        name: '東京ディズニーランド',
        apiUrl: 'https://queue-times.com/parks/274/queue_times.json'
    },
    sea: {
        name: '東京ディズニーシー',
        apiUrl: 'https://queue-times.com/parks/275/queue_times.json'
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

function getDateString(date) {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

function getTimeString(date) {
    return date.toTimeString().split(' ')[0].slice(0, 5); // HH:MM
}

async function collectData() {
    const now = new Date();
    const dateStr = getDateString(now);
    const timeStr = getTimeString(now);
    
    console.log(`\n========================================`);
    console.log(`[${now.toLocaleString('ja-JP')}] データ収集開始`);
    console.log(`========================================\n`);

    for (const [parkId, park] of Object.entries(PARKS)) {
        console.log(`📍 ${park.name} のデータを取得中...`);
        
        const data = await fetchParkData(park);
        if (!data) continue;

        // 日付ごとのファイルに保存
        const fileName = `${parkId}_${dateStr}.json`;
        const filePath = path.join(DATA_DIR, fileName);

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
            timestamp: now.toISOString(),
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
}

// 実行
collectData().catch(console.error);
