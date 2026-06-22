import re

with open('PROMPT_BUILDER_v8_0.html', 'r', encoding='utf-8') as f:
    html = f.read()

scripts = re.findall(r'<script>(.*?)</script>', html, re.DOTALL)
js = '\n'.join(scripts)

# Add dummy DOM
dummy = """
const document = {
    getElementById: function(id) {
        return { value: "10" };
    },
    querySelector: function(s) {
        return { innerHTML: "" };
    }
};
const window = { HavuzMotoru: {} };
const alert = console.log;
"""

with open('test_run.js', 'w', encoding='utf-8') as f:
    f.write(dummy + js + '\nconsole.log(typeof window.HavuzMotoru.runBacktest);\n')
