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


/* ============================================================
   GENİŞLETME — Karar ağacındaki testler için matematik
   (Öğretim amaçlı; p-değerleri standart yaklaşımlarla hesaplanır)
   ============================================================ */
Object.assign(Ist, {

  // --- Yardımcı: log-gama (Lanczos) ---
  gammaln(x) {
    const c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028,
      771.32342877765313, -176.61502916214059, 12.507343278686905,
      -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
    if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - Ist.gammaln(1 - x);
    x -= 1;
    let a = c[0]; const t = x + 7.5;
    for (let i = 1; i < 9; i++) a += c[i] / (x + i);
    return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
  },

  // Düzenli alt eksik gama P(s,x)
  gammaP(s, x) {
    if (x <= 0) return 0;
    if (x < s + 1) {
      let ap = s, sum = 1 / s, del = sum;
      for (let n = 0; n < 300; n++) { ap += 1; del *= x / ap; sum += del; if (Math.abs(del) < Math.abs(sum) * 1e-14) break; }
      return sum * Math.exp(-x + s * Math.log(x) - Ist.gammaln(s));
    } else {
      let b = x + 1 - s, c = 1e30, d = 1 / b, h = d;
      for (let i = 1; i < 300; i++) {
        const an = -i * (i - s); b += 2; d = an * d + b; if (Math.abs(d) < 1e-30) d = 1e-30;
        c = b + an / c; if (Math.abs(c) < 1e-30) c = 1e-30; d = 1 / d; const del = d * c; h *= del;
        if (Math.abs(del - 1) < 1e-14) break;
      }
      return 1 - Math.exp(-x + s * Math.log(x) - Ist.gammaln(s)) * h;
    }
  },

  // Ki-kare üst kuyruk (p değeri), serbestlik derecesi df
  pKiKareGenel(x2, df) { return 1 - Ist.gammaP(df / 2, x2 / 2); },

  // Düzenli eksik beta (sürekli kesir)
  betacf(x, a, b) {
    const FPMIN = 1e-30; let qab = a + b, qap = a + 1, qam = a - 1;
    let c = 1, d = 1 - qab * x / qap; if (Math.abs(d) < FPMIN) d = FPMIN; d = 1 / d; let h = d;
    for (let m = 1; m <= 300; m++) {
      const m2 = 2 * m;
      let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
      d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN; c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN; d = 1 / d; h *= d * c;
      aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
      d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN; c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN; d = 1 / d;
      const del = d * c; h *= del; if (Math.abs(del - 1) < 1e-14) break;
    }
    return h;
  },
  ibeta(x, a, b) {
    if (x <= 0) return 0; if (x >= 1) return 1;
    const ft = Math.exp(Ist.gammaln(a + b) - Ist.gammaln(a) - Ist.gammaln(b) + a * Math.log(x) + b * Math.log(1 - x));
    if (x < (a + 1) / (a + b + 2)) return ft * Ist.betacf(x, a, b) / a;
    return 1 - ft * Ist.betacf(1 - x, b, a) / b;
  },

  // F dağılımı üst kuyruk (p değeri)
  pFgenel(F, df1, df2) {
    if (F <= 0) return 1;
    return Ist.ibeta(df2 / (df2 + df1 * F), df2 / 2, df1 / 2);
  },

  // t dağılımı iki yönlü p değeri
  pTgenel(t, df) {
    const x = df / (df + t * t);
    return Ist.ibeta(x, df / 2, 0.5);
  },

  // Ortalama sıralar (eşitliklerde ortalama rank)
  siralar(dizi) {
    const n = dizi.length;
    const idx = dizi.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0]);
    const r = new Array(n);
    let i = 0;
    while (i < n) {
      let j = i;
      while (j + 1 < n && idx[j + 1][0] === idx[i][0]) j++;
      const rank = (i + j) / 2 + 1;
      for (let k = i; k <= j; k++) r[idx[k][1]] = rank;
      i = j + 1;
    }
    return r;
  },

  // Eşleştirilmiş (bağımlı) t testi
  esliT(oncesi, sonrasi) {
    const d = oncesi.map((v, i) => sonrasi[i] - v);
    const md = Ist.ortalama(d), sd = Ist.ss(d), n = d.length;
    const t = md / (sd / Math.sqrt(n));
    return { t, p: Ist.pTgenel(Math.abs(t), n - 1), md, sd, n };
  },

  // Bağımsız iki örneklem t testi (eşit varyans)
  bagimsizT(a, b) {
    const n1 = a.length, n2 = b.length;
    const m1 = Ist.ortalama(a), m2 = Ist.ortalama(b);
    const s1 = Ist.ss(a), s2 = Ist.ss(b);
    const sp = Math.sqrt(((n1 - 1) * s1 * s1 + (n2 - 1) * s2 * s2) / (n1 + n2 - 2));
    const t = (m1 - m2) / (sp * Math.sqrt(1 / n1 + 1 / n2));
    return { t, p: Ist.pTgenel(Math.abs(t), n1 + n2 - 2), m1, m2 };
  },

  // Mann–Whitney U
  mannWhitney(a, b) {
    const r = Ist.siralar([...a, ...b]);
    const n1 = a.length, n2 = b.length;
    const R1 = r.slice(0, n1).reduce((s, x) => s + x, 0);
    const U1 = R1 - n1 * (n1 + 1) / 2, U2 = n1 * n2 - U1, U = Math.min(U1, U2);
    const mu = n1 * n2 / 2, sigma = Math.sqrt(n1 * n2 * (n1 + n2 + 1) / 12);
    const z = (U - mu) / sigma;
    return { U, U1, U2, z, p: Ist.pIkiYonlu(z) };
  },

  // Wilcoxon işaretli sıralar testi
  wilcoxon(oncesi, sonrasi) {
    const diff = [];
    for (let i = 0; i < oncesi.length; i++) { const d = sonrasi[i] - oncesi[i]; if (d !== 0) diff.push(d); }
    const r = Ist.siralar(diff.map(Math.abs));
    let Wp = 0, Wn = 0;
    for (let i = 0; i < diff.length; i++) { if (diff[i] > 0) Wp += r[i]; else Wn += r[i]; }
    const n = diff.length, W = Math.min(Wp, Wn);
    const mu = n * (n + 1) / 4, sigma = Math.sqrt(n * (n + 1) * (2 * n + 1) / 24);
    const z = (W - mu) / sigma;
    return { W, Wp, Wn, z, p: Ist.pIkiYonlu(z), n };
  },

  // Kruskal–Wallis H
  kruskalWallis(gruplar) {
    const hepsi = []; gruplar.forEach(g => hepsi.push(...g));
    const r = Ist.siralar(hepsi), N = hepsi.length;
    let idx = 0, toplam = 0;
    gruplar.forEach(g => { let Ri = 0; for (let k = 0; k < g.length; k++) Ri += r[idx++]; toplam += Ri * Ri / g.length; });
    const H = 12 / (N * (N + 1)) * toplam - 3 * (N + 1), df = gruplar.length - 1;
    return { H, df, p: Ist.pKiKareGenel(H, df) };
  },

  // Friedman testi
  friedman(matris) {
    const n = matris.length, k = matris[0].length, Rj = new Array(k).fill(0);
    matris.forEach(satir => { const r = Ist.siralar(satir); for (let j = 0; j < k; j++) Rj[j] += r[j]; });
    let s = 0; for (let j = 0; j < k; j++) s += Rj[j] * Rj[j];
    const Q = 12 / (n * k * (k + 1)) * s - 3 * n * (k + 1), df = k - 1;
    return { Q, df, p: Ist.pKiKareGenel(Q, df), Rj };
  },

  // Tekrarlı ölçümler ANOVA
  tekrarliAnova(matris) {
    const n = matris.length, k = matris[0].length, N = n * k;
    let grand = 0; matris.forEach(r => r.forEach(v => grand += v)); grand /= N;
    const cm = new Array(k).fill(0), sm = new Array(n).fill(0);
    for (let i = 0; i < n; i++) for (let j = 0; j < k; j++) { cm[j] += matris[i][j] / n; sm[i] += matris[i][j] / k; }
    let SStot = 0; matris.forEach(r => r.forEach(v => SStot += (v - grand) ** 2));
    let SScond = 0; for (let j = 0; j < k; j++) SScond += n * (cm[j] - grand) ** 2;
    let SSsubj = 0; for (let i = 0; i < n; i++) SSsubj += k * (sm[i] - grand) ** 2;
    const SSerr = Math.max(1e-9, SStot - SScond - SSsubj);
    const dfCond = k - 1, dfErr = (k - 1) * (n - 1);
    const F = (SScond / dfCond) / (SSerr / dfErr);
    return { F, p: Ist.pFgenel(F, dfCond, dfErr), dfCond, dfErr, condMean: cm };
  },

  // McNemar (2x2 eşleştirilmiş): b, c uyumsuz hücreler
  mcNemar(b, c, duzeltme = true) {
    const chi = duzeltme ? (Math.abs(b - c) - 1) ** 2 / (b + c || 1) : (b - c) ** 2 / (b + c || 1);
    return { chi, p: Ist.pKiKareGenel(chi, 1) };
  },

  // Cochran Q (n denek x k ikili koşul)
  cochranQ(matris) {
    const n = matris.length, k = matris[0].length;
    const Cj = new Array(k).fill(0), Ri = new Array(n).fill(0);
    for (let i = 0; i < n; i++) for (let j = 0; j < k; j++) { Cj[j] += matris[i][j]; Ri[i] += matris[i][j]; }
    const Cbar = Cj.reduce((a, b) => a + b, 0) / k;
    let num = 0; for (let j = 0; j < k; j++) num += (Cj[j] - Cbar) ** 2;
    let dA = 0, dB = 0; for (let i = 0; i < n; i++) { dA += Ri[i]; dB += Ri[i] * Ri[i]; }
    const payda = (k * dA - dB) || 1;
    const Q = k * (k - 1) * num / payda, df = k - 1;
    return { Q, df, p: Ist.pKiKareGenel(Q, df), Cj };
  },

  // Fisher kesin testi (2x2), iki yönlü
  fisherKesin(a, b, c, d) {
    const lf = x => Ist.gammaln(x + 1);
    const logH = (a, b, c, d) => lf(a + b) + lf(c + d) + lf(a + c) + lf(b + d) - lf(a) - lf(b) - lf(c) - lf(d) - lf(a + b + c + d);
    const n = a + b + c + d, r1 = a + b, c1 = a + c;
    const p0 = logH(a, b, c, d);
    const lo = Math.max(0, r1 + c1 - n), hi = Math.min(r1, c1);
    let p = 0;
    for (let x = lo; x <= hi; x++) {
      const bb = r1 - x, cc = c1 - x, dd = n - x - bb - cc;
      const lp = logH(x, bb, cc, dd);
      if (lp <= p0 + 1e-9) p += Math.exp(lp);
    }
    return { p: Math.min(1, p) };
  },

  // Ki-kare (2x2), Yates düzeltmeli
  kiKare2x2(a, b, c, d, yates = false) {
    const n = a + b + c + d;
    const chi = yates
      ? n * (Math.abs(a * d - b * c) - n / 2) ** 2 / ((a + b) * (c + d) * (a + c) * (b + d))
      : n * (a * d - b * c) ** 2 / ((a + b) * (c + d) * (a + c) * (b + d));
    return { chi: Math.max(0, chi), p: Ist.pKiKareGenel(Math.max(0, chi), 1) };
  },

  // Stuart–Maxwell (marjinal homojenlik, 3 kategori) — tablo 3x3
  stuartMaxwell3(t) {
    // satır toplamı - sütun toplamı = marjinal fark
    const r = [0, 0, 0], c = [0, 0, 0];
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { r[i] += t[i][j]; c[j] += t[i][j]; }
    const d = [r[0] - c[0], r[1] - c[1]]; // 2 bağımsız
    // Kovaryans matrisi V (2x2)
    const v11 = r[0] + c[0] - 2 * t[0][0];
    const v22 = r[1] + c[1] - 2 * t[1][1];
    const v12 = -(t[0][1] + t[1][0]);
    const det = v11 * v22 - v12 * v12;
    if (Math.abs(det) < 1e-9) return { chi: 0, p: 1 };
    // chi2 = d' V^-1 d
    const i11 = v22 / det, i22 = v11 / det, i12 = -v12 / det;
    const chi = d[0] * (i11 * d[0] + i12 * d[1]) + d[1] * (i12 * d[0] + i22 * d[1]);
    return { chi: Math.max(0, chi), p: Ist.pKiKareGenel(Math.max(0, chi), 2) };
  }
});


/* ============================================================
   ARAYÜZ BİLEŞENLERİ — mini tarih şeridi, canlı veri tablosu
   ============================================================ */

// İstatistik tarihinin dönüm noktaları (mini zaman şeridi için)
const ZAMAN_CIZGISI = [
  { yil: 1835, ad: "Tanımlayıcı", kisi: "Quetelet", sayfalar: ["tanimlayici.html"] },
  { yil: 1886, ad: "Regresyon", kisi: "Galton", sayfalar: ["regresyon.html"] },
  { yil: 1896, ad: "Korelasyon", kisi: "Pearson", sayfalar: ["korelasyon.html"] },
  { yil: 1900, ad: "Ki-Kare", kisi: "Pearson", sayfalar: ["ki-kare.html"] },
  { yil: 1908, ad: "t-Testi", kisi: "Gosset", sayfalar: ["t-testi.html", "paired-t.html"] },
  { yil: 1925, ad: "ANOVA", kisi: "Fisher", sayfalar: ["anova.html", "repeated-anova.html"] },
  { yil: 1935, ad: "Fisher Kesin", kisi: "Fisher", sayfalar: ["fisher.html"] },
  { yil: 1937, ad: "Friedman", kisi: "Friedman", sayfalar: ["friedman.html"] },
  { yil: 1945, ad: "Wilcoxon", kisi: "Wilcoxon", sayfalar: ["wilcoxon.html"] },
  { yil: 1947, ad: "Mann-Whitney · McNemar", kisi: "Mann · Whitney · McNemar", sayfalar: ["mann-whitney.html", "mcnemar.html"] },
  { yil: 1950, ad: "Cochran Q", kisi: "Cochran", sayfalar: ["cochran-q.html"] },
  { yil: 1952, ad: "Kruskal-Wallis", kisi: "Kruskal · Wallis", sayfalar: ["kruskal-wallis.html"] },
  { yil: 1956, ad: "Marginal Homog.", kisi: "Stuart · Maxwell", sayfalar: ["marginal-homogenlik.html"] }
];

Object.assign(Ist, {
  // Mini tarih şeridi — aktif testi büyük noktayla işaretler
  zamanCizgisi(containerId, aktifSayfa) {
    const kap = document.getElementById(containerId);
    if (!kap) return;

    const ilkY = 1835, sonY = 1956;
    const gen = 1000, solPad = 62, sagPad = 62, yuk = 166;
    const eksenY = 92;                       // eksen çizgisi
    const x = y => solPad + (y - ilkY) / (sonY - ilkY) * (gen - solPad - sagPad);
    const MIN_ARA = 46;                      // iki yıl etiketi arası en az piksel
    const SATIR = [eksenY + 24, eksenY + 45, eksenY + 66];   // etiketlerin y konumları

    // Etiketleri satırlara dağıt: sığdığı ilk satıra yerleştir (çakışmayı önler)
    const sonX = new Array(SATIR.length).fill(-Infinity);
    const yerlesim = ZAMAN_CIZGISI.map(m => {
      const px = x(m.yil);
      let satir = sonX.findIndex(v => px - v >= MIN_ARA);
      if (satir < 0) satir = sonX.indexOf(Math.min(...sonX));
      sonX[satir] = px;
      return { ...m, px, satir };
    });

    let ic = `<svg viewBox="0 0 ${gen} ${yuk}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="İstatistik testlerinin zaman şeridi">`;
    ic += `<line x1="${solPad - 18}" y1="${eksenY}" x2="${gen - sagPad + 18}" y2="${eksenY}" stroke="var(--cam-acik)" stroke-width="3"/>`;
    ic += `<polygon points="${gen - sagPad + 18},${eksenY} ${gen - sagPad + 7},${eksenY - 5.5} ${gen - sagPad + 7},${eksenY + 5.5}" fill="var(--cam-acik)"/>`;

    yerlesim.forEach(m => {
      const px = m.px;
      const aktif = m.sayfalar.includes(aktifSayfa);
      if (aktif) {
        // Aktif nokta: ad + yıl EKSENİN ÜSTÜNDE durur, alttaki yıl etiketleriyle asla çakışmaz
        const adX = Math.min(Math.max(px, 92), gen - 92);   // kenardan taşmayı engelle
        ic += `<line x1="${px}" y1="${eksenY - 9}" x2="${px}" y2="55" stroke="var(--mercan)" stroke-width="2.5"/>`;
        ic += `<circle cx="${px}" cy="${eksenY}" r="10" fill="var(--mercan)" stroke="#fff" stroke-width="3"/>`;
        ic += `<text x="${adX}" y="20" text-anchor="middle" font-family="Nunito, sans-serif" font-size="16" font-weight="800" fill="var(--murekkep)">${m.ad}</text>`;
        ic += `<text x="${adX}" y="48" text-anchor="middle" font-family="Baloo 2, sans-serif" font-size="21" font-weight="700" fill="var(--mercan)">${m.yil}</text>`;
      } else {
        const etY = SATIR[m.satir];
        if (m.satir > 0) {   // alt satırdaysa noktaya ince bir bağ çizgisi çek
          ic += `<line x1="${px}" y1="${eksenY + 7}" x2="${px}" y2="${etY - 11}" stroke="var(--cam-acik)" stroke-width="1.5"/>`;
        }
        ic += `<circle cx="${px}" cy="${eksenY}" r="5.5" fill="#fff" stroke="var(--cam)" stroke-width="2.5"/>`;
        ic += `<text x="${px}" y="${etY}" text-anchor="middle" font-family="Nunito, sans-serif" font-size="13" font-weight="700" fill="var(--murekkep-soluk)">${m.yil}</text>`;
      }
    });
    ic += `</svg>`;
    kap.innerHTML = ic;
  },

  // Canlı veri seti tablosu — kullanıcı ham sayıları görüp izleyebilsin
  veriTablosu(containerId, config) {
    const kap = document.getElementById(containerId);
    if (!kap) return;
    const { basliklar = [], satirlar = [], aciklama = "" } = config;
    let h = `<div class="veri-seti-baslik">📋 Veri seti <span>${aciklama}</span></div>`;
    h += `<div class="veri-seti-kaydir"><table class="veri-seti-tablo"><thead><tr>`;
    basliklar.forEach(b => { h += `<th>${b}</th>`; });
    h += `</tr></thead><tbody>`;
    satirlar.forEach(sat => {
      h += `<tr>`;
      sat.forEach((h2, i) => {
        const sinif = (typeof h2 === "object" && h2.sinif) ? ` class="${h2.sinif}"` : "";
        const deg = (typeof h2 === "object") ? h2.deger : h2;
        h += `<td${sinif}>${deg}</td>`;
      });
      h += `</tr>`;
    });
    h += `</tbody></table></div>`;
    kap.innerHTML = h;
  }
});
