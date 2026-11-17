$wsh = New-Object -ComObject WScript.Shell
$lnkPath = "C:\Users\Ibo\Desktop\Koran Hifz Studio - Fuer meine Frau.lnk"

$shortcut = $wsh.CreateShortcut($lnkPath)
$shortcut.TargetPath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$shortcut.Arguments = '--app="http://127.0.0.1:8080/index.html"'
$shortcut.IconLocation = "C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster\quran.ico, 0"
$shortcut.Description = "Koran Hifz Studio - Fuer meine Frau"
$shortcut.WorkingDirectory = "C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster"
$shortcut.Save()

Write-Output "Direct Chrome Shortcut saved successfully!"
