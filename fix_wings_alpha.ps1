Add-Type -AssemblyName System.Drawing
$rawBannerPath = 'C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster\surah_banner_raw.png'
$src = New-Object System.Drawing.Bitmap($rawBannerPath)

# 1. Create true 32bppArgb transparent bitmap for Left Wing
# Bounds in surah_banner_raw.png: x=4, y=4, w=66, h=68
$w = 66
$h = 68
$bmpL = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

for ($y = 0; $y -lt $h; $y++) {
    for ($x = 0; $x -lt $w; $x++) {
        $c = $src.GetPixel($x + 4, $y + 4)
        # If it's the cream parchment background (R>220, G>220, B>200)
        if ($c.R -gt 220 -and $c.G -gt 220 -and $c.B -gt 195) {
            # True transparent
            $bmpL.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 255, 255, 255))
        } else {
            $bmpL.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $c.R, $c.G, $c.B))
        }
    }
}

$bmpL.Save('C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster\surah_wing_left.png', [System.Drawing.Imaging.ImageFormat]::Png)

# 2. Right Wing is horizontal flip of Left Wing
$bmpR = New-Object System.Drawing.Bitmap($bmpL)
$bmpR.RotateFlip([System.Drawing.RotateFlipType]::RotateNoneFlipX)
$bmpR.Save('C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster\surah_wing_right.png', [System.Drawing.Imaging.ImageFormat]::Png)

Write-Host "Successfully generated 32bppArgb transparent wings!"
$src.Dispose()
$bmpL.Dispose()
$bmpR.Dispose()
