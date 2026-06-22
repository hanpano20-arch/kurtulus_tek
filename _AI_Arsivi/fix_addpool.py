import re

file_path = r'D:\GitHub\kurtulus_tek\PROMPT_BUILDER_v8_1.html'
with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

new_addPool = """      addPool: function () {
        let nums = [];
        document.querySelectorAll('.num-btn.ai-selected').forEach(el => {
          nums.push(parseInt(el.getAttribute('data-val')));
        });
        if (nums.length === 0) return;
        let merged = [...new Set([...this._pool, ...nums])].sort((a, b) => a - b);
        this._pool = merged;
        
        // Hide Modal logic
        let m = document.getElementById('pa-modal');
        if(m) m.style.display = 'none';
        let overlay = document.getElementById('pa-overlay');
        if(overlay) overlay.style.display = 'none';

        // Re-render UI
        this.renderScore();
        this.renderList();
        this.renderPool();

        alert(nums.length + ' sayı havuza eklendi. Toplam: ' + merged.length);
      },"""

text = re.sub(
    r'addPool:\s*function\s*\(\)\s*\{.*?alert\(nums\.length.*?merged\.length\);\s*\},',
    new_addPool,
    text,
    flags=re.DOTALL
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(text)

print("PROMPT_BUILDER_v8_1.html addPool patched!")
