$edgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if (-not (Test-Path $edgePath)) {
    $edgePath = "C:\Program Files\Microsoft\Edge\Application\msedge.exe"
}
$logPath = "C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster\edge_eval.log"
$proc = Start-Process -FilePath $edgePath -ArgumentList "--headless", "--dump-dom", "--enable-logging", "--v=1", "http://127.0.0.1:8081/index.html" -RedirectStandardError $logPath -PassThru -Wait
Write-Host "Edge exited with code: $($proc.ExitCode)"
Get-Content $logPath -Tail 20
