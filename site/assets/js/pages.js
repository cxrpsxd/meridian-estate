/* Главная, избранное, контакты */
(function () {
  'use strict';
  var X = window.MRX, MR = window.MR;

  /* ---------- Поиск на главной ---------- */
  var s = document.querySelector('[data-search]');
  if (s) {
    var deal = 'sale';
    var budgets = {
      sale: [['', 'Любой'], ['0-50000000', 'до 50 млн ₽'], ['50000000-150000000', '50–150 млн ₽'], ['150000000-500000000', '150–500 млн ₽'], ['500000000-', 'от 500 млн ₽']],
      rent: [['', 'Любой'], ['0-300000', 'до 300 тыс ₽/мес'], ['300000-800000', '300–800 тыс ₽/мес'], ['800000-', 'от 800 тыс ₽/мес']]
    };
    var bSel = s.querySelector('#s-budget'), cSel = s.querySelector('#s-city'), tSel = s.querySelector('#s-type'), btn = s.querySelector('button[type=submit]');
    var fill = function () { bSel.innerHTML = budgets[deal].map(function (b) { return '<option value="' + b[0] + '">' + b[1] + '</option>'; }).join(''); };
    var match = function () {
      var b = bSel.value.split('-'), min = +b[0] || 0, max = b[1] ? +b[1] : Infinity;
      return X.publicObjects().filter(function (o) {
        return o.deal === deal && (!cSel.value || o.city === cSel.value) && (!tSel.value || o.type === tSel.value) && (!bSel.value || (o.price >= min && o.price <= max));
      }).length;
    };
    var upd = function () { var n = match(); btn.textContent = n ? 'Показать ' + n + ' ' + X.plural(n, ['объект', 'объекта', 'объектов']) : 'Подобрать под запрос'; };
    s.querySelectorAll('[data-deal]').forEach(function (b) {
      b.addEventListener('click', function () {
        deal = b.getAttribute('data-deal');
        s.querySelectorAll('[data-deal]').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
        fill(); upd();
      });
    });
    [bSel, cSel, tSel].forEach(function (el) { el.addEventListener('change', upd); });
    fill(); upd();
    s.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!match()) { X.openModal(X.leadForm({ kind: 'selection', title: 'Подберём под ваш запрос', text: 'В открытом каталоге таких объектов сейчас нет. Брокер проверит закрытые продажи и пришлёт подборку.', message: 'Город, бюджет, пожелания', cta: 'Получить подборку' })); return; }
      var p = new URLSearchParams(); p.set('deal', deal);
      if (cSel.value) p.set('city', cSel.value);
      if (tSel.value) p.set('type', tSel.value);
      if (bSel.value) { var b = bSel.value.split('-'); if (+b[0]) p.set('priceMin', b[0]); if (b[1]) p.set('priceMax', b[1]); }
      X.track('search_submit', { deal: deal, city: cSel.value, type: tSel.value });
      location.href = X.ROOT + 'catalog/?' + p.toString();
    });
  }

  /* ---------- Избранные объекты на главной ---------- */
  var feat = document.querySelector('[data-featured]');
  if (feat) feat.innerHTML = X.publicObjects().filter(function (o) { return o.featured; }).slice(0, 6).map(function (o) { return X.card(o); }).join('');

  /* ---------- Счётчики по городам и типам ---------- */
  var pub = X.publicObjects();
  document.querySelectorAll('[data-count-city]').forEach(function (el) {
    var n = pub.filter(function (o) { return o.city === el.getAttribute('data-count-city'); }).length;
    el.textContent = n + ' ' + X.plural(n, ['объект', 'объекта', 'объектов']);
  });
  document.querySelectorAll('[data-count-type]').forEach(function (el) {
    el.textContent = pub.filter(function (o) { return o.type === el.getAttribute('data-count-type'); }).length;
  });

  /* ---------- Избранное ---------- */
  var fw = document.querySelector('[data-favs]');
  if (fw) {
    var draw = function () {
      var ids = X.favs(), list = ids.map(X.byId).filter(function (o) { return o && o.status !== 'draft'; });
      var bar = document.querySelector('[data-fav-bar]');
      if (!list.length) {
        bar.hidden = true;
        fw.innerHTML = '<div class="empty"><h3>Здесь пока пусто</h3><p>Нажмите на сердечко на фотографии объекта, и он сохранится в этом списке. Избранное хранится в вашем браузере, регистрация не нужна.</p><a class="btn btn--primary" href="' + X.ROOT + 'catalog/">Перейти в каталог</a></div>';
        return;
      }
      bar.hidden = false;
      bar.querySelector('[data-fav-n]').textContent = list.length + ' ' + X.plural(list.length, ['объект', 'объекта', 'объектов']);
      fw.innerHTML = '<div class="grid">' + list.map(function (o) { return X.card(o, { reveal: false }); }).join('') + '</div>';
      X.syncFavs();
    };
    draw();
    document.addEventListener('mr:favs', draw);
    var sendBtn = document.querySelector('[data-fav-send]');
    if (sendBtn) sendBtn.addEventListener('click', function () {
      var list = X.favs().map(X.byId).filter(Boolean);
      X.openModal(X.leadForm({ kind: 'selection', title: 'Обсудить избранное с брокером', text: 'Брокер свяжется, расскажет подробности и организует показы ' + list.length + ' ' + X.plural(list.length, ['объекта', 'объектов', 'объектов']) + ' в удобный день.', message: 'Лоты: ' + list.map(function (o) { return o.lot; }).join(', '), cta: 'Отправить' }));
      var ta = document.querySelector('.modal textarea'); if (ta) ta.value = 'Интересуют лоты: ' + list.map(function (o) { return o.lot; }).join(', ');
    });
  }

  /* ---------- Карта офисов ---------- */
  var om = document.getElementById('offices-map');
  if (om) {
    var offices = JSON.parse(om.getAttribute('data-offices'));
    var m = X.makeMap(om, offices[0].coords, 4);
    if (m) {
      offices.forEach(function (o) { L.marker(o.coords, { icon: X.pinIcon(o.city) }).addTo(m).bindPopup('<b>' + o.city + '</b><br>' + o.address); });
      m.fitBounds(offices.map(function (o) { return o.coords; }), { padding: [60, 60] });
    }
  }
})();
