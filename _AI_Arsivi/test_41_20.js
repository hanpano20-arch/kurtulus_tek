const fs = require('fs');
const content = fs.readFileSync('PROMPT_BUILDER_v8_0.html', 'utf-8');
const start = content.indexOf('let db = {') + 9;
const end = content.indexOf(';\n', start);
const db_str = content.slice(start, end);

// evaluate as JS object
const db = new Function('return ' + db_str)();

const df = db.entries;

const last_20 = df.slice(0, 20).map(e => e.nums);
const in_last_20_41 = last_20.some(d => d.includes(41));
console.log("Is 41 in last 20 draws?", in_last_20_41);
last_20.forEach((d, i) => {
    if (d.includes(41)) console.log(`41 found at index ${i}`);
});

let streak_events_20 = 0;
let current_streak_20 = 0;
const reversed_draws = [...df].reverse().map(e => e.nums);
for (let d of reversed_draws) {
    if (d.includes(20)) {
        current_streak_20++;
    } else {
        if (current_streak_20 >= 2) streak_events_20++;
        current_streak_20 = 0;
    }
}
if (current_streak_20 >= 2) streak_events_20++;
console.log("Streak events for 20:", streak_events_20);

// Also check K2 points for 41
// Son 10 Taban Puanı (k2'ye ekle)
const son_10_donem = df.slice(0, 10).map(e => e.nums);
let in_son_10_41 = son_10_donem.some(d => d.includes(41));
console.log("Is 41 in last 10 draws?", in_son_10_41);

// Look at how K2 is calculated normally
let f10 = son_10_donem.reduce((sum, d) => sum + (d.includes(41) ? 1 : 0), 0);
console.log("f10 for 41:", f10);
