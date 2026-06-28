const fs = require('fs');
const file = 'Motor_Test_Paneli.html';
let content = fs.readFileSync(file, 'utf8');

const regexHeader = /<div class="modal-header">\s*<h3>[^<]*Kurallar[^<]*Taban Puanlar[^<]*<\/h3>\s*<button type="button" class="close-btn" onclick="closeSettings\(event\)">&times;<\/button>\s*<\/div>/g;

const newHeader = `<div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 10px;">
                <h3 style="font-size: 1.5em; margin: 0;">⚙️ Kuralların Taban Puanları</h3>
                <div style="display: flex; gap: 10px;">
                    <button type="button" class="btn" onclick="closeSettings(event)" style="background: #f44336; min-height: 40px; padding: 0 15px; font-size: 14px; width: 160px; justify-content: center; color: white;">SAYFAYI KAPAT</button>
                    <button type="button" class="btn" id="btnSaveSettings" onclick="saveSettings(event)" style="background: #00bcd4; min-height: 40px; padding: 0 15px; font-size: 14px; width: 160px; justify-content: center; color: white;">AYARLARI KAYDET</button>
                </div>
            </div>`;

if (regexHeader.test(content)) {
    content = content.replace(regexHeader, newHeader);
    console.log("Header replaced.");
} else {
    console.log("Header NOT found!");
}

const targetFooter = `<div style="text-align: right; margin-top: 15px;">\r\n                <button type="button" class="btn" id="btnSaveSettings" onclick="saveSettings(event)">AYARLARI KAYDET</button>\r\n            </div>`;
const targetFooterLF = `<div style="text-align: right; margin-top: 15px;">\n                <button type="button" class="btn" id="btnSaveSettings" onclick="saveSettings(event)">AYARLARI KAYDET</button>\n            </div>`;

if (content.includes(targetFooter)) {
    content = content.replace(targetFooter, "<!-- Butonlar yukarı taşındı -->");
    console.log("Footer replaced.");
} else if (content.includes(targetFooterLF)) {
    content = content.replace(targetFooterLF, "<!-- Butonlar yukarı taşındı -->");
    console.log("Footer (LF) replaced.");
} else {
    console.log("Footer NOT found! Using Regex.");
    const regexFooter = /<div style="text-align: right; margin-top: 15px;">\s*<button type="button" class="btn" id="btnSaveSettings" onclick="saveSettings\(event\)">AYARLARI KAYDET<\/button>\s*<\/div>/g;
    content = content.replace(regexFooter, "<!-- Butonlar yukarı taşındı -->");
}

fs.writeFileSync(file, content);
