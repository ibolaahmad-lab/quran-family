/**
 * MURAJAA PRO FEATURES & ENGINE (murajaa_features_engine.js)
 * High-performance, isolated module providing:
 * 1. Backtracking-tolerant Quran Voice Recognition (وقف و ابتدا / بازگشت به عقب قاری)
 * 2. Tasmīʿ Mode (Close the Mushaf / خواندن از حفظ با مخفی‌سازی هوشمند کلمات)
 * 3. Mistake Tracker & Word Breakdown (ثبت خطاهای حفظ و تفکیک حروف کلمه)
 * 4. Ayah Quiz Engine (کوئیز آیه قبل و بعد صوتی و متنی)
 * 5. Multi-Reciter & Medina Typography suite
 * 
 * Guaranteed zero conflict with existing features (Adhkar, Asmaa Allah, Dalail, Burda).
 */

(function () {
  'use strict';

  console.log('[Murajaa Engine] Initializing modular Murajaa features...');

  window.Murajaa = window.Murajaa || {};

  // =========================================================================
  // 1. ARABIC NORMALIZER & TOKENIZER
  // =========================================================================
  function normalizeArabic(text) {
    if (!text) return '';
    return String(text)
      .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '') // Strip Tashkeel & Quranic signs
      .replace(/[إأآٱ]/g, 'ا')                           // Normalize Alefs
      .replace(/[ىي]/g, 'ي')                              // Normalize Yaa
      .replace(/ة/g, 'ه')                                // Normalize Taa Marbuta
      .replace(/ـ/g, '')                                 // Strip Tatweel
      .replace(/[.,/#!$%^&*;:{}=\-_`~()«»۞۩]/g, '')       // Strip punctuation
      .replace(/\s+/g, ' ')
      .trim();
  }
  window.Murajaa.normalizeArabic = normalizeArabic;

  function tokenizeArabic(text) {
    const norm = normalizeArabic(text);
    return norm ? norm.split(' ') : [];
  }
  window.Murajaa.tokenizeArabic = tokenizeArabic;

  function similarity(s1, s2) {
    if (s1 === s2) return 1.0;
    if (!s1 || !s2) return 0.0;
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
  window.Murajaa.similarity = similarity;

  // =========================================================================
  // 2. BACKTRACKING-AWARE VOICE MATCHER (وقف و ابتدا / تکرار چند کلمه)
  // =========================================================================
  class QuranRecitationTracker {
    constructor() {
      this.targetTokens = [];
      this.rawTargetWords = [];
      this.currentIndex = 0;
      this.matchedIndices = new Set();
      this.mistakeIndices = new Set();
      this.backtrackWindow = 4;
      this.forwardWindow = 3;
      this.isListening = false;
      this.recognition = null;
      this.onProgressCallback = null;
      this.onMistakeCallback = null;
      this.onCompleteCallback = null;
    }

    setTargetText(arabicText) {
      if (!arabicText) return;
      this.rawTargetWords = String(arabicText).trim().split(/\s+/);
      this.targetTokens = this.rawTargetWords.map(w => normalizeArabic(w));
      this.currentIndex = 0;
      this.matchedIndices.clear();
      this.mistakeIndices.clear();
    }

    processSpokenWords(spokenWordsArray) {
      if (!spokenWordsArray || spokenWordsArray.length === 0 || this.targetTokens.length === 0) return;

      for (let s = 0; s < spokenWordsArray.length; s++) {
        const spoken = normalizeArabic(spokenWordsArray[s]);
        if (!spoken || spoken.length < 2) continue;

        let bestMatchIndex = -1;
        let bestScore = 0.65;

        // 1. Backtracking Check (وقف و ابتدا)
        const startBack = Math.max(0, this.currentIndex - this.backtrackWindow);
        for (let b = startBack; b < this.currentIndex; b++) {
          const score = similarity(spoken, this.targetTokens[b]);
          if (score > 0.82 && score > bestScore) {
            bestScore = score;
            bestMatchIndex = b;
          }
        }

        if (bestMatchIndex !== -1 && bestMatchIndex < this.currentIndex) {
          console.log(`[Murajaa Tracker] Backtracking (وقف و ابتدا) at word ${bestMatchIndex}: ${this.targetTokens[bestMatchIndex]}`);
          this.currentIndex = bestMatchIndex + 1;
          this.matchedIndices.add(bestMatchIndex);
          if (this.onProgressCallback) {
            this.onProgressCallback({
              type: 'backtrack',
              wordIndex: bestMatchIndex,
              currentIndex: this.currentIndex,
              totalWords: this.targetTokens.length
            });
          }
          continue;
        }

        // 2. Forward Match
        const lookahead = Math.min(this.targetTokens.length, this.currentIndex + this.forwardWindow);
        for (let f = this.currentIndex; f < lookahead; f++) {
          const score = similarity(spoken, this.targetTokens[f]);
          if (score > bestScore) {
            bestScore = score;
            bestMatchIndex = f;
          }
        }

        if (bestMatchIndex !== -1) {
          if (bestMatchIndex > this.currentIndex) {
            for (let skip = this.currentIndex; skip < bestMatchIndex; skip++) {
              this.mistakeIndices.add(skip);
              if (this.onMistakeCallback) {
                this.onMistakeCallback(skip, this.rawTargetWords[skip]);
              }
            }
          }
          this.matchedIndices.add(bestMatchIndex);
          this.currentIndex = bestMatchIndex + 1;

          if (this.onProgressCallback) {
            this.onProgressCallback({
              type: 'match',
              wordIndex: bestMatchIndex,
              currentIndex: this.currentIndex,
              totalWords: this.targetTokens.length
            });
          }

          if (this.currentIndex >= this.targetTokens.length) {
            if (this.onCompleteCallback) this.onCompleteCallback();
            break;
          }
        }
      }
    }

    startRecognition() {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        if (typeof showToast === 'function') {
          showToast('مرورگر شما از ورودی صوتی پشتیبانی نمی‌کند.');
        }
        return false;
      }

      try {
        if (this.recognition) {
          try { this.recognition.abort(); } catch (e) {}
        }
        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'ar-SA';
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 2;

        this.recognition.onstart = () => {
          this.isListening = true;
          window.Murajaa.updateMicUI(true);
        };

        this.recognition.onresult = (event) => {
          let latestTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            latestTranscript += event.results[i][0].transcript + ' ';
          }
          const spokenWords = latestTranscript.trim().split(/\s+/);
          this.processSpokenWords(spokenWords);
        };

        this.recognition.onerror = (event) => {
          console.warn('[Murajaa Tracker] Voice error:', event.error);
        };

        this.recognition.onend = () => {
          if (this.isListening) {
            try { this.recognition.start(); } catch (e) {}
          } else {
            window.Murajaa.updateMicUI(false);
          }
        };

        this.recognition.start();
        return true;
      } catch (err) {
        console.error('[Murajaa Tracker] Speech start error:', err);
        return false;
      }
    }

    stopRecognition() {
      this.isListening = false;
      if (this.recognition) {
        try { this.recognition.abort(); } catch (e) {}
        this.recognition = null;
      }
      window.Murajaa.updateMicUI(false);
    }
  }

  window.Murajaa.activeTracker = new QuranRecitationTracker();

  // =========================================================================
  // 3. TASMĪʿ MODE (Close the Mushaf / پنهان‌سازی کلمات و خواندن از حفظ)
  // =========================================================================
  window.Murajaa.tasmiActive = false;
  window.Murajaa.markMistakeMode = false;

  window.Murajaa.toggleTasmiMode = function () {
    window.Murajaa.tasmiActive = !window.Murajaa.tasmiActive;
    const stage = document.getElementById('mushafInteractiveStage');
    const btn = document.getElementById('murajaaTasmiToggleBtn');

    if (window.Murajaa.tasmiActive) {
      if (stage) stage.classList.add('tasmi-mode-active');
      if (btn) {
        btn.classList.add('active');
        btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
      }
      if (typeof showToast === 'function') {
        showToast('حالت تسمیع فعال شد: کلمات پنهان شدند، از حفظ بخوانید');
      }
      window.Murajaa.prepareTasmiVerse();
    } else {
      if (stage) stage.classList.remove('tasmi-mode-active');
      if (btn) {
        btn.classList.remove('active');
        btn.style.background = '';
      }
      window.Murajaa.activeTracker.stopRecognition();
      if (typeof showToast === 'function') {
        showToast('حالت تسمیع غیرفعال شد: متن کامل مصحف بازگشت');
      }
    }
  };

  window.Murajaa.toggleMarkMistakeMode = function () {
    window.Murajaa.markMistakeMode = !window.Murajaa.markMistakeMode;
    const btn = document.getElementById('murajaaMistakeModeBtn');
    if (btn) {
      if (window.Murajaa.markMistakeMode) {
        btn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
        btn.style.color = '#fff';
        if (typeof showToast === 'function') {
          showToast('حالت علامت‌گذاری خطا فعال شد: روی هر آیه یا کلمه لمس کنید');
        }
      } else {
        btn.style.background = '';
        btn.style.color = '';
        if (typeof showToast === 'function') {
          showToast('حالت علامت‌گذاری خطا غیرفعال شد');
        }
      }
    }
  };

  window.Murajaa.prepareTasmiVerse = function () {
    if (!window.state || !window.state.currentVersesData) return;
    const curIdx = window.state.currentAyahIdx || 0;
    const v = window.state.currentVersesData[curIdx];
    if (v && v.ar) {
      window.Murajaa.activeTracker.setTargetText(v.ar);
      const span = document.getElementById(`mushaf-span-${curIdx}`);
      
      window.Murajaa.activeTracker.onProgressCallback = (data) => {
        if (span) {
          span.classList.add('revealed');
          span.style.color = '#10b981';
        }
      };

      window.Murajaa.activeTracker.onCompleteCallback = () => {
        if (typeof showToast === 'function') {
          showToast(`✨ احسنت! آیه ${v.num} با موفقیت خوانده شد.`);
        }
        if (typeof playNextAyah === 'function') {
          setTimeout(() => {
            if (window.Murajaa.tasmiActive) {
              window.Murajaa.prepareTasmiVerse();
            }
          }, 800);
        }
      };
    }
  };

  window.Murajaa.revealCurrentVerse = function () {
    const curIdx = window.state ? (window.state.currentAyahIdx || 0) : 0;
    const span = document.getElementById(`mushaf-span-${curIdx}`);
    if (span) {
      span.classList.add('revealed');
      span.style.color = '#fde68a';
      if (typeof showToast === 'function') {
        showToast('آیه آشکار شد');
      }
    }
  };

  // =========================================================================
  // 4. MISTAKE TRACKER & WORD BREAKDOWN MODAL
  // =========================================================================
  const MISTAKES_KEY = 'murajaa_user_mistakes_v1';

  window.Murajaa.getMistakes = function () {
    try {
      const raw = localStorage.getItem(MISTAKES_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  };

  window.Murajaa.saveMistake = function (surahNum, ayahNum, wordIndex, wordText, note = '') {
    try {
      const mistakes = window.Murajaa.getMistakes();
      const key = `${surahNum}:${ayahNum}`;
      if (!mistakes[key]) mistakes[key] = [];

      const existing = mistakes[key].find(m => m.wordIndex === wordIndex);
      if (existing) {
        existing.note = note;
        existing.timestamp = Date.now();
      } else {
        mistakes[key].push({
          wordIndex: wordIndex,
          wordText: wordText,
          note: note,
          status: 'to_review',
          timestamp: Date.now()
        });
      }
      localStorage.setItem(MISTAKES_KEY, JSON.stringify(mistakes));
      window.Murajaa.applyMistakeHighlights();
      return true;
    } catch (e) {
      return false;
    }
  };

  window.Murajaa.removeMistake = function (surahNum, ayahNum, wordIndex) {
    try {
      const mistakes = window.Murajaa.getMistakes();
      const key = `${surahNum}:${ayahNum}`;
      if (mistakes[key]) {
        mistakes[key] = mistakes[key].filter(m => m.wordIndex !== wordIndex);
        if (mistakes[key].length === 0) delete mistakes[key];
        localStorage.setItem(MISTAKES_KEY, JSON.stringify(mistakes));
        window.Murajaa.applyMistakeHighlights();
      }
    } catch (e) {}
  };

  window.Murajaa.applyMistakeHighlights = function () {
    try {
      const mistakes = window.Murajaa.getMistakes();
      document.querySelectorAll('.murajaa-mistake-highlight').forEach(el => {
        el.classList.remove('murajaa-mistake-highlight');
      });

      Object.keys(mistakes).forEach(key => {
        const [s, a] = key.split(':');
        const ayahNum = parseInt(a, 10);
        const spans = document.querySelectorAll(`[id^="mushaf-span-"]`);
        spans.forEach(sp => {
          if (sp.textContent.includes(ayahNum.toString()) || sp.getAttribute('title')?.includes(`:${ayahNum}`)) {
            sp.classList.add('murajaa-mistake-highlight');
          }
        });
      });
    } catch (e) {}
  };

  window.Murajaa.openWordBreakdown = function (surahNum, ayahNum, wordIndex, wordText) {
    let modal = document.getElementById('murajaaWordBreakdownModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'murajaaWordBreakdownModal';
      document.body.appendChild(modal);
    }

    const letters = String(wordText).trim().split('');
    let letterChips = '';
    letters.forEach(ch => {
      if (ch.trim()) {
        letterChips += `<div class="murajaa-letter-chip">${ch}</div>`;
      }
    });

    const mistakes = window.Murajaa.getMistakes();
    const key = `${surahNum}:${ayahNum}`;
    const curMistake = (mistakes[key] || []).find(m => m.wordIndex === wordIndex);
    const existingNote = curMistake ? curMistake.note : '';

    modal.innerHTML = `
      <div id="murajaaWordBreakdownCard" dir="rtl">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
          <span style="font-size: 0.85rem; color: #94a3b8; font-weight: 700;">سوره ${surahNum} · آیه ${ayahNum} · کلمه ${wordIndex + 1}</span>
          <button onclick="document.getElementById('murajaaWordBreakdownModal').style.display='none'" style="background: none; border: none; color: #fff; font-size: 1.2rem; cursor: pointer;">✕</button>
        </div>

        <div style="text-align: center; margin: 12px 0;">
          <div style="font-size: 2.2rem; font-family: 'Amiri', 'Scheherazade New', serif; color: #fde68a; margin-bottom: 12px;">${wordText}</div>
          <div style="display: flex; justify-content: center; gap: 8px; flex-wrap: wrap; margin-bottom: 16px;">
            ${letterChips}
          </div>
        </div>

        <div style="margin-bottom: 14px;">
          <label style="font-size: 0.78rem; color: #cbd5e1; display: block; margin-bottom: 6px;">یادداشت شما برای این کلمه یا حرف (علت اشتباه):</label>
          <input type="text" id="murajaaWordNoteInput" value="${existingNote}" placeholder="مثال: اشتباه با آیه سوره بقره، یادآوری حرکت کسره..." style="width: 100%; padding: 10px 14px; border-radius: 12px; background: rgba(255,255,255,0.08); border: 1px solid rgba(229,184,76,0.3); color: #fff; font-size: 0.85rem; outline: none;" />
        </div>

        <div style="display: flex; gap: 8px; justify-content: flex-end;">
          <button onclick="Murajaa.removeMistake(${surahNum}, ${ayahNum}, ${wordIndex}); document.getElementById('murajaaWordBreakdownModal').style.display='none';" class="neo3d-pill-btn" style="background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid #ef4444; padding: 8px 14px; font-size: 0.78rem;">
            حذف علامت خطا
          </button>
          <button onclick="
            const note = document.getElementById('murajaaWordNoteInput').value;
            Murajaa.saveMistake(${surahNum}, ${ayahNum}, ${wordIndex}, '${wordText}', note);
            document.getElementById('murajaaWordBreakdownModal').style.display='none';
            if (typeof showToast==='function') showToast('خطا و یادداشت ذخیره شد');
          " class="neo3d-pill-btn" style="background: linear-gradient(135deg, #10b981, #059669); color: #fff; border: none; padding: 8px 16px; font-size: 0.78rem; font-weight: 700;">
            ذخیره علامت
          </button>
        </div>
      </div>
    `;

    modal.style.display = 'flex';
  };

  // Intercept click on Mushaf when Mark Mistake Mode is active
  document.addEventListener('click', function (e) {
    if (!window.Murajaa.markMistakeMode) return;
    const ayahSpan = e.target.closest('.mushaf-ayah-span');
    if (ayahSpan) {
      e.preventDefault();
      e.stopPropagation();
      const idx = parseInt(ayahSpan.id.replace('mushaf-span-', ''), 10);
      if (!isNaN(idx) && window.state && window.state.currentVersesData && window.state.currentVersesData[idx]) {
        const v = window.state.currentVersesData[idx];
        const words = v.ar.trim().split(/\s+/);
        window.Murajaa.openWordBreakdown(v.surahNum, v.num, 0, words[0] || v.ar);
      }
    }
  }, true);

  // =========================================================================
  // 5. AYAH QUIZ ENGINE (Previous / Next Verse Quiz - Screen 6)
  // =========================================================================
  window.Murajaa.openAyahQuiz = function () {
    let modal = document.getElementById('murajaaQuizModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'murajaaQuizModal';
      document.body.appendChild(modal);
    }

    window.Murajaa.generateQuizQuestion();
    modal.style.display = 'flex';
  };

  window.Murajaa.generateQuizQuestion = function () {
    const modal = document.getElementById('murajaaQuizModal');
    if (!modal) return;

    if (!window.state || !window.state.currentVersesData || window.state.currentVersesData.length < 2) {
      modal.innerHTML = `
        <div id="murajaaQuizCard" style="text-align: center;">
          <p>لطفاً ابتدا صفحه‌ای از مصحف را باز فرمایید.</p>
          <button onclick="document.getElementById('murajaaQuizModal').style.display='none'" class="neo3d-pill-btn">بستن</button>
        </div>
      `;
      return;
    }

    const verses = window.state.currentVersesData;
    const isNext = Math.random() > 0.5;
    const targetIdx = isNext ? Math.floor(Math.random() * (verses.length - 1)) : (1 + Math.floor(Math.random() * (verses.length - 1)));
    const baseAyah = verses[targetIdx];
    const answerAyah = isNext ? verses[targetIdx + 1] : verses[targetIdx - 1];

    const questionTitle = isNext ? 'آیه بعد از این آیه چیست؟' : 'آیه قبل از این آیه چیست؟';

    modal.innerHTML = `
      <div id="murajaaQuizCard" dir="rtl">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <span style="font-size: 0.85rem; color: #38bdf8; font-weight: 800;">💡 کوئیز حفظ آیه</span>
          <button onclick="document.getElementById('murajaaQuizModal').style.display='none'" style="background: none; border: none; color: #fff; font-size: 1.2rem; cursor: pointer;">✕</button>
        </div>

        <div style="background: rgba(56, 189, 248, 0.12); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 12px; padding: 8px 12px; margin-bottom: 14px; text-align: center; color: #7dd3fc; font-weight: 700; font-size: 0.88rem;">
          ${questionTitle}
        </div>

        <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 14px; margin-bottom: 16px; text-align: center;">
          <div style="font-size: 1.35rem; font-family: 'Amiri', 'Scheherazade New', serif; color: #fff; line-height: 1.8; margin-bottom: 8px;">
            ${baseAyah.ar}
          </div>
          <div style="font-size: 0.76rem; color: #94a3b8; font-weight: 700;">
            سوره ${baseAyah.surahNum} · آیه ${baseAyah.num}
          </div>
        </div>

        <div id="murajaaQuizAnswerArea" style="display: none; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 14px; padding: 14px; margin-bottom: 16px; text-align: center;">
          <div style="font-size: 0.8rem; color: #34d399; font-weight: 700; margin-bottom: 6px;">پاسخ صحیح:</div>
          <div style="font-size: 1.35rem; font-family: 'Amiri', 'Scheherazade New', serif; color: #a7f3d0; line-height: 1.8; margin-bottom: 8px;">
            ${answerAyah.ar}
          </div>
          <div style="font-size: 0.76rem; color: #94a3b8; font-weight: 700;">
            سوره ${answerAyah.surahNum} · آیه ${answerAyah.num}
          </div>
        </div>

        <div style="display: flex; gap: 8px; justify-content: center;">
          <button id="murajaaRevealAnswerBtn" onclick="
            document.getElementById('murajaaQuizAnswerArea').style.display='block';
            this.style.display='none';
            document.getElementById('murajaaNextQuizBtn').style.display='inline-flex';
          " class="neo3d-pill-btn" style="background: linear-gradient(135deg, #0284c7, #0369a1); color: #fff; border: none; padding: 10px 22px; font-weight: 700;">
            👁 نمایش پاسخ
          </button>
          <button id="murajaaNextQuizBtn" onclick="Murajaa.generateQuizQuestion()" class="neo3d-pill-btn" style="display: none; background: linear-gradient(135deg, #10b981, #059669); color: #fff; border: none; padding: 10px 22px; font-weight: 700;">
            سوال بعدی ◄
          </button>
        </div>
      </div>
    `;
  };

  // =========================================================================
  // 6. MULTI-RECITER & MEDINA TYPOGRAPHY SETTINGS MODAL
  // =========================================================================
  window.Murajaa.POPULAR_RECITERS = [
    { id: 'Alafasy_128kbps', name: 'مشاری العفاسی (Mishary Alafasy)' },
    { id: 'Abdul_Basit_Murattal_192kbps', name: 'عبدالباسط عبدالصمد - مرتل' },
    { id: 'Abdul_Basit_Mujawwad_128kbps', name: 'عبدالباسط عبدالصمد - مجود' },
    { id: 'Minshawy_Murattal_128kbps', name: 'محمد صدیق المنشاوی - مرتل' },
    { id: 'Husary_128kbps', name: 'محمود خلیل الحصری - مرتل' },
    { id: 'Abdurrahmaan_As-Sudais_192kbps', name: 'عبدالرحمن السدیس (حرم مکی)' },
    { id: 'Ghamadi_40kbps', name: 'سعد الغامدی' },
    { id: 'Hudhaify_128kbps', name: 'علی الحذیفی (حرم نبوی)' },
    { id: 'Maher_AlMuaiqly_64kbps', name: 'ماهر المعیقلی (حرم مکی)' }
  ];

  window.Murajaa.openTypographySettings = function () {
    let modal = document.getElementById('murajaaTypographyModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'murajaaTypographyModal';
      modal.style.cssText = 'display:none; position:fixed; inset:0; background:rgba(0,0,0,0.85); backdrop-filter:blur(8px); z-index:99997; align-items:center; justify-content:center; padding:16px;';
      document.body.appendChild(modal);
    }

    const curReciter = (window.state && window.state.currentReciter) || localStorage.getItem('quran_selected_reciter') || 'Alafasy_128kbps';
    let reciterOptions = '';
    window.Murajaa.POPULAR_RECITERS.forEach(r => {
      const isSel = (r.id === curReciter) ? 'selected' : '';
      reciterOptions += `<option value="${r.id}" ${isSel}>${r.name}</option>`;
    });

    modal.innerHTML = `
      <div id="murajaaTypoCard" dir="rtl" style="background:#111827; border:1.5px solid rgba(229,184,76,0.35); border-radius:20px; width:100%; max-width:440px; padding:20px; color:#fff;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <span style="font-size:0.92rem; font-weight:800; color:#fde68a;">⚙️ تنظیمات قاریان و قلم مصحف</span>
          <button onclick="document.getElementById('murajaaTypographyModal').style.display='none'" style="background:none; border:none; color:#fff; font-size:1.2rem; cursor:pointer;">✕</button>
        </div>

        <!-- Reciter selector -->
        <div style="margin-bottom:14px;">
          <label style="font-size:0.78rem; color:#94a3b8; display:block; margin-bottom:6px;">🎙 انتخاب قاری قرآن:</label>
          <select id="murajaaReciterSelect" onchange="Murajaa.setReciter(this.value)" style="width:100%; padding:10px 12px; border-radius:12px; background:rgba(255,255,255,0.08); border:1px solid rgba(229,184,76,0.3); color:#fff; font-size:0.85rem; outline:none;">
            ${reciterOptions}
          </select>
        </div>

        <!-- Font selector -->
        <div style="margin-bottom:14px;">
          <label style="font-size:0.78rem; color:#94a3b8; display:block; margin-bottom:6px;">🖋 خط و شیوه نگارش مصحف:</label>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
            <button onclick="Murajaa.setFontStyle('Amiri Quran, serif')" class="neo3d-pill-btn" style="padding:8px; font-size:0.78rem;">مصحف مدینه (عثمان طه)</button>
            <button onclick="Murajaa.setFontStyle('Noto Nastaliq Urdu, serif')" class="neo3d-pill-btn" style="padding:8px; font-size:0.78rem;">شیوه اردو / هند</button>
            <button onclick="Murajaa.setFontStyle('Scheherazade New, serif')" class="neo3d-pill-btn" style="padding:8px; font-size:0.78rem;">خط شهرزاد مدرن</button>
            <button onclick="Murajaa.setFontStyle('Amiri, serif')" class="neo3d-pill-btn" style="padding:8px; font-size:0.78rem;">خط امیری کلاسیک</button>
          </div>
        </div>

        <!-- Font Size Slider -->
        <div style="margin-bottom:16px;">
          <label style="font-size:0.78rem; color:#94a3b8; display:block; margin-bottom:6px;">🔍 اندازه متن مصحف:</label>
          <input type="range" min="20" max="42" value="28" oninput="Murajaa.setFontSize(this.value)" style="width:100%;" />
        </div>

        <div style="text-align:center;">
          <button onclick="document.getElementById('murajaaTypographyModal').style.display='none'" class="neo3d-pill-btn" style="background:linear-gradient(135deg, #10b981, #059669); color:#fff; border:none; padding:8px 24px;">
            تأیید و بستن
          </button>
        </div>
      </div>
    `;

    modal.style.display = 'flex';
  };

  window.Murajaa.setReciter = function (reciterId) {
    if (window.state) {
      window.state.currentReciter = reciterId;
      localStorage.setItem('quran_selected_reciter', reciterId);
      const rec = window.Murajaa.POPULAR_RECITERS.find(r => r.id === reciterId);
      if (typeof showToast === 'function' && rec) {
        showToast(`قاری انتخاب شد: ${rec.name}`);
      }
    }
  };

  window.Murajaa.setFontStyle = function (fontFamily) {
    const card = document.getElementById('mushafPageCard');
    if (card) {
      card.style.fontFamily = fontFamily;
    }
    document.querySelectorAll('.mushaf-flowing-text, .ayah-verse-text, .mushaf-ayah-span').forEach(el => {
      el.style.fontFamily = fontFamily;
    });
    localStorage.setItem('murajaa_selected_font', fontFamily);
    if (typeof showToast === 'function') showToast('قلم مصحف تغییر یافت');
  };

  window.Murajaa.setFontSize = function (sizePx) {
    const card = document.getElementById('mushafPageCard');
    if (card) {
      card.style.fontSize = `${sizePx}px`;
    }
    document.querySelectorAll('.mushaf-flowing-text, .ayah-verse-text, .mushaf-ayah-span').forEach(el => {
      el.style.fontSize = `${sizePx}px`;
    });
    localStorage.setItem('murajaa_font_size', sizePx);
  };

  window.Murajaa.updateMicUI = function (isListening) {
    const micBtn = document.getElementById('murajaaMicFollowBtn');
    if (micBtn) {
      if (isListening) {
        micBtn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
        micBtn.innerHTML = '<i class="fa-solid fa-microphone-lines"></i> <span>در حال شنیدن...</span>';
      } else {
        micBtn.style.background = '';
        micBtn.innerHTML = '<i class="fa-solid fa-microphone"></i> <span>تشخیص هوشمند تلاوت</span>';
      }
    }
  };

  // =========================================================================
  // 7. INJECT MURAJAA TOOLBAR INTO MUSHAF PANE
  // =========================================================================
  window.Murajaa.injectToolbar = function () {
    if (document.getElementById('murajaaMasterToolbar')) return;

    const mushafPane = document.getElementById('paneMushaf');
    if (!mushafPane) return;

    const toolbar = document.createElement('div');
    toolbar.id = 'murajaaMasterToolbar';
    toolbar.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
      padding: 8px 12px;
      margin: 8px 0;
      border-radius: 14px;
      background: linear-gradient(145deg, rgba(15, 23, 42, 0.95), rgba(8, 14, 26, 0.98));
      border: 1px solid rgba(56, 189, 248, 0.35);
      box-shadow: 0 4px 18px rgba(0,0,0,0.4);
      flex-wrap: wrap;
    `;

    toolbar.innerHTML = `
      <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
        <!-- Tasmi' Mode Button -->
        <button id="murajaaTasmiToggleBtn" onclick="Murajaa.toggleTasmiMode()" class="neo3d-pill-btn" style="padding: 6px 12px; font-size: 0.78rem;" title="حالت تسمیع و خواندن از حفظ">
          <i class="fa-solid fa-eye-slash"></i> <span>تسمیع (حفظ)</span>
        </button>

        <!-- Reveal Ayah Button -->
        <button id="murajaaRevealBtn" onclick="Murajaa.revealCurrentVerse()" class="neo3d-pill-btn" style="padding: 6px 10px; font-size: 0.78rem;" title="نمایش آیه فعلی">
          <i class="fa-solid fa-eye"></i>
        </button>

        <!-- Mark Mistake Mode Button -->
        <button id="murajaaMistakeModeBtn" onclick="Murajaa.toggleMarkMistakeMode()" class="neo3d-pill-btn" style="padding: 6px 10px; font-size: 0.78rem;" title="حالت ثبت خطای کلمات">
          <i class="fa-solid fa-highlighter"></i> <span>ثبت خطا</span>
        </button>
      </div>

      <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
        <!-- Smart Mic Follow Along (Backtracking Support) -->
        <button id="murajaaMicFollowBtn" onclick="
          if (Murajaa.activeTracker.isListening) {
            Murajaa.activeTracker.stopRecognition();
          } else {
            Murajaa.prepareTasmiVerse();
            Murajaa.activeTracker.startRecognition();
          }
        " class="neo3d-pill-btn" style="padding: 6px 12px; font-size: 0.78rem;" title="تشخیص هوشمند تلاوت">
          <i class="fa-solid fa-microphone"></i> <span>تشخیص هوشمند تلاوت</span>
        </button>

        <!-- Ayah Quiz Button -->
        <button onclick="Murajaa.openAyahQuiz()" class="neo3d-pill-btn" style="padding: 6px 10px; font-size: 0.78rem; background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.4); color: #38bdf8;" title="کوئیز حفظ">
          <i class="fa-solid fa-lightbulb"></i> <span>کوئیز</span>
        </button>

        <!-- Typography & Reciters Settings Button -->
        <button onclick="Murajaa.openTypographySettings()" class="neo3d-pill-btn" style="padding: 6px 10px; font-size: 0.78rem; background: rgba(229, 184, 76, 0.15); border: 1px solid rgba(229, 184, 76, 0.4); color: #fde68a;" title="قاریان و قلم مصحف">
          <i class="fa-solid fa-sliders"></i>
        </button>
      </div>
    `;

    const firstChild = mushafPane.firstElementChild;
    if (firstChild) {
      mushafPane.insertBefore(toolbar, firstChild);
    } else {
      mushafPane.appendChild(toolbar);
    }

    console.log('[Murajaa Engine] Murajaa toolbar injected successfully.');
  };

  // Auto-init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.Murajaa.injectToolbar();
      window.Murajaa.applyMistakeHighlights();
    });
  } else {
    window.Murajaa.injectToolbar();
    window.Murajaa.applyMistakeHighlights();
  }

})();
