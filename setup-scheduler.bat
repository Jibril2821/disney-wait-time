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

:: 実行間隔の選択
echo ----------------------------------------
echo 実行間隔を選択してください:
echo ----------------------------------------
echo   1. 5分ごと
echo   2. 15分ごと（推奨）
echo   3. 30分ごと
echo   4. キャンセル
echo ----------------------------------------
echo.

set /p CHOICE="番号を入力 (1-4): "

if "%CHOICE%"=="1" (
    set INTERVAL=5
    set DURATION=12:05
) else if "%CHOICE%"=="2" (
    set INTERVAL=15
    set DURATION=12:15
) else if "%CHOICE%"=="3" (
    set INTERVAL=30
    set DURATION=12:30
) else if "%CHOICE%"=="4" (
    echo キャンセルしました。
    pause
    exit /b 0
) else (
    echo [エラー] 無効な選択です。
    pause
    exit /b 1
)

echo.
echo 登録するタスク:
echo   - 名前: DisneyWaitTimeCollector
echo   - 実行間隔: %INTERVAL%分ごと（9:00〜21:00、21:00含む）
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

:: タスクの作成（9:00〜21:00の間、指定間隔で実行）
schtasks /create /tn "DisneyWaitTimeCollector" /tr "\"C:\Program Files\nodejs\node.exe\" \"%SCRIPT_PATH%\"" /sc daily /st 09:00 /du %DURATION% /ri %INTERVAL% /f

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo [成功] タスクが登録されました！
    echo ========================================
    echo.
    echo 9:00〜21:00の間（21:00含む）、%INTERVAL%分ごとに自動でデータが収集され、GitHubにプッシュされます。
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
