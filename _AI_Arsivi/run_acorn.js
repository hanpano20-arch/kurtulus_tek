const fs = require('fs');
const html = fs.readFileSync('PROMPT_BUILDER_v8_0.html', 'utf8');
const regex = /<script>([\s\S]*?)<\/script>/g;
let match;
let js = '';
while ((match = regex.exec(html)) !== null) {
  js += match[1] + '\n';
}

const acorn = require('acorn');
try {
  acorn.parse(js, { ecmaVersion: 2020 });
  console.log("Syntax OK");
} catch (e) {
  console.log("Syntax Error:", e);
}
