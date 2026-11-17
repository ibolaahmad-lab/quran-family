$wc = New-Object System.Net.WebClient
$wc.Encoding = [System.Text.Encoding]::UTF8

# Standard Medina Mushaf starting pages for all 114 Surahs
$startPages = @(
    1,   2,   50,  77,  106, 128, 151, 177, 187, 208,
    221, 235, 249, 255, 262, 267, 282, 293, 305, 312,
    322, 332, 342, 350, 359, 367, 377, 385, 396, 404,
    411, 415, 418, 428, 434, 440, 446, 453, 458, 467,
    477, 483, 489, 496, 499, 502, 507, 511, 515, 518,
    520, 523, 526, 528, 531, 534, 537, 542, 545, 549,
    551, 553, 554, 556, 558, 560, 562, 564, 566, 568,
    570, 572, 574, 575, 577, 578, 580, 582, 583, 585,
    586, 587, 587, 589, 590, 591, 591, 592, 593, 594,
    595, 595, 596, 596, 597, 597, 598, 598, 599, 599,
    600, 600, 601, 601, 601, 602, 602, 602, 603, 603,
    603, 604, 604, 604
)

# Load existing surahs_data.js and add startPage
$content = [System.IO.File]::ReadAllText("C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster\surahs_data.js", [System.Text.Encoding]::UTF8)
$json = $content.Replace("const ALL_114_SURAHS = ", "").TrimEnd(";`r`n ")
$surahs = ConvertFrom-Json $json

for ($i = 0; $i -lt $surahs.Count; $i++) {
    $surahs[$i] | Add-Member -NotePropertyName "startPage" -NotePropertyValue $startPages[$i] -Force
}

$newJs = "const ALL_114_SURAHS = " + ($surahs | ConvertTo-Json -Depth 4) + ";"
[System.IO.File]::WriteAllText("C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster\surahs_data.js", $newJs, [System.Text.Encoding]::UTF8)
Write-Output "Successfully updated surahs_data.js with startPage for all $($surahs.Count) Surahs!"
