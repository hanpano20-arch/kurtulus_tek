const fs = require('fs');
const html = fs.readFileSync('PROMPT_BUILDER_v8_1.html', 'utf8');
const jsMatch = html.match(/<script>([\s\S]*?)<\/script>/g);
if(jsMatch) {
    jsMatch.forEach((script, idx) => {
        const content = script.replace('<script>', '').replace('<\/script>', '');
        fs.writeFileSync('temp_script_' + idx + '.js', content);
    });
}
