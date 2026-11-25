/**
 * HujraLessonsEngine - وانەکانی حوجرە
 * Interactive Kurdish Islamic Curriculum & Multi-Level Scholar Course Player
 */

(function (window) {
  'use strict';

  // State
  let currentScholar = null;
  let currentCategory = null;
  let currentLesson = null;
  let currentFilterType = 'all'; // 'all', 'audio', 'video'
  let searchQuery = '';

  // Audio Player instance
  let audioPlayer = null;
  let isPlaying = false;
  let currentSpeed = 1.0;
  let timeUpdateThrottle = null;

  function initAudio() {
    if (!audioPlayer) {
      audioPlayer = new Audio();
      audioPlayer.preload = 'metadata';

      audioPlayer.addEventListener('play', () => {
        isPlaying = true;
        updatePlayerUI();
      });

      audioPlayer.addEventListener('pause', () => {
        isPlaying = false;
        updatePlayerUI();
      });

      audioPlayer.addEventListener('ended', () => {
        isPlaying = false;
        updatePlayerUI();
      });

      audioPlayer.addEventListener('timeupdate', () => {
        if (!timeUpdateThrottle) {
          timeUpdateThrottle = setTimeout(() => {
            timeUpdateThrottle = null;
            updateTimeDisplay();
          }, 200);
        }
      });

      audioPlayer.addEventListener('error', (e) => {
        console.warn('Hujra Audio Player Error:', e);
        const errToast = window.showToast || alert;
        // If direct stream fails (e.g. Telegram CDN restriction), prompt user to open in Telegram
        if (currentLesson && currentLesson.tgLink) {
          if (typeof window.showToast === 'function') {
            window.showToast('⚠️ بۆ گوێگرتن لەم دەرسە، لە تێلێگرام دەیکەینەوە...');
          }
          window.open(currentLesson.tgLink, '_blank');
        }
      });
    }
  }

  function formatTime(seconds) {
    if (!seconds || isNaN(seconds) || seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  // =========================================================================
  // MODAL & NAVIGATION CONTROLLER
  // =========================================================================

  function openHujraLessonsModal() {
    let modal = document.getElementById('hujraLessonsModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'hujraLessonsModal';
      modal.className = 'typography-modal-overlay';
      modal.style.cssText = 'display: flex; position: fixed; inset: 0; background: rgba(2, 6, 13, 0.92); z-index: 18000; backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px); align-items: center; justify-content: center; padding: 10px; font-family: "Vazirmatn", "Noto Naskh Arabic", sans-serif; direction: rtl; text-align: right;';
      modal.onclick = (e) => { if (e.target === modal) closeHujraLessonsModal(); };
      document.body.appendChild(modal);
    }

    initAudio();

    // Default to the first scholar (Mamosta Hadi Ahmadi)
    const scholars = window.HUJRA_SCHOLARS_DATA || [];
    currentScholar = scholars[0] || null;
    currentCategory = null;
    currentLesson = null;

    renderMainView();
    modal.style.display = 'flex';
  }

  function closeHujraLessonsModal() {
    const modal = document.getElementById('hujraLessonsModal');
    if (modal) modal.style.display = 'none';
  }

  // =========================================================================
  // VIEW RENDERERS
  // =========================================================================

  function renderMainView() {
    const modal = document.getElementById('hujraLessonsModal');
    if (!modal) return;

    if (!currentScholar) {
      renderScholarsList(modal);
    } else if (!currentCategory) {
      renderScholarCategories(modal);
    } else {
      renderCategoryLessons(modal);
    }
  }

  // Level 1: Scholars List
  function renderScholarsList(container) {
    const scholars = window.HUJRA_SCHOLARS_DATA || [];
    container.innerHTML = `
      <div class="hujra-sheet neo3d-hub-sheet" style="width: 100%; max-width: 580px; max-height: 92vh; display: flex; flex-direction: column; padding: 18px 16px; overflow: hidden; border-radius: 26px; background: linear-gradient(165deg, #0d1722 0%, #060b10 100%); border: 1.5px solid rgba(16, 185, 129, 0.35); box-shadow: 0 28px 65px rgba(0,0,0,0.95);">
        <!-- Header -->
        <div style="padding: 0 4px 14px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div class="neo3d-orb-icon" style="width: 40px; height: 40px; border-radius: 13px; font-size: 1.15rem; background: linear-gradient(135deg, #10b981, #047857); box-shadow: 0 6px 16px rgba(16,185,129,0.35);">
              <i class="fa-solid fa-graduation-cap"></i>
            </div>
            <div>
              <div style="font-weight: 900; color: #fff; font-size: 1.1rem;">وانەکانی حوجرە</div>
              <div style="font-size: 0.74rem; color: #34d399;">مامۆستایان و دەرسە شەرعییەکان</div>
            </div>
          </div>
          <button onclick="QuranHujra.closeModal()" class="neo3d-close-btn" style="width: 34px; height: 34px; border-radius: 10px; background: rgba(255,255,255,0.08); border: none; color: #cbd5e1; cursor: pointer; display: flex; align-items: center; justify-content: center;"><i class="fa-solid fa-xmark"></i></button>
        </div>

        <!-- Body -->
        <div style="flex: 1; overflow-y: auto; padding: 14px 4px; display: flex; flex-direction: column; gap: 12px;">
          ${scholars.map(s => `
            <div onclick="QuranHujra.selectScholar('${s.id}')" style="cursor: pointer; border-radius: 20px; padding: 14px; background: rgba(15, 23, 42, 0.7); border: 1.5px solid rgba(16, 185, 129, 0.25); display: flex; gap: 14px; align-items: center; transition: all 0.22s ease;">
              <img src="${s.avatar}" style="width: 64px; height: 64px; border-radius: 18px; object-fit: cover; border: 2px solid #10b981; box-shadow: 0 4px 14px rgba(16,185,129,0.3);" />
              <div style="flex: 1;">
                <div style="font-weight: 900; color: #fff; font-size: 1.05rem;">${s.name}</div>
                <div style="font-size: 0.76rem; color: #34d399; margin-top: 3px;">${s.titleKu}</div>
                <div style="font-size: 0.72rem; color: #94a3b8; margin-top: 5px; line-height: 1.4;">${s.bioKu.substring(0, 85)}...</div>
              </div>
              <i class="fa-solid fa-chevron-left" style="color: #10b981; font-size: 1rem;"></i>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // Level 2: Scholar Profile & Books/Categories
  function renderScholarCategories(container) {
    const s = currentScholar;
    if (!s) return;

    container.innerHTML = `
      <div class="hujra-sheet neo3d-hub-sheet" style="width: 100%; max-width: 620px; max-height: 92vh; display: flex; flex-direction: column; padding: 18px 16px; overflow: hidden; border-radius: 26px; background: linear-gradient(165deg, #0d1722 0%, #060b10 100%); border: 1.5px solid rgba(56, 189, 248, 0.35); box-shadow: 0 28px 65px rgba(0,0,0,0.95);">
        <!-- Top Nav / Breadcrumbs -->
        <div style="padding: 0 4px 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <button onclick="QuranHujra.backToScholars()" class="neo3d-pill-btn" style="padding: 6px 12px; font-size: 0.76rem;">
              <i class="fa-solid fa-arrow-right"></i> مامۆستایان
            </button>
            <span style="font-weight: 900; color: #fff; font-size: 0.98rem;">${s.name}</span>
          </div>
          <button onclick="QuranHujra.closeModal()" class="neo3d-close-btn" style="width: 32px; height: 32px; border-radius: 10px; background: rgba(255,255,255,0.08); border: none; color: #cbd5e1; cursor: pointer; display: flex; align-items: center; justify-content: center;"><i class="fa-solid fa-xmark"></i></button>
        </div>

        <!-- Scholar Hero Card -->
        <div style="margin: 12px 2px 8px; padding: 14px; border-radius: 20px; background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 95, 70, 0.25)); border: 1.2px solid rgba(16, 185, 129, 0.3); display: flex; gap: 12px; align-items: center;">
          <img src="${s.avatar}" style="width: 58px; height: 58px; border-radius: 16px; object-fit: cover; border: 2px solid #10b981;" />
          <div style="flex: 1;">
            <div style="font-weight: 900; color: #fff; font-size: 1rem;">${s.name}</div>
            <div style="font-size: 0.72rem; color: #34d399; margin-top: 2px;">${s.titleKu}</div>
            <div style="display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap;">
              <a href="${s.telegramChannel}" target="_blank" class="neo3d-pill-btn" style="padding: 3px 9px; font-size: 0.68rem; text-decoration: none; color: #38bdf8; border-color: rgba(56,189,248,0.3);"><i class="fa-brands fa-telegram"></i> تلگرام فەرمی</a>
              <a href="${s.telegramLessons}" target="_blank" class="neo3d-pill-btn" style="padding: 3px 9px; font-size: 0.68rem; text-decoration: none; color: #34d399; border-color: rgba(16,185,129,0.3);"><i class="fa-brands fa-telegram"></i> کەناڵی درسەکان</a>
              <a href="${s.youtubeChannel}" target="_blank" class="neo3d-pill-btn" style="padding: 3px 9px; font-size: 0.68rem; text-decoration: none; color: #f43f5e; border-color: rgba(244,63,94,0.3);"><i class="fa-brands fa-youtube"></i> یوتیوب</a>
            </div>
          </div>
        </div>

        <!-- Categories / Books Grid -->
        <div style="flex: 1; overflow-y: auto; padding: 8px 4px; display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 10px;">
          ${s.categories.map(cat => `
            <div onclick="QuranHujra.selectCategory('${cat.id}')" style="cursor: pointer; border-radius: 18px; padding: 14px; background: rgba(15, 23, 42, 0.75); border: 1.5px solid ${cat.color}40; display: flex; flex-direction: column; justify-content: space-between; gap: 10px; transition: all 0.22s ease;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <div class="neo3d-orb-icon" style="width: 36px; height: 36px; border-radius: 11px; font-size: 1rem; background: ${cat.color}; color: #fff;">
                  <i class="${cat.icon}"></i>
                </div>
                <div>
                  <div style="font-weight: 800; color: #fff; font-size: 0.92rem;">${cat.titleKu}</div>
                  <div style="font-size: 0.7rem; color: ${cat.color}; font-weight: 700;">${cat.lessons.length} وانە و دەرس</div>
                </div>
              </div>
              <div style="font-size: 0.72rem; color: #94a3b8; line-height: 1.4;">${cat.descKu}</div>
              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 8px;">
                <span style="font-size: 0.68rem; color: #cbd5e1;">🎧 دەنگی و 🎬 ڤیدیۆ</span>
                <span style="font-size: 0.72rem; color: ${cat.color}; font-weight: 800;">بینین و گوێگرتن <i class="fa-solid fa-arrow-left"></i></span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // Level 3: Lessons List for Selected Category + Persistent Player
  function renderCategoryLessons(container) {
    const s = currentScholar;
    const cat = currentCategory;
    if (!s || !cat) return;

    // Filter lessons
    let filtered = cat.lessons;
    if (currentFilterType === 'audio') filtered = filtered.filter(l => l.isAudio);
    if (currentFilterType === 'video') filtered = filtered.filter(l => l.isVideo);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(l => (l.title + ' ' + l.subtopic + ' ' + l.summary).toLowerCase().includes(q));
    }

    container.innerHTML = `
      <div class="hujra-sheet neo3d-hub-sheet" style="width: 100%; max-width: 640px; max-height: 94vh; display: flex; flex-direction: column; padding: 16px 14px; overflow: hidden; border-radius: 26px; background: linear-gradient(165deg, #0d1722 0%, #060b10 100%); border: 1.5px solid ${cat.color}60; box-shadow: 0 28px 65px rgba(0,0,0,0.95);">
        <!-- Top Nav -->
        <div style="padding: 0 2px 10px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <button onclick="QuranHujra.backToCategories()" class="neo3d-pill-btn" style="padding: 5px 10px; font-size: 0.74rem;">
              <i class="fa-solid fa-arrow-right"></i> کتێبەکان
            </button>
            <span style="font-weight: 800; color: #fff; font-size: 0.94rem;">${cat.titleKu}</span>
          </div>
          <button onclick="QuranHujra.closeModal()" class="neo3d-close-btn" style="width: 32px; height: 32px; border-radius: 10px; background: rgba(255,255,255,0.08); border: none; color: #cbd5e1; cursor: pointer; display: flex; align-items: center; justify-content: center;"><i class="fa-solid fa-xmark"></i></button>
        </div>

        <!-- Search & Filter Bar -->
        <div style="display: flex; gap: 8px; margin: 10px 0 8px; flex-wrap: wrap; align-items: center;">
          <div style="flex: 1; min-width: 160px; position: relative;">
            <input type="text" id="hujraSearchInput" placeholder="گەڕان لە وانەکاندا..." value="${searchQuery}" oninput="QuranHujra.onSearchInput(this.value)" style="width: 100%; height: 34px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.15); background: rgba(15,23,42,0.8); color: #fff; padding: 0 28px 0 10px; font-size: 0.76rem; font-family: inherit; direction: rtl; box-sizing: border-box;">
            <i class="fa-solid fa-magnifying-glass" style="position: absolute; right: 10px; top: 10px; color: #94a3b8; font-size: 0.75rem;"></i>
          </div>
          <div style="display: flex; gap: 4px;">
            <button onclick="QuranHujra.setFilter('all')" class="neo3d-pill-btn ${currentFilterType === 'all' ? 'active-pill' : ''}" style="padding: 5px 9px; font-size: 0.7rem; border-radius: 8px; ${currentFilterType === 'all' ? 'background:' + cat.color + '; color:#fff;' : ''}">هەموو</button>
            <button onclick="QuranHujra.setFilter('audio')" class="neo3d-pill-btn ${currentFilterType === 'audio' ? 'active-pill' : ''}" style="padding: 5px 9px; font-size: 0.7rem; border-radius: 8px; ${currentFilterType === 'audio' ? 'background:' + cat.color + '; color:#fff;' : ''}">🎧 پادکست</button>
            <button onclick="QuranHujra.setFilter('video')" class="neo3d-pill-btn ${currentFilterType === 'video' ? 'active-pill' : ''}" style="padding: 5px 9px; font-size: 0.7rem; border-radius: 8px; ${currentFilterType === 'video' ? 'background:' + cat.color + '; color:#fff;' : ''}">🎬 ڤیدیۆ</button>
          </div>
        </div>

        <!-- Lessons Scrollable List -->
        <div style="flex: 1; overflow-y: auto; padding: 4px 2px; display: flex; flex-direction: column; gap: 8px;">
          ${filtered.length === 0 ? `
            <div style="padding: 30px; text-align: center; color: #94a3b8; font-size: 0.85rem;">هیچ وانەیەک نەدۆزرایەوە.</div>
          ` : filtered.map(l => {
            const isCur = currentLesson && currentLesson.id === l.id;
            return `
              <div onclick="QuranHujra.playLesson(${l.id})" style="cursor: pointer; border-radius: 14px; padding: 10px 12px; background: ${isCur ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.22), rgba(6, 95, 70, 0.35))' : 'rgba(15, 23, 42, 0.65)'}; border: 1.2px solid ${isCur ? '#10b981' : 'rgba(255,255,255,0.08)'}; display: flex; align-items: center; gap: 12px; transition: all 0.2s ease;">
                <div class="neo3d-orb-icon" style="width: 36px; height: 36px; border-radius: 10px; font-size: 0.95rem; background: ${l.isVideo ? 'linear-gradient(135deg, #ef4444, #b91c1c)' : 'linear-gradient(135deg, #10b981, #047857)'}; flex-shrink: 0; color: #fff;">
                  <i class="${isCur && isPlaying ? 'fa-solid fa-pause' : (l.isVideo ? 'fa-solid fa-play' : 'fa-solid fa-headphones')}"></i>
                </div>
                <div style="flex: 1; overflow: hidden;">
                  <div style="font-weight: 800; color: #fff; font-size: 0.84rem; text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">${l.title}</div>
                  <div style="font-size: 0.7rem; color: #94a3b8; margin-top: 2px; text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">${l.subtopic || l.summary}</div>
                </div>
                <div style="display: flex; gap: 6px; align-items: center;">
                  ${l.isVideo ? '<span style="font-size: 0.62rem; background: #ef444422; color: #f87171; border: 1px solid #ef444444; padding: 2px 5px; border-radius: 5px;">ڤیدیۆ</span>' : '<span style="font-size: 0.62rem; background: #10b98122; color: #34d399; border: 1px solid #10b98144; padding: 2px 5px; border-radius: 5px;">دەنگی</span>'}
                  <a href="${l.tgLink}" target="_blank" onclick="event.stopPropagation();" title="کردنەوە لە تێلێگرام" style="color: #38bdf8; font-size: 0.85rem; padding: 4px;"><i class="fa-brands fa-telegram"></i></a>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- ============================================================= -->
        <!-- PERSISTENT AUDIO / VIDEO MEDIA PLAYER DOCK                    -->
        <!-- ============================================================= -->
        <div id="hujraPlayerDock" style="margin-top: 10px; padding: 12px 14px; border-radius: 20px; background: linear-gradient(145deg, #0f1c2b, #09121c); border: 1.5px solid rgba(16, 185, 129, 0.4); box-shadow: 0 10px 30px rgba(0,0,0,0.8); display: flex; flex-direction: column; gap: 8px;">
          <!-- Track Info Row -->
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="flex: 1; overflow: hidden; padding-left: 10px;">
              <div id="playerDockTitle" style="font-weight: 800; color: #fff; font-size: 0.86rem; text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">
                ${currentLesson ? currentLesson.title : 'وانەیەک هەڵبژێرە بۆ پەخشکردن'}
              </div>
              <div id="playerDockScholar" style="font-size: 0.7rem; color: #34d399;">${s.name}</div>
            </div>
            <!-- Download & Telegram Buttons -->
            <div style="display: flex; gap: 6px;">
              <button id="playerDownloadBtn" onclick="QuranHujra.downloadCurrentLesson()" class="neo3d-pill-btn" style="padding: 4px 8px; font-size: 0.68rem; border-color: rgba(16,185,129,0.3); color: #34d399;" title="داگرتنی وانە">
                <i class="fa-solid fa-download"></i> داگرتن
              </button>
              <button id="playerTgBtn" onclick="QuranHujra.openInTelegram()" class="neo3d-pill-btn" style="padding: 4px 8px; font-size: 0.68rem; border-color: rgba(56,189,248,0.3); color: #38bdf8;" title="تێلێگرام">
                <i class="fa-brands fa-telegram"></i> تێلێگرام
              </button>
            </div>
          </div>

          <!-- Scrubber & Time Indicator -->
          <div style="display: flex; align-items: center; gap: 8px;">
            <span id="playerCurrentTime" style="font-size: 0.68rem; color: #94a3b8; min-width: 32px; direction: ltr;">00:00</span>
            <input type="range" id="playerScrubber" min="0" max="100" value="0" oninput="QuranHujra.onScrubberSeek(this.value)" style="flex: 1; accent-color: #10b981; cursor: pointer; height: 5px; border-radius: 5px;">
            <span id="playerTotalTime" style="font-size: 0.68rem; color: #94a3b8; min-width: 32px; direction: ltr;">00:00</span>
          </div>

          <!-- Controls Bar -->
          <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 2px;">
            <!-- Speed Selector -->
            <button onclick="QuranHujra.toggleSpeed()" id="playerSpeedBtn" class="neo3d-pill-btn" style="padding: 3px 8px; font-size: 0.68rem; min-width: 44px; color: #fbbf24;">
              ${currentSpeed}x
            </button>

            <!-- Main Playback Controls: -10s, Play/Pause, Stop, +10s -->
            <div style="display: flex; align-items: center; gap: 12px;">
              <!-- Rewind 10s -->
              <button onclick="QuranHujra.seekRelative(-10)" class="neo3d-pill-btn" style="width: 32px; height: 32px; border-radius: 50%; padding: 0; justify-content: center;" title="١٠ چرکە بۆ دواوە">
                <i class="fa-solid fa-rotate-left" style="font-size: 0.8rem;"></i>
              </button>

              <!-- Play / Pause -->
              <button onclick="QuranHujra.togglePlayPause()" id="playerPlayPauseBtn" style="width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(135deg, #10b981, #059669); border: none; color: #fff; font-size: 1.15rem; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(16,185,129,0.4);">
                <i class="${isPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play'}"></i>
              </button>

              <!-- Stop -->
              <button onclick="QuranHujra.stopPlayback()" class="neo3d-pill-btn" style="width: 32px; height: 32px; border-radius: 50%; padding: 0; justify-content: center;" title="ڕاگرتنی تەواو">
                <i class="fa-solid fa-stop" style="font-size: 0.8rem; color: #ef4444;"></i>
              </button>

              <!-- Forward 10s -->
              <button onclick="QuranHujra.seekRelative(10)" class="neo3d-pill-btn" style="width: 32px; height: 32px; border-radius: 50%; padding: 0; justify-content: center;" title="١٠ چرکە بۆ پێشەوە">
                <i class="fa-solid fa-rotate-right" style="font-size: 0.8rem;"></i>
              </button>
            </div>

            <!-- YouTube Video Pill -->
            <button onclick="QuranHujra.openInYouTube()" class="neo3d-pill-btn" style="padding: 3px 8px; font-size: 0.68rem; color: #ef4444;" title="یوتیوب">
              <i class="fa-brands fa-youtube"></i> یوتیوب
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // ACTIONS & PLAYBACK CONTROLLER
  // =========================================================================

  function selectScholar(scholarId) {
    const scholars = window.HUJRA_SCHOLARS_DATA || [];
    currentScholar = scholars.find(s => s.id === scholarId) || scholars[0];
    currentCategory = null;
    currentLesson = null;
    renderMainView();
  }

  function backToScholars() {
    currentScholar = null;
    currentCategory = null;
    currentLesson = null;
    renderMainView();
  }

  function selectCategory(catId) {
    if (!currentScholar) return;
    currentCategory = currentScholar.categories.find(c => c.id === catId) || null;
    searchQuery = '';
    currentFilterType = 'all';
    renderMainView();
  }

  function backToCategories() {
    currentCategory = null;
    renderMainView();
  }

  function setFilter(type) {
    currentFilterType = type;
    renderMainView();
  }

  function onSearchInput(val) {
    searchQuery = val;
    renderMainView();
  }

  function playLesson(lessonId) {
    if (!currentCategory) return;
    const lesson = currentCategory.lessons.find(l => l.id === lessonId);
    if (!lesson) return;

    currentLesson = lesson;
    initAudio();

    if (lesson.isVideo) {
      // For video lessons, open Video Player Modal
      openVideoModal(lesson);
      return;
    }

    // Direct Telegram audio streaming URL construct or iframe player
    // In Telegram, public audio files can be fetched or user can open telegram link
    // We construct the stream endpoint or use audio proxy:
    const audioUrl = `https://t.me/${lesson.tgLink.replace('https://t.me/', '')}?embed=1`;
    audioPlayer.src = audioUrl;
    audioPlayer.playbackRate = currentSpeed;
    
    // Play with fallback
    const playPromise = audioPlayer.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        isPlaying = true;
        updatePlayerUI();
      }).catch(err => {
        console.warn('Playback notice:', err);
        // If web audio autoplay is blocked or direct media stream needs Telegram widget:
        isPlaying = false;
        updatePlayerUI();
        // Open interactive telegram audio modal
        openTelegramEmbedModal(lesson);
      });
    }

    renderMainView();
  }

  function togglePlayPause() {
    if (!currentLesson) {
      if (currentCategory && currentCategory.lessons.length > 0) {
        playLesson(currentCategory.lessons[0].id);
      }
      return;
    }

    initAudio();
    if (isPlaying) {
      audioPlayer.pause();
    } else {
      audioPlayer.play().catch(() => {
        openTelegramEmbedModal(currentLesson);
      });
    }
    updatePlayerUI();
  }

  function stopPlayback() {
    if (audioPlayer) {
      audioPlayer.pause();
      audioPlayer.currentTime = 0;
    }
    isPlaying = false;
    updatePlayerUI();
  }

  function seekRelative(offsetSeconds) {
    if (!audioPlayer) return;
    audioPlayer.currentTime = Math.max(0, Math.min(audioPlayer.duration || 0, audioPlayer.currentTime + offsetSeconds));
    updateTimeDisplay();
  }

  function onScrubberSeek(percentage) {
    if (!audioPlayer || !audioPlayer.duration) return;
    audioPlayer.currentTime = (percentage / 100) * audioPlayer.duration;
    updateTimeDisplay();
  }

  function toggleSpeed() {
    const speeds = [1.0, 1.25, 1.5, 2.0];
    const nextIdx = (speeds.indexOf(currentSpeed) + 1) % speeds.length;
    currentSpeed = speeds[nextIdx];
    if (audioPlayer) audioPlayer.playbackRate = currentSpeed;
    const btn = document.getElementById('playerSpeedBtn');
    if (btn) btn.textContent = `${currentSpeed}x`;
  }

  function updatePlayerUI() {
    const playBtn = document.getElementById('playerPlayPauseBtn');
    if (playBtn) {
      playBtn.innerHTML = `<i class="${isPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play'}"></i>`;
    }
    const dockTitle = document.getElementById('playerDockTitle');
    if (dockTitle && currentLesson) {
      dockTitle.textContent = currentLesson.title;
    }
  }

  function updateTimeDisplay() {
    if (!audioPlayer) return;
    const cur = audioPlayer.currentTime || 0;
    const dur = audioPlayer.duration || 0;
    const curElem = document.getElementById('playerCurrentTime');
    const totElem = document.getElementById('playerTotalTime');
    const scrubber = document.getElementById('playerScrubber');

    if (curElem) curElem.textContent = formatTime(cur);
    if (totElem && dur > 0) totElem.textContent = formatTime(dur);
    if (scrubber && dur > 0) {
      scrubber.value = Math.round((cur / dur) * 100);
    }
  }

  function downloadCurrentLesson() {
    if (!currentLesson) return;
    if (typeof window.showToast === 'function') {
      window.showToast('📥 پەڕەی داگرتنی دەرس لە تێلێگرام دەکرێتەوە...');
    }
    window.open(currentLesson.tgLink, '_blank');
  }

  function openInTelegram() {
    if (currentLesson && currentLesson.tgLink) {
      window.open(currentLesson.tgLink, '_blank');
    } else if (currentScholar) {
      window.open(currentScholar.telegramLessons, '_blank');
    }
  }

  function openInYouTube() {
    if (currentScholar) {
      window.open(currentScholar.youtubeChannel, '_blank');
    }
  }

  // Telegram Embed / Fallback Player Modal
  function openTelegramEmbedModal(lesson) {
    let modal = document.getElementById('hujraTgEmbedModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'hujraTgEmbedModal';
      modal.style.cssText = 'display: flex; position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 19000; backdrop-filter: blur(12px); align-items: center; justify-content: center; padding: 12px;';
      modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
      document.body.appendChild(modal);
    }

    const postId = lesson.id;
    modal.innerHTML = `
      <div style="width: 100%; max-width: 480px; max-height: 85vh; background: #0b131b; border-radius: 20px; border: 1.5px solid #10b981; overflow: hidden; display: flex; flex-direction: column;">
        <div style="padding: 12px 14px; border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center;">
          <div style="font-weight: 800; color: #fff; font-size: 0.9rem;">${lesson.title}</div>
          <button onclick="document.getElementById('hujraTgEmbedModal').style.display='none'" style="background: none; border: none; color: #94a3b8; font-size: 1.1rem; cursor: pointer;"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div style="flex: 1; min-height: 340px; padding: 10px;">
          <iframe src="https://t.me/droosemamostahadi/${postId}?embed=1" frameborder="0" style="width: 100%; height: 340px; border-radius: 12px; border: none;"></iframe>
        </div>
        <div style="padding: 10px 14px; background: rgba(0,0,0,0.4); display: flex; justify-content: space-between; align-items: center;">
          <a href="${lesson.tgLink}" target="_blank" class="neo3d-pill-btn" style="padding: 6px 14px; font-size: 0.74rem; color: #38bdf8;"><i class="fa-brands fa-telegram"></i> کردنەوە لە تێلێگرام</a>
          <button onclick="document.getElementById('hujraTgEmbedModal').style.display='none'" class="neo3d-pill-btn" style="padding: 6px 14px; font-size: 0.74rem; background: #10b981; color: #fff; border: none;">داخستن</button>
        </div>
      </div>
    `;
    modal.style.display = 'flex';
  }

  // In-App Video Modal
  function openVideoModal(lesson) {
    let modal = document.getElementById('hujraVideoModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'hujraVideoModal';
      modal.style.cssText = 'display: flex; position: fixed; inset: 0; background: rgba(0,0,0,0.92); z-index: 19500; backdrop-filter: blur(14px); align-items: center; justify-content: center; padding: 10px;';
      modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
      document.body.appendChild(modal);
    }

    const postId = lesson.id;
    modal.innerHTML = `
      <div style="width: 100%; max-width: 560px; max-height: 90vh; background: #070c12; border-radius: 22px; border: 1.5px solid #ef4444; overflow: hidden; display: flex; flex-direction: column;">
        <div style="padding: 12px 14px; border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <i class="fa-solid fa-video" style="color: #ef4444;"></i>
            <div style="font-weight: 800; color: #fff; font-size: 0.88rem;">${lesson.title}</div>
          </div>
          <button onclick="document.getElementById('hujraVideoModal').style.display='none'" style="background: none; border: none; color: #cbd5e1; font-size: 1.1rem; cursor: pointer;"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div style="flex: 1; min-height: 380px; padding: 10px;">
          <iframe src="https://t.me/droosemamostahadi/${postId}?embed=1" frameborder="0" allowfullscreen style="width: 100%; height: 380px; border-radius: 12px; border: none;"></iframe>
        </div>
        <div style="padding: 10px 14px; background: rgba(0,0,0,0.5); display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; gap: 8px;">
            <a href="${lesson.tgLink}" target="_blank" class="neo3d-pill-btn" style="padding: 6px 12px; font-size: 0.72rem; color: #38bdf8;"><i class="fa-brands fa-telegram"></i> ڤیدیۆ لە تێلێگرام</a>
            <a href="${currentScholar ? currentScholar.youtubeChannel : '#'}" target="_blank" class="neo3d-pill-btn" style="padding: 6px 12px; font-size: 0.72rem; color: #ef4444;"><i class="fa-brands fa-youtube"></i> کەناڵی یوتیوب</a>
          </div>
          <button onclick="document.getElementById('hujraVideoModal').style.display='none'" class="neo3d-pill-btn" style="padding: 6px 12px; font-size: 0.72rem; background: #ef4444; color: #fff; border: none;">داخستن</button>
        </div>
      </div>
    `;
    modal.style.display = 'flex';
  }

  // Public Interface
  const QuranHujra = {
    openModal: openHujraLessonsModal,
    closeModal: closeHujraLessonsModal,
    selectScholar: selectScholar,
    backToScholars: backToScholars,
    selectCategory: selectCategory,
    backToCategories: backToCategories,
    setFilter: setFilter,
    onSearchInput: onSearchInput,
    playLesson: playLesson,
    togglePlayPause: togglePlayPause,
    stopPlayback: stopPlayback,
    seekRelative: seekRelative,
    onScrubberSeek: onScrubberSeek,
    toggleSpeed: toggleSpeed,
    downloadCurrentLesson: downloadCurrentLesson,
    openInTelegram: openInTelegram,
    openInYouTube: openInYouTube
  };

  window.QuranHujra = QuranHujra;
  window.openHujraLessonsModal = openHujraLessonsModal;

})(window);
