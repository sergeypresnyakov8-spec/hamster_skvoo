import {
  AdvisorDefinition,
  BattlePassReward,
  DailyQuestState,
  EventTaskState,
  FairLot,
  GameState,
  HubModuleDefinition,
  InventoryItemDef,
  Rarity,
  UnitCategory,
  UnitDefinition,
  UnitFaction,
} from './types';

export const RARITY_ORDER: Rarity[] = ['C', 'B', 'A', 'S', 'S+'];

export const RARITY_COLORS: Record<Rarity, { border: string; badge: string; text: string; glow: string }> = {
  C: {
    border: 'border-slate-500/45',
    badge: 'bg-slate-600/80 text-slate-100',
    text: 'text-slate-300',
    glow: 'from-slate-700/30 to-slate-900/60',
  },
  B: {
    border: 'border-sky-500/55',
    badge: 'bg-sky-600/90 text-white',
    text: 'text-sky-300',
    glow: 'from-sky-900/35 to-slate-900/70',
  },
  A: {
    border: 'border-purple-500/60',
    badge: 'bg-purple-600/90 text-white',
    text: 'text-purple-300',
    glow: 'from-purple-900/40 to-slate-900/75',
  },
  S: {
    border: 'border-emerald-400/70',
    badge: 'bg-emerald-600 text-white',
    text: 'text-emerald-300',
    glow: 'from-emerald-900/40 to-slate-950/80',
  },
  'S+': {
    border: 'border-[#E5A93C]/85',
    badge: 'bg-gradient-to-r from-[#E5A93C] to-[#D9534F] text-[#0B0D14] font-extrabold',
    text: 'text-[#F8D482]',
    glow: 'from-amber-900/45 via-rose-950/30 to-slate-950/85',
  },
};

export const FACTIONS: UnitFaction[] = ['Легионеры', 'Загонщики', 'Корсары', 'Звёздный Флот'];

const UNIT_SEEDS: Array<{
  id: string;
  name: string;
  title: string;
  category: UnitCategory;
  faction: UnitFaction;
  rarity: Rarity;
  variant: UnitDefinition['portraitVariant'];
  hue: number;
}> = [
  // Космо-хомяки
  { id: 'u_legion_1', name: 'Звёздный Загонщик', title: 'Штурмовик авангарда', category: 'hamsters', faction: 'Легионеры', rarity: 'S', variant: 'duelist', hue: 35 },
  { id: 'u_legion_2', name: 'Квантовый Сталкер', title: 'Невидимка сектора', category: 'hamsters', faction: 'Легионеры', rarity: 'S', variant: 'admiral', hue: 210 },
  { id: 'u_legion_3', name: 'Пиро-Боец Кратос', title: 'Огнемётчик десанта', category: 'hamsters', faction: 'Легионеры', rarity: 'S', variant: 'procedural', hue: 8 },
  { id: 'u_legion_4', name: 'Кибер-Охотник Рекс', title: 'Арбалетчик орбиты', category: 'hamsters', faction: 'Легионеры', rarity: 'S', variant: 'procedural', hue: 195 },
  { id: 'u_legion_5', name: 'Плазменный Кнут', title: 'Оперативник зачистки', category: 'hamsters', faction: 'Легионеры', rarity: 'S', variant: 'procedural', hue: 350 },
  { id: 'u_legion_6', name: 'Грави-Щитоносец', title: 'Опора крейсера', category: 'hamsters', faction: 'Легионеры', rarity: 'S+', variant: 'admiral', hue: 42 },
  { id: 'u_legion_7', name: 'Фотон-Снайпер', title: 'Орбитальный стрелок', category: 'hamsters', faction: 'Загонщики', rarity: 'A', variant: 'mirra', hue: 280 },
  { id: 'u_legion_8', name: 'Синхро-Разведчик', title: 'Дрон-наводчик', category: 'hamsters', faction: 'Загонщики', rarity: 'B', variant: 'procedural', hue: 165 },
  { id: 'u_legion_9', name: 'Кадет-Механик', title: 'Обучаемый экипаж', category: 'hamsters', faction: 'Звёздный Флот', rarity: 'C', variant: 'procedural', hue: 220 },
  { id: 'u_legion_10', name: 'Корсар Туманности', title: 'Мастер абордажа', category: 'hamsters', faction: 'Корсары', rarity: 'S+', variant: 'duelist', hue: 25 },
  { id: 'u_legion_11', name: 'Теневой Навигатор', title: 'Агент гиперпространства', category: 'hamsters', faction: 'Корсары', rarity: 'A', variant: 'procedural', hue: 265 },
  { id: 'u_legion_12', name: 'Хроно-Канонир', title: 'Бомбардир флота', category: 'hamsters', faction: 'Звёздный Флот', rarity: 'S', variant: 'procedural', hue: 48 },
  { id: 'u_legion_13', name: 'Крио-Сержант', title: 'Хранитель шлюзов', category: 'hamsters', faction: 'Звёздный Флот', rarity: 'B', variant: 'procedural', hue: 190 },
  { id: 'u_legion_14', name: 'Матрос Реактора', title: 'Инженер смены', category: 'hamsters', faction: 'Звёздный Флот', rarity: 'C', variant: 'procedural', hue: 145 },
  { id: 'u_legion_15', name: 'Бро Невидимка', title: 'Легенда разведки', category: 'hamsters', faction: 'Загонщики', rarity: 'S+', variant: 'admiral', hue: 38 },
  { id: 'u_legion_16', name: 'Токсик-Биолог', title: 'Мастер мутагена', category: 'hamsters', faction: 'Корсары', rarity: 'A', variant: 'procedural', hue: 120 },

  // Адмиралы (Генералы)
  { id: 'adm_duelist', name: 'Адмирал Дуэлянт', title: 'Командир эскадры', category: 'admirals', faction: 'Корсары', rarity: 'S+', variant: 'duelist', hue: 30 },
  { id: 'adm_imperator', name: 'Император Звёзд', title: 'Верховный главнокомандующий', category: 'admirals', faction: 'Звёздный Флот', rarity: 'S+', variant: 'admiral', hue: 45 },
  { id: 'adm_mirra', name: 'Маршал Мирра', title: 'Владычица мостика', category: 'admirals', faction: 'Легионеры', rarity: 'S', variant: 'mirra', hue: 355 },
  { id: 'adm_victoria', name: 'Канцлер Виктория', title: 'Стратег галактики', category: 'admirals', faction: 'Звёздный Флот', rarity: 'S', variant: 'victoria', hue: 225 },
  { id: 'adm_valkyrie', name: 'Командор Валькирия', title: 'Перехватчик орбит', category: 'admirals', faction: 'Загонщики', rarity: 'S', variant: 'procedural', hue: 285 },
  { id: 'adm_kronos', name: 'Капитан Кронос', title: 'Охотник за головами', category: 'admirals', faction: 'Корсары', rarity: 'A', variant: 'procedural', hue: 18 },
  { id: 'adm_vega', name: 'Офицер Вега', title: 'Координатор щитов', category: 'admirals', faction: 'Звёздный Флот', rarity: 'B', variant: 'procedural', hue: 200 },
  { id: 'adm_orbit', name: 'Лейтенант Орбит', title: 'Патрульный сектора', category: 'admirals', faction: 'Легионеры', rarity: 'C', variant: 'procedural', hue: 215 },

  // Реликвии (Идолы)
  { id: 'rel_crown', name: 'Корона Сверхновой', title: 'Артефакт Первого Флота', category: 'relics', faction: 'Звёздный Флот', rarity: 'S+', variant: 'procedural', hue: 44 },
  { id: 'rel_heart', name: 'Сердце Квазара', title: 'Источник бесконечной тяги', category: 'relics', faction: 'Легионеры', rarity: 'S', variant: 'procedural', hue: 290 },
  { id: 'rel_compass', name: 'Гипер-Компас', title: 'Навигатор Пустоты', category: 'relics', faction: 'Корсары', rarity: 'A', variant: 'procedural', hue: 185 },
  { id: 'rel_matrix', name: 'Матрица Щитов', title: 'Титановый стабилизатор', category: 'relics', faction: 'Загонщики', rarity: 'B', variant: 'procedural', hue: 155 },
  { id: 'rel_gyro', name: 'Старый Гироскоп', title: 'Наследие первопроходцев', category: 'relics', faction: 'Звёздный Флот', rarity: 'C', variant: 'procedural', hue: 210 },
];

const RARITY_STAT_SCALE: Record<Rarity, number> = {
  C: 1,
  B: 1.8,
  A: 3.4,
  S: 6.8,
  'S+': 13.5,
};

export const UNITS_CATALOG: UnitDefinition[] = UNIT_SEEDS.map((s, idx) => {
  const scale = RARITY_STAT_SCALE[s.rarity] * (s.category === 'admirals' ? 1.5 : s.category === 'relics' ? 0.9 : 1);
  return {
    id: s.id,
    name: s.name,
    title: s.title,
    category: s.category,
    faction: s.faction,
    rarity: s.rarity,
    baseAtk: Math.round(420 * scale + idx * 15),
    baseHp: Math.round(920 * scale + idx * 30),
    baseDef: Math.round(110 * scale + idx * 4),
    baseCc: Math.round(180 * scale + idx * 6),
    baseAcc: Math.round(140 * scale + idx * 5),
    maxLevel: s.rarity === 'S+' ? 300 : s.rarity === 'S' ? 250 : s.rarity === 'A' ? 200 : 150,
    unlockCostCredits: Math.round(3500 * scale),
    unlockCostSpheres: s.rarity === 'S+' ? 45 : s.rarity === 'S' ? 20 : s.rarity === 'A' ? 10 : 4,
    passiveCreditsPerHour: Math.round(12000 * scale),
    portraitVariant: s.variant,
    accentHue: s.hue,
  };
});

export const UNITS_BY_ID: Record<string, UnitDefinition> = Object.fromEntries(UNITS_CATALOG.map((u) => [u.id, u]));

export const HUB_MODULES_CATALOG: HubModuleDefinition[] = [
  {
    id: 'mod_medblock',
    name: 'МедБлок 3★',
    sectorName: 'Орбитальный Госпиталь',
    description: 'Пассивный синтез серебряных SP-модулей восстановления',
    baseRarity: 'S',
    maxStars: 5,
    incomeResource: 'spSilver',
    baseBonusValue: 0.2,
    activationDurationSec: 1800,
    activationBoostMultiplier: 2,
    upgradeCostCredits: 45000,
    upgradeCostAlloys: 1200,
    mapX: 28,
    mapY: 36,
  },
  {
    id: 'mod_gradproject',
    name: 'ГрадПроект 3★',
    sectorName: 'Верфь Ковчега',
    description: 'Увеличивает пассивный приток Сплавов на станции',
    baseRarity: 'S',
    maxStars: 5,
    incomeResource: 'alloys',
    baseBonusValue: 180,
    activationDurationSec: 2400,
    activationBoostMultiplier: 2,
    upgradeCostCredits: 52000,
    upgradeCostAlloys: 1400,
    mapX: 54,
    mapY: 28,
  },
  {
    id: 'mod_energybank',
    name: 'ЭнергоБанк 3★',
    sectorName: 'Реакторная Цитадель',
    description: 'Ускоряет регенерацию Энергии мостика и синтез Кристаллов',
    baseRarity: 'S+',
    maxStars: 5,
    incomeResource: 'energyPerSec',
    baseBonusValue: 1.8,
    activationDurationSec: 3600,
    activationBoostMultiplier: 2.5,
    upgradeCostCredits: 95000,
    upgradeCostAlloys: 2500,
    mapX: 58,
    mapY: 42,
  },
  {
    id: 'mod_geoanalytics',
    name: 'ГеоАналитика 4★',
    sectorName: 'Астро-Обсерватория',
    description: 'Добыча Звёздных Ядер для прокачки экипажа (улучшается A >> S)',
    baseRarity: 'A',
    maxStars: 5,
    incomeResource: 'cores',
    baseBonusValue: 160,
    activationDurationSec: 1800,
    activationBoostMultiplier: 2,
    upgradeCostCredits: 30000,
    upgradeCostAlloys: 900,
    mapX: 38,
    mapY: 62,
  },
  {
    id: 'mod_hamcharge',
    name: 'ХомЗаряд 3★',
    sectorName: 'ХомТрейд Холл',
    description: 'Увеличивает максимальный запас Энергии корабля (+100K+)',
    baseRarity: 'S+',
    maxStars: 5,
    incomeResource: 'maxEnergy',
    baseBonusValue: 100000,
    activationDurationSec: 3600,
    activationBoostMultiplier: 1.5,
    upgradeCostCredits: 75000,
    upgradeCostAlloys: 1800,
    mapX: 60,
    mapY: 70,
  },
  {
    id: 'mod_bodryakom',
    name: 'БодряКом 3★',
    sectorName: 'Торговый Док',
    description: 'Генерирует стабильный поток галактических Кредитов/час',
    baseRarity: 'S',
    maxStars: 5,
    incomeResource: 'credits',
    baseBonusValue: 250000,
    activationDurationSec: 1800,
    activationBoostMultiplier: 2,
    upgradeCostCredits: 38000,
    upgradeCostAlloys: 1100,
    mapX: 25,
    mapY: 72,
  },
  {
    id: 'mod_quantumlab',
    name: 'Квантовый Синтез 4★',
    sectorName: 'Лаборатория Сфер',
    description: 'Автоматическое производство Космических Сфер призыва',
    baseRarity: 'S',
    maxStars: 5,
    incomeResource: 'spheresCommon',
    baseBonusValue: 3.2,
    activationDurationSec: 2700,
    activationBoostMultiplier: 2,
    upgradeCostCredits: 64000,
    upgradeCostAlloys: 1600,
    mapX: 56,
    mapY: 18,
  },
  {
    id: 'mod_admiraldock',
    name: 'Штаб Контрактов 5★',
    sectorName: 'Холл Золотого Хвоста',
    description: 'Пассивная добыча Жетонов Адмиралов для элитных контрактов',
    baseRarity: 'S+',
    maxStars: 5,
    incomeResource: 'admiralTokens',
    baseBonusValue: 45,
    activationDurationSec: 3600,
    activationBoostMultiplier: 2,
    upgradeCostCredits: 120000,
    upgradeCostAlloys: 3200,
    mapX: 50,
    mapY: 48,
  },
];

export const HUB_MODULES_BY_ID: Record<string, HubModuleDefinition> = Object.fromEntries(
  HUB_MODULES_CATALOG.map((m) => [m.id, m])
);

export const ADVISORS_CATALOG: AdvisorDefinition[] = [
  {
    id: 'adv_mirra',
    name: 'Навигатор Мирра',
    role: 'Офицер тактической разведки',
    specialty: '+25% к добыче Сплавов и Энергии при сканировании',
    imagePath: '/src/assets/images/space_advisor_mirra_1794916300368.jpg',
    unlockCostCrystals: 0,
    passiveBonusLabel: '+1.4 Энергии/сек и шанс сундука',
    energyPerClick: 1200,
    creditMultiplier: 1.0,
  },
  {
    id: 'adv_victoria',
    name: 'Канцлер Виктория',
    role: 'Продюсер галактических альянсов',
    specialty: '+40% Кредитов за сканирование и скидка на Ярмарке',
    imagePath: '/src/assets/images/space_advisor_victoria_1794916300581.jpg',
    unlockCostCrystals: 500,
    passiveBonusLabel: '+40% Кредитов с мостика',
    energyPerClick: 1500,
    creditMultiplier: 1.4,
  },
  {
    id: 'adv_duelist',
    name: 'Корсар Джек',
    role: 'Мастер контрактов и рейдов',
    specialty: '+35% Ядер и редких жетонов за сканирование',
    imagePath: '/src/assets/images/space_commander_duelist_1794916301947.jpg',
    unlockCostCrystals: 1200,
    passiveBonusLabel: '+20% мощи флота в рейдах',
    energyPerClick: 1800,
    creditMultiplier: 1.65,
  },
  {
    id: 'adv_admiral',
    name: 'Адмирал Атлант',
    role: 'Командующий Золотым Флотом',
    specialty: 'Удвоенный прирост опыта Боевого Пропуска и Сфер',
    imagePath: '/src/assets/images/space_hero_admiral_1794916300536.jpg',
    unlockCostCrystals: 2500,
    passiveBonusLabel: '+100% Кредитов и +2.5 Энергии/сек',
    energyPerClick: 2200,
    creditMultiplier: 2.0,
  },
];

export const ADVISORS_BY_ID: Record<string, AdvisorDefinition> = Object.fromEntries(
  ADVISORS_CATALOG.map((a) => [a.id, a])
);

export const INVENTORY_CATALOG: InventoryItemDef[] = [
  {
    id: 'item_skip_6h',
    name: 'Хроно-капсула 6H',
    description: 'Мгновенно начисляет 6 часов всего пассивного дохода империи.',
    tab: 'inventory',
    rarity: 'S',
    effectType: 'timeskip_hours',
    effectValue: 6,
    badgeText: '6H',
  },
  {
    id: 'item_skip_12h',
    name: 'Хроно-капсула 12H',
    description: 'Мгновенно начисляет 12 часов всего пассивного дохода империи.',
    tab: 'inventory',
    rarity: 'S',
    effectType: 'timeskip_hours',
    effectValue: 12,
    badgeText: '12H',
  },
  {
    id: 'item_skip_24h',
    name: 'Хроно-капсула 24H',
    description: 'Мгновенно начисляет полные 24 часа пассивного дохода империи.',
    tab: 'inventory',
    rarity: 'S+',
    effectType: 'timeskip_hours',
    effectValue: 24,
    badgeText: '24H',
  },
  {
    id: 'item_vip_1d',
    name: 'Императорский VIP (1 день)',
    description: 'Удваивает (+100%) пассивный доход и реген Энергии на 24 часа.',
    tab: 'inventory',
    rarity: 'S',
    effectType: 'vip_days',
    effectValue: 1,
    badgeText: '1 Д',
  },
  {
    id: 'item_vip_3d',
    name: 'Императорский VIP (3 дня)',
    description: 'Удваивает (+100%) пассивный доход и реген Энергии на 72 часа.',
    tab: 'inventory',
    rarity: 'S+',
    effectType: 'vip_days',
    effectValue: 3,
    badgeText: '3 Д',
  },
  {
    id: 'item_chest_supply',
    name: 'Контейнер Корпорации',
    description: 'Содержит Кредиты, Сплавы, Звёздные Ядра и шанс на Кристаллы.',
    tab: 'inventory',
    rarity: 'A',
    effectType: 'chest',
    effectValue: 1,
  },
  {
    id: 'item_chest_reactor',
    name: 'Плазменный Котёл',
    description: 'Редкий сундук: приносит Сферы призыва и Очки Навыков SP.',
    tab: 'inventory',
    rarity: 'S',
    effectType: 'chest',
    effectValue: 2,
  },
  {
    id: 'item_energy_cell',
    name: 'Квантовая Батарея',
    description: 'Мгновенно восстанавливает 50% максимального запаса Энергии.',
    tab: 'inventory',
    rarity: 'B',
    effectType: 'energy_refill',
    effectValue: 50,
  },
  {
    id: 'item_biz_geo',
    name: 'Чертёж ГеоАналитики',
    description: 'Используется для повышения редкости орбитальных станций.',
    tab: 'business',
    rarity: 'A',
    effectType: 'currency_pack',
    effectValue: 50000,
  },
  {
    id: 'item_biz_citadel',
    name: 'Модуль Цитадели S+',
    description: 'Редкий бизнес-артефакт. Конвертируется в Сплавы и Кредиты.',
    tab: 'business',
    rarity: 'S+',
    effectType: 'currency_pack',
    effectValue: 180000,
  },
  {
    id: 'item_vault_toxic',
    name: 'Ошейник Радиации',
    description: 'Трофей сектора «Туманность Токсик» из личного Тайника.',
    tab: 'vault',
    rarity: 'S',
    effectType: 'collectible',
    effectValue: 1,
  },
  {
    id: 'item_vault_plasma',
    name: 'Кибер-Ошейник Неон',
    description: 'Коллекционный артефакт орбитального патруля.',
    tab: 'vault',
    rarity: 'A',
    effectType: 'collectible',
    effectValue: 1,
  },
  {
    id: 'item_vault_royal',
    name: 'Знак Королевского Хвоста',
    description: 'Почётная регалия космического синдиката.',
    tab: 'vault',
    rarity: 'S+',
    effectType: 'collectible',
    effectValue: 1,
  },
];

export const INVENTORY_BY_ID: Record<string, InventoryItemDef> = Object.fromEntries(
  INVENTORY_CATALOG.map((item) => [item.id, item])
);

export const BATTLE_PASS_REWARDS: BattlePassReward[] = Array.from({ length: 100 }, (_, i) => {
  const level = i + 1;
  const xpRequired = level * 22000;
  const isMilestone = level % 10 === 0;
  const isFive = level % 5 === 0;

  return {
    level,
    xpRequired,
    free: isMilestone
      ? { label: `${level === 100 ? 'S+ Сфера' : '25 Сфер'}`, resource: 'spheresElite', amount: level === 100 ? 15 : 5 }
      : isFive
      ? { label: '2 SP', resource: 'spSilver', amount: 2 }
      : level % 2 === 0
      ? { label: '40K Кред.', resource: 'credits', amount: 40000 }
      : { label: '160K Кадет.', resource: 'cadets', amount: 160000 },
    premium: isMilestone
      ? { label: `${level === 100 ? '100 Адм.' : '40 Адм.'}`, resource: 'admiralTokens', amount: level === 100 ? 500 : 120 }
      : isFive
      ? { label: '4 SP', resource: 'spSilver', amount: 4 }
      : level % 2 === 0
      ? { label: '80K Кред.', resource: 'credits', amount: 80000 }
      : { label: '120 Крист.', resource: 'crystals', amount: 120 },
    super: isMilestone
      ? { label: `${level === 100 ? 'S+ Адм.' : '1000 Адм.'}`, resource: 'admiralTokens', amount: level === 100 ? 1500 : 350 }
      : isFive
      ? { label: '2 Золот. SP', resource: 'spGold', amount: 2 }
      : level % 2 === 0
      ? { label: '320K Кадет.', resource: 'cadets', amount: 320000 }
      : { label: '250 Крист.', resource: 'crystals', amount: 250 },
  };
});

export const BATTLE_PASS_BY_LEVEL: Record<number, BattlePassReward> = Object.fromEntries(
  BATTLE_PASS_REWARDS.map((row) => [row.level, row])
);

export const AI_RIVAL_FLEETS = [
  { rank: 1, name: 'Фыркус-Орбита', power: 1790256, tag: 'FRK' },
  { rank: 2, name: 'Star 🏆 King', power: 1719418, tag: 'STR' },
  { rank: 3, name: 'Шпаковград-X', power: 1525170, tag: 'SHP' },
  { rank: 4, name: 'Галактический Легион', power: 1421838, tag: 'GAL' },
  { rank: 5, name: 'Квазар Альфа', power: 1211884, tag: 'QZR' },
  { rank: 6, name: 'ТОВАРИЩИ КОСМОСА', power: 1115171, tag: 'COM' },
  { rank: 7, name: 'Red Hot Chili Stars', power: 1045236, tag: 'RHC' },
  { rank: 8, name: 'Туманность Ориона', power: 1008905, tag: 'ORN' },
  { rank: 9, name: 'ИЗБРАННЫЕ', power: 993146, tag: 'IZB' },
  { rank: 10, name: 'Звёздные Волки', power: 880809, tag: 'WLF' },
  { rank: 11, name: 'Dark Nebula [DRK]', power: 868373, tag: 'DRK' },
  { rank: 12, name: 'Dzen Orbit', power: 805696, tag: 'DZN' },
];

export const AI_FLEET_MEMBERS = [
  { name: 'Командор Яшер', role: 'Капитан', power: 845000, status: 'На орбите' },
  { name: 'Штурман Вектор', role: 'Офицер', power: 412000, status: 'В рейде' },
  { name: 'Пилот Искра', role: 'Боец', power: 365000, status: 'Скан сектора' },
  { name: 'Механик Гайка', role: 'Инженер', power: 298000, status: 'На базе' },
  { name: 'Снайпер Сова', role: 'Боец', power: 271000, status: 'Арена' },
  { name: 'Киборг Ноль', role: 'Ветеран', power: 245000, status: 'Охрана' },
];

export const DAILY_COUPONS = [
  { code: 'COSMOS', rewardTokens: 1500, rewardCrystals: 150, hint: 'Бескрайнее пространство за иллюминатором (англ.)' },
  { code: 'HAMSTER', rewardTokens: 1200, rewardCrystals: 100, hint: 'Главный герой нашего флота (англ.)' },
  { code: 'ORBITA', rewardTokens: 1000, rewardCrystals: 120, hint: 'Путь станции вокруг планеты (латиницей)' },
];

export function getDateKey(ms: number = Date.now()): string {
  const d = new Date(ms);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function getMonthKey(ms: number = Date.now()): string {
  const d = new Date(ms);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${yyyy}-${mm}`;
}

export function createDailyQuests(): DailyQuestState[] {
  return [
    {
      id: 'dq_alloys',
      title: 'Потрать 50 000 Сплавов на улучшения',
      target: 50000,
      progress: 0,
      claimed: false,
      rewardFleetCoins: 250,
      rewardCrystals: 80,
      rewardBpXp: 15000,
      jumpTab: 'crew',
    },
    {
      id: 'dq_boss_raids',
      title: 'Заверши 10 рейдов на Боссов Сектора',
      target: 10,
      progress: 0,
      claimed: false,
      rewardFleetCoins: 300,
      rewardCrystals: 120,
      rewardBpXp: 25000,
      jumpTab: 'map',
      jumpModal: 'combat',
    },
    {
      id: 'dq_scans',
      title: 'Выполни 25 сканирований с Мостика',
      target: 25,
      progress: 0,
      claimed: false,
      rewardFleetCoins: 200,
      rewardCrystals: 60,
      rewardBpXp: 12000,
      jumpTab: 'bridge',
    },
    {
      id: 'dq_spheres',
      title: 'Открой 15 Космических Сфер или Контрактов',
      target: 15,
      progress: 0,
      claimed: false,
      rewardFleetCoins: 350,
      rewardCrystals: 150,
      rewardBpXp: 20000,
      jumpTab: 'shop',
    },
    {
      id: 'dq_fair',
      title: 'Купи 3 лота на Звёздной Ярмарке',
      target: 3,
      progress: 0,
      claimed: false,
      rewardFleetCoins: 180,
      rewardCrystals: 90,
      rewardBpXp: 10000,
      jumpTab: 'shop',
    },
  ];
}

export function createEventTasks(): EventTaskState[] {
  return [
    {
      id: 'ev_cadets',
      title: 'Проведи 30 сканирований аномалий',
      target: 30,
      progress: 0,
      claimed: false,
      rewardEventTokens: 1200,
      rewardCrystals: 100,
    },
    {
      id: 'ev_modules',
      title: 'Улучши или активируй 5 модулей Хаба',
      target: 5,
      progress: 0,
      claimed: false,
      rewardEventTokens: 1800,
      rewardCrystals: 150,
    },
    {
      id: 'ev_cores',
      title: 'Потрать 5 000 Звёздных Ядер',
      target: 5000,
      progress: 0,
      claimed: false,
      rewardEventTokens: 2200,
      rewardCrystals: 200,
    },
    {
      id: 'ev_battles',
      title: 'Победи в 12 космических боях',
      target: 12,
      progress: 0,
      claimed: false,
      rewardEventTokens: 2500,
      rewardCrystals: 250,
    },
  ];
}

export function createFairLots(): FairLot[] {
  return [
    { id: 'lot_alloys', title: 'Партия Нано-сплавов ×2500', resource: 'alloys', amount: 2500, costCredits: 18000, bought: false, rarity: 'B' },
    { id: 'lot_cores', title: 'Звёздные Ядра ×1200', resource: 'cores', amount: 1200, costCredits: 22000, bought: false, rarity: 'A' },
    { id: 'lot_spheres', title: 'Космические Сферы ×10', resource: 'spheresCommon', amount: 10, costCredits: 45000, bought: false, rarity: 'S' },
    { id: 'lot_tokens', title: 'Жетоны Адмирала ×300', resource: 'admiralTokens', amount: 300, costCredits: 85000, bought: false, rarity: 'S' },
    { id: 'lot_sp', title: 'Модули навыков SP ×5', resource: 'spSilver', amount: 5, costCredits: 65000, bought: false, rarity: 'S+' },
  ];
}

export function createInitialGameState(now: number = Date.now()): GameState {
  const units: GameState['units'] = {};
  for (const u of UNITS_CATALOG) {
    const starterUnlocked = u.id === 'u_legion_9' || u.id === 'u_legion_14';
    units[u.id] = {
      id: u.id,
      unlocked: starterUnlocked,
      level: 1,
      copies: starterUnlocked ? 1 : 0,
    };
  }

  const hubModules: GameState['hubModules'] = {};
  for (const m of HUB_MODULES_CATALOG) {
    const starter = m.id === 'mod_bodryakom';
    hubModules[m.id] = {
      id: m.id,
      unlocked: starter,
      stars: 1,
      rarity: starter ? 'C' : m.baseRarity,
      activeUntil: 0,
    };
  }

  const advisors: GameState['advisors'] = {};
  for (const a of ADVISORS_CATALOG) {
    advisors[a.id] = {
      id: a.id,
      unlocked: a.unlockCostCrystals === 0,
      level: 1,
      xp: 0,
    };
  }

  return {
    schemaVersion: 2,
    playerName: 'Командор',
    fleetName: 'Звёздный Авангард',
    fleetLevel: 1,
    fleetXp: 0,
    createdAt: now,
    lastTickAt: now,
    lastSavedAt: now,
    totalPlaySeconds: 0,
    soundEnabled: true,
    autoScanEnabled: false,
    vipExpiresAt: 0,
    activeAdvisorId: 'adv_mirra',
    advisorSkillLevel: 1,
    pityCounter: 0,
    totalScans: 0,
    totalBattlesWon: 0,
    bossStage: 1,
    arenaStage: 1,
    fleetWarStage: 1,
    resources: {
      credits: 5000,
      alloys: 250,
      cores: 300,
      crystals: 150,
      cadets: 500,
      energy: 252000,
      spheresCommon: 3,
      spheresElite: 0,
      admiralTokens: 0,
      spSilver: 5,
      spGold: 0,
      eventTokens: 0,
      fleetCoins: 0,
    },
    units,
    hubModules,
    advisors,
    inventory: {
      item_chest_supply: 1,
      item_energy_cell: 2,
    },
    dailyQuestsDate: getDateKey(now),
    dailyQuests: createDailyQuests(),
    eventMonthKey: getMonthKey(now),
    eventTasks: createEventTasks(),
    redeemedCoupons: [],
    dailyGiftClaimedDays: [],
    fairLots: createFairLots(),
    battlePass: {
      monthKey: getMonthKey(now),
      xp: 0,
      premiumUnlocked: false,
      superUnlocked: false,
      claimedFree: [],
      claimedPremium: [],
      claimedSuper: [],
    },
    tournamentScore: 0,
    fractionalBuffer: {},
  };
}
