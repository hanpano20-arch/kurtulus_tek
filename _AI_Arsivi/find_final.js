const fs = require('fs');
const content = fs.readFileSync('PROMPT_BUILDER_v8_0.html', 'utf-8');
const lines = content.split('\n');

for(let i=10830; i<=10845; i++) {
    console.log(i + ": " + lines[i]);
}
