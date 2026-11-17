$wsh = New-Object -ComObject WScript.Shell

$paths = @(
    "C:\Users\Ibo\Desktop\Koran Hifz Studio - Fuer meine Frau.lnk",
    (Join-Path ([System.Environment]::GetFolderPath('Desktop')) "Koran Hifz Studio - Fuer meine Frau.lnk")
) | Select-Object -Unique

foreach ($lnkPath in $paths) {
    Write-Output "Writing shortcut to: $lnkPath"
    $shortcut = $wsh.CreateShortcut($lnkPath)
    $shortcut.TargetPath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
    $shortcut.Arguments = '--app="http://127.0.0.1:8080/index.html" --user-data-dir="C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster\AppProfile" --enable-features=SpeechRecognition'
    $shortcut.IconLocation = "C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster\quran.ico, 0"
    $shortcut.Description = "Koran Hifz und Mushaf Studio - Fuer meine Frau"
    $shortcut.WorkingDirectory = "C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster"
    $shortcut.Save()
}

Write-Output "Shortcuts created and verified!"
