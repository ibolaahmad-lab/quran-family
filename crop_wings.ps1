Add-Type -AssemblyName System.Drawing
$rawBannerPath = 'C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster\surah_banner_raw.png'
$bmp = New-Object System.Drawing.Bitmap($rawBannerPath)

# Left wing bounds in surah_banner_raw.png:
# From x=4 to x=68, y=4 to y=72
$rectL = New-Object System.Drawing.Rectangle(4, 4, 66, 68)
$bmpL = $bmp.Clone($rectL, $bmp.PixelFormat)

function MakeBgTransparent($targetBmp) {
    for ($y = 0; $y -lt $targetBmp.Height; $y++) {
        for ($x = 0; $x -lt $targetBmp.Width; $x++) {
            $c = $targetBmp.GetPixel($x, $y)
            if ($c.R -gt 232 -and $c.G -gt 232 -and $c.B -gt 210) {
                $targetBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
            }
        }
    }
}

MakeBgTransparent($bmpL)
$bmpL.Save('C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster\surah_wing_left.png', [System.Drawing.Imaging.ImageFormat]::Png)

# Right wing is horizontal flip:
$bmpR = $bmpL.Clone()
$bmpR.RotateFlip([System.Drawing.RotateFlipType]::RotateNoneFlipX)
$bmpR.Save('C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster\surah_wing_right.png', [System.Drawing.Imaging.ImageFormat]::Png)

$bmp.Dispose()
$bmpL.Dispose()
$bmpR.Dispose()
Write-Host "Wings saved perfectly!"
