// dalail_burda_tajweed_data.js
// Complete Authentic Datasets for:
// 1. Dalā'il al-Khayrāt (10 Chapters, passage-by-passage with audio support, modeled after dalailalkhayrat.com)
// 2. Qasīda al-Burdah (10 Chapters, couplet-by-couplet with audio support, modeled after qasidaburda.com)
// 3. Official Tajweed Academy (6 Categorized Chapters, 18 Detailed Rules with Medina Color Codes & Audio Examples)
// 4. Comprehensive Quran Wordbook (Categorized Core Lexicon + Live Corpus Search & Audio)

if (!window.DALAIL_CHAPTERS || window.DALAIL_CHAPTERS.length < 11) {
window.DALAIL_CHAPTERS = [
  {
    id: 'intro',
    badgeAr: 'المقدمة',
    dayDe: 'Eröffnung',
    dayEn: 'Opening',
    dayKu: 'دەستپێک',
    titleAr: 'دعاء افتتاح دلائل الخيرات ونية القراءة',
    titleDe: 'Eröffnungsgebet vor der Lesung von Dalā\'il al-Khayrāt',
    titleEn: 'Opening Supplication of Dalā\'il al-Khayrāt',
    titleKu: 'دوعای دەستپێکی خوێندنی دەلائلولخەیرات',
    audioUrl: 'https://archive.org/download/DalailAlKhayratAudio/01_Muqaddimah.mp3',
    passages: [
      {
        ar: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۞ الحَمْدُ لِلَّهِ رَبِّ العَالَمِينَ، حَمْدًا يُوَافِي نِعَمَهُ وَيُكَافِئُ مَزِيدَهُ، يَا رَبَّنَا لَكَ الحَمْدُ كَمَا يَنْبَغِي لِجَلَالِ وَجْهِكَ وَعَظِيمِ سُلْطَانِكَ.',
        translit: 'Bismillāhir-Raḥmānir-Raḥīm. Al-ḥamdu lillāhi Rabbil-‘ālamīn, ḥamdan yuwāfī ni‘amahu wa yukāfi’u mazīdah...',
        de: 'Im Namen Allahs, des Allerbarmers, des Barmherzigen. Alles Lob gebührt Allah, dem Herrn der Welten – ein Lob, das Seinen Gaben entspricht und Seinen Zuwachs aufwiegt. O unser Herr, Dir gebührt das Lob, wie es der Majestät Deines Antlitzes und der Größe Deiner Herrschaft geziemt.',
        en: 'In the Name of Allah, the Most Compassionate, the Most Merciful. Praise be to Allah, Lord of the Worlds, a praise that fulfills His blessings and matches His increase.',
        ku: 'بە ناوی خودای بەخشندەی میهرەبان. سوپاس و ستایش بۆ خودای پەروەردگاری جیهانیان، ستایشێک کە شایستەی نیعمەتە زۆرەکانی و گەورەیی دەسەڵاتی بێت.'
      },
      {
        ar: 'سُبْحَانَكَ لَا نُحْصِي ثَنَاءً عَلَيْكَ أَنْتَ كَمَا أَثْنَيْتَ عَلَىٰ نَفْسِكَ، فَلَكَ الحَمْدُ حَتَّىٰ تَرْضَىٰ، وَلَكَ الحَمْدُ إِذَا رَضِيتَ، وَلَكَ الحَمْدُ بَعْدَ الرِّضَا.',
        translit: 'Subḥānaka lā nuḥṣī thanā’an ‘alayka Anta kamā athnayta ‘alā nafsik, falakal-ḥamdu ḥattā tarḍā...',
        de: 'Preis sei Dir! Wir vermögen Dein Lob nicht zu erfassen; Du bist so, wie Du Dich selbst gelobt hast. Dir gebührt alles Lob, bis Du zufrieden bist, Dir gebührt das Lob, wenn Du zufrieden bist, und Dir gebührt das Lob nach dem Wohlgefallen.',
        en: 'Glory be to You! We cannot enumerate Your praise; You are as You have praised Yourself. To You belongs praise until You are pleased, and after You are pleased.',
        ku: 'پاکی و بێگەردی بۆ تۆیە، ئێمە ناتوانین حەقی ستایشی تۆ بەجێ بهێنین، ستایش بۆ تۆ تا ڕازی دەبیت و دوای ڕازیبوونیشت.'
      },
      {
        ar: 'اللَّهُمَّ إِنِّي نَوَيْتُ بِصَلَاتِي عَلَىٰ النَّبِيِّ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ امْتِثَالًا لِأَمْرِكَ، وَتَصْدِيقًا لِنَبِيِّكَ سَيِّدِنَا مُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ، وَمَحَبَّةً فِيهِ وَشَوْقًا إِلَيْهِ، وَتَعْظِيمًا لِقَدْرِهِ، فَتَقَبَّلْهَا مِنِّي بِفَضْلِكَ وَإِحْسَانِكَ.',
        translit: 'Allāhumma innī nawaytu bi-ṣalātī ‘alan-Nabiyyi ṣallallāhu ‘alayhi wa sallama imtithālan li-amrika...',
        de: 'O Allah, ich beabsichtige mit meinem Segensgebet für den Propheten ﷺ die Befolgung Deines Befehls, die Bestätigung Deines Propheten Muhammad ﷺ, aus Liebe und Sehnsucht nach ihm und aus Ehrfurcht vor seinem Rang – so nimm es durch Deine Güte von mir an!',
        en: 'O Allah, I intend by my prayers upon the Prophet ﷺ to obey Your command, affirm Your Prophet Muhammad ﷺ, out of love and longing for him and reverence for his rank; so accept it from me by Your grace.',
        ku: 'خودایە من نیەتمە بە ناردنی سەڵاوات لەسەر پێغەمبەر ﷺ فەرمانی تۆ جێبەجێ بکەم و خۆشەویستی و تەعزیمی قەدری ئەو دەرببڕم، دەی بە فەزڵ و چاکەی خۆت لێم قبووڵ بفەرموو.'
      },
      {
        ar: 'إِنَّ اللَّهَ وَمَلَائِكَتَهُ يُصَلُّونَ عَلَى النَّبِيِّ ۚ يَا أَيُّهَا الَّذِينَ آمَنُوا صَلُّوا عَلَيْهِ وَسَلِّمُوا تَسْلِيمًا ۞ لَبَّيْكَ اللَّهُمَّ رَبِّي وَسَعْدَيْكَ، صَلَوَاتُ اللَّهِ البَرِّ الرَّحِيمِ، وَالمَلَائِكَةِ المُقَرَّبِينَ، وَالنَّبِيِّينَ وَالصِّدِّيقِينَ وَالشُّهَدَاءِ وَالصَّالِحِينَ، عَلَىٰ سَيِّدِنَا مُحَمَّدِ بْنِ عَبْدِ اللَّهِ خَاتَمِ النَّبِيِّينَ وَسَيِّدِ المُرْسَلِينَ.',
        translit: 'Innallāha wa malā’ikatahu yuṣallūna ‘alan-Nabiyy, yā ayyuhalladhīna āmanū ṣallū ‘alayhi wa sallimū taslīmā...',
        de: '„Gewiss, Allah und Seine Engel sprechen den Segen über den Propheten. O die ihr glaubt, sprecht den Segen über ihn und grüßt ihn mit gehörigem Gruß!“ Hier bin ich zu Deinen Diensten, o Allah! Mögen die Segnungen Allahs, der nahestehenden Engel, der Propheten, Wahrhaftigen, Märtyrer und Rechtschaffenen auf unserem Meister Muhammad ruhen.',
        en: 'Indeed, Allah and His angels send blessings upon the Prophet. O you who believe, send blessings upon him and greet him with peace!',
        ku: 'بەڕاستی خودا و فریشتەکانی سەڵاوات دەدەن لەسەر پێغەمبەر، ئەی ئەوانەی باوەڕتان هێناوە سەڵاوات و سەلامی تەواوی لەسەر بنێرن.'
      }
    ]
  },
  {
    id: 'names',
    badgeAr: 'أسماء النبي ﷺ',
    dayDe: '201 Namen',
    dayEn: '201 Names',
    dayKu: 'ناوە پیرۆزەکان',
    titleAr: 'أسماء سيدنا ونبينا محمد صلى الله عليه وسلم الشريفة',
    titleDe: 'Die edlen Namen unseres Propheten Muhammad ﷺ',
    titleEn: 'The Noble Names of Prophet Muhammad ﷺ',
    titleKu: 'ناوە پیرۆز و شکۆدارەکانی حەزرەتی موحەممەد ﷺ',
    audioUrl: 'https://archive.org/download/DalailAlKhayratAudio/02_AsmaAnNabi.mp3',
    passages: [
      {
        ar: 'سَيِّدُنَا مُحَمَّدٌ ﷺ، سَيِّدُنَا أَحْمَدُ ﷺ، سَيِّدُنَا حَامِدٌ ﷺ، سَيِّدُنَا مَحْمُودٌ ﷺ، سَيِّدُنَا قَاسِمٌ ﷺ، سَيِّدُنَا عَاقِبٌ ﷺ، سَيِّدُنَا فَاتِحٌ ﷺ، سَيِّدُنَا خَاتِمٌ ﷺ، سَيِّدُنَا حَاشِرٌ ﷺ، سَيِّدُنَا مَاحٍ ﷺ.',
        translit: 'Sayyidunā Muḥammad ﷺ, Sayyidunā Aḥmad ﷺ, Sayyidunā Ḥāmid ﷺ, Sayyidunā Maḥmūd ﷺ, Sayyidunā Qāsim ﷺ, Sayyidunā ‘Āqib ﷺ, Sayyidunā Fātiḥ ﷺ, Sayyidunā Khātim ﷺ...',
        de: 'Unser Meister Muhammad ﷺ (der Gepriesene), Ahmad ﷺ (der am meisten Lobende), Hamid ﷺ, Mahmud ﷺ, Qasim ﷺ (der Verteiler), Aqib ﷺ, Fatih ﷺ (der Eröffner), Khatim ﷺ (das Siegel der Propheten), Hashir ﷺ, Mahi ﷺ.',
        en: 'Our Master Muhammad ﷺ, Ahmad ﷺ, Hamid ﷺ, Mahmud ﷺ, Qasim ﷺ, Aqib ﷺ, Fatih ﷺ, Khatim ﷺ, Hashir ﷺ, Mahi ﷺ.',
        ku: 'گەورەمان موحەممەد ﷺ، ئەحمەد ﷺ، حامید ﷺ، مەحموود ﷺ، قاسم ﷺ، عاقیب ﷺ، فاتیح ﷺ، خاتیم ﷺ، حاشیر ﷺ، ماحی ﷺ.'
      },
      {
        ar: 'سَيِّدُنَا رَسُولُ الرَّحْمَةِ ﷺ، سَيِّدُنَا نَبِيُّ التَّوْبَةِ ﷺ، سَيِّدُنَا حَبِيبُ اللَّهِ ﷺ، سَيِّدُنَا صَفِيُّ اللَّهِ ﷺ، سَيِّدُنَا نَجِيُّ اللَّهِ ﷺ، سَيِّدُنَا كَلِيمُ اللَّهِ ﷺ، سَيِّدُنَا صَادِقٌ ﷺ، سَيِّدُنَا أَمِينٌ ﷺ.',
        translit: 'Sayyidunā Rasūlur-Raḥmah ﷺ, Sayyidunā Nabiyyut-Tawbah ﷺ, Sayyidunā Ḥabībullāh ﷺ, Sayyidunā Ṣafiyyullāh ﷺ, Sayyidunā Ṣādiq ﷺ, Sayyidunā Amīn ﷺ...',
        de: 'Unser Meister, der Gesandte der Barmherzigkeit ﷺ, der Prophet der Reue ﷺ, der Geliebte Allahs ﷺ, der Auserwählte Allahs ﷺ, der Vertraute Allahs ﷺ, der Wahrhaftige ﷺ, der Vertrauenswürdige ﷺ.',
        en: 'Our Master, the Messenger of Mercy ﷺ, the Prophet of Repentance ﷺ, the Beloved of Allah ﷺ, the Chosen of Allah ﷺ, the Truthful ﷺ, the Trustworthy ﷺ.',
        ku: 'گەورەمان پێغەمبەری ڕەحمەت ﷺ، پێغەمبەری تەوبە ﷺ، خۆشەویستی خودا ﷺ، هەڵبژاردەی خودا ﷺ، ڕاستگۆ و ئەمین ﷺ.'
      },
      {
        ar: 'سَيِّدُنَا هَادٍ ﷺ، سَيِّدُنَا مَهْدِيٌّ ﷺ، سَيِّدُنَا مُقْتَفٍ ﷺ، سَيِّدُنَا نُورٌ ﷺ، سَيِّدُنَا سِرَاجٌ ﷺ، سَيِّدُنَا مِصْبَاحٌ ﷺ، سَيِّدُنَا هُدًى ﷺ، سَيِّدُنَا رَحْمَةٌ لِلْعَالَمِينَ ﷺ، سَيِّدُنَا شَفِيعٌ مُشَفَّعٌ ﷺ.',
        translit: 'Sayyidunā Hādin ﷺ, Sayyidunā Mahdiyyun ﷺ, Sayyidunā Nūrun ﷺ, Sayyidunā Sirājun Munīr ﷺ, Sayyidunā Raḥmatul-lil-‘ālamīn ﷺ, Sayyidunā Shafī‘un Mushaffa‘ ﷺ.',
        de: 'Unser Meister, der Rechtleitende ﷺ, das Licht ﷺ, die leuchtende Lampe ﷺ, die Barmherzigkeit für alle Welten ﷺ, der angenommene Fürsprecher ﷺ.',
        en: 'Our Master, the Guide ﷺ, the Light ﷺ, the Illuminating Lamp ﷺ, Mercy to the Worlds ﷺ, the Accepted Intercessor ﷺ.',
        ku: 'گەورەمان ڕێنموونیکەر ﷺ، نوور و چرای درەوشاوە ﷺ، ڕەحمەت بۆ هەموو جیهانیان ﷺ، تکاکاری وەرگیراو ﷺ.'
      },
      {
        ar: 'اللَّهُمَّ بِجَاهِ هَٰذِهِ الأَسْمَاءِ الشَّرِيفَةِ المُبَارَكَةِ، صَلِّ وَسَلِّمْ وَبَارِكْ عَلَىٰ مُسَمَّاهَا سَيِّدِنَا وَمَوْلَانَا مُحَمَّدٍ وَعَلَىٰ آلِهِ وَصَحْبِهِ أَجْمَعِينَ، وَاجْعَلْنَا اللَّهُمَّ مِنْ أَهْلِ شَفَاعَتِهِ وَمَحَبَّتِهِ.',
        translit: 'Allāhumma bi-jāhi hādhihil-asmā’ish-sharīfatil-mubārakati ṣalli wa sallim wa bārik ‘alā musammāhā Sayyidinā Muḥammad...',
        de: 'O Allah, um der Würde dieser edlen und gesegneten Namen willen, segne und grüße ihren Träger, unseren Meister Muhammad, sowie seine Familie und alle seine Gefährten, und mache uns zu den Leuten seiner Fürsprache und Liebe!',
        en: 'O Allah, by the honor of these noble and blessed names, send blessings and peace upon their bearer, our Master Muhammad, his family and companions, and grant us his intercession.',
        ku: 'خودایە بە ڕێز و پیرۆزی ئەم ناوە شکۆدارانە، سەڵاوات و سەلام ببارێنە بەسەر خاوەنەکەیدا حەزرەتی موحەممەد ﷺ و بمانگەیەنە بەر شەفاعەت و خۆشەویستی ئەو.'
      }
    ]
  },
  {
    id: 'hizb1',
    badgeAr: 'الحزب الأول',
    dayDe: 'Montag (Hizb 1)',
    dayEn: 'Monday (Hizb 1)',
    dayKu: 'دووشەممە (حزبی ١)',
    titleAr: 'الحزب الأول — وِرد يوم الاثنين من دلائل الخيرات',
    titleDe: '1. Hizb (Montag) — Vollständiger Segens-Wird',
    titleEn: '1st Hizb (Monday) — Complete Litany of Blessings',
    titleKu: 'حزبی یەکەم (ڕۆژی دووشەممە) لە دەلائلولخەیرات',
    audioUrl: 'https://archive.org/download/DalailAlKhayratAudio/03_Hizb1_Monday.mp3',
    passages: [
      {
        ar: 'اللَّهُمَّ صَلِّ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ وَأَزْوَاجِهِ وَذُرِّيَّتِهِ، كَمَا صَلَّيْتَ عَلَىٰ سَيِّدِنَا إِبْرَاهِيمَ، وَبَارِكْ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ وَأَزْوَاجِهِ وَذُرِّيَّتِهِ، كَمَا بَارَكْتَ عَلَىٰ آلِ سَيِّدِنَا إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ.',
        translit: 'Allāhumma ṣalli ‘alā Sayyidinā Muḥammadin wa azwājihi wa dhurriyyatihi kamā ṣallayta ‘alā Sayyidinā Ibrāhīm...',
        de: 'O Allah, segne unseren Meister Muhammad, seine Gattinnen und seine Nachkommenschaft, wie Du unseren Meister Abraham gesegnet hast, und schenke Segen unserem Meister Muhammad, seinen Gattinnen und seiner Nachkommenschaft, wie Du die Familie unseres Meisters Abraham gesegnet hast; gewiss, Du bist lobpreiswürdig, ruhmvoll.',
        en: 'O Allah, bless our Master Muhammad, his spouses and his progeny, as You blessed our Master Abraham, and grant barakah to our Master Muhammad, his spouses and his progeny, as You granted barakah to the family of Abraham; indeed You are Praiseworthy, Glorious.',
        ku: 'خودایە سەڵاوات و بەرەکەت بڕێژە بەسەر گەورەمان موحەممەد و خێزان و نەوەکانیدا، هەروەک سەڵاوات و بەرەکەتت ڕشت بەسەر حەزرەتی ئیبراهیم و بنەماڵەکەیدا، بەڕاستی تۆ ستایشکراو و خاوەن شکۆیت.'
      },
      {
        ar: 'اللَّهُمَّ صَلِّ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ وَعَلَىٰ آلِهِ كَمَا صَلَّيْتَ عَلَىٰ سَيِّدِنَا إِبْرَاهِيمَ، وَبَارِكْ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ وَعَلَىٰ آلِ سَيِّدِنَا مُحَمَّدٍ كَمَا بَارَكْتَ عَلَىٰ آلِ سَيِّدِنَا إِبْرَاهِيمَ فِي العَالَمِينَ إِنَّكَ حَمِيدٌ مَجِيدٌ.',
        translit: 'Allāhumma ṣalli ‘alā Sayyidinā Muḥammadin wa ‘alā ālihi kamā ṣallayta ‘alā Sayyidinā Ibrāhīm fil-‘ālamīna innaka Ḥamīdun Majīd.',
        de: 'O Allah, segne unseren Meister Muhammad und seine Familie, wie Du unseren Meister Abraham gesegnet hast, und segne unseren Meister Muhammad und seine Familie in allen Welten; gewiss, Du bist lobpreiswürdig, ruhmvoll.',
        en: 'O Allah, bless our Master Muhammad and his family as You blessed our Master Abraham in all the worlds; indeed You are Praiseworthy, Glorious.',
        ku: 'خودایە دروود و سەڵاوات بنێرە بۆ گەورەمان موحەممەد و بنەماڵەکەی لە هەموو جیهانەکاندا، بەڕاستی تۆ ستایشکراو و مەزنیت.'
      },
      {
        ar: 'اللَّهُمَّ صَلِّ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ عَبْدِكَ وَرَسُولِكَ، وَصَلِّ عَلَىٰ المُؤْمِنِينَ وَالمُؤْمِنَاتِ، وَالمُسْلِمِينَ وَالمُسْلِمَاتِ.',
        translit: 'Allāhumma ṣalli ‘alā Sayyidinā Muḥammadin ‘abdika wa rasūlika, wa ṣalli ‘alal-mu’minīna wal-mu’mināti wal-muslimīna wal-muslimāt.',
        de: 'O Allah, segne unseren Meister Muhammad, Deinen Diener und Gesandten, und segne die gläubigen Männer und gläubigen Frauen, die muslimischen Männer und muslimischen Frauen.',
        en: 'O Allah, bless our Master Muhammad, Your servant and messenger, and bless the believing men and believing women, and the Muslim men and Muslim women.',
        ku: 'خودایە سەڵاوات بنێرە بۆ گەورەمان موحەممەد بەندە و پێغەمبەری تۆ، و ڕەحمەت و دروود بنێرە بۆ پیاوان و ژنانی ئیماندار و موسڵمان.'
      },
      {
        ar: 'اللَّهُمَّ صَلِّ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ وَعَلَىٰ آلِهِ عَدَدَ مَا أَحَاطَ بِهِ عِلْمُكَ، وَأَحْصَاهُ كِتَابُكَ، وَشَهِدَتْ بِهِ مَلَائِكَتُكَ، صَلَاةً دَائِمَةً تَدُومُ بِدَوَامِ مُلْكِ اللَّهِ.',
        translit: 'Allāhumma ṣalli ‘alā Sayyidinā Muḥammadin wa ‘alā ālihi ‘adada mā aḥāṭa bihi ‘ilmuka wa aḥṣāhu kitābuka...',
        de: 'O Allah, segne unseren Meister Muhammad und seine Familie nach der Anzahl dessen, was Dein Wissen umfasst, Dein Buch verzeichnet und Deine Engel bezeugen – ein ewiges Segensgebet, das währt, solange das Reich Allahs währt.',
        en: 'O Allah, bless our Master Muhammad and his family according to the number of all that Your knowledge encompasses, Your Book records, and Your angels witness—an everlasting blessing enduring with the kingdom of Allah.',
        ku: 'خودایە سەڵاوات بنێرە بۆ گەورەمان موحەممەد و بنەماڵەکەی بە ئەندازەی هەموو ئەوەی زانستی تۆ دەوری داوە و کتێبی تۆ تۆماری کردووە و فریشتەکانت شایەتییان لەسەر داوە.'
      },
      {
        ar: 'اللَّهُمَّ صَلِّ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ الَّذِي مَلَأْتَ قَلْبَهُ مِنْ جَلَالِكَ، وَعَيْنَهُ مِنْ جَمَالِكَ، فَأَصْبَحَ فَرِحًا مُؤَيَّدًا مَنْصُورًا، وَعَلَىٰ آلِهِ وَصَحْبِهِ وَسَلِّمْ تَسْلِيمًا وَالحَمْدُ لِلَّهِ عَلَىٰ ذَٰلِكَ.',
        translit: 'Allāhumma ṣalli ‘alā Sayyidinā Muḥammadinilladhī mala’ta qalbahu min jalālika, wa ‘aynahu min jamālika, fa-aṣbaḥa fariḥan mu’ayyadan manṣūrā...',
        de: 'O Allah, segne unseren Meister Muhammad, dessen Herz Du mit Deiner Erhabenheit und dessen Auge Du mit Deiner Schönheit erfüllt hast, sodass er froh, gestärkt und siegreich wurde, sowie seine Familie und Gefährten, und alles Lob gebührt Allah dafür!',
        en: 'O Allah, bless our Master Muhammad whose heart You filled with Your majesty and whose eye You filled with Your beauty, so he became joyful, supported, and victorious, and upon his family and companions.',
        ku: 'خودایە سەڵاوات بنێرە بۆ گەورەمان موحەممەد کە دڵی پیرۆزیت پڕ کرد لە شکۆی خۆت و چاوی پیرۆزیت پڕ کرد لە جوانیی خۆت، تا بووە دڵخۆش و پشتیوانیکراو و سەرکەوتوو.'
      },
      {
        ar: 'اللَّهُمَّ صَلِّ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ حَتَّىٰ لَا يَبْقَىٰ مِنَ الصَّلَاةِ شَيْءٌ، وَارْحَمْ سَيِّدَنَا مُحَمَّدًا حَتَّىٰ لَا يَبْقَىٰ مِنَ الرَّحْمَةِ شَيْءٌ، وَبَارِكْ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ حَتَّىٰ لَا يَبْقَىٰ مِنَ البَرَكَةِ شَيْءٌ، وَسَلِّمْ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ حَتَّىٰ لَا يَبْقَىٰ مِنَ السَّلَامِ شَيْءٌ.',
        translit: 'Allāhumma ṣalli ‘alā Sayyidinā Muḥammadin ḥattā lā yabqā minaṣ-ṣalāti shay’, warḥam Sayyidanā Muḥammadan ḥattā lā yabqā minar-raḥmati shay’...',
        de: 'O Allah, segne unseren Meister Muhammad, bis vom Segen nichts mehr übrigbleibt; erbarme Dich unseres Meisters Muhammad, bis von der Barmherzigkeit nichts mehr übrigbleibt; schenke Segenskraft unserem Meister Muhammad, bis vom Segen nichts mehr übrigbleibt, und grüße unseren Meister Muhammad, bis vom Friedensgruß nichts mehr übrigbleibt!',
        en: 'O Allah, send blessings upon our Master Muhammad until no blessing remains unbestowed; have mercy upon our Master Muhammad until no mercy remains unbestowed; bless our Master Muhammad until no barakah remains; and grant peace to our Master Muhammad until no peace remains.',
        ku: 'خودایە سەڵاوات و ڕەحمەت و بەرەکەت و سەلامی بێکۆتایی ببارێنە بەسەر گەورەمان موحەممەددا تا هیچ لە سەڵاوات و ڕەحمەت و بەرەکەت و سەلام نامێنێتەوە نەیبەخشیت پێی.'
      }
    ]
  },
  {
    id: 'hizb2',
    badgeAr: 'الحزب الثاني',
    dayDe: 'Dienstag (Hizb 2)',
    dayEn: 'Tuesday (Hizb 2)',
    dayKu: 'سێشەممە (حزبی ٢)',
    titleAr: 'الحزب الثاني — وِرد يوم الثلاثاء من دلائل الخيرات',
    titleDe: '2. Hizb (Dienstag) — Vollständiger Segens-Wird',
    titleEn: '2nd Hizb (Tuesday) — Complete Litany of Blessings',
    titleKu: 'حزبی دووەم (ڕۆژی سێشەممە) لە دەلائلولخەیرات',
    audioUrl: 'https://archive.org/download/DalailAlKhayratAudio/04_Hizb2_Tuesday.mp3',
    passages: [
      {
        ar: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ بِأَسْمَائِكَ العِظَامِ مَا عَلِمْتُ مِنْهَا وَمَا لَمْ أَعْلَمْ، وَبِالأَسْمَاءِ الَّتِي سَمَّيْتَ بِهَا نَفْسَكَ أَنْ تُصَلِّيَ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ عَبْدِكَ وَنَبِيِّكَ وَرَسُولِكَ عَدَدَ مَا خَلَقْتَ مِنْ قَبْلِ أَنْ تَكُونَ السَّمَاءُ مَبْنِيَّةً، وَالأَرْضُ مَدْحِيَّةً، وَالجِبَالُ مُرْسَاةً، وَالعُيُونُ مُنْفَجِرَةً، وَالأَنْهَارُ مُنْهَمِرَةً.',
        translit: 'Allāhumma innī as’aluka bi-asmā’ikal-‘iẓāmi mā ‘alimtu minhā wa mā lam a‘lam... an tuṣalliya ‘alā Sayyidinā Muḥammadin ‘abdika wa nabiyyika wa rasūlik...',
        de: 'O Allah, ich bitte Dich bei Deinen gewaltigen Namen – jenen, die ich kenne, und jenen, die ich nicht kenne –, unseren Meister Muhammad, Deinen Diener, Propheten und Gesandten zu segnen nach der Anzahl alles dessen, was Du erschaffen hast, noch bevor der Himmel erbaut, die Erde ausgebreitet, die Berge verankert und die Flüsse strömend gemacht wurden!',
        en: 'O Allah, I ask You by Your mighty Names, those I know and those I do not know, to send blessings upon our Master Muhammad, Your servant, Prophet, and Messenger, to the number of all You created before the sky was built, the earth spread out, and the mountains anchored.',
        ku: 'خودایە داوات لێدەکەم بە ناوە مەزنەکانت، ئەوانەی دەیانزانم و ئەوانەشی نایانزانم، سەڵاوات بنێریت بۆ گەورەمان موحەممەد بە ژمارەی هەرچی دروستت کردووە پێش ئەوەی ئاسمان بونیاد بنرێت و زەوی ڕابخرێت و چیاکان دابکۆترێن.'
      },
      {
        ar: 'اللَّهُمَّ صَلِّ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ عَدَدَ مَا خَلَقْتَ، وَصَلِّ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ مِلْءَ مَا خَلَقْتَ، وَصَلِّ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ زِنَةَ مَا خَلَقْتَ، وَصَلِّ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ مِدَادَ كَلِمَاتِكَ.',
        translit: 'Allāhumma ṣalli ‘alā Sayyidinā Muḥammadin ‘adada mā khalaqta, wa mil’a mā khalaqta, wa zinata mā khalaqta, wa midāda kalimātik.',
        de: 'O Allah, segne unseren Meister Muhammad nach der Anzahl dessen, was Du erschaffen hast; segne ihn nach der Fülle dessen, was Du erschaffen hast; segne ihn nach dem Gewicht dessen, was Du erschaffen hast, und nach der Tinte Deiner Worte!',
        en: 'O Allah, bless our Master Muhammad to the number of what You created, the fullness of what You created, the weight of what You created, and the ink of Your words.',
        ku: 'خودایە سەڵاوات بنێرە بۆ گەورەمان موحەممەد بە ژمارەی دروستکراوەکانت، بە پڕیی دروستکراوەکانت، بە کێشی دروستکراوەکانت و بە مەرەکەبی وشە بێکۆتاییەکانت.'
      },
      {
        ar: 'اللَّهُمَّ صَلِّ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ صَلَاةً تَمْلَأُ خَزَائِنَ اللَّهِ نُورًا، وَتَكُونُ لَنَا وَلِلْمُؤْمِنِينَ فَرَجًا وَفَرَحًا وَسُرُورًا، وَعَلَىٰ آلِهِ وَصَحْبِهِ وَسَلِّمْ تَسْلِيمًا كَثِيرًا.',
        translit: 'Allāhumma ṣalli ‘alā Sayyidinā Muḥammadin ṣalātan tamla’u khazā’inallāhi nūran, wa takūnu lanā wa lil-mu’minīna farajan wa faraḥan wa surūrā.',
        de: 'O Allah, segne unseren Meister Muhammad mit einem Segen, der die Schatzkammern Allahs mit Licht erfüllt und für uns und die Gläubigen Erleichterung, Freude und Glückseligkeit bringt!',
        en: 'O Allah, bless our Master Muhammad with a prayer that fills the treasuries of Allah with light and becomes for us and the believers relief, joy, and happiness.',
        ku: 'خودایە سەڵاوات بنێرە بۆ گەورەمان موحەممەد، سەڵاواتێک کە گەنجینەکانی خودا پڕ بکات لە نوور و بۆ ئێمە و ئیمانداران ببێتە مایەی کرانەوە و خۆشی و شادی.'
      },
      {
        ar: 'اللَّهُمَّ صَلِّ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ نُورِ الهُدَىٰ، وَالقَائِدِ إِلَىٰ الخَيْرِ، وَالدَّاعِي إِلَىٰ الرُّشْدِ، نَبِيِّ الرَّحْمَةِ، وَإِمَامِ المُتَّقِينَ، وَرَسُولِ رَبِّ العَالَمِينَ، لَا نَبِيَّ بَعْدَهُ، كَمَا بَلَّغَ رِسَالَتَكَ، وَنَصَحَ لِعِبَادِكَ، وَتَلَا آيَاتِكَ، وَأَقَامَ حُدُودَكَ، وَوَفَىٰ بِعَهْدِكَ، وَأَنْفَذَ حُكْمَكَ، وَأَمَرَ بِطَاعَتِكَ، وَنَهَىٰ عَنْ مَعْصِيَتِكَ.',
        translit: 'Allāhumma ṣalli ‘alā Sayyidinā Muḥammadin nūril-hudā, wal-qā’idi ilal-khayr, wad-dā‘ī ilar-rushd, nabiyyir-raḥmah, wa imāmil-muttaqīn...',
        de: 'O Allah, segne unseren Meister Muhammad, das Licht der Rechtleitung, den Führer zum Guten und Rufer zur Besonnenheit, den Propheten der Barmherzigkeit und das Vorbild der Gottesfürchtigen, da er Deine Botschaft überbracht, Deinen Dienern aufrichtig geraten, Deine Verse verlesen und Dein Gebot erfüllt hat!',
        en: 'O Allah, bless our Master Muhammad, the Light of Guidance, Leader to goodness, Caller to righteousness, Prophet of Mercy, and Imam of the pious, as he conveyed Your message, advised Your servants, and recited Your verses.',
        ku: 'خودایە سەڵاوات بنێرە بۆ گەورەمان موحەممەد، نووری هیدایەت و پێشەوای خێر و بانگخواز بۆ ڕێگای ڕاست، پێغەمبەری ڕەحمەت و پێشەوای پارێزکاران، کە پەیامی تۆی بە تەواوی گەیاند.'
      }
    ]
  },
  {
    id: 'hizb3',
    badgeAr: 'الحزب الثالث',
    dayDe: 'Mittwoch (Hizb 3)',
    dayEn: 'Wednesday (Hizb 3)',
    dayKu: 'چوارشەممە (حزبی ٣)',
    titleAr: 'الحزب الثالث — وِرد يوم الأربعاء من دلائل الخيرات',
    titleDe: '3. Hizb (Mittwoch) — Vollständiger Segens-Wird',
    titleEn: '3rd Hizb (Wednesday) — Complete Litany of Blessings',
    titleKu: 'حزبی سێیەم (ڕۆژی چوارشەممە) لە دەلائلولخەیرات',
    audioUrl: 'https://archive.org/download/DalailAlKhayratAudio/05_Hizb3_Wednesday.mp3',
    passages: [
      {
        ar: 'اللَّهُمَّ صَلِّ عَلَىٰ رُوحِ سَيِّدِنَا مُحَمَّدٍ فِي الأَرْوَاحِ، وَعَلَىٰ جَسَدِهِ فِي الأَجْسَادِ، وَعَلَىٰ قَبْرِهِ فِي القُبُورِ، وَعَلَىٰ آلِهِ وَصَحْبِهِ وَسَلِّمْ.',
        translit: 'Allāhumma ṣalli ‘alā rūḥi Sayyidinā Muḥammadin fil-arwāḥ, wa ‘alā jasadihi fil-ajsād, wa ‘alā qabrihi fil-qubūr, wa ‘alā ālihi wa ṣaḥbihi wa sallim.',
        de: 'O Allah, segne die Seele unseres Meisters Muhammad unter den Seelen, seinen Körper unter den Körpern und sein Grab unter den Gräbern, sowie seine Familie und seine Gefährten, und schenke ihnen Frieden!',
        en: 'O Allah, send blessings upon the soul of our Master Muhammad among all souls, upon his body among all bodies, and upon his grave among all graves, and upon his family and companions.',
        ku: 'خودایە سەڵاوات بنێرە بۆ ڕۆحی پاکی گەورەمان موحەممەد لە ناو ڕۆحەکاندا، و بۆ جەستەی پیرۆزی لە ناو جەستەکاندا، و بۆ گڵکۆی پیرۆزی لە ناو گۆڕەکاندا.'
      },
      {
        ar: 'اللَّهُمَّ صَلِّ صَلَاةً كَامِلَةً وَسَلِّمْ سَلَامًا تَامًّا عَلَىٰ سَيِّدِنَا مُحَمَّدٍ الَّذِي تَنْحَلُّ بِهِ العُقَدُ، وَتَنْفَرِجُ بِهِ الكُرَبُ، وَتُقْضَىٰ بِهِ الحَوَائِجُ، وَتُنَالُ بِهِ الرَّغَائِبُ وَحُسْنُ الخَوَاتِيمِ، وَيُسْتَسْقَى الغَمَامُ بِوَجْهِهِ الكَرِيمِ، وَعَلَىٰ آلِهِ وَصَحْبِهِ فِي كُلِّ لَمْحَةٍ وَنَفَسٍ بِعَدَدِ كُلِّ مَعْلُومٍ لَكَ.',
        translit: 'Allāhumma ṣalli ṣalātan kāmilatan wa sallim salāman tāmman ‘alā Sayyidinā Muḥammadinilladhī tanḥallu bihil-‘uqad, wa tanfariju bihil-kurab...',
        de: 'O Allah, schenke ein vollkommenes Segensgebet und vollständigen Frieden unserem Meister Muhammad, durch den Knoten gelöst, Kümmernisse vertrieben, Bedürfnisse erfüllt, Wünsche und ein gutes Ende erlangt werden, und um dessen edlen Antlitzes willen die Wolken um Regen gebeten werden – bei jedem Augenblick und Atemzug nach der Anzahl alles Dir Bekannten!',
        en: 'O Allah, bestow a complete blessing and perfect peace upon our Master Muhammad, by whom knots are untied, distresses relieved, needs fulfilled, aspirations and good endings attained, in every blink and breath by the number of all things known to You.',
        ku: 'خودایە سەڵاواتێکی تەواو و سەلامێکی بێکەموکوڕی ببارێنە بەسەر گەورەمان موحەممەد کە بە هۆیەوە گرێکان دەکرێنەوە و ناڕەحەتییەکان لادەچن و پێداویستییەکان جێبەجێ دەبن و عاقیبەت خێری بەدەست دێت، لە هەموو چرکە و هەناسەیەکدا.'
      },
      {
        ar: 'اللَّهُمَّ صَلِّ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ عَدَدَ القَطْرِ وَالمَطَرِ، وَصَلِّ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ عَدَدَ وَرَقِ الشَّجَرِ، وَصَلِّ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ عَدَدَ دَوَابِّ القَفْرِ وَالبَحْرِ، وَصَلِّ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ عَدَدَ الرَّمْلِ وَالحَصَىٰ، وَصَلِّ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ عَدَدَ أَنْفَاسِ الخَلَائِقِ.',
        translit: 'Allāhumma ṣalli ‘alā Sayyidinā Muḥammadin ‘adadal-qaṭri wal-maṭar, wa ‘adada waraqish-shajar, wa ‘adadar-ramli wal-ḥaṣā, wa ‘adada anfāsil-khalā’iq.',
        de: 'O Allah, segne unseren Meister Muhammad nach der Anzahl der Regentropfen, nach der Anzahl der Blätter der Bäume, nach der Anzahl der Geschöpfe an Land und im Meer, nach der Anzahl der Sandkörner und Kieselsteine und nach der Anzahl der Atemzüge aller Geschöpfe!',
        en: 'O Allah, bless our Master Muhammad to the number of raindrops, the leaves of trees, the creatures of land and sea, the grains of sand and pebbles, and the breaths of all creation.',
        ku: 'خودایە سەڵاوات بنێرە بۆ گەورەمان موحەممەد بە ژمارەی دڵۆپەکانی باران و گەڵای دارەکان و لم و چەو و بە ژمارەی هەناسەی هەموو دروستکراوان.'
      },
      {
        ar: 'اللَّهُمَّ ابْعَثْهُ مَقَامًا مَحْمُودًا يَغْبِطُهُ بِهِ الأَوَّلُونَ وَالآخِرُونَ، اللَّهُمَّ عَظِّمْ بُرْهَانَهُ، وَأَفْلِجْ حُجَّتَهُ، وَأَبْلِجْ سُلْطَانَهُ، وَتَقَبَّلْ شَفَاعَتَهُ فِي أُمَّتِهِ، وَاحْشُرْنَا فِي زُمْرَتِهِ وَتَحْتَ لِوَائِهِ غَيْرَ خَزَايَا وَلَا نَادِمِينَ.',
        translit: 'Allāhummab-‘athhu maqāman maḥmūdan yaghbiṭuhu bihil-awwalūna wal-ākhirūn... waḥshurnā fī zumratihi wa taḥta liwā’ih.',
        de: 'O Allah, erhebe ihn zu dem lobenswerten Rang (Maqām Maḥmūd), um den ihn die Ersten und die Letzten beneiden! Nimm seine Fürsprache für seine Gemeinschaft an und versammle uns in seiner Schar und unter seinem Banner, ohne Schande und ohne Reue!',
        en: 'O Allah, raise him to the Praised Station envied by the first and the last, accept his intercession for his Ummah, and gather us in his company and under his banner without disgrace or regret.',
        ku: 'خودایە بیگەیەنە بە مەقامی مەحموود و شەفاعەتی بۆ ئوممەتەکەی قبووڵ بفەرموو و لە ژێر ئاڵای ئەودا بە سەربەرزی کۆمان بکەرەوە.'
      }
    ]
  },
  {
    id: 'hizb4',
    badgeAr: 'الحزب الرابع',
    dayDe: 'Donnerstag (Hizb 4)',
    dayEn: 'Thursday (Hizb 4)',
    dayKu: 'پێنجشەممە (حزبی ٤)',
    titleAr: 'الحزب الرابع — وِرد يوم الخميس من دلائل الخيرات',
    titleDe: '4. Hizb (Donnerstag) — Vollständiger Segens-Wird',
    titleEn: '4th Hizb (Thursday) — Complete Litany of Blessings',
    titleKu: 'حزبی چوارەم (ڕۆژی پێنجشەممە) لە دەلائلولخەیرات',
    audioUrl: 'https://archive.org/download/DalailAlKhayratAudio/06_Hizb4_Thursday.mp3',
    passages: [
      {
        ar: 'اللَّهُمَّ صَلِّ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ الفَاتِحِ لِمَا أُغْلِقَ، وَالخَاتِمِ لِمَا سَبَقَ، نَاصِرِ الحَقِّ بِالحَقِّ، وَالهَادِي إِلَىٰ صِرَاطِكَ المُسْتَقِيمِ، وَعَلَىٰ آلِهِ حَقَّ قَدْرِهِ وَمِقْدَارِهِ العَظِيمِ.',
        translit: 'Allāhumma ṣalli ‘alā Sayyidinā Muḥammadinil-Fātiḥi limā ughliqa, wal-Khātimi limā sabaqa, Nāṣiril-ḥaqqi bil-ḥaqqi, wal-Hādī ilā ṣirāṭikal-mustaqīm...',
        de: 'O Allah, segne unseren Meister Muhammad, den Eröffner dessen, was verschlossen war, und das Siegel dessen, was voranging, den Helfer der Wahrheit durch die Wahrheit und den Führer zu Deinem geraden Weg, sowie seine Familie entsprechend seinem hohen Rang und seinem gewaltigen Maß!',
        en: 'O Allah, bless our Master Muhammad, the Opener of what was closed, the Seal of what preceded, the Helper of truth by the truth, and the Guide to Your straight path, and upon his family according to his عظيم rank and measure.',
        ku: 'خودایە سەڵاوات بنێرە بۆ گەورەمان موحەممەد، کرانەوەی هەرچی داخرابوو، مۆری پێشینان، سەرخەری حەق بە حەق و ڕێنموونیکەر بۆ ڕێگای ڕاستی تۆ، بە ئەندازەی پلە و پایەی مەزنی ئەو.'
      },
      {
        ar: 'اللَّهُمَّ صَلِّ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ بَحْرِ أَنْوَارِكَ، وَمَعْدِنِ أَسْرَارِكَ، وَلِسَانِ حُجَّتِكَ، وَعَرُوسِ مَمْلَكَتِكَ، وَإِمَامِ حَضْرَتِكَ، وَطِرَازِ مُلْكِكَ، وَخَزَائِنِ رَحْمَتِكَ، وَطَرِيقِ شَرِيعَتِكَ، المُتَلَذِّذِ بِتَوْحِيدِكَ، إِنْسَانِ عَيْنِ الوُجُودِ، وَالسَّبَبِ فِي كُلِّ مَوْجُودٍ.',
        translit: 'Allāhumma ṣalli ‘alā Sayyidinā Muḥammadin baḥri anwārika, wa ma‘dini asrārika, wa lisāni ḥujjatika, wa ‘arūsi mamlakatika, wa imāmi ḥaḍratika...',
        de: 'O Allah, segne unseren Meister Muhammad, das Meer Deiner Lichter, die Fundgrube Deiner Geheimnisse, die Zunge Deines Beweises, die Zierde Deines Königreichs, den Imam Deiner Gegenwart, die Schatzkammer Deiner Barmherzigkeit und den Weg Deines Gesetzes, der sich an Deiner Einheit erfreut!',
        en: 'O Allah, bless our Master Muhammad, the ocean of Your lights, the mine of Your secrets, the tongue of Your proof, the adornment of Your kingdom, the treasuries of Your mercy, and the path of Your sacred law.',
        ku: 'خودایە سەڵاوات بنێرە بۆ گەورەمان موحەممەد، دەریای نوورەکانت، کانگای نهێنییەکانت، زمانی بەڵگەکانت، پێشەوای حەزرەتت و خەزێنەی ڕەحمەتت و ڕێگای شەریعەتت.'
      },
      {
        ar: 'صَلَاةً تَدُومُ بِدَوَامِكَ، وَتَبْقَىٰ بِبَقَائِكَ، لَا مُنْتَهَىٰ لَهَا دُونَ عِلْمِكَ، صَلَاةً تُرْضِيكَ وَتُرْضِيهِ وَتَرْضَىٰ بِهَا عَنَّا يَا رَبَّ العَالَمِينَ.',
        translit: 'Ṣalātan tadūmu bi-dawāmika, wa tabqā bi-baqā’ika, lā muntahā lahā dūna ‘ilmika, ṣalātan turḍīka wa turḍīhi wa tarḍā bihā ‘annā yā Rabbal-‘ālamīn.',
        de: 'Ein Segensgebet, das mit Deiner Ewigkeit fortdauert und mit Deinem Bestehen bleibt, ohne Ende jenseits Deines Wissens – ein Segensgebet, das Dich zufriedenstellt, ihn zufriedenstellt und durch das Du mit uns zufrieden bist, o Herr der Welten!',
        en: 'A blessing that endures with Your eternity and remains with Your permanence, having no end short of Your knowledge—a blessing that pleases You, pleases him, and by which You are pleased with us, O Lord of the Worlds.',
        ku: 'سەڵاواتێک کە بەردەوام بێت بە مانەوەی هەمیشەییت، کە هیچ کۆتاییەکی نەبێت، سەڵاواتێک کە تۆ و ئەوی پێ ڕازی بێت و بە هۆیەوە لە ئێمەش ڕازی بیت ئەی پەروەردگاری جیهانیان.'
      },
      {
        ar: 'اللَّهُمَّ هَبْ لَنَا مِنْهُ شَفَاعَةً مُقْبَلَةً، وَأَوْرِدْنَا حَوْضَهُ الأَصْفَىٰ، وَاسْقِنَا بِكَأْسِهِ الأَوْفَىٰ، وَاحْشُرْنَا تَحْتَ لِوَائِهِ، وَأَمِتْنَا عَلَىٰ سُنَّتِهِ وَمِلَّتِهِ يَا أَرْحَمَ الرَّاحِمِينَ.',
        translit: 'Allāhumma hab lanā minhu shafā‘atan maqbūlatan, wa awridnā ḥawḍahul-aṣfā, wasqinā bi-ka’sihil-awfā...',
        de: 'O Allah, schenke uns seine angenommene Fürsprache, führe uns zu seinem reinsten Becken (Kawthar), tränke uns aus seinem vollsten Becher, versammle uns unter seinem Banner und lass uns auf seiner Sunnah sterben, o Barmherzigster der Barmherzigen!',
        en: 'O Allah, grant us his accepted intercession, bring us to his purest Fount, give us to drink from his fullest cup, gather us under his banner, and cause us to die upon his Sunnah, O Most Merciful of the merciful.',
        ku: 'خودایە شەفاعەتی قبووڵکراوی ئەومان پێ ببەخشە و بمانگەیەنە سەر حەوزی کەوسەری پاکی و بە دەستی پیرۆزی تێرئاومان بکە و لەسەر سوننەت و ڕێبازی ئەو بمانژیێنە و بمانمرێنە.'
      }
    ]
  },
  {
    id: 'hizb5',
    badgeAr: 'الحزب الخامس',
    dayDe: 'Freitag (Hizb 5)',
    dayEn: 'Friday (Hizb 5)',
    dayKu: 'هەینی (حزبی ٥)',
    titleAr: 'الحزب الخامس — وِرد يوم الجمعة والصلاة المشيشية المباركة',
    titleDe: '5. Hizb (Freitag) — Der gesegnete Freitags-Wird',
    titleEn: '5th Hizb (Friday) — Blessed Friday Litany & Salawat',
    titleKu: 'حزبی پێنجەم (ڕۆژی هەینی پیرۆز) لە دەلائلولخەیرات',
    audioUrl: 'https://archive.org/download/DalailAlKhayratAudio/07_Hizb5_Friday.mp3',
    passages: [
      {
        ar: 'اللَّهُمَّ صَلِّ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ وَعَلَىٰ آلِ سَيِّدِنَا مُحَمَّدٍ أَفْضَلَ صَلَوَاتِكَ، وَعَدَدَ مَعْلُومَاتِكَ، كُلَّمَا ذَكَرَكَ الذَّاكِرُونَ، وَغَفَلَ عَنْ ذِكْرِكَ الغَافِلُونَ.',
        translit: 'Allāhumma ṣalli ‘alā Sayyidinā Muḥammadin wa ‘alā āli Sayyidinā Muḥammadin afḍala ṣalawātika, wa ‘adada ma‘lūmātika, kullamā dhakarakadh-dhākirūna wa ghafala ‘an dhikrikal-ghāfilūn.',
        de: 'O Allah, segne unseren Meister Muhammad und die Familie unseres Meisters Muhammad mit den vortrefflichsten Deiner Segnungen und nach der Anzahl Deines Wissens, sooft Deiner gedenken die Gedenkenden und sooft Dein Gedenken versäumen die Achtlosen!',
        en: 'O Allah, bless our Master Muhammad and the family of our Master Muhammad with the most excellent of Your blessings and the count of all things known to You, whenever the mindful remember You and whenever the heedless neglect Your remembrance.',
        ku: 'خودایە باشترین سەڵاواتی خۆت بنێرە بۆ گەورەمان موحەممەد و بنەماڵەکەی بە ژمارەی زانراوەکانت، هەموو کاتێک کە یادکەران یادت دەکەن و بێئاگایان لە یادت بێئاگا دەبن.'
      },
      {
        ar: 'اللَّهُمَّ صَلِّ عَلَىٰ مَنْ مِنْهُ انْشَقَّتِ الأَسْرَارُ، وَانْفَلَقَتِ الأَنْوَارُ، وَفِيهِ ارْتَقَتِ الحَقَائِقُ، وَتَنَزَّلَتْ عُلُومُ آدَمَ فَأَعْجَزَ الخَلَائِقَ، وَلَهُ تَضَاءَلَتِ الفُهُومُ فَلَمْ يُدْرِكْهُ مِنَّا سَابِقٌ وَلَا لَاحِقٌ.',
        translit: 'Allāhumma ṣalli ‘alā man minhun-shaqqatil-asrār, wanfalaqatil-anwār, wa fīhir-taqatil-ḥaqā’iq, wa tanazzalat ‘ulūmu Ādama fa-a‘jazal-khalā’iq...',
        de: 'O Allah, segne denjenigen, aus dem die Geheimnisse sich erschlossen und die Lichter hervorbrachen, in dem die Wahrheiten emporstiegen und die Wissenschaften Adams herabstiegen, vor dessen Größe das Begreifen aller Früheren und Späteren demütig innehält!',
        en: 'O Allah, bless him from whom secrets burst forth and lights broke dawn, in whom realities ascended and the sciences of Adam descended, humbling all understandings so that neither predecessor nor successor could fully encompass his station.',
        ku: 'خودایە سەڵاوات بنێرە بۆ ئەو زاتەی کە نهێنییەکان لەوەوە کرانەوە و ڕووناکییەکان درەوشانەوە و حەقیقەتەکان تیایدا بەرزبوونەوە، کە هیچ پێشین و پاشینێک نەگەیشتووەتە تەواوی مەقام و پلەی بەرزی.'
      },
      {
        ar: 'فَرِيَاضُ المَلَكُوتِ بِزَهْرِ جَمَالِهِ مُونِقَةٌ، وَحِيَاضُ الجَبَرُوتِ بِفَيْضِ أَنْوَارِهِ مُتَدَفِّقَةٌ، وَلَا شَيْءَ إِلَّا وَهُوَ بِهِ مَنُوطٌ، صَلَاةً تَلِيقُ بِكَ مِنْكَ إِلَيْهِ كَمَا هُوَ أَهْلُهُ، اللَّهُمَّ إِنَّهُ سِرُّكَ الجَامِعُ الدَّالُّ عَلَيْكَ، وَحِجَابُكَ الأَعْظَمُ القَائِمُ لَكَ بَيْنَ يَدَيْكَ.',
        translit: 'Fa-riyāḍul-malakūti bi-zahri jamālihi mūniqah, wa ḥiyāḍul-jabarūti bi-fayḍi anwārihi mutadaffiqah... ṣalātan talīqu bika minka ilayhi kamā huwa ahluh.',
        de: 'Die Gärten des Himmelreichs blühen durch die Blume seiner Schönheit, und die Ströme der Allmacht fließen über vom Glanz seiner Lichter. Segne ihn mit einem Segen, der Deiner würdig ist, von Dir zu ihm, so wie es ihm gebührt!',
        en: 'The gardens of the spiritual realm blossom with the flower of his beauty, and the reservoirs of omnipotence overflow with the effusion of his lights—a blessing worthy of You, from You to him, as befits his stature.',
        ku: 'باخەکانی مەلەکووت بە گوڵی جوانیی ئەو ڕازاونەتەوە و کانیاوەکانی نووری ئەو هەڵدەقوڵێن؛ خودایە سەڵاواتێکی لە لایەن خۆتەوە بۆ بنێرە کە شایستەی گەورەیی تۆ و قەدری ئەو بێت.'
      },
      {
        ar: 'اللَّهُمَّ أَلْحِقْنِي بِنَسَبِهِ، وَحَقِّقْنِي بِحَسَبِهِ، وَعَرِّفْنِي إِيَّاهُ مَعْرِفَةً أَسْلَمُ بِهَا مِنْ مَوَارِدِ الجَهْلِ، وَأَكْرَعُ بِهَا مِنْ مَوَارِدِ الفَضْلِ، وَاحْمِلْنِي عَلَىٰ سَبِيلِهِ إِلَىٰ حَضْرَتِكَ حَمْلًا مَحْفُوفًا بِنُصْرَتِكَ.',
        translit: 'Allāhumma alḥiqnī bi-nasabih, wa ḥaqqiqnī bi-ḥasabih, wa ‘arrifnī iyyāhu ma‘rifatan aslamu bihā min mawāridil-jahl, wa akra‘u bihā min mawāridil-faḍl...',
        de: 'O Allah, verbinde mich mit seinem edlen Erbe, verwirkliche in mir seinen edlen Charakter, gewähre mir eine solche Erkenntnis seiner Würde, durch die ich vor den Quellen der Unwissenheit bewahrt bleibe und aus den Quellen der Gnade schöpfe, und führe mich auf seinem Weg in Deine Nähe, umgeben von Deinem Beistand!',
        en: 'O Allah, join me to his spiritual lineage, realize me with his noble character, grant me knowledge of him by which I am saved from the wells of ignorance and drink from the springs of grace, and carry me upon his path to Your presence surrounded by Your victory.',
        ku: 'خودایە بمبەستەرەوە بە ڕێباز و ڕەوشتی بەرزی ئەوەوە، و ناسینێکی وام پێ ببەخشە کە پێی لە سەرچاوەکانی نەزانی سەلامەت بم و لە سەرچاوەکانی فەزڵ و میهرەبانی تێر ببم.'
      }
    ]
  },
  {
    id: 'hizb6',
    badgeAr: 'الحزب السادس',
    dayDe: 'Samstag (Hizb 6)',
    dayEn: 'Saturday (Hizb 6)',
    dayKu: 'شەممە (حزبی ٦)',
    titleAr: 'الحزب السادس — وِرد يوم السبت من دلائل الخيرات',
    titleDe: '6. Hizb (Samstag) — Heilung, Schutz & Segen',
    titleEn: '6th Hizb (Saturday) — Healing, Protection & Blessings',
    titleKu: 'حزبی شەشەم (ڕۆژی شەممە) لە دەلائلولخەیرات',
    audioUrl: 'https://archive.org/download/DalailAlKhayratAudio/08_Hizb6_Saturday.mp3',
    passages: [
      {
        ar: 'اللَّهُمَّ صَلِّ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ طِبِّ القُلُوبِ وَدَوَائِهَا، وَعَافِيَةِ الأَبْدَانِ وَشِفَائِهَا، وَنُورِ الأَبْصَارِ وَضِيَائِهَا، وَقُوتِ الأَرْوَاحِ وَغِذَائِهَا، وَعَلَىٰ آلِهِ وَصَحْبِهِ وَسَلِّمْ.',
        translit: 'Allāhumma ṣalli ‘alā Sayyidinā Muḥammadin ṭibbil-qulūbi wa dawā’ihā, wa ‘āfiyatil-abdāni wa shifā’ihā, wa nūril-abṣāri wa ḍiyā’ihā, wa qūtil-arwāḥi wa ghidhā’ihā...',
        de: 'O Allah, segne unseren Meister Muhammad, die Medizin der Herzen und ihre Arznei, die Gesundheit der Körper und ihre Heilung, das Licht der Augen und ihren Glanz, die Nahrung der Seelen und ihre Speise, sowie seine Familie und Gefährten!',
        en: 'O Allah, bless our Master Muhammad, the medicine of hearts and their cure, the wellness of bodies and their healing, the light of eyes and their radiance, the nourishment of souls and their sustenance, and upon his family and companions.',
        ku: 'خودایە سەڵاوات بنێرە بۆ گەورەمان موحەممەد، دەرمان و چارەسەری دڵەکان، سەلامەتی و شیفای جەستەکان، نوور و ڕۆشنایی چاوەکان و خۆراکی ڕۆحەکان، و لەسەر ئال و یاوەرانی.'
      },
      {
        ar: 'اللَّهُمَّ صَلِّ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ صَلَاةً تُنَجِّينَا بِهَا مِنْ جَمِيعِ الأَهْوَالِ وَالآفَاتِ، وَتَقْضِي لَنَا بِهَا جَمِيعَ الحَاجَاتِ، وَتُطَهِّرُنَا بِهَا مِنْ جَمِيعِ السَّيِّئَاتِ، وَتَرْفَعُنَا بِهَا عِنْدَكَ أَعْلَى الدَّرَجَاتِ، وَتُبَلِّغُنَا بِهَا أَقْصَى الغَايَاتِ مِنْ جَمِيعِ الخَيْرَاتِ فِي الحَيَاةِ وَبَعْدَ المَمَاتِ.',
        translit: 'Allāhumma ṣalli ‘alā Sayyidinā Muḥammadin ṣalātan tunajjīnā bihā min jamī‘il-ahwāli wal-āfāt, wa taqḍī lanā bihā jamī‘al-ḥājāt, wa tuṭahhirunā bihā min jamī‘is-sayyi’āt...',
        de: 'O Allah, segne unseren Meister Muhammad mit einem Segensgebet, durch das Du uns vor allen Schrecken und Plagen errettest, uns alle Bedürfnisse erfüllst, uns von allen Verfehlungen reinigst, uns bei Dir zu den höchsten Stufen erhebst und uns die höchsten Ziele alles Guten im Leben und nach dem Tod erreichen lässt!',
        en: 'O Allah, bless our Master Muhammad with a prayer by which You deliver us from all terrors and afflictions, fulfill all our needs, purify us from all misdeeds, raise us to the highest degrees with You, and bring us to the utmost goals of all goodness in life and after death.',
        ku: 'خودایە سەڵاوات بنێرە بۆ گەورەمان موحەممەد، سەڵاواتێک کە بە هۆیەوە لە هەموو ترس و بەڵاکان ڕزگارمان بکەیت، هەموو پێداویستییەکانمان بۆ جێبەجێ بکەیت، لە هەموو خراپەکان پاکمان بکەیتەوە و لە ژیان و دوای مردندا بمانگەیەنیتە بەرزترین پلەی خێر.'
      },
      {
        ar: 'اللَّهُمَّ صَلِّ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ وَعَلَىٰ آلِ سَيِّدِنَا مُحَمَّدٍ مِلْءَ الدُّنْيَا وَمِلْءَ الآخِرَةِ، وَبَارِكْ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ وَعَلَىٰ آلِ سَيِّدِنَا مُحَمَّدٍ مِلْءَ الدُّنْيَا وَمِلْءَ الآخِرَةِ، وَارْحَمْ سَيِّدَنَا مُحَمَّدًا وَآلَ سَيِّدِنَا مُحَمَّدٍ مِلْءَ الدُّنْيَا وَمِلْءَ الآخِرَةِ.',
        translit: 'Allāhumma ṣalli ‘alā Sayyidinā Muḥammadin wa ‘alā āli Sayyidinā Muḥammadin mil’ad-dunyā wa mil’al-ākhirah...',
        de: 'O Allah, segne unseren Meister Muhammad und seine Familie in der Fülle des Diesseits und der Fülle des Jenseits, schenke ihnen Segenskraft und Barmherzigkeit in der Fülle des Diesseits und der Fülle des Jenseits!',
        en: 'O Allah, send blessings, barakah, and mercy upon our Master Muhammad and the family of our Master Muhammad enough to fill this world and the Hereafter.',
        ku: 'خودایە سەڵاوات و بەرەکەت و ڕەحمەت بڕێژە بەسەر گەورەمان موحەممەد و بنەماڵەکەیدا بە پڕیی دونیا و بە پڕیی دواڕۆژ.'
      }
    ]
  },
  {
    id: 'hizb7',
    badgeAr: 'الحزب السابع',
    dayDe: 'Sonntag (Hizb 7)',
    dayEn: 'Sunday (Hizb 7)',
    dayKu: 'یەکشەممە (حزبی ٧)',
    titleAr: 'الحزب السابع — وِرد يوم الأحد من دلائل الخيرات',
    titleDe: '7. Hizb (Sonntag) — Vollständiger Segens-Wird',
    titleEn: '7th Hizb (Sunday) — Complete Litany of Blessings',
    titleKu: 'حزبی حەوتەم (ڕۆژی یەکشەممە) لە دەلائلولخەیرات',
    audioUrl: 'https://archive.org/download/DalailAlKhayratAudio/09_Hizb7_Sunday.mp3',
    passages: [
      {
        ar: 'اللَّهُمَّ اجْعَلْ صَلَوَاتِكَ وَبَرَكَاتِكَ وَرَحْمَتَكَ وَرَأْفَتَكَ وَتَحِيَّاتِكَ عَلَىٰ سَيِّدِ المُرْسَلِينَ، وَإِمَامِ المُتَّقِينَ، وَخَاتَمِ النَّبِيِّينَ، سَيِّدِنَا مُحَمَّدٍ عَبْدِكَ وَرَسُولِكَ، إِمَامِ الخَيْرِ، وَقَائِدِ الخَيْرِ، وَرَسُولِ الرَّحْمَةِ.',
        translit: 'Allāhummaj-‘al ṣalawātika wa barakātika wa raḥmatika wa ra’fatika wa taḥiyyātika ‘alā Sayyidil-mursalīn, wa Imāmil-muttaqīn, wa Khātamin-nabiyyīn...',
        de: 'O Allah, lege Deine Segnungen, Deinen Segen, Deine Barmherzigkeit, Deine Güte und Deine Grüße auf den Herrn der Gesandten, das Vorbild der Gottesfürchtigen und das Siegel der Propheten, unseren Meister Muhammad, Deinen Diener und Gesandten, den Imam des Guten, den Führer zum Guten und den Gesandten der Barmherzigkeit!',
        en: 'O Allah, place Your blessings, barakah, mercy, kindness, and greetings upon the Master of the Messengers, Imam of the Pious, and Seal of the Prophets, our Master Muhammad, Your servant and Messenger, Leader of goodness and Messenger of Mercy.',
        ku: 'خودایە سەڵاوات و بەرەکەت و ڕەحمەت و میهرەبانی و سڵاوی خۆت دابنێ لەسەر سەروەری پێغەمبەران و پێشەوای پارێزکاران و مۆری نێردراوان، حەزرەتی موحەممەد پێشەوای خێر و پێغەمبەری ڕەحمەت.'
      },
      {
        ar: 'اللَّهُمَّ صَلِّ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ عَدَدَ مَا فِي عِلْمِ اللَّهِ، صَلَاةً دَائِمَةً بِدَوَامِ مُلْكِ اللَّهِ. اللَّهُمَّ صَلِّ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ كَمَا أَمَرْتَنَا أَنْ نُصَلِّيَ عَلَيْهِ، وَصَلِّ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ كَمَا يَنْبَغِي أَنْ يُصَلَّىٰ عَلَيْهِ.',
        translit: 'Allāhumma ṣalli ‘alā Sayyidinā Muḥammadin ‘adada mā fī ‘ilmillāh, ṣalātan dā’imatan bi-dawāmi mulkillāh...',
        de: 'O Allah, segne unseren Meister Muhammad nach der Anzahl alles dessen, was in Allahs Wissen ist – ein ewiges Segensgebet, das währt, solange Allahs Herrschaft währt. Segne ihn, wie Du uns befohlen hast, ihn zu segnen, und segne ihn, wie es ihm gebührt!',
        en: 'O Allah, bless our Master Muhammad to the count of all that is in Allah’s knowledge, an everlasting blessing enduring with the sovereignty of Allah. Bless him as You commanded us to bless him, and as he deserves to be blessed.',
        ku: 'خودایە سەڵاوات بنێرە بۆ گەورەمان موحەممەد بە ژمارەی ئەوەی لە زانستی خودادایە، سەڵاواتێکی هەمیشەیی بە مانەوەی موڵکی خودا، هەروەک چۆن فەرمانت پێ کردووین و شایستەی ئەوە.'
      },
      {
        ar: 'اللَّهُمَّ آتِ سَيِّدَنَا مُحَمَّدًا الوَسِيلَةَ وَالفَضِيلَةَ وَالدَّرَجَةَ الرَّفِيعَةَ، وَابْعَثْهُ اللَّهُمَّ المَقَامَ المَحْمُودَ الَّذِي وَعَدْتَهُ، إِنَّكَ لَا تُخْلِفُ المِيعَادَ.',
        translit: 'Allāhumma āti Sayyidanā Muḥammadanil-wasīlata wal-faḍīlata wad-darajatar-rafī‘ah, wab‘athhul-maqāmal-maḥmūdalladhī wa‘adtah, innaka lā tukhliful-mī‘ād.',
        de: 'O Allah, gewähre unserem Meister Muhammad die Wasīlah (höchste Stufe im Paradies), den Vorzug und den erhabenen Rang, und erhebe ihn zu dem lobenswerten Stand (Maqām Maḥmūd), den Du ihm versprochen hast; gewiss, Du brichst das Versprechen nicht!',
        en: 'O Allah, grant our Master Muhammad al-Wasilah, preeminence, and the exalted degree, and raise him to the Praised Station which You promised him; indeed You never fail in Your promise.',
        ku: 'خودایە مەقامی وەسیلە و فەزیلەت و پلەی بەرز ببەخشە بە گەورەمان موحەممەد و بیگەیەنە بە مەقامی مەحموود کە بەڵێنت پێ داوە، بێگومان تۆ بەڵێن ناشکێنیت.'
      }
    ]
  },
  {
    id: 'hizb8',
    badgeAr: 'الحزب الثامن والختم',
    dayDe: 'Abschluss & Khatm (Hizb 8)',
    dayEn: 'Conclusion & Khatm (Hizb 8)',
    dayKu: 'حزبی هەشتەم و دوعای خەتم',
    titleAr: 'الحزب الثامن — دعاء ختم دلائل الخيرات المبارك',
    titleDe: '8. Hizb — Abschlussgebet (Khatm) von Dalā\'il al-Khayrāt',
    titleEn: '8th Hizb — Closing Supplication (Khatm) of Dalā\'il al-Khayrāt',
    titleKu: 'حزبی هەشتەم و دوعای خەتمی تەواوکردنی دەلائلولخەیرات',
    audioUrl: 'https://archive.org/download/DalailAlKhayratAudio/10_Hizb8_Khatm.mp3',
    passages: [
      {
        ar: 'اللَّهُمَّ صَلِّ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ فِي الأَوَّلِينَ، وَصَلِّ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ فِي الآخِرِينَ، وَصَلِّ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ فِي النَّبِيِّينَ، وَصَلِّ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ فِي المُرْسَلِينَ، وَصَلِّ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ فِي المَلَإِ الأَعْلَىٰ إِلَىٰ يَوْمِ الدِّينِ.',
        translit: 'Allāhumma ṣalli ‘alā Sayyidinā Muḥammadin fil-awwalīn, wa ṣalli ‘alā Sayyidinā Muḥammadin fil-ākhirīn, wa fin-nabiyyīn, wa fil-mursalīn, wa fil-mala’il-a‘lā ilā yawmid-dīn.',
        de: 'O Allah, segne unseren Meister Muhammad unter den Ersten, segne ihn unter den Letzten, segne ihn unter den Propheten, segne ihn unter den Gesandten und segne ihn in der höchsten Versammlung bis zum Tag des Gerichts!',
        en: 'O Allah, bless our Master Muhammad among the first, among the last, among the Prophets, among the Messengers, and in the Highest Assembly until the Day of Judgment.',
        ku: 'خودایە سەڵاوات بنێرە بۆ گەورەمان موحەممەد لە ناو پێشینان و پاشیناندا، لە ناو پێغەمبەران و نێردراواندا، و لە کۆڕی فەرشتە بەرزەکاندا تا ڕۆژی دوایی.'
      },
      {
        ar: 'اللَّهُمَّ يَا دَائِمَ الفَضْلِ عَلَىٰ البَرِيَّةِ، يَا بَاسِطَ اليَدَيْنِ بِالعَطِيَّةِ، يَا صَاحِبَ المَوَاهِبِ السَّنِيَّةِ، صَلِّ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ خَيْرِ الوَرَىٰ سَجِيَّةً، وَاغْفِرْ لَنَا يَا ذَا العُلَىٰ فِي هَٰذِهِ العَشِيَّةِ.',
        translit: 'Allāhumma yā dā’imal-faḍli ‘alal-bariyyah, yā bāsiṭal-yadayni bil-‘aṭiyyah, yā ṣāḥibal-mawāhibis-saniyyah, ṣalli ‘alā Sayyidinā Muḥammadin khayril-warā sajiyyah, waghfir lanā yā dhal-‘ulā fī hādhihil-‘ashiyyah.',
        de: 'O Allah, o Du, Dessen Güte über die Schöpfung ewig währt, Der Seine Hände mit Gaben weit öffnet, Herr der erhabenen Geschenke: Segne unseren Meister Muhammad, das edelste Geschöpf an Charakter, und vergib uns, o Allerhöchster, zu dieser Stunde!',
        en: 'O Allah, O Perpetual Bestower of grace upon creation, O Extender of generous gifts, O Possessor of sublime grants: bless our Master Muhammad, the best of creation in character, and forgive us, O Most High, this evening!',
        ku: 'خودایە ئەی ئەوەی فەزڵ و بەخششت هەمیشەییە بەسەر دروستکراواندا، سەڵاوات بنێرە بۆ گەورەمان موحەممەد کە باشترینی خەڵکە لە ڕەوشتدا، و لە ئێمە خۆشبە لەم کاتە پیرۆزەدا.'
      },
      {
        ar: 'اللَّهُمَّ اشْرَحْ بِالصَّلَاةِ عَلَيْهِ صُدُورَنَا، وَيَسِّرْ بِهَا أُمُورَنَا، وَفَرِّجْ بِهَا هُمُومَنَا، وَاكْشِفْ بِهَا غُمُومَنَا، وَاغْفِرْ بِهَا ذُنُوبَنَا، وَاقْضِ بِهَا دُيُونَنَا، وَأَصْلِحْ بِهَا أَحْوَالَنَا، وَبَلِّغْ بِهَا آمَالَنَا، وَتَقَبَّلْ بِهَا تَوْبَتَنَا، وَاغْسِلْ بِهَا حَوْبَتَنَا، وَانْصُرْ بِهَا حُجَّتَنَا، وَطَهِّرْ بِهَا أَلْسِنَتَنَا، وَآنِسْ بِهَا وَحْشَتَنَا، وَارْحَمْ بِهَا غُرْبَتَنَا، وَاجْعَلْهَا نُورًا بَيْنَ أَيْدِينَا وَمِنْ خَلْفِنَا.',
        translit: 'Allāhummash-raḥ biṣ-ṣalāti ‘alayhi ṣudūranā, wa yassir bihā umūranā, wa farrij bihā humūmanā, wakshif bihā ghumūmanā, waghfir bihā dhunūbanā, waqḍi bihā duyūnanā...',
        de: 'O Allah, weite durch das Segensgebet für ihn unsere Brust, erleichtere dadurch unsere Angelegenheiten, vertreibe dadurch unsere Sorgen, nimm unseren Kummer hinweg, vergib unsere Sünden, tilge unsere Schulden, bessere unsere Zustände, nimm unsere Reue an und mache es zu einem Licht vor uns und hinter uns!',
        en: 'O Allah, expand our chests through sending blessings upon him, ease our affairs, relieve our anxieties, remove our distress, forgive our sins, settle our debts, rectify our states, accept our repentance, and make it a light before us and behind us!',
        ku: 'خودایە بە بەرەکەتی سەڵاوات لەسەر پێغەمبەر ﷺ سینەمان فراوان بکە، کارەکانمان ئاسان بکە، خەم و پەژارەمان لاببە، لە تاوانەکانمان خۆشبە، قەرزەکانمان ببژێرە، حاڵمان چاک بکە و بیکە بە نوور لە پێش و پاشمانەوە.'
      },
      {
        ar: 'سُبْحَانَ رَبِّكَ رَبِّ العِزَّةِ عَمَّا يَصِفُونَ ۞ وَسَلَامٌ عَلَى المُرْسَلِينَ ۞ وَالحَمْدُ لِلَّهِ رَبِّ العَالَمِينَ. آمِينَ.',
        translit: 'Subḥāna Rabbika Rabbil-‘izzati ‘ammā yaṣifūn. Wa salāmun ‘alal-mursalīn. Wal-ḥamdu lillāhi Rabbil-‘ālamīn. Āmīn.',
        de: 'Preis sei deinem Herrn, dem Herrn der Macht, erhaben über das, was sie Ihm zuschreiben! Und Friede sei auf den Gesandten! Und alles Lob gebührt Allah, dem Herrn der Welten. Āmīn.',
        en: 'Exalted is your Lord, the Lord of might, above what they describe. And peace upon the Messengers. And praise to Allah, Lord of the Worlds. Amin.',
        ku: 'پاکی و بێگەردی بۆ پەروەردگاری خاوەن عیززەتت لەوەی ئەوان وەسفی دەکەن، و سەلام لەسەر هەموو پێغەمبەران، و سوپاس و ستایش بۆ خودای پەروەردگاری جیهانیان. ئامین.'
      }
    ]
  }
];
}

// ============================================================
// 2. QASĪDA AL-BURDAH (قصيدة البردة للإمام البوصيري - الفصول العشرة)
// Modeled directly after https://qasidaburda.com/
// ============================================================
if (!window.BURDA_CHORUS) {
window.BURDA_CHORUS = {
  ar1: 'مَوْلَايَ صَلِّ وَسَلِّمْ دَائِمًا أَبَدًا',
  ar2: 'عَلَىٰ حَبِيبِكَ خَيْرِ الْخَلْقِ كُلِّهِمِ',
  translit: 'Mawlāya ṣalli wa sallim dā’iman abadan ۞ ‘Alā ḥabībika khayril-khalqi kullihimi',
  de: 'Mein Herr, sende immer und ewig Segen und Frieden auf Deinen Geliebten, das beste aller Geschöpfe!',
  en: 'O my Master, send blessings and peace always and forever upon Your Beloved, the best of all creation!',
  ku: 'پەروەردگار و سەروەرم! هەمیشە و هەتاهەتایە سەڵاوات و سەلام ببارێنە بەسەر خۆشەویستەکەت کە باشترینی هەموو دروستکراوانە.'
};

if (!window.BURDA_CHAPTERS || window.BURDA_CHAPTERS.length < 10) {
window.BURDA_CHAPTERS = [
  {
    id: 1,
    badgeAr: 'الفصل الأول',
    titleAr: 'الفصل الأول: في الغزل وشكوى الغرام والحنين إلى طيبة',
    titleDe: 'Kapitel 1: Sehnsucht nach Medina & spirituelle Liebe',
    titleEn: 'Chapter 1: On Yearning for Madinah & Spiritual Love',
    titleKu: 'فەسڵی یەکەم: سۆز و تاسەی دڵ بۆ مەدینەی منەووەرە',
    couplets: [
      {
        ar1: 'أَمِنْ تَذَكُّرِ جِيرَانٍ بِذِي سَلَمِ',
        ar2: 'مَزَجْتَ دَمْعًا جَرَىٰ مِنْ مُقْلَةٍ بِدَمِ',
        translit: 'Amin tadhakkuri jīrānin bi-Dhī Salami ۞ Mazajta dam‘an jarā min muqlatin bi-dami',
        de: 'Ist es aus Erinnerung an die Nachbarn in Dhū Salam, dass du Tränen aus deinen Augen mit Herzblut vermischt hast?',
        en: 'Is it from remembering the neighbors at Dhu Salam that you have mingled tears flowing from your eyes with blood?',
        ku: 'ئایا لەبەر یادکردنەوەی دراوسێکانی دۆڵی (زی سەلەم و مەدینە)یە کە فرمێسکی چاوەکانت تێکەڵ بە خوێنی دڵت کردووە؟'
      },
      {
        ar1: 'أَمْ هَبَّتِ الرِّيحُ مِنْ تِلْقَاءِ كَاظِمَةٍ',
        ar2: 'وَأَوْمَضَ الْبَرْقُ فِي الظَّلْمَاءِ مِنْ إِضَمِ',
        translit: 'Am habbatir-rīḥu min tilqā’i Kāẓimatin ۞ Wa awmaḍal-barqu fiẓ-ẓalmā’i min Iḍami',
        de: 'Oder wehte der sanfte Wind aus der Richtung von Kāẓimah, und blitzte das Leuchten in der Finsternis vom Berg Iḍam bei Medina auf?',
        en: 'Or is it because the breeze blew from the direction of Kazimah, and lightning flashed in the darkness from Mount Idam?',
        ku: 'یاخود لەبەر ئەوەیە کە شنەبا لە لای (کازیمە)وە هەڵی کردووە و برووسکە لە تاریکەشەودا لە کێوی (ئیدەم)ی مەدینەوە درەوشاوەتەوە؟'
      },
      {
        ar1: 'فَمَا لِعَيْنَيْكَ إِنْ قُلْتَ اكْفُفَا هَمَتَا',
        ar2: 'وَمَا لِقَلْبِكَ إِنْ قُلْتَ اسْتَفِقْ يَهِمِ',
        translit: 'Famā li-‘aynayka in qultak-fufā hamatā ۞ Wa mā li-qalbika in qultas-tafiq yahimi',
        de: 'Was ist mit deinen Augen: wenn du ihnen sagst „Haltet ein!“, strömen sie über – und was ist mit deinem Herzen: wenn du ihm sagst „Komm zur Ruhe!“, entbrennt es in Sehnsucht?',
        en: 'What ails your eyes that when you tell them to hold back, they overflow; and what ails your heart that when you tell it to recover, it wanders in longing?',
        ku: 'چییە بە چاوەکانت کاتێک پێیان دەڵێیت مەگرین زیاتر فرمێسک دەڕێژن، و چییە بە دڵت کاتێک پێی دەڵێیت ئارام بگرە زیاتر شەیدا دەبێت؟'
      },
      {
        ar1: 'أَيَحْسَبُ الصَّبُّ أَنَّ الْحُبَّ مُنْكَتِمٌ',
        ar2: 'مَا بَيْنَ مُنْسَجِمٍ مِنْهُ وَمُضْطَرِمِ',
        translit: 'Ayaḥsabuṣ-ṣabbu annal-ḥubba munkatimun ۞ Mā bayna munsajimin minhu wa muḍṭarimi',
        de: 'Glaubt der Liebende etwa, dass die Liebe verborgen bleiben kann zwischen strömenden Tränen und einem lodernden Herzen?',
        en: 'Does the yearning lover think that love can remain concealed between flowing tears and a blazing heart?',
        ku: 'ئایا عاشقی دڵسووتاو وا دەزانێت خۆشەویستی دەشاردرێتەوە لە نێوان فرمێسکی ڕژاو و دڵی پڕ لە گڕ و کڵپەدا؟'
      }
    ]
  },
  {
    id: 2,
    badgeAr: 'الفصل الثاني',
    titleAr: 'الفصل الثاني: في التحذير من هوى النفس وتزكيتها',
    titleDe: 'Kapitel 2: Läuterung der Seele & Warnung vor ihren Begierden',
    titleEn: 'Chapter 2: Warning Against the Desires of the Ego (Nafs)',
    titleKu: 'فەسڵی دووەم: ئاگادارکردنەوە لە هەوا و ئارەزووی نەفس',
    couplets: [
      {
        ar1: 'فَإِنَّ أَمَّارَتِي بِالسُّوءِ مَا اتَّعَظَتْ',
        ar2: 'مِنْ جَهْلِهَا بِنَذِيرِ الشَّيْبِ وَالْهَرَمِ',
        translit: 'Fa-inna ammāratī bis-sū’i mat-ta‘aẓat ۞ Min jahlihā bi-nadhīrish-shaybi wal-harami',
        de: 'Denn meine zum Bösen drängende Seele hat aus ihrer Unachtsamkeit keine Lehre aus den Warnboten des grauen Haares und des Alters gezogen.',
        en: 'For indeed my soul commanding to evil has not taken heed, out of its ignorance, from the warning of gray hair and old age.',
        ku: 'بەڕاستی نەفسی فەرماندەرم بە خراپە لەبەر بێئاگایی پەندی وەرنەگرتووە لە نیشانەکانی سپێتی قژ و پیری.'
      },
      {
        ar1: 'وَلَا أَعَدَّتْ مِنَ الْفِعْلِ الْجَمِيلِ قِرًى',
        ar2: 'ضَيْفٌ أَلَمَّ بِرَأْسِي غَيْرَ مُحْتَشِمِ',
        translit: 'Wa lā a‘addat minal-fi‘lil-jamīli qiran ۞ Ḍayfun alamma bi-ra’sī ghayra muḥtashimi',
        de: 'Und sie hat keine schönen Taten als Bewirtung vorbereitet für den Gast (das Alter), der unverhohlen auf meinem Haupt eingekehrt ist.',
        en: 'Nor has it prepared hospitable good deeds for a guest that has settled on my head without shyness.',
        ku: 'و توێشووی کردەوەی چاکەی ئامادە نەکردووە بۆ میوانی پیری کە هاتووەتە سەرم.'
      },
      {
        ar1: 'فَاصْرِفْ هَوَاهَا وَحَاذِرْ أَنْ تُوَلِّيَهُ',
        ar2: 'إِنَّ الْهَوَىٰ مَا تَوَلَّىٰ يُصْمِ أَوْ يَصِمِ',
        translit: 'Faṣrif hawāhā wa ḥādhir an tuwalliyahu ۞ Innal-hawā mā tawallā yuṣmi aw yaṣimi',
        de: 'So wende ihre Begierde ab und hüte dich davor, ihr die Herrschaft zu überlassen! Denn wo immer die Begierde herrscht, verdirbt oder entehrt sie.',
        en: 'So turn away its caprice and beware of letting it rule; for caprice, whenever it rules, either destroys or disgraces.',
        ku: 'کەواتە ڕووی ئارەزووی نەفست وەربگێڕە و مەهێڵە زاڵ بێت بەسەرتدا، چونکە هەوا و ئارەزوو هەر کاتێک زاڵ بێت مرۆڤ تووشی زیان دەکات.'
      },
      {
        ar1: 'وَخَالِفِ النَّفْسَ وَالشَّيْطَانَ وَاعْصِهِمَا',
        ar2: 'وَإِنْ هُمَا مَحَّضَاكَ النُّصْحَ فَاتَّهِمِ',
        translit: 'Wa khālifin-nafsa wash-shayṭāna wa‘ṣihimā ۞ Wa in humā maḥḥaḍākan-nuṣḥa fattahimi',
        de: 'Widersetze dich dem niederen Ego und dem Satan und gehorche ihnen nicht – und selbst wenn sie dir scheinbar reinen Rat geben, misstraue ihnen!',
        en: 'Oppose the ego and Satan and disobey them both, and even if they offer you seemingly sincere advice, suspect them!',
        ku: 'پێچەوانەی هەوای نەفس و شەیتان بجووڵێرەوە و گوێڕایەڵیان مەبە، تەنانەت ئەگەر لە ڕواڵەتدا وەک دڵسۆزیش خۆیان نیشان بدەن.'
      }
    ]
  },
  {
    id: 3,
    badgeAr: 'الفصل الثالث',
    titleAr: 'الفصل الثالث: في مدح سيد المرسلين صلى الله عليه وسلم',
    titleDe: 'Kapitel 3: Lobpreis des Herrn der Gesandten ﷺ',
    titleEn: 'Chapter 3: In Praise of the Master of Messengers ﷺ',
    titleKu: 'فەسڵی سێیەم: لە ستایش و مەدحی سەروەری پێغەمبەراندا ﷺ',
    couplets: [
      {
        ar1: 'مُحَمَّدٌ سَيِّدُ الْكَوْنَيْنِ وَالثَّقَلَيْنِ',
        ar2: 'وَالْفَرِيقَيْنِ مِنْ عُرْبٍ وَمِنْ عَجَمِ',
        translit: 'Muḥammadun Sayyidul-kawnayni wath-thaqalayni ۞ Wal-farīqayni min ‘urbin wa min ‘ajami',
        de: 'Muhammad ﷺ ist der Meister beider Welten (Diesseits und Jenseits), der Menschen und Dschinn sowie beider Völkergruppen, der Araber und Nicht-Araber.',
        en: 'Muhammad ﷺ is the Master of the two worlds and the two weighty creations (mankind and jinn), and of both groups, Arabs and non-Arabs.',
        ku: 'حەزرەتی موحەممەد ﷺ سەروەری هەردوو جیهان و مرۆڤ و جنۆکەیە، و پێشەوای هەردوو کۆمەڵی عەرەب و عەجەمە.'
      },
      {
        ar1: 'نَبِيُّنَا الْآمِرُ النَّاهِي فَلَا أَحَدٌ',
        ar2: 'أَبَرَّ فِي قَوْلِ لَا مِنْهُ وَلَا نَعَمِ',
        translit: 'Nabiyyunal-āmirun-nāhī falā aḥadun ۞ Abarra fī qawli lā minhu wa lā na‘ami',
        de: 'Unser Prophet, der das Gute gebietet und das Verwerfliche verwehrt – niemand ist wahrhaftiger und gütiger als er, ob er „Nein“ oder „Ja“ spricht.',
        en: 'Our Prophet who commands the good and forbids the wrong—none is more truthful and righteous than he in saying "No" or "Yes".',
        ku: 'پێغەمبەرمان کە فەرمان بە چاکە دەکات و ڕێگری لە خراپە دەکات، هیچ کەس لەو ڕاستگۆتر و چاکەکارتر نییە لە فەرموودەکانیدا.'
      },
      {
        ar1: 'هُوَ الْحَبِيبُ الَّذِي تُرْجَىٰ شَفَاعَتُهُ',
        ar2: 'لِكُلِّ هَوْلٍ مِنَ الْأَهْوَالِ مُقْتَحِمِ',
        translit: 'Huwal-Ḥabībulladhī turjā shafā‘atuhu ۞ Li-kulli hawlin minal-ahwāli muqtaḥimi',
        de: 'Er ist der Geliebte Allahs, dessen Fürsprache für jeden hereinbrechenden Schrecken des Jüngsten Tages erhofft wird.',
        en: 'He is the Beloved whose intercession is hoped for against every overwhelming terror and hardship.',
        ku: 'ئەو خۆشەویستی خودایە کە هیوای شەفاعەتی لێ دەخوازرێت بۆ ڕزگاربوون لە هەموو ترس و ناڕەحەتییەکی گەورەی ڕۆژی قیامەت.'
      },
      {
        ar1: 'فَاقَ النَّبِيِّينَ فِي خَلْقٍ وَفِي خُلُقٍ',
        ar2: 'وَلَمْ يُدَانُوهُ فِي عِلْمٍ وَلَا كَرَمِ',
        translit: 'Fāqan-nabiyyīna fī khalqin wa fī khuluqin ۞ Wa lam yudānūhu fī ‘ilmin wa lā karami',
        de: 'Er übertraf alle Propheten an äußerer Gestalt und an edlem Charakter, und keiner kam ihm an Wissen und Großmut gleich.',
        en: 'He surpassed the Prophets in physical form and noble character, and none approached him in knowledge or generosity.',
        ku: 'لە شێوە و لە ڕەوشتی بەرزدا پێش هەموو پێغەمبەران کەوتووە، و لە زانست و بەخشندەییدا کەس هاوتای ئەو نییە.'
      },
      {
        ar1: 'وَكُلُّهُمْ مِنْ رَسُولِ اللَّهِ مُلْتَمِسٌ',
        ar2: 'غَرْفًا مِنَ الْبَحْرِ أَوْ رَشْفًا مِنَ الدِّيَمِ',
        translit: 'Wa kulluhum min Rasūlillāhi multamisun ۞ Gharfan minal-baḥri aw rashfan minad-diyami',
        de: 'Und sie alle schöpfen vom Gesandten Allahs – eine Handvoll aus seinem Ozean oder einen Tropfen aus seinem beständigen Segensregen.',
        en: 'And all of them draw from the Messenger of Allah—a handful from his ocean or a sip from his continuous rains.',
        ku: 'هەموویان لە کانیاوی پێغەمبەری خوداوە دەخۆنەوە؛ مشتێک لە دەریای بێسنووری ئەو یان دڵۆپێک لە بارانی ڕەحمەتی ئەو.'
      }
    ]
  },
  {
    id: 4,
    badgeAr: 'الفصل الرابع',
    titleAr: 'الفصل الرابع: في مولده الشريف صلى الله عليه وسلم',
    titleDe: 'Kapitel 4: Seine gesegnete Geburt (Mawlid) ﷺ',
    titleEn: 'Chapter 4: On His Blessed Birth ﷺ',
    titleKu: 'فەسڵی چوارەم: لە باسی لەدایکبوونی پیرۆزی پێغەمبەردا ﷺ',
    couplets: [
      {
        ar1: 'أَبَانَ مَوْلِدُهُ عَنْ طِيبِ عُنْصُرِهِ',
        ar2: 'يَا طِيبَ مُبْتَدَإٍ مِنْهُ وَمُخْتَتَمِ',
        translit: 'Abāna mawliduhu ‘an ṭībi ‘unṣurihi ۞ Yā ṭība mubtada’in minhu wa mukhtatami',
        de: 'Seine Geburt offenbarte die Reinheit seines Ursprungs – o wie herrlich ist sein Anfang und wie herrlich seine Vollendung!',
        en: 'His birth revealed the purity of his origin—O how blessed is his beginning and his ending!',
        ku: 'لەدایکبوونی پیرۆزی پاکیی ڕەچەڵەک و جەوهەری دەرخست؛ ئای چەند پیرۆز و پاکە سەرەتا و کۆتایی ئەو.'
      },
      {
        ar1: 'يَوْمٌ تَفَرَّسَ فِيهِ الْفُرْسُ أَنَّهُمُ',
        ar2: 'قَدْ أُنْذِرُوا بِحُلُولِ الْبُؤْسِ وَالنِّقَمِ',
        translit: 'Yawmun tafarrasa fīhil-Fursu annahumu ۞ Qad undhirū bi-ḥulūlil-bu’si wan-niqami',
        de: 'Ein Tag, an dem die Perser erkannten, dass das Ende ihrer Tyrannei und das Erlöschen des Götzenfeuers angebrochen war.',
        en: 'A day on which the Persians perceived that they were warned of the end of their tyranny.',
        ku: 'ڕۆژێک بوو کە نیشانەکانی کۆتاییهاتنی ستەم و کوژانەوەی ئاگری بتپەرستی تیایدا دەرکەوت.'
      },
      {
        ar1: 'وَبَاتَ إِيوَانُ كِسْرَىٰ وَهْوَ مُنْصَدِعٌ',
        ar2: 'كَشَمْلِ أَصْحَابِ كِسْرَىٰ غَيْرَ مُلْتَئِمِ',
        translit: 'Wa bāta īwānu Kisrā wahwa munṣadi‘un ۞ Ka-shamli aṣḥābi Kisrā ghayra multa’imi',
        de: 'Und in jener Nacht barst der Palast des Chosrau, zersplittert wie die Schar seiner Gefolgsleute, die nie wieder zusammenfand.',
        en: 'And the palace of Chosroes became split in that night, never to be reunited.',
        ku: 'لەو شەوەدا کۆشک و تەلاری کیسرا درزی برد و شەق بوو، وەک بڵاوبوونەوەی دەسەڵاتەکەیان.'
      }
    ]
  },
  {
    id: 5,
    badgeAr: 'الفصل الخامس',
    titleAr: 'الفصل الخامس: في معجزاته صلى الله عليه وسلم',
    titleDe: 'Kapitel 5: Seine Wunder (Mu\'dschizāt) ﷺ',
    titleEn: 'Chapter 5: On His Miracles ﷺ',
    titleKu: 'فەسڵی پێنجەم: لە باسی موعجیزەکانی پێغەمبەردا ﷺ',
    couplets: [
      {
        ar1: 'جَاءَتْ لِدَعْوَتِهِ الْأَشْجَارُ سَاجِدَةً',
        ar2: 'تَمْشِي إِلَيْهِ عَلَىٰ سَاقٍ بِلَا قَدَمِ',
        translit: 'Jā’at li-da‘watihil-ashjāru sājidatan ۞ Tamshī ilayhi ‘alā sāqin bilā qadami',
        de: 'Auf seinen Ruf hin kamen die Bäume sich niederwerfend herbei und schritten auf ihrem Stamm ohne Füße zu ihm.',
        en: 'The trees came answering his call prostrating, walking to him upon their trunks without feet.',
        ku: 'درەختەکان بە بانگکردنی ئەو بە سوجدەبردنەوە هاتن بۆ لای و لەسەر قەدەکانیان بەبێ پێ بەرەو ڕووی ڕۆیشتن.'
      },
      {
        ar1: 'مِثْلَ الْغَمَامَةِ أَنَّىٰ سَارَ سَائِرَةً',
        ar2: 'تَقِيهِ حَرَّ وَطِيسٍ لِلْهَجِيرِ حَمِي',
        translit: 'Mithlal-ghamāmati annā sāra sā’iratan ۞ Taqīhi ḥarra waṭīsin lil-hajīri ḥamī',
        de: 'Wie die Wolke, die mit ihm zog, wohin er auch ging, um ihn vor der glühenden Mittagshitze zu beschatten.',
        en: 'Like the cloud that traveled wherever he traveled, shading him from the blazing midday heat.',
        ku: 'هەروەک ئەو پەڵە هەورەی کە لە هەر کوێ بڕۆیشتایە لەگەڵیدا دەڕۆیشت و سێبەری بۆ دەکرد لە گەرمای هاویندا.'
      }
    ]
  },
  {
    id: 6,
    badgeAr: 'الفصل السادس',
    titleAr: 'الفصل السادس: في شرف القرآن الكريم ومدحه',
    titleDe: 'Kapitel 6: Die Erhabenheit und das Wunder des Edlen Korans',
    titleEn: 'Chapter 6: On the Honor and Praise of the Noble Quran',
    titleKu: 'فەسڵی شەشەم: لە باسی گەورەیی و شکۆی قورئانی پیرۆزدا',
    couplets: [
      {
        ar1: 'دَعْنِي وَوَصْفِيَ آيَاتٍ لَهُ ظَهَرَتْ',
        ar2: 'ظُهُورَ نَارِ الْقِرَىٰ لَيْلًا عَلَىٰ عَلَمِ',
        translit: 'Da‘nī wa waṣfiya āyātin lahu ẓaharat ۞ Ẓuhūra nāril-qirā laylan ‘alā ‘alami',
        de: 'Lass mich seine Wunderzeichen beschreiben, die so klar erstrahlten wie ein Gastfeuer bei Nacht auf einem hohen Berggipfel!',
        en: 'Let me describe his miraculous signs that appeared as clearly as a hospitality fire at night atop a high mountain.',
        ku: 'لێم گەڕێ با وەسفی ئایەت و موعجیزە ڕوونەکانی بکەم کە وەک ئاگری سەر لووتکەی چیا لە شەودا دەدرەوشێنەوە.'
      },
      {
        ar1: 'آيَاتُ حَقٍّ مِنَ الرَّحْمَٰنِ مُحْدَثَةٌ',
        ar2: 'قَدِيمَةٌ صِفَةُ الْمَوْصُوفِ بِالْقِدَمِ',
        translit: 'Āyātu ḥaqqin minar-Raḥmāni muḥdathatun ۞ Qadīmatun ṣifatul-mawṣūfi bil-qidami',
        de: 'Verse der Wahrheit vom Allerbarmer: neu herabgesandt in der Zeit, doch ewig als Wort des Ewigen Gottes.',
        en: 'Verses of truth from the All-Merciful, revealed in time yet eternal as the speech of the Eternal One.',
        ku: 'ئایەتەکانی حەق لە لایەن خودای میهرەبانەوە کە وتەی ئەزەلیی پەروەردگاری هەمیشە زیندووە.'
      },
      {
        ar1: 'فَلَمْ يَقُمْ لِجَلَالِ الذِّكْرِ مِنْ أَحَدٍ',
        ar2: 'إِلَّا وَأَذْعَنَ مَأْمُومًا مِنَ الْحِكَمِ',
        translit: 'Mā ḥūribat qaṭṭu illā ‘āda min ḥarabin ۞ A‘dā الْأَعَادِي إِلَيْهَا مُلْقِيَ السَّلَمِ',
        de: 'Niemals wurden die Verse des Korans herausgefordert, ohne dass selbst der erbittertste Gegner sich ihrer Weisheit und Beredsamkeit beugen musste.',
        en: 'Never were the Quranic verses challenged except that the fiercest challenger yielded before their wisdom and eloquence.',
        ku: 'هەرگیز هیچ کەس نەیتوانیوە هاوشێوەی ڕەوانبێژی و حیکمەتی ئایەتەکانی قورئان بهێنێتەوە.'
      }
    ]
  },
  {
    id: 7,
    badgeAr: 'الفصل السابع',
    titleAr: 'الفصل السابع: في إسرائه ومعراجه صلى الله عليه وسلم',
    titleDe: 'Kapitel 7: Seine Nachtreise (Isrā\') & Himmelfahrt (Mi\'rādsch) ﷺ',
    titleEn: 'Chapter 7: On His Night Journey (Isra) and Ascension (Mi\'raj) ﷺ',
    titleKu: 'فەسڵی حەوتەم: لە باسی ئیسرا و میعراجی پێغەمبەردا ﷺ',
    couplets: [
      {
        ar1: 'سَرَيْتَ مِنْ حَرَمٍ لَيْلًا إِلَىٰ حَرَمٍ',
        ar2: 'كَمَا سَرَى الْبَدْرُ فِي دَاجٍ مِنَ الظُّلَمِ',
        translit: 'Sarayta min ḥaramin laylan ilā ḥaramin ۞ Kamā saral-badru fī dājin minaẓ-ẓulami',
        de: 'Du reistest bei Nacht von einem Heiligtum (Mekka) zu einem Heiligtum (Jerusalem), so wie der Vollmond durch das Dunkel der Nacht zieht.',
        en: 'You traveled by night from one sanctuary to another sanctuary, just as the full moon travels through intense darkness.',
        ku: 'لە شەوێکدا لە حەرەمی مەککەوە گەشتت کرد بۆ حەرەمی قودس، هەروەک چۆن مانگی چواردە لە تاریکایی شەودا دەدرەوشێتەوە.'
      },
      {
        ar1: 'وَبِتَّ تَرْقَىٰ إِلَىٰ أَنْ نِلْتَ مَنْزِلَةً',
        ar2: 'مِنْ قَابِ قَوْسَيْنِ لَمْ تُدْرَكْ وَلَمْ تُرَمِ',
        translit: 'Wa bitta tarqā ilā an nilta manzilatan ۞ Min qābi qawsayni lam tudrak wa lam turami',
        de: 'Und du stiegst in den Himmeln empor, bis du die Stufe höchster Nähe (Qāba Qawsayn) erreichtest, die niemand vor dir je erlangt oder erstrebt hat.',
        en: 'And you kept ascending until you attained a station at the distance of two bow-lengths, never reached nor aspired to by anyone else.',
        ku: 'و بەردەوام بەرز بوویتەوە بە ئاسمانەکاندا تا گەیشتیتە مەقامی (قاب قوسین) کە هیچ دروستکراوێک نە پێی گەیشتووە و نە تەماحی کردووە بگاتێ.'
      }
    ]
  },
  {
    id: 8,
    badgeAr: 'الفصل الثامن',
    titleAr: 'الفصل الثامن: في جهاد النبي صلى الله عليه وسلم وثباته',
    titleDe: 'Kapitel 8: Sein Mut, seine Standhaftigkeit & Verteidigung der Wahrheit',
    titleEn: 'Chapter 8: On the Prophet\'s Courage & Steadfastness ﷺ',
    titleKu: 'فەسڵی هەشتەم: لە باسی خۆڕاگری و پاڵەوانێتی پێغەمبەردا ﷺ',
    couplets: [
      {
        ar1: 'مَا زَالَ يَلْقَاهُمُ فِي كُلِّ مُعْتَرَكٍ',
        ar2: 'حَتَّىٰ غَدَوْا بِالقَنَا لَحْمًا عَلَىٰ وَضَمِ',
        translit: 'Wa man takun bi-Rasūlillāhi nuṣratuhu ۞ In talqahul-usdu fī ājāmihā tajimi',
        de: 'Und wessen Beistand durch den Gesandten Allahs ist: selbst wenn ihm die Löwen in ihrem Dickicht begegnen, weichen sie ehrfürchtig zurück.',
        en: 'And whoever has his support through the Messenger of Allah—even if lions meet him in their thickets, they fall silent in awe.',
        ku: 'هەر کەسێک پشتیوانیی پێغەمبەری خودای لەگەڵدا بێت، تەنانەت شێرەکانیش لە بێشەڵانی خۆیاندا لە هەیبەتیدا بێدەنگ دەبن.'
      },
      {
        ar1: 'وَلَنْ تَرَىٰ مِنْ وَلِيٍّ غَيْرِ مُنْتَصِرٍ',
        ar2: 'بِهِ وَلَا مِنْ عَدُوٍّ غَيْرِ مُنْقَصِمِ',
        translit: 'Wa lan tarā min waliyyin ghayri muntaṣirin ۞ Bihi wa lā min ‘aduwwin ghayri munqaṣimi',
        de: 'Du wirst niemals einen Freund sehen, dem durch ihn nicht geholfen wurde, und keinen Widersacher der Wahrheit, der nicht scheiterte.',
        en: 'And you will never see any ally of his left unsupported, nor any enemy of truth left undefeated.',
        ku: 'هەرگیز هیچ دۆستێکی ئەو نابینیت کە سەرنەکەوتبێت و پشتیوانیی لێ نەکرابێت.'
      }
    ]
  },
  {
    id: 9,
    badgeAr: 'الفصل التاسع',
    titleAr: 'الفصل التاسع: في التوسل بالنبي صلى الله عليه وسلم والاستغفار',
    titleDe: 'Kapitel 9: Bitte um Vergebung & Hoffnung auf Fürsprache',
    titleEn: 'Chapter 9: Seeking Forgiveness & Intercession',
    titleKu: 'فەسڵی نۆیەم: داوای لێخۆشبوون و هیوای شەفاعەتی پێغەمبەر ﷺ',
    couplets: [
      {
        ar1: 'خَدَمْتُهُ بِمَدِيحٍ أَسْتَقِيلُ بِهِ',
        ar2: 'ذُنُوبَ عُمْرٍ مَضَىٰ فِي الشِّعْرِ وَالْخِدَمِ',
        translit: 'Khadamtuhu bi-madīḥin astaqīlu bihi ۞ Dhunūba ‘umrin maḍā fish-shi‘ri wal-khidami',
        de: 'Ich habe ihm mit diesem Lobgedicht gedient, durch das ich Allah um Vergebung der Sünden eines Lebens bitte, das in weltlicher Dichtung und weltlichem Dienst verging.',
        en: 'I have served him with a poem of praise by which I ask pardon for the sins of a lifetime spent in worldly poetry and service.',
        ku: 'بەم قەسیدەی مەدحە خزمەتی ئەوم کرد کە بە هۆیەوە داوای لێخۆشبوون لە خودا دەکەم بۆ تاوانی تەمەنێکی ڕابردوو.'
      },
      {
        ar1: 'إِنْ آتِ ذَنْبًا فَمَا عَهْدِي بِمُنْتَقِضٍ',
        ar2: 'مِنَ النَّبِيِّ وَلَا حَبْلِي بِمُنْصَرِمِ',
        translit: 'In āti dhanban famā ‘ahdī bi-muntaqiḍin ۞ Minan-Nabiyyi wa lā ḥablī bi-munṣarimi',
        de: 'Wenn ich auch Sünden begangen habe, so ist doch mein Bund mit dem Propheten nicht gebrochen und mein Band der Liebe zu ihm nicht zerrissen.',
        en: 'Though I have committed sins, my covenant with the Prophet is not broken, nor is my cord of love to him severed.',
        ku: 'ئەگەرچی تووشی هەڵە و تاوانیش بووبم، بەڵام پەیمانی باوەڕ و پەیوەندیی خۆشەویستیم بە پێغەمبەرەوە ﷺ هەرگیز نەپچڕاوە.'
      },
      {
        ar1: 'فَإِنَّ لِي ذِمَّةً مِنْهُ بِتَسْمِيَتِي',
        ar2: 'مُحَمَّدًا وَهْوَ أَوْفَى الْخَلْقِ بِالذِّمَمِ',
        translit: 'Fa-inna lī dhimmatan minhu bi-tasmiyatī ۞ Muḥammadan wahwa awfal-khalqi bidh-dhimami',
        de: 'Denn ich trage eine besondere Verbundenheit zu ihm dadurch, dass ich „Muhammad“ heiße – und er ist der Treueste der ganzen Schöpfung in der Wahrung der Treue!',
        en: 'For I have a bond of protection with him by bearing the name Muhammad, and he is the most faithful of all creation in honoring bonds.',
        ku: 'چونکە من پەیمان و پەیوەندییەکم لەگەڵ ئەودا هەیە بەوەی ناوم (موحەممەد)ە، و ئەویش بەوەفاترینی هەموو دروستکراوانە.'
      }
    ]
  },
  {
    id: 10,
    badgeAr: 'الفصل العاشر',
    titleAr: 'الفصل العاشر: في المناجاة وعرض الحاجات وخاتمة القصيدة',
    titleDe: 'Kapitel 10: Inniges Bittgebet (Munādschāt) & Abschluss der Burdah',
    titleEn: 'Chapter 10: Intimate Supplication & Conclusion of the Burdah',
    titleKu: 'فەسڵی دەیەم: موناجات و پاڕانەوە و کۆتایی قەسیدەی بوردە',
    couplets: [
      {
        ar1: 'يَا أَكْرَمَ الْخَلْقِ مَا لِي مَنْ أَلُوذُ بِهِ',
        ar2: 'سِوَاكَ عِنْدَ حُلُولِ الْحَادِثِ الْعَمِمِ',
        translit: 'Yā akramal-khalqi mā lī man alūdhu bihi ۞ Siwāka ‘inda ḥulūlil-ḥādithil-‘amimi',
        de: 'O Edelster der Schöpfung, unter den Geschöpfen habe ich niemanden, auf dessen Fürsprache bei Allah ich am Tag der großen Drangsal hoffe, außer dir!',
        en: 'O noblest of creation, I have none among creation whose intercession I seek besides you when the universal event (Day of Judgment) befalls.',
        ku: 'ئەی بەڕێزترینی دروستکراوان! لە ڕۆژی قیامەتدا هیچ کەس لە دروستکراوان نییە هیوای شەفاعەتی لێ بخوازم لە دەرگای خودادا جگە لە تۆ.'
      },
      {
        ar1: 'وَلَنْ يَضِيقَ رَسُولَ اللَّهِ جَاهُكَ بِي',
        ar2: 'إِذَا الْكَرِيمُ تَجَلَّىٰ بِاسْمِ مُنْتَقِمِ',
        translit: 'Wa lan yaḍīqa Rasūlallāhi jāhuka bī ۞ Idhal-Karīmu tajallā bismi Muntaqimi',
        de: 'Und dein hoher Rang bei Allah, o Gesandter Allahs, wird auch mich nicht ausschließen, wenn der Allgütige am Tag der Abrechnung richtet.',
        en: 'And your high rank with Allah, O Messenger of Allah, will never be too narrow for me when the Generous Lord judges on the Day of Reckoning.',
        ku: 'ئەی پێغەمبەری خودا، پلە و شەفاعەتی تۆ لای پەروەردگاری بەخشندە ئەوەندە فراوانە کە منیش دەگرێتەوە.'
      },
      {
        ar1: 'يَا نَفْسُ لَا تَقْنَطِي مِنْ زَلَّةٍ عَظُمَتْ',
        ar2: 'إِنَّ الْكَبَائِرَ فِي الْغُفْرَانِ كَاللَّمَمِ',
        translit: 'Yā nafsu lā taqnaṭī min zallatin ‘aẓumat ۞ Innal-kabā’ira fil-ghufrāni kal-lamami',
        de: 'O meine Seele, verzweifle nicht wegen einer großen Verfehlung! Denn vor dem Ozean der göttlichen Vergebung werden selbst große Sünden bei aufrichtiger Reue wie kleine Fehltritte getilgt.',
        en: 'O my soul, do not despair over a grave slip! For great sins, before the vastness of Allah’s forgiveness, become like minor faults.',
        ku: 'ئەی نەفسەکەم، نائومێد مەبە لە هەڵە و تاوانێک ئەگەرچی گەورەش بێت، چونکە لە بەرامبەر دەریای لێخۆشبوونی خودادا تاوانە گەورەکانیش بە تەوبە دەسڕێنەوە.'
      },
      {
        ar1: 'لَعَلَّ رَحْمَةَ رَبِّي حِينَ يَقْسِمُهَا',
        ar2: 'تَأْتِي عَلَىٰ حَسَبِ الْعِصْيَانِ فِي الْقِسَمِ',
        translit: 'La‘alla raḥmata Rabbī ḥīna yaqsimuhā ۞ Ta’tī ‘alā ḥasabil-‘iṣyāni fil-qisami',
        de: 'Vielleicht wird die Barmherzigkeit meines Herrn, wenn Er sie austeilt, gerade den Bedürftigsten in reichstem Maße umfassen!',
        en: 'Perhaps the mercy of my Lord, when He distributes it, will come in proportion to our great need for forgiveness.',
        ku: 'ئومێدەوارم ڕەحمەتی بێسنووری پەروەردگارم کاتێک دابەشی دەکات، بەپێی زۆریی پێویستی و کەمتەرخەمیمان بمانگرێتەوە.'
      },
      {
        ar1: 'يَا رَبِّ بِالْمُصْطَفَىٰ بَلِّغْ مَقَاصِدَنَا',
        ar2: 'وَاغْفِرْ لَنَا مَا مَضَىٰ يَا وَاسِعَ الْكَرَمِ',
        translit: 'Yā Rabbi bil-Muṣṭafā balligh maqāṣidanā ۞ Waghfir lanā mā maḍā yā Wāsi‘al-karami',
        de: 'O Herr, um der Liebe zu Deinem Auserwählten (Muṣṭafā ﷺ) willen, lass uns unsere guten Ziele erreichen und vergib uns, was vergangen ist, o Du von unermesslicher Großzügigkeit!',
        en: 'O Lord, by the honor of the Chosen One (al-Mustafa ﷺ), fulfill our noble aspirations and forgive us what has passed, O Vast in Generosity!',
        ku: 'ئەی پەروەردگار! بە خۆشەویستی حەزرەتی موستەفا ﷺ بمانگەیەنە بە ئاواتە چاکەکانمان و لە تاوانی ڕابردوومان خۆشبە، ئەی خودای خاوەن کەرەمی بێسنوور!'
      },
      {
        ar1: 'وَاغْفِرْ إِلَٰهِي لِكُلِّ الْمُسْلِمِينَ بِمَا',
        ar2: 'يَتْلُونَ فِي الْمَسْجِدِ الْأَقْصَىٰ وَفِي الْحَرَمِ',
        translit: 'Waghfir Ilāhī li-kullil-muslimīna bimā ۞ Yatlūna fil-Masjidil-Aqṣā wa fil-Ḥarami',
        de: 'Und vergib, mein Gott, allen Muslimen bei dem, was sie in der Al-Aqsā-Moschee und im Heiligen Haram rezitieren!',
        en: 'And forgive, O my God, all Muslims by the blessings of what they recite in Al-Masjid Al-Aqsa and in the Sacred Sanctuary!',
        ku: 'خودایە لە هەموو موسڵمانان خۆشبە بە بەرەکەتی ئەو قورئان و زیکرانەی لە مزگەوتی ئەقسا و لە حەرەمی پیرۆزدا دەیخوێنن.'
      }
    ]
  }
];
}
}

// ============================================================
// 3. OFFICIAL TAJWEED ACADEMY (MENU-BASED CATEGORIZED SYSTEM)
// Standard: Hafs 'an 'Asim (Medina Mushaf Color Standard & Al-Jazariyyah)
// ============================================================
window.OFFICIAL_TAJWEED_CATEGORIES = [
  {
    id: 'nun_tanwin',
    icon: 'fa-wave-square',
    color: '#10b981',
    badgeAr: '٤ أحكام أساسية',
    titleAr: '١. أحكام النون الساكنة والتنوين',
    titleDe: '1. Nūn Sākinah & Tanwīn (نْ / ـً ـٍ ـٌ)',
    titleEn: '1. Rules of Nūn Sākinah & Tanwīn',
    titleKu: '١. حوکمەکانی نوونی زەنەدار و تەنوین (نْ / ـً ـٍ ـٌ)',
    descDe: 'Die vier fundamentalen Regeln beim Zusammentreffen von Nūn Sākinah oder Tanwīn mit den 28 arabischen Buchstaben.',
    descEn: 'The four foundational rules when a vowelless Nun or Tanwin meets the 28 Arabic letters.',
    descKu: 'چوار حوکمە سەرەکییەکەی بەیەکگەیشتنی نوونی زەنەدار یان تەنوین لەگەڵ پیتەکانی زمانی عەرەبی.',
    rules: [
      {
        titleAr: 'الإظهار الحلقي (ء هـ ع ح غ خ)',
        titleDe: 'Al-Iẓhār al-Ḥalqī (Klare Aussprache der 6 Kehllaute)',
        titleEn: 'Al-Izhar al-Halqi (Clear Throat Pronunciation)',
        titleKu: 'ئیزهاری حەلقی (دەربڕینی ئاشکرای ٦ پیتی قوڕگ)',
        colorBadge: 'Klassisch Schwarz (Keine Ghunnah-Dehnung)',
        colorHex: '#94a3b8',
        ruleDe: 'Folgt auf ein Nūn Sākinah (نْ) oder Tanwīn einer der 6 Kehllaute (ء هـ ع ح غ خ), wird das Nūn klar, deutlich und ohne zusätzliche Näselung (Ghunnah) ausgesprochen.',
        ruleEn: 'When Nun Sakinah or Tanwin is followed by any of the 6 throat letters (ء هـ ع ح غ خ), the Nun is pronounced clearly without nasal elongation.',
        ruleKu: 'کاتێک لە دوای نوونی زەنەدار یان تەنوین یەکێک لە ٦ پیتەکەی قوڕگ (ء هـ ع ح غ خ) بێت، نوونەکە بە ئاشکرا و بەبێ مینگە درێژکردنەوە دەخوێندرێتەوە.',
        examples: [
          { ar: 'مَنْ آمَنَ', surah: 2, ayah: 62, noteDe: 'Nūn vor Hamzah (ء)', noteEn: 'Nun before Hamzah', noteKu: 'نوون لە پێش هەمزە' },
          { ar: 'مِنْ هَادٍ', surah: 13, ayah: 33, noteDe: 'Nūn vor Hā’ (هـ)', noteEn: 'Nun before Ha', noteKu: 'نوون لە پێش هاء' },
          { ar: 'أَنْعَمْتَ عَلَيْهِمْ', surah: 1, ayah: 7, noteDe: 'Nūn vor ‘Ayn (ع)', noteEn: 'Nun before Ayn', noteKu: 'نوون لە پێش عەین' },
          { ar: 'عَلِيمٌ حَكِيمٌ', surah: 2, ayah: 32, noteDe: 'Tanwīn vor Ḥā’ (ح)', noteEn: 'Tanwin before Ha', noteKu: 'تەنوین لە پێش حاء' }
        ]
      },
      {
        titleAr: 'الإدغام بغنة وبغير غنة (ي ر م ل و ن)',
        titleDe: 'Al-Idghām (Verschmelzung bei ي ر م ل و ن)',
        titleEn: 'Al-Idgham (Merging into ي ر م ل و ن)',
        titleKu: 'ئیدغام بە غوننە و بەبێ غوننە (يرملون)',
        colorBadge: 'Grün im Muṣḥaf (mit Ghunnah: ي ن م و) / Grau (ل ر)',
        colorHex: '#10b981',
        ruleDe: 'Folgt einer der Buchstaben (ي ن م و - ينمو), verschmilzt das Nūn mit einer 2-Harakāt-Näselung (Idghām bi-Ghunnah). Bei Lām (ل) und Rā’ (ر) verschmilzt es vollständig ohne Näselung (Idghām bilā Ghunnah).',
        ruleEn: 'With letters (ي ن م و), merge with a 2-count nasal sound (Ghunnah). With (ل) and (ر), merge completely without nasalization.',
        ruleKu: 'لەگەڵ پیتەکانی (ي ن م و) تێکەڵ دەکرێت بە مینگەی ٢ حەرەکە (ئیدغام بە غوننە)، و لەگەڵ (ل، ر) بە تەواوی تێکەڵ دەکرێت بەبێ غوننە.',
        examples: [
          { ar: 'فَمَن يَعْمَلْ', surah: 99, ayah: 7, noteDe: 'Idghām mit Ghunnah (ي)', noteEn: 'Idgham with Ghunnah', noteKu: 'ئیدغام بە غوننە لەگەڵ یاء' },
          { ar: 'مِن نِّعْمَةٍ', surah: 16, ayah: 53, noteDe: 'Idghām mit Ghunnah (ن)', noteEn: 'Idgham with Ghunnah', noteKu: 'ئیدغام بە غوننە لەگەڵ نوون' },
          { ar: 'مِن رَّبِّهِمْ', surah: 2, ayah: 5, noteDe: 'Idghām ohne Ghunnah (ر)', noteEn: 'Idgham without Ghunnah', noteKu: 'ئیدغام بێ غوننە لەگەڵ ڕاء' },
          { ar: 'هُدًى لِّلْمُتَّقِينَ', surah: 2, ayah: 2, noteDe: 'Idghām ohne Ghunnah (ل)', noteEn: 'Idgham without Ghunnah', noteKu: 'ئیدغام بێ غوننە لەگەڵ لام' }
        ]
      },
      {
        titleAr: 'الإقلاب (حرف الباء - ب)',
        titleDe: 'Al-Iqlāb (Umwandlung in Mīm vor Bā’ ب)',
        titleEn: 'Al-Iqlab (Conversion to Mim before Ba ب)',
        titleKu: 'ئیقلاب (گۆڕینی نوون بۆ میم لە پێش پیتی باء)',
        colorBadge: 'Violett / Grün (Kleines مـ über dem Nūn)',
        colorHex: '#a855f7',
        ruleDe: 'Trifft Nūn Sākinah oder Tanwīn auf den Buchstaben Bā’ (ب), wird das Nūn klanglich in ein sanftes Mīm (م) mit 2 Harakāt Ghunnah umgewandelt (im Muṣḥaf durch ein kleines مـ markiert).',
        ruleEn: 'When Nun Sakinah or Tanwin meets Ba (ب), it converts into a hidden Mim sound accompanied by a 2-count Ghunnah.',
        ruleKu: 'کاتێک نوونی زەنەدار یان تەنوین دەگات بە پیتی (ب)، دەنگەکەی دەگۆڕێت بۆ (میم) لەگەڵ مینگەی ٢ حەرەکە (لە مصحفدا مـ بچووکی لەسەرە).',
        examples: [
          { ar: 'مِنۢ بَعْدِ', surah: 2, ayah: 27, noteDe: 'Nūn vor Bā’ → Mīm mit Ghunnah', noteEn: 'Nun before Ba', noteKu: 'نوون لە پێش باء' },
          { ar: 'سَمِيعٌۢ بَصِيرٌ', surah: 22, ayah: 75, noteDe: 'Tanwīn vor Bā’', noteEn: 'Tanwin before Ba', noteKu: 'تەنوین لە پێش باء' },
          { ar: 'أَنۢبِئْهُم', surah: 2, ayah: 33, noteDe: 'In einem Wort (Iqlāb)', noteEn: 'Within one word', noteKu: 'ئیقلاب لە یەک وشەدا' }
        ]
      },
      {
        titleAr: 'الإخفاء الحقيقي (١٥ حرفًا)',
        titleDe: 'Al-Ikhfā’ al-Ḥaqīqī (Verhüllung bei 15 Buchstaben)',
        titleEn: 'Al-Ikhfa al-Haqiqi (Concealment before 15 Letters)',
        titleKu: 'ئیخفائی حەقیقی (شاردنەوە لە پێش ١٥ پیتدا)',
        colorBadge: 'Smaragdgrün (2 Harakāt Ghunnah)',
        colorHex: '#059669',
        ruleDe: 'Vor den übrigen 15 Buchstaben (ت ث ج د ذ ز س ش ص ض ط ظ ف ق ك) wird das Nūn zwischen Iẓhār und Idghām sanft verhüllt und mit 2 Harakāt Ghunnah genäselt.',
        ruleEn: 'Before the remaining 15 letters, the Nun is pronounced in a concealed state between clarity and merging, with a 2-count Ghunnah.',
        ruleKu: 'لە پێش ١٥ پیتەکەی تردا، نوونەکە لە نێوان ئاشکراکردن و تێکەڵکردندا بە نەرمی دەشاردرێتەوە لەگەڵ مینگەی ٢ حەرەکە.',
        examples: [
          { ar: 'مِن تَحْتِهَا', surah: 2, ayah: 25, noteDe: 'Ikhfā’ vor Tā’ (ت)', noteEn: 'Ikhfa before Ta', noteKu: 'ئیخفاء لە پێش تاء' },
          { ar: 'أَنفُسَهُمْ', surah: 2, ayah: 9, noteDe: 'Ikhfā’ vor Fā’ (ف)', noteEn: 'Ikhfa before Fa', noteKu: 'ئیخفاء لە پێش فاء' },
          { ar: 'مِن قَبْلِكَ', surah: 2, ayah: 4, noteDe: 'Volle Ghunnah vor Qāf (ق)', noteEn: 'Heavy Ghunnah before Qaf', noteKu: 'ئیخفائی قورس لە پێش قاف' }
        ]
      }
    ]
  },
  {
    id: 'mim_ghunnah',
    icon: 'fa-volume-high',
    color: '#059669',
    badgeAr: '٤ أحكام',
    titleAr: '٢. أحكام الميم الساكنة والغنة المشددة',
    titleDe: '2. Mīm Sākinah & Ghunnah (مْ / نّ / مّ)',
    titleEn: '2. Rules of Mīm Sākinah & Shaddah Ghunnah',
    titleKu: '٢. حوکمەکانی میمی زەنەدار و غوننەی شەددەدار (مْ / نّ / مّ)',
    descDe: 'Regeln der Lippenlaute beim ruhenden Mīm (مْ) sowie die 2-Harakāt-Pflichtnäselung bei نّ und مّ.',
    descEn: 'Labial rules of vowelless Mim (مْ) and obligatory 2-count nasalization on نّ and مّ.',
    descKu: 'حوکمەکانی میمی زەنەدار و مینگەی واجبی دوو حەرەکە لەسەر (نّ) و (مّ).',
    rules: [
      {
        titleAr: 'الغنة المشددة (نّ / مّ)',
        titleDe: 'Nūn & Mīm mit Shaddah (نّ / مّ — 2 Harakāt Ghunnah)',
        titleEn: 'Nun & Mim with Shaddah (Obligatory 2-Count Ghunnah)',
        titleKu: 'نوون و میمی شەددەدار (غوننەی واجب بە ئەندازەی ٢ حەرەکە)',
        colorBadge: 'Smaragdgrün (Höchste Stufe der Ghunnah)',
        colorHex: '#10b981',
        ruleDe: 'Jedes Nūn oder Mīm mit einer Shaddah (نّ / مّ) muss stets mit einer deutlichen, weichen Näselung (Ghunnah) von 2 Harakāt Dauer gehalten werden.',
        ruleEn: 'Every Nun or Mim carrying a Shaddah (نّ / مّ) must be held with a full nasal resonance (Ghunnah) for 2 counts.',
        ruleKu: 'هەموو نوون و میمێک کە شەددەی لەسەر بێت (نّ / مّ) واجبە بە ئەندازەی دوو حەرەکە مینگە (غوننە)ی تێدا بکرێت.',
        examples: [
          { ar: 'إِنَّ اللَّهَ', surah: 2, ayah: 20, noteDe: 'Nūn Mushaddadah (نّ)', noteEn: 'Shaddah on Nun', noteKu: 'نوونی شەددەدار' },
          { ar: 'ثُمَّ كَلَّا', surah: 78, ayah: 5, noteDe: 'Mīm Mushaddadah (مّ)', noteEn: 'Shaddah on Mim', noteKu: 'میمی شەددەدار' },
          { ar: 'مِنَ الْجِنَّةِ وَالنَّاسِ', surah: 114, ayah: 6, noteDe: 'Zwei Nūn Mushaddadah', noteEn: 'Double Shaddah Nun', noteKu: 'دوو نوونی شەددەدار' }
        ]
      },
      {
        titleAr: 'الإخفاء الشفوي (مْ + ب)',
        titleDe: 'Al-Ikhfā’ ash-Shafawī (Lippen-Verhüllung: مْ vor ب)',
        titleEn: 'Al-Ikhfa ash-Shafawi (Labial Concealment: مْ before ب)',
        titleKu: 'ئیخفائی شەفەوی (میمی زەنەدار لە پێش پیتی باء)',
        colorBadge: 'Grün (Sanfter Lippenschluss mit Ghunnah)',
        colorHex: '#10b981',
        ruleDe: 'Folgt auf ein ruhendes Mīm (مْ) der Buchstabe Bā’ (ب), wird das Mīm mit sanftem Lippenkontakt und 2 Harakāt Ghunnah verhüllt.',
        ruleEn: 'When Mim Sakinah is followed by Ba (ب), it is concealed with gentle lip contact and a 2-count Ghunnah.',
        ruleKu: 'کاتێک لە دوای میمی زەنەدار پیتی (ب) بێت، میمەکە بە نەرمی و بە غوننەی ٢ حەرەکە دەخوێندرێتەوە.',
        examples: [
          { ar: 'تَرْمِيهِم بِحِجَارَةٍ', surah: 105, ayah: 4, noteDe: 'Mīm Sākinah vor Bā’', noteEn: 'Mim before Ba', noteKu: 'میم لە پێش باء' },
          { ar: 'وَمَا هُم بِمُؤْمِنِينَ', surah: 2, ayah: 8, noteDe: 'Lippen-Ikhfā’ mit Ghunnah', noteEn: 'Labial Ikhfa', noteKu: 'ئیخفائی لێوی' }
        ]
      },
      {
        titleAr: 'الإدغام الشفوي والإظهار الشفوي',
        titleDe: 'Idghām Shafawī (مْ + م) & Iẓhār Shafawī (مْ + übrige 26)',
        titleEn: 'Idgham Shafawi (مْ + م) & Izhar Shafawi (Remaining 26)',
        titleKu: 'ئیدغامی شەفەوی (مْ + م) و ئیزهاری شەفەوی',
        colorBadge: 'Grün bei مْ+م / Klar bei allen anderen Buchstaben',
        colorHex: '#34d399',
        ruleDe: 'Trifft مْ auf ein weiteres م, verschmelzen beide mit 2 Harakāt Ghunnah. Vor allen anderen 26 Buchstaben (besonders vor و und ف!) wird مْ klar ohne Dehnung gesprochen.',
        ruleEn: 'When مْ meets another م, merge with 2-count Ghunnah. Before the other 26 letters (especially و and ف), pronounce clearly without elongation.',
        ruleKu: 'کاتێک (مْ) بگات بە (م) تێکەڵ دەبن بە غوننە؛ و لە پێش ٢٦ پیتەکەی تر بە ئاشکرا دەخوێندرێتەوە.',
        examples: [
          { ar: 'لَهُم مَّا يَشَاءُونَ', surah: 16, ayah: 31, noteDe: 'Idghām Shafawī (مْ + م)', noteEn: 'Merging two Mims', noteKu: 'ئیدغامی دوو میم' },
          { ar: 'هُمْ فِيهَا خَالِدُونَ', surah: 2, ayah: 39, noteDe: 'Iẓhār Shafawī vor Fā’ (ف)', noteEn: 'Clear Mim before Fa', noteKu: 'ئیزهاری میم لە پێش فاء' }
        ]
      }
    ]
  },
  {
    id: 'qalqalah',
    icon: 'fa-bolt',
    color: '#0284c7',
    badgeAr: 'قطب جد (٥ حروف)',
    titleAr: '٣. أحكام القلقلة ومراتبها (ق ط ب ج د)',
    titleDe: '3. Al-Qalqalah — Resonanzklang (ق ط ب ج د)',
    titleEn: '3. Al-Qalqalah — Echoing Bounce (ق ط ب ج د)',
    titleKu: '٣. قەلقەلە و پلەکانی (ق ط ب ج د — قطب جد)',
    descDe: 'Das federnde Schwingen der 5 Qalqalah-Buchstaben (ق ط ب ج د), wenn sie ein Sukūn tragen oder beim Stopp ruhen.',
    descEn: 'The crisp echoing bounce produced when any of the 5 letters (ق ط ب ج د) carries a Sukun or is stopped upon.',
    descKu: 'دەنگدانەوە و لەرینەوەی پێنج پیتەکەی (ق ط ب ج د) کاتێک زەنەدار دەبن یان لە کۆتایی ئایەت دەوستیت لەسەریان.',
    rules: [
      {
        titleAr: 'القلقلة الصغرى (في وسط الكلمة أو الآية)',
        titleDe: 'Qalqalah Sughrā (Kleine Resonanz in der Wortmitte)',
        titleEn: 'Qalqalah Sughra (Minor Bounce in Mid-Word/Verse)',
        titleKu: 'قەلقەلەی بچووک (لە ناوەڕاستی وشە یان ئایەتدا)',
        colorBadge: 'Himmelblau im Muṣḥaf (.tj-qalqalah)',
        colorHex: '#0284c7',
        ruleDe: 'Steht einer der 5 Buchstaben (ق ط ب ج د) mit Sukūn mitten im Wort oder Satz, entsteht ein kurzer, klarer Resonanzimpuls ohne Vokalanfärbung.',
        ruleEn: 'When one of (ق ط ب ج د) has a Sukun in the middle of a word or continuous flow, pronounce it with a light, crisp bounce.',
        ruleKu: 'کاتێک یەکێک لە پیتەکانی (قطب جد) بە زەنەداری لە ناوەڕاستی وشەدا بێت، بە لەرینەوەیەکی سووک و ڕوون دەخوێندرێتەوە.',
        examples: [
          { ar: 'يَدْخُلُونَ', surah: 110, ayah: 2, noteDe: 'Dāl (دْ) in der Wortmitte', noteEn: 'Dal with Sukun', noteKu: 'پیتی دال لە ناوەڕاستی وشەدا' },
          { ar: 'أَطْعَمَهُم', surah: 106, ayah: 4, noteDe: 'Ṭā’ (طْ) mit Qalqalah Sughrā', noteEn: 'Ta with Sukun', noteKu: 'پیتی طاء بە زەنەداری' },
          { ar: 'خَلَقْنَا', surah: 95, ayah: 4, noteDe: 'Qāf (قْ) in der Wortmitte', noteEn: 'Qaf with Sukun', noteKu: 'پیتی قاف لە ناوەڕاستدا' }
        ]
      },
      {
        titleAr: 'القلقلة الكبرى (عند الوقف في آخر الكلمة)',
        titleDe: 'Qalqalah Kubrā (Starke Resonanz beim Stopp am Versende)',
        titleEn: 'Qalqalah Kubra (Major Bounce when Stopping at Verse End)',
        titleKu: 'قەلقەلەی گەورە (لە کاتی وەستان لەسەر کۆتایی وشە و ئایەت)',
        colorBadge: 'Leuchtend Blau am Versende',
        colorHex: '#38bdf8',
        ruleDe: 'Stoppt man am Ende eines Verses auf einem der 5 Buchstaben (ق ط ب ج د), erklingt die Qalqalah deutlich und kraftvoll (besonders stark bei Shaddah wie الْحَقُّ).',
        ruleEn: 'When stopping on any of (ق ط ب ج د) at the end of a verse, the echoing bounce is pronounced clearly and prominently.',
        ruleKu: 'کاتێک لە کۆتایی ئایەت لەسەر یەکێک لە پیتەکانی (قطب جد) دەوەستین، قەلقەلەکە بە بەهێزی و ئاشکرا دەردەبڕدرێت.',
        examples: [
          { ar: 'قُلْ هُوَ اللَّهُ أَحَدٌ', surah: 112, ayah: 1, noteDe: 'Stopp auf Dāl (أَحَدْ)', noteEn: 'Stopping on Dal', noteKu: 'وەستان لەسەر پیتی دال' },
          { ar: 'بِرَبِّ الْفَلَقِ', surah: 113, ayah: 1, noteDe: 'Stopp auf Qāf (الْفَلَقْ)', noteEn: 'Stopping on Qaf', noteKu: 'وەستان لەسەر پیتی قاف' },
          { ar: 'وَتَبَّ', surah: 111, ayah: 1, noteDe: 'Stopp auf Bā’ mit Shaddah (Akbar)', noteEn: 'Stopping on Shaddah Ba', noteKu: 'وەستان لەسەر بائی شەددەدار' }
        ]
      }
    ]
  },
  {
    id: 'mudud',
    icon: 'fa-arrows-left-right',
    color: '#e11d48',
    badgeAr: '٢ إلى ٦ حركات',
    titleAr: '٤. أحكام المدود ومقاديرها (٢ - ٤ - ٦ حركات)',
    titleDe: '4. Al-Mudūd — Vokaldehnungen (2, 4–5 & 6 Harakāt)',
    titleEn: '4. Al-Mudud — Rules of Elongation (2, 4–5 & 6 Counts)',
    titleKu: '٤. حوکمەکانی مەد و درێژکردنەوە (٢، ٤-٥ و ٦ حەرەکە)',
    descDe: 'Die exakten Längen der Dehnungsbuchstaben (ا و ي) nach der Überlieferung von Ḥafṣ ‘an ‘Āṣim.',
    descEn: 'The exact durations of the elongation letters (ا و ي) according to Hafs an Asim.',
    descKu: 'ئەندازەی دروستی درێژکردنەوەی پیتەکانی مەد (ا و ي) لە ڕیوایەتی حەفس لە عاسیمەوە.',
    rules: [
      {
        titleAr: 'المد الطبيعي (حركتان - ٢)',
        titleDe: 'Al-Madd aṭ-Ṭabī‘ī (Natürliche Dehnung: exakt 2 Harakāt)',
        titleEn: 'Al-Madd at-Tabi‘i (Natural Elongation: 2 Counts)',
        titleKu: 'مەددی تەبیعی (درێژکردنەوەی سروشتی: ٢ حەرەکە)',
        colorBadge: 'Standard (2 Harakāt ohne Hamzah/Sukūn danach)',
        colorHex: '#f43f5e',
        ruleDe: 'Ein Dehnungsbuchstabe (Alif nach Fatḥah, Wāw nach Ḍammah, Yā’ nach Kasrah), dem weder ein Hamzah noch ein Sukūn folgt, wird exakt 2 Harakāt gedehnt.',
        ruleEn: 'A Madd letter not followed by Hamzah or Sukun is elongated for exactly 2 counts.',
        ruleKu: 'پیتی مەد کاتێک هەمزە یان زەنەی بەدوادا نەیەت، بە ئەندازەی دوو حەرەکە درێژ دەکرێتەوە.',
        examples: [
          { ar: 'قَالُوا', surah: 2, ayah: 11, noteDe: 'Alif (2) & Wāw (2)', noteEn: '2 counts each', noteKu: 'دوو حەرەکە' },
          { ar: 'نُوحِيهَا', surah: 11, ayah: 49, noteDe: 'Drei natürliche Mudūd (و - ي - ا)', noteEn: 'All three Madd letters', noteKu: 'هەرسێ پیتی مەد لە یەک وشەدا' }
        ]
      },
      {
        titleAr: 'المد المتصل والمد المنفصل (٤ إلى ٥ حركات)',
        titleDe: 'Madd Muttaṣil (Pflicht: 4–5) & Madd Munfaṣil (4–5 Harakāt)',
        titleEn: 'Madd Muttasil (Connected: 4–5) & Munfasil (Separated: 4–5)',
        titleKu: 'مەددی موتتەسیل (لکاو) و مەددی مونفەسیل (جیا: ٤ بۆ ٥ حەرەکە)',
        colorBadge: 'Karminrot im Muṣḥaf (.tj-madd mit Wellenzeichen ٓ )',
        colorHex: '#e11d48',
        ruleDe: 'Folgt auf einen Madd-Buchstaben ein Hamzah (ء) im selben Wort (Muttaṣil) oder am Anfang des nächsten Wortes (Munfaṣil), wird der Vokal 4 bis 5 Harakāt gedehnt (markiert durch ٓ ).',
        ruleEn: 'When a Madd letter is followed by a Hamzah in the same word (Muttasil) or at the start of the next word (Munfasil), elongate for 4 to 5 counts.',
        ruleKu: 'ئەگەر لە دوای پیتی مەد هەمزە بێت لە هەمان وشەدا (موتتەسیل) یان لە سەرەتای وشەی دواتردا (مونفەسیل)، ٤ بۆ ٥ حەرەکە درێژ دەکرێتەوە.',
        examples: [
          { ar: 'جَآءَ نَصْرُ اللَّهِ', surah: 110, ayah: 1, noteDe: 'Madd Wājib Muttaṣil (4–5 Harakāt)', noteEn: 'Connected Madd (4-5)', noteKu: 'مەددی موتتەسیل (٤-٥ حەرەکە)' },
          { ar: 'إِنَّآ أَعْطَيْنَاكَ', surah: 108, ayah: 1, noteDe: 'Madd Jā’iz Munfaṣil (4–5 Harakāt)', noteEn: 'Separated Madd (4-5)', noteKu: 'مەددی مونفەسیل (٤-٥ حەرەکە)' }
        ]
      },
      {
        titleAr: 'المد اللازم (٦ حركات لزومًا)',
        titleDe: 'Al-Madd al-Lāzim (Zwingende Dehnung: volle 6 Harakāt)',
        titleEn: 'Al-Madd al-Lazim (Compulsory Elongation: 6 Counts)',
        titleKu: 'مەددی لازم (درێژکردنەوەی واجب بە ئەندازەی ٦ حەرەکەی تەواو)',
        colorBadge: 'Tiefrot (6 Harakāt vor Shaddah/Sukūn)',
        colorHex: '#be123c',
        ruleDe: 'Folgt auf einen Madd-Buchstaben im selben Wort ein festes Sukūn oder eine Shaddah (oder in den Eröffnungsbuchstaben wie الم / حم), MUSS volle 6 Harakāt gedehnt werden.',
        ruleEn: 'When a Madd letter is followed by an original Sukun or Shaddah in the same word (or in Muqatta‘at letters), elongate for a full 6 counts.',
        ruleKu: 'کاتێک لە دوای پیتی مەد شەددە یان زەنەی ئەسڵی بێت لە هەمان وشەدا (یان لە پیتە پچڕاوەکانی سەرەتای سوورەتەکاندا)، پێویستە ٦ حەرەکەی تەواو درێژ بکرێتەوە.',
        examples: [
          { ar: 'وَلَا الضَّآلِّينَ', surah: 1, ayah: 7, noteDe: 'Madd Lāzim Kalimi Muthaqqal (6 Harakāt)', noteEn: '6 Counts Compulsory Madd', noteKu: 'مەددی لازم (٦ حەرەکە)' },
          { ar: 'الْحَآقَّةُ', surah: 69, ayah: 1, noteDe: 'Alif vor Shaddah (6 Harakāt)', noteEn: '6 Counts before Shaddah', noteKu: '٦ حەرەکە لە پێش شەددە' },
          { ar: 'الٓمٓ', surah: 2, ayah: 1, noteDe: 'Lām (6) & Mīm (6 Harakāt)', noteEn: 'Muqatta‘at Letters (6 counts)', noteKu: 'پیتەکانی سەرەتای سوورەت (٦ حەرەکە)' }
        ]
      }
    ]
  },
  {
    id: 'tafkhim',
    icon: 'fa-mountain',
    color: '#d97706',
    badgeAr: 'خص ضغط قظ',
    titleAr: '٥. التفخيم والترقيق وأحكام الراء ولام لفظ الجلالة',
    titleDe: '5. Tafkhīm (Vollklang) & Tarqīq (Feinklang)',
    titleEn: '5. Tafkhim (Heaviness) & Tarqiq (Lightness)',
    titleKu: '٥. قەڵەوکردن (تەفخیم) و ناسککردن (تەرقیق) و حوکمی ڕاء و لام',
    descDe: 'Wann Buchstaben voll und kraftvoll (Tafkhīm) oder hell und fein (Tarqīq) ausgesprochen werden.',
    descEn: 'When letters are pronounced with full mouth resonance (Tafkhim) versus light resonance (Tarqiq).',
    descKu: 'چۆنیەتی خوێندنەوەی پیتە قورسەکان (خص ضغط قظ) و حوکمەکانی پیتی (ر) و لامی ناوی پیرۆزی (الله).',
    rules: [
      {
        titleAr: 'حروف الاستعلاء السبعة (خ ص ض غ ط ق ظ)',
        titleDe: 'Die 7 stets vollen Buchstaben (خص ضغط قظ)',
        titleEn: 'The 7 Always-Heavy Letters (خص ضغط قظ)',
        titleKu: 'حەوت پیتە هەمیشە قورسەکان (خص ضغط قظ)',
        colorBadge: 'Gold / Dunkelblau (Stets kraftvoller Vollklang)',
        colorHex: '#f59e0b',
        ruleDe: 'Die 7 Buchstaben (خ ص ض غ ط ق ظ) werden immer mit angehobenem Zungenrücken voll und resonant (Mufakhkham) ausgesprochen – am stärksten mit Fatḥah und Alif.',
        ruleEn: 'The 7 elevated letters (خ ص ض غ ط ق ظ) are always pronounced with full heavy resonance.',
        ruleKu: 'ئەم حەوت پیتە (خ ص ض غ ط ق ظ) لە هەموو بارێکدا بە قورسی و پڕیی دەم دەخوێندرێنەوە.',
        examples: [
          { ar: 'الصِّرَاطَ الْمُسْتَقِيمَ', surah: 1, ayah: 6, noteDe: 'Ṣād (ص), Ṭā’ (ط) & Qāf (ق)', noteEn: 'Heavy Sad, Ta, Qaf', noteKu: 'صاد و طاء و قافی قورس' },
          { ar: 'خَالِدِينَ فِيهَا', surah: 2, ayah: 25, noteDe: 'Khā’ mit Alif (خَا — höchste Stufe)', noteEn: 'Highest degree of Tafkhim', noteKu: 'بەرزترین پلەی تەفخیم' }
        ]
      },
      {
        titleAr: 'لام لفظ الجلالة (اللَّه) وأحكام الراء (ر)',
        titleDe: 'Das Lām im Namen Allahs (اللَّه) & der Buchstabe Rā’ (ر)',
        titleEn: 'The Lam in Allah\'s Name (اللَّه) & Rules of Ra (ر)',
        titleKu: 'لامی ناوی پیرۆزی (اللَّه) و حوکمەکانی پیتی (ر)',
        colorBadge: 'Voll nach Fatḥah/Ḍammah · Fein nach Kasrah',
        colorHex: '#fbbf24',
        ruleDe: 'Das Lām in (اللَّه) und der Buchstabe Rā’ (ر) werden voll (Tafkhīm) gesprochen, wenn sie mit Fatḥah oder Ḍammah verbunden sind, und fein/hell (Tarqīq), wenn sie mit Kasrah stehen (z. B. بِسْمِ اللَّهِ / رِزْقًا).',
        ruleEn: 'The Lam in Allah and the letter Ra are heavy (Tafkhim) with Fathah/Dammah, and light (Tarqiq) with Kasrah.',
        ruleKu: 'لامی ناوی پیرۆزی (اللَّه) و پیتی (ر) لەگەڵ فەتحە و زەممە قورس دەخوێندرێنەوە، و لەگەڵ کەسرە بە ناسکی (تەرقیق) دەخوێندرێنەوە.',
        examples: [
          { ar: 'هُوَ اللَّهُ أَحَدٌ', surah: 112, ayah: 1, noteDe: 'Volles Lām in اللَّهُ nach Fatḥah', noteEn: 'Heavy Lam after Fathah', noteKu: 'لامی قورس لە دوای فەتحە' },
          { ar: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', surah: 1, ayah: 1, noteDe: 'Feines Lām nach Kasrah (بِسْمِ اللَّهِ)', noteEn: 'Light Lam after Kasrah', noteKu: 'لامی ناسک لە دوای کەسرە' }
        ]
      }
    ]
  },
  {
    id: 'waqf',
    icon: 'fa-OCTAGON',
    color: '#a855f7',
    badgeAr: '٦ علامات وقف',
    titleAr: '٦. علامات الوقف والابتداء في مصحف المدينة النبوية',
    titleDe: '6. Waqf-Zeichen (Pausenzeichen im Medina-Muṣḥaf)',
    titleEn: '6. Waqf & Stopping Signs in the Madinah Mushaf',
    titleKu: '٦. نیشانەکانی وەستان (وەقف) لە مصحفی مەدینەی منەووەرەدا',
    descDe: 'Die offiziellen Stopp- und Weiterlese-Symbole des König-Fahd-Komplexes in Medina.',
    descEn: 'The official stopping and continuation symbols of the King Fahd Glorious Quran Printing Complex.',
    descKu: 'نیشانە فەرمییەکانی وەستان و بەردەوامبوون لە مصحفی شەریفی مەدینەدا.',
    rules: [
      {
        titleAr: 'مـ (الوقف اللازم)  |  لا (الوقف الممنوع)',
        titleDe: 'مـ (Verpflichtender Stopp) & لا (Nicht anhalten!)',
        titleEn: 'مـ (Compulsory Stop) & لا (Do Not Stop)',
        titleKu: 'مـ (وەستانی پێویست) و لا (نابێت لەسەری بوەستیت)',
        colorBadge: 'Wichtige Sinn-Bewahrung beim Rezitieren',
        colorHex: '#c084fc',
        ruleDe: 'Das kleine liegende Mīm (مـ) zeigt einen Pflichtstopp an, da sonst die Bedeutung verändert würde. Das Zeichen (لا) mitten im Vers bedeutet: Hier nicht anhalten und nicht direkt danach neu ansetzen!',
        ruleEn: 'The small horizontal Mim (مـ) indicates an obligatory stop to preserve meaning. The sign (لا) means do not stop here.',
        ruleKu: 'نیشانەی (مـ) واتە پێویستە بوەستیت تا واتای ئایەتەکە تێک نەچێت؛ و نیشانەی (لا) واتە لێرە مەوەستە و بەردەوام بە.',
        examples: [
          { ar: 'إِنَّمَا يَسْتَجِيبُ الَّذِينَ يَسْمَعُونَ ۘ وَالْمَوْتَىٰ يَبْعَثُهُمُ اللَّهُ', surah: 6, ayah: 36, noteDe: 'مـ Pflichtstopp nach يَسْمَعُونَ', noteEn: 'Compulsory stop (مـ)', noteKu: 'وەستانی پێویست (مـ)' }
        ]
      },
      {
        titleAr: 'قلى (الوقف أولى)  |  صلى (الوصل أولى)  |  ج (الوقف الجائز)',
        titleDe: 'قلى (Stopp bevorzugt) · صلى (Weiterlesen bevorzugt) · ج (Beides gleich)',
        titleEn: 'قلى (Stop Preferred) · صلى (Continue Preferred) · ج (Equal Option)',
        titleKu: 'قلى (وەستان باشترە) · صلى (بەردەوامبوون باشترە) · ج (هەردووکی دروستە)',
        colorBadge: 'Medina-Muṣḥaf Navigationssymbole',
        colorHex: '#38bdf8',
        ruleDe: 'Bei (قلى) ist das Pausieren besser; bei (صلى) ist das Weiterlesen besser (Stopp ist aber erlaubt); bei (ج) sind Stopp und Weiterlesen gleichermaßen gut; bei (ۛ ... ۛ) darf man nur an einem der beiden Punkte stoppen.',
        ruleEn: 'At (قلى) stopping is preferred; at (صلى) continuing is preferred; at (ج) both are equally permissible; at (ۛ ... ۛ) stop at one of the two, not both.',
        ruleKu: 'لە (قلى) وەستان باشترە؛ لە (صلى) بەردەوامبوون باشترە؛ لە (ج) هەردووکی وەک یەک دروستە؛ لە دوو سێ خاڵیش (ۛ ... ۛ) تەنها لەسەر یەکێکیان دەوەستیت.',
        examples: [
          { ar: 'ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ', surah: 2, ayah: 2, noteDe: 'Ta‘ānuq al-Waqf (ۛ ... ۛ)', noteEn: 'Stop at one of the two তিন-dot signs', noteKu: 'وەستانی هاوبەش (لەسەر یەکێکیان دەوەستیت)' }
        ]
      }
    ]
  }
];

// ============================================================
// 4. COMPREHENSIVE QURAN WORDBOOK LEXICON (CATEGORIZED + AUDIO)
// ============================================================
window.OFFICIAL_QURAN_DICTIONARY = [
  // Category: aqidah (Glaube, Namen Allahs & Tauhid)
  { cat: 'aqidah', ar: 'اللَّه', translit: 'Allāh', root: 'أ ل ه', freq: '2699×', de: 'Allah, der einzige wahre Gott und Schöpfer', en: 'Allah, the One True God and Creator', ku: 'خودای تاک و تەنیا و بەدیهێنەری هەموو جیهان', exAr: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ', surah: 2, ayah: 255 },
  { cat: 'aqidah', ar: 'الرَّحْمَٰن', translit: 'Ar-Raḥmān', root: 'ر ح م', freq: '57×', de: 'Der Allerbarmer (umfassende Barmherzigkeit für alle Geschöpfe)', en: 'The Most Compassionate, All-Merciful', ku: 'بەخشندەی گشتی بەسەر هەموو دروستکراواندا', exAr: 'الرَّحْمَٰنُ ۞ عَلَّمَ الْقُرْآنَ', surah: 55, ayah: 1 },
  { cat: 'aqidah', ar: 'الرَّحِيم', translit: 'Ar-Raḥīm', root: 'ر ح م', freq: '114×', de: 'Der Barmherzige (besondere Gnade für die Gläubigen)', en: 'The Especially Merciful', ku: 'میهرەبان و بەبەزەیی تایبەت بۆ ئیمانداران', exAr: 'وَكَانَ بِالْمُؤْمِنِينَ رَحِيمًا', surah: 33, ayah: 43 },
  { cat: 'aqidah', ar: 'رَبّ', translit: 'Rabb', root: 'ر ب ب', freq: '975×', de: 'Herr, Erhalter, Versorger und Erzieher', en: 'Lord, Sustainer, Cherisher and Master', ku: 'پەروەردگار، خاوەن و بەڕێوەبەری گەردوون', exAr: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', surah: 1, ayah: 2 },
  { cat: 'aqidah', ar: 'الْغَفُور', translit: 'Al-Ghafūr', root: 'غ ف ر', freq: '91×', de: 'Der Allvergebende, der Sünden bedeckt und verzeiht', en: 'The All-Forgiving', ku: 'لێخۆشبووی گەورە کە تاوانەکان دادەپۆشێت', exAr: 'نَبِّئْ عِبَادِي أَنِّي أَنَا الْغَفُورُ الرَّحِيمُ', surah: 15, ayah: 49 },
  { cat: 'aqidah', ar: 'الْعَلِيم', translit: 'Al-‘Alīm', root: 'ع ل م', freq: '157×', de: 'Der Allwissende; Wissen, Erkenntnis (‘Ilm)', en: 'The All-Knowing, Omniscient', ku: 'زانای هەموو نهێنی و ئاشکراکان', exAr: 'وَاللَّهُ بِكُلِّ شَيْءٍ عَلِيمٌ', surah: 2, ayah: 282 },
  { cat: 'aqidah', ar: 'الْحَكِيم', translit: 'Al-Ḥakīm', root: 'ح ك م', freq: '97×', de: 'Der Allweise; Weisheit (Ḥikmah)', en: 'The All-Wise', ku: 'دانای کاربەجێ و خاوەن حیکمەت', exAr: 'وَهُوَ الْعَزِيزُ الْحَكِيمُ', surah: 14, ayah: 4 },
  { cat: 'aqidah', ar: 'إِيمَان / آمَنُوا', translit: 'Īmān / Āmanū', root: 'أ م ن', freq: '811×', de: 'Glaube, Vertrauen, Sicherheit; diejenigen, die glauben', en: 'Faith, belief, security; those who believe', ku: 'ئیمان، باوەڕهێنان، ئاسایش؛ ئەوانەی باوەڕیان هێناوە', exAr: 'آمَنَ الرَّسُولُ بِمَا أُنزِلَ إِلَيْهِ مِن رَّبِّهِ وَالْمُؤْمِنُونَ', surah: 2, ayah: 285 },
  { cat: 'aqidah', ar: 'الْحَقّ', translit: 'Al-Ḥaqq', root: 'ح ق ق', freq: '287×', de: 'Die Wahrheit, das Recht, der Wahrhaftige', en: 'The Truth, Reality, the True One', ku: 'حەق و ڕاستی نەگۆڕ، ناوی پیرۆزی خودا', exAr: 'ذَٰلِكَ بِأَنَّ اللَّهَ هُوَ الْحَقُّ', surah: 22, ayah: 6 },
  { cat: 'aqidah', ar: 'نُور', translit: 'Nūr', root: 'ن و ر', freq: '49×', de: 'Licht, Erleuchtung, göttliche Rechtleitung', en: 'Light, illumination, divine guidance', ku: 'نوور و ڕووناکی و هیدایەتی خودایی', exAr: 'اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ', surah: 24, ayah: 35 },

  // Category: ibadah (Gebet, Dhikr & Gottesdienst)
  { cat: 'ibadah', ar: 'صَلَاة', translit: 'Ṣalāh', root: 'ص ل و', freq: '99×', de: 'Das rituelle Gebet, Segensgebet, Verbindung zu Allah', en: 'Ritual Prayer, blessing, connection to Allah', ku: 'نوێژ، سەڵاوات و پەیوەندی بەندە بە خوداوە', exAr: 'وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ', surah: 2, ayah: 43 },
  { cat: 'ibadah', ar: 'زَكَاة', translit: 'Zakāh', root: 'ز ك و', freq: '32×', de: 'Läuterungsabgabe, Reinheit und spirituelles Wachstum', en: 'Purifying alms-tax, purity and growth', ku: 'زەکات، پاکبوونەوە و گەشەکردن', exAr: 'خُذْ مِنْ أَمْوَالِهِمْ صَدَقَةً تُطَهِّرُهُمْ وَتُزَكِّيهِم بِهَا', surah: 9, ayah: 103 },
  { cat: 'ibadah', ar: 'ذِكْر', translit: 'Dhikr', root: 'ذ ك ر', freq: '292×', de: 'Gedenken Allahs, Ermahnung, der Koran', en: 'Remembrance of Allah, reminder, the Quran', ku: 'زیکر و یادکردنەوەی خودا، قورئانی پیرۆز', exAr: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ', surah: 13, ayah: 28 },
  { cat: 'ibadah', ar: 'دُعَاء', translit: 'Du‘ā’', root: 'د ع و', freq: '212×', de: 'Bittgebet, Anrufung Allahs, Einladung', en: 'Supplication, calling upon Allah', ku: 'دوعا و پاڕانەوە لە دەرگای خودا', exAr: 'ادْعُونِي أَسْتَجِبْ لَكُمْ', surah: 40, ayah: 60 },
  { cat: 'ibadah', ar: 'تَوْبَة', translit: 'Tawbah', root: 'ت و ب', freq: '87×', de: 'Reumütige Umkehr zu Allah und Vergebung', en: 'Repentance, turning back to Allah', ku: 'تەوبە و پەشیمانبوونەوە و گەڕانەوە بۆ لای خودا', exAr: 'يَا أَيُّهَا الَّذِينَ آمَنُوا تُوبُوا إِلَى اللَّهِ تَوْبَةً نَّصُوحًا', surah: 66, ayah: 8 },
  { cat: 'ibadah', ar: 'حَمْد', translit: 'Ḥamd', root: 'ح م د', freq: '68×', de: 'Dankbares Lob und Preisung Allahs', en: 'Grateful praise and glorification', ku: 'سوپاس و ستایشی پڕ لە خۆشەویستی بۆ خودا', exAr: 'وَلَهُ الْحَمْدُ فِي السَّمَاوَاتِ وَالْأَرْضِ', surah: 30, ayah: 18 },
  { cat: 'ibadah', ar: 'سُجُود', translit: 'Sujūd', root: 'س ج د', freq: '92×', de: 'Niederwerfung vor Allah (Moment größter Nähe)', en: 'Prostration before Allah', ku: 'سوجدەبردن و کڕنووش بردن بۆ خودا', exAr: 'وَاسْجُدْ وَاقْتَرِب', surah: 96, ayah: 19 },
  { cat: 'ibadah', ar: 'عِبَادَة / عَبْد', translit: '‘Ibādah / ‘Abd', root: 'ع ب د', freq: '275×', de: 'Gottesdienst, Hingabe; Diener Allahs', en: 'Worship, devotion; servant of Allah', ku: 'پەرستن و بەندایەتی؛ بەندەی خودا', exAr: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', surah: 1, ayah: 5 },

  // Category: akhlaq (Herz, Ethik & Tugenden)
  { cat: 'akhlaq', ar: 'تَقْوَىٰ', translit: 'Taqwā', root: 'و ق ي', freq: '258×', de: 'Gottesfurcht, Achtsamkeit und Schutz vor Sünde', en: 'God-consciousness, piety, mindfulness', ku: 'تەقوا و پارێزکاری و ترسی پڕ لە ڕێز لە خودا', exAr: 'وَاتَّقُوا اللَّهَ وَيُعَلِّمُكُمُ اللَّهُ', surah: 2, ayah: 282 },
  { cat: 'akhlaq', ar: 'صَبْر', translit: 'Ṣabr', root: 'ص ب ر', freq: '103×', de: 'Geduld, Standhaftigkeit und Ausdauer', en: 'Patience, perseverance, steadfastness', ku: 'ئارامگری و خۆڕاگری و پشوودرێژی', exAr: 'إِنَّ اللَّهَ مَعَ الصَّابِرِينَ', surah: 2, ayah: 153 },
  { cat: 'akhlaq', ar: 'شُكْر', translit: 'Shukr', root: 'ش ك ر', freq: '75×', de: 'Dankbarkeit durch Herz, Zunge und Tat', en: 'Gratitude and thankfulness', ku: 'شوکرانەبژێری و سوپاسگوزاری نیعمەتەکانی خودا', exAr: 'لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ', surah: 14, ayah: 7 },
  { cat: 'akhlaq', ar: 'إِحْسَان', translit: 'Iḥsān', root: 'ح س ن', freq: '194×', de: 'Vortrefflichkeit, Güte und Wohltätigkeit', en: 'Excellence, benevolence, doing good', ku: 'چاکەکاری و ئەنجامدانی کار بە جوانترین شێوە', exAr: 'هَلْ جَزَاءُ الْإِحْسَانِ إِلَّا الْإِحْسَانُ', surah: 55, ayah: 60 },
  { cat: 'akhlaq', ar: 'قَلْب / قُلُوب', translit: 'Qalb / Qulūb', root: 'ق ل ب', freq: '132×', de: 'Herz, spirituelles Zentrum des Menschen', en: 'Heart, spiritual center of the human being', ku: 'دڵ، ناوەندی ئیمان و تێگەیشتن لە مرۆڤدا', exAr: 'إِلَّا مَنْ أَتَى اللَّهَ بِقَلْبٍ سَلِيمٍ', surah: 26, ayah: 89 },
  { cat: 'akhlaq', ar: 'تَوَكُّل', translit: 'Tawakkul', root: 'و ك ل', freq: '70×', de: 'Vollkommenes Gottvertrauen bei aktivem Handeln', en: 'Complete reliance and trust in Allah', ku: 'پشتبەستنی تەواو بە خودا لە هەموو کارێکدا', exAr: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ', surah: 65, ayah: 3 },
  { cat: 'akhlaq', ar: 'عَدْل / قِسْط', translit: '‘Adl / Qisṭ', root: 'ع د ل', freq: '53×', de: 'Gerechtigkeit, Ausgewogenheit und Fairness', en: 'Justice, equity, fairness', ku: 'دادپەروەری و ویژدان و مامەڵەی ڕاست', exAr: 'إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ', surah: 16, ayah: 90 },
  { cat: 'akhlaq', ar: 'سَلَام', translit: 'Salām', root: 'س ل م', freq: '140×', de: 'Frieden, Heil, Geborgenheit und Gruß des Paradieses', en: 'Peace, safety, soundness, greeting of Paradise', ku: 'سەلامەتی و ئاشتی و ئارامی', exAr: 'سَلَامٌ قَوْلًا مِّن رَّبٍّ رَّحِيمٍ', surah: 36, ayah: 58 },
  { cat: 'akhlaq', ar: 'هُدًى', translit: 'Hudan', root: 'ه د ي', freq: '316×', de: 'Rechtleitung, Führung auf den geraden Weg', en: 'Guidance to the straight path', ku: 'هیدایەت و ڕێنموونی بۆ ڕێگای ڕاست', exAr: 'ذَٰلِكَ الْكِتَابُ لَا رَيْبَ فِيهِ هُدًى لِّلْمُتَّقِينَ', surah: 2, ayah: 2 },

  // Category: akhirah (Jenseits, Paradies & Gericht)
  { cat: 'akhirah', ar: 'الْآخِرَة', translit: 'Al-Ākhirah', root: 'أ خ ر', freq: '115×', de: 'Das Jenseits, das ewige Leben nach dem Tod', en: 'The Hereafter, eternal life', ku: 'ژینی دواڕۆژ و جیهانی هەمیشەیی قیامەت', exAr: 'وَلَلْآخِرَةُ خَيْرٌ لَّكَ مِنَ الْأُولَىٰ', surah: 93, ayah: 4 },
  { cat: 'akhirah', ar: 'جَنَّة / جَنَّات', translit: 'Jannah / Jannāt', root: 'ج ن ن', freq: '147×', de: 'Das Paradies, die Gärten der Ewigkeit', en: 'Paradise, Gardens of Eternity', ku: 'بەهەشت و باخە نەبڕاوەکانی ڕەحمەتی خودا', exAr: 'وَجَنَّةٍ عَرْضُهَا السَّمَاوَاتُ وَالْأَرْضُ أُعِدَّتْ لِلْمُتَّقِينَ', surah: 3, ayah: 133 },
  { cat: 'akhirah', ar: 'يَوْمُ الْقِيَامَة', translit: 'Yawmul-Qiyāmah', root: 'ق و م', freq: '70×', de: 'Der Tag der Auferstehung und Rechenschaft', en: 'The Day of Resurrection', ku: 'ڕۆژی هەستانەوە و قیامەت و لێپرسینەوە', exAr: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ لَيَجْمَعَنَّكُمْ إِلَىٰ يَوْمِ الْقِيَامَةِ', surah: 4, ayah: 87 },
  { cat: 'akhirah', ar: 'مِيزَان', translit: 'Mīzān', root: 'و ز ن', freq: '23×', de: 'Die Waage der Gerechtigkeit und der Taten', en: 'The Balance / Scale of justice and deeds', ku: 'تەرازووی حەق و کێشانی کردەوەکان', exAr: 'وَنَضَعُ الْمَوَازِينَ الْقِسْطَ لِيَوْمِ الْقِيَامَةِ', surah: 21, ayah: 47 },
  { cat: 'akhirah', ar: 'أَجْر / ثَوَاب', translit: 'Ajr / Thawāb', root: 'أ ج ر', freq: '108×', de: 'Lohn, Belohnung bei Allah für gute Werke', en: 'Reward and recompense with Allah', ku: 'پاداشت و خێری نەبڕاوەی کردەوە چاکەکان', exAr: 'إِنَّمَا يُوَفَّى الصَّابِرُونَ أَجْرَهُم بِغَيْرِ حِسَابٍ', surah: 39, ayah: 10 },

  // Category: qasas (Propheten, Offenbarung & Geschichte)
  { cat: 'qasas', ar: 'كِتَاب / قُرْآن', translit: 'Kitāb / Qur’ān', root: 'ق ر أ', freq: '330×', de: 'Das Buch, die Schrift, der Edle Koran (die Lesung)', en: 'The Book, Scripture, the Noble Quran', ku: 'پەڕتووکی پیرۆز و قورئانی خوێندراو', exAr: 'إِنَّا أَنزَلْنَاهُ قُرْآنًا عَرَبِيًّا لَّعَلَّكُمْ تَعْقِلُونَ', surah: 12, ayah: 2 },
  { cat: 'qasas', ar: 'نَبِيّ / رَسُول', translit: 'Nabiyy / Rasūl', root: 'ر س ل', freq: '513×', de: 'Prophet und Gesandter Allahs', en: 'Prophet and Messenger of Allah', ku: 'پێغەمبەر و نێردراوی هەڵبژێردراوی خودا', exAr: 'مُّحَمَّدٌ رَّسُولُ اللَّهِ', surah: 48, ayah: 29 },
  { cat: 'qasas', ar: 'آيَة / آيَات', translit: 'Āyah / Āyāt', root: 'أ ي ي', freq: '382×', de: 'Koranvers, göttliches Zeichen und Wunder', en: 'Quranic verse, divine sign and miracle', ku: 'ئایەتی قورئان، نیشانە و بەڵگەی دەسەڵاتی خودا', exAr: 'سَنُرِيهِمْ آيَاتِنَا فِي الْآفَاقِ وَفِي أَنفُسِهِمْ', surah: 41, ayah: 53 },
  { cat: 'qasas', ar: 'وَحْي', translit: 'Waḥy', root: 'و ح ي', freq: '78×', de: 'Göttliche Offenbarung und Eingebung', en: 'Divine revelation and inspiration', ku: 'وەحی و سروش و نیگای ئیلاهی', exAr: 'إِنْ هُوَ إِلَّا وَحْيٌ يُوحَىٰ', surah: 53, ayah: 4 },
  { cat: 'qasas', ar: 'مَلَائِكَة', translit: 'Malā’ikah', root: 'م ل ك', freq: '88×', de: 'Die Engel Allahs aus Licht', en: 'The Angels of Allah', ku: 'فریشتە پاک و گوێڕایەڵەکانی خودا', exAr: 'الْحَمْدُ لِلَّهِ فَاطِرِ السَّمَاوَاتِ وَالْأَرْضِ جَاعِلِ الْمَلَائِكَةِ رُسُلًا', surah: 35, ayah: 1 },

  // Category: kawn (Natur, Himmel & Schöpfung)
  { cat: 'kawn', ar: 'سَمَاوَات وَأَرْض', translit: 'Samāwāt wa Arḍ', root: 'س م و', freq: '461×', de: 'Die Himmel und die Erde (das gesamte Universum)', en: 'The Heavens and the Earth', ku: 'ئاسمانەکان و زەوی و تەواوی گەردوون', exAr: 'لِلَّهِ مُلْكُ السَّمَاوَاتِ وَالْأَرْضِ', surah: 2, ayah: 284 },
  { cat: 'kawn', ar: 'شَمْس وَقَمَر', translit: 'Shams wa Qamar', root: 'ش م س', freq: '60×', de: 'Sonne und Mond (Zeichen der göttlichen Ordnung)', en: 'The Sun and the Moon', ku: 'خۆر و مانگ (دوو نیشانەی ڕێکخستنی خودایی)', exAr: 'الشَّمْسُ وَالْقَمَرُ بِحُسْبَانٍ', surah: 55, ayah: 5 },
  { cat: 'kawn', ar: 'مَاء / بَحْر', translit: 'Mā’ / Baḥr', root: 'م و ه', freq: '104×', de: 'Wasser (Ursprung alles Lebendigen) und Meer', en: 'Water (source of all living things) and Sea', ku: 'ئاو (سەرچاوەی ژیانی هەموو زیندەوەران) و دەریا', exAr: 'وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ', surah: 21, ayah: 30 },
  { cat: 'kawn', ar: 'لَيْل وَنَهَار', translit: 'Layl wa Nahār', root: 'ل ي ل', freq: '149×', de: 'Nacht und Tag im harmonischen Wechsel', en: 'Night and Day in harmonious alternation', ku: 'شەو و ڕۆژ و جێگۆڕکێی بەردەوامیان', exAr: 'إِنَّ فِي خَلْقِ السَّمَاوَاتِ وَالْأَرْضِ وَاخْتِلَافِ اللَّيْلِ وَالنَّهَارِ لَآيَاتٍ', surah: 3, ayah: 190 },
  { cat: 'kawn', ar: 'نَفْس / رُوح', translit: 'Nafs / Rūḥ', root: 'ن ف س', freq: '295×', de: 'Seele, Selbst, Lebensgeist', en: 'Soul, self, spirit', ku: 'نەفس و گیان و ڕۆحی مرۆڤ', exAr: 'وَنَفْسٍ وَمَا سَوَّاهَا ۞ فَأَلْهَمَهَا فُجُورَهَا وَتَقْوَاهَا', surah: 91, ayah: 7 }
];
