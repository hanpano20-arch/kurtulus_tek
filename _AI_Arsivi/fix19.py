with open('PROMPT_BUILDER_v8_1.html', 'r', encoding='utf-8') as f:
    html = f.read()

old_end = """        <div id="hm-backtest-results"
          style="color:#fff; background:rgba(0,0,0,0.5); padding:15px; border-radius:8px; max-height:400px; overflow-y:auto; display:none;">
        </div>
      </div>

      <script>"""

new_end = """        <div id="hm-backtest-results"
          style="color:#fff; background:rgba(0,0,0,0.5); padding:15px; border-radius:8px; max-height:400px; overflow-y:auto; display:none;">
        </div>
      </div>
    </div> <!-- THIS CLOSES hc-motor -->

      <script>"""

html = html.replace(old_end, new_end)

with open('PROMPT_BUILDER_v8_1.html', 'w', encoding='utf-8') as f:
    f.write(html)
