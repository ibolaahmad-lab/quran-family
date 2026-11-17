$wsh = New-Object -ComObject WScript.Shell
$desktop = [System.Environment]::GetFolderPath('Desktop')
$shortcutPath = Join-Path $desktop "Koran Hifz Studio - Für meine Frau.lnk"

# Chrome path
$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$htmlPath = "file:///C:/Users/Ibo/.gemini/antigravity/scratch/QuranHifzMaster/index.html"
$profileDir = "C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster\AppProfile"

$shortcut = $wsh.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $chromePath
$shortcut.Arguments = "--app=`"$htmlPath`" --user-data-dir=`"$profileDir`" --enable-features=SpeechRecognition"
$shortcut.IconLocation = "C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster\quran.ico, 0"
$shortcut.Description = "Koran Hifz, Muṣḥaf & Tadschwīd Studio - Für meine Frau"
$shortcut.Save()

Write-Output "Shortcut updated with Standalone App Mode and persistent profile!"
