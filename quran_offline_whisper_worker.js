/**
 * Dedicated Offline Quran Whisper AI Web Worker (ES Module)
 * Runs Tarteel-finetuned Quran Whisper ONNX models 100% locally in-browser
 * via WebAssembly / WebGPU without freezing the UI thread.
 */

const QURAN_OFFLINE_MODELS = {
  fast: 'aaqibhabib/whisper-tiny-ar-quran-onnx',
  pro: 'aaqibhabib/whisper-base-ar-quran-onnx',
  fallback: 'omartariq612/tarteel-ai-whisper-tiny-ar-quran-onnx'
};

let pipelineFn = null;
let activeTranscriber = null;
let loadedModelId = null;
let isLoading = false;
let isBusy = false;

async function ensureTransformersLoaded() {
  if (pipelineFn) return pipelineFn;

  const cdnUrls = [
    'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/transformers.min.js',
    'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.4.0/dist/transformers.min.js'
  ];

  let lastErr = null;
  for (const url of cdnUrls) {
    try {
      const mod = await import(url);
      if (mod && mod.pipeline) {
        if (mod.env) {
          mod.env.allowLocalModels = false;
          mod.env.useBrowserCache = true;
        }
        pipelineFn = mod.pipeline;
        return pipelineFn;
      }
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr || new Error('Could not load Transformers.js runtime');
}

async function loadQuranModel(tier = 'fast', forceReload = false) {
  const targetModelId = QURAN_OFFLINE_MODELS[tier] || QURAN_OFFLINE_MODELS.fast;

  if (activeTranscriber && loadedModelId === targetModelId && !forceReload) {
    self.postMessage({ type: 'ready', modelId: loadedModelId, tier });
    return activeTranscriber;
  }

  if (isLoading) return null;
  isLoading = true;

  try {
    const pipeline = await ensureTransformersLoaded();
    const fileProgress = {};

    const reportProgress = (p) => {
      if (!p) return;
      if (p.file && typeof p.progress === 'number') {
        fileProgress[p.file] = p.progress;
        const vals = Object.values(fileProgress);
        const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
        self.postMessage({
          type: 'progress',
          progress: Math.min(99, Math.round(avg)),
          file: p.file,
          status: p.status || 'downloading',
          modelId: targetModelId
        });
      } else if (p.status === 'ready') {
        self.postMessage({ type: 'progress', progress: 100, status: 'ready', modelId: targetModelId });
      }
    };

    const candidateModels = [targetModelId, QURAN_OFFLINE_MODELS.fallback];
    let loaded = null;
    let finalId = targetModelId;
    let loadError = null;

    for (const candidate of candidateModels) {
      try {
        loaded = await pipeline('automatic-speech-recognition', candidate, {
          quantized: true,
          progress_callback: reportProgress
        });
        finalId = candidate;
        break;
      } catch (err) {
        loadError = err;
      }
    }

    if (!loaded) {
      throw loadError || new Error('Failed to initialize offline Quran model');
    }

    activeTranscriber = loaded;
    loadedModelId = finalId;
    isLoading = false;
    self.postMessage({ type: 'ready', modelId: loadedModelId, tier });
    return activeTranscriber;
  } catch (err) {
    isLoading = false;
    self.postMessage({
      type: 'error',
      error: err && err.message ? err.message : String(err)
    });
    return null;
  }
}

async function transcribeAudio(float32Samples, reqId) {
  if (!activeTranscriber) {
    await loadQuranModel('fast', false);
  }
  if (!activeTranscriber || !float32Samples || float32Samples.length < 3200) {
    self.postMessage({ type: 'transcript', text: '', reqId });
    return;
  }

  if (isBusy) return;
  isBusy = true;

  try {
    let output = null;
    try {
      // Tarteel fine-tuned models output Quranic Arabic directly; try without forced language first if non-multilingual, else with arabic
      const genCfg = activeTranscriber.model && activeTranscriber.model.generation_config;
      if (genCfg && genCfg.is_multilingual === false) {
        output = await activeTranscriber(float32Samples, {
          chunk_length_s: 20,
          stride_length_s: 3
        });
      } else {
        output = await activeTranscriber(float32Samples, {
          language: 'arabic',
          task: 'transcribe',
          chunk_length_s: 20,
          stride_length_s: 3
        });
      }
    } catch (innerErr) {
      output = await activeTranscriber(float32Samples);
    }

    const text = (output && output.text) ? String(output.text).trim() : '';
    isBusy = false;
    self.postMessage({ type: 'transcript', text, reqId, modelId: loadedModelId });
  } catch (err) {
    isBusy = false;
    self.postMessage({
      type: 'error',
      error: err && err.message ? err.message : String(err),
      reqId
    });
  }
}

self.onmessage = async (event) => {
  const msg = event.data || {};
  if (msg.type === 'init' || msg.type === 'preload') {
    await loadQuranModel(msg.tier || 'fast', !!msg.forceReload);
  } else if (msg.type === 'transcribe') {
    await transcribeAudio(msg.audio, msg.reqId);
  }
};
