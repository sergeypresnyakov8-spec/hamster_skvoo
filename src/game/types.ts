export type Rarity = 'C' | 'B' | 'A' | 'S' | 'S+';

export type UnitCategory = 'hamsters' | 'relics' | 'admirals';

export type UnitFaction = 'Легионеры' | 'Загонщики' | 'Корсары' | 'Звёздный Флот';

export type TabId = 'fleet' | 'crew' | 'map' | 'bridge' | 'shop';

export type ModalId =
  | null
  | 'inventory'
  | 'bonuses'
  | 'battlePass'
  | 'combat'
  | 'event'
  | 'hub'
  | 'settings'
  | 'offlineReport'
  | 'tournaments';

export interface Resources {
  credits: number;        // Основная валюта (Кредиты / H-coin)
  alloys: number;         // Нано-сплавы (Инструменты)
  cores: number;          // Звёздные ядра (Орехи)
  crystals: number;       // Квантовые кристаллы (Алмазы)
  cadets: number;         // Кадеты (Салаги)
  energy: number;         // Текущая энергия
  spheresCommon: number;  // Базовые сферы призыва
  spheresElite: number;   // Элитные сферы призыва
  admiralTokens: number;  // Жетоны контрактов адмиралов
  spSilver: number;       // Серебряные очки навыков SP
  spGold: number;         // Золотые очки навыков SP
  eventTokens: number;    // Валюта текущего события (Квантовые конфеты / кристаллы)
  fleetCoins: number;     // Монеты флота
}

export interface UnitDefinition {
  id: string;
  name: string;
  title: string;
  category: UnitCategory;
  faction: UnitFaction;
  rarity: Rarity;
  baseAtk: number;
  baseHp: number;
  baseDef: number;
  baseCc: number;
  baseAcc: number;
  maxLevel: number;
  unlockCostCredits: number;
  unlockCostSpheres: number;
  passiveCreditsPerHour: number;
  portraitVariant: 'admiral' | 'duelist' | 'mirra' | 'victoria' | 'procedural';
  accentHue: number;
}

export interface OwnedUnitState {
  id: string;
  unlocked: boolean;
  level: number;
  copies: number;
}

export interface HubModuleDefinition {
  id: string;
  name: string;
  sectorName: string;
  description: string;
  baseRarity: Rarity;
  maxStars: number;
  incomeResource: keyof Resources | 'maxEnergy' | 'energyPerSec' | 'maxStations';
  baseBonusValue: number;
  activationDurationSec: number;
  activationBoostMultiplier: number;
  upgradeCostCredits: number;
  upgradeCostAlloys: number;
  mapX: number; // % on sector map
  mapY: number; // % on sector map
}

export interface OwnedHubModule {
  id: string;
  unlocked: boolean;
  stars: number;
  rarity: Rarity;
  activeUntil: number; // epoch ms
}

export interface AdvisorDefinition {
  id: string;
  name: string;
  role: string;
  specialty: string;
  imagePath: string;
  unlockCostCrystals: number;
  passiveBonusLabel: string;
  energyPerClick: number;
  creditMultiplier: number;
}

export interface OwnedAdvisor {
  id: string;
  unlocked: boolean;
  level: number;
  xp: number;
}

export type InventoryTab = 'inventory' | 'business' | 'vault';

export interface InventoryItemDef {
  id: string;
  name: string;
  description: string;
  tab: InventoryTab;
  rarity: Rarity;
  effectType: 'timeskip_hours' | 'vip_days' | 'chest' | 'energy_refill' | 'currency_pack' | 'collectible';
  effectValue: number;
  badgeText?: string;
}

export interface DailyQuestState {
  id: string;
  title: string;
  target: number;
  progress: number;
  claimed: boolean;
  rewardFleetCoins: number;
  rewardCrystals: number;
  rewardBpXp: number;
  jumpTab: TabId;
  jumpModal?: ModalId;
}

export interface EventTaskState {
  id: string;
  title: string;
  target: number;
  progress: number;
  claimed: boolean;
  rewardEventTokens: number;
  rewardCrystals: number;
}

export interface BattlePassReward {
  level: number;
  xpRequired: number;
  free: { label: string; resource: keyof Resources | 'chest'; amount: number };
  premium: { label: string; resource: keyof Resources | 'chest'; amount: number };
  super: { label: string; resource: keyof Resources | 'chest'; amount: number };
}

export interface CombatLogEntry {
  round: number;
  actor: 'squad' | 'boss';
  damage: number;
  isCrit: boolean;
  message: string;
}

export interface CombatResult {
  victory: boolean;
  mode: 'arena' | 'boss' | 'fleetWar';
  stage: number;
  bossName: string;
  rounds: CombatLogEntry[];
  rewards: Partial<Resources>;
  bpXpGained: number;
}

export interface FairLot {
  id: string;
  title: string;
  resource: keyof Resources;
  amount: number;
  costCredits: number;
  bought: boolean;
  rarity: Rarity;
}

export interface GameState {
  schemaVersion: number;
  playerName: string;
  fleetName: string;
  fleetLevel: number;
  fleetXp: number;
  createdAt: number;
  lastTickAt: number;
  lastSavedAt: number;
  totalPlaySeconds: number;
  soundEnabled: boolean;
  autoScanEnabled: boolean;
  vipExpiresAt: number;
  activeAdvisorId: string;
  advisorSkillLevel: number;
  pityCounter: number; // 0..49, 50th is guaranteed S+
  totalScans: number;
  totalBattlesWon: number;
  bossStage: number;
  arenaStage: number;
  fleetWarStage: number;
  resources: Resources;
  units: Record<string, OwnedUnitState>;
  hubModules: Record<string, OwnedHubModule>;
  advisors: Record<string, OwnedAdvisor>;
  inventory: Record<string, number>;
  dailyQuestsDate: string; // YYYY-MM-DD
  dailyQuests: DailyQuestState[];
  eventMonthKey: string; // YYYY-MM
  eventTasks: EventTaskState[];
  redeemedCoupons: string[];
  dailyGiftClaimedDays: number[];
  fairLots: FairLot[];
  battlePass: {
    monthKey: string;
    xp: number;
    premiumUnlocked: boolean;
    superUnlocked: boolean;
    claimedFree: number[];
    claimedPremium: number[];
    claimedSuper: number[];
  };
  tournamentScore: number;
  fractionalBuffer?: {
    credits?: number;
    alloys?: number;
    cores?: number;
    spheresCommon?: number;
    spSilver?: number;
    admiralTokens?: number;
    playSeconds?: number;
  };
}

export interface ComputedBonuses {
  creditsPerHour: number;
  alloysPerHour: number;
  coresPerHour: number;
  spheresPerHour: number;
  spSilverPerHour: number;
  admiralTokensPerHour: number;
  energyPerSec: number;
  maxEnergy: number;
  maxActiveHubSlots: number;
  fairDiscountPct: number;
  vipActive: boolean;
  squadPower: number;
  collectionUnlocked: number;
  collectionTotal: number;
}

export interface OfflineReport {
  elapsedSeconds: number;
  gained: Partial<Resources>;
  energyRestored: number;
}
