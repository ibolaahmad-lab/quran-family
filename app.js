// Clear any outdated WebView caches
try {
  if (window.caches) {
    caches.keys().then(keys => keys.forEach(k => caches.delete(k)));
  }
} catch (e) {}
﻿/**
 * QURAN HIFZ MASTER - PROFESSIONAL ENGINE (app.js)
 * Architecture: Clean, Event-Driven, Fully Offline-Capable
 */

'use strict';

// ============================================================
// 1. APPLICATION STATE
// ============================================================
const state = {
  currentPage: 1,
  currentSurah: 1,
  currentAyahIdx: 0,
  currentVersesData: [],
  activeTab: 'home', // home, mushaf, wordStudio, micTest, tafsir, hifzArchive, repetition
  mushafMode: 'interactive', // 'interactive' or 'scan'
  isDoubleSpread: false,
  isPlaying: false,
  currentIteration: 1,
  repeatTarget: 1,
  qari: 'Alafasy_128kbps',
  speed: 1.0,

  // Word Studio (Tab 2)
  wordStudioMode: 'wbw', // 'wbw' (Wort-für-Wort) or 'full' (Gesamte Verse)
  wordStudioScope: 'page', // 'page' (Aktuelle Seite) or 'surah' (Gesamte Sure)

  // Tafsir Studio (Tab 4)
  tafsirSurah: 1,
  tafsirAyah: 1,
  tafsirEdition: 'all', // 'all', 'ibnkathir', 'saddi', 'zaidan', 'simple'
  tafsirScope: 'surah', // 'surah' or 'single'

  // Repetition Studio (Tab 6)
  repeatSurah: 1,
  repeatMode: 'surah_memorized', // 'surah_memorized', 'memorized', 'surah_all', 'page'
  repeatQueue: [],
  repeatQueueIdx: 0,
  repeatLoopTarget: 3,
  repeatCurrentLoop: 1,
  isRepeatPlaying: false,
  repeatPauseSeconds: 3.5,
  repeatPauseTimer: null,
  tajweedEnabled: true,

  // Independent Playback Controllers (Tab 1 vs Tab 2)
  playbackSource: 'mushaf', // 'mushaf' (Tab 1), 'wordStudio' (Tab 2), 'tafsir' (Tab 4)
  wordStudioPlayingSurah: null,
  wordStudioPlayingAyah: null,
  wordStudioPlayingIdx: 0,
  wordStudioVersesList: [],
  murajaaSelectedSurah: 1,

  // Tarteel AI Suite
  tarteelHifzActive: false,
  revealedAyahs: {},
  tarteelVoiceActive: false
};

// Global Audio Element
const audio = new Audio();
audio.preload = 'auto';

// Offline Audio fallback to Online EveryAyah CDN
audio.addEventListener('error', () => {
  const src = audio.src;
  if (src && src.includes('/audio/')) {
    const match = src.match(/\/audio\/([^\/]+)\/(\d{6})\.mp3/);
    if (match) {
      const q = match[1];
      const fn = match[2];
      audio.src = `https://everyayah.com/data/${q}/${fn}.mp3`;
      audio.play().catch(() => {});
    }
  }
});

// Arabic Digits Formatter
function toArDigits(n) {
  return String(n).replace(/\d/g, d => "٠١٢٣٤٥٦٧٨٩"[d]);
}

// Arabic Juz Name Formatter matching King Fahd Medina Mushaf (Image 1)
function getJuzNameArabic(juz) {
  const names = [
    '', 'الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس',
    'السادس', 'السابع', 'الثامن', 'التاسع', 'العاشر',
    'الحادي عشر', 'الثاني عشر', 'الثالث عشر', 'الرابع عشر', 'الخامس عشر',
    'السادس عشر', 'السابع عشر', 'الثامن عشر', 'التاسع عشر', 'العشرون',
    'الحادي والعشرون', 'الثاني والعشرون', 'الثالث والعشرون', 'الرابع والعشرون', 'الخامس والعشرون',
    'السادس والعشرون', 'السابع والعشرون', 'الثامن والعشرون', 'التاسع والعشرون', 'الثلاثون'
  ];
  return names[juz] ? `الجزء ${names[juz]}` : `الجزء ${toArDigits(juz)}`;
}

// Clean Quran Text (strips BOM, mojibake, zero-width chars and trailing spaces)
function cleanArabicText(text) {
  if (!text) return '';
  let str = String(text)
    .replace(/[\uFEFF\u200B-\u200D]/g, '')
    .replace(/ï»¿/g, '');

  // Automatic mojibake repair if text was mis-encoded as ISO-8859-1/ANSI
  if (/[\u00C0-\u00FF]/.test(str) && /[\u00D8-\u00D9]/.test(str)) {
    try {
      const bytes = new Uint8Array([...str].map(c => c.charCodeAt(0) & 0xff));
      const fixed = new TextDecoder('utf-8').decode(bytes);
      if (fixed && !fixed.includes('\uFFFD')) str = fixed;
    } catch (e) {}
  }

  return str.replace(/\s+/g, ' ').trim();
}
window.cleanQuranText = cleanArabicText;
window.cleanArabicText = cleanArabicText;

// Auto-purge any historical corrupted cache in browser
try {
  for (let s = 1; s <= 114; s++) {
    const k = `quran_tafsir_de_${s}`;
    const raw = localStorage.getItem(k);
    if (raw && (raw.includes('Ø') || raw.includes('Ã') || raw.includes('Ù') || raw.includes('ï»¿') || raw.includes('Â'))) {
      localStorage.removeItem(k);
    }
  }
} catch (e) {}

// Authentic Letter-Level Tajweed Engine matching media_1794774769027_3c5e93ea.jpg
function applyTajweedMarkup(text) {
  if (!text) return '';
  if (!state.tajweedEnabled) return text;

  let out = text;

  // 1. Madd (Red #dc2626) - Letters with Maddah sign (ـٓ / \u0653) or Alif Maddah (آ)
  out = out.replace(/([ء-ي\u0670\u0671\u0627\u0648\u064A]?[\u064B-\u0652]?\u0653[\u064B-\u0652]?|آ)/g, '<span class="tj-madd" title="Madd (مد - 4-6 Harakat)">$1</span>');

  // 2. Ghunnah (Green #16a34a) - Noon (ن) or Meem (م) with Shaddah (ّ)
  out = out.replace(/([نم]\u0651[\u064B-\u0650\u0670]?)/g, '<span class="tj-ghunnah" title="Ghunnah (غنه - 2 Harakat)">$1</span>');

  // 3. Qalqalah (Blue #0284c7) - Letters قطبجد with Sukoon (ْ / \u0652 or \u06E1)
  out = out.replace(/([قطبجد][\u0652\u06E1])/g, '<span class="tj-qalqalah" title="Qalqalah (قلقله)">$1</span>');

  // 4. Iqlab (Purple #9333ea) - Little Meem (ۢ / \u06E2 or ۭ / \u06ED)
  out = out.replace(/([\u06E2\u06ED])/g, '<span class="tj-iqlab" title="Iqlab (اقلاب)">$1</span>');

  // 5. Silent Letters (Muted Gray #94a3b8) - Hamzat Wasl \u0671 or small circle \u06DF
  out = out.replace(/(\u0671|[\u0627\u0648\u064A]\u06DF)/g, '<span class="tj-silent" title="Hamzat Wasl / Stumm">$1</span>');

  return out;
}
window.applyTajweedMarkup = applyTajweedMarkup;

function toggleTajweed() {
  state.tajweedEnabled = !state.tajweedEnabled;
  const btn = document.getElementById('tajweedToggleBtn');
  if (btn) {
    btn.classList.toggle('active', state.tajweedEnabled);
    btn.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> Tajweed: ${state.tajweedEnabled ? 'AN' : 'AUS'}`;
  }
  if (state.activeTab === 'mushaf') renderInteractiveMushaf();
  if (state.activeTab === 'repetition') renderRepetitionDisplay();
  showToast(state.tajweedEnabled ? '🎨 Tajweed-Regeln aktiviert (Rot=Madd, Grün=Ghunnah, Blau=Qalqalah)' : '📖 Reine Uthmān-Kalligraphie aktiviert');
}
window.toggleTajweed = toggleTajweed;

// Audio URL Provider (Local Offline Cache first -> EveryAyah high-quality CDN fallback)
function getAyahAudioUrl(surah, ayah, qariName) {
  const q = qariName || state.qari;
  const sStr = String(surah).padStart(3, '0');
  const aStr = String(ayah).padStart(3, '0');
  if (q === 'Mansour_Al_Salimi') {
    return `https://cdn.mp3quran.net/audio/mansour-salimi/r1/${sStr}.mp3`;
  }
  return `audio/${q}/${sStr}${aStr}.mp3`;
}

// ============================================================
// 2. DATA PROVIDER & CACHE
// ============================================================
const SURAH_CACHE = {};

function getVersesForSurah(surahNum) {
  surahNum = parseInt(surahNum, 10) || 1;
  if (SURAH_CACHE[surahNum] && SURAH_CACHE[surahNum].length > 0) {
    return SURAH_CACHE[surahNum];
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
  SURAH_CACHE[surahNum] = list;
  return list;
}

function getPageVerses(pageNum) {
  pageNum = Math.max(1, Math.min(604, pageNum));
  if (typeof QURAN_ALL_PAGES !== 'undefined' && QURAN_ALL_PAGES[pageNum] && QURAN_ALL_PAGES[pageNum].length > 0) {
    return QURAN_ALL_PAGES[pageNum];
  }
  return [];
}

function getJuzForPage(pageNum) {
  if (pageNum <= 1) return 1;
  if (pageNum <= 21) return 1;
  return Math.min(30, Math.floor((pageNum - 2) / 20) + 1);
}

// ============================================================
// 3. HIFZ STORAGE (BOOKMARKS / MEMORIZED VERSES)
// ============================================================
function isVerseMemorized(surah, ayah) {
  try {
    const data = JSON.parse(localStorage.getItem(`hifz_${surah}`) || '{}');
    return !!data[ayah];
  } catch (e) {
    return false;
  }
}

function toggleVerseMemorized(surah, ayah) {
  try {
    const key = `hifz_${surah}`;
    const data = JSON.parse(localStorage.getItem(key) || '{}');
    const newState = !data[ayah];
    if (newState) {
      data[ayah] = true;
      showToast(`Sure ${surah}, Vers ${ayah} als gelernt markiert! ⭐`);
    } else {
      delete data[ayah];
      showToast(`Sure ${surah}, Vers ${ayah} aus gelernten Versen entfernt.`);
    }
    localStorage.setItem(key, JSON.stringify(data));
    updateHifzCounter();
    refreshAllViewsAfterHifzChange();
    return newState;
  } catch (e) {
    console.error(e);
    return false;
  }
}

function getAllMemorizedVerses() {
  const list = [];
  try {
    for (let k of Object.keys(localStorage)) {
      if (k.startsWith('hifz_')) {
        const sNum = parseInt(k.replace('hifz_', ''), 10);
        if (!isNaN(sNum)) {
          const obj = JSON.parse(localStorage.getItem(k) || '{}');
          for (let aStr of Object.keys(obj)) {
            if (obj[aStr]) {
              list.push({ surahNum: sNum, num: parseInt(aStr, 10) });
            }
          }
        }
      }
    }
  } catch (e) {
    console.error(e);
  }
  list.sort((a, b) => (a.surahNum !== b.surahNum ? a.surahNum - b.surahNum : a.num - b.num));
  return list;
}

function updateHifzCounter() {
  const memList = getAllMemorizedVerses();
  const count = memList.length;
  const percent = ((count / 6236) * 100).toFixed(1);
  const el = document.getElementById('memorizedCountBadge');
  if (el) el.textContent = `${count} / 6236`;
  const elHeader = document.getElementById('headerHifzCount');
  if (elHeader) elHeader.textContent = `${count}`;
  const elPercent = document.getElementById('headerHifzPercent');
  if (elPercent) elPercent.textContent = `${percent}%`;
}

function refreshAllViewsAfterHifzChange() {
  if (state.activeTab === 'mushaf') renderInteractiveMushaf();
  if (state.activeTab === 'wordStudio') renderWordStudio();
  if (state.activeTab === 'hifzArchive') renderHifzArchive();
  if (state.activeTab === 'repetition') updateRepetitionQueue();
}

// ============================================================
// 4. MAIN NAVIGATION & TAB SWITCHER
// ============================================================
function switchTab(tabName) {
  state.activeTab = tabName;

  const tabs = [
    { name: 'home', btn: 'tabBtnHome', pane: 'paneHome' },
    { name: 'mushaf', btn: 'tabBtnMushaf', pane: 'paneMushaf' },
    { name: 'wordStudio', btn: 'tabBtnWordStudio', pane: 'paneWordStudio' },
    { name: 'micTest', btn: 'tabBtnMicTest', pane: 'paneMicTest' },
    { name: 'tafsir', btn: 'tabBtnTafsir', pane: 'paneTafsir' },
    { name: 'hifzArchive', btn: 'tabBtnHifzArchive', pane: 'paneHifzArchive' },
    { name: 'repetition', btn: 'tabBtnRepetition', pane: 'paneRepetition' },
    { name: 'quiz', btn: 'tabBtnQuiz', pane: 'paneQuiz' }
  ];

  tabs.forEach(t => {
    const btn = document.getElementById(t.btn);
    const pane = document.getElementById(t.pane);
    const isActive = (t.name === tabName);
    if (btn) btn.classList.toggle('active', isActive);
    if (pane) pane.style.display = isActive ? 'block' : 'none';
  });

  // Synchronize bottom navigation buttons
  const abnMap = {
    home: 'abnHome',
    mushaf: 'abnMushaf',
    wordStudio: 'abnHifz',
    tafsir: 'abnTafsir'
  };
  ['abnHome', 'abnMushaf', 'abnHifz', 'abnTafsir'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
  });
  if (abnMap[tabName]) {
    const activeAbn = document.getElementById(abnMap[tabName]);
    if (activeAbn) activeAbn.classList.add('active');
  }

  // Lifecycle hooks per tab
  if (tabName === 'home') {
    if (typeof updateDashboardLabels === 'function') updateDashboardLabels();
  } else if (tabName === 'mushaf') {
    if (!state.currentVersesData || state.currentVersesData.length === 0) {
      loadPage(state.currentPage || 1);
    } else {
      if (state.mushafMode === 'interactive') renderInteractiveMushaf();
      else renderFacsimileScan();
    }
  } else if (tabName === 'wordStudio') {
    renderWordStudio();
  } else if (tabName === 'tafsir') {
    renderTafsirStudio();
  } else if (tabName === 'hifzArchive') {
    renderHifzArchive();
  } else if (tabName === 'repetition') {
    updateRepetitionQueue();
  } else if (tabName === 'micTest') {
    initMicTestDisplay();
  } else if (tabName === 'quiz') {
    if (typeof populateMurajaaSurahDropdown === 'function') populateMurajaaSurahDropdown();
    if (typeof setupMurajaaQuestion === 'function') setupMurajaaQuestion();
  }

  if (tabName !== 'home') {
    showToast(`Bereich gewechselt: ${getTabDisplayName(tabName)}`);
  }
}

function getTabDisplayName(tab) {
  const map = {
    mushaf: '📖 Medina Muṣḥaf',
    wordStudio: '🔤 Vers- & Wort-Studio',
    micTest: '🎙️ Rezitations-Test',
    tafsir: '📜 Tafsīr-Studio',
    hifzArchive: '🎓 Hifz-Archiv',
    repetition: '🔁 Wiederholungs-Studio'
  };
  return map[tab] || tab;
}

// ============================================================
// 5. PAGE & SURAH LOADING
// ============================================================
function loadPage(pageNum) {
  state.currentPage = Math.max(1, Math.min(604, pageNum));
  state.currentVersesData = getPageVerses(state.currentPage);
  if (state.currentVersesData && state.currentVersesData.length > 0) {
    const curS = state.currentVersesData[0].surahNum;
    state.currentSurah = curS;
    const mSurahSel = document.getElementById('mushafSurahSelect');
    if (mSurahSel && mSurahSel.value != curS) mSurahSel.value = curS;
  }
  state.currentAyahIdx = 0;
  state.currentIteration = 1;

  if (state.currentVersesData.length > 0) {
    state.currentSurah = state.currentVersesData[0].surahNum;
  }

  // Update Sidebar & Navigation inputs
  const pInput = document.getElementById('pageNumberInput');
  if (pInput) pInput.value = state.currentPage;

  const sSelect = document.getElementById('allSurahsSelect');
  if (sSelect) sSelect.value = state.currentSurah;

  const juzBadge = document.getElementById('sidebarJuzBadge');
  if (juzBadge) juzBadge.textContent = `Juz ${getJuzForPage(state.currentPage)}`;

  // Render Mushaf
  if (state.mushafMode === 'interactive') {
    renderInteractiveMushaf();
  } else {
    renderFacsimileScan();
  }

  updateDockDisplay();
  saveLastBookmark();
}

function turnPage(delta) {
  loadPage(state.currentPage + delta);
}

function onNavSurahChange(surahId) {
  surahId = parseInt(surahId, 10);
  if (typeof ALL_114_SURAHS !== 'undefined') {
    const meta = ALL_114_SURAHS.find(s => s.id === surahId);
    if (meta && meta.startPage) {
      loadPage(meta.startPage);
    }
  }
}

// ============================================================
// 6. TAB 1: MEDINA MUSHAF VIEW (INTERACTIVE & SCAN)
// ============================================================
function setMushafMode(mode) {
  state.mushafMode = mode;
  const btnInter = document.getElementById('mushafModeInterBtn');
  const btnScan = document.getElementById('mushafModeScanBtn');
  const stageInter = document.getElementById('mushafInteractiveStage');
  const stageScan = document.getElementById('mushafScanStage');

  if (btnInter) btnInter.classList.toggle('active', mode === 'interactive');
  if (btnScan) btnScan.classList.toggle('active', mode === 'scan');
  if (stageInter) stageInter.style.display = (mode === 'interactive') ? 'block' : 'none';
  if (stageScan) stageScan.style.display = (mode === 'scan') ? 'block' : 'none';

  if (mode === 'interactive') {
    renderInteractiveMushaf();
  } else {
    renderFacsimileScan();
  }
}

function renderInteractiveMushaf() {
  const stage = document.getElementById('mushafInteractiveStage');
  if (!stage) return;

  if (!state.currentVersesData || state.currentVersesData.length === 0) {
    if (typeof getPageVerses === 'function') {
      state.currentVersesData = getPageVerses(state.currentPage || 1);
    }
  }

  const verses = state.currentVersesData;
  if (!verses || verses.length === 0) {
    stage.innerHTML = `<div style="text-align: center; padding: 50px 20px; color: var(--gold-light);">📖 Seite ${state.currentPage} wird geladen...</div>`;
    loadPage(state.currentPage || 1);
    return;
  }

  const firstV = verses[0];
  const sMeta = (typeof ALL_114_SURAHS !== 'undefined') ? ALL_114_SURAHS.find(s => s.id === firstV.surahNum) : null;
  const juz = getJuzForPage(state.currentPage);

  let html = `
    <!-- Top External Header matching King Fahd Medina Mushaf (RTL Reading Orientation) -->
    <div class="mushaf-external-header" dir="rtl">
      <div class="mushaf-header-surah-tag">سُورَةُ ${sMeta ? sMeta.arabic : ''}</div>
      <div class="mushaf-header-center-stepper" dir="rtl">
        <button onclick="jumpToPage(state.currentPage - 1)" title="Vorherige Seite">►</button>
        <span style="font-weight: 800; min-width: 60px; text-align: center;">Seite ${state.currentPage}</span>
        <button onclick="jumpToPage(state.currentPage + 1)" title="Nächste Seite">◄</button>
      </div>
      <div class="mushaf-header-juz-tag">${getJuzNameArabic(juz)}</div>
    </div>

    <!-- Medina Mushaf Page Card Framed by King Fahd Geometric Border -->
    <div id="mushafPageCard" class="mushaf-page-card mushaf-theme-cream">
      <div class="mushaf-inner-frame">
  `;

  let lastSurah = null;

  verses.forEach((v, idx) => {
    // If verse 1 of a surah, insert authentic surah cartouche banner matching Image 1 & bismillah
    if (v.num === 1 && lastSurah !== v.surahNum) {
      lastSurah = v.surahNum;
      const curMeta = (typeof ALL_114_SURAHS !== 'undefined') ? ALL_114_SURAHS.find(s => s.id === v.surahNum) : null;
      html += `
        <div class="mushaf-surah-cartouche-container">
          <div class="mushaf-surah-banner-art">
            <span class="mushaf-surah-cartouche-title">سُورَةُ ${curMeta ? curMeta.arabic : v.surahAr}</span>
          </div>
        </div>
      `;
      if (v.surahNum !== 1 && v.surahNum !== 9) {
        html += `<div class="mushaf-bismillah">بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ</div>`;
      }
    }

    if (idx === 0) {
      html += `<div class="mushaf-flowing-text">`;
    }

    let verseText = cleanArabicText(v.ar);
    if (v.num === 1 && v.surahNum !== 1) {
      verseText = verseText.replace(/^بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ\s*/, '')
                           .replace(/^بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ\s*/, '')
                           .trim();
    }

    const isCur = (idx === state.currentAyahIdx);
    const isMem = isVerseMemorized(v.surahNum, v.num);
    const starIcon = isMem ? '<i class="fa-solid fa-star star-badge" title="Gelernt"></i>' : '';
    const renderedBody = state.tajweedEnabled ? applyTajweedMarkup(verseText) : verseText;

    // Tarteel Hifz Hide / Reveal State
    const isTarteelHidden = state.tarteelHifzActive && (!state.revealedAyahs || !state.revealedAyahs[idx]);
    const isTarteelRevealed = state.tarteelHifzActive && state.revealedAyahs && state.revealedAyahs[idx];
    const tarteelClass = isTarteelHidden ? 'tarteel-hidden' : (isTarteelRevealed ? 'tarteel-revealed' : '');

    html += `
      <span class="mushaf-ayah-span ${isCur ? 'active-highlight' : ''} ${tarteelClass}" 
            id="mushaf-span-${idx}" 
            onclick="handleAyahMushafClick(${idx})" 
            title="Klicken zum Aufdecken / Abspielen (Sure ${v.surahNum}:${v.num})">
        ${renderedBody}
        <span class="mushaf-rosette">﴿${toArDigits(v.num)}﴾</span>${starIcon}
      </span>
    `;
  });

  html += `
        </div>
      </div>
    </div>

    <!-- Bottom Stepper matching King Fahd Medina Mushaf (RTL Reading Orientation) -->
    <div class="mushaf-external-footer" dir="rtl" style="display: flex; justify-content: center; align-items: center; gap: 18px;">
      <button onclick="jumpToPage(state.currentPage - 1)" title="Vorherige Seite">► Vorherige Seite</button>
      <span style="font-weight: 800; font-size: 1.15rem; color: #10b981;">Seite ${state.currentPage}</span>
      <button onclick="jumpToPage(state.currentPage + 1)" title="Nächste Seite">Nächste Seite ◄</button>
    </div>
  `;

  stage.innerHTML = html;
  highlightActiveAyah();
  updateDockDisplay();
}

// ============================================================
// TARTEEL AI SUITE: HIFZ WHITE WALL & VOICE FOLLOW ALONG
// ============================================================
function handleAyahMushafClick(idx) {
  if (state.tarteelHifzActive) {
    if (!state.revealedAyahs) state.revealedAyahs = {};
    state.revealedAyahs[idx] = true;
    const el = document.getElementById(`mushaf-span-${idx}`);
    if (el) {
      el.classList.remove('tarteel-hidden');
      el.classList.add('tarteel-revealed');
    }
  }
  selectAndPlayAyah(idx);
}
window.handleAyahMushafClick = handleAyahMushafClick;

function toggleTarteelHifz() {
  state.tarteelHifzActive = !state.tarteelHifzActive;
  state.revealedAyahs = {};
  const btn = document.getElementById('tarteelHifzBtn');
  if (btn) {
    btn.classList.toggle('active', state.tarteelHifzActive);
    btn.innerHTML = state.tarteelHifzActive ? 
      '<i class="fa-solid fa-eye"></i> 👁️ Verse verdeckt (Hifz)' : 
      '<i class="fa-solid fa-eye-slash"></i> 👁️ Tarteel Hifz';
  }
  renderInteractiveMushaf();
  showToast(state.tarteelHifzActive ? 
    '👁️ Tarteel Hifz aktiv: Verse verdeckt! Tippen oder rezitieren Sie zum Aufdecken.' : 
    '📖 Alle Verse wieder sichtbar.');
}
window.toggleTarteelHifz = toggleTarteelHifz;

let tarteelSpeechRec = null;

function toggleTarteelVoiceFollow() {
  state.tarteelVoiceActive = !state.tarteelVoiceActive;
  const btn = document.getElementById('tarteelVoiceFollowBtn');
  const wave = document.getElementById('tarteelWaveform');
  
  if (state.tarteelVoiceActive) {
    if (btn) btn.classList.add('active');
    if (wave) wave.style.display = 'flex';
    startTarteelVoiceListening();
    showToast('🎙️ Tarteel KI-Spracherkennung lauscht... Rezitieren Sie!');
  } else {
    if (btn) btn.classList.remove('active');
    if (wave) wave.style.display = 'none';
    stopTarteelVoiceListening();
    showToast('Mikrofon deaktiviert.');
  }
}
window.toggleTarteelVoiceFollow = toggleTarteelVoiceFollow;

function startTarteelVoiceListening() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    showToast('Spracherkennung wird von diesem Browser nicht unterstützt.');
    return;
  }
  if (!tarteelSpeechRec) {
    tarteelSpeechRec = new SpeechRecognition();
    tarteelSpeechRec.lang = 'ar-SA';
    tarteelSpeechRec.continuous = true;
    tarteelSpeechRec.interimResults = true;

    tarteelSpeechRec.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        transcript += event.results[i][0].transcript;
      }
      matchTarteelVoiceToPage(transcript);
    };

    tarteelSpeechRec.onerror = (e) => {
      console.warn('Tarteel voice rec:', e);
    };

    tarteelSpeechRec.onend = () => {
      if (state.tarteelVoiceActive) {
        try { tarteelSpeechRec.start(); } catch(e){}
      }
    };
  }
  try { tarteelSpeechRec.start(); } catch(e){}
}

function stopTarteelVoiceListening() {
  if (tarteelSpeechRec) {
    try { tarteelSpeechRec.stop(); } catch(e){}
  }
}

function matchTarteelVoiceToPage(spoken) {
  if (!spoken || !state.currentVersesData) return;
  const spokenClean = spoken.replace(/[\u064B-\u065F\u0670]/g, '').trim();
  const spokenWords = spokenClean.split(/\s+/).filter(w => w.length > 1);
  if (spokenWords.length === 0) return;

  state.currentVersesData.forEach((v, idx) => {
    const vClean = v.ar.replace(/[\u064B-\u065F\u0670]/g, '').trim();
    let matches = 0;
    spokenWords.forEach(w => {
      if (vClean.includes(w)) matches++;
    });
    if (matches >= 2 || (spokenWords.length === 1 && vClean.includes(spokenWords[0]))) {
      if (!state.revealedAyahs) state.revealedAyahs = {};
      state.revealedAyahs[idx] = true;
      const el = document.getElementById(`mushaf-span-${idx}`);
      if (el) {
        el.classList.remove('tarteel-hidden');
        el.classList.add('tarteel-revealed');
      }
      state.currentAyahIdx = idx;
      highlightActiveAyah();
    }
  });
}

function toggleLinedPaper() {
  state.isLinedPaper = !state.isLinedPaper;
  const btn = document.getElementById('linedPaperToggleBtn');
  if (btn) {
    btn.classList.toggle('active', state.isLinedPaper);
    btn.innerHTML = `<i class="fa-solid fa-lines-leaning"></i> 📝 Liniertes Papier: ${state.isLinedPaper ? 'AN' : 'AUS'}`;
  }
  const flowingEl = document.querySelector('.mushaf-flowing-text');
  if (flowingEl) {
    flowingEl.classList.toggle('lined-paper', state.isLinedPaper);
  }
  showToast(state.isLinedPaper ? '📝 Liniertes Schreibheft-Muster aktiviert' : '📖 Standard Muṣḥaf-Muster aktiviert');
}
window.toggleLinedPaper = toggleLinedPaper;

function highlightActiveAyah() {
  const spans = document.querySelectorAll('.mushaf-ayah-span');
  spans.forEach((sp, i) => {
    const isCur = (i === state.currentAyahIdx);
    sp.classList.toggle('active-highlight', isCur);
    if (isCur && state.activeTab === 'mushaf') {
      sp.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
}

function selectAndPlayAyah(idx) {
  state.currentAyahIdx = idx;
  state.currentIteration = 1;
  highlightActiveAyah();
  playAyahAt(idx);
}

function getMadinaScanUrl(pageNum) {
  // Official King Saud University Ayat Medina Mushaf Scan with Blue/Green Illuminations (Matching Image 3 & Image 2)
  return `https://quran.ksu.edu.sa/png_big/${pageNum}.png`;
}

function getMadinaScanFallbackUrl(pageNum) {
  const pStr = String(pageNum).padStart(3, '0');
  return `https://quran.islam-db.com/public/data/pages/quranpages_1920/images/page${pStr}.png`;
}

function renderFacsimileScan() {
  const img1 = document.getElementById('scanPageImg1');
  const img2 = document.getElementById('scanPageImg2');
  const sheet2 = document.getElementById('scanSheet2');

  if (img1) {
    img1.onerror = function() {
      this.onerror = null;
      this.src = getMadinaScanFallbackUrl(state.currentPage);
    };
    img1.src = getMadinaScanUrl(state.currentPage);
  }

  if (state.isDoubleSpread && state.currentPage < 604) {
    if (sheet2) sheet2.style.display = 'block';
    if (img2) {
      img2.onerror = function() {
        this.onerror = null;
        this.src = getMadinaScanFallbackUrl(state.currentPage + 1);
      };
      img2.src = getMadinaScanUrl(state.currentPage + 1);
    }
  } else {
    if (sheet2) sheet2.style.display = 'none';
  }

  const badge = document.getElementById('scanPageNumberBadge');
  if (badge) {
    badge.textContent = state.isDoubleSpread 
      ? `Seiten ${state.currentPage}–${state.currentPage + 1}` 
      : `Seite ${state.currentPage} (${toArDigits(state.currentPage)})`;
  }
}

function setScanDoubleSpread(isDouble) {
  state.isDoubleSpread = isDouble;
  const btnSingle = document.getElementById('scanSingleBtn');
  const btnDouble = document.getElementById('scanDoubleBtn');
  if (btnSingle) btnSingle.classList.toggle('active', !isDouble);
  if (btnDouble) btnDouble.classList.toggle('active', isDouble);
  renderFacsimileScan();
}

// ============================================================
// 7. TAB 2: VERS- & WORT-STUDIO (WORD-BY-WORD & FULL VERSES)
// ============================================================
function setWordStudioMode(mode) {
  state.wordStudioMode = mode;
  const btnWbw = document.getElementById('wsModeWbwBtn');
  const btnFull = document.getElementById('wsModeFullBtn');
  if (btnWbw) btnWbw.classList.toggle('active', mode === 'wbw');
  if (btnFull) btnFull.classList.toggle('active', mode === 'full');
  renderWordStudio();
  showToast(mode === 'wbw' ? '🔤 Wort-für-Wort Modus aktiviert' : '📜 Gesamte Verse Modus aktiviert');
}

function setWordStudioScope(scope) {
  state.wordStudioScope = scope;
  const btnPage = document.getElementById('wsScopePageBtn');
  const btnSurah = document.getElementById('wsScopeSurahBtn');
  if (btnPage) btnPage.classList.toggle('active', scope === 'page');
  if (btnSurah) btnSurah.classList.toggle('active', scope === 'surah');
  renderWordStudio();
  showToast(scope === 'page' ? 'Verse der aktuellen Seite' : 'Alle Verse der gesamten Sure');
}

function renderWordStudio() {
  const container = document.getElementById('wordStudioContainer');
  if (!container) return;
  container.innerHTML = '';

  let list = [];
  if (state.wordStudioScope === 'surah') {
    list = getVersesForSurah(state.currentSurah);
  } else {
    list = (state.currentVersesData && state.currentVersesData.length > 0) 
      ? state.currentVersesData 
      : getVersesForSurah(state.currentSurah);
  }

  state.wordStudioVersesList = list;

  if (!list || list.length === 0) {
    container.innerHTML = '<div style="text-align: center; color: var(--gold-light); padding: 40px;">Keine Verse vorhanden.</div>';
    return;
  }

  list.forEach((v, idx) => {
    const isMem = isVerseMemorized(v.surahNum, v.num);
    const isCurrentPlaying = (state.playbackSource === 'wordStudio' && state.wordStudioPlayingSurah === v.surahNum && state.wordStudioPlayingAyah === v.num);
    const card = document.createElement('div');
    card.className = `studio-card ${isMem ? 'memorized' : ''} ${isCurrentPlaying ? 'active-studio-playing' : ''}`;
    card.id = `ws-card-${idx}`;
    card.onclick = (e) => handleWordStudioCardClick(e, v.surahNum, v.num, idx);

    let wbwSectionHtml = '';
    if (state.wordStudioMode === 'wbw') {
      const pairs = (typeof getWordByWordPairs === 'function') 
        ? getWordByWordPairs(v.surahNum, v.num, v.ar, v.de) 
        : [];
      const wbwHtml = (typeof renderWordByWordHtml === 'function') 
        ? renderWordByWordHtml(pairs, `${v.surahNum}-${v.num}`) 
        : '';
      wbwSectionHtml = `
        <div class="wbw-box">
          <div class="wbw-box-title"><i class="fa-solid fa-palette"></i> Wort-für-Wort Zuordnung:</div>
          ${wbwHtml}
        </div>
      `;
    }

    card.innerHTML = `
      <div class="studio-card-header">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="badge-surah-ayah">Sure ${v.surahNum} · Vers ${v.num}</span>
          ${isMem ? '<span class="badge-memorized"><i class="fa-solid fa-star"></i> Gelernt</span>' : ''}
          ${isCurrentPlaying ? '<span class="badge-surah-ayah" style="background: rgba(16, 185, 129, 0.3); color: #86efac;"><i class="fa-solid fa-volume-high"></i> Wird abgespielt</span>' : ''}
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="action-btn" onclick="event.stopPropagation(); toggleVerseMemorized(${v.surahNum}, ${v.num});" title="Gelernt markieren">
            <i class="fa-solid fa-star" style="color: ${isMem ? '#10b981' : 'var(--text-muted)'};"></i>
          </button>
          <button class="action-btn" onclick="event.stopPropagation(); playWordStudioAyah(${v.surahNum}, ${v.num}, ${idx});" title="Diesen Vers abspielen">
            <i class="fa-solid fa-play"></i> Anhören
          </button>
          <button class="action-btn" onclick="event.stopPropagation(); repeatWordStudioAyah(${v.surahNum}, ${v.num}, ${idx}, 5);" title="5x Wiederholen">
            <i class="fa-solid fa-repeat"></i> 5×
          </button>
        </div>
      </div>

      <!-- Full Arabic Ayah -->
      <div class="studio-arabic-text">
        ${cleanArabicText(v.ar)}
        <span class="studio-rosette">﴿${toArDigits(v.num)}﴾</span>
      </div>

      <!-- Word-by-word chips (if mode is wbw) -->
      ${wbwSectionHtml}

      <!-- German Translation (Bubenheim) -->
      <div class="studio-translation-box">
        <div class="studio-translation-label"><i class="fa-solid fa-book-quran"></i> Übersetzung (Bubenheim &amp; Elyas):</div>
        <div class="studio-translation-text">${v.de || '—'}</div>
      </div>
    `;

    container.appendChild(card);
  });
  updateDockDisplay();
}

// ============================================================
// 8. TAB 4: TAFSIR-STUDIO (100% AUTHENTIC SUNNI GERMAN EXEGESES)
// ============================================================
const tafsirMemoryCache = {};

async function fetchAuthenticGermanTafsir(surahNum) {
  // Clear any corrupted cache in localStorage from previous run
  try {
    const cached = localStorage.getItem(`quran_tafsir_de_${surahNum}`);
    if (cached && (cached.includes('Ø') || cached.includes('Ã') || cached.includes('Ù'))) {
      localStorage.removeItem(`quran_tafsir_de_${surahNum}`);
    }
  } catch (e) {}

  // 1. Check in-memory cache
  if (tafsirMemoryCache[surahNum] && tafsirMemoryCache[surahNum].length > 0) {
    return tafsirMemoryCache[surahNum];
  }

  // 2. Check preloaded global dataset (from tafsir_data.js) with pristine Arabic text
  if (typeof AUTHENTIC_GERMAN_TAFSIR_DATA !== 'undefined' && AUTHENTIC_GERMAN_TAFSIR_DATA[surahNum]) {
    const qVerses = getVersesForSurah(surahNum);
    const list = AUTHENTIC_GERMAN_TAFSIR_DATA[surahNum].map((item, idx) => ({
      num: item.num,
      surahNum: surahNum,
      ar: (qVerses && qVerses[idx]) ? qVerses[idx].ar : item.ar,
      bubenheim: item.bubenheim,
      zaidan: item.zaidan,
      aburida: item.aburida
    }));
    tafsirMemoryCache[surahNum] = list;
    return list;
  }

  // 3. Check localStorage
  try {
    const cached = localStorage.getItem(`quran_tafsir_de_${surahNum}`);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.length > 0) {
        const qVerses = getVersesForSurah(surahNum);
        parsed.forEach((item, idx) => {
          if (qVerses && qVerses[idx]) item.ar = qVerses[idx].ar;
        });
        tafsirMemoryCache[surahNum] = parsed;
        return parsed;
      }
    }
  } catch (e) {}

  // 4. Fetch live from standard API (Bubenheim, Zaidan, Abu Rida)
  try {
    const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNum}/editions/quran-uthmani,de.bubenheim,de.zaidan,de.aburida`);
    if (res.ok) {
      const json = await res.json();
      if (json && json.data && json.data.length >= 4) {
        const uth = json.data[0].ayahs;
        const bub = json.data[1].ayahs;
        const zai = json.data[2].ayahs;
        const abu = json.data[3].ayahs;
        const qVerses = getVersesForSurah(surahNum);
        const list = uth.map((a, i) => ({
          num: a.numberInSurah,
          surahNum: surahNum,
          ar: (qVerses && qVerses[i]) ? qVerses[i].ar : a.text,
          bubenheim: bub[i] ? bub[i].text : '',
          zaidan: zai[i] ? zai[i].text : '',
          aburida: abu[i] ? abu[i].text : ''
        }));
        tafsirMemoryCache[surahNum] = list;
        try {
          localStorage.setItem(`quran_tafsir_de_${surahNum}`, JSON.stringify(list));
        } catch (e) {}
        return list;
      }
    }
  } catch (err) {
    console.warn('Network fetch for German tafsir failed, falling back to local data', err);
  }

  // Fallback: extract from local verse data
  const fallbackVerses = getVersesForSurah(surahNum);
  const fallbackList = fallbackVerses.map(v => ({
    num: v.num,
    surahNum: v.surahNum,
    ar: v.ar,
    bubenheim: v.de || '',
    zaidan: v.de ? `Al-Tafsir: ${v.de}` : '',
    aburida: v.de || ''
  }));
  tafsirMemoryCache[surahNum] = fallbackList;
  return fallbackList;
}

function setTafsirEdition(edition) {
  state.tafsirEdition = edition;
  const pillIds = ['tafsirBtnAll', 'tafsirBtnNami', 'tafsirBtnBubenheim', 'tafsirBtnZaidan', 'tafsirBtnAbuRida'];
  pillIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
  });
  const map = {
    all: 'tafsirBtnAll',
    nami: 'tafsirBtnNami',
    bubenheim: 'tafsirBtnBubenheim',
    zaidan: 'tafsirBtnZaidan',
    aburida: 'tafsirBtnAbuRida'
  };
  const activeBtn = document.getElementById(map[edition] || 'tafsirBtnAll');
  if (activeBtn) activeBtn.classList.add('active');

  renderTafsirStudio();
  const labelMap = {
    all: 'Alle Gelehrten (Synthese)',
    nami: 'تەفسیری نامی (خوڵاسەی نامی - کوردی)',
    bubenheim: 'Bubenheim & Elyas (Medina)',
    zaidan: 'Amir Zaidan (At-Tafsir)',
    aburida: 'Abu Rida (Köln)'
  };
  showToast(`Tafsīr: ${labelMap[edition] || edition}`);
}
window.setTafsirEdition = setTafsirEdition;

function setTafsirScope(scope) {
  state.tafsirScope = scope;
  const btnSingle = document.getElementById('tafsirScopeSingleBtn');
  const btnSurah = document.getElementById('tafsirScopeSurahBtn');
  if (btnSingle) btnSingle.classList.toggle('active', scope === 'single');
  if (btnSurah) btnSurah.classList.toggle('active', scope === 'surah');
  renderTafsirStudio();
  showToast(scope === 'surah' ? 'Gesamte Sure geladen' : 'Einzelvers geladen');
}
window.setTafsirScope = setTafsirScope;

function onTafsirSurahChange(sId) {
  state.tafsirSurah = parseInt(sId, 10) || 1;
  state.tafsirAyah = 1;
  updateTafsirAyahSelect();
  renderTafsirStudio();
}
window.onTafsirSurahChange = onTafsirSurahChange;

function onTafsirAyahChange(aNum) {
  state.tafsirAyah = parseInt(aNum, 10) || 1;
  if (state.tafsirScope === 'single') {
    renderTafsirStudio();
  } else {
    const target = document.getElementById(`tafsir-card-${state.tafsirSurah}-${state.tafsirAyah}`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target.classList.add('flash-glow');
      setTimeout(() => target.classList.remove('flash-glow'), 2500);
    }
  }
}
window.onTafsirAyahChange = onTafsirAyahChange;

function stepTafsirAyah(delta) {
  const verses = getVersesForSurah(state.tafsirSurah);
  const max = verses.length || 7;
  let newAyah = state.tafsirAyah + delta;
  if (newAyah < 1) newAyah = 1;
  if (newAyah > max) newAyah = max;
  state.tafsirAyah = newAyah;
  const sel = document.getElementById('tafsirAyahSelect');
  if (sel) sel.value = newAyah;
  onTafsirAyahChange(newAyah);
}
window.stepTafsirAyah = stepTafsirAyah;

function updateTafsirAyahSelect() {
  const sel = document.getElementById('tafsirAyahSelect');
  if (!sel) return;
  sel.innerHTML = '';
  const verses = getVersesForSurah(state.tafsirSurah);
  const count = verses.length || 7;
  for (let i = 1; i <= count; i++) {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = `Vers ${i}`;
    sel.appendChild(opt);
  }
  sel.value = state.tafsirAyah;
}

async function renderTafsirStudio() {
  const container = document.getElementById('tafsirCardsContainer');
  if (!container) return;

  const sSelect = document.getElementById('tafsirSurahSelect');
  if (sSelect && sSelect.options.length === 0) populateTafsirDropdowns();
  if (sSelect && sSelect.value) state.tafsirSurah = parseInt(sSelect.value, 10);

  container.innerHTML = `
    <div style="text-align: center; color: var(--gold-light); padding: 50px 20px;">
      <i class="fa-solid fa-spinner fa-spin" style="font-size: 2.2rem; margin-bottom: 14px; color: #2e7d32;"></i>
      <div style="font-size: 1.15rem; font-weight: 700;">Authentische deutsche Tafsīr-Quellen (Bubenheim, Zaidan, Abu Rida) werden geladen...</div>
    </div>
  `;

  const verses = await fetchAuthenticGermanTafsir(state.tafsirSurah);
  container.innerHTML = '';

  let toRender = [];
  if (state.tafsirScope === 'single') {
    const match = verses.find(v => v.num === state.tafsirAyah) || verses[0];
    if (match) toRender = [match];
  } else {
    toRender = verses;
  }

  if (!toRender || toRender.length === 0) {
    container.innerHTML = '<div style="text-align: center; color: var(--gold-light); padding: 40px;">Keine Verse gefunden.</div>';
    return;
  }

  const edition = state.tafsirEdition || 'all';

  toRender.forEach(v => {
    const card = document.createElement('div');
    card.className = 'tafsir-card';
    card.id = `tafsir-card-${state.tafsirSurah}-${v.num}`;

    // Guarantee 100% clean, pristine Arabic text from verified local Quran dataset
    const qVerses = getVersesForSurah(state.tafsirSurah);
    const foundQVerse = qVerses ? qVerses.find(x => x.num === v.num) : null;
    const arabicVerseText = foundQVerse ? foundQVerse.ar : (v.ar || '');

    let contentHtml = `
      <!-- Authentic Arabic Text Header -->
      <div style="direction: rtl; font-family: var(--quran-font); font-size: 2.15rem; line-height: 2.4; color: #fef08a; padding-bottom: 14px; border-bottom: 1.5px solid rgba(197, 160, 89, 0.3); margin-bottom: 18px; text-align: right;">
        ${applyTajweedMarkup(cleanArabicText(arabicVerseText))}
        <span class="mushaf-rosette" style="color: #2e7d32; font-size: 1.65rem;">﴿${toArDigits(v.num)}﴾</span>
      </div>
    `;

    // 1. Frank Bubenheim & Dr. Nadeem Elyas (Offizielle saudische Übersetzung des König-Fahd-Komplexes)
    if (edition === 'all' || edition === 'bubenheim') {
      contentHtml += `
        <div style="background: rgba(46, 125, 50, 0.12); border-left: 4px solid #2e7d32; border-radius: 0 12px 12px 0; padding: 14px 18px; margin-bottom: 14px;">
          <div style="display: flex; align-items: center; gap: 8px; font-weight: 800; color: #86efac; font-size: 0.95rem; margin-bottom: 6px;">
            <i class="fa-solid fa-book-quran"></i> 📗 Bubenheim &amp; Elyas (König-Fahd-Komplex zur Druckung des Edlen Qur'an, Medina):
          </div>
          <div style="font-size: 1.15rem; line-height: 1.8; color: #f8fafc;">
            ${v.bubenheim || 'Text wird geladen...'}
          </div>
        </div>
      `;
    }

    // 2. Amir Zaidan (At-Tafsir: Die authentische theologische Erläuterung)
    if (edition === 'all' || edition === 'zaidan') {
      contentHtml += `
        <div style="background: rgba(37, 99, 235, 0.12); border-left: 4px solid #2563eb; border-radius: 0 12px 12px 0; padding: 14px 18px; margin-bottom: 14px;">
          <div style="display: flex; align-items: center; gap: 8px; font-weight: 800; color: #93c5fd; font-size: 0.95rem; margin-bottom: 6px;">
            <i class="fa-solid fa-scale-balanced"></i> 📘 Amir Zaidan (At-Tafsir: Ausführliche theologische Erläuterung):
          </div>
          <div style="font-size: 1.15rem; line-height: 1.8; color: #f8fafc;">
            ${v.zaidan || 'Text wird geladen...'}
          </div>
        </div>
      `;
    }

    // 3. Abu Rida Muhammad ibn Ahmad ibn Rassoul (Islamische Bibliothek Köln)
    if (edition === 'all' || edition === 'aburida') {
      contentHtml += `
        <div style="background: rgba(217, 119, 6, 0.12); border-left: 4px solid #d97706; border-radius: 0 12px 12px 0; padding: 14px 18px; margin-bottom: 6px;">
          <div style="display: flex; align-items: center; gap: 8px; font-weight: 800; color: #fcd34d; font-size: 0.95rem; margin-bottom: 6px;">
            <i class="fa-solid fa-feather"></i> 📙 Abu Rida (Muhammad ibn Ahmad ibn Rassoul - Islamische Bibliothek):
          </div>
          <div style="font-size: 1.15rem; line-height: 1.8; color: #f8fafc;">
            ${v.aburida || 'Text wird geladen...'}
          </div>
        </div>
      `;
    }

    // 4. Mamosta Mela Abdulkarim Modarres (Tafsir Nami / Khulasa-i Nami - Kurdisch)
    if (edition === 'all' || edition === 'nami') {
      const kurdishVerseText = (typeof KURDISH_TAFSIR_DATA !== 'undefined' && KURDISH_TAFSIR_DATA[state.tafsirSurah] && KURDISH_TAFSIR_DATA[state.tafsirSurah][v.num])
        ? KURDISH_TAFSIR_DATA[state.tafsirSurah][v.num]
        : '';
      
      const detailedNami = (typeof MULTILINGUAL_TAFSIR !== 'undefined' && MULTILINGUAL_TAFSIR[`${state.tafsirSurah}:${v.num}`] && MULTILINGUAL_TAFSIR[`${state.tafsirSurah}:${v.num}`].nami)
        ? MULTILINGUAL_TAFSIR[`${state.tafsirSurah}:${v.num}`].nami
        : null;

      contentHtml += `
        <div style="background: rgba(16, 185, 129, 0.12); border-left: 4px solid #10b981; border-radius: 0 12px 12px 0; padding: 14px 18px; margin-top: 14px; margin-bottom: 6px; direction: rtl; text-align: right;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 10px;">
            <div style="display: flex; align-items: center; gap: 8px; font-weight: 800; color: #6ee7b7; font-size: 1.05rem; font-family: var(--kurdish-font);">
              <i class="fa-solid fa-feather-pointed" style="color: #10b981;"></i> 🌸 تەفسیری نامی (مامۆستا مەلا عەبدولکەریمی مودەڕڕیس - کوردی):
            </div>
            <button onclick="openTafsirNamiPdfModalForSurah(${state.tafsirSurah})" class="sub-btn" style="font-size: 0.8rem; padding: 4px 10px; border-radius: 8px; border: 1px solid var(--gold-border); color: var(--gold-light); display: inline-flex; align-items: center; gap: 6px; cursor: pointer;">
              <i class="fa-solid fa-book-open"></i> بینینی پەڕەی ئەسڵی لە کتێب (PDF)
            </button>
          </div>
          <div style="font-family: var(--kurdish-font); font-size: 1.15rem; line-height: 2; color: #f8fafc;">
            ${detailedNami || kurdishVerseText || 'دەقی تەفسیر ئامادە دەکرێت...'}
          </div>
        </div>
      `;
    }

    card.innerHTML = contentHtml;
    container.appendChild(card);
  });
  updateDockDisplay();
}
window.renderTafsirStudio = renderTafsirStudio;

function populateTafsirDropdowns() {
  const sSelect = document.getElementById('tafsirSurahSelect');
  if (!sSelect) return;
  sSelect.innerHTML = '';
  if (typeof ALL_114_SURAHS !== 'undefined') {
    ALL_114_SURAHS.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = `${s.id}. ${s.name} (${s.arabic}) - ${s.versesCount} Verse`;
      sSelect.appendChild(opt);
    });
  }
  sSelect.value = state.tafsirSurah;
  updateTafsirAyahSelect();
}

// ============================================================
// 9. TAB 5: HIFZ-ARCHIV (SAVED & MASTERED VERSES)
// ============================================================
function renderHifzArchive() {
  const container = document.getElementById('hifzArchiveList');
  if (!container) return;
  container.innerHTML = '';

  const memList = getAllMemorizedVerses();
  const filterSel = document.getElementById('hifzArchiveSurahFilter');

  // Populate filter dropdown with only surahs that have memorized verses
  if (filterSel) {
    const curFilter = filterSel.value;
    filterSel.innerHTML = '<option value="all">Alle Suren</option>';
    const surahIds = [...new Set(memList.map(m => m.surahNum))];
    surahIds.forEach(sId => {
      const meta = (typeof ALL_114_SURAHS !== 'undefined') ? ALL_114_SURAHS.find(s => s.id === sId) : null;
      const opt = document.createElement('option');
      opt.value = sId;
      opt.textContent = meta ? `${meta.id}. ${meta.name} (${meta.arabic})` : `Sure ${sId}`;
      if (String(sId) === curFilter) opt.selected = true;
      filterSel.appendChild(opt);
    });
  }

  const selectedFilter = filterSel ? filterSel.value : 'all';
  const displayList = (selectedFilter === 'all') 
    ? memList 
    : memList.filter(m => String(m.surahNum) === selectedFilter);

  const statsBadge = document.getElementById('hifzStatsText');
  if (statsBadge) {
    const pct = ((memList.length / 6236) * 100).toFixed(2);
    statsBadge.textContent = `${memList.length} Verse gelernt (${pct}% des Korans)`;
  }

  if (displayList.length === 0) {
    container.innerHTML = `
      <div class="empty-state-card">
        <i class="fa-solid fa-star" style="font-size: 3rem; color: var(--gold-primary); margin-bottom: 14px;"></i>
        <div style="font-size: 1.25rem; font-weight: 800; color: #fff; margin-bottom: 8px;">Noch keine Verse als gelernt markiert</div>
        <div style="color: var(--text-muted); font-size: 0.95rem; max-width: 500px; margin: 0 auto;">
          Klicke im Muṣḥaf oder im Wort-Studio auf den Stern ⭐ neben einem Vers, um ihn hier zu speichern!
        </div>
      </div>
    `;
    return;
  }

  displayList.forEach(m => {
    const sVerses = getVersesForSurah(m.surahNum);
    const v = sVerses.find(item => item.num === m.num) || { ar: `Sure ${m.surahNum}:${m.num}`, de: '' };
    const sMeta = (typeof ALL_114_SURAHS !== 'undefined') ? ALL_114_SURAHS.find(s => s.id === m.surahNum) : null;
    const sName = sMeta ? `${sMeta.name} (${sMeta.arabic})` : `Sure ${m.surahNum}`;

    const card = document.createElement('div');
    card.className = 'studio-card memorized';
    card.innerHTML = `
      <div class="studio-card-header">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="badge-surah-ayah">${sName} · Vers ${m.num}</span>
          <span class="badge-memorized"><i class="fa-solid fa-check"></i> Gelernt</span>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="action-btn" onclick="toggleVerseMemorized(${m.surahNum}, ${m.num})" title="Entfernen">
            <i class="fa-solid fa-trash-can" style="color: #ef4444;"></i>
          </button>
          <button class="action-btn" onclick="jumpToAndPlayVerse(${m.surahNum}, ${m.num})">
            <i class="fa-solid fa-play"></i> Abspielen
          </button>
        </div>
      </div>

      <div class="studio-arabic-text" style="font-size: 1.85rem;">
        ${cleanArabicText(v.ar)}
        <span class="studio-rosette">﴿${toArDigits(m.num)}﴾</span>
      </div>

      <div class="studio-translation-box">
        <div class="studio-translation-text">${v.de || ''}</div>
      </div>
    `;
    container.appendChild(card);
  });
  updateDockDisplay();
}

function exportHifzBackup(format) {
  const list = getAllMemorizedVerses();
  if (list.length === 0) {
    showToast("Keine Verse zum Exportieren vorhanden.");
    return;
  }
  let content = '';
  let filename = `Quran_Hifz_Backup_${Date.now()}`;
  let mimeType = 'text/plain';

  if (format === 'json') {
    content = JSON.stringify(list, null, 2);
    filename += '.json';
    mimeType = 'application/json';
  } else {
    content = list.map(m => {
      const verses = getVersesForSurah(m.surahNum);
      const match = verses.find(v => v.num === m.num);
      return `Sure ${m.surahNum}, Vers ${m.num}\n${match ? match.ar : ''}\n${match ? match.de : ''}\n--------------------`;
    }).join('\n\n');
    filename += '.txt';
  }

  const blob = new Blob([content], { type: mimeType });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  showToast(`Sicherung erfolgreich als ${format.toUpperCase()} heruntergeladen! 📁`);
}

function importHifzBackup(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (Array.isArray(data)) {
        data.forEach(m => {
          if (m.surahNum && m.num) {
            const key = `hifz_${m.surahNum}`;
            const cur = JSON.parse(localStorage.getItem(key) || '{}');
            cur[m.num] = true;
            localStorage.setItem(key, JSON.stringify(cur));
          }
        });
        showToast(`${data.length} Verse erfolgreich wiederhergestellt! ⭐`);
        updateHifzCounter();
        renderHifzArchive();
      }
    } catch (err) {
      showToast("Ungültiges Dateiformat. Bitte eine .json-Datei wählen.");
    }
  };
  reader.readAsText(file);
}

// ============================================================
// 10. TAB 6: DEDICATED REPETITION STUDIO (MURĀDSCHA'AH)
// ============================================================
function updateRepetitionQueue() {
  const surahSel = document.getElementById('repeatSurahSelect');
  if (surahSel && surahSel.options.length === 0) populateRepeatSurahDropdown();
  if (surahSel && surahSel.value) state.repeatSurah = parseInt(surahSel.value, 10);

  const modeSel = document.getElementById('repeatModeSelect');
  if (modeSel) state.repeatMode = modeSel.value;

  const targetSurah = state.repeatSurah || state.currentSurah || 1;
  const surahVerses = getVersesForSurah(targetSurah);
  state.repeatQueue = [];

  if (state.repeatMode === 'surah_memorized') {
    const memOnly = surahVerses.filter(v => isVerseMemorized(v.surahNum, v.num));
    if (memOnly.length > 0) {
      state.repeatQueue = memOnly;
    } else {
      // Auto-fallback so studio is never empty
      state.repeatQueue = surahVerses;
      showToast(`In Sure ${targetSurah} noch keine Verse als gelernt markiert. Alle Verse geladen.`);
    }
  } else if (state.repeatMode === 'memorized') {
    const allMem = getAllMemorizedVerses();
    if (allMem.length > 0) {
      state.repeatQueue = allMem.map(m => {
        const list = getVersesForSurah(m.surahNum);
        return list.find(v => v.num === m.num) || { surahNum: m.surahNum, num: m.num, ar: '', de: '' };
      });
    } else {
      state.repeatQueue = surahVerses;
    }
  } else if (state.repeatMode === 'surah_all') {
    state.repeatQueue = surahVerses;
  } else if (state.repeatMode === 'page') {
    state.repeatQueue = (state.currentVersesData && state.currentVersesData.length > 0) 
      ? state.currentVersesData 
      : surahVerses;
  }

  if (state.repeatQueue.length === 0) {
    state.repeatQueue = surahVerses;
  }

  state.repeatQueueIdx = 0;
  state.repeatCurrentLoop = 1;
  renderRepetitionDisplay();
}

function renderRepetitionDisplay() {
  if (state.repeatQueue.length === 0) return;
  const v = state.repeatQueue[state.repeatQueueIdx];

  const posBadge = document.getElementById('repQueuePosBadge');
  if (posBadge) posBadge.textContent = `Vers ${state.repeatQueueIdx + 1} von ${state.repeatQueue.length}`;

  const loopBadge = document.getElementById('repLoopBadge');
  if (loopBadge) {
    loopBadge.textContent = `Durchgang ${state.repeatCurrentLoop} von ${state.repeatLoopTarget === 999 ? '∞' : state.repeatLoopTarget}`;
  }

  const arText = document.getElementById('repArabicDisplay');
  if (arText) {
    arText.innerHTML = `${cleanArabicText(v.ar)} <span class="studio-rosette" style="display:inline-block; font-size:1.85rem; margin:0 8px; vertical-align:middle; color:var(--gold-primary);">﴿${toArDigits(v.num)}﴾</span>`;
  }

  const deText = document.getElementById('repGermanDisplay');
  if (deText) deText.textContent = v.de || '';

  const surahTitle = document.getElementById('repSurahTitle');
  if (surahTitle) surahTitle.textContent = `Sure ${v.surahNum} · Vers ${v.num}`;

  // Populate Queue Cards list below player
  const listContainer = document.getElementById('repQueueList');
  const countBadge = document.getElementById('repQueueCountBadge');
  if (countBadge) countBadge.textContent = `${state.repeatQueue.length} Verse`;

  if (listContainer) {
    listContainer.innerHTML = '';
    state.repeatQueue.forEach((item, idx) => {
      const isCur = (idx === state.repeatQueueIdx);
      const row = document.createElement('div');
      row.className = `rep-queue-item ${isCur ? 'active' : ''}`;
      row.onclick = () => {
        state.repeatQueueIdx = idx;
        state.repeatCurrentLoop = 1;
        renderRepetitionDisplay();
        if (state.isRepeatPlaying) playRepeatCurrent();
      };

      row.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
          <span class="rep-q-tag">${isCur ? '▶ Aktiv' : '#' + (idx + 1)}</span>
          <span style="font-weight: 700; color: #fff;">Sure ${item.surahNum}:${item.num}</span>
        </div>
        <div style="direction: rtl; font-family: var(--quran-font); font-size: 1.25rem; color: ${isCur ? '#6ee7b7' : '#fef08a'}; max-width: 480px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
          ${cleanArabicText(item.ar)}
        </div>
      `;
      listContainer.appendChild(row);
    });
  }
}

function setRepeatLoopCount(count, btn) {
  state.repeatLoopTarget = count;
  document.querySelectorAll('.loop-btn').forEach(b => {
    const val = parseInt(b.textContent, 10);
    const isTarget = (count === 999 && b.textContent.includes('∞')) || (val === count);
    b.classList.toggle('active', isTarget);
  });
  renderRepetitionDisplay();
  showToast(`Wiederholungen pro Vers: ${count === 999 ? 'Unendlich (∞)' : count + '×'}`);
}
window.setRepeatLoopTarget = setRepeatLoopCount;
window.setRepeatLoopCount = setRepeatLoopCount;
window.toggleRepetitionPlay = toggleRepeatPlay;
window.repNextAyah = nextRepeatVerse;
window.repPrevAyah = prevRepeatVerse;
window.onRepeatSurahChange = function(surahId) {
  state.repeatSurah = parseInt(surahId, 10);
  updateRepetitionQueue();
};
window.onRepeatModeChange = function(mode) {
  state.repeatMode = mode;
  updateRepetitionQueue();
};

function toggleRepeatPlay() {
  if (state.repeatQueue.length === 0) updateRepetitionQueue();
  if (state.isRepeatPlaying) {
    pauseRepeat();
  } else {
    playRepeatCurrent();
  }
}

function playRepeatCurrent() {
  if (state.repeatQueue.length === 0) return;
  const v = state.repeatQueue[state.repeatQueueIdx];
  state.isRepeatPlaying = true;

  const btn = document.getElementById('repPlayMainBtn');
  const icon = document.getElementById('repPlayMainIcon');
  if (btn) btn.classList.add('active');
  if (icon) icon.className = 'fa-solid fa-pause';

  audio.src = getAyahAudioUrl(v.surahNum, v.num);
  audio.playbackRate = state.speed;
  audio.play().catch(e => console.log('Audio notice', e));
  renderRepetitionDisplay();
}

function pauseRepeat() {
  state.isRepeatPlaying = false;
  if (state.repeatPauseTimer) clearTimeout(state.repeatPauseTimer);
  audio.pause();

  const btn = document.getElementById('repPlayMainBtn');
  const icon = document.getElementById('repPlayMainIcon');
  if (btn) btn.classList.remove('active');
  if (icon) icon.className = 'fa-solid fa-play';

  const statusEl = document.getElementById('repStatusNotice');
  if (statusEl) statusEl.textContent = 'Pausiert.';
}

function nextRepeatVerse() {
  if (state.repeatQueue.length === 0) return;
  state.repeatQueueIdx = (state.repeatQueueIdx + 1) % state.repeatQueue.length;
  state.repeatCurrentLoop = 1;
  renderRepetitionDisplay();
  if (state.isRepeatPlaying) playRepeatCurrent();
}

function prevRepeatVerse() {
  if (state.repeatQueue.length === 0) return;
  state.repeatQueueIdx = (state.repeatQueueIdx - 1 + state.repeatQueue.length) % state.repeatQueue.length;
  state.repeatCurrentLoop = 1;
  renderRepetitionDisplay();
  if (state.isRepeatPlaying) playRepeatCurrent();
}

function populateRepeatSurahDropdown() {
  const sel = document.getElementById('repeatSurahSelect');
  if (!sel) return;
  sel.innerHTML = '';
  if (typeof ALL_114_SURAHS !== 'undefined') {
    ALL_114_SURAHS.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = `${s.id}. ${s.name} (${s.arabic})`;
      sel.appendChild(opt);
    });
  }
  sel.value = state.repeatSurah;
}

// ============================================================
// 11. UNIFIED BOTTOM AUDIO PLAYER & AUDIO EVENTS
// ============================================================
function playAyahAt(idx) {
  if (!state.currentVersesData || !state.currentVersesData[idx]) return;
  state.playbackSource = 'mushaf';
  state.currentAyahIdx = idx;
  const v = state.currentVersesData[idx];

  state.isPlaying = true;
  const newUrl = getAyahAudioUrl(v.surahNum, v.num);
  if (state.qari === 'Mansour_Al_Salimi') {
    if (audio.src !== newUrl) {
      audio.src = newUrl;
    }
    audio.playbackRate = state.speed;
    audio.play().catch(e => console.log('Play notice', e));

    const curSurahObj = (typeof ALL_114_SURAHS !== 'undefined') ? ALL_114_SURAHS.find(s => s.id === v.surahNum) : null;
    const sName = curSurahObj ? curSurahObj.arabic : `Sure ${v.surahNum}`;
    showToast(`🎙️ Rezitation Sure ${sName} - Mansur Al-Salimi (Ganze Sure)`);
  } else {
    audio.src = newUrl;
    audio.playbackRate = state.speed;
    audio.play().catch(e => console.log('Play notice', e));
  }

  updateDockDisplay();
  highlightActiveAyah();
}
window.playAyahAt = playAyahAt;

function playWordStudioAyah(surah, ayah, idx) {
  state.playbackSource = 'wordStudio';
  state.wordStudioPlayingSurah = surah;
  state.wordStudioPlayingAyah = ayah;
  state.wordStudioPlayingIdx = (typeof idx === 'number') ? idx : 0;

  // Highlight active studio card without altering Tab 1 Mushaf page
  document.querySelectorAll('.studio-card').forEach(c => c.classList.remove('active-studio-playing'));
  const card = document.getElementById(`ws-card-${state.wordStudioPlayingIdx}`);
  if (card) {
    card.classList.add('active-studio-playing');
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  state.isPlaying = true;
  const newUrl = getAyahAudioUrl(surah, ayah);
  if (state.qari === 'Mansour_Al_Salimi') {
    if (audio.src !== newUrl) {
      audio.src = newUrl;
    }
    audio.playbackRate = state.speed;
    audio.play().catch(e => console.log('Play notice', e));

    const curSurahObj = (typeof ALL_114_SURAHS !== 'undefined') ? ALL_114_SURAHS.find(s => s.id === surah) : null;
    const sName = curSurahObj ? curSurahObj.arabic : `Sure ${surah}`;
    showToast(`🎙️ Rezitation Sure ${sName} - Mansur Al-Salimi (Ganze Sure)`);
  } else {
    audio.src = newUrl;
    audio.playbackRate = state.speed;
    audio.play().catch(e => console.log('Play notice', e));
    showToast(`🎧 Verse Studio: Sure ${surah}, Vers ${ayah}`);
  }

  updateDockDisplay();
}
window.playWordStudioAyah = playWordStudioAyah;

function handleWordStudioCardClick(e, surah, ayah, idx) {
  // If user clicked an action button, let the button's own event handle it
  if (e && e.target && e.target.closest('button')) return;
  playWordStudioAyah(surah, ayah, idx);
}
window.handleWordStudioCardClick = handleWordStudioCardClick;

function repeatWordStudioAyah(surah, ayah, idx, times) {
  state.repeatTarget = times;
  state.currentIteration = 1;
  playWordStudioAyah(surah, ayah, idx);
  showToast(`Vers ${surah}:${ayah} wird ${times}× wiederholt 🔁`);
}
window.repeatWordStudioAyah = repeatWordStudioAyah;

function toggleMushafAudioPlay() {
  if (state.isPlaying && state.playbackSource === 'mushaf') {
    audio.pause();
    state.isPlaying = false;
  } else {
    state.playbackSource = 'mushaf';
    playAyahAt(state.currentAyahIdx);
  }
  updateDockDisplay();
}
window.toggleMushafAudioPlay = toggleMushafAudioPlay;

function toggleWordStudioAudioPlay() {
  if (state.isPlaying && state.playbackSource === 'wordStudio') {
    audio.pause();
    state.isPlaying = false;
  } else {
    state.playbackSource = 'wordStudio';
    if (state.wordStudioPlayingSurah && state.wordStudioPlayingAyah) {
      playWordStudioAyah(state.wordStudioPlayingSurah, state.wordStudioPlayingAyah, state.wordStudioPlayingIdx);
    } else if (state.wordStudioVersesList && state.wordStudioVersesList.length > 0) {
      const v = state.wordStudioVersesList[0];
      playWordStudioAyah(v.surahNum, v.num, 0);
    } else {
      playWordStudioAyah(state.currentSurah, 1, 0);
    }
  }
  updateDockDisplay();
}
window.toggleWordStudioAudioPlay = toggleWordStudioAudioPlay;

function toggleMainAudioPlay() {
  if (state.activeTab === 'wordStudio') {
    toggleWordStudioAudioPlay();
  } else {
    toggleMushafAudioPlay();
  }
}

function playNextWordStudioCard() {
  if (state.wordStudioVersesList && state.wordStudioVersesList.length > 0) {
    const nextIdx = state.wordStudioPlayingIdx + 1;
    if (nextIdx < state.wordStudioVersesList.length) {
      state.currentIteration = 1;
      const nextV = state.wordStudioVersesList[nextIdx];
      playWordStudioAyah(nextV.surahNum, nextV.num, nextIdx);
    } else {
      state.isPlaying = false;
      updateDockDisplay();
      showToast('Ende der Verse erreicht ✨');
    }
  }
}
window.playNextWordStudioCard = playNextWordStudioCard;

function playPrevWordStudioCard() {
  if (state.wordStudioVersesList && state.wordStudioPlayingIdx > 0) {
    state.currentIteration = 1;
    const prevIdx = state.wordStudioPlayingIdx - 1;
    const prevV = state.wordStudioVersesList[prevIdx];
    playWordStudioAyah(prevV.surahNum, prevV.num, prevIdx);
  }
}
window.playPrevWordStudioCard = playPrevWordStudioCard;

function playNextAyah() {
  if (state.playbackSource === 'wordStudio') {
    playNextWordStudioCard();
    return;
  }

  // Mushaf Tab 1
  if (!state.currentVersesData || state.currentVersesData.length === 0) return;
  if (state.currentAyahIdx < state.currentVersesData.length - 1) {
    state.currentIteration = 1;
    playAyahAt(state.currentAyahIdx + 1);
  } else if (state.currentPage < 604) {
    turnPage(1);
    setTimeout(() => playAyahAt(0), 400);
  }
}

function playPrevAyah() {
  if (state.playbackSource === 'wordStudio') {
    playPrevWordStudioCard();
    return;
  }

  // Mushaf Tab 1
  if (state.currentAyahIdx > 0) {
    state.currentIteration = 1;
    playAyahAt(state.currentAyahIdx - 1);
  } else if (state.currentPage > 1) {
    turnPage(-1);
    setTimeout(() => {
      const last = (state.currentVersesData.length > 0) ? state.currentVersesData.length - 1 : 0;
      playAyahAt(last);
    }, 400);
  }
}

function playSingleAyah(surah, ayah) {
  // Backwards compatibility helper
  playWordStudioAyah(surah, ayah, 0);
}

function repeatSingleAyah(surah, ayah, times) {
  state.repeatTarget = times;
  state.currentIteration = 1;
  playWordStudioAyah(surah, ayah, 0);
  showToast(`Vers ${surah}:${ayah} wird ${times}× wiederholt`);
}

function jumpToAndPlayVerse(surah, ayah) {
  state.playbackSource = 'mushaf';
  // Find page of that verse
  let targetPage = 1;
  if (typeof QURAN_ALL_PAGES !== 'undefined') {
    for (let p = 1; p <= 604; p++) {
      if (QURAN_ALL_PAGES[p] && QURAN_ALL_PAGES[p].some(v => v.surahNum === surah && v.num === ayah)) {
        targetPage = p;
        break;
      }
    }
  }
  loadPage(targetPage);
  setTimeout(() => {
    const idx = state.currentVersesData.findIndex(v => v.surahNum === surah && v.num === ayah);
    if (idx !== -1) {
      selectAndPlayAyah(idx);
    }
  }, 350);
}

function cycleRepeatTarget(source) {
  const steps = [1, 3, 5, 10, 999];
  const curIdx = steps.indexOf(state.repeatTarget);
  const nextTarget = (curIdx !== -1 && curIdx < steps.length - 1) ? steps[curIdx + 1] : steps[0];
  state.repeatTarget = nextTarget;
  state.currentIteration = 1;
  const label = nextTarget === 999 ? '∞' : `${nextTarget}×`;

  ['dockLoopBadge', 'mushafLoopBadge', 'wsLoopBadge'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = label;
  });

  updateDockDisplay();
  showToast(`🔁 Vers-Wiederholung: ${nextTarget === 999 ? 'Endlos (∞)' : nextTarget + '×'}`);
}
window.cycleRepeatTarget = cycleRepeatTarget;

function updateDockDisplay() {
  const curV = (state.currentVersesData && state.currentVersesData[state.currentAyahIdx]) 
    ? state.currentVersesData[state.currentAyahIdx] 
    : { surahNum: state.currentSurah, num: 1 };

  const sMeta1 = (typeof ALL_114_SURAHS !== 'undefined') ? ALL_114_SURAHS.find(s => s.id === curV.surahNum) : null;
  const sTitle1 = sMeta1 ? `${sMeta1.arabic} (${sMeta1.name})` : `Sure ${curV.surahNum}`;

  // 1. Update Section 1 (Mushaf) Mini Player
  const mushafInfo = document.getElementById('mushafPlayerVerseInfo');
  if (mushafInfo) {
    mushafInfo.textContent = `${sMeta1 ? sMeta1.name : ('Sure ' + curV.surahNum)} · ${curV.num}`;
  }

  const mushafIter = document.getElementById('mushafPlayerIterationBadge');
  if (mushafIter) {
    const total = state.repeatTarget === 999 ? '∞' : state.repeatTarget;
    mushafIter.textContent = `${state.currentIteration} / ${total}`;
  }

  const isMushafActive = state.isPlaying && state.playbackSource === 'mushaf';
  const mushafIcon = document.getElementById('mushafPlayIcon');
  const mushafBtn = document.getElementById('mushafPlayBtn');
  if (mushafIcon) mushafIcon.className = isMushafActive ? 'fa-solid fa-pause' : 'fa-solid fa-play';
  if (mushafBtn) mushafBtn.classList.toggle('playing', isMushafActive);

  // 2. Update Section 2 (Word Studio) Mini Player
  const wsSurah = state.wordStudioPlayingSurah || state.currentSurah;
  const wsAyah = state.wordStudioPlayingAyah || 1;
  const sMeta2 = (typeof ALL_114_SURAHS !== 'undefined') ? ALL_114_SURAHS.find(s => s.id === wsSurah) : null;
  const sTitle2 = sMeta2 ? `${sMeta2.arabic}` : `Sure ${wsSurah}`;

  const wsInfo = document.getElementById('wsPlayerVerseInfo');
  if (wsInfo) {
    wsInfo.textContent = `${sMeta2 ? sMeta2.name : ('Sure ' + wsSurah)} · ${wsAyah}`;
  }

  const wsIter = document.getElementById('wsPlayerIterationBadge');
  if (wsIter) {
    const total = state.repeatTarget === 999 ? '∞' : state.repeatTarget;
    wsIter.textContent = `${state.currentIteration} / ${total}`;
  }

  const isWsActive = state.isPlaying && state.playbackSource === 'wordStudio';
  const wsIcon = document.getElementById('wsPlayIcon');
  const wsBtn = document.getElementById('wsPlayBtn');
  if (wsIcon) wsIcon.className = isWsActive ? 'fa-solid fa-pause' : 'fa-solid fa-play';
  if (wsBtn) wsBtn.classList.toggle('playing', isWsActive);

  // 3. Fallback for legacy elements
  const playIcon = document.getElementById('dockPlayIcon');
  if (playIcon) playIcon.className = state.isPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play';

  const verseInfo = document.getElementById('dockVerseInfo');
  if (verseInfo) verseInfo.textContent = isWsActive 
    ? `Verse Studio · Sure ${sTitle2} · Vers ${wsAyah}`
    : `Muṣḥaf (Seite ${state.currentPage}) · Sure ${sTitle1} · Vers ${curV.num}`;

  const loopBadge = document.getElementById('dockLoopBadge');
  if (loopBadge) loopBadge.textContent = `${state.currentIteration} / ${state.repeatTarget === 999 ? '∞' : state.repeatTarget}`;
}

// Global Audio Ended Event Handler
audio.addEventListener('ended', () => {
  // 1. Repetition Studio Tab Handling
  if (state.activeTab === 'repetition' && state.isRepeatPlaying) {
    const statusEl = document.getElementById('repStatusNotice');
    if (statusEl) statusEl.innerHTML = '🎙️ <em>Sprechpause: Sprich den Vers jetzt laut nach... (3,5s)</em>';

    state.repeatPauseTimer = setTimeout(() => {
      if (!state.isRepeatPlaying) return;
      if (state.repeatCurrentLoop < state.repeatLoopTarget) {
        state.repeatCurrentLoop++;
        renderRepetitionDisplay();
        playRepeatCurrent();
      } else {
        state.repeatCurrentLoop = 1;
        state.repeatQueueIdx = (state.repeatQueueIdx + 1) % state.repeatQueue.length;
        renderRepetitionDisplay();
        playRepeatCurrent();
      }
    }, state.repeatPauseSeconds * 1000);
    return;
  }

  // 2. Word Studio Independent Loop & Progression
  if (state.playbackSource === 'wordStudio') {
    if (state.currentIteration < state.repeatTarget) {
      state.currentIteration++;
      updateDockDisplay();
      audio.play();
    } else {
      state.currentIteration = 1;
      playNextAyah();
    }
    return;
  }

  // 3. Standard Mushaf Playback Loop Handling
  if (state.currentIteration < state.repeatTarget) {
    state.currentIteration++;
    updateDockDisplay();
    audio.play();
  } else {
    state.currentIteration = 1;
    playNextAyah();
  }
});

// ============================================================
// 12. PROGRESSIVE VIRTUAL MUSHAF RECITATION STUDIO (TAB 3)
// ============================================================
let recognition = null;
let isReciteListening = false;
let reciteSurah = 1;
let reciteStartAyah = 1;
let reciteTargetIdx = 0;
let cumulativeRecitedAyahs = [];

function cleanArabicForMatch(str) {
  if (!str) return '';
  return str
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, '')
    .replace(/[إأآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[^\u0600-\u06FF\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function initMicTestDisplay() {
  populateReciteSurahDropdown();
  populateReciteAyahDropdown();
  updateCumulativeBoard();
  updateRecitePromptDisplay();
}

function populateReciteSurahDropdown() {
  const sel = document.getElementById('reciteSurahSelect');
  if (!sel || sel.options.length > 0) return;
  sel.innerHTML = '';
  if (typeof ALL_114_SURAHS !== 'undefined') {
    ALL_114_SURAHS.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = `${s.id}. ${s.name} (${s.arabic})`;
      if (s.id === reciteSurah) opt.selected = true;
      sel.appendChild(opt);
    });
  }
}

function populateReciteAyahDropdown() {
  const sel = document.getElementById('reciteAyahSelect');
  if (!sel) return;
  sel.innerHTML = '';
  const verses = getVersesForSurah(reciteSurah);
  verses.forEach(v => {
    const opt = document.createElement('option');
    opt.value = v.num;
    opt.textContent = `Vers ${v.num}`;
    if (v.num === reciteStartAyah) opt.selected = true;
    sel.appendChild(opt);
  });
}

function onReciteSurahChange(sId) {
  reciteSurah = parseInt(sId, 10);
  reciteStartAyah = 1;
  reciteTargetIdx = 0;
  cumulativeRecitedAyahs = [];
  populateReciteAyahDropdown();
  updateCumulativeBoard();
  updateRecitePromptDisplay();
  showToast(`Sure ${reciteSurah} zum Rezitationstest ausgewählt 🎙️`);
}
window.onReciteSurahChange = onReciteSurahChange;

function onReciteAyahChange(aNum) {
  reciteStartAyah = parseInt(aNum, 10);
  const verses = getVersesForSurah(reciteSurah);
  const foundIdx = verses.findIndex(v => v.num === reciteStartAyah);
  reciteTargetIdx = (foundIdx >= 0) ? foundIdx : 0;
  cumulativeRecitedAyahs = [];
  updateCumulativeBoard();
  updateRecitePromptDisplay();
}
window.onReciteAyahChange = onReciteAyahChange;

function resetReciteTafel() {
  cumulativeRecitedAyahs = [];
  const verses = getVersesForSurah(reciteSurah);
  const foundIdx = verses.findIndex(v => v.num === reciteStartAyah);
  reciteTargetIdx = (foundIdx >= 0) ? foundIdx : 0;
  updateCumulativeBoard();
  updateRecitePromptDisplay();
  const fb = document.getElementById('micFeedbackText');
  if (fb) fb.innerHTML = 'Muṣḥaf-Tafel zurückgesetzt. Klicke auf das Mikrofon und beginne zu rezitieren!';
  showToast("Muṣḥaf-Tafel zurückgesetzt ✨");
}
window.resetReciteTafel = resetReciteTafel;

function updateCumulativeBoard() {
  const titleEl = document.getElementById('cumulativeSurahTitle');
  const bismEl = document.getElementById('cumulativeBismillah');
  const textContainer = document.getElementById('cumulativeMushafText');

  const sMeta = (typeof ALL_114_SURAHS !== 'undefined') ? ALL_114_SURAHS.find(s => s.id === reciteSurah) : null;
  if (titleEl) {
    titleEl.textContent = sMeta ? `سورة ${sMeta.arabic} (${sMeta.name})` : `Sure ${reciteSurah}`;
  }
  if (bismEl) {
    bismEl.style.display = (reciteSurah === 9) ? 'none' : 'block';
  }

  if (!textContainer) return;

  if (cumulativeRecitedAyahs.length === 0) {
    textContainer.innerHTML = `
      <div style="color: rgba(229, 184, 76, 0.45); font-size: 1.4rem; font-style: italic; text-align: center; padding: 30px 10px; line-height: 2;">
        Die Muṣḥaf-Tafel ist bereit. Rezitiere den ersten Vers über das Mikrofon – er erscheint dann in authentischer goldener Schrift und bleibt für immer auf der Tafel stehen!
      </div>
    `;
    return;
  }

  let html = '';
  cumulativeRecitedAyahs.forEach((ay, idx) => {
    const isLatest = (idx === cumulativeRecitedAyahs.length - 1);
    html += `
      <span class="cum-ayah-span ${isLatest ? 'just-revealed' : ''}">
        ${applyTajweedMarkup(cleanArabicText(ay.ar))}
        <span class="mushaf-rosette">﴿${toArDigits(ay.num)}﴾</span>
      </span>
    `;
  });
  textContainer.innerHTML = html;
}

function updateRecitePromptDisplay() {
  const verses = getVersesForSurah(reciteSurah);
  const v = verses[reciteTargetIdx];
  const promptBadge = document.getElementById('micPromptBadge');
  const targetLabel = document.getElementById('blindTargetAyahLabel');
  const hintText = document.getElementById('blindHintText');
  const hintBtn = document.getElementById('blindHintBtn');
  const promptText = document.getElementById('micPromptText');
  const promptTranslation = document.getElementById('micPromptTranslation');

  if (hintText) {
    hintText.style.display = 'none';
    hintText.textContent = '';
  }
  if (hintBtn) {
    hintBtn.innerHTML = '<i class="fa-regular fa-lightbulb"></i> Tipp anzeigen (erstes Wort)';
  }

  if (!v) {
    autoContinuousActive = false;
    if (recognition) try { recognition.stop(); } catch(e){}
    isReciteListening = false;
    if (typeof updateMicButtonsUI === 'function') updateMicButtonsUI(false);
    if (promptBadge) promptBadge.innerHTML = `<i class="fa-solid fa-circle-check" style="color: #10b981;"></i> Alle Verse dieser Sure gemeistert!`;
    if (targetLabel) targetLabel.textContent = `🎉 MāshāAllāh! Alle Verse erfolgreich rezitiert!`;
    if (promptText) promptText.textContent = '';
    if (promptTranslation) promptTranslation.textContent = '';
    const fb = document.getElementById('micFeedbackText');
    if (fb) {
      fb.innerHTML = `
        <div style="color: #10b981; font-weight: 800; font-size: 1.3rem; margin-bottom: 8px;">
          🎉 MāshāAllāh! Herzlichen Glückwunsch!
        </div>
        <div style="color: #f8fafc; font-size: 1.05rem;">
          Du hast alle Verse der Sure ${reciteSurah} auswendig rezitiert und deine Muṣḥaf-Tafel vollständig vollendet!
        </div>
      `;
    }
    return;
  }

  const sMeta = (typeof ALL_114_SURAHS !== 'undefined') ? ALL_114_SURAHS.find(s => s.id === reciteSurah) : null;
  const sTitle = sMeta ? `${sMeta.arabic} (${sMeta.name})` : `Sure ${reciteSurah}`;

  if (promptBadge) {
    promptBadge.innerHTML = `<i class="fa-solid fa-eye-slash"></i> Blind-Hifz-Test: Sure ${sTitle} · Vers ${v.num} von ${verses.length}`;
  }
  if (targetLabel) {
    targetLabel.textContent = `Vers ${v.num} auswendig rezitieren`;
  }
  // The Arabic verse text is strictly HIDDEN from the prompt card
  if (promptText) promptText.textContent = '';
  if (promptTranslation) promptTranslation.textContent = '';
}

function toggleBlindHint() {
  const verses = getVersesForSurah(reciteSurah);
  const v = verses[reciteTargetIdx];
  if (!v) return;
  const hintText = document.getElementById('blindHintText');
  const hintBtn = document.getElementById('blindHintBtn');
  if (!hintText) return;

  if (hintText.style.display === 'none') {
    const words = cleanArabicText(v.ar).split(' ').filter(Boolean);
    const hintWords = words.slice(0, 2).join(' ') + ' ...';
    hintText.textContent = hintWords;
    hintText.style.display = 'block';
    if (hintBtn) hintBtn.innerHTML = '<i class="fa-solid fa-eye-slash"></i> Tipp verbergen';
  } else {
    hintText.style.display = 'none';
    if (hintBtn) hintBtn.innerHTML = '<i class="fa-regular fa-lightbulb"></i> Tipp anzeigen (erstes Wort)';
  }
}
window.toggleBlindHint = toggleBlindHint;

// Levenshtein distance for word-level fuzzy matching
function levenshteinDist(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function isArabicWordMatch(w1, w2) {
  if (w1 === w2) return true;
  // If words are at least 3 letters, allow distance of 1 (handles subtle speech-to-text variation)
  if (w1.length >= 3 && w2.length >= 3) {
    if (levenshteinDist(w1, w2) <= 1) return true;
  }
  return false;
}

function checkRecitationAccuracy(transcript) {
  const verses = getVersesForSurah(reciteSurah);
  const v = verses[reciteTargetIdx];
  if (!v) return;

  const spoken = cleanArabicForMatch(transcript);
  let targetClean = cleanArabicForMatch(v.ar);
  // If first verse of surah, strip bismillah for matching
  if (v.num === 1 && v.surahNum !== 1) {
    targetClean = targetClean.replace(/^بسم الله الرحمن الرحيم\s*/, '').trim();
  }

  const spokenWords = spoken.split(' ').filter(Boolean);
  const targetWords = targetClean.split(' ').filter(Boolean);

  if (targetWords.length === 0) return;

  // Tarteel.ai inspired Word Alignment & Mistake Detection (MMD)
  const wordStatus = [];
  let matchedCount = 0;
  let sIdx = 0;

  for (let tIdx = 0; tIdx < targetWords.length; tIdx++) {
    const tWord = targetWords[tIdx];
    let found = false;

    // Look ahead in spoken words window
    for (let look = sIdx; look < Math.min(sIdx + 3, spokenWords.length); look++) {
      if (isArabicWordMatch(tWord, spokenWords[look])) {
        found = true;
        sIdx = look + 1;
        break;
      }
    }

    if (found) {
      wordStatus.push({ word: tWord, status: 'ok' });
      matchedCount++;
    } else {
      wordStatus.push({ word: tWord, status: 'missed' });
    }
  }

  const accuracy = Math.round((matchedCount / targetWords.length) * 100);
  const fb = document.getElementById('micFeedbackText');

  // Strict threshold: requires at least 70% word accuracy. No loose 2-word fallbacks!
  const isPass = (accuracy >= 70);

  if (isPass) {
    // SUCCESS! Verse verified
    cumulativeRecitedAyahs.push(v);
    reciteTargetIdx++;
    updateCumulativeBoard();
    updateRecitePromptDisplay();

    if (autoContinuousActive) {
      showToast(`✨ Sehr gut! Vers ${v.num} gemeistert ➔ Höre nächsten Vers...`);
    } else {
      showToast(`✓ Vers ${v.num} gemeistert (${accuracy}%) ⭐`);
    }

    if (fb) {
      const nextV = verses[reciteTargetIdx];
      const nextMsg = nextV 
        ? `👉 Sehr gut! Bitte rezitiere jetzt Vers ${nextV.num} aus dem Gedächtnis...` 
        : `🎉 MāshāAllāh! Alle Verse der Sure wurden erfolgreich gemeistert!`;
      
      const wordsHtml = wordStatus.map(ws => 
        `<span style="color: #4ade80; font-weight: 700; margin: 0 4px; padding: 2px 4px;">${ws.word}</span>`
      ).join(' ');

      fb.innerHTML = `
        <div style="background: rgba(16, 185, 129, 0.15); border: 1.5px solid #10b981; border-radius: 12px; padding: 14px 18px; margin-top: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="color: #10b981; font-weight: 800; font-size: 1.15rem;">
              <i class="fa-solid fa-circle-check"></i> ✓ Vers ${v.num} erfolgreich gemeistert! (${accuracy}%)
            </span>
            <span style="background: #10b981; color: #042f2e; font-size: 0.8rem; font-weight: 800; padding: 2px 8px; border-radius: 6px;">
              MāshāAllāh
            </span>
          </div>
          <div style="font-family: var(--quran-font); font-size: 1.5rem; line-height: 2; margin: 10px 0; direction: rtl; text-align: right;">
            ${wordsHtml}
          </div>
          <div style="color: #86efac; font-size: 0.95rem; font-weight: 600; margin-top: 6px;">
            ${nextMsg}
          </div>
        </div>
      `;
    }
  } else {
    // MISTAKE DETECTED - Tarteel AI Style Feedback Card
    if (fb) {
      const wordsBreakdown = wordStatus.map(ws => {
        if (ws.status === 'ok') {
          return `<span style="color: #4ade80; font-weight: 700; margin: 0 4px; padding: 2px 6px; background: rgba(34, 197, 94, 0.15); border-radius: 4px;" title="Richtig">${ws.word}</span>`;
        } else {
          return `<span style="color: #f87171; text-decoration: underline wavy #ef4444; font-weight: 700; margin: 0 4px; padding: 2px 6px; background: rgba(239, 68, 68, 0.2); border-radius: 4px;" title="Falsch oder ausgelassen">${ws.word}</span>`;
        }
      }).join(' ');

      fb.innerHTML = `
        <div style="background: rgba(239, 68, 68, 0.12); border: 1.5px solid #ef4444; border-radius: 14px; padding: 16px 20px; margin-top: 8px; text-align: right; direction: rtl;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; direction: ltr;">
            <span style="background: #ef4444; color: #fff; font-size: 0.85rem; font-weight: 800; padding: 3px 10px; border-radius: 6px;">
              Genauigkeit: ${accuracy}% (Fehler erkannt)
            </span>
            <span style="color: #fca5a5; font-weight: 800; font-size: 1.1rem;">
              <i class="fa-solid fa-triangle-exclamation" style="color: #ef4444;"></i> Fehler in der Rezitation (Vers ${v.num})
            </span>
          </div>

          <div style="font-size: 0.95rem; color: #cbd5e1; margin-bottom: 8px; text-align: right;">
            Wort-für-Wort Fehleranalyse (Tarteel-Modus):
            <span style="font-size: 0.85rem; color: #94a3b8; display: block; margin-top: 2px;">
              <span style="color: #4ade80;">● Grün: Richtig</span> &nbsp;|&nbsp; 
              <span style="color: #f87171;">● Rot: Falsch oder ausgelassen</span>
            </span>
          </div>

          <div style="font-family: var(--quran-font); font-size: 1.6rem; line-height: 2.2; margin: 12px 0; padding: 10px 14px; background: rgba(0,0,0,0.3); border-radius: 8px;">
            ${wordsBreakdown}
          </div>

          <div style="font-size: 0.9rem; color: #94a3b8; margin-bottom: 12px; text-align: left; direction: ltr;">
            Erkanntes Audio: <span style="color: #fef08a; font-family: var(--quran-font); font-size: 1.15rem;">${transcript || '(Keine deutliche Stimme erkannt)'}</span>
          </div>

          <!-- Tarteel Action Tools -->
          <div style="display: flex; gap: 10px; justify-content: flex-end; align-items: center; margin-top: 14px; direction: ltr;">
            <button class="action-btn" onclick="toggleSpeechTest()" style="background: #2563eb; color: #fff; font-weight: 700; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer;">
              <i class="fa-solid fa-rotate-right"></i> Nochmal versuchen
            </button>
            <button class="action-btn" onclick="playSingleAyah(${v.surahNum}, ${v.num})" style="background: #059669; color: #fff; font-weight: 700; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer;">
              <i class="fa-solid fa-volume-high"></i> Korrekte Rezitation anhören
            </button>
          </div>
        </div>
      `;
    }
    showToast(`⚠️ Fehler in Vers ${v.num} erkannt (${accuracy}%) – Bitte nochmal rezitieren 🎙️`);
  }
}

let isAutoContinuousMode = false;
let autoContinuousActive = false;

function updateMicButtonsUI(isRecording) {
  const singleBtn = document.getElementById('micStartBtn');
  const autoBtn = document.getElementById('micAutoContinuousBtn');
  if (singleBtn) {
    singleBtn.classList.toggle('recording', isRecording && !isAutoContinuousMode);
    singleBtn.innerHTML = (isRecording && !isAutoContinuousMode)
      ? '<i class="fa-solid fa-microphone-lines"></i> Höre Einzelvers...'
      : '<i class="fa-solid fa-microphone"></i> 🎙️ Einzelvers rezitieren';
  }
  if (autoBtn) {
    autoBtn.classList.toggle('recording', isRecording && isAutoContinuousMode);
    autoBtn.innerHTML = (isRecording && isAutoContinuousMode)
      ? '<i class="fa-solid fa-circle-stop"></i> ⏹️ Stopp'
      : '<i class="fa-solid fa-wand-magic-sparkles"></i> ✨ Kontinuierliche Rezitation (Tarteel AI)';
  }
}

function toggleSpeechTest(autoMode) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    showToast('Auf Safari/iOS bitte Mikrofon-Berechtigung erteilen 🎙️');
    const vBtn = document.getElementById('voiceRecordBtn');
    if (vBtn) vBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  const requestedAuto = (autoMode === true);

  if (isReciteListening) {
    if (requestedAuto === isAutoContinuousMode) {
      autoContinuousActive = false;
      if (recognition) try { recognition.stop(); } catch(e){}
      isReciteListening = false;
      updateMicButtonsUI(false);
      showToast("Sprachaufnahme beendet ⏹️");
      return;
    } else {
      autoContinuousActive = false;
      if (recognition) try { recognition.stop(); } catch(e){}
      isReciteListening = false;
      updateMicButtonsUI(false);
    }
  }

  isAutoContinuousMode = requestedAuto;
  autoContinuousActive = requestedAuto;

  if (recognition) {
    try { recognition.abort(); } catch(e){}
    recognition = null;
  }

  recognition = new SpeechRecognition();
  recognition.lang = 'ar-SA';
  recognition.continuous = isAutoContinuousMode;
  recognition.interimResults = false;

  recognition.onstart = () => {
    isReciteListening = true;
    updateMicButtonsUI(true);
    const fb = document.getElementById('micFeedbackText');
    if (fb) {
      fb.innerHTML = isAutoContinuousMode 
        ? '✨ <strong>Tarteel AI aktiv:</strong> Rezitiere fortlaufend; sobald ein Vers stimmt, wird er eingetragen und der nächste Vers angehört...'
        : '🎙️ <em>Höre zu... Bitte rezitiere den Vers mit schöner Stimme!</em>';
    }
  };

  recognition.onresult = (event) => {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    checkRecitationAccuracy(transcript);
  };

  recognition.onerror = (e) => {
    if (autoContinuousActive && (e.error === 'no-speech' || e.error === 'network')) {
      return;
    }
    const fb = document.getElementById('micFeedbackText');
    if (fb && !autoContinuousActive) {
      fb.textContent = `Hinweis: ${e.error || 'Kein Ton erfasst'}. Bitte noch einmal versuchen!`;
    }
  };

  recognition.onend = () => {
    isReciteListening = false;
    if (autoContinuousActive) {
      setTimeout(() => {
        if (autoContinuousActive) {
          try {
            recognition.start();
            isReciteListening = true;
            updateMicButtonsUI(true);
          } catch(e) {}
        }
      }, 250);
    } else {
      updateMicButtonsUI(false);
    }
  };

  try {
    recognition.start();
  } catch (e) {
    console.log('Recognition start note:', e);
  }
}
window.toggleSpeechTest = toggleSpeechTest;

// ============================================================
// UNIVERSAL VOICE RECORDER & PLAYBACK (IPAD SAFARI & ALL BROWSERS)
// ============================================================
let mediaRecorderInstance = null;
let recordedAudioChunks = [];
let recordedAudioBlobUrl = null;

async function toggleVoiceRecording() {
  const recBtn = document.getElementById('voiceRecordBtn');
  const playBtn = document.getElementById('voicePlayBtn');
  const statusEl = document.getElementById('voiceRecordStatus');

  if (mediaRecorderInstance && mediaRecorderInstance.state === 'recording') {
    mediaRecorderInstance.stop();
    if (recBtn) {
      recBtn.innerHTML = '<i class="fa-solid fa-microphone"></i> 🎙️ Audio aufnehmen';
      recBtn.classList.remove('recording');
      recBtn.style.background = 'linear-gradient(135deg, #059669, #047857)';
    }
    if (statusEl) statusEl.textContent = '✅ Aufnahme beendet. Klicke auf Aufnahme abhören.';
    showToast('صدا ضبط شد! ✅');
    return;
  }

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showToast('Audioaufnahme wird nicht unterstützt.');
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recordedAudioChunks = [];
    mediaRecorderInstance = new MediaRecorder(stream);
    
    mediaRecorderInstance.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) recordedAudioChunks.push(e.data);
    };

    mediaRecorderInstance.onstop = () => {
      const mime = mediaRecorderInstance.mimeType || 'audio/webm';
      const blob = new Blob(recordedAudioChunks, { type: mime });
      if (recordedAudioBlobUrl) {
        URL.revokeObjectURL(recordedAudioBlobUrl);
      }
      recordedAudioBlobUrl = URL.createObjectURL(blob);
      if (playBtn) playBtn.style.display = 'inline-flex';
      stream.getTracks().forEach(track => track.stop());
    };

    mediaRecorderInstance.start();
    if (recBtn) {
      recBtn.innerHTML = '<i class="fa-solid fa-stop"></i> ⏹️ توقف ضبط تلاوت';
      recBtn.classList.add('recording');
      recBtn.style.background = 'linear-gradient(135deg, #dc2626, #b91c1c)';
    }
    if (statusEl) statusEl.textContent = '🎙️ Aufnahme läuft... Rezitiere den Vers und tippe auf Stopp.';
    showToast('در حال ضبط صدا... 🎙️');
  } catch (err) {
    console.warn('Voice Recording error:', err);
    showToast('Mikrofonzugriff nicht gestattet.');
  }
}
window.toggleVoiceRecording = toggleVoiceRecording;

function playUserRecordedAudio() {
  if (recordedAudioBlobUrl) {
    const audio = new Audio(recordedAudioBlobUrl);
    audio.play();
    showToast('Spiele deine Aufnahme ab 🎧');
  } else {
    showToast('Noch keine Aufnahme vorhanden.');
  }
}
window.playUserRecordedAudio = playUserRecordedAudio;

// ============================================================
// 13. THEMES & COLOR STYLES
// ============================================================
const PALETTES = {
  gold: { primary: '#e5b84c', light: '#fef08a', border: 'rgba(229,184,76,0.4)' },
  emerald: { primary: '#10b981', light: '#a7f3d0', border: 'rgba(16,185,129,0.4)' },
  cyan: { primary: '#06b6d4', light: '#a5f3fc', border: 'rgba(6,182,212,0.4)' },
  ruby: { primary: '#f43f5e', light: '#fecdd3', border: 'rgba(244,63,94,0.4)' },
  amethyst: { primary: '#a855f7', light: '#f3e8ff', border: 'rgba(168,85,247,0.4)' }
};

function changeAccentColor(colorName) {
  const p = PALETTES[colorName] || PALETTES.gold;
  document.documentElement.style.setProperty('--gold-primary', p.primary);
  document.documentElement.style.setProperty('--gold-light', p.light);
  document.documentElement.style.setProperty('--gold-border', p.border);
  localStorage.setItem('userAccentColor', colorName);
  const sel = document.getElementById('themeAccentSelect');
  if (sel) sel.value = colorName;
  showToast(`Akzentfarbe: ${colorName} aktiviert ✨`);
}

function changeBackgroundTheme(themeName) {
  document.body.className = `theme-${themeName}`;
  localStorage.setItem('userBgTheme', themeName);
  const sel = document.getElementById('themeBgSelect');
  if (sel) sel.value = themeName;
  showToast(`Design: ${themeName} aktiviert 🎨`);
}

function changeMushafPalette(paletteName) {
  const card = document.getElementById('mushafPageCard');
  if (card) {
    card.className = `mushaf-page-card mushaf-theme-${paletteName}`;
  }
  localStorage.setItem('userMushafPalette', paletteName);
  const sel = document.getElementById('mushafPaletteSelect');
  if (sel) sel.value = paletteName;
  showToast(`Muṣḥaf-Farbe: ${paletteName} aktiviert 📖`);
}

function initThemePreferences() {
  const bg = localStorage.getItem('userBgTheme') || 'fantasy';
  changeBackgroundTheme(bg);
  const accent = localStorage.getItem('userAccentColor') || 'gold';
  changeAccentColor(accent);
  const mushafPal = localStorage.getItem('userMushafPalette') || 'cream';
  changeMushafPalette(mushafPal);
}

// ============================================================
// 14. BOOKMARK & TOAST NOTIFICATION
// ============================================================
function saveLastBookmark() {
  localStorage.setItem('quran_last_page', String(state.currentPage));
}

function loadLastBookmark() {
  const p = parseInt(localStorage.getItem('quran_last_page'), 10);
  return (p >= 1 && p <= 604) ? p : 1;
}

let toastTimer = null;
function showToast(msg) {
  const toast = document.getElementById('globalToast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

// ============================================================
// ============================================================
// SIDEBAR & WORKSPACE COUPLING HELPERS
// ============================================================
function jumpToSurah(surahId) {
  surahId = parseInt(surahId, 10);
  if (typeof ALL_114_SURAHS !== 'undefined') {
    const meta = ALL_114_SURAHS.find(s => s.id === surahId);
    if (meta && meta.startPage) {
      loadPage(meta.startPage);
    }
  }
}
window.jumpToSurah = jumpToSurah;

function onSurahSelected() {
  const el = document.getElementById('allSurahsSelect');
  if (el) jumpToSurah(el.value);
}
window.onSurahSelected = onSurahSelected;

function jumpToPage(pageNum) {
  const p = parseInt(pageNum, 10);
  if (!isNaN(p) && p >= 1 && p <= 604) {
    loadPage(p);
  }
}
window.jumpToPage = jumpToPage;

function onPageInputChanged() {
  const el = document.getElementById('pageNumberInput');
  if (el) jumpToPage(el.value);
}
window.onPageInputChanged = onPageInputChanged;

function saveCurrentBookmark() {
  localStorage.setItem('quran_last_page', String(state.currentPage));
  const el = document.getElementById('lastReadBookmarkText');
  if (el) el.textContent = `Gespeichert auf Seite ${state.currentPage} (Sure ${state.currentSurah}) ✨`;
  showToast(`Lesezeichen auf Seite ${state.currentPage} gesichert! 🔖`);
}
window.saveCurrentBookmark = saveCurrentBookmark;

function resumeFromBookmark() {
  const p = parseInt(localStorage.getItem('quran_last_page'), 10) || 1;
  loadPage(p);
  showToast(`Lesezeichen geladen: Seite ${p} 📖`);
}
window.resumeFromBookmark = resumeFromBookmark;

function setRepeatCount(count, btn) {
  state.repeatTarget = count;
  state.repeatLoopTarget = count;
  document.querySelectorAll('.repeat-btn, .loop-btn').forEach(b => {
    const val = parseInt(b.textContent, 10);
    const isTarget = (count === 999 && b.textContent.includes('∞')) || (val === count);
    b.classList.toggle('active', isTarget);
  });
  updateDockDisplay();
  if (state.activeTab === 'repetition') renderRepetitionDisplay();
  showToast(`Wiederholungen pro Vers: ${count === 999 ? 'Unendlich (∞)' : count + '×'}`);
}
window.setRepeatCount = setRepeatCount;
window.setRepeatLoopCount = setRepeatCount;
window.setRepeatLoopTarget = setRepeatCount;

function onQariChanged(val) {
  if (typeof val === 'object' && val && val.target) {
    val = val.target.value;
  }
  if (!val) {
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.id === 'qariSelect' || activeEl.id === 'dockQariSelect' || activeEl.id === 'mushafToolbarQariSelect' || activeEl.id === 'mushafPlayerQariSelect' || activeEl.id === 'wsPlayerQariSelect')) {
      val = activeEl.value;
    } else {
      const el = document.getElementById('mushafToolbarQariSelect') || document.getElementById('mushafPlayerQariSelect') || document.getElementById('wsPlayerQariSelect') || document.getElementById('qariSelect');
      if (el) val = el.value;
    }
  }
  if (!val) return;
  state.qari = val;
  try { localStorage.setItem('quran_qari', val); } catch (e) {}

  // Synchronize ALL reciter dropdowns across Section 1, Section 2, toolbar, bottom dock, and sidebar
  ['dockQariSelect', 'mushafToolbarQariSelect', 'qariSelect', 'mushafPlayerQariSelect', 'wsPlayerQariSelect'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = val;
  });

  const refEl = document.getElementById('mushafPlayerQariSelect') || document.getElementById('mushafToolbarQariSelect') || document.getElementById('wsPlayerQariSelect') || document.getElementById('qariSelect');
  const qName = (refEl && refEl.selectedOptions[0]) ? refEl.selectedOptions[0].text : val;
  showToast(`🎙️ Rezitator ausgewählt: ${qName}`);

  // If audio is playing, immediately replay the active verse with the newly chosen reciter
  if (state.isPlaying) {
    if (state.playbackSource === 'wordStudio' && state.wordStudioPlayingSurah) {
      playWordStudioAyah(state.wordStudioPlayingSurah, state.wordStudioPlayingAyah, state.wordStudioPlayingIdx);
    } else {
      playAyahAt(state.currentAyahIdx);
    }
  }
}
window.onQariChanged = onQariChanged;

function changeSpeed(val) {
  if (val) {
    state.speed = parseFloat(val);
  } else {
    const el = document.getElementById('mushafPlayerSpeedSelect') || document.getElementById('wsPlayerSpeedSelect') || document.getElementById('audioSpeedSelect') || document.getElementById('dockSpeedSelect');
    if (el) state.speed = parseFloat(el.value);
  }
  audio.playbackRate = state.speed;
  ['dockSpeedSelect', 'audioSpeedSelect', 'mushafPlayerSpeedSelect', 'wsPlayerSpeedSelect'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = state.speed;
  });
  showToast(`Geschwindigkeit: ${state.speed}×`);
}
window.changeSpeed = changeSpeed;

function switchMainTab(name) {
  if (name === 'quiz') {
    switchTab('quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  const map = {
    home: 'home',
    mushaf: 'mushaf',
    hifz: 'wordStudio',
    mic: 'micTest',
    tafsir: 'tafsir',
    memorized: 'hifzArchive',
    repeat: 'repetition',
    quiz: 'quiz'
  };
  const target = map[name] || name;
  switchTab(target);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
window.switchMainTab = switchMainTab;

function openAndroidDrawer() {
  const drawer = document.getElementById('androidSideDrawer');
  const backdrop = document.getElementById('androidDrawerBackdrop');
  if (drawer) drawer.classList.add('open');
  if (backdrop) backdrop.style.display = 'block';
}
window.openAndroidDrawer = openAndroidDrawer;

function closeAndroidDrawer() {
  const drawer = document.getElementById('androidSideDrawer');
  const backdrop = document.getElementById('androidDrawerBackdrop');
  if (drawer) drawer.classList.remove('open');
  if (backdrop) backdrop.style.display = 'none';
}
window.closeAndroidDrawer = closeAndroidDrawer;

function switchMainTabAndCloseDrawer(tabName) {
  closeAndroidDrawer();
  switchMainTab(tabName);
}
window.switchMainTabAndCloseDrawer = switchMainTabAndCloseDrawer;

function changeThemeFromDrawer(themeName) {
  document.body.className = '';
  document.body.classList.add(`theme-${themeName}`);
  try {
    localStorage.setItem('quran_app_theme', themeName);
  } catch (e) {}
  
  const headerSel = document.getElementById('themeBgSelect');
  if (headerSel) headerSel.value = themeName;
  const drawerSel = document.getElementById('drawerThemeSelect');
  if (drawerSel) drawerSel.value = themeName;
  
  showToast(`🎨 Theme aktiviert: ${themeName}`);
}
window.changeThemeFromDrawer = changeThemeFromDrawer;

function saveHifzProgressPermanent() {
  try {
    const totalMem = getMemorizedVersesList().length;
    localStorage.setItem('quran_hifz_last_backup_time', new Date().toISOString());
    showToast(`✅ Hifz-Status gesichert! (${totalMem} Verse memorisiert) ⭐`);
  } catch (e) {
    showToast('Fehler beim Sichern des Hifz-Status.');
  }
}
window.saveHifzProgressPermanent = saveHifzProgressPermanent;

function updateDashboardLabels() {
  const descEl = document.getElementById('homeLastReadDesc');
  const p = parseInt(localStorage.getItem('quran_last_page'), 10) || state.currentPage || 1;
  const sNum = state.currentSurah || 1;
  const sMeta = (typeof ALL_114_SURAHS !== 'undefined') ? ALL_114_SURAHS.find(s => s.id === sNum) : null;
  const sTitle = sMeta ? `${sMeta.arabic} (${sMeta.name})` : `Sure ${sNum}`;
  if (descEl) {
    descEl.textContent = `Sure ${sNum}: ${sTitle} · Seite ${p}`;
  }
}
window.updateDashboardLabels = updateDashboardLabels;

// 15. INITIALIZATION ON DOM LOAD
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  initThemePreferences();
  updateHifzCounter();

  // Restore saved language (default German)
  try {
    const savedLang = localStorage.getItem('quran_app_language') || 'de';
    if (typeof setAppLanguage === 'function') setAppLanguage(savedLang);
  } catch (e) {}

  // Restore saved theme
  try {
    const savedTheme = localStorage.getItem('quran_app_theme');
    if (savedTheme) {
      document.body.className = '';
      document.body.classList.add(`theme-${savedTheme}`);
      const drawerSel = document.getElementById('drawerThemeSelect');
      if (drawerSel) drawerSel.value = savedTheme;
    }
  } catch (e) {}

  if (typeof updateDashboardLabels === 'function') updateDashboardLabels();

  // Populate Sidebar Surahs
  ['allSurahsSelect'].forEach(selId => {
    const sel = document.getElementById(selId);
    if (sel && typeof ALL_114_SURAHS !== 'undefined') {
      sel.innerHTML = '';
      ALL_114_SURAHS.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.id;
        opt.textContent = `${s.id}. ${s.name} (${s.arabic})`;
        sel.appendChild(opt);
      });
    }
  });

  const lastBookmark = loadLastBookmark();
  const bText = document.getElementById('lastReadBookmarkText');
  if (bText && lastBookmark) {
    bText.textContent = `Zuletzt auf Seite ${lastBookmark} gelesen.`;
  }

  // Sync & restore saved Qari
  try {
    const savedQari = localStorage.getItem('quran_qari');
    if (savedQari) state.qari = savedQari;
    const savedFont = localStorage.getItem('quran_font_choice');
    if (savedFont) {
      setQuranFont(savedFont);
    }
  } catch (e) {}

  ['dockQariSelect', 'mushafToolbarQariSelect', 'qariSelect', 'mushafPlayerQariSelect', 'wsPlayerQariSelect'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.value = state.qari;
      el.onchange = function() { onQariChanged(this.value); };
    }
  });

  const fontEl = document.getElementById('mushafFontSelect');
  if (fontEl && state.quranFont) {
    fontEl.value = state.quranFont;
  }

  // Populate Speed Select
  const speedSel = document.getElementById('dockSpeedSelect');
  if (speedSel) {
    speedSel.onchange = function() {
      state.speed = parseFloat(this.value);
      audio.playbackRate = state.speed;
      showToast(`Geschwindigkeit: ${state.speed}×`);
    };
  }

  // Initial Load Page
  const startP = loadLastBookmark();
  loadPage(startP);

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    if (e.key === 'ArrowLeft') turnPage(1);
    if (e.key === 'ArrowRight') turnPage(-1);
    if (e.key === ' ') {
      e.preventDefault();
      toggleMainAudioPlay();
    }
  });

// ============================================================
// MURAJA'A QUIZ ENGINE (Murajaa Quiz)
// ============================================================
let currentMurajaaQuiz = {
  surah: 1,
  ayah: 1,
  nextSurah: 1,
  nextAyah: 2,
  targetAudioUrl: ''
};

function populateMurajaaSurahDropdown() {
  const sel = document.getElementById('mqSurahSelect');
  if (!sel || typeof ALL_114_SURAHS === 'undefined') return;
  sel.innerHTML = '';
  
  const curSurah = state.murajaaSelectedSurah || state.currentSurah || 1;
  ALL_114_SURAHS.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.id;
    opt.textContent = `Sure ${s.id}: ${s.arabic} (${s.name})`;
    if (s.id === curSurah) opt.selected = true;
    sel.appendChild(opt);
  });
}
window.populateMurajaaSurahDropdown = populateMurajaaSurahDropdown;

function onMurajaaSurahChanged(val) {
  state.murajaaSelectedSurah = parseInt(val, 10) || 1;
  setupMurajaaQuestion();
  showToast(`🎯 Hifz-Test für Sure ${val} eingestellt`);
}
window.onMurajaaSurahChanged = onMurajaaSurahChanged;

function openMurajaaQuizModal() {
  const modal = document.getElementById('murajaaModal');
  if (modal) {
    modal.style.display = 'flex';
    if (!state.murajaaSelectedSurah) {
      state.murajaaSelectedSurah = state.currentSurah || 1;
    }
    populateMurajaaSurahDropdown();
    setupMurajaaQuestion();
  }
}
window.openMurajaaQuizModal = openMurajaaQuizModal;

function closeMurajaaQuizModal() {
  const modal = document.getElementById('murajaaModal');
  if (modal) modal.style.display = 'none';
}
window.closeMurajaaQuizModal = closeMurajaaQuizModal;

function setupMurajaaQuestion() {
  const surahId = state.murajaaSelectedSurah || state.currentSurah || 1;
  const verses = getVersesForSurah(surahId);
  
  if (!verses || verses.length < 2) {
    showToast('Für diese Sure sind nicht genügend Verse vorhanden.');
    return;
  }

  const maxIdx = Math.max(0, verses.length - 2);
  const qIdx = Math.floor(Math.random() * (maxIdx + 1));
  const vPrompt = verses[qIdx];
  const vTarget = verses[qIdx + 1];

  currentMurajaaQuiz = {
    surah: vPrompt.surahNum,
    ayah: vPrompt.num,
    nextSurah: vTarget.surahNum,
    nextAyah: vTarget.num,
    targetAudioUrl: getAyahAudioUrl(vTarget.surahNum, vTarget.num)
  };

  const tagPrompt = document.getElementById('mqPromptTag');
  const textPrompt = document.getElementById('mqPromptText');
  const tagTarget = document.getElementById('mqTargetTag');
  const textTarget = document.getElementById('mqTargetText');
  const germanTarget = document.getElementById('mqTargetGerman');
  const cardTarget = document.getElementById('mqTargetCard');

  const sMeta = (typeof ALL_114_SURAHS !== 'undefined') ? ALL_114_SURAHS.find(s => s.id === vPrompt.surahNum) : null;
  const sTitle = sMeta ? `${sMeta.arabic} (${sMeta.name})` : `Sure ${vPrompt.surahNum}`;

  if (tagPrompt) tagPrompt.textContent = `Sure ${sTitle} · Vers ${vPrompt.num}`;
  if (textPrompt) textPrompt.innerHTML = state.tajweedEnabled ? applyTajweedMarkup(cleanArabicText(vPrompt.ar)) : cleanArabicText(vPrompt.ar);

  if (tagTarget) tagTarget.textContent = `Nächster Vers: Sure ${vTarget.surahNum} · Vers ${vTarget.num}`;
  if (textTarget) textTarget.innerHTML = `${state.tajweedEnabled ? applyTajweedMarkup(cleanArabicText(vTarget.ar)) : cleanArabicText(vTarget.ar)} <span class="mushaf-rosette">﴿${toArDigits(vTarget.num)}﴾</span>`;
  if (germanTarget) germanTarget.textContent = (vTarget.de || 'Übersetzung wird geladen...');

  if (cardTarget) {
    cardTarget.classList.add('murajaa-blurred');
  }
}
window.setupMurajaaQuestion = setupMurajaaQuestion;

function revealMurajaaAnswer() {
  const cardTarget = document.getElementById('mqTargetCard');
  if (cardTarget) {
    cardTarget.classList.remove('murajaa-blurred');
  }
  showToast('👁️ Nächster Vers aufgedeckt! Überprüfe dein Gedächtnis.');
}
window.revealMurajaaAnswer = revealMurajaaAnswer;

function playMurajaaAudio() {
  if (currentMurajaaQuiz.targetAudioUrl) {
    audio.src = currentMurajaaQuiz.targetAudioUrl;
    audio.playbackRate = state.speed;
    audio.play();
    showToast(`🔊 Rezitation für Sure ${currentMurajaaQuiz.nextSurah}:${currentMurajaaQuiz.nextAyah} wird abgespielt`);
  }
}
window.playMurajaaAudio = playMurajaaAudio;

function nextMurajaaQuestion() {
  setupMurajaaQuestion();
}
window.nextMurajaaQuestion = nextMurajaaQuestion;

// ============================================================
// QURANLOOP TYPOGRAPHY & FONT SWITCHER (https://www.quranloop.app/app/mushaf/2)
// ============================================================
state.quranFont = 'UthmanicHafs';
state.quranInk = 'standard';
state.mushafTheme = 'cream';
state.testYourself = false;

function openTypographyModal() {
  const m = document.getElementById('typographyModal');
  if (m) m.style.display = 'flex';
}
window.openTypographyModal = openTypographyModal;

function closeTypographyModal() {
  const m = document.getElementById('typographyModal');
  if (m) m.style.display = 'none';
}
window.closeTypographyModal = closeTypographyModal;

function setQuranFont(fontName) {
  state.quranFont = fontName;
  try { localStorage.setItem('quran_font_choice', fontName); } catch (e) {}

  // Synchronize top toolbar dropdown
  const topSel = document.getElementById('mushafFontSelect');
  if (topSel && topSel.value !== fontName) topSel.value = fontName;

  const cards = {
    'KFGQPC Uthman Taha Naskh': 'fCardMadani',
    'Amiri Quran': 'fCardAmiri',
    'UthmanicHafs': 'fCardDigital',
    'Scheherazade New': 'fCardScheherazade',
    'IndoPak': 'fCardIndoPak'
  };

  Object.keys(cards).forEach(k => {
    const el = document.getElementById(cards[k]);
    if (el) el.classList.toggle('active', k === fontName);
  });

  // Apply to :root dynamically
  let fontStack = '';
  if (fontName === 'KFGQPC Uthman Taha Naskh') {
    fontStack = `'KFGQPC Uthman Taha Naskh', serif`;
  } else if (fontName === 'Amiri Quran') {
    fontStack = `'Amiri Quran', serif`;
  } else if (fontName === 'UthmanicHafs') {
    fontStack = `'UthmanicHafs', serif`;
  } else if (fontName === 'Scheherazade New') {
    fontStack = `'Scheherazade New', serif`;
  } else if (fontName === 'IndoPak') {
    fontStack = `'IndoPak', serif`;
  } else {
    fontStack = `'${fontName}', serif`;
  }

  document.documentElement.style.setProperty('--quran-font', fontStack);

  if (state.activeTab === 'mushaf') renderInteractiveMushaf();
  if (state.activeTab === 'wordStudio') renderWordStudio();
  if (state.activeTab === 'tafsir') renderTafsirStudio();

  const fontGermanName = {
    'KFGQPC Uthman Taha Naskh': '1. Uthmān Taha (Madinah)',
    'Amiri Quran': '2. Amiri Quran (Kairo)',
    'UthmanicHafs': '3. Uthmānisch Digital (QuranLoop)',
    'Scheherazade New': '4. Scheherazade New',
    'IndoPak': '5. IndoPak Nastaliq'
  }[fontName] || fontName;
  showToast(`✨ Schriftart geändert: ${fontGermanName}`);
}
window.setQuranFont = setQuranFont;

function setQuranInk(inkLevel) {
  state.quranInk = inkLevel;
  document.documentElement.setAttribute('data-quran-ink', inkLevel);

  ['standard', 'medium', 'thick'].forEach(lvl => {
    const btn = document.getElementById(`inkBtn${lvl.charAt(0).toUpperCase() + lvl.slice(1)}`);
    if (btn) btn.classList.toggle('active', lvl === inkLevel);
  });

  showToast(`Tintenstärke: ${inkLevel}`);
}
window.setQuranInk = setQuranInk;

function setMushafTheme(theme) {
  state.mushafTheme = theme;
  const card = document.getElementById('mushafPageCard');
  const stage = document.getElementById('mushafInteractiveStage');
  const btnCreme = document.getElementById('mThemeCremeBtn');
  const btnDark = document.getElementById('mThemeDarkBtn');

  if (btnCreme) btnCreme.classList.toggle('active', theme === 'cream');
  if (btnDark) btnDark.classList.toggle('active', theme === 'dark');

  if (card) {
    card.classList.toggle('mushaf-theme-dark', theme === 'dark');
    card.classList.toggle('mushaf-theme-cream', theme === 'cream');
  }
  if (stage) {
    stage.style.background = (theme === 'dark') ? '#0a0a0a' : '#f5f0e6';
  }

  showToast(theme === 'dark' ? '🌙 QuranLoop Dunkel-Modus (#000) aktiviert' : '☀️ Elfenbein-Pergament aktiviert');
}
window.setMushafTheme = setMushafTheme;

function toggleTestYourselfMode() {
  state.testYourself = !state.testYourself;
  const btn = document.getElementById('testYourselfBtn');
  if (btn) {
    btn.classList.toggle('active', state.testYourself);
    btn.textContent = state.testYourself ? 'AN' : 'AUS';
  }
  const stage = document.getElementById('mushafInteractiveStage');
  if (stage) {
    stage.classList.toggle('test-yourself-mode', state.testYourself);
  }
  showToast(state.testYourself ? '🧠 "Test Yourself" aktiv: Nur 1. Wort sichtbar!' : 'Normalansicht wiederhergestellt');
}
window.toggleTestYourselfMode = toggleTestYourselfMode;

// ============================================================
// TAFSIR NAMI PDF ORIGINAL BOOK VIEWER (3 BÄNDE - PDF.js Canvas)
// ============================================================
if (typeof pdfjsLib !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdf.worker.min.js';
}

let currentNamiVol = 1;
let currentNamiPage = 1;
let currentNamiZoom = 1.0;
let namiPdfDocs = {}; // Cache: { 1: doc, 2: doc, 3: doc }
let isNamiRendering = false;
let pendingNamiRender = null;

const NAMI_VOL_PAGE_MAP = {
  1: { maxPage: 576, file: 'TafsirNami_PDFs/tafsir_nami_vol1.pdf' },
  2: { maxPage: 496, file: 'TafsirNami_PDFs/tafsir_nami_vol2.pdf' },
  3: { maxPage: 646, file: 'TafsirNami_PDFs/tafsir_nami_vol3.pdf' }
};

function getVolForSurah(sNum) {
  if (sNum <= 9) return 1;
  if (sNum <= 28) return 2;
  return 3;
}

function openTafsirNamiPdfModal(vol, page) {
  const modal = document.getElementById('namiPdfModal');
  if (!modal) return;
  modal.style.display = 'flex';
  const targetVol = vol || getVolForSurah(state.tafsirSurah || 1);
  const targetPage = page || 1;
  switchNamiVolume(targetVol, targetPage);
}
window.openTafsirNamiPdfModal = openTafsirNamiPdfModal;

function openTafsirNamiPdfModalForSurah(surahNum) {
  const vol = getVolForSurah(surahNum);
  openTafsirNamiPdfModal(vol, 1);
}
window.openTafsirNamiPdfModalForSurah = openTafsirNamiPdfModalForSurah;

function closeTafsirNamiPdfModal() {
  const modal = document.getElementById('namiPdfModal');
  if (modal) modal.style.display = 'none';
}
window.closeTafsirNamiPdfModal = closeTafsirNamiPdfModal;

async function switchNamiVolume(volNum, pageNum) {
  currentNamiVol = volNum;
  const volCfg = NAMI_VOL_PAGE_MAP[volNum] || NAMI_VOL_PAGE_MAP[1];
  currentNamiPage = pageNum || 1;

  [1, 2, 3].forEach(v => {
    const btn = document.getElementById(`namiVol${v}Btn`);
    if (btn) btn.classList.toggle('active', v === volNum);
  });

  const pageInput = document.getElementById('namiPdfPageInput');
  if (pageInput) {
    pageInput.max = volCfg.maxPage;
    pageInput.value = currentNamiPage;
  }

  const totalLbl = document.getElementById('namiPdfTotalPagesLabel');
  if (totalLbl) totalLbl.textContent = `لە ${volCfg.maxPage}`;

  const downloadBtn = document.getElementById('namiDownloadBtn');
  if (downloadBtn) downloadBtn.href = volCfg.file;

  await renderNamiPdfPage(currentNamiPage);
}
window.switchNamiVolume = switchNamiVolume;

async function renderNamiPdfPage(pageNum) {
  const canvas = document.getElementById('namiPdfCanvas');
  const loading = document.getElementById('namiPdfLoadingIndicator');
  if (!canvas || typeof pdfjsLib === 'undefined') return;

  if (isNamiRendering) {
    pendingNamiRender = pageNum;
    return;
  }

  if (loading) loading.style.display = 'flex';
  isNamiRendering = true;

  try {
    const volCfg = NAMI_VOL_PAGE_MAP[currentNamiVol] || NAMI_VOL_PAGE_MAP[1];
    if (!namiPdfDocs[currentNamiVol]) {
      const loadingTask = pdfjsLib.getDocument({
        url: volCfg.file,
        disableWorker: true
      });
      namiPdfDocs[currentNamiVol] = await loadingTask.promise;
    }
    const pdfDoc = namiPdfDocs[currentNamiVol];
    const safePage = Math.max(1, Math.min(pageNum, pdfDoc.numPages));
    currentNamiPage = safePage;

    const pageInput = document.getElementById('namiPdfPageInput');
    if (pageInput) pageInput.value = safePage;

    const page = await pdfDoc.getPage(safePage);
    const container = document.getElementById('namiPdfFrameContainer');
    const availableWidth = container ? (container.clientWidth - 50) : 850;
    const baseViewport = page.getViewport({ scale: 1.0 });
    
    // Fit to container width multiplied by current zoom factor
    const fitScale = (Math.max(400, availableWidth) / baseViewport.width) * currentNamiZoom;
    const viewport = page.getViewport({ scale: fitScale });

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const ctx = canvas.getContext('2d');
    const renderContext = {
      canvasContext: ctx,
      viewport: viewport
    };
    await page.render(renderContext).promise;
  } catch (err) {
    console.error("Error rendering Nami PDF page:", err);
  } finally {
    isNamiRendering = false;
    if (loading) loading.style.display = 'none';
    if (pendingNamiRender !== null) {
      const nextP = pendingNamiRender;
      pendingNamiRender = null;
      renderNamiPdfPage(nextP);
    }
  }
}
window.renderNamiPdfPage = renderNamiPdfPage;

function jumpNamiPdfPage(val) {
  const volCfg = NAMI_VOL_PAGE_MAP[currentNamiVol] || NAMI_VOL_PAGE_MAP[1];
  let p = parseInt(val, 10) || 1;
  if (p < 1) p = 1;
  if (p > volCfg.maxPage) p = volCfg.maxPage;
  currentNamiPage = p;
  renderNamiPdfPage(currentNamiPage);
}
window.jumpNamiPdfPage = jumpNamiPdfPage;

function stepNamiPdfPage(delta) {
  jumpNamiPdfPage(currentNamiPage + delta);
}
window.stepNamiPdfPage = stepNamiPdfPage;

function zoomNamiPdf(delta) {
  let newZoom = Math.round((currentNamiZoom + delta) * 100) / 100;
  if (newZoom < 0.5) newZoom = 0.5;
  if (newZoom > 2.5) newZoom = 2.5;
  currentNamiZoom = newZoom;
  const zoomLbl = document.getElementById('namiZoomLabel');
  if (zoomLbl) zoomLbl.textContent = `${Math.round(currentNamiZoom * 100)}%`;
  renderNamiPdfPage(currentNamiPage);
}
window.zoomNamiPdf = zoomNamiPdf;

function toggleNamiPdfFullscreen() {
  const c = document.getElementById('namiPdfFrameContainer');
  if (!c) return;
  if (!document.fullscreenElement) {
    c.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
}
window.toggleNamiPdfFullscreen = toggleNamiPdfFullscreen;

// ============================================================
// FAMILY PIN LOCK GATEWAY (PIN: 8897)
// ============================================================
const FAMILY_PIN = "8897";
let enteredPin = "";

function checkPinAuth() {
  const overlay = document.getElementById('familyLockScreen');
  if (!overlay) return;
  const isAuth = localStorage.getItem('quran_family_unlocked') === 'true';
  if (isAuth) {
    overlay.style.display = 'none';
  } else {
    overlay.style.display = 'flex';
    enteredPin = '';
    updatePinDots();
  }
}
window.checkPinAuth = checkPinAuth;

function handlePinKey(digit) {
  if (enteredPin.length >= 4) return;
  enteredPin += digit;
  updatePinDots();
  if (enteredPin.length === 4) {
    validatePin();
  }
}
window.handlePinKey = handlePinKey;

function deletePinLast() {
  if (enteredPin.length > 0) {
    enteredPin = enteredPin.slice(0, -1);
    updatePinDots();
  }
}
window.deletePinLast = deletePinLast;

function clearPinInput() {
  enteredPin = '';
  updatePinDots();
  const errMsg = document.getElementById('lockErrorMsg');
  if (errMsg) errMsg.style.display = 'none';
}
window.clearPinInput = clearPinInput;

function updatePinDots() {
  for (let i = 0; i < 4; i++) {
    const dot = document.getElementById(`dot${i}`);
    if (dot) {
      dot.classList.toggle('filled', i < enteredPin.length);
    }
  }
}

function validatePin() {
  if (enteredPin === FAMILY_PIN) {
    localStorage.setItem('quran_family_unlocked', 'true');
    const overlay = document.getElementById('familyLockScreen');
    if (overlay) {
      overlay.style.transition = 'opacity 0.3s ease';
      overlay.style.opacity = '0';
      setTimeout(() => {
        overlay.style.display = 'none';
        overlay.style.opacity = '1';
      }, 300);
    }
    showToast('Willkommen! App entsperrt 🌿');
  } else {
    const errMsg = document.getElementById('lockErrorMsg');
    if (errMsg) errMsg.style.display = 'block';
    const box = document.querySelector('.family-lock-box');
    if (box) {
      box.style.animation = 'none';
      void box.offsetWidth;
      box.style.animation = 'shake 0.4s ease';
    }
    setTimeout(() => {
      clearPinInput();
    }, 700);
  }
}

function lockFamilyApp() {
  localStorage.removeItem('quran_family_unlocked');
  checkPinAuth();
  showToast('برنامه قفل شد 🔒');
}
window.lockFamilyApp = lockFamilyApp;

window.addEventListener('keydown', (e) => {
  const overlay = document.getElementById('familyLockScreen');
  if (overlay && overlay.style.display !== 'none') {
    if (e.key >= '0' && e.key <= '9') {
      handlePinKey(e.key);
    } else if (e.key === 'Backspace') {
      deletePinLast();
    } else if (e.key === 'Escape') {
      clearPinInput();
    }
  }
});

  checkPinAuth();
  console.log("Quran Hifz Master initialized successfully! 📖");
});

// ============================================================
// 16. COMPREHENSIVE UI EXTENSIONS (STEPPERS, LAYOUT, SYNC)
// ============================================================

// Toggle Home Menu Cards Layout (Grid vs List)
function toggleHomeCardsLayout() {
  const grid = document.querySelector('.android-cards-grid');
  const icon = document.getElementById('homeLayoutIcon');
  const label = document.getElementById('homeLayoutLabel');
  if (!grid) return;
  const isList = grid.classList.toggle('list-view');
  localStorage.setItem('home_card_layout', isList ? 'list' : 'grid');
  if (label) label.textContent = isList ? 'Raster-Ansicht' : 'Listen-Ansicht';
  if (icon) {
    icon.className = isList ? 'fa-solid fa-table-cells-large' : 'fa-solid fa-bars-staggered';
  }
  showToast(isList ? 'Karten-Layout: Listen-Ansicht ☰' : 'Karten-Layout: Raster-Ansicht ⊞');
}
window.toggleHomeCardsLayout = toggleHomeCardsLayout;

function applySavedHomeLayout() {
  const saved = localStorage.getItem('home_card_layout');
  const grid = document.querySelector('.android-cards-grid');
  const icon = document.getElementById('homeLayoutIcon');
  const label = document.getElementById('homeLayoutLabel');
  if (!grid) return;
  if (saved === 'list') {
    grid.classList.add('list-view');
    if (label) label.textContent = 'Raster-Ansicht';
    if (icon) icon.className = 'fa-solid fa-table-cells-large';
  } else {
    grid.classList.remove('list-view');
    if (label) label.textContent = 'Listen-Ansicht';
    if (icon) icon.className = 'fa-solid fa-bars-staggered';
  }
}
window.applySavedHomeLayout = applySavedHomeLayout;

// Word Studio Page Stepper Functions
function goToWordStudioPrevPage() {
  const cur = state.currentPage || 1;
  const target = Math.max(1, cur - 1);
  loadPage(target);
  renderWordStudio();
  updateWordStudioPageInput();
}
window.goToWordStudioPrevPage = goToWordStudioPrevPage;

function goToWordStudioNextPage() {
  const cur = state.currentPage || 1;
  const target = Math.min(604, cur + 1);
  loadPage(target);
  renderWordStudio();
  updateWordStudioPageInput();
}
window.goToWordStudioNextPage = goToWordStudioNextPage;

function onWordStudioPageInputChange(val) {
  const p = parseInt(val, 10);
  if (p >= 1 && p <= 604) {
    loadPage(p);
    renderWordStudio();
  }
}
window.onWordStudioPageInputChange = onWordStudioPageInputChange;

function updateWordStudioPageInput() {
  const inp = document.getElementById('wsPageNumberInput');
  if (inp) inp.value = state.currentPage || 1;
}
window.updateWordStudioPageInput = updateWordStudioPageInput;

// Tafsir Page Stepper Functions
function goToTafsirPrevPage() {
  const cur = state.currentPage || 1;
  const target = Math.max(1, cur - 1);
  loadPage(target);
  syncTafsirWithCurrentPage();
  renderTafsirStudio();
  updateTafsirPageInput();
}
window.goToTafsirPrevPage = goToTafsirPrevPage;

function goToTafsirNextPage() {
  const cur = state.currentPage || 1;
  const target = Math.min(604, cur + 1);
  loadPage(target);
  syncTafsirWithCurrentPage();
  renderTafsirStudio();
  updateTafsirPageInput();
}
window.goToTafsirNextPage = goToTafsirNextPage;

function onTafsirPageInputChange(val) {
  const p = parseInt(val, 10);
  if (p >= 1 && p <= 604) {
    loadPage(p);
    syncTafsirWithCurrentPage();
    renderTafsirStudio();
  }
}
window.onTafsirPageInputChange = onTafsirPageInputChange;

function updateTafsirPageInput() {
  const inp = document.getElementById('tafsirPageNumberInput');
  if (inp) inp.value = state.currentPage || 1;
}
window.updateTafsirPageInput = updateTafsirPageInput;

function syncTafsirWithCurrentPage() {
  if (state.currentVersesData && state.currentVersesData.length > 0) {
    state.tafsirSurah = state.currentVersesData[0].surahNum;
    state.tafsirAyah = state.currentVersesData[0].num;
    const sSel = document.getElementById('tafsirSurahSelect');
    if (sSel) sSel.value = state.tafsirSurah;
    if (typeof populateTafsirAyahDropdown === 'function') {
      populateTafsirAyahDropdown(state.tafsirSurah);
    }
    const aSel = document.getElementById('tafsirAyahSelect');
    if (aSel) aSel.value = state.tafsirAyah;
  }
}
window.syncTafsirWithCurrentPage = syncTafsirWithCurrentPage;

// Sync Page Inputs on render
const origRenderWordStudio = window.renderWordStudio || renderWordStudio;
window.renderWordStudio = function() {
  if (typeof origRenderWordStudio === 'function') origRenderWordStudio();
  updateWordStudioPageInput();
};

const origRenderTafsirStudio = window.renderTafsirStudio || renderTafsirStudio;
window.renderTafsirStudio = function() {
  if (typeof origRenderTafsirStudio === 'function') origRenderTafsirStudio();
  updateTafsirPageInput();
};

// Sync Hero Hifz Progress
const origUpdateHifzCounter = window.updateHifzCounter || updateHifzCounter;
window.updateHifzCounter = function() {
  if (typeof origUpdateHifzCounter === 'function') origUpdateHifzCounter();
  try {
    const memList = getAllMemorizedVerses();
    const count = memList.length;
    const percent = ((count / 6236) * 100).toFixed(1);
    const heroCount = document.getElementById('homeHeroHifzCount');
    if (heroCount) heroCount.textContent = count;
    const heroPercent = document.getElementById('homeHeroHifzPercent');
    if (heroPercent) heroPercent.textContent = `${percent}%`;
  } catch(e) {}
};

// Apply layout on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    applySavedHomeLayout();
    populateMushafSurahDropdown();
    updateWordStudioPageInput();
    updateTafsirPageInput();
    if (typeof updateHifzCounter === 'function') updateHifzCounter();
  }, 200);
});


// ============================================================
// MUSHAF SURAH DROPDOWN & SYNC
// ============================================================
function populateMushafSurahDropdown() {
  const sel = document.getElementById('mushafSurahSelect');
  if (!sel || typeof ALL_114_SURAHS === 'undefined') return;
  sel.innerHTML = '';
  ALL_114_SURAHS.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.id;
    opt.textContent = `${s.id}. ${s.name} (${s.arabic})`;
    if (s.id === state.currentSurah) opt.selected = true;
    sel.appendChild(opt);
  });
}
window.populateMushafSurahDropdown = populateMushafSurahDropdown;

function onMushafSurahSelect(surahId) {
  const sNum = parseInt(surahId, 10);
  if (typeof ALL_114_SURAHS !== 'undefined') {
    const s = ALL_114_SURAHS.find(item => item.id === sNum);
    if (s && s.startPage) {
      jumpToPage(s.startPage);
      showToast(`Sure ${s.name} (Seite ${s.startPage})`);
    }
  }
}
window.onMushafSurahSelect = onMushafSurahSelect;
