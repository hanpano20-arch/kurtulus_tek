const fs = require('fs');
const file = 'Motor_Test_Paneli.html';
let content = fs.readFileSync(file, 'utf8');

const targetHeader = `<div class="modal-header">
                <h3>?? Kurallarýn Taban Puanlarý</h3>
                <button type="button" class="close-btn" onclick="closeSettings(event)">&times;</button>
            </div>`;

const newHeader = `<div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 10px;">
                <h3 style="font-size: 1.5em; margin: 0;">?? Kurallarýn Taban Puanlarý</h3>
                <div style="display: flex; gap: 10px;">
                    <button type="button" class="btn" onclick="closeSettings(event)" style="background: #f44336; min-height: 40px; padding: 0 15px; font-size: 14px; width: 160px; justify-content: center; color: white;">SAYFAYI KAPAT</button>
                    <button type="button" class="btn" id="btnSaveSettings" onclick="saveSettings(event)" style="background: #00bcd4; min-height: 40px; padding: 0 15px; font-size: 14px; width: 160px; justify-content: center; color: white;">AYARLARI KAYDET</button>
                </div>
            </div>`;

content = content.replace(targetHeader, newHeader);

const targetFooter = `<div style="text-align: right; margin-top: 15px;">
                <button type="button" class="btn" id="btnSaveSettings" onclick="saveSettings(event)">AYARLARI KAYDET</button>
            </div>`;

content = content.replace(targetFooter, "<!-- Butonlar yukarý taþýndý -->");

fs.writeFileSync(file, content);
console.log('Successfully updated HTML');
