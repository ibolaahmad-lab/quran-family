$path = "C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster\index.html"
$lines = [System.IO.File]::ReadAllLines($path, [System.Text.Encoding]::UTF8)

# 1. Update playNextVerse around line 5111
for ($i=5090; $i -lt 5130; $i++) {
    if ($lines[$i] -match 'function playNextVerse') {
        Write-Host "Found playNextVerse at line $($i+1)"
        # Find turnPage(1)
        for ($j=$i; $j -lt $i+20; $j++) {
            if ($lines[$j] -match 'turnPage\(1\);') {
                $lines[$j] = "    const nextP = currentPage + 1; loadPage(nextP).then(() => { setTimeout(() => playVerseAt(0), 400); });"
                # neutralize the next setTimeout
                for ($k=$j+1; $k -lt $j+5; $k++) {
                    if ($lines[$k] -match 'setTimeout\(\(\) => playVerseAt\(0\)') {
                        $lines[$k] = "    // Handled in promise"
                        break
                    }
                }
                Write-Host "Replaced turnPage(1) with sequential loadPage(nextP) at line $($j+1)"
                break
            }
        }
        break
    }
}

# 2. Update inspectAyah around line 4775
for ($i=4760; $i -lt 4820; $i++) {
    if ($lines[$i] -match 'function inspectAyah') {
        Write-Host "Found inspectAyah at line $($i+1)"
        for ($j=$i; $j -lt $i+40; $j++) {
            if ($lines[$j] -match 'activePill\.scrollIntoView') {
                $lines[$j] = $lines[$j] + "`n    // Real-time interactive Mushaf highlight`n    document.querySelectorAll('.mushaf-interactive-verse').forEach((el, i) => el.classList.toggle('active-mushaf-highlight', i === idx));`n    if (typeof updateActiveAyahHifzBtnState === 'function') updateActiveAyahHifzBtnState();"
                Write-Host "Injected real-time highlight in inspectAyah at line $($j+1)"
                break
            }
        }
        break
    }
}

# 3. Update Tafsir selector buttons around line 3630
for ($i=3610; $i -lt 3660; $i++) {
    if ($lines[$i] -match '<!-- Tafsir Selector Pills -->') {
        Write-Host "Found Tafsir Pills at line $($i+1)"
        # Inject "All" and "Asbab" buttons if not present
        $pills = @"
          <!-- Tafsir Selector Pills -->
          <div style="display: flex; gap: 10px; flex-wrap: wrap; border-top: 1px solid rgba(229,184,76,0.25); padding-top: 14px;">
            <button class="tafsir-pill-btn active" id="tafsirBtnAll" onclick="selectTafsirEdition('all')">
              <i class="fa-solid fa-layer-group"></i> Alle Abschnitte (Vollständig)
            </button>
            <button class="tafsir-pill-btn" id="tafsirBtnIbnKathir" onclick="selectTafsirEdition('ibnkathir')">
              <i class="fa-solid fa-book-journal-whills"></i> 1. Ibn Kathīr &amp; Dschalālain
            </button>
            <button class="tafsir-pill-btn" id="tafsirBtnSaddi" onclick="selectTafsirEdition('saddi')">
              <i class="fa-solid fa-heart"></i> 2. As-Sa'dī (Spirituell)
            </button>
            <button class="tafsir-pill-btn" id="tafsirBtnSimple" onclick="selectTafsirEdition('simple')">
              <i class="fa-solid fa-lightbulb"></i> 3. Einfache Erklärung &amp; Beispiele
            </button>
            <button class="tafsir-pill-btn" id="tafsirBtnAsbab" onclick="selectTafsirEdition('asbab')">
              <i class="fa-solid fa-scroll"></i> 4. Asbāb an-Nuzūl (شأن نزول)
            </button>
          </div>
"@
        # Find where the old div ends
        for ($j=$i; $j -lt $i+25; $j++) {
            if ($lines[$j] -match 'id="tafsirBtnSimple"') {
                # Find the closing </div>
                for ($k=$j; $k -lt $j+10; $k++) {
                    if ($lines[$k] -match '</div>') {
                        $lines[$i] = $pills
                        for ($m=$i+1; $m -le $k; $m++) {
                            $lines[$m] = ""
                        }
                        Write-Host "Updated Tafsir pills block from line $($i+1) to $($k+1)"
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
Write-Host "Script completed successfully."
