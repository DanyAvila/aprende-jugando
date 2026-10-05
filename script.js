const $ = id => document.getElementById(id);
const shuf = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(x => x[1]);
const wait = ms => new Promise(r => setTimeout(r, ms));

let AC, timers = [];

//SONIDO DE PIPP PARA LOS BOTONES 
function tone(f, d = .15, t = 'sine', when = 0) {
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    const o = AC.createOscillator(), g = AC.createGain();
    o.type = t;
    o.frequency.value = f;
    g.gain.setValueAtTime(.15, AC.currentTime + when);
    g.gain.exponentialRampToValueAtTime(.001, AC.currentTime + when + d);
    o.connect(g).connect(AC.destination);
    o.start(AC.currentTime + when);
    o.stop(AC.currentTime + when + d);
  } catch (e) {}
}

const pop = () => tone(620, .1);
const win = () => [523, 659, 784, 1046].forEach((f, i) => tone(f, .25, 'triangle', i * .14));
const oops = () => tone(220, .25, 'sine');

function say(t) {
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(t);
    u.lang = 'es-MX';
    u.rate = .85;
    speechSynthesis.speak(u);
  } catch (e) {}
}

let audioActual = null;  //CAMBIOOO DE AUDIOO

function sonarFruta(nombre) {
  try {
    speechSynthesis.cancel();                 // calla a voz roboticaaa
    if (audioActual) { audioActual.pause(); audioActual.currentTime = 0; }
    // "Plátano" porque no tine acentoo cambiooo
    const archivo = nombre.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    audioActual = new Audio(archivo + '.mp3');
    audioActual.play();
  } catch (e) {}
}
function confetti() {
  for (let i = 0; i < 28; i++) {
    const s = document.createElement('span');
    s.className = 'cf';
    s.textContent = ['⭐', '🎉', '✨', '💖', '🌈'][i % 5];
    s.style.left = Math.random() * 100 + 'vw';
    s.style.animationDelay = Math.random() * .6 + 's';
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 3200);
  }
}

function show(n) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('on'));
  $('s' + n).classList.add('on');
  $('home').style.display = n ? '' : 'none';
  $('ttl').textContent = ['Aprende Jugando 🌟', '🍎 Memorama', '🔺 Figuras', '💬 Sílabas'][n];
  try { speechSynthesis.cancel(); } catch (e) {}
  window.scrollTo(0, 0);
}

$('home').onclick = () => { pop(); stopAll(); show(0); };

let gen = 0;
function stopAll() { gen++; }

document.querySelectorAll('.mcard').forEach(b => b.onclick = () => {
  pop();
  stopAll();
  const g = +b.dataset.g;
  show(g);
  [0, g1, g2, g3][g]();
});

/* ---- Juego 1 ---- */
const FR = [
  ['🍎', 'Manzana'],
  ['🍌', 'Plátano'],
  ['🍇', 'Uva'],
  ['🍐', 'Pera'],
  ['🍊', 'Naranja'],
  ['🍓', 'Fresa']
];

let open1 = [], lock = false, found = 0;

function g1() {
  found = 0; open1 = []; lock = false;
  $('again1').style.display = 'none';
  $('m1').textContent = 'Toca una carta';
  const set = shuf(FR).slice(0, 4);
  $('b1').innerHTML = '';
  shuf([...set, ...set]).forEach(f => {
    const c = document.createElement('button');
    c.className = 'c';
    c.setAttribute('aria-label', 'Carta');
    c.innerHTML = '<i><b>❓</b><u>' + f[0] + '</u></i>';
    c.onclick = () => flip(c, f);
    $('b1').appendChild(c);
  });
}

async function flip(c, f) {
  if (lock || c.classList.contains('f')) return;
  const my = gen;
  c.classList.add('f');
  pop();
  sonarFruta(f[1]);
  open1.push([c, f]);
  
  if (open1.length < 2) return;
  lock = true;
  const [[a, fa], [b, fb]] = open1;
  open1 = [];
  await wait(1100);
  if (my !== gen) return;

  if (fa[0] === fb[0]) {
    a.classList.add('m');
    b.classList.add('m');
    win();
    sonarFruta(fa[1]);  //YA NO DICE EXCELENTE 
    $('m1').textContent = '¡Excelente! ' + fa[0];
    found++;
    if (found === 4) {
      await wait(1200);
      if (my !== gen) return;
      confetti();
      say('¡Lo lograste! ¡Muy bien!');
      $('m1').textContent = '🎉 ¡Lo lograste! 🎉';
      $('again1').style.display = '';
    }
  } else {
    a.classList.remove('f');
    b.classList.remove('f');
    $('m1').textContent = '¡Casi! Intenta otra vez 💛';
  }
  lock = false;
}

$('again1').onclick = () => { pop(); g1(); };

/* ---- Juego 2 ---- */
const SH = {
  circulo: ['Círculo', '<circle cx="50" cy="50" r="40"/>', '#ffb3b3'],
  cuadrado: ['Cuadrado', '<rect x="12" y="12" width="76" height="76" rx="10"/>', '#b8e6b0'],
  triangulo: ['Triángulo', '<polygon points="50,10 92,88 8,88"/>', '#ffd9a0'],
  estrella: ['Estrella', '<polygon points="50,8 61,38 93,38 67,57 77,90 50,70 23,90 33,57 7,38 39,38"/>', '#fff0a0'],
  corazon: ['Corazón', '<path d="M50 88C10 58 6 30 28 18 40 12 50 22 50 30 50 22 60 12 72 18 94 30 90 58 50 88Z"/>', '#f7b8dc']
};

const sv = (k, fill, st) => '<svg viewBox="0 0 100 100" fill="' + fill + '" stroke="' + st + '" stroke-width="4" stroke-linejoin="round">' + SH[k][1] + '</svg>';
let sel = null, done2 = 0;

function g2() {
  done2 = 0; sel = null;
  $('again2').style.display = 'none';
  $('m2').textContent = 'Arrastra o toca una figura y luego su silueta';
  $('holes').innerHTML = '';
  $('pcs').innerHTML = '';

  Object.keys(SH).forEach(k => {
    const d = document.createElement('div');
    d.className = 'slot';
    d.innerHTML = '<div class="hole" data-k="' + k + '">' + sv(k, 'none', '#b8b8c4').replace('stroke-width="4"', 'stroke-width="3" stroke-dasharray="6 6" opacity=".5"') + '</div>' + SH[k][0];
    d.firstChild.onclick = () => { if (sel) place(sel, d.firstChild); };
    $('holes').appendChild(d);
  });

  shuf(Object.keys(SH)).forEach(k => {
    const p = document.createElement('div');
    p.className = 'pc';
    p.dataset.k = k;
    p.setAttribute('role', 'button');
    p.setAttribute('aria-label', SH[k][0]);
    p.innerHTML = sv(k, SH[k][2], '#6b6b80');
    drag(p);
    $('pcs').appendChild(p);
  });
}

function place(p, h) {
  if (p.dataset.k === h.dataset.k) {
    h.innerHTML = sv(p.dataset.k, SH[p.dataset.k][2], '#6b6b80');
    h.classList.add('ok');
    p.remove();
    sel = null;
    pop();
    const n = SH[h.dataset.k][0];
    say('¡Muy bien! ' + n);
    $('m2').textContent = '¡Muy bien! ' + n + ' ✨';

    if (++done2 === 5) {
      setTimeout(() => {
        win();
        confetti();
        say('¡Felicidades! Completaste todas las figuras');
        $('m2').textContent = '🎉 ¡Completaste todas las figuras! 🎉';
        $('again2').style.display = '';
      }, 1500);
    }
  } else {
    oops();
    p.classList.remove('sel');
    sel = null;
    h.classList.add('shake');
    setTimeout(() => h.classList.remove('shake'), 500);
    $('m2').textContent = 'Casi, ¡prueba otra vez! 💛';
    say('Intenta otra vez');
  }
}

function drag(p) {
  let sx, sy, mv = false;
  p.onpointerdown = e => {
    e.preventDefault();
    sx = e.clientX; sy = e.clientY;
    mv = false;
    p.setPointerCapture(e.pointerId);
  };
  p.onpointermove = e => {
    if (sx === undefined) return;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (!mv && Math.hypot(dx, dy) > 8) {
      mv = true;
      p.classList.add('drag');
    }
    if (mv) p.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
  };
  p.onpointerup = e => {
    if (sx === undefined) return;
    sx = undefined;
    const was = mv;
    p.classList.remove('drag');
    p.style.transform = '';
    if (!was) {
      document.querySelectorAll('.pc').forEach(x => x.classList.remove('sel'));
      sel = p;
      p.classList.add('sel');
      pop();
      say(SH[p.dataset.k][0]);
      return;
    }
    const t = document.elementFromPoint(e.clientX, e.clientY), h = t && t.closest('.hole');
    if (h && !h.classList.contains('ok')) place(p, h);
  };
  p.onpointercancel = () => {
    sx = undefined;
    p.classList.remove('drag');
    p.style.transform = '';
  };
}

$('again2').onclick = () => { pop(); g2(); };

/* ---- Juego 3 ---- */
const PAL = [
  { p: 'sirena', s: ['si', 're', 'na'], f: 'o', c: '🧜‍♀️' },
  { p: 'cocodrilo', s: ['co', 'co', 'dri', 'lo'], f: 'j', c: '🐊' },
  { p: 'dinosaurio', s: ['di', 'no', 'sau', 'rio'], f: 'p', c: '🦕' },
  { p: 'pelota', s: ['pe', 'lo', 'ta'], f: 'k', c: '⚽' },
  { p: 'mariposa', s: ['ma', 'ri', 'po', 'sa'], f: 'g', c: '🦋' }
];

let lv = 0, lives = 3, pick = [], busy = false;

function g3() {
  lv = 0; lives = 3; level();
}

function hearts() {
  $('lives').textContent = '❤️'.repeat(lives) + '🤍'.repeat(3 - lives);
}

function level() {
  const w = PAL[lv];
  pick = []; busy = false;
  hearts();
  $('stage').className = 'stage ' + w.f;
  $('hero').textContent = w.c;
  $('drop').className = 'drop';

  const bs = shuf(w.s.map((t, i) => ({ t, i })));
  $('bub').innerHTML = '';

  bs.forEach((o, k) => {
    const b = document.createElement('button');
    b.className = 'bb';
    b.textContent = o.t;
    b.style.animationDelay = (k * .4) + 's';
    b.onclick = () => {
      if (busy || b.classList.contains('used')) return;
      b.classList.add('used');
      pick.push({ t: o.t, b });
      pop();
      say(o.t);
      draw();
      if (pick.length === w.s.length) check();
    };
    $('bub').appendChild(b);
  });
  draw();
}

function draw() {
  const w = PAL[lv];
  $('drop').innerHTML = '';
  w.s.forEach((_, i) => {
    const s = document.createElement('div');
    s.className = 'sl';
    if (pick[i]) {
      s.classList.add('fill');
      s.textContent = pick[i].t;
      s.onclick = () => {
        if (busy) return;
        pick.splice(i).forEach(x => x.b.classList.remove('used'));
        pop();
        draw();
      };
    }
    $('drop').appendChild(s);
  });
}

async function check() {
  const w = PAL[lv], my = gen;
  busy = true;
  await wait(700);
  if (my !== gen) return;

  if (pick.map(x => x.t).join('') === w.p) {
    $('drop').classList.add('ok');
    win();
    confetti();
    const N = w.p[0].toUpperCase() + w.p.slice(1);
    say('¡' + w.p.toUpperCase().split('').join(', ') + '! ¡' + N + '!');
    await wait(3200);
    if (my !== gen) return;

    if (++lv >= PAL.length) {
      $('hero').textContent = '🏆';
      $('drop').innerHTML = '<div class="sl fill">¡Ganaste!</div>';
      $('bub').innerHTML = '<button class="btn">🔁 Jugar de nuevo</button>';
      $('bub').firstChild.onclick = () => { pop(); g3(); };
      say('¡Felicidades! Completaste todos los niveles');
      confetti();
    } else level();
  } else {
    oops();
    $('drop').classList.add('shake');
    document.querySelectorAll('.sl.fill').forEach(s => s.classList.add('bad'));
    lives--;
    say('Casi. Intenta otra vez');
    await wait(1000);
    if (my !== gen) return;
    $('drop').classList.remove('shake');
    if (lives <= 0) {
      lives = 3;
      say('Vamos a intentarlo de nuevo, tú puedes');
    }
    level();
  }
}