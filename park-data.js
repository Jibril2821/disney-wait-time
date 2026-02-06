/**
 * 東京ディズニーリゾート パーク・エリア・アトラクションデータ
 * 
 * このファイルを編集することで、アトラクションやエリアの追加・変更が可能です。
 */

// 待ち時間の色コード設定（両画面で共通）
const WAIT_TIME_COLORS = {
    short: {
        // 0〜30分
        primary: '#4ecdc4',
        gradient: ['#4ecdc4', '#44a08d'],
        bgRgba: 'rgba(46, 213, 115, 0.28)',
        borderRgba: 'rgba(46, 213, 115, 0.6)',
        textOnBg: '#e9ffef'
    },
    medium: {
        // 30〜60分
        primary: '#f9ca24',
        gradient: ['#f9ca24', '#f0932b'],
        bgRgba: 'rgba(241, 196, 15, 0.32)',
        borderRgba: 'rgba(241, 196, 15, 0.6)',
        textOnBg: '#fff8e1'
    },
    long: {
        // 60〜90分
        primary: '#ff6b6b',
        gradient: ['#ff6b6b', '#ee5a5a'],
        bgRgba: 'rgba(230, 126, 34, 0.42)',
        borderRgba: 'rgba(230, 126, 34, 0.6)',
        textOnBg: '#fff4e5'
    },
    veryLong: {
        // 90〜120分
        primary: '#e84393',
        gradient: ['#e84393', '#d63031'],
        bgRgba: 'rgba(231, 76, 60, 0.55)',
        borderRgba: 'rgba(231, 76, 60, 0.7)',
        textOnBg: '#ffecec'
    },
    extremeLong: {
        // 120〜180分
        primary: '#ff4757',
        gradient: ['#ff4757', '#c23616'],
        bgRgba: 'rgba(192, 57, 43, 0.65)',
        borderRgba: 'rgba(192, 57, 43, 0.8)',
        textOnBg: '#ffecec'
    },
    insaneLong: {
        // 180分以上
        primary: '#ff6b6b',
        gradient: ['#c23616', '#8b0000'],
        bgRgba: 'rgba(139, 0, 0, 0.75)',
        borderRgba: 'rgba(139, 0, 0, 0.9)',
        textOnBg: '#ffecec'
    }
};

// CSS変数として色コードを注入する関数
function injectWaitTimeColorStyles() {
    const style = document.createElement('style');
    style.id = 'wait-time-colors';
    
    const c = WAIT_TIME_COLORS;
    style.textContent = `
        :root {
            /* wait-short (0〜30分) */
            --wait-short-primary: ${c.short.primary};
            --wait-short-gradient: linear-gradient(90deg, ${c.short.gradient[0]}, ${c.short.gradient[1]});
            --wait-short-bg: ${c.short.bgRgba};
            --wait-short-border: ${c.short.borderRgba};
            --wait-short-text-on-bg: ${c.short.textOnBg};

            /* wait-medium (30〜60分) */
            --wait-medium-primary: ${c.medium.primary};
            --wait-medium-gradient: linear-gradient(90deg, ${c.medium.gradient[0]}, ${c.medium.gradient[1]});
            --wait-medium-bg: ${c.medium.bgRgba};
            --wait-medium-border: ${c.medium.borderRgba};
            --wait-medium-text-on-bg: ${c.medium.textOnBg};

            /* wait-long (60〜90分) */
            --wait-long-primary: ${c.long.primary};
            --wait-long-gradient: linear-gradient(90deg, ${c.long.gradient[0]}, ${c.long.gradient[1]});
            --wait-long-bg: ${c.long.bgRgba};
            --wait-long-border: ${c.long.borderRgba};
            --wait-long-text-on-bg: ${c.long.textOnBg};

            /* wait-very-long (90〜120分) */
            --wait-very-long-primary: ${c.veryLong.primary};
            --wait-very-long-gradient: linear-gradient(90deg, ${c.veryLong.gradient[0]}, ${c.veryLong.gradient[1]});
            --wait-very-long-bg: ${c.veryLong.bgRgba};
            --wait-very-long-border: ${c.veryLong.borderRgba};
            --wait-very-long-text-on-bg: ${c.veryLong.textOnBg};

            /* wait-extreme-long (120〜180分) */
            --wait-extreme-long-primary: ${c.extremeLong.primary};
            --wait-extreme-long-gradient: linear-gradient(90deg, ${c.extremeLong.gradient[0]}, ${c.extremeLong.gradient[1]});
            --wait-extreme-long-bg: ${c.extremeLong.bgRgba};
            --wait-extreme-long-border: ${c.extremeLong.borderRgba};
            --wait-extreme-long-text-on-bg: ${c.extremeLong.textOnBg};

            /* wait-insane-long (180分以上) */
            --wait-insane-long-primary: ${c.insaneLong.primary};
            --wait-insane-long-gradient: linear-gradient(90deg, ${c.insaneLong.gradient[0]}, ${c.insaneLong.gradient[1]});
            --wait-insane-long-bg: ${c.insaneLong.bgRgba};
            --wait-insane-long-border: ${c.insaneLong.borderRgba};
            --wait-insane-long-text-on-bg: ${c.insaneLong.textOnBg};
        }

        /* 待ち時間テキスト色 */
        .wait-short .wait-time-number { color: var(--wait-short-primary); }
        .wait-short .wait-time-fill { background: var(--wait-short-gradient); }

        .wait-medium .wait-time-number { color: var(--wait-medium-primary); }
        .wait-medium .wait-time-fill { background: var(--wait-medium-gradient); }

        .wait-long .wait-time-number { color: var(--wait-long-primary); }
        .wait-long .wait-time-fill { background: var(--wait-long-gradient); }

        .wait-very-long .wait-time-number { color: var(--wait-very-long-primary); }
        .wait-very-long .wait-time-fill { background: var(--wait-very-long-gradient); }

        .wait-extreme-long .wait-time-number { color: var(--wait-extreme-long-primary); }
        .wait-extreme-long .wait-time-fill { background: var(--wait-extreme-long-gradient); }

        .wait-insane-long .wait-time-number { color: var(--wait-insane-long-primary); }
        .wait-insane-long .wait-time-fill { background: var(--wait-insane-long-gradient); }

        /* 汎用待ち時間クラス（テキスト色のみ）- テーブルセル等で使用 */
        td.wait-short, span.wait-short { color: var(--wait-short-primary); }
        td.wait-medium, span.wait-medium { color: var(--wait-medium-primary); }
        td.wait-long, span.wait-long { color: var(--wait-long-primary); }
        td.wait-very-long, span.wait-very-long { color: var(--wait-very-long-primary); }
        td.wait-extreme-long, span.wait-extreme-long { color: var(--wait-extreme-long-primary); }
        td.wait-insane-long, span.wait-insane-long { color: var(--wait-insane-long-primary); }

        /* リアルタイム画面のアトラクション名は白色を維持 */
        .ride-card .ride-name { color: #fff; }

        /* ライドカード統計値用 */
        .ride-card-stat-value.wait-short { color: var(--wait-short-primary); }
        .ride-card-stat-value.wait-medium { color: var(--wait-medium-primary); }
        .ride-card-stat-value.wait-long { color: var(--wait-long-primary); }
        .ride-card-stat-value.wait-very-long { color: var(--wait-very-long-primary); }
        .ride-card-stat-value.wait-extreme-long { color: var(--wait-extreme-long-primary); }
        .ride-card-stat-value.wait-insane-long { color: var(--wait-insane-long-primary); }

        /* ヒートマップセル用 */
        .heatmap-cell.wait-short {
            background: var(--wait-short-bg);
            color: var(--wait-short-text-on-bg);
        }
        .heatmap-cell.wait-medium {
            background: var(--wait-medium-bg);
            color: var(--wait-medium-text-on-bg);
        }
        .heatmap-cell.wait-long {
            background: var(--wait-long-bg);
            color: var(--wait-long-text-on-bg);
        }
        .heatmap-cell.wait-very-long {
            background: var(--wait-very-long-bg);
            color: var(--wait-very-long-text-on-bg);
        }
        .heatmap-cell.wait-extreme-long {
            background: var(--wait-extreme-long-bg);
            color: var(--wait-extreme-long-text-on-bg);
        }
        .heatmap-cell.wait-insane-long {
            background: var(--wait-insane-long-bg);
            color: var(--wait-insane-long-text-on-bg);
        }

        /* カレンダー日付セル用 */
        .calendar-day.wait-short {
            background: var(--wait-short-bg);
            border-color: var(--wait-short-border);
            color: var(--wait-short-text-on-bg);
        }
        .calendar-day.wait-medium {
            background: var(--wait-medium-bg);
            border-color: var(--wait-medium-border);
            color: var(--wait-medium-text-on-bg);
        }
        .calendar-day.wait-long {
            background: var(--wait-long-bg);
            border-color: var(--wait-long-border);
            color: var(--wait-long-text-on-bg);
        }
        .calendar-day.wait-very-long {
            background: var(--wait-very-long-bg);
            border-color: var(--wait-very-long-border);
            color: var(--wait-very-long-text-on-bg);
        }
        .calendar-day.wait-extreme-long {
            background: var(--wait-extreme-long-bg);
            border-color: var(--wait-extreme-long-border);
            color: var(--wait-extreme-long-text-on-bg);
        }
        .calendar-day.wait-insane-long {
            background: var(--wait-insane-long-bg);
            border-color: var(--wait-insane-long-border);
            color: var(--wait-insane-long-text-on-bg);
        }
    `;
    
    // 既存のスタイルがあれば削除して追加
    const existing = document.getElementById('wait-time-colors');
    if (existing) {
        existing.remove();
    }
    document.head.appendChild(style);
}

// ページ読み込み時に自動的にスタイルを注入
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectWaitTimeColorStyles);
    } else {
        injectWaitTimeColorStyles();
    }
}

// パーク情報
const PARKS = {
    land: {
        id: 274,
        name: '東京ディズニーランド',
        icon: '🏰',
        apiUrl: 'https://queue-times.com/parks/274/queue_times.json',
        dataFile: 'land',
        filePrefix: 'land',
        // データ保存用フォルダ名（収集スクリプト・履歴ビュー共通）
        folder: 'TDL'
    },
    sea: {
        id: 275,
        name: '東京ディズニーシー',
        icon: '🌋',
        apiUrl: 'https://queue-times.com/parks/275/queue_times.json',
        dataFile: 'sea',
        filePrefix: 'sea',
        // データ保存用フォルダ名（収集スクリプト・履歴ビュー共通）
        folder: 'TDS'
    }
};

// TDL エリア定義
const TDL_AREAS = {
    worldbazaar: { name: 'ワールドバザール', icon: '🏛️' },
    adventureland: { name: 'アドベンチャーランド', icon: '🌴' },
    westernland: { name: 'ウエスタンランド', icon: '🤠' },
    crittercountry: { name: 'クリッターカントリー', icon: '🦫' },
    fantasyland: { name: 'ファンタジーランド', icon: '🏰' },
    toontown: { name: 'トゥーンタウン', icon: '🎨' },
    tomorrowland: { name: 'トゥモローランド', icon: '🚀' }
};

// TDS エリア定義
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

// TDL アトラクション情報（エリア順）
const TDL_RIDE_INFO = {
    // ワールドバザール
    7985: { area: 'worldbazaar', name: 'オムニバス' },
    8019: { area: 'worldbazaar', name: 'ペニーアーケード' },
    // アドベンチャーランド
    7986: { area: 'adventureland', name: 'カリブの海賊' },
    7987: { area: 'adventureland', name: 'ジャングルクルーズ：ワイルドライフ・エクスペディション' },
    7988: { area: 'adventureland', name: 'ウエスタンリバー鉄道' },
    7989: { area: 'adventureland', name: 'スイスファミリー・ツリーハウス' },
    7990: { area: 'adventureland', name: '魅惑のチキルーム：スティッチ・プレゼンツ "アロハ・エ・コモ・マイ!"' },
    // ウエスタンランド
    7991: { area: 'westernland', name: 'ウエスタンランド・シューティングギャラリー' },
    7992: { area: 'westernland', name: 'カントリーベア・シアター' },
    7993: { area: 'westernland', name: '蒸気船マークトウェイン号' },
    7994: { area: 'westernland', name: 'ビッグサンダー・マウンテン' },
    7995: { area: 'westernland', name: 'トムソーヤ島いかだ' },
    // クリッターカントリー
    7996: { area: 'crittercountry', name: 'スプラッシュ・マウンテン' },
    7997: { area: 'crittercountry', name: 'ビーバーブラザーズのカヌー探険' },
    // ファンタジーランド
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
    // トゥーンタウン
    8009: { area: 'toontown', name: 'ロジャーラビットのカートゥーンスピン' },
    8010: { area: 'toontown', name: 'ミニーの家' },
    8011: { area: 'toontown', name: 'チップとデールのツリーハウス' },
    8012: { area: 'toontown', name: 'ガジェットのゴーコースター' },
    8013: { area: 'toontown', name: 'ドナルドのボート' },
    8014: { area: 'toontown', name: 'グーフィーのペイント＆プレイハウス' },
    8020: { area: 'toontown', name: 'トゥーンパーク' },
    15401: { area: 'toontown', name: 'ミッキーの家とミート・ミッキー' },
    // トゥモローランド
    8015: { area: 'tomorrowland', name: 'スター・ツアーズ：ザ・アドベンチャーズ・コンティニュー' },
    8018: { area: 'tomorrowland', name: 'モンスターズ・インク "ライド＆ゴーシーク!"' },
    8021: { area: 'tomorrowland', name: 'スティッチ・エンカウンター' },
    8254: { area: 'tomorrowland', name: 'ベイマックスのハッピーライド' },
};

// TDS アトラクション情報（エリア順）
const TDS_RIDE_INFO = {
    // メディテレーニアンハーバー
    8024: { area: 'mediterranean', name: 'ソアリン：ファンタスティック・フライト' },
    8031: { area: 'mediterranean', name: 'ディズニーシー・トランジットスチーマーライン（メディテレーニアンハーバー）' },
    8034: { area: 'mediterranean', name: 'ヴェネツィアン・ゴンドラ' },
    8048: { area: 'mediterranean', name: 'フォートレス・エクスプロレーション' },
    8049: { area: 'mediterranean', name: 'ザ・レオナルドチャレンジ' },
    // アメリカンウォーターフロント
    8023: { area: 'americanwaterfront', name: 'トイ・ストーリー・マニア！' },
    8032: { area: 'americanwaterfront', name: 'ディズニーシー・トランジットスチーマーライン（アメリカンウォーターフロント）' },
    8036: { area: 'americanwaterfront', name: 'ディズニーシー・エレクトリックレールウェイ（アメリカンウォーターフロント）' },
    8037: { area: 'americanwaterfront', name: 'ビッグシティ・ヴィークル' },
    8047: { area: 'americanwaterfront', name: 'タワー・オブ・テラー' },
    8050: { area: 'americanwaterfront', name: 'タートル・トーク' },
    // ポートディスカバリー
    8035: { area: 'portdiscovery', name: 'ディズニーシー・エレクトリックレールウェイ（ポートディスカバリー）' },
    8038: { area: 'portdiscovery', name: 'アクアトピア' },
    8051: { area: 'portdiscovery', name: 'ニモ＆フレンズ・シーライダー' },
    // ロストリバーデルタ
    8027: { area: 'lostriverdelta', name: 'インディ・ジョーンズ・アドベンチャー：クリスタルスカルの魔宮' },
    8033: { area: 'lostriverdelta', name: 'ディズニーシー・トランジットスチーマーライン（ロストリバーデルタ）' },
    8046: { area: 'lostriverdelta', name: 'レイジングスピリッツ' },
    // アラビアンコースト
    8025: { area: 'arabiancoast', name: 'ジャスミンのフライングカーペット' },
    8030: { area: 'arabiancoast', name: 'マジックランプシアター' },
    8039: { area: 'arabiancoast', name: 'シンドバッド・ストーリーブック・ヴォヤッジ' },
    8040: { area: 'arabiancoast', name: 'キャラバンカルーセル' },
    // マーメイドラグーン
    8022: { area: 'mermaidlagoon', name: 'アリエルのプレイグラウンド' },
    8026: { area: 'mermaidlagoon', name: 'マーメイドラグーンシアター' },
    8041: { area: 'mermaidlagoon', name: 'フランダーのフライングフィッシュコースター' },
    8042: { area: 'mermaidlagoon', name: 'スカットルのスクーター' },
    8043: { area: 'mermaidlagoon', name: 'ジャンピン・ジェリーフィッシュ' },
    8044: { area: 'mermaidlagoon', name: 'ブローフィッシュ・バルーンレース' },
    8045: { area: 'mermaidlagoon', name: 'ワールプール' },
    // ミステリアスアイランド
    8028: { area: 'mysteriousisland', name: 'センター・オブ・ジ・アース' },
    8029: { area: 'mysteriousisland', name: '海底2万マイル' },
    // ファンタジースプリングス
    13559: { area: 'fantasysprings', name: 'アナとエルサのフローズンジャーニー' },
    13560: { area: 'fantasysprings', name: 'ラプンツェルのランタンフェスティバル' },
    13561: { area: 'fantasysprings', name: 'ピーターパンのネバーランドアドベンチャー' },
    13562: { area: 'fantasysprings', name: 'フェアリー・ティンカーベルのビジーバギー' },
};

// ユーティリティ関数：アトラクション名を取得
function getRideNameFromInfo(rideId, park, originalName) {
    const rideInfo = park === 'land' ? TDL_RIDE_INFO[rideId] : TDS_RIDE_INFO[rideId];
    return rideInfo?.name || originalName;
}

// ユーティリティ関数：アトラクション情報を取得
function getRideInfoByPark(rideId, park) {
    return park === 'land' ? TDL_RIDE_INFO[rideId] : TDS_RIDE_INFO[rideId];
}

// ユーティリティ関数：エリア情報を取得
function getAreasByPark(park) {
    return park === 'land' ? TDL_AREAS : TDS_AREAS;
}

// ユーティリティ関数：待ち時間から共通の色分けクラスを取得
// 両画面（index.html / history.html）で同じしきい値を使うための共通関数
function getWaitClassGlobal(waitTime) {
    if (waitTime == null || isNaN(waitTime)) return '';
    const v = Number(waitTime);
    // 0〜30 / 30〜60 / 60〜90 / 90〜120 / 120〜180 / 180+ の6段階
    if (v <= 30)  return 'wait-short';
    if (v <= 60)  return 'wait-medium';
    if (v <= 90)  return 'wait-long';
    if (v <= 120) return 'wait-very-long';
    if (v <= 180) return 'wait-extreme-long';
    // 180分を超える場合は最も混雑した色
    return 'wait-insane-long';
}
