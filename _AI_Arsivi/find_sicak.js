const fs = require('fs');
const content = fs.readFileSync('PROMPT_BUILDER_v8_0.html', 'utf-8');
const lines = content.split('\n');
for (let i=0; i<lines.length; i++) {
    if (lines[i].includes('SICAK') || lines[i].includes('Ilık') || lines[i].includes('İhtimal') || lines[i].includes('SOĞUK') || lines[i].includes('num-box')) {
        console.log(i + ": " + lines[i].substring(0, 150));
    }
}
