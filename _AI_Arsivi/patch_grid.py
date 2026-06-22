import sys
import re

file_path = 'PROMPT_BUILDER_v8_0.html'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update the container
    target_container = """            outputHtml += `<div id="bt-cat-${k}" style="display:none; padding:12px; background:rgba(255,255,255,0.03); border-left:1px solid #444; border-right:1px solid #444; border-bottom:1px solid #444; border-radius:0 0 6px 6px;">`;

            items.forEach(item => {
              let rowHtml = `<div style="display:flex; align-items:center; margin-bottom:6px; flex-wrap:wrap;">`;"""
              
    new_container = """            outputHtml += `<div id="bt-cat-${k}" style="display:none; padding:12px; background:rgba(255,255,255,0.03); border-left:1px solid #444; border-right:1px solid #444; border-bottom:1px solid #444; border-radius:0 0 6px 6px;">`;
            outputHtml += `<div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(310px, 1fr)); column-gap: 15px; row-gap: 8px;">`;

            items.forEach(item => {
              let rowHtml = `<div style="display:flex; align-items:center; flex-wrap:wrap;">`;"""
              
    if target_container in content:
        content = content.replace(target_container, new_container)
        print("Updated container successfully!")
    else:
        print("Container not found, trying regex.")
        content = re.sub(r'outputHtml \+= `<div id="bt-cat-\$\{k\}" style="display:none; padding:12px; background:rgba\(255,255,255,0\.03\); border-left:1px solid #444; border-right:1px solid #444; border-bottom:1px solid #444; border-radius:0 0 6px 6px;">`;\s*items\.forEach\(item => \{\s*let rowHtml = `<div style="display:flex; align-items:center; margin-bottom:6px; flex-wrap:wrap;">`;', new_container, content)
        print("Updated container via regex")
        
    # 2. Add closing </div> for the grid
    target_close = """            });

            outputHtml += `</div></div>`;
          }
        }"""
        
    new_close = """            });
            outputHtml += `</div>`; // close grid

            outputHtml += `</div></div>`;
          }
        }"""
        
    if target_close in content:
        content = content.replace(target_close, new_close)
        print("Added grid closer successfully!")
    else:
        print("Grid closer not found, trying regex.")
        content = re.sub(r'\}\);\s*outputHtml \+= `</div></div>`;\s*\}\s*\}', new_close, content)
        print("Added grid closer via regex")

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Done")

except Exception as e:
    print("Error:", e)
