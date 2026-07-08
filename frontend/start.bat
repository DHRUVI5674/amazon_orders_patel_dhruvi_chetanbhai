@echo off
cd /d "%~dp0"
echo Installing frontend dependencies...
call npm install
if errorlevel 1 exit /b 1
echo.
echo Starting ShopFusion frontend at http://localhost:5173
echo Open: http://localhost:5173/dashboard
echo.
call npm run dev
