$filePath = 'C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster\index.html'
$lines = [System.IO.File]::ReadAllLines($filePath, [System.Text.Encoding]::UTF8)

$start = -1
$end = -1
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match '<!-- LEFT SIDEBAR -->') {
        $start = $i
    }
    if ($start -ge 0 -and $lines[$i] -match '<div id="mushafViewArea">') {
        $end = $i - 1
        break
    }
}

Write-Output "Replacing from line $start to line $end"

$newBlock = @"
    <!-- LEFT SIDEBAR (MODERN QURANLOOP-STYLE NAV RAIL) -->
    <div class="sidebar modern-nav-rail">
      <!-- App Brand & Title -->
      <div class="nav-brand">
        <div class="brand-icon-box">
          <i class="fa-solid fa-book-quran"></i>
        </div>
        <div class="brand-text">
          <div class="brand-title">Quran Hifz</div>
          <div class="brand-sub">استودیو حفظ قرآن</div>
        </div>
      </div>

      <!-- Main Navigation Menu (The 6 Core Destinations) -->
      <nav class="nav-menu">
        <button class="nav-item active" id="tabMushafBtn" onclick="switchMainTab('mushaf')">
          <i class="fa-solid fa-book-open"></i>
          <span>1. Muṣḥaf (مصحف)</span>
        </button>
        <button class="nav-item" id="tabHifzBtn" onclick="switchMainTab('hifz')">
          <i class="fa-solid fa-language"></i>
          <span>2. Vers- &amp; Wort</span>
        </button>
        <button class="nav-item" id="tabMicBtn" onclick="switchMainTab('mic')">
          <i class="fa-solid fa-microphone"></i>
          <span>3. Rezitationstest</span>
        </button>
        <button class="nav-item" id="tabTafsirBtn" onclick="switchMainTab('tafsir')">
          <i class="fa-solid fa-scroll"></i>
          <span>4. Tafsīr (تفسیر)</span>
        </button>
        <button class="nav-item" id="tabMemorizedBtn" onclick="switchMainTab('memorized')">
          <i class="fa-solid fa-graduation-cap"></i>
          <span>5. Gelerntes (حفظ)</span>
        </button>
        <button class="nav-item" id="tabRepeatBtn" onclick="switchMainTab('repeat')">
          <i class="fa-solid fa-repeat"></i>
          <span>6. Wiederholen (Loop)</span>
        </button>
      </nav>

      <!-- Quick Navigator (Compact Surah & Page Stepper) -->
      <div class="nav-quick-jump">
        <div style="font-size: 0.78rem; font-weight: 700; color: var(--gold-light); margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
          <i class="fa-solid fa-compass" style="color: var(--gold-primary);"></i> Schnellsprung:
        </div>
        <select id="allSurahsSelect" class="nav-quick-select" onchange="onSurahSelected()"></select>
        <div style="display: flex; gap: 6px; margin-top: 6px;">
          <button class="nav-quick-btn" onclick="turnPage(-1)" title="Vorherige Seite (►)">►</button>
          <input type="number" id="pageNumberInput" class="nav-page-input" min="1" max="604" value="1" onchange="onPageInputChanged()" title="Seitenzahl (1-604)">
          <button class="nav-quick-btn" onclick="turnPage(1)" title="Nächste Seite (◄)">◄</button>
        </div>
      </div>

      <!-- Settings & Extras Button -->
      <div class="nav-footer">
        <button class="nav-footer-btn" onclick="openSettingsDrawer()" title="Farben, قاری، Lesezeichen &amp; Extras">
          <i class="fa-solid fa-sliders"></i>
          <span>Einstellungen &amp; Design</span>
        </button>
      </div>
    </div>

    <!-- SETTINGS & EXTRAS SLIDE-OVER DRAWER (QURAN LOOP STYLE) -->
    <div id="settingsDrawerOverlay" class="drawer-overlay" onclick="closeSettingsDrawer()"></div>
    <div id="settingsDrawer" class="drawer-panel">
      <div class="drawer-header">
        <div style="display: flex; align-items: center; gap: 10px;">
          <i class="fa-solid fa-sliders" style="color: var(--gold-primary); font-size: 1.3rem;"></i>
          <h3 style="margin: 0; font-size: 1.2rem; color: var(--gold-light);">Einstellungen &amp; Extras (تنظیمات)</h3>
        </div>
        <button class="drawer-close-btn" onclick="closeSettingsDrawer()" title="Schließen">✕</button>
      </div>
      <div class="drawer-body">
        <!-- 1. APPEARANCE & THEMES -->
        <div class="drawer-card">
          <div class="card-title">
            <i class="fa-solid fa-palette" style="color: var(--gold-primary);"></i>
            <span>1. Aussehen &amp; Farbthemen (ظاهر و تم‌ها)</span>
          </div>
          <div class="form-group">
            <label class="form-label"><i class="fa-solid fa-image"></i> App-Hintergrundbild (پس‌زمینه):</label>
            <select id="appThemeSelect" class="select-box" onchange="changeAppBackgroundTheme(this.value)">
              <option value="fantasy">✨ Klassisch Islamisch (Holz-Rahl)</option>
              <option value="emerald">🌿 Smaragdgrünes Heiligtum</option>
              <option value="midnight">🌌 Nachtblaue Moschee &amp; Sterne</option>
              <option value="parchment">📜 Warmes Pergament &amp; Marmor</option>
              <option value="oled">🌑 Minimalistisch Dunkel (OLED)</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label"><i class="fa-solid fa-wand-magic-sparkles"></i> Menü-Akzentfarbe (رنگ منوها):</label>
            <select id="menuThemeSelect" class="select-box" onchange="changeMenuAccentTheme(this.value)">
              <option value="gold">👑 Medinisch Gold (طلایی کلاسیک)</option>
              <option value="emerald">🌿 Smaragdgrün (سبز زمردی)</option>
              <option value="cyan">💎 Persisch Türkis (فیروزه‌ای ایرانی)</option>
              <option value="ruby">🌹 Rubinrot (عقیقی / سرخ سلطنتی)</option>
              <option value="amethyst">🔮 Königspurpur (بنفش عمیق)</option>
            </select>
          </div>
        </div>

        <!-- 2. RECITER & AUDIO SETTINGS -->
        <div class="drawer-card">
          <div class="card-title">
            <i class="fa-solid fa-microphone-lines" style="color: var(--gold-primary);"></i>
            <span>2. Rezitator &amp; Audio-Optionen (قاری و صوت)</span>
          </div>
          <div class="form-group">
            <label class="form-label">Bevorzugter Qāri':</label>
            <select id="qariSelect" class="select-box" onchange="onQariChanged()">
              <option value="Alafasy_128kbps" selected>Mishary Rashid Alafasy (مشاري العفاسي)</option>
              <option value="Husary_128kbps">Mahmoud Khalil Al-Hossary (محمود خليل الحصري)</option>
              <option value="Abdul_Basit_Murattal_192kbps">Abdul Basit – Murattal (عبد الباسط)</option>
              <option value="Abdul_Basit_Mujawwad_128kbps">Abdul Basit – Mujawwad (عبد الباسط مجود)</option>
              <option value="Maher_AlMuaiqly_64kbps">Maher Al-Muaiqly (ماهر المعيقلي)</option>
              <option value="Hani_Rifai_192kbps">Hani Ar-Rifai (هاني الرفاعي)</option>
              <option value="Muhammad_Ayyoub_128kbps">Muhammad Ayyub (محمد أيوب)</option>
              <option value="Ali_Jaber_64kbps">Ali Jaber (علي جابر)</option>
              <option value="Nasser_Alqatami_128kbps">Nasser Al-Qatami (ناصر القطامي)</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Wiedergabegeschwindigkeit:</label>
            <select id="audioSpeedSelect" class="select-box" onchange="changeSpeed()">
              <option value="0.6">0.6x (Sehr langsam)</option>
              <option value="0.75">0.75x (Langsames Lernen)</option>
              <option value="1.0" selected>1.0x (Normales Tempo)</option>
              <option value="1.25">1.25x (Flotte Wiederholung)</option>
              <option value="1.5">1.5x (Schnell)</option>
            </select>
          </div>
          <div class="checkbox-group">
            <input type="checkbox" id="bismillahPrefixToggle" checked>
            <label for="bismillahPrefixToggle">Vor Vers 1 immer Basmalah rezitieren (außer Sure 9)</label>
          </div>
        </div>

        <!-- 3. BOOKMARK -->
        <div class="drawer-card">
          <div class="card-title">
            <i class="fa-solid fa-bookmark" style="color: var(--gold-primary);"></i>
            <span>3. Lesezeichen (نشانه خواندن)</span>
          </div>
          <div id="lastReadBookmarkText" style="font-size: 0.84rem; color: var(--text-muted); min-height: 28px; margin-bottom: 8px;">
            Noch kein Lesezeichen gesichert.
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="action-btn" style="flex: 1;" onclick="saveCurrentBookmark()">
              <i class="fa-solid fa-bookmark"></i> Sichern
            </button>
            <button class="action-btn" style="flex: 1;" onclick="resumeFromBookmark()">
              <i class="fa-solid fa-rotate-left"></i> Fortfahren
            </button>
          </div>
        </div>

        <!-- 4. IPAD & MOBILE ACCESS -->
        <div class="drawer-card" style="background: rgba(16, 185, 129, 0.12); border-color: rgba(16, 185, 129, 0.4);">
          <div class="card-title" style="color: #6ee7b7;">
            <i class="fa-solid fa-tablet-screen-button"></i>
            <span>4. Auf iPad &amp; Smartphone öffnen</span>
          </div>
          <div style="font-size: 0.86rem; color: #d1fae5; line-height: 1.5;">
            Im iPad / iPhone Safari-Browser eingeben:<br>
            <strong style="color: #ffffff; font-size: 0.95rem;">http://192.168.178.41:8080</strong>
          </div>
        </div>

        <!-- 5. YOUTUBE PLAYLISTS -->
        <div class="drawer-card">
          <div class="card-title">
            <i class="fa-brands fa-youtube" style="color: #ef4444;"></i>
            <span>5. Empfohlene Playlists</span>
          </div>
          <a href="https://www.youtube.com/playlist?list=PLCliBIDpUyfbT6P6LSHuyCBVMSGada1y9" target="_blank" class="yt-playlist-card">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div class="yt-icon-box"><i class="fa-solid fa-play"></i></div>
              <div>
                <div style="font-size: 0.88rem; font-weight: 700; color: #ffffff;">Tafsīr Nami (تەفسیری نامی)</div>
                <div style="font-size: 0.74rem; color: var(--text-muted);">Mamosta Abdolkarim Modarres</div>
              </div>
            </div>
            <i class="fa-solid fa-arrow-up-right-from-square" style="color: var(--gold-primary);"></i>
          </a>
          <a href="https://www.youtube.com/playlist?list=PLCdKzsWeICBpC6V2Y4OTybPcVia47kdWn" target="_blank" class="yt-playlist-card" style="margin-top: 8px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div class="yt-icon-box"><i class="fa-solid fa-book-quran"></i></div>
              <div>
                <div style="font-size: 0.88rem; font-weight: 700; color: #ffffff;">Abdul Karim Diwan (عبدالكريم الديوان)</div>
                <div style="font-size: 0.74rem; color: var(--text-muted);">Koranrezitationen &amp; Erläuterungen</div>
              </div>
            </div>
            <i class="fa-solid fa-arrow-up-right-from-square" style="color: var(--gold-primary);"></i>
          </a>
        </div>

        <!-- 6. HIDDEN HIFZ INPUTS FOR JS INTEGRITY -->
        <div style="display: none;">
          <select id="repeatCountSelect"><option value="1">1</option><option value="3" selected>3</option><option value="5">5</option><option value="10">10</option><option value="999">∞</option></select>
          <select id="loopRangeSelect"><option value="verse" selected>Vers</option><option value="page">Seite</option><option value="surah">Sure</option></select>
          <input type="checkbox" id="markMemorizedToggle">
        </div>
      </div>
    </div>

    <!-- RIGHT MAIN WORKSPACE (100% FOCUSED) -->
    <div class="main-workspace">
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
