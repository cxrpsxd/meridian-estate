/* Генератор статических страниц: node build.js
   Собирает HTML с общими шапкой/подвалом, метатегами, JSON-LD, ЧПУ-папками и sitemap.xml. */
const fs = require('fs');
const path = require('path');
const MR = require('./site/assets/js/data.js');

const SITE = 'https://meridian-estate-six.vercel.app'; // ← замените на боевой домен
const OUT = path.join(__dirname, 'site');
const VER = Date.now().toString(36);
const today = new Date().toISOString().slice(0, 10);
const sitemap = [];

const nf = new Intl.NumberFormat('ru-RU');
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const plural = (n, f) => { n = Math.abs(n) % 100; const n1 = n % 10; if (n > 10 && n < 20) return f[2]; if (n1 > 1 && n1 < 5) return f[1]; if (n1 === 1) return f[0]; return f[2]; };
const objWord = n => `${n} ${plural(n, ['объект', 'объекта', 'объектов'])}`;
const priceLabel = o => nf.format(o.price) + ' ₽' + (o.deal === 'rent' ? ' / мес' : '');
const city = s => MR.cities.find(c => c.slug === s);
const type = id => MR.types.find(t => t.id === id || t.slug === id);
const arrow = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 12h16m-6-6 6 6-6 6"/></svg>';
const heart = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 20.5s-7.5-4.6-9.2-9.6C1.6 7.3 3.9 4 7.4 4c2 0 3.6 1.1 4.6 2.7C13 5.1 14.6 4 16.6 4c3.5 0 5.8 3.3 4.6 6.9-1.7 5-9.2 9.6-9.2 9.6z"/></svg>';
const C = MR.config;

function write(rel, html) {
  const file = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}

/* ---------- Общий каркас ---------- */
function page(o) {
  const p = o.path; // '' | 'catalog/' | 'object/slug/'
  const depth = p.split('/').filter(Boolean).length;
  const R = depth ? '../'.repeat(depth) : './';
  const url = SITE + '/' + p;
  if (!o.noindex) sitemap.push({ loc: url, pri: o.priority || '0.6' });
  const og = o.ogImage || MR.img('1600585154340-be6161a56a0c', 1200);
  const nav = [['catalog/', 'Каталог'], ['services/', 'Услуги'], ['about/', 'О компании'], ['contacts/', 'Контакты']];
  const scripts = ['data.js', 'core.js', ...(o.scripts || [])];

  const header = o.bare ? '' : `
<header class="header">
  <div class="wrap header__in">
    <a class="logo" href="${R}" aria-label="Meridian — на главную"><span class="logo__mark">Meridian</span><span class="logo__sub">estate</span></a>
    <nav class="nav" aria-label="Основное меню">${nav.map(([h, t]) => `<a href="${R}${h}">${t}</a>`).join('')}</nav>
    <div class="header__actions">
      <a class="header__phone" href="tel:${C.phoneRaw}" data-track="phone_click">${C.phone}</a>
      <a class="icon-btn" href="${R}favorites/" aria-label="Избранное">${heart}<span class="fav-count" data-fav-count hidden>0</span></a>
      <button class="btn btn--primary btn--sm header__cta" type="button" data-modal="selection">Подобрать объект</button>
      <button class="icon-btn burger" type="button" data-mnav="open" aria-label="Открыть меню"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 8h18M3 16h18"/></svg></button>
    </div>
  </div>
</header>
<div class="mnav" hidden>
  <div class="mnav__top"><a class="logo" href="${R}"><span class="logo__mark">Meridian</span><span class="logo__sub">estate</span></a><button class="icon-btn" type="button" data-mnav="close" aria-label="Закрыть меню"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>
  <nav class="mnav__links" aria-label="Мобильное меню">${nav.map(([h, t]) => `<a href="${R}${h}">${t}</a>`).join('')}<a href="${R}favorites/">Избранное</a></nav>
  <div class="mnav__foot"><a class="header__phone" style="font-size:22px" href="tel:${C.phoneRaw}">${C.phone}</a><button class="btn btn--primary btn--block" type="button" data-modal="selection">Подобрать объект</button></div>
</div>`;

  const footer = o.bare ? '' : `
<footer class="footer">
  <div class="wrap">
    <div class="footer__grid">
      <div class="footer__about">
        <a class="logo" href="${R}"><span class="logo__mark">Meridian</span><span class="logo__sub">estate</span></a>
        <p>Агентство элитной недвижимости. Покупка, продажа и аренда квартир, домов и коммерческих объектов в Москве, Подмосковье, Санкт-Петербурге и Сочи.</p>
        <div style="display:grid;gap:4px"><a href="tel:${C.phoneRaw}" style="font-size:20px;color:#F2F3EF" data-track="phone_click">${C.phone}</a><span style="font-size:14px">${C.hours}</span></div>
      </div>
      <div><h4>Города</h4><ul>${MR.cities.map(c => `<li><a href="${R}catalog/${c.slug}/">Недвижимость ${c.in}</a></li>`).join('')}</ul></div>
      <div><h4>Категории</h4><ul>${MR.types.map(t => `<li><a href="${R}catalog/${t.slug}/">${t.plural}</a></li>`).join('')}<li><a href="${R}catalog/arenda/">Аренда</a></li></ul></div>
      <div><h4>Компания</h4><ul><li><a href="${R}about/">О компании</a></li><li><a href="${R}services/">Услуги</a></li><li><a href="${R}contacts/">Контакты</a></li><li><a href="${R}favorites/">Избранное</a></li><li><a href="https://t.me/${C.telegram}" target="_blank" rel="noopener">Telegram</a></li><li><a href="https://wa.me/${C.whatsapp}" target="_blank" rel="noopener">WhatsApp</a></li></ul></div>
    </div>
    <div class="footer__bottom"><span>© <span data-year>2026</span> Meridian Estate. Демонстрационный проект: объекты, цены и контакты вымышлены.</span><span><a href="${R}privacy/">Политика конфиденциальности</a> · <a href="${R}sitemap.xml">Карта сайта</a></span></div>
  </div>
</footer>`;

  const ld = [].concat(o.jsonld || []).map(j => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join('\n');

  return `<!doctype html>
<html lang="ru" data-root="${R}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(o.title)}</title>
<meta name="description" content="${esc(o.desc)}">
${o.noindex ? '<meta name="robots" content="noindex, nofollow">' : `<link rel="canonical" href="${url}">`}
<meta property="og:type" content="website">
<meta property="og:site_name" content="Meridian Estate">
<meta property="og:title" content="${esc(o.ogTitle || o.title)}">
<meta property="og:description" content="${esc(o.desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${esc(og)}">
<meta property="og:locale" content="ru_RU">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#23443A">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='4' fill='%2323443A'/%3E%3Cpath d='M8 23V10l8 8 8-8v13' fill='none' stroke='%23F2F3EF' stroke-width='2'/%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://images.unsplash.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600&family=Spectral:ital,wght@0,300;0,400;1,300&display=swap">
${o.leaflet ? '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css">' : ''}
<link rel="stylesheet" href="${R}assets/css/style.css?v=${VER}">
${ld}
</head>
<body class="${o.bodyClass || ''}">
<a class="visually-hidden" href="#main">Перейти к содержимому</a>
${header}
<main id="main"${o.mainAttrs ? ' ' + o.mainAttrs : ''}>
${o.body}
</main>
${footer}
${o.leaflet ? '<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></script>' : ''}
${scripts.map(s => `<script src="${R}assets/js/${s}?v=${VER}"></script>`).join('\n')}
</body>
</html>`;
}

const crumbs = (R, items) => `<nav class="crumbs" aria-label="Хлебные крошки"><a href="${R}">Главная</a>${items.map(([h, t]) => `<span aria-hidden="true">/</span>${h ? `<a href="${R}${h}">${t}</a>` : `<span>${t}</span>`}`).join('')}</nav>`;
const crumbsLd = items => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [['', 'Главная'], ...items].map(([h, t], i) => ({ '@type': 'ListItem', position: i + 1, name: t, item: SITE + '/' + h })) });
const orgLd = { '@context': 'https://schema.org', '@type': 'RealEstateAgent', name: 'Meridian Estate', url: SITE, telephone: C.phone, email: C.email, image: MR.img('1600585154340-be6161a56a0c', 1200),
  address: { '@type': 'PostalAddress', streetAddress: 'ул. Остоженка, 25, офис 4', addressLocality: 'Москва', addressCountry: 'RU' }, openingHours: 'Mo-Su 09:00-21:00', areaServed: MR.cities.map(c => c.name) };

/* ---------- Главная ---------- */
const featuredCount = MR.objects.length;
write('index.html', page({
  path: '', priority: '1.0', bodyClass: 'has-hero', scripts: ['pages.js'],
  title: 'Meridian — элитная недвижимость в Москве, Санкт-Петербурге и Сочи',
  desc: `Агентство элитной недвижимости Meridian: ${objWord(featuredCount)} в каталоге — пентхаусы, квартиры, дома и виллы. Подбор, юридическая проверка, сопровождение сделки.`,
  jsonld: [orgLd, { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Meridian Estate', url: SITE, potentialAction: { '@type': 'SearchAction', target: SITE + '/catalog/?city={city}', 'query-input': 'required name=city' } }],
  body: `
<section class="hero">
  <div class="hero__media"><img src="${MR.img('1600585154340-be6161a56a0c', 2200)}" alt="Современный загородный дом с панорамным остеклением вечером" fetchpriority="high"></div>
  <div class="wrap hero__body">
    <div class="eyebrow" style="color:rgba(242,243,239,.75)">Агентство недвижимости · с 2013 года</div>
    <h1>Дома, в которых <em>хочется остаться</em></h1>
    <p class="lead">Подбираем квартиры, дома и виллы в Москве, Подмосковье, Петербурге и Сочи. Каждый объект проверяем юридически до того, как показать его вам.</p>
    <form class="search" data-search role="search" aria-label="Поиск недвижимости">
      <div class="search__deal" role="group" aria-label="Тип сделки"><button class="seg" type="button" data-deal="sale" aria-pressed="true">Купить</button><button class="seg" type="button" data-deal="rent" aria-pressed="false">Арендовать</button></div>
      <div class="search__field"><label for="s-city">Город</label><select id="s-city"><option value="">Все города</option>${MR.cities.map(c => `<option value="${c.slug}">${c.name}</option>`).join('')}</select></div>
      <div class="search__field"><label for="s-type">Тип</label><select id="s-type"><option value="">Любой</option>${MR.types.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}</select></div>
      <div class="search__field"><label for="s-budget">Бюджет</label><select id="s-budget"></select></div>
      <button class="btn btn--primary" type="submit">Показать объекты</button>
    </form>
    <div class="hero__meta"><div><b>1 400+</b>закрытых сделок</div><div><b>86 млрд ₽</b>общий объём продаж</div><div><b>30%</b>объектов в закрытой продаже</div></div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head"><div><div class="eyebrow">Выбор брокеров</div><h2>Избранные <em>объекты</em></h2></div><a class="link-arrow" href="./catalog/">Весь каталог ${arrow}</a></div>
    <div class="grid" data-featured></div>
  </div>
</section>

<section class="section" style="padding-top:0">
  <div class="wrap">
    <div class="section-head"><div><div class="eyebrow">География</div><h2>Четыре рынка, <em>одна команда</em></h2></div><p class="lead" style="max-width:420px">В каждом городе работает свой офис и брокеры, которые знают дома, застройщиков и соседей.</p></div>
    <div class="cities">${MR.cities.map(c => `
      <a class="city reveal" href="./catalog/${c.slug}/"><img src="${c.photo.replace('w=1200', 'w=900')}" alt="${c.name}" loading="lazy"><div class="city__body"><span class="city__name">${c.name}</span><span class="city__count" data-count-city="${c.slug}">&nbsp;</span></div></a>`).join('')}
    </div>
    <div class="cats" style="margin-top:28px">${MR.types.map(t => `<a class="chip" href="./catalog/${t.slug}/">${t.plural} <small data-count-type="${t.id}"></small></a>`).join('')}<a class="chip" href="./catalog/arenda/">Аренда</a></div>
  </div>
</section>

<section class="section section--dark">
  <div class="wrap split">
    <div class="split__media reveal"><img src="${MR.img('1600607687939-ce8a6c25118c', 1200)}" alt="Гостиная с панорамными окнами" loading="lazy"></div>
    <div class="split__body">
      <div class="eyebrow">О компании</div>
      <h2>Мы продаём меньше объектов, чем могли бы. <em>Зато каждый проверен.</em></h2>
      <p class="lead">Берём в работу объект только после юридической проверки, оценки и фотосъёмки. Поэтому покупатели доверяют нашему каталогу, а продавцы получают сделку в среднем за 74 дня.</p>
      <div class="facts">
        <div><b>12 лет</b><span>на рынке элитной недвижимости</span></div>
        <div><b>74 дня</b><span>средний срок продажи</span></div>
        <div><b>38</b><span>брокеров и юристов в штате</span></div>
        <div><b>0</b><span>оспоренных сделок</span></div>
      </div>
      <a class="link-arrow" href="./about/" style="justify-self:start">Подробнее о компании ${arrow}</a>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head"><div><div class="eyebrow">Как проходит покупка</div><h2>От запроса до ключей</h2></div></div>
    <div class="steps">
      <div class="step"><h3>Запрос</h3><p>Обсуждаем задачу на встрече или по видео: бюджет, район, сроки, сценарий жизни.</p></div>
      <div class="step"><h3>Подборка</h3><p>Через 48 часов присылаем 5–7 объектов, включая закрытые продажи. Организуем показы в один день.</p></div>
      <div class="step"><h3>Проверка</h3><p>Юрист проверяет историю владения, обременения и согласования. Отчёт до внесения аванса.</p></div>
      <div class="step"><h3>Сделка</h3><p>Ведём переговоры о цене, готовим договор, проводим расчёты через аккредитив и передаём ключи.</p></div>
    </div>
  </div>
</section>

<section class="cta-band">
  <img src="${MR.img('1613977257363-707ba9348227', 2000)}" alt="" loading="lazy">
  <div class="wrap cta-band__in">
    <div style="display:grid;gap:20px">
      <div class="eyebrow" style="color:rgba(242,243,239,.7)">Закрытые продажи</div>
      <h2>Треть объектов не попадает в&nbsp;открытый каталог</h2>
      <p class="lead">Владельцы часто не хотят публичности. Оставьте запрос, и брокер пришлёт подборку, включая объекты закрытых продаж.</p>
    </div>
    <div class="form--panel" data-lead-slot='{"kind":"selection","title":"Получить подборку","message":"Город, бюджет, пожелания","cta":"Получить подборку"}'></div>
  </div>
</section>`
}));

/* ---------- Каталог и SEO-страницы ---------- */
const typeText = {
  apartment: 'Квартиры в клубных домах и жилых комплексах премиум-класса: от 2 до 5 спален, с отделкой и под ремонт. Для каждой квартиры готовим отчёт о юридической чистоте и сравнение с соседними предложениями.',
  penthouse: 'Пентхаусы с террасами, видовыми окнами и отдельными лифтами. Таких объектов на рынке единицы, поэтому многие из них продаются закрыто — оставьте запрос, чтобы получить полную подборку.',
  house: 'Дома и виллы с участками, бассейнами и гостевыми домами. Проверяем категорию земли, разрешённое использование, коммуникации и выделенную мощность до показа.',
  townhouse: 'Таунхаусы в малоэтажных посёлках и кварталах: собственный вход, участок, терраса и инфраструктура посёлка при расходах ниже, чем на отдельный дом.',
  commercial: 'Офисы, особняки и помещения свободного назначения для собственного использования и инвестиций. Считаем доходность, проверяем арендаторов и договоры.'
};
function catalogBody(R, { h1, lead, crumbsItems, presetObj, seoTitle, seoText, links }) {
  return `
<div class="wrap page-head">
  ${crumbs(R, crumbsItems)}
  <h1>${h1}</h1>
  ${lead ? `<p class="lead">${lead}</p>` : ''}
</div>
<div class="wrap">
  <div class="catalog" data-catalog data-preset='${JSON.stringify(presetObj || {})}'>
    <aside class="filters" aria-label="Фильтры"></aside>
    <div style="min-width:0">
      <div class="toolbar">
        <button class="btn btn--ghost btn--sm filters-open" type="button" data-filters-open><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 6h16M7 12h10M10 18h4"/></svg>Фильтры</button>
        <span class="toolbar__count" data-count aria-live="polite"></span>
        <label class="visually-hidden" for="sort">Сортировка</label>
        <select class="select" id="sort" data-sort><option value="new">Сначала рекомендуемые</option><option value="price_asc">Сначала дешевле</option><option value="price_desc">Сначала дороже</option><option value="area_desc">По площади</option></select>
        <div class="view-toggle" role="group" aria-label="Вид"><button type="button" data-view="grid" aria-pressed="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"/></svg>Список</button><button type="button" data-view="map" aria-pressed="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2zm0 0v14m6-12v14"/></svg>Карта</button></div>
      </div>
      <div class="active-chips" data-chips></div>
      <div data-list></div>
      <div class="catalog-map" data-map-wrap hidden><div class="map" data-map style="height:100%"></div></div>
      <div class="more" data-more hidden><button class="btn btn--ghost" type="button">Показать ещё</button></div>
      ${seoText ? `<section class="seo-text"><h2>${seoTitle}</h2><div><div class="prose">${seoText.map(p => `<p>${p}</p>`).join('')}</div>${links ? `<div class="seo-links">${links}</div>` : ''}</div></section>` : ''}
    </div>
  </div>
</div>`;
}

write('catalog/index.html', page({
  path: 'catalog/', priority: '0.9', leaflet: true, scripts: ['catalog.js'],
  title: 'Каталог элитной недвижимости — купить и арендовать | Meridian',
  desc: `Каталог: ${objWord(MR.objects.length)} — квартиры, пентхаусы, дома, таунхаусы и коммерческая недвижимость. Фильтры по городу, цене, площади, просмотр на карте.`,
  jsonld: crumbsLd([['catalog/', 'Каталог']]),
  body: catalogBody('../', { h1: 'Каталог <em>недвижимости</em>', lead: 'Все объекты проверены юристом и сфотографированы нашей командой. Цены актуальны на ' + new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) + '.', crumbsItems: [['', 'Каталог']] })
}));

function seoPage({ slug, preset, h1, title, desc, lead, seoTitle, seoText, crumbItems, list, links }) {
  const p = 'catalog/' + slug + '/';
  const R = '../'.repeat(p.split('/').filter(Boolean).length);
  write(p + 'index.html', page({
    path: p, priority: '0.8', leaflet: true, scripts: ['catalog.js'], title, desc,
    ogImage: list[0] && list[0].photos[0],
    jsonld: [crumbsLd(crumbItems.map(([h, t]) => [h || p, t])), { '@context': 'https://schema.org', '@type': 'ItemList', name: h1.replace(/<[^>]+>/g, ''), numberOfItems: list.length,
      itemListElement: list.slice(0, 20).map((o, i) => ({ '@type': 'ListItem', position: i + 1, url: SITE + '/object/' + o.id + '/', name: o.title })) }],
    body: catalogBody(R, { h1, lead, crumbsItems: crumbItems, presetObj: preset, seoTitle, seoText, links })
  }));
}
const link = (href, t) => `<a class="chip" href="../../${href}">${t}</a>`;
const linkDeep = (href, t) => `<a class="chip" href="../../../${href}">${t}</a>`;

MR.cities.forEach(c => {
  const list = MR.objects.filter(o => o.city === c.slug);
  const min = Math.min(...list.filter(o => o.deal === 'sale').map(o => o.price));
  seoPage({
    slug: c.slug, preset: { city: c.slug }, list,
    h1: `Недвижимость <em>${c.in}</em>`,
    title: `Элитная недвижимость ${c.in} — купить квартиру, дом, пентхаус | Meridian`,
    desc: `${objWord(list.length)} ${c.in}: квартиры, пентхаусы, дома и коммерческая недвижимость. Цены от ${(min / 1e6).toFixed(0)} млн ₽. Проверенные объекты, просмотр в удобное время.`,
    lead: c.lead,
    crumbItems: [['catalog/', 'Каталог'], ['', c.name]],
    seoTitle: `Купить недвижимость ${c.in} с Meridian`,
    seoText: [
      `В каталоге Meridian ${objWord(list.length)} ${c.in}. ${c.lead}`,
      `Перед публикацией юрист проверяет каждый объект: собственников, обременения, перепланировки и историю переходов права. Фотографии и описания готовит наша команда, поэтому они совпадают с тем, что вы увидите на просмотре.`,
      `Если подходящего варианта нет в открытом каталоге, оставьте заявку. Брокер ${c.in} пришлёт подборку из закрытых продаж в течение 48 часов.`
    ],
    links: MR.types.filter(t => list.some(o => o.type === t.id)).map(t => link(`catalog/${c.slug}/${t.slug}/`, `${t.plural} ${c.in}`)).join('')
  });
  MR.types.forEach(t => {
    const sub = list.filter(o => o.type === t.id);
    if (!sub.length) return;
    seoPage({
      slug: `${c.slug}/${t.slug}`, preset: { city: c.slug, type: [t.id] }, list: sub,
      h1: `${t.plural} <em>${c.in}</em>`,
      title: `${t.plural} ${c.in} — купить и арендовать | Meridian`,
      desc: `${t.plural} ${c.in}: ${objWord(sub.length)} в каталоге Meridian. Фото, планировки, цены, расположение на карте. Запись на просмотр онлайн.`,
      lead: typeText[t.id],
      crumbItems: [['catalog/', 'Каталог'], [`catalog/${c.slug}/`, c.name], ['', t.plural]],
      seoTitle: `${t.plural} ${c.in}: как выбрать`,
      seoText: [typeText[t.id], `Сейчас в продаже и аренде ${objWord(sub.length)} этой категории ${c.in}. Каталог обновляется ежедневно, а новые объекты получают сначала клиенты с активным запросом.`],
      links: MR.types.filter(x => x.id !== t.id && list.some(o => o.type === x.id)).map(x => linkDeep(`catalog/${c.slug}/${x.slug}/`, `${x.plural} ${c.in}`)).join('') + linkDeep(`catalog/${c.slug}/`, `Вся недвижимость ${c.in}`)
    });
  });
});
MR.types.forEach(t => {
  const list = MR.objects.filter(o => o.type === t.id);
  seoPage({
    slug: t.slug, preset: { type: [t.id] }, list,
    h1: t.plural, title: `${t.plural} — купить элитную недвижимость | Meridian`,
    desc: `${t.plural} в Москве, Подмосковье, Санкт-Петербурге и Сочи: ${objWord(list.length)}. Проверенные объекты, юридическое сопровождение сделки.`,
    lead: typeText[t.id], crumbItems: [['catalog/', 'Каталог'], ['', t.plural]],
    seoTitle: `${t.plural} в каталоге Meridian`,
    seoText: [typeText[t.id], `Выберите город, чтобы увидеть объекты рядом: в каждом городе работает отдельная команда брокеров.`],
    links: MR.cities.filter(c => list.some(o => o.city === c.slug)).map(c => link(`catalog/${c.slug}/${t.slug}/`, `${t.plural} ${c.in}`)).join('')
  });
});
{
  const list = MR.objects.filter(o => o.deal === 'rent');
  seoPage({
    slug: 'arenda', preset: { deal: 'rent' }, list,
    h1: 'Аренда <em>элитной недвижимости</em>', title: 'Аренда элитной недвижимости — квартиры, дома, офисы | Meridian',
    desc: `Аренда квартир, домов и офисов премиум-класса: ${objWord(list.length)}. Проверенные собственники, договор с юридическим сопровождением.`,
    lead: 'Долгосрочная аренда квартир, домов и офисов. Проверяем собственника, готовим договор и акт приёма-передачи с фотофиксацией.',
    crumbItems: [['catalog/', 'Каталог'], ['', 'Аренда']],
    seoTitle: 'Как мы работаем с арендой',
    seoText: ['Комиссия для арендатора — 50% месячной ставки, для собственника работаем по договору управления. Показы в день обращения, договор и опись имущества готовим сами.'],
    links: MR.cities.map(c => link(`catalog/${c.slug}/`, `Недвижимость ${c.in}`)).join('')
  });
}

/* ---------- Объекты ---------- */
MR.objects.forEach(o => {
  const p = `object/${o.id}/`;
  const c = city(o.city), t = type(o.type);
  write(p + 'index.html', page({
    path: p, priority: '0.7', leaflet: true, scripts: ['object.js'],
    title: `${o.title} — ${priceLabel(o)} | Meridian`, ogTitle: o.title,
    desc: `${t.name}, ${nf.format(o.area)} м²${o.rooms ? ', ' + o.rooms + ' комн.' : ''}, ${c.name}, ${o.district}. ${priceLabel(o)}. Лот ${o.lot}. Фото, описание, расположение на карте, запись на просмотр.`,
    ogImage: o.photos[0],
    mainAttrs: `data-object-page="${o.id}"`,
    jsonld: [crumbsLd([['catalog/', 'Каталог'], [`catalog/${c.slug}/`, c.name], [p, o.title]]), {
      '@context': 'https://schema.org', '@type': 'Product', name: o.title, sku: 'MR-' + o.lot, image: o.photos, description: o.description.replace(/\n+/g, ' '), category: t.name,
      offers: { '@type': 'Offer', price: o.price, priceCurrency: 'RUB', availability: 'https://schema.org/InStock', url: SITE + '/' + p, seller: { '@type': 'RealEstateAgent', name: 'Meridian Estate' } }
    }],
    // статичная версия для поисковиков и пользователей без JS; скрипт заменяет её интерактивной
    body: `<div class="wrap page-head">${crumbs('../../', [['catalog/', 'Каталог'], [`catalog/${c.slug}/`, c.name], ['', 'Лот ' + o.lot]])}
<h1>${esc(o.title)}</h1><p class="lead">${esc(c.name)}, ${esc(o.district)} · ${nf.format(o.area)} м² · ${priceLabel(o)}</p>
<img src="${o.photos[0]}" alt="${esc(o.title)}" style="aspect-ratio:16/9;object-fit:cover;width:100%">
<div class="prose">${o.description.split(/\n+/).map(x => `<p>${esc(x)}</p>`).join('')}</div></div>`
  }));
});
// страница для объектов, добавленных через админку (без пересборки)
write('object/index.html', page({ path: 'object/', noindex: true, leaflet: true, scripts: ['object.js'], title: 'Объект | Meridian', desc: 'Карточка объекта недвижимости.', mainAttrs: 'data-object-page=""', body: '' }));

/* ---------- Избранное ---------- */
write('favorites/index.html', page({
  path: 'favorites/', noindex: true, scripts: ['pages.js'], title: 'Избранное | Meridian', desc: 'Сохранённые объекты недвижимости.',
  body: `<div class="wrap page-head">${crumbs('../', [['', 'Избранное']])}<h1>Избранное</h1></div>
<div class="wrap" style="padding-bottom:96px">
  <div class="fav-bar" data-fav-bar hidden><span class="lead" data-fav-n></span><button class="btn btn--primary btn--sm" type="button" data-fav-send>Обсудить с брокером</button></div>
  <div data-favs></div>
</div>`
}));

/* ---------- О компании ---------- */
write('about/index.html', page({
  path: 'about/', priority: '0.6', scripts: ['pages.js'], title: 'О компании Meridian — агентство элитной недвижимости', desc: 'Meridian работает на рынке элитной недвижимости с 2013 года: 1 400+ сделок, 38 специалистов, офисы в Москве, Санкт-Петербурге и Сочи.',
  jsonld: [orgLd, crumbsLd([['about/', 'О компании']])],
  body: `<div class="wrap page-head">${crumbs('../', [['', 'О компании']])}<h1>Работаем так, чтобы <em>к нам возвращались</em></h1><p class="lead">Meridian основан в 2013 году брокерами, которые устали от каталогов с несуществующими объектами. Сегодня 62% наших сделок — повторные обращения и рекомендации.</p></div>
<section class="section" style="padding-top:24px"><div class="wrap split split--top">
  <div class="split__media"><img src="${MR.img('1600210492486-724fe5c67fb0', 1200)}" alt="Интерьер гостиной" loading="lazy"></div>
  <div class="split__body">
    <div class="eyebrow">Цифры</div>
    <div class="facts">
      <div><b>1 400+</b><span>закрытых сделок</span></div><div><b>86 млрд ₽</b><span>общий объём</span></div>
      <div><b>38</b><span>специалистов в штате</span></div><div><b>3</b><span>офиса: Москва, Петербург, Сочи</span></div>
    </div>
    <div class="prose" style="color:var(--muted)"><p>Мы не берём объект в работу, пока юрист не проверит документы, а оценщик не подтвердит цену. Поэтому в каталоге нет «приманок»: всё, что вы видите, можно посмотреть вживую.</p><p>Комиссия фиксируется в договоре до начала работы и не меняется в процессе сделки.</p></div>
  </div>
</div></section>
<section class="section section--dark"><div class="wrap">
  <div class="section-head"><div><div class="eyebrow">Принципы</div><h2>Во что мы <em>верим</em></h2></div></div>
  <div class="values">
    <div><h3>Только реальные объекты</h3><p>Каждый лот снят нашим фотографом и проверен юристом. Если объект продан, он исчезает из каталога в тот же день.</p></div>
    <div><h3>Конфиденциальность</h3><p>Работаем по NDA, не публикуем адреса и имена владельцев. Треть сделок проходит без публичной рекламы.</p></div>
    <div><h3>Один брокер на всю сделку</h3><p>Вас ведёт один человек: от первого звонка до передачи ключей, с поддержкой юриста и ипотечного брокера.</p></div>
  </div>
</div></section>
<section class="section"><div class="wrap">
  <div class="section-head"><div><div class="eyebrow">Команда</div><h2>Партнёры</h2></div></div>
  <div class="team">${MR.agents.map(a => `<div class="member"><div class="member__ava" aria-hidden="true">${a.name.split(' ').map(s => s[0]).join('')}</div><b>${a.name}</b><span>${a.role}</span></div>`).join('')}</div>
</div></section>
<section class="cta-band"><img src="${MR.img('1600596542815-ffad4c1539a9', 2000)}" alt="" loading="lazy"><div class="wrap cta-band__in">
  <div style="display:grid;gap:20px"><h2>Хотите продать объект?</h2><p class="lead">Бесплатно оценим стоимость и расскажем, за какой срок и по какой цене реально продать на текущем рынке.</p></div>
  <div class="form--panel" data-lead-slot='{"kind":"sell","title":"Оценка объекта","message":"Адрес, площадь, желаемая цена","cta":"Получить оценку"}'></div>
</div></section>`
}));

/* ---------- Услуги ---------- */
const services = [
  ['Покупка недвижимости', 'Подбор объектов, включая закрытые продажи, показы, переговоры о цене, проверка и проведение сделки.', ['Подборка за 48 часов', 'Переговоры о скидке', 'Безопасные расчёты через аккредитив'], 'от 2% от стоимости'],
  ['Продажа недвижимости', 'Оценка, предпродажная подготовка, профессиональная съёмка, продвижение и работа с базой покупателей.', ['Фото- и видеосъёмка, 3D-тур', 'Закрытая или публичная продажа', 'Отчёт о показах каждую неделю'], 'от 2% от стоимости'],
  ['Аренда', 'Поиск арендатора или жилья, проверка сторон, договор, опись имущества, приём-передача.', ['Проверка арендатора', 'Договор и акт с фотофиксацией', 'Показы в день обращения'], '50% месячной ставки'],
  ['Юридическое сопровождение', 'Проверка объекта и сторон, подготовка договоров, сопровождение регистрации перехода права.', ['История владения за 20 лет', 'Проверка перепланировок', 'Сопровождение в Росреестре'], 'от 150 000 ₽'],
  ['Инвестиционный консалтинг', 'Подбор объектов под доходность, расчёт окупаемости, сценарии выхода из инвестиции.', ['Финансовая модель объекта', 'Анализ арендного потока', 'Стратегия выхода'], 'от 300 000 ₽'],
  ['Управление арендой', 'Поиск арендаторов, сбор платежей, контроль состояния объекта и ежемесячная отчётность.', ['Ежемесячный отчёт', 'Сервис и мелкий ремонт', 'Контроль платежей'], '10% от ставки']
];
const faq = [
  ['Кто платит комиссию?', 'При покупке комиссию обычно платит продавец, и для покупателя услуги бесплатны. Если объект найден в рамках эксклюзивного поиска по вашему запросу, условия фиксируем в договоре заранее.'],
  ['Можно ли купить объект дистанционно?', 'Да. Проводим видеопоказы, отправляем отчёт юриста, сделку подписываем через электронную регистрацию или по доверенности.'],
  ['Как вы проверяете объекты?', 'Запрашиваем выписки ЕГРН, историю переходов права, проверяем собственников по базам судов и банкротств, сверяем фактическую планировку с документами БТИ.'],
  ['Помогаете ли с ипотекой?', 'Да, работаем с 14 банками. Ипотечный брокер подберёт программу и сопроводит одобрение — для клиентов агентства бесплатно.']
];
write('services/index.html', page({
  path: 'services/', priority: '0.7', scripts: ['pages.js'], title: 'Услуги — покупка, продажа, аренда недвижимости | Meridian',
  desc: 'Покупка и продажа элитной недвижимости, аренда, юридическое сопровождение, инвестиционный консалтинг и управление арендой. Стоимость услуг.',
  jsonld: [crumbsLd([['services/', 'Услуги']]), { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }],
  body: `<div class="wrap page-head">${crumbs('../', [['', 'Услуги']])}<h1>Услуги</h1><p class="lead">Ведём сделку целиком или берём на себя отдельный этап. Стоимость фиксируем в договоре до начала работы.</p></div>
<section class="section" style="padding-top:16px"><div class="wrap"><div class="services">${services.map(([t, d, l, p]) => `
  <div class="service"><h3>${t}</h3><div><p>${d}</p><ul>${l.map(x => `<li>${x}</li>`).join('')}</ul></div><div style="display:grid;gap:12px;justify-items:start"><span class="service__price">${p}</span><button class="link-arrow" type="button" data-modal="consultation">Обсудить ${arrow}</button></div></div>`).join('')}
</div></div></section>
<section class="section section--dark"><div class="wrap split split--top">
  <div style="display:grid;gap:16px;align-content:start"><div class="eyebrow">Вопросы и ответы</div><h2>Частые <em>вопросы</em></h2></div>
  <div style="display:grid;border-top:1px solid var(--line)">${faq.map(([q, a]) => `<details style="border-bottom:1px solid var(--line);padding:22px 0"><summary style="cursor:pointer;font:400 22px/1.3 var(--f-display);list-style-position:outside">${q}</summary><p style="color:var(--muted);margin-top:12px">${a}</p></details>`).join('')}</div>
</div></section>
<section class="section"><div class="wrap split">
  <div style="display:grid;gap:20px"><h2>Не знаете, с чего начать?</h2><p class="lead">Расскажите о задаче. Брокер перезвонит, ответит на вопросы и предложит план действий. Консультация бесплатна.</p></div>
  <div class="form--panel" style="border:1px solid var(--line)" data-lead-slot='{"kind":"consultation","title":"Бесплатная консультация","message":"Опишите задачу","cta":"Отправить заявку"}'></div>
</div></section>`
}));

/* ---------- Контакты ---------- */
const offices = [
  { city: 'Москва', address: 'ул. Остоженка, 25, офис 4', phone: C.phone, coords: [55.7395, 37.5990] },
  { city: 'Санкт-Петербург', address: 'Петроградская наб., 18', phone: '+7 (812) 000-00-00', coords: [59.9560, 30.3330] },
  { city: 'Сочи', address: 'Курортный проспект, 75', phone: '+7 (862) 000-00-00', coords: [43.5780, 39.7310] }
];
write('contacts/index.html', page({
  path: 'contacts/', priority: '0.6', leaflet: true, scripts: ['pages.js'], title: 'Контакты агентства недвижимости Meridian', desc: `Телефон ${C.phone}, офисы в Москве, Санкт-Петербурге и Сочи. ${C.hours}. Telegram и WhatsApp.`,
  jsonld: [orgLd, crumbsLd([['contacts/', 'Контакты']])],
  body: `<div class="wrap page-head">${crumbs('../', [['', 'Контакты']])}<h1>Контакты</h1></div>
<section class="section" style="padding-top:8px"><div class="wrap split split--top">
  <div class="contact-list">
    <div><span class="eyebrow">Телефон</span><a href="tel:${C.phoneRaw}" class="num" data-track="phone_click">${C.phone}</a></div>
    <div><span class="eyebrow">Почта</span><a href="mailto:${C.email}" style="word-break:break-all">${C.email}</a></div>
    <div><span class="eyebrow">Мессенджеры</span><div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:6px"><a class="btn btn--ghost btn--sm" href="https://t.me/${C.telegram}" target="_blank" rel="noopener" data-track="messenger_telegram">Telegram</a><a class="btn btn--ghost btn--sm" href="https://wa.me/${C.whatsapp}" target="_blank" rel="noopener" data-track="messenger_whatsapp">WhatsApp</a></div></div>
    <div><span class="eyebrow">Часы работы</span><b>${C.hours}</b></div>
    <p class="legal-note">ООО «Меридиан Эстейт» — реквизиты демонстрационные.</p>
  </div>
  <div class="form--panel" style="border:1px solid var(--line)" data-lead-slot='{"kind":"consultation","title":"Напишите нам","text":"Ответим в течение 15 минут в рабочее время.","message":"Ваш вопрос","cta":"Отправить"}'></div>
</div></section>
<section class="section" style="padding-top:0"><div class="wrap" style="display:grid;gap:32px">
  <h2>Офисы</h2>
  <div class="offices">${offices.map(o => `<div class="office"><h3>${o.city}</h3><p>${o.address}</p><a class="num" href="tel:${o.phone.replace(/[^\d+]/g, '')}">${o.phone}</a></div>`).join('')}</div>
  <div class="contact-map"><div class="map" id="offices-map" style="height:100%" data-offices='${JSON.stringify(offices)}'></div></div>
</div></section>`
}));

/* ---------- Политика ---------- */
write('privacy/index.html', page({
  path: 'privacy/', priority: '0.2', title: 'Политика конфиденциальности | Meridian', desc: 'Политика обработки персональных данных.',
  body: `<div class="wrap page-head">${crumbs('../', [['', 'Политика конфиденциальности']])}<h1>Политика конфиденциальности</h1></div>
<div class="wrap" style="padding-bottom:96px"><div class="prose" style="color:var(--muted)">
<p>Настоящая политика определяет порядок обработки персональных данных пользователей сайта в соответствии с Федеральным законом № 152-ФЗ «О персональных данных».</p>
<p>Мы обрабатываем имя, номер телефона и текст обращения, которые вы указываете в формах, только для связи с вами по вашему запросу. Данные не передаются третьим лицам, кроме случаев, предусмотренных законом.</p>
<p>Сайт использует файлы cookie и сервисы веб-аналитики для улучшения работы. Вы можете отключить cookie в настройках браузера.</p>
<p>Чтобы отозвать согласие или удалить данные, напишите на ${C.email}.</p>
<p><i>Текст приведён как пример и требует юридической адаптации под конкретную компанию.</i></p>
</div></div>`
}));

/* ---------- 404 ---------- */
fs.writeFileSync(path.join(OUT, '404.html'), page({
  path: '', noindex: true, title: 'Страница не найдена | Meridian', desc: 'Страница не найдена.',
  body: `<div class="wrap" style="padding-block:120px;display:grid;gap:20px;justify-items:start"><div class="eyebrow">Ошибка 404</div><h1>Такой страницы <em>нет</em></h1><p class="lead">Возможно, объект уже продан или ссылка устарела.</p><a class="btn btn--primary" href="/catalog/">Открыть каталог</a></div>`
}).replace('data-root="./"', 'data-root="/"').replace(/(href|src)="\.\/(assets|catalog|services|about|contacts|favorites|privacy|sitemap)/g, '$1="/$2'));

/* ---------- Админка ---------- */
write('admin/index.html', page({
  path: 'admin/', noindex: true, bare: true, leaflet: true, scripts: ['admin.js'], bodyClass: 'admin-body', title: 'Панель управления | Meridian', desc: 'Панель управления сайтом.',
  body: '<div id="admin"></div>'
}));

/* ---------- sitemap.xml, robots.txt ---------- */
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemap.map(u => `  <url><loc>${u.loc}</loc><lastmod>${today}</lastmod><priority>${u.pri}</priority></url>`).join('\n')}
</urlset>
`);
fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *
Disallow: /admin/
Disallow: /favorites/
Disallow: /*?*

Host: ${SITE}
Sitemap: ${SITE}/sitemap.xml
`);

console.log(`Готово: ${sitemap.length} страниц в sitemap, ${MR.objects.length} объектов.`);
