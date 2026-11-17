$path = "C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster\index.html"
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

# 1. Update inspectAyah in index.html to update the interactive Mushaf highlight in real time!
$oldInspect = @"
  // Active pill highlight

  document.querySelectorAll('.ayah-pill-btn').forEach(el => el.classList.remove('active'));

  const activePill = document.getElementById(`ayah-pill-${v.surahNum}-${v.num}`);

  if (activePill) {

    activePill.classList.add('active');

    activePill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

  }
"@

$newInspect = @"
  // Active pill highlight
  document.querySelectorAll('.ayah-pill-btn').forEach(el => el.classList.remove('active'));
  const activePill = document.getElementById(`ayah-pill-${v.surahNum}-${v.num}`);
  if (activePill) {
    activePill.classList.add('active');
    activePill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }

  // Live real-time highlight on the top Interactive Muṣḥaf Page
  document.querySelectorAll('.mushaf-interactive-verse').forEach((el, i) => {
    el.classList.toggle('active-mushaf-highlight', i === idx);
  });
  if (typeof updateActiveAyahHifzBtnState === 'function') {
    updateActiveAyahHifzBtnState();
  }
"@

# 2. Fix playNextVerse to NEVER skip pages (step 1 page sequentially, never skipping to Ayah 6!)
$oldPlayNext = @"
function playNextVerse() {

  if (currentVerseIdx < currentVersesData.length - 1) {

    playVerseAt(currentVerseIdx + 1);

  } else if (currentPage < 604) {

    turnPage(1);

    setTimeout(() => playVerseAt(0), 1200);

  } else {
"@

$newPlayNext = @"
function playNextVerse() {
  if (currentVerseIdx < currentVersesData.length - 1) {
    playVerseAt(currentVerseIdx + 1);
  } else if (currentPage < 604) {
    // ALWAYS step to exact next page (currentPage + 1), never skip!
    const nextP = currentPage + 1;
    loadPage(nextP).then(() => {
      setTimeout(() => playVerseAt(0), 400);
    });
  } else {
"@

# 3. Update Tafsir selector buttons in Tab 4
$oldTafsirPills = @"
          <!-- Tafsir Selector Pills -->

          <div style="display: flex; gap: 10px; flex-wrap: wrap; border-top: 1px solid rgba(229,184,76,0.25); padding-top: 14px;">

            <button class="tafsir-pill-btn active" id="tafsirBtnIbnKathir" onclick="selectTafsirEdition('ibnkathir')">

              <i class="fa-solid fa-book-journal-whills"></i> 1. Tafsīr Ibn Kathīr

            </button>

            <button class="tafsir-pill-btn" id="tafsirBtnSaddi" onclick="selectTafsirEdition('saddi')">

              <i class="fa-solid fa-heart"></i> 2. Tafsīr As-Sa'dī (Spirituell &amp; Klar)

            </button>

            <button class="tafsir-pill-btn" id="tafsirBtnSimple" onclick="selectTafsirEdition('simple')">

              <i class="fa-solid fa-lightbulb"></i> 3. Einfache Erklärung mit Beispielen

            </button>
"@

$newTafsirPills = @"
          <!-- Tafsir Selector Pills -->
          <div style="display: flex; gap: 10px; flex-wrap: wrap; border-top: 1px solid rgba(229,184,76,0.25); padding-top: 14px;">
            <button class="tafsir-pill-btn active" id="tafsirBtnAll" onclick="selectTafsirEdition('all')">
              <i class="fa-solid fa-layer-group"></i> Alle Abschnitte (Vollständig)
            </button>
            <button class="tafsir-pill-btn" id="tafsirBtnIbnKathir" onclick="selectTafsirEdition('ibnkathir')">
              <i class="fa-solid fa-book-journal-whills"></i> 1. Ibn Kathīr &amp; Dschalālain
            </button>
            <button class="tafsir-pill-btn" id="tafsirBtnSaddi" onclick="selectTafsirEdition('saddi')">
              <i class="fa-solid fa-heart"></i> 2. As-Sa'dī (Spirituell)
            </button>
            <button class="tafsir-pill-btn" id="tafsirBtnSimple" onclick="selectTafsirEdition('simple')">
              <i class="fa-solid fa-lightbulb"></i> 3. Einfache Erklärung &amp; Beispiele
            </button>
            <button class="tafsir-pill-btn" id="tafsirBtnAsbab" onclick="selectTafsirEdition('asbab')">
              <i class="fa-solid fa-scroll"></i> 4. Asbāb an-Nuzūl (شأن نزول)
            </button>
"@

$normContent = $content.Replace("`r`n", "`n")
$normOldInspect = $oldInspect.Replace("`r`n", "`n")
$normNewInspect = $newInspect.Replace("`r`n", "`n")
$normOldPlayNext = $oldPlayNext.Replace("`r`n", "`n")
$normNewPlayNext = $newPlayNext.Replace("`r`n", "`n")
$normOldTafsirPills = $oldTafsirPills.Replace("`r`n", "`n")
$normNewTafsirPills = $newTafsirPills.Replace("`r`n", "`n")

if ($normContent.Contains($normOldInspect)) {
    $normContent = $normContent.Replace($normOldInspect, $normNewInspect)
    Write-Host "inspectAyah updated."
} else {
    Write-Host "inspectAyah pattern not found."
}

if ($normContent.Contains($normOldPlayNext)) {
    $normContent = $normContent.Replace($normOldPlayNext, $normNewPlayNext)
    Write-Host "playNextVerse updated."
} else {
    Write-Host "playNextVerse pattern not found."
}

if ($normContent.Contains($normOldTafsirPills)) {
    $normContent = $normContent.Replace($normOldTafsirPills, $normNewTafsirPills)
    Write-Host "Tafsir pills updated."
} else {
    Write-Host "Tafsir pills pattern not found."
}

[System.IO.File]::WriteAllText($path, $normContent.Replace("`n", "`r`n"), [System.Text.Encoding]::UTF8)
Write-Host "index.html successfully updated!"
