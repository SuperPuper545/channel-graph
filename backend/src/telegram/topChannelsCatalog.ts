export interface CatalogChannel {
  username: string;
  title: string;
  category: string;
  isVerified?: boolean;
}

export const TOP_CATALOG_CHANNELS: CatalogChannel[] = [
  // 📰 Новости и Медиа
  { username: 'durov', title: 'Pavel Durov', category: 'Новости и Медиа', isVerified: true },
  { username: 'telegram', title: 'Telegram News', category: 'Новости и Медиа', isVerified: true },
  { username: 'breakingmash', title: 'Mash', category: 'Новости и Медиа', isVerified: true },
  { username: 'rian_ru', title: 'РИА Новости', category: 'Новости и Медиа', isVerified: true },
  { username: 'bazabazon', title: 'Baza', category: 'Новости и Медиа', isVerified: true },
  { username: 'readovkanews', title: 'Readovka', category: 'Новости и Медиа', isVerified: true },
  { username: 'rbc_news', title: 'РБК', category: 'Новости и Медиа', isVerified: true },
  { username: 'topor', title: 'Топор 18+', category: 'Новости и Медиа' },
  { username: 'bloodysx', title: 'Кровавая барыня', category: 'Новости и Медиа' },
  { username: 'varlamov_news', title: 'Varlamov News', category: 'Новости и Медиа' },
  { username: 'shot_shot', title: 'SHOT', category: 'Новости и Медиа', isVerified: true },
  { username: 'ostorozhno_novosti', title: 'Осторожно, новости', category: 'Новости и Медиа' },
  { username: 'meduzalive', title: 'Meduza — LIVE', category: 'Новости и Медиа' },

  // 💻 IT и Разработка
  { username: 'kodaboroda', title: 'Код Дурова', category: 'IT и Разработка', isVerified: true },
  { username: 'habr_com', title: 'Хабр', category: 'IT и Разработка', isVerified: true },
  { username: 'tproger', title: 'Типичный программист', category: 'IT и Разработка' },
  { username: 'tginfo', title: 'Telegram Info', category: 'IT и Разработка' },
  { username: 'rozetked', title: 'Rozetked', category: 'IT и Разработка', isVerified: true },
  { username: 'wylsacom', title: 'Wylsacom Red', category: 'IT и Разработка', isVerified: true },
  { username: 'droidergram', title: 'Droider', category: 'IT и Разработка' },
  { username: 'exploitex', title: 'Эксплойт', category: 'IT и Разработка' },
  { username: 'tproger_dev', title: 'Веб-разработка', category: 'IT и Разработка' },
  { username: 'proglibrary', title: 'Библиотека программиста', category: 'IT и Разработка' },

  // 🪙 Криптовалюты и Финансы
  { username: 'toncoin', title: 'TON Community', category: 'Криптовалюты и Финансы', isVerified: true },
  { username: 'forklog', title: 'ForkLog', category: 'Криптовалюты и Финансы' },
  { username: 'decenter', title: 'DeCenter', category: 'Криптовалюты и Финансы' },
  { username: 'binance_russian', title: 'Binance Russian', category: 'Криптовалюты и Финансы', isVerified: true },
  { username: 'incrypted', title: 'Incrypted', category: 'Криптовалюты и Финансы' },
  { username: 'coin_post', title: 'Coin Post', category: 'Криптовалюты и Финансы' },
  { username: 'crypto_attack', title: 'Crypto Attack', category: 'Криптовалюты и Финансы' },

  // 💼 Бизнес, Маркетинг и Инвестиции
  { username: 'tinkoff_journal', title: 'Т—Ж', category: 'Бизнес и Маркетинг', isVerified: true },
  { username: 'forbesrussia', title: 'Forbes Russia', category: 'Бизнес и Маркетинг', isVerified: true },
  { username: 'vcnews', title: 'vc.ru', category: 'Бизнес и Маркетинг' },
  { username: 'rusven', title: 'Русский Венчур', category: 'Бизнес и Маркетинг' },
  { username: 'rbc_investing', title: 'РБК Инвестиции', category: 'Бизнес и Маркетинг' },
  { username: 'setka_digital', title: 'Сетка', category: 'Бизнес и Маркетинг' },
  { username: 'artlebedev', title: 'Артемий Лебедев', category: 'Бизнес и Маркетинг' },

  // 🎭 Развлечения и Образование
  { username: 'leprum', title: 'Лепра', category: 'Юмор и Развлечения' },
  { username: 'maboratory', title: 'MDK', category: 'Юмор и Развлечения' },
  { username: 'pikabu', title: 'Пикабу', category: 'Юмор и Развлечения' },
  { username: 'kinopoisk', title: 'Кинопоиск', category: 'Образование и Наука', isVerified: true },
  { username: 'artscience', title: 'N+1', category: 'Образование и Наука' },
  { username: 'arzamas_mag', title: 'Arzamas', category: 'Образование и Наука' }
];
