/**
 * QuranVoiceAI - Universal Triple-Engine Quran Speech Recognition Architecture
 * 
 * Engines:
 * 1. 'groq_whisper'  : Ultra-Fast Cloud Whisper (whisper-large-v3-turbo, ~200-300ms, highest accuracy)
 * 2. 'local_whisper' : 100% Offline In-Browser WebAssembly ONNX Whisper (Xenova/whisper-tiny)
 * 3. 'google_speech' : Native Browser SpeechRecognition (Web Speech API) with Quran Phonetics
 */

(function (window) {
  'use strict';

  const STORAGE_ENGINE_KEY = 'quran_voice_engine';
  const STORAGE_GROQ_KEY = 'quran_groq_api_key';

  // State
  let activeEngineId = localStorage.getItem(STORAGE_ENGINE_KEY) || 'google_speech';
  let groqApiKey = localStorage.getItem(STORAGE_GROQ_KEY) || '';
  let isCurrentlyListening = false;
  let activeCallbacks = null;

  // Groq / Local Recorder instances
  let audioStream = null;
  let mediaRecorder = null;
  let audioChunks = [];
  let speechDetectInterval = null;
  let audioContext = null;
  let analyser = null;
  let silenceStartTime = null;

  // Local Whisper (Transformers.js) instances
  let localTranscriber = null;
  let isModelLoading = false;
  let modelLoadProgress = 0;

  // Native SpeechRecognition instance
  let nativeSpeechRec = null;

  // Engine Definitions
  const ENGINES = {
    groq_whisper: {
      id: 'groq_whisper',
      name: 'Groq Whisper',
      titleFa: 'هوش مصنوعی ویسپر ابری (فوق‌سریع)',
      badgeFa: '⚡ Whisper ابری',
      icon: 'fa-solid fa-bolt',
      color: '#10b981',
      bgGrad: 'linear-gradient(135deg, #10b981, #059669)',
      descFa: 'دقیق‌ترین و سریع‌ترین موتور هوش مصنوعی جهان (زیر ۰٫۳ ثانیه)، درک کامل لهجه‌های کردی، فارسی و ترتیل.'
    },
    local_whisper: {
      id: 'local_whisper',
      name: 'Whisper Offline',
      titleFa: 'ویسپر محلی (۱۰۰٪ آفلاین درون گوشی)',
      badgeFa: '🧠 Whisper آفلاین',
      icon: 'fa-solid fa-brain',
      color: '#38bdf8',
      bgGrad: 'linear-gradient(135deg, #38bdf8, #0284c7)',
      descFa: 'اجرا با پردازنده خود گوشی/تبلت (WebAssembly). بدون ارسال به اینترنت، کاملاً محلی و امن.'
    },
    google_speech: {
      id: 'google_speech',
      name: 'Google / Safari',
      titleFa: 'موتور پیش‌فرض مرورگر (گوگل / اپل)',
      badgeFa: '🌐 مرورگر (گوگل)',
      icon: 'fa-solid fa-globe',
      color: '#fbbf24',
      bgGrad: 'linear-gradient(135deg, #f59e0b, #d97706)',
      descFa: 'موتور رایگان سیستم‌عامل با فیلتر آوایی و ترجمه ارقام (۱۰۰۰ به الف).'
    }
  };

  // Helper: Normalizer with 1000/١٠٠٠, Muqatta'at and Kurdish/Persian normalization
  function normalizeText(txt) {
    if (!txt) return '';
    let t = String(txt)
      .replace(/(?:1000|١٠٠٠)/g, ' الف ')
      .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
      .replace(/[إأآءئؤٱ]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/[\u064A\u06CC\u0649]/g, 'ي')
      .replace(/[\u0643\u06A9\u06AA]/g, 'ك')
      .replace(/[اإأ]لف\s*ل[اآ]م\s*م[يی]م/g, 'الم')
      .replace(/[اإأ]لف\s*ل[اآ]\s*م[يی]م/g, 'الم')
      .replace(/[اإأ]لفل[اآ]م\s*م[يی]م/g, 'الم')
      .replace(/[اإأ]لفل[اآ]ميم/g, 'الم')
      .replace(/[اإأ]لف\s*ل[اآ]ميم/g, 'الم')
      .replace(/[اإأ]لف\s*ل[اآ]م/g, 'الم');

    if (typeof window.normalizeArabicForMatch === 'function') {
      return window.normalizeArabicForMatch(t);
    }
    if (typeof window.cleanArabicForMatch === 'function') {
      return window.cleanArabicForMatch(t);
    }
    return t.replace(/\s+/g, ' ').trim();
  }

  // =========================================================================
  // 1. ENGINE: GROQ WHISPER CLOUD (Ultra-Fast)
  // =========================================================================
  async function startGroqWhisperListening(callbacks) {
    if (!groqApiKey) {
      if (typeof window.showToast === 'function') {
        window.showToast('ℹ️ کلید Groq وارد نشده است؛ استفاده از موتور پیش‌فرض مرورگر...');
      }
      changeActiveEngine('google_speech');
      startNativeGoogleListening(callbacks);
      return;
    }

    audioChunks = [];
    try {
      audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
    } catch (e) {
      console.warn('Microphone permission denied:', e);
      if (callbacks.onError) callbacks.onError('عدم دسترسی به میکروفون');
      return;
    }

    // Set up Web Audio VAD (Voice Activity Detector)
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioContext = new AudioCtx();
      const source = audioContext.createMediaStreamSource(audioStream);
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
    } catch (e) {}

    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : (MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : '');

    mediaRecorder = mimeType ? new MediaRecorder(audioStream, { mimeType }) : new MediaRecorder(audioStream);

    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        audioChunks.push(e.data);
      }
    };

    mediaRecorder.onstart = () => {
      isCurrentlyListening = true;
      silenceStartTime = null;
      if (callbacks.onStart) callbacks.onStart();

      // Monitor Audio Level & Silence Detection for Chunk Dispatching
      const dataArray = new Uint8Array(analyser ? analyser.frequencyBinCount : 0);
      speechDetectInterval = setInterval(async () => {
        if (!isCurrentlyListening || !analyser) return;
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
        const avg = sum / dataArray.length;

        // If loud speech detected, reset silence timer
        if (avg > 15) {
          silenceStartTime = null;
        } else {
          // In silence
          if (!silenceStartTime) {
            silenceStartTime = Date.now();
          } else if (Date.now() - silenceStartTime > 1200 && audioChunks.length > 0) {
            // User paused for 1.2s -> dispatch chunk to Whisper
            silenceStartTime = null;
            await dispatchAudioToGroq(callbacks);
          }
        }
      }, 250);
    };

    mediaRecorder.onstop = async () => {
      if (speechDetectInterval) clearInterval(speechDetectInterval);
      if (audioChunks.length > 0) {
        await dispatchAudioToGroq(callbacks);
      }
      cleanupAudioNodes();
      if (callbacks.onEnd) callbacks.onEnd();
    };

    mediaRecorder.start(300); // 300ms chunks
  }

  async function dispatchAudioToGroq(callbacks) {
    if (audioChunks.length === 0) return;
    const blob = new Blob(audioChunks, { type: mediaRecorder ? mediaRecorder.mimeType : 'audio/webm' });
    audioChunks = []; // clear for next utterance

    // If audio is too short (< 0.4s), skip
    if (blob.size < 3000) return;

    if (!groqApiKey) {
      if (typeof window.showToast === 'function') {
        window.showToast('ℹ️ برای استفاده از Groq Whisper، کلید API را وارد کنید. بازگشت به موتور مرورگر...');
      }
      changeActiveEngine('google_speech');
      stopListening();
      startNativeGoogleListening(callbacks);
      return;
    }

    const apiKey = groqApiKey;
    const formData = new FormData();
    formData.append('file', blob, 'recitation.webm');
    formData.append('model', 'whisper-large-v3-turbo');
    formData.append('language', 'ar');
    formData.append('temperature', '0');
    formData.append('response_format', 'json');

    try {
      const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        },
        body: formData
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        console.warn('[Groq Whisper API] error:', res.status, errJson);
        if (res.status === 401) {
          if (typeof window.showToast === 'function') {
            window.showToast('⚠️ لطفاً کلید API معتبر Groq را در تنظیمات وارد فرمایید.');
          }
          openEngineSettingsModal();
        }
        return;
      }

      const data = await res.json();
      if (data && data.text) {
        const clean = normalizeText(data.text);
        if (callbacks.onTranscript) {
          callbacks.onTranscript(clean, true);
        }
      }
    } catch (err) {
      console.warn('[Groq Whisper Network Error]:', err);
    }
  }

  // =========================================================================
  // 2. ENGINE: LOCAL OFFLINE WHISPER (Transformers.js ONNX)
  // =========================================================================
  async function initLocalWhisperModel(progressCallback) {
    if (localTranscriber) return localTranscriber;
    isModelLoading = true;

    try {
      // Dynamic load Transformers.js if not yet loaded
      if (typeof window.pipeline === 'undefined') {
        await loadScript('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2');
      }

      const { pipeline, env } = window.transformers || window;
      if (env) {
        env.allowLocalModels = false;
        env.useBrowserCache = true;
      }

      localTranscriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny', {
        quantized: true,
        progress_callback: (p) => {
          if (p.status === 'progress') {
            modelLoadProgress = Math.round(p.progress || 0);
            if (progressCallback) progressCallback(modelLoadProgress);
          }
        }
      });

      isModelLoading = false;
      return localTranscriber;
    } catch (e) {
      isModelLoading = false;
      console.warn('Local Whisper load error:', e);
      throw e;
    }
  }

  async function startLocalWhisperListening(callbacks) {
    audioChunks = [];
    try {
      audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
      if (callbacks.onError) callbacks.onError('عدم دسترسی به میکروفون');
      return;
    }

    // Ensure model is ready
    if (!localTranscriber && !isModelLoading) {
      if (typeof window.showToast === 'function') {
        window.showToast('🧠 در حال آماده‌سازی مدل آفلاین ویسپر (برای بار اول)...');
      }
      try {
        await initLocalWhisperModel((prog) => {
          updateEngineBadgesUI();
        });
      } catch (e) {
        if (typeof window.showToast === 'function') {
          window.showToast('ℹ️ بارگذاری مدل آفلاین ناموفق بود؛ سوئیچ خودکار به موتور پیش‌فرض مرورگر...');
        }
        changeActiveEngine('google_speech');
        startNativeGoogleListening(callbacks);
        return;
      }
    }

    mediaRecorder = new MediaRecorder(audioStream);
    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) audioChunks.push(e.data);
    };

    mediaRecorder.onstart = () => {
      isCurrentlyListening = true;
      if (callbacks.onStart) callbacks.onStart();
    };

    mediaRecorder.onstop = async () => {
      if (audioChunks.length > 0) {
        const blob = new Blob(audioChunks, { type: 'audio/wav' });
        audioChunks = [];
        await processLocalWhisperAudio(blob, callbacks);
      }
      cleanupAudioNodes();
      if (callbacks.onEnd) callbacks.onEnd();
    };

    mediaRecorder.start();
  }

  async function processLocalWhisperAudio(blob, callbacks) {
    try {
      const buffer = await blob.arrayBuffer();
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx({ sampleRate: 16000 });
      const decoded = await ctx.decodeAudioData(buffer);
      const audioData = decoded.getChannelData(0);

      if (localTranscriber) {
        const result = await localTranscriber(audioData, {
          language: 'arabic',
          task: 'transcribe'
        });
        if (result && result.text) {
          const clean = normalizeText(result.text);
          if (callbacks.onTranscript) callbacks.onTranscript(clean, true);
        }
      }
    } catch (e) {
      console.warn('Local whisper inference error:', e);
    }
  }

  // =========================================================================
  // 3. ENGINE: NATIVE BROWSER SPEECH RECOGNITION (Google / Safari)
  // Continuous Immortal Engine: Auto-reconnects on breath pauses without stalling
  // =========================================================================
  let nativeRestartTimer = null;

  function startNativeGoogleListening(callbacks) {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      if (callbacks.onError) callbacks.onError('مرورگر از این قابلیت پشتیبانی نمی‌کند');
      return;
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

    nativeSpeechRec = new SpeechRec();
    nativeSpeechRec.lang = 'ar-SA';
    nativeSpeechRec.continuous = true;
    nativeSpeechRec.interimResults = true;
    nativeSpeechRec.maxAlternatives = 3;

    nativeSpeechRec.onstart = () => {
      isCurrentlyListening = true;
      if (callbacks.onStart) callbacks.onStart();
    };

    nativeSpeechRec.onresult = (event) => {
      let transcript = '';
      let isFinal = false;
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
        if (event.results[i].isFinal) isFinal = true;
      }
      const clean = normalizeText(transcript);
      if (callbacks.onTranscript) callbacks.onTranscript(clean, isFinal);
    };

    nativeSpeechRec.onerror = (e) => {
      console.warn('Native speech error notice:', e.error);
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        isCurrentlyListening = false;
        if (callbacks.onError) callbacks.onError(e.error);
      }
    };

    nativeSpeechRec.onend = () => {
      if (isCurrentlyListening) {
        // Continuous Immortal Auto-Reconnect on breath pause (under 60ms)
        if (nativeRestartTimer) clearTimeout(nativeRestartTimer);
        nativeRestartTimer = setTimeout(() => {
          if (isCurrentlyListening) {
            try {
              nativeSpeechRec.start();
            } catch (err) {
              // If already active, ignore
            }
          }
        }, 60);
      } else {
        if (callbacks.onEnd) callbacks.onEnd();
      }
    };

    try {
      nativeSpeechRec.start();
      isCurrentlyListening = true;
    } catch (e) {
      console.warn('Native speech start note:', e);
    }
  }

  function cleanupAudioNodes() {
    if (speechDetectInterval) {
      clearInterval(speechDetectInterval);
      speechDetectInterval = null;
    }
    if (audioStream) {
      audioStream.getTracks().forEach(t => t.stop());
      audioStream = null;
    }
    if (audioContext && audioContext.state !== 'closed') {
      audioContext.close().catch(() => {});
      audioContext = null;
    }
  }

  // =========================================================================
  function changeActiveEngine(engineId) {
    if (!ENGINES[engineId]) return;
    if (engineId === 'groq_whisper' && !groqApiKey) {
      const lang = localStorage.getItem('quran_app_language') || window.currentAppLanguage || 'ku';
      const msg = lang === 'ku' 
        ? 'ℹ️ بۆ بەکارهێنانی Groq دەبێت کلیلی API تۆمار بکرێت؛ مۆتۆری گووگڵ بەکاردێت.' 
        : 'ℹ️ Für Groq Whisper wird ein API-Key benötigt; Google/Browser-Engine aktiv.';
      if (typeof window.showToast === 'function') window.showToast(msg);
      activeEngineId = 'google_speech';
      localStorage.setItem(STORAGE_ENGINE_KEY, 'google_speech');
      updateEngineBadgesUI();
      openEngineSettingsModal();
      return;
    }
    activeEngineId = engineId;
    localStorage.setItem(STORAGE_ENGINE_KEY, engineId);
    updateEngineBadgesUI();
    const lang = localStorage.getItem('quran_app_language') || window.currentAppLanguage || 'ku';
    const label = lang === 'ku' ? (ENGINES[engineId].name + ' دیاری کرا') : (ENGINES[engineId].name + ' ausgewählt');
    if (typeof window.showToast === 'function') {
      window.showToast(`✨ ${label}`);
    }
  }

  // UNIFIED PUBLIC INTERFACE
  // =========================================================================
  const QuranVoiceAI = {
    getEngine: () => activeEngineId,
    setEngine: changeActiveEngine,
    getEnginesList: () => Object.values(ENGINES),
    isListening: () => isCurrentlyListening,

    startListening: (callbacks = {}) => {
      activeCallbacks = callbacks;
      if (activeEngineId === 'groq_whisper') {
        startGroqWhisperListening(callbacks);
      } else if (activeEngineId === 'local_whisper') {
        startLocalWhisperListening(callbacks);
      } else {
        startNativeGoogleListening(callbacks);
      }
    },

    stopListening: () => {
      isCurrentlyListening = false;
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        try { mediaRecorder.stop(); } catch(e){}
      }
      if (nativeSpeechRec) {
        try { nativeSpeechRec.abort(); } catch(e){}
        nativeSpeechRec = null;
      }
      cleanupAudioNodes();
    },

    openEngineModal: () => {
      openEngineSettingsModal();
    },

    closeEngineModal: () => {
      closeEngineSettingsModal();
    },

    saveGroqApiKey: (key) => {
      groqApiKey = String(key || '').trim();
      localStorage.setItem(STORAGE_GROQ_KEY, groqApiKey);
      if (typeof window.showToast === 'function') {
        window.showToast('✓ کلید Groq با موفقیت ذخیره شد ⭐');
      }
      closeEngineSettingsModal();
    }
  };

  // Helper script loader
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  // Update All 3D Pulsing Badges across the UI
  function updateEngineBadgesUI() {
    const current = ENGINES[activeEngineId] || ENGINES.groq_whisper;
    const badges = document.querySelectorAll('.voice-engine-switch-pill');
    badges.forEach(b => {
      b.innerHTML = `
        <span class="engine-badge-icon" style="color: ${current.color};">${current.icon.includes('bolt') ? '⚡' : (current.icon.includes('brain') ? '🧠' : '🌐')}</span>
        <span class="engine-badge-title">${current.name}</span>
      `;
      b.style.borderColor = current.color;
      b.title = `موتور فعلی: ${current.titleFa} (کلیک برای تعویض)`;
    });
  }

  // Inject 3D Animated Engine Switcher Styles
  function injectStyles() {
    if (document.getElementById('quranVoiceAIStyles')) return;
    const style = document.createElement('style');
    style.id = 'quranVoiceAIStyles';
    style.textContent = `
      /* Luxurious 3D Vibrating/Pulsing Engine Switcher Pill */
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
        transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        animation: voiceEngine3DPulse 3.5s infinite ease-in-out;
        user-select: none;
        -webkit-tap-highlight-color: transparent;
      }
      .voice-engine-switch-pill:hover {
        transform: scale(1.08) translateY(-1px);
        box-shadow: 0 6px 20px rgba(16, 185, 129, 0.35);
      }
      .voice-engine-switch-pill:active {
        transform: scale(0.95);
      }
      @keyframes voiceEngine3DPulse {
        0% { transform: scale(1); box-shadow: 0 0 0 rgba(16, 185, 129, 0); }
        50% { transform: scale(1.03); box-shadow: 0 0 12px rgba(16, 185, 129, 0.45); }
        100% { transform: scale(1); box-shadow: 0 0 0 rgba(16, 185, 129, 0); }
      }
      .engine-card-option {
        border-radius: 16px;
        padding: 12px 14px;
        cursor: pointer;
        border: 1.5px solid rgba(255, 255, 255, 0.1);
        background: rgba(15, 23, 42, 0.6);
        transition: all 0.22s ease;
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .engine-card-option:hover {
        background: rgba(30, 41, 59, 0.85);
        border-color: rgba(255, 255, 255, 0.25);
        transform: translateY(-2px);
      }
      .engine-card-option.active-engine {
        border-color: #10b981;
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.18), rgba(6, 95, 70, 0.28));
        box-shadow: 0 6px 20px rgba(16, 185, 129, 0.25);
      }
    `;
    document.head.appendChild(style);
  }

  // Dynamic Multilingual Translations for Engine Modal
  function getModalTranslations() {
    let lang = 'fa';
    try {
      lang = localStorage.getItem('quran_app_language') || window.currentAppLanguage || window.currentLang || 'fa';
    } catch (e) {
      lang = window.currentLang || 'fa';
    }
    const dict = {
      ku: {
        title: 'ڕێکخستنی دەنگی زیرەک',
        subtitle: 'هەڵبژاردنی مۆتۆری دەنگی تلاوەت (Triple-Engine)',
        e1_title: '١. Groq Whisper (سەرهێڵ و خێرا) ⭐',
        e1_badge: 'پێشنیارکراو',
        e1_desc: 'خێراترین و وردترین مۆتۆری دەنگی جیهان (ژێر ٠٫٣ چرکە)، تێگەیشتن لە هەموو شێوەزارەکان.',
        e2_title: '٢. Whisper ناوخۆیی (١٠٠٪ ئۆفلاین)',
        e2_badge: 'بێ ئینتەرنێت',
        e2_desc: 'کارپێکردن بە پرۆسێسەری ئامێرەکەت (WebAssembly) بەبێ پێویستی بە ئینتەرنێت.',
        e3_title: '٣. گووگڵ / وێبگەڕ (خۆڕایی و خێرا)',
        e3_badge: 'سەرەکی',
        e3_desc: 'مۆتۆری خۆماڵی ئامێرەکەت لەگەڵ پاڵاوتنی دەنگی و چاککردنی پیتەکان (وەک ١٠٠٠ بۆ ئەلف).',
        apiKeyTitle: '🔑 کلیلی تایبەتی Groq (ئارەزوومەندانە):',
        apiKeyPlaceholder: 'gsk_...',
        apiKeyBtn: 'پاشەکەوت',
        apiKeyNote: 'لە کاتی بەتاڵ بووندا، مۆتۆری خۆڕایی گووگڵ بە شێوەی خۆکار کار دەکات.'
      },
      de: {
        title: 'Spracherkennungs-Engine',
        subtitle: 'Auswahl der Koran-Rezitations-KI (Triple-Engine)',
        e1_title: '1. Groq Whisper (Cloud Ultra-Fast) ⭐',
        e1_badge: 'Empfohlen',
        e1_desc: 'Höchste Präzision weltweit; unter 0,3s Latenz, versteht alle Akzente.',
        e2_title: '2. Whisper Offline (100% Lokal)',
        e2_badge: 'Kein Internet',
        e2_desc: 'Vollständige Ausführung im Browser/Gerät via WebAssembly.',
        e3_title: '3. Google / Browser Standard',
        e3_badge: 'Standard',
        e3_desc: 'Kostenlose Standard-Spracherkennung mit phonetischer Koran-Optimierung.',
        apiKeyTitle: '🔑 Eigener Groq API-Key (optional):',
        apiKeyPlaceholder: 'gsk_...',
        apiKeyBtn: 'Speichern',
        apiKeyNote: 'Falls leer, läuft die Spracherkennung direkt über die Standard-Engine.'
      },
      ar: {
        title: 'إعدادات محرك التعرف الصوتي',
        subtitle: 'اختيار الذكاء الاصطناعي للتلاوة (Triple-Engine)',
        e1_title: '١. Groq Whisper (سحابي فائق السرعة) ⭐',
        e1_badge: 'موصى به',
        e1_desc: 'أدق وأسرع محرك ذكاء اصطناعي (أقل من ٠٫٣ ثانية)، استيعاب كامل لجميع اللهجات.',
        e2_title: '٢. Whisper محلي (١٠٠٪ دون إنترنت)',
        e2_badge: 'أوفلاين',
        e2_desc: 'معالجة مباشرة على معالج الجهاز عبر WebAssembly دون إرسال للخارج.',
        e3_title: '٣. متصفح جوجل / سفاري القياسي',
        e3_badge: 'افتراضي',
        e3_desc: 'محرك الجهاز الداخلي مع فلترة صوتية ذكية لتلاوة القرآن الكريم.',
        apiKeyTitle: '🔑 مفتاح Groq API الخاص (اختياري):',
        apiKeyPlaceholder: 'gsk_...',
        apiKeyBtn: 'حفظ',
        apiKeyNote: 'في حال تركه فارغاً، يعمل المحرك الافتراضي تلقائياً.'
      },
      fa: {
        title: 'تنظیمات موتور تشخیص صدا',
        subtitle: 'انتخاب هوش مصنوعی تلاوت (Triple-Engine)',
        e1_title: '۱. Groq Whisper (ابری فوق‌سریع) ⭐',
        e1_badge: 'پیشنهادی',
        e1_desc: 'دقیق‌ترین و سریع‌ترین موتور هوش مصنوعی جهان (زیر ۰٫۳ ثانیه).',
        e2_title: '۲. Whisper محلی (۱۰۰٪ آفلاین)',
        e2_badge: 'بدون اینترنت',
        e2_desc: 'اجرای کامل درون گوشی/تبلت با WebAssembly بدون ارسال به اینترنت.',
        e3_title: '۳. مرورگر پیش‌فرض (گوگل / اپل)',
        e3_badge: 'استاندارد',
        e3_desc: 'موتور داخلی دستگاه همراه با تصحیح هوشمند حروف و ارقام ۱۰۰۰.',
        apiKeyTitle: '🔑 کلید اختصاصی Groq (اختیاری):',
        apiKeyPlaceholder: 'gsk_...',
        apiKeyBtn: 'ذخیره',
        apiKeyNote: 'در صورت خالی بودن، موتور رایگان داخلی به صورت خودکار عمل می‌کند.'
      }
    };
    return dict[lang] || dict['ku'] || dict['fa'];
  }

  // Engine Settings Modal
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
    const currentKey = groqApiKey || '';
    modal.innerHTML = `
      <div class="neo3d-hub-sheet" style="width: 100%; max-width: 480px; max-height: 88vh; display: flex; flex-direction: column; padding: 18px 16px; overflow: hidden; border-radius: 26px; background: linear-gradient(165deg, #0d1722 0%, #060b10 100%); border: 1.5px solid rgba(56, 189, 248, 0.35); box-shadow: 0 28px 65px rgba(0,0,0,0.95); direction: rtl; text-align: right;">
        <!-- Header -->
        <div style="padding: 0 4px 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div class="neo3d-orb-icon" style="width: 38px; height: 38px; border-radius: 12px; font-size: 1.1rem; background: linear-gradient(135deg, #10b981, #047857); box-shadow: 0 6px 16px rgba(16,185,129,0.35);">
              <i class="fa-solid fa-microphone-lines"></i>
            </div>
            <div>
              <div style="font-weight: 900; color: #fff; font-size: 1rem;">${t.title}</div>
              <div style="font-size: 0.72rem; color: #34d399;">${t.subtitle}</div>
            </div>
          </div>
          <button onclick="QuranVoiceAI.closeEngineModal()" class="neo3d-close-btn" style="width: 32px; height: 32px; border-radius: 10px; background: rgba(255,255,255,0.08); border: none; color: #cbd5e1; cursor: pointer; display: flex; align-items: center; justify-content: center;"><i class="fa-solid fa-xmark"></i></button>
        </div>

        <!-- Body / Engine Options -->
        <div style="flex: 1; overflow-y: auto; padding: 14px 4px; display: flex; flex-direction: column; gap: 10px;">
          <!-- Engine 3: Native Browser (Google / Safari) FIRST -->
          <div class="engine-card-option ${activeEngineId === 'google_speech' ? 'active-engine' : ''}" onclick="QuranVoiceAI.setEngine('google_speech'); QuranVoiceAI.closeEngineModal();">
            <div style="font-size: 1.6rem; width: 44px; height: 44px; border-radius: 12px; background: rgba(245, 158, 11, 0.2); display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #fbbf24;">🌐</div>
            <div style="flex: 1;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="font-weight: 800; font-size: 0.88rem; color: #fff;">${t.e3_title}</div>
                <span style="font-size: 0.65rem; background: #d97706; color: #fff; padding: 1px 6px; border-radius: 4px; font-weight: 800;">${t.e3_badge}</span>
              </div>
              <div style="font-size: 0.72rem; color: #94a3b8; margin-top: 3px; line-height: 1.4;">${t.e3_desc}</div>
            </div>
          </div>

          <!-- Engine 1: Groq Whisper Cloud -->
          <div class="engine-card-option ${activeEngineId === 'groq_whisper' ? 'active-engine' : ''}" onclick="QuranVoiceAI.setEngine('groq_whisper'); QuranVoiceAI.closeEngineModal();">
            <div style="font-size: 1.6rem; width: 44px; height: 44px; border-radius: 12px; background: rgba(16, 185, 129, 0.2); display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #34d399;">⚡</div>
            <div style="flex: 1;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="font-weight: 800; font-size: 0.88rem; color: #fff;">${t.e1_title}</div>
                <span style="font-size: 0.65rem; background: #10b981; color: #042f2e; padding: 1px 6px; border-radius: 4px; font-weight: 800;">${t.e1_badge}</span>
              </div>
              <div style="font-size: 0.72rem; color: #94a3b8; margin-top: 3px; line-height: 1.4;">${t.e1_desc}</div>
            </div>
          </div>

          <!-- Engine 2: Local Whisper Offline -->
          <div class="engine-card-option ${activeEngineId === 'local_whisper' ? 'active-engine' : ''}" onclick="QuranVoiceAI.setEngine('local_whisper'); QuranVoiceAI.closeEngineModal();">
            <div style="font-size: 1.6rem; width: 44px; height: 44px; border-radius: 12px; background: rgba(56, 189, 248, 0.2); display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #38bdf8;">🧠</div>
            <div style="flex: 1;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="font-weight: 800; font-size: 0.88rem; color: #fff;">${t.e2_title}</div>
                <span style="font-size: 0.65rem; background: #0284c7; color: #fff; padding: 1px 6px; border-radius: 4px; font-weight: 800;">${t.e2_badge}</span>
              </div>
              <div style="font-size: 0.72rem; color: #94a3b8; margin-top: 3px; line-height: 1.4;">${t.e2_desc}</div>
            </div>
          </div>

          <!-- Groq Custom API Key Option -->
          <div style="margin-top: 8px; padding: 12px; border-radius: 14px; background: rgba(0,0,0,0.35); border: 1px solid rgba(255,255,255,0.08);">
            <div style="font-size: 0.76rem; font-weight: 800; color: #e2e8f0; margin-bottom: 6px;">
              ${t.apiKeyTitle}
            </div>
            <div style="display: flex; gap: 6px;">
              <input type="text" id="groqApiKeyInput" placeholder="${t.apiKeyPlaceholder}" value="${currentKey}" style="flex: 1; height: 32px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.05); color: #fff; padding: 0 10px; font-size: 0.75rem; direction: ltr; font-family: monospace;">
              <button onclick="QuranVoiceAI.saveGroqApiKey(document.getElementById('groqApiKeyInput').value)" class="neo3d-pill-btn" style="padding: 0 12px; height: 32px; background: #10b981; color: #fff; border: none; font-size: 0.74rem;">${t.apiKeyBtn}</button>
            </div>
            <div style="font-size: 0.68rem; color: #94a3b8; margin-top: 5px;">
              ${t.apiKeyNote}
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

  // Init
  document.addEventListener('DOMContentLoaded', () => {
    injectStyles();
    updateEngineBadgesUI();
  });

  window.QuranVoiceAI = QuranVoiceAI;

})(window);
