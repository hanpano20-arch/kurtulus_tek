const fs = require('fs');
let content = fs.readFileSync('PROMPT_BUILDER_v8_0.html', 'utf-8');
let lines = content.split('\n');

for(let i=0; i<lines.length; i++) {
    if (lines[i].includes('typeof komsuSayaci_1')) {
        console.log(i + ": " + lines[i].trim());
    }
    if (lines[i].includes('this.komsuSayaci_1')) {
        console.log(i + ": " + lines[i].trim());
    }
    if (lines[i].includes('let komsuSayaci_1') || lines[i].includes('const komsuSayaci_1') || lines[i].includes('var komsuSayaci_1')) {
        console.log(i + ": " + lines[i].trim());
    }
}
