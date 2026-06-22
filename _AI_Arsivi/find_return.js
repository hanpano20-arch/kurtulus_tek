const fs = require('fs');
const content = fs.readFileSync('PROMPT_BUILDER_v8_0.html', 'utf-8');
const lines = content.split('\n');

for(let i=11900; i<12100; i++) {
    if (lines[i].includes('return {') || lines[i].includes('base:')) {
        for(let j=i-2; j<=i+25; j++) {
            console.log(j + ": " + lines[j]);
            if (lines[j].includes('};')) break;
        }
        break;
    }
}
