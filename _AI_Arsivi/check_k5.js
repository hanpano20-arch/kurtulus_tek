const fs = require('fs');
const content = fs.readFileSync('PROMPT_BUILDER_v8_0.html', 'utf-8');

let parts = content.split('extractDetailsForUI:');
if (parts.length > 1) {
    let ui_code = parts[1];
    let lines = ui_code.split('\n');
    for(let i=0; i<lines.length; i++) {
        if (lines[i].includes('let k5 = 0;')) {
            for(let j=i; j<=i+15; j++) console.log(j + ": " + lines[j]);
            break;
        }
    }
}
