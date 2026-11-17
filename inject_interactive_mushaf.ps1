$path = "C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster\index.html"
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

# 1. CSS Injection
$interactiveCss = @"

/* ========================================================= */
/* INTERACTIVE MEDINA MUSHAF STYLES (QURAN.COM AESTHETIC)    */
/* ========================================================= */
.mushaf-page-card {
  background: #fdfbf7;
  color: #1a1612;
  border: 8px double #c59b27;
  outline: 2px solid #8c6d1f;
  border-radius: 16px;
  box-shadow: 0 16px 45px rgba(0, 0, 0, 0.7), inset 0 0 35px rgba(197, 155, 39, 0.12);
  padding: 32px 36px;
  max-width: 860px;
  margin: 0 auto 20px;
  direction: rtl;
  text-align: justify;
  text-align-last: center;
  position: relative;
  user-select: none;
  transition: all 0.3s ease;
}

.mushaf-theme-night .mushaf-page-card {
  background: #0f1115 !important;
  color: #fef08a !important;
  border-color: #a855f7 !important;
  outline-color: #6b21a8 !important;
  box-shadow: 0 16px 45px rgba(0, 0, 0, 0.95), inset 0 0 35px rgba(168, 85, 247, 0.18) !important;
}
.mushaf-theme-emerald .mushaf-page-card {
  background: #022018 !important;
  color: #ecfdf5 !important;
  border-color: #10b981 !important;
  outline-color: #047857 !important;
  box-shadow: 0 16px 45px rgba(0, 0, 0, 0.85), inset 0 0 35px rgba(16, 185, 129, 0.22) !important;
}
.mushaf-theme-blue .mushaf-page-card {
  background: #081225 !important;
  color: #f0f9ff !important;
  border-color: #38bdf8 !important;
  outline-color: #0284c7 !important;
  box-shadow: 0 16px 45px rgba(0, 0, 0, 0.85), inset 0 0 35px rgba(56, 189, 248, 0.22) !important;
}
.mushaf-theme-sepia .mushaf-page-card {
  background: #f4ecd8 !important;
  color: #291d0e !important;
  border-color: #d97706 !important;
  outline-color: #b45309 !important;
}

.mushaf-surah-ornate-header {
  background: linear-gradient(135deg, #dfb74a 0%, #b8860b 50%, #996515 100%);
  color: #1a1003;
  border: 2px solid #5c4013;
  border-radius: 10px;
  padding: 8px 18px;
  margin: 0 auto 20px;
  text-align: center;
  font-family: var(--quran-font);
  font-size: 1.55rem;
  font-weight: 800;
  box-shadow: inset 0 1px 3px rgba(255,255,255,0.4), 0 4px 12px rgba(0,0,0,0.3);
  max-width: 500px;
}
.mushaf-theme-night .mushaf-surah-ornate-header {
  background: linear-gradient(135deg, #6b21a8 0%, #4c1d95 100%);
  color: #fef08a;
  border-color: #c084fc;
}

.mushaf-bismillah-ornate {
  font-family: var(--quran-font);
  font-size: 1.95rem;
  text-align: center;
  color: #8c6d1f;
  margin-bottom: 22px;
  line-height: 1.8;
}
.mushaf-theme-night .mushaf-bismillah-ornate { color: #fef08a; }
.mushaf-theme-emerald .mushaf-bismillah-ornate { color: #6ee7b7; }
.mushaf-theme-blue .mushaf-bismillah-ornate { color: #7dd3fc; }

.mushaf-interactive-verse {
  font-family: var(--quran-font);
  font-size: 1.85rem;
  line-height: 2.35;
  padding: 4px 6px;
  border-radius: 8px;
  cursor: pointer;
  display: inline;
  transition: all 0.18s ease;
  position: relative;
}

.mushaf-interactive-verse:hover {
  background-color: rgba(56, 189, 248, 0.22);
  border-radius: 6px;
  box-shadow: 0 0 10px rgba(56, 189, 248, 0.35);
}

.mushaf-interactive-verse.active-mushaf-highlight {
  background-color: rgba(56, 189, 248, 0.35) !important;
  color: #0c4a6e !important;
  box-shadow: 0 0 18px rgba(56, 189, 248, 0.55), inset 0 0 8px rgba(56, 189, 248, 0.3) !important;
  outline: 2px solid #0284c7 !important;
  border-radius: 8px !important;
  font-weight: 700;
}
.mushaf-theme-night .mushaf-interactive-verse.active-mushaf-highlight {
  background-color: rgba(168, 85, 247, 0.38) !important;
  color: #ffffff !important;
  outline-color: #c084fc !important;
  box-shadow: 0 0 18px rgba(168, 85, 247, 0.6) !important;
}
.mushaf-theme-emerald .mushaf-interactive-verse.active-mushaf-highlight {
  background-color: rgba(16, 185, 129, 0.36) !important;
  color: #ffffff !important;
  outline-color: #34d399 !important;
  box-shadow: 0 0 18px rgba(16, 185, 129, 0.6) !important;
}

.ayah-rosette {
  font-family: var(--quran-font);
  font-size: 1.4rem;
  color: #b8860b;
  margin: 0 4px;
  display: inline-block;
  vertical-align: middle;
}
.mushaf-theme-night .ayah-rosette { color: #fef08a; }
.mushaf-theme-emerald .ayah-rosette { color: #34d399; }
.mushaf-theme-blue .ayah-rosette { color: #38bdf8; }
"@

# Replace in style
if (-not $content.Contains("INTERACTIVE MEDINA MUSHAF STYLES")) {
    $content = $content.Replace("</style>", "$interactiveCss`n</style>")
    Write-Host "CSS injected successfully."
}

# 2. HTML Markup Injection for Mushaf Controls Bar
$oldControls = @"
            <!-- Spread Toggle -->
            <div style="display: flex; align-items: center; gap: 8px;">
              <button class="action-btn active" id="singlePageModeBtn" onclick="setMushafViewSpread(false)" title="Einzelseite">
                <i class="fa-solid fa-file"></i> 1 Seite
              </button>
              <button class="action-btn" id="doublePageModeBtn" onclick="setMushafViewSpread(true)" title="Doppelseite (Buch)">
                <i class="fa-solid fa-book-open"></i> 2 Seiten
              </button>
            </div>
          </div>

          <!-- The Real Printed Medina Mushaf Page Image Container -->
          <div class="mushaf-book-stage" id="mushafBookStage">
"@

$newControls = @"
            <!-- Mode Switcher: Interactive vs Scan -->
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <button class="action-btn active" id="viewModeInteractiveBtn" onclick="setMushafDisplayMode('interactive')" title="Interaktiver Muṣḥaf (Jeder Vers klickbar &amp; leuchtend)" style="background: rgba(56, 189, 248, 0.2); border-color: #38bdf8; color: #7dd3fc; font-weight: 800;">
                <i class="fa-solid fa-hand-pointer"></i> Interaktiv (Klickbare Verse)
              </button>
              <button class="action-btn" id="viewModeScanBtn" onclick="setMushafDisplayMode('scan')" title="Original Druck-Scan (Faksimile)">
                <i class="fa-solid fa-image"></i> Faksimile-Scan
              </button>
            </div>

            <!-- Spread Toggle -->
            <div style="display: flex; align-items: center; gap: 8px;">
              <button class="action-btn active" id="singlePageModeBtn" onclick="setMushafViewSpread(false)" title="Einzelseite">
                <i class="fa-solid fa-file"></i> 1 Seite
              </button>
              <button class="action-btn" id="doublePageModeBtn" onclick="setMushafViewSpread(true)" title="Doppelseite (Buch)">
                <i class="fa-solid fa-book-open"></i> 2 Seiten
              </button>
            </div>
          </div>

          <!-- INTERACTIVE MEDINA MUSHAF PAGE (Matching Quran.com / QuranWBW) -->
          <div id="mushafInteractiveStage" style="width: 100%; max-width: 900px; margin: 0 auto 20px;">
            <div id="mushafInteractiveContent">
              <!-- Dynamically populated by renderInteractiveMushafPage() -->
            </div>
          </div>

          <!-- The Real Printed Medina Mushaf Page Image Container -->
          <div class="mushaf-book-stage" id="mushafBookStage" style="display: none;">
"@

$normContent = $content.Replace("`r`n", "`n")
$normOld = $oldControls.Replace("`r`n", "`n")
$normNew = $newControls.Replace("`r`n", "`n")

if ($normContent.Contains($normOld)) {
    $normContent = $normContent.Replace($normOld, $normNew)
    Write-Host "HTML controls injected successfully."
} else {
    Write-Host "Controls pattern not matched."
}

[System.IO.File]::WriteAllText($path, $normContent.Replace("`n", "`r`n"), [System.Text.Encoding]::UTF8)
Write-Host "index.html updated successfully."
