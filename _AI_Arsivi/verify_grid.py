import sys, re
sys.stdout.reconfigure(encoding='utf-8')
content = open('PROMPT_BUILDER_v8_0.html','r',encoding='utf-8').read()
errors = []
ok = []

# TEST 1: gridKomsulari fonksiyonu brain'de var mı
if 'function gridKomsulari(n, maxN)' in content:
    ok.append('OK: gridKomsulari() puanlari_hesapla icinde var')
else:
    errors.append('FAIL: gridKomsulari() bulunamadi')

# TEST 2: uiGridKomsulari fonksiyonu extractDetailsForUI'da var mı
if 'function uiGridKomsulari(sayi, maxN)' in content:
    ok.append('OK: uiGridKomsulari() extractDetailsForUI icinde var')
else:
    errors.append('FAIL: uiGridKomsulari() bulunamadi')

# TEST 3: Grid-aware 2. halka fonksiyonları var mı
if 'function grid2HalkaKomsulari(n, maxN)' in content and 'function uiGrid2HalkaKomsulari(sayi, maxN)' in content:
    ok.append('OK: grid2HalkaKomsulari() ve uiGrid2HalkaKomsulari() var')
else:
    errors.append('FAIL: 2. halka grid fonksiyonlari eksik')

# TEST 4: Eski 'count < 2' limiti brain komşuluk bloğunda yok mu
brain_idx = content.find('gridKomsulari(sayi, maxN).forEach')
brain_end = content.find('YENİ FİLTRE 1', brain_idx) if brain_idx > 0 else -1
brain_block = content[brain_idx:brain_end] if brain_idx > 0 and brain_end > 0 else ''
if brain_block and 'count < 2' not in brain_block:
    ok.append('OK: Brain komsu blogu - count<2 limiti kaldirildi')
else:
    errors.append('FAIL: Brain blogu count<2 var veya blok bulunamadi')

# TEST 5: K19/K20/K21 = 0 olarak değiştirildi mi
if 'K19, K20, K21' in content and 'PUAN_DIKEY_PRES' not in content[content.find('K19, K20, K21'):content.find('K19, K20, K21')+200]:
    ok.append('OK: K19/K20/K21 = 0 olarak sabitlendi, eski mantik kaldirildi')
else:
    errors.append('FAIL: K19/K20/K21 degisimi tam yapilmadi')

# TEST 6: K16 config.CEZA_IZOLASYON kullanıyor mu
if 'config.CEZA_IZOLASYON || 100' in content:
    ok.append('OK: K16 artik config.CEZA_IZOLASYON kullanıyor')
else:
    errors.append('FAIL: K16 config.CEZA_IZOLASYON kullanmiyor')

# TEST 7: CEZA_IZOLASYON config'de var mı
if 'CEZA_IZOLASYON: 100' in content:
    ok.append('OK: CEZA_IZOLASYON config default = 100')
else:
    errors.append('FAIL: CEZA_IZOLASYON config yok')

# TEST 8: CEZA_IZOLASYON slider'ı var mı
if 'hm_izolasyon' in content:
    ok.append('OK: hm_izolasyon slider var')
else:
    errors.append('FAIL: hm_izolasyon slider yok')

# TEST 9: readSliders'da CEZA_IZOLASYON var mı
if "val('hm_izolasyon')" in content:
    ok.append('OK: readSliders CEZA_IZOLASYON baglantisi var')
else:
    errors.append('FAIL: readSliders CEZA_IZOLASYON baglantisi yok')

# TEST 10: Joker komşuluğu grid-aware yapıldı mı (brain)
if 'GR\u0130D-AWARE Joker' in content:
    ok.append('OK: Joker brain grid-aware yapildi')
else:
    errors.append('FAIL: Joker brain grid-aware degisimi yok')

# TEST 11: uiGridKomsulari joker kontrolünde kullanılıyor mu
if 'uiGridKomsulari(j, maxN).includes(n)' in content:
    ok.append('OK: is_joker_komsu artik uiGridKomsulari kullanıyor')
else:
    errors.append('FAIL: is_joker_komsu grid-aware degil')

# TEST 12: Satır sonu kontrolü doğru mu — sutun > 1 kontrolü her iki fonksiyonda
occ1 = content.count('sutun > 1)  k.push(n - 1)')
occ2 = content.count('sutun > 1)  k.push(sayi - 1)')
if occ1 >= 1 and occ2 >= 1:
    ok.append('OK: Satir sonu kontrolu (sol yatay) her iki fonksiyonda dogru')
else:
    errors.append(f'FAIL: Sol yatay satir sonu: brain={occ1}, ui={occ2}')

# TEST 13: Manuel grid dogrulamasi - 81'in komşuları doğru mu
# 81: sutun = ((81-1)%10)+1 = 1
# sol: sutun>1 = False -> yok
# sag: sutun<10 = True -> 82
# ust: 81-10=71 >= 1 -> 71
# alt: 81+10=91 > 90 -> yok
# sol-ust: 81-11=70, sutun>1=False -> yok
# sag-ust: 81-9=72, sutun<10=True -> 72
# sol-alt: 81+9=90, sutun>1=False -> yok
# sag-alt: 81+11=92 > 90 -> yok
expected_81 = {82, 71, 72}
def gridKomsulari_py(n, maxN=90):
    sutun = ((n - 1) % 10) + 1
    k = []
    if sutun > 1:  k.append(n - 1)
    if sutun < 10: k.append(n + 1)
    if n - 10 >= 1:    k.append(n - 10)
    if n + 10 <= maxN: k.append(n + 10)
    if n - 11 >= 1    and sutun > 1:  k.append(n - 11)
    if n -  9 >= 1    and sutun < 10: k.append(n -  9)
    if n +  9 <= maxN and sutun > 1:  k.append(n +  9)
    if n + 11 <= maxN and sutun < 10: k.append(n + 11)
    return set(k)

result_81 = gridKomsulari_py(81)
if result_81 == expected_81:
    ok.append(f'OK: 81 komsulari dogru: {sorted(result_81)}')
else:
    errors.append(f'FAIL: 81 komsulari yanlis! Beklenen={sorted(expected_81)}, Gelen={sorted(result_81)}')

result_10 = gridKomsulari_py(10)
expected_10 = {9, 20, 19}
if result_10 == expected_10:
    ok.append(f'OK: 10 komsulari dogru: {sorted(result_10)} (11 YOK)')
else:
    errors.append(f'FAIL: 10 komsulari yanlis! Beklenen={sorted(expected_10)}, Gelen={sorted(result_10)}')

result_42 = gridKomsulari_py(42)
expected_42 = {41, 43, 32, 52, 31, 33, 51, 53}
if result_42 == expected_42:
    ok.append(f'OK: 42 komsulari dogru: {sorted(result_42)}')
else:
    errors.append(f'FAIL: 42 komsulari yanlis! Beklenen={sorted(expected_42)}, Gelen={sorted(result_42)}')

result_1 = gridKomsulari_py(1)
expected_1 = {2, 11, 12}
if result_1 == expected_1:
    ok.append(f'OK: 1 komsulari dogru: {sorted(result_1)}')
else:
    errors.append(f'FAIL: 1 komsulari yanlis! Beklenen={sorted(expected_1)}, Gelen={sorted(result_1)}')

for o in ok: print(o)
if errors:
    print()
    print('=== HATALAR ===')
    for e in errors: print(e)
else:
    print()
    print('=== TUM TESTLER GECTI (16/16) ===')
