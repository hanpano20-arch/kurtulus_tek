const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const virtualConsole = new jsdom.VirtualConsole();
virtualConsole.on("error", () => { console.error("Error:", ...arguments); });
virtualConsole.on("jsdomError", (e) => { console.error("jsdomError:", e); });

const fs = require('fs');
const html = fs.readFileSync('PROMPT_BUILDER_v8_1.html', 'utf8');

const dom = new JSDOM(html, { runScripts: "dangerously", virtualConsole, url: "http://localhost/" });
