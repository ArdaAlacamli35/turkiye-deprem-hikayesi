/* Scrollama bağlantısı: .step'lerin aktifliğini izler ve harita.js'e
   hangi adımın uygulanacağını bildirir. */
(function () {
  "use strict";

  var pendingStep = 1;

  // ÖNEMLİ: window.__depremVerisiHazir, harita.js'in verisi (artık sayfaya
  // gömülü olduğu için) senkrona yakın biçimde hazır olmasıyla main.js
  // yüklenmeden ÖNCE true olabiliyor; bu yüzden bir "hazır" olayını kaçırma
  // riskine karşı her çağrıda canlı bayrağı okuyoruz, yerel bir kopyaya
  // güvenmiyoruz.
  document.addEventListener("deprem-veri-hazir", function () {
    if (window.__depremAdimUygula) window.__depremAdimUygula(pendingStep);
  });

  function adimaGit(n) {
    pendingStep = n;
    if (window.__depremVerisiHazir && window.__depremAdimUygula) window.__depremAdimUygula(n);
  }

  var scroller = window.scrollama ? scrollama() : null;

  function kur() {
    if (!scroller) return;
    scroller
      .setup({
        step: "#scrolly-steps .step",
        offset: 0.6,
        progress: false
      })
      .onStepEnter(function (response) {
        document.querySelectorAll("#scrolly-steps .step").forEach(function (el) {
          el.classList.remove("is-active");
        });
        response.element.classList.add("is-active");
        var n = +response.element.getAttribute("data-step");
        adimaGit(n);
      });

    window.addEventListener("resize", function () {
      scroller.resize();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", kur);
  } else {
    kur();
  }

  // İlk adımı, scrollama henüz tetiklenmeden önce de görünür kılmak için:
  var ilkStep = document.querySelector('#scrolly-steps .step[data-step="1"]');
  if (ilkStep) ilkStep.classList.add("is-active");
})();
