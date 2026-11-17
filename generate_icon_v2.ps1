Add-Type -AssemblyName System.Drawing

$bmp = New-Object System.Drawing.Bitmap 256, 256
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

$g.Clear([System.Drawing.Color]::Transparent)

# 1. Dark Royal Emerald gradient circle
$ptA = New-Object System.Drawing.Point 0, 0
$ptB = New-Object System.Drawing.Point 256, 256
$colA = [System.Drawing.Color]::FromArgb(255, 6, 78, 59)
$colB = [System.Drawing.Color]::FromArgb(255, 3, 30, 22)
$brushBg = New-Object System.Drawing.Drawing2D.LinearGradientBrush $ptA, $ptB, $colA, $colB
$g.FillEllipse($brushBg, 10, 10, 236, 236)

# 2. Outer golden luxury border
$penGold = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(255, 212, 175, 55)), 7.0
$g.DrawEllipse($penGold, 14, 14, 228, 228)

# 3. Inner golden ring
$penGoldInner = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(200, 254, 240, 138)), 2.5
$g.DrawEllipse($penGoldInner, 24, 24, 208, 208)

# 4. Islamic Star Pattern
$cx = 128
$cy = 128
$penStar = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(80, 212, 175, 55)), 1.5
for ($a = 0; $a -lt 360; $a += 45) {
    $r1 = $a * [Math]::PI / 180.0
    $r2 = ($a + 135) * [Math]::PI / 180.0
    $x1 = $cx + 96 * [Math]::Cos($r1)
    $y1 = $cy + 96 * [Math]::Sin($r1)
    $x2 = $cx + 96 * [Math]::Cos($r2)
    $y2 = $cy + 96 * [Math]::Sin($r2)
    $g.DrawLine($penStar, [float]$x1, [float]$y1, [float]$x2, [float]$y2)
}

# 5. Open Quran Pages
$pBookA = New-Object System.Drawing.Point 60, 100
$pBookB = New-Object System.Drawing.Point 196, 180
$cPageA = [System.Drawing.Color]::FromArgb(255, 254, 243, 199)
$cPageB = [System.Drawing.Color]::FromArgb(255, 217, 119, 6)
$brushPages = New-Object System.Drawing.Drawing2D.LinearGradientBrush $pBookA, $pBookB, $cPageA, $cPageB

$pathLeft = New-Object System.Drawing.Drawing2D.GraphicsPath
$pathLeft.AddBezier(128.0, 145.0, 110.0, 120.0, 80.0, 115.0, 60.0, 125.0)
$pathLeft.AddLine(60.0, 125.0, 60.0, 165.0)
$pathLeft.AddBezier(60.0, 165.0, 80.0, 155.0, 110.0, 160.0, 128.0, 185.0)
$pathLeft.CloseFigure()
$g.FillPath($brushPages, $pathLeft)

$pathRight = New-Object System.Drawing.Drawing2D.GraphicsPath
$pathRight.AddBezier(128.0, 145.0, 146.0, 120.0, 176.0, 115.0, 196.0, 125.0)
$pathRight.AddLine(196.0, 125.0, 196.0, 165.0)
$pathRight.AddBezier(196.0, 165.0, 176.0, 155.0, 146.0, 160.0, 128.0, 185.0)
$pathRight.CloseFigure()
$g.FillPath($brushPages, $pathRight)

$penBookEdge = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(255, 245, 158, 11)), 2.5
$g.DrawPath($penBookEdge, $pathLeft)
$g.DrawPath($penBookEdge, $pathRight)

# Wooden Stand
$penStand = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(255, 180, 83, 9)), 6.0
$g.DrawLine($penStand, [float]80.0, [float]178.0, [float]176.0, [float]210.0)
$g.DrawLine($penStand, [float]176.0, [float]178.0, [float]80.0, [float]210.0)

# 6. Crescent & Star on top
$fontStyle = [System.Drawing.FontStyle]::Bold
$fontMoon = New-Object System.Drawing.Font('Segoe UI Symbol', [float]38.0, $fontStyle)
$brushMoon = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 254, 240, 138))
$sf = New-Object System.Drawing.StringFormat
$sf.Alignment = [System.Drawing.StringAlignment]::Center
$sf.LineAlignment = [System.Drawing.StringAlignment]::Center
$rectMoon = New-Object System.Drawing.RectangleF (0.0), (44.0), (256.0), (60.0)
$g.DrawString([char]0x262A, $fontMoon, $brushMoon, $rectMoon, $sf)

# Save
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
Write-Output "SUCCESS: Royal Emerald Quran icon generated at $icoPath"
