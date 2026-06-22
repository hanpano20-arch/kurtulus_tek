import os
import re

file_path = "PROMPT_BUILDER_v8_1.html"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Pattern for v718-hist-engine
# It starts with <script id="v718-hist-engine"> and ends with </script>
hist_engine_pattern = re.compile(r'(<script id="v718-hist-engine">)(.*?)(</script>)', re.DOTALL)
hist_engine_match = hist_engine_pattern.search(content)

if hist_engine_match:
    hist_engine_code = hist_engine_match.group(2)
    with open("v8_hist_engine.js", "w", encoding="utf-8") as f:
        f.write(hist_engine_code.strip() + "\n")
    
    # Replace in HTML
    content = content[:hist_engine_match.start()] + '<script src="v8_hist_engine.js"></script>' + content[hist_engine_match.end():]
    print("Extracted v8_hist_engine.js")
else:
    print("Could not find v718-hist-engine script block.")

# Pattern for HavuzMotoru
# It starts right after the previous script or simply it's the next <script> that contains window.HavuzMotoru
motor_pattern = re.compile(r'(<script>)\s*(// --- HAVUZ MOTORU ENTEGRASYONU ---.*?)(</script>)', re.DOTALL)
motor_match = motor_pattern.search(content)

if motor_match:
    motor_code = motor_match.group(2)
    with open("v8_havuz_motoru.js", "w", encoding="utf-8") as f:
        f.write(motor_code.strip() + "\n")
    
    # Replace in HTML
    content = content[:motor_match.start()] + '<script src="v8_havuz_motoru.js"></script>' + content[motor_match.end():]
    print("Extracted v8_havuz_motoru.js")
else:
    print("Could not find HavuzMotoru script block.")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated PROMPT_BUILDER_v8_1.html successfully.")
