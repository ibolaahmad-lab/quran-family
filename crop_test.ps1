Add-Type -AssemblyName System.Drawing
$path = 'C:\Users\Ibo\.gemini\antigravity\brain\87a2bd16-fdf7-45c2-8454-c83e140b7fa0\.user_uploaded\media_1794772252673_bae04f0d.jpg'
$bmp = New-Object System.Drawing.Bitmap($path)

# Let's crop the Surah banner area: x=85 to x=478, y=80 to y=156
$rect = New-Object System.Drawing.Rectangle(85, 80, (478 - 85), (156 - 80))
$bannerBmp = $bmp.Clone($rect, $bmp.PixelFormat)
$bannerBmp.Save('C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster\surah_banner_raw.png', [System.Drawing.Imaging.ImageFormat]::Png)
Write-Host "Saved surah_banner_raw.png ($($bannerBmp.Width)x$($bannerBmp.Height))"

# Let's crop a slice of the border for border-image:
# Let's save a clean border frame template
# The entire frame is X=12, Y=37, Width=(551-12)=539, Height=(719-37)=682
$frameRect = New-Object System.Drawing.Rectangle(12, 37, 539, 682)
$frameBmp = $bmp.Clone($frameRect, $bmp.PixelFormat)
$frameBmp.Save('C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster\mushaf_frame_539x682.png', [System.Drawing.Imaging.ImageFormat]::Png)
Write-Host "Saved mushaf_frame_539x682.png"

$bmp.Dispose()
$bannerBmp.Dispose()
$frameBmp.Dispose()
