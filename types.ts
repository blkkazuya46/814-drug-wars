

export interface Item {
  name: string;
  basePrice: number;
}

export interface City {
  name: string;
  isOverseas?: boolean;
}

export type MarketPrices = Record<string, Record<string, number>>; // { [cityName]: { [itemName]: price } }

export type Inventory = Record<string, number>; // { [itemName]: quantity }

export type Stash = Record<string, number>; // { [itemName]: quantity }

export interface StashHouse {
  city: string;
  capacity: number;
  used: number;
  contents: Stash;
  upgradeLevel: number;
}

export type MissionType = 'DELIVER' | 'ACQUIRE_CASH';

export interface Mission {
  id: string;
  type: MissionType;
  title: string;
  description: string;
  originCity: string;
  destinationCity?: string;
  itemName?: string;
  quantity?: number;
  targetCash?: number;
  rewardCash: number;
}

export interface PlayerState {
  cash: number;
  bankBalance: number;
  inventory: Inventory;
  inventorySpace: number;
  inventoryUsed: number;
  stashHouses: StashHouse[];
  playerAlliance: string | null;
  inventoryUpgrades: number;
  activeMissionId: string | null;
  completedMissionIds: string[];
  debt: number;
  loanTaken: boolean;
}

export interface GeminiEvent {
  eventDescription: string;
  affectedItem: string;
  priceModifier: number;
  affectedCity: string;
}

export interface ActiveGeminiEvent extends GeminiEvent {
  expiresOnDay: number;
}

export interface Alliance {
  name:string;
  homeCity: string;
  specialtyItem: string;
  joinFee: number;
  rival: string;
}

export interface BustEvent {
  bustDescription: string;
  penaltyType: 'cash' | 'inventory' | 'both';
  cashPenaltyPercentage: number;
  inventoryPenaltyPercentage: number;
}