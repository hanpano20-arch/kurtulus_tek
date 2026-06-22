const fs = require('fs');
const html = fs.readFileSync('PROMPT_BUILDER_v8_0.html', 'utf8');
console.log('Contains id="H":', html.includes('id="H"'));
console.log('Contains name="H":', html.includes('name="H"'));
