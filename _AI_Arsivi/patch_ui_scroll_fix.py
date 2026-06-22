import sys

file_path = 'PROMPT_BUILDER_v8_0.html'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # We need to replace the CSS for .fullscreen-modal
    target = """    .fullscreen-modal {
       position: fixed !important;
       top: 0 !important;
       left: 0 !important;
       width: 100vw !important;
       height: 100vh !important;
       max-height: 100vh !important;
       background: #080c10 !important;
       z-index: 999999 !important;
       padding: 20px !important;
       box-sizing: border-box !important;
       display: flex !important;
       flex-direction: column !important;
    }
    .fullscreen-modal .dst-table-scroll-area {
       flex: 1 !important;
       max-height: none !important;
    }"""

    replacement = """    .fullscreen-modal {
       position: fixed !important;
       top: 0 !important;
       left: 0 !important;
       width: 100vw !important;
       height: 100vh !important;
       max-height: 100vh !important;
       background: #080c10 !important;
       z-index: 999999 !important;
       padding: 20px !important;
       box-sizing: border-box !important;
       display: flex !important;
       flex-direction: column !important;
       overflow: hidden !important;
    }
    .fullscreen-modal .dst-table-scroll-area {
       flex: 1 !important;
       max-height: none !important;
       overflow-y: auto !important;
       min-height: 0 !important;
    }"""

    if target in content:
        content = content.replace(target, replacement)
        print("Patched fullscreen-modal CSS")
    else:
        print("Failed to find CSS target")

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

except Exception as e:
    print("Error:", e)
