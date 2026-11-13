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

// ── Frame counter in the slate ticks at 12 fps, like a pencil test shot on twos ──
const frame = document.getElementById('fr');
if (frame && !reduceMotion) {
  let n = 1;
  setInterval(() => { n = n % 999 + 1; frame.textContent = String(n).padStart(3, '0'); }, 1000 / 12);
}

// ── Intro types itself out once ──
const intro = document.getElementById('intro');
if (intro && !reduceMotion) {
  const text = intro.textContent;
  // Screen readers get the whole sentence; the typed copy is visual only.
  // The not-yet-typed part keeps its space (visibility: hidden) so nothing reflows.
  const full = Object.assign(document.createElement('span'), { className: 'sr-only', textContent: text });
  const shown = document.createElement('span');
  shown.setAttribute('aria-hidden', 'true');
  const typed = document.createElement('span');
  const caret = Object.assign(document.createElement('span'), { className: 'caret' });
  const rest = Object.assign(document.createElement('span'), { className: 'untyped', textContent: text });
  shown.append(typed, caret, rest);
  intro.replaceChildren(full, shown);

  let i = 0;
  setTimeout(function step() {
    i++;
    typed.textContent = text.slice(0, i);
    rest.textContent = text.slice(i);
    if (i < text.length) setTimeout(step, text[i - 1] === '.' || text[i - 1] === ',' ? 180 : 20);
    else setTimeout(() => caret.remove(), 1600);
  }, 700);
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
