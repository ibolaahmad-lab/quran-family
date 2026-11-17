$path = "C:\Users\Ibo\.gemini\antigravity\scratch\QuranHifzMaster\index.html"
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

$fetchPattern = '(?s)const arAyahs = \(resArCloud && resArCloud\.code === 200\) \? resArCloud\.data\.ayahs : \[\];.*?return arAyahs\.map'

$newFetchMiddle = @"
let arAyahs = (resArCloud && resArCloud.code === 200 && resArCloud.data && resArCloud.data.ayahs) ? resArCloud.data.ayahs : [];
    let deAyahs = (resDeCloud && resDeCloud.code === 200 && resDeCloud.data && resDeCloud.data.ayahs) ? resDeCloud.data.ayahs : [];

    if (arAyahs.length === 0) {
      try {
        const resFallback = await fetch(`https://api.quran.com/api/v4/verses/by_page/` + pageNum + `?words=false&translations=131&fields=text_uthmani`).then(r => r.json()).catch(() => null);
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
              surahAr: sRaw ? sRaw.arabic : (`Sure ` + sNum),
              surahDe: sRaw ? sRaw.name : (`Sure ` + sNum),
              juz: v.juz_number || 1,
              hizbQuarter: v.hizb_number || 1,
              ar: cleanQuranText(v.text_uthmani),
              de: (v.translations && v.translations[0]) ? v.translations[0].text.replace(/<[^>]*>/g, '') : '',
              ku: '',
              tafsir: ''
            };
          });
        }
      } catch (fbErr) {
        console.warn("Fallback fetch error:", fbErr);
      }
    }

    return arAyahs.map
"@

if ($content -match $fetchPattern) {
    $content = [System.Text.RegularExpressions.Regex]::Replace($content, $fetchPattern, $newFetchMiddle)
    [System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8)
    Write-Output "fetchPageFromApi updated with fallback!"
} else {
    Write-Output "fetchPattern not matched, already up to date or different pattern."
}
