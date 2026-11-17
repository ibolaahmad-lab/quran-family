$prefPath = "C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster\AppProfile\Default\Preferences"
if (Test-Path $prefPath) {
    $raw = [System.IO.File]::ReadAllText($prefPath, [System.Text.Encoding]::UTF8)
    $json = ConvertFrom-Json $raw
    
    if (-not $json.profile) { $json | Add-Member -NotePropertyName "profile" -NotePropertyValue (New-Object PSObject) }
    if (-not $json.profile.content_settings) { $json.profile | Add-Member -NotePropertyName "content_settings" -NotePropertyValue (New-Object PSObject) }
    if (-not $json.profile.content_settings.exceptions) { $json.profile.content_settings | Add-Member -NotePropertyName "exceptions" -NotePropertyValue (New-Object PSObject) }

    # Add media_stream_mic exception
    $micObj = New-Object PSObject
    $allowSetting = [PSCustomObject]@{
        setting = 1
        last_modified = [string]([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())
    }
    
    $micObj | Add-Member -NotePropertyName "file:///*,*" -NotePropertyValue $allowSetting -Force
    $micObj | Add-Member -NotePropertyName "file://*,*" -NotePropertyValue $allowSetting -Force
    $micObj | Add-Member -NotePropertyName "*,*" -NotePropertyValue $allowSetting -Force

    $json.profile.content_settings.exceptions | Add-Member -NotePropertyName "media_stream_mic" -NotePropertyValue $micObj -Force

    $newRaw = $json | ConvertTo-Json -Depth 20
    [System.IO.File]::WriteAllText($prefPath, $newRaw, [System.Text.Encoding]::UTF8)
    Write-Output "SUCCESS: Permanently pre-approved microphone permission in Chrome Preferences!"
}
