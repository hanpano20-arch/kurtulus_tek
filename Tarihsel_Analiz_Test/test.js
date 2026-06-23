const { frekansHesapla, puanUret, motorAtesle } = require('./test_motoru.js');

let cekilisler = [
    [13, 21, 27, 44, 79, 90], // 20.06
    [7, 18, 22, 55, 76, 79], // 18.06
    [15, 33, 36, 53, 79, 87], // 15.06
    [1, 2, 3, 4, 5, 6] // Some old draw
];
let jokerler = [4, 5, 6, 7];

let ayarlar = {
    K7_TABAN: -200,
    K7_CARPAN: 100
};

let res = motorAtesle(cekilisler, jokerler, ayarlar);
console.log("20.06 test (Streak 3) 79 K7 Puanı:", res.puanlar.k7[79]);

let cekilisler2 = [
    [7, 18, 22, 55, 76, 79], // 18.06
    [15, 33, 36, 53, 79, 87], // 15.06
    [1, 2, 3, 4, 5, 6] // Some old draw
];
let res2 = motorAtesle(cekilisler2, jokerler, ayarlar);
console.log("18.06 test (Streak 2) 79 K7 Puanı:", res2.puanlar.k7[79]);

let cekilisler3 = [
    [15, 33, 36, 53, 79, 87], // 15.06
    [1, 2, 3, 4, 5, 6] // Some old draw
];
let res3 = motorAtesle(cekilisler3, jokerler, ayarlar);
console.log("15.06 test (Streak 1) 79 K7 Puanı:", res3.puanlar.k7[79]);
