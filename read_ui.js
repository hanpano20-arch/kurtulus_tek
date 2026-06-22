const fs = require('fs');
const content = fs.readFileSync('PROMPT_BUILDER_v8_0.html', 'utf-8');
const lines = content.split('\n');

// Find number boxes CSS
console.log("--- NUM BOX CSS ---");
for(let i=0; i<lines.length; i++) {
    if (lines[i].includes('.num-box') || lines[i].includes('.group-title') || lines[i].includes('AKILLI MOTOR')) {
        console.log(i + ": " + lines[i]);
    }
}
