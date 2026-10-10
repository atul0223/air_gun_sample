/**
 * MEERUT AIRGUN V2 - Cinematic Scroll Engine
 * GSAP ScrollTrigger driven. No window.scroll listeners.
 * No custom cursors. No noise on scroll containers.
 */

(function () {
  'use strict';

  gsap.registerPlugin(ScrollTrigger);

  // ── 1. NAV SCROLL BEHAVIOR ──
  function initNav() {
    const nav = document.getElementById('mainNav');
    if (!nav) return;

    ScrollTrigger.create({
      start: 'top -80',
      onUpdate: (self) => {
        if (self.direction === 1) {
          nav.classList.add('nav-scrolled');
        }
        if (self.scroll() < 80) {
          nav.classList.remove('nav-scrolled');
        }
      }
    });

    // Mobile menu
    const burger = document.getElementById('navBurger');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileLinks = mobileMenu ? mobileMenu.querySelectorAll('a') : [];

    if (burger && mobileMenu) {
      burger.addEventListener('click', () => {
        const isOpen = mobileMenu.classList.contains('open');
        if (isOpen) {
          mobileMenu.classList.remove('open');
          burger.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        } else {
          mobileMenu.classList.add('open');
          burger.setAttribute('aria-expanded', 'true');
          document.body.style.overflow = 'hidden';
        }
      });

      mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
          mobileMenu.classList.remove('open');
          burger.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        });
      });
    }
  }

  // ── 2. HERO ENTRANCE ANIMATION ──
  function initHeroAnimation() {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.from('.hero-overline', { y: 20, opacity: 0, duration: 0.6 }, 0.2)
      .from('.hero-heading span', {
        y: 80,
        opacity: 0,
        duration: 1,
        stagger: 0.12,
        ease: 'power4.out'
      }, 0.3)
      .from('.hero-body', { y: 30, opacity: 0, duration: 0.7 }, 0.8)
      .from('.hero-cta-group > *', { y: 20, opacity: 0, stagger: 0.1, duration: 0.5 }, 1)
      .from('.hero-image-wrap', {
        scale: 0.92,
        opacity: 0,
        duration: 1.2,
        ease: 'power2.out'
      }, 0.5)
      .from('.hero-stat', {
        y: 20,
        opacity: 0,
        stagger: 0.08,
        duration: 0.5
      }, 1.2);
  }

  // ── 3. SCROLL-REVEAL SYSTEM ──
  function initScrollReveals() {
    const reveals = document.querySelectorAll('[data-reveal]');
    reveals.forEach(el => {
      const direction = el.getAttribute('data-reveal') || 'up';
      const delay = parseFloat(el.getAttribute('data-reveal-delay') || '0');
      let fromVars = { opacity: 0, duration: 0.8, ease: 'power3.out' };

      switch (direction) {
        case 'up': fromVars.y = 50; break;
        case 'down': fromVars.y = -50; break;
        case 'left': fromVars.x = 60; break;
        case 'right': fromVars.x = -60; break;
        case 'scale': fromVars.scale = 0.9; break;
        case 'fade': break;
      }

      if (delay) fromVars.delay = delay;

      gsap.from(el, {
        ...fromVars,
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true
        }
      });
    });
  }

  // ── 4. HORIZONTAL SCROLL PRODUCT GALLERY ──
  function initHorizontalScroll() {
    const wrap = document.getElementById('horizontalWrap');
    const track = document.getElementById('horizontalTrack');
    if (!wrap || !track) return;

    let mm = gsap.matchMedia();
    mm.add("(min-width: 769px)", () => {
      const getDistance = () => track.scrollWidth - window.innerWidth;
      
      gsap.to(track, {
        x: () => -getDistance(),
        ease: 'none',
        scrollTrigger: {
          trigger: wrap,
          start: 'top top',
          end: () => '+=' + getDistance(),
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          anticipatePin: 1
        }
      });
    });
  }

  // ── 5. PARALLAX IMAGE SECTIONS ──
  function initParallax() {
    let mm = gsap.matchMedia();
    mm.add("(min-width: 769px)", () => {
      document.querySelectorAll('[data-parallax]').forEach(img => {
        const speed = parseFloat(img.getAttribute('data-parallax') || '0.2');
        gsap.to(img, {
          yPercent: speed * 100,
          ease: 'none',
          scrollTrigger: {
            trigger: img.closest('section') || img.parentElement,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
          }
        });
      });
    });
  }

  // ── 6. TEXT SCRUB REVEAL (word-by-word opacity) ──
  function initTextScrub() {
    const scrubBlocks = document.querySelectorAll('[data-text-scrub]');
    scrubBlocks.forEach(block => {
      const text = block.textContent.trim();
      const words = text.split(/\s+/);
      block.innerHTML = '';
      words.forEach((word, i) => {
        const span = document.createElement('span');
        span.textContent = word + ' ';
        span.style.opacity = '0.15';
        span.style.display = 'inline';
        span.style.transition = 'opacity 0.1s';
        span.classList.add('scrub-word');
        block.appendChild(span);
      });

      const wordEls = block.querySelectorAll('.scrub-word');
      gsap.to(wordEls, {
        opacity: 1,
        stagger: 0.05,
        ease: 'none',
        scrollTrigger: {
          trigger: block,
          start: 'top 75%',
          end: 'bottom 40%',
          scrub: true
        }
      });
    });
  }

  // ── 7. COUNTER ANIMATIONS ──
  function initCounters() {
    document.querySelectorAll('[data-count-to]').forEach(el => {
      const target = parseInt(el.getAttribute('data-count-to'));
      const suffix = el.getAttribute('data-count-suffix') || '';
      const prefix = el.getAttribute('data-count-prefix') || '';

      ScrollTrigger.create({
        trigger: el,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          gsap.to({ val: 0 }, {
            val: target,
            duration: 1.5,
            ease: 'power2.out',
            onUpdate: function () {
              el.textContent = prefix + Math.round(this.targets()[0].val).toLocaleString() + suffix;
            }
          });
        }
      });
    });
  }

  // ── 8. MARQUEE SPEED CONTROL ──
  function initMarquee() {
    const marquees = document.querySelectorAll('.marquee-track');
    marquees.forEach(track => {
      let speed = 1;
      ScrollTrigger.create({
        trigger: track.closest('section'),
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
          speed = 1 + Math.abs(self.getVelocity()) / 3000;
          track.style.animationDuration = (40 / speed) + 's';
        }
      });
    });
  }

  // ── 9. PRODUCT CARD TILT (lightweight, no useState) ──
  function initCardTilt() {
    let mm = gsap.matchMedia();
    mm.add("(min-width: 769px)", () => {
      document.querySelectorAll('[data-tilt]').forEach(card => {
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width - 0.5;
          const y = (e.clientY - rect.top) / rect.height - 0.5;
          gsap.to(card, {
            rotateY: x * 8,
            rotateX: -y * 8,
            duration: 0.4,
            ease: 'power2.out',
            transformPerspective: 800
          });
        });

        card.addEventListener('mouseleave', () => {
          gsap.to(card, {
            rotateY: 0,
            rotateX: 0,
            duration: 0.6,
          ease: 'power3.out'
        });
      });
    });
  }

  // ── 10. ACCORDION FAQ ──
  function initAccordion() {
    document.querySelectorAll('[data-accordion-trigger]').forEach(trigger => {
      trigger.addEventListener('click', () => {
        const parent = trigger.closest('[data-accordion-item]');
        const content = parent.querySelector('[data-accordion-content]');
        const icon = trigger.querySelector('[data-accordion-icon]');
        const isOpen = parent.classList.contains('open');

        // Close all
        document.querySelectorAll('[data-accordion-item].open').forEach(item => {
          item.classList.remove('open');
          item.querySelector('[data-accordion-content]').style.maxHeight = '0px';
          const ic = item.querySelector('[data-accordion-icon]');
          if (ic) ic.style.transform = 'rotate(0deg)';
        });

        if (!isOpen) {
          parent.classList.add('open');
          content.style.maxHeight = content.scrollHeight + 'px';
          if (icon) icon.style.transform = 'rotate(45deg)';
        }
      });
    });
  }

  // ── 11. WHATSAPP INQUIRY GENERATOR ──
  function initWhatsApp() {
    document.querySelectorAll('[data-wa]').forEach(btn => {
      btn.addEventListener('click', () => {
        const model = btn.getAttribute('data-wa');
        const phone = '918439543244';
        const msg = encodeURIComponent(
          'Hi Meerut Airgun, I saw the ' + model + ' on your website and would like to know the price, availability, and delivery details.'
        );
        window.open('https://wa.me/' + phone + '?text=' + msg, '_blank');
      });
    });
  }

  // ── 12. IMAGE SCALE ON SCROLL ──
  function initImageScale() {
    document.querySelectorAll('[data-scale-scroll]').forEach(img => {
      gsap.from(img, {
        scale: 1.15,
        ease: 'none',
        scrollTrigger: {
          trigger: img.closest('section') || img.parentElement,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });
    });
  }

  // ── 13. SPLIT PINNED SECTION (left text pinned, right scrolls) ──
  function initSplitPin() {
    let mm = gsap.matchMedia();
    mm.add("(min-width: 769px)", () => {
      const section = document.getElementById('splitPinSection');
      if (!section) return;

      const left = section.querySelector('.split-pin-left');
      const rightItems = section.querySelectorAll('.split-pin-card');

      if (!left || rightItems.length === 0) return;

      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        pin: left,
        pinSpacing: false
      });

      rightItems.forEach((card, i) => {
        gsap.from(card, {
          y: 60,
          opacity: 0,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 80%',
            once: true
          }
        });
      });
    });
  }

  // ── BOOT ──
  document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initHeroAnimation();
    initScrollReveals();
    initHorizontalScroll();
    initParallax();
    initTextScrub();
    initCounters();
    initMarquee();
    initCardTilt();
    initAccordion();
    initWhatsApp();
    initImageScale();
    initSplitPin();
  });

})();
