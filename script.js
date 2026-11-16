/* ===== HELPERS ===== */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

// Inline SVG placeholder used when an image file is not found
function placeholder(label, portrait) {
  const w = portrait ? 480 : 640, h = portrait ? 600 : 480;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#5a0f1e"/><stop offset="1" stop-color="#050304"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><text x="50%" y="50%" fill="#ffffff99" font-family="Georgia,serif" font-size="26" text-anchor="middle">${label}</text></svg>`;
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}
function fallbackImages() {
  $$('img').forEach(img => {
    const swap = () => { img.onerror = null; img.src = placeholder(img.dataset.ph === 'portrait' ? 'Add your photo' : img.alt, img.dataset.ph === 'portrait'); };
    img.onerror = swap;
    if (img.complete && img.naturalWidth === 0) swap();
  });
}

fallbackImages();
$('#yr').textContent = new Date().getFullYear();

/* ===== PORTFOLIO FILTER ===== */
$('#filters').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  $$('#filters button').forEach(x => x.classList.toggle('on', x === b));
  $$('.item').forEach(it => it.classList.toggle('hide', b.dataset.f !== 'all' && it.dataset.cat !== b.dataset.f));
});

/* ===== SCROLL REVEAL (Intersection Observer) ===== */
const io = new IntersectionObserver(entries => entries.forEach(en => {
  if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
}), { threshold: .15 });
$$('.reveal').forEach(el => io.observe(el));

/* ===== SCROLL EFFECTS: nav, timeline line, parallax, back-to-top, active link ===== */
const nav = $('#nav'), toTop = $('#toTop'), tl = $('.timeline'), par = $$('[data-parallax]');
const links = $$('.nav-link'), secs = links.map(l => $(l.getAttribute('href')));
let ticking = false;
function onScroll() {
  const y = scrollY;
  nav.classList.toggle('solid', y > 40);
  toTop.classList.toggle('show', y > 600);
  const r = tl.getBoundingClientRect();
  tl.style.setProperty('--tl', Math.min(1, Math.max(0, (innerHeight * .7 - r.top) / r.height)));
  par.forEach(el => el.style.transform = `translateY(${y * el.dataset.parallax}px)`);
  let cur = 0; secs.forEach((s, i) => { if (s && s.getBoundingClientRect().top < innerHeight * .4) cur = i; });
  links.forEach((l, i) => l.classList.toggle('active', i === cur));
  ticking = false;
}
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
onScroll();
toTop.onclick = () => scrollTo({ top: 0, behavior: 'smooth' });

// Close mobile menu after choosing a link
$$('#menu .nav-link').forEach(l => l.addEventListener('click', () => bootstrap.Collapse.getInstance($('#menu'))?.hide()));

/* ===== CONTACT FORM: sends message directly to WhatsApp ===== */
const WHATSAPP_CONFIG = {
  phoneNumber: '917594003335' // +91 7594 003 335
};

$('#contactForm').addEventListener('submit', e => {
  e.preventDefault();
  const [n, em, s, m] = ['fn', 'fe', 'fs', 'fm'].map(id => $('#' + id).value.trim());
  const note = $('#formNote');

  if (!n || !/^\S+@\S+\.\S+$/.test(em) || !s || !m) {
    note.style.color = '#ff8a93';
    note.textContent = 'Please fill in every field with a valid email.';
    return;
  }

  const messageText =
    `*New Portfolio Inquiry*\n\n` +
    `*Name:* ${n}\n` +
    `*Email:* ${em}\n` +
    `*Subject:* ${s}\n\n` +
    `*Message:*\n${m}`;

  const whatsappUrl = `https://wa.me/${WHATSAPP_CONFIG.phoneNumber}?text=${encodeURIComponent(messageText)}`;

  note.style.color = '#4ade80';
  note.textContent = 'Opening WhatsApp…';

  const opened = window.open(whatsappUrl, '_blank');
  if (!opened || opened.closed || typeof opened.closed === 'undefined') {
    window.location.href = whatsappUrl;
  }
});

/* ===== LOADER ===== */
addEventListener('load', () => setTimeout(() => $('#loader').classList.add('done'), 600));
