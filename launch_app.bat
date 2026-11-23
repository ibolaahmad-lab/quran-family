@echo off
cd /d "%~dp0"

where node >nul 2>nul
if %ERRORLEVEL% equ 0 (
    start /b "" node "%~dp0server.js" >nul 2>nul
) else (
    powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start_server.ps1"
)

ping 127.0.0.1 -n 2 >nul

if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --app="http://127.0.0.1:8081/index.html" --user-data-dir="%~dp0AppProfile" --enable-features=SpeechRecognition
) else if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" --app="http://127.0.0.1:8081/index.html" --user-data-dir="%~dp0AppProfile" --enable-features=SpeechRecognition
) else if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --app="http://127.0.0.1:8081/index.html" --user-data-dir="%~dp0AppProfile"
) else (
    start "" "http://127.0.0.1:8081/index.html"
)
exit
