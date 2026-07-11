/* ============================================================
   Ammolite shared chrome JS — cursor, magnetic buttons, smooth
   scroll, nav blur, entrance, section reveals, contact form.
   Loaded on every page after gsap/ScrollTrigger/CustomEase/Lenis.
   Page-specific motion (the home gem, the /work zoom transition)
   lives in each page's own inline script.
   ============================================================ */
(() => {
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  CustomEase.create("ivy", "M0,0 C0.25,0.05 0.2,1 1,1"); // long expo-style settle
  gsap.defaults({ ease: "ivy", duration: 1.1 });

  const mm = gsap.matchMedia();

  /* split any .manifesto-text into word spans (keeps <em> intact), if present */
  (() => {
    const p = document.querySelector(".manifesto-text");
    if (!p) return;
    const nodes = [...p.childNodes];
    p.textContent = "";
    nodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent.split(/\s+/).filter(Boolean).forEach((word) => {
          const s = document.createElement("span");
          s.className = "w";
          s.textContent = word;
          p.append(s, " ");
        });
      } else {
        node.classList.add("w");
        p.append(node, " ");
      }
    });
  })();

  mm.add({
    motionOK: "(prefers-reduced-motion: no-preference)",
    reduceMotion: "(prefers-reduced-motion: reduce)",
    fine: "(hover: hover) and (pointer: fine)",
    wide: "(min-width: 761px)",
  }, (ctx) => {
    const { motionOK, fine, wide } = ctx.conditions;

    /* ---- smooth scroll ---- */
    let lenis = null;
    if (motionOK && window.Lenis) {
      lenis = new Lenis({ lerp: 0.09 });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
      window.__lenis = lenis;
    }

    /* ---- anchor scrolling through lenis (same-page hashes only) ---- */
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const target = document.querySelector(a.getAttribute("href"));
        if (!target) return;
        e.preventDefault();
        if (lenis) lenis.scrollTo(target, { duration: 1.4 });
        else target.scrollIntoView();
      });
    });

    /* ---- custom cursor ---- */
    if (fine && motionOK) {
      const dotX = gsap.quickTo(".cursor-dot", "x", { duration: 0.12, ease: "power2.out" });
      const dotY = gsap.quickTo(".cursor-dot", "y", { duration: 0.12, ease: "power2.out" });
      const ringX = gsap.quickTo(".cursor-ring", "x", { duration: 0.45, ease: "power3.out" });
      const ringY = gsap.quickTo(".cursor-ring", "y", { duration: 0.45, ease: "power3.out" });
      const candX = gsap.quickTo(".candle", "x", { duration: 0.7, ease: "power2.out" });
      const candY = gsap.quickTo(".candle", "y", { duration: 0.7, ease: "power2.out" });
      window.addEventListener("pointermove", (e) => {
        dotX(e.clientX); dotY(e.clientY); ringX(e.clientX); ringY(e.clientY);
        candX(e.clientX); candY(e.clientY);
        document.body.classList.add("candle-on");
      }, { once: false });
      document.querySelectorAll("[data-hover]").forEach((el) => {
        el.addEventListener("pointerenter", () => document.body.classList.add("cursor-hover"));
        el.addEventListener("pointerleave", () => document.body.classList.remove("cursor-hover"));
      });
    }

    /* ---- magnetic elements ---- */
    if (fine && motionOK) {
      document.querySelectorAll("[data-magnetic]").forEach((el) => {
        const xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3.out" });
        const yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" });
        el.addEventListener("pointermove", (e) => {
          const r = el.getBoundingClientRect();
          xTo((e.clientX - r.left - r.width / 2) * 0.35);
          yTo((e.clientY - r.top - r.height / 2) * 0.35);
        });
        el.addEventListener("pointerleave", () => { xTo(0); yTo(0); });
      });
    }

    /* ---- entrance ---- */
    // hero-specific pieces (h1 stagger, eyebrow/sub/meta) only animate if present,
    // so this same timeline works on the big home hero and on lighter page headers
    const hasHeroLines = document.querySelector(".hero h1 .line > span");
    const enter = gsap.timeline({ delay: 0.15 });
    if (motionOK) {
      enter
        .to(".preloader .mark span", { y: 0, duration: 0.9 })
        .to(".preloader .mark span", { y: "-110%", duration: 0.7, delay: 0.5 })
        .to(".preloader", { yPercent: -100, duration: 0.9, ease: "power4.inOut" }, "-=0.15")
        .set(".preloader", { display: "none" });
      if (hasHeroLines) {
        enter.from(".hero h1 .line > span", { yPercent: 115, duration: 1.3, stagger: 0.09 }, "-=0.55");
        if (document.querySelector(".hero-eyebrow")) enter.to(".hero-eyebrow", { autoAlpha: 1, duration: 0.8 }, "-=0.9");
        if (document.querySelector(".hero-sub")) enter.to(".hero-sub", { autoAlpha: 1, duration: 0.8 }, "-=0.7");
        if (document.querySelector(".hero-meta")) enter.to(".hero-meta", { autoAlpha: 1, duration: 0.8 }, "-=0.5");
      }
      enter.to(".nav", { autoAlpha: 1, duration: 0.8 }, hasHeroLines ? "-=0.8" : "-=0.5");
    } else {
      gsap.set(".preloader", { display: "none" });
      gsap.set(".nav, .hero-eyebrow, .hero-sub, .hero-meta", { autoAlpha: 1 });
    }

    /* ---- scroll choreography (created top-to-bottom, per ScrollTrigger rules) ---- */
    if (motionOK) {
      // nav gets a blurred backdrop once past the fold
      ScrollTrigger.create({
        start: 90, end: "max",
        toggleClass: { targets: ".nav", className: "scrolled" },
      });

      // velocity-reactive marquee, if present
      const mTrack = document.querySelector(".marquee-track");
      if (mTrack) {
        let marqueeVel = 0;
        ScrollTrigger.create({
          start: 0, end: "max",
          onUpdate: (self) => { marqueeVel = self.getVelocity(); },
        });
        let mx = 0;
        gsap.ticker.add((t, dt) => {
          const boost = Math.min(Math.abs(marqueeVel) / 3000, 0.5);
          mx -= (0.045 + boost) * (dt / 16.7);
          if (mx <= -33.333) mx += 33.333;
          gsap.set(mTrack, { xPercent: mx });
          marqueeVel *= 0.9;
        });
      }

      // section heads rise in
      gsap.utils.toArray(".section-head").forEach((head) => {
        gsap.from(head.children, {
          yPercent: 60, autoAlpha: 0, duration: 1.2, stagger: 0.12,
          scrollTrigger: { trigger: head, start: "top 82%" },
        });
      });

      // manifesto word-by-word scrub, if present
      if (document.querySelector(".manifesto-text")) {
        gsap.set(".manifesto-text .w", { opacity: 0.12 });
        gsap.to(".manifesto-text .w", {
          opacity: 1, stagger: 0.06, ease: "none",
          scrollTrigger: { trigger: ".manifesto", start: "top 78%", end: "top 28%", scrub: true },
        });
      }

      // generic staggered rise for any reveal-batch group (cards, rows, etc.)
      document.querySelectorAll("[data-reveal-batch]").forEach((group) => {
        ScrollTrigger.batch(group.children, {
          start: "top 88%",
          onEnter: (els) => gsap.from(els, { y: 50, autoAlpha: 0, duration: 1, stagger: 0.09 }),
        });
      });

      // footer CTA rises in
      gsap.from(".footer .kicker, .footer-cta, .contact-form", {
        yPercent: 40, autoAlpha: 0, duration: 1.2, stagger: 0.12,
        scrollTrigger: { trigger: ".footer", start: "top 78%" },
      });

      // font swap can shift trigger positions
      document.fonts?.ready.then(() => ScrollTrigger.refresh());
    } else {
      document.querySelectorAll("[data-reveal-batch] > *, .footer .kicker, .footer-cta, .contact-form").forEach((el) => {
        gsap.set(el, { autoAlpha: 1, clearProps: "transform" });
      });
    }

    return () => {};
  });

  /* ---- contact form (identical footer on every page) ---- */
  const form = document.getElementById("contact-form");
  if (form) {
    const status = form.querySelector(".form-status");
    const btn = form.querySelector("button[type=submit]");
    const renderedAt = Date.now();

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      btn.disabled = true;
      status.className = "form-status";
      status.textContent = "Sending…";

      const data = Object.fromEntries(new FormData(form));
      data.startedAt = renderedAt;
      try {
        const res = await fetch("/.netlify/functions/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("request failed");
        status.className = "form-status is-ok";
        status.textContent = "Sent — we'll be in touch soon.";
        form.reset();
      } catch {
        status.className = "form-status is-error";
        status.textContent = "Something went wrong — email us directly at lahhamadam00@gmail.com";
      } finally {
        btn.disabled = false;
      }
    });
  }
})();
