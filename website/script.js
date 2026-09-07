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

  // ---------- Scroll-driven graph drawing & stage card reveals ----------
  (function initJourneyGraphAnimation() {
    var journeySection = document.querySelector(".qz-journey-section");
    var curveContainer = document.querySelector(".qz-curve");
    var path = document.querySelector(".qz-curve__path");
    var fill = document.querySelector(".qz-curve__fill");
    var nodes = Array.prototype.slice.call(document.querySelectorAll(".qz-curve__node"));
    var cards = Array.prototype.slice.call(document.querySelectorAll(".qz-stage-card"));

    if (!journeySection || !path) return;

    var pathLength = 0;
    try {
      pathLength = path.getTotalLength();
    } catch (e) {
      pathLength = 350;
    }

    path.style.strokeDasharray = pathLength;
    path.style.strokeDashoffset = pathLength;

    var ticking = false;

    function update() {
      ticking = false;
      var targetEl = curveContainer || journeySection;
      var rect = targetEl.getBoundingClientRect();
      var viewportHeight = window.innerHeight || document.documentElement.clientHeight;

      // Delayed scroll trigger: start drawing when curve top enters middle of viewport (55% from top)
      // Complete drawing when curve moves up near upper viewport (15% from top)
      var startTrigger = viewportHeight * 0.60;
      var endTrigger = viewportHeight * 0.15;
      var totalScrollRange = startTrigger - endTrigger;
      var currentScroll = startTrigger - rect.top;
      var progress = currentScroll / totalScrollRange;

      if (progress < 0) progress = 0;
      if (progress > 1) progress = 1;

      // Draw SVG curve line
      var drawOffset = pathLength * (1 - progress);
      path.style.strokeDashoffset = drawOffset;

      // Unclip SVG area fill dynamically
      if (fill) {
        fill.style.clipPath = "inset(0 " + ((1 - progress) * 100).toFixed(1) + "% 0 0)";
      }

      // Stage activation thresholds (Point 1 @ ~25%, Point 2 @ ~60%, Point 3 @ ~90%)
      var stage1Reached = progress >= 0.25;
      var stage2Reached = progress >= 0.60;
      var stage3Reached = progress >= 0.90;

      // Determine active stage card
      var activeStage = 0;
      if (stage3Reached) {
        activeStage = 3;
      } else if (stage2Reached) {
        activeStage = 2;
      } else if (stage1Reached) {
        activeStage = 1;
      }

      nodes.forEach(function (node) {
        var stageNum = parseInt(node.getAttribute("data-stage"), 10);
        var isReached = (stageNum === 1 && stage1Reached) ||
          (stageNum === 2 && stage2Reached) ||
          (stageNum === 3 && stage3Reached);
        node.classList.toggle("is-reached", isReached);
        node.classList.toggle("is-active", stageNum === activeStage && isReached);
      });

      cards.forEach(function (card) {
        var stageNum = parseInt(card.getAttribute("data-stage"), 10);
        var isReached = (stageNum === 1 && stage1Reached) ||
          (stageNum === 2 && stage2Reached) ||
          (stageNum === 3 && stage3Reached);
        card.classList.toggle("is-reached", isReached);
        card.classList.toggle("is-active", stageNum === activeStage && isReached);
      });
    }

    function onScrollOrResize() {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }

    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize, { passive: true });
    update();
  })();

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

