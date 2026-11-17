Add-Type -AssemblyName System.Drawing
$bmp = New-Object System.Drawing.Bitmap 128, 128
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

# Emerald gradient background
$p1 = New-Object System.Drawing.Point 0, 0
$p2 = New-Object System.Drawing.Point 128, 128
$c1 = [System.Drawing.Color]::FromArgb(255, 4, 120, 87)
$c2 = [System.Drawing.Color]::FromArgb(255, 6, 78, 59)
$brushBg = New-Object System.Drawing.Drawing2D.LinearGradientBrush $p1, $p2, $c1, $c2
$g.FillEllipse($brushBg, 4, 4, 120, 120)

# Golden border ring
$penGold = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(255, 245, 158, 11)), 5.0
$g.DrawEllipse($penGold, 6, 6, 116, 116)

# Inner gold ring
$penGoldThin = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(210, 253, 230, 138)), 2.0
$g.DrawEllipse($penGoldThin, 12, 12, 104, 104)

# Crescent / Star symbol or Book
$fontStyle = [System.Drawing.FontStyle]::Bold
$font = New-Object System.Drawing.Font('Segoe UI Symbol', [float]44, $fontStyle)
$brushGoldText = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 254, 240, 138))
$sf = New-Object System.Drawing.StringFormat
$sf.Alignment = [System.Drawing.StringAlignment]::Center
$sf.LineAlignment = [System.Drawing.StringAlignment]::Center

$rect = New-Object System.Drawing.RectangleF 0, 4, 128, 120
$g.DrawString([char]0x262A, $font, $brushGoldText, $rect, $sf)

$icoPath = 'C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster\quran.ico'
$pngPath = 'C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster\quran.png'
$bmp.Save($pngPath, [System.Drawing.Imaging.ImageFormat]::Png)

$hIcon = $bmp.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($hIcon)
$fs = New-Object System.IO.FileStream $icoPath, ([System.IO.FileMode]::Create)
$icon.Save($fs)
$fs.Close()

$g.Dispose()
$bmp.Dispose()
Write-Output "SUCCESS: Icon saved to $icoPath and PNG saved to $pngPath"
