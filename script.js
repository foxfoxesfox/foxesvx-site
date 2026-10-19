const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── Fox eyes follow the pointer ──
const pupils = [...document.querySelectorAll('.pupil')];
if (pupils.length && !reduceMotion && window.matchMedia('(pointer: fine)').matches) {
  const REACH = 3; // how far a pupil may travel, in drawing units
  let pending = null;

  document.addEventListener('pointermove', e => {
    if (pending) return;
    pending = requestAnimationFrame(() => {
      pending = null;
      pupils.forEach(p => {
        const svg = p.ownerSVGElement;
        const box = svg.getBoundingClientRect();
        const vb = svg.viewBox.baseVal;
        const scale = box.width / vb.width;
        const cx = box.left + (p.cx.baseVal.value - vb.x) * scale;
        const cy = box.top + (p.cy.baseVal.value - vb.y) * scale;
        const dx = e.clientX - cx, dy = e.clientY - cy;
        const dist = Math.hypot(dx, dy) || 1;
        const pull = Math.min(REACH, dist / 60);
        p.style.transform = `translate(${(dx / dist) * pull}px, ${(dy / dist) * pull}px)`;
      });
    });
  });
}

// ── Fox blinks now and then ──
const eyes = document.querySelectorAll('.fox-eyes');
if (eyes.length && !reduceMotion) {
  (function blink() {
    setTimeout(() => {
      eyes.forEach(g => g.classList.add('is-blinking'));
      setTimeout(() => {
        eyes.forEach(g => g.classList.remove('is-blinking'));
        blink();
      }, 140);
    }, 2500 + Math.random() * 3500);
  })();
}

// ── Falling leaves in the background ──
if (!reduceMotion) {
  const LEAVES = [
    // almond leaf, outlined with veins
    `<svg viewBox="0 0 40 44"><path class="paper" d="M20 2 C31 9 34 25 21 37 C8 25 9 11 20 2 Z"/><path class="ink" d="M20 6 C21 18 21 28 21 42 M20 15 L26 11 M20 15 L14 11 M21 22 L27 18 M21 22 L14 18 M21 29 L26 26 M21 29 L15 26"/></svg>`,
    // solid leaf with a pale midrib
    `<svg viewBox="0 0 40 40"><path class="ink" d="M9 31 L3 37"/><path class="solid" d="M9 31 C4 18 14 6 34 5 C35 24 24 34 9 31 Z"/><path class="ink" d="M10 30 C17 22 24 14 31 8" style="stroke: var(--paper); --sw: 1.8"/></svg>`,
    // ginkgo fan
    `<svg viewBox="0 0 40 42"><path class="ink" d="M20 40 L20 25"/><path class="paper" d="M20 25 C10 25 4 17 5 7 C11 10 16 9 20 4 C24 9 29 10 35 7 C36 17 30 25 20 25 Z"/><path class="ink" d="M20 25 L12 11 M20 25 L20 9 M20 25 L28 11" style="--sw: 1.6"/></svg>`
  ];
  const count = window.innerWidth < 720 ? 5 : 9;
  const rand = (min, max) => min + Math.random() * (max - min);
  const layer = document.createElement('div');
  layer.className = 'leaves';
  layer.setAttribute('aria-hidden', 'true');

  for (let i = 0; i < count; i++) {
    const depth = Math.random(); // 0 = far (small, faint, slow), 1 = near
    const fall = rand(26, 38) - depth * 10;
    const leaf = document.createElement('span');
    leaf.className = 'leaf';
    leaf.innerHTML = LEAVES[i % LEAVES.length];
    leaf.style.cssText = `
      --x: ${((i + rand(0.1, 0.9)) / count) * 100}%;
      --size: ${Math.round(24 + depth * 28)}px;
      --o: ${(0.18 + depth * 0.22).toFixed(2)};
      --fall: ${fall.toFixed(1)}s;
      --delay: ${(-rand(0, fall)).toFixed(1)}s;
      --sway: ${Math.round(rand(16, 40))}px;
      --sway-time: ${rand(2.8, 4.6).toFixed(1)}s;
      --spin: ${Math.round(rand(14, 38))}deg;`;
    layer.appendChild(leaf);
  }
  document.body.prepend(layer);
}

// ── Typing cycle on "Currently" ──
const currentTextEl = document.getElementById('currently-text');

if (currentTextEl && !reduceMotion) {
  const statuses = [
    'Learning to dance better',
    'Looking to build more personal projects',
    'Vibe coding my own iOS application'
  ];
  let idx = -1;

  function typeText(text, cb) {
    currentTextEl.textContent = '';
    let i = 0;
    const t = setInterval(() => {
      currentTextEl.textContent += text[i++];
      if (i >= text.length) {
        clearInterval(t);
        setTimeout(cb, 2500);
      }
    }, 60);
  }

  function eraseText(cb) {
    const t = setInterval(() => {
      currentTextEl.textContent = currentTextEl.textContent.slice(0, -1);
      if (!currentTextEl.textContent) {
        clearInterval(t);
        cb();
      }
    }, 35);
  }

  function cycle() {
    idx = (idx + 1) % statuses.length;
    eraseText(() => typeText(statuses[idx], cycle));
  }

  setTimeout(cycle, 3000);
}

// ── Shared lightbox (artworks + gallery) ──
// Usage: const lb = initLightbox('assets/photos/'); lb.open(items, index);
// Each item: { file, title?, sub?, alt? }
function initLightbox(folder) {
  const box = document.getElementById('lightbox');
  if (!box) return null;

  const img = document.getElementById('lightboxImg');
  const caption = document.getElementById('lightboxCaption'); // optional
  const closeBtn = box.querySelector('.lightbox-close');
  let items = [];
  let current = 0;
  let lastFocused = null;

  function show(index) {
    current = (index + items.length) % items.length;
    const item = items[current];
    img.src = folder + item.file;
    img.alt = item.alt || item.title || `Image ${current + 1} of ${items.length}`;
    if (caption) caption.textContent = [item.title, item.sub].filter(Boolean).join(' · ');
  }

  function close() {
    box.classList.remove('open');
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  box.addEventListener('click', close);

  document.addEventListener('keydown', e => {
    if (!box.classList.contains('open')) return;
    if (e.key === 'Escape')     close();
    if (e.key === 'ArrowRight') show(current + 1);
    if (e.key === 'ArrowLeft')  show(current - 1);
  });

  return {
    open(list, index) {
      items = list;
      lastFocused = document.activeElement;
      show(index);
      box.classList.add('open');
      document.body.style.overflow = 'hidden';
      if (closeBtn) closeBtn.focus();
    }
  };
}
