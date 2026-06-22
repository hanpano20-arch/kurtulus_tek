const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const html = fs.readFileSync('PROMPT_BUILDER_v8_0.html', 'utf8');
const match = html.match(/const SD90 = (\{.*?\});/s);
if (!match) {
   console.log("No SD90 data found");
   process.exit(1);
}

const data = JSON.parse(match[1]);

// We need to evaluate the pure JS without JSDOM. 
// The problem is HavuzMotoru is part of the HTML. Let's just extract the script!
const script = html.match(/<script>(.*?)<\/script>/s)[1];

// Let's create a mocked window environment
global.window = {
    updateTip: () => {},
    showTip: () => {},
    hideTip: () => {},
    document: {
        getElementById: (id) => {
            if (id === 'hm-test-count') return {value: 15};
            if (id === 'hm-pool-size') return {value: 30};
            return { value: 0 };
        }
    }
};
global.document = global.window.document;
global.localStorage = { getItem: () => null, setItem: () => {} };
global.gameMax = () => 90;
global.db = { entries: data.entries };

try {
    eval(script);
    const hm = global.window.HavuzMotoru;
    
    // We will hook into puanlari_hesapla to capture points
    const orig_hesap = hm.puanlari_hesapla;
    hm.puanlari_hesapla = function(df, maxN, joks) {
        let original_log = console.log;
        let logs = [];
        // Just run it and capture the final puanlar
        let p = orig_hesap.call(this, df, maxN, joks);
        fs.writeFileSync('debug_output.json', JSON.stringify({
            p70: p[70], p20: p[20], p22: p[22], p15: p[15],
            komsular: p.__komsular,
            kuraklik: p.__kuraklik
        }, null, 2));
        return p;
    };
    
    // Call testHistorical or just evaluate directly
    let gercek_cekilis_df = data.entries.map(d => d.nums);
    let gercek_joks = data.entries.map(d => d.joker || null);
    
    hm.config = {
        PUAN_1_HALKA_KOMSU: 25.0,
        PUAN_2_HALKA_KOMSU: 2.0,
        CARPAN_KURAKLIK: 1.0,
        PUAN_ONLUK_KURAKLIK_BONUSU: 10.0,
        PUAN_KINETIK_IVME_BONUSU: 50.0,
        PUAN_GECIKMELI_TEKRAR: 15.0,
        CARPAN_JOKER: 15.0,
        CEZA_OLU_SAYI_4: -15,
        OLUM_CEZASI_SINIRI: 30,
        CEZA_CIFTE_TEKRAR: -100,
        CEZA_DOYGUN_4: -20,
        CEZA_DOYGUN_8: -20,
        CEZA_DOYGUN_12: -20,
        CEZA_DOYGUN_16: -20
    };
    
    hm.puanlari_hesapla(gercek_cekilis_df, 90, gercek_joks);
    console.log("SUCCESS");
} catch(e) {
    console.error(e);
}
