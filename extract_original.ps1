$path = "C:\Users\Ibo\.gemini\antigravity\brain\499c4aa3-b8e5-43f9-98c1-7c1321e27807\.system_generated\logs\transcript_full.jsonl"
$line = (Get-Content $path)[141]
$json = ConvertFrom-Json $line
$toolCalls = $json.tool_calls
foreach ($tc in $toolCalls) {
    if ($tc.name -eq 'write_file') {
        $content = $tc.args.Content
        Write-Output "Length: $($content.Length)"
        [System.IO.File]::WriteAllText("C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster\original_persian.html", $content, [System.Text.Encoding]::UTF8)
        Write-Output "Wrote original_persian.html successfully"
    }
}
