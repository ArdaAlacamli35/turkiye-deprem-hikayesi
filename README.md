# Türkiye'nin Deprem Haritası Otuz Yılda Doğu'dan Güney'e Kaydı

**Veri Hikâyesi: İnteraktif Scrollytelling Web Sitesi** — Kullanıcı Arayüzü Tasarımı dersi proje ödevi (Büyük Veri Analistliği programı).

**Canlı site:** _buraya yayın bağlantısını ekle (GitHub Pages / Netlify / Vercel)_
**Yazar:** Arda Alaçamlı — [GitHub](https://github.com/ArdaAlacamli35) · [LinkedIn](https://www.linkedin.com/in/arda-ala%C3%A7aml%C4%B1-98791743b/) · alacamliarda35@gmail.com

## Çalışma sorusu

> Türkiye'de geçmiş yıllarda meydana gelen depremlerin coğrafi dağılımı, derinliği ve büyüklükleri zaman içerisinde bölgesel olarak nasıl bir değişim göstermektedir?

## Veri kaynağı ve lisans

- **Veri seti:** [Türkiye Deprem Veri Seti](https://www.kaggle.com/datasets/ozgecinko/turkey-earthquake-data-1914-2023) (Kaggle, derleyen: ozgecinko; orijinal kaynak Kandilli Rasathanesi ve Deprem Araştırma Enstitüsü)
- **Lisans:** [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)
- **Erişim tarihi:** 16 Ekim 2026
- **Kapsanan aralık:** 11 Eylül 1994 – 31 Temmuz 2023 (50.000 satırlık dosyanın fiilî kapsadığı aralık)

## Depo yapısı

```
proje/
├── README.md
├── data/
│   ├── raw/veriler.csv            (ham veri, CC BY-SA 4.0)
│   └── processed/                 (notebook'tan dışa aktarılan özet dosyalar)
├── notebooks/analiz.ipynb         (temizleme + keşifsel analiz + özet dosya üretimi)
├── site/
│   ├── index.html
│   ├── css/style.css
│   ├── js/harita.js, explorer.js, bulgu-grafikleri.js, main.js
│   └── data/                      (site'ın okuduğu özet CSV/JSON dosyaları, processed ile aynı)
└── docs/
    ├── storyboard.pdf
    └── tasarim-notu.pdf
```

## Yerelde çalıştırma

Site tamamen statik dosyalardan oluşur (framework yok), bu yüzden `fetch` ile veri okuyabilmesi için basit bir yerel sunucu yeterlidir:

```bash
cd site
python3 -m http.server 8000
# tarayıcıda http://localhost:8000 adresini aç
```

`index.html`'i doğrudan `file://` ile açmak, tarayıcıların CORS kısıtlaması yüzünden veri dosyalarının yüklenmesini engeller.

Notebook'u çalıştırmak için: `notebooks/analiz.ipynb` dosyasını Jupyter veya Google Colab'da aç, veri dosyası istenirse `data/raw/veriler.csv` dosyasını yükle, **Restart & Run All** ile baştan sona çalıştır.

## Kullanılan kütüphaneler / araçlar

- **Analiz:** Python — pandas, numpy, matplotlib
- **Site:** düz HTML / CSS / JavaScript (framework yok)
- **Grafikler:** [D3.js](https://d3js.org) v7
- **Kaydırma mekanizması:** [Scrollama.js](https://github.com/russellsamora/scrollama) v3 (CDN üzerinden; kaynağı burada belirtilmiştir, kullanımı açık kaynak örneklerine dayanır)
- **Fontlar:** Google Fonts — Space Grotesk, Inter

## Yapay zekâ kullanım beyanı

Bu projenin veri temizleme notebook iskeleti, sitenin HTML/CSS/JavaScript kodu ve bu README/Yöntem metinlerinin ilk taslağı **Claude (Anthropic)** ile birlikte hazırlanmıştır. Kullanılan veri, temizleme kuralları ve hesaplanan sayılar gerçek veri setinden doğrulanmıştır. Bulguların yorumlanması, hikâye metninin son hâli ve tasarım kararları bana aittir. *(Kendi kullanım şeklini yansıtacak şekilde bu paragrafı güncelle.)*

## Lisans / akademik dürüstlük notu

Bu proje bireysel bir ders ödevidir (Kullanıcı Arayüzü Tasarımı, Büyük Veri Analistliği programı). Veri seti CC BY-SA 4.0 ile lisanslanmıştır; site kodu eğitim amaçlı paylaşılmaktadır.
