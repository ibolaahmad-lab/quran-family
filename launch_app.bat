@echo off
cd /d "%~dp0"

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start_server.ps1"

ping 127.0.0.1 -n 2 >nul

if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --app="http://127.0.0.1:8081/index.html" --user-data-dir="%~dp0AppProfile" --enable-features=SpeechRecognition
) else if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" --app="http://127.0.0.1:8081/index.html" --user-data-dir="%~dp0AppProfile" --enable-features=SpeechRecognition
) else (
    start "" "http://127.0.0.1:8081/index.html"
)
