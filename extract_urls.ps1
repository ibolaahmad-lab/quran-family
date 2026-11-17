Get-ChildItem "C:\Users\Ibo\Desktop" -Filter "*YouTube*" | ForEach-Object {
    Write-Output "=== File: $($_.FullName) ==="
    $bytes = [System.IO.File]::ReadAllBytes($_.FullName)
    $text = [System.Text.Encoding]::Default.GetString($bytes)
    # look for http or youtube
    $matches = [regex]::Matches($text, "https?://[^\x00\s\""<>]+")
    foreach ($m in $matches) {
        Write-Output "URL: $($m.Value)"
    }
}
