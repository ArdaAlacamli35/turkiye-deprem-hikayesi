# Tasarım Kararları Notu

**Proje:** Türkiye'nin Deprem Haritası Otuz Yılda Doğu'dan Güney'e Kaydı
**Yazar:** Arda Alaçamlı

## Renk

Site koyu bir zemin üzerine (`#11141a`) kurulu, tek bir vurgu rengi kullanıyor: canlı bir turuncu-kırmızı (`#ff6b3d`, Okabe–Ito "vermilion" ailesinden). Bu renk **sitedeki her grafikte aynı tek anlamı** taşıyor — "şu an anlatılmakta olan / vurgulanan veri" — ve başka hiçbir yerde farklı bir anlamda kullanılmıyor. Vurgulanmayan veri her zaman nötr gridir (`#50586a`), kategorik bir renk paleti (örn. her bölge için ayrı renk) bilinçli olarak tercih edilmedi; bunun yerine odak + bağlam (focus + context) tekniği kullanıldı, çünkü bölge sayısı (7 kara bölge + deniz + sınır ötesi) tek bakışta ayırt edilebilir bir kategorik paletin sınırlarını zorluyordu ve renk körlüğü riskini artırıyordu. Büyüklük bilgisi renk yerine **nokta boyutuyla** kodlandı, böylece renk hiçbir yerde tek başına bilgi taşımıyor; tüm sayısal değerler ayrıca metin ve tooltip ile destekleniyor.

Kontrast oranları WCAG AA eşiğinin üzerinde tutuldu: gövde metni/zemin ≈ 16:1, ikincil metin/zemin ≈ 8,5:1, vurgu rengi/zemin ≈ 6,5:1 (hesaplanmış relative-luminance kontrastı).

## Tipografi

İki yazı ailesi: başlıklar için **Space Grotesk** (geometrik, teknik bir karakter — veri/bilim temasını destekliyor), gövde metni için **Inter** (okunabilirlik odaklı, uzun paragraflarda yorulmayan bir sans-serif). Gövde metni 16px, satır yüksekliği 1,6; içerik sütunları ~42em (yaklaşık 65-70 karakter) genişliğinde tutuldu.

## Grafik türü seçimleri

| Grafik | Tür | Neden |
| --- | --- | --- |
| Sticky deprem haritası | Sembol harita (nokta/saçılım) | Coğrafi dağılım; ham sayı yerine gerçek koordinat kullanıldığı için büyük illerin "yapay olarak" öne çıkması riski yok |
| Okuyucu keşfi grafiği | Çizgi grafik | Zaman içindeki değişim; seçili bölge vurgu renginde, Türkiye geneli kesik gri çizgiyle bağlam olarak gösteriliyor |
| En çok deprem kaydedilen 10 il | Sıralanmış yatay çubuk | Kategori (il) karşılaştırması; sıralama okuyucunun gözünü en önemli satırlara yönlendiriyor |
| Bölgelere göre derinlik | Kutu grafik (medyan + çeyreklik + p10–p90) | Dağılım karşılaştırması; aykırı uç noktalar yerine tipik aralığı gösteriyor |

Üç boyutlu grafik, kırpılmış/sıfırdan başlamayan çubuk ekseni, çift y ekseni, beşten fazla dilimli pasta grafik ve gökkuşağı renk skalası bilinçli olarak kullanılmadı.

## Scrollytelling yaklaşımı

Sticky grafik CSS `position: sticky` ile, adım geçişleri Scrollama.js'in IntersectionObserver tabanlı API'siyle tetikleniyor. Her adımda grafik; vurgulama (dönem/il filtresi), zaman filtresi (6-13 Şubat 2023 penceresi) veya açıklama (annotation) eklemesiyle anlamlı biçimde değişiyor — toplam 7 farklı geçiş, asgari 6 şartının üzerinde.

## Harita kalibrasyonu

Sticky harita, soyut bir projeksiyon yerine gerçek bir Türkiye harita görseli (`turkiye-harita.png`, cografyaharita.com) üzerine kuruldu. Görsel üzerinde 3 keskin, tek-nokta referans (Çanakkale Boğazı, Sinop burnu, Kıbrıs Karpaz ucu) piksel olarak işaretlendi; bu noktaların gerçek enlem/boylamlarıyla piksel konumları arasında eksen başına bağımsız bir en küçük kareler (linear regresyon) uyumu kuruldu: `piksel_x = 71,026·boylam − 1834,215`, `piksel_y = −95,719·enlem + 4055,020`. Göl/körfez gibi bulanık-sınırlı referanslar (Van Gölü, Antalya Körfezi) denendi ama 80-330px'lik tutarsız hatalar verdiği için elendi; 3 keskin nokta birbirleriyle <17px hata veriyordu. Son uyum, 11 bilinen il merkezinin (İstanbul, Ankara, İzmir, Antalya, Van, Diyarbakır, Trabzon, Adana, Hatay, Edirne, Sinop) harita üzerinde doğru coğrafi konuma düştüğü görsel olarak doğrulanarak kabul edildi.

## Erişilebilirlik ve duyarlı tasarım

`prefers-reduced-motion` tercihi saygı görüyor (geçiş süreleri 0'a iniyor, kaydırma ipucu animasyonu duruyor). Tüm grafiklerde `<svg role="img">` + `<title>` + görünür `<figcaption>` bulunuyor. Kontroller (`<select>`, `<input type="range">`) yerel HTML elemanları olduğu için klavyeyle kullanılabiliyor. Düzen 360 / 768 / 1280 px genişliklerde test edildi; mobilde sticky grafik üstte sabitlenip metin adımları altından/üzerinden akıyor, masaüstünde iki sütunlu düzene geçiyor.

## Kişisel marka tutarlılığı

Vurgu rengi ve başlık fontu, yazarın portfolyo sitesiyle aynı aileden seçildi; site altbilgisinden ve yazar bölümünden portfolyoya (ardaalacamli.vercel.app) geri bağlantı veriliyor.
