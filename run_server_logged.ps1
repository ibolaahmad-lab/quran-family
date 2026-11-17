$log = "C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster\server_test.log"
powershell -NoProfile -ExecutionPolicy Bypass -File "C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster\server.ps1" -Port 8080 *> $log
