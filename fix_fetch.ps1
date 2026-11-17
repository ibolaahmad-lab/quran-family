# Replace fetchPageFromApi to use local data in index.html
$file = 'C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster\index.html'
$lines = [System.IO.File]::ReadAllLines($file, [System.Text.Encoding]::UTF8)

$newFunc = @'
// Fetch page data - uses local QURAN_ALL_PAGES (no API needed)
async function fetchPageFromApi(pageNum) {
  // Use embedded offline data (quran_all_pages.js)
  if (typeof QURAN_ALL_PAGES !== 'undefined' && QURAN_ALL_PAGES[pageNum] && QURAN_ALL_PAGES[pageNum].length > 0) {
    return QURAN_ALL_PAGES[pageNum].map(v => ({
      num: v.num,
      globalNum: v.globalNum,
      surahNum: v.surahNum,
      surahAr: v.surahAr,
      surahDe: v.surahDe,
      juz: v.juz,
      hizbQuarter: v.hizbQuarter,
      ar: (typeof cleanQuranText === 'function') ? cleanQuranText(v.ar) : v.ar,
      de: v.de,
      ku: v.ku || '',
      tafsir: v.tafsir || ''
    }));
  }
  // Fallback: try API if local data missing
  try {
    const [resAr, resDe] = await Promise.all([
      fetch('https://api.alquran.cloud/v1/page/' + pageNum + '/quran-uthmani').then(r => r.json()).catch(() => null),
      fetch('https://api.alquran.cloud/v1/page/' + pageNum + '/de.bubenheim').then(r => r.json()).catch(() => null)
    ]);
    const arAyahs = (resAr && resAr.code === 200 && resAr.data && resAr.data.ayahs) ? resAr.data.ayahs : [];
    const deAyahs = (resDe && resDe.code === 200 && resDe.data && resDe.data.ayahs) ? resDe.data.ayahs : [];
    if (arAyahs.length > 0) {
      return arAyahs.map((a, idx) => ({
        num: a.numberInSurah, globalNum: a.number, surahNum: a.surah.number,
        surahAr: a.surah.name, surahDe: a.surah.englishName,
        juz: a.juz, hizbQuarter: a.hizbQuarter,
        ar: cleanQuranText(a.text), de: deAyahs[idx] ? deAyahs[idx].text : '',
        ku: '', tafsir: ''
      }));
    }
  } catch (err) { console.warn("API fallback error:", err); }
  return [];
}
'@

$newLines = $newFunc -split "`n"

# Lines 4453-4524 (1-based) = index 4452-4523 (0-based)
$before = $lines[0..4451]
$after = $lines[4524..($lines.Length - 1)]

$all = $before + $newLines + $after
[System.IO.File]::WriteAllText($file, ($all -join "`r`n"), (New-Object System.Text.UTF8Encoding($false)))
Write-Host "Done. Lines before: $($lines.Length), after: $($all.Length)"
