const fs = require('fs');
const content = fs.readFileSync('PROMPT_BUILDER_v8_0.html', 'utf-8');
const lines = content.split('\n');

let found = false;
for(let i=0; i<lines.length; i++) {
    if (lines[i].includes('function renderRows')) {
        found = true;
    }
    if (found) {
        console.log(i + ": " + lines[i]);
        if (lines[i].includes('return res;')) break;
    }
}
