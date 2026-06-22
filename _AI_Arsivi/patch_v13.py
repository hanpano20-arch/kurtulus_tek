import sys

file_path = 'PROMPT_BUILDER_v8_0.html'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update rules array
    target_rules = """          { id: 'k13', name: 'K13-Çifte Tek.', desc: 'Üst üste 2 kez çıkan sayılara verilen çifte tekrar cezası.' },
          { id: 'k14', name: 'K14-Doygunluk', desc: 'Aşırı doygunluğa (tükenmişliğe) ulaşan sayılara verilen ceza.' }
        ];"""
    
    replacement_rules = """          { id: 'k13', name: 'K13-Çifte Tek.', desc: 'Üst üste 2 kez çıkan sayılara verilen çifte tekrar cezası.' },
          { id: 'k14', name: 'K14-Doygunluk', desc: 'Aşırı doygunluğa (tükenmişliğe) ulaşan sayılara verilen ceza.' },
          { id: 'k15', name: 'K15-TamIsınma', desc: 'Joker ve komşu birleşimine verilen kinetik ısınma bonusu.' },
          { id: 'k16', name: 'K16-İzolasyon', desc: '1. derece komşusu olmayan sahte sıcaklara verilen ölüm cezası.' },
          { id: 'k17', name: 'K17-ÇaprazKur', desc: '19 haftadır çıkmayan çapraz komşulara verilen patlama bonusu.' },
          { id: 'k18', name: 'K18-Din.Seri', desc: 'Son çekilişte çıkan tekrar adaylarının seri kapasitesine göre aldığı puan.' }
        ];"""

    if target_rules in content:
        content = content.replace(target_rules, replacement_rules)
        print("Patched rules array")
    else:
        print("FAILED to patch rules array")

    # 2. Update renderRows
    target_tds = """            res += '<td class="' + (details.k12 < 0 ? 'penalty' : '') + '">' + details.k12 + '</td>';
            res += '<td class="' + (details.k13 < 0 ? 'penalty' : '') + '">' + details.k13 + '</td>';
            res += '<td class="' + (details.k14 < 0 ? 'penalty' : '') + '">' + details.k14 + details.doygunlukLabel + '</td>';
            res += '<td><input type="number" class="dst-manual-input" ' +"""

    replacement_tds = """            res += '<td class="' + (details.k12 < 0 ? 'penalty' : '') + '">' + details.k12 + '</td>';
            res += '<td class="' + (details.k13 < 0 ? 'penalty' : '') + '">' + details.k13 + '</td>';
            res += '<td class="' + (details.k14 < 0 ? 'penalty' : '') + '">' + details.k14 + details.doygunlukLabel + '</td>';
            res += '<td class="' + (details.k15 < 0 ? 'penalty' : 'bonus') + '">' + details.k15 + '</td>';
            res += '<td class="' + (details.k16 < 0 ? 'penalty' : '') + '">' + details.k16 + '</td>';
            res += '<td class="' + (details.k17 < 0 ? 'penalty' : 'bonus') + '">' + details.k17 + '</td>';
            res += '<td class="' + (details.k18 < 0 ? 'penalty' : 'bonus') + '">' + details.k18 + '</td>';
            res += '<td><input type="number" class="dst-manual-input" ' +"""

    if target_tds in content:
        content = content.replace(target_tds, replacement_tds)
        print("Patched renderRows")
    else:
        # Try a slightly different target if doygunlukLabel line is different
        target_tds_2 = """            res += '<td class="' + (details.k12 < 0 ? 'penalty' : '') + '">' + details.k12 + '</td>';
            res += '<td class="' + (details.k13 < 0 ? 'penalty' : '') + '">' + details.k13 + '</td>';
            res += '<td class="' + (details.k14 < 0 ? 'penalty' : '') + '">' + details.k14 + '</td>';
            res += '<td><input type="number" class="dst-manual-input" ' +"""
        
        replacement_tds_2 = """            res += '<td class="' + (details.k12 < 0 ? 'penalty' : '') + '">' + details.k12 + '</td>';
            res += '<td class="' + (details.k13 < 0 ? 'penalty' : '') + '">' + details.k13 + '</td>';
            res += '<td class="' + (details.k14 < 0 ? 'penalty' : '') + '">' + details.k14 + '</td>';
            res += '<td class="' + (details.k15 < 0 ? 'penalty' : 'bonus') + '">' + details.k15 + '</td>';
            res += '<td class="' + (details.k16 < 0 ? 'penalty' : '') + '">' + details.k16 + '</td>';
            res += '<td class="' + (details.k17 < 0 ? 'penalty' : 'bonus') + '">' + details.k17 + '</td>';
            res += '<td class="' + (details.k18 < 0 ? 'penalty' : 'bonus') + '">' + details.k18 + '</td>';
            res += '<td><input type="number" class="dst-manual-input" ' +"""

        if target_tds_2 in content:
            content = content.replace(target_tds_2, replacement_tds_2)
            print("Patched renderRows (Fallback)")
        else:
            print("FAILED to patch renderRows")

    # 3. Update extractDetailsForUI logic and return
    target_logic = """        return {
          historical,
          recent,
          k1,
          k2,
          k3,
          k4,
          k5,
          k6,
          k7,
          k8,
          k9,
          k10,
          k11,
          k12,
          k13,
          k14,
          doygunlukLabel
        };"""

    replacement_logic = """        let is_in_last_10 = f10 > 0 || (joks && joks.slice(0, 10).includes(n));
        let is_komsu_1 = (typeof komsuSayaci_1 !== 'undefined' ? (komsuSayaci_1[n] || 0) : 0) > 0;
        let is_joker_komsu = (typeof jokerKomsuSayaci !== 'undefined' ? (jokerKomsuSayaci[n] || 0) : 0) > 0;
        let k15 = 0;
        if (is_in_last_10 && (is_komsu_1 || is_joker_komsu)) {
            k15 = 150;
        }

        let k16 = 0;
        let temp_is_in_last = (df.length > 0 && df[0] && Array.isArray(df[0]) && df[0].includes(n));
        if (!is_komsu_1 && !temp_is_in_last) {
            k16 = -250;
        }

        let k17 = 0;
        if (is_komsu_1 && kuraklik_haftasi >= 15) {
            k17 = 120;
        }

        let k18 = 0;
        if (temp_is_in_last) {
            let max_streak = 0;
            let current_streak = 0;
            for (let c = df.length - 1; c >= 0; c--) {
                if (df[c] && Array.isArray(df[c]) && df[c].includes(n)) {
                    current_streak++;
                    if (current_streak > max_streak) max_streak = current_streak;
                } else {
                    current_streak = 0;
                }
            }
            if (max_streak >= 3) {
                k18 = 150;
            } else if (max_streak <= 2) {
                k18 = -100;
            }
        }

        return {
          historical,
          recent,
          k1,
          k2,
          k3,
          k4,
          k5,
          k6,
          k7,
          k8,
          k9,
          k10,
          k11,
          k12,
          k13,
          k14,
          k15,
          k16,
          k17,
          k18,
          doygunlukLabel
        };"""

    if target_logic in content:
        content = content.replace(target_logic, replacement_logic)
        print("Patched extractDetailsForUI return object")
    else:
        print("FAILED to patch extractDetailsForUI return object")

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

except Exception as e:
    print("Error:", e)
