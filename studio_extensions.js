/**
 * STUDIO EXTENSIONS FOR KORAN HIFZ MASTER
 * 1. App Background Themes & Luxury 3D Islamic Wallpapers
 * 2. Guaranteed Real-Time Interactive Medina Mushaf Highlighting (Inline + Animated CSS)
 * 3. Deep Multi-Paragraph Scholarly German Tafsir Engine (Ibn Kathir, As-Sa'di, Einfache Erklärung)
 * 4. Word-by-Word Color Matched Translations
 * 5. Tab 3 Recitation Page Navigation & Search (1-604)
 * 6. Direct Unified Hifz Marking & Al-Fatiha Pre-population
 * 7. Dedicated Repetition Studio (Murādscha'ah with 3.5s Recitation Pauses)
 */

'use strict';

// ============================================================
// 1. THEMES & COLOR STYLES
// ============================================================
const MENU_THEMES = {
  gold: {
    primary: '#e5b84c',
    light: '#fef08a',
    subtle: 'rgba(229, 184, 76, 0.22)',
    border: 'rgba(229, 184, 76, 0.45)',
    accent: '#10b981'
  },
  emerald: {
    primary: '#10b981',
    light: '#a7f3d0',
    subtle: 'rgba(16, 185, 129, 0.22)',
    border: 'rgba(16, 185, 129, 0.45)',
    accent: '#34d399'
  },
  cyan: {
    primary: '#06b6d4',
    light: '#a5f3fc',
    subtle: 'rgba(6, 182, 212, 0.22)',
    border: 'rgba(6, 182, 212, 0.45)',
    accent: '#38bdf8'
  },
  ruby: {
    primary: '#f43f5e',
    light: '#fecdd3',
    subtle: 'rgba(244, 63, 94, 0.22)',
    border: 'rgba(244, 63, 94, 0.45)',
    accent: '#fb7185'
  },
  amethyst: {
    primary: '#a855f7',
    light: '#f3e8ff',
    subtle: 'rgba(168, 85, 247, 0.22)',
    border: 'rgba(168, 85, 247, 0.45)',
    accent: '#c084fc'
  }
};

function changeMenuAccentTheme(themeName) {
  const theme = MENU_THEMES[themeName] || MENU_THEMES.gold;
  const root = document.documentElement;
  root.style.setProperty('--gold-primary', theme.primary);
  root.style.setProperty('--gold-light', theme.light);
  root.style.setProperty('--gold-subtle', theme.subtle);
  root.style.setProperty('--gold-border', theme.border);
  root.style.setProperty('--accent-color', theme.accent);
  
  localStorage.setItem('userMenuTheme', themeName);
  const select = document.getElementById('menuThemeSelect');
  if (select) select.value = themeName;
  showToast(`Menü-Farbe: ${themeName} aktiviert ✨`);
}

function changeAppBackgroundTheme(theme) {
  document.body.className = `theme-${theme}`;
  localStorage.setItem('userAppTheme', theme);
  const select = document.getElementById('appThemeSelect');
  if (select) select.value = theme;
  showToast(`App-Design: ${theme} aktiviert ✨`);
}

function changeMushafColorTheme(theme) {
  const container = document.querySelector('.mushaf-screen-container');
  if (container) {
    container.className = `mushaf-screen-container mushaf-theme-${theme}`;
  }
  localStorage.setItem('userMushafTheme', theme);
  const select = document.getElementById('mushafThemeSelect');
  if (select) select.value = theme;
  
  if (typeof renderInteractiveMushafPage === 'function') {
    renderInteractiveMushafPage();
  }
  showToast(`Muṣḥaf-Farbe: ${theme} aktiviert 📖`);
}

function initThemePreferences() {
  const savedApp = localStorage.getItem('userAppTheme') || 'fantasy';
  changeAppBackgroundTheme(savedApp);
  const savedMushaf = localStorage.getItem('userMushafTheme') || 'gold';
  changeMushafColorTheme(savedMushaf);
  const savedMenu = localStorage.getItem('userMenuTheme') || 'gold';
  changeMenuAccentTheme(savedMenu);
}

// ============================================================
// 2. INTERACTIVE MEDINA MUSHAF PAGE & GUARANTEED HIGHLIGHTING
// ============================================================
let mushafDisplayMode = 'interactive';

function setMushafDisplayMode(mode) {
  mushafDisplayMode = mode;
  const interStage = document.getElementById('mushafInteractiveStage');
  const scanStage = document.getElementById('mushafBookStage');
  const btnInter = document.getElementById('viewModeInteractiveBtn');
  const btnScan = document.getElementById('viewModeScanBtn');

  if (interStage) interStage.style.display = (mode === 'interactive') ? 'block' : 'none';
  if (scanStage) scanStage.style.display = (mode === 'scan') ? 'flex' : 'none';
  if (btnInter) btnInter.classList.toggle('active', mode === 'interactive');
  if (btnScan) btnScan.classList.toggle('active', mode === 'scan');

  if (mode === 'interactive') {
    renderInteractiveMushafPage();
  } else {
    renderMushafScanSheets();
  }
}

function getJuzNumberForPage(p) {
  if (!p || p <= 21) return 1;
  return Math.min(30, Math.floor((p - 2) / 20) + 1);
}

function renderInteractiveMushafPage() {
  const container = document.getElementById('mushafInteractiveContent');
  if (!container) return;

  const toAr = (typeof toArabicDigits === 'function') 
    ? toArabicDigits 
    : (n) => String(n).replace(/\d/g, d => "٠١٢٣٤٥٦٧٨٩"[d]);

  if (!currentVersesData || currentVersesData.length === 0) {
    container.innerHTML = `
      <div class="mushaf-page-card" style="display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:420px; text-align:center;">
        <div style="font-size: 1.35rem; color: #b45309; font-weight: 800; margin-bottom: 10px;">
          📖 Seite ${currentPage} (${toAr(currentPage)}) wird geladen...
        </div>
        <div style="color: #64748b; font-size: 0.95rem;">
          Bitte warten...
        </div>
      </div>
    `;
    return;
  }

  const firstVerse = currentVersesData[0];
  const surahNum = firstVerse.surahNum || currentSurah || 1;
  const rawMeta = (typeof ALL_114_SURAHS !== 'undefined' && ALL_114_SURAHS[surahNum - 1]) 
    ? ALL_114_SURAHS[surahNum - 1] 
    : null;

  const surahMeta = {
    nameAr: (rawMeta && rawMeta.arabic) || firstVerse.surahAr || 'سورة',
    nameDe: (rawMeta && (rawMeta.germanMeaning ? `${rawMeta.name} (${rawMeta.germanMeaning})` : rawMeta.name)) || firstVerse.surahDe || '',
    type: (rawMeta && rawMeta.revelation) || 'Mekkanisch',
    ayahsCount: (rawMeta && (rawMeta.versesCount || rawMeta.totalVerses)) || ''
  };

  const juzNum = (typeof getJuzNumberForPage === 'function') ? getJuzNumberForPage(currentPage) : (firstVerse.juz || 1);

  let html = `
    <div class="mushaf-page-card">
      
      <!-- Top Medina Header Bar -->
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid rgba(197, 155, 39, 0.4); padding-bottom: 8px; margin-bottom: 16px; font-size: 0.95rem; font-weight: 700;">
        <span style="font-family: var(--quran-font); font-size: 1.15rem; color: #8c6d1f;">
          الجزء ${toAr(juzNum)}
        </span>
        <span style="font-family: var(--ui-font); font-size: 0.95rem; letter-spacing: 1px; color: #8c6d1f; font-weight: 800;">
          — ${currentPage} —
        </span>
        <span style="font-family: var(--quran-font); font-size: 1.15rem; color: #8c6d1f;">
          سورة ${surahMeta.nameAr}
        </span>
      </div>

      <!-- Flowing Quran Text with Inline Ornate Headers & Clickable Verses -->
      <div class="mushaf-page-text-flow" style="font-family: var(--quran-font); font-size: 1.95rem; line-height: 2.45; direction: rtl; text-align: justify; text-align-last: center;">
  `;

  let lastRenderedSurah = null;

  currentVersesData.forEach((v, idx) => {
    // If a new Surah starts on this verse (or verse 1), render ornate header and bismillah
    if (v.num === 1 && lastRenderedSurah !== v.surahNum) {
      lastRenderedSurah = v.surahNum;
      const sRaw = (typeof ALL_114_SURAHS !== 'undefined' && ALL_114_SURAHS[v.surahNum - 1]) ? ALL_114_SURAHS[v.surahNum - 1] : null;
      const sAr = (sRaw && sRaw.arabic) || v.surahAr || 'سورة';
      const sDe = (sRaw && (sRaw.germanMeaning ? `${sRaw.name} (${sRaw.germanMeaning})` : sRaw.name)) || v.surahDe || '';
      const sCount = (sRaw && (sRaw.versesCount || sRaw.totalVerses)) || '';
      const sType = (sRaw && sRaw.revelation) || 'Mekkanisch';
      const showBismillah = (v.surahNum !== 9 && v.surahNum !== 1);

      html += `
        <div class="mushaf-surah-ornate-header" style="margin: 16px 0 10px 0;">
          سُورَةُ ${sAr}
          <div style="font-size: 0.85rem; font-family: var(--ui-font); font-weight: 600; opacity: 0.9; margin-top: 2px;">
            ${sDe} · ${sCount} Verse · ${sType}
          </div>
        </div>
      `;

      if (showBismillah) {
        html += `
          <div class="mushaf-bismillah-ornate" style="margin-bottom: 14px;">
            بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ
          </div>
        `;
      }
    }

    const isActive = (idx === currentVerseIdx);
    const isMemorized = (typeof isVerseMemorized === 'function') ? isVerseMemorized(v.surahNum, v.num) : false;
    const starBadge = isMemorized ? '<span style="color: #10b981; font-size: 1rem; margin-right: 2px;" title="Auswendig gelernt!"><i class="fa-solid fa-star"></i></span>' : '';
    
    let verseText = (typeof cleanQuranText === 'function') ? cleanQuranText(v.ar) : v.ar;
    if (v.num === 1 && v.surahNum !== 1) {
      verseText = verseText.replace(/^بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ\s*/, '');
    }

    html += `
      <span class="mushaf-interactive-verse ${isActive ? 'active-mushaf-highlight' : ''}" 
            id="mushaf-verse-${idx}" 
            data-idx="${idx}"
            onclick="selectAndPlayMushafVerse(${idx})" 
            title="Klicken zum Abspielen & Lernen (Vers ${v.surahNum}:${v.num})">
        ${verseText}
        <span class="ayah-rosette">﴿${toAr(v.num)}﴾</span>${starBadge}
      </span>
    `;
  });

  html += `
      </div>

      <!-- Bottom Page Number -->
      <div style="text-align: center; margin-top: 20px; border-top: 1.5px solid rgba(197, 155, 39, 0.3); padding-top: 10px; font-family: var(--quran-font); font-size: 1.35rem; color: #8c6d1f;">
        ${toAr(currentPage)}
      </div>

    </div>
  `;

  container.innerHTML = html;
  updateInteractiveMushafHighlight();
}

function selectAndPlayMushafVerse(idx) {
  if (!currentVersesData || !currentVersesData[idx]) return;
  currentVerseIdx = idx;

  updateInteractiveMushafHighlight();
  playVerseAt(idx);
  updateActiveAyahHifzBtnState();
}

function updateInteractiveMushafHighlight() {
  const verses = document.querySelectorAll('.mushaf-interactive-verse');
  if (!verses || verses.length === 0) return;

  verses.forEach((el, i) => {
    const isCur = (i === currentVerseIdx);
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

// Hook audio player directly to highlight the reciting verse
if (typeof audio !== 'undefined' && audio) {
  audio.addEventListener('play', () => {
    updateInteractiveMushafHighlight();
  });
  audio.addEventListener('timeupdate', () => {
    updateInteractiveMushafHighlight();
  });
}

// ============================================================
// 3. RECITATION PAGE NAVIGATION & SEARCH (TAB 3)
// ============================================================
function turnRecitePage(delta) {
  const targetPage = Math.min(604, Math.max(1, currentPage + delta));
  if (targetPage === currentPage) return;
  currentPage = targetPage;
  loadPage(currentPage);
  const input = document.getElementById('recitePageSearchInput');
  if (input) input.value = targetPage;
  showToast(`Seite ${targetPage} geöffnet zum Rezitieren!`);
}

function jumpReciteToPage() {
  const input = document.getElementById('recitePageSearchInput');
  if (!input) return;
  const p = parseInt(input.value, 10);
  if (isNaN(p) || p < 1 || p > 604) {
    showToast("Bitte eine Seitenzahl zwischen 1 und 604 eingeben.");
    return;
  }
  currentPage = p;
  loadPage(currentPage);
  showToast(`Seite ${p} aufgeschlagen!`);
}


// ============================================================
// 4. SCHOLARLY MULTI-SECTION GERMAN TAFSIR (TAB 4)
// ============================================================
let activeTafsirEdition = 'all';
let currentTafsirSurah = 1;
let currentTafsirAyah = 1;
let tafsirViewScope = 'surah';

const SURAH_VERSES_CACHE = {};
window.getVersesForSurah = function(surahNum) {
  surahNum = parseInt(surahNum, 10);
  if (!surahNum || isNaN(surahNum)) surahNum = 1;
  if (SURAH_VERSES_CACHE[surahNum] && SURAH_VERSES_CACHE[surahNum].length > 0) {
    return SURAH_VERSES_CACHE[surahNum];
  }
  const list = [];
  if (typeof QURAN_ALL_PAGES !== 'undefined') {
    for (let p = 1; p <= 604; p++) {
      const pageVerses = QURAN_ALL_PAGES[p];
      if (!pageVerses) continue;
      for (let i = 0; i < pageVerses.length; i++) {
        if (pageVerses[i].surahNum === surahNum) {
          list.push(pageVerses[i]);
        }
      }
    }
  }
  SURAH_VERSES_CACHE[surahNum] = list;
  return list;
};

window.selectTafsirEdition = function(edition) {
  activeTafsirEdition = edition;
  const pillIds = ['tafsirBtnAll', 'tafsirBtnIbnKathir', 'tafsirBtnSaddi', 'tafsirBtnZaidan', 'tafsirBtnSimple'];
  pillIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
  });
  const map = {
    'all': 'tafsirBtnAll',
    'ibnkathir': 'tafsirBtnIbnKathir',
    'saddi': 'tafsirBtnSaddi',
    'zaidan': 'tafsirBtnZaidan',
    'simple': 'tafsirBtnSimple'
  };
  const activeBtn = document.getElementById(map[edition]);
  if (activeBtn) activeBtn.classList.add('active');

  renderTafsirView();
  showToast(Tafsīr ausgewählt: );
};

window.onTafsirSurahChange = function(surahNum) {
  currentTafsirSurah = parseInt(surahNum, 10) || 1;
  currentTafsirAyah = 1;
  updateTafsirAyahDropdown();
  renderTafsirView();
};

window.onTafsirAyahChange = function(ayahNum) {
  currentTafsirAyah = parseInt(ayahNum, 10) || 1;
  if (tafsirViewScope === 'single') {
    renderTafsirView();
  } else {
    const targetBox = document.getElementById(	afsir-box--);
    if (targetBox) {
      targetBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      targetBox.style.transition = 'box-shadow 0.4s ease, border-color 0.4s ease';
      targetBox.style.borderColor = '#10b981';
      targetBox.style.boxShadow = '0 0 25px rgba(16, 185, 129, 0.6)';
      setTimeout(() => {
        targetBox.style.borderColor = '';
        targetBox.style.boxShadow = '';
      }, 2500);
    }
  }
};

window.stepTafsirAyah = function(delta) {
  const verses = getVersesForSurah(currentTafsirSurah);
  const max = verses.length || 7;
  let newAyah = currentTafsirAyah + delta;
  if (newAyah < 1) newAyah = 1;
  if (newAyah > max) newAyah = max;
  currentTafsirAyah = newAyah;
  const ayahSel = document.getElementById('tafsirAyahSelect');
  if (ayahSel) ayahSel.value = newAyah;
  onTafsirAyahChange(newAyah);
};

window.jumpToTafsirAyahNumber = function() {
  const inp = document.getElementById('tafsirAyahQuickInput');
  if (!inp || !inp.value) return;
  const num = parseInt(inp.value, 10);
  const verses = getVersesForSurah(currentTafsirSurah);
  const max = verses.length || 7;
  if (isNaN(num) || num < 1 || num > max) {
    showToast(Bitte eine Zahl zwischen 1 und  eingeben.);
    return;
  }
  currentTafsirAyah = num;
  const ayahSel = document.getElementById('tafsirAyahSelect');
  if (ayahSel) ayahSel.value = num;
  onTafsirAyahChange(num);
};

window.setTafsirViewScope = function(scope) {
  tafsirViewScope = scope;
  const btnSingle = document.getElementById('tafsirScopeSingle');
  const btnSurah = document.getElementById('tafsirScopeSurah');
  if (btnSingle) btnSingle.classList.toggle('active', scope === 'single');
  if (btnSurah) btnSurah.classList.toggle('active', scope === 'surah');
  renderTafsirView();
};

function updateTafsirAyahDropdown() {
  const ayahSel = document.getElementById('tafsirAyahSelect');
  if (!ayahSel) return;
  ayahSel.innerHTML = '';
  const verses = getVersesForSurah(currentTafsirSurah);
  const count = verses.length || 7;
  for (let i = 1; i <= count; i++) {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = Vers ;
    ayahSel.appendChild(opt);
  }
  ayahSel.value = currentTafsirAyah;
}

window.renderTafsirView = function() {
  const container = document.getElementById('tafsirContentContainer');
  if (!container) return;
  container.innerHTML = '';

  const surahSel = document.getElementById('tafsirSurahSelect');
  if (surahSel && surahSel.value) {
    currentTafsirSurah = parseInt(surahSel.value, 10) || (typeof currentSurah !== 'undefined' ? currentSurah : 1);
  } else if (typeof currentSurah !== 'undefined') {
    currentTafsirSurah = currentSurah;
    if (surahSel) surahSel.value = currentTafsirSurah;
  }

  const ayahSel = document.getElementById('tafsirAyahSelect');
  if (ayahSel && ayahSel.options.length === 0) {
    updateTafsirAyahDropdown();
  }

  const surahVerses = getVersesForSurah(currentTafsirSurah);
  let versesToRender = [];

  if (tafsirViewScope === 'single') {
    const singleV = surahVerses.find(v => v.num === currentTafsirAyah) || surahVerses[0];
    if (singleV) versesToRender = [singleV];
  } else {
    // Entire Surah: render all verses so user can scroll down through all verses!
    versesToRender = surahVerses;
  }

  if (!versesToRender || versesToRender.length === 0) {
    versesToRender = currentVersesData || [];
  }

  if (versesToRender.length === 0) {
    container.innerHTML = '<div style="text-align: center; color: var(--gold-light); padding: 30px;">Tafsīr wird vorbereitet...</div>';
    return;
  }

  versesToRender.forEach((v) => {
    const box = document.createElement('div');
    box.id = 	afsir-box--;
    box.style.marginBottom = '24px';

    if (typeof renderScholarlyGermanTafsirHtml === 'function') {
      box.innerHTML = renderScholarlyGermanTafsirHtml(v.surahNum, v.num, v.ar, v.de, '', activeTafsirEdition);
    } else {
      box.innerHTML = 
        <div style="background: var(--bg-card); border: 1px solid var(--gold-border); border-radius: 18px; padding: 22px;">
          <h3 style="color: var(--gold-light);">Sure :</h3>
          <p style="color: #f1f5f9;"></p>
        </div>
      ;
    }

    container.appendChild(box);
  });
};


// ============================================================
// 5. WORD-BY-WORD INTEGRATION (TAB 2 - VERS- & WORT-STUDIO)
// ============================================================
let wordStudioDisplayMode = 'wbw'; // 'wbw' (Wort-für-Wort) or 'full' (Gesamte Verse)
let wordStudioScope = 'page';       // 'page' (Aktuelle Seite) or 'surah' (Gesamte Sure)

window.setWordStudioMode = function(mode) {
  wordStudioDisplayMode = mode;
  const btnWbw = document.getElementById('wbwModeWordsBtn');
  const btnFull = document.getElementById('wbwModeFullBtn');
  if (btnWbw) btnWbw.classList.toggle('active', mode === 'wbw');
  if (btnFull) btnFull.classList.toggle('active', mode === 'full');
  renderVerseCards();
  showToast(mode === 'wbw' ? 'Wort-für-Wort Farbanalyse aktiviert 🔤' : 'Gesamte Verse-Ansicht aktiviert 📜');
};

window.setWordStudioScope = function(scope) {
  wordStudioScope = scope;
  const btnPage = document.getElementById('wbwScopePageBtn');
  const btnSurah = document.getElementById('wbwScopeSurahBtn');
  if (btnPage) btnPage.classList.toggle('active', scope === 'page');
  if (btnSurah) btnSurah.classList.toggle('active', scope === 'surah');
  renderVerseCards();
  showToast(scope === 'page' ? 'Verse der aktuellen Seite geladen 📖' : 'Alle Verse der gesamten Sure geladen 📜');
};

window.renderVerseCards = function() {
  const container = document.getElementById('versesContainer') || document.getElementById('verseCardsList');
  if (!container) return;
  container.innerHTML = '';

  let list = [];
  if (wordStudioScope === 'surah') {
    list = (typeof getVersesForSurah === 'function') ? getVersesForSurah(currentSurah || 1) : (currentVersesData || []);
  } else {
    list = (currentVersesData && currentVersesData.length > 0) 
      ? currentVersesData 
      : ((typeof getVersesForSurah === 'function') ? getVersesForSurah(currentSurah || 1) : []);
  }

  if (!list || list.length === 0) {
    container.innerHTML = '<div style="text-align: center; color: var(--gold-light); padding: 30px;">Verse werden vorbereitet...</div>';
    return;
  }

  list.forEach((v, idx) => {
    const isMemorized = isVerseMemorized(v.surahNum, v.num);
    const card = document.createElement('div');
    card.className = erse-card ;
    card.id = erse-card-;
    card.style.cssText = "background: var(--bg-card); border: 1.5px solid var(--gold-border); border-radius: 18px; padding: 22px; margin-bottom: 18px; box-shadow: 0 8px 24px rgba(0,0,0,0.4);";

    let wbwSectionHtml = '';
    if (wordStudioDisplayMode === 'wbw') {
      const wbwPairs = (typeof getWordByWordPairs === 'function') 
        ? getWordByWordPairs(v.surahNum, v.num, v.ar, v.de) 
        : [];
      const wbwHtml = (typeof renderWordByWordHtml === 'function') 
        ? renderWordByWordHtml(wbwPairs, ${v.surahNum}-) 
        : '';
      wbwSectionHtml = 
        <div style="margin: 16px 0; background: rgba(0,0,0,0.35); border: 1px solid rgba(229,184,76,0.2); border-radius: 14px; padding: 16px;">
          <div style="font-size: 0.82rem; font-weight: 800; color: var(--gold-light); text-transform: uppercase; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
            <i class="fa-solid fa-palette" style="color: #38bdf8;"></i> Wort-für-Wort Farbabstimmung (Arabisch ↔ Deutsch):
          </div>
          
        </div>
      ;
    }

    card.innerHTML = 
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(229,184,76,0.25); padding-bottom: 12px; margin-bottom: 14px; flex-wrap: wrap; gap: 10px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="background: rgba(229,184,76,0.18); color: var(--gold-light); font-weight: 800; padding: 4px 14px; border-radius: 12px; font-size: 0.9rem; border: 1px solid var(--gold-border);">
            Sure  · Vers 
          </span>
          
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="action-btn" onclick="toggleVerseMemorized(, , this)" style="padding: 6px 14px;" title="Gelernt-Status ändern">
            <i class="fa-solid fa-star" style="color: ;"></i>
          </button>
          <button class="action-btn" onclick="jumpToAndPlayVerse(, )" style="padding: 6px 14px; font-weight: 700;">
            <i class="fa-solid fa-play"></i> Anhören
          </button>
          <button class="action-btn" onclick="setRepeatCount(5, null); jumpToAndPlayVerse(, );" style="padding: 6px 14px;">
            <i class="fa-solid fa-repeat"></i> 5×
          </button>
        </div>
      </div>

      <!-- Vollständiger arabischer Vers -->
      <div style="font-family: var(--quran-font); font-size: 2.1rem; color: #fef08a; direction: rtl; text-align: right; line-height: 2.3; margin-bottom: 16px;">
        
        <span style="font-size: 1.4rem; color: var(--gold-primary);">﴿﴾</span>
      </div>

      <!-- Wort-für-Wort-Bereich (falls Modus wbw aktiv) -->
      

      <!-- Deutsche Übersetzung -->
      <div style="background: rgba(0,0,0,0.25); border-left: 3px solid var(--gold-primary); border-radius: 8px; padding: 12px 16px;">
        <div style="font-size: 0.78rem; text-transform: uppercase; font-weight: 800; color: var(--gold-light); margin-bottom: 4px;">
          <i class="fa-solid fa-book-quran"></i> Deutsche Übersetzung (Bubenheim &amp; Elyas):
        </div>
        <div style="font-size: 1.02rem; color: #f1f5f9; line-height: 1.7;">
          
        </div>
      </div>
    ;

    container.appendChild(card);
  });
};


// ============================================================
// 6. HIFZ MARKING (TAB 5)
// ============================================================
function isVerseMemorized(surah, ayah) {
  const key = hifz_;
  const stored = JSON.parse(localStorage.getItem(key) || '{}');
  return !!stored[ayah];
}

function initDefaultMemorizedVerses() {
  // Clean start - only what user marks is stored
}

function updateActiveAyahHifzBtnState() {
  const btn = document.getElementById('activeAyahMarkHifzBtn');
  const icon = document.getElementById('activeAyahHifzIcon');
  const label = document.getElementById('activeAyahHifzBtnLabel');
  if (!btn || !currentVersesData || !currentVersesData[currentVerseIdx]) return;

  const v = currentVersesData[currentVerseIdx];
  const isMem = isVerseMemorized(v.surahNum, v.num);

  if (isMem) {
    btn.style.background = '#10b981';
    btn.style.borderColor = '#10b981';
    btn.style.color = '#000000';
    if (icon) icon.className = 'fa-solid fa-check-double';
    if (label) label.textContent = 'Bereits gelernt! (Klicken zum Entfernen)';
  } else {
    btn.style.background = 'rgba(16, 185, 129, 0.22)';
    btn.style.borderColor = '#10b981';
    btn.style.color = '#6ee7b7';
    if (icon) icon.className = 'fa-solid fa-star';
    if (label) label.textContent = 'Als auswendig gelernt markieren';
  }
}

function toggleActiveAyahMemorized(specificIdx) {
  const idx = (specificIdx !== undefined) ? specificIdx : currentVerseIdx;
  if (!currentVersesData || !currentVersesData[idx]) return;
  const v = currentVersesData[idx];

  const key = hifz_;
  const stored = JSON.parse(localStorage.getItem(key) || '{}');
  if (stored[v.num]) {
    delete stored[v.num];
    showToast(Sure , Vers  aus gelernten Versen entfernt.);
  } else {
    stored[v.num] = true;
    showToast(MāshāAllāh! Sure , Vers  als auswendig gelernt markiert! ⭐);
  }
  localStorage.setItem(key, JSON.stringify(stored));

  if (typeof updateMemorizedCounter === 'function') updateMemorizedCounter();
  updateActiveAyahHifzBtnState();
  if (typeof renderAyahPills === 'function') renderAyahPills();
  if (typeof renderInteractiveMushafPage === 'function') renderInteractiveMushafPage();
  if (typeof renderMemorizedArchiveView === 'function') renderMemorizedArchiveView();
  if (typeof renderVerseCards === 'function') renderVerseCards();
}

window.toggleVerseMemorized = function(surah, ayah, btn) {
  const key = hifz_;
  const stored = JSON.parse(localStorage.getItem(key) || '{}');
  if (stored[ayah]) {
    delete stored[ayah];
    showToast(Sure , Vers  entfernt.);
  } else {
    stored[ayah] = true;
    showToast(MāshāAllāh! Sure , Vers  als gelernt markiert! ⭐);
  }
  localStorage.setItem(key, JSON.stringify(stored));
  if (typeof updateMemorizedCounter === 'function') updateMemorizedCounter();
  updateActiveAyahHifzBtnState();
  if (typeof renderAyahPills === 'function') renderAyahPills();
  if (typeof renderInteractiveMushafPage === 'function') renderInteractiveMushafPage();
  if (typeof renderMemorizedArchiveView === 'function') renderMemorizedArchiveView();
  if (typeof renderVerseCards === 'function') renderVerseCards();
};

window.toggleMemorizeVerse = window.toggleVerseMemorized;

function quickAddMemorizedVerse() {
  const surahInput = document.getElementById('quickAddSurahInput');
  const ayahInput = document.getElementById('quickAddAyahInput');
  if (!surahInput || !ayahInput) return;

  const s = parseInt(surahInput.value, 10);
  const a = parseInt(ayahInput.value, 10);

  if (isNaN(s) || s < 1 || s > 114) {
    showToast("Ungültige Sure (1–114)");
    return;
  }
  if (isNaN(a) || a < 1) {
    showToast("Ungültiger Vers");
    return;
  }

  const key = hifz_;
  const stored = JSON.parse(localStorage.getItem(key) || '{}');
  stored[a] = true;
  localStorage.setItem(key, JSON.stringify(stored));

  showToast(MāshāAllāh! Sure , Vers  zu deinen gelernten Versen hinzugefügt! ⭐);
  if (typeof updateMemorizedCounter === 'function') updateMemorizedCounter();
  if (typeof renderMemorizedArchiveView === 'function') renderMemorizedArchiveView();
  updateActiveAyahHifzBtnState();
  if (typeof renderInteractiveMushafPage === 'function') renderInteractiveMushafPage();
}


// ============================================================
// 7. DEDICATED REPETITION STUDIO (TAB 6 - MURĀDSCHA'AH)
// ============================================================
let repeatStudioQueue = [];
let repeatStudioQueueIdx = 0;
let repeatStudioLoopTarget = 3;
let repeatStudioCurrentLoop = 1;
let isRepeatStudioPlaying = false;
let repeatStudioPauseSeconds = 3.5;
let repeatStudioPauseTimer = null;

function setRepeatStudioLoop(n, btn) {
  repeatStudioLoopTarget = n;
  document.querySelectorAll('.dock-repeat-btn, .loop-pill-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const badge = document.getElementById('repeatLoopProgressBadge') || document.getElementById('repeatLoopBadge');
  if (badge) badge.textContent = (n === 9999 || n === 999) ? '∞' : ${n}×;
  showToast(Wiederholungen pro Vers: );
}

function updateRepeatQueue() {
  const typeSelect = document.getElementById('repeatSourceSelect') || document.getElementById('repeatQueueTypeSelect');
  const type = typeSelect ? typeSelect.value : 'surah_memorized';

  const surahSelect = document.getElementById('repeatSurahSelect');
  const targetSurah = surahSelect ? (parseInt(surahSelect.value, 10) || currentSurah || 1) : (currentSurah || 1);

  repeatStudioQueue = [];

  if (type === 'surah_memorized') {
    // Only verses of this Surah that the user marked/checked
    const surahVerses = getVersesForSurah(targetSurah);
    const filtered = surahVerses.filter(v => isVerseMemorized(v.surahNum, v.num));
    if (filtered.length > 0) {
      repeatStudioQueue = filtered.map(v => ({
        surahNum: v.surahNum,
        num: v.num,
        ar: v.ar,
        de: v.de,
        audio: getAudioUrl(v.surahNum, v.num)
      }));
    } else {
      // Automatic friendly fallback to all verses so studio is NEVER empty
      repeatStudioQueue = surahVerses.map(v => ({
        surahNum: v.surahNum,
        num: v.num,
        ar: v.ar,
        de: v.de,
        audio: getAudioUrl(v.surahNum, v.num)
      }));
    }
  } else if (type === 'memorized') {
    // All memorized verses in entire Quran
    const list = (typeof getAllMemorizedVersesList === 'function') ? getAllMemorizedVersesList() : [];
    if (list.length > 0) {
      repeatStudioQueue = list.map(item => {
        const s = item.surahNum || item.surah;
        const n = item.num || item.ayah;
        const allV = getVersesForSurah(s);
        const match = allV.find(v => v.num === n);
        return {
          surahNum: s,
          num: n,
          ar: match ? match.ar : Sure , Vers ,
          de: match ? match.de : '',
          audio: getAudioUrl(s, n)
        };
      });
    }
  } else if (type === 'surah_all' || type === 'surah') {
    // All verses of this Surah
    const surahVerses = getVersesForSurah(targetSurah);
    repeatStudioQueue = surahVerses.map(v => ({
      surahNum: v.surahNum,
      num: v.num,
      ar: v.ar,
      de: v.de,
      audio: getAudioUrl(v.surahNum, v.num)
    }));
  } else if (type === 'page') {
    // Current Mushaf page
    if (currentVersesData && currentVersesData.length > 0) {
      repeatStudioQueue = currentVersesData.map(v => ({
        surahNum: v.surahNum,
        num: v.num,
        ar: v.ar,
        de: v.de,
        audio: v.audio || getAudioUrl(v.surahNum, v.num)
      }));
    }
  }

  if (repeatStudioQueue.length === 0) {
    const fallbackVerses = getVersesForSurah(targetSurah);
    repeatStudioQueue = fallbackVerses.map(v => ({
      surahNum: v.surahNum,
      num: v.num,
      ar: v.ar,
      de: v.de,
      audio: getAudioUrl(v.surahNum, v.num)
    }));
  }

  repeatStudioQueueIdx = 0;
  repeatStudioCurrentLoop = 1;
  renderRepeatStudioDisplay();
}

function renderRepeatStudioDisplay() {
  const totalCountEl = document.getElementById('repeatTotalVersesBadge');
  const posBadge = document.getElementById('repeatQueuePositionBadge') || document.getElementById('repeatVerseInfoBadge');
  const surahNameEl = document.getElementById('repeatCurrentSurahName');
  const arabicEl = document.getElementById('repeatArabicDisplay') || document.getElementById('repeatArabicText');
  const germanEl = document.getElementById('repeatGermanDisplay') || document.getElementById('repeatGermanText');
  const loopCountBadge = document.getElementById('repeatCurrentLoopCounter') || document.getElementById('repeatLoopProgressBadge');

  if (totalCountEl) totalCountEl.textContent = ${repeatStudioQueue.length} Verse;

  if (repeatStudioQueue.length === 0) {
    if (posBadge) posBadge.textContent = 'Bereit';
    if (surahNameEl) surahNameEl.textContent = 'Bereit';
    if (arabicEl) arabicEl.innerHTML = '<span style="color: var(--text-muted); font-size: 1.4rem;">Wiederholungs-Studio ist bereit. Wähle eine Sure oder markiere Verse!</span>';
    if (germanEl) germanEl.textContent = '';
    return;
  }

  const v = repeatStudioQueue[repeatStudioQueueIdx];
  if (posBadge) posBadge.textContent = Vers  von ;
  if (surahNameEl) surahNameEl.textContent = Sure  · Vers ;
  if (arabicEl) {
    const cleanAr = (typeof cleanQuranText === 'function') ? cleanQuranText(v.ar) : v.ar;
    const arDigits = (typeof toArabicDigits === 'function') ? toArabicDigits(v.num) : (typeof toAr === 'function' ? toAr(v.num) : v.num);
    arabicEl.innerHTML = ${cleanAr} <span style="font-size: 1.4rem; color: var(--gold-primary);">﴿﴾</span>;
  }
  if (germanEl) germanEl.textContent = v.de || '';
  if (loopCountBadge) loopCountBadge.textContent = Durchgang  von ;

  // Populate Queue Cards List below player
  const listContainer = document.getElementById('repeatQueueListContainer');
  const countBadge = document.getElementById('repeatQueueListCountBadge');
  if (countBadge) countBadge.textContent = ${repeatStudioQueue.length} Verse;

  if (listContainer) {
    listContainer.innerHTML = '';
    repeatStudioQueue.forEach((item, qIdx) => {
      const isCur = (qIdx === repeatStudioQueueIdx);
      const row = document.createElement('div');
      row.style.cssText = display: flex; justify-content: space-between; align-items: center; padding: 12px 18px; border-radius: 12px; cursor: pointer; transition: all 0.2s; border: 1.5px solid ; background: ;;
      row.onclick = () => {
        repeatStudioQueueIdx = qIdx;
        repeatStudioCurrentLoop = 1;
        renderRepeatStudioDisplay();
        if (isRepeatStudioPlaying) playRepeatStudioCurrent();
      };

      const cleanAr = (typeof cleanQuranText === 'function') ? cleanQuranText(item.ar) : item.ar;
      row.innerHTML = 
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="background: ; color: ; font-weight: 800; padding: 3px 10px; border-radius: 8px; font-size: 0.85rem;">
            
          </span>
          <span style="font-weight: 700; color: #fff; font-size: 0.95rem;">
            Sure  · Vers 
          </span>
        </div>
        <div style="font-family: var(--quran-font); font-size: 1.3rem; color: ; direction: rtl; max-width: 450px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
          
        </div>
      ;
      listContainer.appendChild(row);
    });
  }
}

function toggleRepeatStudioPlay() {
  if (repeatStudioQueue.length === 0) {
    updateRepeatQueue();
    if (repeatStudioQueue.length === 0) {
      showToast("Keine Verse in der Warteschlange. Bitte Verse auswählen.");
      return;
    }
  }

  if (isRepeatStudioPlaying) {
    pauseRepeatStudio();
  } else {
    playRepeatStudioCurrent();
  }
}

function playRepeatStudioCurrent() {
  if (repeatStudioQueue.length === 0) return;
  const v = repeatStudioQueue[repeatStudioQueueIdx];
  isRepeatStudioPlaying = true;

  const btn = document.getElementById('repeatPlayMainBtn') || document.getElementById('repeatPlayBtn');
  const icon = document.getElementById('repeatPlayIcon');
  if (btn) btn.classList.add('active');
  if (icon) {
    icon.className = 'fa-solid fa-pause';
  } else if (btn) {
    btn.innerHTML = '<i class="fa-solid fa-pause"></i> Pausieren';
  }

  audio.src = v.audio || getAudioUrl(v.surahNum, v.num);
  audio.play().catch(e => console.log("Audio notice", e));
  renderRepeatStudioDisplay();
}

function pauseRepeatStudio() {
  isRepeatStudioPlaying = false;
  if (repeatStudioPauseTimer) clearTimeout(repeatStudioPauseTimer);
  audio.pause();

  const btn = document.getElementById('repeatPlayMainBtn') || document.getElementById('repeatPlayBtn');
  const icon = document.getElementById('repeatPlayIcon');
  if (btn) btn.classList.remove('active');
  if (icon) {
    icon.className = 'fa-solid fa-play';
  } else if (btn) {
    btn.innerHTML = '<i class="fa-solid fa-play"></i> Fortsetzen';
  }

  const statusEl = document.getElementById('repeatStatusNotice');
  if (statusEl) statusEl.textContent = 'Pausiert.';
}

function nextRepeatVerse() {
  if (repeatStudioQueue.length === 0) return;
  repeatStudioQueueIdx = (repeatStudioQueueIdx + 1) % repeatStudioQueue.length;
  repeatStudioCurrentLoop = 1;
  renderRepeatStudioDisplay();
  if (isRepeatStudioPlaying) playRepeatStudioCurrent();
}

function prevRepeatVerse() {
  if (repeatStudioQueue.length === 0) return;
  repeatStudioQueueIdx = (repeatStudioQueueIdx - 1 + repeatStudioQueue.length) % repeatStudioQueue.length;
  repeatStudioCurrentLoop = 1;
  renderRepeatStudioDisplay();
  if (isRepeatStudioPlaying) playRepeatStudioCurrent();
}

audio.addEventListener('ended', function() {
  if (currentMainTab === 'repeat' && isRepeatStudioPlaying) {
    const statusEl = document.getElementById('repeatStatusNotice');
    if (statusEl) statusEl.innerHTML = '🎙️ <em>Sprechpause: Sprich den Vers jetzt laut nach... (3,5 Sek.)</em>';

    repeatStudioPauseTimer = setTimeout(() => {
      if (!isRepeatStudioPlaying) return;

      if (repeatStudioCurrentLoop < repeatStudioLoopTarget) {
        repeatStudioCurrentLoop++;
        renderRepeatStudioDisplay();
        playRepeatStudioCurrent();
      } else {
        repeatStudioCurrentLoop = 1;
        repeatStudioQueueIdx = (repeatStudioQueueIdx + 1) % repeatStudioQueue.length;
        renderRepeatStudioDisplay();
        playRepeatStudioCurrent();
      }
    }, repeatStudioPauseSeconds * 1000);
  }
});

// ============================================================
// 8. EXTENDED TAB SWITCHER (ALL 6 TABS)
// ============================================================
window.switchMainTab = function(tabName) {
  currentMainTab = tabName;
  if (typeof currentTab !== 'undefined') currentTab = tabName;

  const tabs = [
    { name: 'mushaf', btn: 'tabMushafBtn', area: 'mushafViewArea' },
    { name: 'hifz', btn: 'tabHifzBtn', area: 'versesViewArea' },
    { name: 'mic', btn: 'tabMicBtn', area: 'micViewArea' },
    { name: 'tafsir', btn: 'tabTafsirBtn', area: 'tafsirViewArea' },
    { name: 'memorized', btn: 'tabMemorizedBtn', area: 'memorizedViewArea' },
    { name: 'repeat', btn: 'tabRepeatBtn', area: 'repeatViewArea' }
  ];

  tabs.forEach(t => {
    const btn = document.getElementById(t.btn);
    const area = document.getElementById(t.area);
    const isActive = (t.name === tabName);

    if (btn) btn.classList.toggle('active', isActive);
    if (area) area.style.display = isActive ? 'block' : 'none';
  });

  if (tabName === 'mushaf') {
    if (mushafDisplayMode === 'interactive') {
      renderInteractiveMushafPage();
    } else {
      renderMushafScanSheets();
    }
  } else if (tabName === 'hifz') {
    renderVerseCards();
  } else if (tabName === 'tafsir') {
    renderTafsirView();
  } else if (tabName === 'memorized') {
    if (typeof renderMemorizedArchiveView === 'function') {
      renderMemorizedArchiveView();
    }
  } else if (tabName === 'repeat') {
    updateRepeatQueue();
  }

  showToast(`Bereich gewechselt: ${tabName}`);
};

// ============================================================
// 9. AUTOMATIC INITIALIZATION
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  initDefaultMemorizedVerses();
  initThemePreferences();
  setTimeout(() => {
    updateActiveAyahHifzBtnState();
    if (mushafDisplayMode === 'interactive') {
      renderInteractiveMushafPage();
    }
  }, 600);
});