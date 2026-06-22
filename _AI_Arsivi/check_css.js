const fs = require('fs');
const content = fs.readFileSync('PROMPT_BUILDER_v8_0.html', 'utf-8');

let lines = content.split('\n');
for(let i=0; i<lines.length; i++) {
    if (lines[i].includes('final-score')) {
        console.log(i + ": " + lines[i]);
    }
}
