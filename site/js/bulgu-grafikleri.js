/* =========================================================
   Statik destek grafikleri: derinlik kutu grafiği ve
   en çok M≥4 deprem kaydedilen 10 il (sıralanmış çubuk grafik)
   ========================================================= */
(function () {
  "use strict";

  if (typeof d3 === "undefined") {
    console.error("bulgu-grafikleri.js: d3 tanımsız, script muhtemelen yüklenemedi (CDN erişimi?)");
    return;
  }

  var RENK_NOTR = "#50586a";
  var RENK_VURGU = "#ff6b3d";
  var RENK_CIZGI = "#aab0ba";

  /* ---------- Derinlik kutu grafiği ---------- */
  Promise.resolve(window.__VERI__ && window.__VERI__.derinlik_bolge).then(function (rows) {
    if (!rows) throw new Error("js/veri-gomulu.js yüklenemedi (derinlik_bolge).");
    rows = rows.filter(function (d) { return d.bolge !== "Yurt dışı / sınır"; });
    rows.sort(function (a, b) { return b.medyan_derinlik - a.medyan_derinlik; });

    var svg = d3.select("#derinlik-chart");
    var W = 700, H = 260;
    var M = { top: 12, right: 18, bottom: 28, left: 128 };
    var innerW = W - M.left - M.right, innerH = H - M.top - M.bottom;

    var y = d3.scaleBand().domain(rows.map(function (d) { return d.bolge; })).range([0, innerH]).padding(0.38);
    var xMax = d3.max(rows, function (d) { return d.p90; });
    var x = d3.scaleLinear().domain([0, xMax * 1.05]).range([0, innerW]);

    var g = svg.append("g").attr("transform", "translate(" + M.left + "," + M.top + ")");

    g.append("g")
      .attr("transform", "translate(0," + innerH + ")")
      .call(d3.axisBottom(x).ticks(5).tickSizeOuter(0))
      .call(function (sel) { sel.selectAll("text").attr("fill", RENK_CIZGI).attr("font-size", "10.5px"); sel.selectAll("line,path").attr("stroke", "#3a4150"); });

    g.append("text")
      .attr("x", innerW).attr("y", innerH + 24).attr("text-anchor", "end")
      .attr("fill", RENK_CIZGI).attr("font-size", "10.5px").text("Derinlik (km)");

    var rowG = g.selectAll("g.satir").data(rows).enter().append("g").attr("class", "satir")
      .attr("transform", function (d) { return "translate(0," + y(d.bolge) + ")"; });

    rowG.append("text")
      .attr("x", -10).attr("y", y.bandwidth() / 2).attr("dy", "0.32em")
      .attr("text-anchor", "end").attr("fill", "#eef0f3").attr("font-size", "11.5px")
      .text(function (d) { return d.bolge; });

    rowG.append("line") // p10-p90 bıyık
      .attr("x1", function (d) { return x(d.p10); }).attr("x2", function (d) { return x(d.p90); })
      .attr("y1", y.bandwidth() / 2).attr("y2", y.bandwidth() / 2)
      .attr("stroke", RENK_NOTR).attr("stroke-width", 1.5);

    rowG.append("rect") // q1-q3 kutu
      .attr("x", function (d) { return x(d.q1); })
      .attr("width", function (d) { return Math.max(1, x(d.q3) - x(d.q1)); })
      .attr("y", y.bandwidth() * 0.18).attr("height", y.bandwidth() * 0.64)
      .attr("fill", RENK_VURGU).attr("fill-opacity", 0.55).attr("rx", 2);

    rowG.append("line") // medyan
      .attr("x1", function (d) { return x(d.medyan_derinlik); }).attr("x2", function (d) { return x(d.medyan_derinlik); })
      .attr("y1", 0).attr("y2", y.bandwidth())
      .attr("stroke", "#eef0f3").attr("stroke-width", 2);
  }).catch(function (err) { console.error("derinlik_bolge.csv yüklenemedi", err); });

  /* ---------- En çok M≥4 deprem kaydedilen 10 il ---------- */
  Promise.resolve(window.__VERI__ && window.__VERI__.bulgular).then(function (b) {
    if (!b) throw new Error("js/veri-gomulu.js yüklenemedi (bulgular).");
    var ILLER_TR = {
      VAN: "Van", KAHRAMANMARAS: "Kahramanmaraş", MALATYA: "Malatya", ELAZIG: "Elazığ",
      BINGOL: "Bingöl", MANISA: "Manisa", MUGLA: "Muğla", HATAY: "Hatay",
      ADIYAMAN: "Adıyaman", DENIZLI: "Denizli"
    };
    var rows = Object.keys(b.en_cok_m4_iller).map(function (k) {
      return { il: ILLER_TR[k] || k, n: b.en_cok_m4_iller[k] };
    });
    rows.sort(function (a, c) { return c.n - a.n; });

    var svg = d3.select("#il-bar-chart");
    var W = 700, H = 320;
    var M = { top: 10, right: 34, bottom: 32, left: 110 };
    var innerW = W - M.left - M.right, innerH = H - M.top - M.bottom;

    var y = d3.scaleBand().domain(rows.map(function (d) { return d.il; })).range([0, innerH]).padding(0.28);
    var x = d3.scaleLinear().domain([0, d3.max(rows, function (d) { return d.n; }) * 1.12]).range([0, innerW]);

    var g = svg.append("g").attr("transform", "translate(" + M.left + "," + M.top + ")");

    g.append("g")
      .attr("transform", "translate(0," + innerH + ")")
      .call(d3.axisBottom(x).ticks(5).tickSizeOuter(0))
      .call(function (sel) { sel.selectAll("text").attr("fill", RENK_CIZGI).attr("font-size", "10.5px"); sel.selectAll("line,path").attr("stroke", "#3a4150"); });

    g.append("text")
      .attr("x", innerW).attr("y", innerH + 28).attr("text-anchor", "end")
      .attr("fill", RENK_CIZGI).attr("font-size", "10.5px").text("Deprem sayısı (M≥4,0)");

    var bar = g.selectAll("g.il-cubuk").data(rows).enter().append("g").attr("class", "il-cubuk")
      .attr("transform", function (d) { return "translate(0," + y(d.il) + ")"; });

    bar.append("text")
      .attr("x", -10).attr("y", y.bandwidth() / 2).attr("dy", "0.32em")
      .attr("text-anchor", "end").attr("fill", "#eef0f3").attr("font-size", "11.5px")
      .text(function (d) { return d.il; });

    bar.append("rect")
      .attr("x", 0).attr("y", 0).attr("height", y.bandwidth())
      .attr("width", function (d) { return x(d.n); })
      .attr("fill", function (d, i) { return i < 2 ? RENK_VURGU : RENK_NOTR; })
      .attr("fill-opacity", function (d, i) { return i < 2 ? 0.9 : 0.6; })
      .attr("rx", 3);

    bar.append("text")
      .attr("x", function (d) { return x(d.n) + 6; }).attr("y", y.bandwidth() / 2).attr("dy", "0.32em")
      .attr("fill", "#aab0ba").attr("font-size", "10.5px")
      .text(function (d) { return d.n; });
  }).catch(function (err) { console.error("bulgular.json yüklenemedi", err); });
})();
