param(
    [int]$Port = 8081
)

$rootDir = "C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster"

$ip = [System.Net.IPAddress]::Any
$listener = New-Object System.Net.Sockets.TcpListener($ip, $Port)

try {
    $listener.Start()
    Write-Output "=================================================="
    Write-Output "   Koran Hifz Studio - Lokaler Server fuer iPad"
    Write-Output "=================================================="
    Write-Output "Server laeuft auf Port $Port"
    Write-Output "Auf dem iPad im selben WLAN im Safari-Browser oeffnen:"
    Write-Output "   http://192.168.178.41:$Port"
    Write-Output "=================================================="
} catch {
    Write-Output "Fehler beim Starten: $($_.Exception.Message)"
    exit 1
}

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".htm"  = "text/html; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".ico"  = "image/x-icon"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".svg"  = "image/svg+xml"
    ".woff" = "font/woff"
    ".woff2"= "font/woff2"
    ".ttf"  = "font/ttf"
    ".pdf"  = "application/pdf"
}

$buf = New-Object byte[] 65536

function Send-Response($stream, $statusLine, $contentType, $bodyBytes) {
    $header = "$statusLine`r`nContent-Type: $contentType`r`nContent-Length: $($bodyBytes.Length)`r`nCache-Control: no-cache, no-store, must-revalidate`r`nAccess-Control-Allow-Origin: *`r`nAccess-Control-Allow-Headers: *`r`nConnection: close`r`n`r`n"
    $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
    $stream.Write($headerBytes, 0, $headerBytes.Length)
    $stream.Write($bodyBytes, 0, $bodyBytes.Length)
    $stream.Flush()
}

while ($listener.Server.IsBound) {
    try {
        $client = $listener.AcceptTcpClient()
        $stream = $client.GetStream()
        
        # Read full HTTP request (may be chunked)
        $ms = New-Object System.IO.MemoryStream
        $totalRead = 0
        $stream.ReadTimeout = 2000
        try {
            do {
                $readCount = $stream.Read($buf, 0, $buf.Length)
                if ($readCount -gt 0) {
                    $ms.Write($buf, 0, $readCount)
                    $totalRead += $readCount
                }
            } while ($stream.DataAvailable -and $totalRead -lt 65536)
        } catch { }
        
        $reqBytes = $ms.ToArray()
        
        if ($reqBytes.Length -gt 0) {
            $reqText = [System.Text.Encoding]::ASCII.GetString($reqBytes)
            $firstLine = $reqText.Split("`r`n")[0]
            $parts = $firstLine.Split(' ')
            
            if ($parts.Length -ge 2) {
                $method = $parts[0]
                $rawUrl = $parts[1]
                $urlPath = $rawUrl.Split('?')[0]
                $queryStr = if ($rawUrl.Contains('?')) { $rawUrl.Substring($rawUrl.IndexOf('?') + 1) } else { '' }
                
                if ($urlPath -eq "/" -or $urlPath -eq "") { $urlPath = "/index.html" }

                # ---- QURAN API PROXY ----
                if ($urlPath.StartsWith("/quran-api/")) {
                    # Route: /quran-api/page/{n}/{edition}  -> api.alquran.cloud/v1/page/{n}/{edition}
                    # Route: /quran-api/translation/{n}/{edition} -> api.alquran.cloud/v1/page/{n}/{edition}
                    $apiSubPath = $urlPath.Substring("/quran-api/".Length)
                    $apiUrl = "https://api.alquran.cloud/v1/$apiSubPath"
                    if ($queryStr) { $apiUrl += "?$queryStr" }
                    
                    try {
                        $wc = New-Object System.Net.WebClient
                        $bodyBytes = $wc.DownloadData($apiUrl)
                        Send-Response $stream "HTTP/1.1 200 OK" "application/json; charset=utf-8" $bodyBytes
                    } catch {
                        $errBody = [System.Text.Encoding]::UTF8.GetBytes("{`"error`":`"Proxy fetch failed: $($_.Exception.Message)`"}")
                        Send-Response $stream "HTTP/1.1 502 Bad Gateway" "application/json" $errBody
                    }
                }
                # ---- STATIC FILES ----
                else {
                    $cleanSubPath = $urlPath.TrimStart('/').Replace('/', [System.IO.Path]::DirectorySeparatorChar)
                    $filePath = [System.IO.Path]::Combine($rootDir, $cleanSubPath)

                    if ([System.IO.File]::Exists($filePath)) {
                        $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                        $contentType = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }
                        $fi = New-Object System.IO.FileInfo($filePath)
                        $fileLen = $fi.Length

                        # Check Range header
                        $rangeHeader = $null
                        foreach ($line in $reqText.Split("`r`n")) {
                            if ($line -match "^Range:\s*bytes=(\d*)-(\d*)") {
                                $rangeHeader = $line
                                break
                            }
                        }

                        if ($rangeHeader -and ($rangeHeader -match "^Range:\s*bytes=(\d*)-(\d*)")) {
                            $rStartStr = $matches[1]
                            $rEndStr = $matches[2]
                            
                            $start = if ($rStartStr -ne "") { [int64]$rStartStr } else { 0 }
                            $end = if ($rEndStr -ne "") { [int64]$rEndStr } else { $fileLen - 1 }
                            if ($end -ge $fileLen) { $end = $fileLen - 1 }
                            $chunkLen = $end - $start + 1

                            $header = "HTTP/1.1 206 Partial Content`r`nContent-Type: $contentType`r`nContent-Range: bytes $start-$end/$fileLen`r`nContent-Length: $chunkLen`r`nAccept-Ranges: bytes`r`nContent-Disposition: inline`r`nAccess-Control-Allow-Origin: *`r`nConnection: close`r`n`r`n"
                            $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
                            $stream.Write($headerBytes, 0, $headerBytes.Length)

                            $fs = [System.IO.File]::OpenRead($filePath)
                            $fs.Seek($start, [System.IO.SeekOrigin]::Begin) | Out-Null
                            $rem = $chunkLen
                            $chunkBuf = New-Object byte[] 65536
                            while ($rem -gt 0) {
                                $toRead = [Math]::Min($chunkBuf.Length, $rem)
                                $read = $fs.Read($chunkBuf, 0, $toRead)
                                if ($read -le 0) { break }
                                $stream.Write($chunkBuf, 0, $read)
                                $rem -= $read
                            }
                            $fs.Close()
                            $stream.Flush()
                        } else {
                            $header = "HTTP/1.1 200 OK`r`nContent-Type: $contentType`r`nContent-Length: $fileLen`r`nAccept-Ranges: bytes`r`nCache-Control: no-cache, no-store, must-revalidate`r`nContent-Disposition: inline`r`nAccess-Control-Allow-Origin: *`r`nConnection: close`r`n`r`n"
                            $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
                            $stream.Write($headerBytes, 0, $headerBytes.Length)

                            $fs = [System.IO.File]::OpenRead($filePath)
                            $chunkBuf = New-Object byte[] 65536
                            while ($true) {
                                $read = $fs.Read($chunkBuf, 0, $chunkBuf.Length)
                                if ($read -le 0) { break }
                                $stream.Write($chunkBuf, 0, $read)
                            }
                            $fs.Close()
                            $stream.Flush()
                        }
                    } else {
                        $notFoundBody = [System.Text.Encoding]::ASCII.GetBytes("Not Found")
                        Send-Response $stream "HTTP/1.1 404 Not Found" "text/plain" $notFoundBody
                    }
                }
            }
        }
        $stream.Close()
        $client.Close()
    } catch {
        # continue loop
    }
}
