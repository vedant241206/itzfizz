  (function(){
    'use strict';

    // Wait until DOM is completely ready
    function initApp(){
      // ── CUSTOM CURSOR ──
      var cursor = document.getElementById('cursor');
      var ring = document.getElementById('cursor-ring');
      var cx = window.innerWidth / 2, cy = window.innerHeight / 2;
      var rx = cx, ry = cy;

      document.addEventListener('mousemove', function(e){
        cx = e.clientX; cy = e.clientY;
        if(cursor) {
          cursor.style.left = cx + 'px';
          cursor.style.top = cy + 'px';
        }
      });

      (function tick(){
        rx += (cx - rx) * 0.15;
        ry += (cy - ry) * 0.15;
        if(ring) {
          ring.style.left = rx + 'px';
          ring.style.top = ry + 'px';
        }
        requestAnimationFrame(tick);
      })();

      document.querySelectorAll('a, button, .service-card, .service-node').forEach(function(el){
        el.addEventListener('mouseenter', function(){
          if(ring){
            ring.style.width = '54px';
            ring.style.height = '54px';
            ring.style.borderColor = '#9DFF20';
            ring.style.background = 'rgba(157,255,32,0.08)';
          }
        });
        el.addEventListener('mouseleave', function(){
          if(ring){
            ring.style.width = '36px';
            ring.style.height = '36px';
            ring.style.borderColor = 'rgba(157,255,32,0.5)';
            ring.style.background = 'transparent';
          }
        });
      });

      // ── PARTICLE CANVAS ──
      var canvas = document.getElementById('particles-canvas');
      var ctx = canvas ? canvas.getContext('2d') : null;
      var particles = [];
      var particleCount = 45;
      var partAlpha = 0;

      function resizeCanvas(){
        if(!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
      resizeCanvas();

      function Particle(){ this.reset(); }
      Particle.prototype.reset = function(){
        if(!canvas) return;
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.radius = Math.random() * 1.5 + 0.8;
        this.baseAlpha = Math.random() * 0.5 + 0.2;
      };
      Particle.prototype.update = function(){
        if(!canvas) return;
        this.x += this.vx; this.y += this.vy;
        if(this.x < 0) this.x = canvas.width;
        if(this.x > canvas.width) this.x = 0;
        if(this.y < 0) this.y = canvas.height;
        if(this.y > canvas.height) this.y = 0;
      };
      Particle.prototype.draw = function(alphaMult){
        if(!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(157,255,32,' + (this.baseAlpha * alphaMult) + ')';
        ctx.fill();
      };

      function initParticles(){
        if(!canvas) return;
        particles = [];
        for(var i = 0; i < particleCount; i++) particles.push(new Particle());
      }
      initParticles();

      (function drawLoop(){
        if(ctx && canvas){
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          if(partAlpha > 0.01){
            for(var i = 0; i < particles.length; i++){
              particles[i].update();
              particles[i].draw(partAlpha);
            }
            for(var i = 0; i < particles.length; i++){
              for(var j = i + 1; j < particles.length; j++){
                var dx = particles[i].x - particles[j].x;
                var dy = particles[i].y - particles[j].y;
                var dist = Math.sqrt(dx * dx + dy * dy);
                if(dist < 110){
                  ctx.beginPath();
                  ctx.moveTo(particles[i].x, particles[i].y);
                  ctx.lineTo(particles[j].x, particles[j].y);
                  ctx.strokeStyle = 'rgba(157,255,32,' + ((1 - dist / 110) * 0.18 * partAlpha) + ')';
                  ctx.lineWidth = 0.6;
                  ctx.stroke();
                }
              }
            }
          }
        }
        requestAnimationFrame(drawLoop);
      })();

      // ── SERVICE NODES BUILDER ──
      var serviceData = [
        {label:'Branding', angle:320},
        {label:'UI / UX',  angle:40},
        {label:'Web Dev',  angle:105},
        {label:'SEO',      angle:165},
        {label:'Social',   angle:225}
      ];

      var svcStage = document.getElementById('stage-services');

      function buildNodes(){
        if(!svcStage) return;
        svcStage.innerHTML = '';
        var W = window.innerWidth, H = window.innerHeight;
        var cx = W / 2, cy = H / 2;
        var rad = Math.min(W, H) * 0.30;

        serviceData.forEach(function(s){
          var ang = (s.angle * Math.PI) / 180;
          var x = cx + Math.cos(ang) * rad;
          var y = cy + Math.sin(ang) * rad;

          var node = document.createElement('div');
          node.className = 'service-node';
          node.style.left = x + 'px';
          node.style.top = y + 'px';
          node.style.transform = 'translate(-50%,-50%)';

          var dot = document.createElement('div');
          dot.className = 'service-dot';

          var lbl = document.createElement('div');
          lbl.className = 'service-label';
          lbl.textContent = s.label;

          node.appendChild(dot);
          node.appendChild(lbl);
          svcStage.appendChild(node);

          var dx = x - cx, dy = y - cy;
          var len = Math.sqrt(dx * dx + dy * dy);
          var connAngle = Math.atan2(dy, dx) * (180 / Math.PI);
          var conn = document.createElement('div');
          conn.className = 'connector';
          conn.style.left = cx + 'px';
          conn.style.top = cy + 'px';
          conn.style.width = len + 'px';
          conn.style.transform = 'rotate(' + connAngle + 'deg)';
          svcStage.appendChild(conn);
        });
      }

      buildNodes();

      // Check if GSAP and ScrollTrigger are loaded
      if(typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined'){
        console.warn('GSAP or ScrollTrigger not loaded yet.');
        return;
      }

      gsap.registerPlugin(ScrollTrigger);

      // ── MASTER PINNED SCROLL TIMELINE ──
      // GSAP ScrollTrigger natively pins #hero-sticky for 3200px of scroll.
      // scrub: 1.2 provides butter-smooth interpolation with zero jitter.
      var masterTl = gsap.timeline({
        scrollTrigger: {
          trigger: '#hero-wrapper',
          pin: '#hero-sticky',
          start: 'top top',
          end: '+=3200',
          scrub: 1.2,
          anticipatePin: 1,
          onUpdate: function(self){
            var p = self.progress;
            var progEl = document.getElementById('scroll-progress');
            if(progEl) progEl.style.width = (p * 100) + '%';

            // Particle network visibility
            if(p < 0.18) partAlpha = 0;
            else if(p < 0.35) partAlpha = (p - 0.18) / 0.17;
            else if(p < 0.72) partAlpha = 1;
            else if(p < 0.95) partAlpha = (0.95 - p) / 0.23;
            else partAlpha = 0;
            if(canvas) canvas.style.opacity = partAlpha;
          }
        }
      });

      // ──────── STAGE 1: SIGNAL ────────
      masterTl
        // HUD labels fade and drift out gently
        .to('#welcome-label', {opacity: 0, x: -70, ease: 'power2.out', duration: 0.16}, 0.01)
        .to('#right-descriptors', {opacity: 0, x: 70, ease: 'power2.out', duration: 0.16}, 0.01)
        .to('#stats-block', {opacity: 0, y: 35, ease: 'power2.out', duration: 0.16}, 0.01)
        .to('#scroll-cue', {opacity: 0, duration: 0.10}, 0.01)

        // Aperture expands and smoothly crossfades into the brand wordmark
        .to('#main-visual', {scale: 1.45, rotate: 20, ease: 'power2.inOut', duration: 0.20}, 0.04)
        .to('#signal-stage', {opacity: 0, ease: 'power2.inOut', duration: 0.12}, 0.14)

      // ──────── STAGE 2: IDENTITY (WORDMARK) ────────
        // Wordmark enters smoothly with luminous glow
        .fromTo('#stage-wordmark', 
          {opacity: 0, scale: 0.86}, 
          {opacity: 1, scale: 1.0, ease: 'power2.out', duration: 0.12}, 0.14)
        .fromTo('#stage-wordmark .wordmark-text', 
          {letterSpacing: '0.08em'}, 
          {letterSpacing: '0.20em', ease: 'power2.out', duration: 0.16}, 0.14)
        .fromTo('#stage-wordmark .wordmark-sub', 
          {opacity: 0, y: 15}, 
          {opacity: 1, y: 0, ease: 'power2.out', duration: 0.12}, 0.18)
        .to('#ambient-glow', {scale: 1.4, opacity: 0.85, ease: 'power2.out', duration: 0.16}, 0.14)

        // Sustained hold (dwell period from 0.20 to 0.42)
        // Wordmark smoothly expands out into the Service constellation
        .to('#stage-wordmark', {scale: 1.22, opacity: 0, ease: 'power2.inOut', duration: 0.12}, 0.42)

      // ──────── STAGE 3: CONSTELLATION ────────
        // Constellation enters smoothly
        .fromTo('#stage-services', 
          {opacity: 0, scale: 0.88}, 
          {opacity: 1, scale: 1.0, ease: 'power2.out', duration: 0.12}, 0.42)
        .fromTo('.service-node', 
          {scale: 0, opacity: 0}, 
          {scale: 1, opacity: 1, stagger: 0.025, ease: 'back.out(1.5)', duration: 0.14}, 0.44)
        .fromTo('.connector', 
          {scaleX: 0}, 
          {scaleX: 1, stagger: 0.025, ease: 'power2.out', duration: 0.14}, 0.44)

        // Sustained hold (dwell period from 0.50 to 0.66)
        // Constellation dissolves into the 3D Interface
        .to('#stage-services', {scale: 1.15, opacity: 0, ease: 'power2.inOut', duration: 0.12}, 0.66)

      // ──────── STAGE 4: INTERFACE ────────
        // Interface mockup gracefully ascends with 3D depth
        .fromTo('#stage-interface', 
          {opacity: 0, scale: 0.80, rotateX: 16}, 
          {opacity: 1, scale: 1.0, rotateX: 0, ease: 'power3.out', duration: 0.14}, 0.66)
        .fromTo('.if-stat-card', 
          {y: 20, opacity: 0}, 
          {y: 0, opacity: 1, stagger: 0.03, duration: 0.12, ease: 'power2.out'}, 0.72)

        // Holds steadily throughout the scroll into the services section
        .to('#stage-interface', {scale: 0.98, opacity: 1, ease: 'none', duration: 0.18}, 0.82);

      // ── AFTER-HERO CONTENT TRIGGER ──
      gsap.from('#after-hero .section-eyebrow, #after-hero .section-title', {
        scrollTrigger: {
          trigger: '#after-hero',
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        },
        opacity: 0,
        y: 35,
        stagger: 0.14,
        duration: 0.8,
        ease: 'power3.out'
      });

      gsap.from('.service-card', {
        scrollTrigger: {
          trigger: '#services-grid',
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        },
        opacity: 0,
        y: 45,
        stagger: 0.10,
        duration: 0.8,
        ease: 'power3.out'
      });

      gsap.from('#cta-section .cta-title, #cta-section .cta-subtitle, #cta-section .cta-btn', {
        scrollTrigger: {
          trigger: '#cta-section',
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        },
        opacity: 0,
        y: 30,
        stagger: 0.12,
        duration: 0.8,
        ease: 'power3.out'
      });

      // ── RESIZE HANDLER ──
      var resizeT;
      window.addEventListener('resize', function(){
        clearTimeout(resizeT);
        resizeT = setTimeout(function(){
          resizeCanvas();
          initParticles();
          buildNodes();
          ScrollTrigger.refresh();
        }, 180);
      });

      // ── ACCESSIBILITY REDUCED MOTION ──
      if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
        gsap.globalTimeline.clear();
        ['#main-nav','#welcome-label','#stats-block','#right-descriptors','#signal-stage','#grid-lines'].forEach(function(id){
          var el = document.querySelector(id);
          if(el) el.style.opacity = '1';
        });
        document.querySelectorAll('.corner-mark').forEach(function(el){ el.style.opacity = '1'; });
        ScrollTrigger.getAll().forEach(function(t){ t.kill(); });
      }
    }

    if(document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', initApp);
    } else {
      initApp();
    }

  })();
