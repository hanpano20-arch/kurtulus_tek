import re

with open('d:/GitHub/kurtulus_tek/PROMPT_BUILDER_v8_0.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Update outlierScore to be adaptive
new_outlier = """function outlierScore(combo, p, o) {
  const s = combo.slice().sort((a,b)=>a-b);
  const reasons = [];
  let score = 0;
  const sum = s.reduce((a,b)=>a+b,0);
  
  // Center is dynamic based on user params
  if(o.centerActive && p.sumMax > p.sumMin) {
    const center = (p.sumMin + p.sumMax) / 2;
    const half = (p.sumMax - p.sumMin) / 2;
    const dist = Math.abs(sum - center) / Math.max(1, half);
    if(dist >= 0.90){ score += 20; reasons.push('toplam sınırına çok yakın'); }
    else if(dist >= 0.75){ score += 12; reasons.push('toplam merkeze uzak'); }
    else if(dist >= 0.60){ score += 6; reasons.push('toplam hafif uçta'); }
  }
  
  if(o.unitActive){
    const units={};
    s.forEach(n=>{const u=n%10;units[u]=(units[u]||0)+1;});
    const maxUnit=Math.max(...Object.values(units));
    if(maxUnit>o.unitMax){score+=(maxUnit-o.unitMax)*12;reasons.push('aynı birler basamağı fazla');}
  }
  
  const gaps=[];
  for(let i=1;i<s.length;i++) gaps.push(s[i]-s[i-1]);
  
  if(o.gapActive){
    const largeCount=gaps.filter(g=>g>=o.largeGap).length;
    const closeAllowed=gaps.filter(g=>g===4||g===5).length;
    
    // ADAPTIVE SPAN CHECK based on pool size
    const span = s[s.length-1]-s[0];
    const maxPool = gameMax(); // dynamic! 90 or 60
    const minSpanLimit = maxPool * 0.27; // 25 for 90, 16.2 for 60
    const maxSpanLimit = maxPool * 0.86; // 78 for 90, 51.6 for 60
    
    if(largeCount>o.maxLarge){score+=(largeCount-o.maxLarge)*10;reasons.push('büyük sıçrama fazla');}
    if(closeAllowed>2){score+=(closeAllowed-2)*6;reasons.push('4/5 yakın fark tekrarı fazla');}
    if(span < minSpanLimit){score+=10;reasons.push('kolon çok sıkışık');}
    if(span > maxSpanLimit){score+=8;reasons.push('kolon çok dağınık');}
  }
  
  if(o.mechActive){
    const diffCount={};
    for(let i=0;i<s.length;i++){
      for(let j=i+1;j<s.length;j++){
        const d=s[j]-s[i];
        diffCount[d]=(diffCount[d]||0)+1;
      }
    }
    const vals=Object.values(diffCount);
    const maxRepeat=vals.length?Math.max(...vals):0;
    if(maxRepeat>o.repeatMax){score+=(maxRepeat-o.repeatMax)*10;reasons.push('aynı fark tekrarı fazla');}
    
    // triples
    let triples=0;
    for(let i=0;i<s.length-2;i++){
      for(let step=1;step<=30;step++){
        if(s.includes(s[i]+step) && s.includes(s[i]+step*2)) triples++;
      }
    }
    if(triples>0){score+=Math.min(24,triples*8);reasons.push('aritmetik üçlü içeriyor');}
    
    const verticalPairs=Object.entries(diffCount).filter(([d,c])=>Number(d)%10===0 && Number(d)>0).reduce((a,[,c])=>a+c,0);
    if(verticalPairs>2){score+=(verticalPairs-2)*6;reasons.push('dikey ilişki yoğun');}
  }
  
  score=Math.min(100,Math.round(score));
  return {score,reasons:[...new Set(reasons)]};
}"""

# Replace old outlierScore (we need a good regex that captures the whole body)
# In v8_0.html it might be inside the file
# We will use replace by finding the start and ending brace.
def replace_function(text, fn_name, new_fn):
    matches = list(re.finditer(r'function\s+' + fn_name + r'\s*\([^)]*\)\s*\{', text))
    if not matches: return text
    m = matches[-1]
    start = m.start()
    brace_start = text.find('{', start)
    stack = 0
    in_string = False
    str_char = ''
    end = -1
    for i in range(brace_start, len(text)):
        char = text[i]
        if not in_string:
            if char in "\"'`":
                in_string = True
                str_char = char
            elif char == '{': stack += 1
            elif char == '}':
                stack -= 1
                if stack == 0:
                    end = i + 1
                    break
        else:
            if char == '\\': continue
            if char == str_char:
                prev_slash = 0
                j = i-1
                while text[j] == '\\':
                    prev_slash+=1; j-=1
                if prev_slash%2==0: in_string=False
    if end != -1:
        return text[:start] + new_fn + text[end:]
    return text

html = replace_function(html, 'outlierScore', new_outlier)

with open('d:/GitHub/kurtulus_tek/PROMPT_BUILDER_v8_0.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('Updated outlierScore!')
