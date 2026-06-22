const fs = require('fs');
const content = fs.readFileSync('PROMPT_BUILDER_v8_0.html', 'utf-8');
const lines = content.split('\n');

let start = -1;
let end = -1;
for(let i=0; i<lines.length; i++) {
    if (lines[i].includes('extractDetailsForUI: function')) {
        start = i;
    }
    if (start !== -1 && lines[i].includes('},')) {
        // Wait, it might be a long function, let's just grab 100 lines
        end = i;
    }
}

for(let i=start; i<=start+100; i++) {
    console.log(i + ": " + lines[i]);
}
