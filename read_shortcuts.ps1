$wsh = New-Object -ComObject WScript.Shell
$sc1 = $wsh.CreateShortcut("C:\Users\Ibo\Desktop\تەفسیری نامی ( مامۆستا عبدالكریم مدرس ) - YouTube.lnk")
$sc2 = $wsh.CreateShortcut("C:\Users\Ibo\Desktop\عبدالكريم الديوان - YouTube.lnk")
$sc3 = $wsh.CreateShortcut("C:\Users\Ibo\Desktop\Quran Loop.lnk")
Write-Output "Tafsiri Nami Target: $($sc1.TargetPath) Arguments: $($sc1.Arguments)"
Write-Output "Abdul Karim Target: $($sc2.TargetPath) Arguments: $($sc2.Arguments)"
Write-Output "Quran Loop Target: $($sc3.TargetPath) Arguments: $($sc3.Arguments)"
