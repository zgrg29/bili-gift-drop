@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul
if %errorlevel% equ 0 (
  node src/server/index.mjs --open
) else if exist "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" (
  "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" src/server/index.mjs --open
) else (
  echo Node.js 22+ required / 请安装 Node.js 22 或更新版本 / Node.js 22 以上が必要です
)
pause
