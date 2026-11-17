Add-Type -AssemblyName System.Drawing

function Render-QuranIcon([int]$size, [bool]$roundOnly, [bool]$foregroundOnly) {
    $bmp = New-Object System.Drawing.Bitmap $size, $size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

    $g.Clear([System.Drawing.Color]::Transparent)

    $scale = $size / 256.0

    if (-not $foregroundOnly) {
        # 1. Dark Royal Emerald gradient circle
        $ptA = New-Object System.Drawing.Point 0, 0
        $ptB = New-Object System.Drawing.Point $size, $size
        $colA = [System.Drawing.Color]::FromArgb(255, 6, 78, 59)
        $colB = [System.Drawing.Color]::FromArgb(255, 2, 24, 17)
        $brushBg = New-Object System.Drawing.Drawing2D.LinearGradientBrush $ptA, $ptB, $colA, $colB
        $pad = 6.0 * $scale
        $dim = $size - (2.0 * $pad)
        $g.FillEllipse($brushBg, [float]$pad, [float]$pad, [float]$dim, [float]$dim)

        # 2. Outer golden luxury border
        $penGold = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(255, 212, 175, 55)), (7.0 * $scale)
        $pad2 = 9.0 * $scale
        $dim2 = $size - (2.0 * $pad2)
        $g.DrawEllipse($penGold, [float]$pad2, [float]$pad2, [float]$dim2, [float]$dim2)

        # 3. Inner golden ring
        $penGoldInner = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(210, 254, 240, 138)), (2.5 * $scale)
        $pad3 = 18.0 * $scale
        $dim3 = $size - (2.0 * $pad3)
        $g.DrawEllipse($penGoldInner, [float]$pad3, [float]$pad3, [float]$dim3, [float]$dim3)

        # 4. Islamic 8-Point Star Pattern
        $cx = $size / 2.0
        $cy = $size / 2.0
        $penStar = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(90, 212, 175, 55)), (1.5 * $scale)
        $starRadius = 94.0 * $scale
        for ($a = 0; $a -lt 360; $a += 45) {
            $r1 = $a * [Math]::PI / 180.0
            $r2 = ($a + 135) * [Math]::PI / 180.0
            $x1 = $cx + $starRadius * [Math]::Cos($r1)
            $y1 = $cy + $starRadius * [Math]::Sin($r1)
            $x2 = $cx + $starRadius * [Math]::Cos($r2)
            $y2 = $cy + $starRadius * [Math]::Sin($r2)
            $g.DrawLine($penStar, [float]$x1, [float]$y1, [float]$x2, [float]$y2)
        }
    }

    # Adjust scale & offset if foreground only (for adaptive icon: safe zone is 66% in center)
    $bookScale = $scale
    $offX = 0.0
    $offY = 0.0
    if ($foregroundOnly) {
        $bookScale = $scale * 0.72
        $offX = ($size - (256.0 * $bookScale)) / 2.0
        $offY = ($size - (256.0 * $bookScale)) / 2.0
    }

    # Helper function for points
    $tfX = { param($x) return [float]($offX + ($x * $bookScale)) }
    $tfY = { param($y) return [float]($offY + ($y * $bookScale)) }

    # 5. Open Quran Pages
    $pBookA = New-Object System.Drawing.Point ([int](&$tfX 60)), ([int](&$tfY 100))
    $pBookB = New-Object System.Drawing.Point ([int](&$tfX 196)), ([int](&$tfY 180))
    $cPageA = [System.Drawing.Color]::FromArgb(255, 255, 248, 220)
    $cPageB = [System.Drawing.Color]::FromArgb(255, 217, 119, 6)
    $brushPages = New-Object System.Drawing.Drawing2D.LinearGradientBrush $pBookA, $pBookB, $cPageA, $cPageB

    $pathLeft = New-Object System.Drawing.Drawing2D.GraphicsPath
    $pathLeft.AddBezier((&$tfX 128.0), (&$tfY 145.0), (&$tfX 110.0), (&$tfY 120.0), (&$tfX 80.0), (&$tfY 115.0), (&$tfX 60.0), (&$tfY 125.0))
    $pathLeft.AddLine((&$tfX 60.0), (&$tfY 125.0), (&$tfX 60.0), (&$tfY 165.0))
    $pathLeft.AddBezier((&$tfX 60.0), (&$tfY 165.0), (&$tfX 80.0), (&$tfY 155.0), (&$tfX 110.0), (&$tfY 160.0), (&$tfX 128.0), (&$tfY 185.0))
    $pathLeft.CloseFigure()
    $g.FillPath($brushPages, $pathLeft)

    $pathRight = New-Object System.Drawing.Drawing2D.GraphicsPath
    $pathRight.AddBezier((&$tfX 128.0), (&$tfY 145.0), (&$tfX 146.0), (&$tfY 120.0), (&$tfX 176.0), (&$tfY 115.0), (&$tfX 196.0), (&$tfY 125.0))
    $pathRight.AddLine((&$tfX 196.0), (&$tfY 125.0), (&$tfX 196.0), (&$tfY 165.0))
    $pathRight.AddBezier((&$tfX 196.0), (&$tfY 165.0), (&$tfX 176.0), (&$tfY 155.0), (&$tfX 146.0), (&$tfY 160.0), (&$tfX 128.0), (&$tfY 185.0))
    $pathRight.CloseFigure()
    $g.FillPath($brushPages, $pathRight)

    $penBookEdge = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(255, 245, 158, 11)), (2.5 * $bookScale)
    $g.DrawPath($penBookEdge, $pathLeft)
    $g.DrawPath($penBookEdge, $pathRight)

    # Quran Text Lines (decorative golden lines on pages)
    $penLines = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(180, 180, 83, 9)), (1.6 * $bookScale)
    # Left page lines
    $g.DrawLine($penLines, (&$tfX 72.0), (&$tfY 135.0), (&$tfX 114.0), (&$tfY 138.0))
    $g.DrawLine($penLines, (&$tfX 70.0), (&$tfY 145.0), (&$tfX 115.0), (&$tfY 149.0))
    $g.DrawLine($penLines, (&$tfX 72.0), (&$tfY 155.0), (&$tfX 116.0), (&$tfY 160.0))
    # Right page lines
    $g.DrawLine($penLines, (&$tfX 142.0), (&$tfY 138.0), (&$tfX 184.0), (&$tfY 135.0))
    $g.DrawLine($penLines, (&$tfX 141.0), (&$tfY 149.0), (&$tfX 186.0), (&$tfY 145.0))
    $g.DrawLine($penLines, (&$tfX 140.0), (&$tfY 160.0), (&$tfX 184.0), (&$tfY 155.0))

    # Wooden Stand (Rehal)
    $penStand = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(255, 180, 83, 9)), (6.5 * $bookScale)
    $penStand.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $penStand.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $g.DrawLine($penStand, (&$tfX 76.0), (&$tfY 176.0), (&$tfX 180.0), (&$tfY 214.0))
    $g.DrawLine($penStand, (&$tfX 180.0), (&$tfY 176.0), (&$tfX 76.0), (&$tfY 214.0))

    # 6. Crescent & Star on top
    $fontStyle = [System.Drawing.FontStyle]::Bold
    $fontSize = 38.0 * $bookScale
    $fontMoon = New-Object System.Drawing.Font('Segoe UI Symbol', [float]$fontSize, $fontStyle)
    $brushMoon = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 254, 240, 138))
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
    $rectMoon = New-Object System.Drawing.RectangleF (&$tfX 0.0), (&$tfY 40.0), (256.0 * $bookScale), (65.0 * $bookScale)
    $g.DrawString([char]0x262A, $fontMoon, $brushMoon, $rectMoon, $sf)

    $g.Dispose()
    return $bmp
}

$destBase = 'C:\Users\Ibo\.gemini\antigravity\scratch\decoded_fast\res'

$densities = @(
    @{ name = 'mipmap-mdpi';    size = 48  },
    @{ name = 'mipmap-hdpi';    size = 72  },
    @{ name = 'mipmap-xhdpi';   size = 96  },
    @{ name = 'mipmap-xxhdpi';  size = 144 },
    @{ name = 'mipmap-xxxhdpi'; size = 192 }
)

foreach ($d in $densities) {
    $dir = Join-Path $destBase $d.name
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    
    # Standard Launcher Icon
    $icon = Render-QuranIcon $d.size $false $false
    $p1 = Join-Path $dir 'ic_launcher.png'
    $icon.Save($p1, [System.Drawing.Imaging.ImageFormat]::Png)
    $icon.Dispose()

    # Round Launcher Icon
    $iconRound = Render-QuranIcon $d.size $true $false
    $p2 = Join-Path $dir 'ic_launcher_round.png'
    $iconRound.Save($p2, [System.Drawing.Imaging.ImageFormat]::Png)
    $iconRound.Dispose()

    Write-Host "Generated $($d.name): $($d.size)x$($d.size)"
}

# Also save master 512x512 preview in workspace
$master = Render-QuranIcon 512 $false $false
$master.Save('C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster\quran_512.png', [System.Drawing.Imaging.ImageFormat]::Png)
$master.Dispose()
Write-Host "Generated Master 512x512 Quran Icon!"
