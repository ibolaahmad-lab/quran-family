// app_v4_master_overhaul.js
// Master Engine v4.0 — Comprehensive Overhaul Addressing All 18 User Requirements

(function () {
  'use strict';

  // Ensure PDF.js Worker is configured immediately so PDF rendering never throws "No GlobalWorkerOptions.workerSrc"
  if (typeof pdfjsLib !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdf.worker.min.js';
  }

  // Disable PIN lock permanently as requested in Point 4
  try {
    localStorage.setItem('quran_family_unlocked', 'true');
    const lockOverlay = document.getElementById('familyLockOverlay');
    if (lockOverlay) lockOverlay.style.display = 'none';
  } catch (e) {}

  // ============================================================
  // 1. STEP-BY-STEP NAVIGATION HISTORY STACK & BACK BUTTON (Point 1, 5, 15)
  // ============================================================
  window.appNavStack = ['home'];
  window.activeCategoryHub = null;
  window.activeTajweedCategoryId = null;
  window.activeSpiritualSubView = 'hub'; // 'hub' | 'dalail_list' | 'dalail_reader' | 'burda_list' | 'burda_reader' | 'duas_reader'
  let lastBackExitAttempt = 0;

  function pushNavHistory(entry) {
    if (!entry) return;
    const top = window.appNavStack[window.appNavStack.length - 1];
    if (top !== entry) {
      window.appNavStack.push(entry);
      if (window.appNavStack.length > 35) {
        window.appNavStack.splice(1, window.appNavStack.length - 35);
      }
    }
  }
  window.pushNavHistory = pushNavHistory;

  // Wrap switchTab / switchMainTab so every tab change is tracked in appNavStack
  const baseSwitchTab = window.switchTab;
  window.switchMainTab = function (name, skipHistoryPush) {
    if (typeof closeAndroidDrawer === 'function') closeAndroidDrawer();
    if (typeof closeCategoryHub === 'function') closeCategoryHub(true);

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

    if (!skipHistoryPush) {
      if (target === 'home') {
        window.appNavStack = ['home'];
      } else {
        pushNavHistory(target);
      }
    }

    if (typeof baseSwitchTab === 'function') {
      baseSwitchTab(target);
    }

    // Ensure active class and explicit display are toggled on tab-panes
    document.querySelectorAll('.tab-pane').forEach(p => {
      const isTarget = p.id === 'pane' + target.charAt(0).toUpperCase() + target.slice(1);
      if (isTarget) {
        p.classList.add('active');
        p.style.display = 'block';
      } else {
        p.classList.remove('active');
        p.style.display = 'none';
      }
    });

    try {
      localStorage.setItem('quran_active_tab', target);
    } catch (e) {}

    // Update bottom nav button highlights
    const abnHome = document.getElementById('abnHome');
    const abnMushaf = document.getElementById('abnMushaf');
    const abnHifz = document.getElementById('abnHifz');
    const abnSmartAudio = document.getElementById('abnSmartAudio');
    const abnSearch = document.getElementById('abnSearch');
    if (abnHome) abnHome.classList.toggle('active', target === 'home');
    if (abnMushaf) abnMushaf.classList.toggle('active', target === 'mushaf');
    if (abnHifz) abnHifz.classList.toggle('active', target === 'hifz' || target === 'wordStudio');
    if (abnSmartAudio) abnSmartAudio.classList.toggle('active', target === 'micTest' || target === 'mic');
    if (abnSearch) abnSearch.classList.toggle('active', target === 'search');

    // Trigger post-switch initializers
    if (target === 'mushaf') {
      if (typeof loadPage === 'function' && (!window.state || !window.state.currentVersesData || window.state.currentVersesData.length === 0)) {
        loadPage((window.state && window.state.currentPage) || 1);
      } else if (typeof renderInteractiveMushaf === 'function') {
        renderInteractiveMushaf();
      }
    }
    if (target === 'tajweed') renderDedicatedTajweed();
    if (target === 'dictionary') renderDedicatedDictionary(document.getElementById('dictSearchInput')?.value || '');
    if (target === 'khatm') updateDedicatedKhatm();
    if (target === 'dhikr') renderSpiritualCenter();
    if (target === 'tafsirPdf') initDedicatedTafsirPdf();
    if (target === 'quiz') initSheikhQuizStudio();
    if (target === 'hifzArchive') renderHifzArchiveModern();
    if (target === 'search') renderDedicatedSearch(document.getElementById('dedicatedSearchInput')?.value || '');
    if (target === 'home' && typeof renderContinueReadingCard === 'function') renderContinueReadingCard();

    updateSectionStarButtons();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Master Bulletproof Step-by-Step Back Handler
  function handleAppBackNavigation() {
    try {
      // 0. If Mushaf Fullscreen is active, exit fullscreen first!
      if (document.body.classList.contains('mushaf-fullscreen-active')) {
        if (typeof toggleMushafFullscreen === 'function') {
          toggleMushafFullscreen(false);
        } else {
          document.body.classList.remove('mushaf-fullscreen-active');
        }
        return true;
      }

      // 1. If side drawer is open, close it first
      const drawer = document.getElementById('androidSideDrawer');
      if (drawer && (drawer.classList.contains('open') || drawer.classList.contains('active'))) {
        if (typeof closeAndroidDrawer === 'function') closeAndroidDrawer();
        else drawer.classList.remove('open', 'active');
        return true;
      }

      // 2. If Section 3 Mistakes Bottom Sheet is open, close it
      const mistakesSheet = document.getElementById('tarteelMistakesSheetModal');
      if (mistakesSheet && mistakesSheet.style.display && mistakesSheet.style.display !== 'none') {
        mistakesSheet.style.display = 'none';
        return true;
      }

      // 3. If any modal overlay is open (Settings, Surah Picker, Prayer Times, Tafsir Picker, Category Hub, Design Sheet, Nami Modal, etc.), close it
      const modalIds = [
        'appSettingsModal',
        'surahPickerModal',
        'prayerSettingsModal',
        'tafsirSourcePickerModal',
        'mushafDesignModal',
        'namiPdfModal',
        'typographyModal',
        'khatmPlannerModal',
        'quranSearchModal',
        'bookmarksModal',
        'tajweedAcademyModal',
        'categoryHubModal'
      ];
      for (let i = 0; i < modalIds.length; i++) {
        const el = document.getElementById(modalIds[i]);
        if (el && el.style.display && el.style.display !== 'none') {
          el.style.display = 'none';
          if (modalIds[i] === 'categoryHubModal') window.activeCategoryHub = null;
          return true;
        }
      }

      const curTab = (window.state && (window.state.activeTab || window.state.currentTab)) || 'home';

      // 4. Step-by-step sub-view back inside Spiritual Center (Dalail / Burda / Duas)
      if (curTab === 'dhikr') {
        if (window.activeSpiritualSubView === 'dalail_reader') {
          openSpiritualMode('dalail_list', true);
          return true;
        }
        if (window.activeSpiritualSubView === 'burda_reader') {
          openSpiritualMode('burda_list', true);
          return true;
        }
      }

      // 5. Step-by-step sub-view back inside Tajweed Academy (from Rule Detail back to 6 Categories Menu)
      if (curTab === 'tajweed' && window.activeTajweedCategoryId) {
        window.activeTajweedCategoryId = null;
        renderDedicatedTajweed();
        return true;
      }

      // 6. From Tafsir Nami PDF Book Reader -> always return directly to Tafsir Studio (Point 15)
      if (curTab === 'tafsirPdf') {
        if (window.appNavStack[window.appNavStack.length - 1] === 'tafsirPdf') {
          window.appNavStack.pop();
        }
        window.switchMainTab('tafsir', true);
        return true;
      }

      // 7. Pop navigation stack to return to previous menu, drawer, or category hub
      if (window.appNavStack.length > 1) {
        window.appNavStack.pop(); // remove current
        const prev = window.appNavStack[window.appNavStack.length - 1] || 'home';
        if (prev.startsWith('drawer:')) {
          window.appNavStack.pop(); // pop drawer
          const groupToOpen = prev.replace('drawer:', '');
          openAndroidDrawer(groupToOpen);
          return true;
        } else if (prev.startsWith('hub:')) {
          const hubName = prev.replace('hub:', '');
          window.switchMainTab('home', true);
          openCategoryHub(hubName, true);
          return true;
        } else {
          window.switchMainTab(prev, true);
          return true;
        }
      }

      // 8. If on any sub-tab not in stack, return to Drawer if navigated from there, else Home
      if (curTab !== 'home') {
        if (window.lastDrawerNavState && (Date.now() - window.lastDrawerNavState.timestamp < 3600000)) {
          const groupToOpen = window.lastDrawerNavState.groupId;
          window.lastDrawerNavState = null;
          openAndroidDrawer(groupToOpen);
          return true;
        }
        window.appNavStack = ['home'];
        window.switchMainTab('home', true);
        return true;
      }

      // 9. Already on Home: require double press within 2 seconds to exit app
      const now = Date.now();
      if (now - lastBackExitAttempt < 2000) {
        if (window.androidAppProxy && typeof window.androidAppProxy.exitApp === 'function') {
          window.androidAppProxy.exitApp();
        } else if (navigator.app && typeof navigator.app.exitApp === 'function') {
          navigator.app.exitApp();
        }
      } else {
        lastBackExitAttempt = now;
        const lang = window.currentAppLanguage || 'ku';
        const msg = lang === 'ku'
          ? 'بۆ دەرچوون لە بەرنامە جارێکی تر گەڕانەوە دابگرە'
          : (lang === 'en' ? 'Press back again to exit' : 'Zum Beenden noch einmal Zurück drücken');
        if (typeof showToast === 'function') showToast(msg);
      }
      return true;
    } catch (err) {
      console.error('Back navigation error caught safely:', err);
      if (typeof baseSwitchTab === 'function') baseSwitchTab('home');
      return true;
    }
  }

  window.handleAppBackNavigation = handleAppBackNavigation;
  window.handleBottomBackClick = handleAppBackNavigation;
  window.closeKhatmPlannerModal = function () {
    const m = document.getElementById('khatmPlannerModal');
    if (m) m.style.display = 'none';
  };
  window.closeQuranSearchModal = function () {
    const m = document.getElementById('quranSearchModal');
    if (m) m.style.display = 'none';
  };
  window.closeBookmarksModal = function () {
    const m = document.getElementById('bookmarksModal');
    if (m) m.style.display = 'none';
  };

  // ============================================================
  // 2. 3D GRAPHICAL CATEGORY HUBS & ACCORDION DRAWER (Points 4, 8, 14)
  // ============================================================
  const CATEGORY_HUBS_CONFIG = {
    studios: {
      titleDe: '📖 Koran-Studios (1–4)',
      titleEn: '📖 Quran Studios (1–4)',
      titleKu: '📖 ستۆدیۆکانی قورئان (١–٤)',
      subDe: 'Muṣḥaf & Lesung · Wort-für-Wort Studio · Smarte Rezitation · Tafsīr',
      subEn: 'Muṣḥaf & Reading · Word-for-Word · Smart Recitation · Tafsīr',
      subKu: 'مەسحەف و خوێندنەوە · وشە بە وشە · دەنگی زیرەک · تەفسیر',
      color: '#f59e0b',
      items: [
        {
          icon: 'fa-book-open',
          grad: 'linear-gradient(135deg, #f59e0b, #b45309)',
          glow: 'rgba(245, 158, 11, 0.4)',
          titleDe: '1. Muṣḥaf & Lesung',
          titleEn: '1. Muṣḥaf & Reading',
          titleKu: '١. مەسحەف و خوێندنەوە',
          descDe: '604 Seiten · Uthmān-Taha Text, Tajweed & HD Medina Scan',
          descEn: '604 Pages · Uthmān-Taha Text, Tajweed & HD Medina Scan',
          descKu: '٦٠٤ لاپەڕە · دەقی عوسمان تەها، ڕەنگەکانی تەجوید و سکانی فەرمی مەدینە',
          badge: '604 Seiten',
          action: "switchMainTab('mushaf')"
        },
        {
          icon: 'fa-language',
          grad: 'linear-gradient(135deg, #38bdf8, #0284c7)',
          glow: 'rgba(56, 189, 248, 0.4)',
          titleDe: '2. Wort-für-Wort Studio',
          titleEn: '2. Word-for-Word Studio',
          titleKu: '٢. ستۆدیۆی وشە بە وشە',
          descDe: 'Wort-Analyse, Einzelwort-Audio & Stufen-Hifz',
          descEn: 'Word Analysis, Single Word Audio & Progressive Hifz',
          descKu: 'شیکاری وشە بە وشە، دەنگی تاکە وشە و قۆناغەکانی لەبەرکردن',
          badge: 'Wort-Audio',
          action: "switchMainTab('wordStudio')"
        },
        {
          icon: 'fa-microphone-lines',
          grad: 'linear-gradient(135deg, #10b981, #047857)',
          glow: 'rgba(16, 185, 129, 0.45)',
          titleDe: '3. Smarte Rezitation & Hifz',
          titleEn: '3. Smart Recitation & Hifz',
          titleKu: '٣. خوێندنەوەی زیرەک و لەبەرکردن',
          descDe: '1. Einzelvers-Modus & 2. Fortlaufend-Modus mit KI-Fehlererkennung',
          descEn: '1. Single Verse & 2. Continuous Mode with AI Recognition',
          descKu: '١. تاک ئایەت و ٢. بەردەوام بە دیاریکردنی هەڵە بە دەنگ',
          badge: 'Tarteel AI 🎙️',
          action: "switchMainTab('micTest')"
        },
        {
          icon: 'fa-book-open-reader',
          grad: 'linear-gradient(135deg, #ec4899, #be185d)',
          glow: 'rgba(236, 72, 153, 0.4)',
          titleDe: '4. Tafsīr & Übersetzungen',
          titleEn: '4. Tafsīr & Translations',
          titleKu: '٤. تەفسیر و وەرگێڕانەکان',
          descDe: 'Bubenheim · Amir Zaidan · Al-Muyassar · Tafsīr Nāmī Buch (PDF)',
          descEn: 'Bubenheim · Amir Zaidan · Al-Muyassar · Tafsīr Nāmī Book (PDF)',
          descKu: 'تەفسیری کوردی ڕێبەر و پوختە · پەڕتووکی تەفسیری نامی (PDF) و ئەوانی تر',
          badge: 'Alle 114 Suren',
          action: "switchMainTab('tafsir')"
        }
      ]
    },
    lernen: {
      titleDe: '🎓 Lernen & Studieren',
      titleEn: '🎓 Learning & Study',
      titleKu: '🎓 فێربوون و خوێندنەوە',
      subDe: 'Tafsīr & Übersetzungen · 5-Stufen Hifz',
      subEn: 'Tafsīr & Translations · 5-Stage Hifz',
      subKu: 'تەفسیر و وەرگێڕانەکان · ٥ قۆناغی لەبەرکردن',
      color: '#ec4899',
      items: [
        {
          icon: 'fa-book-open',
          grad: 'linear-gradient(135deg, #ec4899, #be185d)',
          glow: 'rgba(236, 72, 153, 0.4)',
          titleDe: 'Tafsīr & Übersetzungen',
          titleEn: 'Tafsīr & Translations',
          titleKu: 'تەفسیر و وەرگێڕانەکان',
          descDe: 'Bubenheim · Amir Zaidan · Al-Muyassar · Tafsīr Nāmī Buch (PDF)',
          descEn: 'Bubenheim · Amir Zaidan · Al-Muyassar · Tafsīr Nāmī Book (PDF)',
          descKu: 'تەفسیری کوردی ڕێبەر و پوختە · پەڕتووکی تەفسیری نامی (PDF)',
          badge: 'Alle 114 Suren',
          action: "switchMainTab('tafsir')"
        },
        {
          icon: 'fa-layer-group',
          grad: 'linear-gradient(135deg, #a855f7, #6d28d9)',
          glow: 'rgba(168, 85, 247, 0.4)',
          titleDe: '5-Stufen Hifz-Lernstudio',
          titleEn: '5-Stage Hifz Learning Studio',
          titleKu: 'ستۆدیۆی ٥ قۆناغی لەبەرکردن',
          descDe: '5-Stufen Resonanz-Training & Endlos-Loop (1× bis ∞)',
          descEn: '5-Stage Resonance Training & Endless Loop (1× to ∞)',
          descKu: 'ڕاهێنانی ٥ قۆناغی لەبەرکردن و دووبارەکردنەوەی بێ کۆتایی',
          badge: '5 Stufen 🎧',
          action: "switchMainTab('repetition')"
        }
      ]
    },
    tracking: {
      titleDe: '📊 Verfolgen & Prüfung',
      titleEn: '📊 Tracking & Quiz',
      titleKu: '📊 بەدواداچوون و تاقیکردنەوە',
      subDe: 'Hifz-Archiv ⭐ · Hifz-Quiz · Khatm-Planer',
      subEn: 'Hifz Archive ⭐ · Hifz Quiz · Khatm Planner',
      subKu: 'ئەرشیفی حیفظ ⭐ · تاقیکردنەوە · پلانی خەتم',
      color: '#a855f7',
      items: [
        {
          icon: 'fa-star',
          grad: 'linear-gradient(135deg, #eab308, #a16207)',
          glow: 'rgba(234, 179, 8, 0.4)',
          titleDe: 'Hifz- & Fortschrittsarchiv ⭐',
          titleEn: 'Hifz Progress & Starred Archive',
          titleKu: 'ئەرشیفی لەبەرکردن و نیشانەکراوەکان ⭐',
          descDe: 'Alle markierten Suren, Seiten & gelernten Verse an einem Ort',
          descEn: 'All bookmarked Surahs, pages & memorized verses in one place',
          descKu: 'هەموو سورەت و لاپەڕە و ئایەتە لەبەرکراوەکان لە یەک شوێن',
          badge: 'Markierungen ⭐',
          action: "switchMainTab('hifzArchive')"
        },
        {
          icon: 'fa-microphone-lines',
          grad: 'linear-gradient(135deg, #10b981, #059669)',
          glow: 'rgba(168, 85, 247, 0.4)',
          titleDe: 'Hifz-Quiz & Prüfung',
          titleEn: 'Hifz Quiz & Continuation',
          titleKu: 'تاقیکردنەوەی حیفظ',
          descDe: 'Sure wählen und den nächsten Vers per Mikrofon oder Auswahl fortsetzen',
          descEn: 'Choose Surah and recite next verse via microphone or choices',
          descKu: 'سورەتێک دیاری بکە و ئایەتی دواتر بە دەنگ یان بژاردە تەواو بکە',
          badge: 'Interaktiv 🎙️',
          action: "switchMainTab('quiz')"
        },
        {
          icon: 'fa-calendar-check',
          grad: 'linear-gradient(135deg, #06b6d4, #0e7490)',
          glow: 'rgba(6, 182, 212, 0.4)',
          titleDe: 'Khatm-Koranplaner',
          titleEn: 'Khatm Quran Planner',
          titleKu: 'پلاندانەری خەتمی قورئان',
          descDe: 'Visueller 3D-Fortschrittsring (604 Seiten) mit direktem Muṣḥaf-Sprung',
          descEn: 'Visual 3D progress ring (604 pages) with direct Muṣḥaf jump',
          descKu: 'پێشکەوتنی بینراوی ٣D لە ٦٠٤ لاپەڕە بە ڕۆیشتن بۆ ناو مەسحەف',
          badge: '604 Seiten',
          action: "switchMainTab('khatm')"
        }
      ]
    },
    duas: {
      titleDe: '🤲 Bittgebete, Dalā\'il & Burdah',
      titleEn: '🤲 Supplications, Dalā\'il & Burdah',
      titleKu: '🤲 دوعاکان، دەلائلولخەیرات و قەسیدەی بوردە',
      subDe: 'Dalā\'il al-Khayrāt · Qasīda al-Burdah · Rabbana & Adhkār',
      subEn: 'Dalā\'il al-Khayrāt · Qasīda al-Burdah · Rabbana & Adhkār',
      subKu: 'دەلائلولخەیرات · قەسیدەی بوردە · دوعاکانی ڕەببەنا و زیکرەکان',
      color: '#10b981',
      items: [
        {
          icon: 'fa-book-quran',
          grad: 'linear-gradient(135deg, #10b981, #047857)',
          glow: 'rgba(16, 185, 129, 0.45)',
          titleDe: 'Dalā\'il al-Khayrāt (دلائل الخيرات)',
          titleEn: 'Dalā\'il al-Khayrāt (Complete Ahzab + Audio)',
          titleKu: 'پەڕتووکی دەلائلولخەیرات (حزب بە حزب + دەنگ)',
          descDe: 'Eröffnung, 201 Namen & alle 8 Tages-Ahzāb zum Mitlesen & Abspielen',
          descEn: 'Opening, 201 Names & all 8 daily Ahzāb with audio',
          descKu: 'دەستپێک، ٢٠١ ناوەکانی پێغەمبەر ﷺ و هەموو ٨ حیزبەکە بە خوێندنەوە و دەنگ',
          badge: 'Mit Audio ▶️',
          action: "openSpiritualFeature('dalail_list')"
        },
        {
          icon: 'fa-scroll',
          grad: 'linear-gradient(135deg, #f59e0b, #b45309)',
          glow: 'rgba(245, 158, 11, 0.45)',
          titleDe: 'Qasīda al-Burdah (قصيدة البردة)',
          titleEn: 'Qasīda al-Burdah (All 10 Chapters + Audio)',
          titleKu: 'قەسیدەی بوردەی ئیمامی بوصەیری (١٠ فەسڵ + دەنگ)',
          descDe: 'Alle 10 Kapitel von Imam al-Būṣīrī Vers für Vers mit Refrain & Audio',
          descEn: 'All 10 chapters by Imam al-Būṣīrī with refrain & audio',
          descKu: 'هەموو ١٠ فەسڵەکەی ئیمامی بوصەیری بە دەقی تەواو و دەنگ',
          badge: '10 Kapitel ▶️',
          action: "openSpiritualFeature('burda_list')"
        },
        {
          icon: 'fa-hands-praying',
          grad: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
          glow: 'rgba(59, 130, 246, 0.45)',
          titleDe: 'Koranische & Prophetische Duas',
          titleEn: '40 Rabbana Duas & Prophetic Adhkar',
          titleKu: '٤٠ دوعای ڕەببەنا و زیکرەکانی بەیانیان و ئێواران',
          descDe: '40 Rabbana-Bittgebete, Morgen-, Abend- & Nacht-Adhkār mit Audio',
          descEn: '40 Rabbana duas, morning, evening & night adhkar with audio',
          descKu: '٤٠ دوعای قورئانی ڕەببەنا، زیکرەکانی بەیانیان و ئێواران و خەوتن بە دەنگ',
          badge: 'Mit Audio 🔊',
          action: "openSpiritualFeature('duas_reader')"
        }
      ]
    }
  };

  function openCategoryHub(hubKey, skipHistory) {
    const cfg = CATEGORY_HUBS_CONFIG[hubKey];
    if (!cfg) return;
    window.activeCategoryHub = hubKey;
    if (!skipHistory) {
      pushNavHistory('hub:' + hubKey);
    }

    let modal = document.getElementById('categoryHubModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'categoryHubModal';
      modal.className = 'typography-modal-overlay';
      modal.style.cssText = 'display: none; position: fixed; inset: 0; background: rgba(4, 7, 11, 0.85); z-index: 10600; backdrop-filter: blur(16px); align-items: center; justify-content: center; padding: 16px;';
      modal.onclick = function (e) {
        if (e.target === modal) closeCategoryHub();
      };
      document.body.appendChild(modal);
    }

    const lang = window.currentAppLanguage || 'ku';
    const mainTitle = lang === 'ku' ? cfg.titleKu : (lang === 'en' ? cfg.titleEn : cfg.titleDe);
    const subTitle = lang === 'ku' ? (cfg.subKu || cfg.subDe) : (lang === 'en' ? (cfg.subEn || cfg.subDe) : cfg.subDe);

    const cardsHtml = cfg.items.map(item => {
      const t = lang === 'ku' ? item.titleKu : (lang === 'en' ? item.titleEn : item.titleDe);
      return `
        <div class="neo3d-hub-item-card" onclick="closeCategoryHub(true); ${item.action}">
          <div class="neo3d-orb-icon" style="background: ${item.grad}; box-shadow: 0 8px 20px ${item.glow}, inset 0 2px 3px rgba(255,255,255,0.35);">
            <i class="fa-solid ${item.icon}"></i>
          </div>
          <div style="flex: 1; min-width: 0;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 4px;">
              <span style="font-weight: 800; font-size: 1rem; color: #f8fafc;">${t}</span>
              <span style="font-size: 0.7rem; font-weight: 800; padding: 3px 9px; border-radius: 20px; background: rgba(255,255,255,0.08); color: #fef08a; white-space: nowrap;">${item.badge}</span>
            </div>
            <div style="font-size: 0.8rem; color: #94a3b8; line-height: 1.4;">${lang === 'ku' ? (item.descKu || item.descDe) : (lang === 'en' ? (item.descEn || item.descDe) : item.descDe)}</div>
          </div>
          <i class="fa-solid fa-chevron-right" style="color: #64748b; font-size: 0.9rem;"></i>
        </div>
      `;
    }).join('');

    modal.innerHTML = `
      <div class="neo3d-hub-sheet" onclick="event.stopPropagation()">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; padding-bottom: 14px; border-bottom: 1px solid rgba(255,255,255,0.08);">
          <div>
            <h3 style="margin: 0; font-size: 1.25rem; font-weight: 900; color: #fff; letter-spacing: 0.2px;">${mainTitle}</h3>
            <div style="font-size: 0.78rem; color: #94a3b8; margin-top: 3px;">${subTitle}</div>
          </div>
          <button onclick="closeCategoryHub()" class="neo3d-close-btn" title="Schließen">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${cardsHtml}
        </div>
      </div>
    `;
    modal.style.display = 'flex';
  }
  window.openCategoryHub = openCategoryHub;

  function closeCategoryHub(keepStack) {
    const modal = document.getElementById('categoryHubModal');
    if (modal) modal.style.display = 'none';
    window.activeCategoryHub = null;
    if (!keepStack && window.appNavStack[window.appNavStack.length - 1]?.startsWith('hub:')) {
      window.appNavStack.pop();
    }
  }
  window.closeCategoryHub = closeCategoryHub;

  function openSpiritualFeature(subView) {
    window.activeSpiritualSubView = subView;
    window.switchMainTab('dhikr');
    openSpiritualMode(subView, true);
  }
  window.openSpiritualFeature = openSpiritualFeature;

  function toggleDrawerGroup(groupId) {
    const body = document.getElementById('drawerGroupBody_' + groupId);
    const arrow = document.getElementById('drawerGroupArrow_' + groupId);
    if (!body) return;
    const isHidden = (body.style.display === 'none' || !body.style.display);
    // Collapse others for ultra-clean look
    ['studios', 'lernen', 'tracking', 'duas'].forEach(g => {
      const b = document.getElementById('drawerGroupBody_' + g);
      const a = document.getElementById('drawerGroupArrow_' + g);
      if (b && g !== groupId) b.style.display = 'none';
      if (a && g !== groupId) a.style.transform = 'rotate(0deg)';
    });
    body.style.display = isHidden ? 'flex' : 'none';
    if (arrow) arrow.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
  }
  window.toggleDrawerGroup = toggleDrawerGroup;

  function openAndroidDrawer(targetGroup) {
    const drawer = document.getElementById('androidSideDrawer');
    const backdrop = document.getElementById('androidDrawerBackdrop');
    if (drawer) drawer.classList.add('open');
    if (backdrop) backdrop.style.display = 'block';

    if (targetGroup) {
      // Re-opening from back navigation: keep requested group open
      ['studios', 'lernen', 'tracking', 'duas'].forEach(g => {
        const b = document.getElementById('drawerGroupBody_' + g);
        const a = document.getElementById('drawerGroupArrow_' + g);
        const isTarget = (g === targetGroup);
        if (b) b.style.display = isTarget ? 'flex' : 'none';
        if (a) a.style.transform = isTarget ? 'rotate(180deg)' : 'rotate(0deg)';
      });
    } else {
      // Fresh open: ALL subcategories start CLOSED / COLLAPSED per user requirement!
      ['studios', 'lernen', 'tracking', 'duas'].forEach(g => {
        const b = document.getElementById('drawerGroupBody_' + g);
        const a = document.getElementById('drawerGroupArrow_' + g);
        if (b) b.style.display = 'none';
        if (a) a.style.transform = 'rotate(0deg)';
      });
    }
  }
  window.openAndroidDrawer = openAndroidDrawer;

  function openItemFromDrawer(target, subAction, groupId) {
    window.lastDrawerNavState = {
      groupId: groupId,
      target: target,
      timestamp: Date.now()
    };
    if (Array.isArray(window.appNavStack)) {
      const top = window.appNavStack[window.appNavStack.length - 1];
      if (!top || !top.startsWith('drawer:')) {
        window.appNavStack.push('drawer:' + groupId);
      }
    }
    try {
      history.pushState({ source: 'drawer', group: groupId, target: target }, '');
    } catch (e) {}

    closeAndroidDrawer();

    if (typeof subAction === 'function') {
      subAction();
    } else if (target) {
      window.switchMainTab(target);
    }
  }
  window.openItemFromDrawer = openItemFromDrawer;

  // ============================================================
  // 3. NEO-3D MODERN THEMES & TRILINGUAL SETTINGS ENGINE (Point 7)
  // ============================================================
  function applyNeo3DTheme(themeId) {
    document.body.classList.remove('theme-emerald3d', 'theme-sapphire3d', 'theme-amethyst3d', 'theme-pearl3d');
    document.body.classList.add('theme-' + themeId);
    localStorage.setItem('quran_neo3d_theme', themeId);

    ['emerald3d', 'sapphire3d', 'amethyst3d', 'pearl3d'].forEach(t => {
      const card = document.getElementById('themeCard_' + t);
      if (card) {
        card.classList.toggle('active', t === themeId);
      }
    });

    if (typeof applyOneClickTheme === 'function') {
      const legacyMap = { emerald3d: 'emerald', sapphire3d: 'andalusian', amethyst3d: 'gold', pearl3d: 'sepia' };
      applyOneClickTheme(legacyMap[themeId] || 'emerald');
    }
  }
  window.applyNeo3DTheme = applyNeo3DTheme;

  function translateSettingsModalUI(langCode) {
    const lang = langCode || window.currentAppLanguage || 'ku';
    const map = {
      de: {
        langHdr: '1. Sprache / Language / زمان',
        themeHdr: '2. Neo-3D Design & Themen',
        offHdr: '3. Offline-Qāri’ herunterladen',
        qariLbl: 'Rezitator (Qāri’) wählen:',
        scopeLbl: 'Offline-Paket / Sure wählen:',
        optCur: '📖 Aktuell geöffnete Sure offline speichern',
        optEss: '🌟 Wichtigste Suren (Al-Fatiha, Al-Kahf, Ya-Sin, Ar-Rahman, Al-Mulk)',
        optJuz: '🎓 Juz \'Amma (Suren 78–114) für Hifz & Gebet',
        optAll: '🕋 Ganzer Heiliger Koran (Alle 114 Suren)',
        desc: 'Lädt die Rezitation herunter, damit sie ohne Internet im Muṣḥaf, Wort-Studio, Tarteel und Quiz funktioniert.',
        btn: 'Jetzt für Offline-Nutzung herunterladen',
        ready: 'Bereit'
      },
      en: {
        langHdr: '1. App Language / Sprache / زمان',
        themeHdr: '2. Neo-3D Themes & Visual Style',
        offHdr: '3. Offline Qāri’ Audio Downloader',
        qariLbl: 'Select Reciter (Qāri’):',
        scopeLbl: 'Select Offline Package / Surah:',
        optCur: '📖 Save Currently Open Surah Offline',
        optEss: '🌟 Essential Surahs (Al-Fatiha, Al-Kahf, Ya-Sin, Ar-Rahman, Al-Mulk)',
        optJuz: '🎓 Juz \'Amma (Surahs 78–114) for Hifz & Prayer',
        optAll: '🕋 Complete Holy Quran (All 114 Surahs)',
        desc: 'Downloads the recitation so it works offline across Muṣḥaf, Word Studio, Tarteel, and Quiz.',
        btn: 'Download Now for Offline Use',
        ready: 'Ready'
      },
      ku: {
        langHdr: '١. زمانی بەرنامە / Sprache / Language',
        themeHdr: '٢. دیزاینی سێ‌ڕەهەندی (Neo-3D Themes)',
        offHdr: '٣. داگرتنی دەنگی قورئانخوێن بە ئۆفلاین',
        qariLbl: 'قورئانخوێن هەڵبژێرە:',
        scopeLbl: 'پاکێج یان سورەتی ئۆفلاین هەڵبژێرە:',
        optCur: '📖 پاشەکەوتکردنی سورەتی ئێستا بە ئۆفلاین',
        optEss: '🌟 سورەتە گرنگەکان (فاتیحە، کەهف، یاسین، ڕەحمان، مولک)',
        optJuz: '🎓 جوزئی عەممە (سورەتەکانی ٧٨ تا ١١٤)',
        optAll: '🕋 هەموو قورئانی پیرۆز (١١٤ سورەت)',
        desc: 'دەنگی قورئانخوێنەکە دادەگرێت بۆ ئەوەی بەبێ ئینتەرنێت لە هەموو بەشەکاندا کار بکات.',
        btn: 'داگرتن بۆ بەکارهێنانی ئۆفلاین',
        ready: 'ئامادەیە'
      }
    };
    const t = map[lang] || map.de;
    const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setTxt('settingsLangHeaderTitle', t.langHdr);
    setTxt('settingsThemeHeaderTitle', t.themeHdr);
    setTxt('settingsOfflineHeaderTitle', t.offHdr);
    setTxt('settingsOfflineQariLabel', t.qariLbl);
    setTxt('settingsOfflineScopeLabel', t.scopeLbl);
    setTxt('settingsScopeOptCurrent', t.optCur);
    setTxt('settingsScopeOptEssentials', t.optEss);
    setTxt('settingsScopeOptJuz30', t.optJuz);
    setTxt('settingsScopeOptAll', t.optAll);
    setTxt('offlineDownloadStatusText', t.desc);
    setTxt('settingsOfflineBtnText', t.btn);
    populateOfflineSurahsDropdown();
  }
  window.translateSettingsModalUI = translateSettingsModalUI;

  function populateOfflineSurahsDropdown() {
    const grp = document.getElementById('settingsScopeAllSurahsGroup');
    if (!grp) return;
    if (grp.children.length >= 114) return;
    grp.innerHTML = '';
    const allSurahs = window.ALL_114_SURAHS || [];
    allSurahs.forEach(s => {
      const opt = document.createElement('option');
      opt.value = String(s.id);
      opt.textContent = `${s.id}. سورة ${s.arabic || s.name} (${s.name})`;
      grp.appendChild(opt);
    });
  }
  window.populateOfflineSurahsDropdown = populateOfflineSurahsDropdown;
  setTimeout(populateOfflineSurahsDropdown, 800);

  function selectLanguageCard(langCode) {
    if (typeof setAppLanguage === 'function') {
      setAppLanguage(langCode);
    }
    window.currentAppLanguage = langCode;
    ['de', 'en', 'ku'].forEach(l => {
      const btn = document.getElementById('langCardBtn_' + l);
      if (btn) btn.classList.toggle('active', l === langCode);
    });
    translateSettingsModalUI(langCode);
    if (typeof renderPrayerTimesWidget === 'function') renderPrayerTimesWidget();
    if (typeof renderContinueReadingCard === 'function') renderContinueReadingCard();
  }
  window.selectLanguageCard = selectLanguageCard;

  // ============================================================
  // 4. REAL OFFLINE QARI AUDIO DOWNLOADER (IndexedDB) (Point 4)
  // ============================================================
  window.offlineAudioMemoryBlobs = {};
  let offlineDbInstance = null;

  function openOfflineAudioDB() {
    return new Promise((resolve) => {
      if (offlineDbInstance) return resolve(offlineDbInstance);
      if (!window.indexedDB) return resolve(null);
      const req = indexedDB.open('QuranOfflineAudioDB', 1);
      req.onupgradeneeded = function (e) {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('ayah_audio')) {
          db.createObjectStore('ayah_audio', { keyPath: 'id' });
        }
      };
      req.onsuccess = function (e) {
        offlineDbInstance = e.target.result;
        resolve(offlineDbInstance);
      };
      req.onerror = function () {
        resolve(null);
      };
    });
  }

  async function saveAyahBlobToDB(key, blob) {
    const db = await openOfflineAudioDB();
    if (!db) return;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction('ayah_audio', 'readwrite');
        tx.objectStore('ayah_audio').put({ id: key, blob: blob, savedAt: Date.now() });
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      } catch (e) {
        resolve(false);
      }
    });
  }

  async function loadCachedAyahKeysFromDB() {
    const db = await openOfflineAudioDB();
    if (!db) return;
    try {
      const tx = db.transaction('ayah_audio', 'readonly');
      const store = tx.objectStore('ayah_audio');
      const req = store.getAll();
      req.onsuccess = function () {
        const items = req.result || [];
        items.forEach(item => {
          if (item.id && item.blob && !window.offlineAudioMemoryBlobs[item.id]) {
            window.offlineAudioMemoryBlobs[item.id] = URL.createObjectURL(item.blob);
          }
        });
        updateOfflineAudioStatusBadge(items.length);
      };
    } catch (e) {}
  }

  function updateOfflineAudioStatusBadge(count) {
    const el = document.getElementById('offlineAudioCachedCountBadge');
    if (el) {
      el.textContent = `${count} Verse offline gespeichert`;
    }
  }

  // Override getAyahAudioUrl so offline-cached Qari audio is used across ALL sections automatically
  const originalGetAyahAudioUrl = window.getAyahAudioUrl;
  window.getAyahAudioUrl = function (surah, ayah, qariName) {
    const q = qariName || (window.state && window.state.qari) || 'Alafasy_128kbps';
    const sStr = String(surah).padStart(3, '0');
    const aStr = String(ayah).padStart(3, '0');
    if (q === 'Mansour_Al_Salimi') {
      const sKey = `Mansour_Al_Salimi_${sStr}`;
      if (window.offlineAudioMemoryBlobs && window.offlineAudioMemoryBlobs[sKey]) {
        return window.offlineAudioMemoryBlobs[sKey];
      }
      return `https://cdn.mp3quran.net/audio/mansour-salimi/r1/${sStr}.mp3`;
    }
    const cacheKey = `${q}_${sStr}${aStr}`;
    if (window.offlineAudioMemoryBlobs && window.offlineAudioMemoryBlobs[cacheKey]) {
      return window.offlineAudioMemoryBlobs[cacheKey];
    }
    if (typeof originalGetAyahAudioUrl === 'function') {
      return originalGetAyahAudioUrl(surah, ayah, q);
    }
    return `https://everyayah.com/data/${q}/${sStr}${aStr}.mp3`;
  };

  let isOfflineDownloading = false;
  async function startOfflineQariDownload() {
    if (isOfflineDownloading) return;
    const qariSel = document.getElementById('settingsOfflineQariSelect');
    const scopeSel = document.getElementById('settingsOfflineScopeSelect');
    const statusEl = document.getElementById('offlineDownloadStatusText');
    const barFill = document.getElementById('offlineDownloadProgressBar');
    const btn = document.getElementById('offlineDownloadStartBtn');

    const qari = qariSel ? qariSel.value : ((window.state && window.state.qari) || 'Alafasy_128kbps');
    const scope = scopeSel ? scopeSel.value : 'current';

    // Apply this Qari globally across all sections
    if (typeof onQariChanged === 'function') {
      onQariChanged(qari);
    }

    let surahsToDownload = [];
    if (scope === 'current') {
      const curS = (window.state && window.state.currentSurah) || 1;
      surahsToDownload = [curS];
    } else if (scope === 'essentials') {
      surahsToDownload = [1, 18, 36, 55, 56, 67, 112, 113, 114];
    } else if (scope === 'juz30') {
      for (let s = 78; s <= 114; s++) surahsToDownload.push(s);
    } else if (scope === 'all_quran') {
      for (let s = 1; s <= 114; s++) surahsToDownload.push(s);
    } else {
      const sNum = parseInt(scope, 10);
      if (!isNaN(sNum) && sNum >= 1 && sNum <= 114) {
        surahsToDownload = [sNum];
      } else {
        surahsToDownload = [1];
      }
    }

    isOfflineDownloading = true;
    if (btn) btn.disabled = true;

    // Special handler: Mansour Al-Salimi (Surah-level files)
    if (qari === 'Mansour_Al_Salimi') {
      let completedSurahs = 0;
      for (let i = 0; i < surahsToDownload.length; i++) {
        const sId = surahsToDownload[i];
        const sStr = String(sId).padStart(3, '0');
        const key = `Mansour_Al_Salimi_${sStr}`;
        const cdnUrl = `https://cdn.mp3quran.net/audio/mansour-salimi/r1/${sStr}.mp3`;
        const meta = (window.ALL_114_SURAHS || []).find(x => x.id === sId);
        const sName = meta ? (meta.arabic || meta.name) : `Sure ${sId}`;

        if (statusEl) {
          statusEl.textContent = `داگرتنی دەنگی مەنسوور ئەلسالمی: سورة ${sName} (${i + 1} / ${surahsToDownload.length})...`;
        }

        if (!window.offlineAudioMemoryBlobs[key]) {
          try {
            const resp = await fetch(cdnUrl);
            if (resp.ok) {
              const blob = await resp.blob();
              window.offlineAudioMemoryBlobs[key] = URL.createObjectURL(blob);
              await saveAyahBlobToDB(key, blob);
            }
          } catch(err) {
            console.warn('Salimi download error:', err);
          }
        }
        completedSurahs++;
        const pct = Math.round((completedSurahs / surahsToDownload.length) * 100);
        if (barFill) barFill.style.width = pct + '%';
      }

      isOfflineDownloading = false;
      if (btn) btn.disabled = false;
      const totalSaved = Object.keys(window.offlineAudioMemoryBlobs).length;
      updateOfflineAudioStatusBadge(totalSaved);
      if (statusEl) {
        statusEl.textContent = `✅ داگرتن تەواو بوو! دەنگی مەنسوور ئەلسالمی بۆ ${completedSurahs} سورەت بە سەرکەوتوویی پاشەکەوت کرا.`;
      }
      if (typeof showToast === 'function') {
        showToast(`✅ ${completedSurahs} سورەت بۆ بەکارهێنانی ئۆفلاین پاشەکەوت کرا!`);
      }
      return;
    }

    // Build list of verses for Ayah-by-Ayah reciters
    const queue = [];
    const allSurahs = window.ALL_114_SURAHS || [];
    surahsToDownload.forEach(sId => {
      const meta = allSurahs.find(x => x.id === sId);
      const vCount = meta ? (meta.versesCount || meta.ayahCount || 7) : 7;
      for (let a = 1; a <= vCount; a++) {
        queue.push({ surah: sId, ayah: a });
      }
    });

    if (queue.length === 0) {
      isOfflineDownloading = false;
      if (btn) btn.disabled = false;
      return;
    }

    let completed = 0;
    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      const sStr = String(item.surah).padStart(3, '0');
      const aStr = String(item.ayah).padStart(3, '0');
      const key = `${qari}_${sStr}${aStr}`;
      const cdnUrl = `https://everyayah.com/data/${qari}/${sStr}${aStr}.mp3`;

      if (statusEl) {
        statusEl.textContent = `داگرتن: سورة ${item.surah}:${item.ayah} (${i + 1} / ${queue.length})...`;
      }

      if (!window.offlineAudioMemoryBlobs[key]) {
        try {
          const resp = await fetch(cdnUrl);
          if (resp.ok) {
            const blob = await resp.blob();
            window.offlineAudioMemoryBlobs[key] = URL.createObjectURL(blob);
            await saveAyahBlobToDB(key, blob);
          }
        } catch (err) {
          // Fallback
        }
      }
      completed++;
      const pct = Math.round((completed / queue.length) * 100);
      if (barFill) barFill.style.width = pct + '%';
    }

    isOfflineDownloading = false;
    if (btn) btn.disabled = false;
    const totalSaved = Object.keys(window.offlineAudioMemoryBlobs).length;
    updateOfflineAudioStatusBadge(totalSaved);
    if (statusEl) {
      statusEl.textContent = `✅ داگرتن تەواو بوو! دەنگی قورئانخوێن بە سەرکەوتوویی پاشەکەوت کرا.`;
    }
    if (typeof showToast === 'function') {
      showToast(`✅ ${completed} ئایەت بۆ بەکارهێنانی ئۆفلاین پاشەکەوت کرا!`);
    }
  }
  window.startOfflineQariDownload = startOfflineQariDownload;

  // ============================================================
  // 5. SMART FUZZY SURAH & FULL-QURAN SEARCH (Point 5)
  // ============================================================
  function normalizeLatinPhonetic(str) {
    return (str || '')
      .toLowerCase()
      .replace(/^(sure|surah|sura|سورة|سوره)\s*/g, '')
      .replace(/^(al|as|ash|an|ar|at|ad|az|aal-i|aal)[-\s']*/g, '')
      .replace(/[-\s'’`ʻ]/g, '')
      .replace(/aa+/g, 'a')
      .replace(/ee+/g, 'i')
      .replace(/oo+|uu+/g, 'u')
      .replace(/iy/g, 'i')
      .replace(/ph/g, 'f')
      .replace(/q/g, 'k')
      .replace(/dh|th/g, 'z')
      .replace(/h$/g, ''); // baqarah -> baqara, fatihah -> fatiha
  }

  function normalizeArabicSearch(str) {
    return (str || '')
      .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
      .replace(/^(سورة|سوره|سورەتی)\s*/g, '')
      .replace(/^ال/g, '')
      .replace(/[ٱأإآ]/g, 'ا')
      .replace(/[ةهہ]/g, 'ه')
      .replace(/[ىيئێی]/g, 'ي')
      .replace(/[كک]/g, 'ك')
      .replace(/ۆ/g, 'و')
      .replace(/\s+/g, '')
      .trim();
  }

  function matchSurahSmart(s, rawQuery) {
    if (!rawQuery) return true;
    const q = rawQuery.trim().toLowerCase();
    if (!q) return true;

    // 1. Direct ID match
    if (String(s.id) === q || String(s.id).startsWith(q)) return true;

    // 2. Direct substring match
    if ((s.name && s.name.toLowerCase().includes(q)) ||
        (s.germanMeaning && s.germanMeaning.toLowerCase().includes(q)) ||
        (s.arabic && s.arabic.includes(q)) ||
        (s.kurdish && s.kurdish.includes(q))) {
      return true;
    }

    // 3. Phonetic Latin match (e.g. "baqarah" matches "Al-Baqara", "yasin" matches "Yaseen")
    const qLat = normalizeLatinPhonetic(q);
    if (qLat.length >= 2) {
      const sLat = normalizeLatinPhonetic(s.name || '');
      const sDe = normalizeLatinPhonetic(s.germanMeaning || '');
      if (sLat.includes(qLat) || qLat.includes(sLat) || sDe.includes(qLat)) return true;
    }

    // 4. Normalized Arabic / Kurdish match (e.g. "البقرة" or "بقره" matches "البَقَرَةِ")
    const qAr = normalizeArabicSearch(q);
    if (qAr.length >= 2) {
      const sAr = normalizeArabicSearch(s.arabic || '');
      const sKu = normalizeArabicSearch(s.kurdish || '');
      if (sAr.includes(qAr) || sKu.includes(qAr)) return true;
    }

    return false;
  }
  window.matchSurahSmart = matchSurahSmart;

  // Override renderSurahPickerCards with Smart Fuzzy Match
  window.renderSurahPickerCards = function (query) {
    const container = document.getElementById('surahPickerListContainer');
    if (!container) return;
    const surahs = window.ALL_114_SURAHS || (typeof ALL_114_SURAHS !== 'undefined' ? ALL_114_SURAHS : []);
    const activeSurahId = (window.state && window.state.currentSurah) || 1;

    const filtered = surahs.filter(s => matchSurahSmart(s, query));
    if (filtered.length === 0) {
      container.innerHTML = `<div style="text-align: center; padding: 28px; color: #94a3b8;">Keine Sure gefunden für "${query}".</div>`;
      return;
    }

    container.innerHTML = filtered.map(s => {
      const isCurrent = s.id === activeSurahId;
      const vCount = s.versesCount || s.ayahCount || 7;
      return `
        <div class="neo3d-surah-item ${isCurrent ? 'active' : ''}" onclick="onSelectSurahFromPicker(${s.id})">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div class="neo3d-num-badge">${s.id}</div>
            <div>
              <div style="font-weight: 800; color: #f8fafc; font-size: 0.96rem;">
                ${s.name} <span style="font-size: 0.78rem; color: #94a3b8; font-weight: 600;">(${s.germanMeaning || ''})</span>
              </div>
              <div style="font-size: 0.75rem; color: #34d399; font-weight: 600;">
                ${vCount} Verse · Seite ${s.startPage || 1} · ${s.kurdish || s.revelation || ''}
              </div>
            </div>
          </div>
          <div style="font-family: var(--quran-font); font-size: 1.4rem; color: var(--gold-light); direction: rtl;">
            ${s.arabic}
          </div>
        </div>
      `;
    }).join('');
  };

  window.filterSurahPicker = function (query) {
    window.renderSurahPickerCards(query);
  };

  // Override Universal Quran Search (Surahs + Verses + Page Numbers)
  window.renderDedicatedSearch = function (query) {
    const container = document.getElementById('searchResultsDedicatedContainer');
    if (!container) return;

    const surahs = window.ALL_114_SURAHS || (typeof ALL_114_SURAHS !== 'undefined' ? ALL_114_SURAHS : []);
    const q = (query || '').trim();

    // Check if query is "Surah:Ayah" like "2:255"
    const colonMatch = q.match(/^(\d{1,3})\s*[:.,]\s*(\d{1,3})$/);
    let directVerseHtml = '';
    if (colonMatch) {
      const sNum = parseInt(colonMatch[1], 10);
      const aNum = parseInt(colonMatch[2], 10);
      const sObj = surahs.find(x => x.id === sNum);
      if (sObj && typeof getVersesForSurah === 'function') {
        const vList = getVersesForSurah(sNum);
        const vObj = vList.find(v => v.num === aNum);
        if (vObj) {
          directVerseHtml = `
            <div class="neo3d-card" onclick="jumpToBookmarkedVerse(${sNum}, ${aNum})" style="cursor: pointer; border-left: 4px solid #10b981;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <span style="font-weight: 800; color: #34d399;">🎯 Direkter Vers-Treffer: Sure ${sObj.name} (${sNum}:${aNum})</span>
                <span style="font-size: 0.78rem; color: #fef08a;">Im Muṣḥaf öffnen ➔</span>
              </div>
              <div style="font-family: var(--quran-font); font-size: 1.45rem; color: #fef08a; direction: rtl; text-align: right; margin-bottom: 6px;">${vObj.ar}</div>
              <div style="font-size: 0.85rem; color: #cbd5e1;">${vObj.de || ''}</div>
            </div>
          `;
        }
      }
    }

    const matchedSurahs = surahs.filter(s => matchSurahSmart(s, q));

    // Search Quranic Lexicon Words & 3-Letter Roots directly inside Koran-Suche (Point 8 & 14)
    const lexicon = window.OFFICIAL_QURAN_DICTIONARY || [];
    const qLower = q.toLowerCase();
    const qArNorm = normalizeArabicSearch(q);
    let matchedWords = [];
    if (q.length >= 2) {
      matchedWords = lexicon.filter(item => {
        return item.ar.includes(q) ||
               (qArNorm.length >= 2 && normalizeArabicSearch(item.ar).includes(qArNorm)) ||
               (item.translit && item.translit.toLowerCase().includes(qLower)) ||
               (item.de && item.de.toLowerCase().includes(qLower)) ||
               (item.en && item.en.toLowerCase().includes(qLower)) ||
               (item.ku && item.ku.toLowerCase().includes(qLower)) ||
               (item.root && item.root.includes(q));
      }).slice(0, 12);
    }

    // Also search Verse text if query >= 2 chars
    let matchedVerses = [];
    if (q.length >= 2 && !colonMatch && typeof QURAN_ALL_PAGES !== 'undefined') {
      for (let p = 1; p <= 604 && matchedVerses.length < 18; p++) {
        const pVerses = QURAN_ALL_PAGES[p] || [];
        for (let i = 0; i < pVerses.length && matchedVerses.length < 18; i++) {
          const v = pVerses[i];
          const deMatch = q.length >= 3 && v.de && v.de.toLowerCase().includes(qLower);
          const arMatch = qArNorm.length >= 2 && normalizeArabicSearch(v.ar || '').includes(qArNorm);
          if (deMatch || arMatch) {
            matchedVerses.push({ page: p, surahNum: v.surahNum, num: v.num, ar: v.ar, de: v.de });
          }
        }
      }
    }

    if (matchedSurahs.length === 0 && matchedVerses.length === 0 && matchedWords.length === 0 && !directVerseHtml) {
      container.innerHTML = `<div class="neo3d-card" style="text-align: center; padding: 28px; color: #94a3b8;">Keine Treffer für "${q}". Versuche z. B. Baqarah, Kahf, Yasin, 2:255, الرحمة oder Licht.</div>`;
      return;
    }

    const wordsHtml = matchedWords.map(w => `
      <div class="neo3d-card" style="display: flex; justify-content: space-between; align-items: center; gap: 10px; border-left: 3px solid #f59e0b;">
        <div>
          <div style="display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap;">
            <span style="font-family: var(--quran-font); font-size: 1.55rem; color: #fef08a; font-weight: bold;">${w.ar}</span>
            <span style="font-size: 0.8rem; color: #38bdf8; font-weight: 700;">[${w.translit}]</span>
            <span style="font-size: 0.72rem; background: rgba(255,255,255,0.08); color: #cbd5e1; padding: 2px 7px; border-radius: 8px;">Wurzel: ${w.root}</span>
          </div>
          <div style="font-size: 0.86rem; color: #f8fafc; font-weight: 700; margin-top: 3px;">${w.de}</div>
        </div>
        ${w.surah ? `
          <button onclick="jumpToBookmarkedVerse(${w.surah}, ${w.ayah || 1})" class="neo3d-pill-btn" style="padding: 6px 10px; font-size: 0.75rem;">
            <i class="fa-solid fa-book-open" style="color: #fbbf24;"></i> ${w.surah}:${w.ayah || 1}
          </button>
        ` : ''}
      </div>
    `).join('');

    const surahsHtml = matchedSurahs.slice(0, q ? 30 : 114).map(s => {
      return `
        <div class="neo3d-surah-item" onclick="selectSearchResultSurah(${s.id}, ${s.startPage || 1})">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div class="neo3d-num-badge">${s.id}</div>
            <div>
              <div style="font-weight: 800; font-size: 0.96rem; color: #fff;">${s.name} <span style="font-size: 0.8rem; color: #94a3b8;">(${s.germanMeaning || ''})</span></div>
              <div style="font-size: 0.76rem; color: #34d399;">Seite ${s.startPage || 1} · ${s.versesCount || 7} Verse · ${s.kurdish || s.revelation || ''}</div>
            </div>
          </div>
          <div style="font-family: var(--quran-font); font-size: 1.4rem; color: var(--gold-light); direction: rtl;">
            سورة ${s.arabic}
          </div>
        </div>
      `;
    }).join('');

    const versesHtml = matchedVerses.map(v => {
      const sObj = surahs.find(x => x.id === v.surahNum);
      return `
        <div class="neo3d-card" onclick="jumpToBookmarkedVerse(${v.surahNum}, ${v.num})" style="cursor: pointer;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-weight: 800; font-size: 0.82rem; color: #38bdf8;">📖 Sure ${sObj ? sObj.name : v.surahNum} (${v.surahNum}:${v.num}) · Seite ${v.page}</span>
            <span style="font-size: 0.75rem; color: #fef08a;">Öffnen ➔</span>
          </div>
          <div style="font-family: var(--quran-font); font-size: 1.35rem; color: #fef08a; direction: rtl; text-align: right; margin-bottom: 4px;">${v.ar}</div>
          <div style="font-size: 0.82rem; color: #cbd5e1;">${v.de || ''}</div>
        </div>
      `;
    }).join('');

    container.innerHTML = directVerseHtml +
      (matchedWords.length > 0 ? `<div style="font-size: 0.78rem; font-weight: 800; color: #fbbf24; text-transform: uppercase; margin: 6px 4px;">Koranische Wörter &amp; Wurzeln (${matchedWords.length}):</div>` + wordsHtml : '') +
      (matchedSurahs.length > 0 ? `<div style="font-size: 0.78rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin: 10px 4px 6px;">Suren (${matchedSurahs.length}):</div>` + surahsHtml : '') +
      (matchedVerses.length > 0 ? `<div style="font-size: 0.78rem; font-weight: 800; color: #38bdf8; text-transform: uppercase; margin: 12px 4px 6px;">Gefundene Koranverse (${matchedVerses.length}):</div>` + versesHtml : '');
  };

  window.selectSearchResultSurah = function (surahId, startPage) {
    window.switchMainTab('mushaf');
    if (typeof jumpToSurah === 'function') {
      jumpToSurah(surahId);
    } else if (typeof jumpToPage === 'function') {
      jumpToPage(startPage || 1);
    }
  };

  // ============================================================
  // 6. PROMINENT STAR / HIFZ MARKING ACROSS ALL SECTIONS (Point 10)
  // ============================================================
  function toggleCurrentSectionStar(sectionName) {
    const surahs = window.ALL_114_SURAHS || [];
    let sNum = (window.state && window.state.currentSurah) || 1;
    let aNum = (window.state && window.state.currentAyah) || 1;
    let pageNum = (window.state && window.state.currentPage) || 1;

    if (sectionName === 'Tarteel' && window.tarteelState) {
      sNum = window.tarteelState.surah || sNum;
      aNum = window.tarteelState.targetAyah || 1;
      pageNum = window.tarteelState.page || pageNum;
    } else if (sectionName === 'Tafsīr' && window.state) {
      sNum = window.state.tafsirSurah || sNum;
      aNum = window.state.tafsirAyah || 1;
    }

    // 1. Toggle in Hifz Memorized Storage
    if (typeof toggleVerseMemorized === 'function') {
      toggleVerseMemorized(sNum, aNum);
    }

    // 2. Also add/toggle in Bookmarks v3 so it appears in both Hifz Archive and Bookmarks!
    const sObj = surahs.find(x => x.id === sNum);
    const vList = (typeof getVersesForSurah === 'function') ? getVersesForSurah(sNum) : [];
    const vObj = vList.find(x => x.num === aNum) || vList[0] || { ar: sObj ? sObj.arabic : '' };

    if (typeof toggleVerseBookmark === 'function') {
      toggleVerseBookmark(sNum, aNum, vObj.ar || '', `${sectionName} · Seite ${pageNum}`);
    }

    updateSectionStarButtons();
    if (typeof renderHifzArchiveModern === 'function' && window.state?.activeTab === 'hifzArchive') {
      renderHifzArchiveModern();
    }
  }
  window.toggleCurrentSectionStar = toggleCurrentSectionStar;

  function updateSectionStarButtons() {
    const sNum = (window.state && window.state.currentSurah) || 1;
    const aNum = (window.state && window.state.currentAyah) || 1;
    const isMem = (typeof isVerseMemorized === 'function' && isVerseMemorized(sNum, aNum)) ||
                  (typeof isVerseBookmarked === 'function' && isVerseBookmarked(sNum, aNum));

    ['mushafStarBtn', 'wsStarBtn', 'tarteelStarBtn', 'tafsirStarBtn', 'repStarBtn'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.classList.toggle('starred', isMem);
        const icon = btn.querySelector('i');
        if (icon) {
          icon.className = isMem ? 'fa-solid fa-star' : 'fa-regular fa-star';
          icon.style.color = isMem ? '#facc15' : '#e2e8f0';
        }
      }
    });
  }
  window.updateSectionStarButtons = updateSectionStarButtons;

  // Modernized Hifz & Progress Archive (Point 10)
  function renderHifzArchiveModern() {
    const container = document.getElementById('hifzArchiveList');
    if (!container) return;

    const surahs = window.ALL_114_SURAHS || [];
    const memList = (typeof getAllMemorizedVerses === 'function') ? getAllMemorizedVerses() : [];
    let bookmarks = [];
    try {
      bookmarks = JSON.parse(localStorage.getItem('quran_bookmarks_v3') || '[]');
    } catch (e) {}

    // Merge unique items from both Memorized and Starred Bookmarks
    const combinedMap = new Map();
    bookmarks.forEach(b => {
      const key = `${b.surah}:${b.ayah || 1}`;
      combinedMap.set(key, {
        surahNum: b.surah,
        num: b.ayah || 1,
        section: b.section || 'Muṣḥaf',
        ar: b.arabic || '',
        date: b.date || ''
      });
    });
    memList.forEach(m => {
      const key = `${m.surahNum}:${m.num}`;
      if (!combinedMap.has(key)) {
        combinedMap.set(key, {
          surahNum: m.surahNum,
          num: m.num,
          section: 'Hifz ⭐',
          ar: '',
          date: ''
        });
      }
    });

    const allItems = Array.from(combinedMap.values());
    const statsBadge = document.getElementById('hifzStatsText');
    if (statsBadge) {
      statsBadge.textContent = `${allItems.length} Markierte & Gelernte Einträge ⭐`;
    }

    if (allItems.length === 0) {
      container.innerHTML = `
        <div class="neo3d-card" style="text-align: center; padding: 36px 20px;">
          <div class="neo3d-orb-icon" style="margin: 0 auto 14px; width: 64px; height: 64px; font-size: 1.8rem; background: linear-gradient(135deg, #eab308, #a16207);">
            <i class="fa-solid fa-star"></i>
          </div>
          <div style="font-size: 1.15rem; font-weight: 800; color: #fff; margin-bottom: 8px;">Noch keine Suren oder Verse markiert</div>
          <div style="color: #94a3b8; font-size: 0.88rem; max-width: 440px; margin: 0 auto 18px; line-height: 1.5;">
            Tippe in jedem Bereich (Muṣḥaf, Wort-Studio, Smarte Rezitation oder Tafsīr) oben auf den großen <b style="color: #facc15;">⭐ Stern-Button</b>, um deinen Fortschritt hier zu speichern!
          </div>
          <button onclick="toggleCurrentSectionStar('Muṣḥaf'); renderHifzArchiveModern();" class="neo3d-primary-btn" style="max-width: 280px; margin: 0 auto;">
            <i class="fa-solid fa-star"></i> Aktuelle Sure jetzt markieren
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = allItems.map(item => {
      const sMeta = surahs.find(s => s.id === item.surahNum) || { name: 'Sure ' + item.surahNum, arabic: '', startPage: 1 };
      const sVerses = (typeof getVersesForSurah === 'function') ? getVersesForSurah(item.surahNum) : [];
      const vObj = sVerses.find(v => v.num === item.num) || sVerses[0] || { ar: item.ar, de: '' };
      return `
        <div class="neo3d-card" style="display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div class="neo3d-num-badge" style="background: linear-gradient(135deg, #eab308, #ca8a04); color: #000;">⭐</div>
              <div>
                <div style="font-weight: 800; font-size: 1rem; color: #fff;">${item.surahNum}. ${sMeta.name} (${sMeta.arabic}) · Vers ${item.num}</div>
                <div style="font-size: 0.74rem; color: #34d399; font-weight: 700;">Bereich: ${item.section} · Seite ${sMeta.startPage || 1}</div>
              </div>
            </div>
            <div style="display: flex; gap: 6px;">
              <button onclick="jumpToBookmarkedVerse(${item.surahNum}, ${item.num})" class="neo3d-pill-btn" style="background: rgba(16,185,129,0.2); color: #6ee7b7; border-color: rgba(16,185,129,0.4);">
                <i class="fa-solid fa-book-open"></i> Muṣḥaf
              </button>
              <button onclick="selectTarteelSurah(${item.surahNum}); switchMainTab('micTest');" class="neo3d-pill-btn" style="background: rgba(56,189,248,0.2); color: #bae6fd; border-color: rgba(56,189,248,0.4);">
                <i class="fa-solid fa-microphone"></i> Hifz-Test
              </button>
              <button onclick="removeStarredArchiveItem(${item.surahNum}, ${item.num})" class="neo3d-pill-btn" style="background: rgba(239,68,68,0.15); color: #fca5a5; border-color: rgba(239,68,68,0.35);">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>
          <div style="font-family: var(--quran-font); font-size: 1.5rem; color: #fef08a; direction: rtl; text-align: right; background: rgba(0,0,0,0.28); padding: 12px 14px; border-radius: 12px;">
            ${vObj.ar || item.ar || ''}
          </div>
          ${vObj.de ? `<div style="font-size: 0.85rem; color: #cbd5e1;">${vObj.de}</div>` : ''}
        </div>
      `;
    }).join('');
  }
  window.renderHifzArchive = renderHifzArchiveModern;
  window.renderHifzArchiveModern = renderHifzArchiveModern;

  window.removeStarredArchiveItem = function (sNum, aNum) {
    try {
      const key = `hifz_${sNum}`;
      const data = JSON.parse(localStorage.getItem(key) || '{}');
      delete data[aNum];
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {}
    if (typeof removeBookmark === 'function') {
      removeBookmark(sNum, aNum);
    }
    renderHifzArchiveModern();
    updateSectionStarButtons();
  };

  // ============================================================
  // 7. SECTION 3: TARTEEL AI 15-LINE MUSHAF & PROGRESSIVE WORD-BY-WORD ENGINE
  // Fully handled by app_ultimate_extensions.js (Checkpoint 8 Master Engine)
  // ============================================================
  if (typeof window.renderTarteelMistakesLogUI === 'undefined' && typeof window.renderTarteelMistakesList === 'function') {
    window.renderTarteelMistakesLogUI = window.renderTarteelMistakesList;
  }

  // ============================================================
  // 8. INTERACTIVE HIFZ-QUIZ & CONTINUATION WITH SHEIKH (Point 16)
  // ============================================================
  const sheikhQuizState = {
    rangeType: 'surah',
    selectedSurah: 1,
    currentSurah: 1,
    promptAyah: 1,
    continuationAyah: 2,
    isRevealed: false,
    score: 0,
    isListening: false,
    recognition: null,
    audioStream: null,
    audioCtx: null,
    audioAnimFrame: null
  };
  window.sheikhQuizState = sheikhQuizState;

  function initSheikhQuizStudio() {
    const surahs = window.ALL_114_SURAHS || [];
    const sMeta = surahs.find(s => s.id === (sheikhQuizState.selectedSurah || 1)) || surahs[0] || { id: 1, name: 'Al-Fatiha', arabic: 'الفاتحة' };
    const trigLbl = document.getElementById('mqSurahTriggerLabel');
    if (trigLbl) {
      trigLbl.textContent = `${sMeta.id}. ${sMeta.name} (${sMeta.arabic})`;
    }
    generateNewSheikhQuestion(false);
  }
  window.initSheikhQuizStudio = initSheikhQuizStudio;

  window.setSheikhQuizRange = function (rangeType) {
    sheikhQuizState.rangeType = 'surah';
    generateNewSheikhQuestion(false);
  };

  window.onSheikhQuizSurahChange = function (sId) {
    const num = parseInt(sId, 10) || 1;
    sheikhQuizState.selectedSurah = num;
    sheikhQuizState.currentSurah = num;
    sheikhQuizState.rangeType = 'surah';
    const surahs = window.ALL_114_SURAHS || [];
    const sMeta = surahs.find(s => s.id === num);
    const trigLbl = document.getElementById('mqSurahTriggerLabel');
    if (trigLbl && sMeta) {
      trigLbl.textContent = `${sMeta.id}. ${sMeta.name} (${sMeta.arabic})`;
    }
    generateNewSheikhQuestion(false);
    if (typeof showToast === 'function') {
      showToast(`🎯 Hifz-Quiz für Sure ${sMeta ? sMeta.name : num} geladen`);
    }
  };
  window.onMurajaaSurahChanged = window.onSheikhQuizSurahChange;

  function generateNewSheikhQuestion(autoPlaySheikh) {
    const targetSurah = sheikhQuizState.selectedSurah || 1;
    const verses = (typeof getVersesForSurah === 'function') ? getVersesForSurah(targetSurah) : [];
    const maxStart = Math.max(1, verses.length - 1);
    let startIdx = Math.floor(Math.random() * maxStart);
    if (verses.length > 2 && verses[startIdx] && verses[startIdx].num === sheikhQuizState.promptAyah) {
      startIdx = (startIdx + 1) % maxStart;
    }

    const promptV = verses[startIdx] || { surahNum: targetSurah, num: 1, ar: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', de: '' };
    const nextV = verses[startIdx + 1] || verses[0] || { surahNum: targetSurah, num: 2, ar: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', de: '' };

    sheikhQuizState.currentSurah = targetSurah;
    sheikhQuizState.promptAyah = promptV.num;
    sheikhQuizState.continuationAyah = nextV.num;
    sheikhQuizState.promptObj = promptV;
    sheikhQuizState.nextObj = nextV;
    sheikhQuizState.isRevealed = false;
    stopSheikhQuizMicResources();
    const liveBox = document.getElementById('sqLiveReciteBox');
    if (liveBox) liveBox.style.display = 'none';
    const liveText = document.getElementById('sqLiveSpokenText');
    if (liveText) liveText.textContent = '...';

    renderSheikhQuizCard(verses);
    if (autoPlaySheikh) {
      playSheikhQuizPromptAudio();
    }
  }
  window.generateNewSheikhQuestion = generateNewSheikhQuestion;

  function renderSheikhQuizCard(allSurahVerses) {
    const surahs = window.ALL_114_SURAHS || [];
    const sMeta = surahs.find(s => s.id === sheikhQuizState.currentSurah) || { id: sheikhQuizState.currentSurah, name: 'Sure ' + sheikhQuizState.currentSurah, arabic: '' };
    const isKu = (window.quran_app_language === 'ku');

    const trigLbl = document.getElementById('mqSurahTriggerLabel');
    if (trigLbl) trigLbl.textContent = `${sMeta.id}. ${sMeta.name} (${sMeta.arabic})`;

    const promptBadge = document.getElementById('sqPromptBadge');
    const promptAr = document.getElementById('sqPromptArabic');
    const targetBadge = document.getElementById('sqTargetBadge');
    const targetAr = document.getElementById('sqTargetArabic');
    const targetDe = document.getElementById('sqTargetGerman');
    const targetBox = document.getElementById('sqTargetContainer');
    const statusEl = document.getElementById('sqReciteStatus');

    if (promptBadge) {
      promptBadge.textContent = isKu 
        ? `🎙️ پرسیاری شێخ: سوورەتی ${sMeta.name} (${sMeta.arabic}) · ئایەتی ${sheikhQuizState.promptAyah}`
        : `🎙️ Scheich-Frage: Sure ${sMeta.name} (${sMeta.arabic}) · Vers ${sheikhQuizState.promptAyah}`;
    }
    if (promptAr) promptAr.innerHTML = `${sheikhQuizState.promptObj?.ar || ''} <span class="mushaf-rosette">﴿${sheikhQuizState.promptAyah}﴾</span>`;

    if (targetBadge) {
      targetBadge.textContent = isKu
        ? `ئایەتی دواتر: سوورەتی ${sMeta.name} · ئایەتی ${sheikhQuizState.continuationAyah}`
        : `Nächster Vers: Sure ${sMeta.name} · Vers ${sheikhQuizState.continuationAyah}`;
    }
    if (targetAr) targetAr.innerHTML = `${sheikhQuizState.nextObj?.ar || ''} <span class="mushaf-rosette">﴿${sheikhQuizState.continuationAyah}﴾</span>`;
    if (targetDe) targetDe.textContent = sheikhQuizState.nextObj?.de || '';

    if (targetBox) {
      targetBox.style.filter = sheikhQuizState.isRevealed ? 'none' : 'blur(10px)';
      targetBox.style.opacity = sheikhQuizState.isRevealed ? '1' : '0.45';
    }
    if (statusEl && !sheikhQuizState.isListening) {
      statusEl.innerHTML = isKu
        ? '🎙️ گوێ لە ئایەتی سەرەتا بگرە و درێژەی ئایەتەکە لە مایکرۆفۆن بخوێنەوە!'
        : '🎙️ Höre den Startvers an und rezitiere die Fortsetzung ins Mikrofon!';
    }
  }

  window.onPickSheikhQuizChoice = function (isCorrect) {
    sheikhQuizState.isRevealed = true;
    const targetBox = document.getElementById('sqTargetContainer');
    if (targetBox) {
      targetBox.style.filter = 'none';
      targetBox.style.opacity = '1';
    }
    const statusEl = document.getElementById('sqReciteStatus');
    const isKu = (window.quran_app_language === 'ku');

    if (isCorrect) {
      sheikhQuizState.score++;
      const scoreEl = document.getElementById('sqScoreCounter');
      if (scoreEl) scoreEl.textContent = sheikhQuizState.score;
      if (statusEl) {
        statusEl.innerHTML = isKu
          ? '🎉 <b style="color:#34d399;">ما شاء الله! وەڵام و خوێندنەوەکەت دروست بوو (+١ خاڵ)!</b>'
          : '🎉 <b style="color:#34d399;">Māshā Allāh! Richtige Fortsetzung gemeistert (+1 Punkt)!</b>';
      }
      if (typeof showToast === 'function') showToast(isKu ? '🎉 ما شاء الله! سەرکەوتوو بوویت!' : '🎉 Richtig! Māshā Allāh!');
      if (navigator.vibrate) try { navigator.vibrate([40, 30, 60]); } catch (e) {}
    } else {
      if (statusEl) {
        statusEl.innerHTML = isKu
          ? '⚠️ <b style="color:#fca5a5;">وەڵامەکە ناتەواو بوو – ئایەتی دروست لە سەرەوە دیار کرا!</b>'
          : '⚠️ <b style="color:#fca5a5;">Nicht ganz – die Fortsetzung wurde aufgedeckt!</b>';
      }
    }
  };

  let sqAudioPlayer = null;
  window.playSheikhQuizPromptAudio = function () {
    if (sqAudioPlayer) { sqAudioPlayer.pause(); sqAudioPlayer = null; }
    const url = window.getAyahAudioUrl(sheikhQuizState.currentSurah, sheikhQuizState.promptAyah);
    sqAudioPlayer = new Audio(url);
    sqAudioPlayer.onerror = function () {
      const sStr = String(sheikhQuizState.currentSurah).padStart(3, '0');
      const aStr = String(sheikhQuizState.promptAyah).padStart(3, '0');
      sqAudioPlayer.src = `https://everyayah.com/data/Alafasy_128kbps/${sStr}${aStr}.mp3`;
      sqAudioPlayer.play().catch(() => {});
    };
    sqAudioPlayer.play().catch(() => {});
    const isKu = (window.quran_app_language === 'ku');
    if (typeof showToast === 'function') showToast(isKu ? '🔊 شێخ ئایەتی دەستپێک دەخوێنێتەوە...' : '🔊 Scheich liest den Startvers...');
  };

  window.playSheikhQuizHelpContinuation = function () {
    sheikhQuizState.isRevealed = true;
    const targetBox = document.getElementById('sqTargetContainer');
    if (targetBox) { targetBox.style.filter = 'none'; targetBox.style.opacity = '1'; }
    if (sqAudioPlayer) { sqAudioPlayer.pause(); sqAudioPlayer = null; }
    const url = window.getAyahAudioUrl(sheikhQuizState.currentSurah, sheikhQuizState.continuationAyah);
    sqAudioPlayer = new Audio(url);
    sqAudioPlayer.onerror = function () {
      const sStr = String(sheikhQuizState.currentSurah).padStart(3, '0');
      const aStr = String(sheikhQuizState.continuationAyah).padStart(3, '0');
      sqAudioPlayer.src = `https://everyayah.com/data/Alafasy_128kbps/${sStr}${aStr}.mp3`;
      sqAudioPlayer.play().catch(() => {});
    };
    sqAudioPlayer.play().catch(() => {});
    const isKu = (window.quran_app_language === 'ku');
    if (typeof showToast === 'function') showToast(isKu ? '🎧 شێخ درێژەی ئایەتەکە بۆ یارمەتی دەخوێنێتەوە!' : '🎧 Scheich rezitiert die Fortsetzung zur Hilfe!');
  };

  window.revealSheikhQuizAnswer = function () {
    sheikhQuizState.isRevealed = !sheikhQuizState.isRevealed;
    const targetBox = document.getElementById('sqTargetContainer');
    if (targetBox) {
      targetBox.style.filter = sheikhQuizState.isRevealed ? 'none' : 'blur(10px)';
      targetBox.style.opacity = sheikhQuizState.isRevealed ? '1' : '0.45';
    }
  };

  function stopSheikhQuizMicResources() {
    sheikhQuizState.isListening = false;
    if (sheikhQuizState.recognition) {
      try { sheikhQuizState.recognition.stop(); } catch (e) {}
      sheikhQuizState.recognition = null;
    }
    const btn = document.getElementById('sqMicBtn');
    const isKu = (window.quran_app_language === 'ku');
    if (btn) {
      btn.innerHTML = `<i class="fa-solid fa-microphone"></i> <span>${isKu ? 'وەڵامدانەوە بە مایکرۆفۆن' : 'Mit Mikrofon antworten'}</span>`;
      btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
    }
    const indicator = document.getElementById('sqLiveReciteIndicator');
    if (indicator) {
      indicator.innerHTML = '<span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#94a3b8;"></span> ' + (isKu ? 'وەستاوە' : 'Gestoppt');
    }
  }

  window.toggleSheikhQuizMic = function () {
    const btn = document.getElementById('sqMicBtn');
    const statusEl = document.getElementById('sqReciteStatus');
    const liveBox = document.getElementById('sqLiveReciteBox');
    const liveText = document.getElementById('sqLiveSpokenText');
    const liveIndicator = document.getElementById('sqLiveReciteIndicator');
    const isKu = (window.quran_app_language === 'ku');
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (sheikhQuizState.isListening) {
      stopSheikhQuizMicResources();
      if (statusEl) {
        statusEl.innerHTML = isKu ? '⏹️ مایکرۆفۆن وەستێنرا.' : '⏹️ Mikrofon gestoppt.';
      }
      return;
    }

    if (!SpeechRec) {
      const msg = isKu
        ? '⚠️ وێبگەڕەکەت پشتگیری وەرگری دەنگ ناکات (تکایە لە Google Chrome یان Edge تاقی بکەوە).'
        : '⚠️ Dein Browser unterstützt keine Spracherkennung (Bitte Google Chrome oder Edge nutzen).';
      if (statusEl) statusEl.innerHTML = `<b style="color:#fca5a5;">${msg}</b>`;
      if (typeof showToast === 'function') showToast(msg);
      return;
    }

    sheikhQuizState.isListening = true;
    if (liveBox) liveBox.style.display = 'block';
    if (liveText) {
      liveText.innerHTML = '<span style="color:#94a3b8; font-size:1.05rem;">' + (isKu ? 'دەنگت ببیسترێت، لێرە بە عەرەبی دەنووسرێت...' : 'Sprich ins Mikrofon, arabischer Text wird hier live geschrieben...') + '</span>';
    }
    if (liveIndicator) {
      liveIndicator.innerHTML = '<span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#ef4444;"></span> ' + (isKu ? 'لە گوێگرتندایە...' : 'Hört zu...');
    }

    if (btn) {
      btn.innerHTML = `<i class="fa-solid fa-stop"></i> <span>${isKu ? 'ڕاگرتنی گوێگرتن' : 'Zuhören beenden'}</span>`;
      btn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
    }

    if (statusEl) {
      statusEl.innerHTML = `🎙️ <b style="color:#34d399;">${isKu ? 'مایکرۆفۆن چالاکە! ئێستا ئایەتی ' + sheikhQuizState.continuationAyah + ' بە عەرەبی بخوێنەوە...' : 'Mikrofon aktiv! Rezitiere jetzt Vers ' + sheikhQuizState.continuationAyah + ' auf Arabisch...'}</b>`;
    }

    try {
      const rec = new SpeechRec();
      rec.lang = 'ar-SA';
      rec.continuous = true;
      rec.interimResults = true;

      rec.onresult = function (e) {
        if (!sheikhQuizState.isListening) return;

        let transcript = '';
        for (let i = 0; i < e.results.length; i++) {
          transcript += e.results[i][0].transcript + ' ';
        }
        transcript = transcript.trim();

        if (liveText && transcript) {
          liveText.textContent = transcript;
        }

        const cleanSpoken = typeof window.cleanArabicForMatch === 'function' 
          ? window.cleanArabicForMatch(transcript) 
          : transcript.replace(/[^\u0600-\u06FF\s]/g, '').trim();

        let cleanTarget = typeof window.cleanArabicForMatch === 'function'
          ? window.cleanArabicForMatch(sheikhQuizState.nextObj?.ar || '')
          : (sheikhQuizState.nextObj?.ar || '').replace(/[^\u0600-\u06FF\s]/g, '').trim();

        if (sheikhQuizState.continuationAyah === 1 && sheikhQuizState.currentSurah !== 1) {
          cleanTarget = cleanTarget.replace(/^بسم الله الرحمن الرحيم\s*/, '').trim();
        }

        const spokenWords = cleanSpoken.split(/\s+/).filter(Boolean);
        const targetWords = cleanTarget.split(/\s+/).filter(Boolean);

        if (targetWords.length === 0) return;

        let matchedCount = 0;
        let sIdx = 0;
        for (let tIdx = 0; tIdx < targetWords.length; tIdx++) {
          const tWord = targetWords[tIdx];
          for (let look = sIdx; look < Math.min(sIdx + 3, spokenWords.length); look++) {
            const sw = spokenWords[look];
            const isMatch = (typeof window.isArabicWordMatch === 'function') 
              ? window.isArabicWordMatch(tWord, sw)
              : (tWord === sw || (typeof levenshteinDist === 'function' && levenshteinDist(tWord, sw) <= 1));
            if (isMatch) {
              matchedCount++;
              sIdx = look + 1;
              break;
            }
          }
        }

        const accuracy = Math.round((matchedCount / targetWords.length) * 100);
        const isPass = (accuracy >= 60) || (targetWords.length <= 3 && matchedCount >= Math.min(2, targetWords.length));

        if (isPass) {
          stopSheikhQuizMicResources();
          sheikhQuizState.isRevealed = true;
          const targetBox = document.getElementById('sqTargetContainer');
          if (targetBox) {
            targetBox.style.filter = 'none';
            targetBox.style.opacity = '1';
          }
          sheikhQuizState.score++;
          const scoreEl = document.getElementById('sqScoreCounter');
          if (scoreEl) scoreEl.textContent = sheikhQuizState.score;

          if (statusEl) {
            statusEl.innerHTML = isKu
              ? `🎉 <b style="color:#34d399;">ما شاء الله! ئایەتی ${sheikhQuizState.continuationAyah} بە دروستی خوێندرایەوە (+١ خاڵ)!</b>`
              : `🎉 <b style="color:#34d399;">Māshā Allāh! Vers ${sheikhQuizState.continuationAyah} korrekt rezitiert (+1 Punkt)!</b>`;
          }
          if (typeof showToast === 'function') {
            showToast(isKu ? `🎉 ما شاء الله! ئایەتی ${sheikhQuizState.continuationAyah} دروستە (+١ خاڵ)` : `🎉 Richtig! Vers ${sheikhQuizState.continuationAyah} gemeistert!`);
          }
          if (navigator.vibrate) try { navigator.vibrate([40, 30, 60]); } catch (e) {}
        } else if (spokenWords.length >= 2) {
          if (statusEl) {
            statusEl.innerHTML = isKu
              ? `🎙️ لە گوێگرتندایە... (<span style="color:#fef08a;">${spokenWords.length}</span> وشە بیسترا – بەردەوام بە لە خوێندنەوە)`
              : `🎙️ Höre zu... (<span style="color:#fef08a;">${spokenWords.length}</span> Wörter erkannt – bitte Vers zu Ende rezitieren)`;
          }
        }
      };

      rec.onerror = function (err) {
        console.warn('SpeechRec error:', err);
        if (err.error === 'not-allowed') {
          stopSheikhQuizMicResources();
          const pMsg = isKu
            ? '⚠️ تکایە ڕێگەپێدانی مایکرۆفۆن لە وێبگەڕەکەت بدە.'
            : '⚠️ Bitte erlaube den Mikrofonzugriff im Browser.';
          if (statusEl) statusEl.innerHTML = `<b style="color:#fca5a5;">${pMsg}</b>`;
        }
      };

      rec.onend = function () {
        if (sheikhQuizState.isListening) {
          try { rec.start(); } catch (e) {}
        }
      };

      sheikhQuizState.recognition = rec;
      rec.start();
    } catch (e) {
      console.warn('SpeechRec exception:', e);
      stopSheikhQuizMicResources();
    }
  };

  // ============================================================
  // 9. SIMPLE, VISUAL 3D KHATM-KORANPLANER (Point 17)
  // ============================================================
  const simpleKhatm = {
    totalDays: 30,
    currentPage: 1,
    startDate: Date.now()
  };

  function loadSimpleKhatm() {
    try {
      const saved = JSON.parse(localStorage.getItem('quran_simple_khatm_v4') || 'null');
      if (saved) Object.assign(simpleKhatm, saved);
    } catch (e) {}
    simpleKhatm.currentPage = Math.max(1, Math.min(604, parseInt(simpleKhatm.currentPage, 10) || 1));
    simpleKhatm.totalDays = Math.max(5, Math.min(365, parseInt(simpleKhatm.totalDays, 10) || 30));
    simpleKhatm.completedAjza = simpleKhatm.completedAjza || {};
  }

  function saveSimpleKhatm() {
    try {
      localStorage.setItem('quran_simple_khatm_v4', JSON.stringify(simpleKhatm));
    } catch (e) {}
  }

  const JUZ_PAGE_RANGES = [
    { juz: 1, start: 1, end: 21, surah: 'الفاتحة - البقرة' },
    { juz: 2, start: 22, end: 41, surah: 'البقرة' },
    { juz: 3, start: 42, end: 61, surah: 'البقرة - آل عمران' },
    { juz: 4, start: 62, end: 81, surah: 'آل عمران - النساء' },
    { juz: 5, start: 82, end: 101, surah: 'النساء' },
    { juz: 6, start: 102, end: 121, surah: 'النساء - المائدة' },
    { juz: 7, start: 122, end: 141, surah: 'المائدة - الأنعام' },
    { juz: 8, start: 142, end: 161, surah: 'الأنعام - الأعراف' },
    { juz: 9, start: 162, end: 181, surah: 'الأعراف - الأنفال' },
    { juz: 10, start: 182, end: 201, surah: 'الأنفال - التوبة' },
    { juz: 11, start: 202, end: 221, surah: 'التوبة - هود' },
    { juz: 12, start: 222, end: 241, surah: 'هود - يوسف' },
    { juz: 13, start: 242, end: 261, surah: 'يوسف - إبراهيم' },
    { juz: 14, start: 262, end: 281, surah: 'الحجر - النحل' },
    { juz: 15, start: 282, end: 301, surah: 'الإسراء - الكهف' },
    { juz: 16, start: 302, end: 321, surah: 'الكهف - طه' },
    { juz: 17, start: 322, end: 341, surah: 'الأنبیاء - الحج' },
    { juz: 18, start: 342, end: 361, surah: 'المؤمنون - الفرقان' },
    { juz: 19, start: 362, end: 381, surah: 'الفرقان - النمل' },
    { juz: 20, start: 382, end: 401, surah: 'النمل - العنكبوت' },
    { juz: 21, start: 402, end: 421, surah: 'العنكبوت - الأحزاب' },
    { juz: 22, start: 422, end: 441, surah: 'الأحزاب - يس' },
    { juz: 23, start: 442, end: 461, surah: 'يس - الزمر' },
    { juz: 24, start: 462, end: 481, surah: 'الزمر - فصلت' },
    { juz: 25, start: 482, end: 501, surah: 'فصلت - الجاثية' },
    { juz: 26, start: 502, end: 521, surah: 'الأحقاف - الذاريات' },
    { juz: 27, start: 522, end: 541, surah: 'الذاريات - الحديد' },
    { juz: 28, start: 542, end: 561, surah: 'المجادلة - التحريم' },
    { juz: 29, start: 562, end: 581, surah: 'الملك - المرسلات' },
    { juz: 30, start: 582, end: 604, surah: 'النبأ - الناس' }
  ];

  function getPageMetadataForKhatm(pageNum) {
    const p = Math.max(1, Math.min(604, pageNum));
    const verses = (typeof getPageVerses === 'function') ? getPageVerses(p) : [];
    const firstV = verses[0] || { surahNum: 1, num: 1, juz: Math.min(30, Math.ceil(p / 20.13)) };
    const surahs = window.ALL_114_SURAHS || [];
    const sMeta = surahs.find(s => s.id === firstV.surahNum) || { id: 1, name: 'Al-Fatiha', arabic: 'الفاتحة' };
    const juz = firstV.juz || Math.min(30, Math.ceil(p / 20.13));
    return { surah: sMeta, ayah: firstV.num || 1, juz: juz };
  }

  window.updateDedicatedKhatm = function () {
    loadSimpleKhatm();
    const pagesPerDay = Math.ceil(604 / simpleKhatm.totalDays);
    const readPages = Math.max(0, simpleKhatm.currentPage - 1);
    const remainingPages = Math.max(0, 604 - readPages);
    const pct = Math.min(100, Math.round((readPages / 604) * 100));
    const currentDay = Math.min(simpleKhatm.totalDays, Math.floor(readPages / pagesPerDay) + 1);
    const todayTargetEnd = Math.min(604, simpleKhatm.currentPage + pagesPerDay - 1);
    const meta = getPageMetadataForKhatm(simpleKhatm.currentPage);

    // Update 3D Circular Ring SVG
    const circleEl = document.getElementById('khatm3dRingProgress');
    if (circleEl) {
      const circumference = 2 * Math.PI * 58; // r=58 -> ~364.4
      const offset = circumference - (pct / 100) * circumference;
      circleEl.style.strokeDasharray = `${circumference}`;
      circleEl.style.strokeDashoffset = `${offset}`;
    }

    const pctEl = document.getElementById('khatm3dPctLabel');
    if (pctEl) pctEl.textContent = `${pct}%`;

    const pagesReadEl = document.getElementById('khatm3dPagesReadLabel');
    if (pagesReadEl) pagesReadEl.textContent = `${readPages} / 604 Seiten`;

    const curPageBadge = document.getElementById('khatm3dCurrentPageVal');
    if (curPageBadge) curPageBadge.textContent = `Seite ${simpleKhatm.currentPage}`;

    const pageInput = document.getElementById('khatmDirectPageInput');
    if (pageInput && document.activeElement !== pageInput) {
      pageInput.value = simpleKhatm.currentPage;
    }

    const rangeSlider = document.getElementById('khatmPageRangeSlider');
    if (rangeSlider) {
      rangeSlider.value = simpleKhatm.currentPage;
    }

    const isKu = (localStorage.getItem('quran_app_language') === 'ku');

    const juzInfoBadge = document.getElementById('khatm3dSurahJuzInfo') || document.getElementById('khatm3dJuzSurahInfo');
    if (juzInfoBadge) {
      juzInfoBadge.textContent = isKu
        ? `جزء ${meta.juz} · سُورَة ${meta.surah.arabic}`
        : `Juz ${meta.juz} · Sure ${meta.surah.id}. ${meta.surah.name} (${meta.surah.arabic})`;
    }

    const dayBadge = document.getElementById('khatm3dDayBadge');
    if (dayBadge) {
      dayBadge.textContent = isKu
        ? `ڕۆژی ${currentDay} لە ${simpleKhatm.totalDays}`
        : `Tag ${currentDay} von ${simpleKhatm.totalDays}`;
    }

    const dailyGoalEl = document.getElementById('khatm3dDailyGoalLabel');
    if (dailyGoalEl) {
      dailyGoalEl.textContent = isKu
        ? `${pagesPerDay} پەڕە / ڕۆژ (ئەمڕۆ: ${simpleKhatm.currentPage} – ${todayTargetEnd})`
        : `${pagesPerDay} Seiten / Tag (Heute: Seite ${simpleKhatm.currentPage} – ${todayTargetEnd})`;
    }

    // Dynamic localized labels for stat cards
    const lblJuz = document.getElementById('khatmCardLbl_juz');
    if (lblJuz) lblJuz.textContent = isKu ? 'جزء و سورەتی ئێستا' : 'AKTUELLER JUZ & SURE';
    const lblQuota = document.getElementById('khatmCardLbl_quota');
    if (lblQuota) lblQuota.textContent = isKu ? 'ئەرکی ئەمڕۆ' : 'HEUTIGES TAGESPENSUM';
    const lblAjza = document.getElementById('khatmCardLbl_ajza');
    if (lblAjza) lblAjza.textContent = isKu ? 'جزءە تەواوکراوەکان' : 'ABGESCHLOSSENE AJZĀ\'';

    const lblInputTitle = document.getElementById('khatmPageInputTitle');
    if (lblInputTitle) lblInputTitle.textContent = isKu ? 'لاپەڕەی ئێستای خەتم (۱-۶۰۴):' : 'Aktuelle Khatm-Seite (1–604):';
    const lblOpenBtn = document.getElementById('khatmOpenPageBtnLabel');
    if (lblOpenBtn) lblOpenBtn.textContent = isKu ? 'کردنەوە ➔' : 'Öffnen ➔';

    const lblCompleteDaily = document.getElementById('khatmCompleteDailyLabel');
    if (lblCompleteDaily) lblCompleteDaily.textContent = isKu ? 'بەشی ئەمڕۆ وەک خوێندراو دیاری بکە' : 'Tagespensum als gelesen markieren';

    const planLbl30 = document.getElementById('khatmPlanLabel_30');
    if (planLbl30) planLbl30.textContent = isKu ? '۳۰ ڕۆژ' : '30 Tage';
    const planLbl60 = document.getElementById('khatmPlanLabel_60');
    if (planLbl60) planLbl60.textContent = isKu ? '۶۰ ڕۆژ' : '60 Tage';
    const planLbl90 = document.getElementById('khatmPlanLabel_90');
    if (planLbl90) planLbl90.textContent = isKu ? '۹۰ ڕۆژ' : '90 Tage';

    const accordionTitle = document.getElementById('khatmAjzaAccordionTitle');
    if (accordionTitle) accordionTitle.textContent = isKu ? '📖 ۳۰ جزءی قورئان (علامت‌داری جزءەکان)' : '📖 30 Ajzā\'-Übersicht & Häkchen';

    // Count completed Ajza
    const completedAjzaMap = simpleKhatm.completedAjza || {};
    const doneCount = Object.keys(completedAjzaMap).filter(k => completedAjzaMap[k]).length;

    const ajzaDoneEl = document.getElementById('khatm3dAjzaDoneLabel');
    if (ajzaDoneEl) {
      ajzaDoneEl.textContent = isKu
        ? `${doneCount} لە ۳۰ جزء خوێندراوە (${Math.round((doneCount / 30) * 100)}%)`
        : `${doneCount} von 30 Ajzā' erledigt (${Math.round((doneCount / 30) * 100)}%)`;
    }

    const ajzaCounter = document.getElementById('khatm3dAjzaDoneCounter');
    if (ajzaCounter) ajzaCounter.textContent = `${doneCount} / 30`;

    // Render interactive 30-Juz checklist
    renderKhatmAjzaGrid();

    // Also update home card Khatm percentage and radial gauge if present
    const homePct = document.getElementById('homeHeroHifzPercent');
    if (homePct) {
      homePct.textContent = `${pct}%`;
    }
    const homeRing = document.getElementById('homeHeroHifzGaugeRing');
    if (homeRing) {
      homeRing.style.strokeDashoffset = Math.max(0, 100 - pct);
    }
    const homePagesBadge = document.getElementById('stickerHifzPagesBadge');
    if (homePagesBadge) {
      homePagesBadge.textContent = isKu ? `${readPages} / ٦٠٤ ل.` : `${readPages} / 604 S.`;
    }

    [30, 60, 90].forEach(d => {
      const b = document.getElementById('khatm3dPlanBtn_' + d);
      if (b) {
        b.classList.toggle('active', simpleKhatm.totalDays === d);
        b.style.background = (simpleKhatm.totalDays === d) ? 'linear-gradient(135deg, #06b6d4, #0284c7)' : 'rgba(255,255,255,0.06)';
        b.style.color = (simpleKhatm.totalDays === d) ? '#fff' : '#cbd5e1';
        b.style.borderColor = (simpleKhatm.totalDays === d) ? '#38bdf8' : 'rgba(255,255,255,0.12)';
      }
    });
  };

  window.toggleKhatmAjzaAccordion = function () {
    const container = document.getElementById('khatm3dAjzaGridContainer');
    const arrow = document.getElementById('khatmAjzaAccordionArrow');
    if (!container) return;
    const isClosed = container.style.display === 'none' || !container.style.display;
    container.style.display = isClosed ? 'block' : 'none';
    if (arrow) {
      arrow.style.transform = isClosed ? 'rotate(180deg)' : 'rotate(0deg)';
    }
  };

  function renderKhatmAjzaGrid() {
    const grid = document.getElementById('khatm3dAjzaGrid');
    if (!grid) return;
    const completedAjza = simpleKhatm.completedAjza || {};
    const isKu = (localStorage.getItem('quran_app_language') === 'ku');

    grid.innerHTML = JUZ_PAGE_RANGES.map(item => {
      const isDone = !!completedAjza[item.juz];
      const isCurrent = simpleKhatm.currentPage >= item.start && simpleKhatm.currentPage <= item.end;
      const juzTitle = isKu ? `جزء ${item.juz}` : `Juz ${item.juz}`;
      const pageRange = isKu ? `پەڕە ${item.start} - ${item.end}` : `S. ${item.start}–${item.end}`;
      const doneLabel = isKu ? (isDone ? 'تەواوکراو' : 'نەخوێندراو') : (isDone ? 'Gelesen' : 'Offen');
      const openLabel = isKu ? 'مصحف ➔' : 'Muṣḥaf ➔';

      return `
        <div style="background: ${isDone ? 'rgba(16, 185, 129, 0.14)' : isCurrent ? 'rgba(6, 182, 212, 0.14)' : 'rgba(255, 255, 255, 0.04)'}; border: 1.2px solid ${isDone ? '#10b981' : isCurrent ? '#06b6d4' : 'rgba(255, 255, 255, 0.08)'}; border-radius: 11px; padding: 7px 8px; display: flex; flex-direction: column; gap: 4px; transition: all 0.2s;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <!-- Clickable Checkbox & Juz Title -->
            <div style="display: flex; align-items: center; gap: 6px;">
              <button type="button" onclick="toggleKhatmJuzCompleted(${item.juz})" title="${isDone ? 'Als ungelesen markieren' : 'Als gelesen markieren'}" style="background: ${isDone ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(255,255,255,0.06)'}; border: 1.5px solid ${isDone ? '#34d399' : 'rgba(255,255,255,0.25)'}; color: ${isDone ? '#fff' : '#94a3b8'}; border-radius: 6px; width: 22px; height: 22px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; padding: 0; font-size: 0.72rem; transition: all 0.2s; box-shadow: ${isDone ? '0 2px 6px rgba(16,185,129,0.35)' : 'none'};">
                <i class="fa-solid ${isDone ? 'fa-check' : 'fa-square'}" style="${isDone ? 'font-size: 0.75rem;' : 'font-size: 0.52rem; opacity: 0.35;'}"></i>
              </button>
              <span style="font-weight: 900; font-size: 0.82rem; color: ${isDone ? '#34d399' : '#fef08a'};">${juzTitle}</span>
            </div>
            <!-- Status Badge Button -->
            <button type="button" onclick="toggleKhatmJuzCompleted(${item.juz})" style="background: ${isDone ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.06)'}; border: 1px solid ${isDone ? '#10b981' : 'rgba(255,255,255,0.18)'}; color: ${isDone ? '#34d399' : '#94a3b8'}; border-radius: 7px; padding: 2px 7px; font-size: 0.65rem; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 4px; transition: all 0.2s;">
              ${isDone ? '<i class="fa-solid fa-check" style="font-size: 0.6rem;"></i> ' : ''}${doneLabel}
            </button>
          </div>
          <div style="font-size: 0.66rem; color: #94a3b8; display: flex; justify-content: space-between; align-items: center;">
            <span>${pageRange}</span>
            <span style="color: #67e8f9; font-size: 0.63rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 55%;">${item.surah}</span>
          </div>
          <button type="button" onclick="jumpToKhatmJuz(${item.juz})" style="margin-top: 1px; width: 100%; padding: 3px 5px; font-size: 0.67rem; font-weight: 700; border-radius: 6px; border: 1px solid rgba(6,182,212,0.35); background: rgba(6,182,212,0.12); color: #67e8f9; cursor: pointer;">
            ${openLabel}
          </button>
        </div>
      `;
    }).join('');
  }

  window.toggleKhatmJuzCompleted = function (juzNum) {
    loadSimpleKhatm();
    simpleKhatm.completedAjza = simpleKhatm.completedAjza || {};
    const isDone = !simpleKhatm.completedAjza[juzNum];
    simpleKhatm.completedAjza[juzNum] = isDone;
    const isKu = (localStorage.getItem('quran_app_language') === 'ku');

    if (isDone) {
      const targetJuz = JUZ_PAGE_RANGES.find(x => x.juz === juzNum);
      if (targetJuz && simpleKhatm.currentPage <= targetJuz.end) {
        simpleKhatm.currentPage = Math.min(604, targetJuz.end + 1);
      }
    }
    saveSimpleKhatm();
    window.updateDedicatedKhatm();
    if (typeof showToast === 'function') {
      const msg = isKu
        ? (isDone ? `✅ جزء ${juzNum} وەک تەواوکراو تۆمار کرا` : `جزء ${juzNum} هەڵوەشێنرایەوە`)
        : (isDone ? `✅ Juz ${juzNum} als gelesen markiert!` : `Juz ${juzNum} zurückgesetzt.`);
      showToast(msg);
    }
  };

  window.jumpToKhatmJuz = function (juzNum) {
    loadSimpleKhatm();
    const targetJuz = JUZ_PAGE_RANGES.find(x => x.juz === juzNum);
    const startP = targetJuz ? targetJuz.start : 1;
    simpleKhatm.currentPage = startP;
    saveSimpleKhatm();
    window.updateDedicatedKhatm();
    window.openSimpleKhatmInMushaf();
  };

  window.setSimpleKhatmPlanDays = function (days) {
    loadSimpleKhatm();
    simpleKhatm.totalDays = parseInt(days, 10) || 30;
    saveSimpleKhatm();
    window.updateDedicatedKhatm();
  };

  window.stepSimpleKhatmPage = function (delta) {
    loadSimpleKhatm();
    simpleKhatm.currentPage = Math.max(1, Math.min(604, simpleKhatm.currentPage + delta));
    saveSimpleKhatm();
    window.updateDedicatedKhatm();
  };

  window.setSimpleKhatmPageDirect = function (val) {
    loadSimpleKhatm();
    const p = Math.max(1, Math.min(604, parseInt(val, 10) || 1));
    simpleKhatm.currentPage = p;
    saveSimpleKhatm();
    window.updateDedicatedKhatm();
  };

  window.completeSimpleKhatmDailyPortion = function () {
    loadSimpleKhatm();
    const pagesPerDay = Math.ceil(604 / simpleKhatm.totalDays);
    simpleKhatm.currentPage = Math.min(604, simpleKhatm.currentPage + pagesPerDay);
    saveSimpleKhatm();
    window.updateDedicatedKhatm();
    if (typeof showToast === 'function') {
      showToast(`🎉 Māshā Allāh! Tagespensum erledigt! Nächste Seite: ${simpleKhatm.currentPage}`);
    }
  };

  window.openSimpleKhatmInMushaf = function () {
    loadSimpleKhatm();
    const targetPage = simpleKhatm.currentPage || 1;
    localStorage.setItem('quran_current_page', String(targetPage));
    localStorage.setItem('quran_last_page', String(targetPage));
    window.khatmReadingSessionActive = true;

    // Close any open modal if triggered from modal
    const khModal = document.getElementById('khatmPlannerModal');
    if (khModal) khModal.style.display = 'none';

    // Switch to Section 1 (Mushaf)
    window.switchMainTab('mushaf');

    // Force Interactive Text Mode (as explicitly requested by user: "به قسمت مصحف و تکست برود")
    if (typeof setMushafMode === 'function') {
      setMushafMode('interactive');
    }

    // Load exact Khatm page
    if (typeof jumpToPage === 'function') {
      jumpToPage(targetPage);
    } else if (typeof loadPage === 'function') {
      loadPage(targetPage);
    }

    // Show the floating Khatm Return Banner inside Mushaf
    const banner = document.getElementById('mushafKhatmReturnBanner');
    const bannerPageSpan = document.getElementById('mushafKhatmBannerPage');
    if (banner) banner.style.display = 'flex';
    if (bannerPageSpan) bannerPageSpan.textContent = targetPage;

    if (typeof showToast === 'function') {
      showToast(`📖 Khatm-Lesung gestartet: Muṣḥaf (Text) Seite ${targetPage}`);
    }
  };

  window.saveCurrentMushafPageToKhatmAndReturn = function () {
    loadSimpleKhatm();
    const curMushafPage = (window.state && window.state.currentPage) || simpleKhatm.currentPage || 1;
    simpleKhatm.currentPage = Math.max(1, Math.min(604, curMushafPage));
    saveSimpleKhatm();
    window.khatmReadingSessionActive = false;

    const banner = document.getElementById('mushafKhatmReturnBanner');
    if (banner) banner.style.display = 'none';

    window.switchMainTab('khatm');
    window.updateDedicatedKhatm();
    if (typeof showToast === 'function') {
      showToast(`✅ Khatm-Fortschritt auf Seite ${simpleKhatm.currentPage} aktualisiert!`);
    }
  };

  window.resetSimpleKhatm = function () {
    simpleKhatm.currentPage = 1;
    simpleKhatm.startDate = Date.now();
    saveSimpleKhatm();
    window.updateDedicatedKhatm();
    if (typeof showToast === 'function') showToast('🔄 Khatm auf Seite 1 zurückgesetzt');
  };

  // ============================================================
  // 10. TAFSIR STUDIO & TAFSIR NAMI 3-VOLUME BOOK READER (Point 14, 15)
  // ============================================================
  // Enhance fetchAuthenticGermanTafsir so all 6,236 verses use AUTHENTIC_TAFSIR_DB offline!
  const origFetchTafsir = window.fetchAuthenticGermanTafsir;
  window.fetchAuthenticGermanTafsir = async function (surahNum) {
    const qVerses = (typeof getVersesForSurah === 'function') ? getVersesForSurah(surahNum) : [];
    const offlineDb = (typeof AUTHENTIC_TAFSIR_DB !== 'undefined') ? AUTHENTIC_TAFSIR_DB : window.AUTHENTIC_TAFSIR_DB;

    if (offlineDb && qVerses.length > 0) {
      return qVerses.map(v => {
        const key = `${surahNum}:${v.num}`;
        const entry = offlineDb[key] || {};
        return {
          num: v.num,
          surahNum: surahNum,
          ar: v.ar,
          bubenheim: v.de || entry.z || '',
          zaidan: entry.z || v.de || '',
          aburida: entry.m
            ? `<div style="direction:rtl; text-align:right; font-family:var(--quran-font); font-size:1.3rem; color:#fef08a; margin-bottom:6px;">📖 التفسير الميسر (مجمع الملك فهد بالمدينة المنورة):</div><div style="direction:rtl; text-align:right; font-family:var(--quran-font); font-size:1.25rem; line-height:1.95; color:#f8fafc;">${entry.m}</div>`
            : (v.de || '')
        };
      });
    }
    if (typeof origFetchTafsir === 'function') {
      return origFetchTafsir(surahNum);
    }
    return qVerses;
  };

  // Unify openTafsirNamiPdfModalForSurah to open the dedicated Tafsir Nami Book Reader cleanly
  window.openTafsirNamiPdfModalForSurah = function (surahNum) {
    const sNum = parseInt(surahNum, 10) || (window.state && window.state.tafsirSurah) || 1;
    window.switchMainTab('tafsirPdf');
    setTimeout(() => {
      const sel = document.getElementById('namiDedicatedSurahSelect');
      if (sel) sel.value = sNum;
      if (typeof window.setNamiDisplayMode === 'function') window.setNamiDisplayMode(window.currentNamiDisplayMode || 'text');
      if (typeof window.onDedicatedNamiSurahChanged === 'function') window.onDedicatedNamiSurahChanged(sNum);
    }, 60);
  };

  const cachedNamiPdfDocs = {};
  const NAMI_VOL_CONFIG = {
    1: { maxPage: 576, file: 'TafsirNami_PDFs/tafsir_nami_vol1.pdf', surahStart: 1, surahEnd: 9 },
    2: { maxPage: 496, file: 'TafsirNami_PDFs/tafsir_nami_vol2.pdf', surahStart: 10, surahEnd: 28 },
    3: { maxPage: 646, file: 'TafsirNami_PDFs/tafsir_nami_vol3.pdf', surahStart: 29, surahEnd: 114 }
  };

  // Calculate approximate starting page in each Nami Volume for any Surah 1..114
  function getNamiBookPositionForSurah(sNum) {
    sNum = Math.max(1, Math.min(114, parseInt(sNum, 10) || 1));
    let vol = 1;
    if (sNum >= 29) vol = 3;
    else if (sNum >= 10) vol = 2;

    const cfg = NAMI_VOL_CONFIG[vol];
    if (sNum === cfg.surahStart) {
      return { vol, page: 1 };
    }
    const surahs = window.ALL_114_SURAHS || [];
    const volSurahs = surahs.filter(s => s.id >= cfg.surahStart && s.id <= cfg.surahEnd);
    const totalVersesInVol = volSurahs.reduce((acc, s) => acc + (s.ayahCount || s.versesCount || 7), 0) || 1;
    let versesBefore = 0;
    for (let i = 0; i < volSurahs.length; i++) {
      if (volSurahs[i].id < sNum) versesBefore += (volSurahs[i].ayahCount || volSurahs[i].versesCount || 7);
    }
    const approxPage = Math.max(1, Math.min(cfg.maxPage, Math.floor((versesBefore / totalVersesInVol) * (cfg.maxPage - 1)) + 1));
    return { vol, page: approxPage };
  }

  // Given a Volume (1..3) and Page (1..maxPage), find the exact slice of Kurdish Tafsir Nami verses for that book page!
  function getNamiVersesForBookPage(volNum, pageNum) {
    const cfg = NAMI_VOL_CONFIG[volNum] || NAMI_VOL_CONFIG[1];
    const surahs = window.ALL_114_SURAHS || [];
    const volSurahs = surahs.filter(s => s.id >= cfg.surahStart && s.id <= cfg.surahEnd);
    const flatVerses = [];
    const kData = window.KURDISH_TAFSIR_DATA || (typeof KURDISH_TAFSIR_DATA !== 'undefined' ? KURDISH_TAFSIR_DATA : {});

    volSurahs.forEach(s => {
      const sMap = kData[s.id] || {};
      const vCount = s.ayahCount || s.versesCount || Object.keys(sMap).length || 7;
      for (let a = 1; a <= vCount; a++) {
        flatVerses.push({
          surahId: s.id,
          surahAr: s.arabic || s.nameArabic || s.name || '',
          surahKu: s.kurdish || s.nameKurdish || s.name || '',
          ayahNum: a,
          tafsirText: sMap[a] || ''
        });
      }
    });

    if (flatVerses.length === 0) return [];

    // Special case: Volume 1 Page 1 is strictly Surah Al-Faatiha verses 1 to 7
    if (volNum === 1 && pageNum === 1) {
      return flatVerses.slice(0, 7);
    }

    const versesPerPage = Math.max(3, Math.ceil(flatVerses.length / cfg.maxPage));
    const startIdx = Math.min(flatVerses.length - 1, Math.max(0, (pageNum - 1) * versesPerPage));
    return flatVerses.slice(startIdx, startIdx + versesPerPage);
  }

  window.stepDedicatedNamiPage = function (delta) {
    const vol = window.currentDedicatedNamiVol || 1;
    const cfg = NAMI_VOL_CONFIG[vol] || NAMI_VOL_CONFIG[1];
    const cur = window.currentDedicatedNamiPage || 1;
    const next = Math.max(1, Math.min(cfg.maxPage, cur + delta));
    if (next !== cur) {
      window.renderDedicatedNamiPdf(next);
    }
  };

  window.onDedicatedNamiSurahChanged = function (surahId) {
    const pos = getNamiBookPositionForSurah(surahId);
    window.currentDedicatedNamiVol = pos.vol;
    window.currentDedicatedNamiPage = pos.page;
    updateNamiVolButtonsUI(pos.vol);
    window.renderDedicatedNamiPdf(pos.page, parseInt(surahId, 10));
  };

  window.switchDedicatedNamiVol = function (volNum) {
    window.currentDedicatedNamiVol = volNum;
    window.currentDedicatedNamiPage = 1;
    updateNamiVolButtonsUI(volNum);
    const cfg = NAMI_VOL_CONFIG[volNum] || NAMI_VOL_CONFIG[1];
    const sel = document.getElementById('namiDedicatedSurahSelect');
    if (sel) sel.value = cfg.surahStart;
    window.renderDedicatedNamiPdf(1, cfg.surahStart);
  };

  function updateNamiVolButtonsUI(volNum) {
    [1, 2, 3].forEach(v => {
      const btn = document.getElementById(`namiDedicatedVol${v}Btn`);
      if (btn) {
        btn.classList.toggle('active', v === volNum);
        btn.style.background = v === volNum ? 'var(--gold-primary)' : 'rgba(255,255,255,0.06)';
        btn.style.color = v === volNum ? '#000' : '#cbd5e1';
      }
    });
    const cfg = NAMI_VOL_CONFIG[volNum] || NAMI_VOL_CONFIG[1];
    const totalLbl = document.getElementById('namiDedicatedTotalPagesLabel');
    if (totalLbl) totalLbl.textContent = `لە ${cfg.maxPage}`;
  }

  // --- Compact Tafsir Nami Audio Controller ---
  let currentNamiAudio = null;
  let currentNamiAudioSurah = 1;
  let currentNamiAudioAyah = 1;

  window.onNamiQariChanged = function (qari) {
    if (window.state) window.state.namiQari = qari;
    if (currentNamiAudio && !currentNamiAudio.paused) {
      window.playNamiVerseAudio(currentNamiAudioSurah, currentNamiAudioAyah);
    }
  };

  function updateNamiPlayButtonUI(isPlaying) {
    const playIcon = document.getElementById('namiPlayIcon');
    const playLabel = document.getElementById('namiPlayLabel');
    const playBtn = document.getElementById('namiPlayBtn');
    if (!playBtn) return;
    if (isPlaying) {
      if (playIcon) playIcon.className = 'fa-solid fa-stop';
      if (playLabel) playLabel.textContent = 'وەستان';
      playBtn.style.background = 'linear-gradient(135deg, #ef4444, #b91c1c)';
    } else {
      if (playIcon) playIcon.className = 'fa-solid fa-play';
      if (playLabel) playLabel.textContent = 'گوێگرتن';
      playBtn.style.background = 'linear-gradient(135deg, #10b981, #047857)';
    }
  }

  window.toggleNamiPageAudio = function () {
    if (currentNamiAudio && !currentNamiAudio.paused) {
      try { currentNamiAudio.pause(); } catch (e) {}
      currentNamiAudio = null;
      updateNamiPlayButtonUI(false);
      return;
    }
    const verses = window.currentNamiPageVerses || [];
    if (verses.length === 0) return;
    const idx = Math.max(0, Math.min(verses.length - 1, window.currentNamiAudioIndex || 0));
    const targetVerse = verses[idx];
    window.playNamiVerseAudio(targetVerse.surahId, targetVerse.ayahNum);
  };

  window.stepNamiAudioAyah = function (delta) {
    const verses = window.currentNamiPageVerses || [];
    if (verses.length === 0) return;
    let idx = (window.currentNamiAudioIndex || 0) + delta;
    if (idx < 0) {
      window.stepDedicatedNamiPage(-1);
      return;
    } else if (idx >= verses.length) {
      window.stepDedicatedNamiPage(1);
      return;
    }
    window.currentNamiAudioIndex = idx;
    const targetVerse = verses[idx];
    window.playNamiVerseAudio(targetVerse.surahId, targetVerse.ayahNum);
  };

  window.playNamiVerseAudio = function (surah, ayah) {
    const s = parseInt(surah, 10) || 1;
    const a = parseInt(ayah, 10) || 1;
    currentNamiAudioSurah = s;
    currentNamiAudioAyah = a;

    if (currentNamiAudio) {
      try { currentNamiAudio.pause(); } catch (e) {}
      currentNamiAudio = null;
    }

    const qariSelect = document.getElementById('namiDedicatedQariSelect');
    const qari = (qariSelect && qariSelect.value) || (window.state && window.state.namiQari) || 'Alafasy_128kbps';
    const sStr = String(s).padStart(3, '0');
    const aStr = String(a).padStart(3, '0');
    const cacheKey = `${qari}_${sStr}${aStr}`;
    const primaryUrl = (window.offlineAudioMemoryBlobs && window.offlineAudioMemoryBlobs[cacheKey])
      ? window.offlineAudioMemoryBlobs[cacheKey]
      : `https://everyayah.com/data/${qari}/${sStr}${aStr}.mp3`;
    const fallbackUrl = `https://everyayah.com/data/Alafasy_128kbps/${sStr}${aStr}.mp3`;

    currentNamiAudio = new Audio(primaryUrl);
    updateNamiPlayButtonUI(true);

    currentNamiAudio.onended = function () {
      const verses = window.currentNamiPageVerses || [];
      const curIdx = window.currentNamiAudioIndex || 0;
      if (curIdx + 1 < verses.length) {
        window.currentNamiAudioIndex = curIdx + 1;
        const nextV = verses[curIdx + 1];
        window.playNamiVerseAudio(nextV.surahId, nextV.ayahNum);
      } else {
        currentNamiAudio = null;
        updateNamiPlayButtonUI(false);
      }
    };

    currentNamiAudio.onerror = function () {
      if (currentNamiAudio && currentNamiAudio.src !== fallbackUrl) {
        currentNamiAudio.src = fallbackUrl;
        currentNamiAudio.play().catch(() => {
          updateNamiPlayButtonUI(false);
        });
      }
    };

    currentNamiAudio.play().catch(() => {
      currentNamiAudio.src = fallbackUrl;
      currentNamiAudio.play().catch(() => {
        updateNamiPlayButtonUI(false);
      });
    });

    if (typeof showToast === 'function') {
      showToast(`🔊 سوورەتی ${s} : ئایەتی ${a}`);
    }
  };

  // --- Dual Display Mode for Tafsir Nami: [ دەق (Text) ] vs [ پەڕتووک (PDF) ] ---
  window.currentNamiDisplayMode = 'text';

  window.setNamiDisplayMode = function (mode) {
    window.currentNamiDisplayMode = mode || 'text';
    const textBtn = document.getElementById('namiModeTextBtn');
    const pdfBtn = document.getElementById('namiModePdfBtn');
    const volRow = document.getElementById('namiVolButtonsRow');

    const isText = window.currentNamiDisplayMode === 'text';
    const isPdf = window.currentNamiDisplayMode === 'pdf';

    if (textBtn) {
      textBtn.classList.toggle('active', isText);
      textBtn.style.background = isText ? 'linear-gradient(135deg, #10b981, #047857)' : 'rgba(255,255,255,0.06)';
      textBtn.style.color = isText ? '#fff' : '#cbd5e1';
      textBtn.style.borderColor = isText ? '#34d399' : 'rgba(255,255,255,0.12)';
    }

    if (pdfBtn) {
      pdfBtn.classList.toggle('active', isPdf);
      pdfBtn.style.background = isPdf ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 'rgba(255,255,255,0.06)';
      pdfBtn.style.color = isPdf ? '#fff' : '#cbd5e1';
      pdfBtn.style.borderColor = isPdf ? '#60a5fa' : 'rgba(255,255,255,0.12)';
    }

    // The 3-volume switcher buttons (بەرگی ١، بەرگی ۲، بەرگی ۳) are shown strictly in PDF mode
    if (volRow) {
      volRow.style.display = isPdf ? 'grid' : 'none';
    }

    const curPage = window.currentDedicatedNamiPage || 1;
    window.renderDedicatedNamiPdf(curPage);
  };

  window.renderDedicatedNamiPdf = async function (pageNum, explicitSurahId) {
    const vol = window.currentDedicatedNamiVol || 1;
    const cfg = NAMI_VOL_CONFIG[vol] || NAMI_VOL_CONFIG[1];
    const safePage = Math.max(1, Math.min(cfg.maxPage, parseInt(pageNum, 10) || 1));
    window.currentDedicatedNamiPage = safePage;

    const pageInput = document.getElementById('namiDedicatedPageInput');
    if (pageInput) pageInput.value = safePage;

    const canvas = document.getElementById('namiDedicatedCanvas');
    const loading = document.getElementById('namiDedicatedLoading');
    const textBackup = document.getElementById('namiDedicatedTextBackup');
    const mode = window.currentNamiDisplayMode || 'text';

    // 1. Prepare verses data for current page (used for text view and audio playback)
    const pageVerses = getNamiVersesForBookPage(vol, safePage);
    window.currentNamiPageVerses = pageVerses;
    window.currentNamiAudioIndex = 0;

    if (pageVerses.length > 0 && !explicitSurahId) {
      const sel = document.getElementById('namiDedicatedSurahSelect');
      if (sel) sel.value = pageVerses[0].surahId;
    }

    if (mode === 'text') {
      // TEXT MODE: Show authentic typeset sheet, hide PDF canvas and loader
      if (canvas) canvas.style.display = 'none';
      if (loading) loading.style.display = 'none';
      if (textBackup) {
        textBackup.style.display = 'block';
        const firstV = pageVerses[0] || { surahId: 1, surahAr: 'الفاتحة', surahKu: 'فاتیحە' };
        const qVersesCache = {};
        const versesHtml = pageVerses.map(item => {
          if (!qVersesCache[item.surahId] && typeof getVersesForSurah === 'function') {
            qVersesCache[item.surahId] = getVersesForSurah(item.surahId);
          }
          const qList = qVersesCache[item.surahId] || [];
          const qV = qList.find(x => x.num === item.ayahNum);
          const arText = qV ? qV.ar : '';
          return `
            <div id="namiVerseRow_${item.surahId}_${item.ayahNum}" style="padding: 14px 16px; border-bottom: 1.5px dashed rgba(180, 140, 70, 0.35); margin-bottom: 12px; transition: background 0.3s ease;">
              ${arText ? `<div style="font-family: var(--quran-font); font-size: 1.55rem; line-height: 2.1; color: #78350f; background: rgba(217, 119, 6, 0.08); padding: 10px 14px; border-radius: 10px; margin-bottom: 10px; text-align: right;">${arText} ﴿${item.ayahNum}﴾</div>` : ''}
              <div style="display: flex; align-items: baseline; gap: 8px;">
                <span style="background: #065f46; color: #fff; font-weight: 800; font-size: 0.78rem; padding: 2px 9px; border-radius: 8px; flex-shrink: 0;">ئایەتی ${item.ayahNum}</span>
                <div style="font-family: var(--kurdish-font); font-size: 1.18rem; line-height: 2.05; color: #1e293b; text-align: right; word-spacing: normal !important; letter-spacing: normal !important; direction: rtl;">
                  ${item.tafsirText}
                </div>
              </div>
            </div>
          `;
        }).join('');

        textBackup.innerHTML = `
          <div class="nami-authentic-book-sheet" style="background: #fdfbf7; color: #0f172a; border: 3px double #b45309; border-radius: 16px; padding: 18px 16px; box-shadow: 0 12px 35px rgba(0,0,0,0.65); direction: rtl; text-align: right;">
            <!-- Book Running Header -->
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #b45309; padding-bottom: 10px; margin-bottom: 14px;">
              <span style="font-family: var(--kurdish-font); font-weight: 900; font-size: 0.95rem; color: #92400e;">📚 خوڵاسەی تەفسیری نامی · دەقی ڕوون</span>
              <span style="font-family: var(--quran-font); font-weight: 800; font-size: 1.15rem; color: #065f46;">سُورَةُ ${firstV.surahAr} (${firstV.surahKu})</span>
              <span style="background: #fef3c7; border: 1px solid #d97706; color: #92400e; font-weight: 900; font-size: 0.82rem; padding: 2px 10px; border-radius: 12px;">پەڕە ${safePage} / ${cfg.maxPage}</span>
            </div>
            ${versesHtml}
            <!-- Book Footer Page Stepper -->
            <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 8px;">
              <button onclick="stepDedicatedNamiPage(-1)" style="padding: 8px 16px; border-radius: 10px; border: 1.5px solid #b45309; background: #fef3c7; color: #78350f; font-weight: 800; cursor: pointer;">► پەڕەی پێشوو (${Math.max(1, safePage - 1)})</button>
              <span style="font-size: 0.8rem; color: #64748b; font-weight: 700;">مامۆستا مەلا عەبدولکەریمی مودەڕڕیس</span>
              <button onclick="stepDedicatedNamiPage(1)" style="padding: 8px 16px; border-radius: 10px; border: 1.5px solid #065f46; background: #d1fae5; color: #065f46; font-weight: 800; cursor: pointer;">پەڕەی دواتر (${Math.min(cfg.maxPage, safePage + 1)}) ◄</button>
            </div>
          </div>
        `;
      }
    } else {
      // PDF MODE: Strictly show scanned PDF Canvas, NEVER show text sheet
      if (textBackup) textBackup.style.display = 'none';

      if (canvas && typeof pdfjsLib !== 'undefined') {
        try {
          if (loading) {
            loading.style.display = 'flex';
            loading.style.color = 'var(--gold-light)';
            loading.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> لە بارکردنی پەڕەی تەفسیری نامی (PDF)...';
          }

          if (!cachedNamiPdfDocs[vol]) {
            const isFileProto = window.location.protocol === 'file:';
            const pdfUrl = isFileProto
              ? ('file:///C:/Users/Ibo/Desktop/Quran_App_Desktop/' + cfg.file)
              : cfg.file;

            if (pdfjsLib.GlobalWorkerOptions) {
              pdfjsLib.GlobalWorkerOptions.workerSrc = isFileProto
                ? 'file:///C:/Users/Ibo/Desktop/Quran_App_Desktop/pdf.worker.min.js'
                : 'pdf.worker.min.js';
            }

            // Load PDF bytes locally into memory as Uint8Array - completely eliminates range 206 negotiation errors
            let docData = null;
            try {
              const pdfResp = await fetch(pdfUrl);
              if (pdfResp.ok) {
                const buf = await pdfResp.arrayBuffer();
                docData = new Uint8Array(buf);
              }
            } catch (fetchErr) {
              console.warn('Local buffer fetch fallback:', fetchErr);
            }

            const loadingTask = pdfjsLib.getDocument(docData ? {
              data: docData,
              disableWorker: true,
              disableFontFace: true
            } : {
              url: pdfUrl,
              disableRange: true,
              disableStream: true,
              disableAutoFetch: false,
              disableWorker: true,
              disableFontFace: true
            });
            cachedNamiPdfDocs[vol] = await loadingTask.promise;
          }

          const doc = cachedNamiPdfDocs[vol];
          const pdfPageNum = Math.max(1, Math.min(safePage, doc.numPages));
          const page = await doc.getPage(pdfPageNum);

          // Responsive scale for mobile and desktop screens
          const viewport1 = page.getViewport({ scale: 1.0 });
          const targetWidth = Math.min((window.innerWidth || 412) - 36, 560);
          const scale = Math.max(0.65, targetWidth / viewport1.width);
          const viewport = page.getViewport({ scale });

          canvas.height = viewport.height;
          canvas.width = viewport.width;
          const ctx = canvas.getContext('2d');
          await page.render({ canvasContext: ctx, viewport: viewport }).promise;

          canvas.style.display = 'block';
          canvas.style.maxWidth = '100%';
          canvas.style.height = 'auto';
          canvas.style.borderRadius = '12px';
          canvas.style.boxShadow = '0 6px 25px rgba(0,0,0,0.85)';
          canvas.style.marginBottom = '16px';
        } catch (e) {
          console.warn('PDF render error:', e);
          if (canvas) canvas.style.display = 'none';
          if (loading) {
            loading.style.display = 'flex';
            loading.innerHTML = `
              <div style="background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.35); border-radius: 12px; padding: 12px 16px; color: #fca5a5; font-size: 0.85rem; text-align: center;">
                <i class="fa-solid fa-triangle-exclamation" style="font-size: 1.2rem; margin-bottom: 6px; color: #f87171;"></i>
                <div>نەتوانرا پەڕەی کتێبەکە باربکرێت (${e.message || 'Error'}).</div>
              </div>
            `;
          }
        } finally {
          if (loading && canvas && canvas.style.display === 'block') {
            loading.style.display = 'none';
          }
        }
      } else {
        if (canvas) canvas.style.display = 'none';
        if (loading) {
          loading.style.display = 'flex';
          loading.innerHTML = '<div style="color:#f87171;">کتێبخانەی PDF ئامادە نییە.</div>';
        }
      }
    }
  };

  // ============================================================
  // 11. MENU-BASED TAJWEED ACADEMY WITH AUDIO EXAMPLES (Point 16)
  // ============================================================
  window.renderDedicatedTajweed = function () {
    const container = document.getElementById('tajweedLessonsDedicatedContainer');
    if (!container) return;

    const cats = window.OFFICIAL_TAJWEED_CATEGORIES || [];
    const lang = window.currentAppLanguage || 'ku';

    // If no category is selected, show the sleek 3D Category Menu Grid!
    if (!window.activeTajweedCategoryId) {
      container.innerHTML = `
        <div style="font-size: 0.85rem; color: #94a3b8; margin-bottom: 10px;">
          Wähle ein Tajweed-Kapitel aus, um die offiziellen Regeln, Muṣḥaf-Farbcodes und vertonten Koran-Beispiele zu öffnen:
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(270px, 1fr)); gap: 12px;">
          ${cats.map(c => {
            const title = lang === 'ku' ? c.titleKu : (lang === 'en' ? c.titleEn : c.titleDe);
            const desc = lang === 'ku' ? c.descKu : (lang === 'en' ? c.descEn : c.descDe);
            return `
              <div class="neo3d-card" onclick="openTajweedCategoryDetail('${c.id}')" style="cursor: pointer; border-top: 3px solid ${c.color}; display: flex; flex-direction: column; justify-content: space-between; gap: 12px;">
                <div>
                  <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 10px;">
                    <div class="neo3d-orb-icon" style="width: 44px; height: 44px; font-size: 1.2rem; background: ${c.color}28; color: ${c.color}; border: 1.5px solid ${c.color};">
                      <i class="fa-solid ${c.icon === 'fa-OCTAGON' ? 'fa-circle-pause' : c.icon}"></i>
                    </div>
                    <span style="font-size: 0.74rem; font-weight: 800; padding: 3px 10px; border-radius: 20px; background: ${c.color}22; color: ${c.color};">${c.badgeAr}</span>
                  </div>
                  <h3 style="margin: 0 0 6px; font-size: 1.02rem; font-weight: 800; color: #fff;">${title}</h3>
                  <div style="font-family: var(--quran-font); font-size: 1.15rem; color: var(--gold-light); margin-bottom: 6px;">${c.titleAr}</div>
                  <p style="margin: 0; font-size: 0.82rem; color: #94a3b8; line-height: 1.45;">${desc}</p>
                </div>
                <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.06); font-size: 0.8rem; font-weight: 800; color: ${c.color};">
                  <span>${c.rules.length} Regeln &amp; Audio-Beispiele</span>
                  <i class="fa-solid fa-arrow-right"></i>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
      return;
    }

    // Render Selected Category Detail View
    const cat = cats.find(c => c.id === window.activeTajweedCategoryId) || cats[0];
    const catTitle = lang === 'ku' ? cat.titleKu : (lang === 'en' ? cat.titleEn : cat.titleDe);

    const rulesHtml = cat.rules.map(r => {
      const rTitle = lang === 'ku' ? r.titleKu : (lang === 'en' ? r.titleEn : r.titleDe);
      const rDesc = lang === 'ku' ? r.ruleKu : (lang === 'en' ? r.ruleEn : r.ruleDe);

      const exHtml = (r.examples || []).map(ex => {
        const note = lang === 'ku' ? ex.noteKu : (lang === 'en' ? ex.noteEn : ex.noteDe);
        return `
          <div style="background: rgba(0, 0, 0, 0.35); border-right: 4px solid ${r.colorHex || cat.color}; padding: 10px 14px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <button onclick="playTajweedExampleAudio(${ex.surah}, ${ex.ayah})" class="neo3d-pill-btn" style="background: ${cat.color}; color: #000; font-weight: 800; border: none; padding: 6px 12px;">
                <i class="fa-solid fa-volume-high"></i> Hören (${ex.surah}:${ex.ayah})
              </button>
              <span style="font-size: 0.8rem; color: #cbd5e1;">${note}</span>
            </div>
            <span style="font-family: var(--quran-font); font-size: 1.55rem; color: #fef08a; direction: rtl;">${ex.ar}</span>
          </div>
        `;
      }).join('');

      return `
        <div class="neo3d-card" style="border-left: 4px solid ${r.colorHex || cat.color};">
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin-bottom: 8px;">
            <h3 style="margin: 0; font-size: 1.05rem; font-weight: 800; color: #fff;">${rTitle}</h3>
            <span style="font-size: 0.74rem; font-weight: 800; padding: 3px 10px; border-radius: 12px; background: rgba(255,255,255,0.08); color: ${r.colorHex || '#fef08a'};">${r.colorBadge}</span>
          </div>
          <div style="font-family: var(--quran-font); font-size: 1.2rem; color: var(--gold-light); margin-bottom: 8px;">${r.titleAr}</div>
          <p style="margin: 0 0 14px; font-size: 0.88rem; color: #cbd5e1; line-height: 1.6;">${rDesc}</p>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${exHtml}
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
        <button onclick="window.activeTajweedCategoryId = null; renderDedicatedTajweed();" class="neo3d-pill-btn" style="padding: 8px 14px;">
          <i class="fa-solid fa-arrow-left"></i> Alle 6 Tajweed-Kapitel
        </button>
        <span style="font-weight: 800; color: ${cat.color}; font-size: 0.95rem;">${catTitle}</span>
      </div>
      <div style="display: flex; flex-direction: column; gap: 14px;">
        ${rulesHtml}
      </div>
    `;
  };

  window.openTajweedCategoryDetail = function (catId) {
    window.activeTajweedCategoryId = catId;
    window.renderDedicatedTajweed();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  let tajweedAudioObj = null;
  window.playTajweedExampleAudio = function (surah, ayah) {
    if (tajweedAudioObj) { tajweedAudioObj.pause(); tajweedAudioObj = null; }
    const url = window.getAyahAudioUrl(surah, ayah, 'Husary_128kbps');
    tajweedAudioObj = new Audio(url);
    tajweedAudioObj.onerror = function () {
      const sStr = String(surah).padStart(3, '0');
      const aStr = String(ayah).padStart(3, '0');
      tajweedAudioObj.src = `https://everyayah.com/data/Husary_128kbps/${sStr}${aStr}.mp3`;
      tajweedAudioObj.play().catch(() => {});
    };
    tajweedAudioObj.play().catch(() => {});
    if (typeof showToast === 'function') showToast(`🔊 Tajweed-Beispiel (Al-Hussary): Sure ${surah}:${ayah}`);
  };

  // ============================================================
  // 12. CONNECTED QURAN WORDBOOK WITH CORPUS SEARCH & AUDIO (Point 17)
  // ============================================================
  let activeDictCat = 'all';
  window.setDictionaryCategory = function (cat) {
    activeDictCat = cat;
    ['all', 'aqidah', 'ibadah', 'akhlaq', 'akhirah', 'qasas', 'kawn'].forEach(c => {
      const btn = document.getElementById('dictCatBtn_' + c);
      if (btn) btn.classList.toggle('active', c === cat);
    });
    const input = document.getElementById('dictSearchInput');
    window.renderDedicatedDictionary(input ? input.value : '');
  };

  window.renderDedicatedDictionary = function (query) {
    // Support both container IDs so it NEVER fails!
    const container = document.getElementById('dictionaryDedicatedContainer') ||
                      document.getElementById('dictionaryWordsDedicatedContainer');
    if (!container) return;

    const lexicon = window.OFFICIAL_QURAN_DICTIONARY || [];
    const q = (query || '').trim().toLowerCase();
    const qAr = normalizeArabicSearch(q);
    const lang = window.currentAppLanguage || 'ku';

    let filtered = lexicon.filter(item => {
      if (activeDictCat !== 'all' && item.cat !== activeDictCat) return false;
      if (!q) return true;
      return item.ar.includes(q) ||
             normalizeArabicSearch(item.ar).includes(qAr && qAr.length >= 2 ? qAr : '__none__') ||
             item.translit.toLowerCase().includes(q) ||
             item.de.toLowerCase().includes(q) ||
             item.en.toLowerCase().includes(q) ||
             item.ku.toLowerCase().includes(q) ||
             (item.root && item.root.includes(q));
    });

    // If user searches a specific word not in core lexicon, dynamically extract from QURAN_ALL_PAGES corpus!
    let corpusMatches = [];
    if (q.length >= 2 && typeof QURAN_ALL_PAGES !== 'undefined') {
      for (let p = 1; p <= 604 && corpusMatches.length < 12; p++) {
        const verses = QURAN_ALL_PAGES[p] || [];
        for (let i = 0; i < verses.length && corpusMatches.length < 12; i++) {
          const v = verses[i];
          if ((v.de && v.de.toLowerCase().includes(q)) || (qAr.length >= 2 && normalizeArabicSearch(v.ar).includes(qAr))) {
            const firstWord = (v.ar || '').split(/\s+/)[0] || v.ar;
            corpusMatches.push({
              ar: firstWord,
              translit: `Sure ${v.surahNum}:${v.num}`,
              root: `Seite ${p}`,
              freq: `${v.surahNum}:${v.num}`,
              de: v.de,
              en: v.de,
              ku: (window.KURDISH_TAFSIR_DATA && window.KURDISH_TAFSIR_DATA[v.surahNum]?.[v.num]) || v.de,
              exAr: v.ar,
              surah: v.surahNum,
              ayah: v.num
            });
          }
        }
      }
    }

    const displayList = filtered.concat(corpusMatches);
    if (displayList.length === 0) {
      container.innerHTML = `<div class="neo3d-card" style="text-align: center; padding: 28px; color: #94a3b8;">Keine Wörter gefunden für "${query}".</div>`;
      return;
    }

    container.innerHTML = displayList.map(w => {
      const meaning = lang === 'ku' ? (w.ku || w.de) : (lang === 'en' ? (w.en || w.de) : w.de);
      return `
        <div class="neo3d-card" style="display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;">
            <div>
              <div style="display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap;">
                <span style="font-family: var(--quran-font); font-size: 1.75rem; color: #fef08a; font-weight: bold;">${w.ar}</span>
                <span style="font-size: 0.85rem; color: #38bdf8; font-weight: 700;">[${w.translit}]</span>
                <span style="font-size: 0.75rem; background: rgba(255,255,255,0.08); color: #cbd5e1; padding: 2px 8px; border-radius: 8px;">Wurzel: ${w.root}</span>
              </div>
              <div style="font-size: 0.94rem; color: #f8fafc; font-weight: 700; margin-top: 6px; line-height: 1.45;">${meaning}</div>
            </div>
            <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 6px; flex-shrink: 0;">
              <span style="background: rgba(16, 185, 129, 0.18); color: #34d399; font-size: 0.75rem; font-weight: 800; padding: 3px 10px; border-radius: 12px; border: 1px solid rgba(16, 185, 129, 0.35);">${w.freq} im Koran</span>
              ${w.surah ? `
                <button onclick="playTajweedExampleAudio(${w.surah}, ${w.ayah || 1})" class="neo3d-pill-btn" style="padding: 4px 10px; font-size: 0.76rem;">
                  <i class="fa-solid fa-volume-high"></i> Audio (${w.surah}:${w.ayah || 1})
                </button>
              ` : ''}
            </div>
          </div>
          ${w.exAr ? `
            <div style="background: rgba(0,0,0,0.28); padding: 10px 14px; border-radius: 10px; border-right: 3px solid var(--gold-primary); display: flex; justify-content: space-between; align-items: center; gap: 10px;">
              <span style="font-size: 0.75rem; color: #94a3b8;">Koran-Beispiel (${w.surah}:${w.ayah}):</span>
              <span style="font-family: var(--quran-font); font-size: 1.3rem; color: var(--gold-light); direction: rtl;">${w.exAr}</span>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
  };

  // ============================================================
  // 13. SPIRITUAL CENTER: SEPARATE DALĀ'IL AL-KHAYRĀT, QASĪDA AL-BURDAH & DUAS (Points 18, 19, 20)
  // No shared top 3-tab bar; guaranteed real audio playback + expanded Bukhari/Muslim & Rabbana Duas
  // ============================================================
  let currentDalailChapterId = 'hizb1';
  let currentBurdaChapterId = 1;
  let spiritualAudioPlaying = false;
  let spiritualActivePassageIdx = -1;
  let spiritualAudioTimer = null;
  let spiritualHtml5Audio = null;
  let currentDuaPageIdx = 0;
  let currentDuaFilterCat = 'quran';
  let currentDuaTasbihCount = 0;

  // Expanded Authentic Prophetic & Quranic Duas (Sahih al-Bukhari, Sahih Muslim & Rabbana)
  const AUTHENTIC_EXPANDED_DUAS = [
    // Morning Adhkar (Sahih al-Bukhari & Muslim)
    {
      category: 'morning',
      sourceAr: 'صحيح البخاري · سيد الاستغفار (صباحاً ومساءً)',
      titleDe: 'Sayyid al-Istighfār (Das höchste Bittgebet um Vergebung)',
      titleEn: 'Sayyid al-Istighfar (The Master Supplication for Forgiveness)',
      titleKu: 'سەیدی ئیستیغفار (گەورەی داوای لێخۆشبوون - بەیانیان و ئێواران)',
      arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَىٰ عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
      translit: "Allāhumma Anta Rabbī lā ilāha illā Anta, khalaqtanī wa anā 'abduka, wa anā 'alā 'ahdika wa wa'dika mastata'tu, a'ūdhu bika min sharri mā sana'tu, abū'u laka bini'matika 'alayya wa abū'u laka bidhanbī faghfir lī, fa-innahū lā yaghfirudh-dhunūba illā Ant.",
      de: 'O Allah, Du bist mein Herr, es gibt keinen Gott außer Dir. Du hast mich erschaffen, und ich bin Dein Diener. Ich halte meinen Bund und mein Versprechen Dir gegenüber, so gut ich kann. Ich suche Zuflucht bei Dir vor dem Übel dessen, was ich getan habe. Ich erkenne Deine Gnade mir gegenüber an und gestehe meine Sünde; so vergib mir, denn niemand vergibt die Sünden außer Dir. (Sahih al-Bukhari 6306)',
      en: 'O Allah, You are my Lord, there is no deity except You. You created me and I am Your servant, and I abide by Your covenant and promise as best I can. I seek refuge in You from the evil of what I have done. I acknowledge Your favor upon me and I confess my sin, so forgive me, for none forgives sins except You. (Sahih al-Bukhari 6306)',
      ku: 'خودایە تۆ پەروەردگاری منیت و هیچ پەرستراوێک نییە بە حەق جگە لە تۆ، تۆ منت دروست کردووە و منیش بەندەی تۆم، و لەسەر پەیمان و بەڵێنەکەی تۆم بەپێی توانام، پەنات پێ دەگرم لە شەڕی ئەوەی ئەنجامم داوە، دان دەنێم بە نیعمەتەکانت بەسەرمەوە و دان دەنێم بە گوناهەکەمدا، دەسا لێم خۆشبە چونکە کەس لە گوناهەکان خۆش نابێت تەنها تۆ نەبێت. (صحیح البخاري ٦٣٠٦)',
      targetCount: 1
    },
    {
      category: 'morning',
      sourceAr: 'صحيح مسلم · أذكار الصباح',
      titleDe: 'Morgen-Gebet des Propheten ﷺ beim Tagesanbruch',
      titleEn: 'Prophetic Morning Supplication at Dawn',
      titleKu: 'نزای بەیانیانی پێغەمبەر ﷺ (أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ)',
      arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَٰذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَٰذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ',
      translit: "Aṣbaḥnā wa aṣbaḥal-mulku lillāh, wal-ḥamdu lillāh, lā ilāha illallāhu waḥdahū lā sharīka lah, lahul-mulku wa lahul-ḥamdu wa Huwa 'alā kulli shay'in Qadīr. Rabbi as'aluka khayra mā fī hādhal-yawmi wa khayra mā ba'dah...",
      de: 'Wir haben den Morgen erreicht, und die gesamte Herrschaft gehört Allah, und alles Lob gebührt Allah. Es gibt keinen Gott außer Allah allein, ohne Partner. Ihm gehört die Herrschaft und das Lob, und Er ist über alle Dinge mächtig. Mein Herr, ich bitte Dich um das Gute dieses Tages und das Gute danach, und suche Zuflucht bei Dir vor dem Übel dieses Tages und dem Übel danach. (Sahih Muslim 2723)',
      en: 'We have reached the morning and at this very time all sovereignty belongs to Allah, and all praise is for Allah. None has the right to be worshipped except Allah alone, without partner. My Lord, I ask You for the good of this day and the good of what follows it. (Sahih Muslim 2723)',
      ku: 'بەیانیمان کردەوە و موڵک و سامانی بوونەوەر هەمووی بۆ خودایە، و سوپاس و ستایش بۆ خودایە، هیچ پەرستراوێک نییە بە حەق جگە لە خودای تاکی بێ هاوەڵ، پەروەردگارم داوای خێری ئەمڕۆ و دوای ئەمڕۆت لێ دەکەم و پەنات پێ دەگرم لە شەڕی ئەمڕۆ و دوای ئەمڕۆ. (صحیح مسلم ٢٧٢٣)',
      targetCount: 1
    },
    {
      category: 'morning',
      sourceAr: 'صحيح البخاري ومسلم · آية الكرسي (حرز الصباح والمساء)',
      titleDe: 'Āyat al-Kursī – Schutz am Morgen, Abend & vor dem Schlaf',
      titleEn: 'Ayat al-Kursi – Protection Morning, Evening & Before Sleep',
      titleKu: 'ئایەتی کورسی – قەڵای پاراستن لە بەیانیان و ئێواران و پێش خەوتن',
      arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
      translit: "Allāhu lā ilāha illā Huwal-Ḥayyul-Qayyūm, lā ta'khudhuhū sinatun wa lā nawm...",
      de: 'Allah – es gibt keinen Gott außer Ihm, dem Lebendigen, dem Beständigen. Ihn überkommt weder Schlummer noch Schlaf... (Sure Al-Baqarah 2:255 · Sahih al-Bukhari 2311)',
      en: 'Allah - there is no deity except Him, the Ever-Living, the Sustainer of all existence... (Surah Al-Baqarah 2:255 · Sahih al-Bukhari 2311)',
      ku: 'خوای گەورە ئەو زاتەیە کە هیچ پەرستراوێک نییە شایستەی پەرستن بێت تەنها ئەو نەبێت، کە هەمیشە زیندووە و بەڕێوەبەری تەواوی دروستکراوەکانییەتی... (سوورەتی بەقەرە ٢:٢٥٥)',
      surah: 2,
      ayah: 255,
      targetCount: 1
    },
    {
      category: 'morning',
      sourceAr: 'سنن أبي داود والترمذي · أذكار الصباح',
      titleDe: 'Bittgebet am Morgen für Leben, Tod und Auferstehung',
      titleEn: 'Morning Supplication: By You We Live and Die',
      titleKu: 'نزای بەیانیان (اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا)',
      arabic: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ',
      translit: 'Allāhumma bika aṣbaḥnā, wa bika amsaynā, wa bika naḥyā, wa bika namūtu, wa ilaykan-nushūr.',
      de: 'O Allah, durch Dich erreichen wir den Morgen, durch Dich erreichen wir den Abend, durch Dich leben wir, durch Dich sterben wir, und zu Dir ist die Auferstehung. (At-Tirmidhi 3391)',
      en: 'O Allah, by You we enter the morning and by You we enter the evening, by You we live and by You we die, and to You is the Final Return. (At-Tirmidhi 3391)',
      ku: 'خودایە بە فەزڵ و میهرەبانی تۆوە بەیانیمان کردەوە و ئێوارە دەکەینەوە، و بە تۆوە دەژین و بە تۆوە دەمرین و زیندووبوونەوەش هەر بۆ لای تۆیە.',
      targetCount: 1
    },
    {
      category: 'morning',
      sourceAr: 'صحيح مسلم · تسبيح الصباح الباكر',
      titleDe: 'Das gewichtige Lobpreisen am Morgen (Juwayriyah-Hadith)',
      titleEn: 'Heavy Words of Praise in the Morning (Hadith of Juwayriyah)',
      titleKu: 'زیکری بەیانیان کە قورسایی عەرشی خودای هەیە (صحيح مسلم)',
      arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ: عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ',
      translit: "SubḥānAllāhi wa biḥamdihī: 'adada khalqih, wa riḍā nafsih, wa zinata 'arshih, wa midāda kalimātih.",
      de: 'Gepriesen sei Allah und alles Lob gebührt Ihm: so viel wie die Zahl Seiner Geschöpfe, so weit wie Sein Wohlgefallen, so schwer wie das Gewicht Seines Throns und so unerschöpflich wie die Tinte Seiner Worte. (3× am Morgen · Sahih Muslim 2726)',
      en: 'Glory and praise be to Allah: as much as the number of His creation, as much as pleases Him, as much as the weight of His Throne, and as much as the ink of His words. (3× in the morning · Sahih Muslim 2726)',
      ku: 'پاکی و بێگەردی و ستایش بۆ خودا: بە ئەندازەی ژمارەی دروستکراوەکانی، و بە ئەندازەی ڕەزامەندی خۆی، و بە قورسایی عەرشەکەی، و بە ئەندازەی مەرەکەبی وشە بێکۆتاییەکانی. (٣ جار لە بەیانیاندا · صحیح مسلم ٢٧٢٦)',
      targetCount: 3
    },
    // Evening & Afternoon Adhkar (Sahih al-Bukhari & Muslim)
    {
      category: 'evening',
      sourceAr: 'صحيح مسلم · أذكار العصر والمساء',
      titleDe: 'Abend-Gebet des Propheten ﷺ am späten Nachmittag & Abend',
      titleEn: 'Prophetic Evening Supplication',
      titleKu: 'نزای عەسر و ئێوارانی پێغەمبەر ﷺ (أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ)',
      arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَٰذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَٰذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا',
      translit: "Amsaynā wa amsal-mulku lillāh, wal-ḥamdu lillāh, lā ilāha illallāhu waḥdahū lā sharīka lah, lahul-mulku wa lahul-ḥamdu wa Huwa 'alā kulli shay'in Qadīr...",
      de: 'Wir haben den Abend erreicht, und die gesamte Herrschaft gehört Allah... Mein Herr, ich bitte Dich um das Gute dieser Nacht und das Gute danach, und suche Zuflucht bei Dir vor dem Übel dieser Nacht und dem Übel danach. (Sahih Muslim 2723)',
      en: 'We have reached the evening and at this very time all sovereignty belongs to Allah... My Lord, I ask You for the good of this night and what follows it, and I seek refuge in You from the evil of this night. (Sahih Muslim 2723)',
      ku: 'ئێوارەمان کردەوە و موڵک و سامانی بوونەوەر هەمووی بۆ خودایە... پەروەردگارم داوای خێری ئەمشەو و دوای ئەمشەوت لێ دەکەم و پەنات پێ دەگرم لە شەڕی ئەمشەو و دوای ئەمشەو. (صحیح مسلم ٢٧٢٣)',
      targetCount: 1
    },
    {
      category: 'evening',
      sourceAr: 'صحيح مسلم · حرز المساء والصباح',
      titleDe: 'Schutzgebet am Abend vor jeglichem Schaden auf Erden',
      titleEn: 'Evening Protection Supplication Against All Harm',
      titleKu: 'نزای پاراستنی ئێواران و بەیانیان لە هەموو بەڵایەک',
      arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ ، أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
      translit: "Bismillāhilladhī lā yaḍurru ma'asmihī shay'un fil-arḍi wa lā fis-samā'i wa Huwas-Samī'ul-'Alīm. A'ūdhu bikalimātillāhit-tāmmāti min sharri mā khalaq.",
      de: 'Im Namen Allahs, mit Dessen Namen nichts auf der Erde und nichts im Himmel zu schaden vermag, und Er ist der Allhörende, der Allwissende. Ich suche Zuflucht bei den vollkommenen Worten Allahs vor dem Übel dessen, was Er erschaffen hat. (3× am Abend & Morgen · Sahih Muslim 2709)',
      en: 'In the Name of Allah, with Whose Name nothing on earth or in heaven can cause harm, and He is the All-Hearing, All-Knowing. I seek refuge in the perfect words of Allah from the evil of what He has created. (3× · Sahih Muslim 2709)',
      ku: 'بە ناوی ئەو خودایەی کە لەگەڵ ناوی ئەودا هیچ شتێک لە زەوی و لە ئاسماندا زیان ناگەیەنێت و ئەو بیسەر و زانایە. پەنا دەگرم بە وشە تەواوەکانی خودا لە شەڕی هەر شتێک کە دروستی کردووە. (٣ جار · صحیح مسلم ٢٧٠٩)',
      targetCount: 3
    },
    {
      category: 'evening',
      sourceAr: 'صحيح البخاري · دعاء الكرب والهم صباحاً ومساءً',
      titleDe: 'Prophetisches Schutzgebet gegen Sorge, Kummer und Schulden',
      titleEn: 'Prophetic Supplication Against Anxiety, Grief and Debt',
      titleKu: 'نزای پێغەمبەر ﷺ بۆ لابردنی خەم و پەژارە و قەرزداری (صحیح البخاري)',
      arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَأَعُوذُ بِكَ مِنَ الْعَجْزِ وَالْكَسَلِ، وَأَعُوذُ بِكَ مِنَ الْجُبْنِ وَالْبُخْلِ، وَأَعُوذُ بِكَ مِنْ غَلَبَةِ الدَّيْنِ وَقَهْرِ الرِّجَالِ',
      translit: "Allāhumma innī a'ūdhu bika minal-hammi wal-ḥazan, wa a'ūdhu bika minal-'ajzi wal-kasal, wa a'ūdhu bika minal-jubni wal-bukhl, wa a'ūdhu bika min ghalabatid-dayni wa qahrir-rijāl.",
      de: 'O Allah, ich suche Zuflucht bei Dir vor Kummer und Traurigkeit, vor Unfähigkeit und Trägheit, vor Feigheit und Geiz, und vor der Last der Schulden und der Unterdrückung durch Menschen. (Sahih al-Bukhari 6369)',
      en: 'O Allah, I seek refuge in You from worry and grief, from incapacity and laziness, from cowardice and miserliness, and from being heavily in debt and from being overpowered by men. (Sahih al-Bukhari 6369)',
      ku: 'خودایە پەنات پێ دەگرم لە خەم و پەژارە، و پەنات پێ دەگرم لە بێتوانایی و تەمبەڵی، و پەنات پێ دەگرم لە ترسنۆکی و ڕەزیلی، و پەنات پێ دەگرم لە زۆربوونی قەرز و زاڵبوونی خەڵکی بەسەرمدا. (صحیح البخاري ٦٣٦٩)',
      targetCount: 1
    },
    // Night & Before-Sleep Adhkar (Sahih al-Bukhari & Muslim)
    {
      category: 'night',
      sourceAr: 'صحيح البخاري ومسلم · الآيتان من آخر سورة البقرة في الليل',
      titleDe: 'Die letzten zwei Verse von Sure Al-Baqarah in der Nacht',
      titleEn: 'The Last Two Verses of Surah Al-Baqarah at Night',
      titleKu: 'دوو ئایەتی کۆتایی سوورەتی بەقەرە لە شەودا (بەسیەتی بۆ هەموو پاراستنێک)',
      arabic: 'آمَنَ الرَّسُولُ بِمَا أُنزِلَ إِلَيْهِ مِن رَّبِّهِ وَالْمُؤْمِنُونَ ۚ كُلٌّ آمَنَ بِاللَّهِ وَمَلَائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ لَا نُفَرِّقُ بَيْنَ أَحَدٍ مِّن رُّسُلِهِ ۚ وَقَالُوا سَمِعْنَا وَأَطَعْنَا ۖ غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ الْمَصِيرُ ۝ لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا ۚ لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا اكْتَسَبَتْ ۗ رَبَّنَا لَا تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا',
      translit: "Āmanar-Rasūlu bimā unzila ilayhi min Rabbihī wal-mu'minūn... Ghufrānaka Rabbanā wa ilaykal-maṣīr...",
      de: 'Der Prophet ﷺ sagte: „Wer in einer Nacht die letzten beiden Verse der Sure Al-Baqarah rezitiert, dem genügen sie (als Schutz).“ (Sahih al-Bukhari 5009 & Sahih Muslim 808)',
      en: 'The Prophet ﷺ said: "Whoever recites the last two verses of Surah Al-Baqarah at night, they will suffice him." (Sahih al-Bukhari 5009 & Sahih Muslim 808)',
      ku: 'پێغەمبەر ﷺ فەرموویەتی: «هەرکەسێک دوو ئایەتەکەی کۆتایی سوورەتی بەقەرە لە شەودا بخوێنێت، بەسیەتی (بۆ پاراستن و پاداشت).» (صحیح البخاري ٥٠٠٩)',
      surah: 2,
      ayah: 285,
      targetCount: 1
    },
    {
      category: 'night',
      sourceAr: 'صحيح البخاري · دعاء النوم (بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا)',
      titleDe: 'Bittgebet beim Niederlegen zum Schlafen',
      titleEn: 'Supplication Upon Lying Down to Sleep',
      titleKu: 'نزای کاتی خەوتن لە صحیح البخاري',
      arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا ، بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي وَبِكَ أَرْفَعُهُ، فَإِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ',
      translit: "Bismika Allāhumma amūtu wa aḥyā. Bismika Rabbī waḍa'tu janbī wa bika arfa'uh, fa-in amsakta nafsī farḥamhā, wa in arsaltahā faḥfaẓhā bimā taḥfaẓu bihī 'ibādakaṣ-ṣāliḥīn.",
      de: 'In Deinem Namen, o Allah, sterbe ich und lebe ich. In Deinem Namen, mein Herr, lege ich meine Seite nieder, und durch Dich erhebe ich sie. Wenn Du meine Seele zurückhältst, so erbarme Dich ihrer; und wenn Du sie zurücksendest, so bewahre sie, wie Du Deine rechtschaffenen Diener bewahrst. (Sahih al-Bukhari 6320)',
      en: 'In Your name, O Allah, I die and I live. In Your name, my Lord, I lie down and in Your name I rise. If You take my soul then have mercy on it, and if You release it then protect it as You protect Your righteous servants. (Sahih al-Bukhari 6320)',
      ku: 'بە ناوی تۆوە خودایە دەمرم (دەخەوم) و زیندوو دەبمەوە. بە ناوی تۆوە پەروەردگارم تەنیشتم خستە سەر جێگا و بە تۆش بەرزی دەکەمەوە، ئەگەر گیانمت گرتەوە ڕەحمی پێ بکە، و ئەگەر ناردتەوە بیپارێزە بەوەی بەندە چاکەکانتی پێ دەپارێزیت. (صحیح البخاري ٦٣٢٠)',
      targetCount: 1
    },
    {
      category: 'night',
      sourceAr: 'صحيح البخاري ومسلم · وصية النبي ﷺ قبل النوم',
      titleDe: 'Das letzte Bittgebet vor dem Einschlafen (Hingabe der Seele)',
      titleEn: 'The Final Supplication Before Sleeping (Al-Bara Hadith)',
      titleKu: 'دوایین نزای پێغەمبەر ﷺ پێش خەوتن (اللَّهُمَّ أَسْلَمْتُ نَفْسِي إِلَيْكَ)',
      arabic: 'اللَّهُمَّ أَسْلَمْتُ نَفْسِي إِلَيْكَ، وَفَوَّضْتُ أَمْرِي إِلَيْكَ، وَوَجَّهْتُ وَجْهِي إِلَيْكَ، وَأَلْجَأْتُ ظَهْرِي إِلَيْكَ، رَغْبَةً وَرَهْبَةً إِلَيْكَ، لَا مَلْجَأَ وَلَا مَنْجَا مِنْكَ إِلَّا إِلَيْكَ، آمَنْتُ بِكِتَابِكَ الَّذِي أَنْزَلْتَ، وَبِنَبِيِّكَ الَّذِي أَرْسَلْتَ',
      translit: "Allāhumma aslamtu nafsī ilayk, wa fawwaḍtu amrī ilayk, wa wajjahtu wajhī ilayk, wa alja'tu ẓahrī ilayk, raghbatan wa rahbatan ilayk, lā malja'a wa lā manjā minka illā ilayk, āmantu bikitābikalladhī anzalt, wa binabiyyikalladhī arsalt.",
      de: 'O Allah, ich habe mich Dir ergeben, meine Angelegenheit Dir anvertraut, mein Antlitz Dir zugewandt und meinen Rücken auf Dich gestützt, aus Hoffnung auf Dich und Ehrfurcht vor Dir. Es gibt keine Zuflucht und keine Rettung vor Dir außer bei Dir. Ich glaube an Dein Buch, das Du herabgesandt hast, und an Deinen Propheten, den Du gesandt hast. (Sahih al-Bukhari 247 & Muslim 2710)',
      en: 'O Allah, I submit my soul to You, entrust my affair to You, turn my face to You, and rely completely on You, out of hope in You and awe of You. There is no refuge nor escape from You except to You. I believe in Your Book which You revealed and in Your Prophet whom You sent. (Sahih al-Bukhari 247)',
      ku: 'خودایە نەفسی خۆمم تەسلیمی تۆ کرد و کاروبارم سپارد بە تۆ و ڕووم کردە تۆ و پشتم بەست بە تۆ، بە ئومێدی پاداشت و لە ترسی سزات، هیچ پەناگە و ڕزگاربوونێک نییە لە تۆ تەنها بۆ لای خۆت نەبێت، ئیمانم هێناوە بە کتێبەکەت کە داتبەزاندووە و بە پێغەمبەرەکەت کە ناردووتە. (صحیح البخاري ٢٤٧)',
      targetCount: 1
    },
    {
      category: 'night',
      sourceAr: 'صحيح البخاري · التعار من الليل (الدعاء عند الاستيقاظ ليلاً)',
      titleDe: 'Bittgebet beim Aufwachen in der Nacht (Garantierte Erhörung)',
      titleEn: 'Supplication When Waking Up at Night (Sahih al-Bukhari)',
      titleKu: 'نزای کاتی خەبەربوونەوە لە شەودا (نزای گیرابوو لە صحیح البخاري)',
      arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ، الْحَمْدُ لِلَّهِ، وَسُبْحَانَ اللَّهِ، وَلَا إِلَٰهَ إِلَّا اللَّهُ، وَاللَّهُ أَكْبَرُ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ، اللَّهُمَّ اغْفِرْ لِي',
      translit: "Lā ilāha illallāhu waḥdahū lā sharīka lah, lahul-mulku wa lahul-ḥamdu wa Huwa 'alā kulli shay'in Qadīr. Al-ḥamdu lillāh, wa subḥānAllāh, wa lā ilāha illallāh, wallāhu akbar, wa lā ḥawla wa lā quwwata illā billāh. Allāhummaghfir lī.",
      de: 'Der Prophet ﷺ sagte: „Wer nachts aufwacht und diese Worte spricht und danach sagt: O Allah, vergib mir! – oder ein Bittgebet spricht –, dem wird erhört.“ (Sahih al-Bukhari 1154)',
      en: 'The Prophet ﷺ said: "Whoever wakes up at night and says these words, then says: O Allah, forgive me, or supplicates, his prayer will be answered." (Sahih al-Bukhari 1154)',
      ku: 'پێغەمبەر ﷺ فەرموویەتی: «هەرکەسێک لە شەودا خەبەری ببێتەوە و ئەم زیکرە بخوێنێت، پاشان بڵێت: اللَّهُمَّ اغْفِرْ لِي یان دوعا بکات، وەڵامی دەدرێتەوە.» (صحیح البخاري ١١٥٤)',
      targetCount: 1
    },
    // Additional Quranic Rabbana Duas with exact Surah & Ayah for Real Qari Audio
    {
      category: 'quran',
      sourceAr: 'سورة البقرة · الآية ٢٠١',
      titleDe: 'Rabbana-Dua für das Gute im Diesseits und Jenseits',
      titleEn: 'Rabbana Dua for Good in This World and the Hereafter',
      titleKu: 'نزای قورئانی بۆ چاکەی دونیا و قیامەت (البقرة ٢٠١)',
      arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
      translit: "Rabbanā ātinā fid-dunyā ḥasanatan wa fil-ākhirati ḥasanatan wa qinā 'adhāban-nār.",
      de: 'Unser Herr, gib uns im Diesseits Gutes und im Jenseits Gutes und bewahre uns vor der Strafe des Feuers! (Das häufigste Bittgebet des Propheten ﷺ nach Sahih al-Bukhari 6389)',
      en: 'Our Lord, give us in this world that which is good and in the Hereafter that which is good, and protect us from the punishment of the Fire. (Sahih al-Bukhari 6389)',
      ku: 'پەروەردگارمان لە دونیادا چاکەمان پێ ببەخشە و لە قیامەتیشدا چاکەمان پێ ببەخشە و بمانپارێزە لە سزای ئاگر. (زۆرترین نزای پێغەمبەر ﷺ بەپێی صحیح البخاري ٦٣٨٩)',
      surah: 2,
      ayah: 201,
      targetCount: 3
    },
    {
      category: 'quran',
      sourceAr: 'سورة آل عمران · الآية ٨',
      titleDe: 'Rabbana-Dua um Standhaftigkeit des Herzens nach der Rechtleitung',
      titleEn: 'Rabbana Dua for Steadfastness of the Heart',
      titleKu: 'نزای قورئانی بۆ جێگیربوونی دڵ لەسەر هیدایەت (آل عمران ٨)',
      arabic: 'رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً ۚ إِنَّكَ أَنتَ الْوَهَّابُ',
      translit: 'Rabbanā lā tuzigh qulūbanā ba‘da idh hadaytanā wa hab lanā min ladunka raḥmah, innaka Antal-Wahhāb.',
      de: 'Unser Herr, lasse unsere Herzen nicht abschweifen, nachdem Du uns rechtgeleitet hast, und schenke uns von Dir aus Barmherzigkeit; gewiss, Du bist der unablässig Gebende. (Sure Āl ʿImrān 3:8)',
      en: 'Our Lord, let not our hearts deviate after You have guided us and grant us from Yourself mercy. Indeed, You are the Bestower. (Surah Ali Imran 3:8)',
      ku: 'پەروەردگارمان دڵەکانمان لامەدە لە حەق دوای ئەوەی هیدایەتت داین، و لە لایەن خۆتەوە ڕەحمەتمان پێ ببەخشە، بەڕاستی تۆ زۆر بەخشندەیت. (ئالی عیمران ٣:٨)',
      surah: 3,
      ayah: 8,
      targetCount: 3
    },
    {
      category: 'quran',
      sourceAr: 'سورة إبراهيم · الآيتان ٤٠–٤١',
      titleDe: 'Rabbana-Dua für das Gebet, die Familie und Vergebung der Eltern',
      titleEn: 'Rabbana Dua for Establishing Prayer and Forgiveness for Parents',
      titleKu: 'نزای قورئانی بۆ نوێژ و نەوەکان و لێخۆشبوونی دایک و باوک (إبراهيم ٤٠-٤١)',
      arabic: 'رَبِّ اجْعَلْنِي مُقِيمَ الصَّلَاةِ وَمِن ذُرِّيَّتِي ۚ رَبَّنَا وَتَقَبَّلْ دُعَاءِ ۝ رَبَّنَا اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ الْحِسَابُ',
      translit: "Rabbij'alnī muqīmaṣ-ṣalāti wa min dhurriyyatī Rabbanā wa taqabbal du'ā'. Rabbanaghfir lī wa liwālidayya wa lil-mu'minīna yawma yaqūmul-ḥisāb.",
      de: 'Mein Herr, mache mich zu jemandem, der das Gebet verrichtet, und auch von meiner Nachkommenschaft! Unser Herr, und nimm mein Bittgebet an! Unser Herr, vergib mir und meinen Eltern und den Gläubigen an dem Tag, da die Abrechnung stattfinden wird. (Sure Ibrahim 14:40-41)',
      en: 'My Lord, make me an establisher of prayer, and from my descendants. Our Lord, and accept my supplication. Our Lord, forgive me and my parents and the believers the Day the account is established. (Surah Ibrahim 14:40-41)',
      ku: 'پەروەردگارم من و نەوەکانیشم بگێڕە لەو کەسانەی نوێژ بەردەوام ئەنجام دەدەن، پەروەردگارمان نزام لێ وەربگرە، پەروەردگارمان لە خۆم و دایک و باوکم و باوەڕداران خۆشبە لە ڕۆژی لێپرسینەوەدا. (ئیبراهیم ١٤:٤٠-٤١)',
      surah: 14,
      ayah: 40,
      targetCount: 3
    },
    {
      category: 'quran',
      sourceAr: 'سورة الفرقان · الآية ٧٤',
      titleDe: 'Rabbana-Dua für Freude an Ehepartnern und Kindern',
      titleEn: 'Rabbana Dua for Righteous Spouses and Offspring',
      titleKu: 'نزای قورئانی بۆ هاوسەر و منداڵی چاک و ڕۆشنایی چاو (الفرقان ٧٤)',
      arabic: 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا',
      translit: "Rabbanā hab lanā min azwājinā wa dhurriyyātinā qurrata a'yunin waj'alnā lil-muttaqīna imāmā.",
      de: 'Unser Herr, schenke uns an unseren Gattinnen und unserer Nachkommenschaft Grund zur Augenfreude und mache uns für die Gottesfürchtigen zu einem Vorbild! (Sure Al-Furqan 25:74)',
      en: 'Our Lord, grant us from among our wives and offspring comfort to our eyes and make us an example for the righteous. (Surah Al-Furqan 25:74)',
      ku: 'پەروەردگارمان لە هاوسەران و نەوەکانمان فێنکی و ڕۆشنایی چاومان پێ ببەخشە و بمانگێڕە بە پێشەوای پارێزکاران. (فورقان ٢٥:٧٤)',
      surah: 25,
      ayah: 74,
      targetCount: 3
    },
    {
      category: 'quran',
      sourceAr: 'سورة الحشر · الآية ١٠',
      titleDe: 'Rabbana-Dua um Vergebung und ein reines Herz ohne Groll',
      titleEn: 'Rabbana Dua for Forgiveness and a Pure Heart',
      titleKu: 'نزای قورئانی بۆ سافی دڵ و لێخۆشبوونی باوەڕداران (الحشر ١٠)',
      arabic: 'رَبَّنَا اغْفِرْ لَنَا وَلِإِخْوَانِنَا الَّذِينَ سَبَقُونَا بِالْإِيمَانِ وَلَا تَجْعَلْ فِي قُلُوبِنَا غِلًّا لِّلَّذِينَ آمَنُوا رَبَّنَا إِنَّكَ رَءُوفٌ رَّحِيمٌ',
      translit: "Rabbanaghfir lanā wa li-ikhwāninalladhīna sabaqūnā bil-īmāni wa lā taj'al fī qulūbinā ghillan lilladhīna āmanū Rabbanā innaka Ra'ūfur-Raḥīm.",
      de: 'Unser Herr, vergib uns und unseren Brüdern, die uns im Glauben vorausgegangen sind, und lasse in unseren Herzen keinen Groll gegen diejenigen sein, die glauben! Unser Herr, gewiss, Du bist Allgütig und Barmherzig. (Sure Al-Haschr 59:10)',
      en: 'Our Lord, forgive us and our brothers who preceded us in faith and put not in our hearts any resentment toward those who have believed. Our Lord, indeed You are Kind and Merciful. (Surah Al-Hashr 59:10)',
      ku: 'پەروەردگارمان لە ئێمە و لەو خوشک و برایانەمان خۆشبە کە پێش ئێمە ئیمانیان هێناوە، و لە دڵەکانماندا هیچ ڕق و کینەیەک مەخەرە بەرامبەر ئەوانەی باوەڕیان هێناوە، بەڕاستی تۆ زۆر دڵسۆز و میهرەبانیت. (حەشر ٥٩:١٠)',
      surah: 59,
      ayah: 10,
      targetCount: 3
    }
  ];

  function getMergedDuasCollection() {
    if (typeof window !== 'undefined' && window.AUTHENTIC_DUAS_DATA) {
      const d = window.AUTHENTIC_DUAS_DATA;
      return [
        ...(d.morning || []),
        ...(d.evening || []),
        ...(d.quran || []),
        ...(d.night || []),
        ...(d.tasbih || [])
      ];
    }
    const base = (typeof DHIKR_COLLECTION !== 'undefined' && Array.isArray(DHIKR_COLLECTION)) ? DHIKR_COLLECTION : [];
    // Parse Surah:Ayah from base items like "Sure 2:201" or "(2:286)" so Quranic Rabbana Duas play real Qari MP3!
    const enrichedBase = base.map(item => {
      const copy = Object.assign({}, item);
      if (!copy.surah) {
        const str = `${copy.sourceAr || ''} ${copy.titleDe || ''} ${copy.titleEn || ''}`;
        const m = str.match(/(\d{1,3})\s*[:：]\s*(\d{1,3})/);
        if (m) {
          copy.surah = parseInt(m[1], 10);
          copy.ayah = parseInt(m[2], 10);
        }
      }
      return copy;
    });
    return AUTHENTIC_EXPANDED_DUAS.concat(enrichedBase);
  }

  function stopSpiritualAudio() {
    spiritualAudioPlaying = false;
    spiritualActivePassageIdx = -1;
    if (spiritualAudioTimer) {
      clearTimeout(spiritualAudioTimer);
      spiritualAudioTimer = null;
    }
    if (spiritualHtml5Audio) {
      try {
        spiritualHtml5Audio.pause();
        spiritualHtml5Audio.currentTime = 0;
      } catch (e) {}
      spiritualHtml5Audio = null;
    }
    if (window.speechSynthesis) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }
    const playBtn = document.getElementById('spiritualMainPlayBtn');
    if (playBtn) {
      playBtn.innerHTML = '<i class="fa-solid fa-play"></i> Rezitation abspielen &amp; Mitlesen';
    }
    document.querySelectorAll('.spiritual-passage-card').forEach(el => {
      el.classList.remove('active-playing');
    });
  }
  window.stopSpiritualAudio = stopSpiritualAudio;

  // Dual-Engine Guaranteed Audio Player for Dalail, Burdah & Duas (Works reliably on Android WebView + Desktop!)
  function playGuaranteedArabicAudio(options) {
    const { arabicText, surah, ayah, directAudioUrl, onlineAudioUrl, fallbackSalawat, onEnded } = options;
    if (spiritualHtml5Audio) {
      try { spiritualHtml5Audio.pause(); } catch (e) {}
      spiritualHtml5Audio = null;
    }
    if (window.speechSynthesis) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }

    const qari = (window.state && window.state.qari) || 'Alafasy_128kbps';
    const candidateUrls = [];

    // 0. Priority: Direct offline local MP3 audio if available
    if (directAudioUrl) {
      candidateUrls.push(directAudioUrl);
    }
    if (onlineAudioUrl) {
      candidateUrls.push(onlineAudioUrl);
    }

    // 1. If exact Quranic Surah & Ayah exist, play authentic Qari MP3 first!
    if (surah && ayah) {
      const sStr = String(surah).padStart(3, '0');
      const aStr = String(ayah).padStart(3, '0');
      candidateUrls.push(window.getAyahAudioUrl(surah, ayah, qari));
      candidateUrls.push(`https://everyayah.com/data/Alafasy_128kbps/${sStr}${aStr}.mp3`);
    }

    // 2. Online Arabic TTS MP3 stream (plays through standard HTML5 <audio> on Android WebView even without local TTS engine!)
    if (arabicText) {
      const shortText = arabicText.replace(/[۞۝﴿﴾]/g, ' ').trim().slice(0, 185);
      candidateUrls.push(`https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=ar&q=${encodeURIComponent(shortText)}`);
    }

    // 3. Authentic Quranic Salawat / Dhikr MP3 fallback (Surah Al-Ahzab 33:56 Salawat by Mishary Alafasy) so Dalail/Burdah ALWAYS produces real recitation audio!
    if (fallbackSalawat) {
      candidateUrls.push('https://everyayah.com/data/Alafasy_128kbps/033056.mp3');
    } else {
      candidateUrls.push('https://everyayah.com/data/Alafasy_128kbps/001001.mp3');
    }

    let urlIdx = 0;

    function tryNextHtml5Url() {
      if (urlIdx >= candidateUrls.length) {
        trySpeechSynthesisOrChime();
        return;
      }
      const url = candidateUrls[urlIdx++];
      const aud = new Audio(url);
      spiritualHtml5Audio = aud;

      let finished = false;
      aud.onended = function () {
        if (finished) return;
        finished = true;
        if (typeof onEnded === 'function') onEnded();
      };
      aud.onerror = function () {
        if (finished) return;
        finished = true;
        tryNextHtml5Url();
      };
      const p = aud.play();
      if (p !== undefined) {
        p.catch(() => {
          if (finished) return;
          finished = true;
          tryNextHtml5Url();
        });
      }
    }

    function trySpeechSynthesisOrChime() {
      if (window.speechSynthesis && arabicText) {
        try {
          const utter = new SpeechSynthesisUtterance(arabicText);
          utter.lang = 'ar-SA';
          utter.rate = 0.88;
          let synthStarted = false;
          utter.onstart = function () { synthStarted = true; };
          utter.onend = function () {
            if (typeof onEnded === 'function') onEnded();
          };
          utter.onerror = function () {
            playOfflineSpiritualChime(onEnded);
          };
          window.speechSynthesis.speak(utter);
          setTimeout(() => {
            if (!synthStarted) {
              try { window.speechSynthesis.cancel(); } catch (e) {}
              playOfflineSpiritualChime(onEnded);
            }
          }, 900);
          return;
        } catch (e) {}
      }
      playOfflineSpiritualChime(onEnded);
    }

    function playOfflineSpiritualChime(cb) {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const notes = [440, 554.37, 659.25];
          notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.18);
            gain.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.18);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.18 + 0.45);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime + i * 0.18);
            osc.stop(ctx.currentTime + i * 0.18 + 0.45);
          });
        }
      } catch (e) {}
      spiritualAudioTimer = setTimeout(() => {
        if (typeof cb === 'function') cb();
      }, 3600);
    }

    tryNextHtml5Url();
  }

  window.openSpiritualMode = function (mode) {
    stopSpiritualAudio();
    window.activeSpiritualSubView = mode;
    updateSpiritualSectionTopHeader(mode);
    renderSpiritualCenter();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  function updateSpiritualSectionTopHeader(mode) {
    const titleEl = document.getElementById('spiritualSectionMainTitle');
    const subEl = document.getElementById('spiritualSectionSubtitle');
    const iconEl = document.getElementById('spiritualSectionHeaderIcon');
    const m = mode || window.activeSpiritualSubView || 'dalail_list';

    if (m.startsWith('dalail')) {
      if (titleEl) titleEl.textContent = "Dalā\'il al-Khayrāt (دلائل الخيرات)";
      if (subEl) subEl.textContent = 'Imam al-Dschazūlī · Eröffnung, 201 Namen & die 8 Tages-Ahzāb mit Audio';
      if (iconEl) iconEl.className = 'fa-solid fa-book-quran';
    } else if (m.startsWith('burda')) {
      if (titleEl) titleEl.textContent = 'Qasīda al-Burdah (قصيدة البردة المباركة)';
      if (subEl) subEl.textContent = 'Imam al-Būṣīrī · Alle 10 Kapitel (فصول البردة العشرة) mit Refrain & Audio';
      if (iconEl) iconEl.className = 'fa-solid fa-scroll';
    } else {
      if (titleEl) titleEl.textContent = 'Bittgebete & Adhkār (الأدعية والأذكار)';
      if (subEl) subEl.textContent = 'Koranische Rabbana-Duas & Sahih al-Bukhari / Muslim (Morgen, Abend & Nacht)';
      if (iconEl) iconEl.className = 'fa-solid fa-hands-praying';
    }
  }

  // ============================================================
  // DALAIL AL-KHAYRAT SETTINGS & REAL-TIME AUDIO SYNCHRONIZATION
  // ============================================================
  const dalailSettings = {
    showEnglish: true,
    showFarsi: true,
    fontStyle: 'uthmani', // 'uthmani' | 'indopak'
    arabicSize: 1.6,
    transSize: 0.95
  };

  function loadDalailSettings() {
    try {
      const saved = JSON.parse(localStorage.getItem('dalail_settings_v4') || 'null');
      if (saved) Object.assign(dalailSettings, saved);
    } catch (e) {}
  }
  loadDalailSettings();

  function saveDalailSettings() {
    try {
      localStorage.setItem('dalail_settings_v4', JSON.stringify(dalailSettings));
    } catch (e) {}
  }

  window.openDalailSettingsModal = function () {
    const modal = document.getElementById('dalailSettingsModal');
    if (!modal) return;
    const tgEn = document.getElementById('dalailToggleEnglish');
    const tgFa = document.getElementById('dalailToggleFarsi');
    const radUth = document.getElementById('dalailRadioUthmani');
    const radIndo = document.getElementById('dalailRadioIndoPak');
    if (tgEn) tgEn.checked = !!dalailSettings.showEnglish;
    if (tgFa) tgFa.checked = !!dalailSettings.showFarsi;
    if (dalailSettings.fontStyle === 'indopak') {
      if (radIndo) radIndo.checked = true;
    } else {
      if (radUth) radUth.checked = true;
    }
    modal.style.display = 'flex';
  };

  window.closeDalailSettingsModal = function () {
    const modal = document.getElementById('dalailSettingsModal');
    if (modal) modal.style.display = 'none';
  };

  window.onDalailSettingChange = function () {
    const tgEn = document.getElementById('dalailToggleEnglish');
    const tgFa = document.getElementById('dalailToggleFarsi');
    dalailSettings.showEnglish = tgEn ? tgEn.checked : true;
    dalailSettings.showFarsi = tgFa ? tgFa.checked : true;
    saveDalailSettings();
    applyDalailDisplaySettings();
  };

  window.onDalailFontChange = function (fontStyle) {
    dalailSettings.fontStyle = fontStyle;
    saveDalailSettings();
    applyDalailDisplaySettings();
  };

  window.adjustDalailFontSize = function (type, delta) {
    if (type === 'arabic') {
      dalailSettings.arabicSize = Math.max(1.1, Math.min(2.8, parseFloat((dalailSettings.arabicSize + delta).toFixed(2))));
    } else {
      dalailSettings.transSize = Math.max(0.75, Math.min(1.6, parseFloat((dalailSettings.transSize + delta).toFixed(2))));
    }
    saveDalailSettings();
    applyDalailDisplaySettings();
  };

  function applyDalailDisplaySettings() {
    document.querySelectorAll('.dalail-trans-en').forEach(el => {
      el.style.display = dalailSettings.showEnglish ? 'block' : 'none';
      el.style.fontSize = `${dalailSettings.transSize}rem`;
    });
    document.querySelectorAll('.dalail-trans-fa').forEach(el => {
      el.style.display = dalailSettings.showFarsi ? 'block' : 'none';
      el.style.fontSize = `${dalailSettings.transSize}rem`;
    });
    document.querySelectorAll('.dalail-arabic').forEach(el => {
      el.classList.toggle('dalail-font-uthmani', dalailSettings.fontStyle === 'uthmani');
      el.classList.toggle('dalail-font-indopak', dalailSettings.fontStyle === 'indopak');
      el.style.fontSize = `${dalailSettings.arabicSize}rem`;
    });
  }

  let dalailAudioPlayer = null;
  let dalailActivePassageIdx = -1;

  window.stopDalailAudio = function () {
    if (dalailAudioPlayer) {
      try { dalailAudioPlayer.pause(); } catch (e) {}
      dalailAudioPlayer = null;
    }
    dalailActivePassageIdx = -1;
    document.querySelectorAll('.spiritual-passage-card.speaking').forEach(el => el.classList.remove('speaking'));
    const playBtn = document.getElementById('spiritualMainPlayBtn');
    const isKu = (window.quran_app_language === 'ku');
    const isFa = (window.quran_app_language === 'fa');
    if (playBtn) {
      playBtn.innerHTML = `<i class="fa-solid fa-play"></i> <span>${isKu ? 'خوێندنەوەی دەنگ دەستپێبکە' : (isFa ? 'پخش صوتی و همراهی متن' : 'Rezitation abspielen & Mitlesen')}</span>`;
      playBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
    }
  };

  window.toggleDalailChapterAudio = function () {
    if (dalailAudioPlayer && !dalailAudioPlayer.paused) {
      window.stopDalailAudio();
      return;
    }
    window.playDalailFromTime(0, 0);
  };

  window.playDalailFromTime = function (seconds, passageIdx) {
    const chapters = window.DALAIL_CHAPTERS || [];
    const ch = chapters.find(c => c.id === currentDalailChapterId) || chapters[0];
    if (!ch) return;

    const isKu = (window.quran_app_language === 'ku');
    const isFa = (window.quran_app_language === 'fa');

    if (!dalailAudioPlayer) {
      const srcUrl = ch.audioUrl || ch.audioOnlineUrl || '';
      if (!srcUrl) {
        if (typeof showToast === 'function') {
          showToast(isKu ? 'ئەم بەشە دەنگی تایبەتی نییە.' : (isFa ? 'این بخش فایل صوتی ندارد.' : 'Dieser Abschnitt hat keine Audiodatei.'));
        }
        return;
      }
      dalailAudioPlayer = new Audio(srcUrl);
      dalailAudioPlayer.onerror = function () {
        if (ch.audioOnlineUrl && dalailAudioPlayer.src !== ch.audioOnlineUrl) {
          dalailAudioPlayer.src = ch.audioOnlineUrl;
          dalailAudioPlayer.currentTime = seconds || 0;
          dalailAudioPlayer.play().catch(() => {});
        }
      };

      dalailAudioPlayer.ontimeupdate = function () {
        if (!ch.dialogueTimings || ch.dialogueTimings.length === 0) return;
        const curTime = dalailAudioPlayer.currentTime;
        let activeIdx = -1;
        for (let i = ch.dialogueTimings.length - 1; i >= 0; i--) {
          if (curTime >= ch.dialogueTimings[i] - 0.25) {
            activeIdx = i;
            break;
          }
        }
        if (activeIdx !== -1 && activeIdx !== dalailActivePassageIdx) {
          dalailActivePassageIdx = activeIdx;
          document.querySelectorAll('.spiritual-passage-card.speaking').forEach(el => el.classList.remove('speaking'));
          const card = document.getElementById(`dalailPassage_${activeIdx}`);
          if (card) {
            card.classList.add('speaking');
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      };

      dalailAudioPlayer.onended = function () {
        window.stopDalailAudio();
        if (typeof showToast === 'function') {
          showToast(isKu ? '🎉 خوێندنەوەی ئەم بەشە تەواو بوو' : (isFa ? '🎉 قرائت این بخش به پایان رسید' : '🎉 Rezitation dieses Abschnitts beendet!'));
        }
      };
    }

    if (typeof seconds === 'number') {
      try { dalailAudioPlayer.currentTime = seconds; } catch (e) {}
    }

    dalailAudioPlayer.play().then(() => {
      const playBtn = document.getElementById('spiritualMainPlayBtn');
      if (playBtn) {
        playBtn.innerHTML = `<i class="fa-solid fa-pause"></i> <span>${isKu ? 'ڕاگرتنی خوێندنەوە' : (isFa ? 'توقف پخش صوت' : 'Pause')}</span>`;
        playBtn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
      }
      if (typeof passageIdx === 'number') {
        dalailActivePassageIdx = passageIdx;
        document.querySelectorAll('.spiritual-passage-card.speaking').forEach(el => el.classList.remove('speaking'));
        const card = document.getElementById(`dalailPassage_${passageIdx}`);
        if (card) {
          card.classList.add('speaking');
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }).catch(err => {
      console.warn('Dalail audio play failed:', err);
    });
  };

  // ============================================================
  // QASĪDA AL-BURDAH SETTINGS & REAL-TIME AUDIO SYNCHRONIZATION
  // Modeled 100% after qasidaburda.com
  // ============================================================
  const burdaSettings = {
    showEnglish: true,
    fontStyle: 'uthmani', // 'uthmani' | 'indopak'
    arabicSize: 1.6,
    transSize: 0.95
  };

  function loadBurdaSettings() {
    try {
      const saved = JSON.parse(localStorage.getItem('burda_settings_v4') || 'null');
      if (saved) Object.assign(burdaSettings, saved);
    } catch (e) {}
  }
  loadBurdaSettings();

  function saveBurdaSettings() {
    try {
      localStorage.setItem('burda_settings_v4', JSON.stringify(burdaSettings));
    } catch (e) {}
  }

  window.openBurdaSettingsModal = function () {
    const modal = document.getElementById('burdaSettingsModal');
    if (!modal) return;
    const tgEn = document.getElementById('burdaToggleEnglish');
    const radUth = document.getElementById('burdaRadioUthmani');
    const radIndo = document.getElementById('burdaRadioIndoPak');
    if (tgEn) tgEn.checked = !!burdaSettings.showEnglish;
    if (burdaSettings.fontStyle === 'indopak') {
      if (radIndo) radIndo.checked = true;
    } else {
      if (radUth) radUth.checked = true;
    }
    modal.style.display = 'flex';
  };

  window.closeBurdaSettingsModal = function () {
    const modal = document.getElementById('burdaSettingsModal');
    if (modal) modal.style.display = 'none';
  };

  window.onBurdaSettingChange = function () {
    const tgEn = document.getElementById('burdaToggleEnglish');
    burdaSettings.showEnglish = tgEn ? tgEn.checked : true;
    saveBurdaSettings();
    applyBurdaDisplaySettings();
  };

  window.onBurdaFontChange = function (fontStyle) {
    burdaSettings.fontStyle = fontStyle;
    saveBurdaSettings();
    applyBurdaDisplaySettings();
  };

  window.adjustBurdaFontSize = function (type, delta) {
    if (type === 'arabic') {
      burdaSettings.arabicSize = Math.max(1.1, Math.min(2.8, parseFloat((burdaSettings.arabicSize + delta).toFixed(2))));
    } else {
      burdaSettings.transSize = Math.max(0.75, Math.min(1.6, parseFloat((burdaSettings.transSize + delta).toFixed(2))));
    }
    saveBurdaSettings();
    applyBurdaDisplaySettings();
  };

  function applyBurdaDisplaySettings() {
    document.querySelectorAll('.burda-trans-en').forEach(el => {
      el.style.display = burdaSettings.showEnglish ? 'block' : 'none';
      el.style.fontSize = `${burdaSettings.transSize}rem`;
    });
    document.querySelectorAll('.burda-arabic').forEach(el => {
      el.classList.toggle('dalail-font-uthmani', burdaSettings.fontStyle === 'uthmani');
      el.classList.toggle('dalail-font-indopak', burdaSettings.fontStyle === 'indopak');
      el.style.fontSize = `${burdaSettings.arabicSize}rem`;
    });
    document.querySelectorAll('.burda-chorus-arabic').forEach(el => {
      el.classList.toggle('dalail-font-uthmani', burdaSettings.fontStyle === 'uthmani');
      el.classList.toggle('dalail-font-indopak', burdaSettings.fontStyle === 'indopak');
    });
  }

  let burdaAudioPlayer = null;
  let burdaActiveCoupletIdx = -1;

  window.stopBurdaAudio = function () {
    if (burdaAudioPlayer) {
      try { burdaAudioPlayer.pause(); } catch (e) {}
      burdaAudioPlayer = null;
    }
    burdaActiveCoupletIdx = -1;
    document.querySelectorAll('.burda-couplet-card.speaking, .burda-chorus-card.speaking').forEach(el => el.classList.remove('speaking'));
    const playBtn = document.getElementById('burdaMainPlayBtn');
    const isKu = (window.quran_app_language === 'ku');
    const isFa = (window.quran_app_language === 'fa');
    if (playBtn) {
      playBtn.innerHTML = `<i class="fa-solid fa-play"></i> <span>${isKu ? 'خوێندنەوەی دەنگ دەستپێبکە' : (isFa ? 'پخش صوتی و همراهی متن' : 'Kapitel abspielen & Mitlesen')}</span>`;
      playBtn.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
      playBtn.style.color = '#000';
    }
  };

  window.toggleBurdaChapterAudio = function () {
    if (burdaAudioPlayer && !burdaAudioPlayer.paused) {
      window.stopBurdaAudio();
      return;
    }
    window.playBurdaFromTime(0, 0);
  };

  window.playBurdaFromTime = function (seconds, coupletIdx) {
    const chapters = window.BURDA_CHAPTERS || [];
    const ch = chapters.find(c => c.id === currentBurdaChapterId) || chapters[0];
    if (!ch) return;

    const isKu = (window.quran_app_language === 'ku');
    const isFa = (window.quran_app_language === 'fa');

    if (!burdaAudioPlayer) {
      const srcUrl = ch.audioUrl || ch.audioOnlineUrl || '';
      burdaAudioPlayer = new Audio(srcUrl);
      burdaAudioPlayer.onerror = function () {
        if (ch.audioOnlineUrl && burdaAudioPlayer.src !== ch.audioOnlineUrl) {
          burdaAudioPlayer.src = ch.audioOnlineUrl;
          burdaAudioPlayer.currentTime = seconds || 0;
          burdaAudioPlayer.play().catch(() => {});
        }
      };

      burdaAudioPlayer.ontimeupdate = function () {
        const curTime = burdaAudioPlayer.currentTime;
        const couplets = ch.couplets || [];
        let activeIdx = -1;
        for (let i = couplets.length - 1; i >= 0; i--) {
          if (curTime >= (couplets[i].time || 0) - 0.3) {
            activeIdx = i;
            break;
          }
        }
        if (activeIdx !== -1 && activeIdx !== burdaActiveCoupletIdx) {
          burdaActiveCoupletIdx = activeIdx;
          document.querySelectorAll('.burda-couplet-card.speaking, .burda-chorus-card.speaking').forEach(el => el.classList.remove('speaking'));
          const card = document.getElementById(`burdaCouplet_${activeIdx}`);
          if (card) {
            card.classList.add('speaking');
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        } else if (activeIdx === -1 && curTime < (couplets[0]?.time || 10)) {
          const chorusCard = document.getElementById('burdaChorusBox');
          if (chorusCard && !chorusCard.classList.contains('speaking')) {
            document.querySelectorAll('.burda-couplet-card.speaking').forEach(el => el.classList.remove('speaking'));
            chorusCard.classList.add('speaking');
          }
        }
      };

      burdaAudioPlayer.onended = function () {
        window.stopBurdaAudio();
        if (typeof showToast === 'function') {
          showToast(isKu ? '🎉 خوێندنەوەی ئەم فەسڵە تەواو بوو' : (isFa ? '🎉 قرائت این فصل به پایان رسید' : '🎉 Kapitel-Rezitation beendet!'));
        }
      };
    }

    if (typeof seconds === 'number') {
      try { burdaAudioPlayer.currentTime = seconds; } catch (e) {}
    }

    burdaAudioPlayer.play().then(() => {
      const playBtn = document.getElementById('burdaMainPlayBtn');
      if (playBtn) {
        playBtn.innerHTML = `<i class="fa-solid fa-pause"></i> <span>${isKu ? 'ڕاگرتنی خوێندنەوە' : (isFa ? 'توقف پخش صوت' : 'Pause')}</span>`;
        playBtn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
        playBtn.style.color = '#fff';
      }
      if (typeof coupletIdx === 'number') {
        burdaActiveCoupletIdx = coupletIdx;
        document.querySelectorAll('.burda-couplet-card.speaking, .burda-chorus-card.speaking').forEach(el => el.classList.remove('speaking'));
        const card = document.getElementById(`burdaCouplet_${coupletIdx}`);
        if (card) {
          card.classList.add('speaking');
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }).catch(err => {
      console.warn('Burda audio play failed:', err);
    });
  };

  window.openDalailChapter = function (chId) {
    stopSpiritualAudio();
    window.stopDalailAudio();
    window.stopBurdaAudio();
    currentDalailChapterId = chId;
    window.activeSpiritualSubView = 'dalail_reader';
    updateSpiritualSectionTopHeader('dalail_reader');
    renderSpiritualCenter();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  window.openBurdaChapter = function (chId) {
    stopSpiritualAudio();
    window.stopDalailAudio();
    window.stopBurdaAudio();
    currentBurdaChapterId = chId;
    window.activeSpiritualSubView = 'burda_reader';
    updateSpiritualSectionTopHeader('burda_reader');
    renderSpiritualCenter();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  window.toggleSpiritualChapterAudio = function (type) {
    if (type === 'dalail') {
      window.toggleDalailChapterAudio();
      return;
    }
    if (spiritualAudioPlaying) {
      stopSpiritualAudio();
      return;
    }
    spiritualAudioPlaying = true;
    const playBtn = document.getElementById('spiritualMainPlayBtn');
    if (playBtn) {
      playBtn.innerHTML = '<i class="fa-solid fa-stop"></i> Wiedergabe stoppen';
    }
    playSpiritualPassageAtIndex(type, 0);
  };

  window.playSpiritualPassageAtIndex = function (type, idx) {
    if (type === 'dalail') {
      window.playDalailFromTime(0, idx);
      return;
    }
    let items = [];
    if (type === 'burda') {
      const ch = (window.BURDA_CHAPTERS || []).find(c => c.id === currentBurdaChapterId) || window.BURDA_CHAPTERS[0];
      items = (ch.couplets || []).map(c => ({ ar: `${c.ar1} ، ${c.ar2}` }));
    }

    if (idx >= items.length) {
      stopSpiritualAudio();
      if (typeof showToast === 'function') showToast('🎉 Kapitel-Rezitation abgeschlossen!');
      return;
    }

    spiritualAudioPlaying = true;
    spiritualActivePassageIdx = idx;
    const playBtn = document.getElementById('spiritualMainPlayBtn');
    if (playBtn) {
      playBtn.innerHTML = `<i class="fa-solid fa-stop"></i> Spielt Abschnitt ${idx + 1} / ${items.length} (Stoppen)`;
    }

    document.querySelectorAll('.spiritual-passage-card').forEach((el, i) => {
      el.classList.toggle('active-playing', i === idx);
      if (i === idx) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });

    const curItem = items[idx];
    if (typeof showToast === 'function') {
      showToast(`🔊 Rezitation Abschnitt ${idx + 1} / ${items.length}...`);
    }

    playGuaranteedArabicAudio({
      arabicText: curItem.ar,
      surah: curItem.surah || null,
      ayah: curItem.ayah || null,
      fallbackSalawat: true,
      onEnded: function () {
        if (spiritualAudioPlaying) {
          spiritualAudioTimer = setTimeout(() => {
            if (spiritualAudioPlaying) {
              playSpiritualPassageAtIndex(type, idx + 1);
            }
          }, 650);
        }
      }
    });
  };

  function renderSpiritualCenter() {
    const container = document.getElementById('spiritualCenterMainContainer');
    if (!container) return;

    const lang = window.quran_app_language || window.currentAppLanguage || 'ku';
    const isKu = (lang === 'ku');
    const isFa = (lang === 'fa');
    let mode = window.activeSpiritualSubView || 'dalail_list';
    if (mode === 'hub') mode = 'dalail_list';
    updateSpiritualSectionTopHeader(mode);

    // 1. DALĀ'IL AL-KHAYRĀT CHAPTER LIST (dalailalkhayrat.com 13-Part Exact Division & Localized Header)
    if (mode === 'dalail_list') {
      const chapters = window.DALAIL_CHAPTERS || [];
      const subTitle = isKu
        ? 'بەشێک یان حیزبێکی ڕۆژانە هەڵبژێرە بۆ کردنەوەی بە دەنگی دەلائلولخەیرات:'
        : (isFa
          ? 'یک حزب روزانه یا بخش را برای باز کردن همراه با صوت انتخاب کنید:'
          : 'Wähle einen Tages-Hizb oder Abschnitt aus, um ihn mit Audio-Begleitung zu öffnen:');
      const headerLbl = isKu
        ? 'دەلائلولخەیرات · ئیمام موحەممەد کوڕی سولەیمانی جەزوولی'
        : (isFa
          ? 'دلائل الخیرات · امام محمد بن سلیمان الجزولی'
          : "DALĀ'IL AL-KHAYRĀT · IMAM MUHAMMAD IBN SULAYMĀN AL-DSCHAZŪLĪ");

      container.innerHTML = `
        <div class="neo3d-card" style="margin-bottom: 14px; background: linear-gradient(135deg, rgba(16, 185, 129, 0.16), rgba(6, 78, 59, 0.35)); border: 1.5px solid rgba(16, 185, 129, 0.4);">
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
            <div style="flex: 1; min-width: 200px;">
              <div style="font-size: 0.75rem; font-weight: 800; color: #34d399; text-transform: uppercase;">${headerLbl}</div>
              <h3 style="margin: 4px 0 2px; font-size: 1.15rem; font-weight: 900; color: #fff; font-family: var(--quran-font);">دلائل الخيرات وشوارق الأنوار في ذكر الصلاة على النبي المختار ﷺ</h3>
              <div style="font-size: 0.82rem; color: #a7f3d0;">${subTitle}</div>
            </div>
            <button onclick="openDalailSettingsModal()" class="neo3d-pill-btn" style="background: rgba(255,255,255,0.08); padding: 8px 14px; font-weight: 800; font-size: 0.85rem; border-color: rgba(255,255,255,0.18);">
              <i class="fa-solid fa-gear" style="color: #34d399;"></i> <span>Settings</span>
            </button>
          </div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px;">
          ${chapters.map((ch) => {
            const title = isKu ? ch.titleKu : (isFa ? ch.titleFa : (lang === 'en' ? ch.titleEn : ch.titleDe));
            const day = isKu ? ch.dayKu : (isFa ? ch.dayFa : (lang === 'en' ? ch.dayEn : ch.dayDe));
            const hasAudio = !!(ch.audioUrl || ch.audioOnlineUrl) && ch.id !== 'opening' && ch.id !== 'intention';
            return `
              <div class="neo3d-card" onclick="openDalailChapter('${ch.id}')" style="cursor: pointer; display: flex; flex-direction: column; justify-content: space-between; gap: 10px; border-top: 3px solid #10b981; transition: transform 0.2s, box-shadow 0.2s;">
                <div>
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="background: rgba(16,185,129,0.2); color: #6ee7b7; font-weight: 800; font-size: 0.75rem; padding: 3px 10px; border-radius: 16px;">${day}</span>
                    <span style="font-family: var(--quran-font); font-size: 1.05rem; color: var(--gold-light);">${ch.badgeAr}</span>
                  </div>
                  <div style="font-weight: 800; font-size: 0.96rem; color: #fff; margin-bottom: 4px;">${title}</div>
                  <div style="font-family: var(--quran-font); font-size: 1.15rem; color: #fef08a; direction: rtl;">${ch.titleAr}</div>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.06); font-size: 0.78rem; color: #34d399; font-weight: 800;">
                  <span><i class="fa-solid ${hasAudio ? 'fa-circle-play' : 'fa-book-open'}"></i> ${ch.passages.length} ${hasAudio ? (isKu ? 'فراز · کردنەوە و دەنگ' : (isFa ? 'فراز · باز کردن و صوت' : 'Abschnitte · Öffnen & Audio')) : (isKu ? 'فراز · خوێندنەوە' : (isFa ? 'فراز · مطالعه متن' : 'Abschnitte · Text'))}</span>
                  <i class="fa-solid fa-chevron-right"></i>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
      return;
    }

    // 2. DALĀ'IL AL-KHAYRĀT READER WITH SYNCHRONIZED AUDIO & EXACT SETTINGS (Uthmani/IndoPak, English/Farsi)
    if (mode === 'dalail_reader') {
      const chapters = window.DALAIL_CHAPTERS || [];
      const chIdx = chapters.findIndex(c => c.id === currentDalailChapterId);
      const ch = chapters[chIdx] || chapters[0];
      const prevCh = chapters[(chIdx - 1 + chapters.length) % chapters.length];
      const nextCh = chapters[(chIdx + 1) % chapters.length];
      const title = isKu ? ch.titleKu : (isFa ? ch.titleFa : (lang === 'en' ? ch.titleEn : ch.titleDe));
      const hasAudio = !!(ch.audioUrl || ch.audioOnlineUrl) && ch.id !== 'opening' && ch.id !== 'intention';

      const passagesHtml = (ch.passages || []).map((p, idx) => {
        return `
          <div class="neo3d-card spiritual-passage-card dalail-passage-card" id="dalailPassage_${idx}" ${hasAudio ? `onclick="playDalailFromTime(${p.time}, ${idx})"` : ''} style="transition: all 0.25s; ${hasAudio ? 'cursor: pointer;' : ''}">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <span style="background: rgba(16,185,129,0.18); color: #6ee7b7; font-size: 0.78rem; font-weight: 800; padding: 4px 12px; border-radius: 12px;">
                ${ch.badgeAr} · #${p.num}
              </span>
              ${hasAudio ? `
              <button onclick="event.stopPropagation(); playDalailFromTime(${p.time}, ${idx});" class="neo3d-pill-btn" style="padding: 5px 12px; font-size: 0.76rem; background: rgba(16,185,129,0.22); color: #6ee7b7; border-color: rgba(16,185,129,0.45);">
                <i class="fa-solid fa-volume-high"></i> ${isKu ? 'گوێگرتن' : (isFa ? 'پخش' : 'Anhören')}
              </button>
              ` : ''}
            </div>
            <div class="dalail-arabic ${dalailSettings.fontStyle === 'indopak' ? 'dalail-font-indopak' : 'dalail-font-uthmani'}" style="font-size: ${dalailSettings.arabicSize}rem; line-height: 2.2; color: #fef08a; direction: rtl; text-align: right; margin-bottom: 10px; padding: 12px 14px; background: rgba(0,0,0,0.28); border-radius: 12px; border-right: 3px solid #10b981;">
              ${p.ar}
            </div>
            ${p.en ? `<div class="dalail-trans dalail-trans-en" style="display: ${dalailSettings.showEnglish ? 'block' : 'none'}; font-size: ${dalailSettings.transSize}rem; color: #38bdf8; margin-bottom: 8px; line-height: 1.6;">${p.en}</div>` : ''}
            ${p.fa ? `<div class="dalail-trans dalail-trans-fa" style="display: ${dalailSettings.showFarsi ? 'block' : 'none'}; font-size: ${dalailSettings.transSize}rem; color: #cbd5e1; direction: rtl; text-align: right; line-height: 1.8; font-family: var(--kurdish-font);">${p.fa}</div>` : ''}
          </div>
        `;
      }).join('');

      container.innerHTML = `
        <div class="neo3d-card" style="margin-bottom: 14px; position: sticky; top: 6px; z-index: 50; backdrop-filter: blur(16px); background: rgba(11, 18, 25, 0.95); border: 1.5px solid rgba(16, 185, 129, 0.45);">
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; ${hasAudio ? 'margin-bottom: 10px;' : ''}">
            <button onclick="openSpiritualMode('dalail_list')" class="neo3d-pill-btn">
              <i class="fa-solid fa-arrow-left"></i> ${isKu ? 'هەموو بەشەکان' : (isFa ? 'همه بخش‌ها' : 'Alle Abschnitte')}
            </button>
            <div style="text-align: center; flex: 1; min-width: 160px;">
              <div style="font-weight: 900; font-size: 0.96rem; color: #fff;">${title}</div>
              <div style="font-family: var(--quran-font); font-size: 1.05rem; color: #34d399;">${ch.titleAr}</div>
            </div>
            <button onclick="openDalailSettingsModal()" class="neo3d-pill-btn" style="background: rgba(255,255,255,0.08); padding: 7px 12px; font-weight: 800; font-size: 0.82rem; border-color: rgba(255,255,255,0.18);">
              <i class="fa-solid fa-gear" style="color: #34d399;"></i> <span>Settings</span>
            </button>
          </div>
          ${hasAudio ? `
          <button id="spiritualMainPlayBtn" onclick="toggleDalailChapterAudio()" class="neo3d-primary-btn" style="background: linear-gradient(135deg, #10b981, #059669); color: #fff;">
            <i class="fa-solid fa-play"></i> <span>${isKu ? 'خوێندنەوەی دەنگ دەستپێبکە' : (isFa ? 'پخش صوتی و همراهی متن' : 'Rezitation abspielen & Mitlesen')}</span>
          </button>
          ` : ''}
        </div>
        <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px;">
          ${passagesHtml}
        </div>
        <div style="display: flex; justify-content: space-between; gap: 10px;">
          <button onclick="openDalailChapter('${prevCh.id}')" class="neo3d-pill-btn" style="flex: 1; padding: 12px; justify-content: center;">
            ◄ ${prevCh.badgeAr}
          </button>
          <button onclick="openDalailChapter('${nextCh.id}')" class="neo3d-pill-btn" style="flex: 1; padding: 12px; justify-content: center;">
            ${nextCh.badgeAr} ►
          </button>
        </div>
      `;
      return;
    }

    // 3. QASĪDA AL-BURDAH CHAPTER LIST (qasidaburda.com style — ONLY Burdah, NO Dalail header!)
    if (mode === 'burda_list') {
      const chapters = window.BURDA_CHAPTERS || [];
      const chorus = window.BURDA_CHORUS || {};
      const isKu = (window.quran_app_language === 'ku');
      const isFa = (window.quran_app_language === 'fa');

      const cardTitle = isKu ? 'قەسیدەی بوردەی پیرۆز · ئیمامی بووسەیری' : (isFa ? 'قصیده مبارکه برده · امام شرف‌الدین بوصیری' : "Qasīda al-Burdah · Imam al-Būṣīrī");
      const cardSub = isKu ? 'فەسڵێک هەڵبژێرە بۆ خوێندنەوە و گوێگرتن لە دەنگ:' : (isFa ? 'یک فصل را انتخاب کنید تا با صوت و همراهی متن باز شود:' : 'Wähle ein Kapitel aus, um es mit Audio-Begleitung zu öffnen:');

      container.innerHTML = `
        <!-- Burdah Top Header Card -->
        <div class="neo3d-card" style="margin-bottom: 14px; background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(30, 20, 10, 0.95)); border: 1.5px solid rgba(245, 158, 11, 0.45); border-radius: 18px; padding: 18px 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
            <div>
              <span style="font-size: 0.76rem; font-weight: 800; color: #fbbf24; text-transform: uppercase; letter-spacing: 0.8px;">${cardTitle}</span>
              <h3 style="margin: 4px 0 2px; font-size: 1.18rem; font-weight: 900; color: #fff; font-family: var(--quran-font);">قصيدة البردة المباركة (الكواكب الدريّة في مدح خير البريّة)</h3>
              <div style="font-size: 0.82rem; color: #fde68a;">${cardSub}</div>
            </div>
            <button onclick="openBurdaSettingsModal()" class="neo3d-pill-btn" style="background: rgba(255,255,255,0.08); padding: 8px 14px; font-weight: 800; font-size: 0.85rem; border-color: rgba(255,255,255,0.18);">
              <i class="fa-solid fa-gear" style="color: #fbbf24;"></i> <span>Settings</span>
            </button>
          </div>
        </div>

        <!-- Famous Chorus Banner -->
        <div class="neo3d-card" style="margin-bottom: 14px; text-align: center; background: linear-gradient(135deg, rgba(245, 158, 11, 0.16), rgba(120, 53, 15, 0.35)); border: 1.5px solid rgba(245, 158, 11, 0.45); border-radius: 16px; padding: 16px;">
          <div style="font-size: 0.74rem; font-weight: 800; color: #fbbf24; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 6px;">
            ۞ اللازمة المباركة لقصيدة البردة · Der berühmte Refrain ۞
          </div>
          <div class="burda-chorus-arabic ${burdaSettings.fontStyle === 'indopak' ? 'dalail-font-indopak' : 'dalail-font-uthmani'}" style="font-size: 1.65rem; color: #fef08a; direction: rtl; line-height: 1.9;">
            ${chorus.ar}
          </div>
          ${burdaSettings.showEnglish && chorus.en ? `<div class="burda-trans-en" style="font-size: 0.86rem; color: #fde68a; margin-top: 6px;">${chorus.en}</div>` : ''}
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px;">
          ${chapters.map(ch => {
            const title = isKu ? ch.titleKu : (isFa ? (ch.titleFa || ch.titleDe) : (lang === 'en' ? ch.titleEn : ch.titleDe));
            return `
              <div class="neo3d-card" onclick="openBurdaChapter(${ch.id})" style="cursor: pointer; display: flex; flex-direction: column; justify-content: space-between; gap: 10px; border-top: 3px solid #f59e0b; transition: transform 0.2s, box-shadow 0.2s;">
                <div>
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="background: rgba(245,158,11,0.2); color: #fde68a; font-weight: 800; font-size: 0.75rem; padding: 3px 10px; border-radius: 16px;">Kapitel ${ch.id} / 10</span>
                    <span style="font-family: var(--quran-font); font-size: 1.05rem; color: var(--gold-light);">${ch.badgeAr}</span>
                  </div>
                  <div style="font-weight: 800; font-size: 0.96rem; color: #fff; margin-bottom: 4px;">${title}</div>
                  <div style="font-family: var(--quran-font); font-size: 1.15rem; color: #fef08a; direction: rtl;">${ch.titleAr}</div>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.06); font-size: 0.78rem; color: #fbbf24; font-weight: 800;">
                  <span><i class="fa-solid fa-circle-play"></i> ${ch.couplets.length} ${isKu ? 'دێڕ · کردنەوە و دەنگ' : (isFa ? 'بیت · باز کردن و صوت' : 'Doppelverse · Öffnen & Audio')}</span>
                  <i class="fa-solid fa-chevron-right"></i>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
      applyBurdaDisplaySettings();
      return;
    }

    // 4. QASĪDA AL-BURDAH CHAPTER READER (qasidaburda.com style)
    if (mode === 'burda_reader') {
      const chapters = window.BURDA_CHAPTERS || [];
      const chorus = window.BURDA_CHORUS || {};
      const ch = chapters.find(c => c.id === currentBurdaChapterId) || chapters[0];
      const prevId = ch.id > 1 ? ch.id - 1 : 10;
      const nextId = ch.id < 10 ? ch.id + 1 : 1;
      const prevCh = chapters.find(c => c.id === prevId) || chapters[prevId - 1];
      const nextCh = chapters.find(c => c.id === nextId) || chapters[nextId - 1];

      const isKu = (window.quran_app_language === 'ku');
      const isFa = (window.quran_app_language === 'fa');
      const title = isKu ? ch.titleKu : (isFa ? (ch.titleFa || ch.titleDe) : (lang === 'en' ? ch.titleEn : ch.titleDe));

      const coupletsHtml = (ch.couplets || []).map((c, idx) => {
        return `
          <div class="neo3d-card spiritual-passage-card burda-couplet-card" id="burdaCouplet_${idx}" onclick="playBurdaFromTime(${c.time}, ${idx})" style="cursor: pointer; transition: all 0.25s;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <span style="background: rgba(245,158,11,0.18); color: #fde68a; font-size: 0.78rem; font-weight: 800; padding: 4px 12px; border-radius: 12px;">
                ${ch.badgeAr} · البيت ${c.num}
              </span>
              <button onclick="event.stopPropagation(); playBurdaFromTime(${c.time}, ${idx});" class="neo3d-pill-btn" style="padding: 5px 12px; font-size: 0.76rem; background: rgba(245,158,11,0.22); color: #fde68a; border-color: rgba(245,158,11,0.45);">
                <i class="fa-solid fa-volume-high"></i> ${isKu ? 'گوێگرتن' : (isFa ? 'پخش' : 'Anhören')}
              </button>
            </div>
            <!-- Dual Hemistich Poetic Arabic -->
            <div class="burda-arabic ${burdaSettings.fontStyle === 'indopak' ? 'dalail-font-indopak' : 'dalail-font-uthmani'}" style="font-size: ${burdaSettings.arabicSize}rem; line-height: 2.2; color: #fef08a; direction: rtl; text-align: center; margin-bottom: 10px; padding: 12px 14px; background: rgba(0,0,0,0.28); border-radius: 12px; border-right: 3px solid #f59e0b;">
              <div>${c.ar1}</div>
              <div style="font-size: 0.95rem; color: #fbbf24; margin: 2px 0;">۞</div>
              <div>${c.ar2}</div>
            </div>
            ${c.en ? `<div class="burda-trans-en" style="display: ${burdaSettings.showEnglish ? 'block' : 'none'}; font-size: ${burdaSettings.transSize}rem; color: #cbd5e1; margin-bottom: 8px; line-height: 1.6; text-align: center;">${c.en}</div>` : ''}
          </div>
        `;
      }).join('');

      container.innerHTML = `
        <div class="neo3d-card" style="margin-bottom: 14px; position: sticky; top: 6px; z-index: 50; backdrop-filter: blur(16px); background: rgba(18, 14, 10, 0.96); border: 1.5px solid rgba(245, 158, 11, 0.45);">
          <!-- Top Row Navigation & Settings -->
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin-bottom: 12px;">
            <button onclick="openSpiritualMode('burda_list')" class="neo3d-pill-btn">
              <i class="fa-solid fa-arrow-left"></i> ${isKu ? 'هەموو ۱۰ فەسڵەکە' : (isFa ? 'همه ۱۰ فصل' : 'Alle 10 Kapitel (Übersicht)')}
            </button>
            <div style="text-align: center; flex: 1; min-width: 160px;">
              <div style="font-weight: 900; font-size: 0.96rem; color: #fff;">${title}</div>
              <div style="font-family: var(--quran-font); font-size: 1.05rem; color: #fbbf24;">${ch.titleAr}</div>
            </div>
            <button onclick="openBurdaSettingsModal()" class="neo3d-pill-btn" style="background: rgba(255,255,255,0.08); padding: 7px 12px; font-weight: 800; font-size: 0.82rem; border-color: rgba(255,255,255,0.18);">
              <i class="fa-solid fa-gear" style="color: #fbbf24;"></i> <span>Settings</span>
            </button>
          </div>

          <!-- Chorus Box (Image 2 exact) -->
          <div id="burdaChorusBox" class="burda-chorus-card" style="background: rgba(0,0,0,0.38); border: 1px solid rgba(245, 158, 11, 0.35); border-radius: 12px; padding: 10px 14px; margin-bottom: 12px; text-align: center; transition: all 0.25s;">
            <div class="burda-chorus-arabic ${burdaSettings.fontStyle === 'indopak' ? 'dalail-font-indopak' : 'dalail-font-uthmani'}" style="font-size: 1.25rem; color: #fef08a; direction: rtl; line-height: 1.8;">
              ${chorus.ar}
            </div>
            ${burdaSettings.showEnglish && chorus.en ? `<div class="burda-trans-en" style="font-size: 0.8rem; color: #e2e8f0; margin-top: 4px;">${chorus.en}</div>` : ''}
          </div>

          <!-- Main Play Button (Image 2 exact) -->
          <button id="burdaMainPlayBtn" onclick="toggleBurdaChapterAudio()" class="neo3d-primary-btn" style="background: linear-gradient(135deg, #f59e0b, #d97706); color: #000; font-weight: 900; font-size: 1rem; width: 100%;">
            <i class="fa-solid fa-play"></i> <span>${isKu ? 'خوێندنەوەی دەنگ دەستپێبکە' : (isFa ? 'پخش صوتی و همراهی متن' : 'Kapitel abspielen & Mitlesen')}</span>
          </button>
        </div>

        <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px;">
          ${coupletsHtml}
        </div>

        <!-- Next / Prev Chapter Navigation -->
        <div style="display: flex; justify-content: space-between; gap: 10px;">
          <button onclick="openBurdaChapter(${prevId})" class="neo3d-pill-btn" style="flex: 1; padding: 12px; justify-content: center;">
            ◄ ${prevCh ? prevCh.badgeAr : `Kapitel ${prevId}`}
          </button>
          <button onclick="openBurdaChapter(${nextId})" class="neo3d-pill-btn" style="flex: 1; padding: 12px; justify-content: center;">
            ${nextCh ? nextCh.badgeAr : `Kapitel ${nextId}`} ►
          </button>
        </div>
      `;
      applyBurdaDisplaySettings();
      return;
    }

    // 5. COMPREHENSIVE AUTHENTIC DUAS & ADHKĀR SUITE (Morning, Evening, Quranic & Daily Tasbih)
    const allDuas = getMergedDuasCollection();
    let filteredDuas = [];
    if (currentDuaFilterCat === 'all') {
      filteredDuas = allDuas;
    } else if (window.AUTHENTIC_DUAS_DATA && window.AUTHENTIC_DUAS_DATA[currentDuaFilterCat]) {
      filteredDuas = window.AUTHENTIC_DUAS_DATA[currentDuaFilterCat];
    } else {
      filteredDuas = allDuas.filter(d => d.category === currentDuaFilterCat);
    }

    // Search query filter
    if (currentDuaSearchQuery) {
      const q = currentDuaSearchQuery.toLowerCase();
      filteredDuas = filteredDuas.filter(d => {
        return (d.arabic && d.arabic.includes(q)) ||
               (d.titleAr && d.titleAr.includes(q)) ||
               (d.titleDe && d.titleDe.toLowerCase().includes(q)) ||
               (d.titleEn && d.titleEn.toLowerCase().includes(q)) ||
               (d.titleKu && d.titleKu.includes(q)) ||
               (d.titleFa && d.titleFa.includes(q)) ||
               (d.reference && d.reference.toLowerCase().includes(q)) ||
               (d.de && d.de.toLowerCase().includes(q)) ||
               (d.en && d.en.toLowerCase().includes(q));
      });
    }

    if (currentDuaPageIdx >= filteredDuas.length) currentDuaPageIdx = 0;
    const d = filteredDuas[currentDuaPageIdx] || allDuas[0];

    const catCounts = {
      morning: (window.AUTHENTIC_DUAS_DATA && window.AUTHENTIC_DUAS_DATA.morning) ? window.AUTHENTIC_DUAS_DATA.morning.length : 31,
      evening: (window.AUTHENTIC_DUAS_DATA && window.AUTHENTIC_DUAS_DATA.evening) ? window.AUTHENTIC_DUAS_DATA.evening.length : 30,
      quran: (window.AUTHENTIC_DUAS_DATA && window.AUTHENTIC_DUAS_DATA.quran) ? window.AUTHENTIC_DUAS_DATA.quran.length : 35,
      night: (window.AUTHENTIC_DUAS_DATA && window.AUTHENTIC_DUAS_DATA.night) ? window.AUTHENTIC_DUAS_DATA.night.length : 3,
      tasbih: (window.AUTHENTIC_DUAS_DATA && window.AUTHENTIC_DUAS_DATA.tasbih) ? window.AUTHENTIC_DUAS_DATA.tasbih.length : 6,
      all: allDuas.length
    };

    const categories = [
      { key: 'morning', icon: '🌅', labelDe: 'Morgen-Adhkār', labelKu: 'ئەزکاری بەیانیان', labelFa: 'اذکار صبحگاه', labelEn: 'Morning', count: catCounts.morning },
      { key: 'evening', icon: '🌇', labelDe: 'Abend-Adhkār', labelKu: 'ئەزکاری ئێواران', labelFa: 'اذکار شامگاه', labelEn: 'Evening', count: catCounts.evening },
      { key: 'quran', icon: '📖', labelDe: 'Koranische Duas', labelKu: 'نزاکانی قورئان', labelFa: 'دعاهای قرآنی', labelEn: 'Quranic', count: catCounts.quran },
      { key: 'asmaa_allah', icon: '✨', labelDe: '99 Namen Allahs', labelKu: '٩٩ ناوی خودا', labelFa: 'اسماء الحسنی', labelEn: '99 Names', count: 99 },
      { key: 'night', icon: '🌙', labelDe: 'Nacht & Schlaf', labelKu: 'زیکری شەوان و خەو', labelFa: 'اذکار خواب و شب', labelEn: 'Night', count: catCounts.night },
      { key: 'tasbih', icon: '📿', labelDe: 'Tasbīḥāt', labelKu: 'تەسبیحات', labelFa: 'تسبیحات روزانه', labelEn: 'Tasbih', count: catCounts.tasbih },
      { key: 'all', icon: '🌟', labelDe: 'Alle', labelKu: 'هەموو', labelFa: 'همه دعاها', labelEn: 'All', count: catCounts.all }
    ];

    const catPillsHtml = categories.map(c => {
      const lbl = isKu ? c.labelKu : (isFa ? c.labelFa : (lang === 'en' ? c.labelEn : c.labelDe));
      const isActive = (currentDuaFilterCat === c.key);
      return `
        <button onclick="setCleanDuaCategory('${c.key}')" class="neo3d-pill-btn ${isActive ? 'active' : ''}" style="${isActive ? 'background: linear-gradient(135deg, rgba(16,185,129,0.35), rgba(5,150,105,0.45)); border-color: #34d399; color: #fff; font-weight: 800;' : 'background: rgba(255,255,255,0.05); color: #cbd5e1;'} padding: 8px 14px; white-space: nowrap; font-size: 0.85rem; border-radius: 12px; display: flex; align-items: center; gap: 6px;">
          <span>${c.icon}</span> <span>${lbl}</span> <span style="font-size: 0.72rem; padding: 2px 7px; border-radius: 10px; background: rgba(0,0,0,0.35); color: #34d399; font-weight: 900;">${c.count}</span>
        </button>
      `;
    }).join('');

    // Header & Control Bar
    const searchPlaceholder = isKu ? 'گەڕان لە دوعا و زیکرەکان...' : (isFa ? 'جستجو در دعاها، اذکار و آیات...' : 'Dhikr oder Dua suchen...');
    const isGridView = (typeof currentDuaViewMode === 'undefined' || currentDuaViewMode === 'grid');

    let contentHtml = '';

    if (currentDuaFilterCat === 'asmaa_allah') {
      // 0. ASMAA ALLAH AL-HUSNA (99 BEAUTIFUL NAMES OF ALLAH WITH ALAFASY RECITATION)
      const asmaaData = window.ASMAA_ALLAH_DATA || { names: [] };
      let namesList = asmaaData.names || [];

      if (currentDuaSearchQuery) {
        const q = currentDuaSearchQuery.toLowerCase();
        namesList = namesList.filter(n => {
          return n.arabic.includes(q) ||
                 n.translit.toLowerCase().includes(q) ||
                 (n.de && n.de.toLowerCase().includes(q)) ||
                 (n.fa && n.fa.includes(q)) ||
                 (n.ku && n.ku.includes(q)) ||
                 (n.en && n.en.toLowerCase().includes(q));
        });
      }

      const isPlaying = window.asmaaAllahAudioPlaying;
      const heroTitle = isKu ? '٩٩ ناوە پیرۆزەکانی خودای گەورە (ئەسماءولحوسنا)' : (isFa ? '۹۹ نام نیکوی پروردگار (اسماء الحسنی)' : (lang === 'en' ? 'The 99 Beautiful Names of Allah' : 'Die 99 schönsten Namen Allahs (Asmāʾ Allāh al-Ḥusnā)'));
      const heroAyah = 'وَلِلَّهِ الْأَسْمَاءُ الْحُسْنَىٰ فَادْعُوهُ بِهَا';
      const ayahTrans = isKu ? 'هەموو جوانترین ناوەکان بۆ خودان، دەی پێیان لێی بپاڕێنەوە! (سورة الأعراف: ۱۸۰)' : (isFa ? 'و برای خدا، نیکوترین نام‌ها است؛ پس او را با آن نام‌ها بخوانید! (سوره اعراف: ۱۸۰)' : 'Und Allahs sind die schönsten Namen, so ruft Ihn damit an! (Sure 7:180)');

      const namesCardsHtml = namesList.map((item) => {
        const meaning = isKu ? item.ku : (isFa ? item.fa : (lang === 'en' ? item.en : item.de));
        const currentCount = (window.duaCardCounters && window.duaCardCounters['asmaa_' + item.num]) || 0;
        return `
          <div class="neo3d-card" style="padding: 14px; text-align: center; background: linear-gradient(145deg, rgba(15, 23, 42, 0.92), rgba(9, 14, 26, 0.96)); border: 1.5px solid rgba(229, 184, 76, 0.3); border-radius: 16px; position: relative; overflow: hidden; transition: all 0.25s;">
            <!-- Top Badges: Number and Translit -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 0.72rem; font-weight: 900; background: rgba(229, 184, 76, 0.18); color: #fde68a; padding: 2px 8px; border-radius: 8px; border: 1px solid rgba(229,184,76,0.35);">
                #${item.num}
              </span>
              <span style="font-size: 0.72rem; font-weight: 800; color: #38bdf8; background: rgba(56, 189, 248, 0.12); padding: 2px 8px; border-radius: 8px;">
                ${item.translit}
              </span>
            </div>

            <!-- Big Golden Calligraphic Arabic Name -->
            <div onclick="speakSingleAsmaaName('${item.arabic}', ${item.num})" style="font-family: var(--quran-font); font-size: 1.85rem; color: #fef08a; line-height: 1.4; margin: 6px 0; cursor: pointer; text-shadow: 0 2px 10px rgba(229, 184, 76, 0.35); transition: transform 0.2s;" title="Tippen zum Vorlesen">
              ${item.arabic}
            </div>

            <!-- Meaning in Active Language -->
            <div style="font-size: 0.82rem; color: #e2e8f0; line-height: 1.5; min-height: 38px; display: flex; align-items: center; justify-content: center; margin-bottom: 10px;">
              ${meaning}
            </div>

            <!-- Bottom Action: Pronounce + Tasbih Counter -->
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.06);">
              <button onclick="speakSingleAsmaaName('${item.arabic}', ${item.num})" class="neo3d-pill-btn" style="padding: 5px 10px; font-size: 0.75rem; background: rgba(56,189,248,0.15); color: #7dd3fc; border-color: rgba(56,189,248,0.35);" title="Aussprache anhören">
                <i class="fa-solid fa-volume-high"></i>
              </button>
              <div style="display: flex; align-items: center; gap: 4px;">
                <button onclick="incrementDuaCardTasbih('asmaa_${item.num}', 33)" class="neo3d-tasbih-pill" style="padding: 4px 10px; font-size: 0.75rem;">
                  <span>📿 <b id="duaCardCount_asmaa_${item.num}">${currentCount}</b>/33</span>
                </button>
                <button onclick="resetDuaCardTasbih('asmaa_${item.num}')" class="neo3d-pill-btn" style="padding: 4px 7px; font-size: 0.72rem;">
                  <i class="fa-solid fa-rotate-left"></i>
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');

      contentHtml = `
        <!-- Asmaa Allah Hero Banner with Full Alafasy Recitation -->
        <div class="neo3d-card" style="padding: 16px; margin-bottom: 14px; background: linear-gradient(135deg, rgba(229, 184, 76, 0.16), rgba(16, 185, 129, 0.22)); border: 1.5px solid rgba(229, 184, 76, 0.45); text-align: center;">
          <div style="font-size: 0.78rem; font-weight: 800; color: #fde68a; letter-spacing: 0.5px; text-transform: uppercase;">
            ✨ ${heroTitle}
          </div>
          <div style="font-family: var(--quran-font); font-size: 1.5rem; color: #fff; margin: 6px 0; text-shadow: 0 2px 8px rgba(0,0,0,0.6);">
            ${heroAyah}
          </div>
          <div style="font-size: 0.84rem; color: #a7f3d0; margin-bottom: 12px;">
            ${ayahTrans}
          </div>

          <!-- Play Audio of Mishary Alafasy Recitation -->
          <button id="asmaaAllahPlayBtn" onclick="toggleAsmaaAllahAudio()" class="neo3d-primary-btn" style="background: ${isPlaying ? 'linear-gradient(135deg, #ef4444, #b91c1c)' : 'linear-gradient(135deg, #10b981, #059669)'}; color: #fff; font-weight: 900; font-size: 0.95rem; width: 100%; justify-content: center; gap: 8px;">
            <i class="fa-solid ${isPlaying ? 'fa-stop' : 'fa-play'}"></i> <span>${isPlaying ? (isKu ? 'تەلاوەتی ٩٩ ناوەکە ڕابگرە' : (isFa ? 'توقف تلاوت اسماء الحسنی' : 'Rezitation stoppen')) : (isKu ? 'تەواوی ٩٩ ناوەکە لێبدە (شێخ میشاری عەفاسی)' : (isFa ? 'پخش صوتی کامل ۹۹ نام خدا (استاد مشاری العفاسی)' : 'Alle 99 Namen anhören (Mishary Alafasy)'))}</span>
          </button>
        </div>

        <!-- 99 Names Responsive Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px;">
          ${namesCardsHtml}
        </div>
      `;
    } else if (isGridView) {
      // 1. GRID / LIST VIEW (All cards with audio and counter)
      const cardsHtml = filteredDuas.map((item, idx) => {
        const itemTitle = isKu ? (item.titleKu || item.titleAr) : (isFa ? (item.titleFa || item.titleAr) : (lang === 'en' ? (item.titleEn || item.titleAr) : (item.titleDe || item.titleAr)));
        const itemTrans = isKu ? (item.ku || item.en || item.de) : (isFa ? (item.fa || item.en || item.de) : (lang === 'en' ? item.en : (item.de || item.en)));
        const isPlaying = (spiritualAudioPlaying && activeDuaAudioId === item.id);
        const currentCount = (window.duaCardCounters && window.duaCardCounters[item.id]) || 0;

        return `
          <div class="neo3d-card spiritual-passage-card ${isPlaying ? 'active-playing' : ''}" id="duaCard_${item.id}" style="padding: 16px; margin-bottom: 12px; border: 1.5px solid ${isPlaying ? 'rgba(52,211,153,0.7)' : 'rgba(255,255,255,0.08)'}; background: ${isPlaying ? 'linear-gradient(135deg, rgba(16,185,129,0.18), rgba(6,78,59,0.35))' : 'rgba(15, 23, 42, 0.75)'}; transition: all 0.25s;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 10px;">
              <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                <span style="background: rgba(56,189,248,0.18); color: #7dd3fc; font-size: 0.75rem; font-weight: 800; padding: 3px 10px; border-radius: 10px;">
                  ${item.reference || 'صحيح الأذكار'}
                </span>
                <span style="background: rgba(229,184,76,0.18); color: #fef08a; font-weight: 900; font-size: 0.75rem; padding: 3px 8px; border-radius: 10px;">
                  #${idx + 1}
                </span>
              </div>
              ${item.targetCount > 1 ? `
                <span style="background: rgba(168,85,247,0.18); color: #d8b4fe; font-size: 0.75rem; font-weight: 800; padding: 3px 10px; border-radius: 10px;">
                  ${item.targetCount}x ${isKu ? 'دووبارەکردنەوە' : (isFa ? 'مرتبه' : 'Wiederholungen')}
                </span>
              ` : ''}
            </div>

            <h4 style="margin: 0 0 10px; font-size: 1rem; font-weight: 800; color: #fff;">${itemTitle}</h4>

            <!-- Arabic Vocalized Text -->
            <div style="font-family: var(--quran-font); font-size: 1.55rem; line-height: 2.1; color: #fef08a; direction: rtl; text-align: right; background: rgba(0,0,0,0.32); padding: 14px 16px; border-radius: 12px; border-right: 4px solid var(--gold-primary); margin-bottom: 10px;">
              ${item.arabic}
            </div>

            <!-- Translation -->
            <div style="font-size: 0.9rem; color: #cbd5e1; line-height: 1.6; margin-bottom: 12px;">
              ${itemTrans}
            </div>

            <!-- Card Bottom Bar: Play Audio + Tasbih Counter -->
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.06);">
              <button onclick="playSpecificDuaAudio('${item.id}')" class="neo3d-pill-btn" style="background: ${isPlaying ? 'rgba(239,68,68,0.25)' : 'rgba(16,185,129,0.22)'}; color: ${isPlaying ? '#fca5a5' : '#6ee7b7'}; border-color: ${isPlaying ? 'rgba(239,68,68,0.5)' : 'rgba(16,185,129,0.45)'}; padding: 7px 14px; font-size: 0.82rem; font-weight: 800;">
                <i class="fa-solid ${isPlaying ? 'fa-stop' : 'fa-play'}"></i> <span>${isPlaying ? (isKu ? 'ڕاگرتن' : (isFa ? 'توقف' : 'Stoppen')) : (isKu ? 'گوێگرتن' : (isFa ? 'پخش صوت' : 'Anhören'))}</span>
              </button>

              <div style="display: flex; align-items: center; gap: 6px;">
                <button onclick="incrementDuaCardTasbih('${item.id}', ${item.targetCount || 1})" class="neo3d-tasbih-pill" style="padding: 6px 12px; font-size: 0.82rem;">
                  <i class="fa-solid fa-fingerprint" style="color: var(--gold-primary);"></i>
                  <span>${isKu ? 'تەسبیح' : (isFa ? 'تسبیح' : 'Tasbīḥ')}: <b id="duaCardCount_${item.id}" style="color: #fef08a;">${currentCount}</b> / ${item.targetCount || 1}</span>
                </button>
                <button onclick="resetDuaCardTasbih('${item.id}')" class="neo3d-pill-btn" title="Reset" style="padding: 6px 9px; font-size: 0.78rem;">
                  <i class="fa-solid fa-rotate-left"></i>
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');

      contentHtml = `
        <div style="display: flex; flex-direction: column; gap: 4px;">
          ${cardsHtml || `<div style="text-align: center; color: #94a3b8; padding: 40px 20px;">هیچ دوعایەک نەدۆزرایەوە · Keine Duas gefunden</div>`}
        </div>
      `;
    } else {
      // 2. FOCUS READER MODE (Page-by-page single view)
      const dTitle = isKu ? (d.titleKu || d.titleAr) : (isFa ? (d.titleFa || d.titleAr) : (lang === 'en' ? (d.titleEn || d.titleAr) : (d.titleDe || d.titleAr)));
      const dTrans = isKu ? (d.ku || d.en || d.de) : (isFa ? (d.fa || d.en || d.de) : (lang === 'en' ? d.en : (d.de || d.en)));
      const isPlaying = (spiritualAudioPlaying && activeDuaAudioId === d.id);

      contentHtml = `
        <div class="neo3d-card" style="padding: 18px; background: rgba(15, 23, 42, 0.85); border: 1.5px solid rgba(255,255,255,0.1);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.08);">
            <div>
              <span style="background: rgba(56,189,248,0.18); color: #7dd3fc; font-size: 0.74rem; font-weight: 800; padding: 3px 10px; border-radius: 10px;">
                ${d.reference || 'صحيح الأذكار'}
              </span>
              <h3 style="margin: 6px 0 0; font-size: 1.1rem; font-weight: 800; color: #fff;">${dTitle}</h3>
            </div>
            <span style="background: rgba(229,184,76,0.18); color: #fef08a; font-weight: 900; font-size: 0.85rem; padding: 4px 12px; border-radius: 14px; flex-shrink: 0;">
              ${currentDuaPageIdx + 1} / ${filteredDuas.length}
            </span>
          </div>

          <div style="font-family: var(--quran-font); font-size: 1.75rem; line-height: 2.2; color: #fef08a; direction: rtl; text-align: right; background: rgba(0,0,0,0.32); padding: 18px; border-radius: 14px; border-right: 4px solid var(--gold-primary); margin-bottom: 12px;">
            ${d.arabic}
          </div>

          ${d.translit ? `<div style="font-size: 0.84rem; color: #38bdf8; font-style: italic; margin-bottom: 8px;">${d.translit}</div>` : ''}
          <div style="font-size: 0.95rem; color: #e2e8f0; line-height: 1.65; margin-bottom: 16px;">${dTrans}</div>

          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; padding: 12px; background: rgba(255,255,255,0.04); border-radius: 14px; margin-bottom: 14px;">
            <button onclick="playSpecificDuaAudio('${d.id}')" class="neo3d-pill-btn" style="background: ${isPlaying ? 'rgba(239,68,68,0.25)' : 'rgba(16,185,129,0.22)'}; color: ${isPlaying ? '#fca5a5' : '#6ee7b7'}; border-color: ${isPlaying ? 'rgba(239,68,68,0.5)' : 'rgba(16,185,129,0.45)'}; padding: 8px 16px;">
              <i class="fa-solid ${isPlaying ? 'fa-stop' : 'fa-volume-high'}"></i> ${isPlaying ? (isKu ? 'ڕاگرتن' : (isFa ? 'توقف' : 'Stoppen')) : (d.surah ? `Koran-Audio (${d.surah}:${d.ayah})` : (isKu ? 'گوێگرتن' : (isFa ? 'پخش صوت' : 'Dua-Audio anhören')))}
            </button>

            <div style="display: flex; align-items: center; gap: 8px;">
              <button onclick="incrementCleanDuaTasbih(${d.targetCount || 1})" class="neo3d-tasbih-pill">
                <i class="fa-solid fa-fingerprint" style="color: var(--gold-primary);"></i>
                <span>Tasbīḥ: <b id="cleanDuaTasbihVal" style="color: #fef08a; font-size: 1.05rem;">${currentDuaTasbihCount}</b> / ${d.targetCount || 1}</span>
              </button>
              <button onclick="resetCleanDuaTasbih()" class="neo3d-pill-btn" title="Reset" style="padding: 8px 10px;">
                <i class="fa-solid fa-rotate-left"></i>
              </button>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px;">
            <button onclick="stepCleanDuaPage(-1)" class="neo3d-pill-btn" style="flex: 1; padding: 12px; justify-content: center; font-size: 0.88rem;">
              ◄ ${isKu ? 'دوعای پێشوو' : (isFa ? 'دعای قبلی' : 'Vorheriges Dua')}
            </button>
            <button onclick="stepCleanDuaPage(1)" class="neo3d-primary-btn" style="flex: 1; padding: 12px; font-size: 0.88rem;">
              ${isKu ? 'دوعای دواتر' : (isFa ? 'دعای بعدی' : 'Nächstes Dua')} ►
            </button>
          </div>
        </div>
      `;
    }

    container.innerHTML = `
      <!-- Top Category Tabs (Morning, Evening, Quranic, Night, Tasbih, All) -->
      <div style="display: flex; gap: 6px; overflow-x: auto; padding-bottom: 8px; margin-bottom: 12px; scrollbar-width: none;">
        ${catPillsHtml}
      </div>

      <!-- Controls Row: Search Input + View Mode Toggle -->
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 14px;">
        <div style="position: relative; flex: 1;">
          <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #64748b; font-size: 0.85rem;"></i>
          <input id="duaSearchInput" type="text" value="${currentDuaSearchQuery}" oninput="onDuaSearchInput(this.value)" placeholder="${searchPlaceholder}" style="width: 100%; box-sizing: border-box; padding: 9px 12px 9px 34px; background: rgba(0,0,0,0.35); border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; color: #fff; font-size: 0.85rem; outline: none;" />
        </div>
        <div style="display: flex; gap: 4px; background: rgba(0,0,0,0.3); padding: 3px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08);">
          <button onclick="setDuaViewMode('grid')" class="neo3d-pill-btn ${isGridView ? 'active' : ''}" title="Karten-Ansicht" style="padding: 7px 11px; font-size: 0.82rem; ${isGridView ? 'background: rgba(16,185,129,0.3); color: #34d399;' : ''}">
            <i class="fa-solid fa-grip"></i>
          </button>
          <button onclick="setDuaViewMode('focus')" class="neo3d-pill-btn ${!isGridView ? 'active' : ''}" title="Fokus-Lesemodus" style="padding: 7px 11px; font-size: 0.82rem; ${!isGridView ? 'background: rgba(16,185,129,0.3); color: #34d399;' : ''}">
            <i class="fa-solid fa-book-open"></i>
          </button>
        </div>
      </div>

      <!-- Main Content Area -->
      ${contentHtml}
    `;
  }
  window.renderSpiritualCenter = renderSpiritualCenter;
  window.renderDedicatedDhikr = renderSpiritualCenter;

  // Twin Spiritual Stickers Dedicated Audio Controller (100% Offline YouTube Audio Sources - Fully Multilingual)
  window.activeStickerAudio = null; // 'morning' | 'evening' | 'center' | 'asmaa' | null
  window.stickerDedicatedAudio = null;

  window.playAdhkarAudio = function (mode) {
    if (window.activeStickerAudio === mode) {
      window.stopAllStickerAudios();
      return;
    }
    window.stopAllStickerAudios();

    let audioFile = '';
    let title = '';

    const lang = window.quran_app_language || window.currentAppLanguage || 'ku';
    const isKu = (lang === 'ku');
    const isFa = (lang === 'fa');
    const isEn = (lang === 'en');

    if (mode === 'morning') {
      audioFile = 'audio/adhkar/adhkar_sabah_peshawa.mp3';
      title = isKu ? 'ئەزکاری بەیانیان (پێشەوا کوردی)' : (isFa ? 'اذکار صبحگاه (پیشوا کوردی)' : (isEn ? 'Morning Adhkar (Peshawa Kurdi)' : 'Morgen-Adhkār (Peshawa Kurdi)'));
    } else if (mode === 'evening') {
      audioFile = 'audio/adhkar/adhkar_masaa_peshawa.mp3';
      title = isKu ? 'ئەزکاری ئێواران (پێشەوا کوردی)' : (isFa ? 'اذکار شامگاه (پیشوا کوردی)' : (isEn ? 'Evening Adhkar (Peshawa Kurdi)' : 'Abend-Adhkār (Peshawa Kurdi)'));
    } else if (mode === 'center') {
      audioFile = 'audio/adhkar/dua_center_peshawa.mp3';
      title = isKu ? 'دوعای پیرۆز' : (isFa ? 'دعای مبارک' : (isEn ? 'Sacred Duʿāʾ' : 'Gesegnetes Bittgebet'));
    } else if (mode === 'asmaa') {
      audioFile = 'audio/asmaa_allah/Asmaa_Allah_AlAfasy.mp3';
      title = isKu ? '٩٩ ناوی پیرۆزی خودا (میشاری عەفاسی)' : (isFa ? 'اسماء الحسنی (مشاری العفاسی)' : (isEn ? '99 Names of Allah (Mishary Alafasy)' : '99 Namen Allahs (Mishary Alafasy)'));
    }

    if (!audioFile) return;

    window.activeStickerAudio = mode;
    updateTwinStickersUI();

    if (typeof showToast === 'function') {
      const toastMsg = isKu
        ? ('🔊 پەخشی ' + title + ' دەستیپێکرد · بۆ ڕاگرتن دەست لێبدە')
        : (isFa
          ? ('🔊 پخش ' + title + ' آغاز شد · برای توقف مجدداً لمس کنید')
          : (isEn
            ? ('🔊 Playing ' + title + ' · Tap again to stop')
            : ('🔊 ' + title + ' wird abgespielt · Tippen zum Stoppen')));
      showToast(toastMsg);
    }

    const audio = new Audio();
    audio.src = audioFile;
    audio.preload = 'auto';
    window.stickerDedicatedAudio = audio;

    audio.onended = function () {
      window.stopAllStickerAudios();
    };
    audio.onerror = function (e) {
      console.warn('Audio playback error on:', audioFile, e);
      window.stopAllStickerAudios();
    };

    const p = audio.play();
    if (p !== undefined) {
      p.catch(function (err) {
        console.warn('Play prevented:', err);
        window.stopAllStickerAudios();
      });
    }
  };

  // Backwards compatibility aliases
  window.playMorningOrEveningAdhkar = function (type) {
    window.playAdhkarAudio(type);
  };
  window.toggleCenterDuaStickerAudio = function () {
    window.playAdhkarAudio('center');
  };
  window.toggleStickerAsmaaAllahAudio = function () {
    window.playAdhkarAudio('asmaa');
  };

  window.stopAllStickerAudios = function () {
    window.activeStickerAudio = null;
    if (window.stickerDedicatedAudio) {
      try {
        window.stickerDedicatedAudio.pause();
        window.stickerDedicatedAudio.currentTime = 0;
      } catch (e) {}
      window.stickerDedicatedAudio = null;
    }
    if (typeof stopSpiritualAudio === 'function') {
      stopSpiritualAudio();
    }
    updateTwinStickersUI();
  };

  window.updateTwinStickersUI = function () {
    const active = window.activeStickerAudio;

    const lang = window.quran_app_language || window.currentAppLanguage || 'ku';
    const isKu = (lang === 'ku');
    const isFa = (lang === 'fa');
    const isEn = (lang === 'en');

    // Multilingual status indicators (strictly matching system language)
    const playingSuffix = isKu ? ' (پەخش دەکرێت)' : (isFa ? ' (در حال پخش)' : (isEn ? ' (Playing)' : ' (Wird abgespielt)'));
    const idleDuaText = isKu ? 'دوعا و ئەزکار' : (isFa ? 'دعا و اذکار' : (isEn ? 'Duʿāʾ & Adhkār' : 'Duʿāʾ & Adhkār'));
    const idleAsmaaText = isKu ? 'تەلاوەتی ٩٩ ناوی خودا' : (isFa ? 'تلاوت ۹۹ نام خدا' : (isEn ? '99 Names of Allah' : '99 Namen Allahs'));
    const centerTitle = isKu ? 'دوعای پیرۆز' : (isFa ? 'دعای مبارک' : (isEn ? 'Sacred Duʿāʾ' : 'Gesegnetes Bittgebet'));

    // Sticker 1 (Dua & Adhkar)
    const card1 = document.getElementById('stickerDuaAdhkarCard');
    const dot1 = document.getElementById('duaStickerStatusDot');
    const text1 = document.getElementById('duaStickerMiniText');
    const lblMorn = document.getElementById('labelMorningAdhkar');
    const lblEve = document.getElementById('labelEveningAdhkar');

    // Sticker 2 (Asmaa Allah)
    const card2 = document.getElementById('stickerAsmaaAllahCard');
    const dot2 = document.getElementById('asmaaStickerStatusDot');
    const text2 = document.getElementById('asmaaStickerMiniText');

    if (lblMorn) lblMorn.style.color = '#fde68a';
    if (lblEve) lblEve.style.color = '#a7f3d0';

    if (card1 && dot1 && text1) {
      if (active === 'morning') {
        card1.style.borderColor = '#10b981';
        card1.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.5)';
        dot1.style.background = '#34d399';
        dot1.style.boxShadow = '0 0 8px #34d399';
        text1.textContent = '▶️ أذكار الصباح' + playingSuffix;
        text1.style.color = '#34d399';
        if (lblMorn) lblMorn.style.color = '#34d399';
      } else if (active === 'evening') {
        card1.style.borderColor = '#38bdf8';
        card1.style.boxShadow = '0 0 20px rgba(56, 189, 248, 0.5)';
        dot1.style.background = '#38bdf8';
        dot1.style.boxShadow = '0 0 8px #38bdf8';
        text1.textContent = '▶️ أذكار المساء' + playingSuffix;
        text1.style.color = '#7dd3fc';
        if (lblEve) lblEve.style.color = '#38bdf8';
      } else if (active === 'center') {
        card1.style.borderColor = '#f59e0b';
        card1.style.boxShadow = '0 0 20px rgba(245, 158, 11, 0.5)';
        dot1.style.background = '#fbbf24';
        dot1.style.boxShadow = '0 0 8px #fbbf24';
        text1.textContent = '▶️ ' + centerTitle + playingSuffix;
        text1.style.color = '#fde68a';
      } else {
        card1.style.borderColor = 'rgba(229, 184, 76, 0.35)';
        card1.style.boxShadow = '0 8px 24px rgba(0,0,0,0.65), inset 0 1px 2px rgba(255,255,255,0.08)';
        dot1.style.background = '#64748b';
        dot1.style.boxShadow = 'none';
        text1.textContent = idleDuaText;
        text1.style.color = '#94a3b8';
      }
    }

    if (card2 && dot2 && text2) {
      if (active === 'asmaa') {
        card2.style.borderColor = '#eab308';
        card2.style.boxShadow = '0 0 20px rgba(234, 179, 8, 0.5)';
        dot2.style.background = '#facc15';
        dot2.style.boxShadow = '0 0 8px #facc15';
        text2.textContent = '▶️ أسماء الحسنى' + playingSuffix;
        text2.style.color = '#fef08a';
      } else {
        card2.style.borderColor = 'rgba(229, 184, 76, 0.35)';
        card2.style.boxShadow = '0 8px 24px rgba(0,0,0,0.65), inset 0 1px 2px rgba(255,255,255,0.08)';
        dot2.style.background = '#64748b';
        dot2.style.boxShadow = 'none';
        text2.textContent = idleAsmaaText;
        text2.style.color = '#94a3b8';
      }
    }
  };

  // Dua Global Variables & State
  window.currentDuaViewMode = window.currentDuaViewMode || 'grid';
  window.currentDuaSearchQuery = window.currentDuaSearchQuery || '';
  window.activeDuaAudioId = window.activeDuaAudioId || null;
  window.duaCardCounters = window.duaCardCounters || {};

  window.setDuaViewMode = function (mode) {
    window.currentDuaViewMode = mode;
    renderSpiritualCenter();
  };

  window.onDuaSearchInput = function (val) {
    window.currentDuaSearchQuery = (val || '').trim();
    renderSpiritualCenter();
    const inp = document.getElementById('duaSearchInput');
    if (inp) {
      inp.focus();
      inp.setSelectionRange(inp.value.length, inp.value.length);
    }
  };

  window.setCleanDuaCategory = function (cat) {
    stopSpiritualAudio();
    currentDuaFilterCat = cat;
    currentDuaPageIdx = 0;
    currentDuaTasbihCount = 0;
    window.currentDuaSearchQuery = '';
    renderSpiritualCenter();
  };

  window.stepCleanDuaPage = function (delta) {
    stopSpiritualAudio();
    const allDuas = getMergedDuasCollection();
    let filteredDuas = [];
    if (currentDuaFilterCat === 'all') {
      filteredDuas = allDuas;
    } else if (window.AUTHENTIC_DUAS_DATA && window.AUTHENTIC_DUAS_DATA[currentDuaFilterCat]) {
      filteredDuas = window.AUTHENTIC_DUAS_DATA[currentDuaFilterCat];
    } else {
      filteredDuas = allDuas.filter(d => d.category === currentDuaFilterCat);
    }
    if (filteredDuas.length === 0) return;
    currentDuaPageIdx = (currentDuaPageIdx + delta + filteredDuas.length) % filteredDuas.length;
    currentDuaTasbihCount = 0;
    renderSpiritualCenter();
  };

  window.incrementCleanDuaTasbih = function (target) {
    currentDuaTasbihCount++;
    const el = document.getElementById('cleanDuaTasbihVal');
    if (el) el.textContent = currentDuaTasbihCount;
    if (navigator.vibrate) navigator.vibrate(30);
    if (currentDuaTasbihCount === target) {
      if (navigator.vibrate) navigator.vibrate([50, 40, 70]);
      if (typeof showToast === 'function') showToast('🎉 Māshā Allāh! Anzahl erreicht – weiter zum nächsten Dua.');
    }
  };

  window.resetCleanDuaTasbih = function () {
    currentDuaTasbihCount = 0;
    const el = document.getElementById('cleanDuaTasbihVal');
    if (el) el.textContent = '0';
  };

  window.incrementDuaCardTasbih = function (duaId, target) {
    window.duaCardCounters[duaId] = (window.duaCardCounters[duaId] || 0) + 1;
    const el = document.getElementById('duaCardCount_' + duaId);
    if (el) el.textContent = window.duaCardCounters[duaId];
    if (navigator.vibrate) navigator.vibrate(30);
    if (window.duaCardCounters[duaId] === target) {
      if (navigator.vibrate) navigator.vibrate([50, 40, 70]);
      const lang = window.quran_app_language || 'ku';
      const msg = lang === 'ku' ? '🎉 ماء شاء الله! ژمارەی داواکراو تەواو بوو' : (lang === 'fa' ? '🎉 ماشاءالله! تعداد ذکر به پایان رسید' : '🎉 Māshā Allāh! Zielanzahl erreicht');
      if (typeof showToast === 'function') showToast(msg);
    }
  };

  window.resetDuaCardTasbih = function (duaId) {
    window.duaCardCounters[duaId] = 0;
    const el = document.getElementById('duaCardCount_' + duaId);
    if (el) el.textContent = '0';
  };

  window.playSpecificDuaAudio = function (duaId) {
    if (window.activeDuaAudioId === duaId && spiritualAudioPlaying) {
      stopSpiritualAudio();
      window.activeDuaAudioId = null;
      renderSpiritualCenter();
      return;
    }
    stopSpiritualAudio();

    const allDuas = getMergedDuasCollection();
    const item = allDuas.find(x => x.id === duaId);
    if (!item) return;

    window.activeDuaAudioId = duaId;
    spiritualAudioPlaying = true;
    renderSpiritualCenter();

    if (typeof showToast === 'function') {
      const lang = window.quran_app_language || 'ku';
      const msg = item.surah
        ? (lang === 'ku' ? `🔊 دوعای قورئانی (${item.surah}:${item.ayah}) - شێخ میشاری عەفاسی` : (lang === 'fa' ? `🔊 دعای قرآنی (${item.surah}:${item.ayah}) - استاد مشاری العفاسی` : `🔊 Koran-Dua (${item.surah}:${item.ayah}) - Mishary Alafasy`))
        : (lang === 'ku' ? '🔊 خوێندنەوەی زیکری پیرۆز...' : (lang === 'fa' ? '🔊 در حال پخش صوت ذکر مبارک...' : '🔊 Dhikr-Audio wird abgespielt...'));
      showToast(msg);
    }

    playGuaranteedArabicAudio({
      arabicText: item.arabic,
      surah: item.surah || null,
      ayah: item.ayah || null,
      directAudioUrl: item.audioUrl || null,
      onlineAudioUrl: item.audioOnlineUrl || null,
      fallbackSalawat: false,
      onEnded: function () {
        spiritualAudioPlaying = false;
        window.activeDuaAudioId = null;
        renderSpiritualCenter();
      }
    });
  };

  window.speakCurrentCleanDua = function () {
    const allDuas = getMergedDuasCollection();
    let filteredDuas = [];
    if (currentDuaFilterCat === 'all') {
      filteredDuas = allDuas;
    } else if (window.AUTHENTIC_DUAS_DATA && window.AUTHENTIC_DUAS_DATA[currentDuaFilterCat]) {
      filteredDuas = window.AUTHENTIC_DUAS_DATA[currentDuaFilterCat];
    } else {
      filteredDuas = allDuas.filter(d => d.category === currentDuaFilterCat);
    }
    const d = filteredDuas[currentDuaPageIdx] || allDuas[0];
    if (d) {
      window.playSpecificDuaAudio(d.id);
    }
  };

  // Initialize on DOMContentLoaded / load
  function initV4Master() {
    const savedTheme = localStorage.getItem('quran_neo3d_theme') || 'emerald3d';
    applyNeo3DTheme(savedTheme);
    loadCachedAyahKeysFromDB();
    updateSectionStarButtons();

    // Always open cleanly on Home Menu upon page load / refresh as requested by user
    try {
      localStorage.setItem('quran_active_tab', 'home');
      if (typeof window.switchMainTab === 'function') {
        window.switchMainTab('home', true);
      }
    } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initV4Master);
  } else {
    setTimeout(initV4Master, 50);
  }
})();

  // ============================================================
  // 9. AUTHENTIC PRAYER TIMES & ADHAN ENGINE (Point 5)
  // Offline astronomical calculations for Germany, Iraqi Kurdistan & Iranian Kurdistan
  // ============================================================
  const PRAYER_CITIES = [
    // Germany
    { id: 'berlin', country: 'de', flag: '🇩🇪', countryLabel: 'Deutschland', name: 'Berlin', lat: 52.5200, lng: 13.4050, tz: 1 },
    { id: 'munich', country: 'de', flag: '🇩🇪', countryLabel: 'Deutschland', name: 'München', lat: 48.1351, lng: 11.5820, tz: 1 },
    { id: 'cologne', country: 'de', flag: '🇩🇪', countryLabel: 'Deutschland', name: 'Köln', lat: 50.9375, lng: 6.9603, tz: 1 },
    { id: 'frankfurt', country: 'de', flag: '🇩🇪', countryLabel: 'Deutschland', name: 'Frankfurt am Main', lat: 50.1109, lng: 8.6821, tz: 1 },
    { id: 'hamburg', country: 'de', flag: '🇩🇪', countryLabel: 'Deutschland', name: 'Hamburg', lat: 53.5511, lng: 9.9937, tz: 1 },
    { id: 'stuttgart', country: 'de', flag: '🇩🇪', countryLabel: 'Deutschland', name: 'Stuttgart', lat: 48.7758, lng: 9.1829, tz: 1 },
    { id: 'dusseldorf', country: 'de', flag: '🇩🇪', countryLabel: 'Deutschland', name: 'Düsseldorf', lat: 51.2277, lng: 6.7735, tz: 1 },
    { id: 'dortmund', country: 'de', flag: '🇩🇪', countryLabel: 'Deutschland', name: 'Dortmund', lat: 51.5136, lng: 7.4653, tz: 1 },
    { id: 'essen', country: 'de', flag: '🇩🇪', countryLabel: 'Deutschland', name: 'Essen', lat: 51.4556, lng: 7.0116, tz: 1 },
    { id: 'hannover', country: 'de', flag: '🇩🇪', countryLabel: 'Deutschland', name: 'Hannover', lat: 52.3759, lng: 9.7320, tz: 1 },
    { id: 'nuremberg', country: 'de', flag: '🇩🇪', countryLabel: 'Deutschland', name: 'Nürnberg', lat: 49.4521, lng: 11.0767, tz: 1 },
    { id: 'bremen', country: 'de', flag: '🇩🇪', countryLabel: 'Deutschland', name: 'Bremen', lat: 53.0793, lng: 8.8017, tz: 1 },

    // Iraqi Kurdistan
    { id: 'erbil', country: 'iq_krd', flag: '☀️', countryLabel: 'باشووری کوردستان (هەرێم)', name: 'Erbil (Hewlêr)', lat: 36.1901, lng: 44.0091, tz: 3 },
    { id: 'sulaymaniyah', country: 'iq_krd', flag: '☀️', countryLabel: 'باشووری کوردستان (هەرێم)', name: 'Sulaymaniyah (Silêmanî)', lat: 35.5558, lng: 45.4351, tz: 3 },
    { id: 'duhok', country: 'iq_krd', flag: '☀️', countryLabel: 'باشووری کوردستان (هەرێم)', name: 'Duhok (Dihok)', lat: 36.8679, lng: 42.9885, tz: 3 },
    { id: 'halabja', country: 'iq_krd', flag: '☀️', countryLabel: 'باشووری کوردستان (هەرێم)', name: 'Halabja (Helebce)', lat: 35.1778, lng: 45.9861, tz: 3 },
    { id: 'zakho', country: 'iq_krd', flag: '☀️', countryLabel: 'باشووری کوردستان (هەرێم)', name: 'Zakho (Zaxo)', lat: 37.1439, lng: 42.6877, tz: 3 },
    { id: 'kirkuk', country: 'iq_krd', flag: '☀️', countryLabel: 'باشووری کوردستان (هەرێم)', name: 'Kirkuk (Kerkûk)', lat: 35.4681, lng: 44.3922, tz: 3 },
    { id: 'soran', country: 'iq_krd', flag: '☀️', countryLabel: 'باشووری کوردستان (هەرێم)', name: 'Soran', lat: 36.6534, lng: 44.5422, tz: 3 },
    { id: 'ranya', country: 'iq_krd', flag: '☀️', countryLabel: 'باشووری کوردستان (هەرێم)', name: 'Ranya', lat: 36.2550, lng: 44.8825, tz: 3 },

    // Iranian Kurdistan
    { id: 'sanandaj', country: 'ir_krd', flag: '☀️', countryLabel: 'ڕۆژهەڵاتی کوردستان', name: 'Sanandaj (Sine)', lat: 35.3219, lng: 46.9862, tz: 3.5 },
    { id: 'mahabad', country: 'ir_krd', flag: '☀️', countryLabel: 'ڕۆژهەڵاتی کوردستان', name: 'Mahabad (Mehabad)', lat: 36.7631, lng: 45.7222, tz: 3.5 },
    { id: 'kermanshah', country: 'ir_krd', flag: '☀️', countryLabel: 'ڕۆژهەڵاتی کوردستان', name: 'Kermanshah (Kirmaşan)', lat: 34.3142, lng: 47.0650, tz: 3.5 },
    { id: 'saqqez', country: 'ir_krd', flag: '☀️', countryLabel: 'ڕۆژهەڵاتی کوردستان', name: 'Saqqez (Seqiz)', lat: 36.2499, lng: 46.2735, tz: 3.5 },
    { id: 'marivan', country: 'ir_krd', flag: '☀️', countryLabel: 'ڕۆژهەڵاتی کوردستان', name: 'Marivan (Merîwan)', lat: 35.5269, lng: 46.1764, tz: 3.5 },
    { id: 'baneh', country: 'ir_krd', flag: '☀️', countryLabel: 'ڕۆژهەڵاتی کوردستان', name: 'Baneh (Bane)', lat: 35.9975, lng: 45.8853, tz: 3.5 },
    { id: 'bukan', country: 'ir_krd', flag: '☀️', countryLabel: 'ڕۆژهەڵاتی کوردستان', name: 'Bukan (Bokan)', lat: 36.5208, lng: 46.2089, tz: 3.5 },
    { id: 'ilam', country: 'ir_krd', flag: '☀️', countryLabel: 'ڕۆژهەڵاتی کوردستان', name: 'Ilam (Îlam)', lat: 33.6374, lng: 46.4227, tz: 3.5 },
    { id: 'piranshahr', country: 'ir_krd', flag: '☀️', countryLabel: 'ڕۆژهەڵاتی کوردستان', name: 'Piranshahr (Pîranşar)', lat: 36.7011, lng: 45.1414, tz: 3.5 }
  ];

  window.PRAYER_CITIES = PRAYER_CITIES;

  let prayerSettings = {
    cityId: localStorage.getItem('quran_prayer_city') || 'berlin',
    adhanVoice: localStorage.getItem('quran_prayer_voice') || 'makkah',
    adhanEnabled: localStorage.getItem('quran_prayer_sound') !== 'false'
  };

  function getSelectedPrayerCity() {
    return PRAYER_CITIES.find(c => c.id === prayerSettings.cityId) || PRAYER_CITIES[0];
  }

  function computeLocalPrayerTimes(city, date) {
    const d = date || new Date();
    let effectiveTz = city.tz;
    if (city.country === 'de') {
      const year = d.getFullYear();
      const lastSunMarch = new Date(year, 2, 31 - (new Date(year, 2, 31).getDay()));
      const lastSunOct = new Date(year, 9, 31 - (new Date(year, 9, 31).getDay()));
      if (d >= lastSunMarch && d < lastSunOct) effectiveTz = 2; // CEST
    }

    const dayOfYear = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    const B = 360 / 365 * (dayOfYear - 81) * Math.PI / 180;
    const eqTime = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
    const solarDec = 23.45 * Math.sin((360 / 365 * (dayOfYear - 81)) * Math.PI / 180) * Math.PI / 180;

    const noonLocal = 12 + effectiveTz - (city.lng / 15) - (eqTime / 60);
    const latRad = city.lat * Math.PI / 180;
    const fajrAngle = (city.country === 'ir_krd' ? 17.7 : 18.0) * Math.PI / 180;
    const ishaAngle = (city.country === 'ir_krd' ? 14.0 : 17.0) * Math.PI / 180;

    function hourAngle(alt) {
      const cosH = (Math.sin(alt) - Math.sin(latRad) * Math.sin(solarDec)) / (Math.cos(latRad) * Math.cos(solarDec));
      if (cosH > 1) return 0;
      if (cosH < -1) return Math.PI;
      return Math.acos(cosH);
    }

    const sunriseAlt = (-0.8333) * Math.PI / 180;
    const sunriseH = hourAngle(sunriseAlt) * (180 / Math.PI) / 15;
    const fajrH = hourAngle(-fajrAngle) * (180 / Math.PI) / 15;
    const ishaH = hourAngle(-ishaAngle) * (180 / Math.PI) / 15;

    const asrAlt = Math.atan(1 / (1 + Math.tan(Math.abs(latRad - solarDec))));
    const asrH = hourAngle(asrAlt) * (180 / Math.PI) / 15;

    function formatTime(decHours) {
      let h = Math.floor(decHours);
      let m = Math.floor((decHours - h) * 60);
      if (m >= 60) { h++; m = 0; }
      h = (h % 24 + 24) % 24;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }

    return {
      fajr: formatTime(noonLocal - fajrH),
      sunrise: formatTime(noonLocal - sunriseH),
      dhuhr: formatTime(noonLocal),
      asr: formatTime(noonLocal + asrH),
      maghrib: formatTime(noonLocal + sunriseH),
      isha: formatTime(noonLocal + ishaH)
    };
  }

  function updateHomePrayerTimesWidget() {
    const city = getSelectedPrayerCity();
    const times = computeLocalPrayerTimes(city);
    const now = new Date();
    const curMinutes = now.getHours() * 60 + now.getMinutes();

    const curLang = localStorage.getItem('quran_app_language') || (typeof state !== 'undefined' && state.lang) || 'ku';
    const isKu = (curLang === 'ku');

    const cityLabelEl = document.getElementById('ptWidgetCityLabel');
    if (cityLabelEl) {
      cityLabelEl.innerHTML = `${city.flag} ${city.name}`;
    }

    const subLabelEl = document.getElementById('ptWidgetSubLabel');
    if (subLabelEl) {
      subLabelEl.textContent = isKu ? 'کاتی نوێژەکان' : 'Authentische Gebetszeiten';
    }

    const prayerDefs = [
      { key: 'fajr', nameDe: 'Fadschr', nameKu: 'بەیانی', nameAr: 'الفجر', time: times.fajr },
      { key: 'dhuhr', nameDe: 'Dhuhr', nameKu: 'نیوەڕۆ', nameAr: 'الظهر', time: times.dhuhr },
      { key: 'asr', nameDe: 'Asr', nameKu: 'عەسر', nameAr: 'العصر', time: times.asr },
      { key: 'maghrib', nameDe: 'Maghrib', nameKu: 'مەغریب', nameAr: 'المغرب', time: times.maghrib },
      { key: 'isha', nameDe: 'Ischa', nameKu: 'عیشا', nameAr: 'العشاء', time: times.isha }
    ];

    let nextP = null;
    let nextPMin = 9999;
    prayerDefs.forEach(p => {
      const [ph, pm] = p.time.split(':').map(Number);
      const pTotal = ph * 60 + pm;
      if (pTotal > curMinutes && pTotal < nextPMin) {
        nextPMin = pTotal;
        nextP = p;
      }
    });

    if (!nextP) {
      nextP = prayerDefs[0];
      const [fh, fm] = nextP.time.split(':').map(Number);
      nextPMin = (24 * 60) + (fh * 60 + fm);
    }

    const diffMinutes = nextPMin - curMinutes;
    const diffHours = Math.floor(diffMinutes / 60);
    const diffRemMin = diffMinutes % 60;
    const diffSec = 59 - now.getSeconds();

    const nameEl = document.getElementById('ptNextPrayerName');
    const countEl = document.getElementById('ptNextPrayerCountdown');

    const displayName = isKu ? nextP.nameKu : nextP.nameDe;
    if (nameEl) nameEl.textContent = `${displayName} (${nextP.nameAr})`;
    if (countEl) countEl.textContent = `-${String(diffHours).padStart(2, '0')}:${String(diffRemMin).padStart(2, '0')}:${String(diffSec).padStart(2, '0')}`;

    const grid = document.getElementById('ptTimesRowGrid');
    if (grid) {
      grid.innerHTML = prayerDefs.map(p => {
        const isNext = (nextP && nextP.key === p.key);
        const pLabel = isKu ? p.nameKu : p.nameDe;
        return `
          <div class="pt-compact-tile ${isNext ? 'is-active' : ''}">
            <div style="font-size: 0.56rem; color: ${isNext ? '#a7f3d0' : '#94a3b8'}; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${pLabel}</div>
            <div style="font-family: 'Amiri Quran', var(--quran-font); font-size: 0.74rem; color: #fbbf24; margin: 0; line-height: 1.15;">${p.nameAr}</div>
            <div style="font-size: 0.72rem; font-weight: 900; color: ${isNext ? '#fff' : '#e2e8f0'}; font-family: monospace;">${p.time}</div>
          </div>
        `;
      }).join('');
    }
  }

  window.MAWAQIT_ADHAN_LIST = [
    {
      id: 'afassy_fajr',
      name: 'Al Afassy (Fadjr)',
      nameKu: 'ئەلعه‌فاسی (بەیانی)',
      subtitle: 'Fajr Adhān',
      subtitleKu: 'بانگی بەیانی',
      durationStr: '0:20',
      file: 'audio/adhan/adhan_afassy_fajr.mp3',
      cdn: 'https://cdn.mawaqit.net/audio/adhan-afassy-fajr.mp3',
      avatar: 'images/adhan_avatars/saudi.svg'
    },
    {
      id: 'qods',
      name: 'Qods',
      nameKu: 'قودس (ئەلئەقسا)',
      subtitle: 'Al-Aqsa Mosque',
      subtitleKu: 'مزگەوتی ئەقسا',
      durationStr: '0:26',
      file: 'audio/adhan/adhan_qods.mp3',
      cdn: 'https://cdn.mawaqit.net/audio/adhan-quds.mp3',
      avatar: 'images/adhan_avatars/palestine.svg'
    },
    {
      id: 'madinah',
      name: 'Madinah',
      nameKu: 'مەدینەی مونەوەرە',
      subtitle: 'Al-Masjid an-Nabawi',
      subtitleKu: 'مزگەوتی پێغەمبەر (د.خ)',
      durationStr: '0:18',
      file: 'audio/adhan/adhan_madinah.mp3',
      cdn: 'https://cdn.mawaqit.net/audio/adhan-madina.mp3',
      avatar: 'images/adhan_avatars/saudi.svg'
    },
    {
      id: 'makkah_fajr',
      name: 'Makkah (Fadjr)',
      nameKu: 'مەککە (بەیانی)',
      subtitle: 'Masjid al-Haram',
      subtitleKu: 'مزگەوتی حەرام',
      durationStr: '0:17',
      file: 'audio/adhan/adhan_makkah_fajr.mp3',
      cdn: 'https://archive.org/download/AlharamAlmakki_20150927_1230/AdhanAlfajr13-12-1436.mp3',
      avatar: 'images/adhan_avatars/saudi.svg'
    },
    {
      id: 'abdulbassit',
      name: 'Abdul Bassit',
      nameKu: 'عەبدولباست عەبدولسەمەد',
      subtitle: 'Classic Studio HD',
      subtitleKu: 'دەنگی مێژوویی و دەگمەن',
      durationStr: '0:29',
      file: 'audio/adhan/adhan_egypt.mp3',
      cdn: 'https://cdn.mawaqit.net/audio/adhan-egypt.mp3',
      avatar: 'images/adhan_avatars/saudi.svg'
    },
    {
      id: 'jazy',
      name: 'Muhammad Jazy',
      nameKu: 'محەممەد جازی',
      subtitle: 'Maqam Kurd (Jordan)',
      subtitleKu: 'مەقامی کورد (ئەردەن)',
      durationStr: '0:25',
      file: 'audio/adhan/adhan_muhammad_jazy.mp3',
      cdn: 'audio/adhan/adhan_muhammad_jazy.mp3',
      avatar: 'images/adhan_avatars/saudi.svg'
    }
  ];

  let activePlayingAdhanId = null;

  function savePrayerSettings() {
    try {
      localStorage.setItem('quran_prayer_city', prayerSettings.cityId || 'berlin');
      localStorage.setItem('quran_prayer_voice', prayerSettings.adhanVoice || 'qods');
      localStorage.setItem('quran_prayer_sound', (prayerSettings.autoPlayAdhan !== false).toString());
    } catch (e) {}
  }
  function getOrCreatePersistentAdhanPlayer() {
    let player = document.getElementById('mawaqitAdhanAudioPlayer');
    if (!player) {
      player = document.createElement('audio');
      player.id = 'mawaqitAdhanAudioPlayer';
      player.preload = 'auto';
      player.setAttribute('playsinline', '');
      player.setAttribute('webkit-playsinline', '');
      document.body.appendChild(player);

      player.onended = function () {
        activePlayingAdhanId = null;
        updateMawaqitCardStates();
      };

      player.onerror = function () {
        const item = window.MAWAQIT_ADHAN_LIST.find(v => v.id === activePlayingAdhanId);
        if (item && item.cdn && player.src !== item.cdn) {
          console.warn('Switching to CDN audio for:', item.id);
          player.src = item.cdn;
          player.play().catch(e => {
            console.warn('Fallback play failed:', e);
            playHarmonicAdhanChime();
            activePlayingAdhanId = null;
            updateMawaqitCardStates();
          });
        } else {
          playHarmonicAdhanChime();
          activePlayingAdhanId = null;
          updateMawaqitCardStates();
        }
      };
    }
    return player;
  }

  window.openPrayerSettingsModal = function () {
    let modal = document.getElementById('prayerSettingsModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'prayerSettingsModal';
      modal.className = 'neo3d-modal-overlay';
      document.body.appendChild(modal);

      modal.addEventListener('click', function(e) {
        if (e.target === modal) {
          window.closePrayerSettingsModal();
        }
      });
    }

    const city = getSelectedPrayerCity();
    const curLang = localStorage.getItem('quran_app_language') || (typeof state !== 'undefined' && state.lang) || 'ku';
    const isKu = (curLang === 'ku');
    const isFa = (curLang === 'fa');
    const isRtl = (isKu || isFa);

    const silentBypass = localStorage.getItem('quran_adhan_silent_override') === 'true';
    const autoAdhan = prayerSettings.autoPlayAdhan !== false;
    const selectedVoiceId = prayerSettings.adhanVoice || 'qods';

    modal.dir = isRtl ? 'rtl' : 'ltr';
    modal.style.direction = isRtl ? 'rtl' : 'ltr';

    modal.innerHTML = `
      <div class="neo3d-modal-content" onclick="event.stopPropagation();" style="
        position: relative;
        width: 100%;
        max-width: 320px;
        max-height: 86vh;
        overflow-y: auto;
        overflow-x: hidden;
        border-radius: 18px;
        background: linear-gradient(165deg, rgba(10, 18, 32, 0.98) 0%, rgba(4, 9, 18, 0.99) 100%);
        border: 1.2px solid rgba(251, 191, 36, 0.35);
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.95), 0 0 30px rgba(56, 189, 248, 0.15);
        padding: 12px 12px 11px;
        box-sizing: border-box;
        text-align: ${isRtl ? 'right' : 'left'};
        direction: ${isRtl ? 'rtl' : 'ltr'};
      ">
        <!-- Compact Header -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 9px; padding-bottom: 7px; border-bottom: 1px solid rgba(251, 191, 36, 0.2);">
          <div style="display: flex; align-items: center; gap: 7px;">
            <div style="width: 25px; height: 25px; border-radius: 8px; background: linear-gradient(135deg, #0ea5e9, #0369a1); display: flex; align-items: center; justify-content: center; font-size: 0.74rem; color: #fff; flex-shrink: 0; box-shadow: 0 2px 6px rgba(14, 165, 233, 0.35);">
              <i class="fa-solid fa-mosque"></i>
            </div>
            <div>
              <h3 style="margin: 0; font-size: 0.84rem; font-weight: 800; color: #f8fafc;${isRtl ? ' font-family: \'Noto Kufi Arabic\', sans-serif;' : ''}">${isFa ? 'اوقات شرعی نماز و اذان' : (isKu ? 'کاتەکانی نوێژ و بانگ' : 'Gebetszeiten & Adhān')}</h3>
            </div>
          </div>
          <button type="button" onclick="closePrayerSettingsModal()" ontouchend="closePrayerSettingsModal()" style="width: 26px; height: 26px; border-radius: 50%; background: rgba(255,255,255,0.08); border: 1px solid rgba(251,191,36,0.3); color: #fbbf24; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.78rem; flex-shrink: 0; padding: 0; -webkit-tap-highlight-color: transparent;">✕</button>
        </div>

        <!-- 1. City / Location Selection -->
        <div style="margin-bottom: 9px;">
          <label style="font-size: 0.68rem; font-weight: 700; color: #fde68a; display: flex; align-items: center; gap: 4px; margin-bottom: 4px;${isRtl ? ' font-family: \'Noto Kufi Arabic\', sans-serif;' : ''}">
            <i class="fa-solid fa-location-dot" style="color: #38bdf8; font-size: 0.65rem;"></i> ${isFa ? 'شهر / موقعیت مکانی:' : (isKu ? 'شار / شوێن:' : 'Standort / Stadt:')}
          </label>
          <div style="position: relative;">
            <select id="prayerCitySelect" onchange="onPrayerCityChanged(this.value)" style="
              width: 100%;
              box-sizing: border-box;
              height: 31px;
              padding: 0 10px;
              border-radius: 9px;
              background: rgba(15, 23, 42, 0.95);
              border: 1px solid rgba(56, 189, 248, 0.35);
              color: #f8fafc;
              font-weight: 700;
              font-size: 0.73rem;
              outline: none;
              cursor: pointer;
              ${isRtl ? ' font-family: \'Noto Kufi Arabic\', sans-serif;' : ''}
            ">
              <optgroup label="${isFa ? '🇩🇪 آلمان' : (isKu ? '🇩🇪 ئەڵمانیا' : '🇩🇪 Deutschland')}">
                ${PRAYER_CITIES.filter(c => c.country === 'de').map(c => `<option value="${c.id}" ${c.id === prayerSettings.cityId ? 'selected' : ''}>${c.flag} ${c.name}</option>`).join('')}
              </optgroup>
              <optgroup label="${isFa ? '☀️ کردستان عراق (باشور)' : (isKu ? '☀️ باشووری کوردستان' : '☀️ باشووری کوردستان (Iraqi Kurdistan)')}">
                ${PRAYER_CITIES.filter(c => c.country === 'iq_krd').map(c => `<option value="${c.id}" ${c.id === prayerSettings.cityId ? 'selected' : ''}>${c.flag} ${c.name}</option>`).join('')}
              </optgroup>
              <optgroup label="${isFa ? '☀️ کردستان ایران (روژهلات)' : (isKu ? '☀️ ڕۆژهەڵاتی کوردستان' : '☀️ ڕۆژهەڵاتی کوردستان (Iranian Kurdistan)')}">
                ${PRAYER_CITIES.filter(c => c.country === 'ir_krd').map(c => `<option value="${c.id}" ${c.id === prayerSettings.cityId ? 'selected' : ''}>${c.flag} ${c.name}</option>`).join('')}
              </optgroup>
            </select>
          </div>
        </div>

        <!-- 2. Mawaqit-Style Adhan Voices List -->
        <div style="margin-bottom: 9px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <label style="font-size: 0.68rem; font-weight: 700; color: #fde68a; display: flex; align-items: center; gap: 4px;${isRtl ? ' font-family: \'Noto Kufi Arabic\', sans-serif;' : ''}">
              <i class="fa-solid fa-microphone-lines" style="color: #fbbf24; font-size: 0.66rem;"></i> ${isFa ? 'صدای اذان (مؤذن):' : (isKu ? 'دەنگی بانگ (بانگبێژ):' : 'Adhān-Stimme (Muezzin):')}
            </label>
            <span style="font-size: 0.58rem; color: #94a3b8; font-weight: 600;">${isRtl ? 'استودیو مواقیت' : 'Mawaqit Studio'}</span>
          </div>

          <!-- Scrollable Mawaqit List Cards -->
          <div id="mawaqitAdhanListContainer" style="
            display: flex;
            flex-direction: column;
            gap: 4px;
            max-height: 195px;
            overflow-y: auto;
            overflow-x: hidden;
            padding-right: 2px;
            box-sizing: border-box;
          ">
            ${window.MAWAQIT_ADHAN_LIST.map(item => {
              const isSelected = (selectedVoiceId === item.id);
              const isPlaying = (activePlayingAdhanId === item.id);
              const displayName = isKu ? item.nameKu : item.name;
              const displaySub = isKu ? item.subtitleKu : item.subtitle;

              return `
                <div id="mawaqitRow_${item.id}" onclick="handleMawaqitItemClick('${item.id}')" style="
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  padding: 5px 8px;
                  border-radius: 11px;
                  cursor: pointer;
                  transition: all 0.2s ease;
                  box-sizing: border-box;
                  background: ${isSelected 
                    ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.42) 0%, rgba(139, 92, 246, 0.55) 100%)' 
                    : 'rgba(255, 255, 255, 0.035)'};
                  border: 1px solid ${isSelected ? 'rgba(167, 139, 250, 0.65)' : 'rgba(255, 255, 255, 0.07)'};
                  box-shadow: ${isSelected ? '0 3px 12px rgba(124, 58, 237, 0.25)' : 'none'};
                ">
                  <!-- Left: Play/Stop button + Avatar + Name -->
                  <div style="display: flex; align-items: center; gap: 8px; min-width: 0;">
                    <!-- Play / Pause Icon Button -->
                    <button type="button" id="mawaqitPlayBtn_${item.id}" onclick="event.stopPropagation(); handleMawaqitItemClick('${item.id}');" style="
                      width: 25px;
                      height: 25px;
                      border-radius: 50%;
                      background: ${isPlaying ? '#ef4444' : (isSelected ? '#ffffff' : 'rgba(255,255,255,0.12)')};
                      border: none;
                      color: ${isPlaying ? '#ffffff' : (isSelected ? '#4f46e5' : '#ffffff')};
                      cursor: pointer;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      font-size: 0.64rem;
                      flex-shrink: 0;
                      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                      transition: all 0.15s ease;
                      padding: 0;
                    ">
                      <i class="fa-solid ${isPlaying ? 'fa-stop' : 'fa-play'}" style="${!isPlaying && !isKu ? 'margin-left: 1.5px;' : ''}"></i>
                    </button>

                    <!-- Circular Reciter Avatar -->
                    <div style="
                      width: 26px;
                      height: 26px;
                      border-radius: 50%;
                      overflow: hidden;
                      background: #0f172a;
                      border: 1px solid rgba(255,255,255,0.2);
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      flex-shrink: 0;
                    ">
                      <img src="${item.avatar}" alt="${displayName}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.outerHTML='<span style=\'font-size:0.7rem;\'>🎙️</span>';" />
                    </div>

                    <!-- Titles -->
                    <div style="min-width: 0; text-align: ${isKu ? 'right' : 'left'};">
                      <div style="
                        font-size: 0.72rem;
                        font-weight: 700;
                        color: #ffffff;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        ${isKu ? ' font-family: \'Noto Kufi Arabic\', sans-serif;' : ''}
                      ">${displayName}</div>
                      <div style="
                        font-size: 0.55rem;
                        color: ${isSelected ? '#e0e7ff' : '#94a3b8'};
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        ${isKu ? ' font-family: \'Noto Kufi Arabic\', sans-serif;' : ''}
                      ">${displaySub}</div>
                    </div>
                  </div>

                  <!-- Right: Duration + Checkmark -->
                  <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
                    <span style="font-size: 0.62rem; color: ${isSelected ? '#f5f3ff' : '#64748b'}; font-weight: 700; font-family: monospace;">${item.durationStr}</span>
                    <div id="mawaqitCheck_${item.id}" style="width: 16px; height: 16px; border-radius: 50%; background: #ffffff; display: ${isSelected ? 'flex' : 'none'}; align-items: center; justify-content: center; color: #4f46e5; font-size: 0.55rem; font-weight: 900; box-shadow: 0 1px 4px rgba(0,0,0,0.2);">
                      <i class="fa-solid fa-check"></i>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- 3. Toggle: Automatischen Adhan abspielen -->
        <div style="margin-bottom: 6px; background: rgba(255,255,255,0.035); border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 6px 9px; display: flex; align-items: center; justify-content: space-between; box-sizing: border-box; width: 100%;">
          <div style="min-width: 0; padding-${isRtl ? 'left' : 'right'}: 4px;">
            <div style="font-weight: 700; font-size: 0.71rem; color: #fff;${isRtl ? ' font-family: \'Noto Kufi Arabic\', sans-serif;' : ''}">${isFa ? 'پخش خودکار اذان در وقت نماز' : (isKu ? 'بانگدان لە کاتی نوێژدا' : 'Adhān zur Gebetszeit')}</div>
            <div style="font-size: 0.55rem; color: #94a3b8;${isRtl ? ' font-family: \'Noto Kufi Arabic\', sans-serif;' : ''}">${isFa ? 'پخش دقیق و سروقت بانگ اذان' : (isKu ? 'لێدانی بانگ لە کاتی خۆیدا' : 'Pünktlich zum Gebet abspielen')}</div>
          </div>
          <div onclick="toggleAutoAdhanSetting()" style="width: 29px; height: 17px; background: ${autoAdhan ? '#10b981' : '#475569'}; border-radius: 9px; position: relative; cursor: pointer; box-shadow: ${autoAdhan ? '0 0 6px rgba(16, 185, 129, 0.45)' : 'none'}; flex-shrink: 0; transition: all 0.2s ease;">
            <div style="width: 11px; height: 11px; background: #fff; border-radius: 50%; position: absolute; ${isRtl ? (autoAdhan ? 'left: 3px;' : 'right: 3px;') : (autoAdhan ? 'right: 3px;' : 'left: 3px;')} top: 3px; transition: all 0.2s ease;"></div>
          </div>
        </div>

        <!-- 4. Silent Mode Override (Auch im Lautlos-Modus abspielen) -->
        <div style="margin-bottom: 10px; background: rgba(251, 191, 36, 0.06); border: 1px solid rgba(251, 191, 36, 0.25); border-radius: 10px; padding: 6px 9px; display: flex; align-items: center; justify-content: space-between; box-sizing: border-box; width: 100%;">
          <div style="min-width: 0; padding-${isRtl ? 'left' : 'right'}: 4px;">
            <div style="font-weight: 800; font-size: 0.71rem; color: #fef08a; display: flex; align-items: center; gap: 4px;${isRtl ? ' font-family: \'Noto Kufi Arabic\', sans-serif;' : ''}">
              <i class="fa-solid fa-bell" style="color: #fbbf24; font-size: 0.62rem;"></i> ${isFa ? 'پخش در حالت سکوت (سایلنت)' : (isKu ? 'لە دۆخی بێ‌دەنگیشدا' : 'Im Lautlos-Modus abspielen')}
            </div>
            <div style="font-size: 0.55rem; color: #cbd5e1; margin-top: 1px;${isRtl ? ' font-family: \'Noto Kufi Arabic\', sans-serif;' : ''}">
              ${isFa ? 'پخش زنگ اذان حتی هنگام بی‌صدا بودن گوشی' : (isKu ? 'دەنگی بانگ تەنانەت لەسەر بێ‌دەنگیش لێبدات' : 'Erzwingt Ton auch bei stummgeschaltetem Handy')}
            </div>
          </div>
          <div id="ptSilentBypassSwitch" onclick="toggleSilentBypassSetting()" style="width: 29px; height: 17px; background: ${silentBypass ? '#10b981' : '#475569'}; border-radius: 9px; position: relative; cursor: pointer; box-shadow: ${silentBypass ? '0 0 6px rgba(16, 185, 129, 0.45)' : 'none'}; flex-shrink: 0; transition: all 0.2s ease;">
            <div style="width: 11px; height: 11px; background: #fff; border-radius: 50%; position: absolute; ${isRtl ? (silentBypass ? 'left: 3px;' : 'right: 3px;') : (silentBypass ? 'right: 3px;' : 'left: 3px;')} top: 3px; transition: all 0.2s ease;"></div>
          </div>
        </div>

        <!-- Save Button: Closes modal and saves settings -->
        <button type="button" onclick="closePrayerSettingsModal()" ontouchend="closePrayerSettingsModal()" style="
          width: 100%;
          height: 34px;
          border-radius: 10px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border: none;
          color: #fff;
          font-weight: 800;
          font-size: 0.78rem;
          cursor: pointer;
          box-shadow: 0 4px 10px rgba(16, 185, 129, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          box-sizing: border-box;
          -webkit-tap-highlight-color: transparent;
          ${isRtl ? ' font-family: \'Noto Kufi Arabic\', sans-serif;' : ''}
        ">
          <i class="fa-solid fa-check"></i> ${isFa ? 'ذخیره تنظیمات و بستن' : (isKu ? 'پاشەکەوتکردن و داخستن' : 'Speichern & Schließen')}
        </button>
      </div>
    `;

    modal.classList.add('open');
    modal.style.display = 'flex';
  };

  window.handleMawaqitItemClick = function (voiceId) {
    const player = getOrCreatePersistentAdhanPlayer();

    // If already playing this voice -> STOP it
    if (activePlayingAdhanId === voiceId && !player.paused) {
      player.pause();
      player.currentTime = 0;
      activePlayingAdhanId = null;
      updateMawaqitCardStates();
      return;
    }

    // Stop whatever else might be playing
    try { player.pause(); player.currentTime = 0; } catch (e) {}

    // Select this voice
    prayerSettings.adhanVoice = voiceId;
    savePrayerSettings();

    const voiceItem = window.MAWAQIT_ADHAN_LIST.find(v => v.id === voiceId) || window.MAWAQIT_ADHAN_LIST[0];

    activePlayingAdhanId = voiceId;
    updateMawaqitCardStates();

    // Synchronously set src and play immediately during user touch/click
    player.src = voiceItem.file;
    player.currentTime = 0;

    const p = player.play();
    if (p !== undefined) {
      p.catch(err => {
        console.warn('Playback error with local file:', voiceItem.file, err);
        if (voiceItem.cdn && player.src !== voiceItem.cdn) {
          player.src = voiceItem.cdn;
          player.play().catch(e2 => {
            console.warn('Fallback play error:', e2);
            playHarmonicAdhanChime();
            activePlayingAdhanId = null;
            updateMawaqitCardStates();
          });
        } else {
          playHarmonicAdhanChime();
          activePlayingAdhanId = null;
          updateMawaqitCardStates();
        }
      });
    }
  };

  // Backwards compatibility helper
  window.selectMawaqitAdhan = function (voiceId) {
    window.handleMawaqitItemClick(voiceId);
  };
  window.playOrStopMawaqitAdhan = function (voiceId) {
    window.handleMawaqitItemClick(voiceId);
  };

  function updateMawaqitCardStates() {
    const selectedVoiceId = prayerSettings.adhanVoice || 'qods';
    const curLang = localStorage.getItem('quran_app_language') || (typeof state !== 'undefined' && state.lang) || 'ku';
    const isKu = (curLang === 'ku');

    window.MAWAQIT_ADHAN_LIST.forEach(item => {
      const row = document.getElementById('mawaqitRow_' + item.id);
      const btn = document.getElementById('mawaqitPlayBtn_' + item.id);
      const check = document.getElementById('mawaqitCheck_' + item.id);

      const isSelected = (selectedVoiceId === item.id);
      const isPlaying = (activePlayingAdhanId === item.id);

      if (row) {
        row.style.background = isSelected 
          ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.42) 0%, rgba(139, 92, 246, 0.55) 100%)' 
          : 'rgba(255, 255, 255, 0.035)';
        row.style.borderColor = isSelected ? 'rgba(167, 139, 250, 0.65)' : 'rgba(255, 255, 255, 0.07)';
        row.style.boxShadow = isSelected ? '0 3px 12px rgba(124, 58, 237, 0.25)' : 'none';
      }

      if (btn) {
        btn.style.background = isPlaying ? '#ef4444' : (isSelected ? '#ffffff' : 'rgba(255,255,255,0.12)');
        btn.style.color = isPlaying ? '#ffffff' : (isSelected ? '#4f46e5' : '#ffffff');
        const icon = btn.querySelector('i');
        if (icon) {
          icon.className = 'fa-solid ' + (isPlaying ? 'fa-stop' : 'fa-play');
          icon.style.marginLeft = (!isPlaying && !isKu) ? '1.5px' : '0px';
        }
      }

      if (check) {
        check.style.display = isSelected ? 'flex' : 'none';
      }
    });
  }

  window.closePrayerSettingsModal = function () {
    const modal = document.getElementById('prayerSettingsModal');
    if (modal) {
      modal.classList.remove('open');
      modal.style.display = 'none';
    }
    const player = document.getElementById('mawaqitAdhanAudioPlayer');
    if (player) {
      try { player.pause(); player.currentTime = 0; } catch (e) {}
    }
    activePlayingAdhanId = null;
    updateMawaqitCardStates();
  };

  window.toggleAutoAdhanSetting = function () {
    prayerSettings.autoPlayAdhan = !(prayerSettings.autoPlayAdhan !== false);
    savePrayerSettings();
    openPrayerSettingsModal();
  };

  window.toggleSilentBypassSetting = function () {
    const cur = localStorage.getItem('quran_adhan_silent_override') === 'true';
    localStorage.setItem('quran_adhan_silent_override', (!cur).toString());
    openPrayerSettingsModal();
  };

  window.onPrayerCityChanged = function (cityId) {
    prayerSettings.cityId = cityId;
    savePrayerSettings();
    updateHomePrayerTimesWidget();
    openPrayerSettingsModal();
  };

  function playHarmonicAdhanChime() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') ctx.resume();

      const melody = [
        { f: 293.66, d: 0.6 },
        { f: 329.63, d: 0.8 },
        { f: 349.23, d: 1.2 },
        { f: 329.63, d: 0.8 },
        { f: 293.66, d: 1.4 }
      ];

      let t = ctx.currentTime + 0.05;
      melody.forEach(m => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(m.f, t);

        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.28, t + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + m.d);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + m.d + 0.1);
        t += m.d * 0.85;
      });
    } catch (e) {}
  }


  // Live Timer for Prayer Times (Ticking every second)
  setInterval(() => {
    updateHomePrayerTimesWidget();
  }, 1000);

  // ============================================================
  // 10. CLEAN SINGLE-AYAH AUDIO FOR TAFSĪR & EXEGESIS (Point 13)
  // Ensures clicking a verse in Tafsir plays ONLY that single verse!
  // ============================================================
  let currentTafsirAudio = null;
  let currentTafsirPlayingKey = null;

  window.playSingleTafsirAyah = function (surah, ayah) {
    const s = parseInt(surah, 10) || 1;
    const a = parseInt(ayah, 10) || 1;
    const key = `${s}:${a}`;

    if (currentTafsirAudio && currentTafsirPlayingKey === key) {
      try { currentTafsirAudio.pause(); } catch (e) {}
      currentTafsirAudio = null;
      currentTafsirPlayingKey = null;
      updateTafsirCardsPlayingState();
      return;
    }

    if (currentTafsirAudio) {
      try { currentTafsirAudio.pause(); } catch (e) {}
      currentTafsirAudio = null;
    }

    if (typeof audio !== 'undefined' && audio && !audio.paused) {
      try { audio.pause(); } catch (e) {}
    }

    const sStr = String(s).padStart(3, '0');
    const aStr = String(a).padStart(3, '0');
    const qari = (window.state && window.state.qari) || 'Alafasy_128kbps';
    const cacheKey = `${qari}_${sStr}${aStr}`;
    const primaryUrl = (window.offlineAudioMemoryBlobs && window.offlineAudioMemoryBlobs[cacheKey])
      ? window.offlineAudioMemoryBlobs[cacheKey]
      : `https://everyayah.com/data/${qari}/${sStr}${aStr}.mp3`;
    const fallbackUrl = `https://everyayah.com/data/Alafasy_128kbps/${sStr}${aStr}.mp3`;

    currentTafsirAudio = new Audio(primaryUrl);
    currentTafsirPlayingKey = key;
    updateTafsirCardsPlayingState();

    currentTafsirAudio.onended = function () {
      currentTafsirAudio = null;
      currentTafsirPlayingKey = null;
      updateTafsirCardsPlayingState();
    };

    currentTafsirAudio.onerror = function () {
      if (currentTafsirAudio && currentTafsirAudio.src !== fallbackUrl) {
        currentTafsirAudio.src = fallbackUrl;
        currentTafsirAudio.play().catch(() => {
          currentTafsirPlayingKey = null;
          updateTafsirCardsPlayingState();
        });
      }
    };

    currentTafsirAudio.play().catch(() => {
      currentTafsirAudio.src = fallbackUrl;
      currentTafsirAudio.play().catch(() => {
        currentTafsirPlayingKey = null;
        updateTafsirCardsPlayingState();
      });
    });

    if (typeof showToast === 'function') {
      showToast(`🔊 Sure ${s} : Vers ${a} wird angehört...`);
    }
  };

  function updateTafsirCardsPlayingState() {
    document.querySelectorAll('.tafsir-card').forEach(card => {
      const cardKey = card.getAttribute('data-ayah-key');
      const btn = card.querySelector('.tafsir-play-btn');
      if (cardKey === currentTafsirPlayingKey) {
        card.style.borderColor = 'var(--gold-primary)';
        card.style.boxShadow = '0 0 16px rgba(229,184,76,0.35)';
        if (btn) btn.innerHTML = '<i class="fa-solid fa-stop"></i> <span>Stopp</span>';
      } else {
        card.style.borderColor = '';
        card.style.boxShadow = '';
        if (btn) btn.innerHTML = '<i class="fa-solid fa-volume-high"></i> <span>Vers hören</span>';
      }
    });
  }

  // Initialize Prayer Widget on Load
  setTimeout(updateHomePrayerTimesWidget, 200);



  window.openTafsirNamiPdfModal = function (vol, page) {
    window.currentDedicatedNamiVol = vol || 1;
    window.currentDedicatedNamiPage = page || 1;
    window.switchMainTab('tafsirPdf');
  };

  window.initDedicatedTafsirPdf = function () {
    const sel = document.getElementById('namiDedicatedSurahSelect');
    if (sel && sel.options.length === 0) {
      const surahs = window.ALL_114_SURAHS || [];
      sel.innerHTML = surahs.map(s => '<option value="' + s.id + '">' + s.id + '. سورة ' + (s.arabic || s.name) + ' (' + (s.kurdish || s.germanMeaning || s.name) + ')</option>').join('');
    }
    const targetSurah = (window.state && window.state.tafsirSurah) || 1;
    if (sel) sel.value = targetSurah;
    if (typeof window.setNamiDisplayMode === 'function') {
      window.setNamiDisplayMode(window.currentNamiDisplayMode || 'text');
    }
    window.onDedicatedNamiSurahChanged(targetSurah);
  };


// Universal PopState Hook for Back Button
window.addEventListener('popstate', function (e) {
  if (typeof window.handleAppBackNavigation === 'function') {
    window.handleAppBackNavigation();
  }
});
