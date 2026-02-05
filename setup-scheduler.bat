@echo off
chcp 65001 >nul
echo ========================================
echo 東京ディズニーリゾート待ち時間収集
echo タスクスケジューラ登録ツール
echo ========================================
echo.

:: Node.jsが存在するか確認
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [エラー] Node.jsがインストールされていません。
    echo https://nodejs.org/ からインストールしてください。
    pause
    exit /b 1
)

echo Node.jsが見つかりました。
node --version
echo.

:: スクリプトのパスを取得
set SCRIPT_PATH=%~dp0collect-data.js

echo 登録するタスク:
echo   - 名前: DisneyWaitTimeCollector
echo   - 実行間隔: 30分ごと
echo   - スクリプト: %SCRIPT_PATH%
echo.

:: 管理者権限の確認
net session >nul 2>nul
if %errorlevel% neq 0 (
    echo [警告] 管理者権限が必要です。
    echo このバッチファイルを右クリック → 「管理者として実行」してください。
    pause
    exit /b 1
)

:: 既存タスクの削除（存在する場合）
schtasks /delete /tn "DisneyWaitTimeCollector" /f >nul 2>nul

:: タスクの作成（30分ごとに実行）
schtasks /create /tn "DisneyWaitTimeCollector" /tr "node \"%SCRIPT_PATH%\"" /sc minute /mo 30 /f

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo [成功] タスクが登録されました！
    echo ========================================
    echo.
    echo 30分ごとに自動でデータが収集されます。
    echo データは %~dp0data\ フォルダに保存されます。
    echo.
    echo タスクを削除するには以下のコマンドを実行:
    echo   schtasks /delete /tn "DisneyWaitTimeCollector" /f
    echo.
) else (
    echo.
    echo [エラー] タスクの登録に失敗しました。
)

pause
