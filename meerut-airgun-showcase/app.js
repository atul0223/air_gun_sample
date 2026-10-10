/**
 * MEERUT AIRGUN - High-End Ballistics & Showcase Engine
 * Precision interactive mechanics, procedural audio synthesis,
 * rotary magazine simulation, and real-time ballistics canvas.
 */

// --- 1. PROCEDURAL WEB AUDIO SYNTHESIZER ---
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.initAudioContext();
  }

  initAudioContext() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Metallic bolt cocking / slide rack
  playBoltRack() {
    if (!this.enabled || !this.ctx) return;
    this.resume();
    const now = this.ctx.currentTime;

    // Stage 1: Initial metallic catch
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(620, now);
    osc1.frequency.exponentialRampToValueAtTime(180, now + 0.08);
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.08);

    // Stage 2: Heavy bolt lock (0.12s later)
    setTimeout(() => {
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(320, t);
      osc2.frequency.exponentialRampToValueAtTime(90, t + 0.12);
      gain2.gain.setValueAtTime(0.4, t);
      gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(t);
      osc2.stop(t + 0.12);
    }, 120);
  }

  // Rotary Magazine Ratchet click
  playMagRotate() {
    if (!this.enabled || !this.ctx) return;
    this.resume();
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(450, now + 0.04);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  // Seating .177 pellet into chamber
  playPelletSeat() {
    if (!this.enabled || !this.ctx) return;
    this.resume();
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.06);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  // Match Trigger Snap
  playTriggerClick() {
    if (!this.enabled || !this.ctx) return;
    this.resume();
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'highpass';
    osc.frequency.setValueAtTime(2400, now);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.03);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.03);
  }

  // High-Pressure Pneumatic Air Discharge (Puff + Thump)
  playPneumaticShot() {
    if (!this.enabled || !this.ctx) return;
    this.resume();
    const now = this.ctx.currentTime;

    // White noise blast (shrouded moderator hiss)
    const bufferSize = this.ctx.sampleRate * 0.18;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    // Filter to simulate sound suppressor
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(700, now);
    filter.Q.setValueAtTime(1.5, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.6, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noise.start(now);

    // Deep sub-thump for the valve release
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(130, now);
    subOsc.frequency.exponentialRampToValueAtTime(35, now + 0.15);
    subGain.gain.setValueAtTime(0.7, now);
    subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    subOsc.connect(subGain);
    subGain.connect(this.ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 0.15);
  }
}

const sounds = new SoundEngine();

// --- 2. ROTARY MAGAZINE & CHAMBER SIMULATOR ---
const MagSimulator = {
  totalCapacity: 10,
  slots: [true, true, true, false, true, true, false, false, true, true], // 10 slots
  currentIndex: 0,
  chamberLoaded: false,
  chamberPelletType: null,
  shotsFired: 0,

  init() {
    this.renderWheel();
    this.updateStatus();
    this.bindEvents();
  },

  renderWheel() {
    const container = document.getElementById('magWheelChambers');
    if (!container) return;
    container.innerHTML = '';

    const radius = 95; // px from center
    const centerX = 130;
    const centerY = 130;

    for (let i = 0; i < this.totalCapacity; i++) {
      const angle = (i * 36 - 90) * (Math.PI / 180);
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      const isLoaded = this.slots[i];
      const isCurrent = i === this.currentIndex;

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      circle.setAttribute('class', `cursor-pointer chamber-slot ${isLoaded ? 'loaded' : 'empty'} ${isCurrent ? 'active-slot' : ''}`);
      circle.setAttribute('data-index', i);

      // Outer chamber hole
      const hole = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      hole.setAttribute('cx', x);
      hole.setAttribute('cy', y);
      hole.setAttribute('r', '17');
      hole.setAttribute('fill', isLoaded ? '#1f2533' : '#0a0d13');
      hole.setAttribute('stroke', isCurrent ? '#ff6b00' : isLoaded ? 'rgba(255,107,0,0.5)' : 'rgba(255,255,255,0.15)');
      hole.setAttribute('stroke-width', isCurrent ? '2.5' : '1.5');

      circle.appendChild(hole);

      // If loaded, render lead pellet head
      if (isLoaded) {
        const pellet = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        pellet.setAttribute('cx', x);
        pellet.setAttribute('cy', y);
        pellet.setAttribute('r', '10');
        pellet.setAttribute('fill', 'url(#leadPelletGrad)');
        circle.appendChild(pellet);

        // Center diabolo waist indent
        const waist = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        waist.setAttribute('cx', x);
        waist.setAttribute('cy', y);
        waist.setAttribute('r', '4');
        waist.setAttribute('fill', '#4b5563');
        circle.appendChild(waist);
      }

      // Slot index text
      const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      txt.setAttribute('x', x);
      txt.setAttribute('y', y + (isLoaded ? 14 : 4));
      txt.setAttribute('text-anchor', 'middle');
      txt.setAttribute('fill', isCurrent ? '#ff6b00' : '#6b7280');
      txt.setAttribute('font-size', '9');
      txt.setAttribute('font-family', 'JetBrains Mono');
      txt.textContent = i + 1;
      circle.appendChild(txt);

      circle.addEventListener('click', () => {
        this.toggleSlot(i);
      });

      container.appendChild(circle);
    }

    // Rotate the magazine drum group to current index
    const drum = document.getElementById('magDrumGroup');
    if (drum) {
      drum.style.transform = `rotate(${-this.currentIndex * 36}deg)`;
    }
  },

  toggleSlot(index) {
    sounds.playPelletSeat();
    this.slots[index] = !this.slots[index];
    this.renderWheel();
    this.updateStatus();
  },

  rotateNext() {
    sounds.playMagRotate();
    this.currentIndex = (this.currentIndex + 1) % this.totalCapacity;
    this.renderWheel();
    this.updateStatus();
  },

  fillAll() {
    sounds.playPelletSeat();
    this.slots = new Array(this.totalCapacity).fill(true);
    this.renderWheel();
    this.updateStatus();
  },

  chamberRound() {
    sounds.playBoltRack();
    const boltElem = document.getElementById('boltHandleSvg');
    if (boltElem) {
      gsap.timeline()
        .to(boltElem, { x: -35, rotation: -15, duration: 0.15, ease: 'power2.out' })
        .to(boltElem, { x: 0, rotation: 0, duration: 0.18, ease: 'back.out(1.4)' });
    }

    if (this.slots[this.currentIndex]) {
      this.slots[this.currentIndex] = false; // round moved from mag to breach
      this.chamberLoaded = true;
      this.chamberPelletType = '.177 Match Diabolo (10.3gr)';
    } else {
      this.chamberLoaded = false;
      this.chamberPelletType = null;
    }

    this.renderWheel();
    this.updateStatus();
  },

  fireRifle() {
    if (this.chamberLoaded) {
      sounds.playPneumaticShot();
      this.chamberLoaded = false;
      this.shotsFired++;

      // Muzzle blast animation
      const flash = document.getElementById('muzzleFlashEffect');
      if (flash) {
        gsap.timeline()
          .set(flash, { opacity: 1, scale: 1.4 })
          .to(flash, { opacity: 0, scale: 0.8, duration: 0.25, ease: 'power2.out' });
      }

      // Ballistics trap hit indication
      const targetImpact = document.getElementById('targetPaperImpact');
      if (targetImpact) {
        gsap.timeline()
          .set(targetImpact, { scale: 2, opacity: 1 })
          .to(targetImpact, { scale: 1, opacity: 0.8, duration: 0.3 });
      }

      // Auto cycle ratchet to next round after 250ms
      setTimeout(() => {
        this.rotateNext();
      }, 250);
    } else {
      sounds.playTriggerClick();
      // Dry fire feedback
      const breachStatus = document.getElementById('breachStatusText');
      if (breachStatus) {
        gsap.timeline()
          .to(breachStatus, { color: '#ef4444', duration: 0.1 })
          .to(breachStatus, { color: '#9ca3af', duration: 0.3 });
      }
    }
    this.updateStatus();
  },

  updateStatus() {
    const loadedCount = this.slots.filter(Boolean).length;
    const countElem = document.getElementById('magCountDisplay');
    if (countElem) countElem.textContent = `${loadedCount}/${this.totalCapacity}`;

    const tensionBar = document.getElementById('magTensionBar');
    if (tensionBar) tensionBar.style.width = `${(loadedCount / this.totalCapacity) * 100}%`;

    const breachStatus = document.getElementById('breachStatusText');
    const chamberLed = document.getElementById('chamberStatusLed');
    if (breachStatus && chamberLed) {
      if (this.chamberLoaded) {
        breachStatus.textContent = 'CHAMBERED • READY TO FIRE';
        breachStatus.className = 'text-xs font-mono font-bold text-tritium tracking-wider';
        chamberLed.className = 'w-2.5 h-2.5 rounded-full bg-tritium shadow-[0_0_10px_#00ff88]';
      } else {
        breachStatus.textContent = 'BREACH EMPTY (PULL BOLT)';
        breachStatus.className = 'text-xs font-mono text-zinc-500 tracking-wider';
        chamberLed.className = 'w-2.5 h-2.5 rounded-full bg-zinc-700';
      }
    }

    const firedElem = document.getElementById('shotsFiredDisplay');
    if (firedElem) firedElem.textContent = this.shotsFired;
  },

  bindEvents() {
    document.getElementById('btnRotateMag')?.addEventListener('click', () => this.rotateNext());
    document.getElementById('btnFillMag')?.addEventListener('click', () => this.fillAll());
    document.getElementById('btnChamberBolt')?.addEventListener('click', () => this.chamberRound());
    document.getElementById('btnPullTrigger')?.addEventListener('click', () => this.fireRifle());
  }
};

// --- 3. BALLISTICS LAB & FLIGHT TRAJECTORY CANVAS ---
const BallisticsLab = {
  canvas: null,
  ctx: null,
  ammoData: {
    wadcutter: { name: '.177 Wadcutter (Target Match)', massGrains: 8.2, bc: 0.012, color: '#38bdf8' },
    domed: { name: '.177 Domed Diabolo (Aerodynamic)', massGrains: 10.3, bc: 0.024, color: '#ff6b00' },
    slug: { name: '.177 Precision Lead Slug (Long-Range)', massGrains: 13.5, bc: 0.045, color: '#00ff88' }
  },
  currentAmmo: 'domed',
  muzzleFps: 920,
  targetDistanceMeters: 50,
  crosswindMph: 4,

  init() {
    this.canvas = document.getElementById('ballisticsCanvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.bindControls();
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    this.calculateAndDraw();
  },

  resizeCanvas() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width * window.devicePixelRatio;
    this.canvas.height = 320 * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    this.calculateAndDraw();
  },

  bindControls() {
    // Ammo selector buttons
    document.querySelectorAll('[data-ammo-type]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('[data-ammo-type]').forEach(b => b.classList.remove('active-ammo', 'border-amber-primary', 'bg-amber-primary/10'));
        btn.classList.add('active-ammo', 'border-amber-primary', 'bg-amber-primary/10');
        this.currentAmmo = btn.getAttribute('data-ammo-type');
        sounds.playPelletSeat();
        this.calculateAndDraw();
      });
    });

    // Velocity Slider
    const fpsSlider = document.getElementById('inputMuzzleFps');
    fpsSlider?.addEventListener('input', (e) => {
      this.muzzleFps = parseInt(e.target.value);
      document.getElementById('displayFpsValue').textContent = `${this.muzzleFps} FPS`;
      this.calculateAndDraw();
    });

    // Distance Slider
    const distSlider = document.getElementById('inputDistance');
    distSlider?.addEventListener('input', (e) => {
      this.targetDistanceMeters = parseInt(e.target.value);
      document.getElementById('displayDistanceValue').textContent = `${this.targetDistanceMeters} METERS`;
      this.calculateAndDraw();
    });

    // Wind Slider
    const windSlider = document.getElementById('inputWind');
    windSlider?.addEventListener('input', (e) => {
      this.crosswindMph = parseInt(e.target.value);
      document.getElementById('displayWindValue').textContent = `${this.crosswindMph} MPH`;
      this.calculateAndDraw();
    });
  },

  // Ballistics Equations
  calculateAndDraw() {
    if (!this.ctx || !this.canvas) return;
    const ammo = this.ammoData[this.currentAmmo];
    const width = this.canvas.width / window.devicePixelRatio;
    const height = 320;

    // Mass in grams: grains * 0.06479891
    const massKg = (ammo.massGrains * 0.06479891) / 1000;
    // Velocity in m/s: fps * 0.3048
    const v0_ms = this.muzzleFps * 0.3048;

    // Energy at muzzle (Joules): 0.5 * m * v^2
    const muzzleJoules = 0.5 * massKg * Math.pow(v0_ms, 2);

    // Aerodynamic decay factor based on Ballistic Coefficient
    const kDrag = 0.0018 / ammo.bc;
    const distanceM = this.targetDistanceMeters;
    
    // Time of flight (approx integral)
    const timeOfFlightSec = (distanceM / v0_ms) * (1 + 0.5 * kDrag * distanceM);
    // Impact velocity (m/s)
    const vImpact_ms = v0_ms * Math.exp(-kDrag * distanceM);
    const impactFps = vImpact_ms / 0.3048;
    const impactJoules = 0.5 * massKg * Math.pow(vImpact_ms, 2);

    // Gravity drop (cm): y = 0.5 * g * t^2
    const dropCm = 0.5 * 9.81 * Math.pow(timeOfFlightSec, 2) * 100;
    const dropInches = dropCm / 2.54;

    // Wind drift (inches)
    const crosswindFps = this.crosswindMph * 1.46667;
    const windDriftInches = (crosswindFps * (timeOfFlightSec - (distanceM / v0_ms))) * 12;

    // Update Telemetry DOM
    document.getElementById('readoutJoules').textContent = `${muzzleJoules.toFixed(1)} J`;
    document.getElementById('readoutFlightTime').textContent = `${(timeOfFlightSec * 1000).toFixed(0)} ms`;
    document.getElementById('readoutDrop').textContent = `-${dropCm.toFixed(1)} cm (${dropInches.toFixed(1)}")`;
    document.getElementById('readoutTerminalFps').textContent = `${impactFps.toFixed(0)} FPS (${impactJoules.toFixed(1)} J)`;

    // RENDER CANVAS PLOT
    this.ctx.clearRect(0, 0, width, height);

    // 1. Tactical Grid Lines
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    this.ctx.lineWidth = 1;
    const gridCols = 10;
    for (let c = 0; c <= gridCols; c++) {
      const gx = 50 + ((width - 80) / gridCols) * c;
      this.ctx.beginPath();
      this.ctx.moveTo(gx, 20);
      this.ctx.lineTo(gx, height - 40);
      this.ctx.stroke();

      // Distance markers
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      this.ctx.font = '10px JetBrains Mono';
      this.ctx.fillText(`${(c * 10)}m`, gx - 10, height - 25);
    }

    // Horizontal Zero Reference line
    const zeroY = 120;
    this.ctx.strokeStyle = 'rgba(255, 107, 0, 0.3)';
    this.ctx.setLineDash([4, 4]);
    this.ctx.beginPath();
    this.ctx.moveTo(40, zeroY);
    this.ctx.lineTo(width - 20, zeroY);
    this.ctx.stroke();
    this.ctx.setLineDash([]);

    this.ctx.fillStyle = '#ff6b00';
    this.ctx.fillText('OPTIC BORESIGHT ZERO', 55, zeroY - 8);

    // 2. Trajectory Arc Drawing
    const plotStartX = 50;
    const plotEndX = 50 + ((width - 80) / 100) * distanceM;
    const numPoints = 80;

    this.ctx.beginPath();
    this.ctx.strokeStyle = ammo.color;
    this.ctx.lineWidth = 3;
    this.ctx.shadowColor = ammo.color;
    this.ctx.shadowBlur = 12;

    for (let i = 0; i <= numPoints; i++) {
      const curDist = (distanceM / numPoints) * i;
      const tSec = (curDist / v0_ms) * (1 + 0.5 * kDrag * curDist);
      const curDropCm = 0.5 * 9.81 * Math.pow(tSec, 2) * 100;

      // Scale coordinates to canvas
      const px = 50 + ((width - 80) / 100) * curDist;
      // 1cm drop = 2.4px on canvas
      const py = zeroY + curDropCm * 2.2;

      if (i === 0) {
        this.ctx.moveTo(px, py);
      } else {
        this.ctx.lineTo(px, py);
      }
    }
    this.ctx.stroke();
    this.ctx.shadowBlur = 0; // reset glow

    // 3. Impact Reticle Crosshair at Target
    const finalT = timeOfFlightSec;
    const finalDrop = dropCm * 2.2;
    const targetX = plotEndX;
    const targetY = zeroY + finalDrop;

    // Crosshair target circle
    this.ctx.strokeStyle = '#00ff88';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(targetX, targetY, 9, 0, Math.PI * 2);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(targetX - 14, targetY);
    this.ctx.lineTo(targetX + 14, targetY);
    this.ctx.moveTo(targetX, targetY - 14);
    this.ctx.lineTo(targetX, targetY + 14);
    this.ctx.stroke();

    // Callout box at target
    this.ctx.fillStyle = 'rgba(14, 17, 23, 0.9)';
    this.ctx.strokeStyle = '#00ff88';
    this.ctx.lineWidth = 1;
    this.ctx.fillRect(targetX - 55, targetY - 50, 110, 32);
    this.ctx.strokeRect(targetX - 55, targetY - 50, 110, 32);

    this.ctx.fillStyle = '#00ff88';
    this.ctx.font = 'bold 11px JetBrains Mono';
    this.ctx.fillText(`${distanceM}m IMPACT`, targetX - 45, targetY - 34);
    this.ctx.fillStyle = '#e5e7eb';
    this.ctx.font = '10px JetBrains Mono';
    this.ctx.fillText(`-${dropCm.toFixed(1)}cm DROP`, targetX - 45, targetY - 22);
  }
};

// --- 4. INTERACTIVE ANATOMY EXPLORER ---
const AnatomyExplorer = {
  data: {
    moderator: {
      title: 'INTEGRATED SOUND MODERATOR & SHROUD',
      metric: '< 65 dB NOISE LEVEL (WHISPER QUIET)',
      desc: 'Precision 4-chamber internal CNC baffle stack decelerates expanding high-pressure air vortices, reducing muzzle blast to an undetectable indoor decibel rating without disturbing pellet stabilization.'
    },
    cylinder: {
      title: '300-BAR CARBON FIBER COMPOSITE TANK',
      metric: '500cc CAPACITY • 80+ FULL POWER SHOTS',
      desc: 'Military aerospace-grade carbon fiber wrapped aluminum liner cylinder rated to 300 Bar (4350 PSI) working pressure, equipped with high-precision WIKA pressure gauge and foster quick-connect fill port.'
    },
    regulator: {
      title: 'MATCH-GRADE EXTERNALLY ADJUSTABLE REGULATOR',
      metric: 'EXTREME SPREAD < 4 FPS (STANDARD DEV 1.2)',
      desc: 'Consistency is accuracy. Metered internal Belleville spring stack delivers exact 135 Bar plenum output for match-winning velocity consistency shot after shot until tank pressure drops.'
    },
    cocking: {
      title: 'SIDE-LEVER BIATHLON SMOOTH ACTION',
      metric: '1.2 LBS EFFORTLESS RE-COCKING',
      desc: 'Needle roller bearings on the side-lever linkage ensure lightning-fast repeat shots without taking your cheek weld off the stock or losing target acquisition through the scope.'
    },
    trigger: {
      title: '2-STAGE FULLY ADJUSTABLE MATCH TRIGGER',
      metric: '8 OZ - 1.5 LBS BREAK WEIGHT',
      desc: 'Hardened tool steel sear faces with adjustable first stage travel, second stage weight, and overtravel stop for a match-grade break like the snap of a glass rod.'
    },
    optics: {
      title: 'TACTICAL PICATINNY RAIL & MIL-DOT RETICLE',
      metric: '4-16X50 AO ILLUMINATED PRECISION GLASS',
      desc: 'Mil-spec 20 MOA forward-cant Picatinny rail accommodates long-range scopes, providing elevation compensation for 100+ meter extreme target shooting.'
    }
  },

  init() {
    document.querySelectorAll('[data-hotspot]').forEach(node => {
      node.addEventListener('click', (e) => {
        sounds.playBoltRack();
        const key = node.getAttribute('data-hotspot');
        this.selectNode(key, node);
      });
    });
  },

  selectNode(key, targetNode) {
    document.querySelectorAll('[data-hotspot]').forEach(n => {
      n.classList.remove('active-node');
      n.querySelector('.hotspot-ring')?.classList.remove('border-tritium', 'bg-tritium/20');
    });

    targetNode.classList.add('active-node');
    targetNode.querySelector('.hotspot-ring')?.classList.add('border-tritium', 'bg-tritium/20');

    const info = this.data[key];
    if (!info) return;

    const titleEl = document.getElementById('anatomyTitle');
    const metricEl = document.getElementById('anatomyMetric');
    const descEl = document.getElementById('anatomyDesc');

    if (titleEl && metricEl && descEl) {
      gsap.timeline()
        .to([titleEl, metricEl, descEl], { opacity: 0, y: -8, duration: 0.15 })
        .call(() => {
          titleEl.textContent = info.title;
          metricEl.textContent = info.metric;
          descEl.textContent = info.desc;
        })
        .to([titleEl, metricEl, descEl], { opacity: 1, y: 0, duration: 0.25, stagger: 0.05 });
    }
  }
};

// --- 5. CATALOG & WHATSAPP GENERATOR ---
const CatalogManager = {
  init() {
    // Category filtering
    const tabButtons = document.querySelectorAll('[data-catalog-filter]');
    const cards = document.querySelectorAll('[data-catalog-item]');

    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        sounds.playMagRotate();
        tabButtons.forEach(b => b.classList.remove('bg-amber-primary', 'text-black', 'active'));
        btn.classList.add('bg-amber-primary', 'text-black', 'active');

        const filter = btn.getAttribute('data-catalog-filter');
        cards.forEach(card => {
          const category = card.getAttribute('data-category');
          if (filter === 'all' || category === filter) {
            card.style.display = 'block';
            gsap.fromTo(card, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.3 });
          } else {
            card.style.display = 'none';
          }
        });
      });
    });

    // WhatsApp Direct Inquire Buttons
    document.querySelectorAll('[data-wa-model]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const model = btn.getAttribute('data-wa-model');
        const phone = btn.getAttribute('data-phone') || '8439543244';
        const text = encodeURIComponent(
          `Hello Meerut Airgun! I am interested in inquiring about the "${model}" from your showcase website. Could you please share the current pricing, stock availability, and home delivery details to my pin code?`
        );
        window.open(`https://wa.me/91${phone}?text=${text}`, '_blank');
      });
    });
  }
};

// --- 6. TACTICAL HUD CURSOR & AMBIENT MOTION ---
function initTacticalCursor() {
  const cursor = document.getElementById('crosshairHud');
  if (!cursor) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let posX = mouseX;
  let posY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Smooth lerp follow
  function renderCursor() {
    posX += (mouseX - posX) * 0.25;
    posY += (mouseY - posY) * 0.25;
    cursor.style.left = `${posX}px`;
    cursor.style.top = `${posY}px`;
    requestAnimationFrame(renderCursor);
  }
  renderCursor();

  // Hover reactive state
  document.querySelectorAll('button, a, input, .cursor-pointer').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('active'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('active'));
  });
}

// --- 7. AUDIO TOGGLE BUTTON ---
function initSoundToggle() {
  const btn = document.getElementById('btnSoundToggle');
  const label = document.getElementById('soundToggleLabel');
  const icon = document.getElementById('soundToggleIcon');

  btn?.addEventListener('click', () => {
    sounds.enabled = !sounds.enabled;
    if (sounds.enabled) {
      sounds.playBoltRack();
      if (label) label.textContent = 'SOUND ON';
      btn.classList.add('border-tritium/50', 'text-tritium');
      btn.classList.remove('text-zinc-400');
    } else {
      if (label) label.textContent = 'MUTED';
      btn.classList.remove('border-tritium/50', 'text-tritium');
      btn.classList.add('text-zinc-400');
    }
  });
}

// --- INITIALIZE APPLICATION ---
document.addEventListener('DOMContentLoaded', () => {
  sounds.initAudioContext();
  MagSimulator.init();
  BallisticsLab.init();
  AnatomyExplorer.init();
  CatalogManager.init();
  initTacticalCursor();
  initSoundToggle();

  // GSAP Entry Animations
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    gsap.from('.hero-badge', { opacity: 0, y: -20, duration: 0.8, ease: 'power3.out' });
    gsap.from('.hero-title', { opacity: 0, y: 30, duration: 1, delay: 0.2, ease: 'power3.out' });
    gsap.from('.hero-subtitle', { opacity: 0, y: 25, duration: 1, delay: 0.4, ease: 'power3.out' });
    gsap.from('.hero-ctas', { opacity: 0, y: 20, duration: 0.8, delay: 0.6, ease: 'power3.out' });
    gsap.from('.hero-weapon-card', { opacity: 0, scale: 0.95, duration: 1.2, delay: 0.5, ease: 'power3.out' });

    // Scroll reveals
    gsap.utils.toArray('.reveal-on-scroll').forEach(section => {
      gsap.from(section, {
        scrollTrigger: {
          trigger: section,
          start: 'top 85%'
        },
        opacity: 0,
        y: 40,
        duration: 0.9,
        ease: 'power3.out'
      });
    });
  }
});
