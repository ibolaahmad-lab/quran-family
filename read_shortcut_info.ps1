$wsh = New-Object -ComObject WScript.Shell
$sc = $wsh.CreateShortcut('C:\Users\Ibo\Desktop\Koran Hifz Studio - Fuer meine Frau.lnk')
Write-Output ("Target: " + $sc.TargetPath)
Write-Output ("Args: " + $sc.Arguments)
Write-Output ("Icon: " + $sc.IconLocation)
Write-Output ("WorkingDir: " + $sc.WorkingDirectory)
