const fs = require('fs');

let content = fs.readFileSync('PROMPT_BUILDER_v8_0.html', 'utf-8');

// The file contains multiple <script> tags. We can extract their content.
let scripts = [];
let idx = 0;
while ((idx = content.indexOf('<script', idx)) !== -1) {
    let start = content.indexOf('>', idx) + 1;
    let end = content.indexOf('</script>', start);
    if (end !== -1) {
        scripts.push(content.substring(start, end));
        idx = end + 9;
    } else {
        break;
    }
}

// Join and write to a temp js file
fs.writeFileSync('temp_check_syntax.js', scripts.join('\n\n'), 'utf-8');
console.log('Extracted JS. Please run: node -c temp_check_syntax.js');
