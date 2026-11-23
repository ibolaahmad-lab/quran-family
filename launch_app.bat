@echo off
cd /d "%~dp0"

where node >nul 2>nul
if %ERRORLEVEL% equ 0 (
    start /b "" node "%~dp0server.js" >nul 2>nul
)

ping 127.0.0.1 -n 2 >nul

set APP_FLAGS=--app="http://127.0.0.1:8081/index.html" --window-size=412,892 --window-position=550,40 --user-data-dir="%~dp0AppProfile" --enable-features=SpeechRecognition

if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" %APP_FLAGS%
) else if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" %APP_FLAGS%
) else if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" %APP_FLAGS%
) else (
    start "" "http://127.0.0.1:8081/index.html"
)
exit
