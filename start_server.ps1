$port = 8081
$isRunning = $false
try {
    $client = New-Object System.Net.Sockets.TcpClient("127.0.0.1", $port)
    $client.Close()
    $isRunning = $true
} catch {
    $isRunning = $false
}

if (-not $isRunning) {
    Start-Process powershell -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSScriptRoot\server.ps1`" -Port $port" -WindowStyle Hidden
}
