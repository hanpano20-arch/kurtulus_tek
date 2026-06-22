const fs = require('fs');

let content = fs.readFileSync('PROMPT_BUILDER_v8_0.html', 'utf8');
let start = content.indexOf('let db = {');
let end = content.indexOf(';\n', start);
let db_str = content.substring(start, end);

// evaluate db_str to get the db object
let db;
try {
    eval(db_str);
} catch (e) {
    console.error("Error evaluating db:", e);
    process.exit(1);
}

let df = db.entries.map(e => e.num);
let maxN = 90;

for (let i of [20, 28, 19, 15, 81]) {
    let streak_events = 0;
    let current_streak = 0;
    
    // The code in HTML iterates backwards: c = df.length - 1 down to 0
    for (let c = df.length - 1; c >= 0; c--) {
        if (df[c] && df[c].includes(i)) {
            current_streak++;
        } else {
            if (current_streak >= 2) streak_events++;
            current_streak = 0;
        }
    }
    if (current_streak >= 2) streak_events++;
    
    console.log(`Number ${i} has ${streak_events} streak events.`);
}
