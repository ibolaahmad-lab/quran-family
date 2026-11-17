Add-Type -AssemblyName System.Drawing
$framePath = 'C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster\mushaf_frame_539x682.png'
$bmp = New-Object System.Drawing.Bitmap($framePath)

# Check slice regions at 30px:
# Top-left corner (0,0, 30, 30)
# Top edge slice (200, 0, 30, 30)
# Right edge slice (509, 200, 30, 30)
# Bottom edge slice (200, 652, 30, 30)

$rectCorner = New-Object System.Drawing.Rectangle(0, 0, 30, 30)
$cornerBmp = $bmp.Clone($rectCorner, $bmp.PixelFormat)
$cornerBmp.Save('C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster\corner_test.png', [System.Drawing.Imaging.ImageFormat]::Png)

Write-Host "Corner test saved."
$bmp.Dispose()
$cornerBmp.Dispose()
