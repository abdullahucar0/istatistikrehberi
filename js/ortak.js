/* Biyoistatistik Atlası — ortak yardımcı fonksiyonlar */

const Ist = {
  ortalama(dizi) {
    return dizi.reduce((a, b) => a + b, 0) / dizi.length;
  },

  medyan(dizi) {
    const s = [...dizi].sort((a, b) => a - b);
    const o = Math.floor(s.length / 2);
    return s.length % 2 ? s[o] : (s[o - 1] + s[o]) / 2;
  },

  ss(dizi) { // örneklem standart sapması
    const m = Ist.ortalama(dizi);
    const v = dizi.reduce((t, x) => t + (x - m) ** 2, 0) / (dizi.length - 1);
    return Math.sqrt(v);
  },

  // Standart normal yoğunluk
  normalPdf(x, mu, sigma) {
    return Math.exp(-((x - mu) ** 2) / (2 * sigma * sigma)) / (sigma * Math.sqrt(2 * Math.PI));
  },

  // Hata fonksiyonu (Abramowitz-Stegun yaklaşımı)
  erf(x) {
    const isaret = x < 0 ? -1 : 1;
    x = Math.abs(x);
    const t = 1 / (1 + 0.3275911 * x);
    const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
    return isaret * y;
  },

  // İki yönlü p değeri (normal yaklaşım — öğretim amaçlı)
  pIkiYonlu(z) {
    const p = 1 - 0.5 * (1 + Ist.erf(Math.abs(z) / Math.SQRT2));
    return 2 * p;
  },

  // Ki-kare (sd=1) için p değeri
  pKiKare1(x2) {
    return 1 - Ist.erf(Math.sqrt(x2 / 2));
  },

  // Pearson korelasyon katsayısı
  korelasyon(xler, yler) {
    const mx = Ist.ortalama(xler), my = Ist.ortalama(yler);
    let pay = 0, sx = 0, sy = 0;
    for (let i = 0; i < xler.length; i++) {
      pay += (xler[i] - mx) * (yler[i] - my);
      sx += (xler[i] - mx) ** 2;
      sy += (yler[i] - my) ** 2;
    }
    return pay / Math.sqrt(sx * sy);
  },

  // En küçük kareler doğrusu
  enKucukKareler(xler, yler) {
    const mx = Ist.ortalama(xler), my = Ist.ortalama(yler);
    let pay = 0, payda = 0;
    for (let i = 0; i < xler.length; i++) {
      pay += (xler[i] - mx) * (yler[i] - my);
      payda += (xler[i] - mx) ** 2;
    }
    const egim = pay / payda;
    return { egim, kesisim: my - egim * mx };
  },

  // Tekrarlanabilir sözde rastgele sayı üreteci (mulberry32)
  rastgele(tohum) {
    let a = tohum;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  },

  // Yaklaşık normal dağılımlı sayı (Box-Muller)
  normalSayi(uret) {
    const u1 = Math.max(uret(), 1e-9), u2 = uret();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  },

  bicim(sayi, basamak = 2) {
    return Number(sayi).toLocaleString("tr-TR", {
      minimumFractionDigits: basamak,
      maximumFractionDigits: basamak
    });
  },

  pYazi(p) {
    if (p < 0.001) return "p < 0,001";
    return "p = " + Ist.bicim(p, 3);
  }
};

/* Chart.js genel görünüm ayarları */
if (window.Chart) {
  Chart.defaults.font.family = "'Nunito', sans-serif";
  Chart.defaults.font.size = 13;
  Chart.defaults.color = "#4E6B72";
  Chart.defaults.plugins.legend.labels.usePointStyle = true;
  Chart.defaults.responsive = true;
  Chart.defaults.maintainAspectRatio = false;
}

/* Renk paleti (CSS ile uyumlu) */
const Renk = {
  cam: "#2A9D8F",
  camAcik: "rgba(42, 157, 143, 0.25)",
  mercan: "#FF7059",
  mercanAcik: "rgba(255, 112, 89, 0.25)",
  gunes: "#FFC94D",
  gunesAcik: "rgba(255, 201, 77, 0.3)",
  leylak: "#7C6BD9",
  leylakAcik: "rgba(124, 107, 217, 0.25)",
  murekkep: "#1D3C45"
};
