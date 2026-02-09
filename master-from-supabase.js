/**
 * Supabase のマスタ（parks, areas, rides）を取得し、
 * index.html / history.html で使うグローバル変数（PARKS, TDL_AREAS, TDS_AREAS, TDL_RIDE_INFO, TDS_RIDE_INFO）をセットする。
 * supabase-config.js の後に読み込むこと。
 */
(function () {
    'use strict';

    /**
     * Supabase REST API 用のリクエストヘッダー（apikey, Authorization, Accept）を返す。
     * @returns {{ apikey: string, Authorization: string, Accept: string }}
     */
    function getHeaders() {
        const key = typeof window !== 'undefined' && window.SUPABASE_ANON_KEY ? window.SUPABASE_ANON_KEY : '';
        return {
            'apikey': key,
            'Authorization': 'Bearer ' + key,
            'Accept': 'application/json'
        };
    }

    /**
     * Supabase から parks / areas / rides を取得し、window に PARKS, TDL_AREAS, TDS_AREAS, TDL_RIDE_INFO, TDS_RIDE_INFO をセットする。
     * @returns {Promise<void>}
     */
    async function loadMasterFromSupabase() {
        const baseUrl = (typeof window !== 'undefined' && window.SUPABASE_URL ? window.SUPABASE_URL : '').replace(/\/$/, '');
        const empty = {
            PARKS: {},
            TDL_AREAS: {},
            TDS_AREAS: {},
            TDL_RIDE_INFO: {},
            TDS_RIDE_INFO: {}
        };

        if (!baseUrl || !window.SUPABASE_ANON_KEY) {
            window.PARKS = empty.PARKS;
            window.TDL_AREAS = empty.TDL_AREAS;
            window.TDS_AREAS = empty.TDS_AREAS;
            window.TDL_RIDE_INFO = empty.TDL_RIDE_INFO;
            window.TDS_RIDE_INFO = empty.TDS_RIDE_INFO;
            return;
        }

        try {
            const [parksRes, areasRes, ridesRes] = await Promise.all([
                fetch(baseUrl + '/rest/v1/parks?order=park_id', { method: 'GET', headers: getHeaders(), cache: 'default' }),
                fetch(baseUrl + '/rest/v1/areas?order=park_id,area_key', { method: 'GET', headers: getHeaders(), cache: 'default' }),
                fetch(baseUrl + '/rest/v1/rides?order=park_id,ride_id', { method: 'GET', headers: getHeaders(), cache: 'default' })
            ]);

            if (!parksRes.ok || !areasRes.ok || !ridesRes.ok) {
                throw new Error('マスタの取得に失敗しました');
            }

            const parksRows = await parksRes.json();
            const areasRows = await areasRes.json();
            const ridesRows = await ridesRes.json();

            const PARKS = {};
            (parksRows || []).forEach(function (p) {
                PARKS[p.park_id] = {
                    id: p.api_id,
                    name: p.name,
                    icon: p.icon || '',
                    apiUrl: 'https://queue-times.com/parks/' + p.api_id + '/queue_times.json',
                    dataFile: p.park_id,
                    filePrefix: p.park_id,
                    folder: p.folder
                };
            });

            const TDL_AREAS = {};
            const TDS_AREAS = {};
            (areasRows || []).forEach(function (a) {
                const obj = { name: a.name, icon: a.icon || '' };
                if (a.park_id === 'land') {
                    TDL_AREAS[a.area_key] = obj;
                } else {
                    TDS_AREAS[a.area_key] = obj;
                }
            });

            const TDL_RIDE_INFO = {};
            const TDS_RIDE_INFO = {};
            (ridesRows || []).forEach(function (r) {
                const obj = { area: r.area_key, name: r.name };
                if (r.park_id === 'land') {
                    TDL_RIDE_INFO[r.ride_id] = obj;
                } else {
                    TDS_RIDE_INFO[r.ride_id] = obj;
                }
            });

            window.PARKS = PARKS;
            window.TDL_AREAS = TDL_AREAS;
            window.TDS_AREAS = TDS_AREAS;
            window.TDL_RIDE_INFO = TDL_RIDE_INFO;
            window.TDS_RIDE_INFO = TDS_RIDE_INFO;
        } catch (err) {
            console.error('loadMasterFromSupabase:', err);
            window.PARKS = empty.PARKS;
            window.TDL_AREAS = empty.TDL_AREAS;
            window.TDS_AREAS = empty.TDS_AREAS;
            window.TDL_RIDE_INFO = empty.TDL_RIDE_INFO;
            window.TDS_RIDE_INFO = empty.TDS_RIDE_INFO;
        }
    }

    window.loadMasterFromSupabase = loadMasterFromSupabase;
})();
