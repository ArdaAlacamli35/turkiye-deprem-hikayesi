/* =========================================================
   Sticky deprem haritası (sembol harita) + Scrollama adımları
   Veri: data/deprem_noktalar_m4.json  (M >= 4,0, n = 4.034)
   ========================================================= */
(function () {
  "use strict";

  if (typeof d3 === "undefined") {
    var capEl = document.getElementById("viz-caption-text");
    if (capEl) capEl.textContent = "Grafik kütüphanesi (D3) yüklenemedi — internet bağlantınızı kontrol edin (CDN'e erişim gerekiyor).";
    console.error("harita.js: d3 tanımsız, script muhtemelen yüklenemedi (CDN erişimi?)");
    return;
  }

  // Harita altlığının (turkiye-harita.png, 1409x754px) piksel koordinatlarına
  // kalibre edilmiş dönüşüm. 5 bilinen referans noktasıyla (Çanakkale Boğazı,
  // Sinop burnu, Kıbrıs Karpaz ucu + 11 şehrin kontrolüyle) en küçük kareler
  // yöntemiyle hesaplandı; bkz. docs/tasarim-notu.md "Harita kalibrasyonu".
  var M_X = 71.026, C_X = -1834.215;
  var M_Y = -95.719, C_Y = 4055.020;
  function X(lon) { return M_X * lon + C_X; }
  function Y(lat) { return M_Y * lat + C_Y; }

  var REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var DUR = REDUCED_MOTION ? 0 : 500;

  var RENK_NOTR = "#50586a";
  var RENK_VURGU = "#ff6b3d";

  // Otuz yılın en büyük depremleri (etiketleme için; sayılar notebook'taki
  // analizle birebir eşleşir, bkz. data/bulgular.json ve Yöntem bölümü).
  var ONEMLI_OLAYLAR = [
    { lat: 37.1757, lon: 37.0850, m: 7.7, etiket: "Gaziantep · 6 Şub 2023 · M7,7" },
    { lat: 38.0818, lon: 37.1773, m: 7.6, etiket: "Kahramanmaraş · 6 Şub 2023 · M7,6" },
    { lat: 40.7600, lon: 29.9700, m: 7.4, etiket: "Kocaeli · 17 Ağu 1999 · M7,4" },
    { lat: 38.7212, lon: 43.4110, m: 7.2, etiket: "Van · 23 Eki 2011 · M7,2" },
    { lat: 40.7400, lon: 31.2100, m: 7.2, etiket: "Düzce · 12 Kas 1999 · M7,2" }
  ];

  var svg = d3.select("#sticky-svg");
  svg.append("image")
    .attr("href", "turkiye-harita.png")
    .attr("x", 0).attr("y", 0).attr("width", 1409).attr("height", 754)
    .attr("preserveAspectRatio", "none")
    .attr("style", "filter: invert(1) brightness(0.8) contrast(0.92);");
  var gPuanlar = svg.append("g").attr("class", "g-puanlar");
  var gAnnotasyon = svg.append("g").attr("class", "g-annotasyon");
  var legendEl = document.getElementById("viz-legend");
  var caption = document.getElementById("viz-caption-text");
  var tooltip = document.getElementById("tooltip");

  function legendCiz() {
    legendEl.innerHTML =
      '<span class="legend-item"><span class="legend-dot" style="background:' + RENK_NOTR + '"></span>vurgulanmayan depremler</span>' +
      '<span class="legend-item"><span class="legend-dot" style="background:' + RENK_VURGU + '"></span>anlatılan depremler</span>' +
      '<span class="legend-item">nokta boyutu = büyüklük (M4,0–M7,7)</span>';
  }
  legendCiz();

  Promise.resolve(window.__VERI__ && window.__VERI__.deprem_noktalar_m4).then(function (veri) {
    if (!veri) throw new Error("js/veri-gomulu.js yüklenemedi — dosya yolunu/klasör yapısını kontrol edin (site/ klasörünü bozmadan açmalısınız).");

    var rScale = d3.scaleSqrt().domain([4, 7.7]).range([2.1, 16]);

    veri.forEach(function (d) {
      d._x = X(d.lon); d._y = Y(d.lat); d._r = rScale(d.m);
      d._yil = +d.t.slice(0, 4);
    });

    var dots = gPuanlar.selectAll("circle.eq-dot")
      .data(veri)
      .enter()
      .append("circle")
      .attr("class", "eq-dot")
      .attr("cx", function (d) { return d._x; })
      .attr("cy", function (d) { return d._y; })
      .attr("r", function (d) { return d._r; })
      .attr("fill", RENK_NOTR)
      .attr("fill-opacity", 0.55)
      .attr("stroke", "none")
      .on("mouseenter focus", function (event, d) { tooltipGoster(event, d); })
      .on("mousemove", function (event, d) { tooltipTasi(event); })
      .on("mouseleave blur", function () { tooltipGizle(); });

    function tooltipGoster(event, d) {
      tooltip.innerHTML =
        "<strong>" + d.il.charAt(0) + d.il.slice(1).toLowerCase() + "</strong> · " + d.t + "<br>" +
        "Büyüklük M" + d.m.toFixed(1) + (d.d_ok ? (" · derinlik " + d.d.toFixed(0) + " km") : " · derinlik: şüpheli/varsayılan");
      tooltip.classList.add("vazife");
      tooltipTasi(event);
    }
    function tooltipTasi(event) {
      tooltip.style.left = (event.clientX + 14) + "px";
      tooltip.style.top = (event.clientY + 14) + "px";
    }
    function tooltipGizle() { tooltip.classList.remove("vazife"); }

    function vurgula(predicate) {
      dots.transition().duration(DUR)
        .attr("fill", function (d) { return predicate(d) ? RENK_VURGU : RENK_NOTR; })
        .attr("fill-opacity", function (d) { return predicate(d) ? 0.9 : 0.22; })
        .attr("r", function (d) { return predicate(d) ? d._r * 1.15 : d._r; });
    }

    function annotasyonTemizle() {
      gAnnotasyon.selectAll("*").transition().duration(DUR / 2).style("opacity", 0).remove();
    }

    function olayEtiketleriCiz(olaylar) {
      annotasyonTemizle();
      var g = gAnnotasyon;
      olaylar.forEach(function (o, i) {
        var x = X(o.lon), y = Y(o.lat);
        var dy = (i % 2 === 0) ? -26 : 26;
        var grup = g.append("g").attr("class", "annotasyon-olay").style("opacity", 0);
        grup.append("circle")
          .attr("cx", x).attr("cy", y).attr("r", rScale(o.m) + 3.5)
          .attr("fill", "none").attr("stroke", RENK_VURGU).attr("stroke-width", 2.6);
        grup.append("line")
          .attr("x1", x).attr("y1", y).attr("x2", x).attr("y2", y + dy)
          .attr("stroke", "#eef0f3").attr("stroke-width", 1.6);
        grup.append("text")
          .attr("x", x).attr("y", y + dy + (dy < 0 ? -7 : 21))
          .attr("text-anchor", "middle")
          .attr("fill", "#11141a")
          .attr("stroke", "#11141a")
          .attr("stroke-width", 3)
          .attr("paint-order", "stroke")
          .attr("font-size", "18px")
          .attr("font-weight", "600")
          .attr("font-family", "Inter, sans-serif")
          .text(o.etiket);
        grup.append("text")
          .attr("x", x).attr("y", y + dy + (dy < 0 ? -7 : 21))
          .attr("text-anchor", "middle")
          .attr("fill", "#eef0f3")
          .attr("font-size", "18px")
          .attr("font-weight", "600")
          .attr("font-family", "Inter, sans-serif")
          .text(o.etiket);
        grup.transition().duration(DUR).style("opacity", 1);
      });
    }

    var CAPTIONS = {
      1: "1994–2023 arasında M ≥ 4,0 büyüklüğünde 4.034 deprem kaydedildi.",
      2: "1994–2003: Doğu Anadolu payı %27,9 — otuz yılın en dengeli dağılımı.",
      3: "2004–2013: Van depremi (M7,2) sonrası Doğu Anadolu payı %53,2'ye çıktı.",
      4: "2014–2023: Akdeniz payı %31,4, Güneydoğu Anadolu %9,1'e yükseldi.",
      5: "6–13 Şubat 2023: 402 deprem M≥4 — otuz yılın M≥4 kayıtlarının ~%10'u.",
      6: "Nokta boyutu büyüklüğü gösterir. En büyüğü: Gaziantep, M7,7 (2023).",
      7: "Van (324) ve Kahramanmaraş (289): en çok M≥4 kaydı tutulan iki il."
    };

    function adimUygula(stepNo) {
      caption.textContent = CAPTIONS[stepNo] || CAPTIONS[1];
      switch (stepNo) {
        case 1:
          annotasyonTemizle();
          vurgula(function () { return false; });
          break;
        case 2:
          annotasyonTemizle();
          vurgula(function (d) { return d._yil <= 2003; });
          break;
        case 3:
          vurgula(function (d) { return d._yil >= 2004 && d._yil <= 2013; });
          olayEtiketleriCiz(ONEMLI_OLAYLAR.filter(function (o) { return o.etiket.indexOf("Van") === 0; }));
          break;
        case 4:
          vurgula(function (d) { return d._yil >= 2014; });
          annotasyonTemizle();
          break;
        case 5:
          vurgula(function (d) { return d.t >= "2023-02-06" && d.t <= "2023-02-13"; });
          olayEtiketleriCiz(ONEMLI_OLAYLAR.filter(function (o) {
            return o.etiket.indexOf("Gaziantep") === 0 || o.etiket.indexOf("Kahramanmaraş") === 0;
          }));
          break;
        case 6:
          vurgula(function (d) { return d.m >= 6.4; });
          olayEtiketleriCiz(ONEMLI_OLAYLAR);
          break;
        case 7:
          annotasyonTemizle();
          vurgula(function (d) { return d.il === "VAN" || d.il === "KAHRAMANMARAS"; });
          break;
        default:
          vurgula(function () { return false; });
      }
    }

    window.__depremAdimUygula = adimUygula;
    window.__depremVerisiHazir = true;
    document.dispatchEvent(new CustomEvent("deprem-veri-hazir"));
    adimUygula(1);
  }).catch(function (err) {
    caption.textContent = "Veri yüklenemedi: " + err;
    console.error("deprem_noktalar_m4.json yüklenemedi", err);
  });
})();
