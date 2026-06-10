

const PR=new Set([2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97]);
let pool=[];
const bannedPairs=new Set(); // "a,b" formatında (a<b)
let currentPairFilter='all';
let pairSearchVal='';
let lastAnalysisData=null;

const adjDiffs=[1,2,3,4,5,6,7,8,9];
const vertDiffs=[10,20,30,40,50,60,70,80]; // 6/60 modunda +10..+50 aktif gösterilir
const adjState={1:'yasak',2:'yasak',3:'yasak',4:'serbest',5:'serbest',6:'serbest',7:'serbest',8:'serbest',9:'serbest'};
const vertState={10:'serbest',20:'serbest',30:'serbest',40:'yasak',50:'yasak',60:'yasak',70:'yasak',80:'yasak'};
const arithState={};
const arithTouched=new Set(); // kullanıcı bilinçli dokunduysa çakışma kontrolünde dikkate alınır

function gameMax(){ return parseInt(document.getElementById('p-game')?.value)||90; }
function gameName(){ return '6/'+gameMax(); }
function regionSplit(){ return gameMax()/2; }
function lowRegionLabel(){ return '1–'+regionSplit(); }
function highRegionLabel(){ return (regionSplit()+1)+'–'+gameMax(); }
function tableRegionLabels(){
  const max=gameMax(), arr=[];
  for(let a=1;a<=max;a+=10){ arr.push(a+'–'+Math.min(a+9,max)); }
  return arr;
}
function activeVertDiffs(){
  const max=gameMax();
  return vertDiffs.filter(d=>d<max);
}
function updateGameLabels(){
  const max=gameMax();
  const gl=document.getElementById('game-lbl'); if(gl) gl.textContent='6/'+max+' · sayı aralığı 1–'+max;
  const sLow=document.getElementById('s-low'); if(sLow && sLow.nextElementSibling) sLow.nextElementSibling.textContent=lowRegionLabel();
  const sHigh=document.getElementById('s-high'); if(sHigh && sHigh.nextElementSibling) sHigh.nextElementSibling.textContent=highRegionLabel();
  const legend=document.querySelector('.legend');
  if(legend){
    const spans=legend.querySelectorAll(':scope > span');
    if(spans[3]) spans[3].lastChild.textContent=lowRegionLabel();
    if(spans[4]) spans[4].lastChild.textContent=highRegionLabel();
  }
}
function setGameType(value){
  updateGameLabels();
  buildToggleRows(activeVertDiffs(),vertState,'vert-rules');
  parsePool();
  updateQuotaStatus();
  // v7.15: oyun modu değişince çekiliş haritasını sıfırla
  try{
    // v74 haritası
    if(typeof renderDrawMap==='function') renderDrawMap();
    // v75 analiz alanını temizle
    const area=document.getElementById('v75-draw-analysis');
    if(area) area.value='';
    const box=document.getElementById('v75-draw-suggestions');
    if(box) box.innerHTML='<div class="v75-muted">Oyun modu değişti ('+value+'). Yeniden analiz et.</div>';
    // Oyun modu toggle'ı senkronize et
    const r90=document.getElementById('v714-game-90');
    const r60=document.getElementById('v714-game-60');
    if(r90) r90.checked=(value==='90'||value===90);
    if(r60) r60.checked=(value==='60'||value===60);
    const st=document.getElementById('v714-game-status');
    if(st) st.textContent='Sayı aralığı: 1–'+value;
  }catch(e){}
}

function buildToggleRows(diffs,states,cid){
  const c=document.getElementById(cid);c.innerHTML='';
  diffs.forEach(d=>{
    const r=document.createElement('div');r.className='row';
    r.innerHTML=`<div class="row-lbl" style="font-family:var(--font-mono);font-size:13px">+${d}</div>
    <div class="pill-grp">
      <span class="pill${states[d]==='yasak'?' yasak':''}" onclick="setToggle('${cid}',${d},'yasak',this)">Yasak</span>
      <span class="pill${states[d]==='serbest'?' serbest':''}" onclick="setToggle('${cid}',${d},'serbest',this)">Serbest</span>
    </div>`;
    c.appendChild(r);
  });
}
function setToggle(cid,diff,val,el){
  const st=cid==='adj-rules'?adjState:vertState;
  st[diff]=val;
  el.parentElement.querySelectorAll('.pill').forEach(p=>p.className='pill');
  el.className='pill '+val;
}

function parsePool(){
  const raw=document.getElementById('poolInput').value;
  pool=[...new Set(raw.split(/[\s,;]+/).map(Number).filter(n=>n>0&&n<=gameMax()))].sort((a,b)=>a-b);
  document.getElementById('pool-count').textContent=pool.length+' sayı';
  // Havuz değişince geçersiz banned pairs temizle
  const toRemove=[];
  bannedPairs.forEach(p=>{
    const [a,b]=p.split(',').map(Number);
    if(!pool.includes(a)||!pool.includes(b))toRemove.push(p);
  });
  toRemove.forEach(p=>bannedPairs.delete(p));
  updateStats();renderTags();buildArithTable();renderPairGrid();updateBannedSummary(); lastAnalysisData=null; renderElimReport();
}

function updateStats(){
  const odd=pool.filter(n=>n%2!==0).length;
  const prime=pool.filter(n=>PR.has(n)).length;
  const low=pool.filter(n=>n<=regionSplit()).length;
  document.getElementById('s-total').textContent=pool.length;
  document.getElementById('s-odd').textContent=odd;
  document.getElementById('s-even').textContent=pool.length-odd;
  document.getElementById('s-prime').textContent=prime;
  document.getElementById('s-low').textContent=low;
  document.getElementById('s-high').textContent=pool.length-low;
}
function updateEven(){
  const k=parseInt(document.getElementById('p-k').value)||6;
  const o=parseInt(document.getElementById('p-odd').value)||0;
  document.getElementById('even-lbl').textContent='→ '+(k-o)+' çift';
}
function renderTags(){
  const area=document.getElementById('tagArea');area.innerHTML='';
  pool.forEach(n=>{
    const odd=n%2!==0,prime=PR.has(n),low=n<=regionSplit();
    let cls='tag';
    if(prime)cls+=' t-prime';else if(odd)cls+=' t-odd';else cls+=' t-even';
    cls+=low?' r-low':' r-high';
    const t=document.createElement('span');
    t.className=cls;t.textContent=n+(prime?' ★':'');
    t.title=(prime?'Asal · ':'')+(odd?'Tek':'Çift')+' · '+(low?lowRegionLabel():highRegionLabel());
    area.appendChild(t);
  });
}

// ─── ÇİFT GRID ───
function getAllPairs(){
  const pairs=[];
  for(let i=0;i<pool.length;i++)
    for(let j=i+1;j<pool.length;j++)
      pairs.push([pool[i],pool[j]]);
  return pairs;
}
function pairKey(a,b){return a<b?a+','+b:b+','+a;}

function setPairFilter(f,el){
  currentPairFilter=f;
  document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
  el.classList.add('active');
  renderPairGrid();
}
function filterPairs(){
  pairSearchVal=document.getElementById('pair-search').value.trim();
  renderPairGrid();
}

function renderPairGrid(){
  const grid=document.getElementById('pair-grid');
  if(pool.length<2){grid.innerHTML='<div style="font-size:12px;color:var(--color-text-secondary)">En az 2 sayı girin.</div>';return;}
  let pairs=getAllPairs();

  // Filtre
  if(currentPairFilter==='banned') pairs=pairs.filter(([a,b])=>bannedPairs.has(pairKey(a,b)));
  else if(currentPairFilter==='diff4') pairs=pairs.filter(([a,b])=>b-a<=4);
  else if(currentPairFilter==='diff10') pairs=pairs.filter(([a,b])=>[10,20,30].includes(b-a));
  else if(currentPairFilter==='same_dec') pairs=pairs.filter(([a,b])=>sayisalTabloBolgesi(a)===sayisalTabloBolgesi(b));

  // Arama
  if(pairSearchVal){
    const v=parseInt(pairSearchVal);
    if(!isNaN(v)) pairs=pairs.filter(([a,b])=>a===v||b===v);
  }

  if(!pairs.length){grid.innerHTML='<div style="font-size:12px;color:var(--color-text-secondary);padding:8px 0">Eşleşen çift yok.</div>';return;}

  grid.innerHTML=pairs.map(([a,b])=>{
    const k=pairKey(a,b);
    const banned=bannedPairs.has(k);
    const diff=b-a;
    return `<div class="pair-chip${banned?' banned':''}" onclick="togglePair('${k}')">
      <span>${a}–${b}</span>
      <span class="pair-diff">Δ${diff}</span>
    </div>`;
  }).join('');
}

function togglePair(key){
  if(bannedPairs.has(key))bannedPairs.delete(key);
  else bannedPairs.add(key);
  renderPairGrid();
  updateBannedSummary();
}

function updateBannedSummary(){
  const s=document.getElementById('banned-summary');
  if(!bannedPairs.size){s.innerHTML='<span style="color:var(--color-text-secondary)">Yasaklı çift seçilmedi.</span>';return;}
  const tags=[...bannedPairs].sort().map(k=>{
    const [a,b]=k.split(',');
    return `<span class="banned-tag">{${a},${b}}<span class="rm" onclick="removeBanned('${k}')">×</span></span>`;
  }).join('');
  s.innerHTML=`<div style="margin-bottom:4px;font-size:11px;color:var(--color-text-secondary)">${bannedPairs.size} çift yasaklandı:</div>`+tags;
}
function removeBanned(key){
  bannedPairs.delete(key);
  renderPairGrid();
  updateBannedSummary();
}

// ─── ARİTMETİK DİZİ ───
function buildArithTable(){
  const area=document.getElementById('arith-area');
  if(pool.length<2){area.innerHTML='<div style="font-size:12px;color:var(--color-text-secondary);padding:8px 0">En az 2 sayı girin.</div>';return;}
  const poolSet=new Set(pool);
  const found={};
  for(let i=0;i<pool.length;i++){
    for(let j=i+1;j<pool.length;j++){
      const step=pool[j]-pool[i];
      if(step<1||step>30)continue;
      if(!found[step])found[step]={pairs:[],triples:[]};
      found[step].pairs.push([pool[i],pool[j]]);
      if(poolSet.has(pool[j]+step))found[step].triples.push([pool[i],pool[j],pool[j]+step]);
    }
  }
  const steps=Object.keys(found).map(Number).filter(s=>found[s].pairs.length>0).sort((a,b)=>a-b);
  if(!steps.length){area.innerHTML='<div style="font-size:12px;color:var(--color-text-secondary)">Anlamlı dizi bulunamadı.</div>';return;}
  let html=`<table class="arith-table"><thead><tr><th style="text-align:left">Adım</th><th>2'li zincir</th><th>3'lü zincir</th></tr></thead><tbody>`;
  steps.forEach(s=>{
    const p2=found[s].pairs.length,p3=found[s].triples.length;
    const k2='arith_'+s+'_2',k3='arith_'+s+'_3';
    if(!arithState[k2])arithState[k2]='serbest';
    if(!arithState[k3])arithState[k3]='serbest';
    const ex2=found[s].pairs[0]?found[s].pairs[0].join('→'):'—';
    const ex3=found[s].triples[0]?found[s].triples[0].join('→'):'—';
    html+=`<tr>
      <td>+${s}<br><span style="font-size:10px;color:var(--color-text-secondary)">${p2}çift/${p3}üçlü</span></td>
      <td><div style="font-size:10px;color:var(--color-text-secondary);margin-bottom:3px">${ex2}</div>
        <div style="display:flex;gap:3px;justify-content:center">
          <span class="pill-sm${arithState[k2]==='yasak'?' yasak':''}" onclick="setArith('${k2}','yasak',this)">Yasak</span>
          <span class="pill-sm${arithState[k2]==='serbest'?' serbest':''}" onclick="setArith('${k2}','serbest',this)">Serbest</span>
        </div></td>
      <td>${p3>0?`<div style="font-size:10px;color:var(--color-text-secondary);margin-bottom:3px">${ex3}</div>
        <div style="display:flex;gap:3px;justify-content:center">
          <span class="pill-sm${arithState[k3]==='yasak'?' yasak':''}" onclick="setArith('${k3}','yasak',this)">Yasak</span>
          <span class="pill-sm${arithState[k3]==='serbest'?' serbest':''}" onclick="setArith('${k3}','serbest',this)">Serbest</span>
        </div>`:'<span style="font-size:10px;color:var(--color-text-tertiary)">—</span>'}</td>
    </tr>`;
  });
  html+='</tbody></table>';
  area.innerHTML=html;
}
function setArith(key,val,el){
  arithState[key]=val;
  arithTouched.add(key);
  el.parentElement.querySelectorAll('.pill-sm').forEach(p=>p.className='pill-sm');
  el.className='pill-sm '+val;
}

// ─── KURAL KONTROL ───

function getPackageParams(){
  const getBool=id=>!!document.getElementById(id)?.checked;
  const getNum=(id,def)=>parseFloat(document.getElementById(id)?.value)||def;
  return {
    active:getBool('p-pack-active'),
    main:{name:'Ana dengeli paket', cols:getNum('p-pack-main-cols',40), t:getNum('p-pack-main-t',4), jaccard:getNum('p-pack-main-j',0.60), maxCommon:getNum('p-pack-main-c',4), outMax:getNum('p-pack-main-out',40), purpose:'2–3–4 bilen istikrarı ve geniş t=4 kapsama'},
    deep:{name:'t=5 destek paketi', cols:getNum('p-pack-deep-cols',12), t:getNum('p-pack-deep-t',5), jaccard:getNum('p-pack-deep-j',0.75), maxCommon:getNum('p-pack-deep-c',5), outMax:getNum('p-pack-deep-out',45), purpose:'5 bilen yaklaşımı için çekirdek yoğunlaşma'},
    risk:{name:'Kontrollü risk paketi', cols:getNum('p-pack-risk-cols',8), t:getNum('p-pack-risk-t',3), jaccard:getNum('p-pack-risk-j',0.75), maxCommon:getNum('p-pack-risk-c',5), outMax:getNum('p-pack-risk-out',55), purpose:'ana paketin kaçırabileceği ama kabul edilebilir riskli dizilimlere küçük pay'}
  };
}

function packageTotal(pkg){return (pkg.main?.cols||0)+(pkg.deep?.cols||0)+(pkg.risk?.cols||0);}

/* REMOVED OLD getParams */

/* REMOVED OLD checkCombo */


// ─── UÇ KOLON SKORU ───
function getOutlierParams(){
  const getBool=id=>!!document.getElementById(id)?.checked;
  const getNum=(id,def)=>parseFloat(document.getElementById(id)?.value)||def;
  return {
    active:getBool('p-out-active'),
    maxScore:getNum('p-out-max',40),
    centerActive:getBool('p-out-center'),
    unitActive:getBool('p-out-unit-active'),
    unitMax:getNum('p-out-unitmax',2),
    gapActive:getBool('p-out-gap-active'),
    largeGap:getNum('p-out-largegap',20),
    maxLarge:getNum('p-out-maxlarge',2),
    mechActive:getBool('p-out-mech-active'),
    repeatMax:getNum('p-out-repeatmax',2)
  };
}

function countArithmeticTriples(s){
  const set=new Set(s);let cnt=0;
  for(let i=0;i<s.length;i++){
    for(let j=i+1;j<s.length;j++){
      const step=s[j]-s[i];
      if(set.has(s[j]+step))cnt++;
    }
  }
  return cnt;
}

function outlierScore(combo,p,o){
  const s=combo.slice().sort((a,b)=>a-b);
  const reasons=[];
  let score=0;
  const sum=s.reduce((a,b)=>a+b,0);
  if(o.centerActive && p.sumMax>p.sumMin){
    const center=(p.sumMin+p.sumMax)/2;
    const half=(p.sumMax-p.sumMin)/2;
    const dist=Math.abs(sum-center)/Math.max(1,half);
    if(dist>=0.90){score+=20;reasons.push('toplam sınırına çok yakın');}
    else if(dist>=0.75){score+=12;reasons.push('toplam merkeze uzak');}
    else if(dist>=0.60){score+=6;reasons.push('toplam hafif uçta');}
  }
  if(o.unitActive){
    const units={};
    s.forEach(n=>{const u=n%10;units[u]=(units[u]||0)+1;});
    const maxUnit=Math.max(...Object.values(units));
    if(maxUnit>o.unitMax){score+=(maxUnit-o.unitMax)*12;reasons.push('aynı birler basamağı fazla');}
  }
  const gaps=[];
  for(let i=1;i<s.length;i++)gaps.push(s[i]-s[i-1]);
  if(o.gapActive){
    const largeCount=gaps.filter(g=>g>=o.largeGap).length;
    const closeAllowed=gaps.filter(g=>g===4||g===5).length;
    const span=s[s.length-1]-s[0];
    if(largeCount>o.maxLarge){score+=(largeCount-o.maxLarge)*10;reasons.push('büyük sıçrama fazla');}
    if(closeAllowed>2){score+=(closeAllowed-2)*6;reasons.push('4/5 yakın fark tekrarı fazla');}
    if(span<25){score+=10;reasons.push('kolon çok sıkışık');}
    if(span>78){score+=8;reasons.push('kolon çok dağınık');}
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
    const triples=countArithmeticTriples(s);
    if(triples>0){score+=Math.min(24,triples*8);reasons.push('aritmetik üçlü içeriyor');}
    const verticalPairs=Object.entries(diffCount).filter(([d,c])=>Number(d)%10===0 && Number(d)>0).reduce((a,[,c])=>a+c,0);
    if(verticalPairs>2){score+=(verticalPairs-2)*6;reasons.push('dikey ilişki yoğun');}
  }
  score=Math.min(100,Math.round(score));
  return {score,reasons:[...new Set(reasons)]};
}

function summarizeOutlierReasons(scored){
  const m={};
  scored.forEach(x=>x.reasons.forEach(r=>m[r]=(m[r]||0)+1));
  return Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,4);
}

function comb(arr,k){
  const res=[];
  function bt(s,cur){if(cur.length===k){res.push([...cur]);return}for(let i=s;i<arr.length;i++){cur.push(arr[i]);bt(i+1,cur);cur.pop();}}
  bt(0,[]);return res;
}


function maxCommonAllowedByJaccard(k,j){
  return Math.floor((2*k*j)/(1+j)+1e-9);
}

/* REMOVED OLD getRuleWarnings */

function getBlockingWarnings(p){
  return getRuleWarnings(p).filter(w=>w.type==='red');
}


// ─── ELEME RAPORU ───
function fmtCombo(c){return c.slice().sort((a,b)=>a-b).join('\t');}
function csvEscape(v){const s=String(v??'');return '"'+s.replace(/"/g,'""')+'"';}
function reasonSummary(list,topN=8){
  const m={};
  list.forEach(x=>(x.reasons||[]).forEach(r=>m[r]=(m[r]||0)+1));
  return Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,topN);
}
function getElimBaseList(){
  if(!lastAnalysisData) return [];
  const mode=document.getElementById('elim-mode')?.value||'rejected';
  if(mode==='rejected') return lastAnalysisData.rejected||[];
  if(mode==='passed_risky') return (lastAnalysisData.passed||[]).slice().sort((a,b)=>b.score-a.score);
  if(mode==='passed_best') return (lastAnalysisData.passed||[]).slice().sort((a,b)=>a.score-b.score);
  return (lastAnalysisData.scored||[]).slice().sort((a,b)=>b.score-a.score);
}
function getFilteredElimList(){
  const q=(document.getElementById('elim-search')?.value||'').trim().toLowerCase();
  let list=getElimBaseList();
  if(q){
    list=list.filter(x=>{
      const combo=(x.combo||[]).join(' ');
      const reasons=(x.reasons||[]).join(' ').toLowerCase();
      return combo.includes(q)||reasons.includes(q);
    });
  }
  return list;
}
function renderElimReport(){
  const out=document.getElementById('elim-output');
  if(!out) return;
  if(!lastAnalysisData){
    out.value='Önce Analiz Et butonuna bas. Sonra elenen kolonlar burada görünecek.';
    ['elim-count','elim-total','elim-topreason'].forEach(id=>{const el=document.getElementById(id); if(el) el.textContent='—';});
    const r=document.getElementById('elim-reasons'); if(r) r.innerHTML='';
    return;
  }
  const limit=Math.max(1,parseInt(document.getElementById('elim-limit')?.value)||200);
  const base=getElimBaseList();
  const filtered=getFilteredElimList();
  const shown=filtered.slice(0,limit);
  const mode=document.getElementById('elim-mode')?.value||'rejected';
  const title={
    rejected:'UÇ SKORUYLA ELENEN KOLONLAR',
    passed_risky:'SKORDAN GEÇEN AMA RİSKLİ KALANLAR',
    passed_best:'SKORDAN GEÇEN EN DENGELİ KOLONLAR',
    all_scored:'TÜM GEÇERLİ ADAYLARIN SKOR TABLOSU'
  }[mode]||'ELEME RAPORU';
  const reasonStats=reasonSummary(base,8);
  const topReason=reasonStats[0]?reasonStats[0][0]:'—';
  document.getElementById('elim-count').textContent=shown.length.toLocaleString();
  document.getElementById('elim-total').textContent=base.length.toLocaleString();
  document.getElementById('elim-topreason').textContent=topReason.length>12?topReason.slice(0,12)+'…':topReason;
  const reasonBox=document.getElementById('elim-reasons');
  if(reasonBox){
    reasonBox.innerHTML=reasonStats.length
      ? reasonStats.map(([r,c],i)=>'<span class="reason-chip '+(i<3?'strong':'')+'">'+r+': '+c+'</span>').join('')
      : '<span class="reason-chip">Neden yok</span>';
  }
  const header=[
    title,
    'Toplam ilgili aday: '+base.length,
    'Arama sonrası: '+filtered.length,
    'Gösterilen: '+shown.length,
    'Format: Kolon | Skor | Neden',
    ''.padEnd(80,'─')
  ];
  const rows=shown.map((x,i)=>{
    const reasons=(x.reasons&&x.reasons.length)?x.reasons.join(', '):'neden yok';
    return String(i+1).padStart(4,'0')+' | '+fmtCombo(x.combo)+' | skor='+String(x.score).padStart(3,' ')+' | '+reasons;
  });
  out.value=header.concat(rows).join('\n') || 'Liste boş.';
}
function copyElimReport(){
  const out=document.getElementById('elim-output');
  if(!out) return;
  navigator.clipboard.writeText(out.value||'').then(()=>alert('Eleme raporu kopyalandı.')).catch(()=>{out.select();document.execCommand('copy');});
}
function downloadElimCsv(){
  if(!lastAnalysisData){alert('Önce Analiz Et butonuna bas.');return;}
  const list=getFilteredElimList();
  const mode=document.getElementById('elim-mode')?.value||'rejected';
  const lines=['mode;index;kolon;skor;nedenler'];
  list.forEach((x,i)=>{
    lines.push([csvEscape(mode),i+1,csvEscape((x.combo||[]).join(' ')),x.score,csvEscape((x.reasons||[]).join(', '))].join(';'));
  });
  const blob=new Blob([lines.join('\n')],{type:'text/csv;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;
  a.download='eleme_raporu.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ─── JACCARD / BENZERLİK ÜRETİLEBİLİRLİK KONTROLÜ ───
function commonCount(a,b){
  let i=0,j=0,c=0;
  while(i<a.length && j<b.length){
    if(a[i]===b[j]){c++;i++;j++;}
    else if(a[i]<b[j])i++;
    else j++;
  }
  return c;
}

function comboSum(c){return c.reduce((a,b)=>a+b,0);}

function similarityOk(a,b,p){
  const com=commonCount(a,b);
  if(com>p.maxCommon)return false;
  const jac=com/(p.k*2-com);
  return jac<=p.jaccard+1e-9;
}

function selectedSimilarityStats(selected,p){
  let maxCommon=0, maxJ=0;
  for(let i=0;i<selected.length;i++){
    for(let j=i+1;j<selected.length;j++){
      const com=commonCount(selected[i].combo,selected[j].combo);
      const jac=com/(p.k*2-com);
      if(com>maxCommon)maxCommon=com;
      if(jac>maxJ)maxJ=jac;
    }
  }
  return {maxCommon, maxJ};
}

function deterministicHash(n,seed){
  let x=(n+1)*1103515245 + (seed+17)*12345;
  x=(x>>>0);
  x^=x<<13; x^=x>>>17; x^=x<<5;
  return (x>>>0)/4294967295;
}

function trySimilarityOrder(items,p){
  const selected=[];
  const usageCount={};  // v7.14: sayı bazlı kullanım sayacı
  const freqCap=p.freqMax||60;
  // v7.14: havuzun en küçük 2 ve en büyük 2 sayısını düşük öncelikli say
  const sortedPool=[...(pool||[])].sort((a,b)=>a-b);
  const edgeNums=new Set([
    ...sortedPool.slice(0,2),
    ...sortedPool.slice(-2)
  ]);
  outer:
  for(const it of items){
    // freqMax hard cap: bu kolondaki herhangi bir sayı sınırı doldurduysa atla
    for(const n of it.combo){
      if((usageCount[n]||0)>=freqCap) continue outer;
    }
    for(const s of selected){
      if(!similarityOk(it.combo,s.combo,p))continue outer;
    }
    // v7.14: edge sayıların kullanımı freqCap'ın %60'ını geçtiyse bu kolonu
    // sona bırak (bucket'ta başka seçenek yoksa alınır, tam yasak değil)
    const edgeOverload=it.combo.some(n=>edgeNums.has(n)&&(usageCount[n]||0)>=(freqCap*0.6));
    if(edgeOverload && selected.length<p.cols*0.85){
      continue; // ilk %85 dolana kadar edge-ağırlıklı kolonları atla
    }
    selected.push(it);
    it.combo.forEach(n=>{ usageCount[n]=(usageCount[n]||0)+1; });
    if(selected.length>=p.cols)break;
  }
  // Eğer edge kısıtı yüzünden hedef dolmadıysa kısıtsız tur yap
  if(selected.length<p.cols){
    outer2:
    for(const it of items){
      if(selected.includes(it)) continue;
      for(const n of it.combo){
        if((usageCount[n]||0)>=freqCap) continue outer2;
      }
      for(const s of selected){
        if(!similarityOk(it.combo,s.combo,p)) continue outer2;
      }
      selected.push(it);
      it.combo.forEach(n=>{ usageCount[n]=(usageCount[n]||0)+1; });
      if(selected.length>=p.cols)break;
    }
  }
  return selected;
}

function jaccardFeasibilityCheck(scoredItems,p){
  const items=scoredItems.map((x,idx)=>({
    combo:x.combo.slice().sort((a,b)=>a-b),
    score:x.score||0,
    idx,
    sum:comboSum(x.combo),
    reasons:x.reasons||[]
  }));
  const target=p.cols;
  if(!items.length){
    return {bestCount:0,target,ok:false,selected:[],trials:[],status:'Aday yok'};
  }

  const freq={}; pool.forEach(n=>freq[n]=0);
  items.forEach(it=>it.combo.forEach(n=>freq[n]=(freq[n]||0)+1));
  items.forEach(it=>{
    it.rarity=it.combo.reduce((a,n)=>a+(1/Math.max(1,freq[n])),0);
    it.centerDist=Math.abs(it.sum-((p.sumMin+p.sumMax)/2));
  });

  const orders=[];
  orders.push(['uç skor düşük', items.slice().sort((a,b)=>a.score-b.score || b.rarity-a.rarity)]);
  orders.push(['nadir sayı dengesi', items.slice().sort((a,b)=>b.rarity-a.rarity || a.score-b.score)]);
  orders.push(['toplam merkeze yakın', items.slice().sort((a,b)=>a.centerDist-b.centerDist || a.score-b.score)]);
  orders.push(['orijinal aday sırası', items.slice()]);
  orders.push(['toplam düşükten yükseğe', items.slice().sort((a,b)=>a.sum-b.sum || a.score-b.score)]);
  orders.push(['toplam yüksekten düşüğe', items.slice().sort((a,b)=>b.sum-a.sum || a.score-b.score)]);

  // Deterministik karışık denemeler: aynı veriyle aynı sonucu verir.
  for(let seed=1;seed<=18;seed++){
    orders.push([`deterministik deneme ${seed}`, items.slice().sort((a,b)=>{
      const ra=deterministicHash(a.idx,seed);
      const rb=deterministicHash(b.idx,seed);
      // Çok kötü uç skorları tamamen öne çıkmasın diye küçük skor avantajı eklenir.
      return (ra + a.score/250) - (rb + b.score/250);
    })]);
  }

  let best=[], bestName='', trialRows=[];
  for(const [name,order] of orders){
    const sel=trySimilarityOrder(order,p);
    trialRows.push({name,count:sel.length});
    if(sel.length>best.length){best=sel;bestName=name;}
    if(sel.length>=target)break;
  }

  const stats=selectedSimilarityStats(best,p);
  return {
    bestCount:best.length,
    target,
    ok:best.length>=target,
    selected:best,
    bestName,
    stats,
    trials:trialRows.sort((a,b)=>b.count-a.count).slice(0,8),
    status:best.length>=target?'Uygun':'Yetersiz'
  };
}

function formatComboPlain(c){return c.join('\t');}


function suggestNextJaccardValue(currentJ){
  const j=Number(currentJ)||0.6;
  if(j<=0.40) return Math.min(0.90, +(j+0.10).toFixed(2));
  if(j<=0.55) return Math.min(0.90, +(j+0.10).toFixed(2));
  if(j<=0.70) return Math.min(0.90, +(j+0.05).toFixed(2));
  return Math.min(0.90, +(j+0.05).toFixed(2));
}
function buildConstraintHint(validCount, afterOutlierCount, targetCount){
  const hints=[];
  if(validCount < targetCount){
    hints.push(`Kesin kurallardan sonra sadece ${validCount} aday kaldı. Önce temel kuralları esnet; Jaccard ayarı tek başına çözmez.`);
  }else if(validCount < targetCount*3){
    hints.push(`Kesin kurallardan geçen aday sayısı düşük (${validCount}). Sorun yalnızca Jaccard olmayabilir.`);
  }
  if(afterOutlierCount < targetCount){
    hints.push(`Uç skor filtresinden sonra ${afterOutlierCount} aday kaldı. Uç skor limitini yükselt veya bazı uç kontrollerini gevşet.`);
  }else if(afterOutlierCount < targetCount*2){
    hints.push(`Uç skor filtresi sonrası aday sayısı sınırlı (${afterOutlierCount}). Skor limitini +5 artırmayı test et.`);
  }
  return hints;
}
function buildJaccardSuggestionReport(selectedCount, targetCount, jLimit, maxCommon, afterOutlierCount, validCount){
  const ratio=targetCount>0 ? selectedCount/targetCount : 0;
  const nextJ=suggestNextJaccardValue(jLimit);
  const bigNextJ=Math.min(0.90, +(jLimit+0.15).toFixed(2));
  const suggestions=[];
  let level='UYGUN';
  let primaryAction='Mevcut ayarlarla devam edebilirsin.';

  if(ratio>=1){
    level='UYGUN';
    suggestions.push('Jaccard ve max ortak sayı kuralları bu ayarlarda üretimi engellemiyor.');
    suggestions.push('Mevcut ayarlarla devam edebilirsin.');
  }else if(ratio>=0.85){
    level='SINIRDA';
    primaryAction=`İlk test: Jaccard ${jLimit.toFixed(2)} → ${nextJ.toFixed(2)} yap.`;
    suggestions.push(primaryAction);
    if(maxCommon<5) suggestions.push(`Hâlâ yetmezse max ortak sayı ${maxCommon} → ${maxCommon+1} yap.`);
    suggestions.push('Önce tek değişiklik yap, tekrar Analiz Et. Sonra ikinci değişikliğe geç.');
  }else if(ratio>=0.60){
    level='SIKI';
    primaryAction=`İlk öneri: Jaccard ${jLimit.toFixed(2)} → ${nextJ.toFixed(2)} yap.`;
    suggestions.push(primaryAction);
    if(maxCommon<5) suggestions.push(`İkinci öneri: max ortak sayı ${maxCommon} → ${maxCommon+1} yap.`);
    suggestions.push('Uç kolon skor filtresi aktifse skor limitini +5 artırıp tekrar dene.');
    suggestions.push(`Hedefi test için geçici olarak ${targetCount} → ${Math.max(30,targetCount-10)} indirip üretilebilirliği kontrol et.`);
  }else if(ratio>=0.35){
    level='ÇOK SIKI';
    primaryAction=`Jaccard belirgin sıkı. İlk deneme ${jLimit.toFixed(2)} → ${nextJ.toFixed(2)}, gerekirse ${bigNextJ.toFixed(2)} yap.`;
    suggestions.push(primaryAction);
    if(maxCommon<5) suggestions.push(`Max ortak sayı değerini ${maxCommon} → ${Math.min(5,maxCommon+1)} yap.`);
    suggestions.push('Toplam aralığı, tek/çift ve bölge kotası tek kalıba kilitlendiyse 1-2 alternatif kota daha aç.');
    suggestions.push('Özel çift yasakları, yatay/dikey komşu fark ve aritmetik yasakları birlikte sıkıştırıyor olabilir; en sert olanı gevşet.');
  }else{
    level='KRİTİK';
    primaryAction=`Mevcut ayarla 60 kolon pratikte çıkmıyor. Önce Jaccard ${jLimit.toFixed(2)} → ${Math.min(0.90, +(jLimit+0.20).toFixed(2)).toFixed(2)} yap.`;
    suggestions.push(primaryAction);
    if(maxCommon<5) suggestions.push(`Max ortak sayı ${maxCommon} → ${Math.min(5,maxCommon+1)} yap.`);
    suggestions.push(`Kolon hedefini geçici test için ${targetCount} → ${Math.max(30, Math.floor(targetCount*0.70))} indir.`);
    suggestions.push('Kesin kurallardan geçen aday sayısı da düşükse yatay/dikey/aritmetik yasakları ve özel çiftleri gevşetmeden Jaccard çözmez.');
    suggestions.push('Uç skor filtresi aktifse limitini +10 artır veya önce pasif test yap.');
  }

  const hints=buildConstraintHint(validCount||0, afterOutlierCount||0, targetCount||0);
  return {level, ratio, nextJ, primaryAction, suggestions, hints};
}
function renderJaccardReport(){
  const out=document.getElementById('jacc-output');
  const targetEl=document.getElementById('jacc-target');
  const selectedEl=document.getElementById('jacc-selected');
  const statusEl=document.getElementById('jacc-status');
  if(!out || !lastAnalysisData || !lastAnalysisData.jaccardReport){
    if(out) out.value='';
    if(targetEl) targetEl.textContent='—';
    if(selectedEl) selectedEl.textContent='—';
    if(statusEl) statusEl.textContent='—';
    return;
  }
  const r=lastAnalysisData.jaccardReport;
  const p=lastAnalysisData.params || getParams();
  const advice=lastAnalysisData.jaccardAdvice || buildJaccardSuggestionReport(r.bestCount,r.target,p.jaccard,p.maxCommon,lastAnalysisData.outValidCount||0,lastAnalysisData.validCount||0);
  if(targetEl) targetEl.textContent=r.target;
  if(selectedEl) selectedEl.textContent=r.bestCount;
  if(statusEl) statusEl.textContent=advice.level;

  const lines=[];
  lines.push('JACCARD ÜRETİLEBİLİRLİK RAPORU');
  lines.push('--------------------------------');
  lines.push(`Hedef kolon sayısı        : ${r.target}`);
  lines.push(`Seçilebilen kolon sayısı  : ${r.bestCount}`);
  lines.push(`Durum                     : ${advice.level}`);
  lines.push(`Seçim oranı               : %${(advice.ratio*100).toFixed(1)}`);
  lines.push(`Mevcut Jaccard            : ${Number(p.jaccard).toFixed(2)}`);
  lines.push(`Mevcut max ortak sayı     : ${p.maxCommon}`);
  lines.push(`Kesin kurallardan geçen   : ${(lastAnalysisData.validCount||0).toLocaleString()}`);
  lines.push(`Uç filtreden sonra aday   : ${(lastAnalysisData.outValidCount||0).toLocaleString()}`);
  lines.push(`En iyi deneme             : ${r.bestName||'—'}`);
  lines.push(`Seçilenlerde max ortak    : ${r.stats ? r.stats.maxCommon : '—'}`);
  lines.push(`Seçilenlerde max Jaccard  : ${r.stats ? r.stats.maxJ.toFixed(3) : '—'}`);
  lines.push('');
  if(!r.ok){
    lines.push('NET ÇÖZÜM ÖNERİSİ');
    lines.push('------------------');
    lines.push(`1. ${advice.primaryAction}`);
    (advice.suggestions||[]).filter(s=>s!==advice.primaryAction).forEach((s,i)=>lines.push(`${i+2}. ${s}`));
    if(advice.hints && advice.hints.length){
      lines.push('');
      lines.push('EK TANI');
      lines.push('-------');
      advice.hints.forEach((h,i)=>lines.push(`${i+1}. ${h}`));
    }
    lines.push('');
  }else{
    lines.push('SONUÇ');
    lines.push('-----');
    lines.push('Bu ayarla Jaccard/ortak sayı kontrolü üretimi engellemiyor.');
    lines.push('');
  }
  lines.push('Deneme sonuçları:');
  (r.trials||[]).forEach(t=>lines.push(`- ${t.name}: ${t.count}/${r.target}`));
  lines.push('');
  lines.push('İlk seçilebilir kolon örnekleri:');
  (r.selected||[]).slice(0,80).forEach((it,i)=>lines.push(`${String(i+1).padStart(3,'0')} | ${formatComboPlain(it.combo)}`));
  out.value=lines.join('\n');
}

function copyJaccardReport(){
  const out=document.getElementById('jacc-output');
  navigator.clipboard.writeText(out?.value||'').then(()=>alert('Jaccard raporu kopyalandı.')).catch(()=>{out.select();document.execCommand('copy');});
}

// ═══════════════════════════════════════════════════════════════
// v7.13 — KURAL TEST PANELİ (runRuleTest)
// ═══════════════════════════════════════════════════════════════
window.runRuleTest = function() {
  const inp = document.getElementById('rtp-input');
  const res = document.getElementById('rtp-result');
  if (!inp || !res) return;
  const raw = inp.value.trim();
  if (!raw) { res.innerHTML = ''; return; }

  // Sayıları parse et
  const nums = raw.split(/[\s,;]+/).map(x => parseInt(x, 10)).filter(n => !isNaN(n) && n >= 1 && n <= 90);
  if (!nums.length) { res.innerHTML = '<span style="color:var(--color-red,#e53)">Geçerli sayı girilemedi.</span>'; return; }

  const p = (typeof getParams === 'function') ? getParams() : {};
  const poolSet = new Set(pool || []);
  const sorted = [...new Set(nums)].sort((a, b) => a - b);

  let html = '';

  // Havuz kontrolü
  const inPool = sorted.filter(n => poolSet.has(n));
  const notInPool = sorted.filter(n => !poolSet.has(n));
  const poolColor = notInPool.length ? '#e53' : '#27ae60';
  html += `<div style="margin-bottom:8px;padding:8px;border-radius:6px;background:${notInPool.length?'rgba(229,83,51,.08)':'rgba(39,174,96,.08)'};border-left:3px solid ${poolColor};">`;
  html += `<b>Havuz Durumu:</b> ${sorted.map(n => poolSet.has(n) ? `<span style="color:#27ae60">${n}✓</span>` : `<span style="color:#e53">${n}✗</span>`).join(' ')}`;
  if (notInPool.length) html += `<br><span style="color:#e53">Havuzda olmayan: [${notInPool.join(', ')}]</span>`;
  html += '</div>';

  // Kupon koordinatları göster
  const coordInfo = sorted.map(n => {
    const c = {row: Math.floor((n-1)/10), col: (n-1)%10};
    return `${n}→(satır${c.row+1},sütun${c.col+1})`;
  }).join('  ');
  html += `<div style="margin-bottom:8px;font-size:11px;color:var(--color-text-secondary)">9×10 Kupon Koordinatları: ${coordInfo}</div>`;

  // Çapraz zincir haritası — hangi sayılar aynı +9 veya +11 hattında?
  const diagInfo = [];
  for (const step of [9, 11]) {
    const visited = new Set();
    for (const n of sorted) {
      if (visited.has(n)) continue;
      // Bu sayının ait olduğu tam çapraz hattı bul (kupon içindeki tüm üyeler)
      let root = n;
      while (root - step >= 1) {
        const prev = root - step;
        const A = {row: Math.floor((root-1)/10), col: (root-1)%10};
        const B = {row: Math.floor((prev-1)/10), col: (prev-1)%10};
        const isD = B.row === A.row - 1 && ((step === 9 && B.col === A.col + 1) || (step === 11 && B.col === A.col - 1));
        if (isD) root = prev; else break;
      }
      const hat = [root];
      let cur = root;
      while (true) {
        const nxt = cur + step;
        const A = {row: Math.floor((cur-1)/10), col: (cur-1)%10};
        const B = {row: Math.floor((nxt-1)/10), col: (nxt-1)%10};
        const isD = nxt <= 90 && B.row === A.row + 1 && ((step === 9 && B.col === A.col - 1) || (step === 11 && B.col === A.col + 1));
        if (isD) { hat.push(nxt); cur = nxt; } else break;
      }
      hat.forEach(x => visited.add(x));
      const inCombo = hat.filter(x => sorted.includes(x));
      if (inCombo.length >= 2) {
        const th = (typeof diagonalThreshold === 'function') ? diagonalThreshold(step) : 0;
        const yasak = th >= 2 && inCombo.length >= th;
        diagInfo.push(`+${step} hattı: [${hat.join('→')}] — seçilenler: <b>${inCombo.join('-')}</b> (${inCombo.length} sayı) → <span style="color:${yasak?'#e53':'#27ae60'}">${yasak?'❌ YASAK (eşik:'+th+'li)':'✅ Serbest'}</span>`);
      }
    }
  }
  if (diagInfo.length) {
    html += `<div style="margin-bottom:8px;padding:8px;border-radius:6px;background:rgba(120,80,200,.06);border-left:3px solid #7850c8;">`;
    html += `<b>Çapraz Hat Analizi:</b><br>${diagInfo.join('<br>')}`;
    html += '</div>';
  }

  // Sadece 2 sayı girildiyse kısmi test yapma uyarısı
  if (sorted.length < 2) {
    html += '<span style="color:var(--color-text-secondary)">En az 2 sayı gir.</span>';
    res.innerHTML = html; return;
  }

  // Kural testi
  const details = (typeof window.checkComboDetailed === 'function') ? window.checkComboDetailed(sorted, p) : null;
  if (!details) {
    html += '<span style="color:var(--color-text-secondary)">Önce Analiz Et butonuna bas (parametreler yüklensin).</span>';
    res.innerHTML = html; return;
  }

  html += '<div style="margin-top:4px;">';
  for (const d of details) {
    const color = d.engel ? '#e53' : '#27ae60';
    const bg = d.engel ? 'rgba(229,83,51,.07)' : 'rgba(39,174,96,.07)';
    html += `<div style="padding:7px 10px;border-radius:6px;background:${bg};border-left:3px solid ${color};margin-bottom:5px;">`;
    html += `<b style="color:${color}">${d.kural}</b><br>${d.detay}`;
    html += '</div>';
    if (d.engel) break; // İlk engeli bulduk, diğer kontrollere gerek yok
  }
  html += '</div>';

  res.innerHTML = html;
};

// ═══════════════════════════════════════════════════════════════
// v7.13 — BATCH SERİ ÇEKİM SİSTEMİ
// ═══════════════════════════════════════════════════════════════
window._batchState = { seriesNum: 0, excludeKeys: new Set(), lastBatch: [] };

function _batchUpdateStatus(remaining) {
  const el = document.getElementById('batch-status');
  if (!el) return;
  const s = window._batchState;
  el.textContent = `Seri: ${s.seriesNum || '—'}  |  Dışlanan: ${s.excludeKeys.size} kolon  |  Havuzda kalan: ${remaining !== undefined ? remaining : '—'}`;
}

window.batchNextSeries = function() {
  const data = window.lastAnalysisData || (typeof lastAnalysisData !== 'undefined' ? lastAnalysisData : null);
  const report = data && data.jaccardReport;
  if (!report || !Array.isArray(report.selected) || !report.selected.length) {
    alert('Önce Analiz Et butonuna bas. Jaccard raporu oluşmadan batch çekim yapılamaz.'); return;
  }
  const p = (data && data.params) || {};
  const target = Number(report.target || p.cols || 60) || 60;
  const s = window._batchState;

  // Tüm geçerli aday havuzunu al (jaccardReport.selected tüm geçerli adayları içeriyor)
  // Ama biz similarityPool'a ihtiyacımız var — lastAnalysisData.passed veya scored kullan
  const allCandidates = (data.passed || data.scored || []).map(x => ({
    combo: (x.combo || x).slice().sort((a,b)=>a-b),
    score: x.score || 0,
    idx: x.idx || 0
  }));

  // Dışlama listesindeki kolonları çıkar
  const remaining = allCandidates.filter(item => {
    const key = item.combo.join('-');
    return !s.excludeKeys.has(key);
  });

  if (!remaining.length) {
    alert('Havuzda seçilebilecek kolon kalmadı. Dışlama listesini sıfırla.'); return;
  }

  // Jaccard greedy seçimi — round-robin bucket ile min/max çeşitliliği
  const selected = [];
  const maxC = p.maxCommon || 4;
  const jLimit = p.jaccard || 0.3;

  // Havuzdaki min sayıya göre 4 bucket'a böl (çeyrekler)
  const allMins = remaining.map(x => x.combo[0]);
  const minMin = Math.min(...allMins), maxMin = Math.max(...allMins);
  const step = (maxMin - minMin + 1) / 4 || 1;
  const buckets = [[], [], [], []];
  remaining.slice().sort((a,b) => a.score - b.score).forEach(item => {
    const bi = Math.min(3, Math.floor((item.combo[0] - minMin) / step));
    buckets[bi].push(item);
  });

  // Round-robin: her turda sıradaki bucket'tan uygun ilk kolonu al
  let bi = 0, attempts = 0, maxAttempts = remaining.length * 4;
  while (selected.length < target && attempts < maxAttempts) {
    attempts++;
    const bkt = buckets[bi % 4];
    bi++;
    if (!bkt.length) continue;
    // Bucket'tan uygun ilk adayı bul
    let found = -1;
    for (let i = 0; i < bkt.length; i++) {
      const item = bkt[i];
      const ok = selected.every(sel => {
        const inter = sel.combo.filter(x => item.combo.includes(x)).length;
        const union = 6 + 6 - inter;
        return inter <= maxC && (union ? inter/union : 0) <= jLimit;
      });
      if (ok) { found = i; break; }
    }
    if (found >= 0) { selected.push(bkt[found]); bkt.splice(found, 1); }
  }

  if (!selected.length) {
    alert('Mevcut Jaccard/max ortak kurallarıyla havuzdan yeni kolon seçilemiyor. Sıfırla veya kuralları gevşet.'); return;
  }

  // Bu serinin kolonlarını dışlama listesine ekle
  selected.forEach(item => s.excludeKeys.add(item.combo.join('-')));
  s.seriesNum++;
  s.lastBatch = selected;

  // Excel çıktısı
  const rows = selected.map(item => item.combo.join('\t'));
  const out = document.getElementById('batch-excel-output');
  if (out) out.value = rows.join('\n');

  _batchUpdateStatus(remaining.length - selected.length);
  alert(`Seri ${s.seriesNum}: ${selected.length} kolon seçildi. Havuzda kalan: ${remaining.length - selected.length} kolon.`);
};

window.batchCopyExcel = function() {
  const out = document.getElementById('batch-excel-output');
  const text = out ? out.value : '';
  if (!text) { alert('Önce Sonraki Seriyi Al butonuna bas.'); return; }
  const s = window._batchState;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => alert(`Seri ${s.seriesNum} Excel formatında kopyalandı.`));
  } else { if(out){out.select();document.execCommand('copy');alert(`Seri ${s.seriesNum} kopyalandı.`);} }
};

window.batchReset = function() {
  if (!confirm('Tüm batch dışlama listesi sıfırlanacak. Emin misin?')) return;
  window._batchState = { seriesNum: 0, excludeKeys: new Set(), lastBatch: [] };
  const out = document.getElementById('batch-excel-output');
  if (out) out.value = '';
  _batchUpdateStatus(undefined);
};

// ═══════════════════════════════════════════════════════════════
// v7.13 — t=3 KAPSAMA SKORU (Jaccard raporuna eklenir)
// ═══════════════════════════════════════════════════════════════
function computeT3Coverage(selected, poolArr) {
  if (!selected || selected.length < 1 || !poolArr || poolArr.length < 3) return null;
  // Tüm 3'lü kombinasyonları üret
  const triples = new Set();
  const covered = new Set();
  for (let i = 0; i < poolArr.length - 2; i++)
    for (let j = i+1; j < poolArr.length - 1; j++)
      for (let k = j+1; k < poolArr.length; k++)
        triples.add(poolArr[i]+','+poolArr[j]+','+poolArr[k]);
  // Seçilen kolonların kapladığı 3'lüleri bul
  for (const item of selected) {
    const c = (item.combo || item).slice().sort((a,b)=>a-b);
    for (let i = 0; i < c.length-2; i++)
      for (let j = i+1; j < c.length-1; j++)
        for (let k = j+1; k < c.length; k++)
          covered.add(c[i]+','+c[j]+','+c[k]);
  }
  const total = triples.size;
  const cov = [...triples].filter(t => covered.has(t)).length;
  return { total, covered: cov, pct: total ? Math.round(cov/total*100) : 0 };
}

// Jaccard raporuna kapsama satırı ekle — renderJaccardReport'u sarmala
(function patchJaccardWithCoverage(){
  const origRender = window.renderJaccardReport;
  if (!origRender || origRender._v713CovPatched) return;
  window.renderJaccardReport = function() {
    const ret = origRender.apply(this, arguments);
    try {
      const data = window.lastAnalysisData || (typeof lastAnalysisData !== 'undefined' ? lastAnalysisData : null);
      const report = data && data.jaccardReport;
      if (!report || !report.selected || !report.selected.length) return ret;
      const p = data.params || {};
      const target = Number(report.target || p.cols || 60);
      const sel = report.selected.slice(0, target);
      const poolArr = (pool || []).slice().sort((a,b)=>a-b);
      const cov = computeT3Coverage(sel, poolArr);
      if (!cov) return ret;
      const out = document.getElementById('jacc-output');
      // v7.14: Kolon Fingerprint Çeşitlilik Skoru
      if (out && !out.value.includes('Fingerprint')) {
        const selCombos = sel.map(x => (x.combo||x).slice().sort((a,b)=>a-b));
        const minNums = selCombos.map(c=>c[0]);
        const maxNums = selCombos.map(c=>c[c.length-1]);
        const uniqMin = new Set(minNums).size;
        const uniqMax = new Set(maxNums).size;
        const minDist = minNums.reduce((acc,n)=>{ acc[n]=(acc[n]||0)+1; return acc; },{});
        const maxDist = maxNums.reduce((acc,n)=>{ acc[n]=(acc[n]||0)+1; return acc; },{});
        const topMin = Object.entries(minDist).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([n,c])=>`${n}(${c}x)`).join(', ');
        const topMax = Object.entries(maxDist).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([n,c])=>`${n}(${c}x)`).join(', ');
        const fpScore = Math.round((uniqMin+uniqMax)/2);
        const fpGrade = fpScore>=10?'✅ Mükemmel':fpScore>=6?'⚠️ Orta':' ❌ Zayıf';
        out.value += `\n────────────────────────────────────────\nFingerprint Çeşitlilik Skoru (v7.14)\n────────────────────────────────────────\n${fpGrade} Min çeşitliliği: ${uniqMin} farklı başlangıç sayısı — En sık: ${topMin}\n${fpGrade} Max çeşitliliği: ${uniqMax} farklı bitiş sayısı — En sık: ${topMax}\nNot: Düşük çeşitlilik → frekans max değerini düşür veya havuz min/max sayılarını çıkar.\n`;
      }
      if (out && !out.value.includes('t=3 Kapsama')) {
        const color = cov.pct >= 90 ? '✅' : cov.pct >= 70 ? '⚠️' : '❌';
        out.value += `\n────────────────────────────────────────\nt=3 Kapsama Skoru (v7.13)\n────────────────────────────────────────\n${color} ${cov.covered} / ${cov.total} üçlü kapsandı (%${cov.pct})\n• Havuzdaki ${poolArr.length} sayının tüm 3'lü kombinasyonları: ${cov.total}\n• Seçilen ${sel.length} kolon tarafından kapsanan: ${cov.covered}\n• %${cov.pct >= 90 ? '90+ mükemmel kapsama' : cov.pct >= 70 ? '70+ iyi kapsama' : cov.pct + ' — kurallar kısıtlıyor olabilir'}\n`;
      }
    } catch(e) {}
    return ret;
  };
  window.renderJaccardReport._v713CovPatched = true;
})();

function selectedFreqMaxInfoFromReport(report,p){
  if(!report || !report.selected || !report.selected.length) return null;
  const target=p.cols || report.target || report.selected.length;
  const selected=report.selected.slice(0,target);
  const banko=new Set((p&&p.bankoList)||[]);
  const freq={};
  selected.forEach(it=>{
    const c=it.combo||it;
    (c||[]).forEach(n=>{ if(!banko.has(n)) freq[n]=(freq[n]||0)+1; });
  });
  const entries=Object.entries(freq).map(([n,v])=>[Number(n),v]).sort((a,b)=>b[1]-a[1] || a[0]-b[0]);
  if(!entries.length) return null;
  const max=entries[0][1];
  const nums=entries.filter(([,v])=>v===max).map(([n])=>n);
  return {max, nums, entries, selectedCount:selected.length};
}
function addFreqMaxFeasibilityWarnings(warns,p,jaccardReport){
  const banko=new Set((p&&p.bankoList)||[]);
  const activeSet=getActiveNumbersForFrequency(p);
  const activeNonBanko=[...activeSet].filter(n=>!banko.has(n));
  const nonBankoNeed=(p.cols||0)*Math.max(0,(p.k||0)-banko.size);
  if(activeNonBanko.length){
    const theoreticalMin=Math.ceil(nonBankoNeed/activeNonBanko.length);
    if(theoreticalMin>p.freqMax){
      warns.push({type:'red',msg:`Frekans max kapasitesi yetersiz: bu aktif sayı havuzuyla ${p.cols} kolon için teorik minimum üst sınır en az ${theoreticalMin} olmalı. Sen ${p.freqMax} verdin.`});
    }
  }
  const info=selectedFreqMaxInfoFromReport(jaccardReport,p);
  if(info && info.selectedCount>=p.cols && info.max>p.freqMax){
    warns.push({type:'red',msg:`Frekans max sınırı üretimi engelleyebilir: Jaccard seçilebilir 60 kolon denemesinde en yoğun sayı ${info.max} kez kullanılıyor (${info.nums.slice(0,8).join(', ')}). Frekans maksimumu en az ${info.max} yap veya kuralları gevşet. Şu an: ${p.freqMax}.`});
  }else if(info && info.selectedCount>=p.cols && info.max>=Math.max(1,p.freqMax-2)){
    warns.push({type:'amber',msg:`Frekans max sınırı sınıra yakın: seçilebilir 60 kolon denemesinde en yüksek kullanım ${info.max}, mevcut max ${p.freqMax}.`});
  }
}

function runAnalysis(){
  const btn=document.getElementById('analyze-btn');
  btn.textContent='Hesaplanıyor...';btn.disabled=true;
  setTimeout(()=>{
    const p=getParams();
    if(pool.length<p.k){
      document.getElementById('warn-list').innerHTML='<div class="warn-item"><div class="warn-dot red"></div><div>Havuzda yeterli sayı yok.</div></div>';
      btn.textContent='Analiz Et ↗';btn.disabled=false;return;
    }
    const all=comb(pool,p.k);
    const valid=all.filter(c=>checkCombo(c,p));
    const validCount=valid.length;
    const ratio=(validCount/all.length*100).toFixed(1);
    const out=getOutlierParams();
    const scored=valid.map(c=>({combo:c,...outlierScore(c,p,out)}));
    const outValid=out.active ? scored.filter(x=>x.score<=out.maxScore).map(x=>x.combo) : valid;
    const outRejected=out.active ? validCount-outValid.length : 0;
    const outAvg=scored.length ? (scored.reduce((a,x)=>a+x.score,0)/scored.length) : 0;
    const outBest=scored.length ? Math.min(...scored.map(x=>x.score)) : 0;
    const outWorst=scored.length ? Math.max(...scored.map(x=>x.score)) : 0;
    const effective=out.active ? outValid : valid;
    const activeNumbersForFreq=getActiveNumbersFromCombos(effective);
    p.activeNumbers=activeNumbersForFreq;
    const rejected=out.active ? scored.filter(x=>x.score>out.maxScore).sort((a,b)=>b.score-a.score) : [];
    const passed=out.active ? scored.filter(x=>x.score<=out.maxScore).sort((a,b)=>b.score-a.score) : scored.slice().sort((a,b)=>b.score-a.score);
    const similarityPool = out.active ? scored.filter(x=>x.score<=out.maxScore) : scored;
    const jaccardReport = jaccardFeasibilityCheck(similarityPool,p);
    const jaccardAdvice = buildJaccardSuggestionReport(jaccardReport.bestCount,p.cols,p.jaccard,p.maxCommon,outValid.length,validCount);
    lastAnalysisData={scored, rejected, passed, validCount, outValidCount:outValid.length, outRejected, params:p, out, jaccardReport, jaccardAdvice};
    renderElimReport();
    renderJaccardReport();

    document.getElementById('sc-valid').textContent=validCount.toLocaleString();
    document.getElementById('sc-ratio').textContent=ratio+'%';
    document.getElementById('sc-outvalid').textContent=out.active ? outValid.length.toLocaleString() : 'Pasif';
    document.getElementById('sc-outavg').textContent=scored.length ? outAvg.toFixed(1) : '—';
    document.getElementById('sc-outrej').textContent=out.active ? outRejected.toLocaleString() : '—';
    document.getElementById('sc-jaccfit').textContent=jaccardReport.bestCount.toLocaleString()+'/'+p.cols;
    document.getElementById('sc-jaccstatus').textContent=jaccardReport.ok ? 'UYGUN' : jaccardAdvice.level;
    document.getElementById('sc-jaccmax').textContent=jaccardReport.stats ? (jaccardReport.stats.maxCommon+'/'+jaccardReport.stats.maxJ.toFixed(2)) : '—';
    document.getElementById('out-preview-count').textContent=out.active ? outValid.length.toLocaleString() : 'Pasif';
    document.getElementById('out-preview-best').textContent=scored.length ? outBest : '—';
    document.getElementById('out-preview-worst').textContent=scored.length ? outWorst : '—';

    const freq={};pool.forEach(n=>freq[n]=0);
    effective.forEach(c=>c.forEach(n=>freq[n]++));
    const activeFreqVals=[...activeNumbersForFreq].map(n=>freq[n]||0);
    const freqVals=activeFreqVals.length?activeFreqVals:Object.values(freq);
    const maxFreq=Math.max(...freqVals)||1;
    const minFreq=Math.min(...freqVals);
    const spreadRatio=(maxFreq/Math.max(1,minFreq)).toFixed(1);
    document.getElementById('sc-spread').textContent=spreadRatio+'x';

    const lowThr=maxFreq*0.30,highThr=maxFreq*0.90;
    const primesInPool=pool.filter(n=>PR.has(n));
    const isPrimeConstrained=p.primeMax<=1&&primesInPool.length>1;
    const warns=[];
    warns.push(...getRuleWarnings(p));
    const inactiveFreqNums=getInactiveNumbersForFrequency(p);
    if(inactiveFreqNums.length){
      warns.push({type:'blue',msg:`Frekans min muafiyeti: aktif kurallarla hiç kullanılamayan ${inactiveFreqNums.length} sayı min frekans şartından muaf: ${inactiveFreqNums.join(', ')}.`});
    }

    if(validCount===0){warns.push({type:'red',msg:'Geçerli kombinasyon YOK. Kurallar çok sıkı.'});}
    else if(validCount<p.cols){warns.push({type:'red',msg:`Geçerli kombinasyon (${validCount}) hedef kolon sayısından (${p.cols}) az.`});}
    else if(out.active && outValid.length<p.cols){warns.push({type:'red',msg:`Uç skor filtresinden sonra kalan aday (${outValid.length}) hedef kolon sayısından (${p.cols}) az. Skor limitini yükselt veya bazı uç kontrollerini gevşet.`});}
    else if(out.active && outRejected/Math.max(1,validCount)>0.60){warns.push({type:'amber',msg:`Uç kolon filtresi adayların %${Math.round(outRejected/Math.max(1,validCount)*100)} kadarını eliyor. Bu çok agresif olabilir.`});}
    else if(validCount<p.cols*2){warns.push({type:'amber',msg:`Kombinasyon (${validCount}) yeterli ama çeşitlilik kısıtlı.`});}
    else{warns.push({type:'green',msg:`${validCount.toLocaleString()} geçerli kombinasyon. ${p.cols} kolon için yeterli.`});}
    if(out.active && scored.length){
      const reasonStats=summarizeOutlierReasons(scored.filter(x=>x.score>out.maxScore));
      if(reasonStats.length){warns.push({type:'blue',msg:`Uç skorunda en sık görülen nedenler: ${reasonStats.map(([r,c])=>r+' ('+c+')').join(', ')}.`});}
      warns.push({type:'purple',msg:`Uç kolon skoru aktif. Limit ${out.maxScore}; kalan aday ${outValid.length.toLocaleString()}, elenen ${outRejected.toLocaleString()}.`});
    }

    if(jaccardReport.bestCount>=p.cols){
      warns.push({type:'green',msg:`Jaccard/ortak sayı üretilebilirlik kontrolü geçti: ${jaccardReport.bestCount}/${p.cols} kolon seçilebiliyor.`});
    }else{
      warns.push({type:'red',msg:`Jaccard/ortak sayı ${jaccardAdvice.level}: ${jaccardReport.bestCount}/${p.cols} kolonda kaldı. Çözüm: ${jaccardAdvice.primaryAction}`});
      (jaccardAdvice.hints||[]).slice(0,2).forEach(h=>warns.push({type:'amber',msg:h}));
    }

    addFreqMaxFeasibilityWarnings(warns,p,jaccardReport);

    if(bannedPairs.size>0){
      warns.push({type:'purple',msg:`${bannedPairs.size} özel çift yasaklandı. Bu çiftler sadece o iki sayıya özel — adım bazlı kural değil.`});
    }
    if(isPrimeConstrained){
      warns.push({type:'blue',msg:`Asal kısıtı aktif. [${primesInPool.join(', ')}] yapısal olarak az geçer — bu normaldir.`});
    }
    const realLow=pool.filter(n=>activeNumbersForFreq.has(n)&&freq[n]<lowThr&&!(isPrimeConstrained&&PR.has(n)));
    if(realLow.length>0)warns.push({type:'amber',msg:`Düşük frekanslı aktif sayılar: ${realLow.map(n=>n+'('+freq[n]+')').join(', ')}`});

    lastAnalysisData.analysisWarnings=warns;
    lastAnalysisData.analysisBlockers=warns.filter(w=>w.type==='red');

    document.getElementById('warn-list').innerHTML=warns.map(w=>
      `<div class="warn-item"><div class="warn-dot ${w.type}"></div><div>${w.msg}</div></div>`
    ).join('');

    const badge=document.getElementById('score-badge');
    const effCount=effective.length;
    if(validCount===0){badge.textContent='Kritik';badge.className='score-badge score-bad';}
    else if(effCount<p.cols){badge.textContent='Yetersiz';badge.className='score-badge score-bad';}
    else if(jaccardReport.bestCount<p.cols){badge.textContent='Jaccard: '+jaccardAdvice.level;badge.className='score-badge score-bad';}
    else if(effCount<p.cols*2){badge.textContent='Sıkı';badge.className='score-badge score-warn';}
    else{badge.textContent='Dengeli';badge.className='score-badge score-ok';}

    renderFreqBars(freq,maxFreq,lowThr,isPrimeConstrained,activeNumbersForFreq);
    btn.textContent='Analiz Et ↗';btn.disabled=false;
  },30);
}

function renderFreqBars(freq,maxFreq,lowThr,isPrimeConstrained,activeSet){
  const area=document.getElementById('freq-area');
  let html=`<div class="freq-section"><div class="freq-section-title">Frekans dağılımı</div>
  <div style="display:flex;gap:16px;font-size:11px;color:var(--color-text-secondary);margin-bottom:8px;flex-wrap:wrap">
    <span style="display:flex;align-items:center;gap:4px"><span style="display:inline-block;width:10px;height:8px;border-radius:2px;background:#534AB7"></span>Normal</span>
    <span style="display:flex;align-items:center;gap:4px"><span style="display:inline-block;width:10px;height:8px;border-radius:2px;background:#EF9F27"></span>Asal kısıtı</span>
    <span style="display:flex;align-items:center;gap:4px"><span style="display:inline-block;width:10px;height:8px;border-radius:2px;background:#E24B4A"></span>Gerçek sorun</span>
    <span style="display:flex;align-items:center;gap:4px"><span style="display:inline-block;width:10px;height:8px;border-radius:2px;background:#9AA0A6"></span>Pasif / min muaf</span>
  </div>`;
  pool.forEach(n=>{
    const v=freq[n],pct=Math.round(v/maxFreq*100);
    const isPrime=PR.has(n);
    const isInactive=activeSet instanceof Set ? !activeSet.has(n) : false;
    const isPrimeLow=!isInactive&&isPrimeConstrained&&isPrime&&v<lowThr;
    const isRealLow=!isInactive&&!isPrimeLow&&v<lowThr;
    const barColor=isInactive?'#9AA0A6':isPrimeLow?'#EF9F27':isRealLow?'#E24B4A':'#534AB7';
    const flagText=isInactive?'min muaf':isPrimeLow?'asal kısıtı':isRealLow?'düşük ⚠':'';
    const flagClass=isInactive?'flag-low-prime':isPrimeLow?'flag-low-prime':isRealLow?'flag-low-real':'flag-ok';
    html+=`<div class="freq-row">
      <div class="freq-num">${n}</div>
      <div class="freq-badge ${isPrime?'fb-prime':'fb-normal'}">${isPrime?'★':''}</div>
      <div class="freq-bar-bg"><div class="freq-bar-fill" style="width:${pct}%;background:${barColor}"></div></div>
      <div class="freq-val">${v}</div>
      <div class="freq-pct">${pct}%</div>
      <div class="freq-flag ${flagClass}">${flagText}</div>
    </div>`;
  });
  html+='</div>';
  area.innerHTML=html;
}

/* REMOVED OLD buildPrompt */


// ─── v5.0 KOTA PAKETLERİ OVERRIDE ───
function sayisalTabloBolgesi(n){ return Math.ceil(n/10); } // 1–10=1, 11–20=2, ..., 81–90=9
function dikeyHatNo(n){ return ((n-1)%10)+1; } // 1,11,21... aynı hat; 10,20,30... aynı hat
function getSelectVal(id,def){const el=document.getElementById(id);return el?el.value:def;}
function hasBannedNeighborDiff(s, states, mode, groupFn){
  // v7.1 KESİN MANTIK: Aynı yatay/dikey hatta seçilen sayılar sıralanır;
  // yalnız arka arkaya gelen SEÇİLİ sayılar arasındaki fark kontrol edilir.
  // Arada başka seçili sayı varsa uçtaki iki sayı ayrıca kontrol edilmez.
  const groups={};
  s.forEach(n=>{const g=groupFn(n); if(!groups[g]) groups[g]=[]; groups[g].push(n);});
  for(const arr of Object.values(groups)){
    arr.sort((a,b)=>a-b);
    for(let i=0;i<arr.length-1;i++){
      const d=arr[i+1]-arr[i];
      if(states[d]==='yasak') return true;
    }
  }
  return false;
}
function getNumVal(id,def=0){ const el=document.getElementById(id); const v=el?parseFloat(el.value):NaN; return isNaN(v)?def:v; }
function getIntVal(id,def=0){ return Math.trunc(getNumVal(id,def)); }
function getBankoList(){
  const raw=(document.getElementById('p-banko')?.value||'').trim();
  if(!raw || raw.toUpperCase()==='YOK') return [];
  return [...new Set(raw.split(/[\s,;]+/).map(Number).filter(n=>n>0&&n<=gameMax()))].sort((a,b)=>a-b);
}
function renderQuotaBodies(){
  const oddBody=document.getElementById('odd-quota-body');
  if(oddBody && !oddBody.dataset.done){
    oddBody.innerHTML='';
    for(let odd=0; odd<=6; odd++){
      const even=6-odd, val=(odd===1?60:0);
      const tr=document.createElement('tr');
      tr.innerHTML=`<td>${odd}T / ${even}Ç</td><td><input class="count-in" type="number" id="p-oddq-${odd}" value="${val}" min="0" max="300" oninput="updateQuotaStatus()"></td>`;
      oddBody.appendChild(tr);
    }
    oddBody.dataset.done='1';
  }
  const regBody=document.getElementById('region-quota-body');
  if(regBody && !regBody.dataset.done){
    regBody.innerHTML='';
    for(let low=0; low<=6; low++){
      const high=6-low, val=(low===3?60:0);
      const tr=document.createElement('tr');
      tr.innerHTML=`<td>${low}D / ${high}Y</td><td><input class="count-in" type="number" id="p-regq-${low}" value="${val}" min="0" max="300" oninput="updateQuotaStatus()"></td>`;
      regBody.appendChild(tr);
    }
    regBody.dataset.done='1';
  }
}
function quotaTotal(list){ return list.reduce((a,q)=>a+(q.count||0),0); }
function getSumQuotas(){
  const out=[];
  for(let i=1;i<=4;i++){
    const min=getIntVal(`p-sumq-${i}-min`,0), max=getIntVal(`p-sumq-${i}-max`,0), count=getIntVal(`p-sumq-${i}-count`,0);
    if(count>0) out.push({idx:i,min,max,count,label:`${min}–${max}`});
  }
  return out;
}
function getOddQuotas(){
  const out=[]; const k=getIntVal('p-k',6);
  for(let odd=0;odd<=k;odd++){ const count=getIntVal(`p-oddq-${odd}`,0); if(count>0) out.push({odd,even:k-odd,count,label:`${odd}T/${k-odd}Ç`}); }
  return out;
}
function getRegionQuotas(){
  const out=[]; const k=getIntVal('p-k',6);
  for(let low=0;low<=k;low++){ const count=getIntVal(`p-regq-${low}`,0); if(count>0) out.push({low,high:k-low,count,label:`${low}D/${k-low}Y`}); }
  return out;
}
function setQuotaStatus(id,total,target){
  const el=document.getElementById(id); if(!el) return;
  el.className='quota-status';
  if(total===target){el.classList.add('ok'); el.textContent=`Toplam ${total}/${target} → UYGUN`;}
  else if(total<target){el.classList.add('bad'); el.textContent=`Toplam ${total}/${target} → ${target-total} kolon eksik`;}
  else {el.classList.add('bad'); el.textContent=`Toplam ${total}/${target} → ${total-target} kolon fazla`;}
}
function updateQuotaStatus(){
  const target=getIntVal('p-cols',60);
  setQuotaStatus('sumq-status',quotaTotal(getSumQuotas()),target);
  setQuotaStatus('oddq-status',quotaTotal(getOddQuotas()),target);
  setQuotaStatus('regionq-status',quotaTotal(getRegionQuotas()),target);
}
function updateEven(){ updateQuotaStatus(); }

function getParams(){
  renderQuotaBodies();
  const sumQuotas=getSumQuotas(), oddQuotas=getOddQuotas(), regionQuotas=getRegionQuotas();
  return {
    k:getIntVal('p-k',6),
    sumMin:sumQuotas.length?Math.min(...sumQuotas.map(q=>q.min)):0,
    sumMax:sumQuotas.length?Math.max(...sumQuotas.map(q=>q.max)):999,
    sumQuotas, oddQuotas, regionQuotas,
    bankoList:getBankoList(),
    primeMin:getIntVal('p-primemin',0), primeMax:getIntVal('p-primemax',1),
    dec:getIntVal('p-dec',2),
    freqMax:getIntVal('p-freqmax',36), freqMin:getIntVal('p-freqmin',2),
    cols:getIntVal('p-cols',60),
    jaccard:getNumVal('p-jaccard',0.6), maxCommon:getIntVal('p-maxcommon',4),
    packages:getPackageParams(),
    hMode:'neighbor',
    vMode:'neighbor',
  };
}
function comboMatchesQuota(c,p){
  const s=c.slice().sort((a,b)=>a-b);
  const sum=s.reduce((a,b)=>a+b,0), odd=s.filter(n=>n%2!==0).length, low=s.filter(n=>n<=regionSplit()).length;
  return p.sumQuotas.some(q=>sum>=q.min && sum<=q.max) &&
         p.oddQuotas.some(q=>odd===q.odd) &&
         p.regionQuotas.some(q=>low===q.low);
}
function checkCombo(combo,p){
  const s=combo.slice().sort((a,b)=>a-b);
  if(p.bankoList && p.bankoList.length && !p.bankoList.every(n=>s.includes(n))) return false;
  if(!comboMatchesQuota(s,p)) return false;
  const pc=s.filter(n=>PR.has(n)).length;
  if(pc<p.primeMin||pc>p.primeMax)return false;
  const tab={};
  for(const n of s){const d=sayisalTabloBolgesi(n);tab[d]=(tab[d]||0)+1;if(tab[d]>p.dec)return false;}
  const sset=new Set(s);
  if(hasBannedNeighborDiff(s, adjState, p.hMode||'neighbor', sayisalTabloBolgesi)) return false;
  if(hasBannedNeighborDiff(s, vertState, p.vMode||'neighbor', dikeyHatNo)) return false;
  for(let i=0;i<s.length;i++){
    for(let j=i+1;j<s.length;j++){
      if(bannedPairs.has(pairKey(s[i],s[j])))return false;
    }
    for(let step=1;step<=30;step++){
      const k2='arith_'+step+'_2',k3='arith_'+step+'_3';
      if(arithState[k2]==='yasak'&&sset.has(s[i]+step))return false;
      if(arithState[k3]==='yasak'&&sset.has(s[i]+step)&&sset.has(s[i]+step*2))return false;
    }
  }
  return true;
}

function getActiveNumbersFromCombos(combos){
  const active=new Set();
  (combos||[]).forEach(c=>c.forEach(n=>active.add(n)));
  return active;
}
function getActiveNumbersForFrequency(p){
  if(p && p.activeNumbers instanceof Set) return p.activeNumbers;
  // Analiz öncesi yaklaşık güvenli varsayım: banko olmayan havuz sayıları.
  const banko=new Set((p&&p.bankoList)||[]);
  return new Set(pool.filter(n=>!banko.has(n)));
}
function getInactiveNumbersForFrequency(p){
  const active=getActiveNumbersForFrequency(p);
  const banko=new Set((p&&p.bankoList)||[]);
  return pool.filter(n=>!banko.has(n) && !active.has(n));
}
function getRuleWarnings(p){
  const warns=[], target=p.cols;
  const st=quotaTotal(p.sumQuotas), ot=quotaTotal(p.oddQuotas), rt=quotaTotal(p.regionQuotas);
  if(st!==target) warns.push({type:'red',msg:`Toplam aralığı kota toplamı hedefle uyumsuz: ${st}/${target}.`});
  if(ot!==target) warns.push({type:'red',msg:`Tek/çift kota toplamı hedefle uyumsuz: ${ot}/${target}.`});
  if(rt!==target) warns.push({type:'red',msg:`Bölge kota toplamı hedefle uyumsuz: ${rt}/${target}.`});
  if(!p.sumQuotas.length) warns.push({type:'red',msg:'En az bir toplam aralığı paketi tanımlanmalı.'});
  if(!p.oddQuotas.length) warns.push({type:'red',msg:'En az bir tek/çift dağılımı tanımlanmalı.'});
  if(!p.regionQuotas.length) warns.push({type:'red',msg:'En az bir bölge dağılımı tanımlanmalı.'});
  p.sumQuotas.forEach(q=>{if(q.min>q.max) warns.push({type:'red',msg:`Toplam Paketi ${q.idx}: min (${q.min}) max değerinden (${q.max}) büyük.`});});
  if(p.primeMin>p.primeMax) warns.push({type:'red',msg:`Asal minimum (${p.primeMin}), asal maksimumdan (${p.primeMax}) büyük.`});
  const oddAvail=pool.filter(n=>n%2!==0).length, evenAvail=pool.filter(n=>n%2===0).length;
  p.oddQuotas.forEach(q=>{if(q.odd>oddAvail || q.even>evenAvail) warns.push({type:'red',msg:`${q.label} dağılımı havuzla mümkün değil. Havuzda tek ${oddAvail}, çift ${evenAvail}.`});});
  const lowAvail=pool.filter(n=>n<=regionSplit()).length, highAvail=pool.filter(n=>n>regionSplit()).length;
  p.regionQuotas.forEach(q=>{if(q.low>lowAvail || q.high>highAvail) warns.push({type:'red',msg:`${q.label} bölge dağılımı havuzla mümkün değil. Havuzda düşük ${lowAvail}, yüksek ${highAvail}.`});});
  const primes=pool.filter(n=>PR.has(n));
  if(primes.length<p.primeMin) warns.push({type:'red',msg:'Havuzdaki asal sayı adedi minimum asal kuralını karşılamıyor.'});
  const banko=p.bankoList||[];
  if(banko.length){
    const missing=banko.filter(n=>!pool.includes(n));
    if(missing.length) warns.push({type:'red',msg:`Banko sayılar havuzda yok: ${missing.join(', ')}.`});
    if(banko.length>p.k) warns.push({type:'red',msg:`Banko sayısı (${banko.length}) kolon boyutundan (${p.k}) büyük olamaz.`});
    warns.push({type:'purple',msg:`Banko sayılar frekans üst sınırından muaf kabul edilir; her seçilen kolonda bulunur: ${banko.join(', ')}.`});
  }
  const allowed=maxCommonAllowedByJaccard(p.k,p.jaccard);
  if(p.maxCommon>allowed) warns.push({type:'red',msg:`Jaccard ${p.jaccard} ile max ortak ${p.maxCommon} uyumsuz. Bu Jaccard sınırında fiili max ortak ${allowed} olur.`});
  if(p.packages && p.packages.active){
    const pt=packageTotal(p.packages);
    if(pt!==p.cols) warns.push({type:'red',msg:`Paket kolon toplamı hedefle uyumsuz: paket toplamı ${pt}, hedef kolon ${p.cols}.`});
    ['main','deep','risk'].forEach(key=>{const pk=p.packages[key]; if(!pk||pk.cols<=0)return; const allow=maxCommonAllowedByJaccard(p.k,pk.jaccard); if(pk.maxCommon>allow) warns.push({type:'red',msg:`${pk.name}: Jaccard ${pk.jaccard} ile max ortak ${pk.maxCommon} uyumsuz. Fiili max ortak ${allow} olur.`}); if(pk.t>p.k) warns.push({type:'red',msg:`${pk.name}: t seviyesi (${pk.t}) kolon boyutundan (${p.k}) büyük olamaz.`});});
  }
  const activeForFreq=getActiveNumbersForFrequency(p);
  const activeNonBanko=[...activeForFreq].filter(n=>!banko.includes(n));
  const nonBankoPool=activeNonBanko.length, nonBankoNeed=p.cols*Math.max(0,p.k-banko.length);
  if(nonBankoPool===0 && nonBankoNeed>0) warns.push({type:'red',msg:'Frekans kontrolü: banko dışı kullanılabilir aktif sayı yok; bu kurallarla kolon üretilemez.'});
  if(nonBankoNeed>nonBankoPool*p.freqMax) warns.push({type:'red',msg:`Frekans max kapasitesi yetersiz: aktif banko dışı ${nonBankoNeed} kullanım gerekiyor, kapasite ${nonBankoPool*p.freqMax}. Pasif sayılar kapasite hesabına katılmaz.`});
  if(nonBankoNeed<nonBankoPool*p.freqMin) warns.push({type:'red',msg:`Frekans min zorunluluğu fazla yüksek: aktif banko dışı toplam kullanım ${nonBankoNeed}, gereken minimum ${nonBankoPool*p.freqMin}. Pasif/muaf sayılar hesaba katılmaz.`});
  for(let d=1;d<=gameMax();d++){
    const globalState=adjState[d]||vertState[d]||null, k2='arith_'+d+'_2', k3='arith_'+d+'_3', ar2=arithState[k2], ar3=arithState[k3];
    if(globalState && arithTouched.has(k2) && ar2 && globalState!==ar2) warns.push({type:'red',msg:`Kural çakışması: Fark +${d} genel kuralda ${globalState.toUpperCase()}, aritmetik 2'li kuralda ${ar2.toUpperCase()}.`});
    if(ar2==='yasak' && ar3==='serbest') warns.push({type:'amber',msg:`Mantıksal uyarı: Adım +${d} için 2'li YASAK ama 3'lü SERBEST. 2'li yasaksa o 3'lü zaten oluşamaz.`});
  }
  return warns;
}
function getBlockingWarnings(p){ return getRuleWarnings(p).filter(w=>w.type==='red'); }
function quotaLinesSum(p){return p.sumQuotas.map(q=>`• ${q.min}–${q.max} toplam aralığı: ${q.count} kolon`).join('\n') || '• Toplam paketi tanımlanmadı';}
function quotaLinesOdd(p){return p.oddQuotas.map(q=>`• ${q.odd} tek / ${q.even} çift: ${q.count} kolon`).join('\n') || '• Tek/çift kotası tanımlanmadı';}
function quotaLinesRegion(p){return p.regionQuotas.map(q=>`• ${lowRegionLabel()}: ${q.low} sayı / ${highRegionLabel()}: ${q.high} sayı: ${q.count} kolon`).join('\n') || '• Bölge kotası tanımlanmadı';}
function buildPrompt(){
  const p=getParams();
  const banko=(p.bankoList&&p.bankoList.length)?p.bankoList.join(', '):'YOK';
  const jaccard=document.getElementById('p-jaccard').value, maxCommon=document.getElementById('p-maxcommon').value;
  const out=getOutlierParams(), pkg=getPackageParams();
  const primes=pool.filter(n=>PR.has(n)), lowPool=pool.filter(n=>n<=regionSplit()), highPool=pool.filter(n=>n>regionSplit());
  const adjLines=adjDiffs.map(d=>`• Fark = ${d} → ${adjState[d].toUpperCase()}`).join('\n');
  const vertLines=activeVertDiffs().map(d=>`• Fark = ${d} → ${vertState[d].toUpperCase()}`).join('\n');
  const arithEntries=Object.entries(arithState).filter(([,v])=>v==='yasak');
  let arithLines='• Tüm aritmetik diziler serbest';
  if(arithEntries.length){const byStep={}; arithEntries.forEach(([key])=>{const[,step,len]=key.split('_');if(!byStep[step])byStep[step]={};byStep[step][len]='YASAK';}); arithLines=Object.entries(byStep).map(([step,rules])=>`• Adım +${step}: 2'li: ${rules['2']||'SERBEST'}, 3'lü: ${rules['3']||'SERBEST'}`).join('\n');}
  let pairLines='• Özel çift yasağı yok';
  if(bannedPairs.size>0){const pairs=[...bannedPairs].sort().map(k=>`{${k.replace(',','–')}}`); pairLines=`• Aşağıdaki sayı çiftleri aynı kolonda KESİNLİKLE bulunamaz:\n`+pairs.map(p=>`  ${p} → sadece bu iki sayıya özel yasak, fark bazlı kural değildir`).join('\n');}
  let packageLines='• Paketli üretim modu: PASİF\n• Tüm kolonlar tek stratejiyle seçilecek.';
  if(pkg.active){const totalPkg=packageTotal(pkg); packageLines=`• Paketli üretim modu: AKTİF\n• Paket kolon toplamı: ${totalPkg} / ${p.cols}\n\n1) ANA DENGELİ PAKET\n• Kolon sayısı: ${pkg.main.cols}\n• Hedef: ${pkg.main.purpose}\n• Paket t seviyesi: ${pkg.main.t}\n• Paket Jaccard üst sınırı: ${pkg.main.jaccard}\n• Paket max ortak sayı: ${pkg.main.maxCommon}\n• Paket uç skor limiti: ${pkg.main.outMax}\n\n2) t=5 DESTEK / ÇEKİRDEK YOĞUNLAŞMA PAKETİ\n• Kolon sayısı: ${pkg.deep.cols}\n• Hedef: ${pkg.deep.purpose}\n• Paket t seviyesi: ${pkg.deep.t}\n• Paket Jaccard üst sınırı: ${pkg.deep.jaccard}\n• Paket max ortak sayı: ${pkg.deep.maxCommon}\n• Paket uç skor limiti: ${pkg.deep.outMax}\n\n3) KONTROLLÜ RİSK PAKETİ\n• Kolon sayısı: ${pkg.risk.cols}\n• Hedef: ${pkg.risk.purpose}\n• Paket t seviyesi: ${pkg.risk.t}\n• Paket Jaccard üst sınırı: ${pkg.risk.jaccard}\n• Paket max ortak sayı: ${pkg.risk.maxCommon}\n• Paket uç skor limiti: ${pkg.risk.outMax}\n\nPAKET KURALLARI:\n• Tüm paketlerde kesin kurallar aynen uygulanacak.\n• Aynı kolon iki pakette tekrar edilmeyecek.\n• Paketler tamamlandıktan sonra 60 kolonun tamamı birlikte frekans, Jaccard ve max ortak sayı son kontrolünden geçirilecek.\n• Paket adı, satır numarası veya açıklama çıktıya yazılmayacak.`;}
  return `KONU: Gelişmiş Sayı Analizi, Covering Design ve Optimizasyon ile Kolon Üretimi

ROLÜN:
Bir veri bilimci, kombinatorik uzmanı ve olasılık analisti gibi davran.
Bu rastgele üretim DEĞİLDİR. Tüm kurallar %100 uygulanacaktır.

════════════════════════════════════════
1. GİRDİLER
════════════════════════════════════════
• Oyun tipi                 : ${gameName()}
• Sayı Havuzu (v=${pool.length})   : [${pool.join(', ')}]
• Kolon Boyutu (k)         : ${p.k}
• Hedef Tutma Seviyesi (t) : ${document.getElementById('p-t').value}
• Üretilecek Kolon Sayısı  : ${p.cols}
• Banko Sayılar            : ${banko}
  → Asal sayılar  : [${primes.join(', ')}]
  → ${lowRegionLabel()} grubu    : [${lowPool.join(', ')}]
  → ${highRegionLabel()} grubu   : [${highPool.join(', ')}]

════════════════════════════════════════
2. KESİN KURALLAR
════════════════════════════════════════
• Asal Sayı Limiti : Minimum ${p.primeMin}, Maksimum ${p.primeMax} asal
• Banko sayılar varsa her kolonda bulunacak ve frekans üst sınırından muaf kabul edilecek.

════════════════════════════════════════
3. TOPLAM ARALIĞI KOTA PAKETLERİ
════════════════════════════════════════
${quotaLinesSum(p)}
NOT: Toplam paketleri birbirinden bağımsızdır; aralıkların üst üste binmesi çakışma değildir.

════════════════════════════════════════
4. TEK / ÇİFT DAĞILIM KOTASI
════════════════════════════════════════
${quotaLinesOdd(p)}

════════════════════════════════════════
5. BÖLGE DAĞILIM KOTASI
════════════════════════════════════════
${quotaLinesRegion(p)}

════════════════════════════════════════
6. SAYISAL TABLO BÖLGESİ FİLTRESİ
════════════════════════════════════════
• Aynı Sayısal Tablo Bölgesi : Kolonda maksimum ${p.dec} adet
• Grup yapısı: ${tableRegionLabels().join(', ')}

════════════════════════════════════════
7. YATAY FARK KURALI
════════════════════════════════════════
${adjLines}
Kontrol tipi: ${p.hMode==='neighbor'?'Sadece aynı Sayısal Tablo Bölgesi içinde arka arkaya gelen seçili sayılar kontrol edilecek.':'Farkı X olan tüm sayı çiftleri kontrol edilecek.'}
Örnek: 4-6-8 varsa komşu modda 4-6 ve 6-8 kontrol edilir; 4-8 ayrıca kontrol edilmez.

════════════════════════════════════════
8. DİKEY FARK KURALI
════════════════════════════════════════
${vertLines}
Kontrol tipi: ${p.vMode==='neighbor'?'Sadece aynı dikey hatta arka arkaya gelen seçili sayılar kontrol edilecek.':'Farkı X olan tüm sayı çiftleri kontrol edilecek.'}
Örnek: 10-30-50 varsa komşu modda 10-30 ve 30-50 kontrol edilir; 10-50 ayrıca kontrol edilmez.

════════════════════════════════════════
9. ÖZEL ÇİFT YASAĞI (SADECE BELİRTİLEN ÇİFTLER)
════════════════════════════════════════
${pairLines}
ÖNEMLI NOT: Bu bölümdeki yasaklar SADECE belirtilen iki sayıya özgüdür.

════════════════════════════════════════
10. ARİTMETİK DİZİ FİLTRESİ (TÜM ZİNCİRLER)
════════════════════════════════════════
${arithLines}
NOT: Bu kural aynı adımla giden TÜM zincirleri etkiler.

════════════════════════════════════════
11. FREKANS DENGESİ
════════════════════════════════════════
• Banko olmayan ve aktif kurallara göre kullanılabilir her sayı minimum ${p.freqMin}, maksimum ${p.freqMax} kolona girecek
• Tek/çift, asal, bölge, kota veya kesin kurallar nedeniyle hiç kullanılamayan sayılar minimum frekans şartından muaftır.
• Banko sayılar frekans üst sınırından muaftır.

════════════════════════════════════════
12. KOLONLAR ARASI BENZERLİK
════════════════════════════════════════
• Jaccard üst sınırı            : ${jaccard}
• Kolonlar arası max ortak sayı : ${maxCommon}

════════════════════════════════════════
13. UÇ KOLON KONTROLÜ
════════════════════════════════════════
• Uç kolon skor filtresi : ${out.active ? 'AKTİF' : 'PASİF'}
• Maksimum uç skor       : ${out.maxScore}
• Toplam merkez skoru    : ${out.centerActive ? 'AKTİF' : 'PASİF'}
• Aynı birler kontrolü   : ${out.unitActive ? 'AKTİF' : 'PASİF'} · maksimum ${out.unitMax} adet
• Gap kontrolü           : ${out.gapActive ? 'AKTİF' : 'PASİF'} · büyük sıçrama eşiği ≥ ${out.largeGap}, maksimum ${out.maxLarge} adet
• Mekanik kolon kontrolü : ${out.mechActive ? 'AKTİF' : 'PASİF'} · aynı fark tekrarı maksimum ${out.repeatMax}

════════════════════════════════════════
14. PAKETLİ ÜRETİM STRATEJİSİ
════════════════════════════════════════
${packageLines}

════════════════════════════════════════
15. MATEMATİKSEL MODEL
════════════════════════════════════════
• Covering Design: C(v=${pool.length}, k=${p.k}, t=${document.getElementById('p-t').value})
• Algoritma: Paketli Greedy — kesin kurallar → kota paketleri → uç skor filtresi → paket hedefleri → frekans/Jaccard dengesi

════════════════════════════════════════
16. ÜRETİM ÖNCESİ KONTROL
════════════════════════════════════════
[ ] Toplam kota paketleri toplamı ${p.cols} kolon ediyor mu?
[ ] Tek/çift kota toplamı ${p.cols} kolon ediyor mu?
[ ] Bölge kota toplamı ${p.cols} kolon ediyor mu?
[ ] Her kolon aktif kota paketlerinden en az bir toplam aralığına uyuyor mu?
[ ] Her kolon aktif tek/çift dağılım kotasına uyuyor mu?
[ ] Her kolon aktif bölge dağılım kotasına uyuyor mu?
[ ] Asal sayı ${p.primeMin}–${p.primeMax} aralığında mı?
[ ] Sayısal Tablo Bölgesi ≤ ${p.dec} mi?
[ ] Yasaklı ardışık/dikey farklar ve özel çiftler yok mu?
[ ] Kullanılabilir aktif sayılar ${p.freqMin}–${p.freqMax} kolon aralığında mı?
[ ] Kurallar nedeniyle kullanılamayan pasif sayılar frekans minimumundan muaf mı? Bankolar üst sınırdan muaf mı?
[ ] Jaccard ≤ ${jaccard}, ortak sayı ≤ ${maxCommon} mü?
[ ] Uç kolon skoru ${out.active ? 'aktifse her kolon ≤ '+out.maxScore+' mi?' : 'pasif mi?'}
Tüm maddeler geçilmeden kolon kabul edilmeyecek.

════════════════════════════════════════
17. ÇIKTI FORMATI
════════════════════════════════════════
• Her satır: ${p.k} sayı, TAB ile ayrılmış
• Toplam ${p.cols} satır, kod bloğu içinde
• Sayılar küçükten büyüğe sıralı · Satır numarası ekleme`;
}

let lastPrompt='';
function putPromptToScreen(prompt){
  const out=document.getElementById('prompt-output');
  const card=document.getElementById('prompt-output-card');
  if(out){ out.value=prompt; }
  if(card){ card.classList.add('show'); card.scrollIntoView({behavior:'smooth', block:'start'}); }
}
function selectPromptText(){
  const out=document.getElementById('prompt-output');
  if(out){ out.focus(); out.select(); }
}
function stripHtmlForAlert(txt){
  const div=document.createElement('div');
  div.innerHTML=String(txt||'');
  return (div.textContent||div.innerText||String(txt||'')).replace(/\s+/g,' ').trim();
}
function uniqueWarningList(list){
  const seen=new Set();
  const out=[];
  (list||[]).forEach(w=>{
    const msg=stripHtmlForAlert(w.msg||w);
    if(!msg || seen.has(msg)) return;
    seen.add(msg);
    out.push({type:w.type||'red', msg});
  });
  return out;
}
function showBlockingAlert(blockers){
  const clean=uniqueWarningList(blockers);
  const lines=[];
  lines.push('Kritik kural çakışması / uyumsuzluk var.');
  lines.push('');
  if(clean.length){
    lines.push('Düzeltilmesi gereken kırmızı uyarılar:');
    clean.slice(0,12).forEach((w,i)=>lines.push((i+1)+'. '+w.msg));
    if(clean.length>12) lines.push('... +' + (clean.length-12) + ' uyarı daha var.');
  }else{
    lines.push('Analiz panelinde kırmızı uyarı var, ama ayrıntı alınamadı. Analiz Et panelini kontrol et.');
  }
  lines.push('');
  lines.push('Önce bu maddeleri düzelt, sonra tekrar Prompt Oluştur.');
  alert(lines.join('\n'));
}
function buildAndSend(){
  const p=getParams();
  let blockers=getBlockingWarnings(p);
  // Analiz sonrası oluşan kırmızı uyarılar da dikkate alınır.
  if(lastAnalysisData && Array.isArray(lastAnalysisData.analysisBlockers)){
    blockers=blockers.concat(lastAnalysisData.analysisBlockers);
  }
  blockers=uniqueWarningList(blockers).filter(w=>w.type==='red');
  if(blockers.length){
    runAnalysis();
    showBlockingAlert(blockers);
    return;
  }
  lastPrompt=buildPrompt();
  putPromptToScreen(lastPrompt);
  navigator.clipboard.writeText(lastPrompt).then(()=>{
    alert('Prompt oluşturuldu ve panoya kopyalandı. Şimdi bana yapıştırabilirsin.');
  }).catch(()=>{
    alert('Prompt oluşturuldu. Aşağıdaki kutudan seçip kopyalayabilirsin.');
  });
}
function copyPrompt(){
  if(!lastPrompt) lastPrompt=buildPrompt();
  putPromptToScreen(lastPrompt);
  navigator.clipboard.writeText(lastPrompt).then(()=>{
    const b=document.getElementById('copybtn');
    b.textContent='Kopyalandı ✓';
    setTimeout(()=>b.textContent='Promptu kopyala',1800);
  });
}

// ─── OTOMATİK KAYIT / GERİ YÜKLEME ───
const SETTINGS_KEY='kolon_prompt_builder_v5_settings';
let autosaveTimer=null;
let autosaveReady=false;

function nowStamp(){
  const d=new Date();
  return d.toLocaleString('tr-TR',{hour12:false});
}
function updateAutosaveStatus(msg){
  const el=document.getElementById('autosave-status');
  if(el) el.textContent=msg;
}
function safeJsonParse(txt){
  try{return JSON.parse(txt)}catch(e){return null}
}
function serializableControls(){
  const controls={};
  document.querySelectorAll('input, textarea, select').forEach(el=>{
    if(!el.id) return;
    if(['elim-output','jacc-output','prompt-output','settings-import-file'].includes(el.id)) return;
    if(el.type==='file') return;
    if(el.type==='checkbox') controls[el.id]={type:'checkbox',checked:!!el.checked};
    else controls[el.id]={type:el.tagName.toLowerCase(),value:el.value};
  });
  return controls;
}
function collectSettingsState(){
  return {
    appVersion:'v6.8-final',
    savedAt:new Date().toISOString(),
    controls:serializableControls(),
    globals:{
      adjState:{...adjState},
      vertState:{...vertState},
      arithState:{...arithState},
      arithTouched:[...arithTouched],
      bannedPairs:[...bannedPairs],
      currentPairFilter,
      pairSearchVal
    }
  };
}
function saveSettingsNow(silent=false){
  try{
    const state=collectSettingsState();
    localStorage.setItem(SETTINGS_KEY,JSON.stringify(state));
    updateAutosaveStatus('Kaydedildi: '+nowStamp());
    if(!silent) alert('Ayarlar kaydedildi.');
    return true;
  }catch(e){
    updateAutosaveStatus('Kayıt başarısız');
    if(!silent) alert('Ayarlar kaydedilemedi. Tarayıcı depolama izni/kotası engelliyor olabilir.');
    return false;
  }
}
function scheduleAutosave(){
  if(!autosaveReady) return;
  clearTimeout(autosaveTimer);
  autosaveTimer=setTimeout(()=>saveSettingsNow(true),350);
}
function manualSaveSettings(){ saveSettingsNow(false); }
try{ window.scheduleAutoSave = scheduleAutosave; }catch(e){}
function loadSavedSettingsRaw(){
  try{return safeJsonParse(localStorage.getItem(SETTINGS_KEY)||'')}catch(e){return null}
}
function applySavedGlobalState(state){
  if(!state||!state.globals) return;
  const g=state.globals;
  if(g.adjState) Object.keys(g.adjState).forEach(k=>{ if(k in adjState) adjState[k]=g.adjState[k]; });
  if(g.vertState) Object.keys(g.vertState).forEach(k=>{ if(k in vertState) vertState[k]=g.vertState[k]; });
  if(g.arithState){ Object.keys(arithState).forEach(k=>delete arithState[k]); Object.assign(arithState,g.arithState); }
  if(Array.isArray(g.arithTouched)){ arithTouched.clear(); g.arithTouched.forEach(x=>arithTouched.add(x)); }
  if(Array.isArray(g.bannedPairs)){ bannedPairs.clear(); g.bannedPairs.forEach(x=>bannedPairs.add(x)); }
  if(g.currentPairFilter) currentPairFilter=g.currentPairFilter;
  if(typeof g.pairSearchVal==='string') pairSearchVal=g.pairSearchVal;
}
function applySavedControls(state){
  if(!state||!state.controls) return;
  Object.entries(state.controls).forEach(([id,data])=>{
    const el=document.getElementById(id);
    if(!el||!data) return;
    if(el.type==='checkbox') el.checked=!!data.checked;
    else if('value' in data) el.value=data.value;
  });
}
function restoreSettingsIfAny(){
  const state=loadSavedSettingsRaw();
  if(!state){ updateAutosaveStatus('Henüz kayıt yok'); return null; }
  applySavedGlobalState(state);
  return state;
}
function finishRestoreControls(state){
  if(!state) return;
  applySavedControls(state);
  const search=document.getElementById('pair-search');
  if(search && state.globals && typeof state.globals.pairSearchVal==='string') search.value=state.globals.pairSearchVal;
  updateAutosaveStatus('Geri yüklendi: '+(state.savedAt?new Date(state.savedAt).toLocaleString('tr-TR',{hour12:false}):nowStamp()));
}
function initAutosaveListeners(){
  autosaveReady=true;
  document.addEventListener('input',scheduleAutosave,true);
  document.addEventListener('change',scheduleAutosave,true);
  document.addEventListener('click',()=>setTimeout(scheduleAutosave,0),true);
  window.addEventListener('beforeunload',()=>{ try{saveSettingsNow(true)}catch(e){} });
}
function exportSettingsJson(){
  const state=collectSettingsState();
  const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;
  a.download='kolon_prompt_builder_ayar_yedegi_'+new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')+'.json';
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  saveSettingsNow(true);
}
function importSettingsJson(input){
  const file=input.files&&input.files[0];
  if(!file) return;
  const reader=new FileReader();
  reader.onload=()=>{
    const state=safeJsonParse(reader.result);
    if(!state||!state.controls){ alert('Bu dosya geçerli bir ayar yedeği gibi görünmüyor.'); input.value=''; return; }
    localStorage.setItem(SETTINGS_KEY,JSON.stringify(state));
    alert('Ayar yedeği yüklendi. Sayfa şimdi yeniden açılacak.');
    location.reload();
  };
  reader.readAsText(file,'utf-8');
}
function clearSavedSettings(){
  if(!confirm('Kayıtlı ayarları silmek istiyor musun? Bu işlem mevcut sayfadaki değerleri değiştirmez; sadece tarayıcı kaydını temizler.')) return;
  localStorage.removeItem(SETTINGS_KEY);
  updateAutosaveStatus('Kayıt sıfırlandı');
  alert('Kayıt temizlendi. Yeni ayar girersen tekrar otomatik kaydedilir.');
}

const __savedSettings=restoreSettingsIfAny();
buildToggleRows(adjDiffs,adjState,'adj-rules');
buildToggleRows(activeVertDiffs(),vertState,'vert-rules');
renderQuotaBodies();
finishRestoreControls(__savedSettings);
updateGameLabels();
buildToggleRows(activeVertDiffs(),vertState,'vert-rules');
parsePool();updateEven();updateQuotaStatus();renderPairGrid();updateBannedSummary();
initAutosaveListeners();
if(!__savedSettings) saveSettingsNow(true);



/* === v5.7.1 Katlanabilir Bölümler === */
(function(){
  function titleOf(card){
    const t=card.querySelector('.card-title');
    return t ? t.textContent.trim() : '';
  }
  function makeToolbar(){
    const app=document.querySelector('.app');
    if(!app || document.querySelector('.v55-topbar')) return;
    const bar=document.createElement('div');
    bar.className='v55-topbar';
    bar.innerHTML='<span class="label">Hızlı görünüm</span>'+
      '<button type="button" class="v55-chip" data-action="all-open">Tümünü aç</button>'+
      '<button type="button" class="v55-chip" data-action="all-close">Tümünü kapat</button>'+
      '<button type="button" class="v55-chip" data-action="main-open">Sadece ana girişleri aç</button>'+
      '<button type="button" class="v55-chip" data-action="reports-open">Raporları aç</button>';
    const anchor=document.querySelector('.persist-panel') || app.firstElementChild;
    app.insertBefore(bar, anchor);
    bar.addEventListener('click',function(e){
      const btn=e.target.closest('[data-action]'); if(!btn) return;
      const cards=[...document.querySelectorAll('.card')];
      const action=btn.getAttribute('data-action');
      if(action==='all-open') cards.forEach(c=>setCollapsed(c,false));
      if(action==='all-close') cards.forEach(c=>setCollapsed(c,true));
      if(action==='reports-open') cards.forEach(c=>{
        const t=titleOf(c).toLowerCase();
        setCollapsed(c, !(t.includes('raporu')||t.includes('eleme')));
      });
      if(action==='main-open') cards.forEach(c=>{
        const t=titleOf(c).toLowerCase();
        const keep=['sayı havuzu','temel parametre','toplam aralığı','tek / çift','alt / üst','benzerlik','paketli üretim'];
        setCollapsed(c, !keep.some(k=>t.includes(k)));
      });
    });
  }
  function setCollapsed(card, collapsed){
    card.classList.toggle('v55-collapsed', !!collapsed);
    const btn=card.querySelector(':scope > .card-head .v55-toggle');
    if(btn) btn.setAttribute('aria-expanded', collapsed?'false':'true');
  }
  function wrapCard(card){
    if(card.dataset.v55Ready==='1') return;
    const head=card.querySelector(':scope > .card-head');
    if(!head) return;
    const body=document.createElement('div');
    body.className='v55-card-body';
    let n=head.nextSibling;
    const toMove=[];
    while(n){ const next=n.nextSibling; toMove.push(n); n=next; }
    toMove.forEach(x=>body.appendChild(x));
    card.appendChild(body);
    const toggle=document.createElement('span');
    toggle.className='v55-toggle';
    toggle.setAttribute('role','button');
    toggle.setAttribute('tabindex','0');
    toggle.setAttribute('aria-expanded','true');
    toggle.innerHTML='<span class="txt-open">Aç</span><span class="txt-close">Gizle</span>';
    head.appendChild(toggle);
    function doToggle(e){
      if(e && e.target.closest('input,textarea,select,button,a,.pill,.filter-btn,.v55-toggle')){
        if(!e.target.closest('.v55-toggle')) return;
      }
      setCollapsed(card,!card.classList.contains('v55-collapsed'));
    }
    head.addEventListener('click',doToggle);
    head.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); doToggle(e); } });
    card.dataset.v55Ready='1';
  }
  function init(){
    makeToolbar();
    const cards=[...document.querySelectorAll('.card')];
    cards.forEach(wrapCard);
    const defaultOpen=['Sayı havuzu','Temel parametreler','Kural','Jaccard Üretilebilirlik'];
    cards.forEach(c=>{
      const t=titleOf(c);
      const open=defaultOpen.some(x=>t.includes(x));
      setCollapsed(c,!open);
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else setTimeout(init,0);
})();


/* v6.8 FINAL BİRLEŞİK PATCH
   Ana iskelet: eski çalışan analiz motoru. Bu patch sadece öncelik, prompt, geometri, tema ve dar aday davranışını düzeltir. */
(function(){
  'use strict';
  const $ = id => document.getElementById(id);
  const val = (id,def='') => ($(id) && $(id).value!==undefined ? $(id).value : def);
  const intVal = (id,def=0) => { const n=parseInt(val(id,def),10); return Number.isFinite(n)?n:def; };
  const numVal = (id,def=0) => { const n=parseFloat(val(id,def)); return Number.isFinite(n)?n:def; };
  const chk = id => !!($(id)&&$(id).checked);

  function coord(n){ return {row:Math.floor((n-1)/10), col:(n-1)%10}; }
  function sameRow(a,b){ return coord(a).row===coord(b).row; }
  function sameCol(a,b){ return coord(a).col===coord(b).col; }
  function isDiagStep(a,b,step){
    const A=coord(a), B=coord(b);
    return B.row===A.row+1 && ((step===9 && B.col===A.col-1) || (step===11 && B.col===A.col+1));
  }
  function groupBy(arr,fn){ const m={}; arr.forEach(x=>{ const k=fn(x); (m[k]||(m[k]=[])).push(x); }); return Object.values(m); }
  function hasBannedGeometricDiff(sorted,state,mode,lineFn){
    // v7.1 KESİN MANTIK: Aynı 9x10 kupon hattındaki seçili sayılar sıralanır;
    // yalnız arka arkaya gelen SEÇİLİ sayılar arasındaki fark kontrol edilir.
    // Örn. 62-64-70 için sadece 62-64 ve 64-70 kontrol edilir; 62-70 kontrol edilmez.
    const groups=groupBy(sorted,lineFn);
    for(const g of groups){
      g.sort((a,b)=>a-b);
      for(let i=0;i<g.length-1;i++){ const d=g[i+1]-g[i]; if(state[d]==='yasak') return true; }
    }
    return false;
  }
  function diagonalThreshold(step){
    const id = step===9 ? 'p-diag9-min' : 'p-diag11-min';
    const v = intVal(id,2);
    return v<=0 ? 0 : v;
  }
  function hasDiagonalChain(sorted, step, minLen){
    if(!minLen || minLen<2) return false;
    const set=new Set(sorted);
    for(const n of sorted){
      let len=1, cur=n;
      while(set.has(cur+step) && isDiagStep(cur,cur+step,step)){ len++; cur+=step; if(len>=minLen) return true; }
    }
    return false;
  }
  function comboMatchesQuotaV68(c,p){
    const s=c.slice().sort((a,b)=>a-b);
    const sum=s.reduce((a,b)=>a+b,0);
    const odd=s.filter(n=>n%2!==0).length;
    const low=s.filter(n=>n<=regionSplit()).length;
    const sumOk=!p.sumQuotas || !p.sumQuotas.length || p.sumQuotas.some(q=>sum>=q.min && sum<=q.max);
    const oddOk=!p.oddQuotas || !p.oddQuotas.length || p.oddQuotas.some(q=>odd===q.odd);
    const regionOk=!p.regionQuotas || !p.regionQuotas.length || p.regionQuotas.some(q=>low===q.low);
    return sumOk && oddOk && regionOk;
  }
  window.checkCombo=function(combo,p){
    const s=combo.slice().sort((a,b)=>a-b);
    if(p.bankoList && p.bankoList.length && !p.bankoList.every(n=>s.includes(n))) return false;
    if(!comboMatchesQuotaV68(s,p)) return false;
    const pc=s.filter(n=>PR.has(n)).length;
    if(pc<p.primeMin||pc>p.primeMax) return false;
    const tab={};
    for(const n of s){ const d=sayisalTabloBolgesi(n); tab[d]=(tab[d]||0)+1; if(tab[d]>p.dec) return false; }
    // Yatay sadece gerçek 9x10 satırında; dikey sadece gerçek sütunda çalışır.
    if(hasBannedGeometricDiff(s, adjState, p.hMode||'neighbor', n=>coord(n).row)) return false;
    if(hasBannedGeometricDiff(s, vertState, p.vMode||'neighbor', n=>coord(n).col)) return false;
    for(let i=0;i<s.length;i++) for(let j=i+1;j<s.length;j++){ if(bannedPairs.has(pairKey(s[i],s[j]))) return false; }
    if(hasDiagonalChain(s,9,diagonalThreshold(9))) return false;
    if(hasDiagonalChain(s,11,diagonalThreshold(11))) return false;
    return true;
  };

  // ═══════════════════════════════════════════════════════
  // v7.13 — checkComboDetailed: hangi kurala takıldığını açıklar
  // ═══════════════════════════════════════════════════════
  window.checkComboDetailed = function(combo, p) {
    const s = combo.slice().sort((a, b) => a - b);
    const reasons = [];

    // 1. Banko kontrolü
    if (p.bankoList && p.bankoList.length) {
      const missing = p.bankoList.filter(n => !s.includes(n));
      if (missing.length) {
        reasons.push({ kural: 'Banko Sayı', detay: `Kolonda bulunması gereken banko sayılar eksik: [${missing.join(', ')}]`, engel: true });
        return reasons;
      }
    }

    // 2. Kota (toplam/tek-çift/bölge)
    if (!comboMatchesQuotaV68(s, p)) {
      const sum = s.reduce((a, b) => a + b, 0);
      const odd = s.filter(n => n % 2 !== 0).length;
      const low = s.filter(n => n <= regionSplit()).length;
      let kotaDetay = [];
      if (p.sumQuotas && p.sumQuotas.length && !p.sumQuotas.some(q => sum >= q.min && sum <= q.max))
        kotaDetay.push(`Toplam ${sum} — izin verilen aralıkların dışında [${p.sumQuotas.map(q=>q.min+'-'+q.max).join(', ')}]`);
      if (p.oddQuotas && p.oddQuotas.length && !p.oddQuotas.some(q => odd === q.odd))
        kotaDetay.push(`Tek sayı adedi ${odd} — izin verilenler: [${p.oddQuotas.map(q=>q.odd).join(', ')}]`);
      if (p.regionQuotas && p.regionQuotas.length && !p.regionQuotas.some(q => low === q.low))
        kotaDetay.push(`Alt bölge adedi ${low} — izin verilenler: [${p.regionQuotas.map(q=>q.low).join(', ')}]`);
      reasons.push({ kural: 'Kota / Dağılım', detay: kotaDetay.join(' | ') || 'Toplam/tek-çift/bölge kotası dışında', engel: true });
      return reasons;
    }

    // 3. Asal sayı limiti
    const pc = s.filter(n => PR.has(n)).length;
    if (pc < p.primeMin || pc > p.primeMax) {
      reasons.push({ kural: 'Asal Sayı Limiti', detay: `Kolonda ${pc} asal var (${s.filter(n=>PR.has(n)).join(', ')||'yok'}), izin verilen: min ${p.primeMin} — max ${p.primeMax}`, engel: true });
      return reasons;
    }

    // 4. Sayısal tablo bölgesi
    const tab = {};
    for (const n of s) {
      const d = sayisalTabloBolgesi(n); tab[d] = (tab[d] || 0) + 1;
      if (tab[d] > p.dec) {
        const grpNums = s.filter(x => sayisalTabloBolgesi(x) === d);
        reasons.push({ kural: 'Sayısal Tablo Bölgesi', detay: `Bölge ${d} (${(d-1)*10+1}–${d*10}) içinde ${tab[d]} sayı var: [${grpNums.join(', ')}], izin verilen max: ${p.dec}`, engel: true });
        return reasons;
      }
    }

    // 5. Yatay fark
    const rowGroups = {};
    s.forEach(n => { const r = coord(n).row; (rowGroups[r] = rowGroups[r] || []).push(n); });
    for (const r of Object.keys(rowGroups)) {
      const g = rowGroups[r].sort((a, b) => a - b);
      for (let i = 0; i < g.length - 1; i++) {
        const d = g[i+1] - g[i];
        if (adjState[d] === 'yasak') {
          reasons.push({ kural: 'Yatay Fark', detay: `Sayı ${g[i]} → ${g[i+1]}: fark +${d} yasak (aynı yatay satırda arka arkaya seçili)`, engel: true });
          return reasons;
        }
      }
    }

    // 6. Dikey fark
    const colGroups = {};
    s.forEach(n => { const c = coord(n).col; (colGroups[c] = colGroups[c] || []).push(n); });
    for (const c of Object.keys(colGroups)) {
      const g = colGroups[c].sort((a, b) => a - b);
      for (let i = 0; i < g.length - 1; i++) {
        const d = g[i+1] - g[i];
        if (vertState[d] === 'yasak') {
          reasons.push({ kural: 'Dikey Fark', detay: `Sayı ${g[i]} → ${g[i+1]}: fark +${d} yasak (aynı dikey sütunda arka arkaya seçili)`, engel: true });
          return reasons;
        }
      }
    }

    // 7. Özel çift yasağı
    for (let i = 0; i < s.length; i++) {
      for (let j = i + 1; j < s.length; j++) {
        if (bannedPairs.has(pairKey(s[i], s[j]))) {
          reasons.push({ kural: 'Özel Çift Yasağı', detay: `[${s[i]}, ${s[j]}] çifti özel olarak yasaklanmış`, engel: true });
          return reasons;
        }
      }
    }

    // 8. Çapraz zincir +9 ve +11
    for (const step of [9, 11]) {
      const minLen = diagonalThreshold(step);
      if (!minLen || minLen < 2) continue;
      const set = new Set(s);
      for (const n of s) {
        let len = 1, cur = n;
        const chain = [n];
        while (set.has(cur + step) && isDiagStep(cur, cur + step, step)) {
          cur += step; len++; chain.push(cur);
          if (len >= minLen) {
            reasons.push({
              kural: `Çapraz Zincir +${step}`,
              detay: `[${chain.join('→')}] — ${len}'li +${step} çapraz zincir bulundu (yasak eşiği: ${minLen}'li ve üzeri yasak). ` +
                     `Bu sayılar 9×10 kuponda satır+1/sütun${step===9?'-1':'+1'} yönünde gerçek çapraz hat oluşturuyor.`,
              engel: true
            });
            return reasons;
          }
        }
      }
    }

    reasons.push({ kural: '✅ Tüm Kurallar Geçildi', detay: 'Bu kombinasyon aktif kesin kuralların tamamından geçiyor.', engel: false });
    return reasons;
  };

  function targetCols(p){ return p.packages&&p.packages.active ? packageTotal(p.packages) : p.cols; }
  function packageList(p){
    if(!p.packages || !p.packages.active) return [{key:'general', name:'Genel üretim', cols:p.cols, t:p.t||intVal('p-t',4), jaccard:p.jaccard, maxCommon:p.maxCommon, outMax:getOutlierParams().maxScore, purpose:'Tek strateji'}];
    return [p.packages.main,p.packages.deep,p.packages.risk].filter(x=>x && x.cols>0);
  }
  function similarityOkLocal(a,b,j,maxC){
    const inter=a.filter(x=>b.includes(x)).length;
    const union=a.length+b.length-inter;
    return inter<=maxC && (union ? inter/union : 0)<=j;
  }
  function tryOrderLocal(items, target, j, maxC){
    const selected=[];
    outer: for(const it of items){
      for(const s of selected){ if(!similarityOkLocal(it.combo,s.combo,j,maxC)) continue outer; }
      selected.push(it); if(selected.length>=target) break;
    }
    return selected;
  }
  window.jaccardFeasibilityCheck=function(scoredItems,p){
    const base=scoredItems.map((x,idx)=>({combo:x.combo.slice().sort((a,b)=>a-b), score:x.score||0, idx, sum:comboSum(x.combo), reasons:x.reasons||[]}));
    const target=targetCols(p);
    if(!base.length) return {bestCount:0,target,ok:false,selected:[],trials:[],status:'Aday yok',packageDetails:[]};
    const freq={}; pool.forEach(n=>freq[n]=0); base.forEach(it=>it.combo.forEach(n=>freq[n]=(freq[n]||0)+1));
    base.forEach(it=>{ it.rarity=it.combo.reduce((a,n)=>a+(1/Math.max(1,freq[n])),0); it.centerDist=Math.abs(it.sum-(((p.sumMin||0)+(p.sumMax||0))/2)); });
    function makeOrders(items){
      const orders=[
        ['uç skor düşük', items.slice().sort((a,b)=>a.score-b.score || b.rarity-a.rarity)],
        ['nadir sayı dengesi', items.slice().sort((a,b)=>b.rarity-a.rarity || a.score-b.score)],
        ['toplam merkeze yakın', items.slice().sort((a,b)=>a.centerDist-b.centerDist || a.score-b.score)],
        ['orijinal aday sırası', items.slice()],
        ['toplam düşükten yükseğe', items.slice().sort((a,b)=>a.sum-b.sum || a.score-b.score)],
        ['toplam yüksekten düşeğe', items.slice().sort((a,b)=>b.sum-a.sum || a.score-b.score)]
      ];
      for(let seed=1;seed<=12;seed++) orders.push([`deterministik deneme ${seed}`, items.slice().sort((a,b)=>(deterministicHash(a.idx,seed)+a.score/250)-(deterministicHash(b.idx,seed)+b.score/250))]);
      return orders;
    }
    if(!(p.packages&&p.packages.active)){
      let best=[], bestName='', trials=[];
      for(const [name,order] of makeOrders(base)){ const sel=tryOrderLocal(order,p.cols,p.jaccard,p.maxCommon); trials.push({name,count:sel.length}); if(sel.length>best.length){best=sel;bestName=name;} if(sel.length>=p.cols) break; }
      return {bestCount:best.length,target:p.cols,ok:best.length>=p.cols,selected:best,bestName,stats:selectedSimilarityStats(best,p),trials:trials.sort((a,b)=>b.count-a.count).slice(0,8),status:best.length>=p.cols?'Uygun':'Yetersiz'};
    }
    const chosen=[]; const used=new Set(); const details=[];
    for(const pkg of packageList(p)){
      const candidates=base.filter(it=>!used.has(it.combo.join('-')) && (it.score||0)<=pkg.outMax);
      let best=[], bestName='', trials=[];
      for(const [name,order0] of makeOrders(candidates)){ const order=order0.filter(it=>!used.has(it.combo.join('-'))); const sel=tryOrderLocal(order,pkg.cols,pkg.jaccard,pkg.maxCommon); trials.push({name,count:sel.length}); if(sel.length>best.length){best=sel;bestName=name;} if(sel.length>=pkg.cols) break; }
      best.slice(0,pkg.cols).forEach(it=>{it.packageName=pkg.name; used.add(it.combo.join('-')); chosen.push(it);});
      details.push({name:pkg.name,target:pkg.cols,selected:Math.min(best.length,pkg.cols),bestName,jaccard:pkg.jaccard,maxCommon:pkg.maxCommon,outMax:pkg.outMax,trials});
    }
    return {bestCount:chosen.length,target,ok:chosen.length>=target,selected:chosen,bestName:'paket bazlı seçim',stats:selectedSimilarityStats(chosen,{maxCommon:99,jaccard:1}),trials:details.map(d=>({name:d.name,count:d.selected})),status:chosen.length>=target?'Uygun':'Yetersiz',packageDetails:details};
  };

  window.renderJaccardReport=function(){
    const out=$('jacc-output'); if(!out) return;
    const r=lastAnalysisData&&lastAnalysisData.jaccardReport; const p=lastAnalysisData&&lastAnalysisData.params;
    if(!r||!p){ out.value='Önce Analiz Et butonuna bas.'; return; }
    const advice=lastAnalysisData.jaccardAdvice||buildJaccardSuggestionReport(r.bestCount,r.target,p.jaccard,p.maxCommon,lastAnalysisData.outValidCount,lastAnalysisData.validCount);
    if($('jacc-target')) $('jacc-target').textContent=r.target;
    if($('jacc-selected')) $('jacc-selected').textContent=r.bestCount;
    if($('jacc-status')) $('jacc-status').textContent=r.ok?'UYGUN':advice.level;
    const lines=[];
    lines.push('JACCARD / PAKET ÜRETİLEBİLİRLİK RAPORU');
    lines.push('---------------------------------------');
    lines.push(`Üretim modu              : ${p.packages&&p.packages.active?'PAKETLİ':'GENEL'}`);
    lines.push(`Hedef kolon sayısı       : ${r.target}`);
    lines.push(`Seçilebilen kolon sayısı : ${r.bestCount}`);
    lines.push(`Durum                    : ${r.ok?'UYGUN':advice.level}`);
    lines.push(`Kesin kurallardan geçen  : ${(lastAnalysisData.validCount||0).toLocaleString()}`);
    lines.push(`Uç filtreden sonra aday  : ${(lastAnalysisData.outValidCount||0).toLocaleString()}`);
    if(p.packages&&p.packages.active){
      lines.push(''); lines.push('Paket bazlı seçim:');
      (r.packageDetails||[]).forEach(d=>lines.push(`- ${d.name}: ${d.selected}/${d.target} · J≤${d.jaccard} · ortak≤${d.maxCommon} · uç≤${d.outMax}`));
      lines.push('Not: Paketli modda genel Jaccard / genel max ortak son kontrolü uygulanmaz; paket sınırları esas alınır.');
    }else{
      lines.push(`Genel Jaccard            : ${Number(p.jaccard).toFixed(2)}`);
      lines.push(`Genel max ortak          : ${p.maxCommon}`);
    }
    lines.push(`Seçilenlerde max ortak   : ${r.stats ? r.stats.maxCommon : '—'}`);
    lines.push(`Seçilenlerde max Jaccard : ${r.stats ? r.stats.maxJ.toFixed(3) : '—'}`);
    if(!r.ok){ lines.push(''); lines.push('ÖNERİ'); lines.push('-----'); lines.push(advice.primaryAction||'Kural sıkılığını veya paket değerlerini kontrol et.'); }
    lines.push(''); lines.push('Seçilen kolonlar:');
    (r.selected||[]).slice(0,200).forEach((it,i)=>lines.push(`${String(i+1).padStart(3,'0')} | ${it.packageName?it.packageName+' | ':''}${formatComboPlain(it.combo)} | skor:${it.score}`));
    out.value=lines.join('\n');
  };

  function buildQuotaLines(p){
    const sumLines=(p.sumQuotas&&p.sumQuotas.length)?p.sumQuotas.map(q=>`• ${q.min}–${q.max} toplam aralığı: ${q.count} kolon`).join('\n'):'• Toplam aralığı bilinçli kapalı / pasif';
    const oddLines=(p.oddQuotas&&p.oddQuotas.length)?p.oddQuotas.map(q=>`• ${q.odd} tek / ${p.k-q.odd} çift: ${q.count} kolon`).join('\n'):'• Tek/çift kotası bilinçli kapalı / pasif';
    const regLines=(p.regionQuotas&&p.regionQuotas.length)?p.regionQuotas.map(q=>`• 1–${regionSplit()}: ${q.low} sayı / ${regionSplit()+1}–${currentGameMax()}: ${q.high} sayı: ${q.count} kolon`).join('\n'):'• Bölge kotası bilinçli kapalı / pasif';
    return {sumLines,oddLines,regLines};
  }
  function stateLines(state,diffs){ return diffs.map(d=>`• Fark = ${d} → ${(state[d]||'serbest').toUpperCase()}`).join('\n'); }
  function diagText(step){
    const th=diagonalThreshold(step);
    if(!th) return `• +${step} çapraz ardışık: KAPALI`;
    const parts=[]; for(let i=2;i<=6;i++) parts.push(`${i}'li ${i>=th?'YASAK':'SERBEST'}`);
    return `• +${step} çapraz ardışık: ${parts.join(', ')}`;
  }
  function packagePromptLines(p){
    const pkg=p.packages;
    if(!(pkg&&pkg.active)) return '• Paketli üretim modu: PASİF\n• Temel Parametreler’deki genel kolon sayısı, genel t, genel Jaccard, genel max ortak ve genel uç skor geçerlidir.\n• Paket kartlarındaki değerler üretimde dikkate alınmayacaktır.';
    const total=packageTotal(pkg);
    const one=(title,x)=>`${title}\n• Kolon sayısı: ${x.cols}\n• Paket t seviyesi: ${x.t}\n• Paket Jaccard üst sınırı: ${x.jaccard}\n• Paket max ortak sayı: ${x.maxCommon}\n• Paket uç skor limiti: ${x.outMax}\n• Hedef: ${x.purpose}`;
    return `• Paketli üretim modu: AKTİF\n• Paket kolon toplamı: ${total}\n• Temel Parametreler’deki genel kolon sayısı, genel t seviyesi, genel Jaccard, genel max ortak ve genel uç skor DEVRE DIŞIDIR.\n\n1) ${one('ANA DENGELİ PAKET',pkg.main)}\n\n2) ${one('ÇEKİRDEK DESTEK PAKETİ',pkg.deep)}\n\n3) ${one('KONTROLLÜ RİSK PAKETİ',pkg.risk)}\n\nPAKET KURALLARI:\n• Tüm paketlerde aktif kesin kurallar aynen uygulanacak.\n• Aynı kolon iki pakette tekrar edilmeyecek.\n• Paketler tamamlandıktan sonra genel Jaccard / genel max ortak son kontrolü uygulanmayacak; her paket kendi Jaccard ve max ortak sınırıyla değerlendirilmiş kabul edilecek.\n• Paketler birleştirildikten sonra yalnızca tekrar eden kolon kontrolü ve genel frekans dengesi raporlanacak.\n• Paket adı, satır numarası veya açıklama çıktıya yazılmayacak.`;
  }
  window.buildPrompt=function(){
    const p=getParams(); const pkg=p.packages||getPackageParams(); const packActive=!!(pkg&&pkg.active); const target=packActive?packageTotal(pkg):p.cols;
    const banko=p.bankoList&&p.bankoList.length?p.bankoList.join(', '):'YOK';
    const primeList=pool.filter(n=>PR.has(n)); const split=regionSplit(); const lowList=pool.filter(n=>n<=split); const highList=pool.filter(n=>n>split);
    const q=buildQuotaLines(p);
    const activeRules=[];
    if(p.sumQuotas&&p.sumQuotas.length) activeRules.push('Toplam aralığı kota paketleri');
    if(p.oddQuotas&&p.oddQuotas.length) activeRules.push('Tek/çift dağılım kotası');
    if(p.regionQuotas&&p.regionQuotas.length) activeRules.push('Bölge dağılım kotası');
    activeRules.push('Asal sayı limiti','Sayısal tablo bölgesi','Yatay fark','Dikey fark','Çapraz zincir','Özel çift yasağı');
    const passive=[]; if(!(p.sumQuotas&&p.sumQuotas.length)) passive.push('Toplam aralığı'); if(!(p.oddQuotas&&p.oddQuotas.length)) passive.push('Tek/çift kotası'); if(!(p.regionQuotas&&p.regionQuotas.length)) passive.push('Bölge kotası');
    const banned=[...bannedPairs].map(k=>k.split('-').map(Number).sort((a,b)=>a-b));
    const bannedLines=banned.length?'• Aşağıdaki sayı çiftleri aynı kolonda KESİNLİKLE bulunamaz:\n'+banned.map(a=>`  {${a[0]}–${a[1]}} → sadece bu iki sayıya özel yasak, fark bazlı kural değildir`).join('\n'):'• Özel çift yasağı yok';
    const out=getOutlierParams();
    const checker=chk('p-checker')?'\n════════════════════════════════════════\nCHECKER PROMPTU\n════════════════════════════════════════\nÜretilen kolonları yukarıdaki aktif kurallara göre denetle. Bilinçli kapatılan/pasif kuralları kontrol etme. Paketli üretim aktifse genel kolon/t/Jaccard/max ortak/uç skor değerlerini kontrol etme; paket değerlerini esas al. Yatay/dikey/çapraz kuralları sayı doğrusu farkına göre değil 9x10 kupon geometrisine göre denetle. Yatay/dikey kontrolde aynı hattaki tüm ikilileri değil, yalnız arka arkaya gelen seçili sayıların farklarını kontrol et. Her ihlali kolon ve ihlal nedeni ile raporla.':'';
    const prompt=`KONU: Gelişmiş Sayı Analizi, Covering Design ve Optimizasyon ile Kolon Üretimi\n\nROLÜN:\nBir veri bilimci, kombinatorik uzmanı ve olasılık analisti gibi davran.\nBu rastgele üretim DEĞİLDİR. Tüm aktif kesin kurallar %100 uygulanacaktır.\n\n════════════════════════════════════════\n1. GİRDİLER\n════════════════════════════════════════\n• Oyun tipi                 : 6/${currentGameMax()}\n• Sayı Havuzu (v=${pool.length})   : [${pool.join(', ')}]\n• Kolon Boyutu (k)         : ${p.k}\n• Hedef Tutma Seviyesi (t) : ${packActive?'PAKETLİ MODDA GENEL t DEVRE DIŞI; paket t değerleri geçerli':intVal('p-t',4)}\n• Üretilecek Kolon Sayısı  : ${target}${packActive?' (paket toplamı)':''}\n• Banko Sayılar            : ${banko}\n  → Asal sayılar  : [${primeList.join(', ')}]\n  → 1–${split} grubu    : [${lowList.join(', ')}]\n  → ${split+1}–${currentGameMax()} grubu   : [${highList.join(', ')}]\n\n════════════════════════════════════════\n1B. ÜRETİM MODU ÖNCELİĞİ\n════════════════════════════════════════\n• Üretim modu: ${packActive?'PAKETLİ ÜRETİM':'GENEL ÜRETİM'}.\n${packActive?'• Temel Parametreler’deki genel kolon sayısı, genel t seviyesi, genel Jaccard, genel max ortak ve genel uç skor DEVRE DIŞIDIR.\n• Geçerli değerler her paketin kendi kolon/t/Jaccard/max ortak/uç skor değerleridir.':'• Genel üretim modu aktif olduğu için Temel Parametreler’deki genel kolon/t/Jaccard/max ortak/uç skor değerleri geçerlidir.\n• Paket kartlarındaki değerler devre dışıdır.'}\n• Ortak kurallar iki modda da geçerlidir: toplam, tek/çift, bölge, asal, özel çift, yatay/dikey fark ve çapraz zincir.\n\nAKTİF / PASİF KURAL ÖZETİ\n• Aktif kesin kurallar: ${activeRules.join('; ')}\n• Optimizasyon / seçim önceliği: Frekans dengesi; Jaccard; max ortak; uç skor; geometrik kalite.\n• Bilinçli devre dışı / pasif kurallar: ${passive.length?passive.join('; '):'YOK'}\n• Kapalı/pasif kurallar üretimde uygulanmayacak ve eksik sayılmayacak.\n\nDAR ADAYDAN SEÇİM MODU\n• AKTİF; alt sınır hedef kolon sayısı, üst sınır 150.\n• Aktif kesin kurallar sonrası aday havuzu hedef kolon sayısı ile dar aday üst sınırı arasında kalırsa bu hata değildir.\n• Aday havuzu kurallar gevşetilerek gereksiz yere 300+ seviyesine şişirilmeyecek; en iyi hedef kolon sayısı seçilecektir.\n• Dar aday modunda Jaccard / max ortak / uç skor / frekans dengesi otomatik red sebebi değil, seçim önceliğidir.\n\n════════════════════════════════════════\n2. KESİN KURALLAR\n════════════════════════════════════════\n• Asal Sayı Limiti : Minimum ${p.primeMin}, Maksimum ${p.primeMax} asal\n• Banko sayılar varsa her kolonda bulunacak ve frekans üst sınırından muaf kabul edilecek.\n\n════════════════════════════════════════\n3. TOPLAM ARALIĞI KOTA PAKETLERİ\n════════════════════════════════════════\n${q.sumLines}\nNOT: Toplam paketleri birbirinden bağımsızdır; aralıkların üst üste binmesi çakışma değildir.\n\n════════════════════════════════════════\n4. TEK / ÇİFT DAĞILIM KOTASI\n════════════════════════════════════════\n${q.oddLines}\n\n════════════════════════════════════════\n5. BÖLGE DAĞILIM KOTASI\n════════════════════════════════════════\n${q.regLines}\n\n════════════════════════════════════════\n6. SAYISAL TABLO BÖLGESİ FİLTRESİ\n════════════════════════════════════════\n• Aynı Sayısal Tablo Bölgesi : Kolonda maksimum ${p.dec} adet\n• Grup yapısı: 1–10, 11–20, 21–30, 31–40, 41–50, 51–60${currentGameMax()>60?', 61–70, 71–80, 81–90':''}\n\n════════════════════════════════════════\n7. YATAY FARK KURALI\n════════════════════════════════════════\n${stateLines(adjState,adjDiffs)}\nKontrol tipi: Yalnız aynı yatay sayı dizilimi içinde arka arkaya gelen seçili sayılar kontrol edilir. Sayılar önce 9x10 kupon koordinatına çevrilir. Matematiksel fark tek başına yeterli değildir. Aynı yatay dizilimde olsalar bile arada başka seçili sayı varsa uçtaki iki sayı ayrıca kontrol edilmez. Örnek: 62-64-70 varsa sadece 62-64 ve 64-70 kontrol edilir; 62-70 ayrıca kontrol edilmez. Bu nedenle +8 yasak olsa bile 62-64-70 dizilimi, +2 ve +6 serbestse yatay kurala takılmaz. 14-22 fark 8 olsa bile farklı satırda olduğu için yatay kural işlemez.\n\n════════════════════════════════════════\n8. DİKEY FARK KURALI\n════════════════════════════════════════\n${stateLines(vertState,activeVertDiffs())}\nKontrol tipi: Yalnız aynı dikey sütun içinde ${p.vMode==='neighbor'?'arka arkaya gelen seçili sayılar':'tüm seçili çiftler'} kontrol edilir. Matematiksel fark tek başına yeterli değildir.\n\n════════════════════════════════════════\n9. ÖZEL ÇİFT YASAĞI\n════════════════════════════════════════\n${bannedLines}\nÖNEMLİ NOT: Bu bölümdeki yasaklar SADECE belirtilen iki sayıya özgüdür.\n\n════════════════════════════════════════\n10. ÇAPRAZ ARDIŞIK KURALI (+9 / +11)\n════════════════════════════════════════\n${diagText(9)}\n${diagText(11)}\nNOT: Bu kural genel +9/+11 farkını kontrol etmez. Sayılar 9x10 kupon koordinatına çevrilir; yalnız satır +1 ve sütun -1 veya satır +1 ve sütun +1 yönünde devam eden gerçek çapraz zincirler kontrol edilir. Örnek: 11-20 fark 9 olsa bile aynı yatay satırdadır; çapraz değildir ve çapraz kuraldan yasaklanmaz.\n\n════════════════════════════════════════\n11. OPTİMİZASYON / SEÇİM ÖNCELİĞİ\n════════════════════════════════════════\n• Frekans dengesi hedefi: Minimum ${p.freqMin}, Maksimum ${p.freqMax} kullanım.\n• Frekans dengesi, Jaccard, max ortak ve uç skor normal modda kalite sınırıdır; Dar Adaydan Seçim Modu devreye girerse otomatik red sebebi değil seçim önceliğidir.\n• Tek/çift, asal, bölge, kota veya kesin kurallar nedeniyle hiç kullanılamayan sayılar minimum frekans şartından muaftır.\n\n════════════════════════════════════════\n12. KOLONLAR ARASI BENZERLİK VE UÇ SKOR\n════════════════════════════════════════\n${packActive?`• Paketli üretim modu AKTİF olduğu için genel Jaccard / genel max ortak / genel uç skor DEVRE DIŞIDIR.\n• ${pkg.main.name}: Jaccard ≤ ${pkg.main.jaccard}, max ortak ≤ ${pkg.main.maxCommon}, uç skor ≤ ${pkg.main.outMax}\n• ${pkg.deep.name}: Jaccard ≤ ${pkg.deep.jaccard}, max ortak ≤ ${pkg.deep.maxCommon}, uç skor ≤ ${pkg.deep.outMax}\n• ${pkg.risk.name}: Jaccard ≤ ${pkg.risk.jaccard}, max ortak ≤ ${pkg.risk.maxCommon}, uç skor ≤ ${pkg.risk.outMax}`:`• Genel Jaccard üst sınırı: ${p.jaccard}\n• Genel max ortak sayı: ${p.maxCommon}\n• Genel uç skor limiti: ${out.active?'AKTİF · maksimum '+out.maxScore:'PASİF'}`}\n\n════════════════════════════════════════\n13. ÜRETİM STRATEJİSİ\n════════════════════════════════════════\n${packagePromptLines(p)}\n\n════════════════════════════════════════\n14. MATEMATİKSEL MODEL\n════════════════════════════════════════\n• Covering Design: C(v=${pool.length}, k=${p.k}, t=${packActive?'paket bazlı':intVal('p-t',4)})\n• Algoritma: Aktif kesin kurallar → kota paketleri → aday havuzu → optimizasyon/seçim öncelikleri → çıktı kontrolü\n\n════════════════════════════════════════\n15. ÜRETİM ÖNCESİ KONTROL\n════════════════════════════════════════\n[ ] Aktif toplam kota paketleri doğru mu?\n[ ] Aktif tek/çift dağılım kotası doğru mu?\n[ ] Aktif bölge dağılım kotası doğru mu?\n[ ] Asal sayı limiti doğru mu?\n[ ] Sayısal Tablo Bölgesi filtresi ≤ ${p.dec} mı?\n[ ] Yasaklı yatay/dikey komşu seçili fark, çapraz zincir ve özel çift ihlali yok mu?\n[ ] Paketli/genel üretim modu önceliği doğru uygulandı mı?\n[ ] Dar Adaydan Seçim Modu gerekiyorsa aday havuzu şişirilmeden en iyi ${target} kolon seçildi mi?\nTüm AKTİF KESİN KURALLAR geçilmeden kolon kabul edilmeyecek.\n\nDAR ADAYDAN SEÇİM MODU ÖNCELİĞİ:\n• Dar aday modu devreye girerse Jaccard / max ortak / uç skor / frekans dengesi otomatik red sebebi değil, seçim önceliğidir.\n• Aktif kesin kurallardan geçen aday havuzu hedef kolon sayısı ile dar aday üst sınırı arasında kalırsa üretim engellenmeyecek.\n• Aday havuzu kurallar gevşetilerek gereksiz yere 300+ seviyesine şişirilmeyecek.\n• Dar aday havuzundan en iyi hedef kolon sayısı seçilecek.\n\n════════════════════════════════════════\n16. ÇIKTI FORMATI\n════════════════════════════════════════\n• Her satır: 6 sayı, TAB ile ayrılmış\n• Toplam ${target} satır, kod bloğu içinde\n• Sayılar küçükten büyüğe sıralı · Satır numarası ekleme${checker}`;
    return prompt;
  };

  function installDiagonalUI(){
    const arith=[...document.querySelectorAll('.card')].find(c=>(c.querySelector('.card-title')?.textContent||'').toLowerCase().includes('aritmetik'));
    if(!arith || $('p-diag9-min')) return;
    const title=arith.querySelector('.card-title'); if(title) title.textContent='Çapraz zincir kuralı';
    const note=arith.querySelector('.card-note'); if(note) note.textContent='9x10 kupon geometrisi';
    const body=arith.querySelector('.v55-card-body')||arith;
    body.innerHTML=`<div class="section-note purple">Bu bölüm genel +9/+11 farkını değil, 9x10 loto kuponundaki gerçek çapraz zincirleri kontrol eder. Örnek: 11-20 fark 9 olsa bile aynı yatay satırdadır; çapraz sayılmaz.</div>
      <div class="row"><div class="row-lbl">+9 çapraz zincir<div class="row-sub">Örnek: 15-24-33-42-51</div></div><select class="num-in" id="p-diag9-min" style="width:190px"><option value="0">Kapalı</option><option value="2" selected>2'li ve üzeri yasak</option><option value="3">3'lü ve üzeri yasak</option><option value="4">4'lü ve üzeri yasak</option></select></div>
      <div class="row"><div class="row-lbl">+11 çapraz zincir<div class="row-sub">Örnek: 14-25-36-47-58</div></div><select class="num-in" id="p-diag11-min" style="width:190px"><option value="0">Kapalı</option><option value="2" selected>2'li ve üzeri yasak</option><option value="3">3'lü ve üzeri yasak</option><option value="4">4'lü ve üzeri yasak</option></select></div>`;
  }
  function installThemeUI(){
    if($('v68-theme')) return;
    const bar=document.querySelector('.v55-topbar') || document.querySelector('.app-header');
    if(!bar) return;
    const wrap=document.createElement('span');
    wrap.style.display='inline-flex'; wrap.style.alignItems='center'; wrap.style.gap='6px'; wrap.style.marginLeft='8px';
    wrap.innerHTML='<span class="label">Renk</span><select id="v68-theme" class="num-in" style="width:110px"><option value="red">Kırmızı</option><option value="blue">Mavi</option><option value="green">Yeşil</option><option value="orange">Turuncu</option></select>';
    bar.appendChild(wrap);
    const apply=t=>{ document.documentElement.setAttribute('data-theme',t); localStorage.setItem('v68-theme',t); };
    $('v68-theme').value=localStorage.getItem('v68-theme')||'red'; apply($('v68-theme').value);
    $('v68-theme').addEventListener('change',e=>apply(e.target.value));
  }
  function installDrawMap(){
    if($('draw-map-card')) return;
    const poolCard=[...document.querySelectorAll('.card')].find(c=>(c.querySelector('.card-title')?.textContent||'').toLowerCase().includes('sayı havuzu'));
    if(!poolCard) return;
    const card=document.createElement('div'); card.className='card'; card.id='draw-map-card';
    card.innerHTML=`<div class="card-head"><div class="step-dot new">H</div><span class="card-title">Çekiliş Haritası / Son 7 Çekiliş</span><span class="new-badge">Final</span><span class="card-note">havuz öneri yardımcısı</span></div>
    <div class="section-note purple">Son 15 çekilişi 9x10 kupon yerleşiminde işaretle. Tekrar eden sayılar ve komşuluk yoğunlukları raporlanır; önerilenleri havuza ekleyebilirsin.</div>
    <div class="draw-tabs" id="draw-tabs"></div><div class="draw-map-toolbar"><button class="mini-btn" type="button" id="draw-clear-active">Aktif çekilişi temizle</button><button class="mini-btn" type="button" id="draw-clear-all">Tümünü temizle</button><button class="mini-btn" type="button" id="draw-analyze">Haritayı analiz et</button><button class="mini-btn" type="button" id="draw-add-selected">Seçilenleri havuza ekle</button><button class="mini-btn" type="button" id="draw-add-top">Önerilen 25'i havuza ekle</button></div>
    <div class="draw-grid" id="draw-grid"></div><div class="map-report-grid"><textarea id="draw-map-report" class="elim-output" readonly placeholder="Son 15 çekilişi işaretle, sonra Haritayı analiz et."></textarea><div id="map-suggestion-box" class="map-suggestion-box"></div></div>`;
    poolCard.parentNode.insertBefore(card,poolCard);
    let active=0; const draws=Array.from({length:7},()=>new Set()); let selected=new Set(); let suggestions=[];
    const max=()=>currentGameMax();
    function renderTabs(){ $('draw-tabs').innerHTML=draws.map((d,i)=>`<button type="button" class="draw-tab ${i===active?'active':''}" data-i="${i}">Ç${i+1} (${d.size})</button>`).join(''); }
    function renderGrid(){ const m=max(); let html=''; for(let n=1;n<=m;n++){ const cnt=draws.reduce((a,d)=>a+(d.has(n)?1:0),0); const cls=cnt>=3?' rep3':cnt===2?' rep2':cnt===1?' d1':''; html+=`<div class="draw-cell${cls}" data-n="${n}">${n}${cnt?`<span class="mini-count">${cnt}</span>`:''}</div>`; } $('draw-grid').innerHTML=html; }
    function analyze(){ const counts={}; draws.forEach(d=>d.forEach(n=>counts[n]=(counts[n]||0)+1)); suggestions=Object.keys(counts).map(Number).sort((a,b)=>(counts[b]-counts[a])||a-b); if(suggestions.length<25){ for(const n of pool){ if(!suggestions.includes(n)) suggestions.push(n); if(suggestions.length>=25) break; } } selected=new Set(suggestions.slice(0,25)); $('draw-map-report').value=`İşaretli farklı sayı: ${Object.keys(counts).length}\nTekrar edenler: ${Object.entries(counts).filter(([,c])=>c>1).map(([n,c])=>n+'('+c+')').join(', ')||'Yok'}\nÖnerilen ilk 25: ${suggestions.slice(0,25).join(', ')}`; renderSuggestions(); }
    function renderSuggestions(){ $('map-suggestion-box').innerHTML=suggestions.slice(0,40).map(n=>`<span class="map-chip ${selected.has(n)?'selected':''}" data-n="${n}">${n}<span class="score">${draws.reduce((a,d)=>a+(d.has(n)?1:0),0)}T</span></span>`).join('')||'<div class="elim-help">Analiz bekleniyor.</div>'; }
    function addNums(nums){ const cur=new Set(parseNumbers($('poolInput').value)); nums.forEach(n=>cur.add(n)); $('poolInput').value=[...cur].sort((a,b)=>a-b).join(', '); parsePool(); scheduleAutosave&&scheduleAutosave(); }
    card.addEventListener('click',e=>{ const tab=e.target.closest('.draw-tab'); if(tab){ active=+tab.dataset.i; renderTabs(); return; } const cell=e.target.closest('.draw-cell'); if(cell){ const n=+cell.dataset.n; draws[active].has(n)?draws[active].delete(n):draws[active].add(n); renderTabs(); renderGrid(); return; } const chip=e.target.closest('.map-chip'); if(chip){ const n=+chip.dataset.n; selected.has(n)?selected.delete(n):selected.add(n); renderSuggestions(); }});
    $('draw-clear-active').onclick=()=>{draws[active].clear();renderTabs();renderGrid();}; $('draw-clear-all').onclick=()=>{draws.forEach(d=>d.clear());renderTabs();renderGrid();$('draw-map-report').value='';$('map-suggestion-box').innerHTML='';}; $('draw-analyze').onclick=analyze; $('draw-add-selected').onclick=()=>addNums([...selected]); $('draw-add-top').onclick=()=>{ if(!suggestions.length) analyze(); addNums(suggestions.slice(0,25)); };
    renderTabs(); renderGrid();
  }
  function installCheckerOption(){
    if($('p-checker')) return;
    const promptCard=$('prompt-output')?.closest('.prompt-output-card');
    const anchor=promptCard || document.querySelector('.quick-guide');
    if(!anchor) return;
    const row=document.createElement('div'); row.className='section-note purple'; row.style.marginBottom='10px'; row.innerHTML='<label class="check-wrap"><input type="checkbox" id="p-checker" checked> Checker promptunu da ekle</label><div class="inline-help">Kolon üretildikten sonra aynı aktif kurallarla denetim yapabilmek için ek kontrol metni üretir.</div>';
    anchor.parentNode.insertBefore(row, anchor);
  }
  function patchPromptButtons(){
    document.querySelectorAll('button').forEach(b=>{ if((b.textContent||'').toLowerCase().includes('analiz et')) b.id=b.id||'analyze-btn'; });
  }
  function initPatch(){
    installDiagonalUI(); installThemeUI(); installDrawMap(); installCheckerOption(); patchPromptButtons();
    updateQuotaStatus&&updateQuotaStatus();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',initPatch); else setTimeout(initPatch,0);
})();


(function(){
  function el(id){ return document.getElementById(id); }
  function intVal(id, def){ const v=parseInt(el(id)?.value,10); return Number.isFinite(v)?v:def; }
  function numVal(id, def){ const v=parseFloat(el(id)?.value); return Number.isFinite(v)?v:def; }
  function boolVal(id){ return !!el(id)?.checked; }
  function maxGame(){ try{return typeof gameMax==='function'?gameMax():intVal('p-game',90);}catch(e){return intVal('p-game',90);} }
  function splitPoint(){ return maxGame()/2; }
  function targetCols(p){ return p?.packages?.active ? ((p.packages.main?.cols||0)+(p.packages.deep?.cols||0)+(p.packages.risk?.cols||0)) : (p.cols||intVal('p-cols',60)); }
  function bankoList(){ if(typeof getBankoList==='function') return getBankoList(); const t=el('p-banko')?.value||''; return (t.match(/\d+/g)||[]).map(Number).filter(n=>n>=1&&n<=maxGame()); }
  function outParams(){ return {active:boolVal('p-out-active'), max:intVal('p-out-max',40), center:boolVal('p-out-center'), unit:boolVal('p-out-unit-active'), unitMax:intVal('p-out-unitmax',2), gap:boolVal('p-out-gap-active'), largeGap:intVal('p-out-largegap',20), maxLarge:intVal('p-out-maxlarge',2), mech:boolVal('p-out-mech-active'), repeatMax:intVal('p-out-repeatmax',2)}; }
  function getP(){ try{return typeof getParams==='function'?getParams():{};}catch(e){return {}; } }
  function qLines(list, fn, passive){ return list&&list.length ? list.map(fn).join('\n') : '• '+passive+' bilinçli kapalı / pasif'; }
  function stateLines(state,diffs){ return diffs.map(d=>`• Fark = ${d} → ${String((state&&state[d])||'serbest').toUpperCase()}`).join('\n'); }
  function diagThreshold(step){ const v=intVal(step===9?'p-diag9-min':'p-diag11-min',2); return v<=0?0:v; }
  function diagLine(step){ const th=diagThreshold(step); if(!th) return `• +${step} çapraz ardışık: KAPALI`; const parts=[]; for(let i=2;i<=6;i++) parts.push(`${i}'li ${i>=th?'YASAK':'SERBEST'}`); return `• +${step} çapraz ardışık: ${parts.join(', ')}`; }
  function pairLines(){ try{ if(typeof bannedPairs==='undefined'||!bannedPairs.size) return '• Özel çift yasağı yok'; return '• Aşağıdaki sayı çiftleri aynı kolonda KESİNLİKLE bulunamaz:\n'+[...bannedPairs].map(k=>{const [a,b]=String(k).split(','); return `  {${a}–${b}} → sadece bu iki sayıya özel yasak, fark bazlı kural değildir`;}).join('\n'); }catch(e){return '• Özel çift yasağı yok';} }
  function pkgLine(title,x){ return `${title}\n• Kolon sayısı: ${x.cols}\n• Paket t seviyesi: ${x.t}\n• Paket Jaccard üst sınırı: ${x.jaccard}\n• Paket max ortak sayı: ${x.maxCommon}\n• Paket uç skor limiti: ${x.outMax}\n• Hedef: ${x.purpose}`; }
  function activePassiveText(p){ const active=[]; const passive=[]; if(p.sumQuotas&&p.sumQuotas.length) active.push('Toplam aralığı kota paketleri'); else passive.push('Toplam aralığı'); if(p.oddQuotas&&p.oddQuotas.length) active.push('Tek/çift dağılım kotası'); else passive.push('Tek/çift kotası'); if(p.regionQuotas&&p.regionQuotas.length) active.push('Bölge dağılım kotası'); else passive.push('Bölge kotası'); active.push('Asal sayı limiti','Sayısal tablo bölgesi','Yatay fark','Dikey fark','Çapraz zincir','Özel çift yasağı'); return {active:active.join('; '), passive:passive.length?passive.join('; '):'YOK'}; }
  function finalBuildPrompt(){
    const p=getP(); const pkg=p.packages || (typeof getPackageParams==='function'?getPackageParams():{active:false}); p.packages=pkg; const packActive=!!pkg.active; const target=targetCols(p); const gm=maxGame(); const split=splitPoint(); const banko=bankoList(); const primes=(pool||[]).filter(n=>PR&&PR.has(n)); const low=(pool||[]).filter(n=>n<=split); const high=(pool||[]).filter(n=>n>split); const out=outParams(); const ap=activePassiveText(p);
    const sumLines=qLines(p.sumQuotas,q=>`• ${q.min}–${q.max} toplam aralığı: ${q.count} kolon`,'Toplam aralığı');
    const oddLines=qLines(p.oddQuotas,q=>`• ${q.odd} tek / ${p.k-q.odd} çift: ${q.count} kolon`,'Tek/çift kotası');
    const regLines=qLines(p.regionQuotas,q=>`• 1–${split}: ${q.low} sayı / ${split+1}–${gm}: ${q.high} sayı: ${q.count} kolon`,'Bölge kotası');
    const modeBlock = packActive ? `• Üretim modu: PAKETLİ ÜRETİM.\n• Temel Parametreler’deki genel kolon sayısı, genel t seviyesi, genel Jaccard, genel max ortak ve genel uç skor DEVRE DIŞIDIR.\n• Geçerli değerler her paketin kendi kolon/t/Jaccard/max ortak/uç skor değerleridir.\n• Paket toplam hedef kolon: ${target}.` : `• Üretim modu: GENEL ÜRETİM.\n• Temel Parametreler’deki genel kolon sayısı, genel t seviyesi, genel Jaccard, genel max ortak ve genel uç skor geçerlidir.\n• Paket kartlarındaki değerler üretimde dikkate alınmaz.`;
    const similarityBlock = packActive ? `• Paketli üretim modu AKTİF olduğu için genel Jaccard / genel max ortak / genel uç skor DEVRE DIŞIDIR.\n• Ana Dengeli Paket: Jaccard ≤ ${pkg.main.jaccard}, max ortak ≤ ${pkg.main.maxCommon}, uç skor ≤ ${pkg.main.outMax}\n• Çekirdek Destek Paketi: Jaccard ≤ ${pkg.deep.jaccard}, max ortak ≤ ${pkg.deep.maxCommon}, uç skor ≤ ${pkg.deep.outMax}\n• Kontrollü Risk Paketi: Jaccard ≤ ${pkg.risk.jaccard}, max ortak ≤ ${pkg.risk.maxCommon}, uç skor ≤ ${pkg.risk.outMax}` : `• Genel Jaccard üst sınırı: ${p.jaccard}\n• Genel max ortak sayı: ${p.maxCommon}\n• Genel uç skor limiti: ${out.active?'AKTİF · maksimum '+out.max:'PASİF'}`;
    const strategyBlock = packActive ? `• Paketli üretim modu: AKTİF\n• Paket kolon toplamı: ${target}\n\n1) ${pkgLine('Ana Dengeli Paket',pkg.main)}\n\n2) ${pkgLine('Çekirdek Destek Paketi',pkg.deep)}\n\n3) ${pkgLine('Kontrollü Risk Paketi',pkg.risk)}\n\nPAKET KURALLARI:\n• Tüm paketlerde aktif kesin kurallar aynen uygulanacak.\n• Aynı kolon iki pakette tekrar edilmeyecek.\n• Paketler tamamlandıktan sonra genel Jaccard / genel max ortak son kontrolü uygulanmayacak; her paket kendi sınırıyla değerlendirilmiş kabul edilecek.\n• Paketler birleştirildikten sonra yalnızca tekrar eden kolon kontrolü ve frekans dengesi raporu yapılacak.\n• Paket adı, satır numarası veya açıklama çıktıya yazılmayacak.` : `• Paketli üretim modu: PASİF\n• Genel hedef kolon: ${target}\n• Genel t seviyesi: ${p.t||intVal('p-t',4)}\n• Genel Jaccard üst sınırı: ${p.jaccard}\n• Genel max ortak sayı: ${p.maxCommon}\n• Genel uç skor limiti: ${out.active?out.max:'PASİF'}`;
    const checker = boolVal('p-checker') ? `\n\n════════════════════════════════════════\nCHECKER PROMPTU\n════════════════════════════════════════\nÜretilen kolonları yukarıdaki aktif kurallara göre denetle. Bilinçli kapatılan kuralları kontrol etme. Paketli üretim aktifse genel kolon/t/Jaccard/max ortak/uç skor değerlerini kontrol etme; paket değerlerini esas al. Yatay/dikey/çapraz kuralları sayı doğrusu farkına göre değil 9x10 kupon geometrisine göre denetle. Yatay/dikey kontrolde aynı hattaki tüm ikilileri değil, yalnız arka arkaya gelen seçili sayıların farklarını kontrol et. Her ihlali kolon ve ihlal nedeni ile raporla.` : '';
    return `KONU: Gelişmiş Sayı Analizi, Covering Design ve Optimizasyon ile Kolon Üretimi\n\nROLÜN:\nBir veri bilimci, kombinatorik uzmanı ve olasılık analisti gibi davran.\nBu rastgele üretim DEĞİLDİR. Tüm aktif kesin kurallar %100 uygulanacaktır.\n\n════════════════════════════════════════\n1. GİRDİLER\n════════════════════════════════════════\n• Oyun tipi                 : 6/${gm}\n• Sayı Havuzu (v=${(pool||[]).length})   : [${(pool||[]).join(', ')}]\n• Kolon Boyutu (k)         : ${p.k}\n• Hedef Tutma Seviyesi (t) : ${packActive?'PAKETLİ MODDA GENEL t DEVRE DIŞI; paket t değerleri geçerli':(p.t||intVal('p-t',4))}\n• Üretilecek Kolon Sayısı  : ${target}${packActive?' (paket toplamı)':''}\n• Banko Sayılar            : ${banko.length?banko.join(', '):'YOK'}\n  → Asal sayılar  : [${primes.join(', ')}]\n  → 1–${split} grubu    : [${low.join(', ')}]\n  → ${split+1}–${gm} grubu   : [${high.join(', ')}]\n\n════════════════════════════════════════\n1B. ÜRETİM MODU ÖNCELİĞİ\n════════════════════════════════════════\n${modeBlock}\n• Ortak kurallar iki modda da geçerlidir: toplam, tek/çift, bölge, asal, özel çift, yatay/dikey fark ve çapraz zincir.\n\nAKTİF / PASİF KURAL ÖZETİ\n• Aktif kesin kurallar: ${ap.active}\n• Optimizasyon / seçim önceliği: Frekans dengesi; Jaccard; max ortak; uç skor; geometrik kalite.\n• Bilinçli devre dışı kurallar: ${ap.passive}\n• Kapalı/pasif kurallar üretimde uygulanmayacak ve eksik sayılmayacak.\n\nDAR ADAYDAN SEÇİM MODU\n• AKTİF; alt sınır ${target}, üst sınır 150.\n• Aktif kesin kurallar sonrası aday havuzu hedef kolon sayısı ile dar aday üst sınırı arasında kalırsa bu hata değildir.\n• Aday havuzu kurallar gevşetilerek gereksiz yere 300+ seviyesine şişirilmeyecek; en iyi hedef kolon sayısı seçilecektir.\n• Dar aday modunda Jaccard / max ortak / uç skor / frekans dengesi otomatik red sebebi değil, seçim önceliğidir.\n• Sıkı kural önceliği: AKTİF. Aktif kesin kurallar kullanıcı onayı olmadan gevşetilemez.\n\n════════════════════════════════════════\n2. KESİN KURALLAR\n════════════════════════════════════════\n• Asal Sayı Limiti : Minimum ${p.primeMin}, Maksimum ${p.primeMax} asal\n• Banko sayılar varsa her kolonda bulunacak ve frekans üst sınırından muaf kabul edilecek.\n\n════════════════════════════════════════\n3. TOPLAM ARALIĞI KOTA PAKETLERİ\n════════════════════════════════════════\n${sumLines}\nNOT: Toplam paketleri birbirinden bağımsızdır; aralıkların üst üste binmesi çakışma değildir.\n\n════════════════════════════════════════\n4. TEK / ÇİFT DAĞILIM KOTASI\n════════════════════════════════════════\n${oddLines}\n\n════════════════════════════════════════\n5. BÖLGE DAĞILIM KOTASI\n════════════════════════════════════════\n${regLines}\n\n════════════════════════════════════════\n6. SAYISAL TABLO BÖLGESİ FİLTRESİ\n════════════════════════════════════════\n• Aynı Sayısal Tablo Bölgesi : Kolonda maksimum ${p.dec} adet\n• Grup yapısı: 1–10, 11–20, 21–30, 31–40, 41–50, 51–60${gm===90?', 61–70, 71–80, 81–90':''}\n\n════════════════════════════════════════\n7. YATAY FARK KURALI\n════════════════════════════════════════\n${stateLines(adjState,[1,2,3,4,5,6,7,8,9])}\nKontrol tipi: Yalnız aynı yatay sayı dizilimi içinde arka arkaya gelen seçili sayılar kontrol edilir. Sayılar önce 9x10 kupon koordinatına çevrilir. Matematiksel fark tek başına yeterli değildir. Aynı yatay dizilimde olsalar bile arada başka seçili sayı varsa uçtaki iki sayı ayrıca kontrol edilmez. Örnek: 62-64-70 varsa sadece 62-64 ve 64-70 kontrol edilir; 62-70 ayrıca kontrol edilmez. Bu nedenle +8 yasak olsa bile 62-64-70 dizilimi, +2 ve +6 serbestse yatay kurala takılmaz. 14-22 fark 8 olsa bile farklı satırda olduğu için yatay kural işlemez.\n\n════════════════════════════════════════\n8. DİKEY FARK KURALI\n════════════════════════════════════════\n${stateLines(vertState,[10,20,30,40,50,60,70,80].filter(d=>d<gm))}\nKontrol tipi: Yalnız aynı dikey sayı dizilimi içinde arka arkaya gelen seçili sayılar kontrol edilir. Sayılar önce 9x10 kupon koordinatına çevrilir. Matematiksel fark tek başına yeterli değildir. Aynı dikey dizilimde olsalar bile arada başka seçili sayı varsa uçtaki iki sayı ayrıca kontrol edilmez. Örnek: 10-30-50 varsa sadece 10-30 ve 30-50 kontrol edilir; 10-50 ayrıca kontrol edilmez. Fark 20 olup aynı sütunda olmayan çiftler dikey kurala takılmaz.\n\n════════════════════════════════════════\n9. ÖZEL ÇİFT YASAĞI\n════════════════════════════════════════\n${pairLines()}\nÖNEMLİ NOT: Bu bölümdeki yasaklar SADECE belirtilen iki sayıya özgüdür.\n\n════════════════════════════════════════\n10. ÇAPRAZ ZİNCİR KURALI (+9 / +11)\n════════════════════════════════════════\n${diagLine(9)}\n${diagLine(11)}\nNOT: Bu kural genel +9/+11 farkını kontrol etmez. Sayılar 9x10 kupon koordinatına çevrilir; yalnız satır +1 ve sütun -1 veya satır +1 ve sütun +1 yönünde devam eden gerçek çapraz zincirler kontrol edilir. Örnek: 11-20 fark 9 olsa bile aynı yatay satırdadır; çapraz değildir ve çapraz kuraldan yasaklanmaz.\n\n════════════════════════════════════════\n11. OPTİMİZASYON / SEÇİM ÖNCELİĞİ\n════════════════════════════════════════\n• Frekans dengesi hedefi: Minimum ${p.freqMin}, Maksimum ${p.freqMax} kullanım.\n• Frekans dengesi, Jaccard, max ortak ve uç skor normal modda kalite sınırıdır; Dar Adaydan Seçim Modu devreye girerse otomatik red sebebi değil seçim önceliğidir.\n• Tek/çift, asal, bölge, kota veya kesin kurallar nedeniyle hiç kullanılamayan sayılar minimum frekans şartından muaftır.\n\n════════════════════════════════════════\n12. KOLONLAR ARASI BENZERLİK VE UÇ SKOR\n════════════════════════════════════════\n${similarityBlock}\n\n════════════════════════════════════════\n13. ÜRETİM STRATEJİSİ\n════════════════════════════════════════\n${strategyBlock}\n\n════════════════════════════════════════\n14. MATEMATİKSEL MODEL\n════════════════════════════════════════\n• Covering Design: C(v=${(pool||[]).length}, k=${p.k}, t=${packActive?'paket bazlı':(p.t||intVal('p-t',4))})\n• Algoritma: Aktif kesin kurallar → kota paketleri → aday havuzu → optimizasyon/seçim öncelikleri → çıktı kontrolü\n\n════════════════════════════════════════\n15. ÜRETİM ÖNCESİ KONTROL\n════════════════════════════════════════\n[ ] Aktif toplam kota paketleri doğru mu?\n[ ] Aktif tek/çift dağılım kotası doğru mu?\n[ ] Aktif bölge dağılım kotası doğru mu?\n[ ] Asal sayı limiti doğru mu?\n[ ] Sayısal Tablo Bölgesi filtresi ≤ ${p.dec} mı?\n[ ] Yasaklı yatay/dikey komşu seçili fark, çapraz zincir ve özel çift ihlali yok mu?\n[ ] Paketli/genel üretim modu önceliği doğru uygulandı mı?\n[ ] Dar Adaydan Seçim Modu gerekiyorsa aday havuzu şişirilmeden en iyi ${target} kolon seçildi mi?\nTüm AKTİF KESİN KURALLAR geçilmeden kolon kabul edilmeyecek.\n\nDAR ADAYDAN SEÇİM MODU ÖNCELİĞİ:\n• Dar aday modu devreye girerse Jaccard / max ortak / uç skor / frekans dengesi otomatik red sebebi değil, seçim önceliğidir.\n• Aktif kesin kurallardan geçen aday havuzu hedef kolon sayısı ile dar aday üst sınırı arasında kalırsa üretim engellenmeyecek.\n• Aday havuzu kurallar gevşetilerek gereksiz yere 300+ seviyesine şişirilmeyecek.\n• Dar aday havuzundan en iyi hedef kolon sayısı seçilecek.\n\n════════════════════════════════════════\n16. ÇIKTI FORMATI\n════════════════════════════════════════\n• Her satır: ${p.k} sayı, TAB ile ayrılmış\n• Toplam ${target} satır, kod bloğu içinde\n• Sayılar küçükten büyüğe sıralı · Satır numarası ekleme${checker}`;
  }
  window.buildPrompt = finalBuildPrompt;
  try { buildPrompt = finalBuildPrompt; } catch(e) {}
  window.buildAndSend = function(){
    if(typeof parsePool==='function') parsePool();
    const prompt=finalBuildPrompt();
    window.lastPrompt=prompt;
    if(typeof lastPrompt!=='undefined') { try{ lastPrompt=prompt; }catch(e){} }
    if(typeof putPromptToScreen==='function') putPromptToScreen(prompt); else { const out=el('prompt-output'); if(out) out.value=prompt; const card=el('prompt-output-card'); if(card) card.classList.add('show'); }
    if(navigator.clipboard) navigator.clipboard.writeText(prompt).then(()=>alert('Prompt oluşturuldu ve panoya kopyalandı.')).catch(()=>alert('Prompt oluşturuldu. Kutudan kopyalayabilirsin.'));
  };
  try { buildAndSend = window.buildAndSend; } catch(e) {}
  window.copyPrompt = function(){ const prompt=window.lastPrompt||finalBuildPrompt(); window.lastPrompt=prompt; if(typeof putPromptToScreen==='function') putPromptToScreen(prompt); if(navigator.clipboard) navigator.clipboard.writeText(prompt); };
  try { copyPrompt = window.copyPrompt; } catch(e) {}
})();


(function(){
  function $v70(id){ return document.getElementById(id); }
  function v70Bool(id, def){ const el=$v70(id); return el ? !!el.checked : !!def; }
  function v70Num(id, def){ const el=$v70(id); const v=el ? parseFloat(String(el.value).replace(',','.')) : NaN; return Number.isFinite(v) ? v : def; }
  function v70RiskSettings(){
    const packRiskCols = v70Num('p-pack-risk-cols', 8);
    return {
      active: v70Bool('p-risk-quota-active', true),
      minCols: v70Num('p-risk-min-cols', packRiskCols || 8),
      threshold: v70Num('p-risk-score-threshold', 14),
      mediumThreshold: Math.max(0, v70Num('p-risk-score-threshold', 14) - 5)
    };
  }
  function v70ReasonText(it){ return ((it && it.reasons) || []).join(' ').toLowerCase(); }
  function v70RiskClass(it, settings){
    const score = Number(it && it.score) || 0;
    const txt = v70ReasonText(it);
    const riskyWords = /(dağınık|daginik|aritmetik|uç|uc|gap|sıçrama|sicrama|mekanik|toplam sınırı|toplam hafif|risk)/i;
    if(score >= settings.threshold || riskyWords.test(txt)) return 'Riskli ama geçerli';
    if(score >= settings.mediumThreshold || ((it && it.reasons) || []).length >= 2) return 'Orta riskli';
    return 'Dengeli';
  }
  function v70Common(a,b){
    if(typeof commonCount === 'function') return commonCount(a,b);
    let c=0, set=new Set(a); for(const n of b){ if(set.has(n)) c++; } return c;
  }
  function v70SimilarityOk(a,b,k,j,maxCommon){
    const com=v70Common(a,b);
    if(com > maxCommon) return false;
    const jac=com/(k*2-com);
    return jac <= Number(j || 0.9) + 1e-9;
  }
  function v70AddBySimilarity(selected, candidates, count, cfg, selectedKeys){
    let added=0;
    outer: for(const it of candidates){
      if(added>=count) break;
      const key=it.combo.join('-');
      if(selectedKeys.has(key)) continue;
      // Paket içi benzerlik kontrolü: global son kontrol değil, seçildiği paket içindeki sınır.
      for(const s of selected.filter(x=>x._pkg===cfg.pkgName)){
        if(!v70SimilarityOk(it.combo, s.combo, cfg.k, cfg.jaccard, cfg.maxCommon)) continue outer;
      }
      const copy=Object.assign({}, it, {_pkg:cfg.pkgName, _riskClass:v70RiskClass(it, v70RiskSettings())});
      selected.push(copy); selectedKeys.add(key); added++;
    }
    return added;
  }
  function v70ComboSum(c){ return c.reduce((a,b)=>a+b,0); }
  function v70SelectedStats(selected,k){
    let maxCommon=0, maxJ=0;
    for(let i=0;i<selected.length;i++) for(let j=i+1;j<selected.length;j++){
      const com=v70Common(selected[i].combo, selected[j].combo);
      const jac=com/(k*2-com);
      if(com>maxCommon) maxCommon=com;
      if(jac>maxJ) maxJ=jac;
    }
    return {maxCommon, maxJ};
  }
  function v70RiskSummary(items, selected, settings){
    const countBy = arr => arr.reduce((m,it)=>{ const c=v70RiskClass(it, settings); m[c]=(m[c]||0)+1; return m; },{});
    const selBy = (selected||[]).reduce((m,it)=>{ const c=it._riskClass || v70RiskClass(it, settings); m[c]=(m[c]||0)+1; return m; },{});
    return {available: countBy(items||[]), selected: selBy, threshold: settings.threshold, minCols: settings.minCols, active: settings.active};
  }

  const oldJaccard = window.jaccardFeasibilityCheck || (typeof jaccardFeasibilityCheck !== 'undefined' ? jaccardFeasibilityCheck : null);
  window.jaccardFeasibilityCheck = function(scoredItems, p){
    const settings=v70RiskSettings();
    const pkg=p && p.packages;
    if(!settings.active || !pkg || !pkg.active || !Array.isArray(scoredItems) || !scoredItems.length){
      const base = oldJaccard ? oldJaccard(scoredItems,p) : {bestCount:0,target:(p&&p.cols)||0,ok:false,selected:[]};
      base.riskSummary = v70RiskSummary(scoredItems||[], base.selected||[], settings);
      return base;
    }
    const items=scoredItems.map((x,idx)=>({
      combo:(x.combo||x).slice().sort((a,b)=>a-b),
      score:Number(x.score)||0,
      idx,
      sum:v70ComboSum(x.combo||x),
      reasons:x.reasons||[]
    }));
    const target=(p&&p.cols)||((pkg.main.cols||0)+(pkg.deep.cols||0)+(pkg.risk.cols||0));
    const selected=[], keys=new Set();
    const classified=items.map(it=>Object.assign({},it,{_riskClass:v70RiskClass(it,settings)}));
    const balanced=classified.filter(it=>it._riskClass==='Dengeli').sort((a,b)=>a.score-b.score || Math.abs(a.sum-300)-Math.abs(b.sum-300));
    const medium=classified.filter(it=>it._riskClass==='Orta riskli').sort((a,b)=>a.score-b.score);
    const risky=classified.filter(it=>it._riskClass==='Riskli ama geçerli').sort((a,b)=>b.score-a.score || b.sum-a.sum);
    const allCleanFirst=classified.slice().sort((a,b)=>a.score-b.score || a.idx-b.idx);
    const allDiverse=classified.slice().sort((a,b)=>Math.abs(a.sum-300)-Math.abs(b.sum-300) || a.score-b.score);
    const k=(p&&p.k)||6;
    const cfgMain={pkgName:'Ana Dengeli Paket', k, jaccard:pkg.main.jaccard, maxCommon:pkg.main.maxCommon};
    const cfgDeep={pkgName:'Çekirdek Destek Paketi', k, jaccard:pkg.deep.jaccard, maxCommon:pkg.deep.maxCommon};
    const cfgRisk={pkgName:'Kontrollü Risk Paketi', k, jaccard:pkg.risk.jaccard, maxCommon:pkg.risk.maxCommon};
    const riskNeed=Math.min(settings.minCols||0, pkg.risk.cols||0, target);
    // Önce risk paketine gerçekten riskli ama geçerli adayları ayır.
    v70AddBySimilarity(selected, risky, riskNeed, cfgRisk, keys);
    // Riskli aday yeterli değilse orta risklilerle tamamla.
    if(selected.filter(x=>x._pkg===cfgRisk.pkgName).length < (pkg.risk.cols||0)){
      v70AddBySimilarity(selected, medium.slice().reverse(), (pkg.risk.cols||0)-selected.filter(x=>x._pkg===cfgRisk.pkgName).length, cfgRisk, keys);
    }
    // Ana ve destek paketlerini doldur.
    v70AddBySimilarity(selected, balanced.concat(medium), pkg.main.cols||0, cfgMain, keys);
    v70AddBySimilarity(selected, medium.concat(balanced, risky), pkg.deep.cols||0, cfgDeep, keys);
    // Risk paketi hâlâ eksikse tüm geçerli adaylardan tamamla.
    if(selected.filter(x=>x._pkg===cfgRisk.pkgName).length < (pkg.risk.cols||0)){
      v70AddBySimilarity(selected, risky.concat(medium,balanced), (pkg.risk.cols||0)-selected.filter(x=>x._pkg===cfgRisk.pkgName).length, cfgRisk, keys);
    }
    // Toplam 60 eksikse tüm adaylardan doldur, ama paket isimlerini 'Tamamlama' yap.
    if(selected.length < target){
      v70AddBySimilarity(selected, allCleanFirst.concat(allDiverse), target-selected.length, {pkgName:'Tamamlama',k,jaccard:pkg.risk.jaccard,maxCommon:pkg.risk.maxCommon}, keys);
    }
    const stats=v70SelectedStats(selected,k);
    const riskSummary=v70RiskSummary(classified,selected,settings);
    const riskSelected=selected.filter(x=>x._riskClass==='Riskli ama geçerli').length;
    return {
      bestCount:selected.length,
      target,
      ok:selected.length>=target,
      selected,
      bestName:'Riskli geçerli aday kotası + paket bazlı seçim',
      stats,
      riskSummary,
      trials:[
        {name:'Riskli geçerli aday kotası', count:riskSelected},
        {name:'Toplam seçilen', count:selected.length},
        {name:'Riskli aday havuzu', count:(riskSummary.available['Riskli ama geçerli']||0)},
        {name:'Orta riskli aday havuzu', count:(riskSummary.available['Orta riskli']||0)}
      ],
      status:selected.length>=target?'Uygun':'Yetersiz'
    };
  };
  try { jaccardFeasibilityCheck = window.jaccardFeasibilityCheck; } catch(e) {}

  // Jaccard raporuna risk sınıfı özetini ekle.
  const oldRenderJ = window.renderJaccardReport || (typeof renderJaccardReport !== 'undefined' ? renderJaccardReport : null);
  window.renderJaccardReport = function(){
    if(oldRenderJ) oldRenderJ();
    const out=$v70('jacc-output');
    const data=window.lastAnalysisData || (typeof lastAnalysisData!=='undefined' ? lastAnalysisData : null);
    const r=data && data.jaccardReport;
    if(!out || !r || !r.riskSummary) return;
    const rs=r.riskSummary;
    const a=rs.available||{}, s=rs.selected||{};
    const extra=[
      '',
      'RİSKLİ GEÇERLİ ADAY KOTASI',
      '────────────────────────────',
      `Risk kotası aktif        : ${rs.active?'EVET':'HAYIR'}`,
      `Risk skor eşiği          : ${rs.threshold}`,
      `Hedef riskli kolon       : ${rs.minCols}`,
      `Aday havuzunda dengeli   : ${a['Dengeli']||0}`,
      `Aday havuzunda orta risk : ${a['Orta riskli']||0}`,
      `Aday havuzunda riskli    : ${a['Riskli ama geçerli']||0}`,
      `Seçilen dengeli          : ${s['Dengeli']||0}`,
      `Seçilen orta risk        : ${s['Orta riskli']||0}`,
      `Seçilen riskli           : ${s['Riskli ama geçerli']||0}`,
      '',
      'Riskli ama geçerli adaylar aktif kesin kuralları ihlal etmediği sürece final seçim havuzunda korunur; Kontrollü Risk Paketi bu gruptan zorunlu pay alır.'
    ];
    if(!out.value.includes('RİSKLİ GEÇERLİ ADAY KOTASI')) out.value += '\n' + extra.join('\n');
  };
  try { renderJaccardReport = window.renderJaccardReport; } catch(e) {}

  // Prompt motoruna riskli geçerli aday kotası talimatını kilitle.
  const oldBuild = window.buildPrompt || (typeof buildPrompt !== 'undefined' ? buildPrompt : null);
  function v70RiskPromptBlock(){
    const st=v70RiskSettings();
    return `\n════════════════════════════════════════\n11B. GEÇERLİ ADAY HAVUZUNDAN FİNAL SEÇİM KURALI\n════════════════════════════════════════\n• Riskli ama geçerli aday kotası: ${st.active?'AKTİF':'PASİF'}\n• Riskli aday skor eşiği: ${st.threshold}\n• Final 60 kolon yalnızca en temiz/dengeli adaylardan seçilmeyecek.\n• Aktif kesin kuralları geçen adaylar üç sınıfa ayrılacak: Dengeli, Orta riskli, Riskli ama geçerli.\n• Kontrollü Risk Paketi için en az ${st.minCols} kolon riskli ama geçerli adaylardan seçilecek.\n• Bu gruba skor, gap, dağınıklık, aritmetik üçlü, toplam uca yakınlık veya geometrik kalite uyarısı olan ama aktif kesin kural ihlali yapmayan kolonlar girer.\n• Riskli ama geçerli adaylar kesin kural ihlali yapmadığı sürece final seçim havuzundan silinmeyecek.\n• Aday havuzu 60’tan büyük olduğunda seçim motoru 60 kolonu sadece düşük skorlu adaylardan değil; paketlerin risk amacına göre dağıtarak seçecek.\n`;
  }
  window.buildPrompt = function(){
    let s = oldBuild ? oldBuild() : '';
    const block=v70RiskPromptBlock();
    if(!s.includes('11B. GEÇERLİ ADAY HAVUZUNDAN FİNAL SEÇİM KURALI')){
      s=s.replace('\n════════════════════════════════════════\n12. KOLONLAR ARASI BENZERLİK VE UÇ SKOR', block+'\n════════════════════════════════════════\n12. KOLONLAR ARASI BENZERLİK VE UÇ SKOR');
    }
    s=s.replace('[ ] Dar Adaydan Seçim Modu gerekiyorsa aday havuzu şişirilmeden en iyi', '[ ] Riskli ama geçerli aday kotası uygulandı mı? Kontrollü Risk Paketi en temiz adaylardan değil riskli geçerli adaylardan pay aldı mı?\n[ ] Dar Adaydan Seçim Modu gerekiyorsa aday havuzu şişirilmeden en iyi');
    return s;
  };
  try { buildPrompt = window.buildPrompt; } catch(e) {}
  window.buildAndSend = function(){
    if(typeof parsePool==='function') parsePool();
    const prompt=window.buildPrompt();
    window.lastPrompt=prompt;
    try{ if(typeof lastPrompt!=='undefined') lastPrompt=prompt; }catch(e){}
    if(typeof putPromptToScreen==='function') putPromptToScreen(prompt); else { const out=$v70('prompt-output'); if(out) out.value=prompt; const card=$v70('prompt-output-card'); if(card) card.classList.add('show'); }
    if(navigator.clipboard) navigator.clipboard.writeText(prompt).then(()=>alert('Prompt oluşturuldu ve panoya kopyalandı.')).catch(()=>alert('Prompt oluşturuldu. Kutudan kopyalayabilirsin.'));
  };
  try { buildAndSend = window.buildAndSend; } catch(e) {}
  window.copyPrompt=function(){ const prompt=window.buildPrompt(); window.lastPrompt=prompt; try{ if(typeof lastPrompt!=='undefined') lastPrompt=prompt; }catch(e){} if(typeof putPromptToScreen==='function') putPromptToScreen(prompt); if(navigator.clipboard) navigator.clipboard.writeText(prompt); };
  try { copyPrompt=window.copyPrompt; } catch(e) {}
})();


(function(){
  'use strict';
  const $ = id => document.getElementById(id);

  function v72CleanNumbers(text){
    return String(text||'').split(/[^0-9]+/).map(x=>parseInt(x,10)).filter(n=>Number.isFinite(n)&&n>0&&n<=90);
  }
  function v72UniqueSorted(nums){ return Array.from(new Set(nums)).sort((a,b)=>a-b); }
  function v72Mode(){ return (($('p-work-mode')||{}).value || 'live'); }
  function v72ControlNumbers(){ return v72UniqueSorted(v72CleanNumbers(($('p-control-result')||{}).value||'')); }
  function v72Save(){ try{ if(typeof scheduleAutosave==='function') scheduleAutosave(); else if(typeof saveSettingsNow==='function') saveSettingsNow(true); }catch(e){} }

  function v72BuildCard(){
    if($('v72-mode-card')) return;
    const card=document.createElement('div');
    card.className='card';
    card.id='v72-mode-card';
    card.innerHTML=`
      <div class="card-head">
        <div class="step-dot new">M</div>
        <span class="card-title">Çalışma Modu</span>
        <span class="new-badge">v7.3.1</span>
        <span class="card-note">gerçek çekiliş / simülasyon ayrımı</span>
      </div>
      <div class="section-note purple">
        <b>Gerçek Çekiliş Üretimi:</b> Sonuç bilinmez; kontrol kolonu kullanılmaz. <br>
        <b>Simülasyon / Backtest:</b> Gerçek sonuç yalnızca sonradan kontrol ve kural kalibrasyonu için girilir; üretime zorunlu kolon olarak eklenmez.
      </div>
      <div class="row">
        <div class="row-lbl">Çalışma modu<div class="row-sub">Gerçek çekilişte kontrol sonucu istenmez. Backtestte girilen sonuç üretimi yönlendirmez.</div></div>
        <select class="num-in" id="p-work-mode" style="width:230px">
          <option value="live" selected>Gerçek Çekiliş Üretimi</option>
          <option value="backtest">Simülasyon / Backtest</option>
        </select>
      </div>
      <div class="row" id="v72-control-row" style="display:none">
        <div class="row-lbl">Gerçek sonuç / kontrol kolonu<div class="row-sub">Sadece backtest analizi içindir; promptta kesin üretilecek kolon olarak kullanılmaz.</div></div>
        <input class="num-in" id="p-control-result" placeholder="3 37 62 64 70 87" style="width:260px;text-align:left">
      </div>
      <div class="section-note" id="v72-mode-status">
        Mod: Gerçek Çekiliş Üretimi. Uygulama 6 bilen sayıyı istemez; sadece havuz ve kurallarla üretim yapar.
      </div>
    `;
    const quick=document.querySelector('.quick-guide');
    if(quick && quick.parentNode) quick.parentNode.insertBefore(card, quick.nextSibling);
    else { const app=document.querySelector('.app'); if(app) app.insertBefore(card, app.firstChild); }
    const mode=$('p-work-mode'), ctrl=$('p-control-result');
    if(mode){ mode.addEventListener('change',()=>{v72RefreshModeUI(); v72Save();}); }
    if(ctrl){ ctrl.addEventListener('input',()=>{v72RefreshModeUI(); v72Save();}); }
    v72RefreshModeUI();
  }

  function v72RefreshModeUI(){
    const mode=v72Mode();
    const row=$('v72-control-row');
    const status=$('v72-mode-status');
    if(row) row.style.display = mode==='backtest' ? 'flex' : 'none';
    if(status){
      if(mode==='backtest'){
        const nums=v72ControlNumbers();
        status.innerHTML = `Mod: <b>Simülasyon / Backtest</b>. Kontrol kolonu ${nums.length? '['+nums.join(', ')+']' : 'girilmedi'}. Bu sayılar üretime zorunlu kolon olarak eklenmeyecek; sadece analiz/kalibrasyon için kullanılacak.`;
      } else {
        status.innerHTML = 'Mod: <b>Gerçek Çekiliş Üretimi</b>. Uygulama 6 bilen sayıyı istemez; kontrol kolonu üretimde kullanılmaz.';
      }
    }
  }

  function v72ModePromptBlock(){
    const mode=v72Mode();
    const nums=v72ControlNumbers();
    if(mode==='backtest'){
      return `\n════════════════════════════════════════\n0. ÇALIŞMA MODU\n════════════════════════════════════════\n• Mod: SİMÜLASYON / BACKTEST.\n• Gerçek sonuç / kontrol kolonu: ${nums.length? '['+nums.join(', ')+']':'GİRİLMEDİ'}.\n• Bu kontrol kolonu üretime zorunlu kolon olarak EKLENMEYECEK.\n• Kontrol kolonu yalnızca üretimden sonra şu analizler için kullanılacak: aktif kesin kurallardan geçer mi, aday havuzunda var mı, risk/uç sonrası kalır mı, final seçime girer mi, seçilmediyse hangi seçim önceliği nedeniyle geride kalır.\n• Backtest bilgisi kolon üretimini hileli biçimde yönlendirmek için değil, kural kalibrasyonu ve geriye dönük başarı ölçümü için kullanılacaktır.\n`;
    }
    return `\n════════════════════════════════════════\n0. ÇALIŞMA MODU\n════════════════════════════════════════\n• Mod: GERÇEK ÇEKİLİŞ ÜRETİMİ.\n• Gerçek sonuç bilinmediği için kontrol kolonu istenmez ve kullanılmaz.\n• Üretim yalnızca sayı havuzu, aktif kesin kurallar, optimizasyon öncelikleri ve paket/genel seçim ayarlarına göre yapılacaktır.\n• Sistem kullanıcıdan 6 bilen sayıyı istemeyecek; simülasyon/backtest alanları gerçek çekiliş üretimine dahil edilmeyecektir.\n`;
  }

  function v72AppendCheckerSafety(s){
    if(!s.includes('CHECKER PROMPTU')) return s;
    const safety=' Backtest modunda girilen kontrol kolonunu üretilen kolonlara zorla ekleme; yalnızca kural geçişi ve final seçim durumu için raporla. Gerçek çekiliş modunda kontrol kolonu arama veya isteme.';
    if(s.includes(safety.trim())) return s;
    return s.replace(/(Her ihlali kolon ve ihlal nedeni ile raporla\.?)/, '$1'+safety);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', v72BuildCard); else v72BuildCard();

  const prevBuild = window.buildPrompt || (typeof buildPrompt !== 'undefined' ? buildPrompt : null);
  window.buildPrompt = function(){
    let s = prevBuild ? prevBuild() : '';
    const block = v72ModePromptBlock();
    if(!s.includes('0. ÇALIŞMA MODU')){
      s = s.replace('════════════════════════════════════════\n1. GİRDİLER', block+'\n════════════════════════════════════════\n1. GİRDİLER');
    }
    s = v72AppendCheckerSafety(s);
    return s;
  };
  try{ buildPrompt = window.buildPrompt; }catch(e){}

  window.buildAndSend = function(){
    try{ if(typeof parsePool==='function') parsePool(); }catch(e){}
    const prompt=window.buildPrompt();
    window.lastPrompt=prompt;
    try{ if(typeof lastPrompt!=='undefined') lastPrompt=prompt; }catch(e){}
    if(typeof putPromptToScreen==='function') putPromptToScreen(prompt);
    else { const out=$('prompt-output'); if(out) out.value=prompt; const card=$('prompt-output-card'); if(card) card.classList.add('show'); }
    if(navigator.clipboard) navigator.clipboard.writeText(prompt).then(()=>alert('Prompt oluşturuldu ve panoya kopyalandı.')).catch(()=>alert('Prompt oluşturuldu. Kutudan kopyalayabilirsin.'));
  };
  try{ buildAndSend=window.buildAndSend; }catch(e){}
  window.copyPrompt=function(){
    const prompt=window.buildPrompt(); window.lastPrompt=prompt;
    try{ if(typeof lastPrompt!=='undefined') lastPrompt=prompt; }catch(e){}
    if(typeof putPromptToScreen==='function') putPromptToScreen(prompt);
    const out=$('prompt-output'); if(out) out.value=prompt;
    if(navigator.clipboard) navigator.clipboard.writeText(prompt);
  };
  try{ copyPrompt=window.copyPrompt; }catch(e){}

  window.v72Mode = v72Mode;
  window.v72ControlNumbers = v72ControlNumbers;
})();


(function(){
  'use strict';
  const $ = id => document.getElementById(id);
  const fmt = c => (c||[]).slice().sort((a,b)=>a-b).join('-');
  const fmtTab = c => (c||[]).slice().sort((a,b)=>a-b).join('\t');
  function num(id, def){ const el=$(id); const v=el ? parseFloat(String(el.value).replace(',','.')) : NaN; return Number.isFinite(v) ? v : def; }
  function bool(id, def){ const el=$(id); return el ? !!el.checked : !!def; }
  function save(){ try{ if(typeof scheduleAutosave==='function') scheduleAutosave(); else if(typeof saveSettingsNow==='function') saveSettingsNow(true); }catch(e){} }

  function css(){
    if($('v73-css')) return;
    const st=document.createElement('style');
    st.id='v73-css';
    st.textContent=`
      .v73-mini-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-top:10px}
      .v73-mini-box{background:rgba(0,0,0,.18);border:1px solid var(--color-border-tertiary);border-radius:14px;padding:8px;text-align:center}
      .v73-mini-box .v{font-size:17px;font-weight:900;color:var(--color-text-primary)}
      .v73-mini-box .l{font-size:10px;color:var(--color-text-secondary);margin-top:2px;line-height:1.25}
      .v73-band-table{width:100%;border-collapse:collapse;font-size:12px;margin-top:8px}
      .v73-band-table th,.v73-band-table td{padding:6px;border-bottom:1px solid var(--color-border-tertiary);text-align:center}
      .v73-band-table th:first-child,.v73-band-table td:first-child{text-align:left}
      .v73-band-table input{width:70px;padding:5px 6px;border-radius:10px;border:1px solid var(--color-border-secondary);background:var(--color-background-secondary);color:var(--color-text-primary);text-align:center}
      .v73-ok{color:#7ff5bc!important}.v73-bad{color:#ff9fa8!important}.v73-warn{color:#ffd36f!important}
      @media(max-width:900px){.v73-mini-grid{grid-template-columns:repeat(2,1fr)}}
    `;
    document.head.appendChild(st);
  }

  function buildCards(){
    css();
    if(!$('v73-control-card')){
      const card=document.createElement('div');
      card.className='card'; card.id='v73-control-card';
      card.innerHTML=`
        <div class="card-head"><div class="step-dot new">K</div><span class="card-title">Kontrol Kolonu Analizi</span><span class="new-badge">v7.3.1</span><span class="card-note">backtest sonucu nerede kaldı?</span></div>
        <div class="section-note purple">Backtest modunda girilen gerçek sonuç / kontrol kolonu üretime zorunlu eklenmez. Bu panel, o kolonun aktif kesin kurallardan geçip geçmediğini, skordan sonra kalıp kalmadığını ve final Jaccard seçimine girip girmediğini gösterir.</div>
        <div class="v73-mini-grid">
          <div class="v73-mini-box"><div class="v" id="v73-ctrl-combo">—</div><div class="l">Kontrol kolonu</div></div>
          <div class="v73-mini-box"><div class="v" id="v73-ctrl-valid">—</div><div class="l">Kesin kurallar</div></div>
          <div class="v73-mini-box"><div class="v" id="v73-ctrl-score">—</div><div class="l">Skor / risk</div></div>
          <div class="v73-mini-box"><div class="v" id="v73-ctrl-passed">—</div><div class="l">Uç/skor sonrası</div></div>
          <div class="v73-mini-box"><div class="v" id="v73-ctrl-final">—</div><div class="l">Final seçim</div></div>
        </div>
        <textarea id="v73-control-output" class="elim-output" readonly style="margin-top:10px;min-height:150px" placeholder="Backtest modunda kontrol kolonu gir ve Analiz Et butonuna bas."></textarea>
      `;
      const score=document.querySelector('.score-panel');
      if(score && score.parentNode) score.parentNode.insertBefore(card, score.nextSibling);
    }
    if(!$('v73-band-card')){
      const card=document.createElement('div');
      card.className='card'; card.id='v73-band-card';
      card.innerHTML=`
        <div class="card-head"><div class="step-dot new">B</div><span class="card-title">Skor Bandı Karışım Modu</span><span class="new-badge">v7.3.1</span><span class="card-note">Jaccard seçimi skor uçlarına yığılmasın</span></div>
        <div class="section-note purple">Bu mod Jaccard seçiminde yalnız skor 0 ve yüksek skor uçlarının baskın olmasını azaltır. Önce skor bantlarından minimum pay alınır, sonra Jaccard / max ortak / frekans öncelikleriyle tamamlanır.</div>
        <div class="row"><div class="row-lbl">Skor bandı kotası<div class="row-sub">aktifse final seçim skor bantlarından karışık yapılır</div></div><label class="check-wrap"><input type="checkbox" id="p-band-active" checked>Aktif</label></div>
        <table class="v73-band-table">
          <thead><tr><th>Skor bandı</th><th>Minimum</th><th>Maksimum</th></tr></thead>
          <tbody>
            <tr><td>0–5 düşük skor</td><td><input type="number" id="p-band-0-5-min" value="12" min="0" max="300"></td><td><input type="number" id="p-band-0-5-max" value="20" min="0" max="300"></td></tr>
            <tr><td>6–10 orta düşük</td><td><input type="number" id="p-band-6-10-min" value="8" min="0" max="300"></td><td><input type="number" id="p-band-6-10-max" value="18" min="0" max="300"></td></tr>
            <tr><td>11–15 orta</td><td><input type="number" id="p-band-11-15-min" value="8" min="0" max="300"></td><td><input type="number" id="p-band-11-15-max" value="18" min="0" max="300"></td></tr>
            <tr><td>16–20 orta risk</td><td><input type="number" id="p-band-16-20-min" value="8" min="0" max="300"></td><td><input type="number" id="p-band-16-20-max" value="18" min="0" max="300"></td></tr>
            <tr><td>21+ yüksek risk</td><td><input type="number" id="p-band-21-min" value="0" min="0" max="300"></td><td><input type="number" id="p-band-21-max" value="8" min="0" max="300"></td></tr>
          </tbody>
        </table>
        <div class="section-note" id="v73-band-status">Analiz sonrası seçilen kolonların skor bandı dağılımı burada raporlanır.</div>
      `;
      const jcard=$('jaccard-report-card');
      if(jcard && jcard.parentNode) jcard.parentNode.insertBefore(card, jcard.nextSibling);
      card.querySelectorAll('input').forEach(x=>x.addEventListener('input',save));
      const active=$('p-band-active'); if(active) active.addEventListener('change',save);
    }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', buildCards); else buildCards();

  function controlNums(){
    if(typeof window.v72ControlNumbers==='function') return window.v72ControlNumbers();
    return String(($('p-control-result')||{}).value||'').split(/[^0-9]+/).map(x=>parseInt(x,10)).filter(Number.isFinite).sort((a,b)=>a-b);
  }
  function sameCombo(a,b){ if(!a||!b||a.length!==b.length) return false; const x=a.slice().sort((m,n)=>m-n), y=b.slice().sort((m,n)=>m-n); return x.every((v,i)=>v===y[i]); }
  function reasonText(it){ return ((it && it.reasons)||[]).join(', ') || 'neden yok'; }
  function riskClass(it){
    const score=Number(it&&it.score)||0; const txt=reasonText(it).toLowerCase();
    if(/dağınık|daginik|aritmetik|uç|uc|gap|sıçrama|sicrama|mekanik|risk/.test(txt) || score>=16) return 'Riskli ama geçerli';
    if(score>=6 || ((it&&it.reasons)||[]).length>=2) return 'Orta riskli';
    return 'Dengeli';
  }
  function renderControlPanel(){
    const out=$('v73-control-output'); if(!out) return;
    const nums=controlNums();
    const mode = typeof window.v72Mode==='function' ? window.v72Mode() : (($('p-work-mode')||{}).value||'live');
    $('v73-ctrl-combo').textContent = nums.length ? nums.join('-') : '—';
    if(mode!=='backtest'){
      ['v73-ctrl-valid','v73-ctrl-score','v73-ctrl-passed','v73-ctrl-final'].forEach(id=>{const e=$(id); if(e) e.textContent='—';});
      out.value='Gerçek çekiliş üretim modunda kontrol kolonu aranmaz. Backtest moduna geçip gerçek sonucu girersen bu panel analiz yapar.';
      return;
    }
    if(nums.length!==6){
      ['v73-ctrl-valid','v73-ctrl-score','v73-ctrl-passed','v73-ctrl-final'].forEach(id=>{const e=$(id); if(e) e.textContent='—';});
      out.value='Kontrol kolonu için 6 sayı gir ve Analiz Et butonuna bas.';
      return;
    }
    const data=window.lastAnalysisData || (typeof lastAnalysisData!=='undefined' ? lastAnalysisData : null);
    if(!data){ out.value='Analiz sonucu yok. Önce Analiz Et butonuna bas.'; return; }
    const scored=(data.scored||[]).find(x=>sameCombo(x.combo,nums));
    const rejected=(data.rejected||[]).find(x=>sameCombo(x.combo,nums));
    const passed=(data.passed||[]).find(x=>sameCombo(x.combo,nums));
    const selected=(((data.jaccardReport||{}).selected)||[]).find(x=>sameCombo(x.combo,nums));
    const valid=!!scored;
    const after=!!passed && !rejected;
    const final=!!selected;
    const item=scored||passed||selected||null;
    const score=item ? Number(item.score||0) : '—';
    const rclass=item ? riskClass(item) : '—';
    $('v73-ctrl-valid').innerHTML = valid ? '<span class="v73-ok">EVET</span>' : '<span class="v73-bad">HAYIR</span>';
    $('v73-ctrl-score').innerHTML = item ? `${score}<br><span style="font-size:10px">${rclass}</span>` : '—';
    $('v73-ctrl-passed').innerHTML = after ? '<span class="v73-ok">EVET</span>' : (valid?'<span class="v73-bad">HAYIR</span>':'—');
    $('v73-ctrl-final').innerHTML = final ? '<span class="v73-ok">EVET</span>' : (after?'<span class="v73-warn">HAYIR</span>':'—');
    const lines=[];
    lines.push('KONTROL KOLONU ANALİZİ');
    lines.push('-----------------------');
    lines.push(`Kontrol kolonu        : ${nums.join('-')}`);
    lines.push(`Aktif kesin kurallar  : ${valid?'GEÇTİ':'GEÇMEDİ / aday havuzunda yok'}`);
    if(item){
      lines.push(`Skor                  : ${score}`);
      lines.push(`Risk sınıfı           : ${rclass}`);
      lines.push(`Nedenler              : ${reasonText(item)}`);
    }
    lines.push(`Uç/skor sonrası kaldı : ${after?'EVET':'HAYIR'}`);
    lines.push(`Final Jaccard seçimi  : ${final?'EVET':'HAYIR'}`);
    if(after && !final){
      lines.push('');
      lines.push('Seçilmemişse muhtemel sebep: skor bandı kotası, paket kotası, Jaccard/max ortak rekabeti veya frekans dengeleme önceliği.');
    }
    out.value=lines.join('\n');
  }

  function bandSettings(){
    return {
      active: bool('p-band-active', true),
      bands:[
        {key:'0-5', label:'0–5', minScore:0, maxScore:5, min:num('p-band-0-5-min',12), max:num('p-band-0-5-max',20)},
        {key:'6-10', label:'6–10', minScore:6, maxScore:10, min:num('p-band-6-10-min',8), max:num('p-band-6-10-max',18)},
        {key:'11-15', label:'11–15', minScore:11, maxScore:15, min:num('p-band-11-15-min',8), max:num('p-band-11-15-max',18)},
        {key:'16-20', label:'16–20', minScore:16, maxScore:20, min:num('p-band-16-20-min',8), max:num('p-band-16-20-max',18)},
        {key:'21+', label:'21+', minScore:21, maxScore:999, min:num('p-band-21-min',0), max:num('p-band-21-max',8)}
      ]
    };
  }
  function bandOf(score, settings){ score=Number(score)||0; return settings.bands.find(b=>score>=b.minScore && score<=b.maxScore) || settings.bands[settings.bands.length-1]; }
  function common(a,b){ if(typeof commonCount==='function') return commonCount(a,b); const s=new Set(a); let c=0; for(const n of b) if(s.has(n)) c++; return c; }
  function simOk(a,b,k,j,maxC){ const c=common(a,b); if(c>maxC) return false; return c/(k*2-c) <= Number(j||0.9)+1e-9; }
  function stats(selected,k){ let mc=0,mj=0; for(let i=0;i<selected.length;i++) for(let j=i+1;j<selected.length;j++){ const c=common(selected[i].combo,selected[j].combo); const jj=c/(k*2-c); if(c>mc)mc=c; if(jj>mj)mj=jj; } return {maxCommon:mc,maxJ:mj}; }
  function countsByBand(items, settings){ const m={}; (items||[]).forEach(it=>{ const b=bandOf(it.score, settings); m[b.key]=(m[b.key]||0)+1; }); return m; }
  function selectedBandCount(selected, key, settings){ return selected.filter(it=>bandOf(it.score,settings).key===key).length; }
  function addCandidates(selected, keys, candidates, need, cfg, settings, bandMaxMap){
    let add=0; outer: for(const it of candidates){
      if(add>=need) break;
      const key=fmt(it.combo); if(keys.has(key)) continue;
      const band=bandOf(it.score,settings); const max=bandMaxMap[band.key];
      if(Number.isFinite(max) && selectedBandCount(selected,band.key,settings)>=max) continue;
      const samePkg=selected.filter(x=>x._pkg===cfg.pkgName);
      for(const s of samePkg){ if(!simOk(it.combo,s.combo,cfg.k,cfg.jaccard,cfg.maxCommon)) continue outer; }
      const copy=Object.assign({},it,{_pkg:cfg.pkgName,_band:band.key,_bandLabel:band.label,_riskClass:riskClass(it)});
      selected.push(copy); keys.add(key); add++;
    }
    return add;
  }

  const prevJaccard = window.jaccardFeasibilityCheck || (typeof jaccardFeasibilityCheck!=='undefined' ? jaccardFeasibilityCheck : null);
  window.jaccardFeasibilityCheck=function(scoredItems,p){
    const settings=bandSettings();
    if(!settings.active || !Array.isArray(scoredItems) || !scoredItems.length){ return prevJaccard ? prevJaccard(scoredItems,p) : {bestCount:0,target:(p&&p.cols)||0,ok:false,selected:[]}; }
    const target=(p&&p.cols)||60, k=(p&&p.k)||6;
    const items=scoredItems.map((x,idx)=>({combo:(x.combo||x).slice().sort((a,b)=>a-b),score:Number(x.score)||0,idx,sum:(x.combo||x).reduce((a,b)=>a+b,0),reasons:x.reasons||[]}));
    const pack=(p&&p.packages&&p.packages.active) ? p.packages : null;
    const cfg={
      main:{pkgName:'Ana Dengeli Paket', k, jaccard:pack?pack.main.jaccard:(p.jaccard||0.6), maxCommon:pack?pack.main.maxCommon:(p.maxCommon||4), cols:pack?pack.main.cols:Math.ceil(target*0.35)},
      deep:{pkgName:'Çekirdek Destek Paketi', k, jaccard:pack?pack.deep.jaccard:(p.jaccard||0.6), maxCommon:pack?pack.deep.maxCommon:(p.maxCommon||4), cols:pack?pack.deep.cols:Math.ceil(target*0.35)},
      risk:{pkgName:'Kontrollü Risk Paketi', k, jaccard:pack?pack.risk.jaccard:(p.jaccard||0.6), maxCommon:pack?pack.risk.maxCommon:(p.maxCommon||4), cols:pack?pack.risk.cols:target-Math.ceil(target*0.70)}
    };
    const selected=[], keys=new Set();
    const bandMaxMap={}; settings.bands.forEach(b=>bandMaxMap[b.key]=Math.min(b.max,target));
    const byScore=items.slice().sort((a,b)=>a.score-b.score || Math.abs(a.sum-320)-Math.abs(b.sum-320) || a.idx-b.idx);
    const byMid=items.slice().sort((a,b)=>Math.abs(a.score-12)-Math.abs(b.score-12) || Math.abs(a.sum-320)-Math.abs(b.sum-320));
    const byRisk=items.slice().sort((a,b)=>b.score-a.score || Math.abs(a.sum-320)-Math.abs(b.sum-320));
    const cfgForBand = b => (b.maxScore<=5 ? cfg.main : (b.maxScore<=15 ? cfg.deep : cfg.risk));
    // 1) Önce skor bandı minimumlarını doldur.
    for(const b of settings.bands){
      const cands=items.filter(it=>bandOf(it.score,settings).key===b.key).sort((a,b2)=>Math.abs(a.sum-320)-Math.abs(b2.sum-320) || a.score-b2.score || a.idx-b2.idx);
      addCandidates(selected,keys,cands,Math.min(b.min,target-selected.length),cfgForBand(b),settings,bandMaxMap);
      if(selected.length>=target) break;
    }
    // 2) Paket amaçlarına göre doldur.
    addCandidates(selected,keys,byScore,cfg.main.cols-selected.filter(x=>x._pkg===cfg.main.pkgName).length,cfg.main,settings,bandMaxMap);
    addCandidates(selected,keys,byMid,cfg.deep.cols-selected.filter(x=>x._pkg===cfg.deep.pkgName).length,cfg.deep,settings,bandMaxMap);
    addCandidates(selected,keys,byRisk,cfg.risk.cols-selected.filter(x=>x._pkg===cfg.risk.pkgName).length,cfg.risk,settings,bandMaxMap);
    // 3) Eksik kalırsa tüm bantlardan dönüşümlü tamamla.
    let guard=0;
    while(selected.length<target && guard<10){
      guard++;
      for(const b of settings.bands){
        const cands=items.filter(it=>bandOf(it.score,settings).key===b.key).sort((a,b2)=>a.idx-b2.idx);
        addCandidates(selected,keys,cands,1,cfgForBand(b),settings,bandMaxMap);
        if(selected.length>=target) break;
      }
    }
    // 4) Hâlâ eksikse max band sınırını gevşet, ama kesin kurallardan çıkan aday dışına çıkma.
    if(selected.length<target){
      settings.bands.forEach(b=>bandMaxMap[b.key]=target);
      addCandidates(selected,keys,byMid.concat(byScore,byRisk),target-selected.length,cfg.risk,settings,bandMaxMap);
    }
    const st=stats(selected,k);
    const bandSummary={settings,available:countsByBand(items,settings),selected:countsByBand(selected,settings)};
    return {bestCount:selected.length,target,ok:selected.length>=target,selected,bestName:'Skor bandı karışım modu + Jaccard',stats:st,bandSummary,trials:settings.bands.map(b=>({name:`Skor ${b.label}`,count:bandSummary.selected[b.key]||0})),status:selected.length>=target?'Uygun':'Yetersiz'};
  };
  try{ jaccardFeasibilityCheck=window.jaccardFeasibilityCheck; }catch(e){}

  const prevRenderJ = window.renderJaccardReport || (typeof renderJaccardReport!=='undefined' ? renderJaccardReport : null);
  window.renderJaccardReport=function(){
    if(prevRenderJ) prevRenderJ();
    const data=window.lastAnalysisData || (typeof lastAnalysisData!=='undefined' ? lastAnalysisData : null);
    const r=data&&data.jaccardReport;
    const out=$('jacc-output');
    const status=$('v73-band-status');
    if(!r || !r.bandSummary){ renderControlPanel(); return; }
    const bs=r.bandSummary, a=bs.available||{}, s=bs.selected||{};
    const lines=['','SKOR BANDI DAĞILIMI','────────────────────'];
    bs.settings.bands.forEach(b=>lines.push(`Skor ${b.label.padEnd(5)} | aday: ${String(a[b.key]||0).padStart(4)} | seçilen: ${String(s[b.key]||0).padStart(3)} | min/max: ${b.min}/${b.max}`));
    if(out && !out.value.includes('SKOR BANDI DAĞILIMI')) out.value += '\n' + lines.join('\n');
    if(status){
      status.innerHTML = bs.settings.bands.map(b=>`<b>${b.label}</b>: aday ${a[b.key]||0}, seçilen ${s[b.key]||0}`).join(' · ');
    }
    renderControlPanel();
  };
  try{ renderJaccardReport=window.renderJaccardReport; }catch(e){}

  const prevRun = window.runAnalysis || (typeof runAnalysis!=='undefined' ? runAnalysis : null);
  if(prevRun){
    window.runAnalysis=function(){ const r=prevRun.apply(this,arguments); setTimeout(()=>{try{renderControlPanel(); if(window.renderJaccardReport) window.renderJaccardReport();}catch(e){}},220); return r; };
    try{ runAnalysis=window.runAnalysis; }catch(e){}
  }

  const prevBuild = window.buildPrompt || (typeof buildPrompt!=='undefined' ? buildPrompt : null);
  function bandPromptBlock(){
    const st=bandSettings(); if(!st.active) return '\n• Skor bandı karışım modu: PASİF.\n';
    return `\n════════════════════════════════════════\n11C. SKOR BANDI KARIŞIM MODU\n════════════════════════════════════════\n• Skor bandı karışım modu: AKTİF.\n• Jaccard seçim motoru yalnızca en düşük skor veya en yüksek riskli skor uçlarına yığılmayacak.\n• Final seçimde skor bantlarından karışık pay alınacak; aynı bant içinde Jaccard / max ortak / frekans dengesi dikkate alınacak.\n${st.bands.map(b=>`• Skor ${b.label}: minimum ${b.min}, maksimum ${b.max} kolon`).join('\n')}\n`;
  }
  window.buildPrompt=function(){
    let s=prevBuild?prevBuild():'';
    if(!s.includes('11C. SKOR BANDI KARIŞIM MODU')){
      s=s.replace('\n════════════════════════════════════════\n12. KOLONLAR ARASI BENZERLİK VE UÇ SKOR', bandPromptBlock()+'\n════════════════════════════════════════\n12. KOLONLAR ARASI BENZERLİK VE UÇ SKOR');
    }
    return s;
  };
  try{ buildPrompt=window.buildPrompt; }catch(e){}
  window.v73RenderControlPanel=renderControlPanel;
})();


(function(){
  const $=id=>document.getElementById(id);
  function getDrawKey(){return 'cpb_draws_'+(gameMax()<=60?'60':'90')+'_v714';}
  const COLORS=['#ef4444','#3b82f6','#22c55e','#f97316','#a855f7','#eab308','#14b8a6','#06b6d4','#ec4899','#84cc16','#f59e0b','#8b5cf6','#10b981','#6366f1','#64748b'];
  const DRAW_N=15; // v7.14
  const labels=['Ç1 en yeni','Ç2','Ç3','Ç4','Ç5','Ç6','Ç7','Ç8','Ç9','Ç10','Ç11','Ç12','Ç13','Ç14','Ç15 en eski'];
  let activeDraw=0;
  let syncing=false;
  function rowOf(id){ const e=$(id); return e?e.closest('.row'):null; }
  function hideOldGeneralRows(){ ['p-t','p-cols','p-jaccard','p-maxcommon','p-out-active','p-out-max'].forEach(id=>{const r=rowOf(id); if(r){r.style.display='none'; r.setAttribute('data-v74-hidden','1');}}); }
  function syncVal(srcId,dstId,kind){ const s=$(srcId), d=$(dstId); if(!s||!d) return; const v=(kind==='check')?s.checked:s.value; if(kind==='check') d.checked=!!v; else d.value=v; }
  function bindMirror(a,b,kind){ const ea=$(a), eb=$(b); if(!ea||!eb) return; const ev=kind==='check'?'change':'input'; const fn=(from,to)=>{ if(syncing)return; syncing=true; if(kind==='check') to.checked=from.checked; else to.value=from.value; to.dispatchEvent(new Event(kind==='check'?'change':'input',{bubbles:true})); syncing=false; try{ if(typeof autoSaveSettings==='function') autoSaveSettings(); }catch(e){} updateGeneralState(); };
    ea.addEventListener(ev,()=>fn(ea,eb)); eb.addEventListener(ev,()=>fn(eb,ea));
  }
  function buildGeneralCard(){
    if($('v74-general-card')) return;
    const card=document.createElement('div'); card.className='card'; card.id='v74-general-card';
    card.innerHTML=`
      <div class="card-head"><div class="step-dot new">G</div><span class="card-title">Genel Üretim Ayarları</span><span class="new-badge">v7.4</span><span class="card-note">paketli mod pasifken geçerli tek merkez</span></div>
      <div class="section-note purple">Paketli üretim <b>pasif</b> olduğunda bu karttaki genel kolon / t / Jaccard / max ortak / uç skor değerleri kullanılır. Paketli üretim aktifse bu genel değerler promptta devre dışı yazılır; paket kartlarındaki değerler geçerli olur.</div>
      <div class="v74-general-grid">
        <div class="v74-general-box"><label>Genel kolon sayısı</label><input type="number" id="v74-g-cols" min="1" max="300"></div>
        <div class="v74-general-box"><label>Genel t seviyesi</label><input type="number" id="v74-g-t" min="3" max="6"></div>
        <div class="v74-general-box"><label>Genel Jaccard</label><input type="number" id="v74-g-jaccard" min="0.1" max="0.95" step="0.05"></div>
        <div class="v74-general-box"><label>Genel max ortak</label><input type="number" id="v74-g-maxcommon" min="1" max="5"></div>
        <div class="v74-general-box"><label>Genel uç skor</label><input type="number" id="v74-g-outmax" min="0" max="100"></div>
      </div>
      <div class="row" style="border-bottom:none;margin-top:6px"><div class="row-lbl">Genel uç skor filtresi<div class="row-sub">Paketli üretim pasifse genel uç skor için kullanılır</div></div><label class="check-wrap"><input type="checkbox" id="v74-g-outactive">Aktif</label></div>
      <div class="v74-note" id="v74-general-status">Durum hazırlanıyor.</div>`;
    const basic=[...document.querySelectorAll('.card')].find(c=>c.textContent.includes('Temel parametreler'));
    if(basic && basic.parentNode) basic.parentNode.insertBefore(card,basic.nextSibling); else document.querySelector('.app').appendChild(card);
    syncVal('p-cols','v74-g-cols'); syncVal('p-t','v74-g-t'); syncVal('p-jaccard','v74-g-jaccard'); syncVal('p-maxcommon','v74-g-maxcommon'); syncVal('p-out-max','v74-g-outmax'); syncVal('p-out-active','v74-g-outactive','check');
    bindMirror('p-cols','v74-g-cols'); bindMirror('p-t','v74-g-t'); bindMirror('p-jaccard','v74-g-jaccard'); bindMirror('p-maxcommon','v74-g-maxcommon'); bindMirror('p-out-max','v74-g-outmax'); bindMirror('p-out-active','v74-g-outactive','check');
    const pack=$('p-pack-active'); if(pack) pack.addEventListener('change',updateGeneralState);
    updateGeneralState();
  }
  function updateGeneralState(){ const card=$('v74-general-card'), stat=$('v74-general-status'), pack=$('p-pack-active'); if(!card||!stat)return; const active=!(pack&&pack.checked); card.classList.toggle('v74-card-dim',!active); stat.innerHTML=active?'<span class="v74-ok">GENEL ÜRETİM AKTİF:</span> Bu karttaki değerler geçerlidir. Paket kartları dikkate alınmaz.':'<span class="v74-warn">PAKETLİ ÜRETİM AKTİF:</span> Bu kart yalnız hazırlık amaçlıdır; üretimde paket kartlarındaki değerler geçerlidir.'; card.querySelectorAll('input').forEach(i=>{ if(i.id!=='v74-g-outactive') i.disabled=!active; else i.disabled=!active; }); }
  function parseNums(str){ const gm=gameMax(); return [...new Set(String(str||'').split(/[^0-9]+/).map(x=>parseInt(x,10)).filter(n=>Number.isFinite(n)&&n>=1&&n<=gm))].slice(0,6).sort((a,b)=>a-b); }
  function loadDraws(){ try{ const v=JSON.parse(localStorage.getItem(getDrawKey())||'null'); if(Array.isArray(v)&&v.length===DRAW_N) return v.map(a=>Array.isArray(a)?a.slice(0,6):[]); }catch(e){} return Array.from({length:DRAW_N},()=>[]); }
  function saveDraws(draws){ try{localStorage.setItem(getDrawKey(),JSON.stringify(draws));}catch(e){} }
  function buildDrawMap(){ if($('v74-draw-card')) return; const card=document.createElement('div'); card.className='card'; card.id='v74-draw-card';
    const rows=labels.map((l,i)=>`<div class="v74-draw-row"><button type="button" class="v74-draw-btn" id="v74-draw-btn-${i}" data-i="${i}" style="background:${COLORS[i]}">${l}</button><input class="v74-draw-input" id="v74-draw-input-${i}" placeholder="6 sayı gir" inputmode="numeric"><button type="button" class="v74-small-btn" data-clear="${i}">Temizle</button></div>`).join('');
    card.innerHTML=`<div class="card-head"><div class="step-dot new">H</div><span class="card-title">Çekiliş Haritası / Son 15 Çekiliş</span><span class="new-badge">v7.14</span><span class="card-note">15 çekiliş · ağırlıklı analiz · 6/60 & 6/90</span></div>
      <div class="section-note purple">Her çekilişe en fazla 6 sayı girilir. Aynı sayı farklı çekilişlerde işaretlenirse uyarı vermeden tekrar/üst üste bilgisiyle haritada vurgulanır. Ç1 en yeni çekiliş kabul edilir.</div>
      <div class="v74-draw-wrap"><div><div class="v74-draw-list">${rows}</div><div class="v74-legend">${labels.map((l,i)=>`<span class="v74-legend-chip"><span class="v74-color-dot" style="background:${COLORS[i]}"></span>${l}</span>`).join('')}</div><div class="v74-summary" id="v74-draw-summary">Çekilişleri gir.</div></div><div><div class="v74-map" id="v74-map"></div></div></div>`;
    const poolCard=[...document.querySelectorAll('.card')].find(c=>c.textContent.includes('Sayı havuzu'));
    if(poolCard && poolCard.parentNode) poolCard.parentNode.insertBefore(card,poolCard.nextSibling); else document.querySelector('.app').appendChild(card);
    for(let i=0;i<DRAW_N;i++){ $('v74-draw-btn-'+i).addEventListener('click',()=>{activeDraw=i; renderDrawMap();}); $('v74-draw-input-'+i).addEventListener('input',()=>{ const draws=loadDraws(); const nums=parseNums($('v74-draw-input-'+i).value); draws[i]=nums; $('v74-draw-input-'+i).value=nums.join(' '); saveDraws(draws); renderDrawMap(); }); }
    card.querySelectorAll('[data-clear]').forEach(b=>b.addEventListener('click',()=>{ const i=+b.dataset.clear; const draws=loadDraws(); draws[i]=[]; saveDraws(draws); renderDrawInputs(draws); renderDrawMap(); }));
    renderDrawInputs(loadDraws()); renderDrawMap();
  }
  function renderDrawInputs(draws){ for(let i=0;i<DRAW_N;i++){ const inp=$('v74-draw-input-'+i); if(inp) inp.value=(draws[i]||[]).join(' '); } }
  function appearances(draws,n){ const arr=[]; draws.forEach((d,i)=>{ if((d||[]).includes(n)) arr.push(i); }); return arr; }
  function streakFromNewest(apps){ let c=0; for(let i=0;i<DRAW_N;i++){ if(apps.includes(i)) c++; else break; } return c; }
  function renderDrawMap(){ const draws=loadDraws(); renderDrawInputs(draws); for(let i=0;i<DRAW_N;i++){ const b=$('v74-draw-btn-'+i); if(b) b.classList.toggle('active',i===activeDraw); }
  window.renderDrawMap714=renderDrawMap; // v7.14 alias
    const map=$('v74-map'); if(!map)return; const gMax=gameMax(); let html=''; for(let n=1;n<=gMax;n++){ const apps=appearances(draws,n); const active=(draws[activeDraw]||[]).includes(n); const st=streakFromNewest(apps); let bg='rgba(255,255,255,.05)'; if(apps.length===1) bg=COLORS[apps[0]]; else if(apps.length>1) bg=`linear-gradient(135deg,${apps.slice(0,4).map(i=>COLORS[i]).join(',')})`; html+=`<button type="button" class="v74-num ${active?'selected-active':''} ${apps.length>1?'repeat':''}" data-n="${n}" style="background:${bg};color:${apps.length?'#fff':'var(--color-text-primary)'}">${n}${st>=2?`<span class="v74-streak">Ü${st}</span>`:''}${apps.length>=2?`<span class="v74-badge">${apps.length}x</span>`:''}</button>`; }
    map.innerHTML=html; map.querySelectorAll('.v74-num').forEach(btn=>btn.addEventListener('click',()=>{ const n=+btn.dataset.n; const draws=loadDraws(); const d=draws[activeDraw]||[]; const ix=d.indexOf(n); if(ix>=0){ d.splice(ix,1); } else { if(d.length>=6){ $('v74-draw-summary').innerHTML='<span class="v74-warn">Bu çekiliş için 6 sayı sınırı dolu.</span>'; return; } d.push(n); } draws[activeDraw]=[...new Set(d)].sort((a,b)=>a-b).slice(0,6); saveDraws(draws); renderDrawMap(); }));
    const repeated=[]; for(let n=1;n<=90;n++){ const apps=appearances(draws,n); const st=streakFromNewest(apps); if(apps.length>1) repeated.push(`${n} (${apps.length} kez${st>=2?', üst üste '+st:''})`); }
    const counts=draws.map((d,i)=>`${labels[i]}: ${(d||[]).length}/6`).join(' · '); $('v74-draw-summary').innerHTML=`${counts}<br>${repeated.length?'<b>Tekrar edenler:</b> '+repeated.join(', '):'Tekrar eden sayı yok.'}`;
  }
  function init(){ hideOldGeneralRows(); buildGeneralCard(); buildDrawMap(); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();


(function(){
  const $=id=>document.getElementById(id);
  function getDrawKey(){return 'cpb_draws_'+(gameMax()<=60?'60':'90')+'_v714';}
  const DRAW_N=15;
  let v75Selected=new Set();
  let v75Suggestions=[];
  function txt(el){return (el&&el.textContent||'').trim();}
  function titleOf(card){return txt(card&&card.querySelector(':scope > .card-head .card-title'));}
  function findCard(part){part=part.toLowerCase();return [...document.querySelectorAll('.card')].find(c=>titleOf(c).toLowerCase().includes(part));}
  function bodyOf(card){return card ? (card.querySelector(':scope > .v55-card-body') || (()=>{const d=document.createElement('div'); let n=card.querySelector(':scope > .card-head')?.nextSibling; while(n){const nx=n.nextSibling; d.appendChild(n); n=nx;} return d;})()) : null;}
  function setCollapsed(card, collapsed){card.classList.toggle('v55-collapsed',!!collapsed); const b=card.querySelector(':scope > .card-head .v55-toggle'); if(b)b.setAttribute('aria-expanded',collapsed?'false':'true');}
  function ensureCollapsible(card){
    if(!card || card.dataset.v55Ready==='1') return;
    const head=card.querySelector(':scope > .card-head'); if(!head) return;
    const body=document.createElement('div'); body.className='v55-card-body';
    let n=head.nextSibling; while(n){const nx=n.nextSibling; body.appendChild(n); n=nx;} card.appendChild(body);
    const toggle=document.createElement('span'); toggle.className='v55-toggle'; toggle.setAttribute('role','button'); toggle.setAttribute('tabindex','0'); toggle.setAttribute('aria-expanded','true'); toggle.innerHTML='<span class="txt-open">Aç</span><span class="txt-close">Gizle</span>'; head.appendChild(toggle);
    function doToggle(e){ if(e && e.target.closest('input,textarea,select,button,a,.pill,.filter-btn,.v55-toggle,.v74-num,.v75-map-chip')){ if(!e.target.closest('.v55-toggle')) return; } setCollapsed(card,!card.classList.contains('v55-collapsed')); }
    head.addEventListener('click',doToggle); head.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();doToggle(e);}});
    card.dataset.v55Ready='1';
  }
  function makeGroupedCard(id,title,note,items,insertBeforeCard){
    if($(id)) return;
    const existing=items.map(it=>({it,card:findCard(it.match)})).filter(x=>x.card);
    if(!existing.length) return;
    const card=document.createElement('div'); card.className='card'; card.id=id;
    card.innerHTML=`<div class="card-head"><div class="step-dot new">${items[0].dot||'K'}</div><span class="card-title">${title}</span><span class="new-badge">v7.5</span><span class="card-note">tek sekme</span></div><div class="section-note purple">${note}</div>`;
    const container=document.createElement('div'); container.className='v75-group-container'; card.appendChild(container);
    existing.forEach(({it,card:old})=>{
      const sec=document.createElement('div'); sec.className='v75-subsection';
      sec.innerHTML=`<div class="v75-subtitle"><span class="dot"></span>${it.label}</div>`;
      const oldBody=bodyOf(old);
      while(oldBody && oldBody.firstChild) sec.appendChild(oldBody.firstChild);
      container.appendChild(sec);
    });
    const first=insertBeforeCard || existing[0].card;
    first.parentNode.insertBefore(card, first);
    existing.forEach(({card:old})=>old.remove());
    ensureCollapsible(card);
  }
  function groupRuleCards(){
    makeGroupedCard('v75-distribution-card','Dağılım ve Sayısal Filtreler','Asal sayı, toplam aralığı, tek/çift dağılımı, alt/üst bölge ve sayısal tablo bölgesi tek kart altında toplandı. Mevcut input ID\'leri korunduğu için analiz ve prompt kuralları değişmedi.',[
      {match:'Asal sayı limitleri',label:'Asal sayı limitleri',dot:'D'},
      {match:'Toplam aralığı kota paketleri',label:'Toplam aralığı kota paketleri'},
      {match:'Tek / çift dağılım kotası',label:'Tek / çift dağılım kotası'},
      {match:'Alt / üst bölge dağılım kotası',label:'Alt / üst bölge dağılım kotası'},
      {match:'Sayısal Tablo Bölgesi filtresi',label:'Sayısal Tablo Bölgesi filtresi'}
    ]);
    makeGroupedCard('v75-positional-card','Konumsal Fark ve Zincir Kuralları','Yatay fark, dikey fark ve çapraz zincir kuralları tek kart altında toplandı. Yatay/dikey kontrolde komşu seçili fark mantığı aynen korunur; çapraz kural yalnız gerçek 9x10 çapraz zincirleri kontrol eder.',[
      {match:'Yatay fark kuralı',label:'Yatay fark kuralı — komşu seçili fark',dot:'F'},
      {match:'Dikey fark kuralı',label:'Dikey fark kuralı — komşu seçili fark'},
      {match:'Çapraz zincir kuralı',label:'Çapraz zincir kuralı — +9 / +11 gerçek kupon geometrisi'}
    ]);
  }
  function hideOldSimilarityCard(){
    const old=findCard('Kolonlar arası benzerlik');
    if(old){ old.style.display='none'; old.setAttribute('aria-hidden','true'); old.dataset.v75Hidden='1'; }
  }
  function removeDuplicateDrawMap(){ const old=$('draw-map-card'); if(old) old.remove(); }
  function parseNums(str){const gm=gameMax(); return [...new Set(String(str||'').split(/[^0-9]+/).map(x=>parseInt(x,10)).filter(n=>Number.isFinite(n)&&n>=1&&n<=gm))].slice(0,6).sort((a,b)=>a-b);}
  function loadDraws(){try{const v=JSON.parse(localStorage.getItem(getDrawKey())||'null'); if(Array.isArray(v)&&v.length===DRAW_N) return v.map(a=>Array.isArray(a)?a.slice(0,6):[]);}catch(e){} return Array.from({length:DRAW_N},()=>[]); }
  function saveDraws(draws){try{localStorage.setItem(getDrawKey(),JSON.stringify(draws));}catch(e){}}
  function gameMax(){try{return typeof currentGameMax==='function'?currentGameMax():90;}catch(e){return 90;}}
  function inRange(n){return n>=1 && n<=gameMax();}
  function appearances(draws,n){const arr=[]; draws.forEach((d,i)=>{if((d||[]).includes(n)) arr.push(i);}); return arr;}
  function streak(apps){let c=0; for(let i=0;i<DRAW_N;i++){if(apps.includes(i)) c++; else break;} return c;}
  function addToPool(nums){
    const inp=$('poolInput'); if(!inp) return;
    const base=(typeof parseNumbers==='function'?parseNumbers(inp.value):String(inp.value||'').split(/[^0-9]+/).map(x=>parseInt(x,10)).filter(Number.isFinite));
    const set=new Set(base.filter(inRange)); nums.filter(inRange).forEach(n=>set.add(n));
    inp.value=[...set].sort((a,b)=>a-b).join(', ');
    try{ if(typeof parsePool==='function') parsePool(); }catch(e){}
    try{ if(typeof autoSaveSettings==='function') autoSaveSettings(); }catch(e){}
  }
  function analyzeDraws(){
    const draws=loadDraws(); const max=gameMax(); const is60=max<=60;
    const drawn=new Set(); draws.forEach(d=>(d||[]).forEach(n=>drawn.add(n)));

    // v7.14 — Ağırlıklı frekans: Ç1=1.0, Ç15=0.3 lineer azalma
    const wFreq={}; // ağırlıklı skor
    const rawCnt={}; // ham tekrar sayısı
    draws.forEach((d,i)=>{
      const w=parseFloat((1.0-(i/(DRAW_N-1))*0.7).toFixed(3));
      (d||[]).forEach(n=>{
        wFreq[n]=(wFreq[n]||0)+w;
        rawCnt[n]=(rawCnt[n]||0)+1;
      });
    });

    // v7.15 — 9×10 kupon geometrisi komşu
    function crd(n){return {row:Math.floor((n-1)/10),col:(n-1)%10};}
    function isN1(a,b){const ca=crd(a),cb=crd(b);return Math.abs(ca.row-cb.row)<=1&&Math.abs(ca.col-cb.col)<=1&&a!==b;}
    function isN2(a,b){const ca=crd(a),cb=crd(b);return Math.abs(ca.row-cb.row)<=2&&Math.abs(ca.col-cb.col)<=2&&!isN1(a,b)&&a!==b;}

    const rows=[];
    for(let n=1;n<=max;n++){
      const apps=appearances(draws,n);
      const cnt=rawCnt[n]||0;
      const wScore=wFreq[n]||0;
      let neigh=0;
      draws.forEach((d,i)=>{
        const dw=(i===0?3:(i<=2?2:1));
        (d||[]).forEach(x=>{
          if(isN1(x,n)) neigh+=dw;
          else if(isN2(x,n)) neigh+=dw*0.5;
        });
      });
      const st=streak(apps);
      const recent=apps.includes(0)?1:(apps.includes(1)?0.7:(apps.includes(2)?0.45:0));
      // v7.15 streak ceza: üst üste çıkan sayı puan kaybeder
      const streakPenalty=st===0?0:st===1?-5:st===2?-12:-20;
      const score=wScore*14 + recent*8 + neigh*2 + streakPenalty;
      let group='Soğuk';
      if(wScore>=1.5 && st<2) group='Sıcak';
      else if(wScore>=1.0 && st>=2) group='Ilık';
      else if(cnt===1&&(apps.includes(0)||apps.includes(1)||neigh>=5)) group='Ilık';
      else if(cnt>=1||neigh>0) group='Orta';
      rows.push({n,cnt,wScore,apps,st,neigh,score,streakPenalty,group});
    }
    const byGroup=g=>rows.filter(r=>r.group===g).sort((a,b)=>b.score-a.score||b.cnt-a.cnt||a.n-b.n);
    const hot=byGroup('Sıcak'),warm=byGroup('Ilık'),mid=byGroup('Orta'),cold=byGroup('Soğuk');
    v75Suggestions=[...hot,...warm,...mid].filter(r=>r.score>0).map(r=>r.n);
    v75Selected=new Set(v75Suggestions.slice(0,25));

    // v7.14 — Her çekiliş için toplu istatistikler
    const drawStats=draws.map((d,i)=>{
      if(!d||!d.length) return null;
      const nums=d.slice().sort((a,b)=>a-b);
      const sum=nums.reduce((a,b)=>a+b,0);
      const odd=nums.filter(n=>n%2!==0).length;
      const even=nums.length-odd;
      const low=nums.filter(n=>n<=(is60?30:45)).length;
      const high=nums.length-low;
      const low30=nums.filter(n=>n<=30).length;
      const mid60=is60?0:nums.filter(n=>n>30&&n<=60).length;
      const high90=is60?0:nums.filter(n=>n>60).length;
      return {i,sum,odd,even,low,high,low30,mid60,high90,nums};
    }).filter(Boolean);

    // Toplu ortalamalar
    const allSums=drawStats.map(d=>d.sum);
    const avgSum=drawStats.length?Math.round(allSums.reduce((a,b)=>a+b,0)/drawStats.length):0;
    const avgOdd=drawStats.length?(drawStats.reduce((a,d)=>a+d.odd,0)/drawStats.length).toFixed(1):0;
    const avgLow=drawStats.length?(drawStats.reduce((a,d)=>a+d.low,0)/drawStats.length).toFixed(1):0;

    // Öneri üret
    const oneriler=[];
    const idealSum=is60?round2(max*6/2*0.85):round2(max*6/2*0.87);
    if(avgSum<idealSum-15) oneriler.push(`⚠ Son çekilişlerde toplam düşük (ort. ${avgSum}). Yüksek sayılara ağırlık ver.`);
    else if(avgSum>idealSum+15) oneriler.push(`⚠ Son çekilişlerde toplam yüksek (ort. ${avgSum}). Düşük sayılara ağırlık ver.`);
    else oneriler.push(`✅ Toplam değer dengeli (ort. ${avgSum}).`);

    const idealOdd=3.0;
    if(parseFloat(avgOdd)<2.4) oneriler.push(`⚠ Çift sayı baskın (ort. ${avgOdd} tek). Bu çekiliş için tek sayı ağırlıklı kolon dene.`);
    else if(parseFloat(avgOdd)>3.6) oneriler.push(`⚠ Tek sayı baskın (ort. ${avgOdd} tek). Çift sayı ağırlıklı kolon dene.`);
    else oneriler.push(`✅ Tek/çift dengesi iyi (ort. ${avgOdd} tek).`);

    const idealLow=3.0;
    if(parseFloat(avgLow)<2.4) oneriler.push(`⚠ Üst bölge baskın (ort. ${avgLow} alt). Alt bölge (1–${is60?30:45}) sayılarına ağırlık ver.`);
    else if(parseFloat(avgLow)>3.6) oneriler.push(`⚠ Alt bölge baskın (ort. ${avgLow} alt). Üst bölge (${is60?31:46}–${max}) sayılarına ağırlık ver.`);
    else oneriler.push(`✅ Bölge dağılımı dengeli (ort. ${avgLow} alt / ${(6-parseFloat(avgLow)).toFixed(1)} üst).`);

    // Per-draw stats tablosu
    const drawTable=drawStats.map(d=>{
      const r30=d.low30; const r31_60=is60?d.high:d.mid60; const r61_90=is60?0:d.high90;
      const bölge=is60?`Alt(1-30):${r30} Üst(31-60):${r31_60}`:`1-30:${r30} 31-60:${r31_60} 61-90:${r61_90} | Alt(1-45):${d.low} Üst(46-90):${d.high}`;
      return `Ç${d.i+1}: [${d.nums.join(' ')}] toplam=${d.sum} tek=${d.odd}/çift=${d.even} ${bölge}`;
    }).join('\n');

    const rep=rows.filter(r=>r.cnt>1).sort((a,b)=>b.cnt-a.cnt||a.n-b.n).map(r=>`${r.n}(${r.cnt}kez${r.st>=2?',üst üste'+r.st:''})`);
    const fmt=arr=>arr.slice(0,40).map(r=>`${r.n}(${r.wScore.toFixed(1)}p)`).join(', ')||'Yok';

    const report=[
      `SON ${DRAW_N} ÇEKİLİŞ ANALİZİ — ${is60?'6/60':'6/90'} OYUNU`,
      `Ç1 en yeni (ağırlık 1.0) → Ç${DRAW_N} en eski (ağırlık 0.3)`,
      `────────────────────────────────────────`,
      `Doluluk: ${draws.map((d,i)=>`Ç${i+1}:${(d||[]).length}/6`).join(' ')}`,
      `Farklı sayı: ${drawn.size}  |  Tekrar: ${rep.join(', ')||'Yok'}`,
      ``,
      `ÇEKİLİŞ DETAYLARI (ağırlıklı analiz)`,
      drawTable||'(Henüz çekiliş girilmedi)',
      ``,
      `ORTALAMA İSTATİSTİKLER`,
      `• Toplam ort.: ${avgSum}  • Tek/çift ort.: ${avgOdd}/çift  • Alt/üst bölge ort.: ${avgLow}/${(6-parseFloat(avgLow)).toFixed(1)}`,
      ``,
      `ÖNERİLER`,
      ...oneriler,
      ``,
      `SICAK SAYILAR (ağırlıklı): ${fmt(hot)}`,
      `ILIK SAYILAR: ${fmt(warm)}`,
      `ORTA TAKİP: ${fmt(mid)}`,
      `SOĞUK SAYILAR: ${fmt(cold)}`,
      ``,
      `Önerilen ilk 25: ${v75Suggestions.slice(0,25).join(', ')||'Yok'}`,
      ``,
      `Not: Ağırlıklı puan Ç1=1.0× → Ç15=0.3×. Streak ceza: 1üstüste=−5p, 2=−12p, 3+=−20p. Komşu: 9×10 kupon 8 yönlü geometri. Garanti iddiası içermez.`
    ].join('\n');

    const area=$('v75-draw-analysis'); if(area) area.value=report;
    renderSuggestions({hot,warm,mid,cold});
  }
  function round2(n){return Math.round(n);}
  function renderSuggestions(groups){
    const box=$('v75-draw-suggestions'); if(!box) return;
    if(!groups){ analyzeDraws(); return; }
    function chips(title,arr,limit,selectable){
      const shown=arr.slice(0,limit);
      return `<div class="v75-group-title">${title}</div>`+(shown.length?shown.map(r=>`<span class="v75-map-chip ${v75Selected.has(r.n)?'selected':''}" data-n="${r.n}" title="Ağırlıklı puan: ${r.wScore!==undefined?r.wScore.toFixed(2):r.cnt} | Tekrar: ${r.cnt} | Üst üste: ${r.st||0} (ceza:${r.streakPenalty||0}p) | Kupon komşu: ${Math.round(r.neigh||0)} | Nihai: ${Math.round(r.score)}">${r.n}<span class="score">${r.wScore!==undefined?r.wScore.toFixed(1)+'p':r.cnt+'x'}${(r.st||0)>=2?' ⚠':''}${(r.streakPenalty||0)<0?' ↓':''}</span></span>`).join(''):'<span class="v75-muted">Yok</span>');
    }
    box.innerHTML=chips('Sıcak',groups.hot,50,true)+chips('Ilık',groups.warm,50,true)+chips('Orta',groups.mid,50,true)+chips('Soğuk / uzak kalan',groups.cold,30,true)+`<div class="v75-muted">Varsayılan seçili liste, sıcak + ılık + orta gruplardan ilk 25 sayıdır. İstediğin sayıya tıklayarak seçime ekleyip çıkarabilirsin.</div>`;
  }
  function enhanceDrawCard(){
    const card=$('v74-draw-card'); if(!card || $('v75-draw-analysis')) return;
    const body=card.querySelector(':scope > .v55-card-body') || card;
    const note=card.querySelector('.new-badge'); if(note) note.textContent='v7.14';
    const cardNote=card.querySelector('.card-note'); if(cardNote) cardNote.textContent='15 çekiliş · ağırlıklı analiz · 6/60 & 6/90';

    // v7.14 — Oyun modu toggle (çekiliş kartı içinde bağımsız)
    if(!$('v714-game-toggle')){
      const gameRow=document.createElement('div');
      gameRow.style.cssText='display:flex;align-items:center;gap:10px;margin:8px 0;padding:8px 10px;border-radius:8px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);';
      gameRow.innerHTML=`<span style="font-size:12px;font-weight:700;color:var(--color-text-primary)">Oyun Modu:</span>
        <label style="display:flex;align-items:center;gap:5px;cursor:pointer;font-size:12px;font-weight:600;">
          <input type="radio" name="v714game" id="v714-game-90" value="90" checked style="accent-color:#53f0db"> 6/90 (1–90)
        </label>
        <label style="display:flex;align-items:center;gap:5px;cursor:pointer;font-size:12px;font-weight:600;">
          <input type="radio" name="v714game" id="v714-game-60" value="60" style="accent-color:#53f0db"> 6/60 (1–60)
        </label>
        <span id="v714-game-status" style="font-size:11px;color:var(--color-text-secondary);margin-left:4px;">Sayı aralığı: 1–90</span>`;
      const body2=card.querySelector(':scope > .v55-card-body') || card;
      const secNote=body2.querySelector('.section-note');
      if(secNote) body2.insertBefore(gameRow, secNote.nextSibling); else body2.prepend(gameRow);
      // Oyun modu değişince ana p-game select'i de senkronize et + haritayı yenile
      gameRow.querySelectorAll('input[name="v714game"]').forEach(r=>{
        r.addEventListener('change',()=>{
          const val=r.value;
          const pgame=$('p-game'); if(pgame){ pgame.value=val; pgame.dispatchEvent(new Event('change',{bubbles:true})); }
          const st=$('v714-game-status'); if(st) st.textContent=`Sayı aralığı: 1–${val}`;
          renderDrawMap714();
        });
      });
      // Ana p-game değişince toggle'ı da senkronize et
      const pgMain=$('p-game');
      if(pgMain) pgMain.addEventListener('change',()=>{
        const v=pgMain.value||'90';
        document.querySelectorAll('input[name="v714game"]').forEach(r=>r.checked=(r.value===v));
        const st=$('v714-game-status'); if(st) st.textContent=`Sayı aralığı: 1–${v}`;
      });
    }

    const actions=document.createElement('div'); actions.className='v75-draw-actions';
    actions.innerHTML=`<button class="mini-btn" type="button" id="v75-clear-all-draws">Tüm çekilişleri temizle</button><button class="mini-btn" type="button" id="v75-analyze-draws">Haritayı analiz et</button><button class="mini-btn" type="button" id="v75-add-selected">Seçilenleri havuza ekle</button><button class="mini-btn" type="button" id="v75-add-top25">Önerilen 25'i havuza ekle</button><button class="mini-btn" type="button" id="v75-add-all-suggested">Tüm önerileri havuza ekle</button>`;
    const panel=document.createElement('div'); panel.className='v75-analysis-grid';
    panel.innerHTML=`<textarea id="v75-draw-analysis" class="elim-output" readonly placeholder="Son 15 çekilişi gir, sonra Haritayı analiz et."></textarea><div id="v75-draw-suggestions" class="v75-suggestion-box"><div class="v75-muted">Analiz bekleniyor.</div></div>`;
    const summary=$('v74-draw-summary');
    if(summary && summary.parentNode) summary.parentNode.insertBefore(actions, summary.nextSibling); else body.appendChild(actions);
    body.appendChild(panel);
    $('v75-clear-all-draws').addEventListener('click',()=>{saveDraws(Array.from({length:DRAW_N},()=>[])); for(let i=0;i<DRAW_N;i++){const inp=$('v74-draw-input-'+i); if(inp){ inp.value=''; inp.dispatchEvent(new Event('input',{bubbles:true})); }} const area=$('v75-draw-analysis'); if(area) area.value=''; const box=$('v75-draw-suggestions'); if(box) box.innerHTML='<div class="v75-muted">Analiz bekleniyor.</div>'; v75Selected.clear(); v75Suggestions=[];});
    $('v75-analyze-draws').addEventListener('click',analyzeDraws);
    $('v75-add-selected').addEventListener('click',()=>addToPool([...v75Selected]));
    $('v75-add-top25').addEventListener('click',()=>{if(!v75Suggestions.length) analyzeDraws(); addToPool(v75Suggestions.slice(0,25));});
    $('v75-add-all-suggested').addEventListener('click',()=>{if(!v75Suggestions.length) analyzeDraws(); addToPool(v75Suggestions);});
    $('v75-draw-suggestions').addEventListener('click',e=>{const chip=e.target.closest('.v75-map-chip'); if(!chip)return; const n=+chip.dataset.n; v75Selected.has(n)?v75Selected.delete(n):v75Selected.add(n); chip.classList.toggle('selected',v75Selected.has(n));});
  }
  function updateToolbarMainOpen(){
    const bar=document.querySelector('.v55-topbar'); if(!bar || bar.dataset.v75Patched==='1') return; bar.dataset.v75Patched='1';
    bar.addEventListener('click',function(e){ const btn=e.target.closest('[data-action="main-open"]'); if(!btn) return; setTimeout(()=>{document.querySelectorAll('.card').forEach(c=>{const t=titleOf(c).toLowerCase(); const keep=['sayı havuzu','çekiliş haritası','temel parametre','genel üretim','dağılım ve sayısal','konumsal fark','paketli üretim']; setCollapsed(c,!keep.some(k=>t.includes(k)));});},0); },true);
  }
  function finish(){
    document.title='Kolon Prompt Builder v7.5 - Tek Çekiliş Haritası';
    const ver=document.querySelector('.badge-ver'); if(ver) ver.textContent='v7.5';
    const sub=document.querySelector('.app-sub'); if(sub) sub.textContent='Covering Design · Tek Çekiliş Haritası · Kontrollü Sekme Toparlama';
    removeDuplicateDrawMap();
    groupRuleCards();
    hideOldSimilarityCard();
    enhanceDrawCard();
    document.querySelectorAll('.card').forEach(ensureCollapsible);
    updateToolbarMainOpen();
    const draw=$('v74-draw-card'); if(draw) setCollapsed(draw,false);
    const dist=$('v75-distribution-card'); if(dist) setCollapsed(dist,false);
    const pos=$('v75-positional-card'); if(pos) setCollapsed(pos,true);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(finish,80)); else setTimeout(finish,80);
})();


(function(){
  'use strict';
  const $=id=>document.getElementById(id);
  const qsa=(sel,root=document)=>Array.from(root.querySelectorAll(sel));
  function num(id,def){ const el=$(id); const v=el?parseFloat(el.value):NaN; return Number.isFinite(v)?v:def; }
  function int(id,def){ const el=$(id); const v=el?parseInt(el.value,10):NaN; return Number.isFinite(v)?v:def; }
  function checked(id,def){ const el=$(id); return el?!!el.checked:def; }
  function setVal(id,val){ const el=$(id); if(!el) return; el.value=val; el.dispatchEvent(new Event('input',{bubbles:true})); el.dispatchEvent(new Event('change',{bubbles:true})); }
  function setCheck(id,val){ const el=$(id); if(!el) return; el.checked=!!val; el.dispatchEvent(new Event('change',{bubbles:true})); }
  function uniqueSorted(arr){ return [...new Set(arr.map(Number).filter(Number.isFinite))].sort((a,b)=>a-b); }
  function comboKey(c){ return c.slice().sort((a,b)=>a-b).join('-'); }
  function commonCount(a,b){ const s=new Set(a); let n=0; for(const x of b){ if(s.has(x)) n++; } return n; }
  function jaccard(a,b){ const c=commonCount(a,b); return c/(a.length+b.length-c); }
  function combos3(c){ const out=[]; for(let i=0;i<c.length;i++)for(let j=i+1;j<c.length;j++)for(let k=j+1;k<c.length;k++)out.push(c[i]+'-'+c[j]+'-'+c[k]); return out; }
  function stats(sel,k){ let maxC=0,maxJ=0; for(let i=0;i<sel.length;i++)for(let j=i+1;j<sel.length;j++){ const c=commonCount(sel[i].combo,sel[j].combo); if(c>maxC)maxC=c; const jj=jaccard(sel[i].combo,sel[j].combo); if(jj>maxJ)maxJ=jj; } return {maxCommon:maxC,maxJ}; }
  function v76Settings(){
    return {
      active: checked('p-v76-final-active',true),
      coreActive: checked('p-v76-core-active',true),
      coreMax: int('p-v76-core-max',5),
      score0Active: checked('p-v76-score0-active',true),
      score0Min: int('p-v76-score0-min',10),
      backboneActive: checked('p-v76-backbone-active',true),
      backbonePct: num('p-v76-backbone-pct',0.66),
      rotationActive: checked('p-v76-rotation-active',true)
    };
  }
  function bandKey(score){ if(score<=5)return '0-5'; if(score<=10)return '6-10'; if(score<=15)return '11-15'; if(score<=20)return '16-20'; return '21+'; }
  function countBy(arr,fn){ const o={}; arr.forEach(x=>{const k=fn(x); o[k]=(o[k]||0)+1;}); return o; }
  function getTarget(p){ return (p&&p.cols)||int('p-cols',60)||60; }
  function pkgCfg(p,target){
    const k=(p&&p.k)||6;
    const pack=p&&p.packages&&p.packages.active?p.packages:null;
    if(pack){
      return [
        {name:'Ana Dengeli Paket',cols:pack.main.cols||0,j:pack.main.jaccard||0.6,c:pack.main.maxCommon||4,outMax:Number.isFinite(Number(pack.main.outMax))?Number(pack.main.outMax):40,mode:'clean'},
        {name:'Çekirdek Destek Paketi',cols:pack.deep.cols||0,j:pack.deep.jaccard||0.7,c:pack.deep.maxCommon||4,outMax:Number.isFinite(Number(pack.deep.outMax))?Number(pack.deep.outMax):45,mode:'core'},
        {name:'Kontrollü Risk Paketi',cols:pack.risk.cols||0,j:pack.risk.jaccard||0.75,c:pack.risk.maxCommon||5,outMax:Number.isFinite(Number(pack.risk.outMax))?Number(pack.risk.outMax):55,mode:'risk'}
      ].filter(x=>x.cols>0);
    }
    return [{name:'Genel Üretim',cols:target,j:(p&&p.jaccard)||0.6,c:(p&&p.maxCommon)||4,outMax:100,mode:'general'}];
  }
  function orderItems(items,mode){
    const arr=items.slice();
    if(mode==='clean') return arr.sort((a,b)=>a.score-b.score || a._coreSeen-b._coreSeen || a.idx-b.idx);
    if(mode==='risk') return arr.sort((a,b)=>b.score-a.score || a._coreSeen-b._coreSeen || a.idx-b.idx);
    if(mode==='core') return arr.sort((a,b)=>Math.abs(a.score-8)-Math.abs(b.score-8) || a._coreSeen-b._coreSeen || a.idx-b.idx);
    return arr.sort((a,b)=>a._coreSeen-b._coreSeen || a.score-b.score || a.idx-b.idx);
  }
  function canAdd(item,selected,cfg,settings,coreUse,relax){
    const k=item.combo.length;
    const samePkg=selected.filter(x=>x._pkg===cfg.name);
    for(const s of samePkg){
      const cc=commonCount(item.combo,s.combo);
      if(!relax.sim && (cc>cfg.c || jaccard(item.combo,s.combo)>cfg.j+1e-9)) return false;
      if(settings.backboneActive && !relax.backbone && (cc/k)>settings.backbonePct+1e-9) return false;
    }
    if(settings.coreActive && !relax.core){
      for(const ck of combos3(item.combo)){ if((coreUse[ck]||0)>=settings.coreMax) return false; }
    }
    return true;
  }
  function addOne(item,selected,keys,coreUse,cfg){
    const key=comboKey(item.combo); keys.add(key); const cp=Object.assign({},item,{_pkg:cfg.name,_band:bandKey(item.score)}); selected.push(cp); combos3(item.combo).forEach(ck=>coreUse[ck]=(coreUse[ck]||0)+1); return cp;
  }
  function selectAdvanced(scoredItems,p){
    const settings=v76Settings(); const target=getTarget(p); const k=(p&&p.k)||6;
    const base=scoredItems.map((x,idx)=>{ const raw=x.combo||x; const combo=uniqueSorted(raw); return {combo,score:Number(x.score)||0,idx,reasons:x.reasons||[],sum:combo.reduce((a,b)=>a+b,0)}; }).filter(x=>x.combo.length===k);
    const coreSeed={}; base.forEach(it=>{ let m=999; combos3(it.combo).forEach(ck=>m=Math.min(m,coreSeed[ck]||0)); it._coreSeen=Number.isFinite(m)?m:0; combos3(it.combo).forEach(ck=>coreSeed[ck]=(coreSeed[ck]||0)+1); });
    const selected=[], keys=new Set(), coreUse={};
    const cfgs=pkgCfg(p,target); const totalCfg=cfgs.reduce((a,b)=>a+b.cols,0)||target; if(totalCfg!==target && cfgs.length){ cfgs[cfgs.length-1].cols += (target-totalCfg); }
    const pkgCount=cfg=>selected.filter(x=>x._pkg===cfg.name).length;
    const pkgNeed=cfg=>Math.max(0,(cfg.cols||0)-pkgCount(cfg));
    const scoreOk=(it,cfg)=>Number(it.score||0)<=Number(cfg.outMax||100);
    const addFrom=(cands,need,cfg,relax={})=>{
      let n=0; const limit=Math.min(Math.max(0,need||0),pkgNeed(cfg));
      for(const it of cands){
        if(n>=limit || selected.length>=target || pkgNeed(cfg)<=0) break;
        if(!scoreOk(it,cfg)) continue;
        const key=comboKey(it.combo); if(keys.has(key)) continue;
        if(!canAdd(it,selected,cfg,settings,coreUse,relax)) continue;
        addOne(it,selected,keys,coreUse,cfg); n++;
      }
      return n;
    };
    // Skor 0 temsil zorunluluğu yalnızca ana paket kontenjanı içinde uygulanır; paket kotasını aşamaz.
    if(settings.score0Active && cfgs.length){ const clean=orderItems(base.filter(it=>it.score<=0),'clean'); addFrom(clean,Math.min(settings.score0Min,pkgNeed(cfgs[0])),cfgs[0],{}); }
    // 1) Her paket kendi kontenjanını, kendi uç skor limitini ve kendi Jaccard/max ortak sınırını kullanır.
    for(const cfg of cfgs){ addFrom(orderItems(base,cfg.mode),pkgNeed(cfg),cfg,{}); }
    // 2) Gerekirse sadece aynı paketin eksik kontenjanı için sırasıyla yumuşatılır; başka pakete taşma yapılmaz.
    for(const cfg of cfgs){ if(pkgNeed(cfg)>0) addFrom(orderItems(base,cfg.mode),pkgNeed(cfg),cfg,{backbone:true}); }
    for(const cfg of cfgs){ if(pkgNeed(cfg)>0) addFrom(orderItems(base,cfg.mode),pkgNeed(cfg),cfg,{backbone:true,core:true}); }
    for(const cfg of cfgs){ if(pkgNeed(cfg)>0) addFrom(orderItems(base,cfg.mode),pkgNeed(cfg),cfg,{backbone:true,core:true,sim:true}); }
    const st=stats(selected,k); const coreCounts=Object.values(coreUse); const maxCore=coreCounts.length?Math.max(...coreCounts):0;
    const details=cfgs.map(cfg=>({name:cfg.name,target:cfg.cols,selected:pkgCount(cfg),bestName:'v7.10 paket-kota/uç-skor kilidi',jaccard:cfg.j,maxCommon:cfg.c,outMax:cfg.outMax,trials:[{name:'seçilen',count:pkgCount(cfg)}]}));
    return {bestCount:selected.length,target,ok:selected.length>=target,selected,bestName:'v7.10 final seçim: paket kotası + paket uç skor kilidi',stats:st,trials:[{name:'Skor 0 temsil',count:selected.filter(x=>x.score<=0).length},{name:'Max 3lü çekirdek tekrar',count:maxCore},{name:'Tekrarsız kolon',count:selected.length}],status:selected.length>=target?'Uygun':'Yetersiz',packageDetails:details,v76Summary:{settings,coreUse,maxCore,bandSelected:countBy(selected,x=>x._band),pkgSelected:countBy(selected,x=>x._pkg)}};
  }
  function makeFinalCard(){
    if($('v76-final-selection-card')) return;
    const card=document.createElement('div'); card.className='card'; 


(function(){
  'use strict';
  const $ = id => document.getElementById(id);
  const qsa = (sel,root=document)=>Array.from(root.querySelectorAll(sel));

  function getComboArray(item){
    if(!item) return [];
    const raw = Array.isArray(item.combo) ? item.combo : (Array.isArray(item) ? item : []);
    return raw.map(Number).filter(Number.isFinite).sort((a,b)=>a-b);
  }

  function selectedExcelText(){
    const data = window.lastAnalysisData || (typeof lastAnalysisData !== 'undefined' ? lastAnalysisData : null);
    const report = data && data.jaccardReport;
    if(!report || !Array.isArray(report.selected) || !report.selected.length) return '';
    const p = (data && data.params) || (typeof getParams === 'function' ? getParams() : {}) || {};
    const target = Number(report.target || p.cols || 60) || 60;
    const rows = [];
    const seen = new Set();
    for(const item of report.selected){
      if(rows.length >= target) break;
      const combo = getComboArray(item);
      if(combo.length !== 6) continue;
      const key = combo.join('-');
      if(seen.has(key)) continue;
      seen.add(key);
      rows.push(combo.join('\t'));
    }
    return rows.join('\n');
  }

  window.copyJaccardSelectedExcel = function(){
    const text = selectedExcelText();
    const out = $('jacc-excel-output');
    if(out) out.value = text;
    if(!text){ alert('Önce Analiz Et butonuna bas. Seçilen Jaccard kolonları oluşmadan Excel çıktısı alınamaz.'); return; }
    const copy = () => alert('Seçilen kolonlar Excel formatında kopyalandı. Sıra no ve açıklama yoktur.');
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(text).then(copy).catch(()=>{ if(out){out.select(); document.execCommand('copy'); copy();} });
    }else if(out){ out.select(); document.execCommand('copy'); copy(); }
  };

  function fillJaccardExcelOutput(){
    const out = $('jacc-excel-output');
    if(!out) return;
    const text = selectedExcelText();
    if(text) out.value = text;
  }

  function patchRenderJaccard(){
    const fn = window.renderJaccardReport || (typeof renderJaccardReport !== 'undefined' ? renderJaccardReport : null);
    if(!fn || fn._v77ExcelPatched) return;
    const wrapped = function(){
      const ret = fn.apply(this, arguments);
      try{ fillJaccardExcelOutput(); }catch(e){}
      return ret;
    };
    wrapped._v77ExcelPatched = true;
    window.renderJaccardReport = wrapped;
    try{ renderJaccardReport = window.renderJaccardReport; }catch(e){}
  }

  function ensureCardToggle(card){
    if(!card || card.nodeType !== 1 || !card.classList.contains('card')) return;
    const head = card.querySelector(':scope > .card-head');
    if(!head) return;
    if(!card.querySelector(':scope > .v55-card-body')){
      const body = document.createElement('div');
      body.className = 'v55-card-body';
      let n = head.nextSibling;
      while(n){ const next = n.nextSibling; body.appendChild(n); n = next; }
      card.appendChild(body);
    }
    let toggle = head.querySelector('.v55-toggle');
    if(!toggle){
      toggle = document.createElement('span');
      toggle.className = 'v55-toggle';
      toggle.setAttribute('role','button');
      toggle.setAttribute('tabindex','0');
      toggle.setAttribute('aria-expanded', card.classList.contains('v55-collapsed') ? 'false' : 'true');
      toggle.innerHTML = '<span class="txt-open">Aç</span><span class="txt-close">Gizle</span>';
      head.appendChild(toggle);
    }
    // v7.8 DÜZELTME: Eski v55 katlanabilir sisteminin event'i zaten bağlıysa
    // ikinci bir click event bağlama. Aksi halde tıklama iki kez çalışıp kart açılıp
    // aynı anda kapanıyor gibi görünür. Sadece toggle/body eksik olan yeni dinamik
    // kartlarda aşağıdaki yedek event devreye girer.
    if(card.dataset.v55Ready === '1' || card.dataset.v77ToggleReady === '1') return;
    const doToggle = function(e){
      if(e && e.target && e.target.closest('input,textarea,select,button,a,.pill,.filter-btn,.v55-toggle,.v74-num,.v75-map-chip')){
        if(!e.target.closest('.v55-toggle')) return;
      }
      const collapsed = !card.classList.contains('v55-collapsed');
      card.classList.toggle('v55-collapsed', collapsed);
      const b = head.querySelector('.v55-toggle');
      if(b) b.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    };
    head.addEventListener('click', doToggle);
    head.addEventListener('keydown', e=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); doToggle(e); } });
    card.dataset.v77ToggleReady = '1';
    card.dataset.v55Ready = '1';
  }

  function ensureAllToggles(){ qsa('.card').forEach(ensureCardToggle); }

  function init(){
    patchRenderJaccard();
    fillJaccardExcelOutput();
    ensureAllToggles();
    const root = document.querySelector('.app') || document.body;
    if(root && !root.dataset.v77CollapseObserver){
      root.dataset.v77CollapseObserver = '1';
      const obs = new MutationObserver(()=>setTimeout(ensureAllToggles,30));
      obs.observe(root,{childList:true,subtree:true});
    }
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(init,250));
  else setTimeout(init,250);
})();


(function(){
  function mark(){
    const ver=document.querySelector('.badge-ver'); if(ver) ver.textContent='v7.8';
    const sub=document.querySelector('.app-sub'); if(sub) sub.textContent='Covering Design · Jaccard Excel Çıktı · Sekme Düğmeleri Düzeltildi';
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',mark); else mark();
})();


(function(){
  'use strict';

  function isPackageModeActive(p){
    try{
      if(p && p.packages && p.packages.active) return true;
      const el=document.getElementById('p-pack-active');
      return !!(el && el.checked);
    }catch(e){ return false; }
  }

  function isGeneralSimilarityWarning(w){
    const msg=String((w && w.msg) || '');
    // Paketli modda genel Jaccard / genel max ortak ayarları devre dışıdır.
    // Bu nedenle sadece genel ayarlardan doğan uyumsuzluk uyarısı gizlenir.
    // Paket isimleriyle gelen uyarılar korunur.
    const isGeneralJaccardMax = /^Jaccard\s+/i.test(msg) && /max ortak/i.test(msg) && /uyumsuz/i.test(msg);
    const mentionsPackage = /Ana dengeli paket|t=5 destek paketi|Kontrollü risk paketi|Çekirdek Destek Paketi|Ana Dengeli Paket/i.test(msg);
    return isGeneralJaccardMax && !mentionsPackage;
  }

  function patchRuleWarnings(){
    const old = window.getRuleWarnings || (typeof getRuleWarnings !== 'undefined' ? getRuleWarnings : null);
    if(!old || old._v79PackageWarningPatch) return;

    const wrapped = function(p){
      const list = old(p) || [];
      if(!isPackageModeActive(p)) return list;
      return list.filter(w => !isGeneralSimilarityWarning(w));
    };
    wrapped._v79PackageWarningPatch = true;
    window.getRuleWarnings = wrapped;
    try{ getRuleWarnings = wrapped; }catch(e){}

    const oldBlocking = window.getBlockingWarnings || (typeof getBlockingWarnings !== 'undefined' ? getBlockingWarnings : null);
    const wrappedBlocking = function(p){
      return (wrapped(p) || []).filter(w => w && w.type === 'red');
    };
    wrappedBlocking._v79PackageWarningPatch = true;
    window.getBlockingWarnings = wrappedBlocking;
    try{ getBlockingWarnings = wrappedBlocking; }catch(e){}
  }

  function markVersion(){
    const ver=document.querySelector('.badge-ver');
    if(ver) ver.textContent='v7.9';
    const sub=document.querySelector('.app-sub');
    if(sub) sub.textContent='Covering Design · Paketli Jaccard Uyarı Düzeltmesi · Sekme Düğmeleri Korundu';
    const app=document.querySelector('.app');
    if(app) app.setAttribute('data-version','v7.9-paketli-jaccard-uyari-duzeltme');
  }

  function init(){
    patchRuleWarnings();
    markVersion();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();


(function(){
  'use strict';
  const KEY='v712_start_end_quota_lock_settings';
  const $=id=>document.getElementById(id);
  const qsa=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const DEFAULT_ROWS=[
    {name:'Paket 1',sMin:1,sMax:20,eMin:45,eMax:51,count:15},
    {name:'Paket 2',sMin:20,sMax:30,eMin:40,eMax:51,count:21},
    {name:'Paket 3',sMin:20,sMax:30,eMin:39,eMax:46,count:15},
    {name:'Paket 4',sMin:21,sMax:30,eMin:39,eMax:51,count:9}
  ];
  function num(id,def){ const el=$(id); const v=parseInt(el&&el.value,10); return Number.isFinite(v)?v:def; }
  function bool(id,def){ const el=$(id); return el?!!el.checked:!!def; }
  function comboKey(c){ return (c||[]).slice().sort((a,b)=>a-b).join('-'); }
  function sortedCombo(raw){ return (Array.isArray(raw)?raw:[]).map(Number).filter(Number.isFinite).sort((a,b)=>a-b); }
  function common(a,b){ let i=0,j=0,c=0; while(i<a.length&&j<b.length){ if(a[i]===b[j]){c++;i++;j++;} else if(a[i]<b[j])i++; else j++; } return c; }
  function jac(a,b){ const c=common(a,b); return c/Math.max(1,(a.length+b.length-c)); }
  function hash(n,seed){ let x=((n+1)*1103515245 + (seed+31)*12345)>>>0; x^=x<<13; x^=x>>>17; x^=x<<5; return (x>>>0)/4294967295; }
  function fmt(n){ return Number(n||0).toLocaleString('tr-TR'); }
  function getTarget(p){ try{ if(p&&p.packages&&p.packages.active){ const a=p.packages; return (Number(a.main&&a.main.cols)||0)+(Number(a.deep&&a.deep.cols)||0)+(Number(a.risk&&a.risk.cols)||0)||Number(p.cols)||60; } }catch(e){} return Number(p&&p.cols)||num('p-cols',60)||60; }
  function loadSaved(){ try{ const o=JSON.parse(localStorage.getItem(KEY)||'null'); if(o&&Array.isArray(o.rows)) return o; }catch(e){} return null; }
  function saveSettings(){ try{ localStorage.setItem(KEY,JSON.stringify(getSettings())); }catch(e){} }
  function getRowsFromDom(){
    const rows=[];
    for(let i=0;i<4;i++) rows.push({
      name:'Paket '+(i+1),
      sMin:num('v712-se-smin-'+i,DEFAULT_ROWS[i].sMin),
      sMax:num('v712-se-smax-'+i,DEFAULT_ROWS[i].sMax),
      eMin:num('v712-se-emin-'+i,DEFAULT_ROWS[i].eMin),
      eMax:num('v712-se-emax-'+i,DEFAULT_ROWS[i].eMax),
      count:num('v712-se-count-'+i,DEFAULT_ROWS[i].count)
    });
    return rows;
  }
  function getSettings(){
    return {active:bool('v712-se-active',true),mode:(($('v712-se-mode')||{}).value||'quota'),rows:getRowsFromDom()};
  }
  function rowTotal(rows){ return (rows||[]).reduce((a,r)=>a+(Number(r.count)||0),0); }
  function rowMatches(combo,row){ const s=combo[0], e=combo[combo.length-1]; return s>=row.sMin && s<=row.sMax && e>=row.eMin && e<=row.eMax; }
  function rowLabel(r){ return `Başlangıç ${r.sMin}-${r.sMax}, Bitiş ${r.eMin}-${r.eMax}`; }
  function packageConfigs(p,target){
    try{
      const pack=p&&p.packages&&p.packages.active?p.packages:null;
      if(pack){
        const cfgs=[
          {name:'Ana Dengeli Paket',cols:Number(pack.main.cols)||0,j:Number(pack.main.jaccard)||0.60,c:Number(pack.main.maxCommon)||4,outMax:Number(pack.main.outMax)||40,mode:'clean'},
          {name:'Çekirdek Destek Paketi',cols:Number(pack.deep.cols)||0,j:Number(pack.deep.jaccard)||0.75,c:Number(pack.deep.maxCommon)||5,outMax:Number(pack.deep.outMax)||45,mode:'core'},
          {name:'Kontrollü Risk Paketi',cols:Number(pack.risk.cols)||0,j:Number(pack.risk.jaccard)||0.75,c:Number(pack.risk.maxCommon)||5,outMax:Number(pack.risk.outMax)||55,mode:'risk'}
        ].filter(x=>x.cols>0);
        const total=cfgs.reduce((a,b)=>a+b.cols,0);
        if(cfgs.length && total!==target) cfgs[cfgs.length-1].cols += (target-total);
        return cfgs;
      }
    }catch(e){}
    return [{name:'Genel Üretim',cols:target,j:Number(p&&p.jaccard)||0.60,c:Number(p&&p.maxCommon)||4,outMax:999,mode:'general'}];
  }
  function selectedStats(selected){
    let maxCommon=0,maxJ=0;
    for(let i=0;i<selected.length;i++) for(let j=i+1;j<selected.length;j++){ const cc=common(selected[i].combo,selected[j].combo); const jj=jac(selected[i].combo,selected[j].combo); if(cc>maxCommon)maxCommon=cc; if(jj>maxJ)maxJ=jj; }
    return {maxCommon,maxJ};
  }
  function canAddToCfg(item,selected,cfg,relax){
    if((Number(item.score)||0) > (Number(cfg.outMax)||999)) return false;
    const same=selected.filter(x=>x._pkg===cfg.name);
    for(const s of same){ const cc=common(item.combo,s.combo); if(!relax && (cc>cfg.c || jac(item.combo,s.combo)>cfg.j+1e-9)) return false; }
    return true;
  }
  function sortItems(list,seed,mode){
    const a=list.slice();
    a.sort((x,y)=>{
      if(mode==='risk') return (Number(y.score)||0)-(Number(x.score)||0) || hash(x.idx,seed)-hash(y.idx,seed);
      if(mode==='core') return Math.abs((Number(x.score)||0)-8)-Math.abs((Number(y.score)||0)-8) || hash(x.idx,seed)-hash(y.idx,seed);
      return (Number(x.score)||0)-(Number(y.score)||0) || hash(x.idx,seed)-hash(y.idx,seed);
    });
    return a;
  }
  function runStartEndSelection(scoredItems,p,settings){
    const target=getTarget(p);
    const rows=settings.rows.map((r,i)=>Object.assign({idx:i},r));
    const total=rowTotal(rows);
    const items=(scoredItems||[]).map((x,idx)=>({combo:sortedCombo(x.combo||x),score:Number(x.score)||0,idx,reasons:x.reasons||[],sum:sortedCombo(x.combo||x).reduce((a,b)=>a+b,0)})).filter(x=>x.combo.length===(Number(p&&p.k)||6));
    const rawRowCounts=rows.map(r=>items.filter(it=>rowMatches(it.combo,r)).length);
    if(total!==target){
      return {bestCount:0,target,ok:false,selected:[],bestName:'Başlangıç-Bitiş kota toplamı hatalı',stats:{maxCommon:0,maxJ:0},trials:[],status:'Kota toplamı hatalı',startEndSummary:{active:true,total,target,totalMismatch:true,rows:rows.map((r,i)=>({row:r,target:r.count,available:rawRowCounts[i],selected:0,missing:Math.max(0,r.count)})),packageDetails:[],message:`Başlangıç-Bitiş toplam kotası ${total}; hedef ${target}. Toplam hedefe eşit olmalı.`}};
    }
    const cfgs=packageConfigs(p,target);
    let best={selected:[],rowSel:[],pkgSel:{},relaxed:false,name:'Başlangıç-Bitiş kota kilidi'};
    const rowOrders=[rows.map(r=>r.idx), rows.slice().sort((a,b)=>rawRowCounts[a.idx]-rawRowCounts[b.idx]).map(r=>r.idx), rows.slice().sort((a,b)=>b.count-a.count).map(r=>r.idx)];
    for(let seed=1;seed<=36;seed++){
      for(const order of rowOrders){
        for(const relax of [false,true]){
          const selected=[], keys=new Set(), rowSel=rows.map(()=>0), pkgSel={}; cfgs.forEach(c=>pkgSel[c.name]=0);
          const pkgNeed=cfg=>Math.max(0,(Number(cfg.cols)||0)-(pkgSel[cfg.name]||0));
          for(const ri of order){
            const row=rows[ri];
            const candidates=sortItems(items.filter(it=>rowMatches(it.combo,row)),seed,(seed%3===0?'core':(seed%5===0?'risk':'clean')));
            for(const it of candidates){
              if(rowSel[ri]>=row.count || selected.length>=target) break;
              const key=comboKey(it.combo); if(keys.has(key)) continue;
              const cfgOrder=cfgs.slice().sort((a,b)=>pkgNeed(b)-pkgNeed(a) || (a.mode==='clean'?-1:1));
              let chosen=null;
              for(const cfg of cfgOrder){ if(pkgNeed(cfg)>0 && canAddToCfg(it,selected,cfg,relax)){ chosen=cfg; break; } }
              if(!chosen) continue;
              const cp=Object.assign({},it,{_pkg:chosen.name,_startEndRow:ri,_startEndLabel:rowLabel(row)});
              selected.push(cp); keys.add(key); rowSel[ri]++; pkgSel[chosen.name]=(pkgSel[chosen.name]||0)+1;
            }
          }
          if(selected.length>best.selected.length || (selected.length===best.selected.length && !relax && best.relaxed)){ best={selected,rowSel,pkgSel,relaxed:relax,name:relax?'Başlangıç-Bitiş kota kilidi · son aşamada benzerlik yumuşatma':'Başlangıç-Bitiş kota kilidi'}; }
          if(selected.length>=target) seed=999;
        }
      }
    }
    const rowDetails=rows.map((r,i)=>({row:r,target:r.count,available:rawRowCounts[i],selected:best.rowSel[i]||0,missing:Math.max(0,(Number(r.count)||0)-(best.rowSel[i]||0)),label:rowLabel(r)}));
    const pkgDetails=cfgs.map(c=>({name:c.name,target:c.cols,selected:best.pkgSel[c.name]||0,jaccard:c.j,maxCommon:c.c,outMax:c.outMax,trials:[{name:'seçilen',count:best.pkgSel[c.name]||0}]}));
    const ok=best.selected.length>=target && rowDetails.every(r=>r.missing<=0);
    const trials=rowDetails.map(r=>({name:`${r.row.name} · ${r.label}`,count:r.selected,target:r.target,available:r.available}));
    return {bestCount:best.selected.length,target,ok,selected:best.selected,bestName:best.name,stats:selectedStats(best.selected),trials,status:ok?'Uygun':'Başlangıç-Bitiş kotası eksik',packageDetails:pkgDetails,startEndSummary:{active:true,total,target,totalMismatch:false,rows:rowDetails,packageDetails:pkgDetails,relaxed:best.relaxed,message:ok?'Başlangıç-Bitiş kotaları 60 kolon içinde karşılandı.':'Başlangıç-Bitiş kotaları belirlenen adetlerde tamamlanamadı.'}};
  }
  function renderStartEndCard(){
    if($('v712-start-end-card')) return;
    const saved=loadSaved(); const rows=(saved&&saved.rows)||DEFAULT_ROWS; const active=saved?saved.active:true; const mode=saved?saved.mode:'quota';
    const card=document.createElement('div'); 


(function(){
'use strict';
// ── EMBED VERİLERİ ─────────────────────────────────────────────
const SD={"90":{"d":[[19,20,28,53,68,77],[2,24,35,74,82,89],[22,35,71,75,85,89],[2,8,55,73,79,88],[6,39,41,59,70,89],[18,36,38,48,53,81],[17,25,28,53,72,79],[18,30,50,55,72,82],[7,12,35,47,60,82],[3,37,62,64,70,87],[38,64,68,78,84,88],[11,19,27,34,35,81],[10,27,63,64,70,90],[12,17,38,48,64,68],[28,33,53,78,83,88],[3,6,38,48,66,69],[4,35,48,56,64,76],[3,13,24,48,76,81],[2,9,30,45,50,52],[5,13,26,42,62,80],[40,43,50,55,69,75],[19,29,42,59,72,82],[9,29,33,56,64,74],[4,16,23,63,66,76],[4,5,7,17,63,72],[14,19,40,41,43,78],[20,28,31,45,67,68],[6,13,26,47,67,71],[10,12,35,53,55,86],[23,38,47,61,78,83],[24,32,40,43,46,77],[24,29,52,57,64,71],[7,23,38,55,57,90],[12,32,57,67,80,82],[44,46,60,67,87,88],[18,26,29,58,65,80],[2,21,22,44,48,81],[4,14,27,33,41,84],[6,7,10,11,39,55],[31,35,66,68,71,82],[13,19,50,55,62,82],[1,3,8,33,49,71],[15,26,41,50,74,76],[34,45,66,73,74,79],[45,67,74,77,87,89],[8,30,65,67,72,80],[8,46,50,52,67,69],[21,42,51,53,57,74],[16,28,31,41,59,74],[6,42,67,74,78,83],[14,22,27,40,51,70],[6,24,30,40,63,78],[6,23,40,50,71,89],[2,21,27,62,74,81],[10,26,28,57,65,82],[2,3,8,41,68,90],[6,31,38,51,66,68],[3,23,55,59,69,82],[13,24,44,79,80,89],[4,12,37,50,64,89],[30,47,58,68,70,78],[13,14,19,25,32,45],[36,57,59,67,80,85],[9,13,29,41,74,82],[13,24,30,40,60,75],[19,24,41,44,56,71],[5,27,52,64,73,83],[3,6,8,28,55,82],[2,3,17,48,68,82],[7,57,67,70,74,86],[30,38,43,54,62,71],[8,29,38,73,76,88],[14,38,56,73,74,87],[2,6,19,47,53,62],[16,33,61,63,72,84],[7,20,32,41,56,72],[14,23,24,27,49,85],[24,34,59,60,61,70],[18,32,35,72,80,87],[5,15,59,61,82,86],[17,27,31,32,43,65],[33,43,46,66,72,90],[1,8,25,38,71,83],[2,16,32,75,76,86],[4,18,39,87,89,90],[14,45,49,68,79,81],[7,14,16,20,27,62],[33,45,47,50,72,76],[2,6,12,18,36,53],[4,6,25,45,57,62],[16,20,27,46,57,79],[1,7,10,15,33,71],[1,29,43,53,75,88],[10,13,18,39,63,85],[2,10,53,73,77,90],[24,36,50,63,65,68],[6,12,15,16,19,55],[4,27,37,41,48,73],[23,31,41,48,58,75],[8,12,15,23,34,56],[4,28,40,54,57,65],[14,35,57,70,76,83],[6,32,43,49,77,87],[18,48,53,61,64,65],[39,59,62,68,76,77],[14,24,49,60,61,83],[5,25,61,73,74,82],[7,23,39,41,47,82],[3,35,39,40,49,90],[5,32,36,58,64,68],[2,3,12,36,39,87],[7,19,29,30,32,33],[27,35,39,57,61,88],[5,7,14,23,26,33],[34,37,51,62,70,80],[5,6,7,44,72,79],[2,40,44,50,56,77],[4,10,36,45,65,83],[5,23,24,29,33,53],[24,37,45,55,60,62],[20,45,46,50,62,80],[4,6,12,30,67,70],[19,31,41,52,70,71],[6,18,20,38,62,85],[22,36,43,46,80,88],[12,20,39,48,59,62],[4,5,13,22,35,53],[12,19,50,58,62,73],[7,10,19,30,41,59],[26,38,41,45,70,73],[4,29,52,58,72,83],[12,48,51,71,76,78],[5,7,15,22,25,74],[9,22,47,49,55,73],[8,17,60,73,84,90],[4,13,36,48,53,80],[8,18,61,71,75,79],[11,12,27,71,76,87],[5,38,65,68,69,75],[24,41,45,58,72,90],[15,22,27,38,56,71],[7,20,25,28,78,88],[4,8,12,24,30,54],[3,13,16,25,50,84],[37,39,48,54,85,90],[7,12,27,53,72,77],[28,35,60,76,80,88],[31,42,65,76,81,87],[40,54,55,60,80,84],[8,12,18,22,25,32],[4,35,41,46,75,80],[16,29,46,61,80,87],[7,14,23,53,57,87],[35,37,49,60,72,89],[26,30,45,70,78,88],[38,40,49,55,61,77],[16,34,41,63,71,82],[6,22,58,84,87,90],[22,25,37,40,80,88],[5,11,21,29,45,72],[24,1,58,79,87,90],[6,29,32,60,62,72],[10,27,33,49,50,61],[8,25,33,42,50,51],[5,11,15,30,66,86],[1,10,56,66,67,78],[15,34,53,63,64,88],[1,5,18,33,47,56],[33,41,66,74,80,81],[13,31,37,42,77,80],[31,43,52,53,63,66],[11,18,40,43,59,88],[38,40,41,45,49,69],[11,26,35,48,53,57],[12,14,15,66,76,77],[1,9,13,20,66,79],[8,38,53,75,84,90],[19,20,36,48,53,66],[3,18,19,23,27,87],[27,45,59,67,79,84],[5,9,29,30,31,63],[8,18,21,41,43,73],[11,12,33,47,49,70],[13,39,59,70,73,80],[7,28,30,59,62,77],[15,18,24,29,61,75],[37,47,57,62,75,90],[2,9,28,43,59,61],[7,31,37,65,79,87],[30,32,48,65,82,85],[2,8,18,27,67,87],[38,42,62,66,75,77],[10,52,65,73,87,88],[1,23,40,43,53,59],[1,5,29,36,54,57],[26,42,69,70,74,88],[10,40,46,47,57,72],[1,9,32,48,56,58],[2,20,34,46,55,60],[13,31,34,64,69,88],[6,7,25,48,78,89],[37,38,41,64,76,80],[11,29,33,51,56,86],[4,38,56,61,68,70],[17,29,50,71,76,89],[1,2,14,34,54,56],[1,18,46,54,70,88],[2,20,28,44,57,88],[13,25,30,33,82,86],[1,24,31,32,40,81],[47,59,64,68,74,82],[14,28,42,54,64,89],[5,21,30,32,42,75],[8,36,59,60,68,75],[5,16,54,58,68,84],[2,42,50,57,59,90],[1,21,46,61,71,78],[1,20,34,43,88,90],[9,16,31,51,73,83],[1,7,19,43,56,82],[5,27,34,58,77,86],[20,40,46,69,78,80],[1,31,32,49,50,75],[3,12,17,56,69,76],[7,15,38,46,68,80],[28,34,56,70,73,86],[10,12,74,80,81,82],[10,13,18,31,55,63],[16,27,44,49,62,73],[3,16,40,44,50,77],[15,38,45,47,57,71],[27,42,47,69,76,85],[11,12,23,24,55,80],[15,25,62,65,77,86],[5,18,29,33,70,81],[2,25,36,58,79,80],[28,51,54,56,59,74],[5,29,30,64,84,89],[4,18,46,47,64,66],[15,33,36,74,78,81],[4,33,37,43,46,63],[9,12,26,38,63,69],[33,54,66,78,80,89],[3,18,22,26,48,85],[8,28,43,57,75,87],[8,13,14,41,47,84],[14,35,38,53,60,89],[20,33,52,54,59,76],[8,21,22,27,49,67],[4,20,43,52,69,89],[8,33,50,59,71,77],[2,9,10,20,44,69],[49,51,63,67,89,90],[27,37,44,46,79,81],[4,7,30,34,48,80],[22,40,54,55,61,62],[30,37,39,65,77,90],[49,53,54,63,67,68],[5,21,25,35,56,82],[3,14,16,54,58,69],[23,44,53,58,88,90],[17,27,48,50,71,88],[1,17,25,35,44,90],[9,19,26,41,77,89],[14,35,56,60,82,87],[4,5,13,15,48,90],[8,13,16,30,38,84],[57,58,62,66,84,89],[15,30,35,45,61,68],[23,45,48,51,73,90],[3,20,34,45,60,71],[35,45,48,50,63,69],[10,13,19,39,87,89],[6,12,16,29,63,72],[3,6,36,45,67,82],[3,19,32,66,71,81],[1,8,10,37,54,77],[16,24,37,73,77,85],[2,19,34,35,38,61],[19,46,54,56,80,82],[15,17,46,51,66,72],[10,13,35,42,60,87],[28,50,52,61,79,89],[3,24,54,72,75,84],[14,21,45,56,70,76],[1,18,31,46,61,84],[1,38,56,60,64,87],[7,23,45,58,60,73],[42,52,57,60,63,73],[2,8,23,48,63,83],[6,29,38,69,78,79],[15,24,31,40,48,90],[6,35,44,53,57,85],[26,32,35,43,56,81],[10,12,32,60,77,87],[13,36,40,44,53,75],[8,40,46,47,57,84],[18,33,38,48,52,75],[18,26,44,63,64,72],[19,30,45,57,78,87],[12,16,33,62,80,84],[23,32,48,51,58,89],[18,20,47,63,64,77],[2,12,13,51,75,89],[3,11,24,33,61,82],[6,7,24,33,35,90],[12,16,45,55,88,90],[6,34,49,61,69,86],[6,34,55,65,74,86],[23,28,44,58,69,78],[18,28,38,41,43,73],[19,28,44,62,73,81],[13,26,30,34,37,56],[6,7,24,51,52,86],[30,42,53,65,79,80],[21,30,42,43,48,50],[25,36,55,61,64,87],[13,32,44,55,57,90],[2,7,19,50,53,54],[5,17,21,52,56,85],[3,26,32,61,82,83],[8,23,44,77,84,86],[10,20,23,47,64,68],[28,47,71,77,81,85],[37,38,49,69,84,90],[3,48,61,71,81,82],[8,15,26,32,47,88],[16,23,24,41,63,85],[4,7,32,42,58,64],[8,55,60,64,70,81],[28,35,36,37,40,73],[27,38,39,42,48,51],[20,32,47,62,72,88],[8,21,27,45,70,82],[6,19,46,49,59,64],[14,17,31,55,56,69],[3,6,18,31,62,87],[9,47,62,68,77,90],[15,19,39,60,69,83],[7,37,44,51,61,66],[3,18,68,84,87,88],[28,34,45,60,71,80],[5,56,59,62,78,84],[27,42,57,65,67,83],[2,8,23,50,51,68],[9,11,46,48,49,86],[35,42,56,58,69,87],[8,19,47,54,56,78],[9,10,17,23,30,60],[1,22,36,58,76,87],[37,69,71,74,77,88],[10,11,47,57,60,67],[7,10,15,31,52,77],[15,36,40,63,74,79],[1,29,40,45,63,74],[36,40,50,53,70,76],[3,42,47,64,71,74],[23,26,29,41,69,77],[15,30,48,53,76,77],[9,13,79,83,84,89],[16,18,25,26,71,83],[22,57,60,62,64,83],[3,5,37,50,52,62],[9,17,20,33,63,75],[10,25,31,45,65,77],[13,26,38,55,60,63],[7,11,21,22,27,63],[27,44,60,67,68,88],[14,28,41,45,49,62],[4,33,35,62,65,76],[45,49,51,60,71,86],[3,18,50,54,66,86],[20,21,31,45,46,87],[33,38,47,57,81,85],[40,41,46,62,74,85],[17,39,44,60,68,87],[43,55,56,60,64,66],[18,20,42,50,54,85],[1,16,45,50,54,78],[33,45,53,80,85,89],[4,10,24,41,87,88],[1,13,20,78,86,87],[27,36,41,47,59,67],[9,22,29,53,72,87],[14,16,44,59,70,89],[5,29,36,39,47,51],[43,48,51,69,82,86],[13,42,44,52,67,75],[32,35,36,47,62,63],[25,28,40,50,53,90],[2,5,15,23,36,49],[24,25,31,68,74,75],[3,49,55,76,81,86],[31,33,38,56,67,78],[43,60,68,71,74,90],[24,30,56,60,63,85],[6,19,44,45,50,81],[22,34,36,46,50,69],[8,42,64,76,83,86],[2,31,33,65,69,87],[6,34,46,66,71,83],[1,2,11,20,21,41],[11,20,42,47,54,57],[35,37,59,60,75,85],[13,18,32,37,58,75],[49,51,60,61,66,73],[2,12,15,31,48,58],[4,59,76,83,86,90],[10,14,38,43,50,81],[19,26,28,38,59,77],[20,22,36,65,66,69],[5,22,39,61,75,80],[3,19,45,58,62,88],[22,27,28,62,75,76],[32,50,57,69,70,75],[15,23,25,76,79,89],[1,11,34,40,60,72],[26,34,38,43,68,76],[39,40,42,45,50,55],[14,45,67,73,82,88],[11,14,50,54,61,73],[3,14,20,40,79,84],[1,2,13,16,24,47],[12,35,45,60,68,70],[3,37,70,80,86,90],[29,36,38,43,49,78],[6,20,40,46,47,48],[1,29,36,48,60,89],[15,30,72,76,78,79],[9,18,24,42,76,86],[17,20,32,33,49,57],[37,45,48,55,73,84],[45,58,66,79,84,89],[5,6,31,66,67,77],[39,59,60,63,81,84],[20,36,39,69,71,75],[21,34,40,51,79,88],[18,26,34,43,52,80],[4,32,64,71,82,89],[1,26,34,56,64,67],[33,45,63,66,74,89],[10,20,23,30,83,89],[4,12,31,38,68,83],[12,34,52,56,59,82],[25,28,44,60,77,89],[5,30,55,62,66,78],[14,28,41,45,66,87],[21,30,31,40,51,71],[27,42,45,53,63,81],[10,37,45,67,73,84],[4,16,37,38,64,81],[7,14,52,71,77,87],[3,19,24,41,46,50],[14,19,72,73,75,82],[51,64,69,70,78,85],[18,51,64,66,84,87],[10,25,39,47,52,72],[9,22,27,50,74,86],[7,30,32,33,34,35],[4,9,34,38,89,90],[1,12,46,58,80,86],[2,37,39,45,50,52],[1,12,41,49,55,71],[15,56,67,69,88,89],[24,26,43,54,62,85],[1,7,10,30,49,66],[8,15,47,63,69,86],[20,22,32,46,56,75],[11,37,38,40,49,78],[18,36,45,48,49,69],[3,14,18,51,62,68],[14,29,40,46,79,89],[10,13,20,31,69,87],[25,49,66,80,81,88],[17,30,35,62,89,90],[9,15,46,47,57,67],[21,29,66,67,82,87],[7,18,45,47,61,88],[34,39,43,49,56,57],[8,11,41,58,84,87],[8,25,53,62,71,82],[12,15,45,62,74,84],[7,8,11,20,46,76],[35,41,42,46,70,87],[5,6,18,25,48,72],[9,26,39,43,56,64],[38,42,63,65,82,85],[1,2,11,33,38,89],[5,20,21,31,40,51],[25,36,39,47,55,58],[2,11,47,61,80,89],[10,28,38,70,86,89],[21,33,49,50,51,55],[23,25,36,38,82,83],[6,37,66,72,77,83],[3,29,58,68,69,77],[11,14,15,25,26,74],[11,18,30,60,81,84],[11,28,29,58,68,78],[5,30,78,81,83,90]],"t":["2026-05-23","2026-05-20","2026-05-18","2026-05-16","2026-05-13","2026-05-11","2026-05-09","2026-05-06","2026-05-04","2026-05-02","2026-04-29","2026-04-27","2026-04-25","2026-04-22","2026-04-20","2026-04-18","2026-04-15","2026-04-13","2026-04-11","2026-04-08","2026-04-06","2026-04-04","2026-04-01","2026-03-30","2026-03-28","2026-03-25","2026-03-23","2026-03-21","2026-03-18","2026-03-16","2026-03-14","2026-03-11","2026-03-09","2026-03-07","2026-03-04","2026-03-02","2026-02-28","2026-02-25","2026-02-23","2026-02-21","2026-02-18","2026-02-16","2026-02-14","2026-02-11","2026-02-09","2026-02-07","2026-02-04","2026-02-02","2026-01-31","2026-01-28","2026-01-26","2026-01-24","2026-01-21","2026-01-19","2026-01-17","2026-01-14","2026-01-12","2026-01-10","2026-01-07","2026-01-05","2026-01-03","2025-12-31","2025-12-29","2025-12-27","2025-12-24","2025-12-22","2025-12-20","2025-12-17","2025-12-15","2025-12-13","2025-12-10","2025-12-08","2025-12-06","2025-12-03","2025-12-01","2025-11-29","2025-11-26","2025-11-24","2025-11-22","2025-11-19","2025-11-17","2025-11-15","2025-11-12","2025-11-10","2025-11-08","2025-11-05","2025-11-03","2025-11-01","2025-10-29","2025-10-27","2025-10-25","2025-10-22","2025-10-20","2025-10-18","2025-10-15","2025-10-13","2025-10-11","2025-10-08","2025-10-06","2025-10-04","2025-10-01","2025-09-29","2025-09-27","2025-09-24","2025-09-22","2025-09-20","2025-09-17","2025-09-15","2025-09-13","2025-09-10","2025-09-08","2025-09-06","2025-09-03","2025-09-01","2025-08-30","2025-08-27","2025-08-25","2025-08-23","2025-08-20","2025-08-18","2025-08-16","2025-08-13","2025-08-11","2025-08-09","2025-08-06","2025-08-04","2025-08-02","2025-07-30","2025-07-28","2025-07-26","2025-07-23","2025-07-21","2025-07-19","2025-07-16","2025-07-12","2025-07-09","2025-07-07","2025-07-05","2025-07-02","2025-06-30","2025-06-28","2025-06-25","2025-06-23","2025-06-21","2025-06-18","2025-06-16","2025-06-14","2025-06-11","2025-06-09","2025-06-07","2025-06-04","2025-06-02","2025-05-31","2025-05-28","2025-05-26","2025-05-24","2025-05-21","2025-05-19","2025-05-17","2025-05-14","2025-05-12","2025-05-10","2025-05-07","2025-05-05","2025-05-03","2025-04-30","2025-04-28","2025-04-26","2025-04-23","2025-04-21","2025-04-19","2025-04-16","2025-04-14","2025-04-12","2025-04-09","2025-04-07","2025-04-05","2025-04-02","2025-03-31","2025-03-29","2025-03-26","2025-03-24","2025-03-22","2025-03-19","2025-03-17","2025-03-15","2025-03-12","2025-03-10","2025-03-08","2025-03-05","2025-03-03","2025-03-01","2025-02-26","2025-02-24","2025-02-22","2025-02-19","2025-02-17","2025-02-15","2025-02-12","2025-02-10","2025-02-08","2025-02-05","2025-02-03","2025-02-01","2025-01-29","2025-01-27","2025-01-25","2025-01-22","2025-01-20","2025-01-18","2025-01-15","2025-01-13","2025-01-11","2025-01-08","2025-01-06","2025-01-04","2025-01-01","2024-12-30","2024-12-28","2024-12-25","2024-12-23","2024-12-21","2024-12-18","2024-12-16","2024-12-14","2024-12-11","2024-12-09","2024-12-07","2024-12-04","2024-12-02","2024-11-30","2024-11-27","2024-11-25","2024-11-23","2024-11-20","2024-11-18","2024-11-16","2024-11-13","2024-11-11","2024-11-09","2024-11-06","2024-11-04","2024-11-02","2024-10-30","2024-10-28","2024-10-26","2024-10-23","2024-10-21","2024-10-19","2024-10-16","2024-10-14","2024-10-12","2024-10-09","2024-10-07","2024-10-05","2024-10-02","2024-09-30","2024-09-28","2024-09-25","2024-09-23","2024-09-21","2024-09-18","2024-09-16","2024-09-14","2024-09-11","2024-09-09","2024-09-07","2024-09-04","2024-09-02","2024-08-31","2024-08-28","2024-08-26","2024-08-24","2024-08-21","2024-08-19","2024-08-17","2024-08-14","2024-08-12","2024-08-10","2024-08-07","2024-08-05","2024-08-03","2024-07-31","2024-07-29","2024-07-27","2024-07-24","2024-07-22","2024-07-20","2024-07-17","2024-07-15","2024-07-13","2024-07-10","2024-07-08","2024-07-06","2024-07-03","2024-07-01","2024-06-29","2024-06-26","2024-06-24","2024-06-22","2024-06-19","2024-06-17","2024-06-15","2024-06-12","2024-06-10","2024-06-08","2024-06-05","2024-06-03","2024-06-01","2024-05-29","2024-05-27","2024-05-25","2024-05-22","2024-05-20","2024-05-18","2024-05-15","2024-05-13","2024-05-11","2024-05-08","2024-05-06","2024-05-04","2024-05-01","2024-04-29","2024-04-27","2024-04-24","2024-04-22","2024-04-20","2024-04-17","2024-04-15","2024-04-13","2024-04-10","2024-04-08","2024-04-06","2024-04-03","2024-04-01","2024-03-30","2024-03-27","2024-03-25","2024-03-23","2024-03-20","2024-03-18","2024-03-16","2024-03-13","2024-03-11","2024-03-09","2024-03-06","2024-03-04","2024-03-02","2024-02-28","2024-02-26","2024-02-24","2024-02-21","2024-02-19","2024-02-17","2024-02-14","2024-02-12","2024-02-10","2024-02-07","2024-02-05","2024-01-31","2024-01-29","2024-01-27","2024-01-24","2024-01-22","2024-01-20","2024-01-17","2024-01-15","2024-01-13","2024-01-10","2024-01-08","2024-01-06","2024-01-03","2024-01-01","2023-12-30","2023-12-30","2023-12-27","2023-12-25","2023-12-23","2023-12-20","2023-12-18","2023-12-16","2023-12-13","2023-12-11","2023-12-09","2023-12-06","2023-12-04","2023-12-02","2023-11-29","2023-11-27","2023-11-25","2023-11-22","2023-11-20","2023-11-18","2023-11-15","2023-11-13","2023-11-11","2023-11-08","2023-11-06","2023-11-04","2023-11-01","2023-10-30","2023-10-28","2023-10-25","2023-10-23","2023-10-21","2023-10-18","2023-10-16","2023-10-14","2023-10-11","2023-10-09","2023-10-07","2023-10-04","2023-10-02","2023-09-30","2023-09-27","2023-09-25","2023-09-23","2023-09-20","2023-09-18","2023-09-16","2023-09-13","2023-09-11","2023-09-09","2023-09-06","2023-09-04","2023-09-02","2023-08-30","2023-08-28","2023-08-26","2023-08-23","2023-08-21","2023-08-19","2023-08-16","2023-08-14","2023-08-12","2023-08-02","2023-08-07","2023-06-05","2023-08-02","2023-07-31","2023-07-29","2023-07-26","2023-07-24","2023-07-22","2023-07-19","2023-07-17","2023-07-15","2023-07-12","2023-07-10","2023-07-08","2023-07-05","2023-07-03","2023-07-01","2023-06-18","2023-06-26","2023-06-24","2023-06-21","2023-06-19","2023-06-17","2023-06-14","2023-06-12","2023-06-10","2023-06-07","2023-06-05","2023-06-03","2023-05-31","2023-05-29","2023-05-27","2023-05-24","2023-05-22","2023-05-20","2023-05-19","2023-05-15","2023-05-13","2023-05-10","2023-05-08","2023-05-06","2023-05-03","2023-05-01","2023-04-29","2023-04-26","2023-04-24","2023-04-22","2023-04-19","2023-04-17","2023-04-15","2023-04-12","2023-04-10","2023-04-08","2023-04-05","2023-04-03","2023-04-01","2023-03-29","2023-03-27","2023-03-25","2023-03-22","2023-03-20","2023-03-18","2023-03-15","2023-03-13"],"j":[47,67,30,47,21,74,61,40,15,47,73,29,61,84,21,89,46,74,37,87,62,27,12,48,86,46,24,89,89,81,17,53,87,22,21,21,42,68,70,15,90,64,1,29,37,26,64,69,35,2,57,9,4,33,34,5,88,36,39,41,37,23,18,39,47,23,44,17,29,4,74,13,29,56,60,44,22,53,85,62,26,35,80,23,14,58,81,80,75,88,53,4,90,60,36,71,32,76,60,58,14,36,29,31,23,6,68,40,4,10,29,60,69,85,12,11,89,84,14,68,54,56,23,81,21,51,42,36,3,7,7,46,46,19,83,51,10,38,86,73,66,67,30,47,21,74,61,40,15,47,73,29,61,84,21,89,46,74,37,87,62,27,12,48,86,46,24,89,89,81,17,53,87,22,21,21,42,68,70,15,90,64,1,29,37,26,64,69,35,2,57,9,4,33,34,5,88,36,39,41,37,23,18,39,47,23,44,17,29,4,74,13,29,56,60,44,22,53,85,62,26,35,80,23,14,58,81,80,75,88,53,4,90,60,36,71,32,76,60,58,14,36,29,31,23,6,68,40,4,10,29,60,69,85,12,11,89,84,14,68,54,56,23,81,21,51,42,36,3,7,7,46,46,19,83,51,10,38,86,73,66,60,44,22,53,85,62,26,35,80,23,14,58,81,80,75,88,53,4,90,60,36,71,32,76,60,58,14,36,29,31,23,6,68,40,4,10,29,60,69,85,12,11,89,84,14,68,54,56,23,81,21,51,42,36,3,7,7,46,46,19,83,51,10,38,86,73,66,67,30,47,21,74,61,40,15,47,73,29,61,84,21,89,46,74,37,87,62,27,12,48,86,46,24,89,89,81,17,53,87,22,21,21,42,68,70,15,90,64,1,29,37,26,64,69,35,2,57,9,4,33,34,5,88,36,39,41,37,23,18,39,47,23,44,17,29,4,74,13,29,56,60,44,22,53,85,62,26,35,80,23,14,58,81,80,75,88,53,4,90,60,36,71,32,76,60,58,14,36,29,31,23,6,68,40,4,10,29,60,69,85,12,11,89,84,14,68,54,56,23,81,21,51,42,36,3,7,7,46,46,19,83,51,10,38,86,73,66,60,44,22,53,85,62,26,35,80,23,14,58],"fo":{"68":{"86":11,"23":10,"39":9,"55":9,"14":9,"25":9,"45":9,"24":8,"82":8,"28":8,"47":8,"50":8},"77":{"63":10,"24":9,"69":9,"36":8,"60":8,"13":8,"15":8,"61":7,"37":7,"74":6,"64":6,"71":6},"47":{"60":14,"89":12,"84":9,"69":9,"29":9,"2":8,"35":8,"39":8,"70":8,"38":8,"85":8,"75":8},"19":{"27":8,"73":8,"64":7,"33":7,"56":7,"45":7,"68":7,"8":7,"34":7,"82":6,"63":6,"80":6},"20":{"47":10,"45":8,"89":7,"13":7,"67":7,"49":7,"1":7,"8":7,"31":7,"24":6,"35":6,"71":6},"53":{"71":13,"18":10,"35":9,"38":9,"84":9,"45":9,"89":8,"72":8,"50":8,"48":8,"62":8,"56":8},"28":{"30":10,"3":10,"5":8,"2":7,"82":7,"38":7,"13":7,"78":7,"6":6,"69":6,"71":6,"42":6},"2":{"1":9,"46":9,"70":7,"33":7,"31":7,"86":7,"83":7,"71":6,"89":6,"6":6,"41":6,"4":6},"35":{"45":10,"89":9,"48":9,"87":8,"90":8,"26":8,"8":7,"70":7,"23":7,"78":7,"19":7,"32":7},"67":{"71":10,"65":8,"80":8,"67":7,"46":7,"29":7,"50":7,"52":7,"14":7,"63":7,"22":6,"35":6},"74":{"30":12,"40":10,"28":9,"45":9,"23":9,"63":9,"60":9,"76":8,"67":8,"74":7,"8":7,"41":7},"82":{"60":9,"3":9,"32":9,"1":8,"15":8,"7":7,"62":7,"67":7,"89":6,"64":6,"13":6,"27":6},"24":{"71":12,"45":11,"6":9,"5":9,"89":8,"50":8,"52":8,"13":8,"62":8,"35":7,"64":7,"19":7},"89":{"71":10,"81":10,"30":10,"66":10,"64":9,"47":9,"77":9,"1":9,"22":8,"12":8,"80":8,"68":8},"71":{"88":13,"56":11,"15":10,"1":10,"38":9,"62":9,"69":9,"2":8,"12":8,"86":8,"23":8,"57":8},"75":{"88":10,"8":9,"3":8,"57":7,"76":7,"56":6,"71":6,"18":6,"87":6,"25":6,"45":6,"62":6},"85":{"23":10,"2":9,"87":9,"1":8,"82":7,"37":7,"7":7,"45":7,"55":6,"34":6,"80":6,"43":6},"22":{"88":12,"70":9,"87":8,"12":8,"45":8,"28":7,"37":7,"8":6,"73":6,"44":6,"60":6,"14":6},"30":{"38":9,"45":8,"8":7,"25":7,"66":7,"81":7,"73":6,"13":6,"62":6,"80":6,"46":6,"50":6},"8":{"74":9,"48":9,"9":8,"41":7,"46":7,"87":7,"16":7,"75":7,"13":7,"11":7,"84":7,"20":7},"73":{"48":12,"47":10,"19":8,"23":8,"88":8,"59":7,"8":7,"28":7,"73":7,"2":7,"58":7,"15":7},"79":{"25":7,"89":6,"18":6,"30":6,"72":6,"20":6,"71":6,"48":6,"24":6,"77":5,"87":5,"7":5},"55":{"82":8,"66":8,"45":8,"67":7,"71":7,"44":7,"18":7,"69":7,"89":6,"12":6,"78":6,"49":6},"88":{"6":11,"57":11,"45":11,"89":9,"5":9,"1":9,"88":9,"18":8,"80":8,"56":8,"49":8,"78":8},"70":{"18":9,"49":9,"6":8,"38":7,"72":7,"77":7,"12":6,"71":6,"40":6,"19":6,"79":6,"36":5},"6":{"64":10,"82":9,"48":8,"68":8,"71":8,"6":8,"69":8,"53":7,"56":7,"55":7,"27":7,"40":7},"39":{"88":8,"82":7,"12":7,"64":7,"49":7,"36":6,"53":6,"66":6,"68":6,"37":6,"60":6,"61":6},"41":{"6":9,"15":9,"18":8,"11":8,"56":8,"38":7,"48":7,"53":7,"31":7,"39":7,"73":7,"58":7},"21":{"48":11,"3":9,"1":9,"13":9,"18":8,"69":8,"59":8,"20":8,"61":8,"88":8,"52":8,"36":7},"59":{"29":10,"5":9,"69":8,"36":7,"64":6,"13":6,"44":6,"71":6,"9":5,"56":5,"24":5,"31":5},"36":{"61":10,"40":10,"79":9,"74":9,"45":9,"47":9,"24":8,"29":8,"68":8,"12":8,"19":8,"77":8},"38":{"48":9,"40":9,"46":9,"28":8,"11":8,"33":8,"88":8,"56":8,"12":8,"20":8,"72":7,"19":7},"48":{"25":10,"8":10,"53":8,"76":8,"77":8,"18":8,"72":7,"79":7,"13":7,"45":7,"63":7,"58":7},"81":{"10":8,"40":8,"77":8,"37":8,"63":7,"30":7,"52":7,"46":7,"14":7,"33":7,"38":7,"28":6},"18":{"45":10,"57":10,"62":10,"25":9,"87":9,"28":8,"60":8,"68":8,"33":8,"2":7,"44":7,"14":7},"72":{"78":9,"56":8,"82":7,"88":7,"45":7,"50":6,"64":6,"69":6,"1":6,"76":6,"26":6,"13":6},"17":{"60":7,"43":6,"13":6,"3":5,"86":5,"1":5,"25":5,"45":5,"18":4,"50":4,"55":4,"82":4},"25":{"72":9,"9":9,"22":9,"30":8,"89":8,"55":7,"16":7,"49":7,"90":7,"11":7,"60":7,"18":6},"61":{"87":10,"65":9,"23":9,"71":9,"24":8,"32":8,"43":8,"77":8,"7":8,"37":8,"84":8,"25":7},"40":{"45":12,"32":11,"36":11,"40":10,"44":10,"47":9,"57":9,"1":9,"29":8,"59":8,"64":8,"71":8},"50":{"3":9,"42":8,"36":8,"33":7,"45":7,"21":7,"2":7,"4":7,"69":7,"12":6,"82":6,"19":6},"7":{"35":11,"88":10,"70":9,"43":9,"48":9,"60":9,"3":8,"62":8,"49":8,"45":8,"34":8,"63":8},"12":{"13":10,"4":9,"25":9,"23":8,"47":8,"41":8,"7":8,"19":8,"80":8,"62":7,"33":7,"78":7},"15":{"1":10,"47":10,"13":9,"66":9,"79":9,"9":9,"86":9,"37":8,"4":8,"40":8,"18":8,"56":8},"60":{"5":13,"50":13,"18":12,"58":11,"78":11,"37":10,"7":10,"23":10,"61":10,"45":10,"76":10,"52":10},"64":{"28":12,"3":10,"64":9,"33":9,"66":9,"74":9,"47":9,"87":9,"60":9,"78":8,"55":8,"26":8},"3":{"15":10,"68":9,"45":9,"29":9,"8":9,"38":8,"31":8,"23":8,"64":7,"26":7,"71":7,"75":7},"37":{"61":10,"38":9,"49":9,"64":8,"68":8,"45":8,"48":8,"78":7,"88":7,"26":7,"7":7,"12":7},"87":{"47":12,"60":11,"88":10,"80":10,"53":9,"45":9,"87":9,"71":9,"68":8,"40":8,"57":8,"67":8},"62":{"29":11,"72":10,"33":10,"57":10,"65":9,"45":9,"60":9,"62":9,"50":8,"5":8,"7":8,"89":8},"78":{"45":9,"18":9,"40":8,"38":7,"27":6,"34":6,"48":6,"66":6,"24":6,"43":6,"22":6,"23":6},"84":{"25":10,"53":8,"56":8,"48":8,"18":8,"71":8,"78":7,"7":7,"20":7,"41":7,"29":7,"66":7},"34":{"89":9,"54":8,"6":8,"64":7,"74":7,"80":7,"28":7,"55":7,"63":6,"45":6,"87":6,"40":6},"11":{"10":9,"70":9,"90":8,"68":8,"71":7,"77":7,"69":7,"75":7,"23":7,"40":6,"56":6,"5":6},"27":{"33":9,"10":8,"27":8,"68":8,"50":8,"63":7,"7":7,"8":7,"75":7,"32":7,"78":6,"65":6},"29":{"7":12,"48":11,"30":11,"64":10,"13":10,"73":10,"53":10,"61":10,"90":9,"74":9,"76":9,"2":9},"10":{"8":11,"68":9,"77":9,"63":8,"12":7,"38":7,"90":7,"53":7,"36":7,"50":7,"28":7,"23":6},"90":{"71":12,"43":10,"38":9,"49":9,"46":9,"68":8,"80":8,"8":8,"13":8,"63":8,"36":8,"53":8},"63":{"63":9,"2":9,"45":9,"12":8,"7":8,"6":8,"78":7,"89":7,"10":7,"84":7,"38":6,"5":6},"33":{"45":11,"41":9,"71":9,"6":8,"10":8,"1":8,"83":8,"89":8,"23":7,"26":7,"25":7,"12":7},"83":{"77":8,"11":8,"3":7,"66":7,"32":7,"2":7,"13":7,"37":7,"83":7,"38":6,"51":6,"82":6},"66":{"87":12,"20":9,"3":8,"28":8,"88":8,"10":8,"31":8,"21":8,"5":7,"63":7,"62":7,"89":7},"69":{"80":11,"46":10,"24":9,"14":9,"48":8,"51":8,"13":8,"44":8,"89":8,"56":7,"64":7,"42":7},"4":{"71":11,"58":10,"23":9,"87":9,"81":8,"19":8,"43":8,"78":8,"62":8,"38":8,"46":8,"1":8},"76":{"69":8,"42":8,"46":8,"9":7,"50":7,"14":7,"87":7,"49":7,"40":7,"55":7,"86":7,"24":6},"46":{"87":15,"29":12,"1":10,"69":10,"48":9,"57":9,"58":9,"6":9,"72":9,"13":8,"20":8,"31":8},"56":{"54":9,"3":8,"81":8,"63":8,"27":8,"60":8,"89":8,"24":7,"23":7,"66":7,"52":7,"84":7},"13":{"12":9,"61":9,"53":8,"89":8,"50":7,"75":7,"8":7,"49":7,"13":7,"24":7,"60":7,"73":7},"9":{"87":10,"89":8,"18":8,"42":7,"60":7,"90":7,"33":7,"73":6,"65":6,"80":5,"16":5,"63":5},"45":{"45":11,"80":10,"5":9,"62":9,"67":9,"71":9,"46":9,"60":9,"20":8,"61":8,"13":7,"6":7},"52":{"62":8,"71":8,"23":7,"42":6,"3":6,"40":6,"24":6,"2":6,"89":6,"26":5,"55":5,"51":5},"5":{"62":9,"80":9,"69":8,"38":8,"3":8,"82":8,"43":7,"41":7,"66":7,"8":7,"87":7,"45":7},"42":{"59":8,"62":8,"66":8,"43":7,"50":7,"69":7,"64":7,"19":7,"60":7,"20":7,"40":6,"55":6},"80":{"62":10,"12":9,"86":9,"56":9,"43":8,"69":8,"8":8,"89":8,"30":8,"31":8,"11":8,"49":8},"26":{"66":9,"60":9,"62":8,"77":8,"57":8,"87":8,"30":8,"8":7,"90":7,"40":6,"69":6,"10":6},"43":{"71":9,"64":8,"59":7,"67":7,"12":7,"45":6,"38":6,"88":6,"1":6,"85":6,"41":6,"87":6},"16":{"7":7,"6":7,"90":7,"3":7,"4":6,"32":6,"87":6,"89":6,"71":6,"58":6,"72":5,"33":5},"23":{"77":14,"73":12,"60":12,"29":12,"40":11,"57":11,"34":11,"68":11,"71":11,"24":10,"59":10,"28":10},"86":{"56":10,"78":9,"38":9,"31":8,"39":8,"55":8,"42":8,"64":8,"65":7,"18":7,"89":7,"67":7},"14":{"14":11,"30":10,"84":10,"60":9,"20":8,"45":8,"80":8,"18":8,"69":8,"31":7,"67":7,"6":7},"31":{"59":10,"6":9,"13":9,"43":9,"47":8,"71":8,"55":8,"62":8,"56":7,"44":7,"87":7,"81":7},"32":{"60":10,"27":10,"8":10,"23":9,"61":9,"4":9,"41":9,"64":7,"44":7,"87":7,"48":7,"77":7},"57":{"8":9,"7":8,"57":8,"66":8,"32":7,"82":7,"6":7,"62":7,"76":7,"77":7,"60":6,"87":6},"44":{"84":10,"64":10,"26":8,"41":8,"2":8,"57":8,"47":8,"50":7,"23":7,"40":7,"88":7,"19":7},"65":{"68":8,"2":6,"8":6,"46":6,"15":6,"22":5,"90":5,"43":5,"16":5,"55":5,"23":5,"60":5},"58":{"71":11,"56":9,"2":8,"12":8,"60":8,"30":7,"59":7,"78":7,"37":7,"80":7,"61":7,"22":6},"1":{"15":10,"34":9,"45":9,"41":8,"76":8,"88":8,"60":8,"33":8,"70":8,"74":7,"73":7,"1":7},"49":{"69":10,"33":8,"35":8,"56":8,"20":7,"48":7,"25":7,"15":6,"61":6,"62":6,"18":6,"5":6},"51":{"42":8,"82":7,"5":7,"30":6,"3":6,"79":6,"8":6,"18":6,"66":6,"10":6,"47":6,"80":6},"54":{"32":8,"88":7,"35":7,"30":7,"53":6,"42":6,"21":6,"37":6,"23":6,"45":6,"70":5,"50":5},"96":{"12":1,"16":1,"45":1,"55":1,"88":1,"90":1}},"rp":{"0":{"2":0.108,"3":0.114,"7":0.11,"8":0.115,"0":0.108,"4":0.117,"5":0.111,"6":0.117,"1":0.1,"9":0.0},"1":{"0":0.11,"2":0.108,"3":0.119,"7":0.11,"8":0.115,"1":0.105,"5":0.106,"4":0.109,"6":0.119,"9":0.0},"2":{"0":0.115,"2":0.114,"3":0.105,"7":0.118,"8":0.114,"5":0.098,"1":0.106,"4":0.115,"6":0.116,"9":0.0},"3":{"2":0.107,"3":0.112,"7":0.107,"8":0.111,"0":0.11,"5":0.107,"1":0.103,"4":0.123,"6":0.119,"9":0.0},"4":{"0":0.115,"2":0.107,"3":0.111,"7":0.107,"8":0.107,"4":0.119,"5":0.109,"6":0.113,"1":0.111},"5":{"0":0.114,"2":0.11,"3":0.106,"7":0.112,"8":0.113,"4":0.118,"5":0.103,"6":0.118,"1":0.106},"6":{"0":0.117,"2":0.115,"3":0.103,"7":0.11,"8":0.114,"1":0.102,"4":0.119,"5":0.105,"6":0.115,"9":0.0},"7":{"0":0.115,"2":0.11,"3":0.107,"7":0.105,"8":0.112,"5":0.104,"4":0.122,"6":0.112,"1":0.113,"9":0.0},"8":{"2":0.104,"3":0.118,"7":0.107,"8":0.109,"0":0.116,"5":0.108,"4":0.116,"6":0.116,"1":0.106,"9":0.0},"9":{"1":0.333,"4":0.167,"5":0.167,"8":0.333}},"ag":{"1":12.5,"2":14.1,"3":13.0,"4":10.8,"5":12.7,"6":12.3,"7":11.7,"8":13.7,"9":15.8,"10":14.5,"11":14.5,"12":11.2,"13":11.9,"14":10.7,"15":12.5,"16":18.2,"17":18.9,"18":12.2,"19":15.1,"20":15.8,"21":12.1,"22":14.0,"23":8.6,"24":13.2,"25":13.9,"26":13.1,"27":14.6,"28":15.2,"29":9.3,"30":13.8,"31":13.7,"32":12.4,"33":13.1,"34":14.3,"35":13.0,"36":11.0,"37":12.1,"38":11.5,"39":15.4,"40":11.2,"41":12.7,"42":13.5,"43":15.1,"44":12.3,"45":10.6,"46":9.9,"47":10.8,"48":12.0,"49":14.3,"50":13.6,"51":14.2,"52":17.2,"53":10.9,"54":18.3,"55":16.2,"56":10.7,"57":13.2,"58":12.4,"59":16.0,"60":8.5,"61":12.5,"62":10.2,"63":13.4,"64":10.9,"65":18.4,"66":12.1,"67":12.5,"68":10.9,"69":10.8,"70":16.4,"71":10.6,"72":16.4,"73":13.2,"74":12.9,"75":15.1,"76":14.5,"77":12.9,"78":14.9,"79":17.5,"80":10.4,"81":13.0,"82":15.2,"83":15.0,"84":12.4,"85":14.9,"86":12.3,"87":10.3,"88":10.7,"89":9.3,"90":11.9},"N":842},"60":{"d":[[7,21,23,25,37,51],[3,23,27,47,50,53],[4,9,11,19,24,26],[13,18,35,45,46,50],[2,19,28,30,31,37],[1,8,31,38,40,56],[1,11,20,33,35,47],[14,20,31,35,38,39],[1,13,19,27,42,56],[25,35,39,41,54,56],[2,14,22,34,48,59],[6,36,38,44,49,53],[9,26,30,39,41,45],[8,31,35,36,49,55],[1,11,26,49,55,59],[15,20,29,51,56,57],[13,19,21,30,42,43],[11,19,23,27,28,39],[6,18,33,40,50,58],[10,29,36,42,46,52],[1,3,14,19,48,56],[6,11,22,36,37,53],[2,16,35,51,52,56],[1,17,28,30,32,42],[7,14,17,25,42,49],[7,9,20,22,28,39],[8,9,20,30,33,55],[18,21,34,43,47,50],[1,6,7,19,31,44],[5,12,21,28,35,42],[3,22,38,41,44,50],[7,9,14,36,52,55],[11,41,43,44,51,57],[3,11,16,25,37,41],[17,18,21,27,37,51],[3,14,27,32,43,44],[3,19,26,37,44,57],[6,19,31,39,47,51],[14,16,30,42,46,55],[6,8,43,49,58,60],[2,14,31,38,47,54],[9,16,31,34,40,58],[3,5,10,22,23,52],[9,29,36,46,47,52],[8,18,21,29,36,38],[14,24,34,42,51,60],[21,33,43,47,55,59],[7,17,21,25,32,52],[1,4,7,8,11,41],[1,7,16,34,38,42],[12,20,23,38,49,50],[1,2,36,42,49,55],[6,26,32,43,48,54],[9,24,25,33,44,52],[1,22,27,41,44,46],[7,19,23,32,48,55],[3,8,10,12,32,42],[3,7,12,22,23,55],[6,9,25,29,45,57],[20,21,23,26,32,37],[34,36,39,45,53,55],[6,34,35,36,56,57],[6,31,35,41,44,46],[2,7,19,21,23,59],[13,20,33,35,40,48],[9,11,12,21,32,34],[4,7,31,35,40,52],[5,9,32,35,55,56],[2,9,27,30,36,55],[1,8,29,39,41,50],[17,28,32,36,38,51],[19,33,37,39,56,57],[9,11,18,35,49,50],[2,9,16,19,29,52],[9,12,22,34,43,56],[5,7,8,28,47,58],[2,15,28,39,48,50],[12,19,41,51,54,59],[2,27,34,37,48,60],[1,9,16,30,45,54],[6,9,16,20,26,46],[9,13,18,25,29,58],[7,12,14,15,17,40],[18,26,34,48,49,56],[2,16,20,31,39,55],[10,11,26,46,54,60],[15,17,20,39,44,47],[1,6,35,54,56,59],[10,22,39,41,48,49],[18,22,26,44,53,55],[14,23,36,45,47,48],[2,3,11,25,51,52],[13,20,32,35,37,41],[1,20,22,39,52,57],[3,23,28,39,44,57],[2,33,41,54,58,60],[4,8,15,30,43,47],[1,8,16,20,22,41],[1,3,9,25,37,44],[2,14,21,25,42,60],[15,19,23,25,38,53],[10,14,31,35,55,57],[1,7,10,26,33,35],[1,9,19,34,39,50],[4,5,23,42,48,51],[2,5,42,55,56,58],[23,24,31,35,43,59],[5,38,40,50,56,60],[5,6,8,20,23,43],[28,48,57,58,59,60],[11,22,34,43,53,59],[15,23,24,25,47,57],[25,27,30,31,44,45],[2,27,32,42,46,57],[3,8,17,53,55,56],[6,23,26,43,59,60],[12,19,27,40,49,57],[9,10,11,15,50,52],[25,29,31,34,37,52],[7,10,23,41,52,57],[4,7,30,39,44,58],[8,17,18,39,52,59],[2,30,36,39,40,49],[7,31,35,39,40,44],[15,25,34,40,46,47],[2,11,13,17,19,60],[7,27,41,47,51,60],[3,14,19,27,34,57],[20,26,28,43,47,56],[10,13,15,27,29,46],[5,10,11,18,24,46],[1,8,14,19,36,60],[5,6,9,24,32,54],[4,12,26,28,37,43],[4,6,7,12,14,32],[11,25,26,43,44,57],[11,16,17,19,34,36],[4,14,23,27,35,57],[1,13,22,38,56,57],[14,23,39,40,45,49],[12,13,17,20,33,45],[8,12,27,36,43,53],[10,18,27,28,29,30],[5,19,20,35,51,52],[9,25,29,31,35,46],[11,12,21,52,53,54],[7,22,31,39,48,56],[16,19,25,37,43,57],[6,8,23,27,46,60],[2,14,34,41,51,57],[22,32,37,38,49,50],[4,12,23,48,50,51],[6,12,20,22,30,47],[12,16,24,32,40,55],[5,18,19,53,57,58],[6,8,12,17,22,58],[12,27,31,34,40,55],[4,15,28,50,53,59],[1,13,25,44,46,60],[22,28,33,37,39,52],[1,10,15,21,35,55],[5,19,33,37,43,47],[7,32,45,50,56,58],[2,16,25,30,31,47],[1,4,18,26,35,44],[1,26,34,35,39,45],[28,32,35,47,54,58],[2,23,29,45,50,59],[9,21,33,37,39,56],[19,27,34,40,48,54],[10,12,32,36,44,58],[4,6,7,18,21,38],[9,15,37,43,44,57],[5,25,26,29,39,47],[2,3,19,30,40,55],[7,13,15,21,22,24],[15,18,28,53,55,60],[5,21,24,26,33,57],[2,22,26,31,35,50],[5,25,31,43,48,56],[15,20,22,41,48,51],[3,17,20,29,46,50],[12,14,18,36,44,50],[1,20,28,42,47,49],[11,35,43,46,57,60],[2,19,44,47,58,59],[1,2,3,19,33,39],[4,6,8,27,35,43],[6,13,24,26,29,38],[14,23,24,26,45,47],[2,14,36,37,52,59],[6,17,31,43,48,55],[2,13,43,48,50,53],[3,4,36,40,46,58],[3,9,15,37,54,58],[2,3,7,23,36,43],[2,25,37,44,48,54],[10,13,18,19,28,30],[15,23,42,46,47,48],[8,24,33,45,47,51],[3,5,17,26,30,49],[5,11,32,34,43,53],[4,8,10,20,44,57],[19,20,24,25,33,53],[5,21,23,41,42,58],[2,3,4,9,18,19],[2,3,4,15,38,51],[1,4,8,10,42,55],[13,30,39,42,44,46],[1,15,18,19,41,52],[33,38,46,50,55,58],[3,4,11,42,45,56],[2,4,19,21,39,53],[4,7,11,13,25,48],[2,21,26,43,44,55],[11,15,20,29,35,56],[8,36,38,42,53,56],[14,22,33,49,52,57],[1,3,4,26,51,58],[3,5,15,19,25,41],[19,35,48,55,58,59],[10,14,33,44,51,54],[20,21,26,32,53,58],[17,28,29,40,41,55],[7,43,44,47,55,60],[18,20,21,46,56,58],[12,13,20,30,47,54],[10,14,22,24,29,60],[3,4,13,15,20,35],[2,16,25,36,40,51],[1,15,23,30,34,39],[5,6,26,38,49,53],[2,5,6,50,56,59],[2,6,11,12,38,45],[2,3,6,32,49,53],[14,27,30,43,47,58],[14,21,36,38,43,50],[3,16,17,48,49,57],[13,18,22,24,34,60],[1,8,10,11,43,57],[21,25,26,36,46,54],[12,28,39,47,55,56],[4,16,31,33,35,45],[2,34,35,38,50,55],[3,6,7,22,34,57],[16,36,37,45,59,60],[1,3,15,27,47,52],[12,15,18,36,38,56],[3,9,10,15,35,38],[2,3,8,26,42,46],[3,4,14,24,25,47],[9,35,36,41,45,50],[1,8,30,41,44,46],[6,18,19,40,45,56],[7,12,22,28,31,39],[4,9,26,29,45,49],[6,21,29,39,44,57],[7,34,41,43,48,49],[21,22,30,37,38,60],[5,32,40,44,49,60],[7,9,18,39,40,50],[1,7,37,40,42,59],[4,5,16,28,37,60],[4,15,17,26,36,53],[1,11,19,29,45,52],[6,11,31,32,44,58],[11,22,33,34,47,56],[1,6,21,29,33,42],[2,3,29,45,46,53],[8,17,25,35,51,53],[8,15,30,37,45,51],[3,28,34,45,46,58],[5,6,8,32,44,50],[11,14,30,31,40,52],[3,5,7,12,46,48],[1,10,20,24,46,54],[21,22,41,50,59,60],[10,30,36,51,56,58],[5,8,22,49,54,57],[15,19,26,32,47,55],[9,36,38,39,53,56],[10,14,33,37,42,46],[15,17,25,31,33,58],[3,15,20,25,42,51],[33,34,37,41,43,58],[12,17,21,30,31,32],[3,26,32,40,46,53],[6,23,32,40,49,51],[6,16,22,52,53,55],[23,27,28,35,42,45],[4,5,6,12,49,50],[3,21,28,45,53,55],[2,10,16,22,35,55],[20,29,49,52,55,58],[1,16,27,29,36,45],[1,11,13,16,31,44],[39,49,52,53,54,56],[14,31,33,41,54,57],[6,13,17,27,37,49],[11,19,28,34,44,56],[7,10,44,46,55,60],[12,15,18,34,51,54],[2,3,6,7,23,52],[7,15,17,21,39,53],[2,11,16,18,25,54],[12,20,31,37,50,56],[11,12,26,31,45,51],[21,25,27,29,39,51],[23,24,28,48,52,55],[9,15,22,29,33,39],[6,9,38,41,54,59],[18,23,24,28,40,59],[11,15,26,31,55,56],[6,30,33,38,58,59],[11,15,24,27,35,44],[4,8,27,32,42,49],[5,17,27,32,33,41],[4,9,24,41,44,55],[14,19,33,34,50,59],[20,31,37,42,47,55],[22,24,26,27,30,59],[10,17,34,37,40,52],[6,10,21,33,39,50],[4,6,9,10,37,43],[8,25,31,32,36,42],[4,5,22,31,32,42],[6,21,24,33,43,52],[10,23,37,46,54,57],[6,14,17,18,30,45],[10,31,38,43,51,56],[4,16,19,20,28,34],[5,6,18,20,44,48],[7,11,20,28,36,37],[8,31,35,46,56,59],[8,11,18,27,28,40],[11,12,28,38,39,54],[17,40,46,48,53,54],[13,18,22,27,45,48],[2,17,27,38,53,59],[2,20,29,34,43,52],[2,27,35,49,52,53],[8,9,24,28,45,49],[6,30,31,40,47,60],[7,15,22,24,47,50],[20,31,32,46,55,58],[6,11,17,27,51,54],[16,42,43,46,50,55],[14,29,33,42,47,52],[7,20,37,40,41,46],[7,8,34,36,39,40],[2,32,40,44,54,58],[5,13,23,25,45,46],[4,11,30,46,48,54],[1,2,21,42,52,58],[4,5,20,28,32,41],[1,9,11,26,32,44],[13,16,19,20,43,51],[4,6,35,43,54,60],[4,15,31,42,51,60],[10,20,31,53,57,59],[8,13,35,55,56,58],[2,13,14,20,57,58],[10,27,33,49,52,53],[32,40,41,46,55,56],[15,42,43,50,56,60],[4,11,19,26,39,57],[6,14,39,40,45,59],[7,9,22,27,37,55],[20,27,28,31,34,50],[4,19,29,33,36,46],[2,4,6,52,54,56],[3,11,22,24,54,56],[7,32,42,49,53,55],[17,31,51,55,58,59],[30,32,43,44,58,60],[12,16,39,50,55,58],[4,7,41,47,50,55],[1,10,25,44,55,57],[1,19,20,21,49,60],[2,23,26,36,39,52],[15,26,27,34,55,60],[22,24,28,54,58,60],[1,3,39,49,54,57],[6,13,18,35,44,50],[8,14,25,36,47,57],[4,15,17,28,34,43],[7,8,21,35,43,49],[34,40,42,52,57,58],[29,41,42,44,45,46],[2,22,29,36,45,58],[5,7,18,25,39,50],[3,12,33,53,57,58],[13,21,33,44,46,50],[2,9,11,17,38,42],[3,17,37,39,48,55],[2,7,23,44,50,60],[15,25,28,40,53,58],[16,24,36,41,45,51],[6,13,26,50,55,60],[4,29,38,56,58,59],[8,12,13,17,41,48],[7,12,20,25,48,48],[1,31,40,42,45,56],[7,10,23,27,46,58],[6,7,14,37,49,57],[2,9,11,15,35,51],[4,7,12,18,23,24],[20,22,27,42,46,56],[9,22,31,33,49,52],[6,20,24,26,27,43],[3,6,19,37,48,57],[2,3,18,22,30,55],[8,11,18,34,51,58],[6,11,18,25,45,60],[2,7,9,10,17,49],[4,5,11,13,40,60],[5,9,28,35,44,58],[4,6,15,41,49,52],[4,8,15,43,47,48],[4,19,25,34,35,46],[27,29,37,39,43,60],[6,16,20,32,43,52],[16,32,38,51,55,60],[6,11,24,31,36,53],[13,17,27,30,44,49],[1,21,37,38,40,49],[6,10,21,24,53,59],[5,7,10,14,15,56],[5,6,43,46,54,58],[6,12,25,30,38,40],[4,5,12,21,39,48],[12,18,39,48,54,59],[5,10,19,25,33,35],[12,21,34,48,49,50],[6,10,28,38,40,52],[6,14,43,44,45,56],[1,2,3,16,21,30],[5,6,25,34,55,60],[4,10,16,20,40,51],[7,9,10,16,21,50],[11,17,28,33,40,57],[3,11,12,14,26,41],[7,17,49,53,54,56],[11,13,38,39,42,44],[14,23,24,34,37,56],[8,19,23,29,30,50],[10,33,39,51,54,55],[1,17,32,48,52,58],[3,17,31,33,44,49],[2,22,35,37,42,55],[18,32,40,41,42,45],[5,6,11,20,58,60],[2,7,8,24,28,56],[26,33,43,48,56,60],[3,4,20,30,35,40],[1,8,9,20,26,60],[22,25,33,47,53,55],[29,34,41,42,56,57],[6,8,16,32,34,40],[3,4,16,28,51,57],[20,29,33,42,44,49],[8,16,19,36,51,57],[5,6,20,43,53,56],[18,19,25,33,42,54],[24,27,40,41,44,45],[5,7,17,18,19,56],[2,6,7,10,31,47],[9,24,28,38,41,51],[1,17,38,41,52,57],[1,19,21,37,41,51],[10,29,45,49,56,57],[7,17,20,30,35,39],[16,22,32,34,47,48],[4,7,15,39,56,60],[4,9,29,43,47,53],[2,14,28,34,58,60],[11,14,21,28,54,58],[9,30,46,47,51,57],[29,34,41,52,53,57],[1,8,37,38,41,53],[11,15,17,32,33,52],[1,5,19,34,43,56],[1,8,9,21,22,31],[4,11,15,28,29,55],[8,30,36,37,57,58],[1,23,40,50,53,56],[2,6,8,20,57,59],[8,10,13,33,36,40],[21,24,28,33,34,49],[2,18,25,27,48,58],[2,6,16,39,40,57],[13,21,26,30,54,55],[1,25,33,35,53,56],[16,25,32,33,38,44],[7,9,40,43,49,57],[8,11,21,43,45,59],[11,17,19,29,45,55],[1,6,17,25,32,53],[4,5,23,26,40,56],[12,19,35,36,55,57]],"t":["2026-05-21","2026-05-19","2026-05-17","14-05-226","2026-05-12","2026-05-10","2026-05-07","2026-05-05","2026-05-03","2026-04-30","2026-04-28","2026-04-26","2026-04-23","2026-04-21","2026-04-19","2026-04-16","2026-04-14","2026-04-12","2026-04-09","2026-04-07","2026-04-05","2026-04-02","2026-03-31","2026-03-29","2026-03-26","2026-03-24","2026-03-22","2026-03-19","2026-03-17","2026-03-15","2026-03-12","2026-03-10","2026-03-08","2026-03-05","2026-01-03","2026-03-01","2026-02-26","2026-02-24","2026-02-22","2026-02-19","2026-02-17","2026-02-15","2026-02-12","2026-02-10","2026-02-08","2026-02-05","2026-02-03","2026-02-01","2026-01-29","2026-01-27","2026-01-25","2026-01-22","2026-01-20","2026-01-18","2026-01-15","2026-01-13","2026-01-11","2026-01-08","2026-01-06","2026-01-04","2026-01-01","2025-12-30","2025-12-28","2025-12-25","2025-12-23","2025-12-21","2025-12-18","2025-12-16","2025-12-14","2025-12-11","2025-12-09","2025-12-01","2025-12-04","2025-12-02","2025-11-30","2025-11-27","2025-11-25","2025-11-25","2025-11-20","2025-11-18","2025-11-16","2025-11-13","2025-11-11","2025-11-09","2025-11-06","2025-11-04","2025-11-02","2025-10-30","2025-10-28","2025-10-26","2025-10-23","2025-10-21","2025-10-19","2025-10-16","2025-10-14","2025-10-12","2025-10-09","2025-10-07","2025-10-05","2025-10-02","2025-09-30","2025-09-28","2025-09-25","2025-09-23","2025-09-21","2025-09-18","2025-09-16","2025-09-14","2025-09-11","2025-09-09","2025-09-07","2025-09-04","2025-09-02","2025-08-31","2025-08-28","2025-08-26","2025-08-24","2025-08-21","2025-08-19","2025-08-17","2025-08-14","2025-08-12","2025-08-10","2025-08-07","2025-08-05","2025-08-03","2025-07-31","2025-07-29","2025-07-27","2025-07-24","2025-07-22","2025-07-20","2025-07-17","2025-07-15","2025-07-13","2025-07-10","2025-07-08","2025-07-06","2025-07-03","2025-07-01","2025-06-29","2025-06-26","2025-06-24","2025-06-22","2025-06-19","2025-06-17","2025-06-15","2025-06-12","2025-06-10","2025-06-08","2025-06-05","2025-06-03","2025-06-01","2025-05-29","2025-05-27","2025-05-25","2025-05-22","2025-05-20","2025-05-18","2025-05-15","2025-05-13","2025-05-11","2025-05-08","2025-05-06","2025-05-04","2025-05-01","2025-04-29","2025-04-27","2025-04-24","2025-04-22","2025-04-20","2025-04-17","2025-04-15","2025-04-13","2025-04-10","2025-04-08","2025-04-06","2025-04-03","2025-04-01","2025-03-30","2025-03-27","2025-03-25","2025-03-23","2025-03-20","2025-03-18","2025-03-16","2025-03-13","2025-03-11","2025-03-09","2025-03-06","2025-03-04","2025-03-02","2025-02-27","2025-02-25","2025-02-23","2025-02-20","2025-02-18","2025-02-16","2025-02-13","2025-02-11","2025-02-09","2025-02-06","2025-02-04","2025-02-02","2025-01-30","2025-01-28","2025-01-26","2025-01-23","2025-01-21","2025-01-19","2025-01-16","2025-01-14","2025-01-12","2025-01-09","2025-01-07","2025-01-05","2025-01-02","2024-12-31","2024-12-29","2024-12-26","2024-12-24","2024-12-22","2024-12-19","2024-12-17","2024-12-15","2024-12-12","2024-12-10","2024-12-08","2024-12-05","2024-12-03","2024-12-01","2024-11-28","2024-11-26","2024-11-24","2024-11-21","2024-11-19","2024-11-17","2024-11-14","2024-11-12","2024-11-10","2024-11-07","2024-11-05","2024-11-03","2024-10-31","2024-10-29","2024-10-27","2024-10-24","2024-10-22","2024-10-20","2024-10-17","2024-10-15","2024-10-13","2024-10-10","2024-10-08","2024-10-06","2024-10-03","2024-10-01","2024-09-29","2024-09-26","2024-09-24","2024-09-22","2024-09-19","2024-09-17","2024-09-15","2024-09-12","2024-09-10","2024-09-08","2024-09-05","2024-09-03","2024-09-01","2024-08-29","2024-08-27","2024-08-25","2024-08-22","2024-08-20","2024-08-18","2024-08-15","2024-08-13","2024-08-11","2024-08-08","2024-08-06","2024-08-04","2024-08-01","2024-07-30","2024-07-28","2024-07-25","2024-07-23","2024-07-21","2024-07-18","2024-07-16","2024-07-14","2024-07-11","2024-07-09","2024-07-07","2024-07-04","2024-07-02","2024-06-30","2024-06-27","2024-06-25","2024-06-23","2024-06-20","2024-06-18","2024-06-16","2024-06-13","2024-06-11","2024-06-09","2024-06-06","2024-06-04","2024-06-02","2024-05-30","2024-05-28","2024-05-26","2024-05-23","2024-05-21","2024-05-19","2024-05-16","2024-05-14","2024-05-12","2024-05-09","2024-05-07","2024-05-05","2024-05-02","2024-04-30","2024-04-28","2024-04-25","2024-04-23","2024-04-21","2024-04-18","2024-04-16","2024-04-14","2024-04-11","2024-04-09","2024-04-07","2024-04-04","2024-04-02","2024-03-31","2024-03-28","2024-03-26","2024-03-24","2024-03-21","2024-03-19","2024-03-17","2024-03-14","2024-03-12","2024-03-10","2024-03-07","2024-03-05","2024-03-03","2024-02-29","2024-02-27","2024-02-25","2024-02-22","2024-02-20","2024-02-18","2024-02-15","2024-02-13","2024-02-11","2024-02-08","2024-02-06","2024-02-04","2024-02-01","2024-01-30","2024-01-28","2024-01-25","2024-01-23","2024-01-21","2024-01-18","2024-01-16","2024-01-14","2024-01-11","2024-01-09","2024-01-07","2024-01-04","2024-01-02","2023-12-30","2023-12-28","2023-12-26","2023-12-24","2023-12-21","2023-12-19","2023-12-17","2023-12-14","2023-12-12","2023-12-10","2023-12-07","2023-12-05","2023-12-03","2023-11-30","2023-11-28","2023-11-26","2023-11-23","2023-11-21","2023-11-19","2023-11-16","2023-11-14","2023-11-12","2023-11-09","2023-11-07","2023-11-05","2023-11-02","2023-10-31","2023-10-29","2023-10-26","2023-10-24","2023-10-22","2023-10-19","2023-10-17","2023-10-15","2023-10-12","2023-10-10","2023-10-08","2023-10-05","2023-10-03","2023-10-01","2023-09-28","2023-09-26","2023-09-24","2023-09-21","2023-09-19","2023-09-17","2023-09-14","2023-09-12","2023-09-10","2023-09-07","2023-09-05","2023-09-03","2023-08-31","2023-08-29","2023-08-27","2023-08-24","2023-08-22","2023-08-20","2023-08-17","2023-08-15","2023-08-13","2023-08-10","2023-08-08","2023-08-06","2023-08-03","2023-08-01","2023-07-30","2023-07-27","2023-07-25","2023-07-23","2023-07-20","2023-07-18","2023-07-16","2023-07-13","2023-07-11","2023-07-09","2023-07-06","2023-07-04","2023-07-02","2023-06-29","2023-06-27","2023-06-25","2023-06-22","2023-06-20","2023-06-18","2023-06-15","2023-06-13","2023-06-11","2023-06-08","2023-06-06","2023-06-04","2023-06-01","2023-05-30","2023-05-28","2023-05-25","2023-05-13","2023-05-21","2023-05-18","2023-05-16","2023-05-14","2023-05-11","2023-05-09","2023-05-07","2023-05-04","2023-05-02","2023-04-30","2023-04-27","2023-04-25","2023-04-23","2023-04-20","2023-04-18","2023-04-16","2023-04-13","2023-04-11","2023-04-09","2023-04-06","2023-04-04","2023-04-02","2023-03-30","2023-03-28","2023-03-26","2023-03-23","2023-03-21","2023-03-19","2023-03-16","2023-03-14"],"j":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],"fo":{"37":{"56":15,"50":13,"32":13,"43":13,"39":13,"53":12,"31":12,"2":12,"52":12,"21":12,"44":12,"45":12},"7":{"9":19,"7":16,"28":16,"16":16,"37":16,"58":15,"43":14,"44":14,"40":14,"15":14,"20":13,"22":13},"51":{"3":13,"20":13,"43":12,"6":12,"21":11,"32":11,"55":11,"50":10,"57":10,"48":10,"27":9,"53":9},"21":{"48":17,"53":15,"28":15,"40":14,"29":14,"3":12,"7":12,"44":11,"35":11,"15":11,"57":11,"10":11},"23":{"6":12,"2":12,"50":11,"9":11,"25":11,"57":11,"58":10,"36":10,"55":10,"45":10,"35":10,"59":10},"25":{"57":14,"7":13,"28":13,"26":13,"40":13,"2":12,"21":12,"41":12,"27":11,"37":11,"12":11,"42":11},"3":{"9":16,"6":16,"37":16,"7":14,"3":14,"2":14,"43":14,"19":13,"25":13,"60":13,"18":12,"21":12},"47":{"35":15,"38":15,"25":13,"7":12,"34":12,"36":12,"2":12,"9":11,"14":11,"31":11,"21":11,"24":10},"50":{"31":14,"42":14,"11":12,"6":12,"7":12,"56":12,"3":12,"4":11,"9":11,"28":11,"55":11,"12":11},"53":{"57":16,"56":14,"45":12,"35":12,"8":12,"44":12,"30":11,"29":11,"58":11,"4":10,"41":10,"25":10},"27":{"24":14,"50":14,"10":13,"28":13,"9":12,"27":12,"44":12,"57":12,"38":12,"49":12,"41":11,"56":11},"4":{"44":15,"20":13,"2":13,"4":13,"6":13,"43":13,"9":12,"13":11,"1":11,"42":11,"55":11,"8":11},"9":{"46":16,"8":16,"29":16,"3":15,"37":15,"20":14,"47":14,"52":14,"7":14,"55":13,"58":13,"59":13},"11":{"7":18,"56":16,"46":14,"37":13,"17":13,"42":13,"60":13,"18":12,"39":12,"16":12,"52":12,"11":12},"19":{"35":18,"6":16,"39":15,"58":15,"31":14,"42":14,"56":13,"54":13,"8":12,"19":12,"55":12,"48":12},"24":{"49":12,"9":12,"21":11,"26":11,"45":10,"50":10,"27":10,"60":10,"30":10,"33":9,"55":9,"44":9},"26":{"45":15,"39":15,"25":15,"56":14,"19":14,"35":13,"15":12,"52":12,"40":12,"6":11,"58":11,"3":11},"35":{"19":16,"35":16,"59":16,"8":16,"31":15,"52":15,"44":14,"9":14,"2":13,"1":13,"42":13,"56":12},"45":{"6":17,"30":15,"2":14,"31":14,"49":13,"21":13,"3":13,"25":12,"11":11,"27":11,"53":11,"44":11},"13":{"28":12,"39":12,"11":12,"56":10,"14":10,"58":10,"48":10,"44":10,"9":9,"40":9,"52":9,"57":9},"46":{"18":14,"47":14,"11":14,"33":14,"6":13,"2":12,"19":12,"39":12,"56":11,"58":11,"53":11,"54":11},"18":{"7":15,"58":14,"3":13,"38":13,"2":11,"10":11,"51":11,"12":11,"31":10,"36":10,"15":10,"17":10},"2":{"4":16,"43":15,"15":15,"6":13,"39":13,"40":12,"58":12,"25":12,"8":11,"53":11,"32":11,"54":11},"28":{"44":17,"57":13,"46":12,"1":11,"8":11,"33":11,"58":11,"49":11,"9":11,"55":11,"39":11,"11":11},"30":{"41":12,"5":12,"1":11,"8":11,"49":11,"39":11,"38":10,"55":10,"18":10,"21":10,"34":10,"58":10},"31":{"46":15,"35":14,"40":13,"11":13,"27":13,"55":13,"26":12,"5":12,"30":12,"42":11,"58":11,"56":10},"1":{"39":15,"6":14,"38":13,"1":12,"11":12,"20":12,"5":12,"21":12,"28":12,"9":12,"37":11,"7":11},"38":{"14":15,"11":14,"9":14,"59":13,"17":13,"42":12,"37":12,"57":12,"20":11,"39":11,"52":11,"55":11},"8":{"32":14,"15":14,"33":12,"34":12,"60":12,"28":12,"40":12,"46":12,"55":11,"17":11,"25":11,"45":11},"40":{"7":19,"58":17,"9":14,"12":14,"46":13,"5":13,"16":13,"11":12,"10":12,"23":12,"55":12,"48":12},"56":{"43":15,"31":15,"20":14,"30":14,"11":13,"35":13,"2":13,"22":13,"48":13,"6":13,"49":13,"8":13},"33":{"42":13,"21":13,"9":13,"35":12,"20":11,"27":11,"6":11,"18":10,"43":10,"7":10,"32":10,"41":10},"20":{"9":17,"36":16,"20":14,"60":13,"33":12,"25":12,"29":12,"22":12,"13":11,"27":11,"42":11,"8":11},"39":{"35":15,"55":15,"54":15,"48":14,"40":13,"19":12,"59":12,"9":12,"41":12,"44":12,"27":11,"42":11},"14":{"58":14,"7":13,"49":12,"20":12,"43":11,"48":11,"11":10,"37":10,"9":10,"3":10,"26":10,"35":10},"42":{"3":14,"23":13,"22":13,"19":12,"39":11,"41":11,"42":11,"9":11,"8":11,"33":11,"5":11,"57":11},"41":{"7":13,"55":12,"37":12,"1":12,"9":11,"17":11,"18":11,"19":11,"58":11,"56":11,"40":10,"38":9},"54":{"22":12,"48":11,"44":11,"31":10,"42":10,"37":9,"17":9,"49":9,"30":9,"13":9,"2":8,"9":8},"34":{"6":17,"44":14,"10":12,"57":12,"60":12,"7":11,"28":11,"16":11,"50":10,"35":10,"8":10,"58":10},"48":{"22":16,"3":15,"44":13,"25":13,"60":13,"10":12,"2":12,"55":12,"6":11,"38":11,"9":11,"59":11},"22":{"55":22,"45":14,"15":13,"36":12,"7":12,"23":12,"58":12,"3":12,"52":11,"56":11,"29":10,"32":10},"59":{"40":15,"37":13,"44":12,"56":12,"19":12,"55":12,"8":12,"7":11,"47":11,"20":10,"17":10,"11":10},"36":{"31":16,"35":13,"57":13,"49":12,"44":12,"6":12,"47":12,"1":11,"11":11,"26":10,"59":10,"56":10},"6":{"2":16,"31":16,"37":15,"44":14,"7":14,"43":14,"26":13,"30":13,"56":13,"12":13,"38":13,"25":13},"44":{"19":18,"36":16,"56":16,"40":16,"21":14,"37":14,"1":14,"9":13,"39":13,"7":13,"52":13,"2":13},"49":{"2":15,"11":14,"44":14,"6":13,"9":12,"26":12,"39":12,"55":12,"43":12,"40":12,"27":12,"37":12},"55":{"58":18,"57":15,"35":15,"15":14,"34":14,"33":14,"11":13,"43":13,"42":13,"36":13,"16":13,"1":12},"15":{"58":14,"1":13,"55":13,"4":13,"19":12,"51":12,"8":12,"25":12,"29":12,"15":12,"3":12,"59":11},"57":{"37":16,"44":16,"13":15,"35":15,"6":14,"26":14,"49":14,"19":13,"41":12,"9":12,"2":12,"46":11},"29":{"41":13,"43":11,"8":11,"14":10,"51":10,"20":10,"37":10,"57":10,"39":10,"44":10,"13":9,"48":9},"43":{"21":17,"58":16,"4":16,"3":15,"20":15,"48":14,"35":14,"19":13,"25":13,"6":12,"57":12,"43":12},"58":{"2":15,"47":14,"3":14,"50":14,"17":14,"6":14,"9":14,"7":13,"44":13,"31":12,"5":12,"15":12},"10":{"19":14,"21":14,"43":11,"16":11,"46":10,"7":10,"20":10,"39":10,"26":10,"4":10,"5":10,"6":10},"52":{"56":17,"1":16,"44":15,"41":13,"3":12,"7":12,"9":11,"46":11,"38":11,"55":11,"37":11,"39":11},"16":{"1":13,"9":13,"7":13,"6":12,"43":12,"16":12,"55":12,"18":11,"49":11,"26":11,"58":10,"60":10},"32":{"39":13,"40":13,"17":12,"44":12,"4":12,"56":12,"5":12,"6":12,"3":11,"57":11,"55":11,"43":11},"17":{"43":15,"11":14,"34":14,"12":13,"39":12,"3":12,"44":11,"55":11,"14":10,"25":10,"49":10,"19":10},"5":{"58":15,"2":14,"6":13,"9":12,"28":12,"50":11,"36":11,"55":11,"48":11,"24":11,"20":11,"19":11},"12":{"45":15,"12":14,"7":11,"4":11,"27":11,"48":11,"18":11,"3":10,"6":10,"56":10,"10":10,"25":9},"60":{"15":13,"57":13,"47":12,"4":12,"27":12,"7":12,"26":12,"58":12,"20":11,"40":11,"10":11,"21":10}},"rp":{"0":{"0":0.184,"2":0.157,"4":0.171,"5":0.166,"1":0.158,"3":0.164},"1":{"1":0.168,"3":0.165,"4":0.166,"0":0.181,"2":0.156,"5":0.165},"2":{"0":0.172,"2":0.16,"4":0.173,"5":0.172,"1":0.159,"3":0.165},"3":{"0":0.182,"2":0.158,"4":0.172,"5":0.168,"1":0.158,"3":0.163},"4":{"0":0.182,"1":0.159,"2":0.159,"3":0.169,"4":0.163,"5":0.168},"5":{"0":0.176,"2":0.161,"4":0.172,"5":0.165,"1":0.164,"3":0.162}},"ag":{"1":9.8,"2":9.3,"3":8.9,"4":9.8,"5":10.2,"6":8.2,"7":8.2,"8":9.8,"9":8.2,"10":10.6,"11":8.9,"12":11.3,"13":12.8,"14":11.3,"15":10.0,"16":10.0,"17":10.3,"18":11.1,"19":9.2,"20":9.2,"21":9.8,"22":10.1,"23":11.8,"24":11.8,"25":9.6,"26":9.9,"27":10.2,"28":10.4,"29":11.2,"30":11.0,"31":9.4,"32":11.0,"33":11.4,"34":10.5,"35":8.8,"36":10.5,"37":9.2,"38":10.1,"39":9.5,"40":9.4,"41":11.6,"42":10.1,"43":8.8,"44":8.0,"45":10.2,"46":10.0,"47":10.0,"48":10.0,"49":9.5,"50":10.3,"51":11.3,"52":10.0,"53":10.9,"54":12.0,"55":8.5,"56":8.9,"57":9.1,"58":8.1,"59":10.8,"60":9.8},"N":842}};

// ── SABITLER ──────────────────────────────────────────────────
const DB_KEY={'90':'cpb_p719_db_90','60':'cpb_p719_db_60'};
const MS_KEY={'90':'cpb_p719_ms_90','60':'cpb_p719_ms_60'};
const COLD_MAX=2; // soğuk 15'ten max 2

// ── YARDIMCILAR ────────────────────────────────────────────────
function gm(){return (typeof gameMax==='function')?String(gameMax()):'90';}
function mx(){return gm()==='60'?60:90;}
function sd(){return SD[gm()]||SD['90'];}
function dk(){return DB_KEY[gm()];}
function msk(){return MS_KEY[gm()];}
function $$(id){return document.getElementById(id);}

function loadDB(){
  try{
    const v=JSON.parse(localStorage.getItem(dk())||'null');
    if(v&&Array.isArray(v.e))return v;
  }catch(e){}
  const s=sd();
  const e=s.d.map((nums,i)=>({date:s.t[i],nums,joker:s.j?s.j[i]:null}));
  return {e};
}
function saveDB(db){try{localStorage.setItem(dk(),JSON.stringify(db));}catch(e){}}
function loadMS(){try{return JSON.parse(localStorage.getItem(msk())||'{}');}catch(e){return {};}}
function saveMS(ms){try{localStorage.setItem(msk(),JSON.stringify(ms));}catch(e){}}

// ── GEOMETRİ ──────────────────────────────────────────────────
function crd(n){return{r:Math.floor((n-1)/10),c:(n-1)%10};}
function nbs(n,maxN){
  const{r,c}=crd(n),res=[];
  for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){
    if(!dr&&!dc)continue;
    const rr=r+dr,cc=c+dc,nn=rr*10+cc+1;
    if(rr>=0&&rr<=8&&cc>=0&&cc<=9&&nn>=1&&nn<=maxN)res.push(nn);
  }
  return res;
}
function rgn(n){return Math.floor((n-1)/10);}

// ── SKOR MOTORU ────────────────────────────────────────────────
function scoreAll(entries,maxN){
  const draws=entries.map(e=>e.nums);
  const joks=entries.map(e=>e.joker);
  const N=draws.length;
  const s=sd();
  const fo=s.fo||{};
  const rp=s.rp||{};

  // Son 2'de çıkanlar → yasak
  const banned=new Set();
  draws.slice(0,2).forEach(d=>d.forEach(n=>banned.add(n)));
  joks.slice(0,2).forEach(j=>{if(j)banned.add(j);});

  // Son 15 aktif set (joker dahil)
  const rec=draws.slice(0,15);
  const rec_j=joks.slice(0,15);
  const prev15=new Set(rec.flat());
  rec_j.forEach(j=>{if(j)prev15.add(j);});

  // Kuraklık hesapla
  const drt={};
  for(let n=1;n<=maxN;n++){
    let d=0;
    for(const dr of draws){if(dr.includes(n))break;d++;}
    let eff=d;
    for(let idx=0;idx<joks.length&&idx<d;idx++){
      if(joks[idx]===n){eff=Math.max(0,d-idx*0.5);break;}
    }
    drt[n]=eff;
  }

  // Soğuk 15 sayı
  const sortedDrt=[...Array(maxN).keys()].map(i=>i+1).sort((a,b)=>drt[b]-drt[a]);
  const cold15=new Set(sortedDrt.slice(0,15));

  // Bölge geçiş: son çekilişin bölgelerinden tahmin
  const lastDraw=draws[0]||[];
  const lastJok=joks[0];
  const lastNums=new Set(lastDraw);
  if(lastJok)lastNums.add(lastJok);
  const nextRgn={};
  lastNums.forEach(p=>{
    const row=rp[String(rgn(p))]||{};
    Object.entries(row).forEach(([nr,prob])=>{
      nextRgn[nr]=(nextRgn[nr]||0)+prob;
    });
  });

  const result={};
  for(let n=1;n<=maxN;n++){
    // Follow: son çekilişin sayıları n'i ne kadar "çekiyor"
    let fs=0;
    lastNums.forEach(p=>{fs+=(fo[String(p)]?.[String(n)]||0);});
    fs*=5;

    // Cluster: son 4 çekilişte n'in komşularının yoğunluğu
    const nb=nbs(n,maxN);
    let cl=0;
    for(let i=0;i<Math.min(4,rec.length);i++){
      const w=(4-i)/4;
      const all=new Set(rec[i]);if(rec_j[i])all.add(rec_j[i]);
      cl+=nb.filter(x=>all.has(x)).length*w;
    }
    cl*=3.5;

    // Kuraklık optimum bölge
    const d=drt[n];
    const ds=d>=8&&d<=20?d*1.8:d>20?(20*1.8-(d-20)*0.5):d*0.8;

    // Frekans son 15
    let f15=rec.filter(dr=>dr.includes(n)).length;
    rec_j.forEach(j=>{if(j===n)f15+=0.5;});
    const exp15=15*6/maxN;
    const fsc=Math.max(0,(exp15-f15)*2);

    // Bölge geçiş
    const rsc=(nextRgn[String(rgn(n))]||0)*2;

    const auto=fs+cl+ds+fsc+rsc;
    const ms=loadMS();
    const manual=ms[String(n)]!==undefined?parseFloat(ms[String(n)]):null;
    const final=manual!==null?manual:auto;

    result[n]={n,drt:d,f15:+f15.toFixed(1),fs:+fs.toFixed(1),cl:+cl.toFixed(1),
               ds:+ds.toFixed(1),fsc:+fsc.toFixed(1),auto:+auto.toFixed(1),
               manual,final:+final.toFixed(1),banned:banned.has(n),cold:cold15.has(n)};
  }
  // Soğuk kısıtlı top-25 seçimi (UI için)
  const ranked=[...Array(maxN).keys()].map(i=>i+1)
    .filter(n=>!result[n].banned)
    .sort((a,b)=>result[b].final-result[a].final);
  let sel=[],coldCnt=0;
  for(const n of ranked){
    if(result[n].cold){if(coldCnt>=COLD_MAX)continue;coldCnt++;}
    sel.push(n);if(sel.length>=25)break;
  }
  result._sel25=sel;
  result._banned=banned;
  result._cold15=cold15;
  // 4 grup
  const selSet=new Set(sel);
  const scores=sel.map(n=>result[n].final).sort((a,b)=>b-a);
  const q1=scores[Math.floor(scores.length*.25)]||0;
  const q2=scores[Math.floor(scores.length*.50)]||0;
  const q3=scores[Math.floor(scores.length*.75)]||0;
  result._q={q1,q2,q3};
  // Tüm sayıları grupla
  const allRanked=[...Array(maxN).keys()].map(i=>i+1)
    .filter(n=>!result[n].banned)
    .sort((a,b)=>result[b].final-result[a].final);
  const allScores=allRanked.map(n=>result[n].final);
  const aq1=allScores[Math.floor(allScores.length*.25)]||0;
  const aq2=allScores[Math.floor(allScores.length*.50)]||0;
  const aq3=allScores[Math.floor(allScores.length*.75)]||0;
  result._aq={aq1,aq2,aq3};
  return result;
}

// ── DURUM ─────────────────────────────────────────────────────
let _sc={}, _sel=new Set();
const P719=window.P719={};

// ── TAB ───────────────────────────────────────────────────────
P719.tab=function(t){
  ['analysis','db','score','bt'].forEach(id=>{
    const btn=$$('p719-tab-'+id);
    const ct=$$('p719-content-'+id);
    if(btn)btn.classList.toggle('active',id===t);
    if(ct)ct.style.display=id===t?'':'none';
  });
  if(t==='analysis'&&!Object.keys(_sc).length)P719.analyze();
  if(t==='db')P719.renderDB();
  if(t==='score')P719.renderScore();
};

// ── MOD GÜNCELLE ──────────────────────────────────────────────
function updateBadge(){
  const b=$$('p719-mode-badge');if(!b)return;
  const m=gm();b.textContent='6/'+m;
  b.style.background=m==='60'?'rgba(249,115,22,.2)':'rgba(83,240,219,.2)';
  b.style.color=m==='60'?'#f97316':'#53f0db';
  const is90=m==='90';
  const jd=$$('p719-new-joker');if(jd)jd.parentElement.style.display=is90?'':'none';
  const th=$$('p719-th-jfr');if(th)th.style.display=is90?'':'none';
  _sc={};_sel.clear();
}

// ── ANALİZ ────────────────────────────────────────────────────
P719.analyze=function(){
  const db=loadDB();
  _sc=scoreAll(db.e,mx());
  P719.renderGroups();
};

P719.renderGroups=function(){
  const maxN=mx();
  if(!Object.keys(_sc).length)P719.analyze();
  const s=_sc;
  const {aq1,aq2,aq3}=s._aq;
  const banned=s._banned;
  const cold15=s._cold15;
  const is90=gm()==='90';
  const recentJoks=new Set();
  if(is90){
    const db=loadDB();
    db.e.slice(0,10).forEach(e=>{if(e.joker)recentJoks.add(e.joker);});
  }

  function chip(n){
    const data=s[n]||{};
    const isBan=banned.has(n);
    if(isBan) return '<span class="p719-chip chip-ban" title="Son 2 çekilişte çıktı — yasaklı">'+n+'</span>';
    const isSel=_sel.has(n);
    const isJ=recentJoks.has(n);
    const isCold=cold15.has(n);
    let cls='p719-chip ';
    const sc=data.final||0;
    if(sc>aq1)cls+='chip-hot';
    else if(sc>aq2)cls+='chip-warm';
    else if(sc>aq3)cls+='chip-cold';
    else cls+='chip-out';
    if(isSel)cls+=' sel';
    if(isJ)cls+=' chip-joker';
    const title=`Skor:${sc.toFixed(1)} | Kuraklık:${data.drt||0} | Frek15:${data.f15||0} | Cluster:${data.cl||0} | Follow:${data.fs||0}${isCold?' | ❄️ SOĞUK':''}${isJ?' | 🃏 Son10 Joker':''}`;
    return '<span class="p719-chip '+cls.trim()+'" data-n="'+n+'" title="'+title+'" onclick="P719.toggleChip('+n+',this)">'+n+'</span>';
  }

  const allNums=[...Array(maxN).keys()].map(i=>i+1);
  const hot=[],warm=[],cold=[],out=[],banList=[];
  allNums.forEach(n=>{
    if(banned.has(n)){banList.push(n);return;}
    const sc=(s[n]||{}).final||0;
    if(sc>aq1)hot.push(n);
    else if(sc>aq2)warm.push(n);
    else if(sc>aq3)cold.push(n);
    else out.push(n);
  });

  const sel25=new Set(s._sel25||[]);
  const autoSelHint=s._sel25?'Sistem tavsiyesi (25 sayı): '+[...sel25].sort((a,b)=>a-b).join(', '):'';

  const box=$$('p719-groups');if(!box)return;
  box.innerHTML=
    '<div class="p719-grp-box">'+
      '<div class="p719-grp-title"><span style="color:#ff6b6b">🔴 SICAK ('+hot.length+')</span>'+
        '<button class="btn" style="padding:2px 8px;font-size:10px" onclick="P719.selArr(['+hot.join(',')+'])">Tümünü Seç</button></div>'+
      '<div class="p719-chips">'+hot.map(chip).join('')+'</div>'+
    '</div>'+
    '<div class="p719-grp-box" style="margin-top:6px">'+
      '<div class="p719-grp-title"><span style="color:#e6c700">🟡 ILIK ('+warm.length+')</span>'+
        '<button class="btn" style="padding:2px 8px;font-size:10px" onclick="P719.selArr(['+warm.join(',')+'])">Tümünü Seç</button></div>'+
      '<div class="p719-chips">'+warm.map(chip).join('')+'</div>'+
    '</div>'+
    '<div class="p719-grp-box" style="margin-top:6px">'+
      '<div class="p719-grp-title"><span style="color:#6bcb77">🟢 SOĞUK ('+cold.length+')</span><span style="font-size:10px;color:var(--color-text-secondary)">max 2 seçilebilir</span></div>'+
      '<div class="p719-chips">'+cold.map(chip).join('')+'</div>'+
    '</div>'+
    '<div class="p719-grp-box" style="margin-top:6px">'+
      '<div class="p719-grp-title"><span style="color:#888">⚫ İHTİMAL DIŞI ('+out.length+')</span></div>'+
      '<div class="p719-chips">'+out.map(chip).join('')+'</div>'+
    '</div>'+
    '<div class="p719-grp-box" style="margin-top:6px">'+
      '<div class="p719-grp-title"><span style="color:#e53">🚫 YASAKLI - Son 2 Çekilişte Çıktı ('+banList.length+')</span></div>'+
      '<div class="p719-chips">'+banList.map(chip).join('')+'</div>'+
    '</div>';

  const note=$$('p719-analysis-note');
  if(note)note.textContent=autoSelHint;
  P719.renderSelBar();
};

P719.toggleChip=function(n,el){
  if(_sc[n]&&_sc[n].banned)return;
  // Soğuk kontrolü
  if(_sc[n]&&_sc[n].cold&&!_sel.has(n)){
    const coldSel=[..._sel].filter(x=>_sc[x]&&_sc[x].cold);
    if(coldSel.length>=COLD_MAX){
      alert('Soğuk sayılardan en fazla '+COLD_MAX+' seçilebilir.');return;
    }
  }
  if(_sel.has(n)){_sel.delete(n);el.classList.remove('sel');}
  else{_sel.add(n);el.classList.add('sel');}
  P719.renderSelBar();
};

P719.selArr=function(arr){
  let coldAdded=0;
  arr.forEach(n=>{
    if(_sc[n]&&_sc[n].banned)return;
    if(_sc[n]&&_sc[n].cold){
      const coldSel=[..._sel].filter(x=>_sc[x]&&_sc[x].cold).length;
      if(coldSel+coldAdded>=COLD_MAX)return;
      coldAdded++;
    }
    _sel.add(n);
  });
  P719.renderGroups();
};

P719.selGrp=function(g){
  if(!Object.keys(_sc).length)P719.analyze();
  const maxN=mx();
  const {aq1,aq2,aq3}=_sc._aq;
  const arr=[...Array(maxN).keys()].map(i=>i+1).filter(n=>{
    if(_sc[n]&&_sc[n].banned)return false;
    const sc=(_sc[n]||{}).final||0;
    if(g==='hot')return sc>aq1;
    if(g==='warm')return sc>aq2&&sc<=aq1;
    if(g==='cold')return sc>aq3&&sc<=aq2;
    return sc<=aq3;
  });
  P719.selArr(arr);
  P719.renderGroups();
};

P719.desel=function(){_sel.clear();P719.renderGroups();};

P719.renderSelBar=function(){
  const bar=$$('p719-sel-bar');const cnt=$$('p719-sel-cnt');
  if(cnt)cnt.textContent=_sel.size;
  if(bar)bar.style.display=_sel.size>0?'':'none';
};

P719.addToPool=function(){
  if(!_sel.size){alert('Önce sayı seç');return;}
  const nums=[..._sel].sort((a,b)=>a-b);
  const poolIn=document.getElementById('p-pool');
  if(poolIn){
    const cur=poolIn.value.trim();
    const curN=cur?cur.split(/[^0-9]+/).map(Number).filter(Boolean):[];
    const merged=[...new Set([...curN,...nums])].sort((a,b)=>a-b);
    poolIn.value=merged.join(' ');
    poolIn.dispatchEvent(new Event('input',{bubbles:true}));
    alert(nums.length+' sayı havuza eklendi. Toplam: '+merged.length);
  }else{
    const txt=nums.join(' ');
    navigator.clipboard&&navigator.clipboard.writeText(txt);
    alert('Havuz alanı bulunamadı. Sayılar kopyalandı: '+txt);
  }
};

// ── VERİTABANI ────────────────────────────────────────────────
P719.renderDB=function(){
  const db=loadDB();
  const list=$$('p719-db-list');const cnt=$$('p719-db-cnt');
  if(cnt)cnt.textContent=db.e.length+' çekiliş kayıtlı (6/'+gm()+')';
  if(!list)return;
  const is90=gm()==='90';
  list.innerHTML=db.e.map((e,i)=>
    '<div class="p719-db-row">'+
    '<span class="p719-db-date">'+e.date+'</span>'+
    '<span class="p719-db-nums">'+e.nums.join(' - ')+'</span>'+
    (is90&&e.joker?'<span class="p719-db-j">J:'+e.joker+'</span>':'<span class="p719-db-j"></span>')+
    '<span class="p719-db-del" onclick="P719.dbDel('+i+')">✕</span></div>'
  ).join('');
};

P719.dbDel=function(i){
  if(!confirm('Sil?'))return;
  const db=loadDB();db.e.splice(i,1);saveDB(db);P719.renderDB();
};

P719.dbSave=function(){
  const maxN=mx(),is90=gm()==='90';
  const di=$$('p719-new-date'),ni=$$('p719-new-nums'),ji=$$('p719-new-joker');
  const dateVal=di?di.value:'';
  const nums=[...new Set((ni?ni.value:'').split(/[^0-9]+/).map(x=>parseInt(x,10))
    .filter(n=>!isNaN(n)&&n>=1&&n<=maxN))].slice(0,6).sort((a,b)=>a-b);
  if(nums.length!==6){alert('Tam 6 sayı gir (1-'+maxN+')');return;}
  if(!dateVal){alert('Tarih gir');return;}
  const joker=is90&&ji&&ji.value?parseInt(ji.value,10)||null:null;
  const db=loadDB();
  db.e.unshift({date:dateVal,nums,joker});
  saveDB(db);
  if(ni)ni.value='';if(ji)ji.value='';
  _sc={};// skoru sıfırla
  P719.renderDB();
};

P719.transfer15=function(){
  const db=loadDB();const last15=db.e.slice(0,15);
  if(!last15.length){alert('DB boş');return;}
  const draws=Array.from({length:15},()=>[]);
  last15.forEach((e,i)=>{if(i<15)draws[i]=e.nums.slice();});
  try{
    const key=(typeof getDrawKey==='function')?getDrawKey():'cpb_draws_90_v714';
    localStorage.setItem(key,JSON.stringify(draws));
    if(typeof renderDrawMap==='function')renderDrawMap();
    last15.forEach((e,i)=>{
      const inp=document.getElementById('v74-draw-input-'+i);
      if(inp){inp.value=e.nums.join(' ');inp.dispatchEvent(new Event('input',{bubbles:true}));}
    });
    alert('Son '+last15.length+' çekiliş haritaya aktarıldı!');
  }catch(ex){alert('Hata: '+ex.message);}
};

// ── SKOR TABLOSU ──────────────────────────────────────────────
P719.renderScore=function(){
  const maxN=mx();
  if(!Object.keys(_sc).length)P719.analyze();
  const s=_sc;
  const {aq1,aq2,aq3}=s._aq;
  const colors={hot:'#ff6b6b',warm:'#e6c700',cold:'#6bcb77',out:'#888'};
  const is90=gm()==='90';
  const ranked=[...Array(maxN).keys()].map(i=>i+1)
    .sort((a,b)=>(s[b]||{}).final-(s[a]||{}).final);
  const tbody=$$('p719-score-body');if(!tbody)return;
  tbody.innerHTML=ranked.map(n=>{
    const d=s[n]||{};
    const sc=d.final||0;
    let grp='out';
    if(sc>aq1)grp='hot'; else if(sc>aq2)grp='warm'; else if(sc>aq3)grp='cold';
    const ban=d.banned?'style="opacity:.4"':'';
    return '<tr '+ban+'>'+
      '<td><b>'+n+'</b>'+(d.banned?'🚫':d.cold?'❄':'')+'</td>'+
      '<td>'+d.drt+'</td><td>'+d.f15+'</td>'+
      (is90?'<td style="color:#f97316">'+(d.jfr||0)+'</td>':'')+
      '<td>'+d.cl+'</td><td>'+d.fs+'</td><td>'+d.auto+'</td>'+
      '<td><input type="number" step="0.1" data-n="'+n+'" class="p719-ms-inp" value="'+(d.manual!==null&&d.manual!==undefined?d.manual:'')+'" placeholder="—"></td>'+
      '<td><b style="color:'+colors[grp]+'">'+d.final+'</b></td>'+
      '<td style="font-size:10px;color:'+colors[grp]+'">'+grp+'</td></tr>';
  }).join('');
};

P719.scoreSave=function(){
  const ms={};
  document.querySelectorAll('.p719-ms-inp').forEach(inp=>{
    const n=inp.dataset.n,v=inp.value.trim();
    if(v!==''&&!isNaN(parseFloat(v)))ms[n]=parseFloat(v);
  });
  saveMS(ms);_sc={};P719.analyze();P719.renderScore();
  alert('Manuel skorlar kaydedildi.');
};

P719.scoreReset=function(){
  if(!confirm('Tüm manuel skorlar silinecek?'))return;
  saveMS({});_sc={};P719.analyze();P719.renderScore();
};

// ── BACKTEST ──────────────────────────────────────────────────
P719.runBacktest=function(){
  const db=loadDB();const maxN=mx();
  if(db.e.length<21){alert('Backtest için en az 21 çekiliş gerekli.');return;}
  const results=[];
  for(let ti=0;ti<20;ti++){
    const actual=new Set(db.e[ti].nums);
    const past=db.e.slice(ti+1);
    const tmpDB={e:past};
    // Geçici olarak DB'yi değiştir
    const origDB=loadDB();
    saveDB(tmpDB);
    const sc=scoreAll(past,maxN);
    saveDB(origDB);
    const top25=new Set(sc._sel25||[]);
    const hits=[...actual].filter(n=>top25.has(n));
    results.push({ti,actual:sorted(actual),hits:hits.length,found:hits.sort((a,b)=>a-b)});
  }
  const avg=results.reduce((s,r)=>s+r.hits,0)/results.length;
  const four=results.filter(r=>r.hits>=4).length;

  const box=$$('p719-bt-result');if(!box)return;
  box.style.display='';
  box.innerHTML=
    '<div style="font-weight:700;color:var(--color-accent,#53f0db);margin-bottom:6px">'+
    'Top-25 ort: '+avg.toFixed(2)+'/6 &nbsp;|&nbsp; 4+ hit: '+four+'/20</div>'+
    results.map(r=>{
      const cls=r.hits>=4?'p719-bt-hit4':r.hits>=3?'p719-bt-hit3':'p719-bt-hit2';
      return '<div class="p719-bt-row">'+
        '<span style="width:28px;color:var(--color-text-secondary)">Ç'+(r.ti+1)+'</span>'+
        '<span style="flex:1;font-size:10px">'+r.actual.join(' ')+'</span>'+
        '<span class="'+cls+'">'+r.hits+'/6</span>'+
        (r.found.length?'<span style="color:#6bcb77;font-size:10px;margin-left:4px">['+r.found.join(',')+']</span>':'')+
        '</div>';
    }).join('');
};
function sorted(set){return [...set].sort((a,b)=>a-b);}

// ── INIT ──────────────────────────────────────────────────────
function init(){
  updateBadge();
  // Başlangıç analizi
  const db=loadDB();
  _sc=scoreAll(db.e,mx());
  P719.renderGroups();
  // p-game değişince güncelle
  const pg=document.getElementById('p-game');
  if(pg)pg.addEventListener('change',()=>{
    setTimeout(()=>{updateBadge();_sc={};_sel.clear();P719.analyze();},150);
  });
  // DB'nin başlangıç tarihi
  const di=$$('p719-new-date');
  if(di){const now=new Date();di.value=now.toISOString().slice(0,10);}
}

if(document.readyState==='loading')
  document.addEventListener('DOMContentLoaded',()=>setTimeout(init,600));
else setTimeout(init,600);
})();

