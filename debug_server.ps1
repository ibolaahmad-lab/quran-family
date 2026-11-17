$logFile = "C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster\server.log"
if (Test-Path $logFile) { Remove-Item $logFile -Force }

$pinfo = New-Object System.Diagnostics.ProcessStartInfo
$pinfo.FileName = "powershell.exe"
$pinfo.Arguments = "-NoProfile -ExecutionPolicy Bypass -File `"C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster\server.ps1`" -Port 8080"
$pinfo.RedirectStandardOutput = $true
$pinfo.RedirectStandardError = $true
$pinfo.UseShellExecute = $false
$pinfo.CreateNoWindow = $true

$process = New-Object System.Diagnostics.Process
$process.StartInfo = $pinfo
$process.Start() | Out-Null

Start-Sleep -Seconds 2

if ($process.HasExited) {
    $err = $process.StandardError.ReadToEnd()
    $out = $process.StandardOutput.ReadToEnd()
    Write-Output "PROCESS EXITED! Error: $err | Out: $out"
} else {
    Write-Output "PROCESS RUNNING! (PID: $($process.Id))"
    try {
        $res = Invoke-WebRequest -Uri 'http://127.0.0.1:8080/index.html' -TimeoutSec 3
        Write-Output "SUCCESS: $($res.StatusCode), Length: $($res.Content.Length)"
    } catch {
        Write-Output "Web error: $_"
    } finally {
        $process.Kill()
    }
}
