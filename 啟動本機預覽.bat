@echo off
cd /d "%~dp0"

where python >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Python not found. Please install Python and add it to PATH.
    pause
    exit /b 1
)

echo Starting local preview server on port 8888...
start "BIGBANG preview server - close this window to stop" cmd /k "cd /d "%~dp0" && python tools\dev_server.py"

timeout /t 2 /nobreak >nul

start "" "http://localhost:8888/"

echo.
echo Done. If the browser shows a connection error, wait a second and refresh (press F5).
echo To stop the preview, close the other black window running python http.server.
echo.
pause
