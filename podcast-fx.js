/* Podcast section enhancements: relative dates, particle field, scroll reveals.
   Pauses motion when the section is offscreen or the user prefers reduced motion. */
(function () {
  "use strict";

  var TZ = "America/Los_Angeles";
  var reduced = false;
  try {
    reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch (e) {}

  function ymdUTC(date) {
    var fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: TZ,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    var parts = fmt.formatToParts(date);
    var get = function (type) {
      for (var i = 0; i < parts.length; i++) if (parts[i].type === type) return +parts[i].value;
      return 0;
    };
    return Date.UTC(get("year"), get("month") - 1, get("day"));
  }

  function calendarDaysAgo(iso) {
    var pub = new Date(iso);
    if (isNaN(pub.getTime())) return null;
    return Math.round((ymdUTC(new Date()) - ymdUTC(pub)) / 86400000);
  }

  function relativeLabel(iso, featured) {
    var days = calendarDaysAgo(iso);
    if (days === null) return null;
    if (featured) {
      if (days <= 0) return "NEW EP · today";
      if (days === 1) return "NEW EP · 1 day ago";
      if (days < 7) return "NEW EP · " + days + " days ago";
      return days + " days ago";
    }
    if (days <= 0) return "today";
    if (days === 1) return "1 day ago";
    return days + " days ago";
  }

  function applyDates(section) {
    var dates = section.querySelectorAll(".zts-ep-date[data-published]");
    for (var i = 0; i < dates.length; i++) {
      var el = dates[i];
      var iso = el.getAttribute("data-published");
      if (!iso) continue;
      var featured = el.getAttribute("data-featured") === "1";
      var label = relativeLabel(iso, featured);
      if (label) el.textContent = label;
    }
    var badges = section.querySelectorAll(".zts-badge");
    for (var j = 0; j < badges.length; j++) {
      var badge = badges[j];
      var card = badge.closest(".zts-episode");
      var pub = card && card.getAttribute("data-published");
      var days = pub ? calendarDaysAgo(pub) : null;
      if (days !== null && days > 7) {
        badge.textContent = "Latest";
        badge.classList.add("zts-badge--calm");
      } else {
        badge.textContent = "New episode";
        badge.classList.remove("zts-badge--calm");
      }
    }
  }

  function observeReveals(section) {
    var nodes = section.querySelectorAll(".zts-reveal");
    if (reduced || !("IntersectionObserver" in window)) {
      for (var i = 0; i < nodes.length; i++) nodes[i].classList.add("is-in");
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        for (var i = 0; i < entries.length; i++) {
          if (!entries[i].isIntersecting) continue;
          entries[i].target.classList.add("is-in");
          io.unobserve(entries[i].target);
        }
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
    );
    for (var j = 0; j < nodes.length; j++) {
      nodes[j].style.transitionDelay = Math.min(j, 4) * 90 + "ms";
      io.observe(nodes[j]);
    }
  }

  function startParticles(section) {
    var canvas = section.querySelector(".zts-bg-canvas");
    if (!canvas || reduced) return;
    var ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    var running = false;
    var visible = false;
    var raf = 0;
    var dots = [];
    var w = 0;
    var h = 0;
    var dpr = 1;

    function resize() {
      var rect = section.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.max(1, Math.floor(rect.width));
      h = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }

    function seed() {
      var mobile = w < 640;
      var count = mobile ? 12 : 26;
      var colors = [
        "rgba(167, 139, 250,",
        "rgba(34, 211, 238,",
        "rgba(196, 181, 253,",
      ];
      dots = [];
      for (var i = 0; i < count; i++) {
        dots.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: mobile ? 0.7 + Math.random() * 1.2 : 0.8 + Math.random() * 1.6,
          vx: (Math.random() - 0.5) * 0.18,
          vy: (Math.random() - 0.5) * 0.14 - 0.02,
          a: 0.15 + Math.random() * 0.45,
          c: colors[i % colors.length],
        });
      }
    }

    function frame() {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < dots.length; i++) {
        var p = dots[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -8) p.x = w + 8;
        else if (p.x > w + 8) p.x = -8;
        if (p.y < -8) p.y = h + 8;
        else if (p.y > h + 8) p.y = -8;
        ctx.beginPath();
        ctx.fillStyle = p.c + p.a + ")";
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    }

    function play() {
      if (running || reduced || !visible) return;
      running = true;
      section.classList.remove("zts-bg-paused");
      raf = requestAnimationFrame(frame);
    }

    function pause() {
      running = false;
      section.classList.add("zts-bg-paused");
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }

    resize();
    section.classList.add("zts-bg-paused");

    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(
        function (entries) {
          visible = entries[0] && entries[0].isIntersecting;
          if (visible && !document.hidden) play();
          else pause();
        },
        { threshold: 0.05 }
      );
      io.observe(section);
    } else {
      visible = true;
      play();
    }

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) pause();
      else if (visible) play();
    });

    var resizeTimer = 0;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    });
  }

  function enhance() {
    var section = document.getElementById("podcast");
    if (!section || section.getAttribute("data-zts-fx") === "1") return !!section && section.getAttribute("data-zts-fx") === "1";
    if (!section.querySelector(".zts-episode")) return false;
    section.setAttribute("data-zts-fx", "1");
    applyDates(section);
    observeReveals(section);
    startParticles(section);
    return true;
  }

  function boot() {
    if (enhance()) return;
    var root = document.getElementById("root") || document.body;
    var mo = new MutationObserver(function () {
      if (enhance()) mo.disconnect();
    });
    mo.observe(root, { childList: true, subtree: true });
    setTimeout(function () {
      enhance();
    }, 4000);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
