import re

path = r"C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster\index.html"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update loadPage
load_page_pattern = r"async function loadPage\(pageNum\)\s*\{[\s\S]*?renderAllViews\(\);[\s\S]*?updateDockDisplay\(\);[\s\S]*?testVerseIdx = 0;[\s\S]*?if \(typeof initCumulativeMushaf === 'function'\)[^\n]*\n"

new_load_page = """async function loadPage(pageNum) {
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
    interContainer.innerHTML = `
      <div class="mushaf-page-card" style="display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:420px; text-align:center;">
        <div style="font-size: 1.35rem; color: #b45309; font-weight: 800; margin-bottom: 10px;">
          📖 Seite ${currentPage} (${toAr(currentPage)}) wird geladen...
        </div>
        <div style="color: #64748b; font-size: 0.95rem;">
          Verse werden vorbereitet...
        </div>
      </div>
    `;
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
"""

assert re.search(load_page_pattern, content), "load_page_pattern not found"
content = re.sub(load_page_pattern, new_load_page, content, count=1)

# 2. Update renderAllViews
render_all_pattern = r"function renderAllViews\(\)\s*\{[\s\S]*?inspectAyah\(0\);\s*\}"
new_render_all = """function renderAllViews() {
  renderAyahPills();
  renderVerseCards();
  renderTafsirView();
  if (typeof renderInteractiveMushafPage === 'function') {
    renderInteractiveMushafPage();
  }
  inspectAyah(0);
}"""

assert re.search(render_all_pattern, content), "render_all_pattern not found"
content = re.sub(render_all_pattern, new_render_all, content, count=1)

# 3. Update fetchPageFromApi with Quran.com API fallback
fetch_api_pattern = r"async function fetchPageFromApi\(pageNum\)\s*\{[\s\S]*?return arAyahs\.map\([\s\S]*?\}\);\s*\}\s*catch\s*\(err\)\s*\{[\s\S]*?return \[\];\s*\}\s*\}"
new_fetch_api = """async function fetchPageFromApi(pageNum) {
  try {
    const [resArCloud, resDeCloud] = await Promise.all([
      fetch(`https://api.alquran.cloud/v1/page/${pageNum}/quran-uthmani`).then(r => r.json()).catch(() => null),
      fetch(`https://api.alquran.cloud/v1/page/${pageNum}/de.bubenheim`).then(r => r.json()).catch(() => null)
    ]);

    let arAyahs = (resArCloud && resArCloud.code === 200 && resArCloud.data && resArCloud.data.ayahs) ? resArCloud.data.ayahs : [];
    let deAyahs = (resDeCloud && resDeCloud.code === 200 && resDeCloud.data && resDeCloud.data.ayahs) ? resDeCloud.data.ayahs : [];

    if (arAyahs.length === 0) {
      const resFallback = await fetch(`https://api.quran.com/api/v4/verses/by_page/${pageNum}?words=false&translations=131&fields=text_uthmani`).then(r => r.json()).catch(() => null);
      if (resFallback && resFallback.verses && resFallback.verses.length > 0) {
        return resFallback.verses.map(v => {
          const parts = v.verse_key.split(':').map(Number);
          const sNum = parts[0];
          const aNum = parts[1];
          const sRaw = (typeof ALL_114_SURAHS !== 'undefined' && ALL_114_SURAHS[sNum - 1]) ? ALL_114_SURAHS[sNum - 1] : null;
          return {
            num: aNum,
            globalNum: v.id,
            surahNum: sNum,
            surahAr: sRaw ? sRaw.arabic : `Sure ${sNum}`,
            surahDe: sRaw ? sRaw.name : `Sure ${sNum}`,
            juz: v.juz_number || 1,
            hizbQuarter: v.hizb_number || 1,
            ar: cleanQuranText(v.text_uthmani),
            de: (v.translations && v.translations[0]) ? v.translations[0].text.replace(/<[^>]*>/g, '') : '',
            ku: '',
            tafsir: ''
          };
        });
      }
    }

    return arAyahs.map((a, idx) => ({
      num: a.numberInSurah,
      globalNum: a.number,
      surahNum: a.surah.number,
      surahAr: a.surah.name,
      surahDe: a.surah.englishName,
      juz: a.juz,
      hizbQuarter: a.hizbQuarter,
      ar: cleanQuranText(a.text),
      de: deAyahs[idx] ? deAyahs[idx].text : '',
      ku: '',
      tafsir: ''
    }));
  } catch (err) {
    console.warn("Fetch page error:", err);
    return [];
  }
}"""

assert re.search(fetch_api_pattern, content), "fetch_api_pattern not found"
content = re.sub(fetch_api_pattern, new_fetch_api, content, count=1)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("SUCCESS: index.html patched successfully!")
