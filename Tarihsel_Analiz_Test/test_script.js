const fs = require('fs');
const vm = require('vm');
const context = vm.createContext({});
vm.runInContext(fs.readFileSync('veri.js', 'utf8'), context);
vm.runInContext(fs.readFileSync('test_motor_v3.js', 'utf8'), context);

vm.runInContext(`
let ayarlar = { K1_TABAN: 100, K1_CARPAN: 20, K2_TABAN: 100, K2_CARPAN: 30, K3_TABAN: 100, K3_CARPAN: 20, K4_TABAN: 50, K4_CARPAN: 15, K5_TABAN: 30, K5_CARPAN: 5, K6_TABAN: 100, K6_CARPAN: 10, K7_TABAN: -200, K7_CARPAN: 100 };

function testDate(startIndex) {
    let hedefCekilisler = globalCekilisler.slice(startIndex);
    let hedefJokerler = globalJokerler.slice(startIndex);
    let res = motorAtesle(hedefCekilisler, hedefJokerler, ayarlar);
    let num79 = res.siralama.find(x => x.i === 79);
    console.log('StartIndex: ' + startIndex + ' -> 79 Puan: ' + num79.toplam);
}

testDate(0);
testDate(1);
testDate(2);
testDate(3);
testDate(4);
testDate(5);
`, context);
