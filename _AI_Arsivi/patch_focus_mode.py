import sys
import re

file_path = 'PROMPT_BUILDER_v8_0.html'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update doToggle logic
    target_doToggle = """function doToggle(e) { if (e && e.target.closest('input,textarea,select,button,a,.pill,.filter-btn,.v55-toggle,.v74-num,.v75-map-chip')) { if (!e.target.closest('.v55-toggle')) return; } setCollapsed(card, !card.classList.contains('v55-collapsed')); }"""
    
    new_doToggle = """function doToggle(e) { 
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
    
    if target_doToggle in content:
        content = content.replace(target_doToggle, new_doToggle)
        print("Patched doToggle logic.")
    else:
        print("Could not find target_doToggle. Will attempt regex.")
        # If minified or spaced differently
        pattern = re.compile(r"function doToggle\(e\) \{.*?setCollapsed\(card, !card\.classList\.contains\('v55-collapsed'\)\); \}")
        match = pattern.search(content)
        if match:
            content = content[:match.start()] + new_doToggle + content[match.end():]
            print("Patched doToggle logic via regex.")
        else:
            print("Failed to find doToggle.")

    # 2. Inject CSS for .focus-tarihsel
    css_injection = """
<style>
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
</style>
</head>
"""
    content = content.replace("</head>", css_injection)
    print("Injected CSS for focus mode.")
    
    # 3. If Tarihsel card is currently open by default, we should add the class to body initially, OR 
    # we can just make it closed by default, or trigger the logic.
    # The default state of the card depends on if it has .v55-collapsed. By default it is OPEN.
    # Wait, the user says "tarihsel... aç dediğimde", so maybe it is open right now and he wants to close it to see the rest.
    # So if it is open initially, maybe we should add the class initially?
    # Let's add an initial check when ensuring collapsibility.
    target_ensure = "card.dataset.v55Ready = '1';"
    new_ensure = """card.dataset.v55Ready = '1';
    if (card.id === 'v717-hist-card' && !card.classList.contains('v55-collapsed')) {
        document.body.classList.add('focus-tarihsel');
    }"""
    content = content.replace(target_ensure, new_ensure)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Done")

except Exception as e:
    print("Error:", e)
