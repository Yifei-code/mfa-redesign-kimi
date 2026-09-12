/* Meridian Future Academy — KimiVersion interactions */
(function () {
  "use strict";

  /* Sticky header shadow */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("scrolled", window.scrollY > 12);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* Mobile nav */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.classList.remove("open");
        document.body.style.overflow = "";
      });
    });
  }

  /* Hero crossfade */
  var slides = document.querySelectorAll(".hero-bg .slide");
  if (slides.length > 1) {
    var i = 0;
    slides[0].classList.add("on");
    setInterval(function () {
      slides[i].classList.remove("on");
      i = (i + 1) % slides.length;
      slides[i].classList.add("on");
    }, 7000);
  } else if (slides.length === 1) {
    slides[0].classList.add("on");
  }

  /* Scroll reveal */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* FAQ nav active state */
  var chips = document.querySelectorAll(".faq-nav a");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) { c.classList.remove("active"); });
      chip.classList.add("active");
    });
  });

  /* Count-up stats — numbers ease from 0 to their final value on scroll-in.
     HTML keeps final values (no-JS/SEO safe); JS only animates when visible. */
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var statNums = document.querySelectorAll(".stat .num");
  if (statNums.length && !reduceMotion && "IntersectionObserver" in window) {
    var parseNum = function (el) {
      var m = el.innerHTML.match(/^\s*(\d+)([\s\S]*)$/);
      return m ? { target: parseInt(m[1], 10), suffix: m[2] || "" } : null;
    };
    var animateNum = function (el, delay) {
      var parsed = parseNum(el);
      if (!parsed) return;
      var dur = 1700;
      var t0 = null;
      setTimeout(function () {
        el.innerHTML = "0" + parsed.suffix;
        var frame = function (t) {
          if (t0 === null) t0 = t;
          var p = Math.min((t - t0) / dur, 1);
          var e = 1 - Math.pow(1 - p, 4); /* easeOutQuart — fast start, gentle landing */
          el.innerHTML = Math.round(parsed.target * e) + parsed.suffix;
          if (p < 1) requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
      }, delay);
    };
    var statIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var group = entry.target;
        statIO.unobserve(group);
        group.classList.add("in");
        var nums = group.querySelectorAll(".num");
        nums.forEach(function (el, i) { animateNum(el, i * 130); });
      });
    }, { threshold: 0.45 });
    document.querySelectorAll(".stats").forEach(function (g) { statIO.observe(g); });
  } else {
    document.querySelectorAll(".stats").forEach(function (g) { g.classList.add("in"); });
  }

  /* Admissions / contact forms (same backend contract as legacy site) */
  document.querySelectorAll("form[data-endpoint]").forEach(function (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var btn = form.querySelector("[type=submit]");
      var msg = form.querySelector(".form-msg");
      var btnText = btn ? btn.textContent : "";
      if (btn) { btn.disabled = true; btn.textContent = "Submitting…"; }
      fetch(form.getAttribute("data-endpoint"), {
        method: "POST",
        body: new FormData(form)
      })
        .then(function (r) {
          return r.text().then(function (t) {
            try { return JSON.parse(t); }
            catch (e) { throw new Error("Server error: " + t); }
          });
        })
        .then(function (data) {
          if (!msg) return;
          if (data && data.status === "success") {
            msg.className = "form-msg ok";
            msg.textContent = "We have received your request. Thank you — our team will be in touch shortly.";
            form.reset();
          } else {
            msg.className = "form-msg err";
            msg.textContent = (data && data.message) || "An error occurred. Please try again later.";
          }
        })
        .catch(function (err) {
          if (!msg) return;
          msg.className = "form-msg err";
          msg.textContent = "Error: " + err.message;
        })
        .finally(function () {
          if (btn) { btn.disabled = false; btn.textContent = btnText; }
        });
    });
  });
})();
