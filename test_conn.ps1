try {
    $tcp = New-Object System.Net.Sockets.TcpClient('127.0.0.1', 8081)
    Write-Host "Connected to 8081 successfully!"
    $tcp.Close()
} catch {
    Write-Host "Not connected: $($_.Exception.Message)"
}
