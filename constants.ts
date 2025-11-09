import type { Item, City, PlayerState, Alliance, StashHouse, Mission } from './types';

export const CITIES: City[] = [
  { name: 'New York' },
  { name: 'Miami' },
  { name: 'Chicago' },
  { name: 'Los Angeles' },
  { name: 'Houston' },
  { name: 'Las Vegas' },
  { name: 'Erie' },
  { name: 'Boston' },
  { name: 'Pittsburgh' },
  { name: 'Atlanta' },
  { name: 'Bogotá', isOverseas: true },
  { name: 'Amsterdam', isOverseas: true },
  { name: 'Kabul', isOverseas: true },
  { name: 'Medellín', isOverseas: true },
  { name: 'Tijuana', isOverseas: true },
  { name: 'Shanghai', isOverseas: true },
];

export const ITEMS: Item[] = [
  { name: 'Speed', basePrice: 150 },
  { name: 'Weed', basePrice: 400 },
  { name: 'Mushrooms', basePrice: 800 },
  { name: 'Ecstasy', basePrice: 2000 },
  { name: 'Acid', basePrice: 3000 },
  { name: 'LSD', basePrice: 3500 },
  { name: 'PCP', basePrice: 4500 },
  { name: 'Heroin', basePrice: 10000 },
  { name: 'Opium', basePrice: 12000 },
  { name: 'Fentanyl', basePrice: 18000 },
  { name: 'Coke', basePrice: 25000 },
  { name: 'Meth', basePrice: 30000 },
];

// Price modifiers are now more extreme to encourage international travel
export const CITY_PRICE_MODIFIERS: Record<string, Record<string, number>> = {
  // US Cities
  'New York': { 'Coke': 1.5, 'Heroin': 1.4, 'Acid': 1.2, 'Meth': 1.6, 'LSD': 1.3, 'Mushrooms': 1.1, 'Opium': 1.5, 'Ecstasy': 1.3, 'PCP': 1.7, 'Fentanyl': 1.9 },
  'Miami': { 'Coke': 1.3, 'Weed': 1.1, 'Meth': 1.2, 'LSD': 1.0, 'Mushrooms': 0.8, 'Opium': 1.6, 'Ecstasy': 1.5, 'PCP': 1.1, 'Fentanyl': 1.6 },
  'Los Angeles': { 'Weed': 1.0, 'Acid': 1.3, 'Coke': 1.2, 'Meth': 0.9, 'LSD': 0.8, 'Mushrooms': 1.2, 'Opium': 1.4, 'Ecstasy': 1.2, 'PCP': 0.8, 'Fentanyl': 1.5 },
  'Chicago': { 'Heroin': 1.5, 'Speed': 0.9, 'Meth': 1.4, 'LSD': 1.4, 'Mushrooms': 1.0, 'Opium': 1.7, 'Ecstasy': 1.1, 'PCP': 1.5, 'Fentanyl': 2.0 },
  'Houston': { 'Weed': 1.2, 'Speed': 0.8, 'Meth': 0.7, 'LSD': 1.1, 'Mushrooms': 0.7, 'Opium': 1.5, 'Ecstasy': 0.9, 'PCP': 1.4, 'Fentanyl': 1.7 },
  'Las Vegas': { 'Acid': 1.4, 'Coke': 1.4, 'Speed': 1.1, 'Meth': 0.8, 'LSD': 1.5, 'Mushrooms': 1.3, 'Opium': 1.3, 'Ecstasy': 1.6, 'PCP': 1.2, 'Fentanyl': 1.4 },
  'Erie': { 'Weed': 0.9, 'Heroin': 1.1, 'Speed': 1.0, 'Meth': 1.1, 'LSD': 1.2, 'Mushrooms': 0.9, 'Opium': 1.2, 'Ecstasy': 0.8, 'PCP': 1.0, 'Fentanyl': 2.2 },
  'Boston': { 'Weed': 1.1, 'Acid': 1.2, 'Speed': 0.9, 'Meth': 1.5, 'LSD': 1.3, 'Mushrooms': 1.1, 'Opium': 1.6, 'Ecstasy': 1.2, 'PCP': 1.6, 'Fentanyl': 1.8 },
  'Pittsburgh': { 'Weed': 1.0, 'Heroin': 1.2, 'Speed': 1.1, 'Meth': 1.2, 'LSD': 1.3, 'Mushrooms': 1.0, 'Opium': 1.3, 'Ecstasy': 0.9, 'PCP': 1.1, 'Fentanyl': 2.1, 'Coke': 1.4 },
  'Atlanta': { 'Coke': 1.4, 'Weed': 1.1, 'Speed': 0.9, 'Meth': 1.3, 'LSD': 1.2, 'Mushrooms': 0.9, 'Opium': 1.5, 'Ecstasy': 1.4, 'PCP': 1.2, 'Fentanyl': 1.7 },

  // Overseas - Source of cheap product
  'Bogotá': { 'Coke': 0.15, 'Weed': 0.5, 'Heroin': 1.8, 'Meth': 2.0, 'LSD': 1.9, 'Mushrooms': 0.4, 'Opium': 2.2, 'Ecstasy': 2.0, 'PCP': 2.5, 'Fentanyl': 3.0 },
  'Amsterdam': { 'Acid': 0.2, 'Speed': 0.4, 'Weed': 0.4, 'Meth': 1.8, 'LSD': 0.3, 'Mushrooms': 0.6, 'Opium': 1.7, 'Ecstasy': 0.3, 'PCP': 1.8, 'Fentanyl': 2.5 },
  'Kabul': { 'Heroin': 0.1, 'Coke': 2.0, 'Weed': 0.8, 'Meth': 2.2, 'LSD': 2.5, 'Mushrooms': 1.5, 'Opium': 0.15, 'Ecstasy': 2.5, 'PCP': 3.0, 'Fentanyl': 0.2 },
  'Medellín': { 'Coke': 0.18, 'Weed': 0.6, 'Heroin': 1.9, 'Meth': 2.1, 'LSD': 2.0, 'Mushrooms': 0.5, 'Opium': 2.3, 'Ecstasy': 2.1, 'PCP': 2.6, 'Fentanyl': 3.1 },
  'Tijuana': { 'Meth': 0.25, 'Weed': 0.3, 'Coke': 1.5, 'Heroin': 1.7, 'Speed': 0.7, 'LSD': 1.8, 'Mushrooms': 0.8, 'Ecstasy': 1.5, 'PCP': 1.9, 'Fentanyl': 2.4 },
  'Shanghai': { 'Fentanyl': 0.15, 'PCP': 0.3, 'Meth': 0.4, 'Speed': 0.5, 'Ecstasy': 0.4, 'LSD': 2.2, 'Acid': 2.0, 'Coke': 2.5, 'Heroin': 2.8, 'Opium': 2.5, 'Weed': 2.0, 'Mushrooms': 2.1 },
};


export const ALLIANCES: Alliance[] = [
  { name: 'The East Coast Kings', homeCity: 'New York', specialtyItem: 'Coke', joinFee: 15000, rival: 'The Silicon Syndicate' },
  { name: 'The Silicon Syndicate', homeCity: 'Los Angeles', specialtyItem: 'LSD', joinFee: 10000, rival: 'The East Coast Kings' },
  { name: 'The Bayou Boys', homeCity: 'Houston', specialtyItem: 'Mushrooms', joinFee: 7500, rival: 'The Desert Scorpions' },
  { name: 'The Desert Scorpions', homeCity: 'Las Vegas', specialtyItem: 'Speed', joinFee: 7500, rival: 'The Bayou Boys' },
  { name: 'The Chicago Outfit', homeCity: 'Chicago', specialtyItem: 'Heroin', joinFee: 12000, rival: 'The Boston Bulldogs' },
  { name: 'The Boston Bulldogs', homeCity: 'Boston', specialtyItem: 'Speed', joinFee: 8000, rival: 'The Chicago Outfit' },
];

export const MISSIONS: Mission[] = [
  {
    id: 'ny_coke_run',
    type: 'DELIVER',
    title: 'Urgent Delivery to Miami',
    description: 'A client in Miami needs a package, no questions asked. The payout is good if you can get it there fast.',
    originCity: 'New York',
    destinationCity: 'Miami',
    itemName: 'Coke',
    quantity: 10,
    rewardCash: 25000,
  },
  {
    id: 'la_weed_supply',
    type: 'DELIVER',
    title: 'Vegas High Rollers',
    description: 'Some high rollers in Vegas need to relax. Bring them some of that famous LA green.',
    originCity: 'Los Angeles',
    destinationCity: 'Las Vegas',
    itemName: 'Weed',
    quantity: 50,
    rewardCash: 15000,
  },
  {
    id: 'chicago_cash_up',
    type: 'ACQUIRE_CASH',
    title: 'Prove Your Worth',
    description: 'The Outfit is watching you. Show them you can make serious money. Come back when you\'re holding at least $50,000.',
    originCity: 'Chicago',
    targetCash: 50000,
    rewardCash: 10000,
  },
  {
    id: 'houston_speed_demon',
    type: 'DELIVER',
    title: 'Cross-Country Rush',
    description: 'A trucker group in New York needs to stay awake for a long haul. They\'re paying top dollar for a Speed delivery.',
    originCity: 'Houston',
    destinationCity: 'New York',
    itemName: 'Speed',
    quantity: 100,
    rewardCash: 20000,
  },
  {
    id: 'bogota_export',
    type: 'DELIVER',
    title: 'International Man of Mystery',
    description: 'Our partners in Miami are waiting for a large shipment directly from the source. This is a high-risk, high-reward job.',
    originCity: 'Bogotá',
    destinationCity: 'Miami',
    itemName: 'Coke',
    quantity: 50,
    rewardCash: 150000,
  },
  {
    id: 'amsterdam_acid_trip',
    type: 'DELIVER',
    title: 'Mind Expansion',
    description: 'A group of tech-bros in Los Angeles want to "unlock their potential". Deliver the goods from Amsterdam.',
    originCity: 'Amsterdam',
    destinationCity: 'Los Angeles',
    itemName: 'Acid',
    quantity: 20,
    rewardCash: 75000,
  },
  {
    id: 'tijuana_meth_run',
    type: 'DELIVER',
    title: 'Baja Blast',
    description: 'Some bikers in LA need a fresh batch of crystal from south of the border. Fast and easy.',
    originCity: 'Tijuana',
    destinationCity: 'Los Angeles',
    itemName: 'Meth',
    quantity: 30,
    rewardCash: 80000,
  },
  {
    id: 'atlanta_hustle',
    type: 'ACQUIRE_CASH',
    title: 'The ATL Grind',
    description: 'Atlanta is all about the hustle. Show the players here you can move weight by stacking $75,000.',
    originCity: 'Atlanta',
    targetCash: 75000,
    rewardCash: 15000,
  },
  {
    id: 'medellin_shipment',
    type: 'DELIVER',
    title: 'The Silver Route',
    description: 'A classic run. Get this package from Medellín to our associates in Miami. They\'ll make it worth your while.',
    originCity: 'Medellín',
    destinationCity: 'Miami',
    itemName: 'Coke',
    quantity: 40,
    rewardCash: 120000,
  },
  {
    id: 'pittsburgh_pharma',
    type: 'DELIVER',
    title: 'Steel City Special',
    description: 'Some folks in Chicago need a pick-me-up. Deliver this Speed from Pittsburgh. Don\'t ask where it came from.',
    originCity: 'Pittsburgh',
    destinationCity: 'Chicago',
    itemName: 'Speed',
    quantity: 80,
    rewardCash: 18000,
  },
  {
    id: 'shanghai_pharma_deal',
    type: 'DELIVER',
    title: 'The Dragon\'s Dose',
    description: 'The Triads in Shanghai have a massive surplus of high-grade Fentanyl. The East Coast Kings in New York will pay a fortune for it. This is a top-tier run, don\'t mess it up.',
    originCity: 'Shanghai',
    destinationCity: 'New York',
    itemName: 'Fentanyl',
    quantity: 25,
    rewardCash: 200000,
  },
];

export const INITIAL_INVENTORY_SPACE = 100;
export const ALLIANCE_DISCOUNT = 0.85; // 15% discount

export const STASH_HOUSE_COST = 50000;
export const INITIAL_STASH_HOUSE_CAPACITY = 250;
export const STASH_HOUSE_UPKEEP_COST = 100;
export const DAILY_BANK_INTEREST_RATE = 0.001; // 0.1% per day

export const INVENTORY_UPGRADE_COST_BASE = 5000;
export const INVENTORY_UPGRADE_COST_MULTIPLIER = 1.8;
export const INVENTORY_UPGRADE_AMOUNT = 50;

export const STASH_HOUSE_UPGRADE_COST_BASE = 25000;
export const STASH_HOUSE_UPGRADE_COST_MULTIPLIER = 2.0;
export const STASH_HOUSE_UPGRADE_AMOUNT = 100;

export const LOAN_SHARK_CITY = 'Las Vegas';
export const LOAN_AMOUNT = 5000;
export const LOAN_INTEREST_RATE = 0.10; // 10% per day
export const LOAN_REPAY_DAYS = 15;


// Replace the constant with a function to ensure a fresh state object is always created.
export const getInitialPlayerState = (): PlayerState => ({
  cash: 2000,
  bankBalance: 0,
  inventory: ITEMS.reduce((acc, item) => ({ ...acc, [item.name]: 0 }), {}),
  inventorySpace: INITIAL_INVENTORY_SPACE,
  inventoryUsed: 0,
  stashHouses: [],
  playerAlliance: null,
  inventoryUpgrades: 0,
  activeMissionId: null,
  completedMissionIds: [],
  debt: 0,
  loanTaken: false,
});