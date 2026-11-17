$filePath = 'C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster\tafsir_multilingual.js'
$code = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)

# Find the end of EXTENDED_GERMAN_TAFSIR_DB (around line 335)
$cutIndex = $code.IndexOf("const EXTENDED_GERMAN_TAFSIR_DB = {")
$endBraceIndex = $code.IndexOf("};`r`n`r`n/**`r`n * Universeller Auslegungs-Generator", $cutIndex)
if ($endBraceIndex -lt 0) {
    $endBraceIndex = $code.IndexOf("};`n`n/**`n * Universeller Auslegungs-Generator", $cutIndex)
}
if ($endBraceIndex -lt 0) {
    $endBraceIndex = $code.IndexOf("};", $cutIndex)
}

# Extract the header + EXTENDED_GERMAN_TAFSIR_DB up to 1:7
$headerAndDb = $code.Substring(0, $endBraceIndex + 2)

# Remove any 'nami:' property from the DB
$headerAndDbClean = [System.Text.RegularExpressions.Regex]::Replace($headerAndDb, "(?s)nami:\s*`.*?`\s*,?", "")

$newImplementation = @"


// ============================================================
// AUTHENTIC MULTILINGUAL QURAN TAFSIR ENGINE (6236 VERSES)
// ============================================================

/**
 * Fast Lookup Helper for Verse Data
 */
function getAuthenticVerseTafsir(surahNum, ayahNum) {
  const key = surahNum + ':' + ayahNum;
  let zaidan = '';
  let muyassar = '';

  if (typeof AUTHENTIC_TAFSIR_DB !== 'undefined' && AUTHENTIC_TAFSIR_DB[key]) {
    zaidan = AUTHENTIC_TAFSIR_DB[key].z || '';
    muyassar = AUTHENTIC_TAFSIR_DB[key].m || '';
  }

  const extended = (typeof EXTENDED_GERMAN_TAFSIR_DB !== 'undefined' && EXTENDED_GERMAN_TAFSIR_DB[key])
    ? EXTENDED_GERMAN_TAFSIR_DB[key]
    : null;

  return { zaidan: zaidan, muyassar: muyassar, extended: extended };
}

/**
 * Audio Player for specific Tafsir Verse
 */
function playTafsirSpecificVerse(surahNum, ayahNum) {
  const sStr = String(surahNum).padStart(3, '0');
  const aStr = String(ayahNum).padStart(3, '0');
  const qari = (document.getElementById('qariSelect') && document.getElementById('qariSelect').value) || 'Alafasy_128kbps';
  
  if (typeof audio !== 'undefined' && audio) {
    audio.src = 'https://everyayah.com/data/' + qari + '/' + sStr + aStr + '.mp3';
    audio.play().catch(function(e) { console.warn('Audio play error:', e); });
  } else {
    const a = new Audio('https://everyayah.com/data/' + qari + '/' + sStr + aStr + '.mp3');
    a.play().catch(function(e) { console.warn('Audio play error:', e); });
  }
  if (typeof showToast === 'function') {
    showToast('Wiedergabe: Sure ' + surahNum + ', Vers ' + ayahNum);
  }
}

/**
 * Full HTML-Renderer for Authentic Quran Tafsir
 * 1. Amir Zaidan (At-Tafsir al-Muharrar - Deutsches Erlaeuterungswerk)
 * 2. At-Tafsir al-Muyassar (King Fahad Quran Complex, Medina)
 * 3. Hafiz Ibn Kathir & As-Sa'di (Extended analysis for selected surahs)
 */
function renderScholarlyGermanTafsirHtml(surahNum, ayahNum, ayahArabic, ayahGerman, ayahKurdish, filterMode) {
  const key = surahNum + ':' + ayahNum;
  const mode = filterMode || 'all';

  const authData = getAuthenticVerseTafsir(surahNum, ayahNum);
  const zaidanText = authData.zaidan || 'Erläuterung wird geladen...';
  const muyassarText = authData.muyassar || 'جاري تحميل التفسير الميسر...';
  const extData = authData.extended;

  const rawMeta = (typeof ALL_114_SURAHS !== 'undefined' && ALL_114_SURAHS[surahNum - 1]) 
    ? ALL_114_SURAHS[surahNum - 1] 
    : null;
  const surahNameDisplay = rawMeta 
    ? ('Sure ' + surahNum + ': ' + rawMeta.name + ' (' + (rawMeta.germanMeaning || '') + ') – ' + rawMeta.arabic) 
    : ('Sure ' + surahNum);

  let contentHtml = '';

  if (mode === 'zaidan') {
    contentHtml = `
      <div style="background: rgba(30, 24, 20, 0.88); border: 2px solid var(--gold-primary); border-radius: 16px; padding: 22px; margin-bottom: 16px;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 14px; color: var(--gold-light);">
          <i class="fa-solid fa-book-quran" style="font-size: 1.35rem; color: var(--gold-primary);"></i>
          <h3 style="font-size: 1.2rem; font-weight: 800; margin: 0;">1. Deutsches Tafsīr-Studio (At-Tafsīr al-Muḥarrar – Amir Zaidan)</h3>
        </div>
        <div style="font-size: 1.05rem; line-height: 1.85; color: #f1f5f9;">` + zaidanText + `</div>
      </div>
    `;
  } else if (mode === 'muyassar') {
    contentHtml = `
      <div style="background: rgba(20, 35, 25, 0.88); border: 2px solid #10b981; border-radius: 16px; padding: 22px; margin-bottom: 16px; direction: rtl; text-align: right;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 14px; color: #6ee7b7;">
          <i class="fa-solid fa-kaaba" style="font-size: 1.35rem; color: #10b981;"></i>
          <h3 style="font-size: 1.25rem; font-weight: 800; margin: 0; font-family: var(--quran-font);">التفسير الميسر (مجمع الملك فهد لطباعة المصحف الشريف بالمدينة المنورة)</h3>
        </div>
        <div style="font-family: var(--quran-font); font-size: 1.25rem; line-height: 2.1; color: #fef08a;">` + muyassarText + `</div>
      </div>
    `;
  } else if (mode === 'ibnkathir' && extData && extData.ibn_kathir) {
    contentHtml = `
      <div style="background: rgba(30, 24, 20, 0.88); border: 2px solid var(--gold-primary); border-radius: 16px; padding: 22px; margin-bottom: 16px;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 14px; color: var(--gold-light);">
          <i class="fa-solid fa-book-journal-whills" style="font-size: 1.35rem; color: var(--gold-primary);"></i>
          <h3 style="font-size: 1.2rem; font-weight: 800; margin: 0;">Tafsīr Ibn Kathīr &amp; As-Sa'dī (Theologische Vertiefung)</h3>
        </div>
        <div style="font-size: 1.04rem; line-height: 1.8; color: #f1f5f9;">` + extData.ibn_kathir + `</div>
        ` + (extData.saddi ? `<div style="margin-top: 14px; padding-top: 14px; border-top: 1px dashed rgba(229,184,76,0.3); font-size: 1.04rem; line-height: 1.8; color: #6ee7b7;"><strong>Spirituelle Reflexion (As-Sa'dī):</strong><br>` + extData.saddi + `</div>` : '') + `
      </div>
    `;
  } else {
    // Mode 'all': Both authentic German and Arabic Tafsir side-by-side!
    contentHtml = `
      <div style="display: flex; flex-direction: column; gap: 18px;">
        <!-- German Tafsir: Amir Zaidan -->
        <div style="background: rgba(30, 24, 20, 0.88); border: 1.5px solid rgba(229,184,76,0.4); border-radius: 16px; padding: 22px;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px; color: var(--gold-light);">
            <i class="fa-solid fa-book-quran" style="font-size: 1.25rem; color: var(--gold-primary);"></i>
            <h3 style="font-size: 1.15rem; font-weight: 800; margin: 0;">1. Deutsches Erläuterungswerk (At-Tafsīr al-Muḥarrar – Amir Zaidan)</h3>
          </div>
          <div style="font-size: 1.04rem; line-height: 1.85; color: #f1f5f9;">` + zaidanText + `</div>
        </div>

        <!-- Arabic Tafsir: Al-Muyassar (King Fahd Complex) -->
        <div style="background: rgba(18, 32, 24, 0.9); border: 1.5px solid rgba(16, 185, 129, 0.4); border-radius: 16px; padding: 22px; direction: rtl; text-align: right;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px; color: #6ee7b7;">
            <i class="fa-solid fa-kaaba" style="font-size: 1.25rem; color: #10b981;"></i>
            <h3 style="font-size: 1.2rem; font-weight: 800; margin: 0; font-family: var(--quran-font);">2. التفسير الميسر (مجمع الملك فهد لطباعة المصحف الشريف بالمدينة المنورة)</h3>
          </div>
          <div style="font-family: var(--quran-font); font-size: 1.22rem; line-height: 2.1; color: #fef08a;">` + muyassarText + `</div>
        </div>

        ` + (extData && extData.ibn_kathir ? `
        <!-- Optional Extended Ibn Kathir if available -->
        <div style="background: rgba(25, 20, 35, 0.85); border: 1.5px solid rgba(168, 85, 247, 0.35); border-radius: 16px; padding: 20px;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px; color: #d8b4fe;">
            <i class="fa-solid fa-book-journal-whills" style="font-size: 1.2rem; color: #c084fc;"></i>
            <h3 style="font-size: 1.15rem; font-weight: 800; margin: 0;">3. Tafsīr Ibn Kathīr &amp; Dschalālain (Vertiefung)</h3>
          </div>
          <div style="font-size: 1.02rem; line-height: 1.8; color: #e2e8f0;">` + extData.ibn_kathir + `</div>
        </div>
        ` : '') + `
      </div>
    `;
  }

  const arabicDisplay = (typeof cleanQuranText === 'function') ? cleanQuranText(ayahArabic) : ayahArabic;

  return `
    <div class="scholarly-tafsir-container" style="background: rgba(18, 14, 11, 0.96); border: 1.5px solid var(--gold-border); border-radius: 20px; padding: 26px; box-shadow: 0 15px 45px rgba(0,0,0,0.65); margin-top: 15px;">
      
      <!-- Header Badge -->
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid rgba(229,184,76,0.3); padding-bottom: 14px; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
        <div>
          <span style="font-size: 0.85rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: var(--gold-light); background: rgba(229,184,76,0.18); border: 1px solid var(--gold-border); padding: 5px 14px; border-radius: 20px;">
            <i class="fa-solid fa-graduation-cap"></i> Authentischer Koran-Tafsīr
          </span>
          <h2 style="font-size: 1.4rem; color: #fff; margin-top: 10px; font-weight: 800;">
            ` + surahNameDisplay + ` – Vers ` + ayahNum + `
          </h2>
        </div>
        <div style="display: flex; gap: 8px; align-items: center;">
          <button class="action-btn" onclick="playTafsirSpecificVerse(` + surahNum + `, ` + ayahNum + `)" title="Diesen Vers anhören">
            <i class="fa-solid fa-play"></i> Anhören
          </button>
          <span style="font-size: 1.05rem; color: #6ee7b7; font-weight: 800; background: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; padding: 5px 14px; border-radius: 12px;">
            <i class="fa-solid fa-book-open-reader"></i> ` + surahNum + `:` + ayahNum + `
          </span>
        </div>
      </div>

      <!-- Ayah Arabic & Translation -->
      <div style="background: rgba(0,0,0,0.55); border-left: 4px solid var(--gold-primary); border-radius: 14px; padding: 18px 22px; margin-bottom: 22px;">
        <div style="font-family: var(--quran-font); font-size: 2rem; color: var(--gold-light); text-align: right; direction: rtl; line-height: 2.3; margin-bottom: 12px;">
          ` + arabicDisplay + `
        </div>
        <div style="font-size: 1.08rem; color: #f1f5f9; font-weight: 500; line-height: 1.7;">
          <strong style="color: var(--gold-primary);">Deutsche Übersetzung (Bubenheim &amp; Elyas):</strong> ` + ayahGerman + `
        </div>
      </div>

      <!-- Rendered Content Based on Selection -->
      ` + contentHtml + `

    </div>
  `;
}
"@

$finalContent = $headerAndDbClean + $newImplementation
[System.IO.File]::WriteAllText($filePath, $finalContent, [System.Text.Encoding]::UTF8)
Write-Output "Successfully updated tafsir_multilingual.js ($([System.IO.FileInfo]::new($filePath).Length) bytes)"
