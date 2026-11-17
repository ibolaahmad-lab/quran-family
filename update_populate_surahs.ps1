$filePath = 'C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster\index.html'
$lines = [System.IO.File]::ReadAllLines($filePath, [System.Text.Encoding]::UTF8)

$start = -1
$end = -1
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match '^function populateSurahsDropdown\(\)') {
        $start = $i
    }
    if ($start -ge 0 -and $lines[$i] -match '^\}$') {
        $end = $i
        break
    }
}

Write-Output "Replacing lines $start to $end"

$newCode = @"
function populateSurahsDropdown() {
  const sel = document.getElementById('allSurahsSelect');
  const tafsirSel = document.getElementById('tafsirSurahSelect');
  const list = (typeof ALL_114_SURAHS !== 'undefined') ? ALL_114_SURAHS : [];

  if (sel) {
    sel.innerHTML = '';
    list.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = `${s.id}. ${s.name} (${s.arabic})`;
      sel.appendChild(opt);
    });
  }

  if (tafsirSel) {
    tafsirSel.innerHTML = '';
    list.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = `${s.id}. ${s.name} (${s.arabic}) - ${s.versesCount} Verse`;
      tafsirSel.appendChild(opt);
    });
    tafsirSel.value = (typeof currentSurah !== 'undefined' && currentSurah) ? currentSurah : 1;
    if (typeof updateTafsirAyahOptions === 'function') {
      updateTafsirAyahOptions();
    }
  }
}
"@

$newLines = [System.Collections.Generic.List[string]]::new()
for ($i = 0; $i -lt $start; $i++) {
    $newLines.Add($lines[$i])
}
$newLines.Add($newCode)
for ($i = $end + 1; $i -lt $lines.Count; $i++) {
    $newLines.Add($lines[$i])
}

[System.IO.File]::WriteAllLines($filePath, $newLines, [System.Text.Encoding]::UTF8)
Write-Output "Successfully updated populateSurahsDropdown in index.html"
