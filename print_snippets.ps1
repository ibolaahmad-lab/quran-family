$lines = Get-Content -Path "C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster\index.html" -Encoding UTF8

function FindLines($pattern, $before=2, $after=4) {
    for ($i=0; $i -lt $lines.Length; $i++) {
        if ($lines[$i] -match $pattern) {
            $start = [Math]::Max(0, $i - $before)
            $end = [Math]::Min($lines.Length - 1, $i + $after)
            Write-Host "--- Match for '$pattern' at Line $($i+1) ---"
            for ($j=$start; $j -le $end; $j++) {
                Write-Host ("{0,5}: {1}" -f ($j+1), $lines[$j])
            }
            break
        }
    }
}

FindLines "appThemeSelect"
FindLines "mushafThemeSelect"
FindLines "recitePageSearchInput"
FindLines "tafsirBtnIbnKathir"
FindLines "activeAyahMarkHifzBtn"
FindLines "repeatViewArea"
FindLines "studio_extensions.js"
