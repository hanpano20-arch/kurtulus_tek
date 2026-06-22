const fs = require('fs');
const content = fs.readFileSync('PROMPT_BUILDER_v8_0.html', 'utf-8');
const lines = content.split('\n');

for(let i=0; i<lines.length; i++) {
    if (lines[i].includes("id: 'k14'")) {
        console.log("RULES TARGET:");
        for(let j=i-1; j<=i+2; j++) console.log(lines[j]);
    }
    if (lines[i].includes("k14: k14")) {
        console.log("RETURN TARGET:");
        for(let j=i-1; j<=i+2; j++) console.log(lines[j]);
    }
    if (lines[i].includes("details.k14 + '</td>'")) {
        console.log("TD TARGET:");
        for(let j=i-1; j<=i+2; j++) console.log(lines[j]);
    }
    if (lines[i].includes("let k14 = 0;")) {
        console.log("LOGIC TARGET:");
        for(let j=i-1; j<=i+15; j++) console.log(lines[j]);
    }
}
