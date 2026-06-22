const fs = require('fs');
const content = fs.readFileSync('PROMPT_BUILDER_v8_0.html', 'utf-8');
const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('.dst-group-title') || lines[i].includes('.dst-item')) {
        console.log(i + ": " + lines[i]);
    }
}
