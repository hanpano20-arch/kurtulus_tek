import sys
import re

file_path = 'PROMPT_BUILDER_v8_0.html'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update Grid
    target_grid = """outputHtml += `<div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(310px, 1fr)); column-gap: 15px; row-gap: 8px;">`;"""
    new_grid = """outputHtml += `<div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); column-gap: 8px; row-gap: 8px;">`;"""
    
    if target_grid in content:
        content = content.replace(target_grid, new_grid)
        print("Patched inner grid!")
    else:
        print("Inner grid not found.")

    # 2. Update Row and Date
    target_row = """              let rowHtml = `<div style="display:flex; align-items:center; flex-wrap:wrap;">`;
              rowHtml += `<span style="width:80px; color:#aaa; font-size:11px; font-weight:bold;">${item.tarih}</span>`;
              rowHtml += `<div style="display:flex; gap:3px;">`;"""
    new_row = """              let rowHtml = `<div style="display:flex; align-items:center; flex-wrap:nowrap;">`;
              rowHtml += `<span style="width:65px; color:#aaa; font-size:10px; font-weight:bold; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${item.tarih}">${item.tarih}</span>`;
              rowHtml += `<div style="display:flex; gap:2px;">`;"""
              
    if target_row in content:
        content = content.replace(target_row, new_row)
        print("Patched row wrapper!")
    else:
        print("Row wrapper not found.")

    # 3. Update Boxes
    target_boxes = """                rowHtml += `<div style="display:flex; flex-direction:column; align-items:center; gap:2px;">
                              <span style="display:inline-flex; align-items:center; justify-content:center; width:34px; height:34px; font-size:15px; background:${bg}; color:${txtColor}; font-weight:bold; border-radius:6px; border:1px solid ${borderColor}; box-shadow:0 1px 3px rgba(0,0,0,0.4);">${num}</span>
                              <span style="font-size:11px; color:#aaa; font-family:var(--font-mono, monospace); font-weight:bold; letter-spacing:-0.5px;">${puan}p</span>
                            </div>`;"""
    new_boxes = """                rowHtml += `<div style="display:flex; flex-direction:column; align-items:center; gap:1px;">
                              <span style="display:inline-flex; align-items:center; justify-content:center; width:26px; height:26px; font-size:13px; background:${bg}; color:${txtColor}; font-weight:bold; border-radius:4px; border:1px solid ${borderColor}; box-shadow:0 1px 2px rgba(0,0,0,0.3);">${num}</span>
                              <span style="font-size:9px; color:#aaa; font-family:var(--font-mono, monospace); font-weight:bold; letter-spacing:-0.5px;">${puan}p</span>
                            </div>`;"""
                            
    if target_boxes in content:
        content = content.replace(target_boxes, new_boxes)
        print("Patched boxes!")
    else:
        print("Boxes not found.")
        
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Done")

except Exception as e:
    print("Error:", e)
