@echo off
chcp 65001 >nul
echo ========================================
echo 東京ディズニーリゾート待ち時間
echo ローカルサーバー起動
echo ========================================
echo.

:: Node.jsが存在するか確認
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [エラー] Node.jsがインストールされていません。
    pause
    exit /b 1
)

:: ブラウザを開く（少し遅延させる）
start "" "http://localhost:3000"

:: サーバー起動
cd /d "%~dp0"
node server.js
