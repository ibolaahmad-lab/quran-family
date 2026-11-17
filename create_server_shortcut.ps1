$wsh = New-Object -ComObject WScript.Shell
$desktop = [System.Environment]::GetFolderPath('Desktop')
$lnkPath = Join-Path $desktop "Koran Studio Server (fuer iPad).lnk"
$shortcut = $wsh.CreateShortcut($lnkPath)
$shortcut.TargetPath = "C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster\start_server.bat"
$shortcut.WorkingDirectory = "C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster"
$shortcut.IconLocation = "C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster\quran.ico, 0"
$shortcut.Description = "Lokaler Server fuer iPad und mobile Geraete"
$shortcut.Save()
Write-Output "Server shortcut created on Desktop!"
