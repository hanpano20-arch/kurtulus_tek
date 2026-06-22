const fs = require('fs');
const content = fs.readFileSync('PROMPT_BUILDER_v8_0.html', 'utf-8');
const lines = content.split('\n');

for(let i=0; i<lines.length; i++) {
    if (lines[i].includes('res += \'<td>\' + details.historical')) {
        for(let j=i-5; j<=i+25; j++) console.log(j + ": " + lines[j]);
    }
}
