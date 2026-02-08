/**
 * パーク・エリア・アトラクションのマスタを Supabase に登録するスクリプト
 * 実行: node scripts/seed-master-to-supabase.js
 * 画面（index.html / history.html）は master-from-supabase.js でこのマスタを参照します。
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// マスタ定義（このファイルが登録元）
const PARKS = {
    land: { id: 274, name: '東京ディズニーランド', icon: '🏰', folder: 'TDL' },
    sea: { id: 275, name: '東京ディズニーシー', icon: '🌋', folder: 'TDS' }
};
const TDL_AREAS = {
    worldbazaar: { name: 'ワールドバザール', icon: '🏛️' },
    adventureland: { name: 'アドベンチャーランド', icon: '🌴' },
    westernland: { name: 'ウエスタンランド', icon: '🤠' },
    crittercountry: { name: 'クリッターカントリー', icon: '🦫' },
    fantasyland: { name: 'ファンタジーランド', icon: '🏰' },
    toontown: { name: 'トゥーンタウン', icon: '🎨' },
    tomorrowland: { name: 'トゥモローランド', icon: '🚀' }
};
const TDS_AREAS = {
    mediterranean: { name: 'メディテレーニアンハーバー', icon: '⛵' },
    americanwaterfront: { name: 'アメリカンウォーターフロント', icon: '🗽' },
    portdiscovery: { name: 'ポートディスカバリー', icon: '🔬' },
    lostriverdelta: { name: 'ロストリバーデルタ', icon: '🏛️' },
    arabiancoast: { name: 'アラビアンコースト', icon: '🕌' },
    mermaidlagoon: { name: 'マーメイドラグーン', icon: '🧜‍♀️' },
    mysteriousisland: { name: 'ミステリアスアイランド', icon: '🌋' },
    fantasysprings: { name: 'ファンタジースプリングス', icon: '✨' }
};
const TDL_RIDE_INFO = {
    7985: { area: 'worldbazaar', name: 'オムニバス' },
    8019: { area: 'worldbazaar', name: 'ペニーアーケード' },
    7986: { area: 'adventureland', name: 'カリブの海賊' },
    7987: { area: 'adventureland', name: 'ジャングルクルーズ：ワイルドライフ・エクスペディション' },
    7988: { area: 'adventureland', name: 'ウエスタンリバー鉄道' },
    7989: { area: 'adventureland', name: 'スイスファミリー・ツリーハウス' },
    7990: { area: 'adventureland', name: '魅惑のチキルーム：スティッチ・プレゼンツ "アロハ・エ・コモ・マイ!"' },
    7991: { area: 'westernland', name: 'ウエスタンランド・シューティングギャラリー' },
    7992: { area: 'westernland', name: 'カントリーベア・シアター' },
    7993: { area: 'westernland', name: '蒸気船マークトウェイン号' },
    7994: { area: 'westernland', name: 'ビッグサンダー・マウンテン' },
    7995: { area: 'westernland', name: 'トムソーヤ島いかだ' },
    7996: { area: 'crittercountry', name: 'スプラッシュ・マウンテン' },
    7997: { area: 'crittercountry', name: 'ビーバーブラザーズのカヌー探険' },
    7998: { area: 'fantasyland', name: 'ピーターパン空の旅' },
    7999: { area: 'fantasyland', name: '白雪姫と七人のこびと' },
    8000: { area: 'fantasyland', name: 'シンデレラのフェアリーテイル・ホール' },
    8001: { area: 'fantasyland', name: 'ミッキーのフィルハーマジック' },
    8002: { area: 'fantasyland', name: 'ピノキオの冒険旅行' },
    8003: { area: 'fantasyland', name: '空飛ぶダンボ' },
    8004: { area: 'fantasyland', name: 'キャッスルカルーセル' },
    8005: { area: 'fantasyland', name: 'ホーンテッドマンション' },
    8006: { area: 'fantasyland', name: '"イッツ・ア・スモールワールド" with グルート' },
    8007: { area: 'fantasyland', name: 'アリスのティーパーティー' },
    8008: { area: 'fantasyland', name: 'プーさんのハニーハント' },
    8255: { area: 'fantasyland', name: '美女と野獣 "魔法のものがたり"' },
    8009: { area: 'toontown', name: 'ロジャーラビットのカートゥーンスピン' },
    8010: { area: 'toontown', name: 'ミニーの家' },
    8011: { area: 'toontown', name: 'チップとデールのツリーハウス' },
    8012: { area: 'toontown', name: 'ガジェットのゴーコースター' },
    8013: { area: 'toontown', name: 'ドナルドのボート' },
    8014: { area: 'toontown', name: 'グーフィーのペイント＆プレイハウス' },
    8020: { area: 'toontown', name: 'トゥーンパーク' },
    15401: { area: 'toontown', name: 'ミッキーの家とミート・ミッキー' },
    8015: { area: 'tomorrowland', name: 'スター・ツアーズ：ザ・アドベンチャーズ・コンティニュー' },
    8018: { area: 'tomorrowland', name: 'モンスターズ・インク "ライド＆ゴーシーク!"' },
    8021: { area: 'tomorrowland', name: 'スティッチ・エンカウンター' },
    8254: { area: 'tomorrowland', name: 'ベイマックスのハッピーライド' }
};
const TDS_RIDE_INFO = {
    8024: { area: 'mediterranean', name: 'ソアリン：ファンタスティック・フライト' },
    8031: { area: 'mediterranean', name: 'ディズニーシー・トランジットスチーマーライン（メディテレーニアンハーバー）' },
    8034: { area: 'mediterranean', name: 'ヴェネツィアン・ゴンドラ' },
    8048: { area: 'mediterranean', name: 'フォートレス・エクスプロレーション' },
    8049: { area: 'mediterranean', name: 'ザ・レオナルドチャレンジ' },
    8023: { area: 'americanwaterfront', name: 'トイ・ストーリー・マニア！' },
    8032: { area: 'americanwaterfront', name: 'ディズニーシー・トランジットスチーマーライン（アメリカンウォーターフロント）' },
    8036: { area: 'americanwaterfront', name: 'ディズニーシー・エレクトリックレールウェイ（アメリカンウォーターフロント）' },
    8037: { area: 'americanwaterfront', name: 'ビッグシティ・ヴィークル' },
    8047: { area: 'americanwaterfront', name: 'タワー・オブ・テラー' },
    8050: { area: 'americanwaterfront', name: 'タートル・トーク' },
    8035: { area: 'portdiscovery', name: 'ディズニーシー・エレクトリックレールウェイ（ポートディスカバリー）' },
    8038: { area: 'portdiscovery', name: 'アクアトピア' },
    8051: { area: 'portdiscovery', name: 'ニモ＆フレンズ・シーライダー' },
    8027: { area: 'lostriverdelta', name: 'インディ・ジョーンズ・アドベンチャー：クリスタルスカルの魔宮' },
    8033: { area: 'lostriverdelta', name: 'ディズニーシー・トランジットスチーマーライン（ロストリバーデルタ）' },
    8046: { area: 'lostriverdelta', name: 'レイジングスピリッツ' },
    8025: { area: 'arabiancoast', name: 'ジャスミンのフライングカーペット' },
    8030: { area: 'arabiancoast', name: 'マジックランプシアター' },
    8039: { area: 'arabiancoast', name: 'シンドバッド・ストーリーブック・ヴォヤッジ' },
    8040: { area: 'arabiancoast', name: 'キャラバンカルーセル' },
    8022: { area: 'mermaidlagoon', name: 'アリエルのプレイグラウンド' },
    8026: { area: 'mermaidlagoon', name: 'マーメイドラグーンシアター' },
    8041: { area: 'mermaidlagoon', name: 'フランダーのフライングフィッシュコースター' },
    8042: { area: 'mermaidlagoon', name: 'スカットルのスクーター' },
    8043: { area: 'mermaidlagoon', name: 'ジャンピン・ジェリーフィッシュ' },
    8044: { area: 'mermaidlagoon', name: 'ブローフィッシュ・バルーンレース' },
    8045: { area: 'mermaidlagoon', name: 'ワールプール' },
    8028: { area: 'mysteriousisland', name: 'センター・オブ・ジ・アース' },
    8029: { area: 'mysteriousisland', name: '海底2万マイル' },
    13559: { area: 'fantasysprings', name: 'アナとエルサのフローズンジャーニー' },
    13560: { area: 'fantasysprings', name: 'ラプンツェルのランタンフェスティバル' },
    13561: { area: 'fantasysprings', name: 'ピーターパンのネバーランドアドベンチャー' },
    13562: { area: 'fantasysprings', name: 'フェアリー・ティンカーベルのビジーバギー' }
};

async function seed() {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        console.error('SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY を .env に設定してください。');
        process.exit(1);
    }
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const parksRows = Object.entries(PARKS).map(([park_id, p]) => ({
        park_id,
        name: p.name,
        icon: p.icon,
        api_id: p.id,
        folder: p.folder
    }));

    const areasRows = [];
    for (const [park_id, areas] of [['land', TDL_AREAS], ['sea', TDS_AREAS]]) {
        for (const [area_key, a] of Object.entries(areas)) {
            areasRows.push({ park_id, area_key, name: a.name, icon: a.icon });
        }
    }

    const ridesRows = [];
    for (const [park_id, info] of [['land', TDL_RIDE_INFO], ['sea', TDS_RIDE_INFO]]) {
        for (const [ride_id, r] of Object.entries(info)) {
            ridesRows.push({
                park_id,
                ride_id: parseInt(ride_id, 10),
                area_key: r.area,
                name: r.name
            });
        }
    }

    // upsert により既存行は更新されるため、再実行しても一意制約違反にならない
    console.log('マスタデータを登録します...');
    const { error: e1 } = await supabase.from('parks').upsert(parksRows, { onConflict: 'park_id' });
    if (e1) {
        console.error('parks 登録失敗:', e1.message);
        process.exit(1);
    }
    console.log('  parks:', parksRows.length, '件');

    const { error: e2 } = await supabase.from('areas').upsert(areasRows, { onConflict: 'park_id,area_key' });
    if (e2) {
        console.error('areas 登録失敗:', e2.message);
        process.exit(1);
    }
    console.log('  areas:', areasRows.length, '件');

    const { error: e3 } = await supabase.from('rides').upsert(ridesRows, { onConflict: 'park_id,ride_id' });
    if (e3) {
        console.error('rides 登録失敗:', e3.message);
        process.exit(1);
    }
    console.log('  rides:', ridesRows.length, '件');
    console.log('完了しました。');
}

seed();
