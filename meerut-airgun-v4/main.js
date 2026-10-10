/* Meerut Airgun v4
   Motion map (each animation has one job):
   - Loader: rotary drum indexes 10 chambers while the page loads (brand moment).
   - Hero: lines rise, a pellet tracer crosses the frame, light sweeps the barrel.
   - Armory: vertical scroll pans the product rail (desktop only).
   - Magazine lab: scroll loads the drum one chamber at a time (explains the mechanism).
   - Pellets: silhouettes drop into place (introduces each type).
   - Scope: scroll zooms through the glass onto the range.
   - Order flow: a pellet rides the ballistic arc and hits the target (story of the 3 steps).
   - Target: click to shoot (feedback). */
(() => {
  const root = document.documentElement;
  root.classList.remove("no-js");

  const SVGNS = "http://www.w3.org/2000/svg";
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);

  const el = (tag, attrs = {}, parent) => {
    const n = document.createElementNS(SVGNS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  };

  /* ---------- Build SVG parts ---------- */
  function buildChambers(group, { cx, cy, ring, holeR, pelletR, numR, numbers }) {
    const pellets = [];
    for (let i = 0; i < 10; i++) {
      const a = (-90 + i * 36) * (Math.PI / 180);
      const x = cx + ring * Math.cos(a);
      const y = cy + ring * Math.sin(a);
      el("circle", { cx: x, cy: y, r: holeR, class: "chamber" }, group);
      const p = el("circle", { cx: x, cy: y, r: pelletR, class: "chamber-pellet" }, group);
      pellets.push(p);
      if (numbers) {
        const t = el("text", {
          x: cx + numR * Math.cos(a),
          y: cy + numR * Math.sin(a),
          class: "chamber-num",
        }, group);
        t.textContent = i + 1;
      }
    }
    return pellets;
  }

  const loaderPellets = buildChambers($(".loader__chambers"), {
    cx: 100, cy: 100, ring: 56, holeR: 12, pelletR: 9,
  });

  const magPellets = buildChambers($(".drum__chambers"), {
    cx: 200, cy: 200, ring: 112, holeR: 25, pelletR: 19, numR: 150, numbers: true,
  });

  // knurled outer edge
  const knurl = $(".drum__knurl");
  for (let i = 0; i < 120; i++) {
    const a = (i * 3) * (Math.PI / 180);
    el("line", {
      x1: 200 + 172 * Math.cos(a), y1: 200 + 172 * Math.sin(a),
      x2: 200 + 186 * Math.cos(a), y2: 200 + 186 * Math.sin(a),
    }, knurl);
  }

  // indexing gear around the hub
  (function gear() {
    const teeth = 18, rIn = 44, rOut = 54;
    let d = "";
    for (let i = 0; i < teeth; i++) {
      const a0 = (i / teeth) * Math.PI * 2;
      const a1 = a0 + (Math.PI * 2) / teeth * 0.25;
      const a2 = a0 + (Math.PI * 2) / teeth * 0.5;
      const a3 = a0 + (Math.PI * 2) / teeth * 0.75;
      const pt = (r, a) => `${(200 + r * Math.cos(a)).toFixed(2)} ${(200 + r * Math.sin(a)).toFixed(2)}`;
      d += `${i ? "L" : "M"}${pt(rIn, a0)} L${pt(rOut, a1)} L${pt(rOut, a2)} L${pt(rIn, a3)} `;
    }
    el("path", { d: d + "Z" }, $(".drum__gear"));
  })();

  // mil dots on the reticle
  const dots = $(".reticle__dots");
  [40, 80, 120, 160].forEach((o) => {
    [[200 - o, 200], [200 + o, 200], [200, 200 - o], [200, 200 + o]].forEach(([x, y]) =>
      el("circle", { cx: x, cy: y, r: 3 }, dots));
  });

  /* ---------- Small UI ---------- */
  $$("[data-year]").forEach((n) => (n.textContent = new Date().getFullYear()));

  const nav = $("[data-nav]");
  const toggle = $(".nav__toggle");
  const menu = $("#mobile-menu");
  let lenis = null;

  function setMenu(open) {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menu.hidden = !open;
    document.body.style.overflow = open ? "hidden" : "";
    if (lenis) open ? lenis.stop() : lenis.start();
    if (open) nav.classList.remove("is-hidden");
  }
  toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !menu.hidden) setMenu(false); });

  // in-page anchors (smooth via Lenis when available)
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      const target = id === "#top" ? document.body : $(id);
      if (!target) return;
      if (!menu.hidden) setMenu(false);
      if (lenis) {
        e.preventDefault();
        lenis.scrollTo(id === "#top" ? 0 : target, { offset: 0, duration: 1.4 });
      }
    });
  });

  /* ---------- Target range ---------- */
  (function range() {
    const svg = $(".range__target");
    const holes = $(".holes", svg);
    const card = $(".range__card");
    const out = {
      shots: $("[data-shots]"), score: $("[data-score]"), last: $("[data-last]"),
    };
    let shots = 0, score = 0;

    function shoot(x, y) {
      if (shots >= 10) {
        holes.replaceChildren();
        shots = 0; score = 0;
      }
      const dist = Math.hypot(x, y);
      const pts = dist <= 100 ? Math.min(10, 10 - Math.floor(dist / 10)) : 0;
      shots++; score += pts;
      out.shots.textContent = shots;
      out.score.textContent = score;
      out.last.textContent = pts === 10 && dist <= 3 ? "10x" : pts;

      const ring = el("circle", { cx: x, cy: y, r: 3.4, class: "hole-ring" }, holes);
      const hole = el("circle", { cx: x, cy: y, r: 3.4, class: "hole" }, holes);

      if (hasGsap && !reduce) {
        gsap.fromTo(hole, { scale: 0, transformOrigin: "50% 50%" }, { scale: 1, duration: 0.25, ease: "back.out(3)" });
        gsap.fromTo(ring, { scale: 1, opacity: 1, transformOrigin: "50% 50%" },
          { scale: 5, opacity: 0, duration: 0.7, ease: "power2.out", onComplete: () => ring.remove() });
        // paper card swings on its clip from the impact
        const side = x === 0 ? 0 : x / Math.abs(x);
        gsap.fromTo(card, { rotation: side * -1.6, y: 3 }, { rotation: 0, y: 0, duration: 1.1, ease: "elastic.out(1, 0.35)" });
      } else {
        ring.remove();
      }
    }

    function toLocal(evt) {
      const pt = svg.createSVGPoint();
      pt.x = evt.clientX; pt.y = evt.clientY;
      return pt.matrixTransform(svg.getScreenCTM().inverse());
    }

    svg.addEventListener("pointerdown", (e) => {
      const p = toLocal(e);
      shoot(Math.max(-110, Math.min(110, p.x)), Math.max(-110, Math.min(110, p.y)));
    });

    // keyboard / no-pointer fallback: a realistic group around the centre
    $(".range__fire").addEventListener("click", () => {
      const g = () => (Math.random() + Math.random() + Math.random() - 1.5) * 24;
      shoot(g(), g());
    });
  })();

  /* ---------- Without GSAP or with reduced motion: show final states ---------- */
  function staticState() {
    document.body.classList.remove("is-loading");
    $(".loader")?.remove();
    $(".mag__num").textContent = "10";
    $$(".beat").forEach((b) => b.classList.add("is-active"));
    $$(".step").forEach((s) => s.classList.add("is-on"));
    const path = $("#arcPath");
    if (path) {
      const end = path.getPointAtLength(path.getTotalLength());
      $(".arc__pellet").setAttribute("transform", `translate(${end.x} ${end.y})`);
      $(".t-hole").setAttribute("r", 7);
      $(".t-hole").setAttribute("cx", -20);
      $(".t-hole").setAttribute("cy", -10);
    }
  }

  if (!hasGsap || reduce) {
    if (reduce) root.classList.add("reduced");
    staticState();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Smooth scroll ---------- */
  if (window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }

  /* ---------- Nav: solid after hero top, hides on scroll down ---------- */
  ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate(self) {
      const y = self.scroll();
      nav.classList.toggle("is-solid", y > 40);
      if (menu.hidden) nav.classList.toggle("is-hidden", self.direction === 1 && y > 500);
    },
  });

  /* ---------- Loader + hero intro ---------- */
  gsap.set(loaderPellets, { scale: 0, transformOrigin: "50% 50%" });
  gsap.set(".hero__title .line__inner", { yPercent: 110 });
  gsap.set("[data-reveal-hero]", { y: 24, opacity: 0 });
  gsap.set(".hero__media img", { scale: 1.18 });
  gsap.set(".hero__sheen", { xPercent: -120 });

  const count = $(".loader__num");
  const intro = gsap.timeline({ defaults: { ease: "power3.out" } });

  loaderPellets.forEach((p, i) => {
    intro
      .to(p, { scale: 1, duration: 0.09, ease: "back.out(3)" })
      .to(".loader__drum", {
        rotation: -(i + 1) * 36,
        duration: 0.11,
        ease: "power4.out",
        onStart: () => (count.textContent = String(i + 1).padStart(2, "0")),
      });
  });

  intro
    .to(".loader__core", { scale: 0.6, opacity: 0, duration: 0.45, ease: "power3.in" }, "+=0.15")
    // breech opens: the two halves split away
    .to(".loader__half--top", { yPercent: -100, duration: 0.9, ease: "expo.inOut" }, "-=0.05")
    .to(".loader__half--bottom", { yPercent: 100, duration: 0.9, ease: "expo.inOut" }, "<")
    .add(() => {
      document.body.classList.remove("is-loading");
      lenis?.start();
    }, "<0.4")
    .to(".hero__media img", { scale: 1, duration: 2.2, ease: "expo.out" }, "<")
    .to(".hero__title .line__inner", { yPercent: 0, duration: 1.1, stagger: 0.1, ease: "expo.out" }, "<0.25")
    // pellet tracer crosses the frame
    .fromTo(".tracer__pellet", { x: -30, opacity: 1 }, { x: () => window.innerWidth + 30, duration: 0.55, ease: "power1.in" }, "<0.15")
    .fromTo(".tracer__trail", { scaleX: 0, opacity: 1 }, { scaleX: 1, duration: 0.55, ease: "power1.in" }, "<")
    .to(".tracer__trail", { opacity: 0, duration: 0.6, ease: "power2.out" })
    .to(".hero__sheen", { xPercent: 120, duration: 1.4, ease: "power2.inOut" }, "<-0.2")
    .to("[data-reveal-hero]", { y: 0, opacity: 1, duration: 0.9, stagger: 0.08 }, "<-0.6")
    .add(() => $(".loader")?.remove());

  /* ---------- Hero scroll parallax ---------- */
  gsap.to(".hero__media img", {
    yPercent: 10, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
  });
  gsap.to(".hero__content", {
    y: -60, opacity: 0, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "40% top", end: "bottom top", scrub: true },
  });

  /* ---------- Generic heading reveals ---------- */
  $$(".armory .h2, .ammo .h2, .ammo .lede, .flight .h2, .faq .h2, .visit__info > *").forEach((n) => {
    gsap.from(n, {
      y: 40, opacity: 0, duration: 1, ease: "expo.out",
      scrollTrigger: { trigger: n, start: "top 88%", once: true },
    });
  });
  gsap.from(".faq details", {
    y: 24, opacity: 0, duration: 0.8, stagger: 0.07, ease: "expo.out",
    scrollTrigger: { trigger: ".faq__list", start: "top 85%", once: true },
  });

  const mm = gsap.matchMedia();

  /* ---------- Armory horizontal pan (desktop) ---------- */
  mm.add("(min-width: 900px)", () => {
    root.classList.add("js-pan");
    const track = $(".armory__track");
    const distance = () => track.scrollWidth - window.innerWidth;

    const pan = gsap.to(track, {
      x: () => -distance(),
      ease: "none",
      scrollTrigger: {
        trigger: ".armory__pin",
        start: "top top",
        end: () => "+=" + distance(),
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });
    gsap.to(".armory__progress span", {
      scaleX: 1, ease: "none",
      scrollTrigger: { trigger: ".armory__pin", start: "top top", end: () => "+=" + distance(), scrub: true, invalidateOnRefresh: true },
    });
    // panels slide in like rounds feeding into a rail
    gsap.from(".panel", {
      x: 160, opacity: 0, stagger: 0.08, duration: 1.1, ease: "expo.out",
      scrollTrigger: { trigger: ".armory", start: "top 70%", once: true },
    });
    return () => root.classList.remove("js-pan");
  });

  /* ---------- Magazine lab ---------- */
  mm.add("(min-width: 0px)", () => {
    gsap.set(magPellets, { scale: 0, opacity: 0, transformOrigin: "50% 50%" });
    const beats = $$(".beat");
    const num = $(".mag__num");
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: ".mag",
        start: "top top",
        end: "+=240%",
        pin: ".mag__pin",
        scrub: 0.6,
        onUpdate(self) {
          const p = self.progress;
          const idx = p < 0.34 ? 0 : p < 0.67 ? 1 : 2;
          beats.forEach((b, i) => b.classList.toggle("is-active", i === idx));
        },
      },
      // counter follows the scrubbed timeline, not the raw scroll position
      onUpdate() {
        const loaded = magPellets.filter((n) => Number(gsap.getProperty(n, "opacity")) > 0.6).length;
        num.textContent = String(loaded).padStart(2, "0");
      },
    });

    magPellets.forEach((p, i) => {
      // pellet presses into the chamber at the breech
      tl.fromTo(p, { scale: 1.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: "power2.in" });
      // spring indexes the drum one chamber
      tl.to(".drum__body", { rotation: -(i + 1) * 36, svgOrigin: "200 200", duration: 0.6, ease: "back.out(2.2)" });
      tl.to(".drum__gear", { rotation: (i + 1) * 54, svgOrigin: "200 200", duration: 0.6, ease: "back.out(2.2)" }, "<");
    });
    tl.to({}, { duration: 0.6 }); // short hold on the full drum

    gsap.fromTo(".mag__photo", { y: 80 }, {
      y: -40, ease: "none",
      scrollTrigger: { trigger: ".mag", start: "top top", end: "+=240%", scrub: true },
    });
  });

  /* ---------- Pellet bento ---------- */
  gsap.from(".bento__photo", {
    clipPath: "inset(0 0 100% 0)", duration: 1.4, ease: "expo.inOut",
    scrollTrigger: { trigger: ".bento", start: "top 80%", once: true },
  });
  gsap.from(".bento__photo img", {
    scale: 1.25, duration: 1.8, ease: "expo.out",
    scrollTrigger: { trigger: ".bento", start: "top 80%", once: true },
  });
  gsap.from(".ptype", {
    opacity: 0, y: 30, duration: 0.9, stagger: 0.1, ease: "expo.out",
    scrollTrigger: { trigger: ".bento", start: "top 70%", once: true },
  });
  gsap.from(".ptype__svg", {
    y: -160, rotation: -35, opacity: 0, duration: 1.1, stagger: 0.12, ease: "bounce.out",
    scrollTrigger: { trigger: ".bento", start: "top 65%", once: true },
  });
  // idle spin on hover: the pellet turns like it's leaving the rifling
  $$(".ptype").forEach((card) => {
    const svg = $(".ptype__svg", card);
    card.addEventListener("pointerenter", () =>
      gsap.fromTo(svg, { rotationY: 0 }, { rotationY: 360, duration: 0.9, ease: "power3.out" }));
  });

  /* ---------- Scope zoom ---------- */
  mm.add("(min-width: 0px)", () => {
    const view = $(".scope__view");
    const reticle = $(".reticle");
    const r0 = () => (reticle.getBoundingClientRect().width / 2) * 0.96;
    const rMax = () => Math.hypot(window.innerWidth, window.innerHeight) / 2 + 40;

    gsap.set(view, { "--r": r0() + "px" });
    view.style.clipPath = "circle(var(--r) at 50% 50%)";
    gsap.set(".scope__copy", { opacity: 0, y: 40 });

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: ".scope",
        start: "top top",
        end: "+=170%",
        pin: ".scope__pin",
        scrub: 0.8,
        invalidateOnRefresh: true,
      },
    });
    tl.to(".scope__view img", { scale: 1.12, duration: 0.25 })
      .fromTo(view, { "--r": () => r0() + "px" }, { "--r": () => rMax() + "px", duration: 0.55, ease: "power2.in" })
      .to(".scope__view img", { scale: 1, duration: 0.55, ease: "power2.in" }, "<")
      .to(reticle, { scale: () => rMax() / r0(), opacity: 0, duration: 0.55, ease: "power2.in" }, "<")
      .to(".scope__copy", { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" })
      .to({}, { duration: 0.15 });
  });

  /* ---------- Ballistic arc ---------- */
  (function flight() {
    const path = $("#arcPath");
    const pellet = $(".arc__pellet");
    const ripple = $(".t-ripple");
    const hole = $(".t-hole");
    const steps = $$(".step");
    const L = path.getTotalLength();
    let hit = false;

    gsap.set(path, { strokeDasharray: L, strokeDashoffset: L });
    gsap.set(hole, { attr: { cx: -20, cy: -10, r: 0 } });

    function place(p) {
      const len = Math.max(0.001, Math.min(1, p)) * L;
      const a = path.getPointAtLength(len);
      const b = path.getPointAtLength(Math.min(L, len + 1));
      const ang = Math.atan2(b.y - a.y, b.x - a.x) * (180 / Math.PI);
      pellet.setAttribute("transform", `translate(${a.x} ${a.y}) rotate(${ang})`);
      path.style.strokeDashoffset = L - len;
      steps.forEach((s, i) => s.classList.toggle("is-on", p >= [0.04, 0.42, 0.78][i]));

      if (p >= 0.995 && !hit) {
        hit = true;
        gsap.fromTo(hole, { attr: { r: 0 } }, { attr: { r: 7 }, duration: 0.25, ease: "back.out(3)" });
        gsap.fromTo(ripple, { attr: { r: 8 }, opacity: 1 }, { attr: { r: 110 }, opacity: 0, duration: 0.9, ease: "power2.out" });
        gsap.fromTo(".arc__target", { x: 0 }, { x: 6, duration: 0.08, yoyo: true, repeat: 3, ease: "power1.inOut" });
        gsap.to(pellet, { opacity: 0, duration: 0.15 });
      } else if (p < 0.99 && hit) {
        hit = false;
        gsap.to(hole, { attr: { r: 0 }, duration: 0.2 });
        gsap.to(pellet, { opacity: 1, duration: 0.15 });
      }
    }
    place(0);

    mm.add("(min-width: 761px)", () => {
      ScrollTrigger.create({
        trigger: ".flight__pin", start: "top top", end: "+=140%", pin: true, scrub: 0.6,
        onUpdate: (self) => place(self.progress),
      });
    });
    mm.add("(max-width: 760px)", () => {
      ScrollTrigger.create({
        trigger: ".flight__stage", start: "top 75%", end: "bottom 25%", scrub: 0.6,
        onUpdate: (self) => place(self.progress),
      });
    });
  })();

  // pins were created in mixed order; sort by page position so spacing is right
  ScrollTrigger.sort();

  // fonts and images change layout; recompute pin distances when they settle
  window.addEventListener("load", () => ScrollTrigger.refresh());
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
})();
