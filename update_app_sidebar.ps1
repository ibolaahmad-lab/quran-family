$appJs = [System.IO.File]::ReadAllText("C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster\app.js")

$helperFunctions = @'
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
  const el = document.getElementById('allSurahsSelect') || document.getElementById('navSurahSelect');
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
  const el = document.getElementById('pageNumberInput') || document.getElementById('navPageInput');
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
  updateDockDisplay();
  if (state.activeTab === 'repetition') renderRepetitionDisplay();
  showToast(`Wiederholungen pro Vers: ${count === 999 ? 'Unendlich (∞)' : count + '×'}`);
}
window.setRepeatCount = setRepeatCount;
window.setRepeatLoopCount = setRepeatCount;
window.setRepeatLoopTarget = setRepeatCount;

function onQariChanged() {
  const el = document.getElementById('qariSelect') || document.getElementById('dockQariSelect');
  if (el) {
    state.qari = el.value;
    const dEl = document.getElementById('dockQariSelect');
    if (dEl) dEl.value = el.value;
    const sEl = document.getElementById('qariSelect');
    if (sEl) sEl.value = el.value;
    showToast(`Rezitator geändert: ${el.options[el.selectedIndex].text}`);
    if (state.isPlaying) playAyahAt(state.currentAyahIdx);
  }
}
window.onQariChanged = onQariChanged;

function changeSpeed() {
  const el = document.getElementById('audioSpeedSelect') || document.getElementById('dockSpeedSelect');
  if (el) {
    state.speed = parseFloat(el.value);
    audio.playbackRate = state.speed;
    const dEl = document.getElementById('dockSpeedSelect');
    if (dEl) dEl.value = el.value;
    const sEl = document.getElementById('audioSpeedSelect');
    if (sEl) sEl.value = el.value;
    showToast(`Geschwindigkeit: ${state.speed}×`);
  }
}
window.changeSpeed = changeSpeed;

function switchMainTab(name) {
  const map = {
    mushaf: 'mushaf',
    hifz: 'wordStudio',
    mic: 'micTest',
    tafsir: 'tafsir',
    memorized: 'hifzArchive',
    repeat: 'repetition'
  };
  const target = map[name] || name;
  switchTab(target);
}
window.switchMainTab = switchMainTab;
'@

# Update loadPage to sync sidebar controls
$oldLoadPageInputs = @'
  // Update Navigation Bar inputs
  const pInput = document.getElementById('navPageInput');
  if (pInput) pInput.value = state.currentPage;
  const sSelect = document.getElementById('navSurahSelect');
  if (sSelect) sSelect.value = state.currentSurah;
  const juzBadge = document.getElementById('navJuzBadge');
  if (juzBadge) juzBadge.textContent = `Juz ${getJuzForPage(state.currentPage)}`;
'@

$newLoadPageInputs = @'
  // Update Navigation Bar & Sidebar inputs
  const pInput = document.getElementById('navPageInput');
  if (pInput) pInput.value = state.currentPage;
  const pInput2 = document.getElementById('pageNumberInput');
  if (pInput2) pInput2.value = state.currentPage;

  const sSelect = document.getElementById('navSurahSelect');
  if (sSelect) sSelect.value = state.currentSurah;
  const sSelect2 = document.getElementById('allSurahsSelect');
  if (sSelect2) sSelect2.value = state.currentSurah;

  const juzBadge = document.getElementById('navJuzBadge');
  if (juzBadge) juzBadge.textContent = `Juz ${getJuzForPage(state.currentPage)}`;
  const juzBadge2 = document.getElementById('sidebarJuzBadge');
  if (juzBadge2) juzBadge2.textContent = `Juz ${getJuzForPage(state.currentPage)}`;
'@

if ($appJs.Contains($oldLoadPageInputs)) {
  $appJs = $appJs.Replace($oldLoadPageInputs, $newLoadPageInputs)
  Write-Output "Updated loadPage input syncing"
}

# Update DOMContentLoaded to populate both surah dropdowns
$oldDomPop = @'
  // Populate Navigation Surahs
  const navSel = document.getElementById('navSurahSelect');
  if (navSel && typeof ALL_114_SURAHS !== 'undefined') {
    navSel.innerHTML = '';
    ALL_114_SURAHS.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = `${s.id}. ${s.name} (${s.arabic})`;
      navSel.appendChild(opt);
    });
  }
'@

$newDomPop = @'
  // Populate Navigation & Sidebar Surahs
  ['navSurahSelect', 'allSurahsSelect'].forEach(selId => {
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
'@

if ($appJs.Contains($oldDomPop)) {
  $appJs = $appJs.Replace($oldDomPop, $newDomPop)
  Write-Output "Updated DOMContentLoaded surah populating"
}

# Add helper functions before DOMContentLoaded
$domPos = $appJs.IndexOf("// 15. INITIALIZATION ON DOM LOAD")
if ($domPos -gt 0) {
  $appJs = $appJs.Insert($domPos, $helperFunctions + "`n`n")
  Write-Output "Inserted helper functions before DOMContentLoaded"
}

[System.IO.File]::WriteAllText("C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster\app.js", $appJs, [System.Text.Encoding]::UTF8)
Write-Output "Saved updated app.js. Size: $((Get-Item 'C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster\app.js').Length) bytes"
