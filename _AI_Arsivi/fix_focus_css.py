import sys

file_path = 'PROMPT_BUILDER_v8_0.html'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # The current CSS is:
    # body.focus-tarihsel #controls-card,
    # body.focus-tarihsel #v75-super-group,
    # body.focus-tarihsel #prompt-output-card,
    # body.focus-tarihsel .app-title {
    #     display: none !important;
    # }
    
    target_css = """body.focus-tarihsel #controls-card,
body.focus-tarihsel #v75-super-group,
body.focus-tarihsel #prompt-output-card,
body.focus-tarihsel .app-title {
    display: none !important;
}"""

    new_css = """/* Hide EVERYTHING except the Tarihsel card itself */
body.focus-tarihsel .card:not(#v717-hist-card) {
    display: none !important;
}
body.focus-tarihsel > :not(.card):not(script):not(style) {
    /* Hide headers, titles, floating buttons etc. */
    display: none !important;
}
body.focus-tarihsel #v717-hist-card {
    /* Ensure it takes full width/height if needed */
    margin-top: 0 !important;
}"""

    if target_css in content:
        content = content.replace(target_css, new_css)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("CSS successfully patched!")
    else:
        print("Could not find the target CSS block. Let's try regex.")
        import re
        content = re.sub(r'body\.focus-tarihsel #controls-card.*display: none !important;\n\}', new_css, content, flags=re.DOTALL)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("CSS patched via regex!")

except Exception as e:
    print("Error:", e)
