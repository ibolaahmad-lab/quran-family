$wsh = New-Object -ComObject WScript.Shell
$desktop = [System.Environment]::GetFolderPath('Desktop')
$lnkPath = Join-Path $desktop "Koran Hifz Studio - Fuer meine Frau.lnk"
$shortcut = $wsh.CreateShortcut($lnkPath)
$shortcut.TargetPath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
# Removed --use-fake-ui-for-media-stream to eliminate the Chrome warning banner
$shortcut.Arguments = "--app=`"http://127.0.0.1:8080/index.html`" --user-data-dir=`"C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster\AppProfile`" --enable-features=SpeechRecognition"
$shortcut.IconLocation = "C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster\quran.ico, 0"
$shortcut.Description = "Koran Hifz und Mushaf Studio - Fur meine Frau"
$shortcut.Save()
Write-Output "Shortcut updated without warning banner flag!"
