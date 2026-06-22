const fs = require('fs');
const content = fs.readFileSync('PROMPT_BUILDER_v8_0.html', 'utf-8');
const lines = content.split('\n');

let found = false;
for(let i=0; i<lines.length; i++) {
    if (lines[i].includes('extractDetailsForUI = function')) {
        found = true;
    }
    if (found) {
        console.log(i + ": " + lines[i]);
        if (lines[i].includes('return {')) {
            for(let j=i+1; j<=i+25; j++) console.log(j + ": " + lines[j]);
            break;
        }
    }
}
