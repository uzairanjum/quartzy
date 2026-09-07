// Quartzy homepage refresh — static site interactivity
// Vanilla JS replacements for the React behaviors: rotating hero stat lines,
// the quote carousel (autoplay + manual nav), video "click poster to play"
// panels, and the footer word-cycle (academic page only).

(function () {
  "use strict";

  // ---------- Rotating hero stat lines ----------
  document.querySelectorAll(".qz-rotator").forEach(function (rotator) {
    var lines = Array.prototype.slice.call(rotator.querySelectorAll(".qz-rotator__line"));
    if (lines.length < 2) return;
    var i = 0;
    function paint() {
      lines.forEach(function (line, n) {
        var off = n - i;
        line.style.transform = "translateY(" + off * 100 + "%)";
        line.style.opacity = off === 0 ? "1" : "0";
      });
    }
    paint();
    setInterval(function () {
      i = (i + 1) % lines.length;
      paint();
    }, 2600);
  });

  // ---------- Quote carousels ----------
  document.querySelectorAll(".qz-quotes").forEach(function (root) {
    var slides = Array.prototype.slice.call(root.querySelectorAll(".qz-quote-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll(".qz-quotes__dots button"));
    var prevBtn = root.querySelector(".qz-quotes__arrows .prev");
    var nextBtn = root.querySelector(".qz-quotes__arrows .next");
    if (!slides.length) return;
    var i = 0, timer = null;

    function show(n) {
      i = (n + slides.length) % slides.length;
      slides.forEach(function (s, idx) { s.classList.toggle("is-active", idx === i); });
      dots.forEach(function (d, idx) { d.classList.toggle("is-active", idx === i); });
      restart();
    }
    function restart() {
      if (timer) clearTimeout(timer);
      timer = setTimeout(function () { show(i + 1); }, 10000);
    }
    dots.forEach(function (d, idx) { d.addEventListener("click", function () { show(idx); }); });
    if (prevBtn) prevBtn.addEventListener("click", function () { show(i - 1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { show(i + 1); });
    show(0);
  });

  // ---------- Click-to-play video panels ----------
  document.querySelectorAll(".qz-play-btn[data-video-src]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var wrap = btn.closest("[data-video-wrap]");
      if (!wrap) return;
      var frame = wrap.querySelector(".qz-video-frame");
      if (!frame) return;
      frame.src = btn.getAttribute("data-video-src");
      frame.classList.add("is-playing");
    });
  });

  // ---------- Footer CTA word cycle (academic page) ----------
  document.querySelectorAll(".qz-word-cycle").forEach(function (cycle) {
    var words = Array.prototype.slice.call(cycle.querySelectorAll("span:not(.is-ghost)"));
    if (words.length < 2) return;
    var i = 0;
    words[0].classList.add("is-active");
    setInterval(function () {
      words[i].classList.remove("is-active");
      i = (i + 1) % words.length;
      words[i].classList.add("is-active");
    }, 3600);
  });

  // ---------- Journey stepper: smooth scroll to stage ----------
  document.querySelectorAll(".qz-curve__node, .qz-stage-card").forEach(function (el) {
    var href = el.getAttribute("href");
    if (!href || href.charAt(0) !== "#") return;
    el.addEventListener("click", function (e) {
      var target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  // ---------- Journey graph: one-time scroll reveal ----------
  document.querySelectorAll(".qz-curve").forEach(function (curve) {
    var reveal = curve.querySelector(".qz-curve__reveal");
    var nodes = Array.prototype.slice.call(curve.querySelectorAll(".qz-curve__node"));
    if (!reveal) return;

    var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var duration = 3000;
    var hasPlayed = false;

    function setProgress(progress) {
      var percent = Math.max(0, Math.min(1, progress)) * 100;
      reveal.setAttribute("width", String(progress * 400));
      nodes.forEach(function (node) {
        var left = parseFloat(node.style.left) || 0;
        node.classList.toggle("is-active", percent >= left);
      });
    }

    function complete() {
      hasPlayed = true;
      setProgress(1);
    }

    function play() {
      if (hasPlayed) return;
      hasPlayed = true;
      var startedAt = null;

      function frame(now) {
        if (startedAt === null) startedAt = now;
        var progress = Math.min((now - startedAt) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        setProgress(eased);
        if (progress < 1) window.requestAnimationFrame(frame);
      }

      window.requestAnimationFrame(frame);
    }

    if (reducedMotion || window.getComputedStyle(curve).display === "none") {
      complete();
      return;
    }

    setProgress(0);
    if (!("IntersectionObserver" in window)) {
      complete();
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || hasPlayed) return;
        observer.disconnect();
        play();
      });
    }, { threshold: 0.2 });

    observer.observe(curve);
  });

  // ---------- Mobile nav toggle ----------
  document.querySelectorAll(".qz-nav__burger").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var nav = btn.closest(".qz-nav");
      if (nav) nav.classList.toggle("is-open");
    });
  });

  // ---------- One homepage, two audiences ----------
  var homeViews = document.querySelectorAll(".home-view");
  if (homeViews.length) {
    function setHome(which, pushHash) {
      which = which === "academic" ? "academic" : "industry";
      document.documentElement.setAttribute("data-home", which);
      homeViews.forEach(function (el) {
        el.classList.toggle("is-active", el.getAttribute("data-home-view") === which);
      });
      document.querySelectorAll(".qz-toggle [data-home]").forEach(function (btn) {
        btn.classList.toggle("is-active", btn.getAttribute("data-home") === which);
      });
      var prefix = document.documentElement.getAttribute("data-variant");
      prefix = prefix ? "[V" + prefix + "] " : "";
      document.title = prefix + (which === "academic" ? "Quartzy — Academic" : "Quartzy — Industry");
      if (pushHash !== false) {
        history.replaceState(null, "", which === "academic" ? "#academic" : "#industry");
      }
    }
    document.querySelectorAll(".qz-toggle [data-home]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        setHome(btn.getAttribute("data-home"));
        window.scrollTo(0, 0);
      });
    });
    window.addEventListener("hashchange", function () {
      setHome(location.hash === "#academic" ? "academic" : "industry", false);
    });
    setHome(location.hash === "#academic" ? "academic" : "industry");
  }
})();
