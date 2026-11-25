/**
 * HujraLessonsEngine - وانەکانی حوجرە
 * Interactive Kurdish Islamic Curriculum & Scholar Course Player
 * 100% In-App Playback via YouTube Embeds & Direct Audio (Zero External Redirects)
 */

(function (window) {
  'use strict';

  // Navigation State
  let currentScholar = null;     // Level 1: Selected Scholar
  let currentCategory = null;    // Level 2: Selected Course/Book
  let currentLesson = null;      // Level 3: Selected Lesson
  let currentFilterType = 'all'; // 'all', 'audio', 'video'
  let searchQuery = '';

  // Player State
  let playerMode = 'audio';      // 'audio' (تەنیا دەنگ) vs 'video' (دەنگ و ڤیدیۆ)
  let currentSpeed = 1.0;
  let isPlaying = false;
  let audioPlayer = null;

  function initAudio() {
    if (!audioPlayer) {
      audioPlayer = new Audio();
      audioPlayer.preload = 'metadata';

      audioPlayer.addEventListener('play', () => { isPlaying = true; });
      audioPlayer.addEventListener('pause', () => { isPlaying = false; });
      audioPlayer.addEventListener('ended', () => {
        isPlaying = false;
        playNextLesson();
      });
      audioPlayer.addEventListener('error', (e) => {
        console.warn('Direct audio stream notice:', e);
      });
    }
  }

  // Get In-App Media Embed URL (YouTube or Direct Audio - Never Telegram)
  function getMediaEmbedUrl(lesson, scholar, category) {
    if (!lesson) return '';

    // 1. Direct YouTube Video ID
    if (lesson.youtubeId) {
      return `https://www.youtube-nocookie.com/embed/${lesson.youtubeId}?autoplay=1&enablejsapi=1&rel=0`;
    }

    // 2. Direct YouTube URL (extract video or playlist ID)
    if (lesson.youtubeUrl) {
      const match = lesson.youtubeUrl.match(/(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*)/);
      if (match && match[1] && match[1].length === 11) {
        return `https://www.youtube-nocookie.com/embed/${match[1]}?autoplay=1&enablejsapi=1&rel=0`;
      }
    }

    // 3. Category/Course Playlist
    if (category && category.youtubePlaylistId) {
      return `https://www.youtube-nocookie.com/embed/videoseries?list=${category.youtubePlaylistId}&autoplay=1`;
    }

    // 4. Default: In-App YouTube Search Query for the specific lesson
    const scholarName = (scholar && scholar.name) ? scholar.name : 'مامۆستا هادی ئەحمەدی';
    const query = encodeURIComponent(`${scholarName} ${lesson.title || ''}`);
    return `https://www.youtube-nocookie.com/embed?listType=search&list=${query}&autoplay=1&rel=0`;
  }

  // Avatar Fallback Helper
  const DEFAULT_AVATAR = "https://ui-avatars.com/api/?name=%D9%85%D8%A7%D9%85%DB%8F%D8%B3%D8%AA%D8%A7+%D9%87%D8%A7%D8%AF%DB%8C&background=10b981&color=fff&size=128&bold=true";

  // =========================================================================
  // MAIN MODAL CONTROLLER (Levels 1, 2, 3)
  // =========================================================================

  function openHujraLessonsModal() {
    let modal = document.getElementById('hujraLessonsModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'hujraLessonsModal';
      modal.className = 'typography-modal-overlay';
      modal.style.cssText = 'display: flex; position: fixed; inset: 0; background: rgba(2, 6, 13, 0.94); z-index: 18000; backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px); align-items: center; justify-content: center; padding: 12px; font-family: "Vazirmatn", "Noto Naskh Arabic", sans-serif; direction: rtl; text-align: right;';
      modal.onclick = (e) => { if (e.target === modal) closeHujraLessonsModal(); };
      document.body.appendChild(modal);
    }

    initAudio();

    // Start cleanly at Level 1: Scholars list (مامۆستایان)
    currentScholar = null;
    currentCategory = null;
    searchQuery = '';
    currentFilterType = 'all';

    renderMainView();
    modal.style.display = 'flex';
  }

  function closeHujraLessonsModal() {
    const modal = document.getElementById('hujraLessonsModal');
    if (modal) modal.style.display = 'none';
  }

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

  // =========================================================================
  // LEVEL 1: SCHOLARS LIST (مامۆستایان / اساتید)
  // =========================================================================
  function renderScholarsList(container) {
    const scholars = window.HUJRA_SCHOLARS_DATA || [];
    container.innerHTML = `
      <div class="hujra-sheet neo3d-hub-sheet" style="width: 100%; max-width: 600px; max-height: 90vh; display: flex; flex-direction: column; padding: 18px 16px; overflow: hidden; border-radius: 26px; background: linear-gradient(165deg, #0d1722 0%, #060b10 100%); border: 1.5px solid rgba(16, 185, 129, 0.35); box-shadow: 0 28px 65px rgba(0,0,0,0.95);">
        <!-- Header -->
        <div style="padding: 0 4px 14px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div class="neo3d-orb-icon" style="width: 42px; height: 42px; border-radius: 14px; font-size: 1.2rem; background: linear-gradient(135deg, #10b981, #047857); box-shadow: 0 6px 16px rgba(16,185,129,0.35);">
              <i class="fa-solid fa-graduation-cap"></i>
            </div>
            <div>
              <div style="font-weight: 900; color: #fff; font-size: 1.12rem;">وانەکانی حوجرە</div>
              <div style="font-size: 0.76rem; color: #34d399;">مامۆستایان و دەرسە شەرعییەکان</div>
            </div>
          </div>
          <button onclick="QuranHujra.closeModal()" class="neo3d-close-btn" style="width: 34px; height: 34px; border-radius: 10px; background: rgba(255,255,255,0.08); border: none; color: #cbd5e1; cursor: pointer; display: flex; align-items: center; justify-content: center;"><i class="fa-solid fa-xmark"></i></button>
        </div>

        <!-- Banner Note -->
        <div style="margin: 12px 2px 6px; padding: 10px 14px; border-radius: 14px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.25); display: flex; align-items: center; gap: 10px;">
          <i class="fa-solid fa-book-open-reader" style="color: #34d399; font-size: 1.1rem;"></i>
          <span style="font-size: 0.74rem; color: #cbd5e1; line-height: 1.4;">مامۆستایەک هەڵبژێرە بۆ بینینی هەموو کتێبەکان بە پەخشی ڕاستەوخۆ و دەنگی/ڤیدیۆیی:</span>
        </div>

        <!-- Scholars Cards -->
        <div style="flex: 1; overflow-y: auto; padding: 8px 4px; display: flex; flex-direction: column; gap: 12px;">
          ${scholars.map(s => {
            const totalLessons = (s.categories || []).reduce((acc, c) => acc + (c.lessons ? c.lessons.length : 0), 0);
            return `
              <div onclick="QuranHujra.selectScholar('${s.id}')" style="cursor: pointer; border-radius: 20px; padding: 14px; background: rgba(15, 23, 42, 0.75); border: 1.5px solid rgba(16, 185, 129, 0.25); display: flex; gap: 14px; align-items: center; transition: all 0.22s ease;">
                <img src="${s.avatar || DEFAULT_AVATAR}" onerror="this.src='${DEFAULT_AVATAR}'" style="width: 66px; height: 66px; border-radius: 18px; object-fit: cover; border: 2px solid #10b981; box-shadow: 0 4px 14px rgba(16,185,129,0.3);" />
                <div style="flex: 1;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="font-weight: 900; color: #fff; font-size: 1.05rem;">${s.name}</div>
                    <span style="font-size: 0.68rem; background: rgba(16,185,129,0.18); color: #34d399; padding: 2px 8px; border-radius: 12px; border: 1px solid rgba(16,185,129,0.3); font-weight: 700;">${(s.categories || []).length} کتێب · ${totalLessons} دەرس</span>
                  </div>
                  <div style="font-size: 0.76rem; color: #34d399; margin-top: 2px;">${s.titleKu}</div>
                  <div style="font-size: 0.72rem; color: #94a3b8; margin-top: 5px; line-height: 1.4;">${(s.bioKu || '').substring(0, 95)}...</div>
                </div>
                <i class="fa-solid fa-chevron-left" style="color: #10b981; font-size: 1.1rem;"></i>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // =========================================================================
  // LEVEL 2: SCHOLAR'S BOOKS / COURSES (کتێب و خولەکان)
  // =========================================================================
  function renderScholarCategories(container) {
    const s = currentScholar;
    if (!s) return;

    container.innerHTML = `
      <div class="hujra-sheet neo3d-hub-sheet" style="width: 100%; max-width: 640px; max-height: 90vh; display: flex; flex-direction: column; padding: 18px 16px; overflow: hidden; border-radius: 26px; background: linear-gradient(165deg, #0d1722 0%, #060b10 100%); border: 1.5px solid rgba(56, 189, 248, 0.35); box-shadow: 0 28px 65px rgba(0,0,0,0.95);">
        <!-- Top Nav / Breadcrumbs with Back Button -->
        <div style="padding: 0 4px 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <button onclick="QuranHujra.backToScholars()" class="neo3d-pill-btn" style="padding: 6px 12px; font-size: 0.76rem; background: rgba(255,255,255,0.06); color: #38bdf8;">
              <i class="fa-solid fa-arrow-right"></i> گەڕانەوە بۆ مامۆستایان
            </button>
            <span style="font-weight: 900; color: #fff; font-size: 0.98rem;">${s.name}</span>
          </div>
          <button onclick="QuranHujra.closeModal()" class="neo3d-close-btn" style="width: 32px; height: 32px; border-radius: 10px; background: rgba(255,255,255,0.08); border: none; color: #cbd5e1; cursor: pointer; display: flex; align-items: center; justify-content: center;"><i class="fa-solid fa-xmark"></i></button>
        </div>

        <!-- Scholar Hero Card -->
        <div style="margin: 12px 2px 8px; padding: 14px; border-radius: 20px; background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 95, 70, 0.25)); border: 1.2px solid rgba(16, 185, 129, 0.3); display: flex; gap: 12px; align-items: center;">
          <img src="${s.avatar || DEFAULT_AVATAR}" onerror="this.src='${DEFAULT_AVATAR}'" style="width: 58px; height: 58px; border-radius: 16px; object-fit: cover; border: 2px solid #10b981;" />
          <div style="flex: 1;">
            <div style="font-weight: 900; color: #fff; font-size: 1rem;">${s.name}</div>
            <div style="font-size: 0.72rem; color: #34d399; margin-top: 2px;">${s.titleKu}</div>
            <div style="display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap;">
              <span class="neo3d-pill-btn" style="padding: 3px 9px; font-size: 0.68rem; color: #ef4444; border-color: rgba(239,68,68,0.3);"><i class="fa-brands fa-youtube"></i> پەخشی یوتیوب</span>
              <span class="neo3d-pill-btn" style="padding: 3px 9px; font-size: 0.68rem; color: #34d399; border-color: rgba(16,185,129,0.3);"><i class="fa-solid fa-headphones"></i> پەخشی دەنگی</span>
            </div>
          </div>
        </div>

        <!-- Categories / Books Title -->
        <div style="padding: 6px 4px 4px; font-weight: 800; font-size: 0.84rem; color: #38bdf8;">
          📚 کتێب و دەرسەکان (کلیک بکە بۆ بینینی دەرسەکانی هەر کتێبێک):
        </div>

        <!-- Categories / Books Grid -->
        <div style="flex: 1; overflow-y: auto; padding: 6px 4px; display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 10px;">
          ${(s.categories || []).map(cat => `
            <div onclick="QuranHujra.selectCategory('${cat.id}')" style="cursor: pointer; border-radius: 18px; padding: 14px; background: rgba(15, 23, 42, 0.8); border: 1.5px solid ${cat.color || '#10b981'}40; display: flex; flex-direction: column; justify-content: space-between; gap: 10px; transition: all 0.22s ease;">
              <div style="display: flex; align-items: center; gap: 12px;">
                ${cat.coverImage ? `
                  <div style="position: relative; width: 44px; height: 58px; border-radius: 8px; overflow: hidden; box-shadow: -2px 3px 10px rgba(0,0,0,0.6); flex-shrink: 0; border: 1.5px solid ${cat.color || '#10b981'}80; background: #0f172a;">
                    <img src="${cat.coverImage}" onerror="this.parentElement.style.display='none'" style="width: 100%; height: 100%; object-fit: cover;" />
                  </div>
                ` : `
                  <div class="neo3d-orb-icon" style="width: 42px; height: 42px; border-radius: 12px; font-size: 1.1rem; background: ${cat.color || '#10b981'}; color: #fff; flex-shrink: 0;">
                    <i class="${cat.icon || 'fa-solid fa-book'}"></i>
                  </div>
                `}
                <div style="flex: 1; overflow: hidden;">
                  <div style="font-weight: 800; color: #fff; font-size: 0.94rem; text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">${cat.titleKu}</div>
                  <div style="font-size: 0.72rem; color: ${cat.color || '#10b981'}; font-weight: 700; margin-top: 2px;">${(cat.lessons || []).length} وانە و دەرس</div>
                </div>
              </div>
              <div style="font-size: 0.72rem; color: #94a3b8; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${cat.descKu || ''}</div>
              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 8px;">
                <span style="font-size: 0.68rem; color: #cbd5e1;">🎧 دەنگی و 🎬 ڤیدیۆ</span>
                <span style="font-size: 0.74rem; color: ${cat.color || '#10b981'}; font-weight: 800;">بینینی دەرسەکان <i class="fa-solid fa-arrow-left"></i></span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // =========================================================================
  // LEVEL 3: LESSONS LIST FOR SELECTED BOOK (دەرسەکانی کتێب)
  // =========================================================================
  function renderCategoryLessons(container) {
    const s = currentScholar;
    const cat = currentCategory;
    if (!s || !cat) return;

    let filtered = cat.lessons || [];
    if (currentFilterType === 'audio') filtered = filtered.filter(l => l.isAudio);
    if (currentFilterType === 'video') filtered = filtered.filter(l => l.isVideo);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(l => ((l.title || '') + ' ' + (l.subtopic || '') + ' ' + (l.summary || '')).toLowerCase().includes(q));
    }

    container.innerHTML = `
      <div class="hujra-sheet neo3d-hub-sheet" style="width: 100%; max-width: 660px; max-height: 92vh; display: flex; flex-direction: column; padding: 16px 14px; overflow: hidden; border-radius: 26px; background: linear-gradient(165deg, #0d1722 0%, #060b10 100%); border: 1.5px solid ${cat.color || '#10b981'}60; box-shadow: 0 28px 65px rgba(0,0,0,0.95);">
        <!-- Top Nav / Breadcrumbs with Back to Books Button -->
        <div style="padding: 0 2px 10px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <button onclick="QuranHujra.backToCategories()" class="neo3d-pill-btn" style="padding: 5px 11px; font-size: 0.74rem; background: rgba(255,255,255,0.06); color: #38bdf8;">
              <i class="fa-solid fa-arrow-right"></i> گەڕانەوە بۆ کتێبەکان
            </button>
            <span style="font-weight: 800; color: #fff; font-size: 0.94rem;">${cat.titleKu}</span>
          </div>
          <button onclick="QuranHujra.closeModal()" class="neo3d-close-btn" style="width: 32px; height: 32px; border-radius: 10px; background: rgba(255,255,255,0.08); border: none; color: #cbd5e1; cursor: pointer; display: flex; align-items: center; justify-content: center;"><i class="fa-solid fa-xmark"></i></button>
        </div>

        <!-- Search & Filter Bar -->
        <div style="display: flex; gap: 8px; margin: 10px 0 8px; flex-wrap: wrap; align-items: center;">
          <div style="flex: 1; min-width: 160px; position: relative;">
            <input type="text" id="hujraSearchInput" placeholder="گەڕان لە دەرسەکاندا..." value="${searchQuery}" oninput="QuranHujra.onSearchInput(this.value)" style="width: 100%; height: 34px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.15); background: rgba(15,23,42,0.8); color: #fff; padding: 0 28px 0 10px; font-size: 0.76rem; font-family: inherit; direction: rtl; box-sizing: border-box;">
            <i class="fa-solid fa-magnifying-glass" style="position: absolute; right: 10px; top: 10px; color: #94a3b8; font-size: 0.75rem;"></i>
          </div>
          <div style="display: flex; gap: 4px;">
            <button onclick="QuranHujra.setFilter('all')" class="neo3d-pill-btn ${currentFilterType === 'all' ? 'active-pill' : ''}" style="padding: 5px 9px; font-size: 0.7rem; border-radius: 8px; ${currentFilterType === 'all' ? 'background:' + (cat.color||'#10b981') + '; color:#fff;' : ''}">هەموو (${(cat.lessons||[]).length})</button>
            <button onclick="QuranHujra.setFilter('audio')" class="neo3d-pill-btn ${currentFilterType === 'audio' ? 'active-pill' : ''}" style="padding: 5px 9px; font-size: 0.7rem; border-radius: 8px; ${currentFilterType === 'audio' ? 'background:#10b981; color:#fff;' : ''}"><i class="fa-solid fa-headphones"></i> دەنگی</button>
            <button onclick="QuranHujra.setFilter('video')" class="neo3d-pill-btn ${currentFilterType === 'video' ? 'active-pill' : ''}" style="padding: 5px 9px; font-size: 0.7rem; border-radius: 8px; ${currentFilterType === 'video' ? 'background:#ef4444; color:#fff;' : ''}"><i class="fa-solid fa-video"></i> ڤیدیۆ</button>
          </div>
        </div>

        <!-- Lessons Items List -->
        <div style="flex: 1; overflow-y: auto; padding: 4px 2px; display: flex; flex-direction: column; gap: 8px;">
          ${filtered.length === 0 ? '<div style="text-align: center; color: #94a3b8; padding: 24px; font-size: 0.8rem;">هیچ وانەیەک نەدۆزرایەوە</div>' : ''}
          ${filtered.map((l) => {
            const isCur = currentLesson && currentLesson.id === l.id;
            return `
              <div onclick="QuranHujra.openInAppPlayerById(${l.id})" style="cursor: pointer; border-radius: 14px; padding: 10px 12px; background: ${isCur ? 'linear-gradient(135deg, rgba(16,185,129,0.22), rgba(6,95,70,0.32))' : 'rgba(15, 23, 42, 0.65)'}; border: 1.2px solid ${isCur ? '#10b981' : 'rgba(255,255,255,0.06)'}; display: flex; justify-content: space-between; align-items: center; gap: 10px; transition: all 0.18s ease;">
                <div style="display: flex; align-items: center; gap: 10px; flex: 1; overflow: hidden;">
                  ${(l.coverImage || cat.coverImage) ? `
                    <div style="position: relative; width: 34px; height: 46px; border-radius: 6px; overflow: hidden; box-shadow: -1px 2px 6px rgba(0,0,0,0.5); flex-shrink: 0; border: 1px solid rgba(255,255,255,0.15); background: #000;">
                      <img src="${l.coverImage || cat.coverImage}" onerror="this.parentElement.style.display='none'" style="width: 100%; height: 100%; object-fit: cover;" />
                    </div>
                  ` : `
                    <div style="width: 32px; height: 32px; border-radius: 10px; background: ${l.isVideo ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}; color: ${l.isVideo ? '#f87171' : '#34d399'}; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; flex-shrink: 0;">
                      <i class="${isCur && isPlaying ? 'fa-solid fa-circle-pause' : (l.isVideo ? 'fa-solid fa-video' : 'fa-solid fa-play')}"></i>
                    </div>
                  `}
                  <div style="flex: 1; overflow: hidden;">
                    <div style="font-weight: 800; color: #fff; font-size: 0.84rem; text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">${l.title}</div>
                    <div style="font-size: 0.68rem; color: #94a3b8; margin-top: 2px; text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">${l.subtopic || l.summary || ''}</div>
                  </div>
                </div>
                <div style="display: flex; gap: 6px; align-items: center; flex-shrink: 0;">
                  ${l.isVideo ? '<span style="font-size: 0.62rem; background: #ef444422; color: #f87171; border: 1px solid #ef444444; padding: 2px 6px; border-radius: 6px;">ڤیدیۆ</span>' : '<span style="font-size: 0.62rem; background: #10b98122; color: #34d399; border: 1px solid #10b98144; padding: 2px 6px; border-radius: 6px;">دەنگی</span>'}
                  <button onclick="event.stopPropagation(); QuranHujra.openInAppPlayerById(${l.id})" class="neo3d-pill-btn" style="padding: 4px 10px; font-size: 0.72rem; background: rgba(16,185,129,0.2); color: #34d399; border-color: rgba(16,185,129,0.4);" title="پەخشکردن">
                    <i class="fa-solid fa-play"></i> پەخش
                  </button>
                  <button onclick="event.stopPropagation(); QuranHujra.downloadLessonDirect(${l.id})" class="neo3d-pill-btn" style="padding: 4px 8px; font-size: 0.7rem; background: rgba(56,189,248,0.15); color: #38bdf8; border-color: rgba(56,189,248,0.3);" title="داگرتن">
                    <i class="fa-solid fa-download"></i>
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // =========================================================================
  // LEVEL 4: IN-APP MEDIA PLAYER MODAL (100% In-App Playback - Zero Telegram)
  // =========================================================================
  function openInAppPlayer(lesson, initialMode = null) {
    if (!lesson) return;
    currentLesson = lesson;
    if (initialMode) {
      playerMode = initialMode;
    } else {
      playerMode = lesson.isVideo ? 'video' : 'audio';
    }

    let modal = document.getElementById('hujraInAppPlayerModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'hujraInAppPlayerModal';
      modal.className = 'typography-modal-overlay';
      modal.style.cssText = 'display: flex; position: fixed; inset: 0; background: rgba(0, 0, 0, 0.94); z-index: 19500; backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); align-items: center; justify-content: center; padding: 10px; font-family: "Vazirmatn", "Noto Naskh Arabic", sans-serif; direction: rtl; text-align: right;';
      modal.onclick = (e) => { if (e.target === modal) closeInAppPlayer(); };
      document.body.appendChild(modal);
    }

    renderInAppPlayerModalContent();
    modal.style.display = 'flex';
  }

  function closeInAppPlayer() {
    const modal = document.getElementById('hujraInAppPlayerModal');
    if (modal) {
      modal.innerHTML = '';
      modal.style.display = 'none';
    }
    if (audioPlayer) {
      try { audioPlayer.pause(); } catch(e){}
    }
  }

  function setPlayerMode(mode) {
    playerMode = mode;
    renderInAppPlayerModalContent();
  }

  function renderInAppPlayerModalContent() {
    const modal = document.getElementById('hujraInAppPlayerModal');
    if (!modal || !currentLesson) return;

    const l = currentLesson;
    const s = currentScholar || { name: 'مامۆستا هادی ئەحمەدی', avatar: DEFAULT_AVATAR };
    const cat = currentCategory || { titleKu: 'وانەکانی حوجرە' };
    const embedUrl = getMediaEmbedUrl(l, s, cat);

    modal.innerHTML = `
      <div class="neo3d-hub-sheet" style="width: 100%; max-width: 620px; max-height: 92vh; display: flex; flex-direction: column; padding: 16px 14px; overflow-y: auto; border-radius: 26px; background: linear-gradient(165deg, #0b131c 0%, #05090f 100%); border: 1.5px solid ${playerMode === 'video' ? '#ef4444' : '#10b981'}; box-shadow: 0 28px 65px rgba(0,0,0,0.98);">
        <!-- Header -->
        <div style="padding: 0 2px 10px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); display: flex; align-items: center; justify-content: space-between; flex-shrink: 0;">
          <div style="display: flex; align-items: center; gap: 10px; overflow: hidden;">
            <img src="${s.avatar || DEFAULT_AVATAR}" onerror="this.src='${DEFAULT_AVATAR}'" style="width: 38px; height: 38px; border-radius: 11px; object-fit: cover; border: 1.5px solid #10b981; flex-shrink: 0;" />
            <div style="overflow: hidden;">
              <div style="font-weight: 800; color: #fff; font-size: 0.92rem; text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">${l.title}</div>
              <div style="font-size: 0.7rem; color: #34d399;">${s.name} · ${cat.titleKu}</div>
            </div>
          </div>
          <button onclick="QuranHujra.closePlayerModal()" class="neo3d-close-btn" style="width: 32px; height: 32px; border-radius: 10px; background: rgba(255,255,255,0.08); border: none; color: #cbd5e1; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0;"><i class="fa-solid fa-xmark"></i></button>
        </div>

        <!-- Mode Toggle Pill: Audio Only vs Audio + Video -->
        <div style="margin: 12px 0 10px; display: flex; justify-content: center; flex-shrink: 0;">
          <div style="display: flex; background: rgba(15,23,42,0.85); border: 1px solid rgba(255,255,255,0.12); border-radius: 30px; padding: 4px; gap: 4px;">
            <button onclick="QuranHujra.setPlayerMode('audio')" class="neo3d-pill-btn ${playerMode === 'audio' ? 'active-pill' : ''}" style="padding: 6px 14px; font-size: 0.75rem; border-radius: 20px; ${playerMode === 'audio' ? 'background: #10b981; color: #fff; font-weight: 800;' : 'color: #94a3b8;'}">
              <i class="fa-solid fa-headphones"></i> تەنیا دەنگ (فقط صدا)
            </button>
            <button onclick="QuranHujra.setPlayerMode('video')" class="neo3d-pill-btn ${playerMode === 'video' ? 'active-pill' : ''}" style="padding: 6px 14px; font-size: 0.75rem; border-radius: 20px; ${playerMode === 'video' ? 'background: #ef4444; color: #fff; font-weight: 800;' : 'color: #94a3b8;'}">
              <i class="fa-solid fa-video"></i> دەنگ و ڤیدیۆ (صدا و ویدیو)
            </button>
          </div>
        </div>

        <!-- In-App Media Container -->
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 4px; min-height: 280px;">
          ${playerMode === 'audio' ? `
            <!-- AUDIO-ONLY VIEW -->
            <div style="width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; padding: 10px 0;">
              ${(l.coverImage || (cat && cat.coverImage)) ? `
                <!-- 3D Book Cover with Scholar Badge -->
                <div style="position: relative; display: flex; align-items: flex-end; justify-content: center; margin-bottom: 4px;">
                  <div style="width: 100px; height: 135px; border-radius: 12px; overflow: hidden; box-shadow: -6px 8px 24px rgba(0,0,0,0.85), 0 0 30px ${(cat && cat.color) || '#10b981'}35; border: 2px solid ${(cat && cat.color) || '#10b981'}; background: #0b111a;">
                    <img src="${l.coverImage || cat.coverImage}" onerror="this.src='${s.avatar || DEFAULT_AVATAR}'" style="width: 100%; height: 100%; object-fit: cover;" />
                  </div>
                  <div style="position: absolute; right: -14px; bottom: -8px; width: 44px; height: 44px; border-radius: 50%; border: 2.5px solid #10b981; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.8); background: #000;">
                    <img src="${s.avatar || DEFAULT_AVATAR}" onerror="this.src='${DEFAULT_AVATAR}'" style="width: 100%; height: 100%; object-fit: cover;" title="${s.name}" />
                  </div>
                </div>
              ` : `
                <!-- Glowing Pulsing Avatar -->
                <div style="position: relative; width: 110px; height: 110px; display: flex; align-items: center; justify-content: center;">
                  <div style="position: absolute; inset: -6px; border-radius: 50%; border: 2px dashed rgba(16, 185, 129, 0.45); animation: spin 20s linear infinite;"></div>
                  <img src="${s.avatar || DEFAULT_AVATAR}" onerror="this.src='${DEFAULT_AVATAR}'" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 3px solid #10b981; box-shadow: 0 0 25px rgba(16, 185, 129, 0.5);" />
                </div>
              `}
              
              <div style="text-align: center; max-width: 95%;">
                <div style="font-weight: 800; color: #fff; font-size: 0.94rem;">${l.title}</div>
                <div style="font-size: 0.74rem; color: #34d399; margin-top: 3px;">${l.subtopic || l.summary || (cat ? cat.titleKu : 'وانەی فەرمی حوجرەی شەمسولعاریفین')}</div>
              </div>

              <!-- In-App Responsive Audio Player Stream -->
              <div style="width: 100%; max-width: 480px; height: 85px; border-radius: 16px; overflow: hidden; background: #000; border: 1.5px solid rgba(16,185,129,0.35); box-shadow: 0 8px 24px rgba(0,0,0,0.6);">
                <iframe src="${embedUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="width: 100%; height: 100%; border: none;"></iframe>
              </div>
            </div>
          ` : `
            <!-- VIDEO VIEW -->
            <div style="width: 100%; height: 340px; display: flex; flex-direction: column; border-radius: 16px; overflow: hidden; border: 1.5px solid rgba(239,68,68,0.35); background: #000; box-shadow: 0 8px 24px rgba(0,0,0,0.8);">
              <iframe src="${embedUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="width: 100%; height: 100%; border: none;"></iframe>
            </div>
          `}
        </div>

        <!-- Footer Control Bar -->
        <div style="margin-top: 12px; padding: 10px 12px; border-radius: 16px; background: rgba(15,23,42,0.85); border: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; flex-shrink: 0;">
          <!-- Prev / Next Lesson Navigation -->
          <div style="display: flex; gap: 6px;">
            <button onclick="QuranHujra.playPrevLesson()" class="neo3d-pill-btn" style="padding: 6px 12px; font-size: 0.72rem; color: #cbd5e1;" title="وانەی پێشوو">
              <i class="fa-solid fa-backward-step"></i> وانەی پێشوو
            </button>
            <button onclick="QuranHujra.playNextLesson()" class="neo3d-pill-btn" style="padding: 6px 12px; font-size: 0.72rem; color: #cbd5e1;" title="وانەی دواتر">
              وانەی دواتر <i class="fa-solid fa-forward-step"></i>
            </button>
          </div>

          <!-- Download Action -->
          <div style="display: flex; gap: 6px;">
            <button onclick="QuranHujra.downloadCurrentLesson()" class="neo3d-pill-btn" style="padding: 6px 14px; font-size: 0.74rem; background: linear-gradient(135deg, #10b981, #059669); color: #fff; border: none; font-weight: 800;">
              <i class="fa-solid fa-download"></i> داگرتن (Download)
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // ACTIONS & NAVIGATION HELPERS
  // =========================================================================

  function selectScholar(scholarId) {
    const scholars = window.HUJRA_SCHOLARS_DATA || [];
    currentScholar = scholars.find(s => s.id === scholarId) || scholars[0];
    currentCategory = null;
    currentLesson = null;
    searchQuery = '';
    renderMainView();
  }

  function backToScholars() {
    currentScholar = null;
    currentCategory = null;
    currentLesson = null;
    searchQuery = '';
    renderMainView();
  }

  function selectCategory(catId) {
    if (!currentScholar) return;
    const cat = (currentScholar.categories || []).find(c => c.id === catId);
    if (!cat) return;
    currentCategory = cat;
    currentLesson = null;
    searchQuery = '';
    renderMainView();
  }

  function backToCategories() {
    currentCategory = null;
    currentLesson = null;
    searchQuery = '';
    renderMainView();
  }

  function setFilter(type) {
    currentFilterType = type;
    renderMainView();
  }

  function onSearchInput(val) {
    searchQuery = val || '';
    renderMainView();
  }

  function openInAppPlayerById(lessonId) {
    if (!currentCategory) return;
    const l = (currentCategory.lessons || []).find(item => item.id === lessonId);
    if (l) openInAppPlayer(l);
  }

  function playNextLesson() {
    if (!currentCategory || !currentLesson) return;
    const list = currentCategory.lessons || [];
    const idx = list.findIndex(l => l.id === currentLesson.id);
    if (idx >= 0 && idx < list.length - 1) {
      openInAppPlayer(list[idx + 1]);
    } else {
      if (typeof window.showToast === 'function') {
        window.showToast('🌸 هەموو وانەکانی ئەم کتێبە تەواو بوون.');
      }
    }
  }

  function playPrevLesson() {
    if (!currentCategory || !currentLesson) return;
    const list = currentCategory.lessons || [];
    const idx = list.findIndex(l => l.id === currentLesson.id);
    if (idx > 0) {
      openInAppPlayer(list[idx - 1]);
    }
  }

  function downloadLessonDirect(lessonId) {
    if (!currentCategory) return;
    const l = (currentCategory.lessons || []).find(item => item.id === lessonId);
    if (!l) return;
    executeDownload(l);
  }

  function downloadCurrentLesson() {
    if (!currentLesson) return;
    executeDownload(currentLesson);
  }

  function executeDownload(l) {
    if (typeof window.showToast === 'function') {
      window.showToast('📥 ئامادەکردنی پەڕەی داگرتنی وانە...');
    }
    // Direct audio/video download URL or YouTube converter link
    const dlLink = l.directAudioUrl || (l.youtubeId ? `https://www.youtube.com/watch?v=${l.youtubeId}` : (currentScholar ? currentScholar.youtubeChannel : ''));
    if (dlLink) {
      window.open(dlLink, '_blank');
    }
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
    openInAppPlayer: openInAppPlayer,
    openInAppPlayerById: openInAppPlayerById,
    closePlayerModal: closeInAppPlayer,
    setPlayerMode: setPlayerMode,
    playNextLesson: playNextLesson,
    playPrevLesson: playPrevLesson,
    downloadCurrentLesson: downloadCurrentLesson,
    downloadLessonDirect: downloadLessonDirect
  };

  window.QuranHujra = QuranHujra;
  window.openHujraLessonsModal = openHujraLessonsModal;

})(window);
