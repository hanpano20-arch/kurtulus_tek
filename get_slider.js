const fs = require('fs');
const content = fs.readFileSync('PROMPT_BUILDER_v8_0.html', 'utf-8');
const lines = content.split('\n');

let start = -1;
for(let i=0; i<lines.length; i++) {
    if (lines[i].includes('let gecmis_puani = 0;')) {
        start = i;
        break;
    }
}

if (start !== -1) {
    for(let i=start-2; i<=start+15; i++) {
        console.log(lines[i]);
    }
}
