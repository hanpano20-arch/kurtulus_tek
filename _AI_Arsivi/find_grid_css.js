const fs = require('fs');
const content = fs.readFileSync('PROMPT_BUILDER_v8_0.html', 'utf-8');
const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('.num-box') || lines[i].includes('.num-group') || lines[i].includes('.group-title')) {
        for(let j = i - 2; j <= i + 15; j++) {
            console.log(j + ": " + lines[j]);
        }
        break;
    }
}
