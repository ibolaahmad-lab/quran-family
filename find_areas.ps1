$lines = Get-Content 'C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster\index.html' -Encoding UTF8
for ($i=3150; $i -lt 3800; $i++) {
    if ($lines[$i] -match '<div id="[a-zA-Z0-9]+View"|<div id="[a-zA-Z0-9]+Area"|<div id="verses') {
        Write-Host ("Line {0}: {1}" -f ($i+1), $lines[$i])
    }
}
