
const fs = require('fs');
const { JSDOM } = require('jsdom');
const html = fs.readFileSync('PROMPT_BUILDER_v8_0.html', 'utf8');
const dom = new JSDOM(html, { runScripts: 'dangerously' });
let errors = [];
dom.window.onerror = function(msg, source, lineno, colno, error) {
    errors.push({msg, lineno});
};
setTimeout(() => {
    if (errors.length > 0) {
        console.log('Errors:', errors);
    } else {
        console.log('No errors on load.');
        // test the button
        try {
            dom.window.H.showPuanAyarlari();
            console.log('showPuanAyarlari ran without error!');
        } catch(e) {
            console.log('showPuanAyarlari ERROR:', e.message);
        }
    }
}, 1000);
