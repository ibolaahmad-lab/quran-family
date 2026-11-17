import json
import urllib.request

url = "https://api.alquran.cloud/v1/surah"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read().decode('utf-8'))['data']

kurdish_names = {
    1: "فاتیحە", 2: "بەقەرە", 3: "ئالی عیمران", 4: "نیساء", 5: "مائیدە",
    6: "ئەنعام", 7: "ئەعراف", 8: "ئەنفال", 9: "تەوبە", 10: "یوونوس",
    11: "هوود", 12: "یووسوف", 13: "ڕەعد", 14: "ئیبراهیم", 15: "حیجر",
    16: "نەحل", 17: "ئیسراء", 18: "کەهف", 19: "مەریەم", 20: "تاها",
    21: "ئەنبیاء", 22: "حەج", 23: "موئمینون", 24: "نوور", 25: "فورقان",
    26: "شوعەراء", 27: "نەمل", 28: "قەسەس", 29: "عەنکەبووت", 30: "ڕووم",
    31: "لوقمان", 32: "سەجدە", 33: "ئەحزاب", 34: "سەبەء", 35: "فاتیڕ",
    36: "یاسین", 37: "ساففات", 38: "ساد", 39: "زومەر", 40: "غافیر",
    41: "فوسسیلەت", 42: "شوورا", 43: "زوخروف", 44: "دوخان", 45: "جاسیە",
    46: "ئەحقاف", 47: "محەممەد", 48: "فەتح", 49: "حوجورات", 50: "قاف",
    51: "زاریات", 52: "توور", 53: "نەجم", 54: "قەمەر", 55: "ڕەحمان",
    56: "واقیعه", 57: "حەدید", 58: "موجادەلە", 59: "حەشر", 60: "مومتەحینە",
    61: "سەفف", 62: "جوموعە", 63: "مونافیقوون", 64: "تەغابون", 65: "تەڵاق",
    66: "تەحریم", 67: "مولک", 68: "قەڵەم", 69: "حاققە", 70: "مەعاریج",
    71: "نووح", 72: "جن", 73: "موززەممیل", 74: "موددەسسیر", 75: "قیامەت",
    76: "ئینسان", 77: "مورسەلات", 78: "نەبەء", 79: "نازیعات", 80: "عەبەسە",
    81: "تەکویر", 82: "ئینفیتار", 83: "موتەففیفین", 84: "ئینشیقاق", 85: "بورووج",
    86: "تاریق", 87: "ئەعلا", 88: "غاشیە", 89: "فەجر", 90: "بەلەد",
    91: "شەمس", 92: "لەیل", 93: "زوحا", 94: "شەرح", 95: "تین",
    96: "عەلەق", 97: "قەدر", 98: "بەیینە", 99: "زەلزەلە", 100: "عادیات",
    101: "قاریعە", 102: "تەکاسوور", 103: "عەسر", 104: "هومەزە", 105: "فیل",
    106: "قورەیش", 107: "ماعوون", 108: "کەوسەر", 109: "کافیروون", 110: "نەسر",
    111: "مەسەد", 112: "ئیخلاس", 113: "فەلەق", 114: "ناس"
}

german_meanings = {
    1: "Die Eröffnende", 2: "Die Kuh", 3: "Das Haus Imran", 4: "Die Frauen", 5: "Der Tisch",
    6: "Das Vieh", 7: "Die Höhen", 8: "Die Beute", 9: "Die Reue", 10: "Jonas",
    11: "Hud", 12: "Josef", 13: "Der Donner", 14: "Abraham", 15: "Das Felsenland",
    16: "Die Bienen", 17: "Die Nachtreise", 18: "Die Höhle", 19: "Maria", 20: "Ta-Ha",
    21: "Die Propheten", 22: "Die Pilgerfahrt", 23: "Die Gläubigen", 24: "Das Licht", 25: "Die Unterscheidung",
    26: "Die Dichter", 27: "Die Ameisen", 28: "Die Erzählung", 29: "Die Spinne", 30: "Die Römer",
    31: "Luqman", 32: "Die Niederwerfung", 33: "Die Verbündeten", 34: "Saba", 35: "Der Schöpfer",
    36: "Ya-Sin (Das Herz)", 37: "Die sich Reihenden", 38: "Sad", 39: "Die Scharen", 40: "Der Vergebende",
    41: "Ausführlich dargelegt", 42: "Die Beratung", 43: "Prunk", 44: "Der Rauch", 45: "Die Kniende",
    46: "Die Dünen", 47: "Muhammad", 48: "Der Sieg", 49: "Die Gemächer", 50: "Qaf",
    51: "Die Aufwirbelnden", 52: "Der Berg", 53: "Der Stern", 54: "Der Mond", 55: "Der Allerbarmer",
    56: "Das Ereignis", 57: "Das Eisen", 58: "Der Streit", 59: "Die Versammlung", 60: "Die Geprüfte",
    61: "Die Reihe", 62: "Der Freitag", 63: "Die Heuchler", 64: "Die gegenseitige Täuschung", 65: "Die Scheidung",
    66: "Das Verbot", 67: "Die Herrschaft", 68: "Das Schreibrohr", 69: "Die unausweichliche Wahrheit", 70: "Die Stufen des Aufstiegs",
    71: "Noah", 72: "Die Dschinn", 73: "Der Eingehüllte", 74: "Der Bedeckte", 75: "Die Auferstehung",
    76: "Der Mensch", 77: "Die Entsandten", 78: "Die Ankündigung", 79: "Die Entreißenden", 80: "Er runzelte die Stirn",
    81: "Das Eindrehen", 82: "Das Zerbrechen", 83: "Die das Maß Verkürzenden", 84: "Das Spalten", 85: "Die Türme",
    86: "Der Morgenstern", 87: "Der Höchste", 88: "Die Übergreifende", 89: "Die Morgendämmerung", 90: "Die Stadt",
    91: "Die Sonne", 92: "Die Nacht", 93: "Die Morgenhelle", 94: "Das Weiten der Brust", 95: "Die Feige",
    96: "Der Blutklumpen", 97: "Die Bestimmung", 98: "Der klare Beweis", 99: "Das Beben", 100: "Die Rennenden",
    101: "Das Verhängnis", 102: "Das Wetteifern", 103: "Die Zeit", 104: "Der Verleumder", 105: "Der Elefant",
    106: "Die Quraisch", 107: "Die Hilfeleistung", 108: "Die Fülle (Kauthar)", 109: "Die Ungläubigen", 110: "Die Hilfe",
    111: "Die Palmfasern", 112: "Die reine Aufrichtigkeit", 113: "Das Frühlicht", 114: "Die Menschen"
}

surahs_full = []
for s in data:
    sid = s['number']
    surahs_full.append({
        'id': sid,
        'name': s['englishName'],
        'arabic': s['name'].replace('سُورَةُ ', ''),
        'kurdish': kurdish_names.get(sid, s['englishName']),
        'germanMeaning': german_meanings.get(sid, s['englishNameTranslation']),
        'versesCount': s['numberOfAyahs'],
        'revelation': 'Mekkanisch' if s['revelationType'] == 'Meccan' else 'Medinensisch',
        'revelationKu': 'مەککی' if s['revelationType'] == 'Meccan' else 'مەدەنی'
    })

with open('C:/Users/Ibo/.gemini/antigravity/scratch/QuranHifzMaster/surahs_data.js', 'w', encoding='utf-8') as f:
    f.write('const ALL_SURAHS = ' + json.dumps(surahs_full, ensure_ascii=False, indent=2) + ';\n')

print(f"Generated surahs_data.js with {len(surahs_full)} Surahs!")
