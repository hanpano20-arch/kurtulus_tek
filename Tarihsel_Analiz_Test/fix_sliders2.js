const fs = require('fs');
const file = 'Motor_Test_Paneli.html';
let content = fs.readFileSync(file, 'utf8');

const badCard1 = `<div class="card" style="display: flex; align-items: center; padding: 10px; background: rgba(255,255,255,0.05); gap: 10px;">
                    <div style="flex: 1;">
                        <div style="font-weight: 600;">K14 Çarpanı</div>
                        <div style="font-size: 0.8em; color: #aaa;">(Son 3 Eleme)</div>
                    </div><span style="display:none">`;
const goodRow1 = `<div class="slider-row">
                    <span class="slider-label" style="color: white;">K14 Çarpanı <br><span`;

const badCard2 = `<div class="card" style="display: flex; align-items: center; padding: 10px; background: rgba(255,255,255,0.05); gap: 10px;">
                    <div style="flex: 1;">
                        <div style="font-weight: 600;">K15 Çarpanı</div>
                        <div style="font-size: 0.8em; color: #aaa;">(Son 10 Yankı)</div>
                    </div><span style="display:none">`;
const goodRow2 = `<div class="slider-row">
                    <span class="slider-label" style="color: white;">K15 Çarpanı <br><span`;

content = content.replace(badCard1, goodRow1);
content = content.replace(badCard2, goodRow2);

fs.writeFileSync(file, content);
console.log('Fixed slider rows');
