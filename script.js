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
