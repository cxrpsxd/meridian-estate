/* Meridian — общий код для всех страниц */
(function () {
  'use strict';
  var MR = window.MR;
  var ROOT = document.documentElement.getAttribute('data-root') || './';
  document.documentElement.classList.add('js');

  /* ---------- Хранилище (localStorage с защитой) ---------- */
  var ls = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) {} }
  };

  /* Объекты: базовый набор + правки из админ-панели (демо без сервера) */
  function allObjects() {
    var saved = ls.get('mr_objects', null);
    var list = Array.isArray(saved) ? saved : MR.objects.map(function (o) { return Object.assign({ status: 'published', created: '2026-09-01' }, o); });
    return list;
  }
  function publicObjects() { return allObjects().filter(function (o) { return o.status !== 'draft'; }); }
  function byId(id) { return allObjects().find(function (o) { return o.id === id; }); }

  /* ---------- Форматирование ---------- */
  var nf = new Intl.NumberFormat('ru-RU');
  function plural(n, f) { n = Math.abs(n) % 100; var n1 = n % 10; if (n > 10 && n < 20) return f[2]; if (n1 > 1 && n1 < 5) return f[1]; if (n1 === 1) return f[0]; return f[2]; }
  function money(n) { return nf.format(Math.round(n)) + ' ₽'; }
  function priceLabel(o) { return money(o.price) + (o.deal === 'rent' ? ' / мес' : ''); }
  function compact(n) {
    if (n >= 1e9) return (n / 1e9).toFixed(n % 1e9 ? 2 : 0).replace('.', ',').replace(/,?0+$/, '') + ' млрд ₽';
    if (n >= 1e6) return (n / 1e6).toFixed(1).replace('.', ',').replace(',0', '') + ' млн ₽';
    return nf.format(n) + ' ₽';
  }
  function perM2(o) { return o.deal === 'rent' ? null : money(o.price / o.area) + ' за м²'; }
  function city(slug) { return MR.cities.find(function (c) { return c.slug === slug; }) || { name: slug, slug: slug }; }
  function type(id) { return MR.types.find(function (t) { return t.id === id || t.slug === id; }) || { name: id, plural: id }; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function objUrl(o) { return MR.objects.some(function (b) { return b.id === o.id; }) ? ROOT + 'object/' + o.id + '/' : ROOT + 'object/?id=' + encodeURIComponent(o.id); }
  function specs(o) {
    var s = [nf.format(o.area) + ' м²'];
    if (o.rooms) s.push(o.rooms + ' ' + plural(o.rooms, ['комната', 'комнаты', 'комнат']));
    if (o.floor) s.push(o.floor + '/' + o.floors + ' эт.');
    else if (o.land) s.push(o.land + ' сот.');
    return s;
  }

  /* ---------- Иконки ---------- */
  var I = {
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 20.5s-7.5-4.6-9.2-9.6C1.6 7.3 3.9 4 7.4 4c2 0 3.6 1.1 4.6 2.7C13 5.1 14.6 4 16.6 4c3.5 0 5.8 3.3 4.6 6.9-1.7 5-9.2 9.6-9.2 9.6z"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 8h18M3 16h18"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 12h16m-6-6 6 6-6 6"/></svg>',
    left: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" width="22" height="22"><path d="M15 5l-7 7 7 7"/></svg>',
    right: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" width="22" height="22"><path d="M9 5l7 7-7 7"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 5h16v11H9l-5 4V5z"/></svg>',
    tg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.4 4.2 2.9 11.3c-1.3.5-1.2 1.2-.2 1.5l4.7 1.5 1.8 5.6c.2.6.4.8.9.8.4 0 .6-.2.9-.4l2.3-2.2 4.7 3.5c.9.5 1.5.2 1.7-.8l3.1-14.6c.3-1.3-.5-1.9-1.4-1.5zM9.7 14.6l-.4 4 .2-.1-1.6-5L18 7.2l-8.3 7.4z"/></svg>',
    wa: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1-.2-.1-1-.4-2-1.2-.7-.7-1.2-1.5-1.4-1.7-.1-.2 0-.4.1-.5l.4-.4.3-.4v-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s1 2.6 1.1 2.7c.1.2 1.9 2.9 4.6 4 .6.3 1.1.4 1.5.6.6.2 1.2.2 1.6.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.5-.3z"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 12.5l5 5L20 6.5"/></svg>',
    grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"/></svg>',
    map: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2zm0 0v14m6-12v14"/></svg>',
    filter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 6h16M7 12h10M10 18h4"/></svg>',
    share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M8 12h.01M12 4v11m0-11-4 4m4-4 4 4M5 14v5h14v-5"/></svg>',
    edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>',
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 5v14M5 12h14"/></svg>',
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 11 12 4l9 7v9h-6v-6H9v6H3z"/></svg>',
    inbox: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 13h5l1 3h6l1-3h5M5 5h14l2 8v6H3v-6z"/></svg>',
    chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 20V10m6 10V4m6 16v-7m4 7H2"/></svg>'
  };

  /* ---------- Аналитика ---------- */
  var A = MR.config.analytics || {};
  window.dataLayer = window.dataLayer || [];
  if (A.yandexMetrikaId) {
    (function (m, e, t, r, i, k, a) { m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); }; m[i].l = 1 * new Date(); k = e.createElement(t); a = e.getElementsByTagName(t)[0]; k.async = 1; k.src = r; a.parentNode.insertBefore(k, a); })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');
    window.ym(A.yandexMetrikaId, 'init', { clickmap: true, trackLinks: true, accurateTrackBounce: true, webvisor: true });
  }
  if (A.ga4Id) {
    var g = document.createElement('script'); g.async = true; g.src = 'https://www.googletagmanager.com/gtag/js?id=' + A.ga4Id; document.head.appendChild(g);
    window.gtag = function () { window.dataLayer.push(arguments); }; window.gtag('js', new Date()); window.gtag('config', A.ga4Id);
  }
  function track(goal, params) {
    params = params || {};
    window.dataLayer.push(Object.assign({ event: goal }, params));
    if (A.yandexMetrikaId && window.ym) window.ym(A.yandexMetrikaId, 'reachGoal', goal, params);
    if (A.ga4Id && window.gtag) window.gtag('event', goal, params);
  }

  /* ---------- Избранное ---------- */
  function favs() { var f = ls.get('mr_favs', []); return Array.isArray(f) ? f : []; }
  function isFav(id) { return favs().indexOf(id) > -1; }
  function toggleFav(id) {
    var f = favs(), i = f.indexOf(id);
    if (i > -1) f.splice(i, 1); else { f.push(id); track('favorite_add', { object_id: id }); }
    ls.set('mr_favs', f); syncFavs();
    document.dispatchEvent(new CustomEvent('mr:favs'));
    return i === -1;
  }
  function syncFavs() {
    var n = favs().length;
    document.querySelectorAll('[data-fav-count]').forEach(function (el) { el.textContent = n; el.hidden = !n; });
    document.querySelectorAll('[data-fav]').forEach(function (b) {
      var on = isFav(b.getAttribute('data-fav'));
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.setAttribute('aria-label', on ? 'Убрать из избранного' : 'Добавить в избранное');
      var t = b.querySelector('[data-fav-label]'); if (t) t.textContent = on ? 'В избранном' : 'В избранное';
    });
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-fav]');
    if (!b) return;
    e.preventDefault(); e.stopPropagation();
    var added = toggleFav(b.getAttribute('data-fav'));
    toast(added ? 'Добавлено в избранное' : 'Убрано из избранного');
  });

  /* ---------- Карточка объекта ---------- */
  function card(o, opts) {
    opts = opts || {};
    var badges = '';
    if (o.badge) badges += '<span class="badge">' + esc(o.badge) + '</span>';
    if (o.deal === 'rent') badges += '<span class="badge badge--dark">Аренда</span>';
    var pm = perM2(o);
    return '<article class="card' + (opts.reveal === false ? '' : ' reveal') + '">' +
      '<div class="card__media">' +
        '<img src="' + esc((o.photos[0] || '').replace('w=1600', 'w=900')) + '" alt="' + esc(o.title) + '" loading="lazy" width="900" height="675">' +
        (badges ? '<div class="card__badges">' + badges + '</div>' : '') +
        '<button class="fav-btn" type="button" data-fav="' + esc(o.id) + '" aria-pressed="' + isFav(o.id) + '" aria-label="Добавить в избранное">' + I.heart + '</button>' +
      '</div>' +
      '<div class="card__body">' +
        '<div class="card__top"><span>' + esc(city(o.city).name) + ' · ' + esc(o.district.split(',')[0]) + '</span><span class="card__lot">Лот ' + esc(o.lot) + '</span></div>' +
        '<h3 class="card__title"><a href="' + objUrl(o) + '">' + esc(o.title) + '</a></h3>' +
        '<div class="card__specs">' + specs(o).map(function (s) { return '<span>' + s + '</span>'; }).join('') + '</div>' +
        '<div class="card__price"><b>' + priceLabel(o) + '</b>' + (pm ? '<span>' + pm + '</span>' : '') + '</div>' +
      '</div></article>';
  }

  /* ---------- Тост ---------- */
  var toastT;
  function toast(msg) {
    var t = document.querySelector('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = msg; t.hidden = false;
    clearTimeout(toastT); toastT = setTimeout(function () { t.hidden = true; }, 2600);
  }

  /* ---------- Шапка ---------- */
  function initHeader() {
    var h = document.querySelector('.header');
    if (h && document.body.classList.contains('has-hero')) {
      var onScroll = function () { h.classList.toggle('is-solid', window.scrollY > 40); };
      onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
    }
    var m = document.querySelector('.mnav');
    document.querySelectorAll('[data-mnav]').forEach(function (b) {
      b.addEventListener('click', function () {
        var open = b.getAttribute('data-mnav') === 'open';
        m.hidden = !open; document.body.style.overflow = open ? 'hidden' : '';
      });
    });
    var path = location.pathname.replace(/index\.html$/, '');
    document.querySelectorAll('.nav a, .mnav__links a').forEach(function (a) {
      var href = a.getAttribute('href'); if (!href || href === ROOT) return;
      var abs = new URL(href, location.href).pathname;
      if (path.indexOf(abs) === 0) a.setAttribute('aria-current', 'page');
    });
  }

  /* ---------- Формы заявок ---------- */
  function phoneMask(input) {
    input.addEventListener('input', function () {
      var d = input.value.replace(/\D/g, '');
      if (!d) { input.value = ''; return; }
      if (d[0] === '8') d = '7' + d.slice(1);
      if (d[0] !== '7') d = '7' + d;
      d = d.slice(0, 11);
      var r = '+7';
      if (d.length > 1) r += ' (' + d.slice(1, 4);
      if (d.length >= 4) r += ') ' + d.slice(4, 7);
      if (d.length >= 7) r += '-' + d.slice(7, 9);
      if (d.length >= 9) r += '-' + d.slice(9, 11);
      input.value = r;
    });
  }
  function setErr(field, msg) {
    var wrap = field.closest('.field'); if (!wrap) return;
    wrap.classList.toggle('is-invalid', !!msg);
    var e = wrap.querySelector('.field__err');
    if (msg) { if (!e) { e = document.createElement('div'); e.className = 'field__err'; wrap.appendChild(e); } e.textContent = msg; field.setAttribute('aria-invalid', 'true'); }
    else { if (e) e.remove(); field.removeAttribute('aria-invalid'); }
  }
  function initForms(scope) {
    (scope || document).querySelectorAll('form[data-lead]').forEach(function (f) {
      if (f.__inited) return; f.__inited = true;
      f.querySelectorAll('input[type=tel]').forEach(phoneMask);
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        var ok = true;
        var name = f.elements.name, phone = f.elements.phone, consent = f.elements.consent;
        if (name) { var nv = name.value.trim().length >= 2; setErr(name, nv ? '' : 'Укажите, как к вам обращаться'); ok = ok && nv; }
        if (phone) { var pv = phone.value.replace(/\D/g, '').length === 11; setErr(phone, pv ? '' : 'Введите номер полностью: +7 и 10 цифр'); ok = ok && pv; }
        if (consent && !consent.checked) { ok = false; toast('Отметьте согласие на обработку данных'); }
        if (!ok) { var first = f.querySelector('[aria-invalid="true"]'); if (first) first.focus(); return; }
        var data = {};
        new FormData(f).forEach(function (v, k) { data[k] = v; });
        var lead = Object.assign({ id: 'L' + Date.now(), date: new Date().toISOString(), kind: f.getAttribute('data-lead'), page: location.pathname, status: 'new' }, data);
        var leads = ls.get('mr_leads', []); leads.unshift(lead); ls.set('mr_leads', leads);
        // В продакшене: fetch('/api/leads', { method: 'POST', body: JSON.stringify(lead) }) → CRM / Telegram-бот
        track('lead_submit', { form: lead.kind, object_id: data.object || '' });
        var okBox = document.createElement('div');
        okBox.className = 'form__ok'; okBox.setAttribute('role', 'status');
        okBox.innerHTML = '<h3>Заявка принята</h3><p>Перезвоним в течение 15 минут в рабочее время (' + esc(MR.config.hours.toLowerCase()) + '). Номер заявки: ' + lead.id.slice(-6) + '.</p>';
        f.replaceWith(okBox);
      });
    });
  }

  function leadForm(opts) {
    opts = opts || {};
    var uid = 'f' + Math.random().toString(36).slice(2, 7);
    return '<form class="form" data-lead="' + (opts.kind || 'consultation') + '" novalidate>' +
      (opts.title ? '<div class="form-title"><h3>' + opts.title + '</h3>' + (opts.text ? '<p>' + opts.text + '</p>' : '') + '</div>' : '') +
      (opts.object ? '<input type="hidden" name="object" value="' + esc(opts.object) + '">' : '') +
      '<div class="field"><label for="' + uid + 'n">Имя</label><input class="input" id="' + uid + 'n" name="name" autocomplete="name" placeholder="Как к вам обращаться"></div>' +
      '<div class="field"><label for="' + uid + 'p">Телефон</label><input class="input" id="' + uid + 'p" name="phone" type="tel" autocomplete="tel" inputmode="tel" placeholder="+7 (___) ___-__-__"></div>' +
      (opts.viewing ? '<div class="row-2"><div class="field"><label for="' + uid + 'd">Дата просмотра</label><input class="input" id="' + uid + 'd" name="viewDate" type="date"></div>' +
        '<div class="field"><label for="' + uid + 't">Время</label><select class="select input" id="' + uid + 't" name="time"><option>Утро, 10–13</option><option selected>День, 13–17</option><option>Вечер, 17–20</option></select></div></div>' : '') +
      '<div class="field"><span style="font-size:13px;color:var(--muted)">Как удобнее связаться</span><div class="contact-choice">' +
        ['Звонок', 'WhatsApp', 'Telegram'].map(function (c, i) { return '<label><input type="radio" name="channel" value="' + c + '"' + (i ? '' : ' checked') + '><span>' + c + '</span></label>'; }).join('') +
      '</div></div>' +
      (opts.message ? '<div class="field"><label for="' + uid + 'm">Комментарий</label><textarea class="textarea input" id="' + uid + 'm" name="message" placeholder="' + esc(opts.message) + '"></textarea></div>' : '') +
      '<label class="consent"><input type="checkbox" name="consent" checked> <span>Согласен на обработку персональных данных в соответствии с <a href="' + ROOT + 'privacy/">политикой конфиденциальности</a></span></label>' +
      '<button class="btn btn--primary btn--block" type="submit">' + (opts.cta || 'Отправить заявку') + '</button>' +
    '</form>';
  }

  /* ---------- Модальное окно ---------- */
  var lastFocus;
  function openModal(html) {
    closeModal();
    lastFocus = document.activeElement;
    var m = document.createElement('div');
    m.className = 'modal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true');
    m.innerHTML = '<div class="modal__bg" data-close></div><div class="modal__box"><button class="icon-btn modal__close" type="button" data-close aria-label="Закрыть">' + I.close + '</button>' + html + '</div>';
    document.body.appendChild(m); document.body.style.overflow = 'hidden';
    initForms(m);
    var f = m.querySelector('input:not([type=hidden]), button'); if (f) f.focus();
    m.addEventListener('click', function (e) { if (e.target.closest('[data-close]')) closeModal(); });
  }
  function closeModal() {
    var m = document.querySelector('.modal'); if (!m) return;
    m.remove(); document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-modal]'); if (!b) return;
    e.preventDefault();
    var kind = b.getAttribute('data-modal'), obj = b.getAttribute('data-object');
    var o = obj ? byId(obj) : null;
    if (kind === 'viewing') openModal(leadForm({ kind: 'viewing', viewing: true, object: obj, title: 'Запись на просмотр', text: o ? esc(o.title) + ', лот ' + esc(o.lot) : '', cta: 'Записаться на просмотр' }));
    else if (kind === 'selection') openModal(leadForm({ kind: 'selection', title: 'Подбор объекта', text: 'Расскажите, что ищете. Брокер соберёт подборку, включая объекты закрытых продаж.', message: 'Город, бюджет, сроки, пожелания', cta: 'Получить подборку' }));
    else openModal(leadForm({ kind: 'consultation', object: obj, title: 'Консультация', text: 'Ответим на вопросы о покупке, продаже или аренде. Это бесплатно.', message: 'Ваш вопрос', cta: 'Отправить заявку' }));
    track('form_open', { form: kind });
  });

  /* ---------- Мессенджеры ---------- */
  function initMessengers() {
    var c = MR.config;
    var w = document.createElement('div');
    w.className = 'messengers';
    w.innerHTML = '<div class="messengers__list" hidden>' +
      '<a class="mlink mlink--tg" href="https://t.me/' + c.telegram + '" target="_blank" rel="noopener" data-track="messenger_telegram"><i>' + I.tg + '</i>Telegram</a>' +
      '<a class="mlink mlink--wa" href="https://wa.me/' + c.whatsapp + '" target="_blank" rel="noopener" data-track="messenger_whatsapp"><i>' + I.wa + '</i>WhatsApp</a>' +
      '<a class="mlink mlink--ph" href="tel:' + c.phoneRaw + '" data-track="phone_click"><i>' + I.phone + '</i>' + c.phone + '</a>' +
      '</div><button class="messengers__toggle" type="button" aria-expanded="false" aria-label="Связаться с нами">' + I.chat + '</button>';
    document.body.appendChild(w);
    var t = w.querySelector('.messengers__toggle'), l = w.querySelector('.messengers__list');
    t.addEventListener('click', function () {
      var open = l.hidden; l.hidden = !open; t.setAttribute('aria-expanded', open);
      t.innerHTML = open ? I.close : I.chat;
    });
  }
  document.addEventListener('click', function (e) { var a = e.target.closest('[data-track]'); if (a) track(a.getAttribute('data-track')); });

  /* ---------- Карта (Leaflet) ---------- */
  function isDark() {
    var t = document.documentElement.getAttribute('data-theme');
    if (t) return t === 'dark';
    return window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches;
  }
  function makeMap(el, center, zoom, opts) {
    if (!window.L || !el) return null;
    var map = L.map(el, Object.assign({ scrollWheelZoom: false, zoomControl: true, attributionControl: true }, opts || {})).setView(center, zoom);
    el.classList.toggle('map--dark', isDark());
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    return map;
  }
  function pinIcon(label, active) {
    return L.divIcon({ className: '', html: '<span class="pin' + (active ? ' is-active' : '') + '">' + label + '</span>', iconSize: [0, 0] });
  }

  window.MRX = {
    ROOT: ROOT, ls: ls, I: I, allObjects: allObjects, publicObjects: publicObjects, byId: byId,
    plural: plural, money: money, compact: compact, priceLabel: priceLabel, perM2: perM2, city: city, type: type, esc: esc, objUrl: objUrl, specs: specs, nf: nf,
    card: card, toast: toast, track: track, favs: favs, isFav: isFav, syncFavs: syncFavs, leadForm: leadForm, initForms: initForms, openModal: openModal,
    makeMap: makeMap, pinIcon: pinIcon
  };

  document.addEventListener('DOMContentLoaded', function () {
    initHeader(); initForms(); initMessengers(); syncFavs();
    document.querySelectorAll('[data-lead-slot]').forEach(function (el) {
      var o = JSON.parse(el.getAttribute('data-lead-slot') || '{}');
      el.innerHTML = leadForm(o); initForms(el);
    });
    var y = document.querySelector('[data-year]'); if (y) y.textContent = new Date().getFullYear();
  });
})();
