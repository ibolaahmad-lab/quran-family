param(
    [ValidateSet("Ghamadi_40kbps", "Alafasy_128kbps", "Minshawy_Murattal_128kbps")]
    [string]$Reciter = "Ghamadi_40kbps",
    [int]$StartSurah = 1,
    [int]$EndSurah = 114
)

$baseDir = $PSScriptRoot
if (-not $baseDir) { $baseDir = "C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster" }

$audioDir = Join-Path $baseDir "audio\$Reciter"
if (-not (Test-Path $audioDir)) {
    New-Item -ItemType Directory -Path $audioDir -Force | Out-Null
}

$surahVerseCounts = @(
    0,   # 0 dummy
    7, 286, 200, 176, 120, 165, 206,  75, 129, 109,
    123, 111,  43,  52,  99, 128, 111, 110,  98, 135,
    112,  78, 118,  64,  77, 227,  93,  88,  69,  60,
     34,  30,  73,  54,  45,  83, 182,  88,  75,  85,
     54,  53,  89,  59,  37,  35,  38,  29,  18,  45,
     60,  49,  62,  55,  78,  96,  29,  22,  24,  13,
     14,  11,  11,  18,  12,  12,  30,  52,  52,  44,
     28,  28,  20,  56,  40,  31,  50,  40,  46,  42,
     29,  19,  36,  25,  22,  17,  19,  26,  30,  20,
     15,  21,  11,   8,   8,  19,   5,   8,   8,  11,
     11,   8,   3,   9,   5,   4,   7,   3,   6,   3,
      5,   4,   5,   6
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   QURAN HIFZ MASTER - OFFLINE AUDIO DOWNLOADER" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Qari / Rezitator : $Reciter" -ForegroundColor Green
Write-Host "Suren-Bereich    : von Sure $StartSurah bis Sure $EndSurah" -ForegroundColor Green
Write-Host "Zielordner       : $audioDir" -ForegroundColor Gray
Write-Host "==========================================================" -ForegroundColor Cyan

$webClient = New-Object System.Net.WebClient
$totalDownloaded = 0
$totalSkipped = 0

for ($s = $StartSurah; $s -le $EndSurah; $s++) {
    $vCount = $surahVerseCounts[$s]
    $sStr = $s.ToString("000")
    Write-Host "-> Sure $s ($vCount Verse)..." -ForegroundColor Yellow

    for ($a = 1; $a -le $vCount; $a++) {
        $aStr = $a.ToString("000")
        $fileName = "$sStr$aStr.mp3"
        $localPath = Join-Path $audioDir $fileName
        
        if (Test-Path $localPath) {
            $totalSkipped++
            continue
        }

        $url = "https://everyayah.com/data/$Reciter/$fileName"
        try {
            $webClient.DownloadFile($url, $localPath)
            $totalDownloaded++
            Write-Host "   [+] Heruntergeladen: $fileName" -ForegroundColor DarkGreen
        } catch {
            Write-Host "   [!] Fehler bei $fileName : $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host "`nFertig! Neu heruntergeladen: $totalDownloaded, Bereits vorhanden: $totalSkipped" -ForegroundColor Green
