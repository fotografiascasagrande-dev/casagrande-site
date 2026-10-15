(() => {
  const links = [...document.querySelectorAll('.ph')];
  if (!links.length) return;
  let i = 0, box;
  const show = n => { i = (n + links.length) % links.length; box.querySelector('img').src = links[i].href; };
  const close = () => { box && box.remove(); box = null; document.removeEventListener('keydown', key); };
  const key = e => { if (e.key === 'Escape') close(); if (e.key === 'ArrowRight') show(i + 1); if (e.key === 'ArrowLeft') show(i - 1); };
  const open = n => {
    box = document.createElement('div'); box.className = 'lb';
    box.innerHTML = '<img alt=""><button class="x" aria-label="Fechar">×</button><button class="p" aria-label="Anterior">‹</button><button class="n" aria-label="Próxima">›</button>';
    box.addEventListener('click', e => { const c = e.target.className; if (c === 'x' || e.target === box) close(); if (c === 'p') show(i - 1); if (c === 'n') show(i + 1); });
    document.body.append(box); document.addEventListener('keydown', key); show(n);
  };
  links.forEach((a, n) => a.addEventListener('click', e => { e.preventDefault(); open(n); }));
})();
