$filePath = 'C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster\index.html'
$lines = [System.IO.File]::ReadAllLines($filePath, [System.Text.Encoding]::UTF8)

$start = -1
$end = -1
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match '<div id="tafsirViewArea"') {
        $start = $i
    }
    if ($start -ge 0 -and $lines[$i] -match '<div id="tafsirContentContainer"') {
        $end = $i + 2
        break
    }
}

Write-Output "Replacing lines $start to $end"

$newBlock = @"
      <div id="tafsirViewArea" style="display: none;">

        <div style="background: var(--bg-card); border: 1px solid var(--gold-border); border-radius: 18px; padding: 20px 24px; margin-bottom: 20px; box-shadow: 0 8px 30px rgba(0,0,0,0.5);">

          <!-- Top Header & Actions -->
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px; margin-bottom: 16px;">
            <div>
              <div style="font-size: 1.35rem; font-weight: 800; color: var(--gold-light); display: flex; align-items: center; gap: 10px;">
                <i class="fa-solid fa-scroll" style="color: var(--gold-primary);"></i> 4. Tafsīr &amp; Vers-Erläuterung (استودیو تفسیر قرآن)
              </div>
              <div style="font-size: 0.88rem; color: var(--text-muted); margin-top: 4px;">
                Direkte Navigation zu allen 114 Suren &amp; 6236 Versen – Authentische theologische Auslegung ohne Seitenwechsel.
              </div>
            </div>
            <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
              <button class="action-btn" id="tafsirPlayAudioBtn" onclick="playCurrentTafsirAudio()" title="Aktiven Vers anhören">
                <i class="fa-solid fa-play"></i> Vers anhören
              </button>
              <button class="action-btn" onclick="jumpToMushafFromTafsir()" title="Zu diesem Vers im Medina-Mushaf springen" style="border-color: #38bdf8; color: #bae6fd;">
                <i class="fa-solid fa-book-open"></i> Im Mushaf zeigen
              </button>
            </div>
          </div>

          <!-- Direct Surah & Ayah Navigation Bar -->
          <div style="background: rgba(0, 0, 0, 0.45); border: 1.5px solid rgba(229, 184, 76, 0.35); border-radius: 14px; padding: 14px 18px; margin-bottom: 16px; display: flex; flex-wrap: wrap; gap: 14px; align-items: center; justify-content: space-between;">
            <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
              <!-- Surah Dropdown -->
              <div style="display: flex; align-items: center; gap: 8px;">
                <label for="tafsirSurahSelect" style="font-weight: 700; color: var(--gold-light); font-size: 0.92rem;">
                  <i class="fa-solid fa-quran" style="color: var(--gold-primary);"></i> Sure:
                </label>
                <select id="tafsirSurahSelect" onchange="onTafsirSurahChange(this.value)" style="background: #1a1612; color: #fef08a; border: 1.5px solid var(--gold-border); border-radius: 10px; padding: 8px 12px; font-weight: 700; font-size: 0.95rem; cursor: pointer; outline: none; max-width: 280px;">
                </select>
              </div>

              <!-- Ayah Dropdown -->
              <div style="display: flex; align-items: center; gap: 8px;">
                <label for="tafsirAyahSelect" style="font-weight: 700; color: var(--gold-light); font-size: 0.92rem;">
                  <i class="fa-solid fa-list-ol" style="color: var(--gold-primary);"></i> Vers:
                </label>
                <select id="tafsirAyahSelect" onchange="onTafsirAyahChange(this.value)" style="background: #1a1612; color: #fef08a; border: 1.5px solid var(--gold-border); border-radius: 10px; padding: 8px 12px; font-weight: 700; font-size: 0.95rem; cursor: pointer; outline: none; min-width: 95px;">
                </select>
              </div>

              <!-- Quick Stepper Buttons -->
              <div style="display: flex; gap: 6px;">
                <button class="action-btn" id="tafsirPrevAyahBtn" onclick="stepTafsirAyah(-1)" title="Vorheriger Vers" style="padding: 8px 14px; font-size: 0.88rem;">
                  <i class="fa-solid fa-chevron-left"></i> Vorheriger
                </button>
                <button class="action-btn" id="tafsirNextAyahBtn" onclick="stepTafsirAyah(1)" title="Nächster Vers" style="padding: 8px 14px; font-size: 0.88rem;">
                  Nächster <i class="fa-solid fa-chevron-right"></i>
                </button>
              </div>

              <!-- Direct Ayah Number Jump -->
              <div style="display: flex; align-items: center; gap: 6px;">
                <input type="number" id="tafsirAyahQuickInput" placeholder="Vers-Nr." min="1" max="286" style="width: 80px; background: #1a1612; color: #fff; border: 1px solid rgba(229,184,76,0.4); border-radius: 8px; padding: 7px 8px; font-size: 0.9rem; text-align: center;" onkeydown="if(event.key==='Enter') jumpToTafsirAyahNumber()">
                <button class="action-btn" onclick="jumpToTafsirAyahNumber()" style="padding: 7px 12px; font-size: 0.85rem;">Gehe zu</button>
              </div>
            </div>

            <!-- View Scope Toggle: Single Verse vs Whole Surah -->
            <div style="display: flex; gap: 6px; align-items: center;">
              <span style="font-size: 0.82rem; color: var(--text-muted); font-weight: 600;">Ansicht:</span>
              <button class="tafsir-pill-btn active" id="tafsirScopeSingle" onclick="setTafsirViewScope('single')" style="padding: 6px 12px; font-size: 0.85rem;">
                <i class="fa-solid fa-magnifying-glass"></i> Einzelvers (Detail)
              </button>
              <button class="tafsir-pill-btn" id="tafsirScopeSurah" onclick="setTafsirViewScope('surah')" style="padding: 6px 12px; font-size: 0.85rem;">
                <i class="fa-solid fa-book-open"></i> Gesamte Sure
              </button>
            </div>
          </div>

          <!-- Tafsir Selector Pills (Completely Removed Kurdish, 100% Authentic Works) -->
          <div style="display: flex; gap: 10px; flex-wrap: wrap; border-top: 1px solid rgba(229,184,76,0.25); padding-top: 14px;">
            <button class="tafsir-pill-btn active" id="tafsirBtnAll" onclick="selectTafsirEdition('all')">
              <i class="fa-solid fa-layer-group"></i> Beide Tafsīre (Vergleichsansicht Deutsch &amp; Arabisch)
            </button>
            <button class="tafsir-pill-btn" id="tafsirBtnZaidan" onclick="selectTafsirEdition('zaidan')">
              <i class="fa-solid fa-book-quran"></i> 1. Deutsches Tafsīr-Studio (Amir Zaidan &amp; Bubenheim)
            </button>
            <button class="tafsir-pill-btn" id="tafsirBtnMuyassar" onclick="selectTafsirEdition('muyassar')" style="direction: rtl;">
              <i class="fa-solid fa-kaaba"></i> 2. التفسير الميسر (مجمع الملك فهد بالمدينة)
            </button>
            <button class="tafsir-pill-btn" id="tafsirBtnIbnKathir" onclick="selectTafsirEdition('ibnkathir')">
              <i class="fa-solid fa-book-journal-whills"></i> 3. Tafsīr Ibn Kathīr &amp; As-Sa'dī
            </button>
          </div>

        </div>

        <div id="tafsirContentContainer" style="display: flex; flex-direction: column; gap: 18px;"></div>

      </div>
"@

$newLines = [System.Collections.Generic.List[string]]::new()
for ($i = 0; $i -lt $start; $i++) {
    $newLines.Add($lines[$i])
}
$newLines.Add($newBlock)
for ($i = $end + 1; $i -lt $lines.Count; $i++) {
    $newLines.Add($lines[$i])
}

[System.IO.File]::WriteAllLines($filePath, $newLines, [System.Text.Encoding]::UTF8)
Write-Output "Successfully updated index.html! New line count: $($newLines.Count)"
