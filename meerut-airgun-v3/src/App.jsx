import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { Sun, Moon, ArrowRight, Crosshair, Target, ShieldCheck } from '@phosphor-icons/react';
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
    <div className="relative min-h-screen selection:bg-accent selection:text-white">
      <Navbar isDark={isDark} toggleDark={() => setIsDark(!isDark)} />
      
      <main>
        <Hero />
        <Manifesto />
        <BentoArsenal />
        <Specs />
      </main>

      <Footer />
    </div>
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
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "fixed top-0 left-0 w-full z-50 px-6 py-4 flex items-center justify-between transition-all duration-500",
        scrolled ? "bg-background/80 backdrop-blur-md border-b border-border py-4" : "bg-transparent py-6"
      )}
    >
      <div className="font-bold text-xl md:text-2xl tracking-tight flex items-center gap-2">
        <Crosshair weight="bold" className="text-accent" />
        <span className="tracking-tighter">MEERUT AIRGUN</span>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <a href="#arsenal" className="hover:text-accent transition-colors">Arsenal</a>
          <a href="#specs" className="hover:text-accent transition-colors">Specs</a>
          <a href="#contact" className="hover:text-accent transition-colors">Contact</a>
        </div>
        
        <button 
          onClick={toggleDark}
          className="relative flex items-center justify-center w-12 h-6 rounded-full bg-surface border border-border p-1 cursor-pointer hover:border-muted transition-colors"
          aria-label="Toggle Theme"
        >
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="w-4 h-4 rounded-full bg-foreground flex items-center justify-center absolute shadow-sm"
            style={{ left: isDark ? "4px" : "calc(100% - 20px)" }}
          >
            {isDark ? <Moon size={10} weight="fill" className="text-background" /> : <Sun size={10} weight="fill" className="text-background" />}
          </motion.div>
        </button>
      </div>
    </motion.nav>
  );
}

function Hero() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const scaleImage = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={containerRef} className="relative h-[100dvh] flex items-end md:items-center overflow-hidden pt-24 pb-12">
      {/* Background Image Parallax */}
      <motion.div 
        style={{ scale: scaleImage, y: y1 }}
        className="absolute inset-0 z-0 origin-bottom"
      >
        <img 
          src="/assets/range-lifestyle.jpg" 
          alt="Precision Airgun Range"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent dark:from-background dark:via-background/80" />
      </motion.div>

      {/* Content */}
      <motion.div 
        style={{ opacity }}
        className="container mx-auto px-6 relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 w-full"
      >
        <div className="md:col-span-8 flex flex-col justify-end">
          <div className="overflow-hidden mb-4">
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="font-mono text-sm tracking-widest uppercase text-accent"
            >
              Master The Distance
            </motion.p>
          </div>
          
          <h1 className="text-[12vw] md:text-[8vw] leading-[0.85] font-black uppercase tracking-tighter mb-8">
            <motion.span 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="block"
            >
              Ballistic
            </motion.span>
            <motion.span 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="block text-accent"
            >
              Precision
            </motion.span>
          </h1>
          
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-6"
          >
            <button className="group flex items-center gap-3 bg-foreground text-background px-8 py-4 rounded-full font-bold hover:scale-95 transition-transform duration-300">
              Explore Collection
              <ArrowRight weight="bold" className="group-hover:translate-x-1 transition-transform" />
            </button>
            <div className="font-mono text-xs text-muted max-w-[200px]">
              Authorized dealer for premium PCP, CO2, and Match Grade hardware.
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

function Manifesto() {
  return (
    <section className="py-32 md:py-48 px-6 bg-background relative z-10">
      <div className="container mx-auto max-w-4xl text-center">
        <motion.h2 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-3xl md:text-5xl lg:text-6xl font-medium leading-tight tracking-tight text-balance"
        >
          We believe in absolute accuracy. Every rifle we stock is rigorously tested. No compromises. Just <span className="text-accent italic font-bold">cold, repeatable precision</span> at fifty meters.
        </motion.h2>
      </div>
    </section>
  );
}

function BentoArsenal() {
  return (
    <section id="arsenal" className="py-24 px-4 md:px-8 max-w-[1600px] mx-auto bg-background">
      <div className="mb-16 md:mb-24 px-4">
        <h2 className="text-4xl md:text-6xl font-bold tracking-tighter uppercase mb-4">The Arsenal</h2>
        <p className="text-muted max-w-xl">Curated hardware for the discerning marksman. Precision-machined, competition-ready.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 auto-rows-[400px]">
        {/* Large Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="md:col-span-8 bg-surface rounded-3xl overflow-hidden relative group"
        >
          <img src="/assets/hero-airgun.jpg" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="PCP Rifle" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
            <div className="flex justify-between items-end">
              <div>
                <p className="font-mono text-accent text-sm mb-2 uppercase tracking-widest">Pre-Charged Pneumatic</p>
                <h3 className="text-3xl font-bold text-white">Tactical PCP Platform</h3>
              </div>
              <button className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:bg-accent hover:text-white transition-colors group-active:scale-90">
                <ArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Small Card 1 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="md:col-span-4 bg-surface rounded-3xl overflow-hidden relative group"
        >
          <img src="/assets/scope-detail.jpg" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Optics" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-8">
            <h3 className="text-2xl font-bold text-white">Mil-Dot Optics</h3>
            <p className="text-gray-300 font-mono text-sm mt-2">First Focal Plane</p>
          </div>
        </motion.div>

        {/* Small Card 2 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="md:col-span-5 bg-surface rounded-3xl overflow-hidden relative group"
        >
          <img src="/assets/tactical-pistol.jpg" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Pistol" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-8">
            <h3 className="text-2xl font-bold text-white">CO2 Sidearms</h3>
            <p className="text-gray-300 font-mono text-sm mt-2">Blowback Action</p>
          </div>
        </motion.div>

        {/* Info Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="md:col-span-7 bg-foreground text-background rounded-3xl p-8 md:p-12 flex flex-col justify-between"
        >
          <div>
            <Target size={48} className="text-accent mb-6" />
            <h3 className="text-3xl md:text-4xl font-bold mb-4">Aerodynamic Perfection</h3>
            <p className="text-background/70 text-lg max-w-md">
              We stock competition-grade domed and hollow-point ammunition. Hand-sorted for weight consistency to ensure your group sizes stay impossibly tight.
            </p>
          </div>
          <div className="font-mono text-sm border-t border-background/20 pt-4 mt-8 flex justify-between">
            <span>.177 Caliber</span>
            <span>.22 Caliber</span>
            <span>Slugs</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Specs() {
  const specs = [
    { label: "Muzzle Velocity", val: "950 FPS" },
    { label: "Power Plant", val: "PCP / CO2" },
    { label: "Action", val: "Sidelever / Bolt" },
    { label: "Capacity", val: "10-18 Rounds" }
  ];

  return (
    <section id="specs" className="py-24 px-6 bg-background border-t border-border">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter mb-8">Engineering<br/>Tolerances</h2>
            <div className="space-y-6">
              {specs.map((s, i) => (
                <div key={i} className="flex justify-between items-end border-b border-border pb-4">
                  <span className="text-lg font-medium">{s.label}</span>
                  <span className="font-mono text-accent text-xl">{s.val}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative aspect-square md:aspect-auto md:h-[600px] rounded-3xl overflow-hidden bg-surface">
            <img src="/assets/rotary-mag.jpg" alt="Rotary Mag" className="w-full h-full object-cover" />
            <div className="absolute inset-0 ring-1 ring-inset ring-border rounded-3xl pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer id="contact" className="bg-foreground text-background py-20 px-6">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="md:col-span-2">
          <h3 className="text-2xl font-bold tracking-tighter mb-4">MEERUT AIRGUN</h3>
          <p className="text-background/60 max-w-sm mb-8">
            Premium air rifles, optics, and match-grade ammunition. Precision hardware for serious marksmen.
          </p>
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full border border-background/20 flex items-center justify-center hover:bg-background hover:text-foreground transition-colors cursor-pointer">
              <span className="font-bold">Ig</span>
            </div>
            <div className="w-10 h-10 rounded-full border border-background/20 flex items-center justify-center hover:bg-background hover:text-foreground transition-colors cursor-pointer">
              <span className="font-bold">Wa</span>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="font-mono uppercase tracking-widest text-sm mb-6 text-background/50">Location</h4>
          <address className="not-italic text-background/80 space-y-2">
            <p>Ganganagar</p>
            <p>Near IIMT University</p>
            <p>Meerut, UP, India</p>
          </address>
        </div>

        <div>
          <h4 className="font-mono uppercase tracking-widest text-sm mb-6 text-background/50">Contact</h4>
          <div className="text-background/80 space-y-2">
            <p>+91 84395 43244</p>
            <p>+91 92864 53001</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
