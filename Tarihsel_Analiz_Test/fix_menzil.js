const fs = require('fs');
const file = 'test_motor_v3.js';
let content = fs.readFileSync(file, 'utf8');

if (content.includes('ayarlar.K15_MENZIL')) {
    content = content.replace('ayarlar.K15_MENZIL', 'ayarlar.K15_SON_X');
    fs.writeFileSync(file, content);
    console.log('Fixed K15_MENZIL to K15_SON_X');
} else {
    console.log('Already fixed or not found');
}
