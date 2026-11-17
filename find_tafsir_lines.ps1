$lines = Get-Content 'C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster\index.html'
$start = -1
$end = -1

for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match '<div id="tafsirViewArea"') {
        $start = $i
    }
    if ($start -ge 0 -and $lines[$i] -match '<div id="tafsirContentContainer"') {
        $end = $i + 2
        break
    }
}

Write-Output "Found from line $($start + 1) to $($end + 1)"
for ($j = $start; $j -le $end; $j++) {
    Write-Output "Line $j : $($lines[$j])"
}
