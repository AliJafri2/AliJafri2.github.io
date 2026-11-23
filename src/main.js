// ---------- Filter pills ----------
const nav = document.querySelector('.filters');
const pill = nav.querySelector('.filter-pill');
const buttons = [...nav.querySelectorAll('.filter')];
const tiles = [...document.querySelectorAll('.tile')];

function movePill(btn) {
  pill.style.width = `${btn.offsetWidth}px`;
  pill.style.transform = `translateX(${btn.offsetLeft}px)`;
}

function setFilter(btn) {
  const f = btn.dataset.filter;
  buttons.forEach((b) => {
    const on = b === btn;
    b.classList.toggle('is-active', on);
    b.setAttribute('aria-pressed', on);
  });
  movePill(btn);
  tiles.forEach((t) => t.classList.toggle('is-dim', f !== 'all' && t.dataset.cat !== f));
}

buttons.forEach((b) => b.addEventListener('click', () => setFilter(b)));
window.addEventListener('resize', () => movePill(nav.querySelector('.filter.is-active')));
document.fonts?.ready.then(() => movePill(nav.querySelector('.filter.is-active')));
movePill(buttons[0]);

// ---------- Staggered entrance ----------
tiles.forEach((t, i) => t.style.setProperty('--d', `${i * 60}ms`));

document.getElementById('year').textContent = new Date().getFullYear();
