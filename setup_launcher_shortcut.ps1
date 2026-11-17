$wsh = New-Object -ComObject WScript.Shell

# 1. Main Launcher with auto-server background starter
$lnk1 = "C:\Users\Ibo\Desktop\Koran Hifz Studio - Fuer meine Frau.lnk"
$sc1 = $wsh.CreateShortcut($lnk1)
$sc1.TargetPath = "C:\Windows\System32\wscript.exe"
$sc1.Arguments = '"C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster\launch_app.vbs"'
$sc1.IconLocation = "C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster\quran.ico, 0"
$sc1.Description = "Koran Hifz Studio - Fuer meine Frau"
$sc1.WorkingDirectory = "C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster"
$sc1.WindowStyle = 1
$sc1.Save()

# 2. Direct Chrome App Mode shortcut
$lnk2 = "C:\Users\Ibo\Desktop\Quran Loop.lnk"
$sc2 = $wsh.CreateShortcut($lnk2)
$sc2.TargetPath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$sc2.Arguments = '--app="http://127.0.0.1:8080/index.html" --user-data-dir="C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster\AppProfile" --enable-features=SpeechRecognition'
$sc2.IconLocation = "C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster\quran.ico, 0"
$sc2.Description = "Quran Hifz & Mushaf Studio"
$sc2.WorkingDirectory = "C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster"
$sc2.WindowStyle = 1
$sc2.Save()

Write-Output "Both shortcuts configured and saved successfully!"
