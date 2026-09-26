/* Meridian Future Academy — KimiVersion interactions */
(function () {
  "use strict";

  /* JS 可用标记：reveal 动画仅在 JS 启用时隐藏初始态，禁用 JS 时内容默认可见 */
  document.documentElement.classList.add("js");

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

  /* Forms → self-hosted /api/ backend (urlencoded, JSON response).
     On any network/backend failure, show a graceful email fallback. */
  document.querySelectorAll("form[data-endpoint]").forEach(function (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var btn = form.querySelector("[type=submit]");
      var msg = form.querySelector(".form-msg");
      var btnText = btn ? btn.textContent : "";
      var zh = document.documentElement.lang === "zh-CN";
      if (btn) { btn.disabled = true; btn.textContent = zh ? "提交中…" : "Submitting…"; }
      fetch(form.getAttribute("data-endpoint"), {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(new FormData(form)).toString()
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (!msg) return;
          if (data && data.status === "success") {
            msg.className = "form-msg ok";
            msg.textContent = zh
              ? "我们已收到您的提交，感谢耐心等待！招生办公室将在 3–5 个工作日内与您联系。"
              : "We have received your submission — thank you! Our office will be in touch within 3–5 business days.";
            form.reset();
          } else {
            msg.className = "form-msg err";
            msg.textContent = (data && data.message) || (zh ? "提交出错，请稍后重试。" : "An error occurred. Please try again later.");
          }
        })
        .catch(function () {
          if (!msg) return;
          msg.className = "form-msg err";
          msg.innerHTML = zh
            ? "在线提交暂时不可用。请直接发送邮件至 <a href='mailto:admissions@meridianfuture.org' style='color:inherit;text-decoration:underline'>admissions@meridianfuture.org</a>，我们会在一个工作日内回复您。"
            : "Online submission is temporarily unavailable. Please email us directly at <a href='mailto:admissions@meridianfuture.org' style='color:inherit;text-decoration:underline'>admissions@meridianfuture.org</a> — we reply within one business day.";
        })
        .finally(function () {
          if (btn) { btn.disabled = false; btn.textContent = btnText; }
        });
    });
  });

})();
