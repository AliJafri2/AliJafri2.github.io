// Ambient light on the cards: a faint glow that eases toward the cursor
// (rather than snapping to it). Only on devices with a real hover pointer,
// and not when reduced motion is requested.
const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (canHover && !reduceMotion) {
  const EASE = 0.12; // fraction of the remaining distance covered each frame

  for (const tile of document.querySelectorAll('.tile')) {
    let tx = 0, ty = 0; // target (cursor) position
    let x = 0, y = 0; // current light position
    let frame = null;

    const step = () => {
      x += (tx - x) * EASE;
      y += (ty - y) * EASE;
      tile.style.setProperty('--mx', `${x.toFixed(1)}px`);
      tile.style.setProperty('--my', `${y.toFixed(1)}px`);
      // keep animating until the light has caught up
      frame = Math.abs(tx - x) + Math.abs(ty - y) > 0.5 ? requestAnimationFrame(step) : null;
    };

    tile.addEventListener('pointerenter', (e) => {
      const r = tile.getBoundingClientRect();
      // start the light where the cursor enters, so it fades in in place
      x = tx = e.clientX - r.left;
      y = ty = e.clientY - r.top;
      tile.style.setProperty('--mx', `${x}px`);
      tile.style.setProperty('--my', `${y}px`);
    });

    tile.addEventListener('pointermove', (e) => {
      const r = tile.getBoundingClientRect();
      tx = e.clientX - r.left;
      ty = e.clientY - r.top;
      if (!frame) frame = requestAnimationFrame(step);
    });
  }
}

// "recursive sense of curiosity": spin on hover (or tap). The roll always plays
// to the end, then resets so it can be triggered again.
for (const phrase of document.querySelectorAll('.roll')) {
  const words = phrase.querySelectorAll('.w');
  const last = words[words.length - 1];
  const start = () => {
    if (reduceMotion || phrase.classList.contains('is-rolling')) return;
    phrase.classList.add('is-rolling');
  };
  phrase.addEventListener('pointerenter', start);
  phrase.addEventListener('click', start);
  last.addEventListener('animationend', () => phrase.classList.remove('is-rolling'));
}
