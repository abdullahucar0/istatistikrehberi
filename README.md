# Biyoistatistik Rehberi

**Sağlık örnekleriyle**, **canlı veri setleriyle**, **interaktif grafiklerle** ve **istatistik tarihiyle iç içe** temel biyoistatistik eğitimi sunan, tamamen statik (yalnızca HTML/CSS/JS) bir web sitesi.

Yayın adresi: https://abdullahucar0.github.io/istatistikrehberi/

## Yaklaşım

Formül ezberi yoktur; önce sezgi gelir. Her test sayfasında:

- **Zaman Pulu** — testi bulan kişinin kısa hikâyesi,
- **Mini tarih şeridi** — testin 13 dönüm noktalık şeritte nerede doğduğu,
- **Tarihçe kartı** — testin hangi derde çare olarak icat edildiği,
- günlük dilde, sağlıktan gerçekçi bir örnekle anlatım,
- kaydırıcılarla oynanan **interaktif "Deney Masası"**,
- **canlı ham veri tablosu** — kaydırıcıyı oynattıkça grafikle birlikte değişen, gözle izlenebilir veri seti.

Tüm istatistik hesapları (t, F, ki-kare, U, W, H, Q, Fisher kesin olasılığı vb.) `js/ortak.js` içinde saf JavaScript ile yazılmış ve referans değerlerle doğrulanmıştır.

## Sayfalar (21)

### Başlangıç ve arka plan

| Dosya | Konu |
|-------|------|
| `index.html` | Ana sayfa — birleşik test kataloğu + tam zaman şeridi |
| `veri-yapilari.html` | **Veri yapıları** — sürekli / kesikli / ordinal / nominal; ölçüm düzeyleri; kategorileştirmenin bilgi kaybı |
| `karar-agaci.html` | **Karar ağacı** — soru-cevap sihirbazı + tıklanabilir görsel ağaç |
| `istatistik-tarihi.html` | **İstatistiğin tarihi** — ilk sayımlar, olasılığın doğuşu, etimoloji, politik bağlam, yöntemlerin doğuşu |
| `sozluk.html` | **İstatistik sözlüğü** — 21 kavram, 6 interaktif görselleştirme, 42 maddelik kaynakça |

### Temeller

| Dosya | Konu | Tarihsel durak |
|-------|------|----------------|
| `tanimlayici.html` | Tanımlayıcı istatistik (ortalama, medyan, SS) | 1835 · Quetelet |
| `korelasyon.html` | Korelasyon (r) | 1896 · Pearson |
| `regresyon.html` | Basit doğrusal regresyon | 1886 · Galton |

### Sayısal testler — iki grup

| Dosya | Konu | Tarihsel durak |
|-------|------|----------------|
| `t-testi.html` | Student t (bağımsız) | 1908 · Gosset ("Student") |
| `paired-t.html` | Eşleştirilmiş t | 1908 · Gosset |
| `mann-whitney.html` | Mann-Whitney U | 1947 · Mann & Whitney |
| `wilcoxon.html` | Wilcoxon işaretli sıralar | 1945 · Wilcoxon |

### Sayısal testler — üç ve daha çok grup

| Dosya | Konu | Tarihsel durak |
|-------|------|----------------|
| `anova.html` | One-way ANOVA | 1925 · Fisher |
| `repeated-anova.html` | Tekrarlı ölçümler ANOVA | 1925 · Fisher |
| `kruskal-wallis.html` | Kruskal-Wallis | 1952 · Kruskal & Wallis |
| `friedman.html` | Friedman | 1937 · Friedman |

### Kategorik testler

| Dosya | Konu | Tarihsel durak |
|-------|------|----------------|
| `ki-kare.html` | Ki-kare testi | 1900 · Pearson |
| `fisher.html` | Fisher kesin testi | 1935 · Fisher |
| `mcnemar.html` | McNemar | 1947 · McNemar |
| `cochran-q.html` | Cochran Q | 1950 · Cochran |
| `marginal-homogenlik.html` | Marginal homogeneity | 1955–56 · Stuart & Maxwell |

## Dosya yapısı

```
.
├── index.html              # ana sayfa
├── veri-yapilari.html      # (ve diğer 19 sayfa)
├── css/
│   └── stil.css            # tüm stiller
├── js/
│   ├── ortak.js            # istatistik fonksiyonları + zaman şeridi + veri tablosu bileşenleri
│   └── menu.js             # gruplu açılır menü
├── .nojekyll               # GitHub Pages'in Jekyll işlemesini kapatır — SİLMEYİN
└── README.md
```

## GitHub Pages'te yayınlama

Site tamamen statiktir; derleme adımı yoktur.

1. Deponun **kök dizinine** bu klasörün **içindeki her şeyi** yükleyin (klasörün kendisini değil): tüm `.html` dosyaları, `css/`, `js/` ve `.nojekyll`.
2. **Settings → Pages → Build and deployment** → *Deploy from a branch* → **main** / **/ (root)** → **Save**.
3. Birkaç dakika içinde yayında olur.

Notlar:

- Depo **Public** olmalıdır (ücretsiz hesapta Pages yalnızca herkese açık depolarda çalışır).
- `index.html` **kökte** olmalıdır.
- `.nojekyll` dosyası önemlidir; silinirse bazı dosyalar sunulmayabilir.
- Dosya adları büyük/küçük harfe duyarlıdır — yeniden adlandırmayın.

## Teknik notlar

- **Bağımlılıklar:** Chart.js 4.4.1 (jsDelivr CDN) ve Google Fonts (Baloo 2 + Nunito). Başka kütüphane yoktur; derleme, npm veya sunucu gerekmez.
- **Tarayıcı desteği:** Modern tarayıcılar. Mobil uyumludur (menü 820px altında hamburger'a dönüşür).
- **Kodlama:** Tüm dosyalar UTF-8'dir.
- **Yeni test sayfası eklerken:** `js/ortak.js` içindeki `ZAMAN_CIZGISI` dizisine dönüm noktasını ekleyin, sayfaya `<div class="mini-zaman" id="miniZaman"></div>` kabını ve `Ist.zamanCizgisi("miniZaman", "dosyaadi.html")` çağrısını koyun. Menü bağlantısı tüm sayfalardaki `<nav class="ust-menu">` bloğuna eklenmelidir.

## İçerik ve kaynaklar

Grafiklerdeki veriler öğretim amacıyla üretilmiş örnek verilerdir; gerçek hasta verisi içermez. Kavramların dayandığı özgün akademik kaynaklar `sozluk.html` sayfasındaki kaynakçada listelenmiştir (Bayes 1763'ten ASA'nın 2016 p-değeri bildirisine kadar 42 kaynak).

## Lisans

Eğitim amaçlı kullanım içindir.
