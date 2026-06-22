import sys

file_path = 'PROMPT_BUILDER_v8_0.html'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update CSS
    target_css = """    .rank-sicak { color: #ff3333; text-shadow: 0 0 8px rgba(255,51,51,0.8); font-weight: bold; }
    .rank-ilik { color: #ff9933; text-shadow: 0 0 8px rgba(255,153,51,0.8); font-weight: bold; }
    .rank-soguk { color: #33ccff; text-shadow: 0 0 8px rgba(51,204,255,0.8); font-weight: bold; }
    .rank-disi { color: #cc66ff; text-shadow: 0 0 8px rgba(204,102,255,0.8); font-weight: bold; }"""
    
    replacement_css = """    .rank-sicak { background-color: rgba(255, 51, 51, 0.35) !important; color: #ffffff; font-weight: bold; box-shadow: inset 0 0 12px rgba(255,51,51,0.6); border-left: 3px solid #ff3333 !important; }
    .rank-ilik { background-color: rgba(255, 153, 51, 0.35) !important; color: #ffffff; font-weight: bold; box-shadow: inset 0 0 12px rgba(255,153,51,0.6); border-left: 3px solid #ff9933 !important; }
    .rank-soguk { background-color: rgba(51, 204, 255, 0.35) !important; color: #ffffff; font-weight: bold; box-shadow: inset 0 0 12px rgba(51,204,255,0.6); border-left: 3px solid #33ccff !important; }
    .rank-disi { background-color: rgba(153, 51, 255, 0.35) !important; color: #ffffff; font-weight: bold; box-shadow: inset 0 0 12px rgba(153,51,255,0.6); border-left: 3px solid #cc66ff !important; }"""

    if target_css in content:
        content = content.replace(target_css, replacement_css)
        print("Patched CSS backgrounds")
    else:
        print("Failed to patch CSS")

    # 2. Update HTML (remove #)
    target_td = """            res += '<td class="' + groupCss + '" style="font-size:16px;">#' + rank + '<br><span style="font-size:13px;">' + groupName + '</span></td>';"""
    replacement_td = """            res += '<td class="' + groupCss + '" style="font-size:16px; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">' + rank + '<br><span style="font-size:13px;">' + groupName + '</span></td>';"""

    if target_td in content:
        content = content.replace(target_td, replacement_td)
        print("Patched TD html")
    else:
        print("Failed to patch TD")


    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

except Exception as e:
    print("Error:", e)
