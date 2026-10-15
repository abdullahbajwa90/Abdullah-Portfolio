/**
 * ==============================================================================
 * ABDULLAH BAJWA - PORTFOLIO INTERACTIVE CORE
 * Features:
 * - Fluid neon canvas cursor trailing lines & particle system
 * - Custom magnetic cursor with lerp physics
 * - Dynamic role typer with natural delay
 * - 3D parallax tilt on profile picture
 * - Interactive Simulated Video Player (CapCut Reel Lab)
 * - Portfolio filter & dynamic modal details
 * - Direct WhatsApp & Gmail dispatchers + clipboard copy
 * - Native Web Audio API sound effects synthesizer (toggleable)
 * - Animated stats counters & live timezone clock
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. WEB AUDIO API SYNTHESIZER (NO EXTERNAL AUDIO)
  // ==========================================
  let audioEnabled = true;
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTone(freq = 440, type = 'sine', duration = 0.08, gainVal = 0.04) {
    if (!audioEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio not permitted or supported silently ignored
    }
  }

  // Audio Toggle Button
  const audioToggle = document.getElementById('audio-toggle');
  const audioIcon = document.getElementById('audio-icon');
  const audioTooltip = audioToggle ? audioToggle.querySelector('.audio-tooltip') : null;

  if (audioToggle) {
    audioToggle.addEventListener('click', () => {
      initAudio();
      audioEnabled = !audioEnabled;
      if (audioEnabled) {
        audioIcon.className = 'fa-solid fa-volume-high';
        if (audioTooltip) audioTooltip.textContent = 'Sound Effects: On';
        playTone(660, 'sine', 0.1, 0.05);
        showToast('Sound Effects Enabled 🔊');
      } else {
        audioIcon.className = 'fa-solid fa-volume-xmark';
        if (audioTooltip) audioTooltip.textContent = 'Sound Effects: Muted';
        showToast('Sound Effects Muted 🔇');
      }
    });
  }

  // Add click sound to all buttons & links
  document.querySelectorAll('button, a, .filter-tab').forEach(el => {
    el.addEventListener('click', () => {
      playTone(520, 'sine', 0.06, 0.03);
    });
    el.addEventListener('mouseenter', () => {
      playTone(320, 'triangle', 0.03, 0.015);
    });
  });

  // ==========================================
  // 2. CURSOR TRAILING LINES & PARTICLES CANVAS
  // ==========================================
  const cursorCanvas = document.getElementById('cursor-canvas');
  const bgCanvas = document.getElementById('bg-canvas');
  const customCursor = document.getElementById('custom-cursor');
  const cursorDot = document.getElementById('cursor-dot');

  let mouse = { x: -100, y: -100, lastX: -100, lastY: -100, speed: 0 };
  let cursorTarget = { x: -100, y: -100 };
  let cursorLerp = { x: -100, y: -100 };
  const trailPoints = [];
  const sparks = [];
  const maxTrailPoints = 28;

  function resizeCanvases() {
    if (cursorCanvas) {
      cursorCanvas.width = window.innerWidth;
      cursorCanvas.height = window.innerHeight;
    }
    if (bgCanvas) {
      bgCanvas.width = window.innerWidth;
      bgCanvas.height = window.innerHeight;
    }
  }
  window.addEventListener('resize', resizeCanvases);
  resizeCanvases();

  // Track Mouse Movement
  window.addEventListener('mousemove', (e) => {
    initAudio();
    const currentX = e.clientX;
    const currentY = e.clientY;
    const dx = currentX - mouse.x;
    const dy = currentY - mouse.y;
    mouse.speed = Math.sqrt(dx * dx + dy * dy);
    mouse.lastX = mouse.x;
    mouse.lastY = mouse.y;
    mouse.x = currentX;
    mouse.y = currentY;
    cursorTarget.x = currentX;
    cursorTarget.y = currentY;

    if (cursorDot) {
      cursorDot.style.left = `${currentX}px`;
      cursorDot.style.top = `${currentY}px`;
    }

    // Add point to trailing lines
    trailPoints.push({
      x: currentX,
      y: currentY,
      time: Date.now(),
      speed: mouse.speed,
      width: Math.min(Math.max(mouse.speed * 0.35, 3), 10)
    });

    if (trailPoints.length > maxTrailPoints) {
      trailPoints.shift();
    }

    // Spawn subtle sparks along fast cursor movement
    if (mouse.speed > 8 && Math.random() < 0.4) {
      sparks.push({
        x: currentX,
        y: currentY,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        size: Math.random() * 2.5 + 1.5,
        alpha: 1,
        color: Math.random() > 0.5 ? '#00f0ff' : '#8b5cf6'
      });
    }
  });

  // Cursor Hover Magnification
  const interactiveTargets = 'a, button, input, select, textarea, .service-card, .portfolio-card, .filter-tab, .orbit-badge';
  document.querySelectorAll(interactiveTargets).forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  // Click Wave Pulse
  window.addEventListener('click', (e) => {
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 / 8) * i;
      sparks.push({
        x: e.clientX,
        y: e.clientY,
        vx: Math.cos(angle) * (Math.random() * 4 + 2),
        vy: Math.sin(angle) * (Math.random() * 4 + 2),
        size: 3,
        alpha: 1,
        color: '#00ff9d'
      });
    }
  });

  // Touch Support: Create spark ripple on touch
  window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) {
      const touch = e.touches[0];
      trailPoints.push({
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
        speed: 5,
        width: 4
      });
      if (trailPoints.length > maxTrailPoints) trailPoints.shift();
    }
  }, { passive: true });

  // Render Loop for Cursor Canvas Trailing Lines
  const ctx = cursorCanvas ? cursorCanvas.getContext('2d') : null;

  function renderCursorLines() {
    if (ctx && cursorCanvas) {
      ctx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);

      // Draw smooth trailing ribbon / lines
      if (trailPoints.length > 2) {
        const now = Date.now();
        for (let i = 1; i < trailPoints.length; i++) {
          const p1 = trailPoints[i - 1];
          const p2 = trailPoints[i];
          const age = now - p2.time;
          const life = Math.max(0, 1 - age / 450); // fades over 450ms

          if (life > 0.01) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);

            const gradient = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
            gradient.addColorStop(0, `rgba(0, 240, 255, ${life * 0.8})`);
            gradient.addColorStop(0.5, `rgba(139, 92, 246, ${life * 0.9})`);
            gradient.addColorStop(1, `rgba(0, 255, 157, ${life})`);

            ctx.strokeStyle = gradient;
            ctx.lineWidth = (p2.width * (i / trailPoints.length)) * life;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.shadowColor = '#00f0ff';
            ctx.shadowBlur = 12 * life;
            ctx.stroke();
          }
        }
        ctx.shadowBlur = 0;
      }

      // Render sparks
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.alpha *= 0.92;
        s.size *= 0.96;

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.globalAlpha = Math.max(0, s.alpha);
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.globalAlpha = 1;

        if (s.alpha < 0.05) {
          sparks.splice(i, 1);
        }
      }
    }

    // Lerp Physics for cursor ring
    if (customCursor) {
      cursorLerp.x += (cursorTarget.x - cursorLerp.x) * 0.22;
      cursorLerp.y += (cursorTarget.y - cursorLerp.y) * 0.22;
      customCursor.style.left = `${cursorLerp.x}px`;
      customCursor.style.top = `${cursorLerp.y}px`;
    }

    requestAnimationFrame(renderCursorLines);
  }
  requestAnimationFrame(renderCursorLines);

  // Background Cosmic Dust Starfield
  const bgCtx = bgCanvas ? bgCanvas.getContext('2d') : null;
  const stars = [];
  const starCount = 55;

  for (let i = 0; i < starCount; i++) {
    stars.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      radius: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.5 + 0.2,
      speed: Math.random() * 0.3 + 0.1
    });
  }

  function renderBackground() {
    if (bgCtx && bgCanvas) {
      bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        star.y -= star.speed;
        if (star.y < 0) {
          star.y = bgCanvas.height;
          star.x = Math.random() * bgCanvas.width;
        }
        bgCtx.beginPath();
        bgCtx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        bgCtx.fillStyle = `rgba(0, 240, 255, ${star.alpha})`;
        bgCtx.shadowColor = '#00f0ff';
        bgCtx.shadowBlur = 4;
        bgCtx.fill();
      }
    }
    requestAnimationFrame(renderBackground);
  }
  requestAnimationFrame(renderBackground);


  // ==========================================
  // 3. DYNAMIC ROLE TYPER
  // ==========================================
  const roleElement = document.getElementById('role-text');
  const roles = [
    'CapCut Video Editing Maestro',
    'Viral Reels & TikTok Specialist',
    'Creative Logo & Brand Designer',
    'Full-Stack Web Developer & Coder',
    'High-Retention Script & Content Writer'
  ];

  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingDelay = 90;

  function typeRole() {
    if (!roleElement) return;
    const currentRole = roles[roleIndex];

    if (isDeleting) {
      roleElement.textContent = currentRole.substring(0, charIndex - 1);
      charIndex--;
      typingDelay = 45;
    } else {
      roleElement.textContent = currentRole.substring(0, charIndex + 1);
      charIndex++;
      typingDelay = 95;
    }

    if (!isDeleting && charIndex === currentRole.length) {
      typingDelay = 2200; // Pause at full word
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      typingDelay = 450;
    }

    setTimeout(typeRole, typingDelay);
  }
  setTimeout(typeRole, 600);


  // ==========================================
  // 4. 3D PARALLAX TILT ON USER PROFILE CARD
  // ==========================================
  const profileContainer = document.getElementById('profile-container');
  if (profileContainer) {
    profileContainer.addEventListener('mousemove', (e) => {
      const rect = profileContainer.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      const tiltX = -(y / (rect.height / 2)) * 14;
      const tiltY = (x / (rect.width / 2)) * 14;

      profileContainer.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.04)`;
    });

    profileContainer.addEventListener('mouseleave', () => {
      profileContainer.style.transform = '';
    });
  }


  // ==========================================
  // 5. SIMULATED REEL PLAYER & CAPCUT LAB
  // ==========================================
  const words = ['HOOK.', 'ENGAGE.', 'RETAIN.', 'SCALE.', 'VIRAL.'];
  let wordIndex = 0;
  const kineticContainer = document.getElementById('kinetic-text');
  let reelPlaying = true;

  function cycleCaptions() {
    if (!reelPlaying || !kineticContainer) return;
    wordIndex = (wordIndex + 1) % words.length;
    kineticContainer.innerHTML = `
      <span class="caption-word active">${words[wordIndex]}</span>
    `;
  }
  setInterval(cycleCaptions, 1400);

  // Reel Play/Pause Toggle
  const reelPlayBtn = document.getElementById('reel-play-btn');
  const reelPlayIcon = document.getElementById('reel-play-icon');
  const audioBars = document.getElementById('audio-bars');
  const timelineNeedle = document.getElementById('timeline-needle');

  if (reelPlayBtn) {
    reelPlayBtn.addEventListener('click', () => {
      reelPlaying = !reelPlaying;
      if (reelPlaying) {
        if (reelPlayIcon) reelPlayIcon.className = 'fa-solid fa-pause';
        if (audioBars) audioBars.style.opacity = '1';
        if (timelineNeedle) timelineNeedle.style.animationPlayState = 'running';
        playTone(600, 'sine', 0.1, 0.05);
      } else {
        if (reelPlayIcon) reelPlayIcon.className = 'fa-solid fa-play';
        if (audioBars) audioBars.style.opacity = '0.3';
        if (timelineNeedle) timelineNeedle.style.animationPlayState = 'paused';
        playTone(350, 'sine', 0.1, 0.05);
      }
    });
  }

  // Reel Heart Like Handler
  window.toggleReelHeart = function(btn) {
    btn.classList.toggle('liked');
    const countEl = btn.querySelector('.action-count');
    if (btn.classList.contains('liked')) {
      if (countEl) countEl.textContent = '94.9K';
      playTone(880, 'sine', 0.12, 0.06);
      showToast('Loved the edit! ❤️');
    } else {
      if (countEl) countEl.textContent = '94.8K';
    }
  };


  // ==========================================
  // 6. PORTFOLIO FILTERING & MODAL LIGHTBOX
  // ==========================================
  const filterTabs = document.querySelectorAll('.filter-tab');
  const portfolioCards = document.querySelectorAll('.portfolio-card');

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filterVal = tab.getAttribute('data-filter');
      portfolioCards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filterVal === 'all' || cat === filterVal) {
          card.style.display = 'flex';
          card.style.animation = 'toastIn 0.35s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Modal Details Registry
  const projectDetails = {
    'video-1': {
      title: 'Viral Short-Form & Reel Video Editing',
      category: 'CapCut Pro & Premiere Pro',
      image: 'assets/video_edit.jpg',
      description: 'Engineered high-retention short-form video content formatted specifically for Instagram Reels, YouTube Shorts, and TikTok. Incorporates instant visual hooks within the first 3 seconds, multi-track audio ducking, kinetic typography with glow accents, dynamic sound effects (whooshes, cash rings, risers), and cinematic 4K color grading.',
      metrics: [
        { label: 'Views Generated', val: '1.2 Million+' },
        { label: 'Retention Boost', val: '+45% Watch Time' },
        { label: 'Turnaround', val: '24 Hours' }
      ],
      whatsappMsg: 'Hi Abdullah, I want to order Video Editing services like your Viral Reel showcase!'
    },
    'logo-1': {
      title: 'Luxury Minimalist Logo & Brand Identity Suite',
      category: 'Brand Identity & Vector System',
      image: 'assets/logo_design.jpg',
      description: 'A prestigious collection of modern geometric, 3D, and minimalist brand logos crafted with mathematical precision. Delivered as high-resolution vector packages with source files (AI, EPS, SVG, PDF, transparent PNG), primary and secondary variations, custom brand color codes, and official typography pairings.',
      metrics: [
        { label: 'Asset Formats', val: 'SVG, AI, EPS, PNG' },
        { label: 'Design Precision', val: '100% Vector' },
        { label: 'Client Feedback', val: '5.0 ★ Rating' }
      ],
      whatsappMsg: 'Hi Abdullah, I want to order a Logo Design for my brand!'
    },
    'web-1': {
      title: 'Modern Full-Stack Web Application & Cyber UI',
      category: 'Web Development & Programming',
      image: 'assets/web_dev.jpg',
      description: 'Clean-coded, high-performance web applications built with semantic HTML5, modern vanilla CSS, modular JavaScript, and Python backends. Architecture is 100% compliant with Safe Browsing, zero malware, zero bloated external tracking, and scores 98+ on Google Lighthouse for SEO and performance.',
      metrics: [
        { label: 'Lighthouse Score', val: '99/100' },
        { label: 'Hosting', val: 'GitHub Pages & SSL' },
        { label: 'Security', val: 'Unhackable Static' }
      ],
      whatsappMsg: 'Hi Abdullah, I need a modern web app developed with high security!'
    },
    'content-1': {
      title: 'High-Retention Video Scripts & Copywriting Formulas',
      category: 'Copywriting & Script Strategy',
      image: 'assets/content_writing.jpg',
      description: 'Strategic video scripts and high-conversion copy based on proven psychological engagement principles. Includes the 8-Step Retention Loop, AIDA and PAS copywriting frameworks, audience hook formulas, and high-converting Fiverr gig descriptions engineered for top search placement.',
      metrics: [
        { label: 'Audience Retention', val: '72% Average' },
        { label: 'Frameworks', val: 'AIDA / PAS / 8-Step' },
        { label: 'Conversion', val: 'Top 5% Rated' }
      ],
      whatsappMsg: 'Hi Abdullah, I need high-converting scripts and content writing!'
    }
  };

  const modal = document.getElementById('project-modal');
  const modalContent = document.getElementById('modal-content');

  window.openModal = function(projectId) {
    const data = projectDetails[projectId];
    if (!data || !modal || !modalContent) return;

    modalContent.innerHTML = `
      <div class="modal-img-wrap">
        <img src="${data.image}" alt="${data.title}" class="modal-img">
      </div>
      <div class="modal-details">
        <span class="badge-overlay">${data.category}</span>
        <h3>${data.title}</h3>
        <p>${data.description}</p>
        
        <div class="modal-meta-grid">
          ${data.metrics.map(m => `
            <div class="meta-box">
              <span>${m.label}</span>
              <strong>${m.val}</strong>
            </div>
          `).join('')}
        </div>

        <div style="display: flex; gap: 14px; flex-wrap: wrap;">
          <a href="https://wa.me/923068942022?text=${encodeURIComponent(data.whatsappMsg)}" 
             target="_blank" rel="noopener noreferrer" class="btn btn-glow-whatsapp">
            <i class="fa-brands fa-whatsapp"></i> Order Similar Project on WhatsApp
          </a>
          <button class="btn btn-outline-cyber" onclick="closeModal()">Close</button>
        </div>
      </div>
    `;

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    playTone(550, 'sine', 0.08, 0.04);
  };

  window.closeModal = function() {
    if (modal) {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
    }
  };

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });


  // ==========================================
  // 7. TOAST NOTIFICATIONS & CLIPBOARD COPY
  // ==========================================
  const toastContainer = document.getElementById('toast-container');

  window.showToast = function(message) {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color: #00ff9d;"></i> <span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(15px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  };

  window.copyToClipboard = function(text, label) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(`Copied ${label} to clipboard! ✓`);
        playTone(720, 'sine', 0.1, 0.05);
      }).catch(() => fallbackCopy(text, label));
    } else {
      fallbackCopy(text, label);
    }
  };

  function fallbackCopy(text, label) {
    const input = document.createElement('input');
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    showToast(`Copied ${label} to clipboard! ✓`);
    playTone(720, 'sine', 0.1, 0.05);
  }


  // ==========================================
  // 8. DUAL DISPATCHER (WHATSAPP & GMAIL)
  // ==========================================
  window.handleFormDispatch = function(e) {
    e.preventDefault();
    dispatchViaWhatsApp();
  };

  function getFormValues() {
    const name = document.getElementById('client-name').value.trim();
    const email = document.getElementById('client-email').value.trim();
    const service = document.getElementById('client-service').value;
    const message = document.getElementById('client-message').value.trim();

    if (!name || !email || !message) {
      showToast('Please fill in your Name, Contact and Message!');
      return null;
    }

    return { name, email, service, message };
  }

  window.dispatchViaWhatsApp = function() {
    const data = getFormValues();
    if (!data) return;

    const formattedMsg = `Hello Abdullah!\n\nMy name is ${data.name}.\nContact: ${data.email}\nService Requested: ${data.service}\n\nProject Details:\n${data.message}\n\nSent via your portfolio website.`;
    const waUrl = `https://wa.me/923068942022?text=${encodeURIComponent(formattedMsg)}`;

    playTone(660, 'sine', 0.1, 0.05);
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    showToast('Opening WhatsApp with your project brief! 🚀');
  };

  window.dispatchViaGmail = function() {
    const data = getFormValues();
    if (!data) return;

    const subject = `Project Inquiry: ${data.service} - from ${data.name}`;
    const body = `Hi Abdullah,\n\nI am contacting you regarding ${data.service}.\n\nClient Name: ${data.name}\nContact Email / Phone: ${data.email}\n\nProject Details:\n${data.message}\n\nLooking forward to your response!`;

    const gmailWebUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=abdullahbajwaofficial1@gmail.com&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    playTone(660, 'sine', 0.1, 0.05);
    window.open(gmailWebUrl, '_blank', 'noopener,noreferrer');
    showToast('Opening Gmail with your project brief! ✉️');
  };


  // ==========================================
  // 9. ANIMATED STATS COUNTER
  // ==========================================
  const statNumbers = document.querySelectorAll('.stat-number');
  let statsAnimated = false;

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !statsAnimated) {
        statsAnimated = true;
        statNumbers.forEach(num => {
          const target = parseInt(num.getAttribute('data-target'), 10);
          let current = 0;
          const duration = 1800;
          const stepTime = Math.max(Math.floor(duration / target), 12);

          const timer = setInterval(() => {
            current += Math.ceil(target / (duration / stepTime));
            if (current >= target) {
              current = target;
              clearInterval(timer);
            }
            num.textContent = current;
          }, stepTime);
        });
      }
    });
  }, { threshold: 0.3 });

  const statsSection = document.querySelector('.stats-section');
  if (statsSection) statsObserver.observe(statsSection);


  // ==========================================
  // 10. SCROLL PROGRESS & HEADER SCROLLED STATE
  // ==========================================
  const scrollProgressBar = document.getElementById('scroll-progress');
  const siteHeader = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;

    if (scrollProgressBar) {
      scrollProgressBar.style.width = `${scrollPercent}%`;
    }

    if (siteHeader) {
      if (scrollTop > 50) {
        siteHeader.classList.add('scrolled');
      } else {
        siteHeader.classList.remove('scrolled');
      }
    }

    // Active nav link highlight
    let currentId = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 120;
      const height = sec.offsetHeight;
      if (scrollTop >= top && scrollTop < top + height) {
        currentId = sec.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  }, { passive: true });


  // ==========================================
  // 11. MOBILE MENU TOGGLE
  // ==========================================
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const mobileDrawer = document.getElementById('mobile-drawer');

  if (mobileBtn && mobileDrawer) {
    mobileBtn.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.toggle('open');
      mobileBtn.setAttribute('aria-expanded', isOpen);
    });

    document.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        mobileBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }


  // ==========================================
  // 12. LIVE TIMEZONE CLOCK (PKT) & YEAR UPDATE
  // ==========================================
  const liveTimeEl = document.getElementById('live-time');
  function updateLiveTime() {
    if (!liveTimeEl) return;
    try {
      const options = {
        timeZone: 'Asia/Karachi',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      };
      const pktTime = new Intl.DateTimeFormat([], options).format(new Date());
      liveTimeEl.textContent = `${pktTime} PKT (UTC+5)`;
    } catch (e) {
      liveTimeEl.textContent = 'PKT (UTC+5)';
    }
  }
  updateLiveTime();
  setInterval(updateLiveTime, 1000);

  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

});
