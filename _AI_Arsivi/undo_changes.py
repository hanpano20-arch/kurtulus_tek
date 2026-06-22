import sys
import re

file_path = 'PROMPT_BUILDER_v8_0.html'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Remove the global hiding of prompt-output-card
    bad_css_1 = """<style>
/* Hiding Prompt output area as requested */
#prompt-output-card,
button[onclick="buildAndSend()"],
button[onclick="copyPrompt()"],
button[onclick="buildAndSend()"] + button,
.btn-row:has(button[onclick="buildAndSend()"]) {
   display: none !important;
}
</style>"""
    if bad_css_1 in content:
        content = content.replace(bad_css_1, "")
        print("Removed bad_css_1")

    bad_css_2 = """<style>
/* Focus Mode for Tarihsel Analiz */
body.focus-tarihsel .card:not(#v717-hist-card) {
   display: none !important;
}
body.focus-tarihsel .app-title {
   display: none !important;
}
body.focus-tarihsel {
   padding-top: 10px !important;
}
</style>"""
    if bad_css_2 in content:
        content = content.replace(bad_css_2, "")
        print("Removed bad_css_2")

    # 2. Fix doToggle in ensureCollapsible (line 8490) and wrapCard (line 5544)
    # Revert doToggle to original state.
    original_doToggle = """function doToggle(e) {
if (e && e.target.closest('input,textarea,select,button,a,.pill,.filter-btn,.v55-toggle,.v74-num,.v75-map-chip')) {
if (!e.target.closest('.v55-toggle')) return;
}
setCollapsed(card, !card.classList.contains('v55-collapsed'));
}"""
    # Wait, my patched version looks like:
    patched_doToggle = """function doToggle(e) { 
        if (e && e.target.closest('input,textarea,select,button,a,.pill,.filter-btn,.v55-toggle,.v74-num,.v75-map-chip')) { 
            if (!e.target.closest('.v55-toggle')) return; 
        } 
        let isCollapsing = !card.classList.contains('v55-collapsed');
        setCollapsed(card, isCollapsing); 
        if (card.id === 'v717-hist-card') {
            if (!isCollapsing) {
                document.body.classList.add('focus-tarihsel');
            } else {
                document.body.classList.remove('focus-tarihsel');
            }
        }
    }"""
    if patched_doToggle in content:
        content = content.replace(patched_doToggle, original_doToggle)
        print("Reverted patched_doToggle")

    # 3. Revert dataset.v55Ready patch
    patched_ensure = """card.dataset.v55Ready = '1';
    if (card.id === 'v717-hist-card' && !card.classList.contains('v55-collapsed')) {
        document.body.classList.add('focus-tarihsel');
    }"""
    if patched_ensure in content:
        content = content.replace(patched_ensure, "card.dataset.v55Ready = '1';")
        print("Reverted patched_ensure")
        
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Undo complete. Ready for clean implementation.")

except Exception as e:
    print("Error:", e)
