import sys
import re

file_path = 'PROMPT_BUILDER_v8_0.html'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove any previously injected Focus Mode implementations (just to be safe)
    if "<!-- TARIHSEL FOCUS MODE CLEAN IMPLEMENTATION -->" in content:
        print("Clean implementation already exists, replacing it...")
        content = re.sub(r'<!-- TARIHSEL FOCUS MODE CLEAN IMPLEMENTATION -->.*?</script>\n', '', content, flags=re.DOTALL)
        content = content.replace('</body>', '') # We will re-add it below

    # Define the new injection block
    injection = """
<!-- TARIHSEL FOCUS MODE CLEAN IMPLEMENTATION -->
<style id="tarihsel-focus-style">
body.focus-tarihsel #controls-card,
body.focus-tarihsel #v75-super-group,
body.focus-tarihsel #prompt-output-card,
body.focus-tarihsel .app-title {
    display: none !important;
}
body.focus-tarihsel {
    padding-top: 10px !important;
}
</style>
<script>
document.addEventListener('DOMContentLoaded', () => {
    // Wait for init scripts and grouping scripts to finish
    setTimeout(() => {
        const histCard = document.getElementById('v717-hist-card');
        if (!histCard) return;

        const updateFocusMode = () => {
            // v55-collapsed means it is hidden. If it DOES NOT have this class, it is OPEN.
            const isCollapsed = histCard.classList.contains('v55-collapsed');
            if (!isCollapsed) {
                // It is open, activate focus mode (hide top sections)
                document.body.classList.add('focus-tarihsel');
            } else {
                // It is closed, remove focus mode (show top sections)
                document.body.classList.remove('focus-tarihsel');
            }
        };

        // Apply on load
        updateFocusMode();

        // Listen for class changes on the card reliably
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    updateFocusMode();
                }
            });
        });
        
        observer.observe(histCard, { attributes: true });

    }, 800); // 800ms delay to let UI settle
});
</script>
</body>
"""

    if "<!-- TARIHSEL FOCUS MODE CLEAN IMPLEMENTATION -->" not in content:
        # Avoid duplicating </body> if we stripped it
        if "</body>" in content:
            content = content.replace("</body>", injection)
        else:
            content = content + injection
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Safe Focus Mode Logic successfully injected.")
    else:
        print("Logic already present.")

except Exception as e:
    print("Error:", e)
