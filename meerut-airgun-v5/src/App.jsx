import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useMotionTemplate, AnimatePresence } from 'motion/react';
import { Sun, Moon, Crosshair, MapPin, Target } from '@phosphor-icons/react';
import { ReactLenis } from 'lenis/react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <ReactLenis root options={{ lerp: 0.05, duration: 1.2, smoothTouch: true }}>
      <div className="relative min-h-screen">
        <Navbar isDark={isDark} toggleDark={() => setIsDark(!isDark)} />
        
        <main>
          <Hero />
          {/* Out of the box sections */}
          <ScopeReveal />
          <HorizontalArmory />
          <MagazineLab />
          <Ballistics />
        </main>

        <Footer />
      </div>
    </ReactLenis>
  );
}

function Navbar({ isDark, toggleDark }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "fixed top-0 left-0 w-full z-50 px-8 py-6 flex items-center justify-between transition-all duration-500 mix-blend-difference text-white",
        scrolled ? "py-4" : "py-6"
      )}
    >
      <div className="font-bold text-xl flex items-center gap-2 uppercase tracking-tight">
        <Crosshair weight="bold" className="text-accent" />
        <span>Meerut Airgun</span>
      </div>

      <div className="flex items-center gap-8">
        <button 
          onClick={toggleDark}
          className="relative flex items-center justify-center w-14 h-7 rounded-full bg-white/10 border border-white/20 p-1 cursor-pointer hover:bg-white/20 transition-colors"
          aria-label="Toggle Theme"
        >
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="w-5 h-5 rounded-full bg-white flex items-center justify-center absolute shadow-sm"
            style={{ left: isDark ? "4px" : "calc(100% - 24px)" }}
          >
            {isDark ? <Moon size={12} weight="fill" className="text-black" /> : <Sun size={12} weight="fill" className="text-black" />}
          </motion.div>
        </button>
      </div>
    </motion.header>
  );
}

function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const yText = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const yImage = useTransform(scrollYProgress, [0, 1], [0, 50]);
  const scaleImage = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  return (
    <section ref={ref} className="relative h-[100dvh] flex items-center justify-center overflow-hidden bg-background">
      <motion.div 
        style={{ scale: scaleImage, y: yImage }}
        className="absolute inset-0 z-0 opacity-80 dark:opacity-60"
      >
        <img 
          src="/assets/hero-airgun.jpg" 
          alt="PCP Air Rifle"
          className="w-full h-full object-cover origin-center"
        />
        <div className="absolute inset-0 bg-background/30 dark:bg-background/50 mix-blend-multiply" />
      </motion.div>

      <motion.div 
        style={{ y: yText }}
        className="relative z-10 w-full px-8 flex flex-col items-center text-center mt-20"
      >
        <div className="overflow-hidden">
          <motion.h1 
            initial={{ y: 150 }}
            animate={{ y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="text-[14vw] md:text-[11vw] leading-[0.8] font-black tracking-tighter uppercase text-foreground mix-blend-difference"
          >
            Absolute
          </motion.h1>
        </div>
        <div className="overflow-hidden">
          <motion.h1 
            initial={{ y: 150 }}
            animate={{ y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="text-[14vw] md:text-[11vw] leading-[0.8] font-black tracking-tighter uppercase text-accent mix-blend-difference"
          >
            Precision.
          </motion.h1>
        </div>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-8 font-mono text-sm md:text-base max-w-md text-foreground mix-blend-difference"
        >
          High-pressure pneumatics, optics, and match-grade ammunition. Shipped across India from Meerut.
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ x: "-10vw", opacity: 0 }}
        animate={{ x: "110vw", opacity: [0, 1, 1, 0] }}
        transition={{ duration: 1.5, ease: "linear", delay: 1, repeat: Infinity, repeatDelay: 5 }}
        className="absolute top-1/2 left-0 w-32 h-[1px] bg-gradient-to-r from-transparent via-accent to-white z-20 shadow-[0_0_10px_#e8540c]"
      />
    </section>
  );
}

function ScopeReveal() {
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);
  const maskImage = useMotionTemplate`radial-gradient(circle 200px at ${mouseX}px ${mouseY}px, black 80%, transparent 100%)`;

  const handleMouseMove = ({ clientX, clientY, currentTarget }) => {
    const rect = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - rect.left);
    mouseY.set(clientY - rect.top);
  };

  const handleMouseLeave = () => {
    mouseX.set(-1000);
    mouseY.set(-1000);
  };

  return (
    <section 
      className="relative h-[100dvh] bg-[#0c0c0d] overflow-hidden cursor-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Base Layer (Unrevealed) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-900 pointer-events-none">
        <h2 className="text-[8vw] leading-none font-black uppercase tracking-tighter text-center">
          Find Your <br/> Target
        </h2>
        <div className="font-mono text-sm mt-8 uppercase tracking-widest text-zinc-800 border border-zinc-900 px-6 py-2">
          Sweep sector to illuminate
        </div>
      </div>

      {/* Revealed Layer */}
      <motion.div 
        className="absolute inset-0 z-10 pointer-events-none bg-surface"
        style={{ WebkitMaskImage: maskImage }}
      >
        <img 
          src="/assets/scope-detail.jpg" 
          alt="Scope View" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-80"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <h2 className="text-[8vw] leading-none font-black uppercase tracking-tighter text-center text-accent mix-blend-color-burn drop-shadow-lg">
            Find Your <br/> Target
          </h2>
        </div>
      </motion.div>

      {/* Cursor Crosshair */}
      <motion.div 
        className="absolute pointer-events-none z-20 flex items-center justify-center text-accent mix-blend-difference"
        style={{ x: useTransform(mouseX, x => x - 32), y: useTransform(mouseY, y => y - 32) }}
      >
        <Crosshair size={64} weight="thin" />
      </motion.div>
    </section>
  );
}

function HorizontalArmory() {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: targetRef });
  
  // 4 items = 400vw width. To scroll to the last item (which is at 300vw), we translate by -75%
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-75%"]);

  const items = [
    { title: "Pneumatics", desc: "Regulated high-pressure PCP platforms. Zero recoil, infinite precision.", img: "/assets/hero-airgun.jpg", num: "01" },
    { title: "Sidearms", desc: "CO2 powered blowback action. Weight and feel of the real steel.", img: "/assets/tactical-pistol.jpg", num: "02" },
    { title: "Match Ammo", desc: "Domed and Wadcutter. Hand-sorted for aerodynamic perfection.", img: "/assets/ammo-pellets.jpg", num: "03" },
    { title: "Rotary Mags", desc: "Alloy machined auto-indexing drums. Flawless cycling.", img: "/assets/rotary-mag.jpg", num: "04" }
  ];

  return (
    <section ref={targetRef} className="relative h-[400vh] bg-background">
      <div className="sticky top-0 h-[100vh] flex items-center overflow-hidden">
        <motion.div style={{ x }} className="flex w-[400vw]">
          {items.map((item, i) => (
             <div key={i} className="w-[100vw] h-screen flex flex-col md:flex-row items-center justify-center p-8 md:p-24 gap-12 md:gap-24">
                <div className="flex-1 w-full flex flex-col justify-center">
                   <div className="overflow-hidden">
                     <span className="text-accent font-mono text-xl md:text-2xl tracking-widest">{item.num} / 04</span>
                   </div>
                   <h2 className="text-6xl md:text-[8vw] font-black uppercase tracking-tighter leading-none mt-4 mb-6">{item.title}</h2>
                   <p className="font-mono text-lg md:text-xl text-muted max-w-md">{item.desc}</p>
                   <button className="mt-8 self-start px-8 py-4 bg-foreground text-background uppercase font-bold tracking-wider hover:bg-accent hover:text-white transition-colors">
                     View Spec
                   </button>
                </div>
                <div className="flex-1 w-full h-[40vh] md:h-[70vh] relative group">
                   <div className="absolute inset-0 bg-accent/20 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay" />
                   <img src={item.img} className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700" />
                </div>
             </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function MagazineLab() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  // Rotate based on scroll
  const rotateDrum = useTransform(scrollYProgress, [0, 1], [0, 720]);

  return (
    <section ref={sectionRef} className="relative py-48 bg-surface overflow-hidden border-y border-border">
      <div className="max-w-[1600px] mx-auto px-8 relative z-10 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter mb-8 leading-[0.9]">
            Continuous <br/> <span className="text-accent">Cycle.</span>
          </h2>
          <p className="text-xl md:text-2xl font-mono text-muted max-w-lg mb-12">
            A masterclass in mechanical indexing. A single rotation handles 10 rounds flawlessly.
          </p>
          <div className="space-y-8 border-l-2 border-border pl-8">
            <div>
              <h3 className="text-2xl font-bold uppercase tracking-tight mb-2">01. Load</h3>
              <p className="font-mono text-sm text-muted">Pellets seat skirt-first.</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold uppercase tracking-tight mb-2">02. Index</h3>
              <p className="font-mono text-sm text-muted">Spring tension rotates the drum.</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold uppercase tracking-tight mb-2">03. Fire</h3>
              <p className="font-mono text-sm text-muted">Bolt seats the pellet into the breech.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Massive SVG Drum in the background, rotating on scroll */}
      <motion.div 
        className="absolute top-1/2 -translate-y-1/2 -right-1/4 w-[80vw] h-[80vw] max-w-[1200px] max-h-[1200px] opacity-10 pointer-events-none"
        style={{ rotate: rotateDrum }}
      >
        <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-2xl">
          <circle cx="200" cy="200" r="190" fill="transparent" stroke="var(--color-foreground)" strokeWidth="4" />
          <circle cx="200" cy="200" r="160" fill="var(--color-foreground)" />
          {[...Array(10)].map((_, i) => {
            const angle = (i * 36) * (Math.PI / 180);
            const cx = 200 + 110 * Math.cos(angle);
            const cy = 200 + 110 * Math.sin(angle);
            return (
              <circle key={i} cx={cx} cy={cy} r="32" fill="var(--color-surface)" stroke="var(--color-foreground)" strokeWidth="4" />
            );
          })}
          <circle cx="200" cy="200" r="40" fill="var(--color-surface)" stroke="var(--color-foreground)" strokeWidth="4" />
        </svg>
      </motion.div>
    </section>
  );
}

function Ballistics() {
  const [holes, setHoles] = useState([]);
  const [score, setScore] = useState(0);

  const handleShoot = (e) => {
    if (holes.length >= 10) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const distance = Math.sqrt(Math.pow(x - cx, 2) + Math.pow(y - cy, 2));
    const maxDist = rect.width / 2;
    
    let pts = 0;
    if (distance < maxDist * 0.1) pts = 10;
    else if (distance < maxDist * 0.3) pts = 8;
    else if (distance < maxDist * 0.6) pts = 5;
    else if (distance < maxDist * 0.9) pts = 2;
    else pts = 0;

    setScore(prev => prev + pts);
    setHoles([...holes, { x, y }]);
  };

  return (
    <section id="range" className="py-32 px-8 bg-background relative overflow-hidden">
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-16 items-center">
        
        {/* HUD Data Left */}
        <div className="md:col-span-4 flex flex-col items-start">
          <Target size={64} className="text-accent mb-8" />
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-4">Prove<br/>Your Zero</h2>
          <p className="font-mono text-muted mb-12">10 Rounds. Click the target to verify accuracy.</p>
          
          <div className="bg-surface border border-border p-8 w-full">
            <div className="font-mono text-sm uppercase tracking-widest text-muted mb-2">Live Telemetry</div>
            <div className="text-6xl font-black font-mono tabular-nums mb-4">{score} <span className="text-2xl text-muted">PTS</span></div>
            <div className="font-mono text-lg mb-8 border-t border-border pt-4">Capacity: <span className="text-accent">{10 - holes.length}</span></div>
            
            <button 
              onClick={() => { setHoles([]); setScore(0); }}
              className="w-full py-4 bg-foreground text-background font-bold uppercase tracking-wider text-sm hover:bg-accent hover:text-white transition-colors"
            >
              Reset Target
            </button>
          </div>
        </div>

        {/* Interactive Target Right */}
        <div className="md:col-span-8 flex justify-center">
          <div 
            onClick={handleShoot}
            className="relative w-[300px] h-[300px] md:w-[600px] md:h-[600px] cursor-crosshair bg-surface border border-border"
          >
            {/* Target Paper UI (Brutalist style) */}
            <div className="absolute inset-0 m-4 border border-foreground/20 rounded-full flex items-center justify-center">
              <div className="w-[80%] h-[80%] border border-foreground/30 rounded-full flex items-center justify-center bg-foreground/5">
                <div className="w-[60%] h-[60%] border border-foreground/40 rounded-full flex items-center justify-center bg-foreground/10">
                  <div className="w-[40%] h-[40%] border border-foreground/50 rounded-full flex items-center justify-center bg-foreground/20">
                    <div className="w-[15%] h-[15%] bg-accent rounded-full shadow-[0_0_15px_#e8540c]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Grid Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

            {/* Bullet Holes */}
            <AnimatePresence>
              {holes.map((hole, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute w-4 h-4 bg-zinc-950 rounded-full shadow-[inset_0_0_3px_rgba(255,255,255,0.2)] -ml-2 -mt-2 z-10"
                  style={{ left: hole.x, top: hole.y }}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-12 px-8 bg-foreground text-background border-t border-border">
      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-2 font-bold uppercase tracking-tighter">
          <Crosshair weight="bold" className="text-accent" />
          <span>Meerut Airgun</span>
        </div>
        <div className="flex gap-6 font-mono text-sm text-background/60">
          <span className="flex items-center gap-2"><MapPin /> Ganganagar, UP</span>
          <span>WhatsApp: +91 84395 43244</span>
        </div>
      </div>
    </footer>
  );
}
