/**
 * Quran Karim - Smart PWA Auto-Install Engine
 * Automatically detects Android & iOS and presents the 1-click install prompt or iOS guide.
 */
(function () {
  'use strict';

  // 1. Don't run if already installed / running in standalone mode
  const isStandalone = (
    window.navigator.standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches ||
    document.referrer.includes('android-app://')
  );
  if (isStandalone) return;

  // 2. Register Service Worker for PWA compliance
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(err => {
        console.warn('SW Registration:', err);
      });
    });
  }

  // 3. Translations
  const I18N = {
    fa: {
      title: "نصب اپلیکیشن قرآن کریم",
      subtitle: "افزودن به صفحه اصلی موبایل",
      androidDesc: "برای دسترسی سریع، تمام‌صفحه و بدون نیاز به باز کردن مرورگر، برنامه را روی گوشی خود نصب کنید.",
      installBtn: "نصب سریع برنامه",
      iosTitle: "نصب روی صفحه اصلی آیفون (iOS)",
      iosStep1: "۱. در نوار پایین مرورگر سافاری، دکمه اشتراک‌گذاری",
      iosStep1Suffix: "را لمس کنید.",
      iosStep2: "۲. در منوی باز شده گزینه «Add to Home Screen» (افزودن به صفحه اصلی)",
      iosStep2Suffix: "را انتخاب نمایید.",
      closeBtn: "متوجه شدم",
      pill: "📱 نصب برنامه"
    },
    ku: {
      title: "دابەزاندن و دانانی بەرنامەی قورئان",
      subtitle: "دانانی ڕاستەوخۆ لەسەر شاشەی مۆبایل",
      androidDesc: "بۆ بەکارهێنانی خێرا و ئۆفلاین بەبێ پێویستی بە وێبگەڕ، ئەپەکە لەسەر شاشەی مۆبایلەکەت دابنێ.",
      installBtn: "داگرتن و دانانی ئەپ",
      iosTitle: "دانانی بەرنامە لەسەر شاشەی ئایفۆن (iOS)",
      iosStep1: "١. لە خوارەوەی سەفاری، دوگمەی شەیر",
      iosStep1Suffix: "دابگرە.",
      iosStep2: "٢. پاشان هەڵبژاردنی «Add to Home Screen» (دانان لەسەر شاشەی سەرەکی)",
      iosStep2Suffix: "هەڵبژێرە.",
      closeBtn: "تێگەیشتم",
      pill: "📱 دانانی ئەپ"
    },
    de: {
      title: "Koran Karim App installieren",
      subtitle: "Zum Startbildschirm hinzufügen",
      androidDesc: "Installieren Sie die App für schnellen Vollbild- und Offline-Zugriff ohne Browser.",
      installBtn: "Jetzt installieren",
      iosTitle: "Auf dem iPhone (iOS) installieren",
      iosStep1: "1. Tippen Sie unten in Safari auf das Teilen-Symbol",
      iosStep1Suffix: ".",
      iosStep2: "2. Wählen Sie 'Zum Home-Bildschirm'",
      iosStep2Suffix: "aus.",
      closeBtn: "Verstanden",
      pill: "📱 App installieren"
    },
    en: {
      title: "Install Quran Karim App",
      subtitle: "Add to Home Screen",
      androidDesc: "Install the app for instant fullscreen access and offline support without the browser bar.",
      installBtn: "Install App Now",
      iosTitle: "Install on iPhone Home Screen",
      iosStep1: "1. Tap the Share button at the bottom of Safari",
      iosStep1Suffix: ".",
      iosStep2: "2. Scroll and select 'Add to Home Screen'",
      iosStep2Suffix: ".",
      closeBtn: "Got it",
      pill: "📱 Install App"
    }
  };

  function getLang() {
    const l = localStorage.getItem('quran_app_language') || (typeof state !== 'undefined' && state.lang) || 'fa';
    return I18N[l] ? l : (l === 'ar' ? 'fa' : 'en');
  }

  let deferredPrompt = null;
  const isIos = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase()) && !window.MSStream;

  // Capture Android / Chrome install prompt
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    // Show prompt automatically after 1.2s on first visit
    setTimeout(showPrompt, 1200);
  });

  // For iOS, show after 1.8s
  if (isIos) {
    window.addEventListener('DOMContentLoaded', () => {
      setTimeout(showPrompt, 1800);
    });
  }

  function showPrompt() {
    // If user recently dismissed in this session, don't re-annoy, show pill instead
    if (sessionStorage.getItem('pwa_prompt_dismissed') === 'true') {
      showFloatingPill();
      return;
    }

    let overlay = document.getElementById('pwaSmartInstallOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'pwaSmartInstallOverlay';
      overlay.style.cssText = `
        position: fixed;
        inset: 0;
        z-index: 999999;
        background: rgba(3, 7, 18, 0.78);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        display: flex;
        align-items: flex-end;
        justify-content: center;
        padding: 16px;
        box-sizing: border-box;
        animation: pwaFadeIn 0.3s ease;
      `;
      document.body.appendChild(overlay);
    }

    const t = I18N[getLang()];
    const isRtl = (getLang() === 'fa' || getLang() === 'ku');

    overlay.style.display = 'flex';
    overlay.innerHTML = `
      <div style="
        position: relative;
        width: 100%;
        max-width: 420px;
        background: linear-gradient(155deg, rgba(15, 23, 42, 0.98) 0%, rgba(6, 11, 22, 0.99) 100%);
        border: 1.5px solid rgba(251, 191, 36, 0.45);
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.95), 0 0 35px rgba(251, 191, 36, 0.2);
        border-radius: 22px;
        padding: 20px 22px 18px;
        box-sizing: border-box;
        color: #f8fafc;
        direction: ${isRtl ? 'rtl' : 'ltr'};
        text-align: ${isRtl ? 'right' : 'left'};
        animation: pwaSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      ">
        <!-- Close button top corner -->
        <button type="button" onclick="window.PWAInstaller.dismiss()" ontouchend="window.PWAInstaller.dismiss()" style="
          position: absolute;
          top: 14px;
          ${isRtl ? 'left: 14px;' : 'right: 14px;'}
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(251, 191, 36, 0.3);
          color: #fbbf24;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          -webkit-tap-highlight-color: transparent;
        ">✕</button>

        <!-- Header: App Icon & Title -->
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 14px;">
          <img src="quran.png" alt="Quran Karim" style="
            width: 52px;
            height: 52px;
            border-radius: 14px;
            border: 1.5px solid rgba(251, 191, 36, 0.55);
            box-shadow: 0 4px 14px rgba(251, 191, 36, 0.3);
            object-fit: cover;
            flex-shrink: 0;
          ">
          <div style="min-width: 0;">
            <div style="font-size: 1rem; font-weight: 800; color: #fff; line-height: 1.3;">
              ${isIos ? t.iosTitle : t.title}
            </div>
            <div style="font-size: 0.72rem; color: #fbbf24; font-weight: 700; margin-top: 2px;">
              ${t.subtitle}
            </div>
          </div>
        </div>

        <!-- Body Content -->
        ${isIos ? `
          <!-- iOS Safari Visual Guide -->
          <div style="background: rgba(0, 0, 0, 0.35); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 14px; padding: 12px 14px; margin-bottom: 16px; font-size: 0.82rem; line-height: 1.8;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span>${t.iosStep1}</span>
              <span style="display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 7px; background: rgba(56, 189, 248, 0.22); border: 1px solid rgba(56, 189, 248, 0.5); color: #38bdf8; font-size: 0.9rem;">
                <i class="fa-solid fa-arrow-up-from-bracket"></i>
              </span>
              <span>${t.iosStep1Suffix}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span>${t.iosStep2}</span>
              <span style="display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 7px; background: rgba(251, 191, 36, 0.22); border: 1px solid rgba(251, 191, 36, 0.5); color: #fbbf24; font-size: 0.9rem;">
                <i class="fa-solid fa-square-plus"></i>
              </span>
              <span>${t.iosStep2Suffix}</span>
            </div>
          </div>

          <!-- Pulsing Arrow pointing down to Safari toolbar -->
          <div style="text-align: center; margin-bottom: 12px;">
            <div style="display: inline-block; animation: pwaBounce 1.5s infinite; color: #38bdf8; font-size: 1.2rem;">
              <i class="fa-solid fa-chevron-down"></i>
            </div>
          </div>

          <button type="button" onclick="window.PWAInstaller.dismiss()" ontouchend="window.PWAInstaller.dismiss()" style="
            width: 100%;
            height: 38px;
            border-radius: 12px;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            border: none;
            color: #fff;
            font-weight: 800;
            font-size: 0.85rem;
            cursor: pointer;
            box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            -webkit-tap-highlight-color: transparent;
          ">
            <i class="fa-solid fa-check"></i> ${t.closeBtn}
          </button>
        ` : `
          <!-- Android / Chrome 1-Click Install Button -->
          <div style="font-size: 0.8rem; color: #cbd5e1; margin-bottom: 16px; line-height: 1.6;">
            ${t.androidDesc}
          </div>

          <button type="button" onclick="window.PWAInstaller.install()" ontouchend="window.PWAInstaller.install()" style="
            width: 100%;
            height: 42px;
            border-radius: 12px;
            background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%);
            border: none;
            color: #000;
            font-weight: 900;
            font-size: 0.92rem;
            cursor: pointer;
            box-shadow: 0 6px 18px rgba(251, 191, 36, 0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            margin-bottom: 8px;
            -webkit-tap-highlight-color: transparent;
          ">
            <i class="fa-solid fa-download"></i> ${t.installBtn}
          </button>

          <button type="button" onclick="window.PWAInstaller.dismiss()" ontouchend="window.PWAInstaller.dismiss()" style="
            width: 100%;
            height: 32px;
            border-radius: 10px;
            background: transparent;
            border: none;
            color: #94a3b8;
            font-weight: 700;
            font-size: 0.78rem;
            cursor: pointer;
            -webkit-tap-highlight-color: transparent;
          ">
            ${t.closeBtn}
          </button>
        `}
      </div>
    `;
  }

  function dismiss() {
    sessionStorage.setItem('pwa_prompt_dismissed', 'true');
    const overlay = document.getElementById('pwaSmartInstallOverlay');
    if (overlay) overlay.style.display = 'none';
    showFloatingPill();
  }

  function install() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(choiceResult => {
        if (choiceResult.outcome === 'accepted') {
          const overlay = document.getElementById('pwaSmartInstallOverlay');
          if (overlay) overlay.style.display = 'none';
          const pill = document.getElementById('pwaFloatingInstallPill');
          if (pill) pill.style.display = 'none';
        }
        deferredPrompt = null;
      });
    } else {
      // Fallback if triggered without deferredPrompt
      alert("برای نصب برنامه، منوی مرورگر خود (سه نقطه در بالا) را باز کرده و گزینه «افزودن به صفحه اصلی / Install App» را انتخاب کنید.");
    }
  }

  function showFloatingPill() {
    let pill = document.getElementById('pwaFloatingInstallPill');
    if (!pill) {
      pill = document.createElement('button');
      pill.id = 'pwaFloatingInstallPill';
      pill.type = 'button';
      pill.onclick = showPrompt;
      pill.ontouchend = showPrompt;
      pill.style.cssText = `
        position: fixed;
        bottom: 82px;
        right: 14px;
        z-index: 99990;
        background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%);
        border: 1px solid rgba(255, 255, 255, 0.4);
        color: #000;
        font-weight: 800;
        font-size: 0.74rem;
        padding: 6px 14px;
        border-radius: 20px;
        box-shadow: 0 4px 14px rgba(251, 191, 36, 0.4);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        animation: pwaPulse 2s infinite;
        -webkit-tap-highlight-color: transparent;
      `;
      document.body.appendChild(pill);
    }
    const t = I18N[getLang()];
    pill.innerHTML = `<i class="fa-solid fa-download"></i> <span>${t.pill}</span>`;
    pill.style.display = 'flex';
  }

  // Inject CSS Keyframes
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pwaFadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes pwaSlideUp { from { transform: translateY(60px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    @keyframes pwaBounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(6px); } }
    @keyframes pwaPulse { 0% { transform: scale(1); } 50% { transform: scale(1.04); } 100% { transform: scale(1); } }
  `;
  document.head.appendChild(style);

  // Expose global controller
  window.PWAInstaller = {
    showPrompt: showPrompt,
    dismiss: dismiss,
    install: install
  };
})();
