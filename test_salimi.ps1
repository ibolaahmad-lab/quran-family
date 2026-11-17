$u = 'https://server14.mp3quran.net/mansor/001.mp3'
try {
    $req = [System.Net.WebRequest]::Create($u)
    $req.Method = 'HEAD'
    $res = $req.GetResponse()
    Write-Host "OK (200): $u Length=$($res.ContentLength)"
    $res.Close()
} catch {
    Write-Host "FAIL: $($_.Exception.Message)"
}
