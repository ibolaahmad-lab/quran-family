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

Write-Output "startIdx=$startIdx, endIdx=$endIdx"

if ($startIdx -ge 0 -and $endIdx -ge 0) {
    $before = $code.Substring(0, $startIdx)
    $after = $code.Substring($endIdx)

    $newBlock = @"
// ============================================================
// 4. SCHOLARLY MULTI-SECTION GERMAN TAFSIR (TAB 4)
// ============================================================
let activeTafsirEdition = 'all';
let currentTafsirSurah = 1;
let currentTafsirAyah = 1;
let currentTafsirScope = 'single'; // 'single' or 'surah'

function selectTafsirEdition(edition) {
  activeTafsirEdition = edition;

  const pills = {
    'all': document.getElementById('tafsirBtnAll'),
    'ibnkathir': document.getElementById('tafsirBtnIbnKathir'),
    'zaidan': document.getElementById('tafsirBtnZaidan'),
    'simple': document.getElementById('tafsirBtnSimple')
  };

  Object.keys(pills).forEach(function(k) {
    if (pills[k]) pills[k].classList.toggle('active', k === edition);
  });

  renderTafsirView();
  if (typeof showToast === 'function') {
    showToast('Tafsīr-Auswahl: ' + edition);
  }
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
    opt.textContent = 'Vers ' + i;
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
      showToast('Ungültige Versnummer (Sure hat ' + meta.versesCount + ' Verse)');
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
  const sStr = String(currentTafsirSurah).padStart(3, '0');
  const aStr = String(currentTafsirAyah).padStart(3, '0');
  const qari = (document.getElementById('qariSelect') && document.getElementById('qariSelect').value) || 'Alafasy_128kbps';
  
  if (typeof audio !== 'undefined' && audio) {
    audio.src = 'https://everyayah.com/data/' + qari + '/' + sStr + aStr + '.mp3';
    audio.play().catch(function(e) { console.warn('Audio play error:', e); });
  } else {
    const a = new Audio('https://everyayah.com/data/' + qari + '/' + sStr + aStr + '.mp3');
    a.play().catch(function(e) { console.warn('Audio play error:', e); });
  }
  if (typeof showToast === 'function') {
    showToast('Wiedergabe: Sure ' + currentTafsirSurah + ', Vers ' + currentTafsirAyah);
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
    showToast('Zum Medina-Mushaf gewechselt (Seite ' + targetPage + ')');
  }
};

// Clickable Surah Picker Modal Handler
window.openSurahPickerModal = function() {
  let modal = document.getElementById('surahPickerModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'surahPickerModal';
    modal.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.85); z-index:10000; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(6px); padding:20px;';
    
    let inner = document.createElement('div');
    inner.style.cssText = 'background:var(--bg-card); border:2px solid var(--gold-border); border-radius:20px; max-width:850px; width:100%; max-height:85vh; display:flex; flex-direction:column; box-shadow:0 20px 60px rgba(0,0,0,0.9); overflow:hidden;';
    
    let head = document.createElement('div');
    head.style.cssText = 'display:flex; justify-content:space-between; align-items:center; padding:18px 24px; border-bottom:1.5px solid rgba(229,184,76,0.3); background:rgba(0,0,0,0.4);';
    head.innerHTML = '<div style="font-size:1.25rem; font-weight:800; color:var(--gold-light); display:flex; align-items:center; gap:10px;"><i class="fa-solid fa-quran" style="color:var(--gold-primary);"></i> Sure auswählen (1–114)</div><button onclick="closeSurahPickerModal()" style="background:transparent; border:none; color:var(--text-muted); font-size:1.4rem; cursor:pointer;">✕</button>';
    
    let searchBox = document.createElement('div');
    searchBox.style.cssText = 'padding:14px 24px; border-bottom:1px solid rgba(229,184,76,0.15);';
    searchBox.innerHTML = '<input type="text" id="surahPickerSearchInput" placeholder="Sure suchen (z.B. Baqara, Yasin, 36, Kahf)..." style="width:100%; background:#181410; color:#fff; border:1.5px solid var(--gold-border); border-radius:10px; padding:10px 14px; font-size:0.95rem; outline:none;" oninput="filterSurahPickerGrid(this.value)">';
    
    let grid = document.createElement('div');
    grid.id = 'surahPickerGrid';
    grid.style.cssText = 'flex:1; overflow-y:auto; padding:20px 24px; display:grid; grid-template-columns:repeat(auto-fill, minmax(220px, 1fr)); gap:12px;';
    
    inner.appendChild(head);
    inner.appendChild(searchBox);
    inner.appendChild(grid);
    modal.appendChild(inner);
    document.body.appendChild(modal);
  }

  // Populate Grid
  const grid = document.getElementById('surahPickerGrid');
  grid.innerHTML = '';
  const list = (typeof ALL_114_SURAHS !== 'undefined') ? ALL_114_SURAHS : [];
  list.forEach(function(s) {
    const item = document.createElement('button');
    item.className = 'surah-picker-item';
    item.style.cssText = 'background:rgba(25, 20, 15, 0.85); border:1.5px solid rgba(229,184,76,0.3); border-radius:12px; padding:12px 14px; display:flex; justify-content:space-between; align-items:center; cursor:pointer; text-align:left; transition:all 0.2s ease;';
    item.innerHTML = '<div style="display:flex; align-items:center; gap:10px;"><span style="background:var(--gold-primary); color:#000; font-weight:800; font-size:0.85rem; width:28px; height:28px; border-radius:8px; display:flex; align-items:center; justify-content:center;">' + s.id + '</span><div><div style="font-weight:700; color:#fff; font-size:0.92rem;">' + s.name + '</div><div style="font-size:0.75rem; color:var(--text-muted);">' + s.versesCount + ' Verse</div></div></div><div style="font-family:var(--quran-font); font-size:1.15rem; color:var(--gold-light);">' + s.arabic + '</div>';
    
    item.onmouseover = function() {
      item.style.borderColor = 'var(--gold-primary)';
      item.style.background = 'rgba(229,184,76,0.18)';
    };
    item.onmouseout = function() {
      item.style.borderColor = 'rgba(229,184,76,0.3)';
      item.style.background = 'rgba(25, 20, 15, 0.85)';
    };
    item.onclick = function() {
      currentTafsirSurah = s.id;
      currentTafsirAyah = 1;
      const sel = document.getElementById('tafsirSurahSelect');
      if (sel) sel.value = s.id;
      updateTafsirAyahOptions();
      renderTafsirView();
      closeSurahPickerModal();
    };
    grid.appendChild(item);
  });

  modal.style.display = 'flex';
};

window.closeSurahPickerModal = function() {
  const modal = document.getElementById('surahPickerModal');
  if (modal) modal.style.display = 'none';
};

window.filterSurahPickerGrid = function(query) {
  const q = (query || '').toLowerCase().trim();
  const items = document.querySelectorAll('.surah-picker-item');
  items.forEach(function(el) {
    const text = el.textContent.toLowerCase();
    el.style.display = text.indexOf(q) !== -1 ? 'flex' : 'none';
  });
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
  const container = document.getElementById('tafsirContentContainer');
  if (!container) return;
  container.innerHTML = '';

  const tafsirSurahSel = document.getElementById('tafsirSurahSelect');
  if (tafsirSurahSel && tafsirSurahSel.options.length <= 1) {
    if (typeof populateSurahsDropdown === 'function') {
      populateSurahsDropdown();
    }
  }

  if (currentTafsirScope === 'single') {
    const raw = getVerseRawData(currentTafsirSurah, currentTafsirAyah);
    const box = document.createElement('div');
    box.id = 'tafsir-box-' + currentTafsirSurah + '-' + currentTafsirAyah;
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
      box.id = 'tafsir-box-' + currentTafsirSurah + '-' + a;
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

    $updated = $before + $newBlock + "`r`n" + $after
    [System.IO.File]::WriteAllText($filePath, $updated, [System.Text.Encoding]::UTF8)
    Write-Output "Successfully updated studio_extensions.js ($([System.IO.FileInfo]::new($filePath).Length) bytes)"
} else {
    Write-Output "Anchor not found"
}
