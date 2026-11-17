$sh = New-Object -ComObject WScript.Shell
$sc = $sh.CreateShortcut('C:\Users\Ibo\Desktop\Koran Hifz Studio - Fuer meine Frau.lnk')
Write-Host "Target: $($sc.TargetPath)"
Write-Host "Arguments: $($sc.Arguments)"
