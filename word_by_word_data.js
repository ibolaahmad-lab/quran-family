/**
 * WORT-FÜR-WORT FARB-ÜBERSETZUNGS ENGINE
 * Weist jedem arabischen Wort und seiner deutschen Bedeutung die exakt gleiche Farbe zu!
 */

const WORD_COLORS = [
  { hex: '#f59e0b', bg: 'rgba(245, 158, 11, 0.18)', border: '#f59e0b', name: 'Gold' },
  { hex: '#06b6d4', bg: 'rgba(6, 182, 212, 0.18)', border: '#06b6d4', name: 'Cyan' },
  { hex: '#10b981', bg: 'rgba(16, 185, 129, 0.18)', border: '#10b981', name: 'Smaragd' },
  { hex: '#ec4899', bg: 'rgba(236, 72, 153, 0.18)', border: '#ec4899', name: 'Rose' },
  { hex: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.18)', border: '#8b5cf6', name: 'Lila' },
  { hex: '#f97316', bg: 'rgba(249, 115, 22, 0.18)', border: '#f97316', name: 'Orange' },
  { hex: '#38bdf8', bg: 'rgba(56, 189, 248, 0.18)', border: '#38bdf8', name: 'Blau' },
  { hex: '#eab308', bg: 'rgba(234, 179, 8, 0.18)', border: '#eab308', name: 'Gelb' },
  { hex: '#14b8a6', bg: 'rgba(20, 184, 166, 0.18)', border: '#14b8a6', name: 'Teal' },
  { hex: '#a855f7', bg: 'rgba(168, 85, 247, 0.18)', border: '#a855f7', name: 'Purpur' },
  { hex: '#ef4444', bg: 'rgba(239, 68, 68, 0.18)', border: '#ef4444', name: 'Koralle' },
  { hex: '#84cc16', bg: 'rgba(132, 204, 22, 0.18)', border: '#84cc16', name: 'Limette' }
];

// Statische, exakte Wort-für-Wort Wörterbücher für populäre Suren
const EXACT_WBW_MAP = {
  "1:1": [
    { ar: "بِسْمِ", de: "Im Namen" },
    { ar: "اللَّهِ", de: "Allahs" },
    { ar: "الرَّحْمَٰنِ", de: "des Allerbarmers" },
    { ar: "الرَّحِيمِ", de: "des Barmherzigen" }
  ],
  "1:2": [
    { ar: "الْحَمْدُ", de: "Alles Lob" },
    { ar: "لِلَّهِ", de: "gebührt Allah" },
    { ar: "رَبِّ", de: "dem Herrn" },
    { ar: "الْعَالَمِينَ", de: "der Welten" }
  ],
  "1:3": [
    { ar: "الرَّحْمَٰنِ", de: "dem Allerbarmer" },
    { ar: "الرَّحِيمِ", de: "dem Barmherzigen" }
  ],
  "1:4": [
    { ar: "مَالِكِ", de: "dem Herrscher" },
    { ar: "يَوْمِ", de: "am Tag" },
    { ar: "الدِّينِ", de: "des Gerichts" }
  ],
  "1:5": [
    { ar: "إِيَّاكَ", de: "Dir allein" },
    { ar: "نَعْبُدُ", de: "dienen wir" },
    { ar: "وَإِيَّاكَ", de: "und Dich allein" },
    { ar: "نَسْتَعِينُ", de: "bitten wir um Hilfe" }
  ],
  "1:6": [
    { ar: "اهْدِنَا", de: "Führe uns" },
    { ar: "الصِّرَاطَ", de: "den Weg" },
    { ar: "الْمُسْتَقِيمَ", de: "den geraden" }
  ],
  "1:7": [
    { ar: "صِرَاطَ", de: "den Weg" },
    { ar: "الَّذِينَ", de: "derer" },
    { ar: "أَنْعَمْتَ", de: "denen Du Gnade erwiesen hast" },
    { ar: "عَلَيْهِمْ", de: "ihnen" },
    { ar: "غَيْرِ", de: "nicht derer" },
    { ar: "الْمَغْضُوبِ", de: "die Deinen Zorn erregt haben" },
    { ar: "عَلَيْهِمْ", de: "auf ihnen" },
    { ar: "وَلَا", de: "und nicht" },
    { ar: "الضَّالِّينَ", de: "der Irrenden" }
  ],
  "2:22": [
    { ar: "الَّذِي", de: "Derjenige, Der" },
    { ar: "جَعَلَ", de: "gemacht hat" },
    { ar: "لَكُمُ", de: "für euch" },
    { ar: "الْأَرْضَ", de: "die Erde" },
    { ar: "فِرَاشًا", de: "zur Ruhestätte" },
    { ar: "وَالسَّمَاءَ", de: "und den Himmel" },
    { ar: "بِنَاءً", de: "zu einem Gewölbe" },
    { ar: "وَأَنْزَلَ", de: "und herabgesandt hat" },
    { ar: "مِنَ", de: "aus" },
    { ar: "السَّمَاءِ", de: "dem Himmel" },
    { ar: "مَاءً", de: "Wasser" },
    { ar: "فَأَخْرَجَ", de: "und damit hervorgebracht hat" },
    { ar: "بِهِ", de: "durch es" },
    { ar: "مِنَ", de: "von" },
    { ar: "الثَّمَرَاتِ", de: "den Früchten" },
    { ar: "رِزْقًا", de: "als Versorgung" },
    { ar: "لَكُمْ", de: "für euch" },
    { ar: "فَلَا", de: "so setzt nicht" },
    { ar: "تَجْعَلُوا", de: "macht nicht" },
    { ar: "لِلَّهِ", de: "für Allah" },
    { ar: "أَنْدَادًا", de: "Teilhaber / Partner" },
    { ar: "وَأَنْتُمْ", de: "wo ihr doch" },
    { ar: "تَعْلَمُونَ", de: "es wisst!" }
  ]
};

/**
 * Erzeugt Wort-für-Wort Zuordnung mit exakt gleichen Farben
 */
function getWordByWordPairs(surahNum, ayahNum, ayahAr, ayahDe) {
  const key = `${surahNum}:${ayahNum}`;
  if (EXACT_WBW_MAP[key]) {
    return EXACT_WBW_MAP[key].map((item, idx) => ({
      ar: item.ar,
      de: item.de,
      color: WORD_COLORS[idx % WORD_COLORS.length]
    }));
  }

  // Für alle anderen Verse: Intelligente Aufteilung
  const cleanAr = typeof cleanQuranText === 'function' ? cleanQuranText(ayahAr) : ayahAr;
  const arWords = cleanAr.split(/\s+/).filter(w => w.length > 0);
  
  // Deutsche Wörter / Segmente
  const deTokens = (ayahDe || '').split(/\s+/).filter(w => w.length > 0);
  
  const pairs = [];
  const total = arWords.length;
  
  if (total === 0) return [];
  
  // Verhältnis berechnen für deutsche Wörterverteilung
  const dePerAr = deTokens.length / total;

  for (let i = 0; i < total; i++) {
    const start = Math.floor(i * dePerAr);
    const end = Math.floor((i + 1) * dePerAr);
    const deChunk = deTokens.slice(start, Math.max(end, start + 1)).join(' ') || (deTokens[i] || '—');
    
    pairs.push({
      ar: arWords[i],
      de: deChunk,
      color: WORD_COLORS[i % WORD_COLORS.length]
    });
  }

  return pairs;
}

/**
 * Erzeugt HTML für interaktive Wort-für-Wort-Anzeige mit identischen Farben
 */
function renderWordByWordHtml(pairs, verseUniqueId) {
  if (!pairs || !pairs.length) return '';

  let html = `<div class="wbw-container" id="wbw-${verseUniqueId}" style="display: flex; flex-wrap: wrap; gap: 8px; direction: rtl; justify-content: flex-start; margin-top: 12px; margin-bottom: 14px;">`;

  pairs.forEach((p, idx) => {
    html += `
      <div class="wbw-chip" style="background: ${p.color.bg}; border: 1.5px solid ${p.color.border}; border-radius: 12px; padding: 6px 12px; text-align: center; cursor: pointer; transition: all 0.2s;" onmouseenter="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px ${p.color.border}';" onmouseleave="this.style.transform='none'; this.style.boxShadow='none';">
        <div style="font-family: var(--quran-font); font-size: 1.45rem; color: ${p.color.hex}; line-height: 1.4; font-weight: 700;">
          ${p.ar}
        </div>
        <div style="direction: ltr; font-size: 0.8rem; font-weight: 800; color: ${p.color.hex}; margin-top: 2px;">
          ${p.de}
        </div>
      </div>
    `;
  });

  html += `</div>`;
  return html;
}
