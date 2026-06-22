const fs = require('fs');
const html = fs.readFileSync('PROMPT_BUILDER_v8_1.html', 'utf8');
const inlineMatches = html.match(/on[a-z]+="[^"]+"/gi);
if (inlineMatches) {
    inlineMatches.forEach(m => {
        try {
            let code = m.substring(m.indexOf('"')+1, m.length-1);
            new Function(code);
        } catch(e) {
            console.log(m);
            console.log(e);
        }
    });
}
