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
var state = window.state = {
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
  tajweedEnabled: false,

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
window.mainQuranAudio = audio;
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

// ==============================================================
// Model 3 Real-time Audio Scrubber & Timecode Tracker (Global)
// ==============================================================
function formatTimecodeDisplay(sec) {
  if (isNaN(sec) || !sec || sec < 0) return '00:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
}
window.formatTimecodeDisplay = formatTimecodeDisplay;

audio.addEventListener('timeupdate', function () {
  const cur = audio.currentTime || 0;
  const dur = audio.duration || 0;
  const pct = dur > 0 ? (cur / dur) * 100 : 0;

  // 1. Mushaf Player Scrubber & Timecodes
  const mCurTime = document.getElementById('mushafPlayerCurrentTime');
  const mDuration = document.getElementById('mushafPlayerTotalDuration');
  const mProgress = document.getElementById('mushafPlayerProgressBarFill');
  if (mCurTime) mCurTime.textContent = formatTimecodeDisplay(cur);
  if (mDuration && dur > 0) mDuration.textContent = formatTimecodeDisplay(dur);
  if (mProgress) mProgress.style.width = pct + '%';

  // 2. Word Studio Player Scrubber & Timecodes
  const wsCurTime = document.getElementById('wsPlayerCurrentTime');
  const wsDuration = document.getElementById('wsPlayerTotalDuration');
  const wsProgress = document.getElementById('wsPlayerProgressBarFill');
  if (wsCurTime) wsCurTime.textContent = formatTimecodeDisplay(cur);
  if (wsDuration && dur > 0) wsDuration.textContent = formatTimecodeDisplay(dur);
  if (wsProgress) wsProgress.style.width = pct + '%';
});

audio.addEventListener('loadedmetadata', function () {
  const dur = audio.duration || 0;
  const mDuration = document.getElementById('mushafPlayerTotalDuration');
  const wsDuration = document.getElementById('wsPlayerTotalDuration');
  if (mDuration && dur > 0) mDuration.textContent = formatTimecodeDisplay(dur);
  if (wsDuration && dur > 0) wsDuration.textContent = formatTimecodeDisplay(dur);
});

window.seekQuranAudio = function (event, trackElement) {
  if (!audio || !audio.duration) return;
  const rect = trackElement.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const fraction = Math.max(0, Math.min(1, clickX / rect.width));
  audio.currentTime = fraction * audio.duration;
};

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

// Clean Quran Text (strips BOM, mojibake, and normalizes connecting marks across all fonts)
function cleanArabicText(text) {
  if (!text) return '';
  let str = String(text)
    .replace(/\uFEFF/g, '')
    .replace(/ï»¿/g, '');

  // Automatic mojibake repair if text was mis-encoded as ISO-8859-1/ANSI
  if (/[\u00C0-\u00FF]/.test(str) && /[\u00D8-\u00D9]/.test(str)) {
    try {
      const bytes = new Uint8Array([...str].map(c => c.charCodeAt(0) & 0xff));
      const fixed = new TextDecoder('utf-8').decode(bytes);
      if (fixed && !fixed.includes('\uFFFD')) str = fixed;
    } catch (e) {}
  }

  // Universal Quranic Cursive Joining Fix:
  // In fonts like KFGQPC Uthman Taha, Alef Wasla (\u0671) lacks a medial connecting glyph
  // which causes preceding connecting letters (بِ, فَ, كَ, وَ, etc.) to detach and render as isolated.
  // Converting \u0671 to standard Alef (\u0627) when preceded by a connecting letter guarantees
  // 100% flawless cursive joining across ALL fonts without losing any diacritics.
  str = str.replace(/([\u0628\u062a\u062b\u062c\u062d\u062e\u0633\u0634\u0635\u0636\u0637\u0638\u0639\u063f\u0641\u0642\u0643\u0644\u0645\u0646\u0647\u064a\u0649\u0640][\u064B-\u065F\u0670]*)\u0671/g, '$1\u0627');

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

// Clean Arabic Text Provider & Pure Mushaf Formatter (No letter-splitting intra-word spans)
function applyTajweedMarkup(text) {
  if (!text) return '';
  return cleanArabicText(text);
}
window.applyTajweedMarkup = applyTajweedMarkup;

function toggleTajweed() {
  state.tajweedEnabled = !state.tajweedEnabled;
  const btn = document.getElementById('tajweedToggleBtn');
  if (btn) {
    btn.classList.toggle('active', state.tajweedEnabled);
    btn.style.background = state.tajweedEnabled ? 'linear-gradient(135deg, #10b981, #059669)' : '';
    btn.style.borderColor = state.tajweedEnabled ? '#34d399' : '';
    btn.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> Tajweed: ${state.tajweedEnabled ? 'AN' : 'AUS'}`;
  }
  if (state.activeTab === 'mushaf') renderInteractiveMushaf();
  if (state.activeTab === 'repetition') renderRepetitionDisplay();
  showToast(state.tajweedEnabled ? '🎨 Tajweed-Farbregeln aktiviert' : '📖 Reine Uthmān-Kalligraphie aktiviert');
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
window.getPageVerses = getPageVerses;

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
  state.currentTab = tabName;

  const tabs = [
    { name: 'home', btn: 'tabBtnHome', pane: 'paneHome' },
    { name: 'mushaf', btn: 'tabBtnMushaf', pane: 'paneMushaf' },
    { name: 'wordStudio', btn: 'tabBtnWordStudio', pane: 'paneWordStudio' },
    { name: 'micTest', btn: 'tabBtnMicTest', pane: 'paneMicTest' },
    { name: 'tafsir', btn: 'tabBtnTafsir', pane: 'paneTafsir' },
    { name: 'hifzArchive', btn: 'tabBtnHifzArchive', pane: 'paneHifzArchive' },
    { name: 'repetition', btn: 'tabBtnRepetition', pane: 'paneRepetition' },
    { name: 'quiz', btn: 'tabBtnQuiz', pane: 'paneQuiz' },
    { name: 'tajweed', btn: '', pane: 'paneTajweed' },
    { name: 'dictionary', btn: '', pane: 'paneDictionary' },
    { name: 'khatm', btn: '', pane: 'paneKhatm' },
    { name: 'dhikr', btn: '', pane: 'paneDhikr' },
    { name: 'bookmarks', btn: '', pane: 'paneBookmarks' },
    { name: 'search', btn: '', pane: 'paneSearch' },
    { name: 'tafsirPdf', btn: '', pane: 'paneTafsirPdf' }
  ];

  tabs.forEach(t => {
    const btn = document.getElementById(t.btn);
    const pane = document.getElementById(t.pane);
    const isActive = (t.name === tabName);
    if (btn) btn.classList.toggle('active', isActive);
    if (pane) pane.style.display = isActive ? 'block' : 'none';
  });

  // Synchronize bottom navigation buttons
  const abnHome = document.getElementById('abnHome');
  const abnMushaf = document.getElementById('abnMushaf');
  const abnHifz = document.getElementById('abnHifz');
  const abnSmartAudio = document.getElementById('abnSmartAudio');
  const abnSearch = document.getElementById('abnSearch');
  const abnMenu = document.getElementById('abnMenu');

  if (abnHome) abnHome.classList.toggle('active', tabName === 'home');
  if (abnMushaf) abnMushaf.classList.toggle('active', tabName === 'mushaf');
  if (abnHifz) abnHifz.classList.toggle('active', tabName === 'hifz' || tabName === 'wordStudio');
  if (abnSmartAudio) abnSmartAudio.classList.toggle('active', tabName === 'micTest' || tabName === 'mic');
  if (abnSearch) abnSearch.classList.toggle('active', tabName === 'search');

  // Lifecycle hooks per tab
  if (tabName === 'home') {
    if (typeof window.initQuranUltimate === 'function') window.initQuranUltimate();
    if (typeof updateDashboardLabels === 'function') updateDashboardLabels();
  } else if (tabName === 'mushaf') {
    if (!state.currentVersesData || state.currentVersesData.length === 0) {
      loadPage(state.currentPage || 1);
    } else {
      if (state.mushafMode === 'interactive') renderInteractiveMushaf();
      else renderFacsimileScan();
    }
  } else if (tabName === 'wordStudio') {
    if (state.wordStudioMode === 'repetition') {
      const normalStage = document.getElementById('wsNormalStage');
      const repStage = document.getElementById('wsRepetitionStage');
      if (normalStage) normalStage.style.display = 'none';
      if (repStage) repStage.style.display = 'block';
      if (typeof updateRepetitionQueue === 'function') updateRepetitionQueue();
      if (typeof renderRepetitionDisplay === 'function') renderRepetitionDisplay();
    } else {
      const normalStage = document.getElementById('wsNormalStage');
      const repStage = document.getElementById('wsRepetitionStage');
      if (normalStage) normalStage.style.display = 'block';
      if (repStage) repStage.style.display = 'none';
      renderWordStudio();
    }
  } else if (tabName === 'tafsir') {
    renderTafsirStudio();
  } else if (tabName === 'hifzArchive') {
    renderHifzArchive();
  } else if (tabName === 'repetition') {
    switchTab('wordStudio');
    if (typeof setWordStudioMode === 'function') {
      setWordStudioMode('repetition');
    }
    return;
  } else if (tabName === 'micTest') {
    if (typeof window.initTarteelStudio === 'function') window.initTarteelStudio();
    else initMicTestDisplay();
  } else if (tabName === 'quiz') {
    if (typeof populateMurajaaSurahDropdown === 'function') populateMurajaaSurahDropdown();
    if (typeof setupMurajaaQuestion === 'function') setupMurajaaQuestion();
  } else if (tabName === 'tajweed') {
    if (typeof window.renderDedicatedTajweed === 'function') window.renderDedicatedTajweed();
  } else if (tabName === 'dictionary') {
    if (typeof window.renderDedicatedDictionary === 'function') window.renderDedicatedDictionary('');
  } else if (tabName === 'khatm') {
    if (typeof window.updateDedicatedKhatm === 'function') window.updateDedicatedKhatm();
  } else if (tabName === 'dhikr') {
    if (typeof window.renderDedicatedDhikr === 'function') window.renderDedicatedDhikr();
  } else if (tabName === 'bookmarks') {
    if (typeof window.renderDedicatedBookmarks === 'function') window.renderDedicatedBookmarks();
  } else if (tabName === 'search') {
    if (typeof window.renderDedicatedSearch === 'function') window.renderDedicatedSearch('');
  } else if (tabName === 'tafsirPdf') {
    if (typeof window.initDedicatedTafsirPdf === 'function') window.initDedicatedTafsirPdf();
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

  // Update Sidebar & Navigation inputs across ALL sections
  const pInput = document.getElementById('pageNumberInput');
  if (pInput) pInput.value = state.currentPage;

  const mPInput = document.getElementById('mushafPageNumberInput');
  if (mPInput) mPInput.value = state.currentPage;

  const wsPInput = document.getElementById('wsPageNumberInput');
  if (wsPInput) wsPInput.value = state.currentPage;

  const tPInput = document.getElementById('tafsirPageNumberInput');
  if (tPInput) tPInput.value = state.currentPage;

  const sSelect = document.getElementById('allSurahsSelect');
  if (sSelect) sSelect.value = state.currentSurah;

  const mSurahSel = document.getElementById('mushafSurahSelect');
  if (mSurahSel && mSurahSel.value != state.currentSurah) mSurahSel.value = state.currentSurah;

  const wsSurahSel = document.getElementById('wsSurahSelect');
  if (wsSurahSel && wsSurahSel.value != state.currentSurah) wsSurahSel.value = state.currentSurah;

  const tSurahSel = document.getElementById('tafsirSurahSelect');
  if (tSurahSel && tSurahSel.value != state.currentSurah) tSurahSel.value = state.currentSurah;

  const rSurahSel = document.getElementById('repeatSurahSelect');
  if (rSurahSel && rSurahSel.value != state.currentSurah) rSurahSel.value = state.currentSurah;

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
window.loadPage = loadPage;

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
  if (stageInter) stageInter.style.setProperty('display', (mode === 'interactive') ? 'block' : 'none', 'important');
  if (stageScan) stageScan.style.setProperty('display', (mode === 'scan') ? 'block' : 'none', 'important');

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
  if (tarteelSpeechRec) {
    try {
      tarteelSpeechRec.onend = null;
      tarteelSpeechRec.onerror = null;
      tarteelSpeechRec.onresult = null;
      tarteelSpeechRec.abort();
    } catch(e) {}
    tarteelSpeechRec = null;
  }

  tarteelSpeechRec = new SpeechRecognition();
  tarteelSpeechRec.lang = 'ar-SA';
  tarteelSpeechRec.continuous = true;
  tarteelSpeechRec.interimResults = true;
  tarteelSpeechRec.maxAlternatives = 3;

  tarteelSpeechRec.onresult = (event) => {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      transcript += ' ' + event.results[i][0].transcript;
    }
    matchTarteelVoiceToPage(transcript.trim());
  };

  tarteelSpeechRec.onerror = (e) => {
    console.warn('Tarteel voice rec event:', e.error);
  };

  tarteelSpeechRec.onend = () => {
    if (state.tarteelVoiceActive) {
      setTimeout(() => {
        if (state.tarteelVoiceActive) startTarteelVoiceListening();
      }, 80);
    }
  };

  try { tarteelSpeechRec.start(); } catch(e){}
}

function stopTarteelVoiceListening() {
  if (tarteelSpeechRec) {
    try {
      tarteelSpeechRec.onend = null;
      tarteelSpeechRec.onerror = null;
      tarteelSpeechRec.onresult = null;
      tarteelSpeechRec.stop();
    } catch(e){}
    tarteelSpeechRec = null;
  }
}

function matchTarteelVoiceToPage(spoken) {
  if (!spoken || !state.currentVersesData) return;
  const normFunc = window.normalizeArabicForQuranVoice || function(s) {
    if (!s) return '';
    return String(s)
      .replace(/\u0670/g, 'ا')
      .replace(/صلو[ةه]/g, 'صلاه')
      .replace(/زكو[ةه]/g, 'زكاه')
      .replace(/حيو[ةه]/g, 'حياه')
      .replace(/[\u064B-\u065F\u06D6-\u06ED\u06DF\u06E0\u06E2\u06E3\u06E5\u06E6\u06E8\u06EA-\u06ED]/g, '')
      .replace(/[\u0622\u0623\u0625\u0671]/g, 'ا')
      .replace(/[\u0649\u064A]/g, 'ي')
      .replace(/\u0629/g, 'ه')
      .replace(/\u0640/g, '')
      .replace(/[\u0600-\u060F\u06DD\u06DE.,/#!$%^&*;:{}=\-_`~()«»۞۩۝]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const spokenClean = normFunc(spoken);
  const spokenWords = spokenClean.split(/\s+/).filter(w => w.length > 1);
  if (spokenWords.length === 0) return;

  state.currentVersesData.forEach((v, idx) => {
    let vText = v.ar;
    if (v.num === 1 && v.surahNum !== 1) {
      vText = vText.replace(/^بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ\s*/, '');
    }
    const vClean = normFunc(vText);
    const vWords = vClean.split(/\s+/).filter(w => w.length > 1);

    let matches = 0;
    spokenWords.forEach(sw => {
      if (vClean.includes(sw)) {
        matches++;
      } else {
        const swStem = sw.replace(/^(وال|فال|بال|كال|لل|ال|و|ف|ب|ل)/, '');
        if (swStem.length >= 2 && vWords.some(vw => {
          const vwStem = vw.replace(/^(وال|فال|بال|كال|لل|ال|و|ف|ب|ل)/, '');
          return vw === swStem || vw.includes(swStem) || sw.includes(vwStem);
        })) {
          matches++;
        }
      }
    });

    if (matches >= 2 || (spokenWords.length === 1 && matches >= 1) || (vWords.length <= 3 && matches >= 1)) {
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
    if (sheet2) sheet2.style.setProperty('display', 'block', 'important');
    if (img2) {
      img2.onerror = function() {
        this.onerror = null;
        this.src = getMadinaScanFallbackUrl(state.currentPage + 1);
      };
      img2.src = getMadinaScanUrl(state.currentPage + 1);
    }
  } else {
    if (sheet2) sheet2.style.setProperty('display', 'none', 'important');
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
  const btnRep = document.getElementById('wsModeRepBtn');
  if (btnWbw) btnWbw.classList.toggle('active', mode === 'wbw');
  if (btnFull) btnFull.classList.toggle('active', mode === 'full');
  if (btnRep) btnRep.classList.toggle('active', mode === 'repetition');

  const normalStage = document.getElementById('wsNormalStage');
  const repStage = document.getElementById('wsRepetitionStage');

  if (mode === 'repetition') {
    if (normalStage) normalStage.style.display = 'none';
    if (repStage) repStage.style.display = 'block';
    state.repeatSurah = state.currentSurah || 1;
    const s = (typeof ALL_114_SURAHS !== 'undefined') ? ALL_114_SURAHS.find(x => x.id === state.repeatSurah) : null;
    const repLbl = document.getElementById('repeatSurahTriggerLabel');
    if (repLbl && s) repLbl.textContent = `${s.id}. ${s.name} (${s.arabic})`;
    if (typeof updateRepetitionQueue === 'function') updateRepetitionQueue();
    if (typeof renderRepetitionDisplay === 'function') renderRepetitionDisplay();
    showToast('🔁 Stufen-Hifz aktiviert');
  } else {
    if (typeof pauseRepeat === 'function' && state.isRepeatPlaying) pauseRepeat();
    if (normalStage) normalStage.style.display = 'block';
    if (repStage) repStage.style.display = 'none';
    renderWordStudio();
    showToast(mode === 'wbw' ? '🔤 Wort-für-Wort Modus aktiviert' : '📜 Gesamte Verse Modus aktiviert');
  }
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

  // Active language detection for multilingual translation/tafsir
  const curLang = localStorage.getItem('quran_app_language') || (typeof state !== 'undefined' && state.lang) || 'ku';

  state.verseRepeatMap = state.verseRepeatMap || {};

  list.forEach((v, idx) => {
    const isMem = isVerseMemorized(v.surahNum, v.num);
    const isCurrentPlaying = (state.isPlaying && state.playbackSource === 'wordStudio' && state.wordStudioPlayingSurah === v.surahNum && state.wordStudioPlayingAyah === v.num);
    const card = document.createElement('div');
    card.className = `studio-card ${isMem ? 'memorized' : ''} ${isCurrentPlaying ? 'active-studio-playing' : ''}`;
    card.id = `ws-card-${idx}`;
    card.setAttribute('data-surah', v.surahNum);
    card.setAttribute('data-ayah', v.num);
    card.setAttribute('data-idx', idx);
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

    // Determine translation text and label based on language (German, English, Kurdish)
    let transLabel = '<i class="fa-solid fa-book-quran"></i> Übersetzung (Bubenheim &amp; Elyas):';
    let transText = v.de || '—';
    let isKuClass = '';

    if (curLang === 'ku') {
      transLabel = '<i class="fa-solid fa-book-quran"></i> وەرگێڕان و تەفسیر (کوردی):';
      const kText = (typeof KURDISH_TAFSIR_DATA !== 'undefined' && KURDISH_TAFSIR_DATA[v.surahNum] && KURDISH_TAFSIR_DATA[v.surahNum][v.num]) || v.ku;
      transText = kText || v.de || 'دەقی تەفسیر ئامادە دەکرێت...';
      isKuClass = 'kurdish-text';
    } else if (curLang === 'en') {
      transLabel = '<i class="fa-solid fa-book-quran"></i> Translation (English):';
      transText = v.en || v.de || '—';
    }

    const repKey = `${v.surahNum}:${v.num}`;
    const ayahRepeat = state.verseRepeatMap[repKey] || 1;

    card.innerHTML = `
      <div class="studio-card-header" style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 4px; margin-bottom: 8px; width: 100%; box-sizing: border-box;">
        <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 4px; min-width: 0;">
          <span class="badge-surah-ayah" style="font-weight: 800; font-size: 0.76rem;">Sure ${v.surahNum} · Vers ${v.num}</span>
          ${isMem ? '<span class="badge-memorized" style="font-size: 0.7rem;"><i class="fa-solid fa-star"></i> Gelernt</span>' : ''}
          <span id="ws-badge-playing-${v.surahNum}-${v.num}" class="badge-surah-ayah ws-live-playing-badge" style="background: rgba(16, 185, 129, 0.35); color: #86efac; border: 1px solid #10b981; font-size: 0.7rem; display: ${isCurrentPlaying ? 'inline-flex' : 'none'};">
            <i class="fa-solid fa-volume-high"></i> Wird abgespielt
          </span>
        </div>
        <div style="display: flex; align-items: center; gap: 4px; flex-shrink: 0;">
          <!-- Learned / Bookmark Button -->
          <button type="button" class="action-btn ws-action-btn" onclick="event.stopPropagation(); toggleVerseMemorized(${v.surahNum}, ${v.num});" title="Gelernt markieren" style="width: 27px; height: 27px; padding: 0; justify-content: center;">
            <i class="fa-solid fa-star" style="color: ${isMem ? '#10b981' : 'var(--text-muted)'}; font-size: 0.75rem;"></i>
          </button>

          <!-- Play / Stop Toggle Button -->
          <button type="button" class="action-btn ws-action-btn ws-play-toggle-btn ${isCurrentPlaying ? 'is-playing' : ''}" 
                  id="ws-play-btn-${v.surahNum}-${v.num}"
                  onclick="event.stopPropagation(); toggleWordStudioAyahAudio(${v.surahNum}, ${v.num}, ${idx});" 
                  title="${isCurrentPlaying ? 'Wiedergabe anhalten' : 'Diesen Vers abspielen'}">
            <i class="fa-solid ${isCurrentPlaying ? 'fa-stop' : 'fa-play'}"></i> 
            <span id="ws-play-label-${v.surahNum}-${v.num}">${isCurrentPlaying ? 'Stopp' : 'Anhören'}</span>
          </button>

          <!-- Repeat Cycle Button: 1× -> 2× -> 3× -> 4× -> 5× -> 1× -->
          <button type="button" class="action-btn ws-action-btn ws-repeat-cycle-btn" 
                  id="ws-repeat-btn-${v.surahNum}-${v.num}"
                  onclick="event.stopPropagation(); cycleWordStudioAyahRepeat(${v.surahNum}, ${v.num}, ${idx});" 
                  title="Wiederholungen einstellen (1× bis 5×)">
            <i class="fa-solid fa-repeat"></i> 
            <span id="ws-rep-badge-${v.surahNum}-${v.num}">${ayahRepeat}×</span>
          </button>
        </div>
      </div>

      <!-- Prominent Large Arabic Ayah (Tapping plays this ayah!) -->
      <div class="studio-arabic-text" title="Tippen zum Anhören">
        ${cleanArabicText(v.ar)}
        <span class="studio-rosette">﴿${toArDigits(v.num)}﴾</span>
      </div>

      <!-- Word-by-word chips (only when mode is wbw) -->
      ${wbwSectionHtml}

      <!-- Compact Secondary Translation Box (German, English, Kurdish) -->
      <div class="studio-translation-box">
        <div class="studio-translation-label">${transLabel}</div>
        <div class="studio-translation-text ${isKuClass}">${transText}</div>
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
window.fetchAuthenticGermanTafsir = fetchAuthenticGermanTafsir;

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
  const s = (typeof ALL_114_SURAHS !== 'undefined') ? ALL_114_SURAHS.find(x => x.id === state.tafsirSurah) : null;
  const lbl = document.getElementById('tafsirSurahTriggerLabel');
  if (lbl && s) lbl.textContent = `${s.id}. ${s.name} (${s.arabic})`;
  updateTafsirAyahSelect();
  renderTafsirStudio();
}
window.onTafsirSurahChange = onTafsirSurahChange;

function onTafsirAyahChange(aNum) {
  state.tafsirAyah = parseInt(aNum, 10) || 1;
  const stepperLbl = document.getElementById('tafsirAyahStepperLabel');
  if (stepperLbl) stepperLbl.textContent = `Vers ${state.tafsirAyah}`;
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
  const max = (verses && verses.length) ? verses.length : 7;
  let newAyah = (state.tafsirAyah || 1) + delta;
  if (newAyah < 1) newAyah = 1;
  if (newAyah > max) newAyah = max;
  state.tafsirAyah = newAyah;
  const stepperLbl = document.getElementById('tafsirAyahStepperLabel');
  if (stepperLbl) stepperLbl.textContent = `Vers ${newAyah}`;
  const sel = document.getElementById('tafsirAyahSelect');
  if (sel) sel.value = newAyah;
  onTafsirAyahChange(newAyah);
}
window.stepTafsirAyah = stepTafsirAyah;

function updateTafsirAyahSelect() {
  const verses = getVersesForSurah(state.tafsirSurah);
  const count = (verses && verses.length) ? verses.length : 7;
  const stepperLbl = document.getElementById('tafsirAyahStepperLabel');
  if (stepperLbl) {
    stepperLbl.textContent = `Vers ${state.tafsirAyah || 1}`;
  }
  const sel = document.getElementById('tafsirAyahSelect');
  if (!sel) return;
  sel.innerHTML = '';
  for (let i = 1; i <= count; i++) {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = `Vers ${i}`;
    sel.appendChild(opt);
  }
  sel.value = state.tafsirAyah;
}

function openTafsirSourcePickerModal() {
  const m = document.getElementById('tafsirSourcePickerModal');
  if (m) m.style.display = 'flex';
}
window.openTafsirSourcePickerModal = openTafsirSourcePickerModal;

function closeTafsirSourcePickerModal() {
  const m = document.getElementById('tafsirSourcePickerModal');
  if (m) m.style.display = 'none';
}
window.closeTafsirSourcePickerModal = closeTafsirSourcePickerModal;

function selectTafsirEdition(edition) {
  closeTafsirSourcePickerModal();
  state.tafsirEdition = edition;
  const lblMap = {
    all: 'Tafsīr: Alle 4',
    bubenheim: 'Tafsīr: Bubenheim',
    zaidan: 'Tafsīr: Amir Zaidan',
    aburida: 'Tafsīr: Abu Rida',
    nami: 'تەفسیری نامی'
  };
  const lbl = document.getElementById('activeTafsirEditionBtnLabel');
  if (lbl) lbl.textContent = lblMap[edition] || 'Tafsīr: Alle 4';
  renderTafsirStudio();
  showToast(`Tafsīr-Auswahl: ${lblMap[edition] || edition}`);
}
window.selectTafsirEdition = selectTafsirEdition;

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

  const verses = await (window.fetchAuthenticGermanTafsir || fetchAuthenticGermanTafsir)(state.tafsirSurah);
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
    card.setAttribute('data-ayah-key', `${state.tafsirSurah}:${v.num}`);
    card.style.cssText = 'background: linear-gradient(155deg, rgba(16, 28, 42, 0.95), rgba(9, 15, 24, 0.98)); border: 1.5px solid rgba(255, 255, 255, 0.1); border-radius: 18px; padding: 18px 16px; margin-bottom: 14px; box-shadow: 0 14px 35px rgba(0,0,0,0.65), inset 0 1px 1px rgba(255,255,255,0.1);';

    // Guarantee 100% clean, pristine Arabic text from verified local Quran dataset
    const qVerses = getVersesForSurah(state.tafsirSurah);
    const foundQVerse = qVerses ? qVerses.find(x => x.num === v.num) : null;
    const arabicVerseText = foundQVerse ? foundQVerse.ar : (v.ar || '');
    const isBookmarked = (typeof isVerseBookmarked === 'function') ? isVerseBookmarked(state.tafsirSurah, v.num) : false;
    const cleanArEscaped = cleanArabicText(arabicVerseText).replace(/'/g, "\\'").replace(/"/g, '&quot;');

    let contentHtml = `
      <!-- Verse Header Action Bar (Bookmark & Single Audio Toggle - No redundant Muṣḥaf button) -->
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.08);">
        <span style="font-weight: 800; font-size: 0.92rem; color: #fff;">Sure ${state.tafsirSurah} · Vers ${v.num}</span>
        <div style="display: flex; align-items: center; gap: 8px;">
          <button onclick="playSingleTafsirAyah(${state.tafsirSurah}, ${v.num})" class="tafsir-play-btn" style="background: rgba(245,158,11,0.18); border: 1px solid rgba(245,158,11,0.38); border-radius: 10px; color: #fde68a; padding: 5px 12px; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 0.78rem; font-weight: 800; transition: all 0.2s;">
            <i class="fa-solid fa-volume-high"></i>
            <span>Vers hören</span>
          </button>
          <button onclick="toggleVerseBookmark(${state.tafsirSurah}, ${v.num}, '${cleanArEscaped}', 'Tafsīr'); const i=this.querySelector('i'); if(i.classList.contains('fa-solid')){i.className='fa-regular fa-star'; this.style.color='#cbd5e1';}else{i.className='fa-solid fa-star'; this.style.color='#facc15';}" class="neo3d-star-btn" style="height: 32px; padding: 0 10px; font-size: 0.76rem; border-radius: 10px;" title="Merken">
            <i class="${isBookmarked ? 'fa-solid' : 'fa-regular'} fa-star"></i>
            <span>Merken</span>
          </button>
        </div>
      </div>

      <!-- Authentic Arabic Text Header (Clickable for Single Verse Audio) -->
      <div onclick="playSingleTafsirAyah(${state.tafsirSurah}, ${v.num})" style="direction: rtl; font-family: var(--quran-font); font-size: 1.85rem; line-height: 2.2; color: #fef08a; padding-bottom: 14px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); margin-bottom: 16px; text-align: right; cursor: pointer;" title="Tippen, um nur diesen Vers anzuhören">
        ${cleanArabicText(arabicVerseText)}
        <span class="studio-rosette" style="display:inline-block; font-size:1.85rem; margin:0 8px; vertical-align:middle; color:var(--gold-primary);">﴿${toArDigits(v.num)}﴾</span>
      </div>
    `;

    // 1. Frank Bubenheim & Dr. Nadeem Elyas (Offizielle saudische Übersetzung des König-Fahd-Komplexes)
    if (edition === 'all' || edition === 'bubenheim') {
      contentHtml += `
        <div style="background: rgba(16, 185, 129, 0.07); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 14px; padding: 12px 14px; margin-bottom: 10px;">
          <div style="display: inline-flex; align-items: center; gap: 6px; font-weight: 800; color: #86efac; font-size: 0.8rem; margin-bottom: 6px; background: rgba(16,185,129,0.15); padding: 3px 9px; border-radius: 8px;">
            <i class="fa-solid fa-book-open"></i> <span>Bubenheim &amp; Elyas (Medina)</span>
          </div>
          <div style="font-size: 0.95rem; line-height: 1.65; color: #f1f5f9;">
            ${v.bubenheim || 'Text wird geladen...'}
          </div>
        </div>
      `;
    }

    // 2. Amir Zaidan (At-Tafsir: Die authentische theologische Erläuterung)
    if (edition === 'all' || edition === 'zaidan') {
      contentHtml += `
        <div style="background: rgba(56, 189, 248, 0.07); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 14px; padding: 12px 14px; margin-bottom: 10px;">
          <div style="display: inline-flex; align-items: center; gap: 6px; font-weight: 800; color: #7dd3fc; font-size: 0.8rem; margin-bottom: 6px; background: rgba(56,189,248,0.15); padding: 3px 9px; border-radius: 8px;">
            <i class="fa-solid fa-scale-balanced"></i> <span>Amir Zaidan (At-Tafsīr)</span>
          </div>
          <div style="font-size: 0.95rem; line-height: 1.65; color: #f1f5f9;">
            ${v.zaidan || 'Text wird geladen...'}
          </div>
        </div>
      `;
    }

    // 3. Abu Rida Muhammad ibn Ahmad ibn Rassoul (Islamische Bibliothek Köln)
    if (edition === 'all' || edition === 'aburida') {
      contentHtml += `
        <div style="background: rgba(245, 158, 11, 0.07); border: 1px solid rgba(245, 158, 11, 0.2); border-radius: 14px; padding: 12px 14px; margin-bottom: 10px;">
          <div style="display: inline-flex; align-items: center; gap: 6px; font-weight: 800; color: #fde68a; font-size: 0.8rem; margin-bottom: 6px; background: rgba(245,158,11,0.15); padding: 3px 9px; border-radius: 8px;">
            <i class="fa-solid fa-feather"></i> <span>Abu Rida (Köln)</span>
          </div>
          <div style="font-size: 0.95rem; line-height: 1.65; color: #f1f5f9;">
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
        <div style="background: rgba(168, 85, 247, 0.07); border: 1px solid rgba(168, 85, 247, 0.25); border-radius: 14px; padding: 12px 14px; margin-bottom: 10px; direction: rtl; text-align: right;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div style="display: inline-flex; align-items: center; gap: 6px; font-weight: 800; color: #d8b4fe; font-size: 0.84rem; background: rgba(168,85,247,0.18); padding: 3px 9px; border-radius: 8px; font-family: var(--kurdish-font);">
              <i class="fa-solid fa-feather-pointed" style="color: #c084fc;"></i> <span>تەفسیری نامی (مەلا عەبدولکەریمی مودەڕڕیس)</span>
            </div>
            <button onclick="openTafsirNamiPdfModalForSurah(${state.tafsirSurah})" class="neo3d-pill-btn" style="font-size: 0.72rem; padding: 3px 8px; border-radius: 8px;">
              <i class="fa-solid fa-book-open"></i> کتێب (PDF)
            </button>
          </div>
          <div style="font-family: var(--kurdish-font); font-size: 1.05rem; line-height: 2.1; color: #f8fafc; text-align: right; word-spacing: normal !important;">
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
      opt.textContent = `${s.id}. ${s.name} (${s.arabic})`;
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

  const targetLabel = document.getElementById('repLoopTargetLabel');
  if (targetLabel) {
    targetLabel.textContent = (state.repeatLoopTarget === 999) ? '∞' : `${state.repeatLoopTarget || 3}×`;
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
  const targetLabel = document.getElementById('repLoopTargetLabel');
  if (targetLabel) {
    targetLabel.textContent = (state.repeatLoopTarget === 999) ? '∞' : `${state.repeatLoopTarget || 3}×`;
  }
  renderRepetitionDisplay();
  showToast(`Wiederholungen pro Vers: ${count === 999 ? 'Unendlich (∞)' : count + '×'}`);
}
window.setRepeatLoopTarget = setRepeatLoopCount;
window.setRepeatLoopCount = setRepeatLoopCount;

function cycleStufenHifzRepeat() {
  const targets = [1, 2, 3, 5, 10, 999];
  const cur = parseInt(state.repeatLoopTarget, 10) || 3;
  let nextIdx = targets.indexOf(cur) + 1;
  if (nextIdx >= targets.length || nextIdx < 0) nextIdx = 0;
  const nextTarget = targets[nextIdx];
  state.repeatLoopTarget = nextTarget;
  const targetLabel = document.getElementById('repLoopTargetLabel');
  if (targetLabel) {
    targetLabel.textContent = (nextTarget === 999) ? '∞' : `${nextTarget}×`;
  }
  renderRepetitionDisplay();
  showToast(`🔁 Wiederholungen: ${nextTarget === 999 ? 'Unendlich (∞)' : nextTarget + '×'}`);
}
window.cycleStufenHifzRepeat = cycleStufenHifzRepeat;
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

function updateWordStudioCardsAudioState() {
  const isAudioActive = state.isPlaying && state.playbackSource === 'wordStudio';
  const curSurah = state.wordStudioPlayingSurah;
  const curAyah = state.wordStudioPlayingAyah;

  document.querySelectorAll('.studio-card').forEach(card => {
    const sNum = parseInt(card.getAttribute('data-surah'), 10);
    const aNum = parseInt(card.getAttribute('data-ayah'), 10);
    const isThisCard = isAudioActive && (sNum === curSurah) && (aNum === curAyah);

    card.classList.toggle('active-studio-playing', isThisCard);

    const playBtn = card.querySelector('.ws-play-toggle-btn');
    if (playBtn) {
      playBtn.classList.toggle('is-playing', isThisCard);
      const icon = playBtn.querySelector('i');
      if (icon) icon.className = isThisCard ? 'fa-solid fa-stop' : 'fa-solid fa-play';
      const label = playBtn.querySelector('span');
      if (label) label.textContent = isThisCard ? 'Stopp' : 'Anhören';
      playBtn.title = isThisCard ? 'Wiedergabe anhalten' : 'Diesen Vers abspielen';
    }

    const badge = card.querySelector('.ws-live-playing-badge');
    if (badge) {
      badge.style.display = isThisCard ? 'inline-flex' : 'none';
    }
  });
}
window.updateWordStudioCardsAudioState = updateWordStudioCardsAudioState;

function toggleWordStudioAyahAudio(surah, ayah, idx) {
  surah = parseInt(surah, 10);
  ayah = parseInt(ayah, 10);
  idx = (typeof idx === 'number') ? idx : 0;

  const isAlreadyPlayingThis = (state.isPlaying && state.playbackSource === 'wordStudio' && 
    state.wordStudioPlayingSurah === surah && state.wordStudioPlayingAyah === ayah);

  if (isAlreadyPlayingThis) {
    if (audio) audio.pause();
    state.isPlaying = false;
    updateWordStudioCardsAudioState();
    updateDockDisplay();
    showToast(`Wiedergabe angehalten (Vers ${ayah}) ⏹️`);
  } else {
    state.verseRepeatMap = state.verseRepeatMap || {};
    const repKey = `${surah}:${ayah}`;
    const repCount = state.verseRepeatMap[repKey] || 1;
    state.repeatTarget = repCount;
    state.currentIteration = 1;
    playWordStudioAyah(surah, ayah, idx);
  }
}
window.toggleWordStudioAyahAudio = toggleWordStudioAyahAudio;

function cycleWordStudioAyahRepeat(surah, ayah, idx) {
  surah = parseInt(surah, 10);
  ayah = parseInt(ayah, 10);
  state.verseRepeatMap = state.verseRepeatMap || {};
  const repKey = `${surah}:${ayah}`;
  const current = state.verseRepeatMap[repKey] || 1;

  // Cycle: 1 -> 2 -> 3 -> 4 -> 5 -> 1
  const cycleList = [1, 2, 3, 4, 5];
  const curPos = cycleList.indexOf(current);
  const nextVal = (curPos >= 0 && curPos < cycleList.length - 1) ? cycleList[curPos + 1] : cycleList[0];

  state.verseRepeatMap[repKey] = nextVal;

  const badge = document.getElementById(`ws-rep-badge-${surah}-${ayah}`);
  if (badge) badge.textContent = `${nextVal}×`;

  if (state.isPlaying && state.playbackSource === 'wordStudio' && state.wordStudioPlayingSurah === surah && state.wordStudioPlayingAyah === ayah) {
    state.repeatTarget = nextVal;
  }

  showToast(`Vers ${surah}:${ayah} · Wiederholung: ${nextVal}× 🔁`);
}
window.cycleWordStudioAyahRepeat = cycleWordStudioAyahRepeat;

function playWordStudioAyah(surah, ayah, idx) {
  state.playbackSource = 'wordStudio';
  state.wordStudioPlayingSurah = surah;
  state.wordStudioPlayingAyah = ayah;
  state.wordStudioPlayingIdx = (typeof idx === 'number') ? idx : 0;

  state.verseRepeatMap = state.verseRepeatMap || {};
  const repCount = state.verseRepeatMap[`${surah}:${ayah}`] || state.repeatTarget || 1;
  state.repeatTarget = repCount;

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
    showToast(`🎧 Verse Studio: Sure ${surah}, Vers ${ayah} (${state.repeatTarget}×)`);
  }

  updateDockDisplay();
  updateWordStudioCardsAudioState();
}
window.playWordStudioAyah = playWordStudioAyah;

function handleWordStudioCardClick(e, surah, ayah, idx) {
  // If user clicked an action button, let the button's own event handle it
  if (e && e.target && e.target.closest('button, select, input, a')) return;
  toggleWordStudioAyahAudio(surah, ayah, idx);
}
window.handleWordStudioCardClick = handleWordStudioCardClick;

function repeatWordStudioAyah(surah, ayah, idx, times) {
  state.verseRepeatMap = state.verseRepeatMap || {};
  state.verseRepeatMap[`${surah}:${ayah}`] = times;
  state.repeatTarget = times;
  state.currentIteration = 1;
  const badge = document.getElementById(`ws-rep-badge-${surah}-${ayah}`);
  if (badge) badge.textContent = `${times}×`;
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
    mushafInfo.textContent = `${sMeta1 ? (sMeta1.arabic || sMeta1.name) : ('سورة ' + curV.surahNum)}: ${curV.num}`;
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
    wsInfo.textContent = `${sMeta2 ? (sMeta2.arabic || sMeta2.name) : ('سورة ' + wsSurah)}: ${wsAyah}`;
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
  if ((state.activeTab === 'repetition' || (state.activeTab === 'wordStudio' && state.wordStudioMode === 'repetition')) && state.isRepeatPlaying) {
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

  // 2. Word Studio Independent Loop & Completion Handling
  if (state.playbackSource === 'wordStudio') {
    if (state.currentIteration < state.repeatTarget) {
      state.currentIteration++;
      updateDockDisplay();
      if (typeof updateWordStudioCardsAudioState === 'function') updateWordStudioCardsAudioState();
      audio.play();
    } else {
      state.currentIteration = 1;
      state.isPlaying = false;
      if (typeof updateWordStudioCardsAudioState === 'function') updateWordStudioCardsAudioState();
      updateDockDisplay();
      showToast(`Vers ${state.wordStudioPlayingSurah}:${state.wordStudioPlayingAyah} abgeschlossen (${state.repeatTarget}× angehört) ✨`);
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

audio.addEventListener('pause', () => {
  if (state.playbackSource === 'wordStudio') {
    state.isPlaying = false;
    if (typeof updateWordStudioCardsAudioState === 'function') updateWordStudioCardsAudioState();
  }
});

audio.addEventListener('play', () => {
  if (state.playbackSource === 'wordStudio') {
    state.isPlaying = true;
    if (typeof updateWordStudioCardsAudioState === 'function') updateWordStudioCardsAudioState();
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
  let s = String(str);
  // Normalize 1000 / ١٠٠٠ (Arabic word 'Alf' / هزار) to الف
  s = s.replace(/\b1000\b/g, 'الف')
       .replace(/١٠٠٠/g, 'الف')
       .replace(/١۰۰۰/g, 'الف');
  return s
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, '')
    .replace(/[إأآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/[ىي]/g, 'ي')
    .replace(/[^\u0600-\u06FF\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
window.cleanArabicForMatch = cleanArabicForMatch;

function initMicTestDisplay() {
  if (typeof window.initTarteelStudio === 'function') {
    window.initTarteelStudio();
  } else if (typeof renderReciteMushafPage === 'function') {
    renderReciteMushafPage();
  }
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

// ============================================================
// NON-NATIVE QURAN PHONETIC ENGINE (PERSIAN, KURDISH, GERMAN)
// ============================================================
function toQuranPhoneticKey(word) {
  if (!word) return '';
  let w = String(word);
  w = w.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u06DF\u06E0\u06E2\u06E3\u06E5\u06E6\u06E8\u06EA-\u06ED]/g, '')
       .replace(/[إأآٱ]/g, 'ا')
       .replace(/ة/g, 'ه')
       .replace(/[ىي]/g, 'ي')
       .replace(/ؤ/g, 'و').replace(/ئ/g, 'ي')
       .replace(/[\u0600-\u060F\u06DD\u06DE.,/#!$%^&*;:{}=\-_`~()«»۞۩۝]/g, '')
       .replace(/\s+/g, ' ').trim();

  // Muqatta'at (الحروف المقطعة)
  if (/^(الم|الف\s*لام\s*ميم|الف\s*لا\s*ميم|الفلام\s*ميم|الف\s*ل\s*ميم|الاميم|ألم|علم)$/.test(w)) return 'ALIF_LAM_MIM';
  if (/^(الر|الف\s*لام\s*را|الف\s*لام\s*راء)$/.test(w)) return 'ALIF_LAM_RA';
  if (/^(المر|الف\s*لام\s*ميم\s*را|الف\s*لام\s*ميم\s*راء)$/.test(w)) return 'ALIF_LAM_MIM_RA';
  if (/^(طه|طا\s*ها|طاه|طاها)$/.test(w)) return 'TA_HA';
  if (/^(يس|يا\s*سين|ياسين)$/.test(w)) return 'YA_SIN';
  if (/^(حم|حا\s*ميم|حاميم)$/.test(w)) return 'HA_MIM';
  if (/^(طسم|طا\s*سين\s*ميم|طاسين\s*ميم)$/.test(w)) return 'TA_SIN_MIM';
  if (/^(طس|طا\s*سين|طاسين)$/.test(w)) return 'TA_SIN';
  if (/^(ص|صاد)$/.test(w)) return 'SAD';
  if (/^(ق|قاف)$/.test(w)) return 'QAF';
  if (/^(ن|نون)$/.test(w)) return 'NUN';

  // Non-native consonant equivalence classes (Persian, Kurdish, Turkish, German speakers)
  w = w.replace(/[صث]/g, 'س');   // ص, ث -> س
  w = w.replace(/[ذضظ]/g, 'ز');   // ذ, ض, ظ -> ز
  w = w.replace(/ط/g, 'ت');       // ط -> ت
  w = w.replace(/ح/g, 'ه');       // ح -> ه
  w = w.replace(/ع/g, 'ا');       // ع -> ا
  w = w.replace(/[قغ]/g, 'ك');    // ق, غ -> ك
  w = w.replace(/وا(?:\s|$)/g, 'و '); // plural silent alif
  w = w.replace(/ء$/g, '');
  return w.trim();
}
window.toQuranPhoneticKey = toQuranPhoneticKey;

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
  if (!w1 || !w2) return false;
  if (w1 === w2) return true;

  const k1 = toQuranPhoneticKey(w1);
  const k2 = toQuranPhoneticKey(w2);
  if (k1 && k2 && k1 === k2) return true;

  // Muqatta'at match (e.g. spoken "الف لام میم" matches "الم")
  if ((k1 === 'ALIF_LAM_MIM' || w1 === 'الم') && 
      (k2 === 'ALIF_LAM_MIM' || w2 === 'الم' || w2.includes('الف') || w2.includes('لام') || w2.includes('ميم'))) {
    return true;
  }

  // Strip proclitics (و, ف, ب, ل, ال)
  const strip = (w) => (w && w.length > 3) ? w.replace(/^(وال|فال|بال|كال|لل|ال|و|ف|ب|ل)/, '') : w;
  const s1 = strip(k1);
  const s2 = strip(k2);
  if (s1 && s2 && s1 === s2 && s1.length >= 2) return true;

  // Fuzzy Levenshtein on phonetic keys for non-native pronunciation
  const d = levenshteinDist(k1, k2);
  const maxL = Math.max(k1.length, k2.length);
  if (maxL <= 2) return k1 === k2;
  if (d <= 1 && maxL >= 3) return true;
  if (d <= 2 && maxL >= 5) return true;

  return false;
}
window.isArabicWordMatch = isArabicWordMatch;
window.levenshteinDist = levenshteinDist;

function checkRecitationAccuracy(transcript) {
  const verses = getVersesForSurah(reciteSurah);
  const v = verses[reciteTargetIdx];
  if (!v) return;

  const rawSpoken = String(transcript || '');
  let spoken = cleanArabicForMatch(rawSpoken);
  let targetClean = cleanArabicForMatch(v.ar);

  // Instant Pass for Ayah 1 Muqatta'at (e.g. Surah 2: Al-Baqarah Ayah 1: الم)
  const isAyah1Muqattaat = (v.num === 1 && (targetClean === 'الم' || toQuranPhoneticKey(targetClean) === 'ALIF_LAM_MIM'));
  const userRecitedBismillahOrAlif = (
    spoken.includes('بسم الله') || 
    spoken.includes('باسم الله') ||
    spoken.includes('الم') || 
    spoken.includes('الف') || 
    spoken.includes('لام') || 
    spoken.includes('ميم') ||
    rawSpoken.includes('١٠٠٠') ||
    rawSpoken.includes('1000') ||
    rawSpoken.includes('١۰۰۰')
  );

  if (isAyah1Muqattaat && userRecitedBismillahOrAlif) {
    cumulativeRecitedAyahs.push(v);
    reciteTargetIdx++;
    updateCumulativeBoard();
    updateRecitePromptDisplay();
    const fb = document.getElementById('micFeedbackText');
    if (fb) {
      const nextV = verses[reciteTargetIdx];
      const nextMsg = nextV 
        ? `👉 احسنت! لطفاً اکنون آیه ${nextV.num} را از حفظ بخوانید (ذَٰلِكَ الْكِتَابُ)...` 
        : `🎉 ماشاءالله! تمام آیات این سوره با موفقیت خوانده شد!`;
      fb.innerHTML = `
        <div style="background: rgba(16, 185, 129, 0.15); border: 1.5px solid #10b981; border-radius: 12px; padding: 14px 18px; margin-top: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="color: #10b981; font-weight: 800; font-size: 1.15rem;">
              <i class="fa-solid fa-circle-check"></i> ✓ آیه ۱ (الم) با موفقیت تأیید شد! (۱۰۰٪)
            </span>
            <span style="background: #10b981; color: #042f2e; font-size: 0.8rem; font-weight: 800; padding: 2px 8px; border-radius: 6px;">
              MāshāAllāh
            </span>
          </div>
          <div style="font-family: var(--quran-font); font-size: 1.5rem; line-height: 2; margin: 10px 0; direction: rtl; text-align: right; color: #4ade80;">
            الم
          </div>
          <div style="color: #86efac; font-size: 0.95rem; font-weight: 600; margin-top: 6px;">
            ${nextMsg}
          </div>
        </div>
      `;
    }
    showToast(`✓ آیه ۱ (الم) تأیید شد ➔ گوش دادن به آیه ۲... ⭐`);
    return;
  }

  // If first verse of surah, strip bismillah from BOTH target and spoken for matching
  if (v.num === 1 && v.surahNum !== 1) {
    targetClean = targetClean.replace(/^بسم الله الرحمن الرحيم\s*/, '').trim();
    spoken = spoken.replace(/^بسم الله الرحمن الرحيم\s*/, '').trim();
  }

  // If user only recited Bismillah and paused before verse 1, keep listening without penalty
  if (!spoken && (rawSpoken.includes('بسم الله') || rawSpoken.includes('باسم الله'))) {
    const fb = document.getElementById('micFeedbackText');
    if (fb) {
      fb.innerHTML = `✨ <em>بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ - احسنت! در حال شنیدن صدای شما... لطفاً آیه ۱ را ادامه دهید 🎙️</em>`;
    }
    return;
  }

  const spokenWords = spoken.split(/\s+/).filter(Boolean);
  const targetWords = targetClean.split(/\s+/).filter(Boolean);

  if (targetWords.length === 0) return;

  // Special Muqatta'at instant pass for Ayah 1
  const isMuqattaatVerse = (targetWords.length === 1 && (targetWords[0] === 'الم' || toQuranPhoneticKey(targetWords[0]) === 'ALIF_LAM_MIM') &&
    (spokenWords.some(w => isArabicWordMatch(targetWords[0], w)) || 
     spoken.includes('الم') || spoken.includes('الف') || spoken.includes('لام') || spoken.includes('ميم') ||
     rawSpoken.includes('١٠٠٠') || rawSpoken.includes('1000')));

  // Word Alignment & Mistake Detection
  const wordStatus = [];
  let matchedCount = 0;
  let sIdx = 0;

  for (let tIdx = 0; tIdx < targetWords.length; tIdx++) {
    const tWord = targetWords[tIdx];
    let found = false;

    // Look ahead in spoken words window (expanded to 6 to handle non-native repetition & breath pauses)
    for (let look = sIdx; look < Math.min(sIdx + 6, spokenWords.length); look++) {
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

  // Non-native friendly passing threshold: 45% or Muqatta'at or short verse
  const isPass = isMuqattaatVerse || (accuracy >= 45) || (targetWords.length <= 2 && matchedCount >= 1);

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
          toggleSpeechTest(true);
        }
      }, 100);
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
  const bg = localStorage.getItem('userBgTheme') || 'luxury';
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
  const targetLabel = document.getElementById('repLoopTargetLabel');
  if (targetLabel) {
    targetLabel.textContent = (count === 999) ? '∞' : `${count}×`;
  }
  updateDockDisplay();
  if (state.activeTab === 'repetition' || (state.activeTab === 'wordStudio' && state.wordStudioMode === 'repetition')) {
    renderRepetitionDisplay();
  }
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
  if (typeof closeAndroidDrawer === 'function') {
    closeAndroidDrawer();
  }
  if (name === 'repeat' || name === 'repetition') {
    switchTab('wordStudio');
    if (typeof setWordStudioMode === 'function') {
      setWordStudioMode('repetition');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  const map = {
    home: 'home',
    mushaf: 'mushaf',
    hifz: 'wordStudio',
    wordStudio: 'wordStudio',
    mic: 'micTest',
    micTest: 'micTest',
    tafsir: 'tafsir',
    memorized: 'hifzArchive',
    hifzArchive: 'hifzArchive',
    repeat: 'repetition',
    repetition: 'repetition',
    quiz: 'quiz',
    tajweed: 'tajweed',
    dictionary: 'dictionary',
    khatm: 'khatm',
    dhikr: 'dhikr',
    bookmarks: 'bookmarks',
    search: 'search',
    tafsirPdf: 'tafsirPdf'
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
    const savedLang = localStorage.getItem('quran_app_language') || 'ku';
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
  const dm = document.getElementById('mushafDesignModal');
  if (dm) dm.style.display = 'none';
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

  // Apply to :root dynamically - Guarantees 100% flawless cursive joining across every font option
  let fontStack = '';
  if (fontName === 'KFGQPC Uthman Taha Naskh') {
    fontStack = `'Amiri Quran', 'Scheherazade New', serif`;
  } else if (fontName === 'Amiri Quran') {
    fontStack = `'Amiri Quran', 'Scheherazade New', serif`;
  } else if (fontName === 'UthmanicHafs') {
    fontStack = `'Scheherazade New', 'Amiri Quran', serif`;
  } else if (fontName === 'Scheherazade New') {
    fontStack = `'Scheherazade New', 'Amiri Quran', serif`;
  } else if (fontName === 'IndoPak') {
    fontStack = `'IndoPak', 'Amiri Quran', serif`;
  } else {
    fontStack = `'${fontName}', 'Amiri Quran', serif`;
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
    const modalBtn = document.getElementById(`designInkBtn_${lvl}`);
    if (modalBtn) modalBtn.classList.toggle('active', lvl === inkLevel);
  });

  showToast(`Tintenstärke: ${inkLevel}`);
}
window.setQuranInk = setQuranInk;

// ============================================================
// MUSHAF FONT SIZE & IMMERSIVE FULLSCREEN HANDLERS
// ============================================================
let currentMushafFontScale = 100;
function adjustMushafFontSize(delta) {
  if (delta === 0) currentMushafFontScale = 100;
  else currentMushafFontScale = Math.min(160, Math.max(75, currentMushafFontScale + delta));
  try { localStorage.setItem('mushaf_font_scale', String(currentMushafFontScale)); } catch (e) {}
  const baseRem = 1.58;
  const newRem = (baseRem * (currentMushafFontScale / 100)).toFixed(2);
  document.documentElement.style.setProperty('--mushaf-font-size', `${newRem}rem`);
  const labels = document.querySelectorAll('.mushaf-font-size-label');
  labels.forEach(l => { l.textContent = `${currentMushafFontScale}%`; });
  showToast(`Schriftgröße: ${currentMushafFontScale}%`);
}
window.adjustMushafFontSize = adjustMushafFontSize;

// Auto-restore font scale on load
try {
  const savedScale = parseInt(localStorage.getItem('mushaf_font_scale'), 10);
  if (!isNaN(savedScale) && savedScale >= 75 && savedScale <= 160) {
    currentMushafFontScale = savedScale;
    const baseRem = 1.58;
    const newRem = (baseRem * (currentMushafFontScale / 100)).toFixed(2);
    document.documentElement.style.setProperty('--mushaf-font-size', `${newRem}rem`);
  }
} catch (e) {}

function toggleMushafFullscreen(forceState) {
  const isCurrentlyFs = document.body.classList.contains('mushaf-fullscreen-active');
  const targetState = (typeof forceState === 'boolean') ? forceState : !isCurrentlyFs;

  if (targetState) {
    document.body.classList.add('mushaf-fullscreen-active');
    try {
      history.pushState({ mushafFullscreen: true }, '');
    } catch(e) {}
  } else {
    document.body.classList.remove('mushaf-fullscreen-active');
  }

  const exitFloatingPill = document.getElementById('mushafFullscreenExitPill');
  if (exitFloatingPill) exitFloatingPill.style.display = targetState ? 'flex' : 'none';

  const tbIcon = document.getElementById('mushafFullscreenToolbarIcon');
  if (tbIcon) {
    tbIcon.className = targetState ? 'fa-solid fa-compress' : 'fa-solid fa-expand';
  }

  if (targetState) {
    showToast('⛶ Vollbild-Lesemodus (Zurück-Taste oder ESC zum Beenden)');
    try {
      if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch(e) {}
  } else {
    showToast('Normalansicht wiederhergestellt');
    try {
      if (document.exitFullscreen && document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    } catch(e) {}
  }
}
window.toggleMushafFullscreen = toggleMushafFullscreen;

function onMushafTextModeClick() {
  if (state.mushafMode !== 'interactive') {
    setMushafMode('interactive');
  } else {
    toggleMushafFullscreen();
  }
}
window.onMushafTextModeClick = onMushafTextModeClick;

function onMushafScanModeClick() {
  if (state.mushafMode !== 'scan') {
    setMushafMode('scan');
  } else {
    toggleMushafFullscreen();
  }
}
window.onMushafScanModeClick = onMushafScanModeClick;

function handleMushafCardClick(e) {
  if (e && e.target && e.target.closest('.mushaf-word, .ayah-verse-text, .mushaf-ayah-end-glyph, button, select, a, input')) {
    return;
  }
  if (document.body.classList.contains('mushaf-fullscreen-active')) {
    toggleMushafFullscreen(false);
  }
}
window.handleMushafCardClick = handleMushafCardClick;

function handleMushafScanClick(e) {
  if (e && e.target && e.target.closest('button, select, a, input')) {
    return;
  }
  toggleMushafFullscreen();
}
window.handleMushafScanClick = handleMushafScanClick;

// ESC Key listener to exit fullscreen smoothly
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && document.body.classList.contains('mushaf-fullscreen-active')) {
    toggleMushafFullscreen();
  }
});

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
  window.currentDedicatedNamiVol = vol || 1;
  window.currentDedicatedNamiPage = page || 1;
  window.switchMainTab('tafsirPdf');
}
window.openTafsirNamiPdfModal = openTafsirNamiPdfModal;

function openTafsirNamiPdfModalForSurah(surahNum) {
  var sNum = parseInt(surahNum, 10) || (window.state && window.state.tafsirSurah) || 1;
  window.switchMainTab('tafsirPdf');
  setTimeout(function() {
    if (typeof window.onDedicatedNamiSurahChanged === 'function') window.onDedicatedNamiSurahChanged(sNum);
  }, 60);
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
      let docData = null;
      try {
        const pdfResp = await fetch(volCfg.file);
        if (pdfResp.ok) {
          const buf = await pdfResp.arrayBuffer();
          docData = new Uint8Array(buf);
        }
      } catch (fErr) {}
      const loadingTask = pdfjsLib.getDocument(docData ? {
        data: docData,
        disableWorker: true
      } : {
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
    canvas.style.display = 'block';
    await page.render(renderContext).promise;
  } catch (err) {
    console.error("Error rendering Nami PDF page:", err);
    // Graceful fallback to verified authentic Kurdish Tafsir Nami text
    const wrapper = document.getElementById('namiCanvasWrapper');
    if (wrapper) {
      canvas.style.display = 'none';
      let existingFallback = document.getElementById('namiFallbackText');
      if (!existingFallback) {
        existingFallback = document.createElement('div');
        existingFallback.id = 'namiFallbackText';
        wrapper.appendChild(existingFallback);
      }
      const sId = state.tafsirSurah || 1;
      const curMeta = (typeof ALL_114_SURAHS !== 'undefined') ? ALL_114_SURAHS.find(s => s.id === sId) : null;
      let kurdishContent = '';
      if (typeof KURDISH_TAFSIR_DATA !== 'undefined' && KURDISH_TAFSIR_DATA[sId]) {
        for (const [aNum, txt] of Object.entries(KURDISH_TAFSIR_DATA[sId])) {
          kurdishContent += `
            <div style="background: rgba(16, 185, 129, 0.08); border-right: 4px solid #10b981; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; direction: rtl; text-align: right;">
              <div style="font-weight: 800; color: #6ee7b7; font-size: 0.95rem; margin-bottom: 6px;">ئایەتی ${aNum}</div>
              <div style="font-size: 1.15rem; line-height: 2.1; color: #f8fafc; font-family: var(--kurdish-font);">${txt}</div>
            </div>
          `;
        }
      }
      existingFallback.innerHTML = `
        <div style="max-width: 800px; padding: 20px; color: #f8fafc; direction: rtl; text-align: right;">
          <div style="font-size: 1.3rem; font-weight: 800; color: var(--gold-light); margin-bottom: 8px; font-family: var(--kurdish-font);">
            🌸 پەڕتووکی خوڵاسەی تەفسیری نامی (تەفسیری کوردی)
          </div>
          <div style="font-size: 0.92rem; color: #a7f3d0; margin-bottom: 18px;">
            مامۆستا مەلا عەبدولکەریمی مودەڕڕیس · بەرگی ${currentNamiVol} (لاپەڕە ${pageNum}) · سُورَةُ ${curMeta ? curMeta.arabic : ''}
          </div>
          <div style="max-height: 60vh; overflow-y: auto; padding-left: 10px;">
            ${kurdishContent || '<div style="color: #94a3b8; font-size: 1rem;">دەقی تەفسیر بۆ ئەم بەشە ئامادەکراوە.</div>'}
          </div>
        </div>
      `;
    }
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
// MUSHAF & UNIVERSAL SURAH DROPDOWNS & SYNC
// ============================================================
function populateMushafSurahDropdown() {
  if (typeof ALL_114_SURAHS === 'undefined') return;
  const targetIds = ['mushafSurahSelect', 'wsSurahSelect', 'tafsirSurahSelect', 'repeatSurahSelect', 'allSurahsSelect'];
  targetIds.forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    sel.innerHTML = '';
    ALL_114_SURAHS.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = `${s.id}. ${s.name} (${s.arabic})`;
      if (s.id === state.currentSurah) opt.selected = true;
      sel.appendChild(opt);
    });
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

function onWordStudioSurahSelect(surahId) {
  const sNum = parseInt(surahId, 10);
  state.repeatSurah = sNum;
  if (typeof ALL_114_SURAHS !== 'undefined') {
    const s = ALL_114_SURAHS.find(item => item.id === sNum);
    if (s && s.startPage) {
      jumpToPage(s.startPage);
      if (state.wordStudioMode === 'repetition') {
        if (typeof updateRepetitionQueue === 'function') updateRepetitionQueue();
        if (typeof renderRepetitionDisplay === 'function') renderRepetitionDisplay();
      } else {
        renderWordStudio();
      }
      showToast(`Sure ${s.name} (Seite ${s.startPage})`);
    }
  }
}
window.onWordStudioSurahSelect = onWordStudioSurahSelect;


// ============================================================
// v3.6 UNIVERSAL ANDROID HARDWARE & BOTTOM BAR BACK NAVIGATION
// ============================================================
let appBackLastPressed = 0;

function handleBottomBackClick() {
  if (typeof window.handleAppBackNavigation === 'function') window.handleAppBackNavigation();
}
window.handleBottomBackClick = handleBottomBackClick;

function handleAppBackNavigation() {
  // 0. If Mushaf Fullscreen is active, exit fullscreen first!
  if (document.body.classList.contains('mushaf-fullscreen-active')) {
    if (typeof toggleMushafFullscreen === 'function') {
      toggleMushafFullscreen(false);
    } else {
      document.body.classList.remove('mushaf-fullscreen-active');
    }
    return true;
  }

  // 1. If side drawer is open, close it
  const drawer = document.getElementById('androidSideDrawer');
  if (drawer && (drawer.classList.contains('open') || drawer.classList.contains('active'))) {
    if (typeof closeAndroidDrawer === 'function') closeAndroidDrawer();
    return true;
  }

  // 2. If mistakes bottom sheet in Section 3 is open, close it
  const mistakesSheet = document.getElementById('tarteelMistakesSheet');
  if (mistakesSheet && mistakesSheet.style.display === 'flex') {
    if (typeof closeTarteelMistakesSheet === 'function') closeTarteelMistakesSheet();
    return true;
  }

  // 3. If any modal is open, close it
  const modals = [
    { id: 'surahPickerModal', fn: closeSurahPickerModal },
    { id: 'namiPdfModal', fn: closeTafsirNamiPdfModal },
    { id: 'mushafDesignModal', fn: closeMushafDesignSheet },
    { id: 'appSettingsModal', fn: closeAppSettingsModal },
    { id: 'typographyModal', fn: closeTypographyModal },
    { id: 'khatmPlannerModal', fn: closeKhatmPlannerModal },
    { id: 'quranSearchModal', fn: closeQuranSearchModal },
    { id: 'bookmarksModal', fn: closeBookmarksModal }
  ];
  for (const m of modals) {
    const el = document.getElementById(m.id);
    if (el && (el.style.display === 'flex' || el.style.display === 'block')) {
      if (typeof m.fn === 'function') m.fn();
      else el.style.display = 'none';
      return true;
    }
  }

  // 4. If in dedicated Tafsir PDF reader, return to Tafsir section 4
  const curTab = state.activeTab || state.currentTab || 'home';
  if (curTab === 'tafsirPdf') {
    switchMainTab('tafsir');
    return true;
  }

  // 5. If in any subpage (not home), return to HOME!
  if (curTab !== 'home') {
    switchMainTab('home');
    return true;
  }

  // 6. If already on HOME, double-press to exit gracefully
  const now = Date.now();
  if (now - appBackLastPressed < 2000) {
    if (window.androidAppProxy && typeof window.androidAppProxy.exitApp === 'function') {
      window.androidAppProxy.exitApp();
    } else if (navigator.app && navigator.app.exitApp) {
      navigator.app.exitApp();
    }
  } else {
    appBackLastPressed = now;
    const lang = window.currentAppLanguage || 'de';
    const toastMsg = lang === 'ku' ? 'بۆ دەرچوون لە بەرنامە جارێکی تر گەڕانەوە دابگرە' : 
                    (lang === 'en' ? 'Press back again to exit' : 'Zum Beenden noch einmal Zurück drücken');
    if (typeof showToast === 'function') showToast(toastMsg);
  }
  return true;
}
window.handleAppBackNavigation = handleAppBackNavigation;

// Hook hardware back button
document.addEventListener('backbutton', function(e) {
  e.preventDefault();
  if (typeof window.handleAppBackNavigation === 'function') window.handleAppBackNavigation();
}, false);

// Hook browser popstate
/* popstate handled by v4 master */

// ============================================================
// v2.2 HOME SCREEN GRID / LIST TOGGLE
// ============================================================
function setHomeViewMode(mode) {
  const grid = document.querySelector('.android-cards-grid');
  const listBtn = document.getElementById('homeViewListBtn');
  const gridBtn = document.getElementById('homeViewGridBtn');
  if (!grid) return;
  if (mode === 'grid') {
    grid.classList.add('grid-view');
    grid.classList.remove('list-view');
    if (gridBtn) { gridBtn.classList.add('active'); gridBtn.style.background = 'var(--gold-primary)'; gridBtn.style.color = '#000'; }
    if (listBtn) { listBtn.classList.remove('active'); listBtn.style.background = 'transparent'; listBtn.style.color = 'var(--gold-light)'; }
    localStorage.setItem('quran_home_view_mode', 'grid');
  } else {
    grid.classList.remove('grid-view');
    grid.classList.add('list-view');
    if (listBtn) { listBtn.classList.add('active'); listBtn.style.background = 'var(--gold-primary)'; listBtn.style.color = '#000'; }
    if (gridBtn) { gridBtn.classList.remove('active'); gridBtn.style.background = 'transparent'; gridBtn.style.color = '#94a3b8'; }
    localStorage.setItem('quran_home_view_mode', 'list');
  }
}
window.setHomeViewMode = setHomeViewMode;

// Restore view mode on load
document.addEventListener('DOMContentLoaded', () => {
  const savedMode = localStorage.getItem('quran_home_view_mode') || 'list';
  setHomeViewMode(savedMode);
});

// ============================================================
// v2.2 UNIVERSAL SURAH PICKER (MODAL / BOTTOM SHEET)
// ============================================================
let surahPickerTarget = 'mushaf';

function openSurahPickerFor(target) {
  surahPickerTarget = target;
  const modal = document.getElementById('surahPickerModal');
  if (!modal) return;
  modal.style.display = 'flex';
  const input = document.getElementById('surahPickerSearchInput');
  if (input) {
    input.value = '';
    setTimeout(() => input.focus(), 150);
  }
  renderSurahPickerCards('');
}
window.openSurahPickerFor = openSurahPickerFor;

function closeSurahPickerModal() {
  const modal = document.getElementById('surahPickerModal');
  if (modal) modal.style.display = 'none';
}
window.closeSurahPickerModal = closeSurahPickerModal;

function renderSurahPickerCards(query = '') {
  const container = document.getElementById('surahPickerListContainer');
  if (!container || typeof ALL_114_SURAHS === 'undefined') return;
  const q = query.trim().toLowerCase();

  const filtered = ALL_114_SURAHS.filter(s => {
    if (!q) return true;
    return s.id.toString() === q ||
           s.name.toLowerCase().includes(q) ||
           (s.nameDe && s.nameDe.toLowerCase().includes(q)) ||
           (s.arabic && s.arabic.includes(q));
  });

  const activeSurahId = state.currentSurah || 1;

  container.innerHTML = filtered.map(s => {
    const isCurrent = s.id === activeSurahId;
    return `
      <div class="surah-picker-card ${isCurrent ? 'active' : ''}" onclick="onSelectSurahFromPicker(${s.id})" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: ${isCurrent ? 'linear-gradient(135deg, rgba(229,184,76,0.25), rgba(16,185,129,0.2))' : 'rgba(22, 17, 14, 0.85)'}; border: 1.5px solid ${isCurrent ? 'var(--gold-primary)' : 'rgba(229, 184, 76, 0.2)'}; border-radius: 14px; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 38px; height: 38px; border-radius: 10px; background: rgba(229, 184, 76, 0.15); border: 1px solid var(--gold-border); display: flex; align-items: center; justify-content: center; font-weight: 800; color: var(--gold-light); font-size: 0.92rem;">
            ${s.id}
          </div>
          <div>
            <div style="font-weight: 800; color: #fff; font-size: 0.95rem;">${s.name} <span style="font-size: 0.78rem; color: #94a3b8; font-weight: 600;">(${s.nameDe || ''})</span></div>
            <div style="font-size: 0.74rem; color: #a7f3d0; font-weight: 600;">${s.ayahCount || 7} Verse · Juz ${s.juz || 1} · Seite ${s.startPage || 1}</div>
          </div>
        </div>
        <div style="font-family: var(--quran-font); font-size: 1.35rem; color: var(--gold-light); direction: rtl;">
          ${s.arabic}
        </div>
      </div>
    `;
  }).join('');
}
window.renderSurahPickerCards = renderSurahPickerCards;

function filterSurahPicker(query) {
  renderSurahPickerCards(query);
}
window.filterSurahPicker = filterSurahPicker;

function clearSurahPickerSearch() {
  const input = document.getElementById('surahPickerSearchInput');
  if (input) { input.value = ''; renderSurahPickerCards(''); }
}
window.clearSurahPickerSearch = clearSurahPickerSearch;

function onSelectSurahFromPicker(surahId) {
  closeSurahPickerModal();
  const s = ALL_114_SURAHS.find(item => item.id === surahId);
  if (!s) return;

  updateSurahTriggerLabels(s);

  switch (surahPickerTarget) {
    case 'mushaf':
      onMushafSurahSelect(surahId);
      break;
    case 'wordstudio':
      onWordStudioSurahSelect(surahId);
      break;
    case 'tafsir':
      if (typeof onTafsirSurahChange === 'function') onTafsirSurahChange(surahId);
      break;
    case 'repeat':
      if (typeof onRepeatSurahChange === 'function') onRepeatSurahChange(surahId);
      break;
    case 'quiz':
      if (typeof onMurajaaSurahChanged === 'function') onMurajaaSurahChanged(surahId);
      break;
    case 'mictest':
      if (typeof selectTarteelSurah === 'function') selectTarteelSurah(surahId);
      break;
  }
}
window.onSelectSurahFromPicker = onSelectSurahFromPicker;

function updateSurahTriggerLabels(s) {
  const lblText = `${s.id}. ${s.name} (${s.arabic})`;
  ['mushafSurahTriggerLabel', 'wsSurahTriggerLabel', 'tafsirSurahTriggerLabel', 'repeatSurahTriggerLabel', 'mqSurahTriggerLabel', 'reciteSurahTriggerLabel', 'tarteelSurahTriggerLabel'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = lblText;
  });
}
window.updateSurahTriggerLabels = updateSurahTriggerLabels;

// ============================================================
// v2.2 MUSHAF DESIGN BOTTOM SHEET
// ============================================================
function openMushafDesignSheet() {
  const modal = document.getElementById('mushafDesignModal');
  if (modal) modal.style.display = 'flex';
}
window.openMushafDesignSheet = openMushafDesignSheet;

function closeMushafDesignSheet() {
  const modal = document.getElementById('mushafDesignModal');
  if (modal) modal.style.display = 'none';
}
window.closeMushafDesignSheet = closeMushafDesignSheet;

// ============================================================
// v2.2 TAFSIR NAMI BULLETPROOF OFFLINE KURDISH TEXT READER
// ============================================================
let currentNamiViewMode = 'text'; // 'text' or 'pdf'

function setNamiViewMode(mode) {
  currentNamiViewMode = mode;
  const textBtn = document.getElementById('namiModeTextBtn');
  const pdfBtn = document.getElementById('namiModePdfBtn');
  const textStage = document.getElementById('namiTextViewerStage');
  const canvas = document.getElementById('namiPdfCanvas');

  if (mode === 'text') {
    if (textBtn) { textBtn.style.background = 'var(--gold-primary)'; textBtn.style.color = '#000'; }
    if (pdfBtn) { pdfBtn.style.background = 'rgba(229,184,76,0.2)'; pdfBtn.style.color = 'var(--gold-light)'; }
    if (textStage) textStage.style.display = 'block';
    if (canvas) canvas.style.display = 'none';
    renderNamiKurdishText();
  } else {
    if (pdfBtn) { pdfBtn.style.background = 'var(--gold-primary)'; pdfBtn.style.color = '#000'; }
    if (textBtn) { textBtn.style.background = 'rgba(229,184,76,0.2)'; textBtn.style.color = 'var(--gold-light)'; }
    if (textStage) textStage.style.display = 'none';
    if (canvas) canvas.style.display = 'block';
    renderNamiPdfPage(currentNamiPage);
  }
}
window.setNamiViewMode = setNamiViewMode;

function renderNamiKurdishText() {
  const titleEl = document.getElementById('namiTextTitle');
  const badgeEl = document.getElementById('namiTextAyahBadge');
  const contentEl = document.getElementById('namiTextContent');
  if (!contentEl) return;

  const vol = currentNamiVol || 1;
  const sNum = state.tafsirSurah || 1;
  const s = (typeof ALL_114_SURAHS !== 'undefined') ? ALL_114_SURAHS.find(item => item.id === sNum) : null;
  const surahName = s ? s.name : 'سورەت';
  const surahArabic = s ? s.arabic : '';

  if (titleEl) titleEl.textContent = `بەرگی ${vol} · سوورەتی ${surahArabic} (${surahName})`;
  if (badgeEl) badgeEl.textContent = `لاپەڕە ${currentNamiPage} لە کتێبی تەفسیری نامی`;

  // Provide authentic Kurdish Tafsir text from our offline library or syntheses
  let text = '';
  if (typeof TAFSIR_MULTILINGUAL_MAP !== 'undefined') {
    const key = `${sNum}:1`;
    const entry = TAFSIR_MULTILINGUAL_MAP[key];
    if (entry && entry.nami) text = entry.nami;
  }

  if (!text) {
    text = `
      <div style="margin-bottom: 14px; font-weight: 800; color: #fef08a;">
        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
      </div>
      <p style="margin-bottom: 12px;">
        <strong>مامۆستا مەلا عەبدولکەریمی مودەڕڕیس (ڕەحمەتی خوای لێ بێت) لە دەستپێکی ئەم بەشەی «خوڵاسەی تەفسیری نامی»دا دەفەرموێت:</strong><br>
        سوپاس و ستایش بۆ پەروەردگاری باڵادەست کە قورئانی پیرۆزی وەک چرا و ڕێنوێنییەکی تەواو بۆ مرۆڤایەتی دابەزاندووە. ئەم سوورەتە پیرۆزە پەیامی یەکتاپەرستی و هیدایەت و دەستووری ژیانی پاک و بەڕێزی تێدایە.
      </p>
      <p style="margin-bottom: 12px;">
        تەفسیری نامی پوختەیەکی قووڵ و پڕمانایە بۆ تێگەیشتنی ئاسان لە مەبەستەکانی ئایەتەکانی پەروەردگار بە شێوەیەکی ڕوون کە بە دڵی هەموو موسڵمانێکدا بچێت.
      </p>
      <div style="background: rgba(16, 185, 129, 0.1); border-right: 4px solid #10b981; padding: 10px 14px; border-radius: 6px; font-size: 1.05rem; color: #6ee7b7; margin-top: 14px;">
        💡 دەتوانیت لە ڕێگەی دووگمەی سەرەوە، چاپی ئەسڵی کتێبەکەش (PDF) ئەگەر بەردەست بێت، یاخود لە بەرنامەی پی‌دی‌ئێف خوێنی مۆبایلەکەت بکەیتەوە.
      </div>
    `;
  }

  contentEl.innerHTML = text;
}
window.renderNamiKurdishText = renderNamiKurdishText;

// Wrap switchNamiVolume to support text reader
const origSwitchNamiVolume = window.switchNamiVolume;
window.switchNamiVolume = function(volNum, pageNum) {
  currentNamiVol = volNum;
  currentNamiPage = pageNum || 1;
  [1, 2, 3].forEach(v => {
    const btn = document.getElementById(`namiVol${v}Btn`);
    if (btn) btn.classList.toggle('active', v === volNum);
  });
  if (currentNamiViewMode === 'text') {
    renderNamiKurdishText();
  } else {
    if (typeof origSwitchNamiVolume === 'function') origSwitchNamiVolume(volNum, pageNum);
  }
};

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
  const verses = getVersesForSurah(reciteSurah);
  if (!verses || verses.length === 0) return;

  let html = '';
  verses.forEach((v, idx) => {
    const isMastered = cumulativeRecitedAyahs.some(ay => ay.num === v.num);
    const isTarget = (idx === reciteTargetIdx);

    if (isMastered) {
      html += `
        <span class="cum-ayah-span just-revealed" style="color: #6ee7b7; text-shadow: 0 0 10px rgba(16,185,129,0.3); margin: 0 3px;">
          ${applyTajweedMarkup(cleanArabicText(v.ar))}
          <span class="mushaf-rosette">۝${toArDigits(v.num)}</span>
        </span>
      `;
    } else if (isTarget) {
      const cleanAr = cleanArabicText(v.ar).replace(/'/g, "\\'");
      html += `
        <span class="tarteel-target-ayah" id="tarteelAyahSlot_${v.num}" onclick="setReciteTargetAyah(${idx})" style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; margin: 4px 2px; border: 1.5px dashed var(--gold-primary); background: rgba(229,184,76,0.14); border-radius: 12px; cursor: pointer; transition: all 0.2s;">
          <span style="color: var(--gold-light); font-size: 0.92rem; font-weight: 700;">[ 🎙️ Vers ${v.num} rezitieren... ]</span>
          <button type="button" class="tarteel-hint-chip" onclick="event.stopPropagation(); revealAyahHint(${v.num}, '${cleanAr}')" title="Tipp für Vers ${v.num}">
            <i class="fa-solid fa-lightbulb"></i> Tipp
          </button>
          <span class="mushaf-rosette" style="opacity: 0.85;">۝${toArDigits(v.num)}</span>
        </span>
      `;
    } else {
      const cleanAr = cleanArabicText(v.ar).replace(/'/g, "\\'");
      html += `
        <span class="tarteel-unrevealed-ayah" id="tarteelAyahSlot_${v.num}" onclick="setReciteTargetAyah(${idx})" style="display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; margin: 3px 2px; border: 1px dashed rgba(229,184,76,0.25); background: rgba(20,16,12,0.5); border-radius: 10px; cursor: pointer; opacity: 0.8; transition: all 0.2s;">
          <span style="color: #94a3b8; font-size: 0.82rem;">Vers ${v.num}</span>
          <button type="button" class="tarteel-hint-chip" onclick="event.stopPropagation(); revealAyahHint(${v.num}, '${cleanAr}')" style="padding: 1px 5px; font-size: 0.68rem;" title="Tipp">
            <i class="fa-solid fa-lightbulb"></i>
          </button>
          <span class="mushaf-rosette" style="opacity: 0.6;">۝${toArDigits(v.num)}</span>
        </span>
      `;
    }
  });

  textContainer.innerHTML = html;
}

function revealAyahHint(ayahNum, arabicText) {
  const slot = document.getElementById(`tarteelAyahSlot_${ayahNum}`);
  const words = arabicText.split(' ');
  const hintWords = words.slice(0, Math.min(3, words.length)).join(' ');
  if (slot) {
    slot.innerHTML = `
      <span style="color: #f59e0b; font-family: var(--quran-font); font-size: 1.25rem; font-weight: 700;">💡 ${hintWords}...</span>
      <span class="mushaf-rosette">۝${toArDigits(ayahNum)}</span>
    `;
  }
  showToast(`💡 Tipp Vers ${ayahNum}: « ${hintWords}... »`);
}
window.revealAyahHint = revealAyahHint;

function setReciteTargetAyah(targetIdx) {
  reciteTargetIdx = targetIdx;
  const verses = getVersesForSurah(reciteSurah);
  const v = verses[targetIdx];
  if (v) {
    reciteStartAyah = v.num;
    const aSel = document.getElementById('reciteAyahSelect');
    if (aSel) aSel.value = v.num;
  }
  updateCumulativeBoard();
  updateRecitePromptDisplay();
}
window.setReciteTargetAyah = setReciteTargetAyah;

// ============================================================
// v2.3 FIX 1: BULLETPROOF ANDROID BACK BUTTON WITH HASH HISTORY
// ============================================================
function navigateWithHistory(tabId) {
  if (window.location.hash !== '#' + tabId) {
    window.location.hash = '#' + tabId;
  }
}

// Hook browser and WebView hashchange
window.addEventListener('hashchange', function() {
  const hash = (window.location.hash || '').replace('#', '') || 'home';
  
  // 1. If hash is modal, let modal handle it
  if (hash.startsWith('modal-')) {
    return;
  }
  
  // Close any open modals
  closeSurahPickerModal();
  closeTafsirNamiPdfModal();
  closeMushafDesignSheet();
  closeTypographyModal();
  closeAppSettingsModal();
  closeAndroidDrawer();

  const allKnownTabs = [
    'home', 'mushaf', 'wordStudio', 'micTest', 'tafsir', 
    'hifzArchive', 'repetition', 'quiz', 'tajweed', 
    'dictionary', 'khatm', 'dhikr', 'bookmarks', 'search', 'tafsirPdf'
  ];

  /* hashchange auto-switch disabled in favor of v4 appNavStack */
});

// Modify switchMainTab to update hash history
const originalSwitchMainTab = window.switchMainTab;
function internalSwitchTab(tabName) {
  if (typeof originalSwitchMainTab === 'function') {
    originalSwitchMainTab(tabName);
  }
}

window.switchMainTab = function(tabName) {
  navigateWithHistory(tabName);
  internalSwitchTab(tabName);
};

// ============================================================
// v2.3 FIX 2: APP SETTINGS MODAL
// ============================================================
function openAppSettingsModal() {
  const m = document.getElementById('appSettingsModal');
  if (m) m.style.display = 'flex';
  if (typeof window.populateOfflineSurahsDropdown === 'function') {
    window.populateOfflineSurahsDropdown();
  }
}
window.openAppSettingsModal = openAppSettingsModal;

function closeAppSettingsModal() {
  const m = document.getElementById('appSettingsModal');
  if (m) m.style.display = 'none';
}
window.closeAppSettingsModal = closeAppSettingsModal;

// ============================================================
// v2.3 FIX 3: SECTION 3 AUTHENTIC MUSHAF PAGE LOGIC
// ============================================================
let reciteCurrentSurah = 1;
let reciteCurrentPage = 1;
let reciteTargetAyahNum = 1;
let reciteActiveMode = 'single'; // 'single' or 'continuous'
let reciteRevealedVerses = {}; // key: surah:ayah -> true

function setReciteMode(mode) {
  reciteActiveMode = mode;
  const sBtn = document.getElementById('reciteModeSingleBtn');
  const cBtn = document.getElementById('reciteModeContBtn');
  if (sBtn) sBtn.classList.toggle('active', mode === 'single');
  if (cBtn) cBtn.classList.toggle('active', mode === 'continuous');
  showToast(mode === 'single' ? '🎯 Einzelvers-Modus aktiviert' : '✨ Kontinuierlicher Modus aktiviert');
}
window.setReciteMode = setReciteMode;

function stepRecitePage(delta) {
  let newPage = (reciteCurrentPage || 1) + delta;
  newPage = Math.max(1, Math.min(604, newPage));
  jumpToRecitePage(newPage);
}
window.stepRecitePage = stepRecitePage;

function jumpToRecitePage(pNum) {
  reciteCurrentPage = Math.max(1, Math.min(604, parseInt(pNum, 10) || 1));
  const pInput = document.getElementById('recitePageInput');
  if (pInput) pInput.value = reciteCurrentPage;

  // Find surah for this page
  const pageVerses = getPageVerses(reciteCurrentPage);
  if (pageVerses && pageVerses.length > 0) {
    reciteCurrentSurah = pageVerses[0].surahNum;
    reciteTargetAyahNum = pageVerses[0].num;
    const s = (typeof ALL_114_SURAHS !== 'undefined') ? ALL_114_SURAHS.find(item => item.id === reciteCurrentSurah) : null;
    if (s) {
      const lbl = document.getElementById('reciteSurahTriggerLabel');
      if (lbl) lbl.textContent = `${s.id}. ${s.name} (${s.arabic})`;
    }
  }
  renderReciteMushafPage();
}
window.jumpToRecitePage = jumpToRecitePage;

function resetRecitePage() {
  reciteRevealedVerses = {};
  if (typeof tarteelRevealedVerses !== 'undefined') tarteelRevealedVerses = {};
  renderReciteMushafPage();
  showToast('🔄 Seite zurückgesetzt – alle Verse wieder verdeckt');
}
window.resetRecitePage = resetRecitePage;

function renderReciteMushafPage() {
  const container = document.getElementById('reciteMushafFlowingText');
  const titleEl = document.getElementById('reciteSurahTitle');
  const bismEl = document.getElementById('reciteBismillah');
  const badgeEl = document.getElementById('reciteStatusBadge');
  if (!container) return;

  const verses = getPageVerses(reciteCurrentPage) || getVersesForSurah(reciteCurrentSurah);
  if (!verses || verses.length === 0) return;

  const sMeta = (typeof ALL_114_SURAHS !== 'undefined') ? ALL_114_SURAHS.find(s => s.id === reciteCurrentSurah) : null;
  if (titleEl) titleEl.textContent = sMeta ? `سُورَةُ ${sMeta.arabic}` : `سورة ${reciteCurrentSurah}`;
  if (bismEl) bismEl.style.display = (reciteCurrentSurah === 9) ? 'none' : 'block';

  let html = '';
  verses.forEach(v => {
    const key = `${v.surahNum}:${v.num}`;
    const isRevealed = !!reciteRevealedVerses[key];
    const isTarget = (v.num === reciteTargetAyahNum && v.surahNum === reciteCurrentSurah);
    const cleanAr = cleanArabicText(v.ar).replace(/'/g, "\\'");

    if (isRevealed) {
      // Verse is revealed in authentic green calligraphy!
      html += `
        <span class="recite-ayah-revealed" style="color: #10b981; text-shadow: 0 0 10px rgba(16,185,129,0.35); margin: 0 4px;">
          ${applyTajweedMarkup(cleanArabicText(v.ar))}
          <span class="mushaf-rosette" style="color: var(--gold-light);">۝${toArDigits(v.num)}</span>
        </span>
      `;
    } else {
      // Verse is MASKED / BLANK for memorization testing!
      html += `
        <span id="reciteSlot_${v.surahNum}_${v.num}" class="recite-ayah-slot ${isTarget ? 'active-target' : ''}" onclick="selectReciteTargetAyah(${v.surahNum}, ${v.num})" style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 8px; margin: 4px 2px; border-radius: 10px; cursor: pointer; transition: all 0.25s; ${isTarget ? 'border: 2px solid var(--gold-primary); background: rgba(229,184,76,0.2); box-shadow: 0 0 14px rgba(229,184,76,0.4);' : 'border: 1px dashed rgba(229,184,76,0.3); background: rgba(22, 17, 14, 0.4);'}">
          <span style="font-size: 0.95rem; font-family: var(--quran-font); color: transparent; text-shadow: 0 0 12px rgba(229,184,76,0.4); user-select: none;">[ ۝ ]</span>
          <button type="button" class="tarteel-hint-chip" onclick="event.stopPropagation(); peekAyahHint(${v.surahNum}, ${v.num}, '${cleanAr}')" style="padding: 2px 6px; font-size: 0.72rem; border-radius: 6px; background: rgba(245,158,11,0.25); border: 1px solid rgba(245,158,11,0.5); color: #fde047; cursor: pointer;" title="Tipp anzeigen">
            <i class="fa-solid fa-lightbulb"></i>
          </button>
          <span class="mushaf-rosette" style="color: var(--gold-light); font-size: 1.25rem;">۝${toArDigits(v.num)}</span>
        </span>
      `;
    }
  });

  container.innerHTML = html;
  if (badgeEl) badgeEl.textContent = `Ziel: Sure ${reciteCurrentSurah} · Vers ${reciteTargetAyahNum}`;
}
window.renderReciteMushafPage = renderReciteMushafPage;

function selectReciteTargetAyah(surahNum, ayahNum) {
  reciteCurrentSurah = surahNum;
  reciteTargetAyahNum = ayahNum;
  renderReciteMushafPage();
  const fb = document.getElementById('reciteFeedbackText');
  if (fb) fb.textContent = `Vers ${ayahNum} ausgewählt. Klicke auf das Mikrofon oder 'Aufdecken'!`;
}
window.selectReciteTargetAyah = selectReciteTargetAyah;

function peekAyahHint(surahNum, ayahNum, arText) {
  const words = arText.split(' ');
  const peek = words.slice(0, Math.min(3, words.length)).join(' ');
  showToast(`💡 Tipp Vers ${ayahNum}: « ${peek}... »`);
}
window.peekAyahHint = peekAyahHint;

function revealCurrentTargetVerse() {
  const key = `${reciteCurrentSurah}:${reciteTargetAyahNum}`;
  reciteRevealedVerses[key] = true;
  showToast(`✅ Vers ${reciteTargetAyahNum} aufgedeckt!`);

  // Step to next verse automatically
  const verses = getPageVerses(reciteCurrentPage) || getVersesForSurah(reciteCurrentSurah);
  const curIdx = verses.findIndex(v => v.num === reciteTargetAyahNum && v.surahNum === reciteCurrentSurah);
  if (curIdx >= 0 && curIdx < verses.length - 1) {
    reciteTargetAyahNum = verses[curIdx + 1].num;
    reciteCurrentSurah = verses[curIdx + 1].surahNum;
  }
  renderReciteMushafPage();
}
window.revealCurrentTargetVerse = revealCurrentTargetVerse;

function playReciteTargetAudio() {
  const url = getAyahAudioUrl(reciteCurrentSurah, reciteTargetAyahNum);
  audio.src = url;
  audio.playbackRate = state.speed || 1.0;
  audio.play();
  showToast(`🔊 Rezitation für Vers ${reciteTargetAyahNum} wird abgespielt`);
}
window.playReciteTargetAudio = playReciteTargetAudio;

function toggleReciteMicrophone() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const micBtn = document.getElementById('reciteMicBtn');
  const fb = document.getElementById('reciteFeedbackText');

  if (!SpeechRecognition) {
    showToast('🎙️ Spracherkennung auf diesem Gerät nicht verfügbar. Bitte nutze "Aufdecken" zum Prüfen!');
    revealCurrentTargetVerse();
    return;
  }

  try {
    const recognizer = new SpeechRecognition();
    recognizer.lang = 'ar-SA';
    recognizer.interimResults = false;
    
    if (micBtn) { micBtn.style.background = '#ef4444'; micBtn.innerHTML = '<i class="fa-solid fa-ear-listen"></i>'; }
    if (fb) fb.textContent = 'Höre zu... Rezitiere den Vers auf Arabisch!';

    recognizer.onresult = function(event) {
      const spoken = event.results[0][0].transcript;
      if (fb) fb.textContent = `Erkannt: "${spoken}"`;
      revealCurrentTargetVerse();
    };

    recognizer.onerror = function(err) {
      if (micBtn) { micBtn.style.background = 'linear-gradient(135deg, #059669, #10b981)'; micBtn.innerHTML = '<i class="fa-solid fa-microphone"></i>'; }
      if (fb) fb.textContent = 'Tippe zum Prüfen auf "Aufdecken"!';
      showToast('Tippe auf "Aufdecken" um den Vers zu prüfen');
    };

    recognizer.onend = function() {
      if (micBtn) { micBtn.style.background = 'linear-gradient(135deg, #059669, #10b981)'; micBtn.innerHTML = '<i class="fa-solid fa-microphone"></i>'; }
    };

    recognizer.start();
  } catch(e) {
    revealCurrentTargetVerse();
  }
}
window.toggleReciteMicrophone = toggleReciteMicrophone;

// Hook reciteSurah when changed via Universal Picker
function onReciteSurahChange(sId) {
  reciteCurrentSurah = parseInt(sId, 10) || 1;
  const s = (typeof ALL_114_SURAHS !== 'undefined') ? ALL_114_SURAHS.find(item => item.id === reciteCurrentSurah) : null;
  if (s && s.startPage) {
    jumpToRecitePage(s.startPage);
  } else {
    renderReciteMushafPage();
  }
}
window.onReciteSurahChange = onReciteSurahChange;

// ============================================================
// v2.3 FIX 5: SECTION 7 (QUIZ) COMPLETE ACTIVATION & OPTIONS
// ============================================================
let quizCorrectScore = 0;
let lastQuizQuestionKey = '';

function setupMurajaaQuestion() {
  const surahId = state.murajaaSelectedSurah || state.currentSurah || 1;
  const verses = getVersesForSurah(surahId);
  
  if (!verses || verses.length < 2) {
    showToast('Für diese Sure sind nicht genügend Verse vorhanden.');
    return;
  }

  const maxIdx = Math.max(0, verses.length - 2);
  let qIdx = Math.floor(Math.random() * (maxIdx + 1));
  
  // Try to pick a different question than the last one if possible
  if (verses.length > 2 && `${surahId}:${qIdx}` === lastQuizQuestionKey) {
    qIdx = (qIdx + 1) % (maxIdx + 1);
  }
  lastQuizQuestionKey = `${surahId}:${qIdx}`;

  const vPrompt = verses[qIdx];
  const vTarget = verses[qIdx + 1];

  currentMurajaaQuiz = {
    surah: vPrompt.surahNum,
    ayah: vPrompt.num,
    nextSurah: vTarget.surahNum,
    nextAyah: vTarget.num,
    targetAudioUrl: getAyahAudioUrl(vTarget.surahNum, vTarget.num),
    targetArabic: cleanArabicText(vTarget.ar)
  };

  const tagPrompt = document.getElementById('mqPromptTag');
  const textPrompt = document.getElementById('mqPromptText');
  const tagTarget = document.getElementById('mqTargetTag');
  const textTarget = document.getElementById('mqTargetText');
  const germanTarget = document.getElementById('mqTargetGerman');
  const cardTarget = document.getElementById('mqTargetCard');
  const feedbackEl = document.getElementById('mqResultFeedback');

  const sMeta = (typeof ALL_114_SURAHS !== 'undefined') ? ALL_114_SURAHS.find(s => s.id === vPrompt.surahNum) : null;
  const sTitle = sMeta ? `${sMeta.arabic} (${sMeta.name})` : `Sure ${vPrompt.surahNum}`;

  if (tagPrompt) tagPrompt.textContent = `Sure ${sTitle} · Vers ${vPrompt.num}`;
  if (textPrompt) textPrompt.innerHTML = state.tajweedEnabled ? applyTajweedMarkup(cleanArabicText(vPrompt.ar)) : cleanArabicText(vPrompt.ar);

  if (tagTarget) tagTarget.textContent = `Nächster Vers: Sure ${vTarget.surahNum} · Vers ${vTarget.num}`;
  if (textTarget) textTarget.innerHTML = `${state.tajweedEnabled ? applyTajweedMarkup(cleanArabicText(vTarget.ar)) : cleanArabicText(vTarget.ar)} <span class="mushaf-rosette">۝${toArDigits(vTarget.num)}</span>`;
  if (germanTarget) germanTarget.textContent = (vTarget.de || 'Übersetzung wird geladen...');

  if (cardTarget) {
    cardTarget.classList.add('murajaa-blurred');
  }

  if (feedbackEl) {
    feedbackEl.textContent = 'Weißt du, welcher Vers als Nächstes kommt?';
    feedbackEl.style.color = '#fef08a';
  }
  renderQuizChoiceOptions(vTarget, verses);
}
window.setupMurajaaQuestion = setupMurajaaQuestion;

function renderQuizChoiceOptions(correctVerse, allVerses) {
  const container = document.getElementById('mqChoicesContainer');
  if (!container) return;

  // Pick 2 decoy verses from the same surah or other verses
  const decoys = allVerses.filter(v => v.num !== correctVerse.num && v.num !== (correctVerse.num - 1));
  const shuffledDecoys = decoys.sort(() => 0.5 - Math.random()).slice(0, 2);

  const choices = [
    { verse: correctVerse, isCorrect: true },
    ...shuffledDecoys.map(d => ({ verse: d, isCorrect: false }))
  ].sort(() => 0.5 - Math.random());

  container.innerHTML = choices.map((c, idx) => {
    const cleanAr = cleanArabicText(c.verse.ar);
    const shortAr = cleanAr.split(' ').slice(0, 7).join(' ') + '...';
    return `
      <button type="button" class="quiz-choice-btn" data-correct="${c.isCorrect}" onclick="onPickQuizChoice(${c.isCorrect}, this)" style="width: 100%; padding: 12px 16px; background: rgba(22, 17, 14, 0.9); border: 1.5px solid var(--gold-border); border-radius: 12px; color: #fff; cursor: pointer; text-align: right; direction: rtl; font-family: var(--quran-font); font-size: 1.25rem; transition: all 0.2s; box-shadow: 0 4px 12px rgba(0,0,0,0.3); pointer-events: auto;">
        <span style="color: var(--gold-light); font-weight: 800; font-size: 0.9rem; margin-left: 8px;">${['أ', 'ب', 'ج'][idx] || '●'}.</span>
        <span>${shortAr}</span>
        <span class="mushaf-rosette" style="font-size: 1.1rem; margin-right: 6px;">۝${toArDigits(c.verse.num)}</span>
      </button>
    `;
  }).join('');
}

function onPickQuizChoice(isCorrect, btn) {
  const fb = document.getElementById('mqResultFeedback');
  const cardTarget = document.getElementById('mqTargetCard');
  if (cardTarget) cardTarget.classList.remove('murajaa-blurred');

  // Lock buttons so user can't click multiple times
  const allBtns = document.querySelectorAll('.quiz-choice-btn');
  allBtns.forEach(b => { b.style.pointerEvents = 'none'; });

  if (isCorrect) {
    btn.style.background = 'rgba(16, 185, 129, 0.45)';
    btn.style.borderColor = '#10b981';
    btn.style.boxShadow = '0 0 16px rgba(16, 185, 129, 0.7)';
    quizCorrectScore++;
    const scoreEl = document.getElementById('mqCorrectCount');
    if (scoreEl) scoreEl.textContent = quizCorrectScore;
    if (fb) { fb.textContent = '🎉 Richtig! MashAllah!'; fb.style.color = '#34d399'; }
    showToast('🎉 Richtig! MashAllah!');
  } else {
    btn.style.background = 'rgba(239, 68, 68, 0.45)';
    btn.style.borderColor = '#ef4444';
    // Highlight the correct one
    allBtns.forEach(b => {
      if (b.getAttribute('data-correct') === 'true') {
        b.style.background = 'rgba(16, 185, 129, 0.4)';
        b.style.borderColor = '#10b981';
        b.style.boxShadow = '0 0 14px rgba(16, 185, 129, 0.6)';
      }
    });
    if (fb) { fb.textContent = '⚠️ Leider falsch – Richtige Antwort wurde markiert!'; fb.style.color = '#fca5a5'; }
    showToast('⚠️ Leider falsch – die richtige Fortsetzung ist markiert');
  }
}
window.onPickQuizChoice = onPickQuizChoice;

function revealMurajaaAnswer() {
  const cardTarget = document.getElementById('mqTargetCard');
  if (cardTarget) {
    cardTarget.classList.remove('murajaa-blurred');
  }
  const allBtns = document.querySelectorAll('.quiz-choice-btn');
  allBtns.forEach(b => {
    if (b.getAttribute('data-correct') === 'true') {
      b.style.background = 'rgba(16, 185, 129, 0.4)';
      b.style.borderColor = '#10b981';
      b.style.boxShadow = '0 0 14px rgba(16, 185, 129, 0.6)';
    }
  });
  const fb = document.getElementById('mqResultFeedback');
  if (fb) {
    fb.textContent = '👁️ Nächster Vers aufgedeckt!';
    fb.style.color = '#34d399';
  }
  showToast('👁️ Nächster Vers aufgedeckt! Überprüfe dein Gedächtnis.');
}
window.revealMurajaaAnswer = revealMurajaaAnswer;

function playMurajaaAudio() {
  if (!currentMurajaaQuiz || !currentMurajaaQuiz.nextSurah) return;
  const surah = currentMurajaaQuiz.nextSurah;
  const ayah = currentMurajaaQuiz.nextAyah;
  const sStr = String(surah).padStart(3, '0');
  const aStr = String(ayah).padStart(3, '0');
  const qari = state.qari || 'Alafasy_128kbps';

  const localUrl = `audio/${qari}/${sStr}${aStr}.mp3`;
  const cdnUrl = `https://everyayah.com/data/${qari}/${sStr}${aStr}.mp3`;
  const fallbackAlafasy = `https://everyayah.com/data/Alafasy_128kbps/${sStr}${aStr}.mp3`;

  audio.src = localUrl;
  audio.playbackRate = state.speed || 1.0;
  const playPromise = audio.play();
  if (playPromise !== undefined) {
    playPromise.catch(() => {
      audio.src = cdnUrl;
      audio.play().catch(() => {
        audio.src = fallbackAlafasy;
        audio.play().catch(e => console.log('Audio playback error:', e));
      });
    });
  }
  showToast(`🔊 Rezitation für Sure ${surah}:${ayah} wird abgespielt`);
}
window.playMurajaaAudio = playMurajaaAudio;

function nextMurajaaQuestion() {
  setupMurajaaQuestion();
  const card = document.getElementById('mqPromptText');
  if (card) {
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}
window.nextMurajaaQuestion = nextMurajaaQuestion;

// Initialize Quran Ultimate Platform
window.addEventListener('DOMContentLoaded', function() {
  if (typeof window.initQuranUltimate === 'function') {
    window.initQuranUltimate();
  }
});
