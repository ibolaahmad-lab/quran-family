Remove-Item -Path "C:\Users\Ibo\Desktop\نورالقرآن - دستیار حفظ و قرائت همسرم.url" -ErrorAction SilentlyContinue

$wsh = New-Object -ComObject WScript.Shell
$desktop = [System.Environment]::GetFolderPath('Desktop')
$shortcutPath = Join-Path $desktop "Koran Hifz Studio - Für meine Frau.lnk"
$shortcut = $wsh.CreateShortcut($shortcutPath)
$shortcut.TargetPath = "C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster\index.html"
$shortcut.IconLocation = "C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster\quran.ico, 0"
$shortcut.Description = "Koran Hifz & Tadschwīd Begleiter"
$shortcut.Save()

# Also make a .url file as backup
$urlPath = Join-Path $desktop "Koran Hifz Studio - Für meine Frau.url"
$urlContent = @"
[InternetShortcut]
URL=file:///C:/Users/Ibo/.gemini/antigravity/scratch/QuranHifzMaster/index.html
IconFile=C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster\quran.ico
IconIndex=0
"@
[System.IO.File]::WriteAllText($urlPath, $urlContent, [System.Text.Encoding]::UTF8)

Write-Output "Shortcut successfully created!"
