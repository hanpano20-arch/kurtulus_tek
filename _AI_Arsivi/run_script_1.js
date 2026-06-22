const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require('fs');

const scriptContent = fs.readFileSync('temp_script_1.js', 'utf8');
const html = `<html><body><script>${scriptContent}</script></body></html>`;

const virtualConsole = new jsdom.VirtualConsole();
virtualConsole.on("jsdomError", (e) => { console.error("jsdomError:", e); });

const dom = new JSDOM(html, { runScripts: "dangerously", virtualConsole, url: "http://localhost/" });
