
          function populateTimeMachine() {
            let sel = document.getElementById('tm-select');
            if(!sel) return;
            // Get raw db without offset
            let rawDB = null;
            try {
              const v = JSON.parse(localStorage.getItem(dk()) || 'null');
              if (v && Array.isArray(v.entries)) rawDB = v;
            } catch (e) { }
            if (!rawDB) {
                const s = sd();
                const entries = s.d.map((nums, i) => ({ date: s.t[i], nums, joker: s.j ? s.j[i] : null }));
                rawDB = { entries };
            }
            
            let html = '<option value="0">Bugün (Normal Mod)</option>';
            for(let i=1; i<Math.min(150, rawDB.entries.length); i++) {
                let dParts = rawDB.entries[i].date.split('-');
                let df = dParts.length === 3 ? dParts[2] + '-' + dParts[1] + '-' + dParts[0] : rawDB.entries[i].date;
                html += '<option value="'+i+'">Geçmiş ' + i + ' (' + df + ')</option>';
            }
            sel.innerHTML = html;
            if(window.__timeMachineOffset) sel.value = window.__timeMachineOffset;
          }
          function applyTimeMachine() {
            let sel = document.getElementById('tm-select');
            let offset = parseInt(sel.value);
            let dateStr = sel.options[sel.selectedIndex].text;
            setTimeMachine(offset, dateStr);
          }
          document.addEventListener("DOMContentLoaded", populateTimeMachine);
        