const fs = require('fs');
const content = fs.readFileSync('PROMPT_BUILDER_v8_0.html', 'utf-8');
const lines = content.split('\n');

for(let i=0; i<lines.length; i++) {
    if (lines[i].includes('.dst-container')) {
        for(let j=i; j<=i+10; j++) console.log(j + ": " + lines[j]);
        break;
    }
}
