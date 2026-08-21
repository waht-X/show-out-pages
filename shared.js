(function () {
  var stars = document.getElementById('stars');
  if (stars) {
    var ctx = stars.getContext('2d');
    var W, H, particles = [];
    var mouse = { x: -9999, y: -9999 };

    function resize() {
      W = stars.width = window.innerWidth;
      H = stars.height = window.innerHeight;
      var count = Math.min(170, Math.floor(W * H / 8500));
      particles = [];
      for (var i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: Math.random() * 1.7 + 0.3,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          hue: Math.random() * 60 + 280,
          tw: Math.random() * Math.PI * 2
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx; p.y += p.vy; p.tw += 0.035;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        var dx = p.x - mouse.x, dy = p.y - mouse.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150 && dist > 0.01) { p.x += dx / dist * 0.8; p.y += dy / dist * 0.8; }
        var alpha = 0.35 + 0.55 * Math.abs(Math.sin(p.tw));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'hsla(' + p.hue + ', 90%, 72%, ' + alpha + ')';
        ctx.fill();
      }
      requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', function (e) { mouse.x = e.clientX; mouse.y = e.clientY; });
    window.addEventListener('touchmove', function (e) { if (e.touches[0]) { mouse.x = e.touches[0].clientX; mouse.y = e.touches[0].clientY; } }, { passive: true });
    resize();
    draw();
  }

  window.burstHearts = function (n) {
    var colors = ['#ff6ec4', '#ffb86b', '#7ef9ff', '#ff8fab', '#ff5d8f', '#a78bfa'];
    n = n || 22;
    for (var i = 0; i < n; i++) {
      (function () {
        var h = document.createElement('span');
        h.className = 'heart';
        h.textContent = ['\uD83D\uDC96', '\uD83D\uDC97', '\uD83D\uDC95', '\uD83D\uDC9E', '\uD83D\uDC98', '\u2665'][Math.floor(Math.random() * 6)];
        h.style.left = (Math.random() * 100) + 'vw';
        h.style.top = (60 + Math.random() * 40) + 'vh';
        h.style.color = colors[Math.floor(Math.random() * colors.length)];
        h.style.fontSize = (12 + Math.random() * 20) + 'px';
        h.style.animationDelay = (Math.random() * 0.9) + 's';
        document.body.appendChild(h);
        setTimeout(function () { h.remove(); }, 4200);
      })();
    }
  };

  window.fireworks = function (dur) {
    var cv = document.getElementById('fx');
    if (!cv) return;
    var cx = cv.getContext('2d');
    var W = cv.width = window.innerWidth;
    var H = cv.height = window.innerHeight;
    var rockets = [];
    var running = true;

    function boom(x, y) {
      var colors = ['#ff6ec4', '#ffb86b', '#7ef9ff', '#ff8fab', '#a78bfa'];
      var n = 70;
      for (var i = 0; i < n; i++) {
        var a = Math.random() * Math.PI * 2;
        var sp = Math.random() * 5 + 2;
        rockets.push({
          x: x, y: y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          life: 1,
          decay: 0.012 + Math.random() * 0.014,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
    }

    function loop() {
      cx.clearRect(0, 0, W, H);
      if (Math.random() < 0.09) boom(Math.random() * W, Math.random() * H * 0.5);
      for (var i = rockets.length - 1; i >= 0; i--) {
        var p = rockets[i];
        p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.vx *= 0.985; p.life -= p.decay;
        if (p.life <= 0) { rockets.splice(i, 1); continue; }
        cx.globalAlpha = Math.max(0, p.life);
        cx.beginPath();
        cx.arc(p.x, p.y, 1.8, 0, Math.PI * 2);
        cx.fillStyle = p.color;
        cx.fill();
      }
      cx.globalAlpha = 1;
      if (running) requestAnimationFrame(loop);
    }

    window.addEventListener('resize', function () { W = cv.width = window.innerWidth; H = cv.height = window.innerHeight; });
    loop();
    if (dur) setTimeout(function () { running = false; cx.clearRect(0, 0, W, H); }, dur);
  };

  var audioCtx = null, musicOn = false, musicTimer = null, musicStep = 0;

  function initAudio() {
    if (!audioCtx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audioCtx = new AC();
    }
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  }

  function playNote(freq, time, dur, vol, type) {
    if (!audioCtx) return;
    var o = audioCtx.createOscillator();
    var g = audioCtx.createGain();
    o.type = type || 'sine';
    o.frequency.value = freq;
    o.connect(g); g.connect(audioCtx.destination);
    var t0 = audioCtx.currentTime + time;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol || 0.12, t0 + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.start(t0); o.stop(t0 + dur + 0.05);
  }

  var melody = [
    440, 523.25, 659.25, 783.99,
    659.25, 523.25, 440, 349.23,
    392, 493.88, 587.33, 698.46,
    587.33, 493.88, 440, 523.25
  ];

  window.toggleMusic = function (btn) {
    initAudio();
    if (musicOn) {
      musicOn = false;
      clearInterval(musicTimer);
      musicTimer = null;
      if (btn) btn.classList.remove('on');
      return;
    }
    musicOn = true;
    if (btn) btn.classList.add('on');
    musicTimer = setInterval(function () {
      var f = melody[musicStep % melody.length];
      playNote(f, 0, 1.4, 0.09, 'sine');
      playNote(f / 2, 0, 1.4, 0.06, 'triangle');
      if (musicStep % 4 === 0) playNote(f * 2, 0.05, 0.9, 0.03, 'sine');
      musicStep++;
    }, 520);
  };
})();
