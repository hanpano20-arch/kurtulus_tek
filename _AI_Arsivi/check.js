const fs = require('fs');
let content = fs.readFileSync('PROMPT_BUILDER_v8_0.html', 'utf8');
let start = content.indexOf('let db = {');
let end = content.indexOf(';\n', start);
eval(content.substring(start, end).replace('let db =', 'global.db ='));

let last_25 = db.entries.slice(0, 25).map(e => e.num.concat([e.joker]));
console.log("Last 25 draws (index 0 is most recent):");
last_25.forEach((d, i) => {
    console.log(i, ":", d, "has 41?", d.includes(41));
});
