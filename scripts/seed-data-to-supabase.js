/**
 * data/ フォルダ内の全 JSON を Supabase の wait_time_snapshots に登録するスクリプト
 * 実行: node scripts/seed-data-to-supabase.js
 * 前提: マスタ（parks, areas, rides）は seed-master-to-supabase.js で登録済みであること
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const DATA_DIR = path.join(__dirname, '..', 'data');
const BATCH_SIZE = 100;

function findAllJsonFiles(dir, list = []) {
    if (!fs.existsSync(dir)) return list;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) {
            findAllJsonFiles(full, list);
        } else if (e.isFile() && e.name.endsWith('.json')) {
            list.push(full);
        }
    }
    return list;
}

function getParkIdFromFilename(filename) {
    const base = path.basename(filename, '.json');
    if (base.startsWith('land_')) return 'land';
    if (base.startsWith('sea_')) return 'sea';
    return null;
}

async function seed() {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        console.error('SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY を .env に設定してください。');
        process.exit(1);
    }

    const jsonFiles = findAllJsonFiles(DATA_DIR);
    if (jsonFiles.length === 0) {
        console.log('data/ に JSON ファイルがありません。');
        return;
    }

    console.log(`見つかったファイル: ${jsonFiles.length} 件`);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const allRows = [];

    for (const filePath of jsonFiles) {
        const parkId = getParkIdFromFilename(filePath);
        if (!parkId) {
            console.warn('  skip (park_id 不明):', path.relative(DATA_DIR, filePath));
            continue;
        }

        let data;
        try {
            data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } catch (err) {
            console.error('  read error:', filePath, err.message);
            continue;
        }

        const date = data.date;
        const records = data.records || [];
        for (const rec of records) {
            allRows.push({
                park_id: parkId,
                date: date,
                time: rec.time,
                timestamp: rec.timestamp,
                rides: rec.rides || []
            });
        }
        console.log('  ', path.relative(DATA_DIR, filePath), '->', records.length, '件のスナップショット');
    }

    if (allRows.length === 0) {
        console.log('登録するレコードがありません。');
        return;
    }

    console.log('\nSupabase に登録中... 合計', allRows.length, '件');
    let inserted = 0;
    for (let i = 0; i < allRows.length; i += BATCH_SIZE) {
        const batch = allRows.slice(i, i + BATCH_SIZE);
        const { error } = await supabase.from('wait_time_snapshots').insert(batch);
        if (error) {
            console.error('  batch 登録失敗:', error.message);
            break;
        }
        inserted += batch.length;
        process.stdout.write(`  ${inserted} / ${allRows.length}\r`);
    }
    console.log('\n完了しました。', inserted, '件を登録しました。');
}

seed().catch((err) => {
    console.error(err);
    process.exit(1);
});
