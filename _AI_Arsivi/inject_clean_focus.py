import sys

file_path = 'PROMPT_BUILDER_v8_0.html'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # We will inject the CSS and JS at the end of the <body>
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
    // Wait for all init scripts to finish
    setTimeout(() => {
        const histCard = document.getElementById('v717-hist-card');
        if (!histCard) return;

        const updateFocusMode = () => {
            const isCollapsed = histCard.classList.contains('v55-collapsed');
            if (!isCollapsed) {
                document.body.classList.add('focus-tarihsel');
            } else {
                document.body.classList.remove('focus-tarihsel');
            }
        };

        // Initial state
        updateFocusMode();

        // Listen for class changes on histCard (MutationObserver is more reliable than click events)
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    updateFocusMode();
                }
            });
        });
        
        observer.observe(histCard, { attributes: true });

    }, 1000); // 1s delay ensures makeGroupedCard and init() are fully done
});
</script>
</body>
"""

    if "<!-- TARIHSEL FOCUS MODE CLEAN IMPLEMENTATION -->" not in content:
        content = content.replace("</body>", injection)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Clean Focus Mode Injected.")
    else:
        print("Already injected.")

except Exception as e:
    print("Error:", e)
