const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const html = fs.readFileSync('PROMPT_BUILDER_v8_0.html', 'utf8');

const dom = new JSDOM(html, { runScripts: "dangerously" });

// Polyfills
dom.window.alert = console.log;
dom.window.confirm = () => true;

setTimeout(() => {
    try {
        console.log("Running runBacktest...");
        dom.window.HavuzMotoru.runBacktest();
        console.log("Success");
    } catch (e) {
        console.error("Error in runBacktest:", e);
    }
}, 1000);
