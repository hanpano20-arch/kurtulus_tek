
const fs = require('fs');
const { JSDOM } = require('jsdom');
const html = fs.readFileSync('PROMPT_BUILDER_v8_0.html', 'utf8');
const dom = new JSDOM(html, { runScripts: 'dangerously' });
setTimeout(() => {
    try {
        dom.window.H.showPuanAyarlari();
        console.log('Opened successfully!');
        const modal = dom.window.document.getElementById('dst-settings-modal');
        if (modal) {
            console.log('Modal is in DOM!');
        } else {
            console.log('Modal is NOT in DOM!');
        }
    } catch(e) {
        console.error('Error opening modal:', e);
    }
}, 1000);
