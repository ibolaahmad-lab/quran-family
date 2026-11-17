Add-Type -AssemblyName System.Drawing
$framePath = 'C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster\mushaf_frame_539x682.png'
$bmp = New-Object System.Drawing.Bitmap($framePath)

# We want to clear the center where text was:
# From x=28 to x=511, y=28 to y=654
$g = [System.Drawing.Graphics]::FromImage($bmp)
# Clear center with transparent color
$brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(0, 255, 255, 255))
$g.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
$g.FillRectangle($brush, 28, 28, (511 - 28), (654 - 28))
$g.Dispose()

$bmp.Save('C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster\mushaf_border_clean.png', [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Host "Created mushaf_border_clean.png"
