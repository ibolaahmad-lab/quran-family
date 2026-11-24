/**
 * =========================================================================
 * MURAJAA PRO HIFZ & MUSHAF SUITE (murajaa_features_engine.js)
 * =========================================================================
 * Complete implementation of the Murajaa iOS App experience:
 * 1. Dedicated "مراجعه مصحف" (Murajaa Mushaf) mode alongside Text & Scan.
 *    - Hides the regular Mushaf toolbar rows and player when active.
 *    - Dedicated Murajaa page with authentic King Fahd Medina frame & typography.
 * 2. Full Trilingual Support (Kurdish Sorani, Persian/Farsi, English, German).
 * 3. Dual View Modes:
 *    - Tilawah (Normal recitation reading)
 *    - Tasmīʿ (Memorization veil/masking words, revealed by speech or tap)
 * 4. Backtracking-Tolerant Voice Recognition (وقف و ابتدا / بازگشت به عقب).
 * 5. Muqatta'at (الحروف المقطعة: الم, يس, حم, طه, كهيعص) & Bismillah Normalization:
 *    - Recognizes spoken "Alif Lam Meem" / "الف لام ميم" as "الم" with 100% precision.
 *    - Advances Surah Al-Baqarah from Ayah 1 ("الم") to Ayah 2 immediately.
 *    - Automatically strips Bismillah from Ayah 1 of all surahs (except Surah 1).
 * 6. Fixes Surah Changing in Sheikh Quiz (#paneQuiz) so users can select any Surah.
 * 7. Word Breakdown & Mistake Tracking Modal (تفکیک حروف با اعراب + یادداشت حفظ).
 * 8. Ayah Quiz Engine (کوئیز آیه قبل و بعد صوتی و متنی).
 * 9. Live Typography & Reciter Settings Modal with centered, working backdrop.
 */

(function () {
  'use strict';

  console.log('[Murajaa Engine] Initializing Murajaa Pro Suite v2.0...');

  window.Murajaa = window.Murajaa || {};

  // =========================================================================
  // 1. TRILINGUAL LOCALIZATION (KURDISH, PERSIAN, ENGLISH, GERMAN)
  // =========================================================================
  const MURAJAA_I18N = {
    ku: {
      btn_mode_text: "دەق",
      btn_mode_scan: "سکان",
      btn_mode_murajaa: "موسحەفی موراجەعە",
      title: "موسحەفی موراجەعە و لەبەرکردن",
      mode_tilawah: "📖 خوێندنەوە (عادی)",
      mode_tasmi: "🧠 تەسمیع (لەبەرکردن)",
      mic_start: "🎙️ ناسینەوەی دەنگ",
      mic_stop: "⏹️ ڕاگرتنی دەنگ",
      mic_listening: "🔴 گوێگرتن لە خوێندنەوە...",
      mic_backtrack: "🔄 گەڕانەوە و دووبارەکردنەوە ناسرایەوە (وقف و ابتدا)",
      mic_not_supported: "⚠️ مایکرۆفۆن لەم وێبگەڕەدا بەردەست نییە یان رێگەی پێ نەدراوە.",
      quiz_btn: "❓ کوئیزی ئایەتەکان",
      settings_btn: "⚙️ فۆنت و قورئانخوێن",
      reveal_all: "👁️ دەرخستنی هەموو",
      hide_all: "🙈 شاردنەوەی هەموو",
      word_breakdown_title: "شیکردنەوەی وشە و هەڵەی لەبەرکردن",
      word_letters_label: "پیت بە پیت بە جیاکردنەوەی بزوێن و ئیعراب:",
      note_label: "تێبینی تایبەت دەربارەی ئەم وشەیە:",
      note_placeholder: "بۆ نموونە: ئاگاداری درێژکردنەوە یان بێدەنگی پیتەکە بە...",
      mark_mistake: "نیشانەکردن وەک هەڵە",
      unmark_mistake: "سڕینەوەی هەڵە",
      save_note: "پاشەکەوتکردنی تێبینی",
      note_saved: "✅ تێبینی وشە پاشەکەوت کرا!",
      quiz_title: "تاقیکردنەوەی ئایەتەکانی موراجەعە",
      quiz_prompt_next: "ئایەتی دواتر چییە؟ بخوێنەوە یان بیر بکەرەوە:",
      quiz_prompt_prev: "ئایەتی پێشتر چی بوو؟",
      quiz_reveal_btn: "پیشاندانی وەڵام",
      quiz_correct_badge: "✨ وەڵامی ڕاست:",
      quiz_next_btn: "پرسیاری دواتر ◄",
      quiz_play_audio: "گوێگرتن لە دەنگ",
      settings_title: "ڕێکخستنی فۆنت و قورئانخوێن",
      font_size_label: "گەورەیی خەت:",
      font_family_label: "شێوازی فۆنت:",
      reciter_label: "قورئانخوێن بۆ دەنگ:",
      close: "داخستن",
      page_label: "لاپەڕە",
      surah_label: "سورەت",
      juz_label: "جوزء"
    },
    fa: {
      btn_mode_text: "متن",
      btn_mode_scan: "اسکن",
      btn_mode_murajaa: "مراجعه مصحف",
      title: "مصحف مراجعة و تثبیت حفظ",
      mode_tilawah: "📖 تلاوت عادی",
      mode_tasmi: "🧠 حالت تسمیع (حفظ)",
      mic_start: "🎙️ شروع تشخیص صدا",
      mic_stop: "⏹️ توقف صدا",
      mic_listening: "🔴 در حال شنیدن تلاوت قرآن...",
      mic_backtrack: "🔄 بازگشت به عقب / وقف و ابتدا تشخیص داده شد",
      mic_not_supported: "⚠️ میکروفون در این مرورگر پشتیبانی نشد یا دسترسی داده نشد.",
      quiz_btn: "❓ آزمون آیات",
      settings_btn: "⚙️ قلم و قاری",
      reveal_all: "👁️ نمایش تمام کلمات",
      hide_all: "🙈 مخفی‌سازی کلمات",
      word_breakdown_title: "تفکیک حروف و ثبت خطای حفظ",
      word_letters_label: "تفکیک حروف کلمه با اعراب و حرکات کامل:",
      note_label: "یادداشت شخصی حفظ برای این کلمه:",
      note_placeholder: "مثلاً: علت اشتباه، حرکت ضمه، وقف یا ابتدای کلمه...",
      mark_mistake: "ثبت به عنوان خطای حفظ",
      unmark_mistake: "حذف از خطاهای حفظ",
      save_note: "ذخیره یادداشت",
      note_saved: "✅ یادداشت با موفقیت ذخیره شد!",
      quiz_title: "آزمون هوشمند آیات مراجعة",
      quiz_prompt_next: "آیه بعدی کدام است؟ در ذهن مرور کنید یا بخوانید:",
      quiz_prompt_prev: "آیه قبلی کدام بود؟",
      quiz_reveal_btn: "نمایش پاسخ",
      quiz_correct_badge: "✨ پاسخ صحیح:",
      quiz_next_btn: "سوال بعدی ◄",
      quiz_play_audio: "پخش صوت آیه",
      settings_title: "تنظیمات قلم و انتخاب قاری",
      font_size_label: "اندازه قلم:",
      font_family_label: "سبک رسم‌الخط و فونت:",
      reciter_label: "قاری صوت قرآن:",
      close: "بستن",
      page_label: "صفحه",
      surah_label: "سوره",
      juz_label: "جزء"
    },
    en: {
      btn_mode_text: "Text",
      btn_mode_scan: "Scan",
      btn_mode_murajaa: "Murajaa Mushaf",
      title: "Murajaa Hifz & Mushaf Suite",
      mode_tilawah: "📖 Recitation",
      mode_tasmi: "🧠 Tasmīʿ (Memorize)",
      mic_start: "🎙️ Start Voice",
      mic_stop: "⏹️ Stop Voice",
      mic_listening: "🔴 Listening to Recitation...",
      mic_backtrack: "🔄 Backtrack / Repetition tracked smoothly",
      mic_not_supported: "⚠️ Speech recognition is not available or permission denied in this browser.",
      quiz_btn: "❓ Ayah Quiz",
      settings_btn: "⚙️ Font & Reciter",
      reveal_all: "👁️ Reveal All",
      hide_all: "🙈 Hide All",
      word_breakdown_title: "Word Breakdown & Memorization Note",
      word_letters_label: "Letter-by-Letter Harakat Deconstruction:",
      note_label: "Personal Memorization Note:",
      note_placeholder: "E.g. Pay attention to madd, stop rules, vowel...",
      mark_mistake: "Flag as Mistake",
      unmark_mistake: "Clear Mistake Flag",
      save_note: "Save Note",
      note_saved: "✅ Memorization note saved!",
      quiz_title: "Murāja'a Ayah Quiz",
      quiz_prompt_next: "What is the next Ayah? Recite or recall:",
      quiz_prompt_prev: "What was the previous Ayah?",
      quiz_reveal_btn: "Reveal Answer",
      quiz_correct_badge: "✨ Correct Ayah:",
      quiz_next_btn: "Next Question ◄",
      quiz_play_audio: "Play Recitation",
      settings_title: "Typography & Reciter Settings",
      font_size_label: "Font Size:",
      font_family_label: "Calligraphy Style:",
      reciter_label: "Audio Reciter:",
      close: "Close",
      page_label: "Page",
      surah_label: "Surah",
      juz_label: "Juz"
    },
    de: {
      btn_mode_text: "Text",
      btn_mode_scan: "Scan",
      btn_mode_murajaa: "Murāja'a",
      title: "Murādscha'ah Hifz-Koran",
      mode_tilawah: "📖 Rezitation",
      mode_tasmi: "🧠 Tasmīʿ (Hifz)",
      mic_start: "🎙️ Sprache starten",
      mic_stop: "⏹️ Stop",
      mic_listening: "🔴 Höre Rezitation zu...",
      mic_backtrack: "🔄 Wiederholung / Rücksprung erkannt",
      mic_not_supported: "⚠️ Spracherkennung im Browser nicht verfügbar oder blockiert.",
      quiz_btn: "❓ Hifz-Quiz",
      settings_btn: "⚙️ Schrift & Rezitator",
      reveal_all: "👁️ Alle aufdecken",
      hide_all: "🙈 Alle verdecken",
      word_breakdown_title: "Wort-Analyse & Hifz-Notiz",
      word_letters_label: "Buchstaben-Zerlegung mit Harakat:",
      note_label: "Persönliche Memorierungs-Notiz:",
      note_placeholder: "Z.B. Auf Vokalisation oder Dehnung achten...",
      mark_mistake: "Als Hifz-Fehler markieren",
      unmark_mistake: "Fehler zurücksetzen",
      save_note: "Notiz speichern",
      note_saved: "✅ Notiz gespeichert!",
      quiz_title: "Murāja'a Vers-Quiz",
      quiz_prompt_next: "Welcher Vers folgt als Nächstes?",
      quiz_prompt_prev: "Welcher Vers stand davor?",
      quiz_reveal_btn: "Lösung anzeigen",
      quiz_correct_badge: "✨ Richtiger Vers:",
      quiz_next_btn: "Nächste Frage ◄",
      quiz_play_audio: "Audio anhören",
      settings_title: "Schrift & Rezitator-Einstellungen",
      font_size_label: "Schriftgröße:",
      font_family_label: "Kalligraphie-Stil:",
      reciter_label: "Rezitator:",
      close: "Schließen",
      page_label: "Seite",
      surah_label: "Sure",
      juz_label: "Juz"
    }
  };

  function getLang() {
    let l = 'de';
    try {
      l = localStorage.getItem('quran_app_language') || (window.currentAppLanguage) || 'de';
    } catch (e) {}
    if (l === 'fa' || l === 'ku' || l === 'en' || l === 'de') return l;
    return 'de';
  }

  function t(key) {
    const l = getLang();
    const table = MURAJAA_I18N[l] || MURAJAA_I18N['de'];
    return table[key] || (MURAJAA_I18N['en'][key] || key);
  }
  window.Murajaa.t = t;

  // =========================================================================
  // 2. MUQATTA'AT (الحروف المقطعة) & UNICODE ARABIC NORMALIZER
  // =========================================================================
  function normalizeMuqattaat(text) {
    if (!text) return '';
    return text
      // الم
      .replace(/[إأآٱا]لف\s+ل[اآ]م\s+م[يی]م/g, 'الم')
      // المص
      .replace(/[إأآٱا]لف\s+ل[اآ]م\s+م[يی]م\s+ص[اآ]د/g, 'المص')
      // المر
      .replace(/[إأآٱا]لف\s+ل[اآ]م\s+م[يی]م\s+ر[اآ]/g, 'المر')
      // الر
      .replace(/[إأآٱا]لف\s+ل[اآ]م\s+ر[اآ]/g, 'الر')
      // كهيعص
      .replace(/ك[اآ]ف\s+ه[اآ]\s+ي[اآ]\s+ع[يی]ن\s+ص[اآ]د/g, 'كهيعص')
      // طه
      .replace(/ط[اآ]\s+ه[اآ]/g, 'طه')
      // طسم
      .replace(/ط[اآ]\s+س[يی]ن\s+م[يی]م/g, 'طسم')
      // طس
      .replace(/ط[اآ]\s+س[يی]ن/g, 'طس')
      // يس
      .replace(/ي[اآ]\s+س[يی]ن/g, 'يس')
      // ص
      .replace(/ص[اآ]د/g, 'ص')
      // حم
      .replace(/ح[اآ]\s+م[يی]م/g, 'حم')
      // عسق
      .replace(/ع[يی]ن\s+س[يی]ن\s+ق[اآ]ف/g, 'عسق')
      // ق
      .replace(/ق[اآ]ف/g, 'ق')
      // ن
      .replace(/ن[وۥ]ن/g, 'ن');
  }
  window.Murajaa.normalizeMuqattaat = normalizeMuqattaat;

  function normalizeArabic(text) {
    if (!text) return '';
    let str = String(text);
    // Strip Tashkeel & Quranic stop signs
    str = str.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '');
    // Normalize Alefs
    str = str.replace(/[\u0622\u0623\u0625\u0671]/g, '\u0627');
    // Normalize Yaa
    str = str.replace(/[\u0649\u064A]/g, '\u064A');
    // Normalize Taa Marbuta
    str = str.replace(/\u0629/g, '\u0647');
    // Strip Tatweel
    str = str.replace(/\u0640/g, '');
    // Strip Quranic signs and punctuation
    str = str.replace(/[\u0600-\u060F\u06DD\u06DE.,/#!$%^&*;:{}=\-_`~()«»۞۩]/g, '');
    str = str.replace(/\s+/g, ' ').trim();
    // Normalize spoken Muqatta'at letters
    return normalizeMuqattaat(str);
  }
  window.Murajaa.normalizeArabic = normalizeArabic;

  function tokenizeArabic(text) {
    const norm = normalizeArabic(text);
    return norm ? norm.split(' ').filter(Boolean) : [];
  }
  window.Murajaa.tokenizeArabic = tokenizeArabic;

  function stringSimilarity(s1, s2) {
    if (s1 === s2) return 1.0;
    if (!s1 || !s2) return 0.0;
    // Check direct Muqatta'at equivalence
    if ((s1 === 'الم' && (s2 === 'الف' || s2 === 'لام' || s2 === 'ميم')) ||
        (s2 === 'الم' && (s1 === 'الف' || s1 === 'لام' || s1 === 'ميم'))) {
      return 1.0;
    }
    const l1 = s1.length;
    const l2 = s2.length;
    const maxLen = Math.max(l1, l2);
    if (maxLen === 0) return 1.0;

    const dp = Array(l1 + 1).fill(null).map(() => Array(l2 + 1).fill(0));
    for (let i = 0; i <= l1; i++) dp[i][0] = i;
    for (let j = 0; j <= l2; j++) dp[0][j] = j;

    for (let i = 1; i <= l1; i++) {
      for (let j = 1; j <= l2; j++) {
        const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + cost
        );
      }
    }
    return 1.0 - (dp[l1][l2] / maxLen);
  }

  function deconstructLetters(word) {
    if (!word) return [];
    const cleanWord = word.replace(/[.,/#!$%^&*;:{}=\-_`~()«»۞۩]/g, '').trim();
    const result = [];
    const harakatRegex = /[\u064B-\u065F\u0670\u06D6-\u06ED]/;

    let currentLetter = '';
    for (let i = 0; i < cleanWord.length; i++) {
      const ch = cleanWord[i];
      if (harakatRegex.test(ch)) {
        currentLetter += ch;
      } else {
        if (currentLetter) result.push(currentLetter);
        currentLetter = ch;
      }
    }
    if (currentLetter) result.push(currentLetter);
    return result;
  }
  window.Murajaa.deconstructLetters = deconstructLetters;

  function toArabicDigits(num) {
    const arabicDigits = ['\u0660', '\u0661', '\u0662', '\u0663', '\u0664', '\u0665', '\u0666', '\u0667', '\u0668', '\u0669'];
    return String(num).replace(/[0-9]/g, d => arabicDigits[d]);
  }

  // =========================================================================
  // 3. STATE MANAGEMENT
  // =========================================================================
  const murajaaState = {
    viewMode: 'tilawah',
    isListening: false,
    speechRecognition: null,
    targetTokens: [],
    wordsMeta: [],
    currentWordIndex: 0,
    spokenIndices: new Set(),
    revealedIndices: new Set(),
    mistakeMap: {},
    notesMap: {},
    fontSize: parseInt(localStorage.getItem('murajaa_font_size') || '28', 10),
    fontFamily: localStorage.getItem('murajaa_font_family') || 'kfgqpc',
    reciter: localStorage.getItem('murajaa_reciter') || 'Alafasy_128kbps',
    audioObj: null
  };
  window.Murajaa.state = murajaaState;

  try {
    murajaaState.mistakeMap = JSON.parse(localStorage.getItem('murajaa_mistakes') || '{}');
    murajaaState.notesMap = JSON.parse(localStorage.getItem('murajaa_notes') || '{}');
  } catch (e) {}

  // =========================================================================
  // 4. BACKTRACKING-TOLERANT RECITATION TRACKER (وقف و ابتدا / بازگشت به عقب)
  // =========================================================================
  function processIncomingRecitation(transcript) {
    if (!transcript) return;
    const spokenTokens = tokenizeArabic(transcript);
    if (spokenTokens.length === 0) return;

    const targets = murajaaState.targetTokens;
    if (!targets || targets.length === 0) return;

    const backtrackWindow = 4;
    const forwardWindow = 3;
    let didBacktrack = false;

    spokenTokens.forEach(spToken => {
      let matchedIndex = -1;

      // 1. Check Backtrack Window (did reciter repeat a preceding word? وقف و ابتدا)
      const lookbackStart = Math.max(0, murajaaState.currentWordIndex - backtrackWindow);
      for (let i = murajaaState.currentWordIndex - 1; i >= lookbackStart; i--) {
        if (stringSimilarity(spToken, targets[i]) >= 0.72) {
          matchedIndex = i;
          didBacktrack = true;
          break;
        }
      }

      // 2. If not backtracking, check forward window
      if (matchedIndex === -1) {
        const lookaheadEnd = Math.min(targets.length - 1, murajaaState.currentWordIndex + forwardWindow);
        for (let j = murajaaState.currentWordIndex; j <= lookaheadEnd; j++) {
          if (stringSimilarity(spToken, targets[j]) >= 0.70) {
            matchedIndex = j;
            break;
          }
        }
      }

      // 3. Apply match
      if (matchedIndex !== -1) {
        murajaaState.currentWordIndex = matchedIndex + 1;
        murajaaState.spokenIndices.add(matchedIndex);
        if (murajaaState.viewMode === 'tasmi') {
          murajaaState.revealedIndices.add(matchedIndex);
        }
        highlightWord(matchedIndex, didBacktrack);
      }
    });

    updateMurajaaStatusPill(didBacktrack);
  }

  function highlightWord(wordIndex, isBacktrack) {
    const el = document.getElementById('mword_' + wordIndex);
    if (!el) return;

    el.classList.add('murajaa-spoken');
    if (murajaaState.viewMode === 'tasmi') {
      el.classList.add('murajaa-revealed');
      el.classList.remove('murajaa-veiled');
    }

    if (isBacktrack) {
      el.classList.add('murajaa-backtracked');
      setTimeout(() => el.classList.remove('murajaa-backtracked'), 1200);
    }
  }

  function updateMurajaaStatusPill(isBacktrack) {
    const pill = document.getElementById('murajaaLiveStatus');
    if (!pill) return;

    const total = murajaaState.targetTokens.length;
    const count = murajaaState.spokenIndices.size;
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;

    if (isBacktrack) {
      pill.innerHTML = '<span style="color: #38bdf8;">' + t('mic_backtrack') + '</span> <span style="opacity: 0.8;">(' + pct + '%)</span>';
    } else {
      pill.innerHTML = '<span style="color: #10b981;">' + t('mic_listening') + '</span> <span style="opacity: 0.8; font-size: 0.75rem;">' + count + '/' + total + ' ' + t('page_label') + ' (' + pct + '%)</span>';
    }
  }

  function toggleSpeechRecognition() {
    if (murajaaState.isListening) {
      stopSpeechRecognition();
    } else {
      startSpeechRecognition();
    }
  }
  window.Murajaa.toggleSpeechRecognition = toggleSpeechRecognition;

  function startSpeechRecognition() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      alert(t('mic_not_supported'));
      return;
    }

    try {
      const rec = new SpeechRec();
      rec.lang = 'ar-SA';
      rec.continuous = true;
      rec.interimResults = true;

      rec.onstart = function () {
        murajaaState.isListening = true;
        updateMicBtnState(true);
        updateMurajaaStatusPill(false);
      };

      rec.onresult = function (event) {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i];
          const transcript = res[0].transcript;
          processIncomingRecitation(transcript);
        }
      };

      rec.onerror = function (e) {
        console.warn('[Murajaa Voice] Error:', e);
      };

      rec.onend = function () {
        if (murajaaState.isListening) {
          try { rec.start(); } catch (err) {}
        } else {
          updateMicBtnState(false);
        }
      };

      rec.start();
      murajaaState.speechRecognition = rec;
    } catch (e) {
      console.error('[Murajaa Voice] Exception:', e);
      alert(t('mic_not_supported'));
    }
  }

  function stopSpeechRecognition() {
    murajaaState.isListening = false;
    if (murajaaState.speechRecognition) {
      try { murajaaState.speechRecognition.stop(); } catch (e) {}
      murajaaState.speechRecognition = null;
    }
    updateMicBtnState(false);
  }
  window.Murajaa.stopSpeechRecognition = stopSpeechRecognition;

  function updateMicBtnState(isActive) {
    const btn = document.getElementById('murajaaMicBtn');
    const pill = document.getElementById('murajaaLiveStatus');
    if (btn) {
      if (isActive) {
        btn.classList.add('mic-active');
        btn.innerHTML = '<i class="fa-solid fa-microphone" style="color: #ef4444; animation: murajaaPulse 1.2s infinite;"></i> <span>' + t('mic_stop') + '</span>';
      } else {
        btn.classList.remove('mic-active');
        btn.innerHTML = '<i class="fa-solid fa-microphone-lines" style="color: #10b981;"></i> <span>' + t('mic_start') + '</span>';
      }
    }
    if (pill && !isActive) {
      pill.innerHTML = '<span style="opacity: 0.6;">' + t('title') + '</span>';
    }
  }

  // =========================================================================
  // 5. RENDER THE AUTHENTIC MURAJAA MUSHAF PAGE
  // =========================================================================
  function renderMurajaaMushaf() {
    const stage = document.getElementById('mushafMurajaaStage');
    if (!stage) return;

    const pageNum = (window.state && window.state.currentPage) || 1;
    let verses = (window.state && window.state.currentVersesData) || [];
    if (!verses || verses.length === 0) {
      if (typeof window.getPageVerses === 'function') {
        verses = window.getPageVerses(pageNum);
      }
    }

    if (!verses || verses.length === 0) {
      stage.innerHTML = '<div style="text-align: center; padding: 40px; color: #fbbf24;">' + t('page_label') + ' ' + pageNum + '...</div>';
      return;
    }

    murajaaState.targetTokens = [];
    murajaaState.wordsMeta = [];
    murajaaState.currentWordIndex = 0;
    murajaaState.spokenIndices.clear();
    murajaaState.revealedIndices.clear();

    const firstV = verses[0];
    const sMeta = (typeof window.ALL_114_SURAHS !== 'undefined') ? window.ALL_114_SURAHS.find(s => s.id === firstV.surahNum) : null;
    const juzNum = (typeof window.getJuzForPage === 'function') ? window.getJuzForPage(pageNum) : 1;
    const juzName = (typeof window.getJuzNameArabic === 'function') ? window.getJuzNameArabic(juzNum) : ('الجزء ' + juzNum);

    const isTasmi = (murajaaState.viewMode === 'tasmi');

    let html = `
      <!-- Murajaa Dedicated Pro Toolbar (Trilingual & Responsive) -->
      <div class="murajaa-stage-toolbar" dir="ltr" style="display: flex; flex-direction: column; gap: 7px; margin-bottom: 10px;">
        <!-- Row 1: Mode Switcher, Mic, Quiz, Typography -->
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 5px; width: 100%; flex-wrap: wrap;">
          <div style="display: flex; background: rgba(0,0,0,0.45); padding: 2px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.12);">
            <button id="murajaaTilawahModeBtn" onclick="Murajaa.setViewMode('tilawah')" class="murajaa-mode-pill ${!isTasmi ? 'active' : ''}">
              ${t('mode_tilawah')}
            </button>
            <button id="murajaaTasmiModeBtn" onclick="Murajaa.setViewMode('tasmi')" class="murajaa-mode-pill ${isTasmi ? 'active' : ''}">
              ${t('mode_tasmi')}
            </button>
          </div>

          <div style="display: flex; gap: 5px; align-items: center;">
            <button id="murajaaMicBtn" onclick="Murajaa.toggleSpeechRecognition()" class="murajaa-action-btn ${murajaaState.isListening ? 'mic-active' : ''}">
              <i class="fa-solid fa-microphone-lines" style="color: #10b981;"></i> <span>${murajaaState.isListening ? t('mic_stop') : t('mic_start')}</span>
            </button>
            <button onclick="Murajaa.openAyahQuiz()" class="murajaa-action-btn" title="${t('quiz_title')}">
              <i class="fa-solid fa-circle-question" style="color: #38bdf8;"></i> <span>${t('quiz_btn')}</span>
            </button>
            <button onclick="Murajaa.openTypographySettings()" class="murajaa-action-btn" title="${t('settings_title')}">
              <i class="fa-solid fa-sliders" style="color: #fbbf24;"></i>
            </button>
          </div>
        </div>

        <!-- Row 2: Secondary Bar (Reveal / Hide All in Tasmi Mode + Live Status) -->
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; font-size: 0.78rem;">
          <div id="murajaaLiveStatus" style="font-weight: 700; color: #fbbf24; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">
            <span style="opacity: 0.7;">${t('title')}</span>
          </div>
          ${isTasmi ? `
            <div style="display: flex; gap: 5px;">
              <button onclick="Murajaa.revealAllWords()" class="murajaa-mini-btn" style="color: #34d399; border-color: rgba(52,211,153,0.35);">
                <i class="fa-solid fa-eye"></i> ${t('reveal_all')}
              </button>
              <button onclick="Murajaa.hideAllWords()" class="murajaa-mini-btn" style="color: #f87171; border-color: rgba(248,113,113,0.35);">
                <i class="fa-solid fa-eye-slash"></i> ${t('hide_all')}
              </button>
            </div>
          ` : ''}
        </div>
      </div>

      <!-- Authentic Medina Mushaf External Header (RTL) -->
      <div class="mushaf-external-header" dir="rtl" style="margin-bottom: 6px;">
        <div class="mushaf-header-surah-tag">سُورَةُ ${sMeta ? sMeta.arabic : ''}</div>
        <div class="mushaf-header-center-stepper" dir="rtl">
          <button onclick="jumpToPage(state.currentPage - 1)" title="${t('page_label')}">►</button>
          <span style="font-weight: 800; min-width: 60px; text-align: center;">${t('page_label')} ${pageNum}</span>
          <button onclick="jumpToPage(state.currentPage + 1)" title="${t('page_label')}">◄</button>
        </div>
        <div class="mushaf-header-juz-tag">${juzName}</div>
      </div>

      <!-- Authentic Medina Mushaf Page Card Framed by King Fahd Geometric Border -->
      <div id="murajaaMushafCard" class="mushaf-page-card mushaf-theme-cream murajaa-font-${murajaaState.fontFamily}" style="font-size: ${murajaaState.fontSize}px;">
        <div class="mushaf-inner-frame">
    `;

    let globalWordIdx = 0;
    let lastSurah = null;

    verses.forEach((v, vIdx) => {
      // Surah Cartouche if Ayah 1 of a new Surah
      if (v.num === 1 && lastSurah !== v.surahNum) {
        lastSurah = v.surahNum;
        const curMeta = (typeof window.ALL_114_SURAHS !== 'undefined') ? window.ALL_114_SURAHS.find(s => s.id === v.surahNum) : null;
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

      if (vIdx === 0) {
        html += `<div class="mushaf-flowing-text" dir="rtl">`;
      }

      let verseRaw = (typeof window.cleanArabicText === 'function') ? window.cleanArabicText(v.ar) : v.ar;
      // Strip Bismillah from Ayah 1 of all surahs except Surah 1 (Al-Fatiha)
      if (v.num === 1 && v.surahNum !== 1) {
        verseRaw = verseRaw.replace(/^[\u0628\u0650][\u0633\u0652][\u0645\u0650]\s*[\u0671\u0644\u0644\u0651\u064E\u0647\u0650]\s*[\u0671\u0644\u0631\u0651\u064E\u062D\u0652\u0645\u064E\u0670\u0646\u0650]\s*[\u0671\u0644\u0631\u0651\u064E\u062D\u0650\u064A\u0645\u0650]\s*/, '')
                           .replace(/^بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ\s*/, '')
                           .replace(/^بسم الله الرحمن الرحيم\s*/, '')
                           .trim();
      }

      const words = verseRaw.split(/\s+/).filter(Boolean);

      words.forEach(w => {
        const normW = normalizeArabic(w);
        murajaaState.targetTokens.push(normW);

        const wordMeta = {
          raw: w,
          normalized: normW,
          surah: v.surahNum,
          ayah: v.num,
          globalIdx: globalWordIdx
        };
        murajaaState.wordsMeta.push(wordMeta);

        const mistakeKey = `${v.surahNum}_${v.num}_${normW}`;
        const isMistake = !!murajaaState.mistakeMap[mistakeKey];
        const hasNote = !!murajaaState.notesMap[mistakeKey];

        const wordClass = [
          'murajaa-word',
          isTasmi ? 'murajaa-veiled' : '',
          isMistake ? 'murajaa-mistake' : '',
          hasNote ? 'murajaa-has-note' : ''
        ].filter(Boolean).join(' ');

        html += `<span class="${wordClass}" id="mword_${globalWordIdx}" onclick="Murajaa.onWordClick(${globalWordIdx})">${w}</span> `;

        globalWordIdx++;
      });

      html += `<span class="mushaf-ayah-end-glyph" title="${t('ayah_label')} ${v.num}"> ۝${toArabicDigits(v.num)} </span> `;
    });

    html += `
        </div>
      </div>
    </div>
    `;

    stage.innerHTML = html;
  }
  window.Murajaa.renderMurajaaMushaf = renderMurajaaMushaf;

  function setViewMode(mode) {
    murajaaState.viewMode = mode;
    renderMurajaaMushaf();
  }
  window.Murajaa.setViewMode = setViewMode;

  function revealAllWords() {
    murajaaState.wordsMeta.forEach(m => {
      murajaaState.revealedIndices.add(m.globalIdx);
      const el = document.getElementById('mword_' + m.globalIdx);
      if (el) {
        el.classList.add('murajaa-revealed');
        el.classList.remove('murajaa-veiled');
      }
    });
  }
  window.Murajaa.revealAllWords = revealAllWords;

  function hideAllWords() {
    murajaaState.revealedIndices.clear();
    murajaaState.spokenIndices.clear();
    murajaaState.currentWordIndex = 0;
    murajaaState.wordsMeta.forEach(m => {
      const el = document.getElementById('mword_' + m.globalIdx);
      if (el) {
        el.classList.remove('murajaa-revealed', 'murajaa-spoken');
        el.classList.add('murajaa-veiled');
      }
    });
    updateMurajaaStatusPill(false);
  }
  window.Murajaa.hideAllWords = hideAllWords;

  // =========================================================================
  // 6. MODALS: WORD BREAKDOWN, AYAH QUIZ, TYPOGRAPHY SETTINGS
  // =========================================================================
  function onWordClick(globalIdx) {
    const meta = murajaaState.wordsMeta[globalIdx];
    if (!meta) return;

    const el = document.getElementById('mword_' + globalIdx);
    if (murajaaState.viewMode === 'tasmi' && el && el.classList.contains('murajaa-veiled')) {
      el.classList.add('murajaa-revealed');
      el.classList.remove('murajaa-veiled');
      murajaaState.revealedIndices.add(globalIdx);
      return;
    }

    openWordBreakdown(meta);
  }
  window.Murajaa.onWordClick = onWordClick;

  function openWordBreakdown(meta) {
    const wordKey = `${meta.surah}_${meta.ayah}_${meta.normalized}`;
    const letters = deconstructLetters(meta.raw);
    const isMistake = !!murajaaState.mistakeMap[wordKey];
    const currentNote = murajaaState.notesMap[wordKey] || '';

    let modal = document.getElementById('murajaaBreakdownModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'murajaaBreakdownModal';
      modal.className = 'neo3d-modal-backdrop';
      modal.onclick = function (e) {
        if (e.target === this) this.style.display = 'none';
      };
      document.body.appendChild(modal);
    }

    modal.style.display = 'flex';
    modal.innerHTML = `
      <div class="neo3d-modal-card" style="max-width: 480px; width: 92%; padding: 20px; border-radius: 20px; background: rgba(10, 18, 30, 0.98); border: 1.5px solid rgba(234, 179, 8, 0.45); box-shadow: 0 16px 40px rgba(0,0,0,0.85); backdrop-filter: blur(25px);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <i class="fa-solid fa-spell-check" style="color: #fbbf24; font-size: 1.1rem;"></i>
            <span style="font-weight: 800; color: #fff; font-size: 0.95rem;">${t('word_breakdown_title')}</span>
          </div>
          <button onclick="document.getElementById('murajaaBreakdownModal').style.display='none'" style="background: none; border: none; color: #94a3b8; font-size: 1.4rem; cursor: pointer; padding: 0 6px;">&times;</button>
        </div>

        <div style="text-align: center; margin: 15px 0 20px; padding: 15px; background: rgba(0,0,0,0.3); border-radius: 16px; border: 1px solid rgba(255,255,255,0.06);">
          <div style="font-size: 2.4rem; font-family: 'KFGQPC Uthman Taha Naskh', 'Amiri Quran', serif; color: #fef08a; direction: rtl;">
            ${meta.raw}
          </div>
          <div style="font-size: 0.78rem; color: #94a3b8; margin-top: 6px;">
            ${t('surah_label')} ${meta.surah} · ${t('ayah_label')} ${meta.ayah}
          </div>
        </div>

        <div style="margin-bottom: 15px;">
          <div style="font-size: 0.8rem; font-weight: 700; color: #38bdf8; margin-bottom: 8px;">${t('word_letters_label')}</div>
          <div style="display: flex; flex-wrap: wrap; gap: 6px; direction: rtl; justify-content: center;">
            ${letters.map(l => `
              <div class="murajaa-letter-chip">
                <span class="letter-char">${l}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div style="margin-bottom: 16px;">
          <label style="display: block; font-size: 0.8rem; font-weight: 700; color: #e2e8f0; margin-bottom: 6px;">${t('note_label')}</label>
          <textarea id="murajaaWordNoteInput" rows="2" placeholder="${t('note_placeholder')}" style="width: 100%; box-sizing: border-box; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.15); border-radius: 12px; color: #fff; padding: 8px 10px; font-size: 0.82rem; outline: none;">${currentNote}</textarea>
        </div>

        <div style="display: flex; gap: 8px; justify-content: space-between; align-items: center;">
          <button id="murajaaToggleMistakeBtn" onclick="Murajaa.toggleMistakeFlag('${wordKey}', ${meta.globalIdx})" class="neo3d-pill-btn" style="flex: 1; padding: 7px 10px; font-size: 0.78rem; justify-content: center; background: ${isMistake ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.06)'}; border-color: ${isMistake ? '#ef4444' : 'rgba(255,255,255,0.2)'}; color: ${isMistake ? '#fca5a5' : '#e2e8f0'};">
            <i class="fa-solid fa-triangle-exclamation"></i> <span>${isMistake ? t('unmark_mistake') : t('mark_mistake')}</span>
          </button>
          <button onclick="Murajaa.saveWordNote('${wordKey}', ${meta.globalIdx})" class="neo3d-pill-btn" style="flex: 1; padding: 7px 10px; font-size: 0.78rem; justify-content: center; background: linear-gradient(135deg, #10b981, #059669); border: none; color: #fff;">
            <i class="fa-solid fa-floppy-disk"></i> <span>${t('save_note')}</span>
          </button>
        </div>
      </div>
    `;
  }
  window.Murajaa.openWordBreakdown = openWordBreakdown;

  function toggleMistakeFlag(wordKey, globalIdx) {
    if (murajaaState.mistakeMap[wordKey]) {
      delete murajaaState.mistakeMap[wordKey];
    } else {
      murajaaState.mistakeMap[wordKey] = true;
    }
    try {
      localStorage.setItem('murajaa_mistakes', JSON.stringify(murajaaState.mistakeMap));
    } catch (e) {}

    const el = document.getElementById('mword_' + globalIdx);
    if (el) el.classList.toggle('murajaa-mistake', !!murajaaState.mistakeMap[wordKey]);

    const btn = document.getElementById('murajaaToggleMistakeBtn');
    if (btn) {
      const isM = !!murajaaState.mistakeMap[wordKey];
      btn.style.background = isM ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.06)';
      btn.style.borderColor = isM ? '#ef4444' : 'rgba(255,255,255,0.2)';
      btn.style.color = isM ? '#fca5a5' : '#e2e8f0';
      btn.querySelector('span').textContent = isM ? t('unmark_mistake') : t('mark_mistake');
    }
  }
  window.Murajaa.toggleMistakeFlag = toggleMistakeFlag;

  function saveWordNote(wordKey, globalIdx) {
    const input = document.getElementById('murajaaWordNoteInput');
    const val = input ? input.value.trim() : '';
    if (val) {
      murajaaState.notesMap[wordKey] = val;
    } else {
      delete murajaaState.notesMap[wordKey];
    }
    try {
      localStorage.setItem('murajaa_notes', JSON.stringify(murajaaState.notesMap));
    } catch (e) {}

    const el = document.getElementById('mword_' + globalIdx);
    if (el) el.classList.toggle('murajaa-has-note', !!val);

    const modal = document.getElementById('murajaaBreakdownModal');
    if (modal) modal.style.display = 'none';

    if (typeof window.showToast === 'function') {
      window.showToast(t('note_saved'));
    }
  }
  window.Murajaa.saveWordNote = saveWordNote;

  function openAyahQuiz() {
    let verses = (window.state && window.state.currentVersesData) || [];
    if (!verses || verses.length === 0) {
      const p = (window.state && window.state.currentPage) || 1;
      if (typeof window.getPageVerses === 'function') verses = window.getPageVerses(p);
    }
    if (!verses || verses.length < 2) {
      alert('لطفاً صفحه‌ای با حداقل ۲ آیه برای کوئیز انتخاب کنید.');
      return;
    }

    const targetIdx = Math.floor(Math.random() * (verses.length - 1));
    const promptVerse = verses[targetIdx];
    const answerVerse = verses[targetIdx + 1];

    let modal = document.getElementById('murajaaQuizModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'murajaaQuizModal';
      modal.className = 'neo3d-modal-backdrop';
      modal.onclick = function (e) {
        if (e.target === this) {
          this.style.display = 'none';
          Murajaa.stopAudio();
        }
      };
      document.body.appendChild(modal);
    }

    modal.style.display = 'flex';
    modal.innerHTML = `
      <div class="neo3d-modal-card" style="max-width: 520px; width: 92%; padding: 22px; border-radius: 22px; background: rgba(8, 16, 28, 0.98); border: 1.5px solid rgba(56, 189, 248, 0.45); box-shadow: 0 20px 50px rgba(0,0,0,0.9); backdrop-filter: blur(25px);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <i class="fa-solid fa-circle-question" style="color: #38bdf8; font-size: 1.15rem;"></i>
            <span style="font-weight: 800; color: #fff; font-size: 0.95rem;">${t('quiz_title')}</span>
          </div>
          <button onclick="document.getElementById('murajaaQuizModal').style.display='none'; Murajaa.stopAudio();" style="background: none; border: none; color: #94a3b8; font-size: 1.4rem; cursor: pointer; padding: 0 6px;">&times;</button>
        </div>

        <div style="font-size: 0.85rem; font-weight: 700; color: #fbbf24; margin-bottom: 10px;">
          ${t('quiz_prompt_next')}
        </div>

        <div style="padding: 14px; background: rgba(0,0,0,0.4); border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); margin-bottom: 14px; direction: rtl; text-align: center;">
          <div style="font-size: 1.35rem; font-family: 'KFGQPC Uthman Taha Naskh', 'Amiri Quran', serif; color: #e2e8f0; line-height: 1.8;">
            ${promptVerse.ar} <span class="mushaf-ayah-end-glyph"> ۝${toArabicDigits(promptVerse.num)} </span>
          </div>
          <div style="display: flex; justify-content: center; gap: 8px; margin-top: 10px;">
            <button onclick="Murajaa.playAyahAudio(${promptVerse.surahNum}, ${promptVerse.num})" class="neo3d-pill-btn" style="padding: 4px 10px; font-size: 0.72rem; color: #38bdf8; border-color: rgba(56,189,248,0.4);">
              <i class="fa-solid fa-play"></i> ${t('quiz_play_audio')}
            </button>
          </div>
        </div>

        <div id="murajaaQuizAnswerBox" style="display: none; padding: 14px; background: rgba(16, 185, 129, 0.12); border-radius: 16px; border: 1px solid rgba(16, 185, 129, 0.4); margin-bottom: 14px; direction: rtl; text-align: center; animation: murajaaFadeIn 0.4s ease;">
          <div style="font-size: 0.8rem; font-weight: 800; color: #10b981; margin-bottom: 6px;">${t('quiz_correct_badge')} (${t('ayah_label')} ${answerVerse.num})</div>
          <div style="font-size: 1.4rem; font-family: 'KFGQPC Uthman Taha Naskh', 'Amiri Quran', serif; color: #fef08a; line-height: 1.8;">
            ${answerVerse.ar} <span class="mushaf-ayah-end-glyph"> ۝${toArabicDigits(answerVerse.num)} </span>
          </div>
          <div style="display: flex; justify-content: center; margin-top: 8px;">
            <button onclick="Murajaa.playAyahAudio(${answerVerse.surahNum}, ${answerVerse.num})" class="neo3d-pill-btn" style="padding: 4px 10px; font-size: 0.72rem; color: #10b981; border-color: rgba(16,185,129,0.4);">
              <i class="fa-solid fa-play"></i> ${t('quiz_play_audio')}
            </button>
          </div>
        </div>

        <div style="display: flex; gap: 8px; justify-content: space-between;">
          <button id="murajaaQuizRevealBtn" onclick="document.getElementById('murajaaQuizAnswerBox').style.display='block'; this.style.display='none';" class="neo3d-pill-btn" style="flex: 1; padding: 8px 12px; font-size: 0.8rem; justify-content: center; background: linear-gradient(135deg, #0284c7, #0369a1); border: none; color: #fff;">
            <i class="fa-solid fa-eye"></i> <span>${t('quiz_reveal_btn')}</span>
          </button>
          <button onclick="Murajaa.openAyahQuiz()" class="neo3d-pill-btn" style="flex: 1; padding: 8px 12px; font-size: 0.8rem; justify-content: center; background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.2); color: #fff;">
            <span>${t('quiz_next_btn')}</span>
          </button>
        </div>
      </div>
    `;
  }
  window.Murajaa.openAyahQuiz = openAyahQuiz;

  function playAyahAudio(surahNum, ayahNum) {
    stopAudio();
    const qari = murajaaState.reciter;
    const sPad = String(surahNum).padStart(3, '0');
    const aPad = String(ayahNum).padStart(3, '0');
    const url = `https://everyayah.com/data/${qari}/${sPad}${aPad}.mp3`;

    try {
      const audio = new Audio(url);
      audio.play().catch(e => console.warn('Audio play error:', e));
      murajaaState.audioObj = audio;
    } catch (e) {}
  }
  window.Murajaa.playAyahAudio = playAyahAudio;

  function stopAudio() {
    if (murajaaState.audioObj) {
      try { murajaaState.audioObj.pause(); } catch (e) {}
      murajaaState.audioObj = null;
    }
  }
  window.Murajaa.stopAudio = stopAudio;

  function openTypographySettings() {
    let modal = document.getElementById('murajaaSettingsModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'murajaaSettingsModal';
      modal.className = 'neo3d-modal-backdrop';
      modal.onclick = function (e) {
        if (e.target === this) this.style.display = 'none';
      };
      document.body.appendChild(modal);
    }

    modal.style.display = 'flex';
    modal.innerHTML = `
      <div class="neo3d-modal-card" style="max-width: 460px; width: 92%; padding: 22px; border-radius: 20px; background: rgba(10, 18, 30, 0.98); border: 1.5px solid rgba(251, 191, 36, 0.45); box-shadow: 0 16px 40px rgba(0,0,0,0.85); backdrop-filter: blur(25px);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <i class="fa-solid fa-sliders" style="color: #fbbf24; font-size: 1.1rem;"></i>
            <span style="font-weight: 800; color: #fff; font-size: 0.95rem;">${t('settings_title')}</span>
          </div>
          <button onclick="document.getElementById('murajaaSettingsModal').style.display='none'" style="background: none; border: none; color: #94a3b8; font-size: 1.4rem; cursor: pointer; padding: 0 6px;">&times;</button>
        </div>

        <div style="margin-bottom: 18px;">
          <div style="display: flex; justify-content: space-between; font-size: 0.82rem; font-weight: 700; color: #e2e8f0; margin-bottom: 8px;">
            <span>${t('font_size_label')}</span>
            <span id="murajaaFontSizeVal" style="color: #fbbf24; font-weight: 800;">${murajaaState.fontSize}px</span>
          </div>
          <input type="range" min="20" max="44" step="1" value="${murajaaState.fontSize}" oninput="Murajaa.onFontSizeChange(this.value)" style="width: 100%; accent-color: #fbbf24; cursor: pointer;">
        </div>

        <div style="margin-bottom: 18px;">
          <label style="display: block; font-size: 0.82rem; font-weight: 700; color: #e2e8f0; margin-bottom: 6px;">${t('font_family_label')}</label>
          <select onchange="Murajaa.onFontFamilyChange(this.value)" style="width: 100%; padding: 8px; border-radius: 12px; background: rgba(0,0,0,0.45); color: #fff; border: 1px solid rgba(255,255,255,0.15); outline: none;">
            <option value="kfgqpc" ${murajaaState.fontFamily === 'kfgqpc' ? 'selected' : ''}>مصحف مدینه منوره (KFGQPC Uthman Taha)</option>
            <option value="amiri" ${murajaaState.fontFamily === 'amiri' ? 'selected' : ''}>قلم امیری عثمانی (Amiri Quran)</option>
            <option value="scheherazade" ${murajaaState.fontFamily === 'scheherazade' ? 'selected' : ''}>قلم شهرزاد (Scheherazade New)</option>
            <option value="indopak" ${murajaaState.fontFamily === 'indopak' ? 'selected' : ''}>قلم اردو و ایندوپاک (IndoPak Naskh)</option>
          </select>
        </div>

        <div style="margin-bottom: 20px;">
          <label style="display: block; font-size: 0.82rem; font-weight: 700; color: #e2e8f0; margin-bottom: 6px;">${t('reciter_label')}</label>
          <select onchange="Murajaa.onReciterChange(this.value)" style="width: 100%; padding: 8px; border-radius: 12px; background: rgba(0,0,0,0.45); color: #fef08a; border: 1px solid rgba(255,255,255,0.15); outline: none;">
            <option value="Alafasy_128kbps" ${murajaaState.reciter === 'Alafasy_128kbps' ? 'selected' : ''}>🎙️ مشاری بن راشد العفاسی (Alafasy)</option>
            <option value="Husary_128kbps" ${murajaaState.reciter === 'Husary_128kbps' ? 'selected' : ''}>🎙️ شیخ محمود خلیل الحصری (Al-Hussary)</option>
            <option value="Abdul_Basit_Murattal_192kbps" ${murajaaState.reciter === 'Abdul_Basit_Murattal_192kbps' ? 'selected' : ''}>🎙️ عبدالباسط عبدالصمد (Abdul Basit)</option>
            <option value="Minshawy_Murattal_128kbps" ${murajaaState.reciter === 'Minshawy_Murattal_128kbps' ? 'selected' : ''}>🎙️ محمد صدیق المنشاوی (Minshawy)</option>
            <option value="Ghamadi_40kbps" ${murajaaState.reciter === 'Ghamadi_40kbps' ? 'selected' : ''}>🎙️ سعد الغامدی (Al-Ghamadi)</option>
          </select>
        </div>

        <button onclick="document.getElementById('murajaaSettingsModal').style.display='none'" class="neo3d-pill-btn" style="width: 100%; padding: 8px; font-size: 0.8rem; justify-content: center; background: linear-gradient(135deg, #10b981, #059669); border: none; color: #fff;">
          ${t('close')}
        </button>
      </div>
    `;
  }
  window.Murajaa.openTypographySettings = openTypographySettings;

  function onFontSizeChange(sz) {
    const val = parseInt(sz, 10);
    murajaaState.fontSize = val;
    try { localStorage.setItem('murajaa_font_size', String(val)); } catch (e) {}

    const lbl = document.getElementById('murajaaFontSizeVal');
    if (lbl) lbl.textContent = val + 'px';

    const card = document.getElementById('murajaaMushafCard');
    if (card) card.style.fontSize = val + 'px';
  }
  window.Murajaa.onFontSizeChange = onFontSizeChange;

  function onFontFamilyChange(fFam) {
    murajaaState.fontFamily = fFam;
    try { localStorage.setItem('murajaa_font_family', fFam); } catch (e) {}

    const card = document.getElementById('murajaaMushafCard');
    if (card) {
      card.className = card.className.replace(/murajaa-font-\w+/g, '');
      card.classList.add('murajaa-font-' + fFam);
    }
  }
  window.Murajaa.onFontFamilyChange = onFontFamilyChange;

  function onReciterChange(qari) {
    murajaaState.reciter = qari;
    try { localStorage.setItem('murajaa_reciter', qari); } catch (e) {}
  }
  window.Murajaa.onReciterChange = onReciterChange;

  // =========================================================================
  // 7. DYNAMIC CSS STYLES INJECTION
  // =========================================================================
  function injectMurajaaStyles() {
    if (document.getElementById('murajaaStyleDefs')) return;
    const style = document.createElement('style');
    style.id = 'murajaaStyleDefs';
    style.textContent = `
      /* Universal Centered Modal Backdrop for Murajaa Suite */
      .neo3d-modal-backdrop {
        position: fixed !important;
        inset: 0 !important;
        z-index: 25000 !important;
        background: rgba(4, 8, 16, 0.88) !important;
        backdrop-filter: blur(16px) !important;
        -webkit-backdrop-filter: blur(16px) !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        padding: 14px !important;
      }

      /* Murajaa Mode Switcher Pills */
      .murajaa-mode-pill {
        background: transparent;
        border: none;
        color: #94a3b8;
        padding: 5px 12px;
        font-size: 0.76rem;
        font-weight: 700;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .murajaa-mode-pill.active {
        background: linear-gradient(135deg, #fbbf24, #d97706);
        color: #000;
        font-weight: 800;
        box-shadow: 0 2px 8px rgba(251, 191, 36, 0.35);
      }
      .murajaa-action-btn {
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.14);
        color: #e2e8f0;
        padding: 5px 10px;
        border-radius: 9px;
        font-size: 0.74rem;
        font-weight: 700;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        cursor: pointer;
        transition: all 0.2s;
      }
      .murajaa-action-btn:hover {
        background: rgba(255, 255, 255, 0.12);
      }
      .murajaa-action-btn.mic-active {
        background: rgba(239, 68, 68, 0.2);
        border-color: #ef4444;
        color: #fca5a5;
      }
      .murajaa-mini-btn {
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.2);
        padding: 3px 8px;
        border-radius: 8px;
        font-size: 0.72rem;
        font-weight: 700;
        cursor: pointer;
      }
      @keyframes murajaaPulse {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.15); opacity: 0.7; }
        100% { transform: scale(1); opacity: 1; }
      }
      @keyframes murajaaFadeIn {
        from { opacity: 0; transform: translateY(-6px); }
        to { opacity: 1; transform: translateY(0); }
      }

      /* Words in Mushaf Page */
      .murajaa-word {
        display: inline-block;
        padding: 1px 3px;
        margin: 0 1px;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.25s ease;
      }
      .murajaa-word:hover {
        background: rgba(251, 191, 36, 0.25);
      }
      /* Spoken Highlight with Aura */
      .murajaa-word.murajaa-spoken {
        background: rgba(16, 185, 129, 0.28) !important;
        color: #064e3b !important;
        box-shadow: 0 0 8px rgba(16, 185, 129, 0.4);
      }
      .mushaf-theme-dark .murajaa-word.murajaa-spoken {
        background: rgba(16, 185, 129, 0.35) !important;
        color: #6ee7b7 !important;
      }
      /* Backtrack Flash */
      .murajaa-word.murajaa-backtracked {
        background: rgba(56, 189, 248, 0.4) !important;
        box-shadow: 0 0 12px rgba(56, 189, 248, 0.6);
      }
      /* Tasmīʿ Hidden Mask (Capsule Pill veil matching Murajaa App) */
      .murajaa-word.murajaa-veiled {
        background: rgba(100, 116, 139, 0.22) !important;
        color: transparent !important;
        border-radius: 6px;
        border-bottom: 2px solid rgba(148, 163, 184, 0.4);
        user-select: none;
        cursor: pointer;
        filter: blur(3px);
        transition: filter 0.3s ease, color 0.3s ease;
      }
      .murajaa-word.murajaa-veiled:hover {
        background: rgba(251, 191, 36, 0.25) !important;
        filter: blur(1.5px);
      }
      .murajaa-word.murajaa-revealed {
        background: rgba(251, 191, 36, 0.15) !important;
        color: inherit !important;
        filter: none !important;
        animation: murajaaFadeIn 0.3s ease;
      }
      /* Mistake Flag (Red Border) */
      .murajaa-word.murajaa-mistake {
        border: 1.5px solid #ef4444 !important;
        background: rgba(239, 68, 68, 0.15) !important;
      }
      /* Has Personal Note Pin */
      .murajaa-word.murajaa-has-note::after {
        content: "•";
        color: #fbbf24;
        font-size: 0.9rem;
        position: relative;
        top: -6px;
        right: -2px;
      }

      /* Letter Breakdown Chip */
      .murajaa-letter-chip {
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 10px;
        min-width: 44px;
        height: 52px;
        padding: 4px;
      }
      .murajaa-letter-chip .letter-char {
        font-family: 'KFGQPC Uthman Taha Naskh', 'Amiri Quran', serif;
        font-size: 1.6rem;
        color: #fef08a;
      }

      /* Calligraphy Font Classes */
      .murajaa-font-kfgqpc { font-family: 'KFGQPC Uthman Taha Naskh', serif !important; }
      .murajaa-font-amiri { font-family: 'Amiri Quran', serif !important; }
      .murajaa-font-scheherazade { font-family: 'Scheherazade New', serif !important; }
      .murajaa-font-indopak { font-family: 'Al Qalam Quran', 'Nafees Riqa', 'Jameel Noori Nastaleeq', serif !important; }
    `;
    document.head.appendChild(style);
  }

  // =========================================================================
  // 8. GLOBAL VOICE UPGRADES ACROSS ALL APP SECTIONS
  // =========================================================================
  function upgradeGlobalVoiceRecognition() {
    // 1. Upgrade cleanArabicForMatch to handle Muqatta'at and Bismillah uniformly
    const origClean = window.cleanArabicForMatch;
    window.cleanArabicForMatch = function (str) {
      if (!str) return '';
      let res = (typeof origClean === 'function') ? origClean(str) : str;
      return normalizeArabic(res);
    };

    // 2. Upgrade checkRecitationAccuracy in Voice Test (#paneMic)
    const origCheckAccuracy = window.checkRecitationAccuracy;
    window.checkRecitationAccuracy = function (transcript) {
      if (typeof window.getVersesForSurah !== 'function' || typeof window.reciteSurah === 'undefined') {
        if (typeof origCheckAccuracy === 'function') origCheckAccuracy(transcript);
        return;
      }

      const verses = window.getVersesForSurah(window.reciteSurah);
      const v = verses[window.reciteTargetIdx];
      if (!v) return;

      let spoken = normalizeArabic(transcript);
      let targetClean = normalizeArabic(v.ar);

      // Strip Bismillah from Ayah 1 of all surahs except Surah 1 (Al-Fatiha)
      if (v.num === 1 && v.surahNum !== 1) {
        targetClean = targetClean.replace(/^بسم الله الرحمن الرحيم\s*/, '').trim();
        spoken = spoken.replace(/^بسم الله الرحمن الرحيم\s*/, '').trim();
      }

      const spokenWords = spoken.split(/\s+/).filter(Boolean);
      const targetWords = targetClean.split(/\s+/).filter(Boolean);

      if (targetWords.length === 0) return;

      // Check special Muqatta'at match (e.g. Al-Baqarah Ayah 1: الم)
      const isMuqattaat = (targetWords.length === 1 && targetWords[0] === 'الم' &&
        (spokenWords.includes('الم') || spoken.includes('الم') || (spokenWords.includes('الف') && spokenWords.includes('لام') && spokenWords.includes('ميم'))));

      let matchedCount = 0;
      let sIdx = 0;

      for (let tIdx = 0; tIdx < targetWords.length; tIdx++) {
        const tWord = targetWords[tIdx];
        let found = false;

        for (let look = sIdx; look < Math.min(sIdx + 4, spokenWords.length); look++) {
          const sw = spokenWords[look];
          if (stringSimilarity(tWord, sw) >= 0.70 || (tWord === 'الم' && sw === 'الم')) {
            found = true;
            sIdx = look + 1;
            break;
          }
        }

        if (found) matchedCount++;
      }

      const accuracy = Math.round((matchedCount / targetWords.length) * 100);
      const isPass = isMuqattaat || (accuracy >= 65) || (targetWords.length <= 2 && matchedCount >= 1);

      if (isPass) {
        // Successful verification! Advance to next verse!
        if (Array.isArray(window.cumulativeRecitedAyahs)) {
          window.cumulativeRecitedAyahs.push(v);
        }
        window.reciteTargetIdx++;
        if (typeof window.updateCumulativeBoard === 'function') window.updateCumulativeBoard();
        if (typeof window.updateRecitePromptDisplay === 'function') window.updateRecitePromptDisplay();

        const fb = document.getElementById('micFeedbackText');
        if (fb) {
          const nextV = verses[window.reciteTargetIdx];
          const nextMsg = nextV 
            ? `👉 ماشاءالله! لطفاً اکنون آیه ${nextV.num} را از حفظ بخوانید...` 
            : `🎉 ماشاءالله! تمام آیات این سوره با موفقیت خوانده شد!`;
          fb.innerHTML = `
            <div style="background: rgba(16, 185, 129, 0.15); border: 1.5px solid #10b981; border-radius: 12px; padding: 14px 18px; margin-top: 8px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="color: #10b981; font-weight: 800; font-size: 1.15rem;">
                  <i class="fa-solid fa-circle-check"></i> ✓ آیه ${v.num} با موفقیت تأیید شد! (${accuracy || 100}%)
                </span>
                <span style="background: #10b981; color: #042f2e; font-size: 0.8rem; font-weight: 800; padding: 2px 8px; border-radius: 6px;">
                  MāshāAllāh
                </span>
              </div>
              <div style="font-family: var(--quran-font); font-size: 1.5rem; line-height: 2; margin: 10px 0; direction: rtl; text-align: right; color: #4ade80;">
                ${v.ar}
              </div>
              <div style="color: #86efac; font-size: 0.95rem; font-weight: 600; margin-top: 6px;">
                ${nextMsg}
              </div>
            </div>
          `;
        }

        if (typeof window.showToast === 'function') {
          window.showToast(`✓ آیه ${v.num} تأیید شد ➔ آیه بعدی... ⭐`);
        }
      } else {
        if (typeof origCheckAccuracy === 'function') {
          origCheckAccuracy(transcript);
        }
      }
    };

    // 3. Upgrade Sheikh Quiz Surah Change (#paneQuiz)
    window.onMurajaaSurahChanged = function (sId) {
      const num = parseInt(sId, 10) || 1;
      if (window.sheikhQuizState) {
        window.sheikhQuizState.selectedSurah = num;
        window.sheikhQuizState.currentSurah = num;
        window.sheikhQuizState.rangeType = 'surah';
      }
      if (typeof window.onSheikhQuizSurahChange === 'function') {
        try { window.onSheikhQuizSurahChange(num); } catch (e) {}
      }
      if (typeof window.generateNewSheikhQuestion === 'function') {
        try { window.generateNewSheikhQuestion(false); } catch (e) {}
      }
      const surahs = window.ALL_114_SURAHS || [];
      const sMeta = surahs.find(s => s.id === num);
      const trigLbl = document.getElementById('mqSurahTriggerLabel');
      if (trigLbl && sMeta) {
        trigLbl.textContent = `${sMeta.id}. ${sMeta.name} (${sMeta.arabic})`;
      }
      if (typeof window.showToast === 'function') {
        window.showToast(`🎯 کوئیز حفظ برای سوره ${sMeta ? sMeta.name : num} بارگذاری شد`);
      }
    };
  }

  // =========================================================================
  // 9. LIFECYCLE HOOKS & UI HARMONY
  // =========================================================================
  function updateUILanguage(lang) {
    const l = lang || getLang();

    const btnText = document.getElementById('mushafModeTextLabel');
    const btnScan = document.getElementById('mushafModeScanLabel');
    const btnMur = document.getElementById('mushafModeMurajaaLabel');

    if (btnText) btnText.textContent = t('btn_mode_text');
    if (btnScan) btnScan.textContent = t('btn_mode_scan');
    if (btnMur) btnMur.textContent = t('btn_mode_murajaa');

    if (window.state && window.state.mushafMode === 'murajaa') {
      renderMurajaaMushaf();
    }
  }
  window.Murajaa.updateUILanguage = updateUILanguage;

  function initMurajaaIntegration() {
    injectMurajaaStyles();
    upgradeGlobalVoiceRecognition();

    const origSetMushafMode = window.setMushafMode;
    window.setMushafMode = function (mode) {
      if (window.state) window.state.mushafMode = mode;

      const btnInter = document.getElementById('mushafModeInterBtn');
      const btnScan = document.getElementById('mushafModeScanBtn');
      const btnMurajaa = document.getElementById('mushafModeMurajaaBtn');
      const stageInter = document.getElementById('mushafInteractiveStage');
      const stageScan = document.getElementById('mushafScanStage');
      const stageMurajaa = document.getElementById('mushafMurajaaStage');

      const row2 = document.getElementById('mushafToolbarRow2');
      const row3 = document.getElementById('mushafToolbarRow3');
      const secPlayer = document.getElementById('mushafSectionPlayer');

      if (btnInter) btnInter.classList.toggle('active', mode === 'interactive');
      if (btnScan) btnScan.classList.toggle('active', mode === 'scan');
      if (btnMurajaa) btnMurajaa.classList.toggle('active', mode === 'murajaa');

      if (mode === 'murajaa') {
        // HIDE regular toolbar rows and audio player deck for clean Murajaa experience
        if (row2) row2.style.setProperty('display', 'none', 'important');
        if (row3) row3.style.setProperty('display', 'none', 'important');
        if (secPlayer) secPlayer.style.setProperty('display', 'none', 'important');

        if (stageInter) stageInter.style.setProperty('display', 'none', 'important');
        if (stageScan) stageScan.style.setProperty('display', 'none', 'important');
        if (stageMurajaa) stageMurajaa.style.setProperty('display', 'block', 'important');
        renderMurajaaMushaf();
      } else {
        // RESTORE regular toolbar rows and player when in Text or Scan mode
        if (row2) row2.style.setProperty('display', 'grid', 'important');
        if (row3) row3.style.setProperty('display', 'grid', 'important');
        if (secPlayer) secPlayer.style.setProperty('display', 'block', 'important');

        if (stageMurajaa) stageMurajaa.style.setProperty('display', 'none', 'important');
        if (typeof origSetMushafMode === 'function') {
          origSetMushafMode(mode);
        }
      }
    };

    window.onMushafMurajaaModeClick = function () {
      if (window.state && window.state.mushafMode !== 'murajaa') {
        window.setMushafMode('murajaa');
      } else {
        if (typeof window.toggleMushafFullscreen === 'function') {
          window.toggleMushafFullscreen();
        }
      }
    };

    const origLoadPage = window.loadPage;
    if (typeof origLoadPage === 'function') {
      window.loadPage = function (pageNum) {
        origLoadPage(pageNum);
        if (window.state && window.state.mushafMode === 'murajaa') {
          renderMurajaaMushaf();
        }
      };
    }

    const origSetAppLanguage = window.setAppLanguage;
    if (typeof origSetAppLanguage === 'function') {
      window.setAppLanguage = function (lang) {
        origSetAppLanguage(lang);
        updateUILanguage(lang);
      };
    }

    updateUILanguage(getLang());

    console.log('[Murajaa Engine] Murajaa Pro Suite v2.0 mounted successfully.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMurajaaIntegration);
  } else {
    setTimeout(initMurajaaIntegration, 150);
  }

})();
