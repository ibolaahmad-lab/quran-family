$lines = Get-Content 'C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster\index.html' -Encoding UTF8
$start = 3731
$end = 3780
for ($i=$start; $i -le $end; $i++) {
    Write-Host ("{0}: {1}" -f ($i+1), $lines[$i])
}
