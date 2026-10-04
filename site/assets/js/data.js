/* Данные сайта. В продакшене приходят из API/CMS; здесь — демо-набор. */
(function (root) {
  var U = function (id, w) {
    return 'https://images.unsplash.com/photo-' + id + '?auto=format&fit=crop&w=' + (w || 1600) + '&q=72';
  };

  var config = {
    brand: 'Meridian',
    phone: '+7 (495) 000-00-00',
    phoneRaw: '+74950000000',
    email: 'hello@meridian-estate.example',
    telegram: 'meridian_estate',
    whatsapp: '74950000000',
    address: 'Москва, ул. Остоженка, 25, офис 4',
    hours: 'Ежедневно, 9:00–21:00',
    // Подставьте реальные ID — счётчики подключатся автоматически
    analytics: { yandexMetrikaId: null, ga4Id: null }
  };

  var cities = [
    { slug: 'moskva', name: 'Москва', in: 'в Москве', center: [55.7520, 37.5900], zoom: 12, photo: U('1547448415-e9f5b28e570d', 1200),
      lead: 'Квартиры и пентхаусы в Хамовниках, на Патриарших, Остоженке и в Москва-Сити. Работаем с закрытыми продажами и клубными домами.' },
    { slug: 'podmoskovye', name: 'Подмосковье', in: 'в Подмосковье', center: [55.8000, 37.1500], zoom: 10, photo: U('1600607688969-a5bfcd646154', 1200),
      lead: 'Дома и таунхаусы на Рублёво-Успенском и Новорижском шоссе. Проверяем участки, коммуникации и историю владения до показа.' },
    { slug: 'sankt-peterburg', name: 'Санкт-Петербург', in: 'в Санкт-Петербурге', center: [59.9450, 30.2950], zoom: 12, photo: U('1556610961-2fecc5927173', 1200),
      lead: 'Квартиры с видом на Неву, Петроградская сторона, Крестовский остров и исторический центр.' },
    { slug: 'sochi', name: 'Сочи', in: 'в Сочи', center: [43.5600, 39.9000], zoom: 10, photo: U('1613490493576-7fde63acd811', 1200),
      lead: 'Виллы у моря, шале в Красной Поляне и апартаменты с видом на море для жизни и сдачи в аренду.' }
  ];

  var types = [
    { slug: 'kvartiry', id: 'apartment', name: 'Квартира', plural: 'Квартиры', gen: 'квартир' },
    { slug: 'penthausy', id: 'penthouse', name: 'Пентхаус', plural: 'Пентхаусы', gen: 'пентхаусов' },
    { slug: 'doma', id: 'house', name: 'Дом', plural: 'Дома и виллы', gen: 'домов и вилл' },
    { slug: 'taunhausy', id: 'townhouse', name: 'Таунхаус', plural: 'Таунхаусы', gen: 'таунхаусов' },
    { slug: 'kommercheskaya', id: 'commercial', name: 'Коммерческая', plural: 'Коммерческая недвижимость', gen: 'коммерческой недвижимости' }
  ];

  var features = {
    terrace: 'Терраса', view: 'Видовые окна', parking: 'Паркинг', finish: 'С отделкой', furniture: 'С мебелью',
    concierge: 'Консьерж', pool: 'Бассейн', fireplace: 'Камин', garden: 'Сад', newbuild: 'Новостройка', sea: 'Рядом море', security: 'Охрана 24/7'
  };

  var agents = [
    { id: 'a1', name: 'Анна Воронцова', role: 'Партнёр, элитные квартиры', phone: '+7 (495) 000-00-01' },
    { id: 'a2', name: 'Илья Ремизов', role: 'Загородная недвижимость', phone: '+7 (495) 000-00-02' },
    { id: 'a3', name: 'Мария Ланская', role: 'Санкт-Петербург', phone: '+7 (812) 000-00-03' },
    { id: 'a4', name: 'Дмитрий Орлов', role: 'Сочи и коммерция', phone: '+7 (862) 000-00-04' }
  ];

  var P = {
    house1: '1600585154340-be6161a56a0c', villaPool1: '1602343168117-bb8ffe3e2e9f', villaPool2: '1613977257363-707ba9348227',
    villaPool3: '1600596542815-ffad4c1539a9', villaPool4: '1613490493576-7fde63acd811', villaPool5: '1580587771525-78b9dba3b914',
    villaPool6: '1512917774080-9991f1c4c750', modern1: '1600047509807-ba8f99d2cdde', modern2: '1600047509358-9dc75507daeb',
    modern3: '1600563438938-a9a27216b4f5', modern4: '1600566753190-17f0baa2a6c3', modern5: '1600607688969-a5bfcd646154',
    whiteHouse: '1523217582562-09d0def993a6', chalet: '1568605114967-8130f3a36994', glassHouse: '1513584684374-8bab748fbf90',
    tower2: '1534237710431-e2fc698436d0', whiteBld: '1479839672679-a46483c0e7c8', darkBld: '1545324418-cc1a3fa10c00',
    brickBld: '1574362848149-11496d93a7c7', balconies: '1460317442991-0ec209397118', sky: '1486406146926-c627a92ad1ab',
    office1: '1497366216548-37526070297c', office2: '1497366811353-6870744d04b2',
    liv1: '1600573472550-8090b5e0745e', liv2: '1600607687939-ce8a6c25118c', liv3: '1618221195710-dd6b41faaea6',
    liv4: '1600566753086-00f18fb6b3ea', liv5: '1600121848594-d8644e57abab', liv6: '1615529182904-14819c35db37',
    liv7: '1615873968403-89e068629265', liv8: '1631679706909-1844bbd07221', liv9: '1600210492486-724fe5c67fb0',
    liv10: '1505691938895-1758d7feb511', liv11: '1554995207-c18c203602cb', liv12: '1522708323590-d24dbb6b0267',
    liv13: '1493809842364-78817add7ffb', liv14: '1502672260266-1c1ef2d93688', liv15: '1499916078039-922301b0eb9b',
    liv16: '1560448204-e02f11c3d0e2', dining: '1617806118233-18e1de247200', dining2: '1560185007-cde436f6a4d0',
    kit1: '1507089947368-19c1da9775ae', kit2: '1600489000022-c2086d79f9d4', kit3: '1484154218962-a197022b5858',
    bed1: '1600607687644-c7171b42498f', bed2: '1616594039964-ae9021a400a0', bed3: '1611892440504-42a792e24d32',
    bed4: '1595526114035-0d45ed16cfbf', bed5: '1512918728675-ed5a9ecdebfd', bed6: '1560185893-a55cbc8c57e8',
    bath: '1600566752355-35792bedcfea'
  };
  var ph = function () { return Array.prototype.map.call(arguments, function (k) { return U(P[k]); }); };

  var objects = [
    { id: 'penthaus-ostozhenka', lot: '0142', title: 'Пентхаус с террасой на Остоженке', city: 'moskva', district: 'Хамовники, Остоженка', type: 'penthouse', deal: 'sale',
      price: 485000000, area: 312, rooms: 4, floor: 9, floors: 9, year: 2019, coords: [55.7395, 37.5980], agent: 'a1', featured: true, badge: 'Эксклюзив',
      features: ['terrace', 'view', 'parking', 'finish', 'concierge', 'fireplace'],
      photos: ph('liv1', 'liv2', 'liv3', 'dining', 'bed2', 'bath'),
      description: 'Двухуровневый пентхаус в клубном доме на 18 квартир. Терраса 96 м² по периметру с видом на храм Христа Спасителя и Кремль. Мастер-спальня с гардеробной и собственной ванной, отдельный кабинет, гостевая спальня, зона персонала.\n\nДизайн-проект бюро Atelier Nord выполнен в 2023 году: дубовый паркет ёлкой, натуральный камень, кухня Bulthaup. В доме подземный паркинг на 2 машино-места, ресепшен, служба консьержей.' },
    { id: 'kvartira-patriarshie', lot: '0138', title: 'Квартира у Патриарших прудов', city: 'moskva', district: 'Пресненский, Патриаршие пруды', type: 'apartment', deal: 'sale',
      price: 168000000, area: 142, rooms: 3, floor: 5, floors: 7, year: 2016, coords: [55.7640, 37.5930], agent: 'a1', featured: true,
      features: ['finish', 'parking', 'concierge', 'view'],
      photos: ph('liv10', 'kit2', 'bed1', 'liv5', 'bath'),
      description: 'Светлая квартира с окнами на две стороны в пяти минутах пешком от Патриарших прудов. Гостиная-столовая 48 м², две спальни с ванными комнатами, кабинет.\n\nПотолки 3,4 м, система климат-контроля, умный дом. Подземный паркинг, закрытая территория.' },
    { id: 'apartamenty-moskva-siti', lot: '0151', title: 'Апартаменты в Москва-Сити с панорамой', city: 'moskva', district: 'Пресненский, Москва-Сити', type: 'apartment', deal: 'sale',
      price: 92000000, area: 98, rooms: 2, floor: 54, floors: 62, year: 2021, coords: [55.7490, 37.5380], agent: 'a1',
      features: ['view', 'finish', 'furniture', 'security', 'newbuild'],
      photos: ph('tower2', 'liv12', 'bed4', 'kit3', 'liv13'),
      description: 'Апартаменты на 54 этаже с панорамным остеклением от пола до потолка. Вид на Москву-реку и запад города.\n\nПродаются с мебелью и техникой. В башне фитнес-клуб, ресторан, СПА, охрана и сервис управляющей компании.' },
    { id: 'kvartira-yakimanka-arenda', lot: '0155', title: 'Квартира в аренду на Якиманке', city: 'moskva', district: 'Якиманка', type: 'apartment', deal: 'rent',
      price: 650000, area: 120, rooms: 3, floor: 6, floors: 10, year: 2018, coords: [55.7350, 37.6110], agent: 'a1', badge: 'Новое',
      features: ['furniture', 'finish', 'parking', 'concierge'],
      photos: ph('liv11', 'kit1', 'bed6', 'liv14'),
      description: 'Полностью меблированная квартира в клубном доме рядом с Парком Горького. Две спальни, гостиная с кухней-островом, гардеробная.\n\nДоступна с 15 октября, срок аренды от 12 месяцев. Возможно проживание с небольшим питомцем.' },
    { id: 'kvartira-chistye-prudy', lot: '0127', title: 'Квартира в доходном доме 1912 года', city: 'moskva', district: 'Басманный, Чистые пруды', type: 'apartment', deal: 'sale',
      price: 115000000, area: 165, rooms: 4, floor: 4, floors: 6, year: 1912, coords: [55.7650, 37.6400], agent: 'a1',
      features: ['finish', 'fireplace', 'view'],
      photos: ph('liv16', 'liv9', 'bed5', 'kit2'),
      description: 'Квартира в отреставрированном доходном доме эпохи модерна. Сохранены лепнина, дубовые двери и действующий камин. Потолки 3,8 м, эркер в гостиной.\n\nПолная реконструкция инженерии в 2022 году с согласованной перепланировкой.' },
    { id: 'ofis-presnya', lot: '0118', title: 'Офис класса A на Пресне', city: 'moskva', district: 'Пресненская набережная', type: 'commercial', deal: 'sale',
      price: 310000000, area: 640, rooms: null, floor: 12, floors: 25, year: 2020, coords: [55.7560, 37.5660], agent: 'a4',
      features: ['view', 'finish', 'parking', 'security'],
      photos: ph('office2', 'office1', 'sky'),
      description: 'Офис с готовой отделкой на 70 рабочих мест: open space, 6 переговорных, кабинет руководителя, кухня. Отдельный вход с лифтового холла.\n\nВ стоимость входит 8 мест в подземном паркинге. Объект сдан в аренду до 2027 года, доходность 9,1% годовых.' },
    { id: 'ofis-arbat-arenda', lot: '0160', title: 'Офис в особняке на Арбате', city: 'moskva', district: 'Арбат', type: 'commercial', deal: 'rent',
      price: 1900000, area: 380, rooms: null, floor: 2, floors: 3, year: 1898, coords: [55.7495, 37.5900], agent: 'a4',
      features: ['finish', 'security', 'parking'],
      photos: ph('office1', 'office2', 'dining2'),
      description: 'Этаж в отреставрированном особняке с собственным входом и охраняемой территорией. Подойдёт для представительства, юридической или инвестиционной компании.\n\nСтавка включает эксплуатационные расходы. Арендные каникулы 2 месяца.' },
    { id: 'dom-zhukovka', lot: '0097', title: 'Резиденция в Жуковке', city: 'podmoskovye', district: 'Рублёво-Успенское шоссе, Жуковка', type: 'house', deal: 'sale',
      price: 1250000000, area: 980, rooms: 6, floor: null, floors: 3, land: 42, year: 2020, coords: [55.7290, 37.2400], agent: 'a2', featured: true, badge: 'Эксклюзив',
      features: ['pool', 'garden', 'security', 'parking', 'finish', 'fireplace'],
      photos: ph('villaPool1', 'liv4', 'liv6', 'bed3', 'bath', 'dining'),
      description: 'Резиденция на лесном участке 42 сотки в охраняемом посёлке. Крытый бассейн 18 м, СПА-зона, кинозал, винный погреб, гараж на 4 машины, дом персонала.\n\nЛандшафтный проект с вековыми соснами. Все коммуникации центральные, газ, электричество 150 кВт.' },
    { id: 'dom-barvikha', lot: '0103', title: 'Дом в архитектурном стиле в Барвихе', city: 'podmoskovye', district: 'Рублёво-Успенское шоссе, Барвиха', type: 'house', deal: 'sale',
      price: 890000000, area: 720, rooms: 5, floor: null, floors: 2, land: 30, year: 2022, coords: [55.7400, 37.2750], agent: 'a2', featured: true,
      features: ['pool', 'garden', 'security', 'finish', 'parking'],
      photos: ph('house1', 'liv2', 'liv3', 'bed1', 'kit2'),
      description: 'Дом по проекту архитектурного бюро с панорамным остеклением и плоской эксплуатируемой кровлей. Пять спален с ванными комнатами, двусветная гостиная, кабинет, спортзал.\n\nУчасток с ландшафтным дизайном и уличным бассейном с подогревом.' },
    { id: 'dom-novaya-riga', lot: '0121', title: 'Дом в посёлке на Новой Риге', city: 'podmoskovye', district: 'Новорижское шоссе, 22 км', type: 'house', deal: 'sale',
      price: 145000000, area: 410, rooms: 5, floor: null, floors: 2, land: 18, year: 2021, coords: [55.7930, 37.0300], agent: 'a2',
      features: ['garden', 'security', 'finish', 'parking'],
      photos: ph('modern1', 'liv9', 'liv15', 'bed5', 'kit3'),
      description: 'Современный дом с отделкой в посёлке с инфраструктурой: школа, спортивный клуб, прогулочная зона у реки.\n\nОткрытая планировка первого этажа, четыре спальни на втором, гараж на 2 машины, терраса с летней кухней.' },
    { id: 'taunhaus-istra', lot: '0133', title: 'Таунхаус у Истринского водохранилища', city: 'podmoskovye', district: 'Истра, Новорижское шоссе', type: 'townhouse', deal: 'sale',
      price: 62000000, area: 240, rooms: 4, floor: null, floors: 3, land: 4, year: 2023, coords: [55.9100, 36.8600], agent: 'a2', badge: 'Новое',
      features: ['garden', 'view', 'newbuild', 'parking'],
      photos: ph('modern3', 'liv16', 'dining2', 'bed4'),
      description: 'Таунхаус в первой линии у воды. Собственный участок 4 сотки с выходом к причалу посёлка.\n\nТри спальни, гостиная с камином, терраса на кровле с видом на водохранилище. White box, готов к ремонту.' },
    { id: 'dom-novaya-riga-arenda', lot: '0158', title: 'Дом с садом в аренду на Новой Риге', city: 'podmoskovye', district: 'Новорижское шоссе, 18 км', type: 'house', deal: 'rent',
      price: 1200000, area: 520, rooms: 5, floor: null, floors: 2, land: 25, year: 2019, coords: [55.7800, 37.1100], agent: 'a2',
      features: ['garden', 'furniture', 'security', 'fireplace', 'parking'],
      photos: ph('modern5', 'liv7', 'liv8', 'bed2'),
      description: 'Дом с мебелью для долгосрочной аренды. Пять спален, кабинет, гостиная с камином, баня, детская площадка.\n\nОбслуживание участка и охрана включены в стоимость.' },
    { id: 'kvartira-petrogradskaya', lot: '0145', title: 'Квартира с видом на Неву', city: 'sankt-peterburg', district: 'Петроградская сторона', type: 'apartment', deal: 'sale',
      price: 74000000, area: 136, rooms: 3, floor: 7, floors: 8, year: 2017, coords: [59.9640, 30.3110], agent: 'a3', featured: true,
      features: ['view', 'finish', 'parking', 'concierge'],
      photos: ph('liv15', 'liv14', 'bed5', 'kit1'),
      description: 'Квартира в клубном доме на набережной с видом на Неву и Петропавловскую крепость из гостиной и мастер-спальни.\n\nДве спальни, кабинет, кухня-столовая. Подземный паркинг, двор без машин.' },
    { id: 'penthaus-krestovskiy', lot: '0149', title: 'Пентхаус на Крестовском острове', city: 'sankt-peterburg', district: 'Крестовский остров', type: 'penthouse', deal: 'sale',
      price: 238000000, area: 260, rooms: 4, floor: 11, floors: 11, year: 2022, coords: [59.9720, 30.2500], agent: 'a3',
      features: ['terrace', 'view', 'finish', 'parking', 'security', 'newbuild'],
      photos: ph('whiteBld', 'liv5', 'liv6', 'bed2', 'bath'),
      description: 'Пентхаус с террасой 70 м² и видом на Финский залив и Средневку. Три спальни с ванными, гостиная 74 м², кабинет.\n\nЖилой комплекс с собственной набережной, фитнес-центром и детским клубом.' },
    { id: 'kvartira-nevskiy-arenda', lot: '0157', title: 'Квартира на Невском в аренду', city: 'sankt-peterburg', district: 'Центральный, Невский проспект', type: 'apartment', deal: 'rent',
      price: 280000, area: 95, rooms: 2, floor: 4, floors: 5, year: 1880, coords: [59.9340, 30.3420], agent: 'a3',
      features: ['furniture', 'finish', 'view'],
      photos: ph('liv12', 'liv10', 'bed6'),
      description: 'Квартира в историческом доме с видом на Невский проспект. Полностью меблирована, свежий ремонт с сохранением исторических элементов.\n\nСрок аренды от 6 месяцев.' },
    { id: 'pomeshchenie-vasilevskiy-arenda', lot: '0153', title: 'Помещение на Васильевском острове', city: 'sankt-peterburg', district: 'Васильевский остров, 7-я линия', type: 'commercial', deal: 'rent',
      price: 640000, area: 210, rooms: null, floor: 1, floors: 5, year: 1904, coords: [59.9420, 30.2780], agent: 'a3',
      features: ['finish'],
      photos: ph('office2', 'dining2'),
      description: 'Помещение свободного назначения на первой линии пешеходной улицы. Витринные окна, отдельный вход, высота потолков 4,2 м.\n\nПодходит под ресторан, шоурум или флагманский магазин.' },
    { id: 'shale-krasnaya-polyana', lot: '0109', title: 'Шале в Красной Поляне', city: 'sochi', district: 'Красная Поляна, Эсто-Садок', type: 'house', deal: 'sale',
      price: 210000000, area: 380, rooms: 5, floor: null, floors: 3, land: 12, year: 2020, coords: [43.6800, 40.2050], agent: 'a4', featured: true,
      features: ['view', 'fireplace', 'finish', 'furniture', 'parking'],
      photos: ph('chalet', 'liv7', 'bed3', 'liv9'),
      description: 'Шале из клеёного бруса в 5 минутах от канатной дороги. Вид на хребет Аибга из каждой спальни. Каминный зал, сауна, лыжная комната.\n\nПродаётся с мебелью. Дом сдаётся в посуточную аренду через управляющую компанию, доходность около 8% годовых.' },
    { id: 'villa-khosta', lot: '0114', title: 'Вилла с бассейном у моря', city: 'sochi', district: 'Хоста', type: 'house', deal: 'sale',
      price: 320000000, area: 540, rooms: 6, floor: null, floors: 3, land: 20, year: 2021, coords: [43.5150, 39.8700], agent: 'a4', featured: true, badge: 'Эксклюзив',
      features: ['pool', 'sea', 'view', 'garden', 'security', 'finish'],
      photos: ph('villaPool2', 'villaPool3', 'liv3', 'bed1', 'dining'),
      description: 'Вилла на склоне с панорамой Чёрного моря. Инфинити-бассейн, субтропический сад, гостевой дом.\n\nДо пляжа 600 метров, до центра Сочи 15 минут. Дом полностью готов к проживанию.' },
    { id: 'apartamenty-sochi-tsentr', lot: '0147', title: 'Апартаменты с видом на море', city: 'sochi', district: 'Центральный район', type: 'apartment', deal: 'sale',
      price: 38500000, area: 86, rooms: 2, floor: 14, floors: 18, year: 2022, coords: [43.5850, 39.7230], agent: 'a4',
      features: ['sea', 'view', 'finish', 'newbuild', 'security'],
      photos: ph('darkBld', 'liv13', 'bed4', 'kit3'),
      description: 'Апартаменты в комплексе бизнес-класса в 300 метрах от набережной. Вид на море из гостиной и спальни.\n\nКомплекс с бассейном на крыше и закрытой территорией.' },
    { id: 'villa-adler-arenda', lot: '0161', title: 'Вилла в аренду в Адлере', city: 'sochi', district: 'Адлер, Курортный городок', type: 'house', deal: 'rent',
      price: 900000, area: 320, rooms: 4, floor: null, floors: 2, land: 10, year: 2018, coords: [43.4290, 39.9220], agent: 'a4',
      features: ['pool', 'sea', 'furniture', 'garden'],
      photos: ph('villaPool6', 'villaPool5', 'liv11', 'bed6'),
      description: 'Вилла с бассейном для сезонной или долгосрочной аренды. До моря 5 минут пешком.\n\nКлининг дважды в неделю и обслуживание бассейна включены в стоимость.' },
    { id: 'taunhaus-matsesta', lot: '0136', title: 'Таунхаус в Мацесте', city: 'sochi', district: 'Мацеста', type: 'townhouse', deal: 'sale',
      price: 54000000, area: 210, rooms: 4, floor: null, floors: 3, land: 3, year: 2022, coords: [43.5450, 39.7900], agent: 'a4',
      features: ['view', 'sea', 'finish', 'parking'],
      photos: ph('whiteHouse', 'liv15', 'dining2', 'bed1'),
      description: 'Трёхуровневый таунхаус в малоэтажном квартале с видом на море с террасы. Собственный дворик и машино-место.\n\nОтделка в светлых тонах, кухня с техникой.' }
  ];

  root.MR = { config: config, cities: cities, types: types, features: features, agents: agents, objects: objects, img: U };
  if (typeof module !== 'undefined') module.exports = root.MR;
})(typeof window !== 'undefined' ? window : globalThis);
