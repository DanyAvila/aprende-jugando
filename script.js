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
    audioActual.play().catch(() => say(nombre));  // si falta el mp3, usa la voz
  } catch (e) {}
}
function victoria() {
  try {
    speechSynthesis.cancel();
    if (audioActual) { audioActual.pause(); audioActual.currentTime = 0; }
    audioActual = new Audio('VICTORIA.mp3');
    audioActual.play().catch(() => say('¡Lo lograste! ¡Muy bien!'));
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
  if ($('ttl')) $('ttl').textContent = ['Aprende Jugando 🌟', '🍎 Memorama', '🔺 Figuras', '💬 Sílabas', '➕ Sumas', '🎨 Colores'][n];
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
  [0, g1, g2, g3, g4, g5][g]();
});

/* ---- Juego 1 ---- */
const FR = [
  ['🍎', 'Manzana'], ['🍌', 'Plátano'], ['🍇', 'Uva'], ['🍐', 'Pera'],
  ['🍊', 'Naranja'], ['🍓', 'Fresa'], ['🍉', 'Sandia'], ['🍍', 'Piña'],
  ['🥭', 'Mango'], ['🍑', 'Durazno'], ['🍒', 'Cereza'], ['🍋', 'Limón']
];

const NIVELES = [
  { nombre: 'Fácil',   pares: 4,  cols: 4 },  // 8 cartas
  { nombre: 'Medio',   pares: 8,  cols: 4 },  // 16 cartas
  { nombre: 'Difícil', pares: 12, cols: 6 }   // 24 cartas
];
let nivel = 0, total = 4;
let open1 = [], lock = false, found = 0;

function g1(n = 0) {
  stopAll();                       // cancela esperas del nivel anterior
  nivel = n;
  total = NIVELES[n].pares;
  found = 0; open1 = []; lock = false;

  $('again1').style.display = 'none';
  $('m1').textContent = 'Toca una carta';
  document.querySelectorAll('#niv .btn').forEach(b =>
    b.classList.toggle('act', +b.dataset.n === n));

  $('b1').style.setProperty('--cols', NIVELES[n].cols);
  $('b1').style.maxWidth = NIVELES[n].cols === 6 ? '760px' : '560px';
  $('b1').innerHTML = '';

  const set = shuf(FR).slice(0, total);
  shuf([...set, ...set]).forEach(f => {
    const c = document.createElement('button');
    c.className = 'c';
    c.setAttribute('aria-label', 'Carta');
    c.innerHTML = '<i><b>❓</b><u>' + f[0] + '</u></i>';
    c.onclick = () => flip(c, f);
    $('b1').appendChild(c);
  });
}

document.querySelectorAll('#niv .btn').forEach(b =>
  b.onclick = () => { pop(); g1(+b.dataset.n); });

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
    if (found === total) {
      await wait(1200);
      if (my !== gen) return;
      confetti();
      victoria();

      if (nivel === NIVELES.length - 1) {
        // Terminó todos los niveles
        $('m1').textContent = '🏆 ¡Terminaste todos los niveles! 🏆';
        $('again1').textContent = '🔁 Jugar de nuevo';
        $('again1').style.display = '';
      } else {
        // Pasa solo al siguiente nivel
        $('m1').textContent = '🎉 ¡Muy bien! Vamos al nivel ' + (nivel + 2) + ' 🎉';
        await wait(3500);
        if (my !== gen) return;
        g1(nivel + 1);
      }
    }
  } else {
    a.classList.remove('f');
    b.classList.remove('f');
    $('m1').textContent = '¡Casi! Intenta otra vez 💛';
  }
  lock = false;
}

$('again1').onclick = () => { pop(); g1(0); };

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
  { p: 'mariposa', s: ['ma', 'ri', 'po', 'sa'], f: 'g', c: '🦋' },
  { p: 'gato', s: ['ga', 'to'], f: 'j', c: '🐱' }
  

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


/* ---- Juego 4: Sumas divertidas ---- */
// e = emoji, a = primer grupo, b = segundo grupo. Cambia el orden o los números aquí.
const SUMAS = [
  { e: '🍎', a: 2, b: 4 },
  { e: '⭐', a: 4, b: 2 },
  { e: '😊', a: 3, b: 2 },
  { e: '🌸', a: 5, b: 1 },
  { e: '❤️', a: 4, b: 3 },
  { e: '🐸', a: 2, b: 3 },
  { e: '✏️', a: 6, b: 1 },
  { e: '🦋', a: 3, b: 2 },
  { e: '🟣', a: 4, b: 4 },
  { e: '☀️', a: 2, b: 3 }
];
let n4 = 0, busy4 = false;

const grupo = (e, n) => '<div class="grp">' + ('<span>' + e + '</span>').repeat(n) + '</div>';

function g4() {
  n4 = 0;
  $('again4').style.display = 'none';
  ronda();
}

function ronda() {
  const s = SUMAS[n4], r = s.a + s.b;
  busy4 = false;
  $('m4').textContent = 'Cuenta y arrastra la respuesta (' + (n4 + 1) + ' de ' + SUMAS.length + ')';
  $('eq').innerHTML = grupo(s.e, s.a) + '<b>+</b>' + grupo(s.e, s.b) + '<b>=</b><div class="box" id="box"></div>';

  // Respuesta correcta + 2 números al azar distintos (del 1 al 15)
  const op = new Set([r]);
  while (op.size < 3) op.add(1 + Math.floor(Math.random() * 15));

  $('opts').innerHTML = '';
  shuf([...op]).forEach(v => {
    const t = document.createElement('div');
    t.className = 'num';
    t.textContent = v;
    t.setAttribute('role', 'button');
    dragNum(t, v, r);
    $('opts').appendChild(t);
  });
}

function dragNum(t, v, r) {
  let sx, sy, mv = false;
  t.onpointerdown = e => {
    if (busy4) return;
    e.preventDefault();
    sx = e.clientX; sy = e.clientY; mv = false;
    t.setPointerCapture(e.pointerId);
  };
  t.onpointermove = e => {
    if (sx === undefined) return;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (!mv && Math.hypot(dx, dy) > 8) { mv = true; t.classList.add('drag'); }
    if (mv) t.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
  };
  t.onpointerup = e => {
    if (sx === undefined) return;
    sx = undefined;
    const was = mv;
    t.classList.remove('drag');
    t.style.transform = '';
    if (was) {  // si lo soltó fuera del cuadro, no pasa nada
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (!(el && el.closest('#box'))) return;
    }
    responder(t, v, r);  // soltó en el cuadro, o solo lo tocó
  };
  t.onpointercancel = () => { sx = undefined; t.classList.remove('drag'); t.style.transform = ''; };
}

async function responder(t, v, r) {
  if (busy4) return;
  const my = gen, s = SUMAS[n4];
  if (v === r) {
    busy4 = true;
    $('box').textContent = v;
    $('box').classList.add('ok');
    t.style.visibility = 'hidden';
    win();
    say('¡Muy bien! ' + s.a + ' más ' + s.b + ' son ' + r);
    await wait(2800);
    if (my !== gen) return;
    if (++n4 >= SUMAS.length) {
      confetti();
      victoria();
      $('m4').textContent = '🏆 ¡Terminaste las sumas! 🏆';
      $('eq').innerHTML = '';
      $('opts').innerHTML = '';
      $('again4').style.display = '';
    } else ronda();
  } else {
    oops();
    t.classList.add('shake');
    setTimeout(() => t.classList.remove('shake'), 500);
    $('m4').textContent = 'Casi, ¡cuenta otra vez! 💛';
    say('Intenta otra vez');
  }
}

$('again4').onclick = () => { pop(); g4(); };


/* ---- Juego 5: Sigue la línea (colores) ---- */
// n = nombre, c = color, d = número del círculo de destino (0 = el de arriba ... 5 = el de abajo)
const COL5 = [
  { n: 'Azul claro',   c: '#12a8ff', d: 4 },
  { n: 'Verde oscuro', c: '#0aa65b', d: 3 },
  { n: 'Rojo',         c: '#ff2020', d: 1 },
  { n: 'Amarillo',     c: '#ffe600', d: 0 },
  { n: 'Azul',         c: '#0a52e6', d: 5 },
  { n: 'Verde',        c: '#4cd137', d: 2 }
];
const Y5 = i => 50 + i * 92;   // altura de cada círculo
let done5 = 0;

function pt(e) {  // pasa la posición del dedo/ratón a coordenadas del dibujo
  const svg = $('svg5'), p = svg.createSVGPoint();
  p.x = e.clientX; p.y = e.clientY;
  return p.matrixTransform(svg.getScreenCTM().inverse());
}

function g5() {
  done5 = 0;
  $('again5').style.display = 'none';
  $('m5').textContent = 'Sigue la línea y arrastra el color';
  let h = '';
  COL5.forEach((o, i) => {
    h += '<path class="ln" id="ln' + i + '" d="M82,' + Y5(i) + ' C190,' + Y5(i) + ' 210,' + Y5(o.d) + ' 318,' + Y5(o.d) + '"/>';
  });
  for (let j = 0; j < 6; j++) h += '<circle class="dst" id="dst' + j + '" cx="350" cy="' + Y5(j) + '" r="32"/>';
  COL5.forEach((o, i) => {
    h += '<g class="src" data-i="' + i + '"><g class="in"><circle cx="50" cy="' + Y5(i) + '" r="32" fill="' + o.c + '"/></g></g>';
  });
  $('svg5').innerHTML = h;
  document.querySelectorAll('#svg5 .src').forEach(dragCol);
}

function volver(g) {
  g.style.transition = 'transform .3s';
  g.style.transform = '';
  setTimeout(() => { g.style.transition = ''; }, 320);
}

function dragCol(g) {
  const i = +g.dataset.i, o = COL5[i], inn = g.firstChild;
  let s = null, mv = false, dx = 0, dy = 0;
  g.onpointerdown = e => {
    if (g.dataset.done) return;
    e.preventDefault();
    s = pt(e); mv = false; dx = 0; dy = 0;
    g.style.transition = 'none';
    g.setPointerCapture(e.pointerId);
  };
  g.onpointermove = e => {
    if (!s) return;
    const p = pt(e);
    dx = p.x - s.x; dy = p.y - s.y;
    if (!mv && Math.hypot(dx, dy) > 6) mv = true;
    if (mv) g.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
  };
  g.onpointerup = () => {
    if (!s) return;
    s = null;
    if (!mv) { pop(); say(o.n); return; }       // un toque solo dice el color
    const cx = 50 + dx, cy = Y5(i) + dy;         // centro del círculo arrastrado
    let j = -1, best = 50;
    for (let k = 0; k < 6; k++) {
      const d = Math.hypot(cx - 350, cy - Y5(k));
      if (d < best) { best = d; j = k; }
    }
    if (j < 0 || $('dst' + j).dataset.full) { volver(g); return; }  // lo soltó lejos
    if (j === o.d) acertar(g, i, j); else equivocar(g, inn);
  };
  g.onpointercancel = () => { s = null; volver(g); };
}

function acertar(g, i, j) {
  const o = COL5[i], my = gen;
  $('dst' + j).style.fill = o.c;          // se pinta el círculo
  $('dst' + j).dataset.full = 1;
  $('ln' + i).style.stroke = o.c;         // y la línea
  g.dataset.done = 1;
  g.style.visibility = 'hidden';
  $('m5').textContent = '¡Muy bien! ' + o.n + ' ✨';
  win();
  say('¡Muy bien! ' + o.n);
  if (++done5 === 6) {
    setTimeout(() => {
      if (my !== gen) return;
      confetti();
      victoria();
      $('m5').textContent = '🎉 ¡Pintaste todos los colores! 🎉';
      $('again5').style.display = '';
    }, 2200);
  }
}

function equivocar(g, inn) {
  oops();
  say('Incorrecto');
  $('m5').textContent = 'Incorrecto, ¡sigue la línea otra vez! 💛';
  inn.animate([
    { transform: 'translateX(0)' }, { transform: 'translateX(-10px)' },
    { transform: 'translateX(10px)' }, { transform: 'translateX(-10px)' },
    { transform: 'translateX(10px)' }, { transform: 'translateX(0)' }
  ], { duration: 450 });
  setTimeout(() => volver(g), 500);       // regresa a su lugar
}

$('again5').onclick = () => { pop(); g5(); };