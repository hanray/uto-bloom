@echo off
echo Checking what's using COM5...
echo.

REM List all processes that might have COM5 open
wmic process where "name='arduino.exe' or name='javaw.exe' or name='java.exe' or name='SerialMonitor.exe'" get processid,caption,commandline 2>nul

echo.
echo If Arduino IDE is listed above, close it completely.
echo Then press any key to try opening COM5...
pause >nul

cd "%~dp0.."
node scripts/serial-bridge.js COM5
