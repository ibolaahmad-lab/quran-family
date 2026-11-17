$procs = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue
foreach ($p in $procs) {
    $ownerPid = $p.OwningProcess
    if ($ownerPid -and $ownerPid -gt 0) {
        Stop-Process -Id $ownerPid -Force -ErrorAction SilentlyContinue
    }
}
Start-Sleep -Seconds 1
Write-Host "Port 8080 cleared"
