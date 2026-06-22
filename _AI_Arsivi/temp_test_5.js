
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
