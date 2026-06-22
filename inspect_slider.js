const fs = require('fs');
const content = fs.readFileSync('PROMPT_BUILDER_v8_0.html', 'utf-8');

// Look for 'range' or 'slider' inputs and their listeners
const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].toLowerCase().includes('tarihsel') && lines[i].includes('input type="range"')) {
    console.log(`Slider HTML at line ${i}: ${lines[i].trim()}`);
  }
}

// Find how gecmis_puani and yakin_puani are combined in puanlari_hesapla
let in_puan_loop = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('let gecmis_puani = 0;')) {
    in_puan_loop = true;
  }
  if (in_puan_loop) {
    console.log(`Line ${i}: ${lines[i].trim()}`);
    if (lines[i].includes('puanlar[i] += Math.floor(gecmis_puani + yakin_puani);')) {
      in_puan_loop = false;
      break;
    }
  }
}
