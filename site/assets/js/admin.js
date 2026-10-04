/* Админ-панель (демо): объекты и заявки хранятся в localStorage браузера.
   В продакшене эти же экраны работают через REST API с авторизацией на сервере. */
(function () {
  'use strict';
  var X = window.MRX, MR = window.MR, esc = X.esc, I = X.I;
  var app = document.getElementById('admin');
  var DEMO = { login: 'admin', pass: 'meridian' };
  var view = 'dash', editing = null, q = '', fStatus = '', fCity = '', confirmId = null;

  function authed() { try { return sessionStorage.getItem('mr_admin') === '1'; } catch (e) { return false; } }
  function setAuthed(v) { try { v ? sessionStorage.setItem('mr_admin', '1') : sessionStorage.removeItem('mr_admin'); } catch (e) {} }
  function objects() { return X.allObjects(); }
  function saveObjects(list) {
    if (!X.ls.set('mr_objects', list)) { X.toast('Не хватает места в хранилище браузера. Уменьшите размер фото.'); return false; }
    return true;
  }
  function leads() { return X.ls.get('mr_leads', []); }

  var tr = { а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya' };
  function slugify(s) { return s.toLowerCase().split('').map(function (ch) { return tr[ch] != null ? tr[ch] : ch; }).join('').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60); }

  /* ---------- Вход ---------- */
  function renderLogin() {
    app.className = '';
    app.innerHTML = '<div class="login"><form class="panel" id="login-form" novalidate>' +
      '<a class="logo" href="../"><span class="logo__mark">Meridian</span><span class="logo__sub">admin</span></a>' +
      '<h1 style="font-size:32px">Вход в панель управления</h1>' +
      '<div class="field"><label for="l-user">Логин</label><input class="input" id="l-user" autocomplete="username"></div>' +
      '<div class="field"><label for="l-pass">Пароль</label><input class="input" id="l-pass" type="password" autocomplete="current-password"></div>' +
      '<p class="field__err" id="l-err" hidden>Неверный логин или пароль</p>' +
      '<button class="btn btn--primary btn--block" type="submit">Войти</button>' +
      '<p class="demo-note">Демо-доступ: <b>admin</b> / <b>meridian</b>. Изменения сохраняются только в этом браузере.</p>' +
      '</form></div>';
    document.getElementById('login-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var u = document.getElementById('l-user').value.trim(), p = document.getElementById('l-pass').value;
      if (u === DEMO.login && p === DEMO.pass) { setAuthed(true); render(); }
      else document.getElementById('l-err').hidden = false;
    });
  }

  /* ---------- Каркас ---------- */
  function shell(inner) {
    var newLeads = leads().filter(function (l) { return l.status === 'new'; }).length;
    var nav = [['dash', I.chart, 'Обзор'], ['objects', I.home, 'Объекты'], ['leads', I.inbox, 'Заявки']];
    app.className = 'admin';
    app.innerHTML = '<aside class="admin__side"><a class="logo" href="../"><span class="logo__mark">Meridian</span><span class="logo__sub">admin</span></a>' +
      '<nav class="admin__nav">' + nav.map(function (n) {
        return '<button type="button" data-go="' + n[0] + '"' + (view === n[0] || (view === 'edit' && n[0] === 'objects') ? ' aria-current="page"' : '') + '>' + n[1] + n[2] + (n[0] === 'leads' && newLeads ? '<span class="tag">' + newLeads + '</span>' : '') + '</button>';
      }).join('') + '<a href="../" target="_blank" rel="noopener">' + I.eye + 'Открыть сайт</a></nav>' +
      '<div class="admin__side-foot"><button type="button" data-logout style="color:inherit;text-align:left">Выйти</button><button type="button" data-reset-demo style="color:inherit;text-align:left">Сбросить демо-данные</button></div></aside>' +
      '<main class="admin__main">' + inner + '</main>';
  }

  /* ---------- Обзор ---------- */
  function renderDash() {
    var list = objects(), pub = list.filter(function (o) { return o.status !== 'draft'; }), L = leads();
    var sale = pub.filter(function (o) { return o.deal === 'sale'; }).reduce(function (s, o) { return s + o.price; }, 0);
    var byCity = MR.cities.map(function (c) { return { c: c, n: pub.filter(function (o) { return o.city === c.slug; }).length }; });
    var max = Math.max.apply(null, byCity.map(function (b) { return b.n; }).concat(1));
    shell('<div class="admin__head"><h1>Обзор</h1><button class="btn btn--primary btn--sm" type="button" data-new>' + I.plus + 'Добавить объект</button></div>' +
      '<div class="kpis">' +
        kpi('Опубликовано', pub.length) + kpi('Черновики', list.length - pub.length) + kpi('Новые заявки', L.filter(function (l) { return l.status === 'new'; }).length) + kpi('Объём в продаже', X.compact(sale)) +
      '</div>' +
      '<div class="editor" style="grid-template-columns:minmax(0,1fr) minmax(0,1fr)">' +
        '<section class="panel"><h2>Объекты по городам</h2><div style="display:grid;gap:12px">' + byCity.map(function (b) {
          return '<div style="display:grid;grid-template-columns:140px minmax(0,1fr) 32px;gap:12px;align-items:center;font-size:14px"><span>' + b.c.name + '</span><span style="height:10px;background:var(--line);border-radius:5px;overflow:hidden"><span style="display:block;height:100%;width:' + (b.n / max * 100) + '%;background:var(--accent)"></span></span><b class="num" style="text-align:right;font-weight:500">' + b.n + '</b></div>';
        }).join('') + '</div></section>' +
        '<section class="panel"><h2>Последние заявки</h2>' + (L.length ? '<div style="display:grid;gap:14px">' + L.slice(0, 5).map(function (l) {
          return '<div class="lead-card"><div style="display:flex;justify-content:space-between;gap:8px"><b style="font-weight:500">' + esc(l.name) + '</b><span class="status status--' + (l.status === 'new' ? 'new' : 'pub') + '">' + statusName(l.status) + '</span></div><span style="font-size:13px;color:var(--muted)">' + kindName(l.kind) + ' · ' + new Date(l.date).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) + '</span></div>';
        }).join('') + '</div>' : '<p style="color:var(--muted)">Заявок пока нет. Отправьте форму на сайте — она появится здесь.</p>') + '</section>' +
      '</div>');
  }
  function kpi(l, v) { return '<div class="kpi"><span>' + l + '</span><b>' + v + '</b></div>'; }
  function statusName(s) { return { 'new': 'Новая', work: 'В работе', done: 'Закрыта' }[s] || s; }
  function kindName(k) { return { viewing: 'Просмотр', selection: 'Подбор', consultation: 'Консультация', sell: 'Продажа объекта' }[k] || 'Заявка'; }

  /* ---------- Список объектов ---------- */
  function renderObjects() {
    var list = objects().filter(function (o) {
      if (q && (o.title + ' ' + o.lot + ' ' + o.district).toLowerCase().indexOf(q.toLowerCase()) < 0) return false;
      if (fStatus && (o.status || 'published') !== fStatus) return false;
      if (fCity && o.city !== fCity) return false;
      return true;
    });
    shell('<div class="admin__head"><h1>Объекты</h1><button class="btn btn--primary btn--sm" type="button" data-new>' + I.plus + 'Добавить объект</button></div>' +
      '<section class="panel"><div class="panel__bar">' +
        '<input class="input" type="search" id="a-q" placeholder="Поиск по названию, лоту, району" value="' + esc(q) + '" aria-label="Поиск">' +
        '<select class="select" id="a-status" aria-label="Статус"><option value="">Все статусы</option><option value="published"' + (fStatus === 'published' ? ' selected' : '') + '>Опубликован</option><option value="draft"' + (fStatus === 'draft' ? ' selected' : '') + '>Черновик</option></select>' +
        '<select class="select" id="a-city" aria-label="Город"><option value="">Все города</option>' + MR.cities.map(function (c) { return '<option value="' + c.slug + '"' + (fCity === c.slug ? ' selected' : '') + '>' + c.name + '</option>'; }).join('') + '</select>' +
        '<span style="margin-left:auto;font-size:13px;color:var(--muted)">' + list.length + ' из ' + objects().length + '</span>' +
      '</div><div class="table-scroll"><table class="atable"><thead><tr><th></th><th>Объект</th><th>Тип</th><th>Цена</th><th>Площадь</th><th>Статус</th><th></th></tr></thead><tbody>' +
      list.map(function (o) {
        var st = o.status === 'draft' ? '<span class="status status--draft">Черновик</span>' : '<span class="status status--pub">Опубликован</span>';
        var actions = confirmId === o.id
          ? '<span class="confirm-inline">Удалить объект? <button class="btn btn--sm btn--primary" type="button" data-del-yes="' + esc(o.id) + '" style="min-height:32px;background:var(--err)">Удалить</button><button class="btn btn--sm btn--ghost" type="button" data-del-no style="min-height:32px">Отмена</button></span>'
          : '<a class="icon-btn" href="' + X.objUrl(o) + '" target="_blank" rel="noopener" aria-label="Открыть на сайте">' + I.eye + '</a><button class="icon-btn" type="button" data-edit="' + esc(o.id) + '" aria-label="Редактировать">' + I.edit + '</button><button class="icon-btn" type="button" data-del="' + esc(o.id) + '" aria-label="Удалить">' + I.trash + '</button>';
        return '<tr><td><img class="thumb" src="' + esc((o.photos[0] || '').replace('w=1600', 'w=160')) + '" alt=""></td>' +
          '<td><span class="t-title">' + esc(o.title) + (o.featured ? ' <span style="color:var(--brass)" title="На главной">★</span>' : '') + '</span><span class="t-sub">Лот ' + esc(o.lot) + ' · ' + esc(X.city(o.city).name) + ', ' + esc(o.district) + '</span></td>' +
          '<td>' + X.type(o.type).name + '<br><span class="t-sub">' + (o.deal === 'rent' ? 'Аренда' : 'Продажа') + '</span></td>' +
          '<td class="num">' + X.priceLabel(o) + '</td><td class="num">' + o.area + ' м²</td><td>' + st + '</td>' +
          '<td><div class="row-actions">' + actions + '</div></td></tr>';
      }).join('') + '</tbody></table></div></section>');
    var qi = document.getElementById('a-q');
    qi.addEventListener('input', function () { q = qi.value; var pos = qi.selectionStart; renderObjects(); var n = document.getElementById('a-q'); n.focus(); n.setSelectionRange(pos, pos); });
    document.getElementById('a-status').addEventListener('change', function (e) { fStatus = e.target.value; renderObjects(); });
    document.getElementById('a-city').addEventListener('change', function (e) { fCity = e.target.value; renderObjects(); });
  }

  /* ---------- Редактор ---------- */
  function blank() {
    var maxLot = objects().reduce(function (m, o) { return Math.max(m, parseInt(o.lot, 10) || 0); }, 0);
    return { id: '', lot: String(maxLot + 1).padStart(4, '0'), title: '', city: 'moskva', district: '', type: 'apartment', deal: 'sale', price: '', area: '', rooms: '', floor: '', floors: '', land: '', year: new Date().getFullYear(),
      coords: null, agent: 'a1', featured: false, badge: '', features: [], photos: [], description: '', status: 'draft', seoTitle: '', seoDesc: '' };
  }
  function renderEdit() {
    var o = editing, isNew = !objects().some(function (x) { return x.id === o.id; }) || !o.id;
    var opt = function (arr, cur) { return arr.map(function (a) { return '<option value="' + a[0] + '"' + (String(cur) === String(a[0]) ? ' selected' : '') + '>' + a[1] + '</option>'; }).join(''); };
    var fld = function (id, label, val, attrs) { return '<div class="field"><label for="e-' + id + '">' + label + '</label><input class="input" id="e-' + id + '" name="' + id + '" value="' + esc(val == null ? '' : val) + '" ' + (attrs || '') + '></div>'; };
    shell('<div class="admin__head"><div style="display:grid;gap:6px"><button type="button" data-go="objects" style="font-size:14px;color:var(--muted);text-align:left">← Все объекты</button><h1>' + (isNew ? 'Новый объект' : 'Редактирование') + '</h1></div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap">' + (!isNew ? '<a class="btn btn--ghost btn--sm" href="' + X.objUrl(o) + '" target="_blank" rel="noopener">' + I.eye + 'На сайте</a>' : '') + '<button class="btn btn--primary btn--sm" type="submit" form="edit-form">Сохранить</button></div></div>' +
      '<form id="edit-form" class="editor" novalidate>' +
        '<div style="display:grid;gap:20px;min-width:0">' +
          '<section class="panel"><h2>Основное</h2>' +
            fld('title', 'Заголовок', o.title, 'required placeholder="Например: Пентхаус с террасой на Остоженке"') +
            '<div class="row-2">' + fld('id', 'Адрес страницы (ЧПУ)', o.id, 'placeholder="заполнится из заголовка"') + fld('lot', 'Номер лота', o.lot) + '</div>' +
            '<div class="row-3">' +
              '<div class="field"><label for="e-deal">Сделка</label><select class="select" id="e-deal" name="deal">' + opt([['sale', 'Продажа'], ['rent', 'Аренда']], o.deal) + '</select></div>' +
              '<div class="field"><label for="e-type">Тип</label><select class="select" id="e-type" name="type">' + opt(MR.types.map(function (t) { return [t.id, t.name]; }), o.type) + '</select></div>' +
              '<div class="field"><label for="e-city">Город</label><select class="select" id="e-city" name="city">' + opt(MR.cities.map(function (c) { return [c.slug, c.name]; }), o.city) + '</select></div>' +
            '</div>' +
            fld('district', 'Район, улица', o.district, 'placeholder="Хамовники, Остоженка"') +
            '<div class="field"><label for="e-description">Описание</label><textarea class="textarea" id="e-description" name="description" rows="7">' + esc(o.description) + '</textarea></div>' +
          '</section>' +
          '<section class="panel"><h2>Параметры</h2>' +
            '<div class="row-3">' + fld('price', 'Цена, ₽' + (o.deal === 'rent' ? ' в месяц' : ''), o.price, 'inputmode="numeric" required') + fld('area', 'Площадь, м²', o.area, 'inputmode="numeric" required') + fld('rooms', 'Комнат', o.rooms, 'inputmode="numeric"') + '</div>' +
            '<div class="row-3">' + fld('floor', 'Этаж', o.floor, 'inputmode="numeric"') + fld('floors', 'Этажей в доме', o.floors, 'inputmode="numeric"') + fld('land', 'Участок, сот.', o.land, 'inputmode="numeric"') + '</div>' +
            '<div class="row-3">' + fld('year', 'Год постройки', o.year, 'inputmode="numeric"') + fld('badge', 'Метка на карточке', o.badge, 'placeholder="Эксклюзив, Новое…"') +
              '<div class="field"><label for="e-agent">Брокер</label><select class="select" id="e-agent" name="agent">' + opt(MR.agents.map(function (a) { return [a.id, a.name]; }), o.agent) + '</select></div></div>' +
            '<div class="field"><span style="font-size:13px;color:var(--muted)">Особенности</span><div class="cats">' + Object.keys(MR.features).map(function (k) {
              return '<label class="check" style="font-size:14px;margin-right:12px"><input type="checkbox" name="features" value="' + k + '"' + (o.features.indexOf(k) > -1 ? ' checked' : '') + '> ' + MR.features[k] + '</label>';
            }).join('') + '</div></div>' +
          '</section>' +
          '<section class="panel"><h2>Фотографии</h2><p style="font-size:14px;color:var(--muted)">Первое фото — обложка карточки. Можно вставить ссылку или загрузить файл.</p>' +
            '<div class="photo-list" data-photos></div>' +
            '<div style="display:flex;gap:8px;flex-wrap:wrap"><input class="input" id="e-photo-url" placeholder="https://…" style="flex:1 1 240px;min-height:44px" aria-label="Ссылка на фото"><button class="btn btn--ghost btn--sm" type="button" data-photo-add>Добавить по ссылке</button>' +
            '<label class="btn btn--ghost btn--sm" style="cursor:pointer">Загрузить файл<input type="file" accept="image/*" multiple data-photo-file hidden></label></div>' +
          '</section>' +
          '<section class="panel"><h2>Расположение</h2><p style="font-size:14px;color:var(--muted)">Кликните по карте, чтобы поставить точку.</p><div class="picker-map"><div class="map" id="picker"></div></div><div style="font-size:13px;color:var(--muted)" data-coords></div></section>' +
        '</div>' +
        '<div style="display:grid;gap:20px;min-width:0">' +
          '<section class="panel"><h2>Публикация</h2>' +
            '<label class="toggle">Опубликован на сайте<input type="checkbox" name="published"' + (o.status !== 'draft' ? ' checked' : '') + '></label>' +
            '<label class="toggle">Показывать на главной<input type="checkbox" name="featured"' + (o.featured ? ' checked' : '') + '></label>' +
            '<button class="btn btn--primary btn--block" type="submit">Сохранить</button>' +
          '</section>' +
          '<section class="panel"><h2>SEO</h2>' +
            fld('seoTitle', 'Title', o.seoTitle, 'placeholder="По умолчанию: заголовок + цена"') +
            '<div class="field"><label for="e-seoDesc">Description</label><textarea class="textarea" id="e-seoDesc" name="seoDesc" rows="3" placeholder="До 160 символов">' + esc(o.seoDesc || '') + '</textarea></div>' +
            '<div style="font-size:13px;display:grid;gap:2px;padding:12px;border:1px solid var(--line);border-radius:4px" data-snippet></div>' +
          '</section>' +
        '</div>' +
      '</form>');

    var form = document.getElementById('edit-form');
    var photos = o.photos.slice();
    function drawPhotos() {
      form.querySelector('[data-photos]').innerHTML = photos.map(function (p, i) {
        return '<div class="photo-item"><img src="' + esc(p.indexOf('data:') === 0 ? p : p.replace('w=1600', 'w=200')) + '" alt=""><input class="input" value="' + esc(p.indexOf('data:') === 0 ? 'Загруженный файл' : p) + '" readonly aria-label="Фото ' + (i + 1) + '">' +
          '<div class="row-actions">' + (i ? '<button class="icon-btn" type="button" data-photo-up="' + i + '" aria-label="Сделать выше">↑</button>' : '<span class="status status--new">Обложка</span>') + '<button class="icon-btn" type="button" data-photo-del="' + i + '" aria-label="Удалить фото">' + I.trash + '</button></div></div>';
      }).join('') || '<p style="font-size:14px;color:var(--muted)">Фото пока нет.</p>';
    }
    drawPhotos();
    form.addEventListener('click', function (e) {
      var up = e.target.closest('[data-photo-up]'), del = e.target.closest('[data-photo-del]');
      if (up) { var i = +up.getAttribute('data-photo-up'); photos.splice(i - 1, 0, photos.splice(i, 1)[0]); drawPhotos(); }
      if (del) { photos.splice(+del.getAttribute('data-photo-del'), 1); drawPhotos(); }
      if (e.target.closest('[data-photo-add]')) {
        var u = document.getElementById('e-photo-url'); if (/^https?:\/\//.test(u.value.trim())) { photos.push(u.value.trim()); u.value = ''; drawPhotos(); } else X.toast('Вставьте ссылку, начинающуюся с https://');
      }
    });
    form.querySelector('[data-photo-file]').addEventListener('change', function (e) {
      Array.prototype.forEach.call(e.target.files, function (file) {
        var img = new Image(), r = new FileReader();
        r.onload = function () {
          img.onload = function () { // уменьшаем до 1600 px, чтобы поместиться в хранилище
            var s = Math.min(1, 1600 / img.width), cv = document.createElement('canvas'); cv.width = img.width * s; cv.height = img.height * s;
            cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height); photos.push(cv.toDataURL('image/jpeg', .78)); drawPhotos();
          };
          img.src = r.result;
        };
        r.readAsDataURL(file);
      });
    });

    var title = form.elements.title, idf = form.elements.id, idTouched = !!o.id;
    idf.addEventListener('input', function () { idTouched = true; });
    function snippet() {
      if (!idTouched) idf.value = slugify(title.value);
      var t = form.elements.seoTitle.value || (title.value || 'Заголовок объекта') + ' — Meridian';
      var d = form.elements.seoDesc.value || (form.elements.description.value || '').slice(0, 155);
      form.querySelector('[data-snippet]').innerHTML = '<span style="color:var(--muted)">meridian-estate.example › object › ' + esc(idf.value || '…') + '</span><b style="font-weight:500;color:var(--accent)">' + esc(t) + '</b><span style="color:var(--muted)">' + esc(d) + '</span>';
    }
    form.addEventListener('input', snippet); snippet();

    var coords = o.coords ? o.coords.slice() : null, pmap, pm;
    function showCoords() { form.querySelector('[data-coords]').textContent = coords ? 'Координаты: ' + coords[0].toFixed(5) + ', ' + coords[1].toFixed(5) : 'Точка не выбрана'; }
    showCoords();
    var c0 = X.city(o.city);
    pmap = X.makeMap(document.getElementById('picker'), coords || c0.center, coords ? 14 : c0.zoom, { scrollWheelZoom: true });
    if (pmap) {
      if (coords) pm = L.marker(coords, { icon: X.pinIcon('Объект', true) }).addTo(pmap);
      pmap.on('click', function (ev) { coords = [+ev.latlng.lat.toFixed(5), +ev.latlng.lng.toFixed(5)]; if (pm) pm.setLatLng(coords); else pm = L.marker(coords, { icon: X.pinIcon('Объект', true) }).addTo(pmap); showCoords(); });
      form.elements.city.addEventListener('change', function () { var c = X.city(form.elements.city.value); pmap.setView(c.center, c.zoom); });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = form.elements, n = function (k) { var v = parseInt(String(f[k].value).replace(/\D/g, ''), 10); return isNaN(v) ? null : v; };
      var errs = [];
      if (f.title.value.trim().length < 5) errs.push('заголовок');
      if (!n('price')) errs.push('цену');
      if (!n('area')) errs.push('площадь');
      if (errs.length) { X.toast('Заполните ' + errs.join(', ')); return; }
      var newId = slugify(f.id.value || f.title.value);
      var list = objects();
      var clash = list.some(function (x) { return x.id === newId && x.id !== o.id; });
      if (clash) { X.toast('Такой адрес страницы уже занят. Измените ЧПУ.'); return; }
      var rec = Object.assign({}, o, {
        id: newId, lot: f.lot.value.trim(), title: f.title.value.trim(), city: f.city.value, district: f.district.value.trim(), type: f.type.value, deal: f.deal.value,
        price: n('price'), area: n('area'), rooms: n('rooms'), floor: n('floor'), floors: n('floors'), land: n('land'), year: n('year'), agent: f.agent.value,
        badge: f.badge.value.trim(), description: f.description.value.trim(), features: Array.prototype.filter.call(form.querySelectorAll('[name=features]'), function (c) { return c.checked; }).map(function (c) { return c.value; }),
        photos: photos, coords: coords || X.city(f.city.value).center, status: f.published.checked ? 'published' : 'draft', featured: f.featured.checked,
        seoTitle: f.seoTitle.value.trim(), seoDesc: f.seoDesc.value.trim(), updated: new Date().toISOString()
      });
      var idx = list.findIndex(function (x) { return x.id === o.id && o.id; });
      if (idx > -1) list[idx] = rec; else list.unshift(rec);
      if (saveObjects(list)) { editing = rec; X.toast(rec.status === 'draft' ? 'Сохранено как черновик' : 'Сохранено и опубликовано'); renderEdit(); }
    });
  }

  /* ---------- Заявки ---------- */
  function renderLeads() {
    var L = leads();
    shell('<div class="admin__head"><h1>Заявки</h1></div><section class="panel">' + (L.length ?
      '<div class="table-scroll"><table class="atable"><thead><tr><th>Дата</th><th>Клиент</th><th>Тип</th><th>Объект</th><th>Комментарий</th><th>Статус</th></tr></thead><tbody>' +
      L.map(function (l, i) {
        var o = l.object ? X.byId(l.object) : null;
        return '<tr><td class="num">' + new Date(l.date).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) + '</td>' +
          '<td><span class="t-title">' + esc(l.name) + '</span><span class="t-sub num">' + esc(l.phone) + ' · ' + esc(l.channel || 'Звонок') + '</span></td>' +
          '<td>' + kindName(l.kind) + (l.time ? '<br><span class="t-sub">' + esc((l.viewDate || '') + ' ' + l.time) + '</span>' : '') + '</td>' +
          '<td>' + (o ? '<a href="' + X.objUrl(o) + '" target="_blank" rel="noopener" style="text-decoration:underline">Лот ' + esc(o.lot) + '</a>' : '—') + '</td>' +
          '<td style="max-width:260px;font-size:13px;color:var(--muted)">' + esc(l.message || '—') + '</td>' +
          '<td><select class="select" data-lead-status="' + i + '" aria-label="Статус заявки" style="min-height:36px;padding:4px 32px 4px 10px;font-size:13px">' +
            ['new', 'work', 'done'].map(function (s) { return '<option value="' + s + '"' + (l.status === s ? ' selected' : '') + '>' + statusName(s) + '</option>'; }).join('') + '</select></td></tr>';
      }).join('') + '</tbody></table></div>'
      : '<div style="padding:32px;display:grid;gap:10px"><b style="font-weight:500">Заявок пока нет</b><p style="color:var(--muted)">Заявки с сайта (просмотр, подбор, консультация) появляются здесь. В рабочей версии они параллельно уходят в CRM и Telegram менеджеру.</p><a class="link-arrow" href="../contacts/" target="_blank" rel="noopener" style="justify-self:start">Отправить тестовую заявку</a></div>') + '</section>');
    app.querySelectorAll('[data-lead-status]').forEach(function (s) {
      s.addEventListener('change', function () { var L2 = leads(); L2[+s.getAttribute('data-lead-status')].status = s.value; X.ls.set('mr_leads', L2); X.toast('Статус обновлён'); });
    });
  }

  /* ---------- Роутер ---------- */
  function render() {
    if (!authed()) return renderLogin();
    if (view === 'objects') renderObjects();
    else if (view === 'leads') renderLeads();
    else if (view === 'edit') renderEdit();
    else renderDash();
  }
  app.addEventListener('click', function (e) {
    var g = e.target.closest('[data-go]'); if (g) { view = g.getAttribute('data-go'); confirmId = null; render(); window.scrollTo(0, 0); return; }
    if (e.target.closest('[data-new]')) { editing = blank(); view = 'edit'; render(); return; }
    var ed = e.target.closest('[data-edit]'); if (ed) { editing = JSON.parse(JSON.stringify(X.byId(ed.getAttribute('data-edit')))); editing.features = editing.features || []; view = 'edit'; render(); window.scrollTo(0, 0); return; }
    var d = e.target.closest('[data-del]'); if (d) { confirmId = d.getAttribute('data-del'); renderObjects(); return; }
    if (e.target.closest('[data-del-no]')) { confirmId = null; renderObjects(); return; }
    var y = e.target.closest('[data-del-yes]');
    if (y) { var id = y.getAttribute('data-del-yes'); saveObjects(objects().filter(function (o) { return o.id !== id; })); confirmId = null; X.toast('Объект удалён'); renderObjects(); return; }
    if (e.target.closest('[data-logout]')) { setAuthed(false); render(); return; }
    var r = e.target.closest('[data-reset-demo]');
    if (r) {
      if (r.getAttribute('data-armed')) { X.ls.del('mr_objects'); X.ls.del('mr_leads'); X.toast('Демо-данные восстановлены'); view = 'dash'; render(); }
      else { r.setAttribute('data-armed', '1'); r.textContent = 'Нажмите ещё раз для сброса'; setTimeout(function () { if (r.isConnected) { r.removeAttribute('data-armed'); r.textContent = 'Сбросить демо-данные'; } }, 4000); }
    }
  });
  render();
})();
