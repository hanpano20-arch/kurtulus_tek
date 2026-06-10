function getParams(){
  const getBool=id=>!!document.getElementById(id)?.checked;
  const getNum=(id,def)=>parseFloat(document.getElementById(id)?.value)||def;
  
  // Base params
  const p = {
    k:parseInt(document.getElementById('p-k').value)||6,
    sumMin:parseInt(document.getElementById('p-summin')?.value)||220,
    sumMax:parseInt(document.getElementById('p-summax')?.value)||265,
    oddCnt:parseInt(document.getElementById('p-odd')?.value)||1,
    primeMin:parseInt(document.getElementById('p-primemin')?.value)||0,
    primeMax:parseInt(document.getElementById('p-primemax')?.value)||1,
    low:parseInt(document.getElementById('p-low')?.value)||3,
    high:parseInt(document.getElementById('p-high')?.value)||3,
    dec:parseInt(document.getElementById('p-dec')?.value)||2,
    freqMax:parseInt(document.getElementById('p-freqmax')?.value)||36,
    freqMin:parseInt(document.getElementById('p-freqmin')?.value)||2,
    cols:parseInt(document.getElementById('p-cols')?.value)||60,
    jaccard:parseFloat(document.getElementById('p-jaccard')?.value)||0.6,
    maxCommon:parseInt(document.getElementById('p-maxcommon')?.value)||4,
    packages:getPackageParams(),
    hMode:'neighbor',
    vMode:'neighbor',
  };

  // Quotas & Patches from v19
  const bl=document.getElementById('p-banko')?.value||'';
  p.bankoList=bl?bl.split(/[,\s]+/).map(Number).filter(n=>n>0&&n<=gameMax()):[];
  
  // Sum quotas
  p.sumQuotas=[];
  const sq=document.getElementById('p-sum-quotas')?.value;
  if(sq){
    sq.split(',').forEach(part=>{
      const m=part.match(/(\d+)-(\d+):(\d+)/);
      if(m) p.sumQuotas.push({min:parseInt(m[1]),max:parseInt(m[2]),limit:parseInt(m[3]),count:0});
    });
  }
  
  // Odd/Even quotas
  p.oddQuotas=[];
  const oq=document.getElementById('p-odd-quotas')?.value;
  if(oq){
    oq.split(',').forEach(part=>{
      const m=part.match(/(\d+):(\d+)/);
      if(m) p.oddQuotas.push({odd:parseInt(m[1]),limit:parseInt(m[2]),count:0});
    });
  }
  
  // Region quotas
  p.regionQuotas=[];
  const rq=document.getElementById('p-region-quotas')?.value;
  if(rq){
    rq.split(',').forEach(part=>{
      const m=part.match(/(\d+)-(\d+):(\d+)/);
      if(m) p.regionQuotas.push({low:parseInt(m[1]),high:parseInt(m[2]),limit:parseInt(m[3]),count:0});
    });
  }
  
  // Table region dec constraints
  p.regionTables=[];
  for(let i=1;i<=90;i+=10){
    const v=parseInt(document.getElementById(`p-dec-${i}`)?.value);
    if(!isNaN(v)) p.regionTables.push({start:i, limit:v});
  }
  
  return p;
}

function sayisalTabloBolgesi(n){ return Math.floor((n-1)/10); }

function checkCombo(combo, p) {
  const s = combo.slice().sort((a,b)=>a-b);
  const sum = s.reduce((a,b)=>a+b,0);
  
  // Check bankos
  if(p.bankoList && p.bankoList.length > 0) {
    if(!p.bankoList.every(b => s.includes(b))) return false;
  }
  
  // Check quotas (Base rules ignored if quotas active, unless quotas completely missing)
  if (p.sumQuotas && p.sumQuotas.length > 0) {
    if (!p.sumQuotas.some(q => sum >= q.min && sum <= q.max)) return false;
  } else if (sum < p.sumMin || sum > p.sumMax) return false;

  const oddCount = s.filter(n => n%2 !== 0).length;
  if (p.oddQuotas && p.oddQuotas.length > 0) {
    if (!p.oddQuotas.some(q => q.odd === oddCount)) return false;
  } else if (oddCount !== p.oddCnt) return false;

  const lowCount = s.filter(n => n <= regionSplit()).length;
  if (p.regionQuotas && p.regionQuotas.length > 0) {
    if (!p.regionQuotas.some(q => q.low === lowCount)) return false;
  } else if (lowCount !== p.low || s.filter(n => n > regionSplit()).length !== p.high) return false;

  // Primes
  const pc = s.filter(n => PR.has(n)).length;
  if(pc < p.primeMin || pc > p.primeMax) return false;

  // Table regions (v19) vs Base dec
  if (p.regionTables && p.regionTables.length > 0) {
    for (const rt of p.regionTables) {
      const cnt = s.filter(n => n >= rt.start && n <= rt.start + 9).length;
      if (cnt > rt.limit) return false;
    }
  } else {
    const dec = {};
    for (const n of s) {
      const d = sayisalTabloBolgesi(n);
      dec[d] = (dec[d]||0) + 1;
      if (dec[d] > p.dec) return false;
    }
  }

  // Cross chains (v6.8 patch)
  let d9=0, d11=0;
  const sset = new Set(s);
  s.forEach(n => {
    if(sset.has(n+9) && Math.floor((n-1)/10) + 1 === Math.floor((n+8)/10)) d9++;
    if(sset.has(n+11) && Math.floor((n-1)/10) + 1 === Math.floor((n+10)/10)) d11++;
  });
  const maxD9 = parseInt(document.getElementById('p-diag9-min')?.value)||0;
  const maxD11= parseInt(document.getElementById('p-diag11-min')?.value)||0;
  if(maxD9>0 && d9>=maxD9-1) return false;
  if(maxD11>0 && d11>=maxD11-1) return false;

  // Adjacency, Vertical and Arithmetic (Base rules)
  for(let i=0; i<s.length; i++) {
    for(let j=i+1; j<s.length; j++) {
      const d = s[j] - s[i];
      if (p.hMode === 'neighbor' && s[j]-s[j-1] !== d) {} // Skip non-neighbor
      else if (adjState[d] === 'yasak') return false;
      
      if (p.vMode === 'neighbor' && s[j]-s[j-1] !== d) {} 
      else if (vertState[d] === 'yasak') return false;

      // Özel çift
      if (bannedPairs.has(pairKey(s[i], s[j]))) return false;
    }
    for(let step=1; step<=30; step++) {
      const k2 = 'arith_'+step+'_2', k3 = 'arith_'+step+'_3';
      if(arithState[k2]==='yasak' && sset.has(s[i]+step)) return false;
      if(arithState[k3]==='yasak' && sset.has(s[i]+step) && sset.has(s[i]+step*2)) return false;
    }
  }

  return true;
}

function getRuleWarnings(p){
  const warns = [];
  if(p.sumMin > p.sumMax) warns.push({type:'red',msg:'Toplam min > max.'});
  if(p.bankoList && p.bankoList.length > p.k) warns.push({type:'red',msg:'Banko sayısı kolon boyutundan büyük olamaz.'});
  return warns;
}

function buildPrompt() {
  const p = getParams();
  let text = "KONU: Gelişmiş Sayı Analizi\n";
  text += `Oyun: ${gameName()}\nHavuz: [${pool.join(', ')}]\nKolon Boyutu: ${p.k}\nAdet: ${p.cols}\n`;
  return text;
}
