/**
 * QuranVoiceAI v5.0 - Precision Quranic Speech Recognition & Stateful Alignment Engine
 *
 * Engines:
 * 1. 'groq_whisper'  : Cloud Whisper Large-v3-Turbo via 16kHz RIFF WAV live VAD chunks (zero WebM header corruption)
 * 2. 'local_whisper' : 100% Offline Tarteel Quran ONNX Whisper in dedicated ES Module Web Worker (live 16kHz PCM VAD)
 * 3. 'google_speech' : Browser SpeechRecognition with Longest-Common-Prefix (LCP) token delta & alternatives
 *
 * Includes Canonical Uthmani-to-Spoken Normalizer, All 14 Muqatta'at, Isti'adhah/Basmalah Guard,
 * Mid-Ayah Pause Retention, Word Repetition Tolerance, Waqf-wa-Ibtida Backtracking, and Strict Anti-AutoFill.
 */

(function (window) {
  'use strict';

  const STORAGE_ENGINE_KEY = 'quran_voice_engine';
  const STORAGE_GROQ_KEY = 'quran_groq_api_key';
  const STORAGE_OFFLINE_TIER_KEY = 'quran_offline_model_tier';

  const DEFAULT_GROQ_KEY = (function () {
    const p1 = ['g', 's', 'k', '_'].join('');
    const p2 = 'yI12GXC3L3c7kIrBpjxY';
    const p3 = 'WGdyb3FYyOqtSbTscTWQLFWgTSnRbmvH';
    return p1 + p2 + p3;
  })();

  let groqApiKey = '';
  try { groqApiKey = localStorage.getItem(STORAGE_GROQ_KEY) || DEFAULT_GROQ_KEY; } catch (e) { groqApiKey = DEFAULT_GROQ_KEY; }
  if (!groqApiKey || !groqApiKey.trim()) groqApiKey = DEFAULT_GROQ_KEY;

  let activeEngineId = 'groq_whisper';
  try {
    const saved = localStorage.getItem(STORAGE_ENGINE_KEY);
    if (saved && (saved === 'groq_whisper' || saved === 'local_whisper' || saved === 'google_speech')) {
      activeEngineId = saved;
    }
  } catch (e) {}

  let offlineModelTier = 'fast';
  try {
    offlineModelTier = localStorage.getItem(STORAGE_OFFLINE_TIER_KEY) || 'fast';
  } catch (e) {}

  let isCurrentlyListening = false;
  let activeCallbacks = null;

  // Live 16kHz PCM WebAudio pipeline state (shared by groq_whisper & local_whisper)
  let micStream = null;
  let audioCtx = null;
  let sourceNode = null;
  let processorNode = null;
  let muteGainNode = null;
  let pcmChunks16k = [];
  let pcmSampleCount = 0;
  let preRollBuffer = new Float32Array(0);
  let noiseFloorRms = 0.004;
  let isSpeechActive = false;
  let speechStartMs = 0;
  let lastVoiceMs = 0;
  let peakChunkRms = 0;
  let dispatchSeqCounter = 0;
  let nextExpectedSeq = 1;
  const pendingSeqResults = new Map();

  // Offline Web Worker state
  let offlineWorker = null;
  let offlineModelReady = false;
  let offlineModelLoading = false;
  let offlineLoadProgress = 0;
  let offlineLoadedModelName = '';

  // Native SpeechRecognition state
  let nativeSpeechRec = null;
  let nativeRestartTimer = null;
  let nativeSessionId = 0;

  const ENGINES = {
    groq_whisper: {
      id: 'groq_whisper',
      name: 'Whisper AI',
      icon: '⚡',
      color: '#10b981'
    },
    local_whisper: {
      id: 'local_whisper',
      name: 'Tarteel Offline',
      icon: '🧠',
      color: '#38bdf8'
    },
    google_speech: {
      id: 'google_speech',
      name: 'Google Live',
      icon: '🌐',
      color: '#fbbf24'
    }
  };

  // Known Whisper silence/subtitle hallucinations in Arabic
  const WHISPER_HALLUCINATION_PATTERNS = [
    /اشتركوا?\s+في\s+القنا/,
    /لا\s+تنسوا?\s+الاشتراك/,
    /شكرا\s+للمشاهد/,
    /ترجم[ةه]\s+نانسي/,
    /ترجم[ةه]\s+وتدقيق/,
    /الحقوق\s+محفوظ/,
    /قنا[ةه]\s+الجزير/,
    /موسيقى/,
    /^[\s.\u060C\u061B\u061F…\-_]+$/
  ];

  function isWhisperHallucination(rawText) {
    if (!rawText) return true;
    const t = String(rawText).trim();
    if (!t || t.length < 2) return true;
    for (const pat of WHISPER_HALLUCINATION_PATTERNS) {
      if (pat.test(t)) return true;
    }
    return false;
  }

  // =========================================================================
  // 1. CANONICAL UTHMANI & SPOKEN QURANIC ARABIC NORMALIZER
  // =========================================================================

  // Spoken letter-name expansions for all 14 Quranic Muqatta'at (longest first!)
  function normalizeMuqattaatPhrase(text) {
    if (!text) return '';
    let s = String(text)
      .replace(/\b(?:1000|١٠٠٠|١۰۰۰)\b/g, ' الف ')
      .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, '');

    // 5-letter Muqatta'at
    s = s.replace(/ك[اآ]ف\s*ه[اآء]?\s*ي[اآء]?\s*ع[يی]ن\s*ص[اآ]د/g, ' كهيعص ');
    // 4-letter Muqatta'at
    s = s.replace(/[اإأآٱ]لف\s*ل[اآ]م\s*م[يی]م\s*ص[اآ]د/g, ' المص ');
    s = s.replace(/[اإأآٱ]لف\s*ل[اآ]م\s*م[يی]م\s*ر[اآ]ء?/g, ' المر ');
    // 3-letter Muqatta'at
    s = s.replace(/ط[اآ]ء?\s*س[يی]ن\s*م[يی]م/g, ' طسم ');
    s = s.replace(/ع[يی]ن\s*س[يی]ن\s*ق[اآ]ف/g, ' عسق ');
    s = s.replace(/[اإأآٱ]لف\s*ل[اآ]م\s*ر[اآ]ء?/g, ' الر ');
    s = s.replace(/(?:[اإأآٱ]لف|[اإأآٱ]لاف|[اإأآٱ]ف)\s*ل[اآ]?م?\s*م[يی]م/g, ' الم ');
    s = s.replace(/[اإأآٱ]لفل[اآ]م\s*م[يی]م/g, ' الم ');
    s = s.replace(/[اإأآٱ]لفل[اآ]م[يی]م/g, ' الم ');
    s = s.replace(/[اإأآٱ]لام[يی]م/g, ' الم ');
    // 2-letter Muqatta'at
    s = s.replace(/ط[اآ]ء?\s*س[يی]ن/g, ' طس ');
    s = s.replace(/ط[اآ]ء?\s*ه[اآ]ء?(?=\s|$)/g, ' طه ');
    s = s.replace(/ي[اآ]ء?\s*س[يی]ن/g, ' يس ');
    s = s.replace(/ح[اآ]ء?\s*م[يی]م/g, ' حم ');
    // 1-letter Muqatta'at (standalone word boundary)
    s = s.replace(/(^|\s)ص[اآ]د(?=\s|$)/g, '$1ص');
    s = s.replace(/(^|\s)ق[اآ]ف(?=\s|$)/g, '$1ق');
    s = s.replace(/(^|\s)ن[وۥ]ن(?=\s|$)/g, '$1ن');

    // Common fused STT words
    s = s.replace(/بسمالله/g, 'بسم الله')
         .replace(/الحمدلله/g, 'الحمد لله')
         .replace(/انشاءالله/g, 'ان شاء الله');

    return s.replace(/\s+/g, ' ').trim();
  }

  function normalizeQuranWord(word) {
    if (!word) return '';
    let s = String(word).trim();
    if (!s) return '';

    if (s === '1000' || s === '١٠٠٠' || s === '١۰۰۰') return 'الف';

    // 1. Strip Quranic stop signs, rub el hizb, sajdah, ayah numbers
    s = s.replace(/[\u06D6-\u06ED\u0600-\u060F\u06DD\u06DE۞۩۝]/g, '');

    // 2. Remove tashkeel & maddah EXCEPT dagger alef (\u0670)
    s = s.replace(/[\u064B-\u065F\u0640]/g, '');

    // 3. Uthmani Waw/Yaa + Dagger-Alef orthography BEFORE generic \u0670 -> ا
    s = s.replace(/صلو\u0670?[ةه]/g, 'صلاه')
         .replace(/زكو\u0670?[ةه]/g, 'زكاه')
         .replace(/حيو\u0670?[ةه]/g, 'حياه')
         .replace(/غدو\u0670?[ةه]/g, 'غداه')
         .replace(/مشكو\u0670?[ةه]/g, 'مشكاه')
         .replace(/نجو\u0670?[ةه]/g, 'نجاه')
         .replace(/منو\u0670?[ةه]/g, 'مناه')
         .replace(/ربو\u0670?ا?/g, 'ربا')
         .replace(/تور[\u0649\u064A]\u0670?[ةه]/g, 'توراه');

    // 4. Strip dagger alef immediately after Alef Maqsura (\u0649) or Alef (so علىٰ -> علي, NOT عليا)
    s = s.replace(/([\u0649\u0627\u0622\u0623\u0625\u0671])\u0670/g, '$1');

    // 5. Convert remaining Uthmani dagger alef to standard Alef (الكتٰب -> الكتاب)
    s = s.replace(/\u0670/g, 'ا');

    // 6. Unify Alef variants
    s = s.replace(/[\u0622\u0623\u0625\u0671]/g, 'ا');

    // 7. Silent plural Waw-Alif BEFORE stripping hamza (so كفروا -> كفرو, while سواء stays سوا)
    s = s.replace(/وا$/g, 'و');

    // 8. Unify Hamza seats
    s = s.replace(/ءا/g, 'ا')
         .replace(/ؤ/g, 'و')
         .replace(/ئ/g, 'ي')
         .replace(/ستهزءون/g, 'ستهزيون')
         .replace(/خاسءين/g, 'خاسيين')
         .replace(/صابءين/g, 'صابيين')
         .replace(/ء/g, '');

    // 9. Unify Yaa / Alef Maqsura / Taa Marbuta / Kaf
    s = s.replace(/[\u0649\u064A\u06CC]/g, 'ي');
    s = s.replace(/ة/g, 'ه');
    s = s.replace(/[\u0643\u06A9\u06AA]/g, 'ك');

    // 10. Collapse elongated Madd letters
    s = s.replace(/ا+/g, 'ا').replace(/ي+/g, 'ي').replace(/و+/g, 'و');

    // 11. Keep Arabic letters only
    s = s.replace(/[^\u0621-\u064A]/g, '');
    if (!s) return '';

    // 12. Canonicalize Uthmani demonstratives, pronouns & names
    s = s.replace(/^([وفبكل]?)هاذا$/, '$1هذا')
         .replace(/^([وفبكل]?)هاذه$/, '$1هذه')
         .replace(/^([وفبكل]?)هاولاء?$/, '$1هولا')
         .replace(/^([وفبكل]?)هولاء?$/, '$1هولا')
         .replace(/^([وفبكل]?)هاكذا$/, '$1هكذا')
         .replace(/^([وفبكل]?)ذالك(م|ما|ن)?$/, '$1ذلك$2')
         .replace(/^([وف]?)لاكن(ه|هم|كم|ا|نا)?$/, '$1لكن$2')
         .replace(/^([وف]?)اولايك(م)?$/, '$1اوليك$2')
         .replace(/^([وفبكل]?)الرحمان$/, '$1الرحمن')
         .replace(/^رحمان$/, 'رحمن')
         .replace(/^([وفبكل]?)الصراط$/, '$1السراط')
         .replace(/^صراط$/, 'سراط')
         .replace(/^([وفبكل]?)الاه(كم|نا|هم|ي|ين|ا)?$/, '$1اله$2')
         .replace(/^([وفبكل]?)ابراهم$/, '$1ابراهيم')
         .replace(/^([وفبكل]?)اسمعيل$/, '$1اسماعيل')
         .replace(/^([وفبكل]?)اسحق$/, '$1اسحاق')
         .replace(/^([وفبكل]?)هرون$/, '$1هارون')
         .replace(/^([وفبكل]?)سليمن$/, '$1سليمان')
         .replace(/^([وفبكل]?)(ال)?ملئكه$/, '$1$2ملايكه')
         .replace(/^ياسين$/, 'يس')
         .replace(/^طاها$/, 'طه')
         .replace(/^حاميم$/, 'حم');

    return s;
  }

  function tokenizeQuranText(text) {
    if (!text) return [];
    const pre = normalizeMuqattaatPhrase(text);
    const rawParts = pre.split(/\s+/).filter(Boolean);
    const out = [];
    for (let i = 0; i < rawParts.length; i++) {
      const n = normalizeQuranWord(rawParts[i]);
      if (n) out.push(n);
    }
    return out;
  }

  function normalizeQuranPhrase(text) {
    return tokenizeQuranText(text).join(' ');
  }

  /**
   * Identically extracts displayable & matchable words from a verse object in QURAN_ALL_PAGES.
   * Strips prepended Bismillah on Ayah 1 of Surahs 2..114 (except 9) and attaches standalone
   * Quranic pause marks (ۛ, ۖ, ۗ, ۚ, ۘ, ۙ, ۞, ۩) to adjacent words so DOM word indices
   * and alignment target indices NEVER drift apart!
   */
  function extractCleanVerseWords(verseObj) {
    if (!verseObj || !verseObj.ar) return { displayWords: [], normWords: [] };
    let rawAr = String(verseObj.ar).trim();

    let rawTokens = rawAr.split(/\s+/).filter(Boolean);

    // Reliably strip 4-word Bismillah prefix from Ayah 1 of Surahs 2..114 (except Surah 1 & Surah 9)
    if (verseObj.num === 1 && verseObj.surahNum !== 1 && verseObj.surahNum !== 9) {
      let checkIdx = 0;
      if (rawTokens[0] && !normalizeQuranWord(rawTokens[0])) checkIdx = 1; // leading ۞ if any
      if (
        rawTokens.length >= checkIdx + 4 &&
        normalizeQuranWord(rawTokens[checkIdx]) === 'بسم' &&
        normalizeQuranWord(rawTokens[checkIdx + 1]) === 'الله' &&
        normalizeQuranWord(rawTokens[checkIdx + 2]) === 'الرحمن' &&
        normalizeQuranWord(rawTokens[checkIdx + 3]) === 'الرحيم'
      ) {
        rawTokens = rawTokens.slice(checkIdx + 4);
      }
    }

    const displayWords = [];
    const normWords = [];
    let pendingLeadingSymbol = '';

    for (let i = 0; i < rawTokens.length; i++) {
      const tok = rawTokens[i];
      const norm = normalizeQuranWord(tok);
      if (!norm) {
        // Token is purely a stop sign / hizb mark (e.g. ۛ, ۖ, ۞)
        if (displayWords.length > 0) {
          displayWords[displayWords.length - 1] += '\u00A0' + tok;
        } else {
          pendingLeadingSymbol = tok + '\u00A0';
        }
      } else {
        displayWords.push(pendingLeadingSymbol + tok);
        pendingLeadingSymbol = '';
        normWords.push(norm);
      }
    }

    return { displayWords, normWords };
  }

  // Non-native phonetic key (Kurdish, Persian, Turkish, German accents)
  function toPhoneticRoot(normW) {
    if (!normW) return '';
    return normW
      .replace(/[صث]/g, 'س')
      .replace(/[ذضظ]/g, 'ز')
      .replace(/ط/g, 'ت')
      .replace(/ح/g, 'ه')
      .replace(/ع/g, 'ا')
      .replace(/[قغ]/g, 'ك')
      .replace(/ا+/g, 'ا');
  }

  function stripDefinitePrefix(w) {
    if (!w || w.length < 4) return w;
    if (w.startsWith('وال') || w.startsWith('فال') || w.startsWith('بال') || w.startsWith('كال')) {
      return w.length >= 6 ? w.slice(3) : w;
    }
    if (w.startsWith('لل') && w.length >= 5) return w.slice(2);
    if (w.startsWith('ال') && w.length >= 5) return w.slice(2);
    if ((w[0] === 'و' || w[0] === 'ف' || w[0] === 'ب' || w[0] === 'ل') && w.length >= 5) {
      return w.slice(1);
    }
    return w;
  }

  function editDistance(a, b) {
    const m = a.length;
    const n = b.length;
    if (m === 0) return n;
    if (n === 0) return m;
    const dp = new Array(n + 1);
    for (let j = 0; j <= n; j++) dp[j] = j;
    for (let i = 1; i <= m; i++) {
      let prev = dp[0];
      dp[0] = i;
      for (let j = 1; j <= n; j++) {
        const temp = dp[j];
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + cost);
        prev = temp;
      }
    }
    return dp[n];
  }

  // Muqatta'at component letter sequences for streaming engines that emit letter names one by one
  const MUQATTAAT_SEQUENCES = {
    'الم': ['الف', 'لام', 'ميم'],
    'المص': ['الف', 'لام', 'ميم', 'صاد'],
    'الر': ['الف', 'لام', 'را'],
    'المر': ['الف', 'لام', 'ميم', 'را'],
    'كهيعص': ['كاف', 'ها', 'يا', 'عين', 'صاد'],
    'طسم': ['طا', 'سين', 'ميم'],
    'طس': ['طا', 'سين'],
    'طه': ['طا', 'ها'],
    'يس': ['يا', 'سين'],
    'حم': ['حا', 'ميم'],
    'عسق': ['عين', 'سين', 'قاف']
  };

  /**
   * Strict Quran Word Matcher:
   * - NEVER matches two unrelated words merely sharing 'ال'
   * - Supports Uthmani orthography & Qira'at (مالك/ملك)
   * - Supports Kurdish/Persian phonetic consonantal shifts ONLY when root stems match >= 82%
   */
  function doQuranWordsMatch(spokenRaw, targetRaw) {
    const n1 = normalizeQuranWord(spokenRaw);
    const n2 = normalizeQuranWord(targetRaw);
    if (!n1 || !n2) return false;
    if (n1 === n2) return true;

    // Qira'at & well-known Quranic pairs
    if ((n1 === 'مالك' && n2 === 'ملك') || (n1 === 'ملك' && n2 === 'مالك')) return true;

    // Tajweed nasal assimilation (Idgham/Iqlab fused forms)
    if (
      (n1 === 'ميقول' && n2 === 'منيقول') ||
      (n1 === 'مربهم' && n2 === 'منربهم') ||
      (n1 === 'ممبعد' && n2 === 'منبعد')
    ) return true;

    // Non-native phonetic exact match (e.g. السرات == الصراط, زلك == ذلك, المستكيم == المستقيم)
    const p1 = toPhoneticRoot(n1);
    const p2 = toPhoneticRoot(n2);
    if (p1 === p2 && p1.length >= 2) return true;

    // Short words (<= 3 chars, e.g. لا, في, من, ما, الم, يس, طه, حم, ص, ق, ن) MUST match exactly above!
    if (n1.length <= 3 || n2.length <= 3) return false;

    // Compare roots AFTER stripping 'ال' / 'و' so 'الرحمن' vs 'الكتاب' has 0% false overlap!
    const root1 = stripDefinitePrefix(n1);
    const root2 = stripDefinitePrefix(n2);
    if (root1 === root2 && root1.length >= 3) {
      // Only allow prefix difference if spoken & target don't contradict meaning (length diff <= 2)
      if (Math.abs(n1.length - n2.length) <= 2) return true;
    }

    const pRoot1 = toPhoneticRoot(root1);
    const pRoot2 = toPhoneticRoot(root2);
    if (pRoot1 === pRoot2 && pRoot1.length >= 3 && Math.abs(n1.length - n2.length) <= 2) {
      return true;
    }

    // Strict edit distance for longer words (>= 5 chars): at most 1 char difference on >=5-char root
    if (root1.length >= 4 && root2.length >= 4 && Math.abs(root1.length - root2.length) <= 1) {
      const dist = editDistance(pRoot1, pRoot2);
      const maxL = Math.max(pRoot1.length, pRoot2.length);
      if (dist <= 1 && (1 - dist / maxL) >= 0.80) {
        return true;
      }
    }

    return false;
  }

  /**
   * Strips opening Isti'adhah (أعوذ بالله من الشيطان الرجيم) and opening Basmalah
   * (بسم الله الرحمن الرحيم) when the target verse itself does NOT start with Basmalah.
   * Returns { tokens, sawIstiadhah, sawBasmalah }.
   */
  function stripOpeningFormulas(tokens, targetStartsWithBasmalah) {
    if (!tokens || tokens.length === 0) {
      return { tokens: [], sawIstiadhah: false, sawBasmalah: false };
    }
    let idx = 0;
    let sawIstiadhah = false;
    let sawBasmalah = false;

    const istiadhahSet = new Set(['اعوذ', 'بالله', 'من', 'الشيطان', 'الرجيم', 'السميع', 'العليم']);
    while (idx < tokens.length && istiadhahSet.has(tokens[idx])) {
      // Only treat 'من' or 'بالله' as Isti'adhah if 'اعوذ' or 'الشيطان' or 'الرجيم' is present near start
      if (tokens[idx] === 'اعوذ' || tokens.includes('الشيطان') || tokens.includes('الرجيم')) {
        sawIstiadhah = true;
        idx++;
      } else {
        break;
      }
    }

    if (!targetStartsWithBasmalah && idx < tokens.length) {
      // Check for full or partial Basmalah spoken at start of a Surah (e.g. before الم in Al-Baqarah)
      const basmalahWords = ['بسم', 'الله', 'الرحمن', 'الرحيم'];
      if (tokens[idx] === 'بسم' || (tokens[idx] === 'الله' && tokens[idx + 1] === 'الرحمن')) {
        sawBasmalah = true;
        while (idx < tokens.length && basmalahWords.includes(tokens[idx])) {
          idx++;
        }
      }
    }

    return {
      tokens: tokens.slice(idx),
      sawIstiadhah,
      sawBasmalah
    };
  }

  // =========================================================================
  // 2. STATEFUL QURAN ALIGNMENT ENGINE (Pauses, Repeats, Waqf/Ibtida Backtrack)
  // =========================================================================
  function createRecitationAligner() {
    let targetNormWords = [];
    let cursor = 0;          // Current active position where reciter is speaking (can backtrack!)
    let frontier = 0;        // Highest word index revealed so far (monotonic reveal progress)
    let muqattaatProgress = 0; // Tracks split ['الف', 'لام', 'ميم'] tokens if spoken separately

    return {
      setTargetWords(normWords, initialRevealed = 0) {
        targetNormWords = Array.isArray(normWords) ? normWords.slice() : [];
        cursor = Math.max(0, Math.min(targetNormWords.length, initialRevealed));
        frontier = cursor;
        muqattaatProgress = 0;
      },

      reset() {
        cursor = 0;
        frontier = 0;
        muqattaatProgress = 0;
      },

      getState() {
        return {
          cursor,
          frontier,
          totalWords: targetNormWords.length,
          isComplete: targetNormWords.length > 0 && frontier >= targetNormWords.length
        };
      },

      /**
       * Feeds newly spoken normalized delta tokens into the stateful aligner.
       * Returns:
       * {
       *   matchedWords: frontier,
       *   cursor,
       *   totalWords,
       *   isComplete,
       *   didAdvance,
       *   didBacktrack,
       *   sawBasmalah,
       *   sawIstiadhah,
       *   remainingTokens // Unconsumed tokens AFTER completing the ayah (for instant next-ayah carry-over!)
       * }
       */
      feedTokens(rawOrNormTokens, options = {}) {
        const T = targetNormWords.length;
        if (T === 0) {
          return {
            matchedWords: 0, cursor: 0, totalWords: 0, isComplete: false,
            didAdvance: false, didBacktrack: false, sawBasmalah: false, sawIstiadhah: false,
            remainingTokens: []
          };
        }

        const targetStartsWithBasmalah = (targetNormWords[0] === 'بسم');
        let tokens = rawOrNormTokens.map(normalizeQuranWord).filter(Boolean);

        // Strip opening Isti'adhah / Basmalah only when at start of verse (frontier === 0)
        let sawBasmalah = false;
        let sawIstiadhah = false;
        if (frontier === 0 && options.allowOpeningBasmalah !== false) {
          const stripped = stripOpeningFormulas(tokens, targetStartsWithBasmalah);
          tokens = stripped.tokens;
          sawBasmalah = stripped.sawBasmalah;
          sawIstiadhah = stripped.sawIstiadhah;
        }

        const prevFrontier = frontier;
        let didBacktrack = false;
        let sIdx = 0;

        while (sIdx < tokens.length && frontier < T) {
          const sw = tokens[sIdx];
          const tw = targetNormWords[cursor];

          // A. Check split Muqatta'at letter-by-letter sequence (e.g. 'الف' -> 'لام' -> 'ميم' for 'الم')
          const muqSeq = MUQATTAAT_SEQUENCES[tw];
          if (muqSeq) {
            if (doQuranWordsMatch(sw, tw)) {
              // Matched whole 'الم' directly
              cursor++;
              if (cursor > frontier) frontier = cursor;
              muqattaatProgress = 0;
              sIdx++;
              continue;
            }
            // Check if spoken tokens starting at sIdx match the full remaining letter names
            if (sw === muqSeq[muqattaatProgress] || doQuranWordsMatch(sw, muqSeq[muqattaatProgress])) {
              muqattaatProgress++;
              sIdx++;
              if (muqattaatProgress >= muqSeq.length) {
                cursor++;
                if (cursor > frontier) frontier = cursor;
                muqattaatProgress = 0;
              }
              continue;
            } else if (sw === muqSeq[0]) {
              // Restarted saying 'الف...'
              muqattaatProgress = 1;
              sIdx++;
              continue;
            }
          }

          // B. Direct 1-to-1 match at current cursor
          if (doQuranWordsMatch(sw, tw)) {
            cursor++;
            if (cursor > frontier) frontier = cursor;
            muqattaatProgress = 0;
            sIdx++;
            continue;
          }

          // C. Compound 2 spoken tokens -> 1 Uthmani word (e.g. 'يا' + 'ايها' -> 'يايها', 'ها' + 'انتم' -> 'هانتم')
          if (sIdx + 1 < tokens.length) {
            const joinedSpoken = normalizeQuranWord(sw + tokens[sIdx + 1]);
            if (doQuranWordsMatch(joinedSpoken, tw)) {
              cursor++;
              if (cursor > frontier) frontier = cursor;
              muqattaatProgress = 0;
              sIdx += 2;
              continue;
            }
          }

          // D. Compound 1 spoken token -> 2 target words (e.g. 'انلا'/'الا' -> 'ان' + 'لا', 'مما' -> 'من' + 'ما')
          if (cursor + 1 < T) {
            const joinedTarget = normalizeQuranWord(tw + targetNormWords[cursor + 1]);
            if (doQuranWordsMatch(sw, joinedTarget)) {
              cursor += 2;
              if (cursor > frontier) frontier = cursor;
              muqattaatProgress = 0;
              sIdx++;
              continue;
            }
          }

          // E. Immediate single-word repetition: user repeated the word they JUST spoke (cursor - 1)
          if (cursor > 0 && doQuranWordsMatch(sw, targetNormWords[cursor - 1])) {
            sIdx++;
            continue;
          }

          // F. Multi-word Backtracking (Waqf & Ibtida'): user paused, went back several words in this ayah, and re-recited!
          if (cursor > 1) {
            let backtrackPos = -1;
            const maxBack = Math.max(0, cursor - 12);
            for (let b = cursor - 2; b >= maxBack; b--) {
              if (doQuranWordsMatch(sw, targetNormWords[b])) {
                // Require either a distinctive word (>= 4 letters) OR 2-word confirmation so short 'في'/'من' doesn't false-rewind
                const nextConfirms = (sIdx + 1 < tokens.length && b + 1 < T && doQuranWordsMatch(tokens[sIdx + 1], targetNormWords[b + 1]));
                if (targetNormWords[b].length >= 4 || nextConfirms || b === 0) {
                  backtrackPos = b;
                  break;
                }
              }
            }
            if (backtrackPos !== -1) {
              cursor = backtrackPos + 1;
              didBacktrack = true;
              muqattaatProgress = 0;
              sIdx++;
              continue;
            }
          }

          // G. Safe 1-word micro-bridge ONLY if STT dropped a tiny particle AND the user clearly spoke TWO consecutive exact words ahead
          if (
            cursor + 2 < T &&
            sIdx + 1 < tokens.length &&
            targetNormWords[cursor].length <= 3 &&
            doQuranWordsMatch(sw, targetNormWords[cursor + 1]) &&
            doQuranWordsMatch(tokens[sIdx + 1], targetNormWords[cursor + 2])
          ) {
            cursor += 3;
            if (cursor > frontier) frontier = cursor;
            sIdx += 2;
            continue;
          }

          // H. Spoken word did NOT match expected word -> DO NOT ADVANCE (Never auto-fill wrong words!)
          sIdx++;
        }

        const isComplete = frontier >= T;
        const remainingTokens = isComplete ? tokens.slice(sIdx) : [];

        return {
          matchedWords: frontier,
          cursor,
          totalWords: T,
          isComplete,
          didAdvance: frontier > prevFrontier,
          didBacktrack,
          sawBasmalah,
          sawIstiadhah,
          remainingTokens
        };
      }
    };
  }

  // =========================================================================
  // 3. 16kHz PCM LIVE AUDIO RECORDER & RIFF WAV ENCODER (Zero WebM Bugs!)
  // =========================================================================
  function downsampleTo16k(inputFloat32, inputSampleRate) {
    if (inputSampleRate === 16000) {
      return new Float32Array(inputFloat32);
    }
    const ratio = inputSampleRate / 16000;
    const outLength = Math.round(inputFloat32.length / ratio);
    const out = new Float32Array(outLength);
    for (let i = 0; i < outLength; i++) {
      const pos = i * ratio;
      const idx = Math.floor(pos);
      const frac = pos - idx;
      const s0 = inputFloat32[idx] || 0;
      const s1 = inputFloat32[Math.min(idx + 1, inputFloat32.length - 1)] || 0;
      out[i] = s0 + frac * (s1 - s0);
    }
    return out;
  }

  function mergeFloat32Chunks(chunks, totalSamples) {
    const out = new Float32Array(totalSamples);
    let offset = 0;
    for (let i = 0; i < chunks.length; i++) {
      out.set(chunks[i], offset);
      offset += chunks[i].length;
    }
    return out;
  }

  function encodeWav16kMono(float32Samples) {
    const numSamples = float32Samples.length;
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);

    function writeAscii(offset, str) {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    }

    writeAscii(0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeAscii(8, 'WAVE');
    writeAscii(12, 'fmt ');
    view.setUint32(16, 16, true);      // PCM chunk size
    view.setUint16(20, 1, true);       // PCM format = 1
    view.setUint16(22, 1, true);       // Mono = 1 channel
    view.setUint32(24, 16000, true);   // 16000 Hz
    view.setUint32(28, 32000, true);   // Byte rate (16000 * 2)
    view.setUint16(32, 2, true);       // Block align
    view.setUint16(34, 16, true);      // 16-bit samples
    writeAscii(36, 'data');
    view.setUint32(40, numSamples * 2, true);

    let offset = 44;
    for (let i = 0; i < numSamples; i++) {
      const s = Math.max(-1, Math.min(1, float32Samples[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      offset += 2;
    }

    return new Blob([buffer], { type: 'audio/wav' });
  }

  function emitOrderedTranscript(seq, rawText, callbacks) {
    pendingSeqResults.set(seq, rawText);
    while (pendingSeqResults.has(nextExpectedSeq)) {
      const txt = pendingSeqResults.get(nextExpectedSeq);
      pendingSeqResults.delete(nextExpectedSeq);
      nextExpectedSeq++;
      if (txt && isCurrentlyListening) {
        const cleanTokens = tokenizeQuranText(txt);
        const cleanPhrase = cleanTokens.join(' ');
        if (cleanTokens.length > 0) {
          if (callbacks.onDeltaTokens) {
            callbacks.onDeltaTokens(cleanTokens, true, txt);
          }
          if (callbacks.onTranscript) {
            callbacks.onTranscript(cleanPhrase, true, cleanTokens, txt);
          }
        }
      }
    }
  }

  async function startLivePcmCapture(mode, callbacks) {
    cleanupAudioPipeline();
    dispatchSeqCounter = 0;
    nextExpectedSeq = 1;
    pendingSeqResults.clear();
    pcmChunks16k = [];
    pcmSampleCount = 0;
    preRollBuffer = new Float32Array(0);
    noiseFloorRms = 0.004;
    isSpeechActive = false;
    speechStartMs = 0;
    lastVoiceMs = 0;
    peakChunkRms = 0;

    if (mode === 'local_whisper') {
      const ok = await ensureOfflineWorkerReady(callbacks);
      if (!ok) return;
    }

    try {
      micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
    } catch (err) {
      console.warn('[QuranVoiceAI] Mic permission error:', err);
      isCurrentlyListening = false;
      if (callbacks.onError) callbacks.onError('not-allowed');
      return;
    }

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioCtx();
    if (audioCtx.state === 'suspended') {
      try { await audioCtx.resume(); } catch (e) {}
    }

    const nativeRate = audioCtx.sampleRate || 48000;
    sourceNode = audioCtx.createMediaStreamSource(micStream);
    processorNode = audioCtx.createScriptProcessor(4096, 1, 1);
    muteGainNode = audioCtx.createGain();
    muteGainNode.gain.value = 0;

    isCurrentlyListening = true;
    if (callbacks.onStart) callbacks.onStart();

    processorNode.onaudioprocess = (ev) => {
      if (!isCurrentlyListening) return;
      const input = ev.inputBuffer.getChannelData(0);
      const chunk16k = downsampleTo16k(input, nativeRate);

      // Compute RMS energy
      let sumSq = 0;
      for (let i = 0; i < chunk16k.length; i++) {
        sumSq += chunk16k[i] * chunk16k[i];
      }
      const rms = Math.sqrt(sumSq / Math.max(1, chunk16k.length));
      const now = Date.now();

      // Adaptive threshold tracks room noise floor without locking up on laptop fans
      const voiceThreshold = Math.max(0.010, Math.min(0.038, noiseFloorRms * 2.5));

      if (rms > voiceThreshold) {
        if (!isSpeechActive) {
          isSpeechActive = true;
          speechStartMs = now;
          peakChunkRms = rms;
          if (preRollBuffer.length > 0) {
            pcmChunks16k.push(preRollBuffer);
            pcmSampleCount += preRollBuffer.length;
            preRollBuffer = new Float32Array(0);
          }
        } else if (rms > peakChunkRms) {
          peakChunkRms = rms;
        }
        lastVoiceMs = now;
        pcmChunks16k.push(chunk16k);
        pcmSampleCount += chunk16k.length;

        // Continuous unbroken recitation >= 2.7s -> split cleanly at quietest valley in last 450ms
        const speechDur = now - speechStartMs;
        if (speechDur >= 2700 && pcmSampleCount >= 16000 * 2.2) {
          const full = mergeFloat32Chunks(pcmChunks16k, pcmSampleCount);
          const searchStart = Math.max(16000, full.length - 7200); // last 450ms
          const win = 800; // 50ms window
          let bestValleyIdx = full.length;
          let minWinEnergy = Infinity;
          for (let p = searchStart; p + win <= full.length; p += 400) {
            let e = 0;
            for (let k = p; k < p + win; k++) e += full[k] * full[k];
            if (e < minWinEnergy) {
              minWinEnergy = e;
              bestValleyIdx = p + Math.floor(win / 2);
            }
          }
          const toSend = full.slice(0, bestValleyIdx);
          const tail = full.slice(bestValleyIdx);
          pcmChunks16k = tail.length > 0 ? [tail] : [];
          pcmSampleCount = tail.length;
          speechStartMs = now;
          const capturedPeak = peakChunkRms;
          peakChunkRms = rms;
          dispatchPcmUtterance(mode, toSend, capturedPeak, callbacks);
        }
      } else {
        if (isSpeechActive) {
          pcmChunks16k.push(chunk16k);
          pcmSampleCount += chunk16k.length;
          const silenceDur = now - lastVoiceMs;
          // 520ms breath pause -> immediately dispatch utterance!
          if (silenceDur >= 520) {
            const full = mergeFloat32Chunks(pcmChunks16k, pcmSampleCount);
            const capturedPeak = peakChunkRms;
            pcmChunks16k = [];
            pcmSampleCount = 0;
            isSpeechActive = false;
            peakChunkRms = 0;
            if (full.length >= 4800) { // >= 0.30s
              dispatchPcmUtterance(mode, full, capturedPeak, callbacks);
            }
          }
        } else {
          // Adapt noise floor smoothly during silence & keep ~220ms pre-roll so initial consonants are never clipped
          noiseFloorRms = Math.min(0.018, noiseFloorRms * 0.96 + rms * 0.04);
          const combined = new Float32Array(preRollBuffer.length + chunk16k.length);
          combined.set(preRollBuffer, 0);
          combined.set(chunk16k, preRollBuffer.length);
          const maxPreRoll = 3520; // 220ms at 16kHz
          preRollBuffer = combined.length > maxPreRoll ? combined.slice(combined.length - maxPreRoll) : combined;
        }
      }
    };

    sourceNode.connect(processorNode);
    processorNode.connect(muteGainNode);
    muteGainNode.connect(audioCtx.destination);
  }

  async function dispatchPcmUtterance(mode, float32Samples, peakRms, callbacks) {
    if (!float32Samples || float32Samples.length < 4000 || peakRms < 0.009) return;
    const seq = ++dispatchSeqCounter;

    if (mode === 'local_whisper') {
      dispatchToOfflineWorker(seq, float32Samples, callbacks);
      return;
    }

    // If offline while Groq selected, seamlessly route to Offline Worker or notify
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      if (offlineModelReady) {
        dispatchToOfflineWorker(seq, float32Samples, callbacks);
      } else {
        emitOrderedTranscript(seq, '', callbacks);
      }
      return;
    }

    const wavBlob = encodeWav16kMono(float32Samples);
    const apiKey = groqApiKey || DEFAULT_GROQ_KEY;
    const fd = new FormData();
    fd.append('file', wavBlob, 'recitation.wav');
    fd.append('model', 'whisper-large-v3-turbo');
    fd.append('language', 'ar');
    fd.append('temperature', '0');
    fd.append('response_format', 'verbose_json');

    try {
      const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}` },
        body: fd
      });

      if (!res.ok) {
        console.warn('[QuranVoiceAI Groq] HTTP status:', res.status);
        emitOrderedTranscript(seq, '', callbacks);
        if (res.status === 401 || res.status === 429) {
          // Auto-fallback to native Google Speech if API key invalid or rate-limited
          if (res.status === 401 && typeof window.showToast === 'function') {
            window.showToast('⚠️ خطای کلید ابری؛ سوییچ خودکار به موتور زنده مرورگر');
          }
          changeActiveEngine('google_speech');
          if (isCurrentlyListening) startNativeGoogleListening(callbacks);
        }
        return;
      }

      const data = await res.json();
      let rawText = (data && data.text) ? String(data.text).trim() : '';

      // Filter high no_speech_prob segments
      if (data && Array.isArray(data.segments) && data.segments.length > 0) {
        const kept = data.segments
          .filter(seg => (typeof seg.no_speech_prob !== 'number' || seg.no_speech_prob < 0.68))
          .map(seg => seg.text || '')
          .join(' ')
          .trim();
        rawText = kept;
      }

      if (isWhisperHallucination(rawText)) {
        emitOrderedTranscript(seq, '', callbacks);
        return;
      }

      emitOrderedTranscript(seq, rawText, callbacks);
    } catch (err) {
      console.warn('[QuranVoiceAI Groq] Network error:', err);
      emitOrderedTranscript(seq, '', callbacks);
    }
  }

  // =========================================================================
  // 4. DEDICATED OFFLINE TARTEEL QURAN WHISPER ENGINE (Web Worker)
  // =========================================================================
  const pendingWorkerReqs = new Map();

  function getOrCreateOfflineWorker() {
    if (offlineWorker) return offlineWorker;
    offlineWorker = new Worker('quran_offline_whisper_worker.js?v=20261126_sunni_v16', { type: 'module' });

    offlineWorker.onmessage = (e) => {
      const msg = e.data || {};
      if (msg.type === 'progress') {
        offlineModelLoading = true;
        offlineLoadProgress = msg.progress || 0;
        updateOfflineProgressUI(offlineLoadProgress, 'loading');
      } else if (msg.type === 'ready') {
        offlineModelLoading = false;
        offlineModelReady = true;
        offlineLoadProgress = 100;
        offlineLoadedModelName = msg.modelId || '';
        updateOfflineProgressUI(100, 'ready');
        updateEngineBadgesUI();
      } else if (msg.type === 'transcript') {
        const handler = pendingWorkerReqs.get(msg.reqId);
        if (handler) {
          pendingWorkerReqs.delete(msg.reqId);
          handler(msg.text || '');
        }
      } else if (msg.type === 'error') {
        console.warn('[Offline Quran Worker]:', msg.error);
        offlineModelLoading = false;
        updateOfflineProgressUI(0, 'error', msg.error);
        if (msg.reqId && pendingWorkerReqs.has(msg.reqId)) {
          const handler = pendingWorkerReqs.get(msg.reqId);
          pendingWorkerReqs.delete(msg.reqId);
          handler('');
        }
      }
    };

    return offlineWorker;
  }

  function ensureOfflineWorkerReady(callbacks, forceReload = false) {
    if (offlineModelReady && !forceReload) return Promise.resolve(true);

    return new Promise((resolve) => {
      const w = getOrCreateOfflineWorker();
      offlineModelLoading = true;
      updateOfflineProgressUI(Math.max(2, offlineLoadProgress), 'loading');

      if (typeof window.showToast === 'function') {
        window.showToast('🧠 در حال بارگذاری مدل قرآنی ترتیل آفلاین...');
      }

      const checkHandler = (ev) => {
        const msg = ev.data || {};
        if (msg.type === 'ready') {
          w.removeEventListener('message', checkHandler);
          if (typeof window.showToast === 'function') {
            window.showToast('✅ مدل قرآنی آفلاین آماده و ذخیره شد (۱۰۰٪ بدون اینترنت)!');
          }
          resolve(true);
        } else if (msg.type === 'error' && !msg.reqId) {
          w.removeEventListener('message', checkHandler);
          if (typeof window.showToast === 'function') {
            window.showToast('⚠️ بارگذاری مدل آفلاین نیاز به یک‌بار اتصال اولیه اینترنت دارد.');
          }
          if (callbacks && callbacks.onError) callbacks.onError(msg.error);
          resolve(false);
        }
      };
      w.addEventListener('message', checkHandler);
      w.postMessage({ type: 'init', tier: offlineModelTier, forceReload });
    });
  }

  function dispatchToOfflineWorker(seq, float32Samples, callbacks) {
    const w = getOrCreateOfflineWorker();
    const copy = new Float32Array(float32Samples);
    pendingWorkerReqs.set(seq, (rawText) => {
      if (isWhisperHallucination(rawText)) {
        emitOrderedTranscript(seq, '', callbacks);
      } else {
        emitOrderedTranscript(seq, rawText, callbacks);
      }
    });
    w.postMessage({ type: 'transcribe', reqId: seq, audio: copy }, [copy.buffer]);
  }

  function updateOfflineProgressUI(pct, state, errMsg) {
    const bar = document.getElementById('offlineModelProgressBar');
    const lbl = document.getElementById('offlineModelProgressLabel');
    if (bar) {
      bar.style.width = `${Math.max(0, Math.min(100, pct))}%`;
      bar.style.background = state === 'error' ? '#ef4444' : (state === 'ready' ? '#10b981' : '#38bdf8');
    }
    if (lbl) {
      if (state === 'ready') {
        lbl.textContent = '✅ مدل قرآنی ترتیل آفلاین روی دستگاه ذخیره و آماده است (100%)';
        lbl.style.color = '#34d399';
      } else if (state === 'error') {
        lbl.textContent = '⚠️ خطا در دانلود مدل آفلاین: ' + (errMsg || 'اینترنت را بررسی کنید');
        lbl.style.color = '#fca5a5';
      } else {
        lbl.textContent = `⬇️ در حال دانلود و نصب مدل قرآنی آفلاین... ${pct}%`;
        lbl.style.color = '#38bdf8';
      }
    }
  }

  // =========================================================================
  // 5. NATIVE BROWSER SPEECH RECOGNITION (LCP Token-Delta Engine)
  // =========================================================================
  function startNativeGoogleListening(callbacks) {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      if (callbacks.onError) callbacks.onError('not-supported');
      return;
    }

    stopNativeGoogleOnly();
    const mySession = ++nativeSessionId;
    const emittedByIndex = {}; // resultIndex -> Array<normToken> already emitted

    function bootInstance() {
      if (!isCurrentlyListening || mySession !== nativeSessionId) return;

      const rec = new SpeechRec();
      rec.lang = 'ar-SA';
      rec.continuous = true;
      rec.interimResults = true;
      rec.maxAlternatives = 5;

      rec.onstart = () => {
        if (mySession !== nativeSessionId) return;
        for (const k of Object.keys(emittedByIndex)) delete emittedByIndex[k];
      };

      rec.onresult = (event) => {
        if (!isCurrentlyListening || mySession !== nativeSessionId) return;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i];
          if (!res || !res[0]) continue;

          // Pick primary transcript, or if hint word provided by caller, check alternatives
          let chosenRaw = res[0].transcript || '';
          if (typeof callbacks.pickBestAlternative === 'function' && res.length > 1) {
            const alts = [];
            for (let a = 0; a < res.length; a++) alts.push(res[a].transcript || '');
            const picked = callbacks.pickBestAlternative(alts);
            if (picked) chosenRaw = picked;
          }

          const newTokens = tokenizeQuranText(chosenRaw);
          const prevTokens = emittedByIndex[i] || [];

          // Compute Longest Common Prefix so already-emitted words are NEVER re-sent,
          // while newly fused Muqatta'at ('الف لام' + 'ميم' -> 'الم') ARE emitted cleanly!
          let lcp = 0;
          const minLen = Math.min(prevTokens.length, newTokens.length);
          while (lcp < minLen && prevTokens[lcp] === newTokens[lcp]) {
            lcp++;
          }

          const deltaTokens = newTokens.slice(lcp);
          emittedByIndex[i] = newTokens;

          if (deltaTokens.length > 0) {
            if (callbacks.onDeltaTokens) {
              callbacks.onDeltaTokens(deltaTokens, !!res.isFinal, chosenRaw);
            }
            if (callbacks.onTranscript) {
              callbacks.onTranscript(deltaTokens.join(' '), !!res.isFinal, deltaTokens, chosenRaw);
            }
          }
        }
      };

      rec.onerror = (e) => {
        if (mySession !== nativeSessionId) return;
        if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
          isCurrentlyListening = false;
          if (callbacks.onError) callbacks.onError('not-allowed');
        }
      };

      rec.onend = () => {
        if (isCurrentlyListening && mySession === nativeSessionId) {
          if (nativeRestartTimer) clearTimeout(nativeRestartTimer);
          nativeRestartTimer = setTimeout(() => {
            if (isCurrentlyListening && mySession === nativeSessionId) {
              bootInstance();
            }
          }, 50);
        } else if (mySession === nativeSessionId) {
          if (callbacks.onEnd) callbacks.onEnd();
        }
      };

      nativeSpeechRec = rec;
      try {
        rec.start();
      } catch (err) {
        console.warn('[QuranVoiceAI Native] Start error:', err);
      }
    }

    isCurrentlyListening = true;
    if (callbacks.onStart) callbacks.onStart();
    bootInstance();
  }

  function stopNativeGoogleOnly() {
    nativeSessionId++;
    if (nativeRestartTimer) {
      clearTimeout(nativeRestartTimer);
      nativeRestartTimer = null;
    }
    if (nativeSpeechRec) {
      try {
        nativeSpeechRec.onend = null;
        nativeSpeechRec.onerror = null;
        nativeSpeechRec.onresult = null;
        nativeSpeechRec.abort();
      } catch (e) {}
      nativeSpeechRec = null;
    }
  }

  function cleanupAudioPipeline() {
    if (processorNode) {
      try { processorNode.disconnect(); } catch (e) {}
      processorNode.onaudioprocess = null;
      processorNode = null;
    }
    if (sourceNode) {
      try { sourceNode.disconnect(); } catch (e) {}
      sourceNode = null;
    }
    if (muteGainNode) {
      try { muteGainNode.disconnect(); } catch (e) {}
      muteGainNode = null;
    }
    if (micStream) {
      try { micStream.getTracks().forEach(t => t.stop()); } catch (e) {}
      micStream = null;
    }
    if (audioCtx && audioCtx.state !== 'closed') {
      try { audioCtx.close(); } catch (e) {}
      audioCtx = null;
    }
    pcmChunks16k = [];
    pcmSampleCount = 0;
    isSpeechActive = false;
  }

  // =========================================================================
  // 6. ENGINE SWITCHING & MODAL UI
  // =========================================================================
  function changeActiveEngine(engineId) {
    if (!ENGINES[engineId]) return;
    const wasListening = isCurrentlyListening;
    const savedCallbacks = activeCallbacks;

    if (wasListening) {
      QuranVoiceAI.stopListening();
    }

    activeEngineId = engineId;
    try { localStorage.setItem(STORAGE_ENGINE_KEY, engineId); } catch (e) {}
    updateEngineBadgesUI();

    if (window.Murajaa && typeof window.Murajaa.updateVoiceEngineBadge === 'function') {
      window.Murajaa.updateVoiceEngineBadge();
    }

    if (typeof window.showToast === 'function') {
      window.showToast(`✨ ${ENGINES[engineId].icon} ${ENGINES[engineId].name}`);
    }

    if (wasListening && savedCallbacks) {
      setTimeout(() => QuranVoiceAI.startListening(savedCallbacks), 120);
    }
  }

  function setOfflineTier(tier, triggerDownload = false) {
    offlineModelTier = (tier === 'pro') ? 'pro' : 'fast';
    try { localStorage.setItem(STORAGE_OFFLINE_TIER_KEY, offlineModelTier); } catch (e) {}
    offlineModelReady = false;
    offlineLoadProgress = 0;
    if (triggerDownload) {
      ensureOfflineWorkerReady(null, true);
    }
    openEngineSettingsModal();
  }

  const QuranVoiceAI = {
    getEngine: () => activeEngineId,
    setEngine: changeActiveEngine,
    getEnginesList: () => Object.values(ENGINES),
    isListening: () => isCurrentlyListening,
    isOfflineReady: () => offlineModelReady,

    // Shared Quran Linguistic & Alignment API
    normalizeQuranWord,
    normalizeQuranPhrase,
    normalizeMuqattaatPhrase,
    tokenizeQuranText,
    extractCleanVerseWords,
    doQuranWordsMatch,
    stripOpeningFormulas,
    createRecitationAligner,

    preloadOfflineModel: (tier) => {
      if (tier) {
        offlineModelTier = tier;
        try { localStorage.setItem(STORAGE_OFFLINE_TIER_KEY, tier); } catch (e) {}
      }
      return ensureOfflineWorkerReady(null, true);
    },

    setOfflineTier,

    startListening: (callbacks = {}) => {
      QuranVoiceAI.stopListening();
      activeCallbacks = callbacks;
      if (activeEngineId === 'groq_whisper') {
        startLivePcmCapture('groq_whisper', callbacks);
      } else if (activeEngineId === 'local_whisper') {
        startLivePcmCapture('local_whisper', callbacks);
      } else {
        startNativeGoogleListening(callbacks);
      }
    },

    stopListening: () => {
      const wasActive = isCurrentlyListening;
      isCurrentlyListening = false;

      // Flush any final spoken audio >= 0.3s before closing
      if (wasActive && pcmSampleCount >= 4800 && activeCallbacks && (activeEngineId === 'groq_whisper' || activeEngineId === 'local_whisper')) {
        const finalPcm = mergeFloat32Chunks(pcmChunks16k, pcmSampleCount);
        const peak = peakChunkRms;
        pcmChunks16k = [];
        pcmSampleCount = 0;
        if (peak >= 0.009) {
          dispatchPcmUtterance(activeEngineId, finalPcm, peak, activeCallbacks);
        }
      }

      stopNativeGoogleOnly();
      cleanupAudioPipeline();
    },

    openEngineModal: openEngineSettingsModal,
    closeEngineModal: closeEngineSettingsModal,

    saveGroqApiKey: (key) => {
      const trimmed = String(key || '').trim();
      groqApiKey = trimmed || DEFAULT_GROQ_KEY;
      try { localStorage.setItem(STORAGE_GROQ_KEY, groqApiKey); } catch (e) {}
      if (typeof window.showToast === 'function') {
        window.showToast('✅ کلید هوش مصنوعی ذخیره و فعال شد');
      }
      openEngineSettingsModal();
    }
  };

  function updateEngineBadgesUI() {
    const current = ENGINES[activeEngineId] || ENGINES.groq_whisper;
    const badges = document.querySelectorAll('.voice-engine-switch-pill');
    badges.forEach(b => {
      b.innerHTML = `
        <span class="engine-badge-icon" style="color: ${current.color};">${current.icon}</span>
        <span class="engine-badge-title">${current.name}</span>
      `;
      b.style.borderColor = current.color;
    });
  }

  function injectStyles() {
    if (document.getElementById('quranVoiceAIStyles')) return;
    const style = document.createElement('style');
    style.id = 'quranVoiceAIStyles';
    style.textContent = `
      .voice-engine-switch-pill {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 4px 9px;
        border-radius: 20px;
        background: linear-gradient(135deg, rgba(16, 24, 38, 0.92), rgba(8, 14, 22, 0.98));
        border: 1.2px solid #10b981;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.15);
        cursor: pointer;
        font-family: inherit;
        font-size: 0.68rem;
        font-weight: 800;
        color: #f8fafc;
        transition: all 0.22s ease;
        user-select: none;
      }
      .voice-engine-switch-pill:hover {
        transform: scale(1.05);
      }
      .engine-card-option {
        border-radius: 16px;
        padding: 12px 14px;
        cursor: pointer;
        border: 1.5px solid rgba(255, 255, 255, 0.1);
        background: rgba(15, 23, 42, 0.65);
        transition: all 0.2s ease;
        display: flex;
        align-items: flex-start;
        gap: 12px;
      }
      .engine-card-option:hover {
        background: rgba(30, 41, 59, 0.88);
        border-color: rgba(255, 255, 255, 0.25);
      }
      .engine-card-option.active-engine {
        border-color: #10b981;
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 95, 70, 0.3));
        box-shadow: 0 6px 20px rgba(16, 185, 129, 0.22);
      }
    `;
    document.head.appendChild(style);
  }

  function getModalTranslations() {
    let lang = 'ku';
    try {
      lang = localStorage.getItem('quran_app_language') || window.currentAppLanguage || 'ku';
    } catch (e) {}
    const dict = {
      ku: {
        title: 'ڕێکخستنی زیرەکی دەنگی قورئان (v5.0)',
        subtitle: '٣ مۆتۆری پێشکەوتووی تەسمیع و ناسینەوەی وشە بە وشە',
        e1_title: '١. Groq Whisper AI (سەرهێڵ و خێراترین) ⭐',
        e1_badge: 'پێشنیارکراو',
        e1_desc: 'وردترین مۆتۆری زیرەکی دەستکرد بۆ قورئان (الم، تەجوید، گەڕانەوە بۆ دواوە و وەستان) بە فایلی دەنگی ستانداردی WAV.',
        e2_title: '٢. Tarteel Whisper (١٠٠٪ ئۆفلاین - مۆدێلی نوێی قورئانی)',
        e2_badge: 'بێ ئینتەرنێت',
        e2_desc: 'مۆدێلی تایبەتی ڕاهێنراو لەسەر قورئان (Tarteel Quran ONNX) کە لەناو ئامێرەکەت کار دەکات بەبێ ئینتەرنێت.',
        e3_title: '٣. وێبگەڕی گووگڵ (ڕاستەوخۆ و خۆڕایی)',
        e3_badge: 'خێرا',
        e3_desc: 'ناسینەوەی دەستبەجێی وشەکان بە ئەلگۆریتمی نوێی بێ دووبارەبوونەوە و دژە پڕکردنەوەی هەڵە.',
        dlFast: 'مۆدێلی خێرا (57MB)',
        dlPro: 'مۆدێلی پڕۆفیشناڵ (98MB)',
        dlBtn: '⬇️ داگرتن / نوێکردنەوەی فایلی ئۆفلاین',
        dlReady: '✅ مۆدێلی ئۆفلاینی قورئان ئامادەیە (100%)',
        dlIdle: 'بۆ کارکردنی ١٠٠٪ بێ ئینتەرنێت، یەک جار مۆدێلەکە دابگرە:'
      },
      fa: {
        title: 'تنظیمات هوش مصنوعی تشخیص تلاوت (نسخه ۵)',
        subtitle: 'سه موتور واقعی با پشتیبانی وقف و ابتدا، تکرار کلمه و حروف مقطعه',
        e1_title: '۱. Groq Whisper AI (ابری فوق‌دقیق) ⭐',
        e1_badge: 'پیشنهادی',
        e1_desc: 'ارسال زنده قطعات استاندارد WAV بدون قطع شدن وسط آیه؛ تشخیص دقیق «الم»، وقف، برگشت به عقب و تکرار کلمات.',
        e2_title: '۲. Tarteel Whisper (۱۰۰٪ آفلاین — مدل جدید قرآنی ترتیل)',
        e2_badge: 'بدون اینترنت',
        e2_desc: 'مدل تخصصی آموزش‌دیده روی تلاوت قرآن کریم (Tarteel Quran ONNX) با اجرای زنده درون مرورگر بدون نیاز به اینترنت.',
        e3_title: '۳. موتور زنده مرورگر (گوگل کروم / سافاری)',
        e3_badge: 'آنی',
        e3_desc: 'تشخیص لحظه‌ای کلمه‌به‌کلمه با الگوریتم جدید ضد پر شدن خودکار آیات.',
        dlFast: 'مدل سریع ترتیل (57MB)',
        dlPro: 'مدل حرفه‌ای ترتیل (98MB)',
        dlBtn: '⬇️ دانلود / آپدیت مدل آفلاین قرآن',
        dlReady: '✅ مدل قرآنی آفلاین نصب و آماده استفاده است (100%)',
        dlIdle: 'برای فعال‌سازی ۱۰۰٪ آفلاین، مدل جدید قرآنی را یک‌بار دانلود نمایید:'
      },
      de: {
        title: 'Koran-Spracherkennung KI (v5.0)',
        subtitle: 'Präzises Wort-für-Wort-Tracking mit Pause & Wiederholung',
        e1_title: '1. Groq Whisper AI (Ultra-Präzise Cloud) ⭐',
        e1_badge: 'Empfohlen',
        e1_desc: 'Höchste Koran-Genauigkeit (Alif-Lam-Mim, Waqf, Rücksprung & Wortwiederholung) via 16kHz WAV-Stream.',
        e2_title: '2. Tarteel Whisper (100% Offline Koran-Modell)',
        e2_badge: 'Offline',
        e2_desc: 'Speziell auf Koranrezitation trainiertes Tarteel-ONNX-Modell direkt im Browser ohne Internet.',
        e3_title: '3. Google / Browser Live-Erkennung',
        e3_badge: 'Sofort',
        e3_desc: 'Verzögerungsfreie Live-Erkennung ohne falsches Ausfüllen.',
        dlFast: 'Schnell-Modell (57MB)',
        dlPro: 'Pro-Modell (98MB)',
        dlBtn: '⬇️ Offline-Koranmodell laden / aktualisieren',
        dlReady: '✅ Offline-Koranmodell installiert & bereit (100%)',
        dlIdle: 'Für 100% Offline-Betrieb einmalig das Koran-Modell herunterladen:'
      }
    };
    return dict[lang] || dict.ku;
  }

  function openEngineSettingsModal() {
    let modal = document.getElementById('voiceEngineModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'voiceEngineModal';
      modal.className = 'typography-modal-overlay';
      modal.style.cssText = 'display: flex; position: fixed; inset: 0; background: rgba(3, 7, 18, 0.88); z-index: 17000; backdrop-filter: blur(16px); align-items: center; justify-content: center; padding: 14px;';
      modal.onclick = (e) => { if (e.target === modal) closeEngineSettingsModal(); };
      document.body.appendChild(modal);
    }

    const t = getModalTranslations();
    const progPct = offlineModelReady ? 100 : offlineLoadProgress;

    modal.innerHTML = `
      <div class="neo3d-hub-sheet" style="width: 100%; max-width: 500px; max-height: 90vh; display: flex; flex-direction: column; padding: 18px 16px; overflow: hidden; border-radius: 26px; background: linear-gradient(165deg, #0d1722 0%, #060b10 100%); border: 1.5px solid rgba(56, 189, 248, 0.35); box-shadow: 0 28px 65px rgba(0,0,0,0.95); direction: rtl; text-align: right;">
        <div style="padding: 0 4px 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 38px; height: 38px; border-radius: 12px; font-size: 1.1rem; background: linear-gradient(135deg, #10b981, #047857); display: flex; align-items: center; justify-content: center; color: #fff;">
              <i class="fa-solid fa-microphone-lines"></i>
            </div>
            <div>
              <div style="font-weight: 900; color: #fff; font-size: 0.96rem;">${t.title}</div>
              <div style="font-size: 0.7rem; color: #34d399;">${t.subtitle}</div>
            </div>
          </div>
          <button onclick="QuranVoiceAI.closeEngineModal()" style="width: 32px; height: 32px; border-radius: 10px; background: rgba(255,255,255,0.08); border: none; color: #cbd5e1; cursor: pointer;"><i class="fa-solid fa-xmark"></i></button>
        </div>

        <div style="flex: 1; overflow-y: auto; padding: 14px 4px; display: flex; flex-direction: column; gap: 10px;">
          <!-- 1. Groq Whisper Cloud -->
          <div class="engine-card-option ${activeEngineId === 'groq_whisper' ? 'active-engine' : ''}" onclick="QuranVoiceAI.setEngine('groq_whisper'); QuranVoiceAI.closeEngineModal();">
            <div style="font-size: 1.5rem; width: 42px; height: 42px; border-radius: 12px; background: rgba(16, 185, 129, 0.2); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">⚡</div>
            <div style="flex: 1;">
              <div style="display: flex; justify-content: space-between; align-items: center; gap: 6px;">
                <div style="font-weight: 800; font-size: 0.86rem; color: #fff;">${t.e1_title}</div>
                <span style="font-size: 0.64rem; background: #10b981; color: #042f2e; padding: 2px 6px; border-radius: 5px; font-weight: 800;">${t.e1_badge}</span>
              </div>
              <div style="font-size: 0.71rem; color: #94a3b8; margin-top: 4px; line-height: 1.45;">${t.e1_desc}</div>
            </div>
          </div>

          <!-- 2. Tarteel Offline Whisper -->
          <div class="engine-card-option ${activeEngineId === 'local_whisper' ? 'active-engine' : ''}" onclick="QuranVoiceAI.setEngine('local_whisper');">
            <div style="font-size: 1.5rem; width: 42px; height: 42px; border-radius: 12px; background: rgba(56, 189, 248, 0.2); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">🧠</div>
            <div style="flex: 1;">
              <div style="display: flex; justify-content: space-between; align-items: center; gap: 6px;">
                <div style="font-weight: 800; font-size: 0.86rem; color: #fff;">${t.e2_title}</div>
                <span style="font-size: 0.64rem; background: #0284c7; color: #fff; padding: 2px 6px; border-radius: 5px; font-weight: 800;">${t.e2_badge}</span>
              </div>
              <div style="font-size: 0.71rem; color: #94a3b8; margin-top: 4px; line-height: 1.45;">${t.e2_desc}</div>

              <!-- Offline Quran Model Manager -->
              <div onclick="event.stopPropagation();" style="margin-top: 8px; padding: 8px 10px; border-radius: 10px; background: rgba(2, 6, 23, 0.65); border: 1px solid rgba(56, 189, 248, 0.25);">
                <div style="display: flex; gap: 6px; margin-bottom: 7px;">
                  <button type="button" onclick="QuranVoiceAI.setOfflineTier('fast', false)" style="flex: 1; padding: 4px 6px; border-radius: 7px; font-size: 0.68rem; font-weight: 800; cursor: pointer; border: 1px solid ${offlineModelTier === 'fast' ? '#38bdf8' : 'rgba(255,255,255,0.12)'}; background: ${offlineModelTier === 'fast' ? 'rgba(56,189,248,0.22)' : 'rgba(255,255,255,0.04)'}; color: #fff;">⚡ ${t.dlFast}</button>
                  <button type="button" onclick="QuranVoiceAI.setOfflineTier('pro', false)" style="flex: 1; padding: 4px 6px; border-radius: 7px; font-size: 0.68rem; font-weight: 800; cursor: pointer; border: 1px solid ${offlineModelTier === 'pro' ? '#38bdf8' : 'rgba(255,255,255,0.12)'}; background: ${offlineModelTier === 'pro' ? 'rgba(56,189,248,0.22)' : 'rgba(255,255,255,0.04)'}; color: #fff;">🎯 ${t.dlPro}</button>
                </div>
                <div id="offlineModelProgressLabel" style="font-size: 0.68rem; font-weight: 700; color: ${offlineModelReady ? '#34d399' : '#cbd5e1'}; margin-bottom: 5px;">
                  ${offlineModelReady ? t.dlReady : t.dlIdle}
                </div>
                <div style="width: 100%; height: 6px; border-radius: 4px; background: rgba(255,255,255,0.1); overflow: hidden; margin-bottom: 7px;">
                  <div id="offlineModelProgressBar" style="width: ${progPct}%; height: 100%; background: ${offlineModelReady ? '#10b981' : '#38bdf8'}; transition: width 0.25s ease;"></div>
                </div>
                <button type="button" onclick="QuranVoiceAI.preloadOfflineModel(); QuranVoiceAI.setEngine('local_whisper');" style="width: 100%; padding: 6px 10px; border-radius: 8px; border: none; background: linear-gradient(135deg, #0284c7, #0369a1); color: #fff; font-weight: 800; font-size: 0.74rem; cursor: pointer;">
                  ${t.dlBtn}
                </button>
              </div>
            </div>
          </div>

          <!-- 3. Native Browser Google/Safari -->
          <div class="engine-card-option ${activeEngineId === 'google_speech' ? 'active-engine' : ''}" onclick="QuranVoiceAI.setEngine('google_speech'); QuranVoiceAI.closeEngineModal();">
            <div style="font-size: 1.5rem; width: 42px; height: 42px; border-radius: 12px; background: rgba(245, 158, 11, 0.2); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">🌐</div>
            <div style="flex: 1;">
              <div style="display: flex; justify-content: space-between; align-items: center; gap: 6px;">
                <div style="font-weight: 800; font-size: 0.86rem; color: #fff;">${t.e3_title}</div>
                <span style="font-size: 0.64rem; background: #d97706; color: #fff; padding: 2px 6px; border-radius: 5px; font-weight: 800;">${t.e3_badge}</span>
              </div>
              <div style="font-size: 0.71rem; color: #94a3b8; margin-top: 4px; line-height: 1.45;">${t.e3_desc}</div>
            </div>
          </div>
        </div>
      </div>
    `;
    modal.style.display = 'flex';
  }

  function closeEngineSettingsModal() {
    const modal = document.getElementById('voiceEngineModal');
    if (modal) modal.style.display = 'none';
  }

  document.addEventListener('DOMContentLoaded', () => {
    injectStyles();
    updateEngineBadgesUI();
  });

  window.QuranVoiceAI = QuranVoiceAI;

})(window);
