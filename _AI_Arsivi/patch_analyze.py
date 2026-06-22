import re

file_path = r'D:\GitHub\kurtulus_tek\v8_core.js'
with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

new_analyze = """P719.analyze=function(){
  const db=loadDB();
  _sc=scoreAll(db.e,mx());

  if (window.HavuzMotoru && typeof window.HavuzMotoru.puanlari_hesapla === 'function') {
      const maxN = mx();
      const draws = db.e.map(x => x.nums);
      const joks = db.e.map(x => x.joker);
      const pMap = window.HavuzMotoru.puanlari_hesapla(draws, maxN, joks);
      const ms = loadMS();
      for (let i = 1; i <= maxN; i++) {
          if (_sc[i]) {
              _sc[i].score = pMap[i] || 0;
              let man = ms[String(i)] !== undefined ? parseFloat(ms[String(i)]) : null;
              _sc[i].final = man !== null ? man : (pMap[i] || 0);
              _sc[i].hm_details = pMap.__details[i];
          }
      }
      let allFinals = Object.values(_sc).filter(x => x.n).map(x => x.final).sort((a,b) => b - a);
      if (allFinals.length >= 60) {
          _sc._aq = {
              aq1: allFinals[21] || 0,
              aq2: allFinals[44] || 0,
              aq3: allFinals[65] || 0
          };
      }
  }

  P719.renderGroups();
};"""

text = re.sub(
    r'P719\.analyze=function\(\)\{\s*const db=loadDB\(\);\s*_sc=scoreAll\(db\.e,mx\(\)\);\s*P719\.renderGroups\(\);\s*\};',
    new_analyze,
    text
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(text)

print("v8_core.js P719.analyze patched!")
