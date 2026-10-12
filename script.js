// ── Custom cursor ──
const dot = document.getElementById('cursorDot');
if (dot) {
  if (window.matchMedia('(pointer: fine)').matches) {
    document.addEventListener('mousemove', e => {
      dot.style.left = e.clientX + 'px';
      dot.style.top  = e.clientY + 'px';
    });
  } else {
    dot.style.display = 'none';
  }
}

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── Glitch name effect on hover ──
const nameEl = document.querySelector('.name');
if (nameEl && !reduceMotion) {
  const original = nameEl.textContent;
  const chars = '!@#$%<>?/\\|[]{}';
  let glitchInterval = null;

  nameEl.addEventListener('mouseenter', () => {
    let iterations = 0;
    clearInterval(glitchInterval);
    glitchInterval = setInterval(() => {
      nameEl.textContent = original
        .split('')
        .map((char, i) => (char === ' ' || i < iterations)
          ? char
          : chars[Math.floor(Math.random() * chars.length)])
        .join('');
      if (iterations >= original.length) {
        clearInterval(glitchInterval);
        nameEl.textContent = original;
      }
      iterations += 0.5;
    }, 40);
  });
}

// ── Typing cycle on "Currently" ──
const currentTextEl = document.getElementById('currently-text');
const currentIconEl = document.getElementById('currently-icon');

if (currentTextEl && currentIconEl && !reduceMotion) {
  const statuses = [
    { icon: '🕺', text: 'Learning to dance better' },
    { icon: '🔨', text: 'Looking to build more personal projects' },
    { icon: '💻', text: 'Vibe coding my own iOS application' }
  ];
  let idx = 0;

  function typeText(status, cb) {
    currentIconEl.textContent = status.icon;
    currentTextEl.textContent = '';
    let i = 0;
    const t = setInterval(() => {
      currentTextEl.textContent += status.text[i++];
      if (i >= status.text.length) {
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
    }
  };
}
