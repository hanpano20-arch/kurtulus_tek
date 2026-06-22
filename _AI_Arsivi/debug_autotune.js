const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const html = fs.readFileSync('PROMPT_BUILDER_v8_0.html', 'utf8');
const dom = new JSDOM(html, { runScripts: "dangerously" });
const window = dom.window;

setTimeout(() => {
    try {
        console.log("HavuzMotoru available?", !!window.HavuzMotoru);
        window.alert = console.log; // mock alert
        window.HavuzMotoru.autoTune().then(() => {
            console.log("autoTune finished!");
        }).catch(e => {
            console.error("autoTune crashed!", e);
        });
    } catch(e) {
        console.error("Error setting up:", e);
    }
}, 1000);
