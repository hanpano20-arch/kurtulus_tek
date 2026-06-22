const fs = require('fs');
const html = fs.readFileSync('PROMPT_BUILDER_v8_0.html', 'utf8');
const regex = /<script>([\s\S]*?)<\/script>/g;
let match;
let allJs = '';
while ((match = regex.exec(html)) !== null) {
  allJs += match[1] + '\n';
}
fs.writeFileSync('temp_check.js', allJs);
console.log('Written to temp_check.js');
