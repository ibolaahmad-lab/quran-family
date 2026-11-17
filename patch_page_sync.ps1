$path = "C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster\index.html"
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

# 1. Update loadPage
$loadPattern = 'async function loadPage\(pageNum\)\s*\{[\s\S]*?renderAllViews\(\);[\s\S]*?updateDockDisplay\(\);[\s\S]*?testVerseIdx = 0;[\s\S]*?if \(typeof initCumulativeMushaf === ''function''\)[^\n]*\r?\n'

$newLoad = @"
async function loadPage(pageNum) {
  currentPage = Math.max(1, Math.min(604, pageNum));

  const pageInput = document.getElementById('pageNumberInput');
  if (pageInput) pageInput.value = currentPage;
  const reciteInput = document.getElementById('recitePageSearchInput');
  if (reciteInput) reciteInput.value = currentPage;

  currentVerseIdx = 0;
  currentIteration = 1;

  // 1. Update the High-Resolution Authentic Medina Mushaf Book Scan
  renderMushafScanSheets();

  // Show immediate loading indicator in interactive mushaf
  const interContainer = document.getElementById('mushafInteractiveContent');
  if (interContainer && (!PAGE_CACHE[currentPage] || !PAGE_CACHE[currentPage].length)) {
    const toAr = (typeof toArabicDigits === 'function') ? toArabicDigits : (n) => String(n);
    interContainer.innerHTML = ``<div class="mushaf-page-card" style="display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:420px; text-align:center;"><div style="font-size: 1.35rem; color: #b45309; font-weight: 800; margin-bottom: 10px;">📖 Seite `${currentPage} (`${toAr(currentPage)}) wird geladen...</div><div style="color: #64748b; font-size: 0.95rem;">Verse werden vorbereitet...</div></div>``;
  }

  // 2. Fetch Text & Verse metadata
  if (PAGE_CACHE[currentPage]) {
    currentVersesData = PAGE_CACHE[currentPage];
  } else {
    currentVersesData = await fetchPageFromApi(currentPage);
    PAGE_CACHE[currentPage] = currentVersesData;
  }

  if (currentVersesData && currentVersesData.length > 0) {
    currentSurah = currentVersesData[0].surahNum || currentSurah;
    cleanFirstAyahBismillah();
  }

  renderAllViews();
  updateDockDisplay();
  testVerseIdx = 0;
  if (typeof initCumulativeMushaf === 'function') { initCumulativeMushaf(); } else { resetMicTestDisplay(); }
  if (typeof renderInteractiveMushafPage === 'function') { renderInteractiveMushafPage(); }

"@

if ($content -match $loadPattern) {
    $content = [System.Text.RegularExpressions.Regex]::Replace($content, $loadPattern, $newLoad)
    Write-Output "loadPage updated!"
} else {
    Write-Error "loadPattern not found!"
}

# 2. Update renderAllViews
$renderPattern = 'function renderAllViews\(\)\s*\{[\s\S]*?inspectAyah\(0\);\s*\}'
$newRender = @"
function renderAllViews() {
  renderAyahPills();
  renderVerseCards();
  renderTafsirView();
  if (typeof renderInteractiveMushafPage === 'function') {
    renderInteractiveMushafPage();
  }
  inspectAyah(0);
}
"@

if ($content -match $renderPattern) {
    $content = [System.Text.RegularExpressions.Regex]::Replace($content, $renderPattern, $newRender)
    Write-Output "renderAllViews updated!"
} else {
    Write-Error "renderPattern not found!"
}

[System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8)
Write-Output "File saved successfully!"
