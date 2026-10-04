/* Карточка объекта: галерея, характеристики, карта, ипотека, похожие */
(function () {
  'use strict';
  var X = window.MRX, MR = window.MR;
  var main = document.querySelector('[data-object-page]');
  if (!main) return;
  var id = main.getAttribute('data-object-page') || new URLSearchParams(location.search).get('id');
  var o = id && X.byId(id);
  var R = X.ROOT, esc = X.esc;

  if (!o || o.status === 'draft') {
    main.innerHTML = '<div class="wrap"><div class="empty"><h3>Объект снят с продажи или не найден</h3><p>Возможно, сделка уже состоялась. Посмотрите похожие предложения в каталоге или оставьте заявку на подбор.</p><div style="display:flex;gap:10px;flex-wrap:wrap"><a class="btn btn--primary" href="' + R + 'catalog/">Открыть каталог</a><button class="btn btn--ghost" type="button" data-modal="selection">Запросить подборку</button></div></div></div>';
    return;
  }

  var c = X.city(o.city), t = X.type(o.type), agent = MR.agents.find(function (a) { return a.id === o.agent; }) || MR.agents[0];
  document.title = o.title + ' — ' + X.priceLabel(o) + ' | Meridian';
  var initials = agent.name.split(' ').map(function (s) { return s[0]; }).join('');
  var pm = X.perM2(o);

  var specRows = [
    ['Площадь', X.nf.format(o.area) + ' м²'],
    o.rooms ? ['Комнат', o.rooms] : ['Тип', t.name],
    o.floor ? ['Этаж', o.floor + ' из ' + o.floors] : (o.land ? ['Участок', o.land + ' сот.'] : ['Этажей', o.floors]),
    ['Год постройки', o.year]
  ];
  var details = [
    ['Тип объекта', t.name], ['Сделка', o.deal === 'rent' ? 'Аренда' : 'Продажа'], ['Город', c.name], ['Район', o.district],
    ['Общая площадь', X.nf.format(o.area) + ' м²'], o.floors ? ['Этажность', o.floors] : null, o.land ? ['Участок', o.land + ' сот.'] : null,
    ['Год постройки', o.year], ['Номер лота', o.lot]
  ].filter(Boolean);

  var photos = o.photos.length ? o.photos : [MR.img('1600585154340-be6161a56a0c')];
  var gal = photos.slice(0, 3).map(function (p, i) {
    return '<button type="button" data-open="' + i + '" aria-label="Открыть фото ' + (i + 1) + ' из ' + photos.length + '"><img src="' + esc(p.replace('w=1600', i ? 'w=900' : 'w=1600')) + '" alt="' + esc(o.title) + ', фото ' + (i + 1) + '"' + (i ? ' loading="lazy"' : ' fetchpriority="high"') + '></button>';
  }).join('');
  // на телефоне — горизонтальная лента из всех фото
  var galMobileExtra = photos.slice(3).map(function (p, i) {
    return '<button type="button" data-open="' + (i + 3) + '" class="gal-extra" aria-label="Открыть фото ' + (i + 4) + '"><img src="' + esc(p.replace('w=1600', 'w=900')) + '" alt="" loading="lazy"></button>';
  }).join('');

  main.innerHTML =
    '<div class="wrap" style="padding-top:28px;display:grid;gap:20px">' +
      '<nav class="crumbs" aria-label="Хлебные крошки"><a href="' + R + '">Главная</a><span aria-hidden="true">/</span><a href="' + R + 'catalog/">Каталог</a><span aria-hidden="true">/</span><a href="' + R + 'catalog/' + c.slug + '/">' + esc(c.name) + '</a><span aria-hidden="true">/</span><span>Лот ' + esc(o.lot) + '</span></nav>' +
      '<div style="position:relative"><div class="gallery">' + gal + galMobileExtra + '</div>' +
        '<button class="btn btn--light btn--sm gallery__all" type="button" data-open="0">Все фото · ' + photos.length + '</button></div>' +
      (photos.length > 1 ? '<div class="gallery__counter">Листайте, чтобы посмотреть все ' + photos.length + ' фото</div>' : '') +
    '</div>' +
    '<div class="wrap"><div class="obj">' +
      '<div class="obj__main">' +
        '<div class="obj__head">' +
          '<div class="eyebrow">' + esc(t.name) + ' · ' + (o.deal === 'rent' ? 'аренда' : 'продажа') + ' · лот ' + esc(o.lot) + '</div>' +
          '<h1>' + esc(o.title) + '</h1>' +
          '<div class="obj__addr"><span>' + esc(c.name) + ', ' + esc(o.district) + '</span></div>' +
          '<div class="obj__tools">' +
            '<button class="btn btn--ghost btn--sm" type="button" data-fav="' + esc(o.id) + '">' + X.I.heart + '<span data-fav-label>В избранное</span></button>' +
            '<button class="btn btn--ghost btn--sm" type="button" data-share>' + X.I.share + 'Поделиться</button>' +
          '</div>' +
        '</div>' +
        '<dl class="specs">' + specRows.map(function (r) { return '<div><dt>' + r[0] + '</dt><dd>' + r[1] + '</dd></div>'; }).join('') + '</dl>' +
        '<section class="block"><h2>Об объекте</h2><div class="prose">' + o.description.split(/\n+/).map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') + '</div></section>' +
        (o.features && o.features.length ? '<section class="block"><h2>Особенности</h2><ul class="feat-list">' + o.features.map(function (f) { return '<li>' + X.I.check + (MR.features[f] || f) + '</li>'; }).join('') + '</ul></section>' : '') +
        '<section class="block"><h2>Характеристики</h2><table class="tbl"><tbody>' + details.map(function (d) { return '<tr><td>' + d[0] + '</td><td>' + esc(d[1]) + '</td></tr>'; }).join('') + '</tbody></table></section>' +
        '<section class="block"><h2>Расположение</h2><p class="lead" style="font-size:16px">' + esc(c.name) + ', ' + esc(o.district) + '. Точный адрес сообщаем после записи на просмотр.</p><div class="obj-map"><div class="map" id="obj-map"></div></div></section>' +
        (o.deal === 'sale' ? calcHTML() : '') +
      '</div>' +
      '<aside class="aside">' +
        '<div class="price-box">' +
          '<div><div class="price-box__price">' + X.priceLabel(o) + '</div>' + (pm ? '<div class="price-box__sub">' + pm + '</div>' : '<div class="price-box__sub">Коммунальные платежи по счётчикам</div>') + '</div>' +
          '<div style="display:grid;gap:8px">' +
            '<button class="btn btn--primary btn--block" type="button" data-modal="viewing" data-object="' + esc(o.id) + '">Записаться на просмотр</button>' +
            '<div class="quick-msg">' +
              '<a class="btn btn--ghost btn--sm" href="https://wa.me/' + MR.config.whatsapp + '?text=' + encodeURIComponent('Здравствуйте! Интересует лот ' + o.lot + ': ' + o.title) + '" target="_blank" rel="noopener" data-track="messenger_whatsapp">' + X.I.wa + 'WhatsApp</a>' +
              '<a class="btn btn--ghost btn--sm" href="https://t.me/' + MR.config.telegram + '" target="_blank" rel="noopener" data-track="messenger_telegram">' + X.I.tg + 'Telegram</a>' +
            '</div>' +
          '</div>' +
          '<div class="agent"><div class="agent__ava" aria-hidden="true">' + initials + '</div><div><b>' + esc(agent.name) + '</b><span>' + esc(agent.role) + '</span><br><a href="tel:' + agent.phone.replace(/[^\d+]/g, '') + '" class="num" data-track="phone_click" style="font-size:14px">' + agent.phone + '</a></div></div>' +
        '</div>' +
        '<div class="price-box" style="gap:12px"><b style="font-weight:500">Нужна консультация юриста?</b><p style="font-size:14px;color:var(--muted)">Проверим историю объекта и документы до внесения аванса.</p><button class="link-arrow" type="button" data-modal="consultation" data-object="' + esc(o.id) + '" style="justify-self:start">Задать вопрос ' + X.I.arrow.replace('<svg', '<svg width="18" height="18"') + '</button></div>' +
      '</aside>' +
    '</div></div>' +
    '<section class="section section--tight" style="border-top:1px solid var(--line)"><div class="wrap">' +
      '<div class="section-head"><div><div class="eyebrow">Подобрали по городу, типу и бюджету</div><h2>Похожие объекты</h2></div><a class="link-arrow" href="' + R + 'catalog/' + c.slug + '/">Все объекты ' + esc(c.in) + ' ' + X.I.arrow.replace('<svg', '<svg width="18" height="18"') + '</a></div>' +
      '<div class="grid" data-similar></div>' +
    '</div></section>' +
    '<div class="mobilebar"><div><b>' + X.priceLabel(o) + '</b><span>' + X.specs(o).join(' · ') + '</span></div><button class="btn btn--primary btn--sm" type="button" data-modal="viewing" data-object="' + esc(o.id) + '">Записаться</button></div>';
  document.body.classList.add('has-mobilebar');

  /* похожие */
  var sim = X.publicObjects().filter(function (x) { return x.id !== o.id && x.deal === o.deal; })
    .map(function (x) {
      var s = 0; if (x.city === o.city) s += 3; if (x.type === o.type) s += 2;
      s -= Math.abs(Math.log(x.price / o.price)); return { x: x, s: s };
    }).sort(function (a, b) { return b.s - a.s; }).slice(0, 3).map(function (r) { return r.x; });
  main.querySelector('[data-similar]').innerHTML = sim.map(function (x) { return X.card(x); }).join('');

  X.syncFavs();
  X.track('object_view', { object_id: o.id, price: o.price, city: o.city });

  /* карта */
  function initMap() {
    var m = X.makeMap(document.getElementById('obj-map'), o.coords || c.center, 14);
    if (!m) return;
    L.circle(o.coords || c.center, { radius: 350, color: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#23443A', weight: 1.5, fillOpacity: .12 }).addTo(m);
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { io.disconnect(); initMap(); } }, { rootMargin: '300px' });
    io.observe(document.getElementById('obj-map'));
  } else initMap();

  /* поделиться */
  main.querySelector('[data-share]').addEventListener('click', function () {
    var url = location.href;
    if (navigator.share) { navigator.share({ title: o.title, url: url }).catch(function () {}); return; }
    if (navigator.clipboard) navigator.clipboard.writeText(url).then(function () { X.toast('Ссылка скопирована'); }, function () { X.toast(url); });
    else X.toast(url);
  });

  /* ипотечный калькулятор */
  function calcHTML() {
    return '<section class="block" id="mortgage"><h2>Ипотечный калькулятор</h2><div class="calc">' +
      '<div class="calc__row"><label for="c-down">Первоначальный взнос <b data-o="down"></b></label><input type="range" id="c-down" min="20" max="90" step="5" value="30"></div>' +
      '<div class="calc__row"><label for="c-years">Срок кредита <b data-o="years"></b></label><input type="range" id="c-years" min="5" max="30" step="1" value="20"></div>' +
      '<div class="calc__row"><label for="c-rate">Ставка <b data-o="rate"></b></label><input type="range" id="c-rate" min="6" max="24" step="0.5" value="18"></div>' +
      '<div class="calc__res"><span style="color:var(--muted);font-size:14px">Ежемесячный платёж</span><b data-o="pay"></b></div>' +
      '<div class="calc__note">Расчёт предварительный. Брокер подберёт программу с лучшей ставкой среди 14 банков-партнёров.</div></div></section>';
  }
  var cd = document.getElementById('c-down');
  if (cd) {
    var cy = document.getElementById('c-years'), cr = document.getElementById('c-rate');
    var out = function (k) { return main.querySelector('[data-o="' + k + '"]'); };
    var calc = function () {
      var down = o.price * cd.value / 100, loan = o.price - down, n = cy.value * 12, r = cr.value / 1200;
      var pay = r ? loan * r / (1 - Math.pow(1 + r, -n)) : loan / n;
      out('down').textContent = cd.value + '% · ' + X.compact(down);
      out('years').textContent = cy.value + ' ' + X.plural(+cy.value, ['год', 'года', 'лет']);
      out('rate').textContent = String(cr.value).replace('.', ',') + '%';
      out('pay').textContent = X.money(pay);
    };
    [cd, cy, cr].forEach(function (i) { i.addEventListener('input', calc); }); calc();
  }

  /* лайтбокс */
  var idx = 0, lb;
  function openLB(i) {
    idx = i;
    lb = document.createElement('div');
    lb.className = 'lightbox'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Фотогалерея');
    lb.innerHTML = '<div class="lightbox__top"><span data-lb-count></span><button class="icon-btn" type="button" data-lb-close aria-label="Закрыть">' + X.I.close + '</button></div>' +
      '<div class="lightbox__stage"><img alt="" data-lb-img><button class="lightbox__nav lightbox__nav--prev" type="button" data-lb="-1" aria-label="Предыдущее фото">' + X.I.left + '</button><button class="lightbox__nav lightbox__nav--next" type="button" data-lb="1" aria-label="Следующее фото">' + X.I.right + '</button></div>' +
      '<div class="lightbox__thumbs">' + photos.map(function (p, k) { return '<button type="button" data-lb-go="' + k + '" aria-label="Фото ' + (k + 1) + '"><img src="' + esc(p.replace('w=1600', 'w=200')) + '" alt=""></button>'; }).join('') + '</div>';
    document.body.appendChild(lb); document.body.style.overflow = 'hidden';
    show();
    lb.addEventListener('click', function (e) {
      var n = e.target.closest('[data-lb]'), g = e.target.closest('[data-lb-go]');
      if (n) go(+n.getAttribute('data-lb')); else if (g) { idx = +g.getAttribute('data-lb-go'); show(); }
      else if (e.target.closest('[data-lb-close]')) closeLB();
    });
    var sx = null, stage = lb.querySelector('.lightbox__stage');
    stage.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', function (e) { if (sx == null) return; var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1); sx = null; });
    lb.querySelector('[data-lb-close]').focus();
    X.track('gallery_open', { object_id: o.id });
  }
  function go(d) { idx = (idx + d + photos.length) % photos.length; show(); }
  function show() {
    lb.querySelector('[data-lb-img]').src = photos[idx].replace('w=1600', 'w=2200');
    lb.querySelector('[data-lb-img]').alt = o.title + ', фото ' + (idx + 1);
    lb.querySelector('[data-lb-count]').textContent = (idx + 1) + ' / ' + photos.length;
    lb.querySelectorAll('[data-lb-go]').forEach(function (b, k) { b.setAttribute('aria-current', k === idx); if (k === idx) b.scrollIntoView({ block: 'nearest', inline: 'center' }); });
  }
  function closeLB() { if (lb) { lb.remove(); lb = null; document.body.style.overflow = ''; } }
  document.addEventListener('keydown', function (e) {
    if (!lb) return;
    if (e.key === 'Escape') closeLB(); else if (e.key === 'ArrowRight') go(1); else if (e.key === 'ArrowLeft') go(-1);
  });
  main.addEventListener('click', function (e) { var b = e.target.closest('[data-open]'); if (b) openLB(+b.getAttribute('data-open')); });
})();
