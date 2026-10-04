/* Каталог: фильтры, сортировка, список и карта */
(function () {
  'use strict';
  var X = window.MRX, MR = window.MR;
  var root = document.querySelector('[data-catalog]');
  if (!root) return;

  var preset = JSON.parse(root.getAttribute('data-preset') || '{}');
  var PAGE = 9;
  var state = {
    deal: '', city: '', type: [], priceMin: '', priceMax: '', areaMin: '', areaMax: '',
    rooms: [], feat: [], sort: 'new', view: 'grid', shown: PAGE
  };

  /* начальное состояние: пресет SEO-страницы, затем параметры URL */
  Object.keys(preset).forEach(function (k) { state[k] = preset[k]; });
  var q = new URLSearchParams(location.search);
  ['deal', 'city', 'priceMin', 'priceMax', 'areaMin', 'areaMax', 'sort', 'view'].forEach(function (k) { if (q.get(k)) state[k] = q.get(k); });
  ['type', 'rooms', 'feat'].forEach(function (k) { if (q.get(k)) state[k] = q.get(k).split(','); });

  var filtersEl = root.querySelector('.filters');
  var listEl = root.querySelector('[data-list]');
  var countEl = root.querySelector('[data-count]');
  var chipsEl = root.querySelector('[data-chips]');
  var map, markers = [];

  function num(v) { var n = parseInt(String(v).replace(/\D/g, ''), 10); return isNaN(n) ? null : n; }

  function filtered() {
    var pMin = num(state.priceMin), pMax = num(state.priceMax), aMin = num(state.areaMin), aMax = num(state.areaMax);
    var list = X.publicObjects().filter(function (o) {
      if (state.deal && o.deal !== state.deal) return false;
      if (state.city && o.city !== state.city) return false;
      if (state.type.length && state.type.indexOf(o.type) < 0) return false;
      if (pMin != null && o.price < pMin) return false;
      if (pMax != null && o.price > pMax) return false;
      if (aMin != null && o.area < aMin) return false;
      if (aMax != null && o.area > aMax) return false;
      if (state.rooms.length) {
        var r = o.rooms || 0, hit = state.rooms.some(function (x) { return x === '4' ? r >= 4 : r === +x; });
        if (!hit) return false;
      }
      if (state.feat.length && !state.feat.every(function (f) { return (o.features || []).indexOf(f) > -1; })) return false;
      return true;
    });
    var s = state.sort;
    list.sort(function (a, b) {
      if (s === 'price_asc') return a.price - b.price;
      if (s === 'price_desc') return b.price - a.price;
      if (s === 'area_desc') return b.area - a.area;
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || String(b.lot).localeCompare(String(a.lot));
    });
    return list;
  }

  function countFor(patch) {
    var save = JSON.parse(JSON.stringify(state)); Object.assign(state, patch);
    var n = filtered().length; Object.assign(state, save); return n;
  }

  /* ---------- Разметка фильтров ---------- */
  function chipGroup(name, items, multi) {
    return items.map(function (it) {
      var on = multi ? state[name].indexOf(it.v) > -1 : state[name] === it.v;
      return '<button type="button" class="chip" data-f="' + name + '" data-v="' + it.v + '" aria-pressed="' + on + '">' + it.l + '</button>';
    }).join('');
  }
  function renderFilters() {
    var fmt = function (v) { var n = num(v); return n == null ? '' : X.nf.format(n); };
    filtersEl.innerHTML =
      '<div class="filters__head"><h2>Фильтры</h2><button class="icon-btn" type="button" data-filters-close aria-label="Закрыть фильтры">' + X.I.close + '</button></div>' +
      '<div class="fgroup"><div class="fgroup__title">Сделка</div><div class="cats">' + chipGroup('deal', [{ v: '', l: 'Все' }, { v: 'sale', l: 'Купить' }, { v: 'rent', l: 'Арендовать' }]) + '</div></div>' +
      '<div class="fgroup"><label class="fgroup__title" for="f-city">Город</label><select class="select" id="f-city" data-f-input="city"><option value="">Все города</option>' +
        MR.cities.map(function (c) { return '<option value="' + c.slug + '"' + (state.city === c.slug ? ' selected' : '') + '>' + c.name + '</option>'; }).join('') + '</select></div>' +
      '<div class="fgroup"><div class="fgroup__title">Тип недвижимости</div><div class="cats">' + chipGroup('type', MR.types.map(function (t) { return { v: t.id, l: t.name }; }), true) + '</div></div>' +
      '<div class="fgroup"><div class="fgroup__title">Цена, ₽' + (state.deal === 'rent' ? ' в месяц' : '') + '</div><div class="range">' +
        '<input class="input" id="f-pmin" inputmode="numeric" placeholder="от" aria-label="Цена от" data-f-input="priceMin" value="' + fmt(state.priceMin) + '">' +
        '<input class="input" id="f-pmax" inputmode="numeric" placeholder="до" aria-label="Цена до" data-f-input="priceMax" value="' + fmt(state.priceMax) + '"></div></div>' +
      '<div class="fgroup"><div class="fgroup__title">Площадь, м²</div><div class="range">' +
        '<input class="input" id="f-amin" inputmode="numeric" placeholder="от" aria-label="Площадь от" data-f-input="areaMin" value="' + fmt(state.areaMin) + '">' +
        '<input class="input" id="f-amax" inputmode="numeric" placeholder="до" aria-label="Площадь до" data-f-input="areaMax" value="' + fmt(state.areaMax) + '"></div></div>' +
      '<div class="fgroup"><div class="fgroup__title">Комнат</div><div class="cats">' + chipGroup('rooms', [{ v: '1', l: '1' }, { v: '2', l: '2' }, { v: '3', l: '3' }, { v: '4', l: '4+' }], true) + '</div></div>' +
      '<div class="fgroup"><div class="fgroup__title">Особенности</div><div class="checks">' +
        ['terrace', 'view', 'pool', 'parking', 'finish', 'furniture', 'sea', 'newbuild'].map(function (k) {
          return '<label class="check"><input type="checkbox" id="f-ft-' + k + '" data-feat="' + k + '"' + (state.feat.indexOf(k) > -1 ? ' checked' : '') + '> ' + MR.features[k] + '</label>';
        }).join('') + '</div></div>' +
      '<div class="filters__foot"><button class="btn btn--primary btn--block" type="button" data-filters-close data-apply>Показать</button>' +
        '<button class="btn btn--ghost btn--block btn--sm" type="button" data-reset>Сбросить фильтры</button></div>';
    updateApply();
  }
  function updateApply() {
    var b = filtersEl.querySelector('[data-apply]'); if (!b) return;
    var n = filtered().length;
    b.textContent = n ? 'Показать ' + n + ' ' + X.plural(n, ['объект', 'объекта', 'объектов']) : 'Ничего не найдено';
  }

  /* ---------- Активные фильтры ---------- */
  function chips() {
    var c = [];
    var x = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 6l12 12M18 6L6 18"/></svg>';
    if (state.deal) c.push(['deal', '', state.deal === 'rent' ? 'Аренда' : 'Продажа']);
    if (state.city) c.push(['city', '', X.city(state.city).name]);
    state.type.forEach(function (t) { c.push(['type', t, X.type(t).name]); });
    if (state.priceMin) c.push(['priceMin', '', 'от ' + X.nf.format(num(state.priceMin)) + ' ₽']);
    if (state.priceMax) c.push(['priceMax', '', 'до ' + X.nf.format(num(state.priceMax)) + ' ₽']);
    if (state.areaMin) c.push(['areaMin', '', 'от ' + state.areaMin + ' м²']);
    if (state.areaMax) c.push(['areaMax', '', 'до ' + state.areaMax + ' м²']);
    state.rooms.forEach(function (r) { c.push(['rooms', r, r === '4' ? '4+ комнат' : r + '-комн.']); });
    state.feat.forEach(function (f) { c.push(['feat', f, MR.features[f]]); });
    chipsEl.innerHTML = c.map(function (i) {
      return '<button class="chip" type="button" data-unset="' + i[0] + '" data-v="' + i[1] + '" aria-label="Убрать фильтр ' + X.esc(i[2]) + '">' + X.esc(i[2]) + ' ' + x + '</button>';
    }).join('');
  }

  /* ---------- Список и карта ---------- */
  function render() {
    var list = filtered();
    countEl.innerHTML = 'Найдено <b>' + list.length + '</b> ' + X.plural(list.length, ['объект', 'объекта', 'объектов']);
    chips(); syncUrl(); updateApply();
    root.querySelectorAll('[data-view]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-view') === state.view); });
    var sortSel = root.querySelector('[data-sort]'); if (sortSel) sortSel.value = state.sort;

    var mapWrap = root.querySelector('[data-map-wrap]');
    if (!list.length) {
      listEl.innerHTML = '<div class="empty"><h3>По этим параметрам объектов нет</h3><p>Попробуйте расширить бюджет или убрать часть фильтров. Ещё треть наших объектов продаётся закрыто — брокер подберёт их по вашему запросу.</p>' +
        '<div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn btn--primary" type="button" data-reset>Сбросить фильтры</button><button class="btn btn--ghost" type="button" data-modal="selection">Запросить подборку</button></div></div>';
      mapWrap.hidden = true; root.querySelector('[data-more]').hidden = true;
      return;
    }
    if (state.view === 'map') {
      listEl.innerHTML = ''; mapWrap.hidden = false; root.querySelector('[data-more]').hidden = true;
      drawMap(list);
    } else {
      mapWrap.hidden = true;
      listEl.innerHTML = '<div class="grid">' + list.slice(0, state.shown).map(function (o) { return X.card(o, { reveal: false }); }).join('') + '</div>';
      var more = root.querySelector('[data-more]');
      more.hidden = list.length <= state.shown;
      more.querySelector('button').textContent = 'Показать ещё ' + Math.min(PAGE, list.length - state.shown);
    }
    X.syncFavs();
  }

  function drawMap(list) {
    var el = root.querySelector('[data-map]');
    if (!map) {
      var c = state.city ? X.city(state.city) : null;
      map = X.makeMap(el, c ? c.center : [55.75, 37.6], c ? c.zoom : 5, { scrollWheelZoom: true });
      if (!map) { el.innerHTML = '<p style="padding:24px">Карта не загрузилась. Проверьте подключение к интернету.</p>'; return; }
    }
    setTimeout(function () { map.invalidateSize(); }, 50);
    markers.forEach(function (m) { m.remove(); }); markers = [];
    var bounds = [];
    list.forEach(function (o) {
      if (!o.coords) return;
      var label = X.compact(o.price).replace(' ₽', '') + (o.deal === 'rent' ? '/мес' : '');
      var m = L.marker(o.coords, { icon: X.pinIcon(label) }).addTo(map);
      m.bindPopup('<a class="map-pop" href="' + X.objUrl(o) + '"><img src="' + X.esc(o.photos[0].replace('w=1600', 'w=300')) + '" alt=""><div><b>' + X.esc(o.title) + '</b><span>' + X.priceLabel(o) + '</span><br><small>' + X.specs(o).join(' · ') + '</small></div></a>', { maxWidth: 300, minWidth: 280 });
      markers.push(m); bounds.push(o.coords);
    });
    if (bounds.length) map.fitBounds(bounds, { padding: [60, 60], maxZoom: 13 });
  }

  function syncUrl() {
    var p = new URLSearchParams();
    ['deal', 'city', 'priceMin', 'priceMax', 'areaMin', 'areaMax'].forEach(function (k) { if (state[k] && state[k] !== preset[k]) p.set(k, num(state[k]) != null && k !== 'deal' && k !== 'city' ? num(state[k]) : state[k]); });
    ['type', 'rooms', 'feat'].forEach(function (k) { if (state[k].length && String(state[k]) !== String(preset[k] || '')) p.set(k, state[k].join(',')); });
    if (state.sort !== 'new') p.set('sort', state.sort);
    if (state.view !== 'grid') p.set('view', state.view);
    var s = p.toString();
    history.replaceState(null, '', location.pathname + (s ? '?' + s : ''));
  }

  /* ---------- События ---------- */
  var debounce;
  root.addEventListener('click', function (e) {
    var t = e.target.closest('[data-f]');
    if (t) {
      var k = t.getAttribute('data-f'), v = t.getAttribute('data-v');
      if (Array.isArray(state[k])) { var i = state[k].indexOf(v); if (i > -1) state[k].splice(i, 1); else state[k].push(v); }
      else state[k] = v;
      state.shown = PAGE;
      if (k === 'deal') { state.priceMin = ''; state.priceMax = ''; renderFilters(); }
      else filtersEl.querySelectorAll('[data-f="' + k + '"]').forEach(function (b) {
        var bv = b.getAttribute('data-v');
        b.setAttribute('aria-pressed', Array.isArray(state[k]) ? state[k].indexOf(bv) > -1 : bv === state[k]);
      });
      render(); return;
    }
    var u = e.target.closest('[data-unset]');
    if (u) {
      var key = u.getAttribute('data-unset'), val = u.getAttribute('data-v');
      if (Array.isArray(state[key])) state[key] = state[key].filter(function (x) { return x !== val; }); else state[key] = '';
      renderFilters(); render(); return;
    }
    if (e.target.closest('[data-reset]')) {
      state.deal = ''; state.city = ''; state.type = []; state.priceMin = state.priceMax = state.areaMin = state.areaMax = ''; state.rooms = []; state.feat = []; state.shown = PAGE;
      renderFilters(); render(); return;
    }
    var v2 = e.target.closest('[data-view]');
    if (v2) { state.view = v2.getAttribute('data-view'); render(); X.track('catalog_view', { view: state.view }); return; }
    if (e.target.closest('[data-more] button')) { state.shown += PAGE; render(); return; }
    if (e.target.closest('[data-filters-open]')) { filtersEl.classList.add('is-open'); backdrop(true); return; }
    if (e.target.closest('[data-filters-close]')) { filtersEl.classList.remove('is-open'); backdrop(false); }
  });
  function backdrop(on) {
    var b = document.querySelector('.filters-backdrop');
    if (on && !b) { b = document.createElement('div'); b.className = 'filters-backdrop'; b.addEventListener('click', function () { filtersEl.classList.remove('is-open'); backdrop(false); }); document.body.appendChild(b); }
    if (!on && b) b.remove();
    document.body.style.overflow = on ? 'hidden' : '';
  }
  root.addEventListener('change', function (e) {
    var t = e.target;
    if (t.matches('[data-f-input="city"]')) { state.city = t.value; state.shown = PAGE; if (map) { var c = X.city(t.value); map.setView(c.center || [55.75, 37.6], c.zoom || 5); } render(); }
    if (t.matches('[data-feat]')) { var k = t.getAttribute('data-feat'); state.feat = t.checked ? state.feat.concat(k) : state.feat.filter(function (x) { return x !== k; }); render(); }
    if (t.matches('[data-sort]')) { state.sort = t.value; render(); }
  });
  root.addEventListener('input', function (e) {
    var t = e.target; if (!t.matches('[data-f-input]') || t.tagName === 'SELECT') return;
    var n = num(t.value); t.value = n == null ? '' : X.nf.format(n);
    state[t.getAttribute('data-f-input')] = n == null ? '' : String(n);
    clearTimeout(debounce); debounce = setTimeout(function () { state.shown = PAGE; render(); }, 300);
  });

  renderFilters(); render();
})();
