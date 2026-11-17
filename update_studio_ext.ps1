$filePath = 'C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster\studio_extensions.js'
$code = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)

$oldStart = "// ============================================================`r`n// 4. SCHOLARLY MULTI-SECTION GERMAN TAFSIR (TAB 4)"
if (-not $code.Contains($oldStart)) {
    $oldStart = "// ============================================================`n// 4. SCHOLARLY MULTI-SECTION GERMAN TAFSIR (TAB 4)"
}

$oldEnd = "// ============================================================`r`n// 5. WORD-BY-WORD INTEGRATION (TAB 2 - VERS- & WORT-STUDIO)"
if (-not $code.Contains($oldEnd)) {
    $oldEnd = "// ============================================================`n// 5. WORD-BY-WORD INTEGRATION (TAB 2 - VERS- & WORT-STUDIO)"
}

$startIdx = $code.IndexOf($oldStart)
$endIdx = $code.IndexOf($oldEnd)

if ($startIdx -ge 0 -and $endIdx -ge 0) {
    $before = $code.Substring(0, $startIdx)
    $after = $code.Substring($endIdx)

    $newTafsirBlock = @"
// ============================================================
// 4. SCHOLARLY MULTI-SECTION TAFSIR STUDIO (TAB 4)
// ============================================================
let activeTafsirEdition = 'all';
let currentTafsirSurah = 1;
let currentTafsirAyah = 1;
let currentTafsirScope = 'single'; // 'single' or 'surah'

window.openSettingsDrawer = function() {
  const drawer = document.getElementById('settingsDrawer');
  const overlay = document.getElementById('settingsDrawerOverlay');
  if (drawer) drawer.classList.add('open');
  if (overlay) overlay.classList.add('open');
};

window.closeSettingsDrawer = function() {
  const drawer = document.getElementById('settingsDrawer');
  const overlay = document.getElementById('settingsDrawerOverlay');
  if (drawer) drawer.classList.remove('open');
  if (overlay) overlay.classList.remove('open');
};

function selectTafsirEdition(edition) {
  activeTafsirEdition = edition;

  const pills = {
    'all': document.getElementById('tafsirBtnAll'),
    'zaidan': document.getElementById('tafsirBtnZaidan'),
    'muyassar': document.getElementById('tafsirBtnMuyassar'),
    'ibnkathir': document.getElementById('tafsirBtnIbnKathir')
  };

  Object.keys(pills).forEach(k => {
    if (pills[k]) pills[k].classList.toggle('active', k === edition);
  });

  renderTafsirView();
  if (typeof showToast === 'function') {
    showToast(`Tafsīr-Auswahl: ` + edition);
  }
}

function initTafsirStudioControls() {
  const surahSelect = document.getElementById('tafsirSurahSelect');
  if (!surahSelect) return;

  if (typeof ALL_114_SURAHS !== 'undefined' && surahSelect.options.length <= 1) {
    surahSelect.innerHTML = '';
    ALL_114_SURAHS.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = `${s.id}. ${s.name} (${s.arabic}) - ${s.versesCount} Verse`;
      surahSelect.appendChild(opt);
    });
    surahSelect.value = currentTafsirSurah;
  }

  updateTafsirAyahOptions();
}

function updateTafsirAyahOptions() {
  const ayahSelect = document.getElementById('tafsirAyahSelect');
  if (!ayahSelect) return;

  const meta = (typeof ALL_114_SURAHS !== 'undefined' && ALL_114_SURAHS[currentTafsirSurah - 1]) 
    ? ALL_114_SURAHS[currentTafsirSurah - 1] 
    : { versesCount: 7 };

  ayahSelect.innerHTML = '';
  for (let i = 1; i <= meta.versesCount; i++) {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = `Vers ${i}`;
    ayahSelect.appendChild(opt);
  }

  if (currentTafsirAyah > meta.versesCount) currentTafsirAyah = 1;
  ayahSelect.value = currentTafsirAyah;

  const quickInput = document.getElementById('tafsirAyahQuickInput');
  if (quickInput) {
    quickInput.max = meta.versesCount;
    quickInput.value = currentTafsirAyah;
  }
}

window.onTafsirSurahChange = function(surahId) {
  currentTafsirSurah = parseInt(surahId, 10) || 1;
  currentTafsirAyah = 1;
  updateTafsirAyahOptions();
  renderTafsirView();
};

window.onTafsirAyahChange = function(ayahId) {
  currentTafsirAyah = parseInt(ayahId, 10) || 1;
  const quickInput = document.getElementById('tafsirAyahQuickInput');
  if (quickInput) quickInput.value = currentTafsirAyah;
  renderTafsirView();
};

window.stepTafsirAyah = function(delta) {
  const meta = (typeof ALL_114_SURAHS !== 'undefined' && ALL_114_SURAHS[currentTafsirSurah - 1]) 
    ? ALL_114_SURAHS[currentTafsirSurah - 1] 
    : { versesCount: 7 };

  let nextAyah = currentTafsirAyah + delta;

  if (nextAyah > meta.versesCount) {
    if (currentTafsirSurah < 114) {
      currentTafsirSurah++;
      currentTafsirAyah = 1;
      const surahSelect = document.getElementById('tafsirSurahSelect');
      if (surahSelect) surahSelect.value = currentTafsirSurah;
      updateTafsirAyahOptions();
    } else {
      nextAyah = meta.versesCount;
    }
  } else if (nextAyah < 1) {
    if (currentTafsirSurah > 1) {
      currentTafsirSurah--;
      const prevMeta = ALL_114_SURAHS[currentTafsirSurah - 1];
      currentTafsirAyah = prevMeta.versesCount;
      const surahSelect = document.getElementById('tafsirSurahSelect');
      if (surahSelect) surahSelect.value = currentTafsirSurah;
      updateTafsirAyahOptions();
    } else {
      nextAyah = 1;
    }
  } else {
    currentTafsirAyah = nextAyah;
  }

  const ayahSelect = document.getElementById('tafsirAyahSelect');
  if (ayahSelect) ayahSelect.value = currentTafsirAyah;
  const quickInput = document.getElementById('tafsirAyahQuickInput');
  if (quickInput) quickInput.value = currentTafsirAyah;

  renderTafsirView();
};

window.jumpToTafsirAyahNumber = function() {
  const quickInput = document.getElementById('tafsirAyahQuickInput');
  if (!quickInput) return;
  const val = parseInt(quickInput.value, 10);
  const meta = (typeof ALL_114_SURAHS !== 'undefined' && ALL_114_SURAHS[currentTafsirSurah - 1]) 
    ? ALL_114_SURAHS[currentTafsirSurah - 1] 
    : { versesCount: 7 };

  if (val >= 1 && val <= meta.versesCount) {
    currentTafsirAyah = val;
    const ayahSelect = document.getElementById('tafsirAyahSelect');
    if (ayahSelect) ayahSelect.value = currentTafsirAyah;
    renderTafsirView();
  } else {
    if (typeof showToast === 'function') {
      showToast(`Ungültige Versnummer (Sure hat ${meta.versesCount} Verse)`);
    }
  }
};

window.setTafsirViewScope = function(scope) {
  currentTafsirScope = scope;
  const btnSingle = document.getElementById('tafsirScopeSingle');
  const btnSurah = document.getElementById('tafsirScopeSurah');
  if (btnSingle) btnSingle.classList.toggle('active', scope === 'single');
  if (btnSurah) btnSurah.classList.toggle('active', scope === 'surah');
  renderTafsirView();
};

window.playCurrentTafsirAudio = function() {
  if (typeof playTafsirSpecificVerse === 'function') {
    playTafsirSpecificVerse(currentTafsirSurah, currentTafsirAyah);
  }
};

window.jumpToMushafFromTafsir = function() {
  const meta = (typeof ALL_114_SURAHS !== 'undefined' && ALL_114_SURAHS[currentTafsirSurah - 1])
    ? ALL_114_SURAHS[currentTafsirSurah - 1]
    : { startPage: 1 };
  
  let targetPage = meta.startPage;
  if (typeof QURAN_ALL_PAGES !== 'undefined') {
    for (const p in QURAN_ALL_PAGES) {
      const vList = QURAN_ALL_PAGES[p];
      for (let i = 0; i < vList.length; i++) {
        if (vList[i].surahNum === currentTafsirSurah && vList[i].num === currentTafsirAyah) {
          targetPage = parseInt(p, 10);
          break;
        }
      }
    }
  }

  currentPage = targetPage;
  currentSurah = currentTafsirSurah;
  currentVerseIdx = 0;
  if (typeof renderAll === 'function') renderAll();
  switchMainTab('mushaf');
  if (typeof showToast === 'function') {
    showToast(`Zum Medina-Mushaf gewechselt (Seite ${targetPage})`);
  }
};

function getVerseRawData(surahNum, ayahNum) {
  if (typeof QURAN_ALL_PAGES !== 'undefined') {
    for (const p in QURAN_ALL_PAGES) {
      const vList = QURAN_ALL_PAGES[p];
      for (let i = 0; i < vList.length; i++) {
        if (vList[i].surahNum === surahNum && vList[i].num === ayahNum) {
          return vList[i];
        }
      }
    }
  }
  return { ar: '', de: '' };
}

function renderTafsirView() {
  initTafsirStudioControls();
  const container = document.getElementById('tafsirContentContainer');
  if (!container) return;
  container.innerHTML = '';

  if (currentTafsirScope === 'single') {
    const raw = getVerseRawData(currentTafsirSurah, currentTafsirAyah);
    const box = document.createElement('div');
    box.id = `tafsir-box-${currentTafsirSurah}-${currentTafsirAyah}`;
    box.style.marginBottom = '28px';

    if (typeof renderScholarlyGermanTafsirHtml === 'function') {
      box.innerHTML = renderScholarlyGermanTafsirHtml(
        currentTafsirSurah,
        currentTafsirAyah,
        raw.ar,
        raw.de,
        '',
        activeTafsirEdition
      );
    }
    container.appendChild(box);
  } else {
    const meta = (typeof ALL_114_SURAHS !== 'undefined' && ALL_114_SURAHS[currentTafsirSurah - 1]) 
      ? ALL_114_SURAHS[currentTafsirSurah - 1] 
      : { versesCount: 7 };

    for (let a = 1; a <= meta.versesCount; a++) {
      const raw = getVerseRawData(currentTafsirSurah, a);
      const box = document.createElement('div');
      box.id = `tafsir-box-${currentTafsirSurah}-${a}`;
      box.style.marginBottom = '24px';

      if (typeof renderScholarlyGermanTafsirHtml === 'function') {
        box.innerHTML = renderScholarlyGermanTafsirHtml(
          currentTafsirSurah,
          a,
          raw.ar,
          raw.de,
          '',
          activeTafsirEdition
        );
      }
      container.appendChild(box);
    }
  }
}

"@

    $updated = $before + $newTafsirBlock + $after
    [System.IO.File]::WriteAllText($filePath, $updated, [System.Text.Encoding]::UTF8)
    Write-Output "Successfully updated studio_extensions.js"
} else {
    Write-Output "Could not find anchors in studio_extensions.js: start=$startIdx, end=$endIdx"
}
