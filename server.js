/**
 * ローカル開発用の簡易HTTPサーバー
 * これを使うとdataフォルダの自動読み込みが可能になります
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    let filePath = path.join(ROOT_DIR, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
    
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
                res.end('File not found');
            } else {
                res.writeHead(500);
                res.end('Server error');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

server.listen(PORT, () => {
    console.log(`\n========================================`);
    console.log(`🚀 サーバー起動中`);
    console.log(`========================================`);
    console.log(`\n📍 URL: http://localhost:${PORT}`);
    console.log(`📍 履歴: http://localhost:${PORT}/history.html?park=land`);
    console.log(`\n終了するには Ctrl+C を押してください\n`);
});
