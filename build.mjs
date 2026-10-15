// Gera o site a partir das pastas em /galerias. Sem dependências.
import fs from 'node:fs';
import path from 'node:path';

const cfg = JSON.parse(fs.readFileSync('site.config.json', 'utf8'));
const EXT = /\.(jpe?g|png|webp|avif|gif|svg)$/i;
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const nice = s => s.replace(/[-_]+/g, ' ').replace(/\b\p{L}/gu, c => c.toUpperCase());
const u = encodeURIComponent;

fs.rmSync('dist', { recursive: true, force: true });
fs.mkdirSync('dist', { recursive: true });
fs.cpSync('assets', 'dist/assets', { recursive: true });
fs.cpSync('galerias', 'dist/galerias', { recursive: true });

const gals = fs.readdirSync('galerias', { withFileTypes: true })
  .filter(d => d.isDirectory() && !d.name.startsWith('.'))
  .map(d => {
    const dir = path.join('galerias', d.name);
    let info = {};
    try { info = JSON.parse(fs.readFileSync(path.join(dir, 'info.json'), 'utf8')); }
    catch (e) { if (fs.existsSync(path.join(dir, 'info.json'))) console.warn(`Aviso: info.json de "${d.name}" está inválido e foi ignorado.`); }
    const fotos = fs.readdirSync(dir).filter(f => EXT.test(f)).sort((a, b) => a.localeCompare(b, 'pt', { numeric: true }));
    return { slug: d.name, titulo: info.titulo || nice(d.name), data: info.data || '', descricao: info.descricao || '',
      ordem: info.ordem ?? 999, fotos, capa: fotos.includes(info.capa) ? info.capa : fotos[0] };
  })
  .filter(g => g.fotos.length)
  .sort((a, b) => a.ordem - b.ordem || b.data.localeCompare(a.data) || a.titulo.localeCompare(b.titulo));

const page = (root, title, desc, body, extra = '') => `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,500;1,6..96,400&family=Jost:wght@300;400;500&display=swap">
<link rel="stylesheet" href="${root}assets/style.css"></head>
<body><header class="top"><a class="brand" href="${root || './'}">${esc(cfg.nome)}</a>
<nav><a href="${root}#galerias">Galerias</a><a href="${root}#sobre">Sobre</a><a href="${root}#contato">Contato</a></nav></header>
${body}<footer class="foot">© ${new Date().getFullYear()} ${esc(cfg.nome)}</footer>${extra}</body></html>`;

const wa = cfg.whatsapp ? `https://wa.me/${cfg.whatsapp.replace(/\D/g, '')}` : '';
const heroImg = cfg.hero ? cfg.hero : gals[0] ? `galerias/${u(gals[0].slug)}/${u(gals[0].capa)}` : '';

const cards = gals.map(g => `<a class="card" href="galerias/${u(g.slug)}/">
<img src="galerias/${u(g.slug)}/${u(g.capa)}" alt="${esc(g.titulo)}" loading="lazy">
<span class="cap"><b>${esc(g.titulo)}</b><small>${esc(g.data)}</small></span></a>`).join('');

const home = `<section class="hero" ${heroImg ? `style="--hero:url('${heroImg}')"` : ''}>
<div><h1>${esc(cfg.slogan)}</h1><p>${esc(cfg.cidade)}</p>${wa ? `<a class="btn" href="${wa}">Pedir orçamento</a>` : ''}</div></section>
<section id="galerias" class="wrap"><h2>Galerias</h2>
${gals.length ? `<div class="cards">${cards}</div>` : '<p class="vazio">Nenhuma galeria ainda. Crie uma pasta dentro de galerias/ e coloque as fotos nela.</p>'}</section>
<section id="sobre" class="wrap narrow"><h2>Sobre</h2><p>${esc(cfg.sobre)}</p></section>
<section id="contato" class="wrap narrow"><h2>Contato</h2><p class="links">
${wa ? `<a href="${wa}">WhatsApp</a>` : ''}
${cfg.instagram ? `<a href="https://instagram.com/${esc(cfg.instagram)}">Instagram</a>` : ''}
${cfg.email ? `<a href="mailto:${esc(cfg.email)}">${esc(cfg.email)}</a>` : ''}</p></section>`;

fs.writeFileSync('dist/index.html', page('', `${cfg.nome} | ${cfg.slogan}`, `${cfg.slogan} em ${cfg.cidade}`, home));

for (const g of gals) {
  const imgs = g.fotos.map(f => `<a href="${u(f)}" class="ph"><img src="${u(f)}" alt="${esc(g.titulo)}" loading="lazy"></a>`).join('');
  const body = `<main class="wrap"><a class="back" href="../../#galerias">Todas as galerias</a>
<h1 class="gt">${esc(g.titulo)}</h1><p class="meta">${esc(g.data)}${g.data && g.descricao ? ' – ' : ''}${esc(g.descricao)}</p>
<div class="masonry">${imgs}</div></main>`;
  fs.writeFileSync(`dist/galerias/${g.slug}/index.html`,
    page('../../', `${g.titulo} | ${cfg.nome}`, g.descricao || `Galeria ${g.titulo}`, body, '<script src="../../assets/lightbox.js"></script>'));
}
console.log(`Site gerado: ${gals.length} galeria(s), ${gals.reduce((n, g) => n + g.fotos.length, 0)} foto(s).`);
