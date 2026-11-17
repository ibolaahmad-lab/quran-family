Add-Type -AssemblyName System.Drawing
$filePath = 'C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster\mushaf_frame_539x682.png'
$fs = [System.IO.File]::OpenRead($filePath)
$orig = [System.Drawing.Image]::FromStream($fs)
$bmp = New-Object System.Drawing.Bitmap($orig)
$fs.Close()
$fs.Dispose()
$orig.Dispose()

# Inspect column x=260 to 300 at y=0 to 15:
for ($x = 260; $x -le 300; $x++) {
    for ($y = 0; $y -le 15; $y++) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.R -gt 220 -and $c.G -gt 220 -and $c.B -gt 220) {
            # Replace with matching pattern from x-42
            $refC = $bmp.GetPixel($x - 42, $y)
            $bmp.SetPixel($x, $y, $refC)
        }
    }
}

$bmp.Save($filePath, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Host "Top border seam cleanly patched!"
