const fs = require('fs');
let content = fs.readFileSync('PROMPT_BUILDER_v8_0.html', 'utf8');

// Find K11 inside extractDetailsForUI
let lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('let k11') || lines[i].includes('K11') || (lines[i].includes('k11') && lines[i].includes('='))) {
        console.log(`${i}: ${lines[i]}`);
    }
}
