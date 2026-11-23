/**
 * QURAN ULTIMATE v3.0 - PLATFORM EXTENSIONS ENGINE (REBUILT FOR 100% RELIABILITY)
 * Powers: Dedicated Panes for Tajweed, Dictionary, Khatm Planner,
 * Dhikr & Dua, Bookmarks, Universal Search, Tafsir Nami Book/PDF Reader,
 * Daily Verse, and Bottom Navigation Back Button.
 * Strictly Trilingual: German (DE), English (EN), Kurdish Sorani (KU).
 * Zero Persian UI text. Original Arabic text untouched.
 */

// ============================================================
// 1. CURATED AUTHENTIC QURANIC VERSES FOR DAILY INSPIRATION
// ============================================================
const AYAT_AL_KURSI_PARTS = [
  {
    start: 0,
    end: 7.2,
    arabic: "ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ ٱلۡحَىُّ ٱلۡقَيُّومُ ۚ",
    de: "Allah – es gibt keinen Gott außer Ihm, dem Lebendigen und Beständigen.",
    fa: "خداوند، هیچ معبودی جز او نیست؛ زنده و پایدار است؛",
    ku: "خوای گەورە هیچ پەرستراوێک نییە بێجگە لە ئەو، کە هەمیشە زیندووە و بەڕێوەبەرە؛",
    en: "Allah - there is no deity except Him, the Ever-Living, the Sustainer of all existence."
  },
  {
    start: 7.2,
    end: 12.8,
    arabic: "لَا تَأۡخُذُهُۥ سِنَةٌۭ وَلَا نَوۡمٌۭ ۚ",
    de: "Ihn überkommt weder Schlummer noch Schlaf.",
    fa: "نه خوابی سبک او را فرو می‌گیرد و نه خوابی سنگین؛",
    ku: "نە وەنەوز دەیگرێت و نە خەو؛",
    en: "Neither drowsiness overtakes Him nor sleep."
  },
  {
    start: 12.8,
    end: 19.4,
    arabic: "لَّهُۥ مَا فِى ٱلسَّمَٰوَٰتِ وَمَا فِى ٱلۡأَرۡضِ ۗ",
    de: "Ihm gehört (alles), was in den Himmeln und was auf der Erde ist.",
    fa: "از آنِ اوست آنچه در آسمان‌ها و آنچه در زمین است؛",
    ku: "هەرچی لە ئاسمانەکان و زەویدایە هەر بۆ ئەوە؛",
    en: "To Him belongs whatever is in the heavens and whatever is on the earth."
  },
  {
    start: 19.4,
    end: 26.2,
    arabic: "مَن ذَا ٱلَّذِى يَشۡفَعُ عِندَهُۥٓ إِلَّا بِإِذۡنِهِۦ ۚ",
    de: "Wer ist es denn, der bei Ihm Fürsprache einlegen könnte – außer mit Seiner Erlaubnis?",
    fa: "کیست که در نزد او، جز به فرمانش شفاعت کند؟",
    ku: "کێیە بتوانێت تکا بکات لەلای بەبێ مۆڵەتی خۆی؟",
    en: "Who is it that can intercede with Him except by His permission?"
  },
  {
    start: 26.2,
    end: 32.4,
    arabic: "يَعۡلَمُ مَا بَيۡنَ أَيۡدِيهِمۡ وَمَا خَلۡفَهُمۡ ۖ",
    de: "Er weiß, was vor ihnen und was hinter ihnen liegt,",
    fa: "گذشته و آینده بندگان را می‌داند؛",
    ku: "دەزانێت چی لەپێش و چی لەپاشیانە؛",
    en: "He knows what is before them and what will be after them,"
  },
  {
    start: 32.4,
    end: 38.8,
    arabic: "وَلَا يُحِيطُونَ بِشَىۡءٍۢ مِّنۡ عِلۡمِهِۦٓ إِلَّا بِمَا شَآءَ ۚ",
    de: "sie aber umfassen nichts von Seinem Wissen – außer, was Er will.",
    fa: "و آنان به هیچ چیز از علم او احاطه ندارند مگر آنچه را خود بخواهد؛",
    ku: "و بەهیچ شتێک لە زانستی ئەو دەور نادرێت مەگەر بەوەی خۆی بیەوێت؛",
    en: "and they encompass not a thing of His knowledge except for what He wills."
  },
  {
    start: 38.8,
    end: 45.0,
    arabic: "وَسِعَ كُرۡسِيُّهُ ٱلسَّمَٰوَٰتِ وَٱلۡأَرۡضَ ۖ",
    de: "Sein Thronschemel umfasst die Himmel und die Erde,",
    fa: "تخت فرمانروایی او، آسمان‌ها و زمین را فرا گرفته؛",
    ku: "فەرمانڕەوایی و کورسییەکەی ئاسمانەکان و زەوی گرتووەتەوە؛",
    en: "His Kursi extends over the heavens and the earth,"
  },
  {
    start: 45.0,
    end: 52.5,
    arabic: "وَلَا يَـُٔودُهُۥ حِفۡظُهُمَا ۚ وَهُوَ ٱلۡعَلِىُّ ٱلۡعَظِيمُ",
    de: "und ihre Behütung beschwert Ihn nicht. Er ist der Erhabene und Allgewaltige.",
    fa: "و نگاهداری آن دو، بر او گران نمی‌آید؛ و او والامقام و بزرگ‌مرتبه است.",
    ku: "و پاراستنیان لێی گران نییە؛ و ئەو بەرز و پایەدار و گەورەیە.",
    en: "and their preservation tires Him not. And He is the Most High, the Most Great."
  }
];

const DAILY_QURAN_VERSES = [
  {
    surahNo: 2,
    ayahNo: 255,
    surahNameAr: "البقرة",
    surahNameDe: "Al-Baqarah",
    surahNameEn: "Al-Baqarah",
    surahNameKu: "بەقەرە",
    arabic: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ",
    parts: AYAT_AL_KURSI_PARTS,
    de: "Allah – es gibt keinen Gott außer Ihm, dem Lebendigen, dem Beständigen.",
    en: "Allah - there is no deity except Him, the Ever-Living, the Sustainer of all existence.",
    ku: "خوای گەورە ئەو زاتەیە کە هیچ پەرستراوێک نییە شایستەی پەرستن بێت تەنها ئەو نەبێت...",
    fa: "خداوند، هیچ معبودی جز او نیست؛ زنده و پایدار است...",
    audioUrl: "https://everyayah.com/data/Alafasy_128kbps/002255.mp3"
  },
{
    surahNo: 94,
    ayahNo: 5,
    surahNameAr: "الشرح",
    surahNameDe: "Al-Inshirah",
    surahNameEn: "Ash-Sharh",
    surahNameKu: "شەرح",
    arabic: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا ۝ إِنَّ مَعَ الْعُسْرِ يُسْرًا",
    de: "Gewiss, mit der Erschwernis gibt es Erleichterung. Gewiss, mit der Erschwernis gibt es Erleichterung.",
    en: "For indeed, with hardship [will be] ease. Indeed, with hardship [will be] ease.",
    ku: "بێگومان لەگەڵ هەموو تەنگانەیەکدا دڵنیابە فراوانی و ئاسانییەک هەیە.",
    fa: "مسلماً با هر سختی، آسانی است؛ آری مسلماً با هر سختی، آسانی است.",
    audioUrl: "https://everyayah.com/data/Alafasy_128kbps/094005.mp3"
  },
  {
    surahNo: 3,
    ayahNo: 190,
    surahNameAr: "آل عمران",
    surahNameDe: "Al-Imran",
    surahNameEn: "Ali 'Imran",
    surahNameKu: "ئالی عیمران",
    arabic: "إِنَّ فِي خَلْقِ السَّمَاوَاتِ وَالْأَرْضِ وَاخْتِلَافِ اللَّيْلِ وَالنَّهَارِ لَآيَاتٍ لِّأُولِي الْأَلْبَابِ",
    de: "In der Schöpfung der Himmel und der Erde und dem Wechsel von Nacht und Tag liegen wahrlich Zeichen für diejenigen, die Verstand besitzen.",
    en: "Indeed, in the creation of the heavens and the earth and the alternation of the night and the day are signs for those of understanding.",
    ku: "بێگومان لە دروستکردنی ئاسمانەکان و زەویدا، و لە هاتووچۆ و جیاوازی شەو و ڕۆژدا، بەڵگەی زۆر گەورە هەیە بۆ خاوەن بیروهۆشەکان.",
    fa: "مسلماً در آفرینش آسمان‌ها و زمین، و آمد و رفت شب و روز، نشانه‌های روشنی برای خردمندان است.",
    audioUrl: "https://everyayah.com/data/Alafasy_128kbps/003190.mp3"
  },
  {
    surahNo: 39,
    ayahNo: 53,
    surahNameAr: "الزمر",
    surahNameDe: "Az-Zumar",
    surahNameEn: "Az-Zumar",
    surahNameKu: "زومەر",
    arabic: "قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ ۚ إِنَّ اللَّهَ يَغْفِرُ الذُّنُوبَ جَمِيعًا",
    de: "Sprich: O meine Diener, die ihr euch gegen eure eigenen Seelen vergangen habt, verzweifelt nicht an Allahs Barmherzigkeit! Gewiss, Allah vergibt alle Sünden.",
    en: "Say, 'O My servants who have transgressed against themselves, do not despair of the mercy of Allah. Indeed, Allah forgives all sins.'",
    ku: "ئەی پێغەمبەر بڵێ: ئەی بەندەکانم ئەوانەی کە لەسەر خۆتان زیاده‌ڕۆییتان کردووە، لە رەحمەتی خودا بێ‌هیوا مەبن، بێگومان خودا لە هەموو تاوانەکان خۆش دەبێت.",
    fa: "بگو: ای بندگان من که بر خویشتن زیاده‌روی روا داشته‌اید! از رحمت خداوند نومید نشوید که خدا همه گناهان را می‌آمرزد.",
    audioUrl: "https://everyayah.com/data/Alafasy_128kbps/039053.mp3"
  },
  {
    surahNo: 2,
    ayahNo: 152,
    surahNameAr: "البقرة",
    surahNameDe: "Al-Baqarah",
    surahNameEn: "Al-Baqarah",
    surahNameKu: "بەقەرە",
    arabic: "فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ",
    de: "So gedenkt Meiner, damit Ich eurer gedenke; und seid Mir dankbar und seid nicht undankbar!",
    en: "So remember Me; I will remember you. And be grateful to Me and do not deny Me.",
    ku: "کەواتە یادی من بکەن تا منیش یادی ئێوە بکەم، و سوپاسگوزاری من بن و سپڵەیی بەرامبەرم مەکەن.",
    fa: "پس به یاد من باشید تا به یاد شما باشم؛ و مرا شکر گویید و ناسپاسی نکنید.",
    audioUrl: "https://everyayah.com/data/Alafasy_128kbps/002152.mp3"
  }
];

// ============================================================
// 5. GLOBAL STATE & INITIALIZATION
// ============================================================
var dailyVerseIndex = 0;
currentDhikrIndex = 0;
currentDhikrCounter = 0;

var currentDedicatedNamiVol = window.currentDedicatedNamiVol = 1;
var currentDedicatedNamiPage = window.currentDedicatedNamiPage = 1;
const DEDICATED_NAMI_VOLS = {
  1: { maxPage: 576, file: 'TafsirNami_PDFs/tafsir_nami_vol1.pdf', surahs: [1, 9] },
  2: { maxPage: 496, file: 'TafsirNami_PDFs/tafsir_nami_vol2.pdf', surahs: [10, 28] },
  3: { maxPage: 646, file: 'TafsirNami_PDFs/tafsir_nami_vol3.pdf', surahs: [29, 114] }
};

function initQuranUltimate() {
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  dailyVerseIndex = dayOfYear % DAILY_QURAN_VERSES.length;
  renderDailyVerseCard();
  renderContinueReadingCard();
  renderPersonalProgressCard();
}

// ============================================================
// 6. DAILY QURAN VERSE CARD (AUTHENTIC MUSHAF FONT & MULTILINGUAL TYPOGRAPHY)
// ============================================================
let dailyVerseAudioObj = null;
let currentVersePartIdx = 0;

function updateDailyVerseDots(activeIdx, totalParts) {
  const dotsContainer = document.getElementById('dailyVerseDots');
  if (!dotsContainer) return;
  if (!totalParts || totalParts <= 1) {
    dotsContainer.style.display = 'none';
    return;
  }
  dotsContainer.style.display = 'flex';
  let dotsHtml = '';
  for (let i = 0; i < totalParts; i++) {
    const isActive = (i === activeIdx);
    const width = isActive ? '14px' : '5px';
    const bg = isActive ? '#fbbf24' : 'rgba(255, 255, 255, 0.22)';
    dotsHtml += '<span class="dv-dot" style="width: ' + width + '; height: 3.5px; border-radius: 2px; background: ' + bg + '; transition: all 0.3s ease;"></span>';
  }
  dotsContainer.innerHTML = dotsHtml;
}

function applyTranslationTypography(transElem, lang) {
  if (!transElem) return;
  if (lang === 'de' || lang === 'en') {
    transElem.style.fontFamily = "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    transElem.style.fontSize = '0.88rem';
    transElem.style.fontWeight = '600';
    transElem.style.letterSpacing = '0.2px';
    transElem.style.lineHeight = '1.55';
    transElem.style.direction = 'ltr';
    transElem.style.textAlign = 'center';
  } else {
    transElem.style.fontFamily = "var(--kurdish-font), 'Kurdish Font', 'Noto Kufi Arabic', sans-serif";
    transElem.style.fontSize = '0.94rem';
    transElem.style.fontWeight = '500';
    transElem.style.letterSpacing = '0.2px';
    transElem.style.lineHeight = '1.7';
    transElem.style.direction = 'rtl';
    transElem.style.textAlign = 'center';
  }
}

function renderFullDailyVerse(v, partIdx = 0) {
  const textElem = document.getElementById('dailyVerseArabic');
  const transElem = document.getElementById('dailyVerseTranslation');
  if (!v) return;

  const lang = window.currentAppLanguage || 'fa';
  applyTranslationTypography(transElem, lang);

  if (v.parts && v.parts.length > 0) {
    currentVersePartIdx = Math.max(0, Math.min(partIdx, v.parts.length - 1));
    const p = v.parts[currentVersePartIdx];
    if (textElem) {
      textElem.innerHTML = p.arabic;
      textElem.style.fontFamily = "'KFGQPC Uthman Taha Naskh', 'UthmanicHafs', 'UthmanicHafs1Ver18', 'Amiri Quran', serif";
      textElem.style.fontFeatureSettings = "'cv01', 'ss01', 'kern', 'liga'";
      textElem.style.webkitFontFeatureSettings = "'cv01', 'ss01', 'kern', 'liga'";
      textElem.style.textShadow = '0 1px 3px rgba(0, 0, 0, 0.9)';
      textElem.style.color = '#fde68a';
    }
    if (transElem) {
      let tr = p.fa || p.de;
      if (lang === 'ku') tr = p.ku;
      else if (lang === 'en') tr = p.en;
      else if (lang === 'de') tr = p.de;
      transElem.innerHTML = tr;
    }
    updateDailyVerseDots(currentVersePartIdx, v.parts.length);
  } else {
    if (textElem) {
      textElem.innerHTML = v.arabic;
      textElem.style.fontFamily = "'KFGQPC Uthman Taha Naskh', 'UthmanicHafs', 'UthmanicHafs1Ver18', 'Amiri Quran', serif";
      textElem.style.fontFeatureSettings = "'cv01', 'ss01', 'kern', 'liga'";
      textElem.style.webkitFontFeatureSettings = "'cv01', 'ss01', 'kern', 'liga'";
      textElem.style.textShadow = '0 1px 3px rgba(0, 0, 0, 0.9)';
      textElem.style.color = '#fde68a';
    }
    if (transElem) {
      let tr = v.fa || v.de;
      if (lang === 'ku') tr = v.ku;
      else if (lang === 'en') tr = v.en;
      else if (lang === 'de') tr = v.de;
      transElem.innerHTML = tr;
    }
    updateDailyVerseDots(0, 0);
  }
}

function renderDailyVerseCard() {
  if (activeRandomVerse) {
    renderFullDailyVerse(activeRandomVerse, currentVersePartIdx);
    return;
  }
  const v = getCurrentDailyVerse();
  if (!v) return;
  renderFullDailyVerse(v, currentVersePartIdx);
}

function stopDailyVerseAudio() {
  if (dailyVerseAudioObj) {
    dailyVerseAudioObj.pause();
    dailyVerseAudioObj.currentTime = 0;
  }
  const cardEl = document.getElementById('sacredDailyAyahCard');
  if (cardEl) {
    cardEl.style.borderColor = 'rgba(251, 191, 36, 0.28)';
    cardEl.style.boxShadow = '0 12px 30px -8px rgba(0, 0, 0, 0.75)';
  }
  const v = getCurrentDailyVerse();
  currentVersePartIdx = 0;
  if (v) renderFullDailyVerse(v, 0);
}
window.stopDailyVerseAudio = stopDailyVerseAudio;

function toggleDailyVerseAudio() {
  const v = getCurrentDailyVerse();
  if (!v || !v.audioUrl) return;

  if (!dailyVerseAudioObj) {
    dailyVerseAudioObj = new Audio();
    dailyVerseAudioObj.id = 'dailyVerseAudioPlayer';
  }

  const cardEl = document.getElementById('sacredDailyAyahCard');

  if (!dailyVerseAudioObj.paused && dailyVerseAudioObj.src === v.audioUrl) {
    dailyVerseAudioObj.pause();
    if (cardEl) {
      cardEl.style.borderColor = 'rgba(251, 191, 36, 0.28)';
      cardEl.style.boxShadow = '0 12px 30px -8px rgba(0, 0, 0, 0.75)';
    }
  } else {
    dailyVerseAudioObj.src = v.audioUrl;
    dailyVerseAudioObj.play().catch(e => console.log('Audio notice:', e));
    if (cardEl) {
      cardEl.style.borderColor = 'rgba(16, 185, 129, 0.7)';
      cardEl.style.boxShadow = '0 16px 40px -8px rgba(16, 185, 129, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.15)';
    }

    // Synchronize natural recitation phrases seamlessly with audio
    dailyVerseAudioObj.ontimeupdate = () => {
      if (!v.parts || v.parts.length <= 1) return;
      const t = dailyVerseAudioObj.currentTime || 0;
      const dur = dailyVerseAudioObj.duration && !isNaN(dailyVerseAudioObj.duration) ? dailyVerseAudioObj.duration : (v.parts.length * 5);
      
      let matchedIdx = 0;
      // If parts have explicit start timestamps (like Ayat al-Kursi)
      if (v.parts[0].start !== undefined) {
        for (let i = 0; i < v.parts.length; i++) {
          if (t >= v.parts[i].start) {
            matchedIdx = i;
          }
        }
      } else {
        // Auto-distributed parts based on audio progress
        const partDur = dur / v.parts.length;
        matchedIdx = Math.min(v.parts.length - 1, Math.floor(t / partDur));
      }

      if (matchedIdx !== currentVersePartIdx) {
        currentVersePartIdx = matchedIdx;
        const textElem = document.getElementById('dailyVerseArabic');
        const transElem = document.getElementById('dailyVerseTranslation');
        const lang = window.currentAppLanguage || 'fa';

        if (textElem) {
          textElem.style.opacity = '0';
          textElem.style.transform = 'translateY(2px)';
          setTimeout(() => {
            textElem.innerHTML = v.parts[currentVersePartIdx].arabic;
            textElem.style.opacity = '1';
            textElem.style.transform = 'translateY(0)';
          }, 120);
        }
        if (transElem) {
          transElem.style.opacity = '0';
          setTimeout(() => {
            applyTranslationTypography(transElem, lang);
            let tr = v.parts[currentVersePartIdx].fa || v.parts[currentVersePartIdx].de;
            if (lang === 'ku') tr = v.parts[currentVersePartIdx].ku;
            else if (lang === 'en') tr = v.parts[currentVersePartIdx].en;
            else if (lang === 'de') tr = v.parts[currentVersePartIdx].de;
            transElem.innerHTML = tr;
            transElem.style.opacity = '1';
          }, 120);
        }
        updateDailyVerseDots(currentVersePartIdx, v.parts.length);
      }
    };

    dailyVerseAudioObj.onended = () => {
      stopDailyVerseAudio();
    };
  }
}
window.toggleDailyVerseAudio = toggleDailyVerseAudio;
function playDailyVerseAudio() {
  toggleDailyVerseAudio();
}
window.playDailyVerseAudio = playDailyVerseAudio;

function bookmarkDailyVerse() {
  const v = getCurrentDailyVerse();
  if (!v) return;

  let bookmarks = [];
  try {
    bookmarks = JSON.parse(localStorage.getItem('quran_bookmarks') || '[]');
  } catch (e) { bookmarks = []; }

  const exists = bookmarks.some(b => b.surahNo === v.surahNo && b.ayahNo === v.ayahNo);
  if (!exists) {
    bookmarks.push({
      surahNo: v.surahNo,
      ayahNo: v.ayahNo,
      surahName: v.surahNameDe,
      arabic: v.arabic,
      savedAt: new Date().toISOString()
    });
    localStorage.setItem('quran_bookmarks', JSON.stringify(bookmarks));
    alert(window.t ? (window.t('bookmarks_title') + ': Vers gemerkt!') : 'Vers zu Lesezeichen hinzugefügt!');
  } else {
    alert('Dieser Vers ist bereits in den Lesezeichen gespeichert.');
  }
}

function copyDailyVerse() {
  const v = getCurrentDailyVerse();
  if (!v) return;
  const lang = window.currentAppLanguage || 'fa';
  let tr = v.fa || v.de;
  if (lang === 'ku') tr = v.ku;
  else if (lang === 'en') tr = v.en;
  else if (lang === 'de') tr = v.de;

  const textToCopy = v.arabic + '\n' + tr + '\n(' + v.surahNameDe + ' ' + v.surahNo + ':' + v.ayahNo + ')';
  navigator.clipboard.writeText(textToCopy).then(() => {
    alert('Vers kopiert!');
  }).catch(() => {
    prompt('Vers kopieren:', textToCopy);
  });
}


// ============================================================

// ============================================================
// SMART VERSE SPLITTER (ENSURES TRANSLATIONS NEVER EXCEED 2 LINES)
// ============================================================
function splitTextIntoPhrases(text, maxWords) {
  if (!text) return [];
  text = text.trim();
  const words = text.split(/\s+/);
  if (words.length <= maxWords) return [text];

  const phrases = [];
  let current = [];

  for (let i = 0; i < words.length; i++) {
    current.push(words[i]);
    const w = words[i];
    const isPunct = w.endsWith('.') || w.endsWith(';') || w.endsWith('–') || w.endsWith(':') || w.endsWith('،') || w.endsWith('؛') || w.endsWith('ۚ') || w.endsWith('ۗ') || w.endsWith('ۖ');
    if ((isPunct && current.length >= 6) || current.length >= maxWords) {
      phrases.push(current.join(' '));
      current = [];
    }
  }
  if (current.length > 0) {
    if (phrases.length > 0 && current.length < 4) {
      phrases[phrases.length - 1] += ' ' + current.join(' ');
    } else {
      phrases.push(current.join(' '));
    }
  }
  return phrases;
}

function buildAutoPartsForVerse(arabicText, germanText, kurdishText, persianText) {
  const arPhrases = splitTextIntoPhrases(arabicText, 11);
  const dePhrases = splitTextIntoPhrases(germanText, 13);
  const kuPhrases = splitTextIntoPhrases(kurdishText, 12);
  const faPhrases = splitTextIntoPhrases(persianText, 12);

  const maxParts = Math.max(arPhrases.length, dePhrases.length, kuPhrases.length, faPhrases.length);
  if (maxParts <= 1) return null; // Fits naturally in 1-2 lines, no splitting needed!

  const parts = [];
  for (let i = 0; i < maxParts; i++) {
    const arIdx = Math.min(i, arPhrases.length - 1);
    const deIdx = Math.min(i, dePhrases.length - 1);
    const kuIdx = Math.min(i, kuPhrases.length - 1);
    const faIdx = Math.min(i, faPhrases.length - 1);

    parts.push({
      arabic: arPhrases[arIdx] || arabicText,
      de: dePhrases[deIdx] || germanText,
      ku: kuPhrases[kuIdx] || kurdishText,
      fa: faPhrases[faIdx] || persianText,
      en: dePhrases[deIdx] || germanText
    });
  }
  return parts;
}

// DYNAMIC QURAN VERSE EXTRACTOR & SHUFFLER
// ============================================================
function getRandomVerseFromEntireQuran() {
  if (typeof QURAN_ALL_PAGES !== 'undefined') {
    // Pick a random page between 1 and 604
    const randPage = Math.floor(Math.random() * 604) + 1;
    const pageVerses = QURAN_ALL_PAGES[randPage];
    if (pageVerses && pageVerses.length > 0) {
      const v = pageVerses[Math.floor(Math.random() * pageVerses.length)];
      if (v && v.ar) {
        const sPadded = String(v.surahNum).padStart(3, '0');
        const aPadded = String(v.num).padStart(3, '0');

        // Look up Kurdish translation from complete KURDISH_TAFSIR_DATA
        let kurdishText = '';
        if (typeof KURDISH_TAFSIR_DATA !== 'undefined' && KURDISH_TAFSIR_DATA[v.surahNum]) {
          kurdishText = KURDISH_TAFSIR_DATA[v.surahNum][v.num] || '';
        }
        if (!kurdishText && v.ku) kurdishText = v.ku;

        const germanText = v.de || '';
        const arabicText = v.ar || '';
        const persianText = kurdishText || germanText;

        // Automatically split into parts if long, to ensure it never exceeds 2 lines!
        const autoParts = buildAutoPartsForVerse(arabicText, germanText, kurdishText, persianText);

        return {
          surahNo: v.surahNum,
          ayahNo: v.num,
          surahNameAr: v.surahAr || '',
          arabic: arabicText,
          de: germanText,
          en: germanText,
          fa: persianText,
          ku: kurdishText,
          audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/' + sPadded + aPadded + '.mp3',
          parts: autoParts
        };
      }
    }
  }
  return null;
}

let activeRandomVerse = null;

function getCurrentDailyVerse() {
  return activeRandomVerse || DAILY_QURAN_VERSES[dailyVerseIndex] || DAILY_QURAN_VERSES[0];
}


function shuffleNextDailyVerse(btnEl) {
  if (btnEl) {
    const icon = btnEl.querySelector('i');
    if (icon) {
      icon.style.transition = 'transform 0.4s ease';
      icon.style.transform = 'rotate(360deg)';
      setTimeout(() => {
        icon.style.transition = 'none';
        icon.style.transform = 'rotate(0deg)';
      }, 420);
    }
  }

  stopDailyVerseAudio();

  // If user clicks, either cycle through curated inspiring verses OR pick a new verse from entire Quran
  // We cycle through DAILY_QURAN_VERSES and also occasionally draw from entire Quran
  dailyVerseIndex = (dailyVerseIndex + 1);
  if (dailyVerseIndex >= DAILY_QURAN_VERSES.length) {
    const randomV = getRandomVerseFromEntireQuran();
    if (randomV) {
      activeRandomVerse = randomV;
      renderFullDailyVerse(randomV, 0);
      return;
    } else {
      dailyVerseIndex = 0;
    }
  }

  activeRandomVerse = null;
  currentVersePartIdx = 0;
  renderDailyVerseCard();
}
window.shuffleNextDailyVerse = shuffleNextDailyVerse;

function nextDailyVerse() {
  dailyVerseIndex = (dailyVerseIndex + 1) % DAILY_QURAN_VERSES.length;
  stopDailyVerseAudio();
  renderDailyVerseCard();
}

// ============================================================
// 7. CONTINUE READING & PERSONAL STATS
// ============================================================
function renderContinueReadingCard() {
  let savedPos = null;
  try {
    savedPos = JSON.parse(localStorage.getItem('quran_last_position') || 'null');
  } catch (e) {}

  if (!savedPos) {
    const p = parseInt(localStorage.getItem('quran_current_page') || '1', 10);
    const s = parseInt(localStorage.getItem('quran_current_surah') || '1', 10);
    savedPos = { page: p, surah: s, ayah: 1 };
  }

  const curLang = localStorage.getItem('quran_app_language') || (typeof state !== 'undefined' && state.lang) || 'de';
  const isKu = (curLang === 'ku');

  const surahs = (typeof ALL_114_SURAHS !== 'undefined' ? ALL_114_SURAHS : (window.ALL_114_SURAHS || []));
  const sObj = (surahs && surahs[savedPos.surah - 1]) || { arabic: "الفاتحة", germanMeaning: "Die Eröffnung", versesCount: 7 };
  const juz = Math.min(30, Math.max(1, Math.ceil(savedPos.page / 20)));

  const titleEl = document.getElementById('continueSurahName');
  const detailsEl = document.getElementById('continueReadingDetails');
  const juzBadgeEl = document.getElementById('continueJuzBadge');
  const barEl = document.getElementById('continueReadingBar');

  if (titleEl) {
    titleEl.textContent = isKu ? `سوورەتی ${sObj.arabic || 'الفاتحة'}` : `سورة ${sObj.arabic || 'الفاتحة'}`;
  }
  if (detailsEl) {
    detailsEl.textContent = isKu 
      ? `لاپەڕە ${savedPos.page} · ئایەتی ${savedPos.ayah || 1}`
      : `Seite ${savedPos.page} · Vers ${savedPos.ayah || 1}`;
  }
  if (juzBadgeEl) {
    juzBadgeEl.textContent = isKu ? `بەشی ${juz}` : `Juz ${juz}`;
  }

  // Update Dynamic Bilingual Labels for the Twin Stickers
  const readHeader = document.getElementById('stickerReadHeaderLabel');
  if (readHeader) {
    const span = readHeader.querySelector('span');
    if (span) span.textContent = isKu ? 'خوێندنەوە' : 'WEITERLESEN';
  }

  const readAction = document.getElementById('stickerReadActionLabel');
  if (readAction) {
    readAction.textContent = isKu ? 'موسحەف ➔' : 'Muṣḥaf ➔';
  }

  const hifzHeader = document.getElementById('stickerHifzHeaderLabel');
  if (hifzHeader) {
    const span = hifzHeader.querySelector('span');
    if (span) span.textContent = isKu ? 'حفز و خەتم' : 'HIFZ & KHATM';
  }

  const hifzAction = document.getElementById('stickerHifzActionLabel');
  if (hifzAction) {
    hifzAction.textContent = isKu ? 'ستۆدیۆی لەبەرکردن ➔' : 'Hifz Studio ➔';
  }

  const hifzTitle = document.getElementById('stickerHifzFortschrittTitle');
  if (hifzTitle) {
    hifzTitle.textContent = isKu ? 'پێشکەوتن' : 'Fortschritt';
  }

  const hifzSub = document.getElementById('stickerHifzSubLabel');
  if (hifzSub) {
    hifzSub.textContent = isKu ? 'لەبەرکراو و خوێندراوە' : 'Gelernt & Gelesen';
  }

  // Calculate Hifz / Khatm Completion Percentage & Update Radial Ring
  let hifzCount = 0;
  try {
    if (typeof getAllMemorizedVerses === 'function') {
      hifzCount = getAllMemorizedVerses().length;
    } else {
      for (let k of Object.keys(localStorage)) {
        if (k.startsWith('hifz_')) {
          const obj = JSON.parse(localStorage.getItem(k) || '{}');
          hifzCount += Object.values(obj).filter(Boolean).length;
        }
      }
    }
  } catch (e) {}

  let khatmPage = 1;
  try {
    const kObj = JSON.parse(localStorage.getItem('quran_simple_khatm_v4') || localStorage.getItem('quran_simple_khatm_v1') || '{}');
    if (kObj && kObj.currentPage) {
      khatmPage = parseInt(kObj.currentPage, 10) || 1;
    } else if (typeof simpleKhatm !== 'undefined' && simpleKhatm.currentPage) {
      khatmPage = parseInt(simpleKhatm.currentPage, 10) || 1;
    } else {
      khatmPage = savedPos ? (savedPos.page || 1) : 1;
    }
  } catch (e) {}

  const readPages = Math.max(0, khatmPage - 1);
  const khatmPct = (readPages / 604) * 100;
  const hifzPct = (hifzCount / 6236) * 100;
  const overallPct = Math.min(100, Math.max(0, parseFloat((khatmPct > hifzPct ? khatmPct : hifzPct).toFixed(1))));

  const pctEl = document.getElementById('homeHeroHifzPercent');
  if (pctEl) {
    pctEl.textContent = overallPct.toFixed(1) + '%';
  }

  const ringEl = document.getElementById('homeHeroHifzGaugeRing');
  if (ringEl) {
    const offset = Math.max(0, 100 - overallPct);
    ringEl.style.strokeDashoffset = offset;
  }

  const pagesBadge = document.getElementById('stickerHifzPagesBadge');
  if (pagesBadge) {
    pagesBadge.textContent = isKu 
      ? `${readPages} / ٦٠٤ ل.` 
      : `${readPages} / 604 S.`;
  }

  if (barEl) {
    barEl.style.width = overallPct + '%';
  }
}
window.renderContinueReadingCard = renderContinueReadingCard;

function resumeLastReadingPosition() {
  let savedPos = null;
  try {
    savedPos = JSON.parse(localStorage.getItem('quran_last_position') || 'null');
  } catch (e) {}

  const targetPage = savedPos ? (savedPos.page || 1) : parseInt(localStorage.getItem('quran_current_page') || '1', 10);
  const targetSurah = savedPos ? (savedPos.surah || 1) : parseInt(localStorage.getItem('quran_current_surah') || '1', 10);

  if (typeof switchMainTab === 'function') {
    switchMainTab('mushaf');
  }
  if (typeof jumpToPage === 'function') {
    jumpToPage(targetPage);
  } else if (typeof loadPage === 'function') {
    loadPage(targetPage);
  }
  if (typeof renderInteractiveMushaf === 'function') {
    setTimeout(() => {
      renderInteractiveMushaf();
    }, 100);
  }
  if (typeof showToast === 'function') {
    showToast(`📖 Muṣḥaf Seite ${targetPage} geöffnet`);
  }
}
window.resumeLastReadingPosition = resumeLastReadingPosition;

window.renderMushafPageDirect = function(targetPage, targetSurah) {
  if (typeof jumpToPage === 'function') {
    jumpToPage(targetPage || 1);
  } else if (typeof loadPage === 'function') {
    loadPage(targetPage || 1);
  }
  if (typeof renderInteractiveMushaf === 'function') {
    renderInteractiveMushaf();
  }
};

function renderPersonalProgressCard() {
  let memorizedCount = 0;
  try {
    const raw = localStorage.getItem('memorized_verses');
    if (raw) {
      const parsed = JSON.parse(raw);
      memorizedCount = Array.isArray(parsed) ? parsed.length : (typeof parsed === 'object' ? Object.keys(parsed).length : 0);
    }
  } catch (e) {}

  let streak = parseInt(localStorage.getItem('quran_study_streak') || '1', 10);
  if (isNaN(streak) || streak < 1) streak = 1;

  const countEl = document.getElementById('personalMemorizedCount');
  const pctEl = document.getElementById('personalMemorizedPct');
  const streakEl = document.getElementById('personalStreakCount');

  const totalVerses = 6236;
  const pct = ((memorizedCount / totalVerses) * 100).toFixed(1);

  if (countEl) countEl.textContent = `${memorizedCount} / ${totalVerses}`;
  if (pctEl) pctEl.textContent = `${pct}%`;
  if (streakEl) streakEl.textContent = `${streak} 🔥`;
}

// ============================================================
// 8. DEDICATED PANE 1: TAJWEED ACADEMY
// ============================================================
function renderDedicatedTajweed() {
  const container = document.getElementById('tajweedLessonsDedicatedContainer');
  if (!container) return;

  const lang = window.currentAppLanguage || 'de';
  container.innerHTML = TAJWEED_LESSONS.map((lesson) => {
    const title = lang === 'ku' ? lesson.titleKu : (lang === 'en' ? lesson.titleEn : lesson.titleDe);
    const rule = lang === 'ku' ? lesson.ruleKu : (lang === 'en' ? lesson.ruleEn : lesson.ruleDe);

    const examplesHtml = lesson.examples.map(ex => {
      const note = lang === 'ku' ? ex.noteKu : (lang === 'en' ? ex.noteEn : ex.noteDe);
      return `
        <div style="background: rgba(212, 175, 55, 0.08); border-right: 3px solid var(--gold-primary); padding: 8px 12px; border-radius: 8px; margin-top: 6px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-family: var(--quran-font); font-size: 1.3rem; color: #fef08a;">${ex.ar}</span>
          <span style="font-size: 0.8rem; color: #cbd5e1;">${note}</span>
        </div>
      `;
    }).join('');

    return `
      <div class="tajweed-card" style="background: rgba(18, 14, 11, 0.9); border: 1.5px solid var(--gold-border); border-radius: 14px; padding: 14px; box-shadow: 0 4px 14px rgba(0,0,0,0.3);">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
          <div style="width: 36px; height: 36px; border-radius: 10px; background: rgba(16, 185, 129, 0.15); display: flex; align-items: center; justify-content: center; color: #34d399; font-size: 1.1rem;">
            <i class="fa-solid ${lesson.icon}"></i>
          </div>
          <h3 style="margin: 0; font-size: 1rem; font-weight: 800; color: var(--gold-light);">${title}</h3>
        </div>
        <p style="margin: 0 0 10px; font-size: 0.84rem; color: #cbd5e1; line-height: 1.5;">${rule}</p>
        <div style="margin-top: 8px;">
          <div style="font-size: 0.74rem; font-weight: 700; color: var(--gold-primary); text-transform: uppercase;">Beispiele / نموونەکان:</div>
          ${examplesHtml}
        </div>
      </div>
    `;
  }).join('');
}

// ============================================================
// 9. DEDICATED PANE 2: QURAN DICTIONARY
// ============================================================
function renderDedicatedDictionary(query) {
  const container = document.getElementById('dictionaryWordsDedicatedContainer');
  if (!container) return;

  const q = (query || '').toLowerCase().trim();
  const lang = window.currentAppLanguage || 'de';

  const filtered = QURAN_KEY_WORDS.filter(item => {
    if (!q) return true;
    return item.ar.includes(q) ||
           item.translit.toLowerCase().includes(q) ||
           item.de.toLowerCase().includes(q) ||
           item.en.toLowerCase().includes(q) ||
           item.ku.toLowerCase().includes(q) ||
           (item.root && item.root.includes(q));
  });

  const countBadge = document.getElementById('dictionaryWordCountBadge');
  if (countBadge) {
    countBadge.textContent = filtered.length + ' / ' + QURAN_KEY_WORDS.length;
  }

  if (filtered.length === 0) {
    container.innerHTML = '<div style="text-align: center; padding: 28px; color: #94a3b8; font-size: 0.9rem;">Keine Wörter gefunden für "' + q + '".</div>';
    return;
  }

  container.innerHTML = filtered.map(w => {
    const meaning = lang === 'ku' ? w.ku : (lang === 'en' ? w.en : w.de);
    return `
      <div style="background: rgba(18, 14, 11, 0.88); border: 1px solid rgba(229, 184, 76, 0.2); border-radius: 14px; padding: 14px 16px; display: flex; justify-content: space-between; align-items: center; transition: all 0.2s; box-shadow: 0 4px 12px rgba(0,0,0,0.25);">
        <div>
          <div style="display: flex; align-items: baseline; gap: 8px;">
            <span style="font-family: var(--quran-font); font-size: 1.55rem; color: var(--gold-light); font-weight: bold;">${w.ar}</span>
            <span style="font-size: 0.84rem; color: #94a3b8; font-weight: 600;">[${w.translit}]</span>
          </div>
          <div style="font-size: 0.9rem; color: #f1f5f9; font-weight: 600; margin-top: 4px;">${meaning}</div>
        </div>
        <div style="text-align: right; flex-shrink: 0;">
          <span style="background: rgba(229, 184, 76, 0.18); color: var(--gold-primary); font-size: 0.78rem; font-weight: 800; padding: 3px 10px; border-radius: 12px; border: 1px solid rgba(229, 184, 76, 0.3);">${w.freq}</span>
          <div style="font-size: 0.74rem; color: #64748b; margin-top: 4px; font-weight: 700;">Wurzel: ${w.root}</div>
        </div>
      </div>
    `;
  }).join('');
}

// ============================================================

// ============================================================
// 10. ADVANCED KHATM-KORANPLANER ENGINE (MODERN & RELIABLE)
// ============================================================
const khatmState = {
  totalDays: 30,
  currentDay: 1,
  startPageToday: 1,
  endPageToday: 21,
  pagesPerDay: 21,
  juzPerDay: '1.1',
  completedDays: []
};

function loadKhatmState() {
  try {
    const saved = JSON.parse(localStorage.getItem('quran_khatm_data') || '{}');
    if (saved.totalDays && saved.totalDays >= 5) khatmState.totalDays = parseInt(saved.totalDays, 10);
    if (saved.currentDay && saved.currentDay >= 1) khatmState.currentDay = parseInt(saved.currentDay, 10);
    if (Array.isArray(saved.completedDays)) khatmState.completedDays = saved.completedDays;
  } catch(e) {}
  recalcKhatmMath();
}

function saveKhatmState() {
  try {
    localStorage.setItem('quran_khatm_data', JSON.stringify({
      totalDays: khatmState.totalDays,
      currentDay: khatmState.currentDay,
      completedDays: khatmState.completedDays
    }));
  } catch(e) {}
}

function recalcKhatmMath() {
  const totalPages = 604;
  khatmState.pagesPerDay = Math.ceil(totalPages / khatmState.totalDays);
  khatmState.juzPerDay = (khatmState.pagesPerDay / 20).toFixed(1);
  
  khatmState.startPageToday = Math.max(1, Math.min(604, (khatmState.currentDay - 1) * khatmState.pagesPerDay + 1));
  khatmState.endPageToday = Math.max(1, Math.min(604, khatmState.currentDay * khatmState.pagesPerDay));
}

function setKhatmDays(days) {
  khatmState.totalDays = Math.max(5, Math.min(365, parseInt(days, 10) || 30));
  if (khatmState.currentDay > khatmState.totalDays) {
    khatmState.currentDay = khatmState.totalDays;
  }
  recalcKhatmMath();
  saveKhatmState();
  updateDedicatedKhatm();
}
window.setKhatmDays = setKhatmDays;

function stepKhatmDay(delta) {
  const next = khatmState.currentDay + delta;
  if (next >= 1 && next <= khatmState.totalDays) {
    khatmState.currentDay = next;
    recalcKhatmMath();
    saveKhatmState();
    updateDedicatedKhatm();
  }
}
window.stepKhatmDay = stepKhatmDay;

function updateDedicatedKhatm() {
  loadKhatmState();
  
  const daysInput = document.getElementById('dedicatedKhatmDaysInput');
  if (daysInput && document.activeElement !== daysInput) {
    daysInput.value = khatmState.totalDays;
  }

  // Update button active states for presets (30, 60, 90, 180)
  [30, 60, 90, 180].forEach(d => {
    const btn = document.getElementById('khatmPresetBtn_' + d);
    if (btn) {
      const active = (khatmState.totalDays === d);
      btn.style.background = active ? 'var(--gold-primary)' : 'rgba(229,184,76,0.1)';
      btn.style.color = active ? '#000' : '#fff';
      btn.style.borderColor = active ? 'var(--gold-primary)' : 'var(--gold-border)';
    }
  });

  const resPagesEl = document.getElementById('dedicatedKhatmPagesResult');
  const resJuzEl = document.getElementById('dedicatedKhatmJuzResult');
  if (resPagesEl) resPagesEl.textContent = `${khatmState.pagesPerDay} Seiten / Tag`;
  if (resJuzEl) resJuzEl.textContent = `~ ${khatmState.juzPerDay} Juz / Tag`;

  // Daily tracker cards
  const curDayBadge = document.getElementById('khatmCurrentDayBadge');
  if (curDayBadge) curDayBadge.textContent = `Tag ${khatmState.currentDay} von ${khatmState.totalDays}`;

  const todayRangeEl = document.getElementById('khatmTodayPageRange');
  if (todayRangeEl) {
    todayRangeEl.textContent = `Seite ${khatmState.startPageToday} bis ${khatmState.endPageToday}`;
  }

  const pagesReadCount = Math.min(604, (khatmState.currentDay - 1) * khatmState.pagesPerDay);
  const percent = Math.min(100, Math.round((pagesReadCount / 604) * 100));

  const progressLabel = document.getElementById('khatmProgressText');
  if (progressLabel) {
    progressLabel.textContent = `${pagesReadCount} von 604 Seiten (${percent}%)`;
  }

  const progressBar = document.getElementById('khatmProgressBarFill');
  if (progressBar) {
    progressBar.style.width = `${percent}%`;
  }

  const openMushafBtnText = document.getElementById('khatmOpenMushafBtnText');
  if (openMushafBtnText) {
    openMushafBtnText.textContent = `📖 Heutiges Pensum im Muṣḥaf aufschlagen (Seite ${khatmState.startPageToday}) ➔`;
  }
}
window.updateDedicatedKhatm = updateDedicatedKhatm;

function onDedicatedKhatmDaysInputChanged(val) {
  const d = parseInt(val, 10);
  if (!isNaN(d) && d >= 5 && d <= 365) {
    khatmState.totalDays = d;
    recalcKhatmMath();
    saveKhatmState();
    updateDedicatedKhatm();
  }
}
window.onDedicatedKhatmDaysInputChanged = onDedicatedKhatmDaysInputChanged;

function startKhatmReadingToday() {
  loadKhatmState();
  const targetPage = khatmState.startPageToday || 1;

  localStorage.setItem('quran_current_page', String(targetPage));
  localStorage.setItem('quran_last_position', JSON.stringify({ page: targetPage, surah: 1, ayah: 1 }));

  if (typeof switchMainTab === 'function') {
    switchMainTab('mushaf');
  }
  if (typeof jumpToPage === 'function') {
    jumpToPage(targetPage);
  } else if (typeof loadPage === 'function') {
    loadPage(targetPage);
  }

  if (typeof showToast === 'function') {
    showToast(`📖 Khatm Tag ${khatmState.currentDay}: Seite ${targetPage} geöffnet`);
  }
}
window.startKhatmReadingToday = startKhatmReadingToday;

function markKhatmTodayComplete() {
  loadKhatmState();
  const finishedDay = khatmState.currentDay;
  if (!khatmState.completedDays.includes(finishedDay)) {
    khatmState.completedDays.push(finishedDay);
  }
  if (khatmState.currentDay < khatmState.totalDays) {
    khatmState.currentDay++;
  }
  recalcKhatmMath();
  saveKhatmState();
  updateDedicatedKhatm();

  if (typeof showToast === 'function') {
    showToast(`🎉 Māshā'Allāh! Tag ${finishedDay} abgeschlossen! Weiter zu Tag ${khatmState.currentDay}.`);
  }
}
window.markKhatmTodayComplete = markKhatmTodayComplete;

function resetKhatmPlan() {
  khatmState.currentDay = 1;
  khatmState.completedDays = [];
  recalcKhatmMath();
  saveKhatmState();
  updateDedicatedKhatm();
  if (typeof showToast === 'function') {
    showToast('🔄 Khatm-Plan auf Tag 1 zurückgesetzt');
  }
}
window.resetKhatmPlan = resetKhatmPlan;

function resumeLastReadingPosition() {
  let savedPos = null;
  try {
    savedPos = JSON.parse(localStorage.getItem('quran_last_position') || 'null');
  } catch (e) {}

  const targetPage = savedPos ? (savedPos.page || 1) : parseInt(localStorage.getItem('quran_current_page') || '1', 10);
  
  if (typeof switchMainTab === 'function') {
    switchMainTab('mushaf');
  }
  if (typeof jumpToPage === 'function') {
    jumpToPage(targetPage);
  } else if (typeof loadPage === 'function') {
    loadPage(targetPage);
  }
  if (typeof showToast === 'function') {
    showToast(`📖 Muṣḥaf Seite ${targetPage} geöffnet`);
  }
}
window.resumeLastReadingPosition = resumeLastReadingPosition;

// ============================================================
// 11. DEDICATED PANE 4: COMPREHENSIVE DHIKR, QURANIC DUAS & DALĀ'IL AL-KHAYRĀT
// ============================================================
var currentDhikrCategory = 'all';
var currentDhikrIndex = 0;
var currentDhikrCounter = 0;

function getFilteredDhikrList() {
  if (currentDhikrCategory === 'all') return DHIKR_COLLECTION;
  return DHIKR_COLLECTION.filter(d => d.category === currentDhikrCategory);
}

function setDhikrCategory(cat) {
  currentDhikrCategory = cat;
  currentDhikrIndex = 0;
  currentDhikrCounter = 0;

  const cats = ['all', 'quran', 'dalail', 'sunnah', 'tasbih'];
  cats.forEach(c => {
    const el = document.getElementById('dhikrCat_' + c);
    if (el) {
      const active = (c === cat);
      el.style.background = active ? 'var(--gold-primary)' : 'rgba(255,255,255,0.06)';
      el.style.color = active ? '#000' : '#cbd5e1';
      el.style.borderColor = active ? 'var(--gold-primary)' : 'var(--gold-border)';
      el.style.fontWeight = active ? '800' : '700';
    }
  });

  populateDhikrQuickSelect();
  renderDedicatedDhikr();
}
window.setDhikrCategory = setDhikrCategory;

function populateDhikrQuickSelect() {
  const sel = document.getElementById('dhikrQuickSelect');
  if (!sel) return;
  const list = getFilteredDhikrList();
  const lang = window.currentAppLanguage || 'de';

  let html = '';
  list.forEach((item, idx) => {
    const title = lang === 'ku' ? (item.titleKu || item.titleAr) : 
                 (lang === 'en' ? (item.titleEn || item.titleAr) : (item.titleDe || item.titleAr));
    html += `<option value="${idx}">${idx + 1}. ${title} (${item.sourceAr || ''})</option>`;
  });
  sel.innerHTML = html;
  sel.value = currentDhikrIndex;
}

function onDhikrQuickSelectChange(idx) {
  currentDhikrIndex = parseInt(idx, 10) || 0;
  currentDhikrCounter = 0;
  renderDedicatedDhikr();
}
window.onDhikrQuickSelectChange = onDhikrQuickSelectChange;

function renderDedicatedDhikr() {
  const list = getFilteredDhikrList();
  if (!list || list.length === 0) return;
  
  if (currentDhikrIndex >= list.length) currentDhikrIndex = 0;
  const d = list[currentDhikrIndex];
  if (!d) return;

  const lang = window.currentAppLanguage || 'de';
  const headerEl = document.getElementById('dedicatedDhikrHeaderTitle');
  const catBadgeEl = document.getElementById('dedicatedDhikrCatBadge');
  const arEl = document.getElementById('dedicatedDhikrArText');
  const transEl = document.getElementById('dedicatedDhikrTransText');
  const countEl = document.getElementById('dhikrCounterDisplay');
  const targetEl = document.getElementById('dhikrTargetDisplay');
  const progressLabelEl = document.getElementById('dhikrProgressLabel');
  const sel = document.getElementById('dhikrQuickSelect');

  if (sel && sel.options.length === 0) populateDhikrQuickSelect();
  if (sel && sel.value != currentDhikrIndex) {
    sel.value = currentDhikrIndex;
  }

  if (headerEl) {
    headerEl.textContent = lang === 'ku' ? (d.titleKu || d.titleAr) : 
                          (lang === 'en' ? (d.titleEn || d.titleAr) : (d.titleDe || d.titleAr));
  }
  if (catBadgeEl) {
    catBadgeEl.innerHTML = `<span style="background: rgba(16, 185, 129, 0.2); border: 1px solid #10b981; color: #6ee7b7; padding: 3px 8px; border-radius: 8px; font-size: 0.76rem; font-weight: 700;">${d.categoryLabelAr || ''}</span> <span style="color: var(--gold-light); font-size: 0.78rem;">${d.sourceAr || ''}</span>`;
  }
  if (progressLabelEl) {
    progressLabelEl.textContent = `${currentDhikrIndex + 1} / ${list.length}`;
  }
  if (arEl) {
    arEl.textContent = d.arabic;
  }
  if (transEl) {
    transEl.textContent = lang === 'ku' ? (d.ku || d.de) : (lang === 'en' ? (d.en || d.de) : d.de);
  }
  if (countEl) countEl.textContent = currentDhikrCounter;
  if (targetEl) targetEl.textContent = `/ ${d.targetCount || 3}`;
}
window.renderDedicatedDhikr = renderDedicatedDhikr;

function incrementDhikrCounter() {
  const list = getFilteredDhikrList();
  const d = list[currentDhikrIndex];
  currentDhikrCounter++;
  const countEl = document.getElementById('dhikrCounterDisplay');
  if (countEl) countEl.textContent = currentDhikrCounter;

  if (navigator.vibrate) {
    navigator.vibrate(35);
  }

  const target = d ? (d.targetCount || 3) : 3;
  if (currentDhikrCounter === target) {
    if (navigator.vibrate) navigator.vibrate([60, 50, 60]);
    if (typeof showToast === 'function') {
      showToast("🎉 Māshā'Allāh! Ziel für dieses Dhikr erreicht.");
    }
  }
}
window.incrementDhikrCounter = incrementDhikrCounter;

function resetDhikrCounter() {
  currentDhikrCounter = 0;
  const countEl = document.getElementById('dhikrCounterDisplay');
  if (countEl) countEl.textContent = '0';
}
window.resetDhikrCounter = resetDhikrCounter;

function nextDhikrItem() {
  const list = getFilteredDhikrList();
  currentDhikrIndex = (currentDhikrIndex + 1) % list.length;
  currentDhikrCounter = 0;
  renderDedicatedDhikr();
}
window.nextDhikrItem = nextDhikrItem;

function prevDhikrItem() {
  const list = getFilteredDhikrList();
  currentDhikrIndex = (currentDhikrIndex - 1 + list.length) % list.length;
  currentDhikrCounter = 0;
  renderDedicatedDhikr();
}
window.prevDhikrItem = prevDhikrItem;

// 12. DEDICATED PANE 5: BOOKMARKS
// ============================================================
function renderDedicatedBookmarks() {
  const container = document.getElementById('bookmarksDedicatedListContainer');
  if (!container) return;

  let bookmarks = [];
  try {
    bookmarks = JSON.parse(localStorage.getItem('quran_bookmarks') || '[]');
  } catch (e) { bookmarks = []; }

  if (bookmarks.length === 0) {
    container.innerHTML = '<div style="text-align: center; padding: 24px; color: #94a3b8;" data-i18n="no_bookmarks">Noch keine Lesezeichen gespeichert.</div>';
    return;
  }

  container.innerHTML = bookmarks.map((b, idx) => {
    return `
      <div style="background: rgba(18, 14, 11, 0.9); border: 1.5px solid var(--gold-border); border-radius: 12px; padding: 12px 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span style="font-weight: 700; color: var(--gold-light); font-size: 0.9rem;">Sure ${b.surahNo} : Vers ${b.ayahNo}</span>
          <button onclick="removeBookmark(${idx}); renderDedicatedBookmarks();" style="background: none; border: none; color: #ef4444; font-size: 0.9rem; cursor: pointer;"><i class="fa-solid fa-trash-can"></i></button>
        </div>
        <div style="font-family: var(--quran-font); font-size: 1.15rem; color: #f8fafc; line-height: 1.6; direction: rtl; text-align: right; margin-bottom: 8px;">${b.arabic}</div>
        <button onclick="jumpToBookmarkedVerse(${b.surahNo}, ${b.ayahNo})" style="width: 100%; padding: 6px; border-radius: 8px; border: 1px solid var(--gold-border); background: rgba(229, 184, 76, 0.15); color: var(--gold-light); font-weight: 700; font-size: 0.8rem; cursor: pointer;">
          Im Muṣḥaf öffnen ➜
        </button>
      </div>
    `;
  }).join('');
}

function removeBookmark(idx) {
  let bookmarks = [];
  try {
    bookmarks = JSON.parse(localStorage.getItem('quran_bookmarks') || '[]');
    bookmarks.splice(idx, 1);
    localStorage.setItem('quran_bookmarks', JSON.stringify(bookmarks));
  } catch (e) {}
}

function findPageForAyah(surahNum, ayahNum) {
  if (typeof QURAN_ALL_PAGES === 'undefined') return 1;
  const s = parseInt(surahNum, 10);
  const a = parseInt(ayahNum, 10);
  for (let p = 1; p <= 604; p++) {
    const list = QURAN_ALL_PAGES[p];
    if (list && list.some(v => v.surahNum === s && v.num === a)) {
      return p;
    }
  }
  return 1;
}
window.findPageForAyah = findPageForAyah;

function toggleVerseBookmark(surahNo, ayahNo, arabicText, sectionSource) {
  let bookmarks = [];
  try {
    bookmarks = JSON.parse(localStorage.getItem('quran_bookmarks') || '[]');
  } catch (e) { bookmarks = []; }

  const s = parseInt(surahNo, 10);
  const a = parseInt(ayahNo, 10);
  const idx = bookmarks.findIndex(b => b.surahNo === s && b.ayahNo === a);

  const surahs = (typeof ALL_114_SURAHS !== 'undefined' ? ALL_114_SURAHS : (window.ALL_114_SURAHS || []));
  const sMeta = surahs[s - 1] || { name: 'Sure ' + s, arabic: 'سورة ' + s };
  const sName = sMeta.arabic || sMeta.name || ('Sure ' + s);

  if (idx >= 0) {
    bookmarks.splice(idx, 1);
    localStorage.setItem('quran_bookmarks', JSON.stringify(bookmarks));
    if (typeof showToast === 'function') {
      showToast('⭐ Lesezeichen für Sure ' + s + ':' + a + ' entfernt');
    }
  } else {
    bookmarks.unshift({
      surahNo: s,
      ayahNo: a,
      surahName: sName,
      arabic: arabicText || '',
      source: sectionSource || 'Muṣḥaf',
      savedAt: new Date().toISOString()
    });
    localStorage.setItem('quran_bookmarks', JSON.stringify(bookmarks));
    if (typeof showToast === 'function') {
      showToast('⭐ Sure ' + s + ':' + a + ' (' + sName + ') zu Lesezeichen hinzugefügt!');
    }
  }

  if (typeof renderDedicatedBookmarks === 'function') {
    renderDedicatedBookmarks();
  }
}
window.toggleVerseBookmark = toggleVerseBookmark;

function isVerseBookmarked(surahNo, ayahNo) {
  try {
    const bookmarks = JSON.parse(localStorage.getItem('quran_bookmarks') || '[]');
    const s = parseInt(surahNo, 10);
    const a = parseInt(ayahNo, 10);
    return bookmarks.some(b => b.surahNo === s && b.ayahNo === a);
  } catch (e) {
    return false;
  }
}
window.isVerseBookmarked = isVerseBookmarked;

function jumpToBookmarkedVerse(surahNo, ayahNo) {
  const p = findPageForAyah(surahNo, ayahNo);
  if (typeof switchMainTab === 'function') {
    switchMainTab('mushaf');
  }
  if (typeof jumpToPage === 'function') {
    jumpToPage(p);
  } else if (typeof loadPage === 'function') {
    loadPage(p);
  }
  if (typeof showToast === 'function') {
    showToast('📖 Gehe zu Sure ' + surahNo + ':' + ayahNo + ' (Seite ' + p + ')');
  }
}
window.jumpToBookmarkedVerse = jumpToBookmarkedVerse;

// ============================================================
// 13. DEDICATED PANE 6: UNIVERSAL SEARCH
// ============================================================
function renderDedicatedSearch(query) {
  const container = document.getElementById('searchResultsDedicatedContainer');
  if (!container) return;

  const q = (query || '').toLowerCase().trim();
  if (!q) {
    container.innerHTML = '<div style="text-align: center; padding: 24px; color: #94a3b8;">Gib einen Suren-Namen (z.B. Baqarah), Versnummer oder ein Stichwort ein.</div>';
    return;
  }

  const surahs = (typeof ALL_114_SURAHS !== 'undefined' ? ALL_114_SURAHS : (window.ALL_114_SURAHS || []));
  const matches = surahs.filter(s => {
    return s.id.toString() === q ||
           (s.arabic && s.arabic.includes(q)) ||
           (s.name && s.name.toLowerCase().includes(q)) ||
           (s.germanMeaning && s.germanMeaning.toLowerCase().includes(q)) ||
           (s.kurdish && s.kurdish.includes(q));
  });

  if (matches.length === 0) {
    container.innerHTML = `<div style="text-align: center; padding: 24px; color: #94a3b8;">Keine Treffer für "${query}".</div>`;
    return;
  }

  container.innerHTML = matches.map(s => {
    return `
      <div onclick="selectSearchResultSurah(${s.id}, ${s.startPage || 1})" style="background: rgba(18, 14, 11, 0.9); border: 1.5px solid var(--gold-border); border-radius: 12px; padding: 12px 14px; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--gold-primary); color: #000; font-weight: 800; font-size: 0.84rem; display: flex; align-items: center; justify-content: center;">${s.id}</div>
          <div>
            <div style="font-weight: 700; font-size: 0.95rem; color: #fff;">${s.germanMeaning || s.name || ('Sure ' + s.id)}</div>
            <div style="font-size: 0.78rem; color: #94a3b8;">Seite ${s.startPage || 1} · ${s.versesCount || 0} Verse · ${s.kurdish || s.revelation}</div>
          </div>
        </div>
        <div style="font-family: var(--quran-font); font-size: 1.3rem; color: var(--gold-light);">
          سورة ${s.arabic || s.name}
        </div>
      </div>
    `;
  }).join('');
}

function selectSearchResultSurah(surahId, startPage) {
  if (typeof switchMainTab === 'function') {
    switchMainTab('mushaf');
  }
  if (typeof renderMushafPageDirect === 'function') {
    setTimeout(() => {
      renderMushafPageDirect(startPage, surahId);
    }, 150);
  }
}

// ============================================================
// 14. DEDICATED PANE 7: TAFSIR NAMI PDF & BOOK READER
// ============================================================
let isDedicatedNamiRendering = false;
let dedicatedNamiPdfDoc = null;

function initDedicatedTafsirPdf() {
  populateDedicatedNamiSurahSelect();
  switchDedicatedNamiVol(currentDedicatedNamiVol);
}

function populateDedicatedNamiSurahSelect() {
  const sel = document.getElementById('namiDedicatedSurahSelect');
  if (!sel) return;

  const surahs = (typeof ALL_114_SURAHS !== 'undefined' ? ALL_114_SURAHS : (window.ALL_114_SURAHS || []));
  if (surahs.length === 0) return;
  sel.innerHTML = surahs.map(s => {
    return `<option value="${s.id}">${s.id}. سورة ${s.arabic || s.name} (${s.kurdish || s.germanMeaning || s.name})</option>`;
  }).join('');
}

function switchDedicatedNamiVol(volNum) {
  currentDedicatedNamiVol = volNum;
  const cfg = DEDICATED_NAMI_VOLS[volNum] || DEDICATED_NAMI_VOLS[1];
  currentDedicatedNamiPage = 1;

  [1, 2, 3].forEach(v => {
    const btn = document.getElementById(`namiDedicatedVol${v}Btn`);
    if (btn) {
      if (v === volNum) {
        btn.style.background = 'var(--gold-primary)';
        btn.style.color = '#000';
      } else {
        btn.style.background = 'rgba(255,255,255,0.06)';
        btn.style.color = '#cbd5e1';
      }
    }
  });

  const pageInput = document.getElementById('namiDedicatedPageInput');
  if (pageInput) {
    pageInput.max = cfg.maxPage;
    pageInput.value = 1;
  }
  const totalLbl = document.getElementById('namiDedicatedTotalPagesLabel');
  if (totalLbl) totalLbl.textContent = `لە ${cfg.maxPage}`;

  // Select first surah of this volume in dropdown
  const sel = document.getElementById('namiDedicatedSurahSelect');
  if (sel) {
    sel.value = cfg.surahs[0];
  }

  renderDedicatedNamiPdf(1);
}

function stepDedicatedNamiPage(delta) {
  const cfg = DEDICATED_NAMI_VOLS[currentDedicatedNamiVol] || DEDICATED_NAMI_VOLS[1];
  const newPage = Math.max(1, Math.min(cfg.maxPage, currentDedicatedNamiPage + delta));
  if (newPage !== currentDedicatedNamiPage) {
    renderDedicatedNamiPdf(newPage);
  }
}

function onDedicatedNamiSurahChanged(surahId) {
  const sNum = parseInt(surahId, 10);
  let targetVol = 1;
  if (sNum >= 29) targetVol = 3;
  else if (sNum >= 10) targetVol = 2;

  currentDedicatedNamiVol = targetVol;
  [1, 2, 3].forEach(v => {
    const btn = document.getElementById(`namiDedicatedVol${v}Btn`);
    if (btn) {
      if (v === targetVol) {
        btn.style.background = 'var(--gold-primary)';
        btn.style.color = '#000';
      } else {
        btn.style.background = 'rgba(255,255,255,0.06)';
        btn.style.color = '#cbd5e1';
      }
    }
  });

  const cfg = DEDICATED_NAMI_VOLS[targetVol];
  const totalLbl = document.getElementById('namiDedicatedTotalPagesLabel');
  if (totalLbl) totalLbl.textContent = `لە ${cfg.maxPage}`;

  renderDedicatedNamiPdf(currentDedicatedNamiPage);
}

async function renderDedicatedNamiPdf(pageNum) {
  currentDedicatedNamiPage = pageNum;
  const pageInput = document.getElementById('namiDedicatedPageInput');
  if (pageInput) pageInput.value = pageNum;

  const canvas = document.getElementById('namiDedicatedCanvas');
  const loading = document.getElementById('namiDedicatedLoading');
  const textBackup = document.getElementById('namiDedicatedTextBackup');

  // Always update authentic Kurdish Tafsir Nami text for the selected surah
  const surahSelect = document.getElementById('namiDedicatedSurahSelect');
  let sId = surahSelect ? parseInt(surahSelect.value, 10) : 1;
  if (isNaN(sId) || sId < 1) sId = 1;

  const surahs = (typeof ALL_114_SURAHS !== 'undefined' ? ALL_114_SURAHS : (window.ALL_114_SURAHS || []));
  const sObj = surahs.find(s => s.id === sId) || { arabic: 'الفاتحة', kurdish: 'فاتیحە' };

  if (textBackup) {
    let kurdishContent = '';
    if (typeof KURDISH_TAFSIR_DATA !== 'undefined' && KURDISH_TAFSIR_DATA[sId]) {
      for (const [aNum, txt] of Object.entries(KURDISH_TAFSIR_DATA[sId])) {
        kurdishContent += `
          <div style="background: rgba(16, 185, 129, 0.08); border-right: 4px solid #10b981; border-radius: 10px; padding: 12px 14px; margin-bottom: 10px;">
            <div style="font-weight: 800; color: #34d399; font-size: 0.95rem; margin-bottom: 4px;">ئایەتی ${aNum} :</div>
            <div style="font-family: var(--kurdish-font); font-size: 1.15rem; line-height: 2; color: #f8fafc;">${txt}</div>
          </div>
        `;
      }
    }
    textBackup.innerHTML = `
      <div style="background: rgba(18, 14, 11, 0.9); border: 1.5px solid var(--gold-border); border-radius: 12px; padding: 14px; margin-top: 10px;">
        <div style="font-size: 1rem; font-weight: 800; color: var(--gold-light); margin-bottom: 10px; border-bottom: 1px solid rgba(229,184,76,0.2); padding-bottom: 6px;">
          📖 تەفسیری نووسراوی سورەتی ${sId}. ${sObj.arabic} - ${sObj.kurdish} (مامۆستا مەلا عەبدولکەریم):
        </div>
        ${kurdishContent || '<div style="color: #94a3b8; text-align: center;">دەقی تەفسیر ئامادە دەکرێت...</div>'}
      </div>
    `;
  }

  // Attempt PDF.js rendering to canvas
  if (canvas && typeof pdfjsLib !== 'undefined') {
    if (loading) loading.style.display = 'flex';
    try {
      const cfg = DEDICATED_NAMI_VOLS[currentDedicatedNamiVol];
      let docData = null;
      try {
        const pdfResp = await fetch(cfg.file);
        if (pdfResp.ok) {
          const buf = await pdfResp.arrayBuffer();
          docData = new Uint8Array(buf);
        }
      } catch (fErr) {}
      const loadingTask = pdfjsLib.getDocument(docData ? {
        data: docData,
        disableWorker: true
      } : {
        url: cfg.file,
        disableWorker: true
      });
      const doc = await loadingTask.promise;
      const safePage = Math.max(1, Math.min(pageNum, doc.numPages));
      const page = await doc.getPage(safePage);
      
      const viewport = page.getViewport({ scale: 1.2 });
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const ctx = canvas.getContext('2d');
      await page.render({ canvasContext: ctx, viewport: viewport }).promise;
      canvas.style.display = 'block';
    } catch (e) {
      console.log('PDF canvas render fallback to text mode:', e);
      if (canvas) canvas.style.display = 'none';
    } finally {
      if (loading) loading.style.display = 'none';
    }
  }
}

// ============================================================
// 15. GLOBAL EXPORTS
// ============================================================
window.initQuranUltimate = initQuranUltimate;
window.renderDailyVerseCard = renderDailyVerseCard;
window.nextDailyVerse = nextDailyVerse;
window.playDailyVerseAudio = playDailyVerseAudio;
window.bookmarkDailyVerse = bookmarkDailyVerse;
window.copyDailyVerse = copyDailyVerse;
window.resumeLastReadingPosition = resumeLastReadingPosition;

window.renderDedicatedTajweed = renderDedicatedTajweed;
window.renderDedicatedDictionary = renderDedicatedDictionary;
window.updateDedicatedKhatm = updateDedicatedKhatm;
window.renderDedicatedDhikr = renderDedicatedDhikr;
window.incrementDhikrCounter = incrementDhikrCounter;
window.resetDhikrCounter = resetDhikrCounter;
window.nextDhikrItem = nextDhikrItem;
window.prevDhikrItem = prevDhikrItem;
window.renderDedicatedBookmarks = renderDedicatedBookmarks;
window.removeBookmark = removeBookmark;
window.jumpToBookmarkedVerse = jumpToBookmarkedVerse;
window.renderDedicatedSearch = renderDedicatedSearch;
window.selectSearchResultSurah = selectSearchResultSurah;

window.initDedicatedTafsirPdf = initDedicatedTafsirPdf;
window.switchDedicatedNamiVol = switchDedicatedNamiVol;
window.stepDedicatedNamiPage = stepDedicatedNamiPage;
window.onDedicatedNamiSurahChanged = onDedicatedNamiSurahChanged;
window.renderDedicatedNamiPdf = renderDedicatedNamiPdf;

// ============================================================
// ============================================================
// ============================================================
// ============================================================
// 16. TARTEEL AI SMART RECITATION & HIFZ REVEALING ENGINE (MASTERCLASS V4 - PROGRESSIVE LIVE REVEAL)
// ============================================================
const TARTEEL_I18N = {
  de: {
    singleModeBadge: 'Einzelvers',
    contModeBadge: 'Fortlaufend',
    singleModeDesc: (a) => `🎯 Ziel: Vers ${a} · Rezitiere den Vers (Tippe danach erneut auf das Mikrofon für den nächsten Vers)`,
    contModeDesc: (a) => `🎯 Ziel: Vers ${a} · Fortlaufend rezitieren, Verse rücken automatisch vor`,
    listening: '🎙️ Höre Rezitation... (Sprich arabisch)',
    listeningShort: 'Höre...',
    wordProgressBadge: (cur, tot) => `${cur}/${tot} Wörter`,
    matchSuccess: (a) => `✓ Vers ${a} vollständig erkannt!`,
    matchMistake: (a, pct) => `⚠️ Vers ${a} nicht genau genug (${pct}%) · Bitte wiederholen`,
    pageComplete: (p) => `🎉 Seite ${p} abgeschlossen! Nächste Seite...`,
    shortPause: 'Kurze Atempause...',
    nextAyahAutoPrompt: (a) => `🎯 Weiter mit Vers ${a}...`,
    noSpeechError: 'Keine Stimme erkannt',
    micDeniedError: 'Mikrofonzugriff verweigert',
    offlineNotice: 'ℹ️ Offline-Modus aktiv: Nutzt geräteinterne Spracherkennung',
    networkNotice: '⚠️ Offline: Bitte arabisches Sprachpaket auf dem Gerät installieren',
    rewindToast: '« Seite neu gestartet',
    readingModeToast: '📖 Volltext-Muṣḥaf Lesemodus',
    hifzModeToast: '📝 Hifz-Prüfmodus aktiv (Wort-für-Wort Aufdeckung)',
    singleActiveToast: '✓ Einzelvers-Modus aktiv',
    contActiveToast: '✓ Fortlaufend-Modus aktiv',
    noMistakes: 'Keine Fehler erkannt. Hervorragend!',
    recitedLabel: 'Erkannt'
  },
  ku: {
    singleModeBadge: 'تک ئایەت',
    contModeBadge: 'بەردەوام',
    singleModeDesc: (a) => `🎯 ئامانج: ئایەتی ${a} · ئایەتەکە بخوێنەوە (دوای تەواوبوون، دیسان مایکرۆفۆن لێبدە بۆ ئایەتی دواتر)`,
    contModeDesc: (a) => `🎯 ئامانج: ئایەتی ${a} · بەردەوام بخوێنەوە، ئایەتەکان خۆکار دەڕۆنە پێش`,
    listening: '🎙️ گوێگرتن لە خوێندنەوە... (بە عەرەبی بخوێنەوە)',
    listeningShort: 'گوێگرتن...',
    wordProgressBadge: (cur, tot) => `${cur}/${tot} وشە`,
    matchSuccess: (a) => `✓ ئایەتی ${a} بە تەواوی ناسرایەوە!`,
    matchMistake: (a, pct) => `⚠️ ئایەتی ${a} ورد نەبوو (${pct}%) · تکایە دووبارەی بکەرەوە`,
    pageComplete: (p) => `🎉 پەڕەی ${p} تەواو بوو! پەڕەی دواتر...`,
    shortPause: 'پشوودانێکی کورت...',
    nextAyahAutoPrompt: (a) => `🎯 بەردەوام بە لەگەڵ ئایەتی ${a}...`,
    noSpeechError: 'هیچ دەنگێک نەبیسترا',
    micDeniedError: 'ڕێگەپێدانی مایکرۆفۆن نەدراوە',
    offlineNotice: 'ℹ️ دۆخی ئۆفلاین: ناسینەوەی ناوخۆیی ئامێرەکە بەکاردێت',
    networkNotice: '⚠️ ئۆفلاین: تکایە پاکێجی عەرەبی لە ئامێرەکە دابمەزرێنە',
    rewindToast: '« پەڕە لە سەرەتاوە دەستی پێکردەوە',
    readingModeToast: '📖 دۆخی خوێندنەوەی تەواوی مصحف',
    hifzModeToast: '📝 دۆخی تاقیکردنەوەی لەبەرکردن چالاکە',
    singleActiveToast: '✓ دۆخی تاک ئایەت چالاک کرا',
    contActiveToast: '✓ دۆخی بەردەوام چالاک کرا',
    noMistakes: 'هیچ هەڵەیەک تۆمار نەکراوە. زۆر باشە!',
    recitedLabel: 'خوێندراوە'
  }
};

function getTarteelText(key, ...args) {
  const lang = (typeof currentAppLanguage !== 'undefined' && currentAppLanguage === 'ku') || (typeof state !== 'undefined' && state.lang === 'ku') ? 'ku' : 'de';
  const table = TARTEEL_I18N[lang] || TARTEEL_I18N['de'];
  const val = table[key];
  if (typeof val === 'function') return val(...args);
  return val || key;
}
window.getTarteelText = getTarteelText;

var tarteelState = window.tarteelState = {
  page: 1,
  surah: 1,
  targetAyah: 1,
  reciteMode: 'single',  // 'single' (Einzelvers) vs 'continuous' (Fortlaufend)
  hideMode: true,        // Hifz Blank Mode by default
  revealed: {},          // key: "surah:ayah" -> true (fully revealed)
  revealedWords: {},     // key: "surah:ayah" -> number of words sequentially revealed (Progressive Reveal)
  isRecording: false,
  timerSeconds: 0,
  timerInterval: null,
  speechRecognizer: null,
  audioContext: null,
  analyser: null,
  audioStream: null,
  audioAnimFrame: null,
  sheikhAudio: null,
  isSheikhPlaying: false,
  mistakesCount: 0,
  mistakesLog: [],
  ignoreSpeechBeforeTime: 0,
  isPacingPause: false,
  settings: {
    soundOnMistake: true,
    autoSheikhCorrection: false,
    strictness: 0.75
  }
};
window.tarteelState = tarteelState;

// Web Audio API Synthesized Chimes (Zero external dependencies)
function playTarteelTone(type) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    if (type === 'wordSuccess') {
      // Soft gentle micro-chime for progressive word reveal
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.13);
    } else if (type === 'success') {
      // Harmonic uplifting chime for completed ayah (C5 -> E5 -> G5)
      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.09);
        gain.gain.setValueAtTime(0, now + idx * 0.09);
        gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.09 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.38);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.09);
        osc.stop(now + idx * 0.09 + 0.39);
      });
    } else if (type === 'pageComplete') {
      // Celebratory completion fanfare
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);
        gain.gain.setValueAtTime(0, now + idx * 0.1);
        gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.1 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.46);
      });
    } else if (type === 'mistake') {
      [311.13, 261.63].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        gain.gain.setValueAtTime(0, now + idx * 0.12);
        gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.12 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.31);
      });
    }
  } catch (e) {
    console.log('Audio chime notice:', e);
  }
}
window.playTarteelTone = playTarteelTone;

// Precision Arabic Quran string normalizer with Dagger-Alef conversion & Madd collapsing
function normalizeArabicForMatch(text) {
  if (!text) return '';
  return text
    .replace(/\u0670/g, 'ا')                              // Convert Dagger Alef (\u0670) to standard Alef 'ا' so Quranic orthography matches STT
    .replace(/[\u064B-\u065F\u06D6-\u06ED]/g, '')        // Remove tashkeel & Quranic pause marks
    .replace(/[إأآءئؤٱ]/g, 'ا')                             // Normalize all forms of hamza / alef
    .replace(/ة/g, 'ه')                                     // Normalize taa marbuta
    .replace(/ى/g, 'ي')                                     // Normalize alef maqsura
    .replace(/ـ/g, '')                                      // Remove tatweel
    .replace(/[٠-٩0-9]/g, '')                               // Remove numerals
    // Normalize repeated Madd letters (Tajweed elongations: الرحمااان -> الرحمان)
    .replace(/ا+/g, 'ا')
    .replace(/و+/g, 'و')
    .replace(/ي+/g, 'ي')
    // Normalize fused words common in Arabic STT
    .replace(/الحمدلله/g, 'الحمد لله')
    .replace(/بسمالله/g, 'بسم الله')
    .replace(/سبحانالله/g, 'سبحان الله')
    .replace(/استغفرالله/g, 'استغفر الله')
    .replace(/انشاءالله/g, 'ان شاء الله')
    .replace(/[^\u0621-\u064A\s]/g, '')                   // Keep only Arabic letters and spaces
    .replace(/\s+/g, ' ')
    .trim();
}
window.normalizeArabicForMatch = normalizeArabicForMatch;

function stripArabicPrefix(w) {
  if (!w) return '';
  if (w.startsWith('ال') && w.length > 4) return w.substring(2);
  if ((w.startsWith('و') || w.startsWith('ف') || w.startsWith('ب') || w.startsWith('ل') || w.startsWith('ك')) && w.length > 3) {
    const sub = w.substring(1);
    if (sub.startsWith('ال') && sub.length > 4) return sub.substring(2);
    return sub;
  }
  return w;
}

function calculateLevenshteinSimilarity(s1, s2) {
  if (!s1 || !s2) return 0;
  if (s1 === s2) return 1;
  const len1 = s1.length;
  const len2 = s2.length;
  const matrix = Array.from({ length: len1 + 1 }, () => new Array(len2 + 1).fill(0));

  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  const dist = matrix[len1][len2];
  return 1 - (dist / Math.max(len1, len2));
}

function doArabicWordsMatch(w1, w2) {
  const n1 = normalizeArabicForMatch(w1);
  const n2 = normalizeArabicForMatch(w2);
  if (!n1 || !n2) return false;
  if (n1 === n2) return true;
  // Specific Quran orthography aliases
  if ((n1 === 'مالك' && n2 === 'ملك') || (n1 === 'ملك' && n2 === 'مالك')) return true;
  if ((n1 === 'الصراط' && n2 === 'السراط') || (n1 === 'السراط' && n2 === 'الصراط')) return true;
  if ((n1 === 'الرحمن' && n2 === 'الرحمان') || (n1 === 'الرحمان' && n2 === 'الرحمن')) return true;

  if (stripArabicPrefix(n1) === stripArabicPrefix(n2)) return true;
  if (calculateLevenshteinSimilarity(n1, n2) >= 0.70) return true;
  if (calculateLevenshteinSimilarity(stripArabicPrefix(n1), stripArabicPrefix(n2)) >= 0.70) return true;
  return false;
}
window.doArabicWordsMatch = doArabicWordsMatch;

// Precision Word-by-Word Streaming Evaluator
function evaluateAyahWordStream(fullSessionSpoken, latestChunk, rawTargetWords, currentRevealed) {
  const normSFull = normalizeArabicForMatch(fullSessionSpoken).split(' ').filter(w => w.length > 0);
  const normSLatest = normalizeArabicForMatch(latestChunk).split(' ').filter(w => w.length > 0);
  const normTarget = rawTargetWords.map(w => normalizeArabicForMatch(w)).filter(w => w.length > 0);
  const T = normTarget.length;

  if (T === 0) return { matchedWords: 0, totalWords: 0, isComplete: false };

  // 1. Sequential match from beginning of ayah across full session
  let matchedFromStart = 0;
  let sIdx = 0;
  for (let tIdx = 0; tIdx < T; tIdx++) {
    let found = false;
    for (let look = sIdx; look < Math.min(normSFull.length, sIdx + 3); look++) {
      if (doArabicWordsMatch(normSFull[look], normTarget[tIdx])) {
        matchedFromStart++;
        sIdx = look + 1;
        found = true;
        break;
      }
    }
    if (!found) break;
  }

  // 2. Incremental match forward from currentRevealed (handles pauses and isolated latest words)
  let incrementalMatched = currentRevealed;
  const candidateLists = [normSLatest, normSFull];
  for (const sList of candidateLists) {
    let curTest = currentRevealed;
    let startSearch = 0;
    while (curTest < T) {
      const expected = normTarget[curTest];
      let foundWord = false;
      for (let i = startSearch; i < sList.length; i++) {
        if (doArabicWordsMatch(sList[i], expected)) {
          curTest++;
          startSearch = i + 1;
          foundWord = true;
          break;
        }
      }
      if (!foundWord) break;
    }
    if (curTest > incrementalMatched) {
      incrementalMatched = curTest;
    }
  }

  const newRevealed = Math.min(T, Math.max(currentRevealed, matchedFromStart, incrementalMatched));
  const isComplete = (newRevealed === T) || (newRevealed >= T - 1 && T >= 6);

  return {
    matchedWords: newRevealed,
    totalWords: T,
    isComplete: isComplete
  };
}
window.evaluateAyahWordStream = evaluateAyahWordStream;
window.evaluateProgressiveWords = function(spokenText, targetAyahText) {
  const rawTargetWords = (targetAyahText || '').split(/\s+/).filter(w => w.length > 0);
  return evaluateAyahWordStream(spokenText, spokenText, rawTargetWords, 0);
};

// Mode Toggle Handler: 1. Einzelvers vs 2. Fortlaufend
function setTarteelReciteMode(mode) {
  tarteelState.reciteMode = mode;

  const singleBtn = document.getElementById('tarteelModeSingleBtn');
  const contBtn = document.getElementById('tarteelModeContBtn');
  const badge = document.getElementById('tarteelModeBadgeIndicator');

  if (mode === 'single') {
    if (singleBtn) {
      singleBtn.style.background = 'linear-gradient(135deg, #10b981, #047857)';
      singleBtn.style.color = '#fff';
      singleBtn.style.boxShadow = '0 2px 6px rgba(16,185,129,0.3)';
    }
    if (contBtn) {
      contBtn.style.background = 'transparent';
      contBtn.style.color = '#94a3b8';
      contBtn.style.boxShadow = 'none';
    }
    if (badge) {
      badge.textContent = getTarteelText('singleModeBadge');
      badge.style.background = 'rgba(16,185,129,0.3)';
    }
    updateTarteelStatusText(getTarteelText('singleModeDesc', tarteelState.targetAyah));
    if (typeof showToast === 'function') showToast(getTarteelText('singleActiveToast'));
  } else {
    if (contBtn) {
      contBtn.style.background = 'linear-gradient(135deg, #10b981, #047857)';
      contBtn.style.color = '#fff';
      contBtn.style.boxShadow = '0 2px 6px rgba(16,185,129,0.3)';
    }
    if (singleBtn) {
      singleBtn.style.background = 'transparent';
      singleBtn.style.color = '#94a3b8';
      singleBtn.style.boxShadow = 'none';
    }
    if (badge) {
      badge.textContent = getTarteelText('contModeBadge');
      badge.style.background = 'rgba(56,189,248,0.3)';
    }
    updateTarteelStatusText(getTarteelText('contModeDesc', tarteelState.targetAyah));
    if (typeof showToast === 'function') showToast(getTarteelText('contActiveToast'));
  }
}
window.setTarteelReciteMode = setTarteelReciteMode;

function updateTarteelStatusText(text, isSuccess, isError) {
  const statusEl = document.getElementById('tarteelTargetStatusText');
  const bannerEl = document.getElementById('tarteelVerificationBanner');
  if (statusEl) statusEl.textContent = text;
  if (bannerEl) {
    if (isSuccess) {
      bannerEl.style.background = 'rgba(16, 185, 129, 0.22)';
      bannerEl.style.borderColor = '#10b981';
      bannerEl.style.color = '#6ee7b7';
    } else if (isError) {
      bannerEl.style.background = 'rgba(239, 68, 68, 0.22)';
      bannerEl.style.borderColor = '#ef4444';
      bannerEl.style.color = '#fca5a5';
    } else {
      bannerEl.style.background = 'rgba(16, 185, 129, 0.1)';
      bannerEl.style.borderColor = 'rgba(16, 185, 129, 0.35)';
      bannerEl.style.color = '#a7f3d0';
    }
  }
}

// Step Target Verse (+1 or -1)
function stepTarteelTargetVerse(delta) {
  const verses = getTarteelVersesForPage(tarteelState.page);
  if (!verses || verses.length === 0) return;

  const curIdx = verses.findIndex(v => v.num === tarteelState.targetAyah && v.surahNum === tarteelState.surah);
  const newIdx = curIdx + delta;

  if (newIdx >= 0 && newIdx < verses.length) {
    tarteelState.targetAyah = verses[newIdx].num;
    tarteelState.surah = verses[newIdx].surahNum;
    tarteelState.ignoreSpeechBeforeTime = Date.now() + 400;
    if (delta < 0 && tarteelState.hideMode) {
      const prevKey = `${verses[curIdx].surahNum}:${verses[curIdx].num}`;
      delete tarteelState.revealed[prevKey];
      delete tarteelState.revealedWords[prevKey];
    }
    renderTarteelMushafPage();
    updateTarteelStatusText(getTarteelText(tarteelState.reciteMode === 'single' ? 'singleModeDesc' : 'contModeDesc', tarteelState.targetAyah));
  } else if (delta > 0 && tarteelState.page < 604) {
    changeTarteelPage(tarteelState.page + 1);
  } else if (delta < 0 && tarteelState.page > 1) {
    changeTarteelPage(tarteelState.page - 1);
  }
}
window.stepTarteelTargetVerse = stepTarteelTargetVerse;
window.stepTarteelAyah = stepTarteelTargetVerse;

// Rewind Page (reset all revealed back to blank)
function rewindTarteelPage() {
  tarteelState.hideMode = true;
  tarteelState.revealed = {};
  tarteelState.revealedWords = {};
  const verses = getTarteelVersesForPage(tarteelState.page);
  if (verses && verses.length > 0) {
    tarteelState.surah = verses[0].surahNum;
    tarteelState.targetAyah = verses[0].num;
  }
  tarteelState.sessionResultIndex = tarteelState.speechRecognizerLatestResultIndex || 0;
  tarteelState.ignoreSpeechBeforeTime = Date.now() + 400;
  renderTarteelMushafPage();
  updateTarteelStatusText(getTarteelText(tarteelState.reciteMode === 'single' ? 'singleModeDesc' : 'contModeDesc', tarteelState.targetAyah));
  if (typeof showToast === 'function') showToast(getTarteelText('rewindToast'));
}
window.rewindTarteelPage = rewindTarteelPage;

// Mode 1 (Book Icon): Reveal ALL verses on page (Full Mushaf Reading View)
function showAllTarteelVerses() {
  tarteelState.hideMode = false;
  const verses = getTarteelVersesForPage(tarteelState.page);
  verses.forEach(v => {
    tarteelState.revealed[`${v.surahNum}:${v.num}`] = true;
  });
  renderTarteelMushafPage();
  if (typeof showToast === 'function') showToast(getTarteelText('readingModeToast'));
}
window.showAllTarteelVerses = showAllTarteelVerses;
window.toggleTarteelReadingMode = showAllTarteelVerses;

// Mode 2 (Eye Icon): Reveal ONLY the marked target ayah, keep all other verses blank/hidden
function showOnlyTargetTarteelAyah() {
  tarteelState.hideMode = true;
  tarteelState.revealed = {};
  tarteelState.revealedWords = {};
  const targetKey = `${tarteelState.surah}:${tarteelState.targetAyah}`;
  tarteelState.revealed[targetKey] = true;
  renderTarteelMushafPage();
  if (typeof showToast === 'function') showToast('👁️ Nur Zielvers aufgedeckt');
}
window.showOnlyTargetTarteelAyah = showOnlyTargetTarteelAyah;
window.toggleTarteelHideMode = showOnlyTargetTarteelAyah;

// Change Tarteel Page
function changeTarteelPage(pNum) {
  const p = Math.max(1, Math.min(604, parseInt(pNum) || 1));
  tarteelState.page = p;
  const pInput = document.getElementById('tarteelPageInput');
  if (pInput) pInput.value = p;

  const verses = getTarteelVersesForPage(p);
  if (verses && verses.length > 0) {
    tarteelState.surah = verses[0].surahNum;
    tarteelState.targetAyah = verses[0].num;
  }
  tarteelState.revealed = {};
  tarteelState.revealedWords = {};
  tarteelState.ignoreSpeechBeforeTime = Date.now() + 400;
  renderTarteelMushafPage();
  updateTarteelStatusText(getTarteelText(tarteelState.reciteMode === 'single' ? 'singleModeDesc' : 'contModeDesc', tarteelState.targetAyah));
}
window.changeTarteelPage = changeTarteelPage;

// Sheikh Help Audio Playback
function playTarteelSheikhHelp() {
  if (tarteelState.isSheikhPlaying && tarteelState.sheikhAudio) {
    tarteelState.sheikhAudio.pause();
    tarteelState.isSheikhPlaying = false;
    const icon = document.getElementById('tarteelSheikhHelpIcon');
    if (icon) icon.className = 'fa-solid fa-headphones';
    return;
  }

  const s = tarteelState.surah || 1;
  const a = tarteelState.targetAyah || 1;
  const qari = (document.getElementById('tarteelQariSelect') && document.getElementById('tarteelQariSelect').value) || 'Alafasy_128kbps';
  const sPad = String(s).padStart(3, '0');
  const aPad = String(a).padStart(3, '0');
  const audioUrl = `https://everyayah.com/data/${qari}/${sPad}${aPad}.mp3`;

  if (!tarteelState.sheikhAudio) {
    tarteelState.sheikhAudio = new Audio();
  }
  tarteelState.sheikhAudio.src = audioUrl;
  tarteelState.sheikhAudio.play().then(() => {
    tarteelState.isSheikhPlaying = true;
    const icon = document.getElementById('tarteelSheikhHelpIcon');
    if (icon) icon.className = 'fa-solid fa-pause';
  }).catch(err => {
    console.log('Sheikh audio play notice:', err);
  });

  tarteelState.sheikhAudio.onended = () => {
    tarteelState.isSheikhPlaying = false;
    const icon = document.getElementById('tarteelSheikhHelpIcon');
    if (icon) icon.className = 'fa-solid fa-headphones';
  };
}
window.playTarteelSheikhHelp = playTarteelSheikhHelp;

// Settings & Mistakes Modal Functions
function openTarteelMistakesSheet() {
  const modal = document.getElementById('tarteelMistakesSheetModal');
  if (modal) modal.style.display = 'flex';
  renderTarteelMistakesList();
}
window.openTarteelMistakesSheet = openTarteelMistakesSheet;

function closeTarteelMistakesSheet() {
  const modal = document.getElementById('tarteelMistakesSheetModal');
  if (modal) modal.style.display = 'none';
}
window.closeTarteelMistakesSheet = closeTarteelMistakesSheet;

function toggleTarteelSetting(key, input) {
  if (tarteelState.settings) {
    tarteelState.settings[key] = input.checked;
  }
}
window.toggleTarteelSetting = toggleTarteelSetting;

function simulateTarteelMistakeDemo() {
  recordTarteelMistake(tarteelState.surah, tarteelState.targetAyah, 'Test-Fehler / نموونەی هەڵە (Demo)');
  renderTarteelMistakesList();
}
window.simulateTarteelMistakeDemo = simulateTarteelMistakeDemo;

function clearTarteelMistakesLog() {
  tarteelState.mistakesLog = [];
  tarteelState.mistakesCount = 0;
  renderTarteelMistakesList();
  if (typeof showToast === 'function') showToast(getTarteelText('rewindToast'));
}
window.clearTarteelMistakesLog = clearTarteelMistakesLog;

function recordTarteelMistake(surahNum, ayahNum, spoken) {
  tarteelState.mistakesCount++;
  const verses = getTarteelVersesForPage(tarteelState.page);
  const targetV = verses.find(v => v.num === ayahNum && v.surahNum === surahNum);
  const expected = targetV ? targetV.ar : '';

  tarteelState.mistakesLog.unshift({
    surah: surahNum,
    ayah: ayahNum,
    spoken: spoken || '...',
    expected: expected,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  });
  renderTarteelMistakesList();
}

function renderTarteelMistakesList() {
  const container = document.getElementById('tarteelMistakesLiveLogContainer');
  if (!container) return;

  if (!tarteelState.mistakesLog || tarteelState.mistakesLog.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: #64748b; font-size: 0.76rem; padding: 20px;">${getTarteelText('noMistakes')}</div>`;
    return;
  }

  let html = '';
  tarteelState.mistakesLog.slice(0, 15).forEach((m, i) => {
    html += `
      <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 10px; padding: 7px 10px; margin-bottom: 6px; font-size: 0.74rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px;">
          <span style="font-weight: 800; color: #fca5a5;">Sure ${m.surah} · Vers ${m.ayah}</span>
          <span style="color: #94a3b8; font-size: 0.64rem;">${m.time}</span>
        </div>
        <div style="color: #f87171; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${getTarteelText('recitedLabel')}: "${m.spoken}"</div>
      </div>
    `;
  });
  container.innerHTML = html;
}

// Master Speech Recognition Controller with Smart Next-Ayah Mic Tap
function toggleTarteelRecitation() {
  if (tarteelState.isRecording) {
    stopTarteelRecitation();
  } else {
    const key = `${tarteelState.surah}:${tarteelState.targetAyah}`;
    if (tarteelState.reciteMode === 'single' && tarteelState.revealed[key]) {
      const verses = getTarteelVersesForPage(tarteelState.page);
      const curIdx = verses.findIndex(v => v.num === tarteelState.targetAyah && v.surahNum === tarteelState.surah);
      if (curIdx >= 0 && curIdx < verses.length - 1) {
        tarteelState.targetAyah = verses[curIdx + 1].num;
        tarteelState.surah = verses[curIdx + 1].surahNum;
      } else if (tarteelState.page < 604) {
        changeTarteelPage(tarteelState.page + 1);
      }
      tarteelState.sessionResultIndex = tarteelState.speechRecognizerLatestResultIndex || 0;
      renderTarteelMushafPage();
    }
    startTarteelRecitation();
  }
}


window.toggleTarteelRecitation = toggleTarteelRecitation;

function startTarteelRecitation() {
  tarteelState.isRecording = true;
  tarteelState.timerSeconds = 0;
  tarteelState.ignoreSpeechBeforeTime = Date.now() + 250;
  tarteelState.sessionResultIndex = tarteelState.speechRecognizerLatestResultIndex || 0;

  const fab = document.getElementById('tarteelEmeraldFab');
  const fabIcon = document.getElementById('tarteelEmeraldFabIcon');
  const timerPill = document.getElementById('tarteelTimerPill');
  const timerDigits = document.getElementById('tarteelTimerNumbers');
  const bubble = document.getElementById('tarteelSpeechBubble');
  const liveText = document.getElementById('tarteelSpeechLiveText');
  const scoreBadge = document.getElementById('tarteelMatchScoreBadge');

  if (fab) fab.classList.add('recording');
  if (fabIcon) fabIcon.className = 'fa-solid fa-stop';
  if (timerPill) timerPill.style.display = 'flex';
  if (bubble) bubble.style.display = 'flex';
  if (liveText) liveText.textContent = getTarteelText('listening');
  if (scoreBadge) {
    scoreBadge.textContent = getTarteelText('listeningShort');
    scoreBadge.style.background = 'rgba(16,185,129,0.25)';
    scoreBadge.style.color = '#34d399';
  }

  // Timer
  if (tarteelState.timerInterval) clearInterval(tarteelState.timerInterval);
  tarteelState.timerInterval = setInterval(() => {
    tarteelState.timerSeconds++;
    const m = String(Math.floor(tarteelState.timerSeconds / 60)).padStart(2, '0');
    const s = String(tarteelState.timerSeconds % 60).padStart(2, '0');
    if (timerDigits) timerDigits.textContent = `${m}:${s}`;
  }, 1000);

  // Initialize Speech Recognition Engine (ar-SA with offline Android support)
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition) {
    try {
      tarteelState.speechRecognizer = new SpeechRecognition();
      tarteelState.speechRecognizer.lang = 'ar-SA';
      tarteelState.speechRecognizer.continuous = true;
      tarteelState.speechRecognizer.interimResults = true;
      tarteelState.speechRecognizer.maxAlternatives = 3;

      tarteelState.speechRecognizer.onresult = function(event) {
        if (!tarteelState.isRecording || tarteelState.isPacingPause) return;
        if (Date.now() < tarteelState.ignoreSpeechBeforeTime) return;

        tarteelState.speechRecognizerLatestResultIndex = event.results.length;
        const sessionStart = tarteelState.sessionResultIndex || 0;
        let fullSessionSpoken = '';
        for (let i = sessionStart; i < event.results.length; i++) {
          fullSessionSpoken += ' ' + event.results[i][0].transcript;
        }
        fullSessionSpoken = fullSessionSpoken.trim();

        const lastResult = event.results[event.results.length - 1];
        const latestChunk = (lastResult && lastResult[0]) ? lastResult[0].transcript.trim() : '';

        if (liveText) liveText.textContent = latestChunk || fullSessionSpoken;

        // Target Ayah
        const verses = getTarteelVersesForPage(tarteelState.page);
        const targetV = verses.find(v => v.num === tarteelState.targetAyah && v.surahNum === tarteelState.surah) || verses[0];
        if (!targetV) return;

        const targetKey = `${targetV.surahNum}:${targetV.num}`;
        const rawWords = (targetV.ar || '').split(/\s+/).filter(w => w.length > 0);
        const totalWords = rawWords.length;
        const currentRevealed = tarteelState.revealedWords[targetKey] || 0;

        const progress = evaluateAyahWordStream(fullSessionSpoken, latestChunk, rawWords, currentRevealed);

        // Progressive Live Word-by-Word Fill:
        if (progress.matchedWords > currentRevealed) {
          const prevCount = currentRevealed;
          tarteelState.revealedWords[targetKey] = progress.matchedWords;
          playTarteelTone('wordSuccess');
          updateProgressiveWordDOM(targetV.surahNum, targetV.num, prevCount, progress.matchedWords);
        }

        if (scoreBadge) {
          scoreBadge.textContent = getTarteelText('wordProgressBadge', progress.matchedWords, progress.totalWords);
          scoreBadge.style.background = progress.isComplete ? 'rgba(16,185,129,0.35)' : 'rgba(56,189,248,0.25)';
          scoreBadge.style.color = progress.isComplete ? '#34d399' : '#38bdf8';
        }

        if (progress.isComplete) {
          // ALL WORDS IN AYAH SUCCESSFULLY COMPLETED!
          tarteelState.sessionResultIndex = event.results.length;
          onAyahSuccessfullyRecognized(targetV, fullSessionSpoken || latestChunk);
        }
      };

      tarteelState.speechRecognizer.onerror = function(err) {
        console.log('Speech recognition event:', err.error);
        if (err.error === 'network') {
          if (typeof showToast === 'function') showToast(getTarteelText('networkNotice'));
        } else if (err.error === 'not-allowed') {
          if (typeof showToast === 'function') showToast(getTarteelText('micDeniedError'));
          stopTarteelRecitation();
        }
      };

      tarteelState.speechRecognizer.onend = function() {
        if (tarteelState.isRecording && !tarteelState.isPacingPause) {
          try { tarteelState.speechRecognizer.start(); } catch(e){}
        }
      };

      tarteelState.speechRecognizer.start();
    } catch(e) {
      console.warn('SpeechRecognition start notice:', e);
    }
  }

  // Audio Waveform Visualizer (Visual Only)
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      tarteelState.audioStream = stream;
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          tarteelState.audioContext = new AudioCtx();
          const source = tarteelState.audioContext.createMediaStreamSource(stream);
          tarteelState.analyser = tarteelState.audioContext.createAnalyser();
          tarteelState.analyser.fftSize = 256;
          source.connect(tarteelState.analyser);

          const dataArray = new Uint8Array(tarteelState.analyser.frequencyBinCount);
          function monitorMicVisuals() {
            if (!tarteelState.isRecording) return;
            tarteelState.analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
            const avg = sum / dataArray.length;
            if (fab && avg > 15) {
              fab.style.transform = `scale(${1 + Math.min(0.14, avg / 220)})`;
            } else if (fab) {
              fab.style.transform = 'scale(1)';
            }
            tarteelState.audioAnimFrame = requestAnimationFrame(monitorMicVisuals);
          }
          monitorMicVisuals();
        }
      } catch(err) {
        console.warn('AudioContext monitor notice:', err);
      }
    }).catch(err => {
      console.log('Mic stream notice:', err);
    });
  }

  updateTarteelStatusText(getTarteelText(tarteelState.reciteMode === 'single' ? 'singleModeDesc' : 'contModeDesc', tarteelState.targetAyah));
}
window.startTarteelRecitation = startTarteelRecitation;


// Success Handler: Single Mode vs Continuous Mode with Respectful Pacing
function onAyahSuccessfullyRecognized(targetV, spoken) {
  const key = `${targetV.surahNum}:${targetV.num}`;
  tarteelState.revealed[key] = true;
  tarteelState.revealedWords[key] = (targetV.ar || '').split(/\s+/).filter(w => w.length > 0).length;

  if (tarteelState.settings.soundOnMistake) {
    playTarteelTone('success');
  }

  if (navigator.vibrate) {
    try { navigator.vibrate([40, 30, 40]); } catch(e){}
  }

  const verses = getTarteelVersesForPage(tarteelState.page);
  const curIdx = verses.findIndex(v => v.num === targetV.num && v.surahNum === targetV.surahNum);

  renderTarteelMushafPage();

  if (tarteelState.reciteMode === 'single') {
    // Mode 1: Single Ayah (Einzelvers)
    stopTarteelRecitation();
    updateTarteelStatusText(getTarteelText('matchSuccess', targetV.num) + ' Â· ' + getTarteelText('singleModeDesc', targetV.num + 1), true);
    if (typeof showToast === 'function') {
      showToast(getTarteelText('matchSuccess', targetV.num));
    }
  } else {
    // Mode 2: Continuous (Fortlaufend)
    // Respectful Tajweed pacing pause (1.2 seconds) before moving to next ayah
    updateTarteelStatusText(getTarteelText('matchSuccess', targetV.num) + ' Â· ' + getTarteelText('shortPause'), true);
    tarteelState.isPacingPause = true;

    setTimeout(() => {
      tarteelState.isPacingPause = false;
      if (!tarteelState.isRecording) return;

      tarteelState.ignoreSpeechBeforeTime = Date.now() + 350;
      tarteelState.sessionResultIndex = tarteelState.speechRecognizerLatestResultIndex || 0;

      if (curIdx >= 0 && curIdx < verses.length - 1) {
        tarteelState.targetAyah = verses[curIdx + 1].num;
        tarteelState.surah = verses[curIdx + 1].surahNum;
        renderTarteelMushafPage();
        updateTarteelStatusText(getTarteelText('contModeDesc', tarteelState.targetAyah));
      } else if (tarteelState.page < 604) {
        playTarteelTone('pageComplete');
        updateTarteelStatusText(getTarteelText('pageComplete', tarteelState.page), true);
        if (typeof showToast === 'function') {
          showToast(getTarteelText('pageComplete', tarteelState.page));
        }
        setTimeout(() => {
          changeTarteelPage(tarteelState.page + 1);
        }, 700);
      } else {
        renderTarteelMushafPage();
      }
    }, 1200);
  }
}


// Mistake Handler
function onAyahRecitationMistake(targetV, spoken, accuracyPct) {
  recordTarteelMistake(targetV.surahNum, targetV.num, spoken);

  if (tarteelState.settings.soundOnMistake) {
    playTarteelTone('mistake');
  }

  updateTarteelStatusText(getTarteelText('matchMistake', targetV.num, accuracyPct), false, true);

  if (tarteelState.settings.autoSheikhCorrection) {
    playTarteelSheikhHelp();
  }
}

function stopTarteelRecitation() {
  tarteelState.isRecording = false;
  tarteelState.isPacingPause = false;

  const fab = document.getElementById('tarteelEmeraldFab');
  const fabIcon = document.getElementById('tarteelEmeraldFabIcon');
  const timerPill = document.getElementById('tarteelTimerPill');
  const bubble = document.getElementById('tarteelSpeechBubble');

  if (fab) {
    fab.classList.remove('recording');
    fab.style.transform = 'scale(1)';
  }
  if (fabIcon) fabIcon.className = 'fa-solid fa-microphone';
  if (timerPill) timerPill.style.display = 'none';
  if (bubble) bubble.style.display = 'none';

  if (tarteelState.timerInterval) {
    clearInterval(tarteelState.timerInterval);
    tarteelState.timerInterval = null;
  }
  if (tarteelState.speechRecognizer) {
    try { tarteelState.speechRecognizer.stop(); } catch(e){}
    tarteelState.speechRecognizer = null;
  }
  if (tarteelState.audioStream) {
    try { tarteelState.audioStream.getTracks().forEach(t => t.stop()); } catch(e){}
    tarteelState.audioStream = null;
  }
  if (tarteelState.audioContext) {
    try { tarteelState.audioContext.close(); } catch(e){}
    tarteelState.audioContext = null;
  }
  if (tarteelState.audioAnimFrame) {
    cancelAnimationFrame(tarteelState.audioAnimFrame);
    tarteelState.audioAnimFrame = null;
  }
}
window.stopTarteelRecitation = stopTarteelRecitation;

// Initialization & Mushaf Page Rendering (Word-by-Word Live Reveal Support)
function initTarteelStudio() {
  if (typeof tarteelState.page !== 'number' || tarteelState.page < 1) {
    tarteelState.page = 1;
  }
  const verses = getTarteelVersesForPage(tarteelState.page);
  if (verses && verses.length > 0) {
    tarteelState.surah = verses[0].surahNum;
    tarteelState.targetAyah = verses[0].num;
  }
  renderTarteelMushafPage();
  setTarteelReciteMode(tarteelState.reciteMode || 'single');
}
window.initTarteelStudio = initTarteelStudio;

function getTarteelVersesForPage(pageNum) {
  const p = Math.max(1, Math.min(604, pageNum));
  if (typeof QURAN_ALL_PAGES !== 'undefined' && QURAN_ALL_PAGES[p]) {
    return QURAN_ALL_PAGES[p];
  }
  if (typeof getPageVerses === 'function') {
    const res = getPageVerses(p);
    if (res && res.length > 0) return res;
  }
  if (typeof getVersesForSurah === 'function') {
    return getVersesForSurah(tarteelState.surah || 1);
  }
  return [];
}
window.getTarteelVersesForPage = getTarteelVersesForPage;

function updateProgressiveWordDOM(surahNum, ayahNum, prevCount, newCount) {
  for (let w = prevCount; w < newCount; w++) {
    const el = document.getElementById(`tarteelWord_${surahNum}_${ayahNum}_${w}`);
    if (el) {
      el.classList.remove('hidden');
      el.classList.add('revealed');
      const textSpan = el.querySelector('.tarteel-word-text');
      const dashSpan = el.querySelector('.tarteel-word-dash');
      if (textSpan) {
        textSpan.style.display = 'inline';
        textSpan.style.animation = 'tarteelWordPop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)';
      }
      if (dashSpan) dashSpan.style.display = 'none';
    }
  }
  const nextEl = document.getElementById(`tarteelWord_${surahNum}_${ayahNum}_${newCount}`);
  if (nextEl) {
    const nextDash = nextEl.querySelector('.tarteel-word-dash');
    if (nextDash) {
      nextDash.style.borderBottom = '2.5px solid #10b981';
    }
  }
}
window.updateProgressiveWordDOM = updateProgressiveWordDOM;

function renderTarteelMushafPage() {
  const stage = document.getElementById('tarteelFlowingVersesStage');
  const frameTitle = document.getElementById('tarteelSurahArabicTitle');
  const bismillahRow = document.getElementById('tarteelBismillahRow');
  const eyeIcon = document.getElementById('tarteelCenterEyeIcon');
  if (!stage) return;

  const verses = getTarteelVersesForPage(tarteelState.page);
  if (!verses || verses.length === 0) {
    stage.innerHTML = '<div style="text-align: center; color: #94a3b8; padding: 40px;">Seite wird geladen...</div>';
    return;
  }

  const firstV = verses[0];
  const curSurahId = (firstV && firstV.surahNum) ? firstV.surahNum : (tarteelState.surah || 1);
  tarteelState.surah = curSurahId;
  const isSurahStart = (firstV && firstV.num === 1);

  if (typeof ALL_114_SURAHS !== 'undefined') {
    const surahInfo = ALL_114_SURAHS.find(s => s.id === curSurahId) || ALL_114_SURAHS[0];
    const sArabic = surahInfo.arabic || surahInfo.name || '';
    if (frameTitle) {
      frameTitle.textContent = sArabic.startsWith('سُورَةُ') ? sArabic : `سُورَةُ ${sArabic}`;
    }
    const trigLbl = document.getElementById('tarteelSurahTriggerLabel');
    if (trigLbl) {
      trigLbl.textContent = `${surahInfo.id}. ${surahInfo.name} (${surahInfo.arabic})`;
    }
  }

  const pInput = document.getElementById('tarteelPageInput');
  if (pInput) pInput.value = tarteelState.page;

  if (bismillahRow) {
    bismillahRow.style.display = (isSurahStart && curSurahId !== 9 && curSurahId !== 1) ? 'block' : 'none';
  }

  if (eyeIcon) {
    eyeIcon.className = tarteelState.hideMode ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
  }

  let html = '';
  verses.forEach(v => {
    const key = `${v.surahNum}:${v.num}`;
    const isFullyRevealed = (!tarteelState.hideMode) || (!!tarteelState.revealed[key]);
    const isTarget = (v.num === tarteelState.targetAyah && v.surahNum === tarteelState.surah);
    
    // For Surahs other than Al-Fatiha and At-Tawbah, strip Bismillah from verse 1 text since it is rendered in bismillahRow
    let rawVerseAr = v.ar || '';
    if (v.num === 1 && v.surahNum !== 1 && v.surahNum !== 9) {
      rawVerseAr = rawVerseAr.replace(/^بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ\s*/, '')
                             .replace(/^بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ\s*/, '')
                             .trim();
    }
    const rawWords = rawVerseAr.split(/\s+/).filter(w => w.length > 0);
    const rosetteAr = (typeof toArDigits === 'function') ? toArDigits(v.num) : v.num;
    const revealedCount = tarteelState.revealedWords[key] || 0;

    if (isFullyRevealed) {
      // Complete verse revealed in full authentic Tajweed
      const cleanAr = (typeof cleanArabicText === 'function') ? cleanArabicText(rawVerseAr) : rawVerseAr;
      const tajweedHtml = (typeof applyTajweedMarkup === 'function') ? applyTajweedMarkup(cleanAr) : cleanAr;
      html += `
        <span class="tarteel-verse-inline ${isTarget ? 'active-target' : ''}" onclick="selectTarteelTargetAyah(${v.surahNum}, ${v.num})" title="Vers ${v.num}" style="${isTarget ? 'color: #059669; font-weight: 900;' : ''}">
          ${tajweedHtml}
          <span class="tarteel-rosette-icon" style="color: #059669; font-weight: 800;">۝${rosetteAr}</span>
        </span>
      `;
    } else {
      // Hifz Test Mode: Progressive Word-by-Word Live Reveal!
      let wordsHtml = '';
      rawWords.forEach((w, wIdx) => {
        const isWordRevealed = (wIdx < revealedCount);
        const cleanW = (typeof cleanArabicText === 'function') ? cleanArabicText(w) : w;
        const tajweedW = (typeof applyTajweedMarkup === 'function') ? applyTajweedMarkup(cleanW) : cleanW;
        const dashWidth = Math.max(22, Math.min(65, w.length * 9));
        const isNextExpected = (isTarget && wIdx === revealedCount);

        wordsHtml += `
          <span id="tarteelWord_${v.surahNum}_${v.num}_${wIdx}" class="tarteel-word-unit ${isWordRevealed ? 'revealed' : 'hidden'}" style="display: inline-block; margin: 0 2px; vertical-align: middle;">
            <span class="tarteel-word-text" style="display: ${isWordRevealed ? 'inline' : 'none'}; color: #059669; font-weight: 900; font-size: 1.35rem; line-height: 2;">${tajweedW}</span>
            <span class="tarteel-word-dash" style="display: ${isWordRevealed ? 'none' : 'inline-block'}; width: ${dashWidth}px; height: 16px; border-bottom: ${isNextExpected ? '2.5px solid #10b981' : '1.8px dashed #94a3b8'};"></span>
          </span>
        `;
      });

      html += `
        <span class="tarteel-verse-blank ${isTarget ? 'active-target' : ''}" onclick="selectTarteelTargetAyah(${v.surahNum}, ${v.num})" title="Vers ${v.num}: Tippe zum AuswÃ¤hlen">
          ${wordsHtml}
          <span class="tarteel-rosette-icon" style="color: ${isTarget ? '#059669' : '#64748b'}; font-weight: 800;">۝${rosetteAr}</span>
        </span>
      `;
    }
  });

  stage.innerHTML = html;
}
window.renderTarteelMushafPage = renderTarteelMushafPage;

function selectTarteelTargetAyah(surahNum, ayahNum) {
  tarteelState.surah = surahNum;
  tarteelState.targetAyah = ayahNum;
  tarteelState.ignoreSpeechBeforeTime = Date.now() + 350;
  tarteelState.sessionResultIndex = tarteelState.speechRecognizerLatestResultIndex || 0;

  renderTarteelMushafPage();
  updateTarteelStatusText(getTarteelText(tarteelState.reciteMode === 'single' ? 'singleModeDesc' : 'contModeDesc', ayahNum));
}
window.selectTarteelTargetAyah = selectTarteelTargetAyah;

function selectTarteelSurah(surahId) {
  const s = (typeof ALL_114_SURAHS !== 'undefined') ? ALL_114_SURAHS.find(item => item.id === surahId) : null;
  if (!s) return;
  tarteelState.surah = surahId;
  tarteelState.page = s.startPage || 1;
  tarteelState.targetAyah = 1;
  tarteelState.revealed = {};
  tarteelState.revealedWords = {};
  tarteelState.ignoreSpeechBeforeTime = Date.now() + 400;

  const trigLbl = document.getElementById('tarteelSurahTriggerLabel');
  if (trigLbl) {
    trigLbl.textContent = `${s.id}. ${s.name} (${s.arabic})`;
  }

  renderTarteelMushafPage();
  updateTarteelStatusText(getTarteelText(tarteelState.reciteMode === 'single' ? 'singleModeDesc' : 'contModeDesc', 1));
}
window.selectTarteelSurah = selectTarteelSurah;
