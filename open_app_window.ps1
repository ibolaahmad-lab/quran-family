$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
Start-Process -FilePath $chrome -ArgumentList '--app="http://127.0.0.1:8080/index.html"'
Write-Output "App opened in Chrome!"
