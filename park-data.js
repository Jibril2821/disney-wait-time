/**
 * 待ち時間の色設定とスタイル注入・色分けクラス取得
 * パーク・エリア・アトラクションのマスタは Supabase（master-from-supabase.js）を参照。
 *
 * 待ち時間帯とクラス名一覧（getWaitClassGlobal の戻り値）:
 *   0〜30分   → wait-short
 *  30〜60分   → wait-medium
 *  60〜90分   → wait-long
 *  90〜120分  → wait-very-long
 * 120〜180分  → wait-extreme-long
 * 180〜240分  → wait-insane-long（紫）
 * 240〜300分  → wait-ultra-long（濃い紫）
 * 300分〜     → wait-max-long（黒）
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
        // 180〜240分（紫）
        primary: '#9b59b6',
        gradient: ['#9b59b6', '#8e44ad'],
        bgRgba: 'rgba(155, 89, 182, 0.55)',
        borderRgba: 'rgba(155, 89, 182, 0.75)',
        textOnBg: '#f5eef8'
    },
    ultraLong: {
        // 240〜300分（濃い紫）
        primary: '#6c3483',
        gradient: ['#6c3483', '#4a235a'],
        bgRgba: 'rgba(108, 52, 131, 0.75)',
        borderRgba: 'rgba(108, 52, 131, 0.9)',
        textOnBg: '#f5eef8'
    },
    maxLong: {
        // 300分以上（黒）
        primary: '#1a1a1a',
        gradient: ['#2d2d2d', '#1a1a1a'],
        bgRgba: 'rgba(26, 26, 26, 0.9)',
        borderRgba: 'rgba(26, 26, 26, 1)',
        textOnBg: '#f0f0f0'
    }
};

// 待ち時間文字色を薄めたカード背景用（hex → rgba, opacity 小）
function hexToRgba(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
}

// CSS変数として色コードを注入する関数
function injectWaitTimeColorStyles() {
    const style = document.createElement('style');
    style.id = 'wait-time-colors';
    const cardBgOpacity = 0.14;
    const c = WAIT_TIME_COLORS;
    style.textContent = `
        :root {
            /* wait-short (0〜30分) */
            --wait-short-primary: ${c.short.primary};
            --wait-short-gradient: linear-gradient(90deg, ${c.short.gradient[0]}, ${c.short.gradient[1]});
            --wait-short-bg: ${c.short.bgRgba};
            --wait-short-border: ${c.short.borderRgba};
            --wait-short-text-on-bg: ${c.short.textOnBg};
            --wait-short-card-bg: ${hexToRgba(c.short.primary, cardBgOpacity)};

            /* wait-medium (30〜60分) */
            --wait-medium-primary: ${c.medium.primary};
            --wait-medium-gradient: linear-gradient(90deg, ${c.medium.gradient[0]}, ${c.medium.gradient[1]});
            --wait-medium-bg: ${c.medium.bgRgba};
            --wait-medium-border: ${c.medium.borderRgba};
            --wait-medium-text-on-bg: ${c.medium.textOnBg};
            --wait-medium-card-bg: ${hexToRgba(c.medium.primary, cardBgOpacity)};

            /* wait-long (60〜90分) */
            --wait-long-primary: ${c.long.primary};
            --wait-long-gradient: linear-gradient(90deg, ${c.long.gradient[0]}, ${c.long.gradient[1]});
            --wait-long-bg: ${c.long.bgRgba};
            --wait-long-border: ${c.long.borderRgba};
            --wait-long-text-on-bg: ${c.long.textOnBg};
            --wait-long-card-bg: ${hexToRgba(c.long.primary, cardBgOpacity)};

            /* wait-very-long (90〜120分) */
            --wait-very-long-primary: ${c.veryLong.primary};
            --wait-very-long-gradient: linear-gradient(90deg, ${c.veryLong.gradient[0]}, ${c.veryLong.gradient[1]});
            --wait-very-long-bg: ${c.veryLong.bgRgba};
            --wait-very-long-border: ${c.veryLong.borderRgba};
            --wait-very-long-text-on-bg: ${c.veryLong.textOnBg};
            --wait-very-long-card-bg: ${hexToRgba(c.veryLong.primary, cardBgOpacity)};

            /* wait-extreme-long (120〜180分) */
            --wait-extreme-long-primary: ${c.extremeLong.primary};
            --wait-extreme-long-gradient: linear-gradient(90deg, ${c.extremeLong.gradient[0]}, ${c.extremeLong.gradient[1]});
            --wait-extreme-long-bg: ${c.extremeLong.bgRgba};
            --wait-extreme-long-border: ${c.extremeLong.borderRgba};
            --wait-extreme-long-text-on-bg: ${c.extremeLong.textOnBg};
            --wait-extreme-long-card-bg: ${hexToRgba(c.extremeLong.primary, cardBgOpacity)};

            /* wait-insane-long (180〜240分) */
            --wait-insane-long-primary: ${c.insaneLong.primary};
            --wait-insane-long-gradient: linear-gradient(90deg, ${c.insaneLong.gradient[0]}, ${c.insaneLong.gradient[1]});
            --wait-insane-long-bg: ${c.insaneLong.bgRgba};
            --wait-insane-long-border: ${c.insaneLong.borderRgba};
            --wait-insane-long-text-on-bg: ${c.insaneLong.textOnBg};
            --wait-insane-long-card-bg: ${hexToRgba(c.insaneLong.primary, cardBgOpacity)};

            /* wait-ultra-long (240〜300分) */
            --wait-ultra-long-primary: ${c.ultraLong.primary};
            --wait-ultra-long-gradient: linear-gradient(90deg, ${c.ultraLong.gradient[0]}, ${c.ultraLong.gradient[1]});
            --wait-ultra-long-bg: ${c.ultraLong.bgRgba};
            --wait-ultra-long-border: ${c.ultraLong.borderRgba};
            --wait-ultra-long-text-on-bg: ${c.ultraLong.textOnBg};
            --wait-ultra-long-card-bg: ${hexToRgba(c.ultraLong.primary, cardBgOpacity)};

            /* wait-max-long (300分以上) */
            --wait-max-long-primary: ${c.maxLong.primary};
            --wait-max-long-gradient: linear-gradient(90deg, ${c.maxLong.gradient[0]}, ${c.maxLong.gradient[1]});
            --wait-max-long-bg: ${c.maxLong.bgRgba};
            --wait-max-long-border: ${c.maxLong.borderRgba};
            --wait-max-long-text-on-bg: ${c.maxLong.textOnBg};
            --wait-max-long-card-bg: ${hexToRgba(c.maxLong.primary, cardBgOpacity)};
        }

        /* アトラクションカード背景（待ち時間文字色を薄めた色）リアルタイム・履歴共通 */
        .ride-card.wait-short { background: var(--wait-short-card-bg); }
        .ride-card.wait-medium { background: var(--wait-medium-card-bg); }
        .ride-card.wait-long { background: var(--wait-long-card-bg); }
        .ride-card.wait-very-long { background: var(--wait-very-long-card-bg); }
        .ride-card.wait-extreme-long { background: var(--wait-extreme-long-card-bg); }
        .ride-card.wait-insane-long { background: var(--wait-insane-long-card-bg); }
        .ride-card.wait-ultra-long { background: var(--wait-ultra-long-card-bg); }
        .ride-card.wait-max-long { background: var(--wait-max-long-card-bg); }

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

        .wait-ultra-long .wait-time-number { color: var(--wait-ultra-long-primary); }
        .wait-ultra-long .wait-time-fill { background: var(--wait-ultra-long-gradient); }

        .wait-max-long .wait-time-number { color: var(--wait-max-long-primary); }
        .wait-max-long .wait-time-fill { background: var(--wait-max-long-gradient); }

        /* 汎用待ち時間クラス（テキスト色のみ）- テーブルセル等で使用 */
        td.wait-short, span.wait-short { color: var(--wait-short-primary); }
        td.wait-medium, span.wait-medium { color: var(--wait-medium-primary); }
        td.wait-long, span.wait-long { color: var(--wait-long-primary); }
        td.wait-very-long, span.wait-very-long { color: var(--wait-very-long-primary); }
        td.wait-extreme-long, span.wait-extreme-long { color: var(--wait-extreme-long-primary); }
        td.wait-insane-long, span.wait-insane-long { color: var(--wait-insane-long-primary); }
        td.wait-ultra-long, span.wait-ultra-long { color: var(--wait-ultra-long-primary); }
        td.wait-max-long, span.wait-max-long { color: var(--wait-max-long-primary); }

        /* リアルタイム画面のアトラクション名は白色を維持 */
        .ride-card .ride-name { color: #fff; }

        /* ライドカード統計値用 */
        .ride-card-stat-value.wait-short { color: var(--wait-short-primary); }
        .ride-card-stat-value.wait-medium { color: var(--wait-medium-primary); }
        .ride-card-stat-value.wait-long { color: var(--wait-long-primary); }
        .ride-card-stat-value.wait-very-long { color: var(--wait-very-long-primary); }
        .ride-card-stat-value.wait-extreme-long { color: var(--wait-extreme-long-primary); }
        .ride-card-stat-value.wait-insane-long { color: var(--wait-insane-long-primary); }
        .ride-card-stat-value.wait-ultra-long { color: var(--wait-ultra-long-primary); }
        .ride-card-stat-value.wait-max-long { color: var(--wait-max-long-primary); }

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
        .heatmap-cell.wait-ultra-long {
            background: var(--wait-ultra-long-bg);
            color: var(--wait-ultra-long-text-on-bg);
        }
        .heatmap-cell.wait-max-long {
            background: var(--wait-max-long-bg);
            color: var(--wait-max-long-text-on-bg);
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
        .calendar-day.wait-ultra-long {
            background: var(--wait-ultra-long-bg);
            border-color: var(--wait-ultra-long-border);
            color: var(--wait-ultra-long-text-on-bg);
        }
        .calendar-day.wait-max-long {
            background: var(--wait-max-long-bg);
            border-color: var(--wait-max-long-border);
            color: var(--wait-max-long-text-on-bg);
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

// パーク・エリア・アトラクションのマスタは Supabase から取得（master-from-supabase.js で window.PARKS / TDL_AREAS / TDS_AREAS / TDL_RIDE_INFO / TDS_RIDE_INFO をセット）

// ユーティリティ関数：待ち時間から共通の色分けクラスを取得
// 両画面（index.html / history.html）で同じしきい値を使うための共通関数
function getWaitClassGlobal(waitTime) {
    if (waitTime == null || isNaN(waitTime)) return '';
    const v = Number(waitTime);
    // 0〜30 / 30〜60 / 60〜90 / 90〜120 / 120〜180 / 180〜240 / 240〜300 / 300+ の8段階
    if (v <= 30)  return 'wait-short';
    if (v <= 60)  return 'wait-medium';
    if (v <= 90)  return 'wait-long';
    if (v <= 120) return 'wait-very-long';
    if (v <= 180) return 'wait-extreme-long';
    if (v <= 240) return 'wait-insane-long';   // 紫
    if (v <= 300) return 'wait-ultra-long';    // 濃い紫
    return 'wait-max-long';                    // 黒
}
