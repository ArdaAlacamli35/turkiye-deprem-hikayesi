/* =========================================================
   Okuyucu keşfi: bölge seçici + yıl aralığı kaydırıcısı
   Veri: data/bolge_yil.csv
   ========================================================= */
(function () {
  "use strict";

  if (typeof d3 === "undefined") {
    var sumEl = document.getElementById("explorer-summary");
    if (sumEl) sumEl.textContent = "Grafik kütüphanesi (D3) yüklenemedi — internet bağlantınızı kontrol edin.";
    console.error("explorer.js: d3 tanımsız, script muhtemelen yüklenemedi (CDN erişimi?)");
    return;
  }

  var RENK_VURGU = "#ff6b3d";
  var RENK_CIZGI = "#aab0ba";
  var RENK_EKSEN = "#6d7480";
  var REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var DUR = REDUCED_MOTION ? 0 : 400;

  var BOLGE_SIRA = ["Marmara", "Ege", "Akdeniz", "İç Anadolu", "Karadeniz",
    "Doğu Anadolu", "Güneydoğu Anadolu", "Deniz", "Yurt dışı / sınır"];

  var selectEl = document.getElementById("explorer-bolge");
  var yilMinEl = document.getElementById("explorer-yil-min");
  var yilMaxEl = document.getElementById("explorer-yil-max");
  var yilMinCikti = document.getElementById("yil-min-cikti");
  var yilMaxCikti = document.getElementById("yil-max-cikti");
  var yilEtiket = document.getElementById("yil-araligi-etiket");
  var summaryEl = document.getElementById("explorer-summary");
  var svg = d3.select("#explorer-chart");
  var gRoot = svg.append("g");

  Promise.resolve(window.__VERI__ && window.__VERI__.bolge_yil).then(function (rows) {
    if (!rows) throw new Error("js/veri-gomulu.js yüklenemedi — dosya yolunu/klasör yapısını kontrol edin.");
    BOLGE_SIRA.forEach(function (b) {
      if (rows.some(function (r) { return r.bolge === b; })) {
        selectEl.add(new Option(b, b));
      }
    });

    var yilListesi = Array.from(new Set(rows.map(function (d) { return d.yil; }))).sort(d3.ascending);
    var tumYilToplam = d3.rollup(
      rows.filter(function (d) { return d.bolge !== "Yurt dışı / sınır"; }),
      function (v) { return d3.sum(v, function (d) { return d.n_m4; }); },
      function (d) { return d.yil; }
    );
    var bolgeYilToplam = d3.rollup(rows,
      function (v) { return d3.sum(v, function (d) { return d.n_m4; }); },
      function (d) { return d.bolge; }, function (d) { return d.yil; });

    function serile(bolgeAdi, yilMin, yilMax) {
      var kaynak = bolgeAdi === "__all__" ? tumYilToplam : bolgeYilToplam.get(bolgeAdi);
      return yilListesi
        .filter(function (y) { return y >= yilMin && y <= yilMax; })
        .map(function (y) { return { yil: y, n: (kaynak && kaynak.get(y)) || 0 }; });
    }

    function ciz() {
      var bolgeAdi = selectEl.value;
      var yMin = +yilMinEl.value, yMax = +yilMaxEl.value;
      if (yMin > yMax) { var t = yMin; yMin = yMax; yMax = t; }

      yilMinCikti.textContent = yMin;
      yilMaxCikti.textContent = yMax;
      yilEtiket.textContent = yMin + "–" + yMax;

      var secili = serile(bolgeAdi, yMin, yMax);
      var ulke = bolgeAdi === "__all__" ? null : serile("__all__", yMin, yMax);

      var W = 760, H = 320;
      var M = { top: 16, right: 20, bottom: 32, left: 42 };
      var innerW = W - M.left - M.right, innerH = H - M.top - M.bottom;

      var x = d3.scalePoint().domain(secili.map(function (d) { return d.yil; })).range([0, innerW]);
      var maxN = d3.max((ulke ? secili.concat(ulke) : secili), function (d) { return d.n; }) || 1;
      var y = d3.scaleLinear().domain([0, maxN * 1.15]).nice().range([innerH, 0]);

      if (gRoot.select("g.inner").empty()) {
        gRoot.attr("transform", "translate(" + M.left + "," + M.top + ")").attr("class", "inner-wrap");
        gRoot.append("g").attr("class", "eksen-x");
        gRoot.append("g").attr("class", "eksen-y");
        gRoot.append("path").attr("class", "cizgi-ulke");
        gRoot.append("path").attr("class", "cizgi-secili");
        gRoot.append("g").attr("class", "noktalar-secili");
      }

      var tickYear = function (d) { return (d % 5 === 0 || d === yilListesi[0] || d === yilListesi[yilListesi.length - 1]) ? d : ""; };

      gRoot.select("g.eksen-x")
        .attr("transform", "translate(0," + innerH + ")")
        .transition().duration(DUR)
        .call(d3.axisBottom(x).tickFormat(function (d) { return (d - yMin) % 5 === 0 ? d : ""; }).tickSizeOuter(0))
        .call(function (sel) {
          sel.selectAll("text").attr("fill", RENK_EKSEN).attr("font-size", "10px");
          sel.selectAll("line,path").attr("stroke", "#3a4150");
        });

      gRoot.select("g.eksen-y")
        .transition().duration(DUR)
        .call(d3.axisLeft(y).ticks(5))
        .call(function (sel) {
          sel.selectAll("text").attr("fill", RENK_EKSEN).attr("font-size", "10px");
          sel.selectAll("line,path").attr("stroke", "#3a4150");
        });

      var lineGen = d3.line().x(function (d) { return x(d.yil); }).y(function (d) { return y(d.n); }).curve(d3.curveMonotoneX);

      if (ulke) {
        gRoot.select("path.cizgi-ulke")
          .datum(ulke)
          .attr("fill", "none").attr("stroke", RENK_CIZGI).attr("stroke-width", 1.5)
          .attr("stroke-dasharray", "4,3").style("opacity", 1)
          .transition().duration(DUR).attr("d", lineGen);
      } else {
        gRoot.select("path.cizgi-ulke").style("opacity", 0);
      }

      gRoot.select("path.cizgi-secili")
        .datum(secili)
        .attr("fill", "none").attr("stroke", RENK_VURGU).attr("stroke-width", 2.5)
        .transition().duration(DUR).attr("d", lineGen);

      var noktalar = gRoot.select("g.noktalar-secili").selectAll("circle").data(secili, function (d) { return d.yil; });
      noktalar.exit().remove();
      noktalar.enter().append("circle")
        .attr("r", 2.6).attr("fill", RENK_VURGU)
        .merge(noktalar)
        .transition().duration(DUR)
        .attr("cx", function (d) { return x(d.yil); })
        .attr("cy", function (d) { return y(d.n); });

      var toplam = d3.sum(secili, function (d) { return d.n; });
      var maxSatir = secili.reduce(function (a, b) { return b.n > a.n ? b : a; }, { n: -1, yil: null });
      var bolgeEtiket = bolgeAdi === "__all__" ? "Tüm Türkiye" : bolgeAdi;
      summaryEl.innerHTML = yMin === yMax
        ? "<strong>" + bolgeEtiket + "</strong>, " + yMin + " yılında <strong>" + toplam + "</strong> deprem (M≥4,0) kaydetti."
        : "<strong>" + bolgeEtiket + "</strong>, " + yMin + "–" + yMax + " arasında toplam <strong>" + toplam + "</strong> deprem (M≥4,0) kaydetti" +
          (maxSatir.yil ? "; en yoğun yıl <strong>" + maxSatir.yil + "</strong> (" + maxSatir.n + " deprem)." : ".");
    }

    selectEl.addEventListener("change", ciz);
    yilMinEl.addEventListener("input", function () {
      if (+yilMinEl.value > +yilMaxEl.value) yilMaxEl.value = yilMinEl.value;
      ciz();
    });
    yilMaxEl.addEventListener("input", function () {
      if (+yilMaxEl.value < +yilMinEl.value) yilMinEl.value = yilMaxEl.value;
      ciz();
    });

    ciz();
  }).catch(function (err) {
    summaryEl.textContent = "Veri yüklenemedi.";
    console.error("bolge_yil.csv yüklenemedi", err);
  });
})();
