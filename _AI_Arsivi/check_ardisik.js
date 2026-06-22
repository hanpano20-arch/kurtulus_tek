const fs = require('fs');
const content = fs.readFileSync('PROMPT_BUILDER_v8_0.html', 'utf-8');

let parts = content.split('extractDetailsForUI:');
if (parts.length > 1) {
    let ui_code = parts[1];
    let lines = ui_code.split('\n');
    for(let i=0; i<lines.length; i++) {
        if (lines[i].includes('PUAN_ARDISIK_CEKIM')) {
            for(let j=i-5; j<=i+10; j++) console.log(j + ": " + lines[j]);
            break;
        }
    }
}
