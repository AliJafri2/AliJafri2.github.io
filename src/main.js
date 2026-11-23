// Cursor spotlight on the cards: feed the pointer position into CSS variables.
// Only on devices with a real hover pointer, and not when reduced motion is requested.
const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (canHover && !reduceMotion) {
  for (const tile of document.querySelectorAll('.tile')) {
    tile.addEventListener('pointermove', (e) => {
      const r = tile.getBoundingClientRect();
      tile.style.setProperty('--mx', `${e.clientX - r.left}px`);
      tile.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  }
}
