# Rebuild quran_all_pages.js using JSON.stringify for safe string escaping
$outDir = 'C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster'

# Download raw JSON
$wc = New-Object System.Net.WebClient
$wc.Encoding = [System.Text.Encoding]::UTF8

Write-Host "1) Downloading Arabic..."
$arBytes = $wc.DownloadData('https://api.alquran.cloud/v1/quran/quran-uthmani')
$arText = [System.Text.Encoding]::UTF8.GetString($arBytes)

Write-Host "2) Downloading German..."
$deBytes = $wc.DownloadData('https://api.alquran.cloud/v1/quran/de.bubenheim')
$deText = [System.Text.Encoding]::UTF8.GetString($deBytes)

# Parse
Add-Type -AssemblyName System.Web.Extensions
$ser = New-Object System.Web.Script.Serialization.JavaScriptSerializer
$ser.MaxJsonLength = [int]::MaxValue
$arData = $ser.DeserializeObject($arText)
$deData = $ser.DeserializeObject($deText)

# German lookup
$deLookup = @{}
foreach ($s in $deData['data']['surahs']) {
    foreach ($a in $s['ayahs']) { $deLookup[[int]$a['number']] = $a['text'] }
}
Write-Host "   German: $($deLookup.Count) verses"

# Organize by page
$pages = @{}
foreach ($s in $arData['data']['surahs']) {
    foreach ($a in $s['ayahs']) {
        $pg = [int]$a['page']
        if (-not $pages.ContainsKey($pg)) { $pages[$pg] = [System.Collections.ArrayList]::new() }
        $gn = [int]$a['number']
        $deV = if ($deLookup.ContainsKey($gn)) { $deLookup[$gn] } else { '' }
        [void]$pages[$pg].Add(@{
            num=[int]$a['numberInSurah']; globalNum=$gn; surahNum=[int]$s['number']
            surahAr=[string]$s['name']; surahDe=[string]$s['englishName']
            juz=[int]$a['juz']; hizbQuarter=[int]$a['hizbQuarter']
            ar=[string]$a['text']; de=$deV
        })
    }
}
Write-Host "3) Pages: $($pages.Count)"

# Build JS using JSON for all string values (safe escaping)
$sb = New-Object System.Text.StringBuilder(5000000)
[void]$sb.AppendLine("// Complete Quran Data - All 604 Pages")
[void]$sb.AppendLine("// Offline data - no API needed")
[void]$sb.AppendLine("var QURAN_ALL_PAGES = {")

$sorted = $pages.Keys | Sort-Object { [int]$_ }
$total = 0

foreach ($pg in $sorted) {
    $verses = $pages[$pg]
    [void]$sb.Append("  $pg`:[")
    $first = $true
    foreach ($v in $verses) {
        if (-not $first) { [void]$sb.Append(",") }
        $first = $false
        # Use JSON serialization for safe string escaping
        $arJson = $ser.Serialize($v.ar)
        $deJson = $ser.Serialize($v.de)
        $snJson = $ser.Serialize($v.surahAr)
        $sdJson = $ser.Serialize($v.surahDe)
        [void]$sb.Append("{num:$($v.num),globalNum:$($v.globalNum),surahNum:$($v.surahNum),surahAr:$snJson,surahDe:$sdJson,juz:$($v.juz),hizbQuarter:$($v.hizbQuarter),ar:$arJson,de:$deJson,ku:`"`",tafsir:`"`"}")
        $total++
    }
    if ([int]$pg -eq [int]$sorted[-1]) {
        [void]$sb.AppendLine("]")
    } else {
        [void]$sb.AppendLine("],")
    }
}
[void]$sb.AppendLine("};")

$outFile = "$outDir\quran_all_pages.js"
[System.IO.File]::WriteAllText($outFile, $sb.ToString(), (New-Object System.Text.UTF8Encoding($false)))

$sz = [Math]::Round((Get-Item $outFile).Length / 1MB, 2)
Write-Host "4) Saved: $outFile ($sz MB, $total verses)"

# Quick verify
$vfy = [System.IO.File]::ReadAllText($outFile, [System.Text.Encoding]::UTF8)
$l5 = ($vfy -split "`n")[3]
Write-Host "5) Line 4 preview: $($l5.Substring(0, [Math]::Min(200, $l5.Length)))"
Write-Host "DONE!"
