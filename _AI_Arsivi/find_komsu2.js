const fs = require('fs');
let content = fs.readFileSync('PROMPT_BUILDER_v8_0.html', 'utf-8');
let lines = content.split('\n');

for(let i=11180; i<=11200; i++) {
    console.log(i + ": " + lines[i]);
}
