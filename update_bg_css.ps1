$path = "C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster\index.html"
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

$oldCss = @"
body {
  background-color: #0c0907;
  background-image: 
    linear-gradient(to bottom, rgba(5, 4, 3, 0.72), rgba(12, 9, 7, 0.86)),
    url("islamic_fantasy_bg.jpg");
  background-size: cover;
  background-position: center center;
  background-attachment: fixed;
  color: var(--text-main);
  min-height: 100vh;
  padding: 20px 20px 140px;
  line-height: 1.6;
}

/* ========================================================= */
/* THEMES & COLOR STYLES (APP WALLPAPERS & MUSHAF PALETTES)  */
/* ========================================================= */
body.theme-fantasy {
  background-image: linear-gradient(to bottom, rgba(5, 4, 3, 0.72), rgba(12, 9, 7, 0.86)), url("islamic_fantasy_bg.jpg");
}
body.theme-emerald {
  background: radial-gradient(circle at 50% 20%, rgba(6, 78, 59, 0.92), rgba(2, 44, 34, 0.98)), #022c22;
  background-attachment: fixed;
}
body.theme-midnight {
  background: radial-gradient(circle at 50% 20%, rgba(30, 58, 138, 0.9), rgba(15, 23, 42, 0.98)), #0f172a;
  background-attachment: fixed;
}
body.theme-parchment {
  background: radial-gradient(ellipse at center, rgba(68, 51, 35, 0.92), rgba(28, 20, 14, 0.98)), #1c140e;
  background-attachment: fixed;
}
body.theme-oled {
  background: #000000;
  background-image: linear-gradient(180deg, #050505 0%, #0d0d0d 100%);
  background-attachment: fixed;
}
"@

$newCss = @"
body {
  background-color: #0c0907;
  background-image: 
    radial-gradient(ellipse at 50% 30%, rgba(12, 9, 7, 0.18) 0%, rgba(5, 4, 3, 0.65) 100%),
    url("islamic_fantasy_bg.jpg");
  background-size: cover;
  background-position: center center;
  background-attachment: fixed;
  color: var(--text-main);
  min-height: 100vh;
  padding: 20px 20px 140px;
  line-height: 1.6;
}

/* ========================================================= */
/* THEMES & COLOR STYLES (APP WALLPAPERS & MUSHAF PALETTES)  */
/* ========================================================= */
body.theme-fantasy {
  background-image: 
    radial-gradient(ellipse at 50% 30%, rgba(12, 9, 7, 0.18) 0%, rgba(5, 4, 3, 0.65) 100%),
    url("islamic_fantasy_bg.jpg") !important;
  background-size: cover !important;
  background-position: center center !important;
  background-attachment: fixed !important;
}
body.theme-emerald {
  background-image: 
    radial-gradient(ellipse at 50% 30%, rgba(2, 44, 34, 0.18) 0%, rgba(2, 44, 34, 0.72) 100%),
    url("bg_emerald_sanctuary.jpg") !important;
  background-size: cover !important;
  background-position: center center !important;
  background-attachment: fixed !important;
}
body.theme-midnight {
  background-image: 
    radial-gradient(ellipse at 50% 30%, rgba(15, 23, 42, 0.18) 0%, rgba(15, 23, 42, 0.75) 100%),
    url("bg_midnight_mosque.jpg") !important;
  background-size: cover !important;
  background-position: center center !important;
  background-attachment: fixed !important;
}
body.theme-parchment {
  background-image: 
    radial-gradient(ellipse at 50% 30%, rgba(28, 20, 14, 0.18) 0%, rgba(28, 20, 14, 0.75) 100%),
    url("bg_andalusian_palace.jpg") !important;
  background-size: cover !important;
  background-position: center center !important;
  background-attachment: fixed !important;
}
body.theme-oled {
  background: #000000 !important;
  background-image: linear-gradient(180deg, #050505 0%, #0d0d0d 100%) !important;
  background-attachment: fixed !important;
}
"@

# Normalize CRLF and replace
$contentNorm = $content.Replace("`r`n", "`n")
$oldCssNorm = $oldCss.Replace("`r`n", "`n")
$newCssNorm = $newCss.Replace("`r`n", "`n")

if ($contentNorm.Contains($oldCssNorm)) {
    $contentNorm = $contentNorm.Replace($oldCssNorm, $newCssNorm)
    [System.IO.File]::WriteAllText($path, $contentNorm.Replace("`n", "`r`n"), [System.Text.Encoding]::UTF8)
    Write-Host "SUCCESSFULLY UPDATED BACKGROUND THEMES CSS!"
} else {
    Write-Host "OLD CSS PATTERN NOT MATCHED"
}
