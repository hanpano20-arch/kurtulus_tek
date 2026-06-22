const fs = require('fs');
const content = fs.readFileSync('PROMPT_BUILDER_v8_0.html', 'utf-8');
const lines = content.split('\n');

for(let i=0; i<lines.length; i++) {
    if (lines[i].includes('const rules = [')) {
        for(let j=i; j<i+20; j++) {
            console.log(j + ": " + lines[j]);
            if (lines[j].includes('];')) break;
        }
        break;
    }
}
