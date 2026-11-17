$lines = Get-Content 'C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster\index.html' -Encoding UTF8
for ($i=0; $i -lt $lines.Length; $i++) {
    if ($lines[$i] -match 'class="main-tabs"') {
        Write-Host ("Match at line {0}: {1}" -f ($i+1), $lines[$i])
    }
}
