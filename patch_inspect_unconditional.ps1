$path = "C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster\index.html"
$lines = [System.IO.File]::ReadAllLines($path, [System.Text.Encoding]::UTF8)

# Find inspectAyah
for ($i=4770; $i -lt 4850; $i++) {
    if ($lines[$i] -match 'function inspectAyah\(idx\)') {
        Write-Host "Found inspectAyah at line $($i+1)"
        for ($j=$i; $j -lt $i+40; $j++) {
            if ($lines[$j] -match 'activePill\.scrollIntoView') {
                # Clean old injected lines inside activePill
                $lines[$j+1] = ""
                $lines[$j+2] = ""
                $lines[$j+3] = ""
                # Inject outside activePill after the closing brace
                for ($k=$j; $k -lt $j+10; $k++) {
                    if ($lines[$k] -match '^\s*\}') {
                        $unconditionalCode = @"
    // Unconditional Real-time Interactive Mushaf Highlight
    if (typeof updateInteractiveMushafHighlight === 'function') {
      updateInteractiveMushafHighlight();
    } else {
      document.querySelectorAll('.mushaf-interactive-verse').forEach((el, i) => {
        const isCur = (i === idx);
        el.classList.toggle('active-mushaf-highlight', isCur);
        if (isCur) {
          el.style.backgroundColor = 'rgba(56, 189, 248, 0.45)';
          el.style.outline = '3px solid #0284c7';
          el.style.borderRadius = '8px';
          el.style.boxShadow = '0 0 22px rgba(56, 189, 248, 0.85)';
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          el.style.backgroundColor = '';
          el.style.outline = '';
          el.style.boxShadow = '';
        }
      });
    }
    if (typeof updateActiveAyahHifzBtnState === 'function') updateActiveAyahHifzBtnState();
"@
                        $lines[$k] = "  }`n" + $unconditionalCode
                        Write-Host "Injected unconditional highlight at line $($k+1)"
                        break
                    }
                }
                break
            }
        }
        break
    }
}

[System.IO.File]::WriteAllLines($path, $lines, [System.Text.Encoding]::UTF8)
Write-Host "inspectAyah patch applied successfully."
