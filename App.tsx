import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CITIES, ITEMS, getInitialPlayerState, CITY_PRICE_MODIFIERS, ALLIANCES, STASH_HOUSE_COST, INITIAL_STASH_HOUSE_CAPACITY, STASH_HOUSE_UPKEEP_COST, INVENTORY_UPGRADE_COST_BASE, INVENTORY_UPGRADE_COST_MULTIPLIER, INVENTORY_UPGRADE_AMOUNT, DAILY_BANK_INTEREST_RATE, STASH_HOUSE_UPGRADE_COST_BASE, STASH_HOUSE_UPGRADE_COST_MULTIPLIER, STASH_HOUSE_UPGRADE_AMOUNT, MISSIONS, LOAN_SHARK_CITY, LOAN_AMOUNT, LOAN_INTEREST_RATE, LOAN_REPAY_DAYS } from './constants';
import type { PlayerState, MarketPrices, ActiveGeminiEvent, GeminiEvent, StashHouse, BustEvent, Mission } from './types';
import { fetchEventBatch, fetchBustEvent } from './services/geminiService';
import Header from './components/Header';
import Market from './components/Market';
import Travel from './components/Travel';
import EventLog from './components/EventLog';
import GameOverModal from './components/GameOverModal';
import { SpinnerIcon } from './components/icons/SpinnerIcon';
import PlayerStats from './components/PlayerStats';
import Alliances from './components/Alliances';
import { CANNED_EVENTS } from './cannedEvents';
import StashHouseComponent from './components/StashHouse';
import Upgrades from './components/Upgrades';
import Bank from './components/Bank';
import WelcomeScreen from './components/WelcomeScreen';
import BustModal from './components/BustModal';
import { audioService } from './services/audioService';
import Missions from './components/Missions';
import ActiveMission from './components/ActiveMission';
import LoanShark from './components/LoanShark';
import ConfirmationModal from './components/ConfirmationModal';

const SAVE_GAME_KEY = 'drugWarsSaveData';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<'loading' | 'welcome' | 'playing'>('loading');
  const [day, setDay] = useState<number>(0);
  const [maxDays, setMaxDays] = useState<number>(30);
  const [currentCity, setCurrentCity] = useState<string>('');
  const [player, setPlayer] = useState<PlayerState>(getInitialPlayerState());
  const [marketPrices, setMarketPrices] = useState<MarketPrices>({});
  const [log, setLog] = useState<string[]>([]);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [gameOverMessage, setGameOverMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeEvent, setActiveEvent] = useState<ActiveGeminiEvent | null>(null);
  const [allEvents, setAllEvents] = useState<GeminiEvent[]>([]);
  const [prefetchedEvents, setPrefetchedEvents] = useState<GeminiEvent[]>([]);
  const [isMuted, setIsMuted] = useState<boolean>(audioService.getIsMuted());
  const [isEndGameConfirmOpen, setIsEndGameConfirmOpen] = useState<boolean>(false);

  // Bust state
  const [isBusted, setIsBusted] = useState<boolean>(false);
  const [bustEventDetails, setBustEventDetails] = useState<BustEvent | null>(null);
  const [cashLostInBust, setCashLostInBust] = useState<number>(0);
  const [itemsLostInBust, setItemsLostInBust] = useState<Record<string, number>>({});


  const dayRef = useRef(day);
  useEffect(() => {
    dayRef.current = day;
  }, [day]);

  const isInitialMount = useRef(true);

  const addLogMessage = useCallback((message: string, dayOverride?: number) => {
    const currentDay = dayOverride ?? dayRef.current;
    setLog(prevLog => [`[Day ${currentDay}] ${message}`, ...prevLog].slice(0, 100));
  }, []);

  const generatePrices = useCallback(() => {
    const newPrices: MarketPrices = {};
    for (const city of CITIES) {
      newPrices[city.name] = {};
      for (const item of ITEMS) {
        const cityModifier = CITY_PRICE_MODIFIERS[city.name]?.[item.name] || 1.0;
        const modifiedBasePrice = item.basePrice * cityModifier;
        const priceJitter = (Math.random() - 0.5) * 0.8; // +/- 40%
        const price = Math.round(modifiedBasePrice * (1 + priceJitter));
        newPrices[city.name][item.name] = Math.max(1, price); // Ensure price is at least 1
      }
    }
    return newPrices;
  }, []);

  const applyEvent = useCallback((prices: MarketPrices, event: ActiveGeminiEvent, currentDay: number) => {
    const newPrices = { ...prices };
    const cityPrices = { ...newPrices[event.affectedCity] };
    if (cityPrices && cityPrices[event.affectedItem]) {
      audioService.play('news');
      cityPrices[event.affectedItem] = Math.round(cityPrices[event.affectedItem] * event.priceModifier);
      newPrices[event.affectedCity] = cityPrices;
      addLogMessage(`NEWS: ${event.eventDescription} in ${event.affectedCity}!`, currentDay);
    }
    return newPrices;
  }, [addLogMessage]);

  const startNewGame = (duration: number) => {
    isInitialMount.current = true;
    localStorage.removeItem(SAVE_GAME_KEY);

    // Reset state for a new game
    setIsGameOver(false);
    setGameOverMessage('');
    setIsBusted(false);
    setBustEventDetails(null);
    setCashLostInBust(0);
    setItemsLostInBust({});
    const startingCity = CITIES[Math.floor(Math.random() * (CITIES.length - 3))].name;
    setCurrentCity(startingCity);
    setPlayer(getInitialPlayerState());
    setMarketPrices(generatePrices());
    setLog([]);
    setActiveEvent(null);
    setPrefetchedEvents([]);
    setAllEvents([]);
    addLogMessage('Game started. Good luck.', 1);
    setMaxDays(duration);
    setDay(1);

    setGameState('loading');
    
    const loadEvents = async () => {
        let events: GeminiEvent[] = [];
        try {
            const fetched = await fetchEventBatch(20);
            events = fetched.length > 0 ? fetched : CANNED_EVENTS;
        } catch (error) {
            console.error("Failed to fetch initial events, using canned events:", error);
            events = CANNED_EVENTS;
        }
        setAllEvents(events);
        const shuffled = [...events].sort(() => Math.random() - 0.5);
        setPrefetchedEvents(shuffled);
        setGameState('playing');
    };
    
    loadEvents();
  };

  const advanceDay = useCallback(() => {
    setIsLoading(true);
  
    setTimeout(() => {
      setDay(prevDay => {
        const nextDay = prevDay + 1;
        let isGameOver = false;
        let message = '';
  
        setPlayer(p => {
          const updatedPlayer = { ...p, stashHouses: [...p.stashHouses] };
          
          // Loan logic
          if (updatedPlayer.debt > 0) {
            if (nextDay > LOAN_REPAY_DAYS) {
              isGameOver = true;
              message = "You failed to repay your loan. You're sleeping with the fishes.";
              addLogMessage(`Sharky's collectors found you... It's over.`, nextDay);
            } else {
              const interest = Math.ceil(updatedPlayer.debt * LOAN_INTEREST_RATE);
              updatedPlayer.debt += interest;
              addLogMessage(`You owe Sharky an extra $${interest.toLocaleString()} in interest.`, nextDay);
            }
          }

          if(isGameOver) return updatedPlayer;

          // Stash house upkeep logic
          const stashHouseUpkeep = p.stashHouses.length * STASH_HOUSE_UPKEEP_COST;
          if (stashHouseUpkeep > 0) {
            if (updatedPlayer.cash >= stashHouseUpkeep) {
              updatedPlayer.cash -= stashHouseUpkeep;
              addLogMessage(`Paid $${stashHouseUpkeep.toLocaleString()} in stash house upkeep.`, nextDay);
            } else {
              const forfeitedStashHouse = updatedPlayer.stashHouses.shift();
              if (forfeitedStashHouse) {
                addLogMessage(`You couldn't afford the $${stashHouseUpkeep.toLocaleString()} upkeep! You lost your remaining $${p.cash.toLocaleString()} and a stash house in ${forfeitedStashHouse.city} was forfeit.`, nextDay);
              }
              updatedPlayer.cash = 0;
            }
          }
  
          // Bank interest logic
          const interestEarned = Math.floor(updatedPlayer.bankBalance * DAILY_BANK_INTEREST_RATE);
          if (interestEarned > 0) {
            updatedPlayer.bankBalance += interestEarned;
            addLogMessage(`You earned $${interestEarned.toLocaleString()} in interest from your offshore account.`, nextDay);
          }
  
          return updatedPlayer;
        });

        if (isGameOver) {
          setGameOverMessage(message);
          setIsGameOver(true);
          setIsLoading(false);
          return prevDay;
        }

        if (nextDay > maxDays) {
          setGameOverMessage(`You survived ${maxDays} days of high-stakes trading!`);
          setIsGameOver(true);
          setIsLoading(false);
          return prevDay;
        }
  
        let newPrices = generatePrices();
        let currentEvent = null;
  
        if (activeEvent && nextDay > activeEvent.expiresOnDay) {
          addLogMessage(`The market returns to normal in ${activeEvent.affectedCity}.`, nextDay);
          setActiveEvent(null);
        } else {
          currentEvent = activeEvent;
        }
  
        if (!currentEvent && Math.random() < 0.5 && prefetchedEvents.length > 0) {
          const eventToTrigger = prefetchedEvents[0];
          setPrefetchedEvents(prev => prev.slice(1));
          
          const eventDuration = Math.floor(Math.random() * 3) + 2;
          currentEvent = { ...eventToTrigger, expiresOnDay: nextDay + eventDuration };
          setActiveEvent(currentEvent);
        }
  
        if (currentEvent) {
          newPrices = applyEvent(newPrices, currentEvent, nextDay);
        }
  
        setMarketPrices(newPrices);
        setIsLoading(false);
        return nextDay;
      });
    }, 500);
  }, [generatePrices, activeEvent, prefetchedEvents, applyEvent, addLogMessage, maxDays]);
  
  const handleLoadGame = useCallback(() => {
    const savedData = localStorage.getItem(SAVE_GAME_KEY);
    if (savedData) {
      try {
        const loaded = JSON.parse(savedData);
        setDay(loaded.day ?? 1);
        setCurrentCity(loaded.currentCity ?? CITIES[0].name);
        const loadedPlayer = { ...getInitialPlayerState(), ...(loaded.player ?? {}) };
        setPlayer(loadedPlayer);
        setMarketPrices(loaded.marketPrices ?? generatePrices());
        setLog(loaded.log ?? []);
        setActiveEvent(loaded.activeEvent ?? null);
        setAllEvents(loaded.allEvents ?? []);
        setPrefetchedEvents(loaded.prefetchedEvents ?? []);
        setMaxDays(loaded.maxDays ?? 30);
        addLogMessage(`Game loaded.`, loaded.day ?? 1);
        setGameState('playing');
      } catch (error) {
        console.error("Failed to load saved game:", error);
        localStorage.removeItem(SAVE_GAME_KEY);
        setGameState('welcome');
      }
    } else {
      if (gameState === 'playing') {
        addLogMessage('No saved game found to load.');
      } else {
        setGameState('welcome');
      }
    }
  }, [addLogMessage, generatePrices, gameState]);

  const handleBust = (event: BustEvent) => {
    audioService.play('bust');
    let cashLost = 0;
    const itemsLost: Record<string, number> = {};
    const newInventory = { ...player.inventory };
    let newInventoryUsed = player.inventoryUsed;

    if (event.penaltyType === 'cash' || event.penaltyType === 'both') {
      cashLost = Math.floor(player.cash * event.cashPenaltyPercentage);
    }

    if (event.penaltyType === 'inventory' || event.penaltyType === 'both') {
      for (const itemName in player.inventory) {
        const currentQty = player.inventory[itemName];
        if (currentQty > 0) {
          const lostQty = Math.ceil(currentQty * event.inventoryPenaltyPercentage);
          itemsLost[itemName] = lostQty;
          newInventory[itemName] = currentQty - lostQty;
          newInventoryUsed -= lostQty;
        }
      }
    }

    setPlayer(p => ({
      ...p,
      cash: p.cash - cashLost,
      inventory: newInventory,
      inventoryUsed: newInventoryUsed,
    }));

    setBustEventDetails(event);
    setCashLostInBust(cashLost);
    setItemsLostInBust(itemsLost);
    setIsBusted(true);
    addLogMessage(`BUSTED! ${event.bustDescription} Lost $${cashLost.toLocaleString()}.`);
  };

  const travelTo = async (destination: string) => {
    if (destination === currentCity) return;
    
    setIsLoading(true); // Provide immediate feedback for travel
    audioService.play('travel');

    const destinationCity = CITIES.find(c => c.name === destination);
    const isOverseas = destinationCity?.isOverseas || false;

    // Check for rival and allied territory
    let isInRivalTerritory = false;
    let isAlliedTerritory = false;
    if (player.playerAlliance) {
      const myAlliance = ALLIANCES.find(a => a.name === player.playerAlliance);
      if (myAlliance) {
        // Is it our home turf?
        if (myAlliance.homeCity === destination) {
          isAlliedTerritory = true;
          addLogMessage(`Traveling to the friendly turf of ${myAlliance.name}.`);
        } else {
          // Is it a rival's home turf?
          const rivalAlliance = ALLIANCES.find(a => a.name === myAlliance.rival);
          if (rivalAlliance && rivalAlliance.homeCity === destination) {
            isInRivalTerritory = true;
            addLogMessage(`Traveling into ${rivalAlliance.name} territory... tensions are high.`);
          }
        }
      }
    }
  
    // Bust Check
    const inventoryValue = Object.entries(player.inventory).reduce((acc, [itemName, qty]) => {
        const itemPrice = ITEMS.find(i => i.name === itemName)?.basePrice || 0;
        return acc + (itemPrice * Number(qty));
    }, 0);
    
    const bustEvent = await fetchBustEvent(destination, player.cash, inventoryValue, isOverseas, isInRivalTerritory, isAlliedTerritory);
    
    if (bustEvent) {
      handleBust(bustEvent);
    }
  
    // Regular travel logic
    setCurrentCity(destination);
    addLogMessage(`Traveled to ${destination}.`);
    advanceDay(); // advanceDay will set isLoading to false
  };


  const handleBuy = (itemName: string, quantity: number, price: number) => {
    if (quantity <= 0) return;
    setPlayer(prevPlayer => {
        const cost = quantity * price;
        if (prevPlayer.cash >= cost && (prevPlayer.inventoryUsed + quantity) <= prevPlayer.inventorySpace) {
            audioService.play('buySell');
            return {
                ...prevPlayer,
                cash: prevPlayer.cash - cost,
                inventory: { ...prevPlayer.inventory, [itemName]: (prevPlayer.inventory[itemName] || 0) + quantity },
                inventoryUsed: prevPlayer.inventoryUsed + quantity,
            };
        } else {
            if (prevPlayer.cash < cost) addLogMessage("Not enough cash.");
            else addLogMessage("Not enough inventory space.");
            return prevPlayer;
        }
    });
  };

  const handleSell = (itemName: string, quantity: number, price: number) => {
      if (quantity <= 0) return;
      setPlayer(prevPlayer => {
          const owned = prevPlayer.inventory[itemName] || 0;
          if (owned >= quantity) {
              const earnings = quantity * price;
              audioService.play('buySell');
              return {
                  ...prevPlayer,
                  cash: prevPlayer.cash + earnings,
                  inventory: { ...prevPlayer.inventory, [itemName]: owned - quantity },
                  inventoryUsed: prevPlayer.inventoryUsed - quantity,
              };
          } else {
              addLogMessage("Not enough product to sell.");
              return prevPlayer;
          }
      });
  };
  
  const handleJoinAlliance = (allianceName: string) => {
    const alliance = ALLIANCES.find(a => a.name === allianceName);
    if (!alliance) return;
    if (player.cash >= alliance.joinFee) {
        setPlayer(p => ({ ...p, cash: p.cash - alliance.joinFee, playerAlliance: allianceName }));
        addLogMessage(`Joined the ${allianceName} for $${alliance.joinFee.toLocaleString()}.`);
    } else {
        addLogMessage(`Not enough cash to join the ${allianceName}.`);
    }
  };

  const handleBuyStashHouse = () => {
    if (player.cash >= STASH_HOUSE_COST && !player.stashHouses.some(sh => sh.city === currentCity)) {
        const newStashHouse: StashHouse = {
            city: currentCity,
            capacity: INITIAL_STASH_HOUSE_CAPACITY,
            used: 0,
            contents: ITEMS.reduce((acc, item) => ({ ...acc, [item.name]: 0 }), {}),
            upgradeLevel: 0,
        };
        setPlayer(p => ({ ...p, cash: p.cash - STASH_HOUSE_COST, stashHouses: [...p.stashHouses, newStashHouse] }));
        addLogMessage(`Bought a stash house in ${currentCity} for $${STASH_HOUSE_COST.toLocaleString()}.`);
    } else {
        addLogMessage("Cannot buy stash house: not enough cash or one already exists here.");
    }
  };
  
  const handleMoveToStash = (itemName: string, quantity: number) => {
    const stash = player.stashHouses.find(sh => sh.city === currentCity);
    if (!stash) return;

    if (player.inventory[itemName] >= quantity && (stash.used + quantity) <= stash.capacity) {
        setPlayer(p => {
            const newStashHouses = p.stashHouses.map(sh => sh.city === currentCity ? { ...sh, used: sh.used + quantity, contents: { ...sh.contents, [itemName]: (sh.contents[itemName] || 0) + quantity } } : sh);
            return { ...p, inventory: { ...p.inventory, [itemName]: p.inventory[itemName] - quantity }, inventoryUsed: p.inventoryUsed - quantity, stashHouses: newStashHouses };
        });
    } else {
        addLogMessage("Cannot move to stash. Check inventory or stash capacity.");
    }
  };

  const handleMoveFromStash = (itemName: string, quantity: number) => {
    const stash = player.stashHouses.find(sh => sh.city === currentCity);
    if (!stash || (stash.contents[itemName] || 0) < quantity) return;
  
    if ((player.inventoryUsed + quantity) <= player.inventorySpace) {
      setPlayer(p => {
        const newStashHouses = p.stashHouses.map(sh => sh.city === currentCity ? { ...sh, used: sh.used - quantity, contents: { ...sh.contents, [itemName]: sh.contents[itemName] - quantity } } : sh);
        return { ...p, inventory: { ...p.inventory, [itemName]: (p.inventory[itemName] || 0) + quantity }, inventoryUsed: p.inventoryUsed + quantity, stashHouses: newStashHouses };
      });
    } else {
        addLogMessage("Cannot move from stash. Not enough inventory space.");
    }
  };
  
  const handleUpgradeInventory = () => {
    const upgradeLevel = player.inventoryUpgrades || 0;
    const cost = Math.round(INVENTORY_UPGRADE_COST_BASE * Math.pow(INVENTORY_UPGRADE_COST_MULTIPLIER, upgradeLevel));

    if (player.cash >= cost) {
      const newInventorySpace = player.inventorySpace + INVENTORY_UPGRADE_AMOUNT;
      setPlayer(p => ({ ...p, cash: p.cash - cost, inventorySpace: newInventorySpace, inventoryUpgrades: upgradeLevel + 1 }));
      addLogMessage(`Upgraded inventory space for $${cost.toLocaleString()}. You can now carry ${newInventorySpace} units.`);
    } else {
      addLogMessage(`Not enough cash for inventory upgrade. Need $${cost.toLocaleString()}.`);
    }
  };

  const handleUpgradeStashHouse = () => {
    const stashIndex = player.stashHouses.findIndex(sh => sh.city === currentCity);
    if (stashIndex === -1) {
      addLogMessage("You don't have a stash house here to upgrade.");
      return;
    }

    const stash = player.stashHouses[stashIndex];
    const upgradeCost = Math.round(STASH_HOUSE_UPGRADE_COST_BASE * Math.pow(STASH_HOUSE_UPGRADE_COST_MULTIPLIER, stash.upgradeLevel));

    if (player.cash >= upgradeCost) {
      const newStashHouses = [...player.stashHouses];
      const updatedStash = {
        ...newStashHouses[stashIndex],
        capacity: stash.capacity + STASH_HOUSE_UPGRADE_AMOUNT,
        upgradeLevel: stash.upgradeLevel + 1,
      };
      newStashHouses[stashIndex] = updatedStash;
      
      setPlayer(p => ({
        ...p,
        cash: p.cash - upgradeCost,
        stashHouses: newStashHouses,
      }));
      
      addLogMessage(`Upgraded stash house in ${currentCity} for $${upgradeCost.toLocaleString()}. New capacity: ${updatedStash.capacity}.`);
    } else {
      addLogMessage(`Not enough cash to upgrade stash house. Need $${upgradeCost.toLocaleString()}.`);
    }
  };

  const handleDeposit = (amount: number) => {
    if (amount <= 0 || amount > player.cash) {
      addLogMessage("Invalid deposit amount.");
      return;
    }
    setPlayer(p => ({ ...p, cash: p.cash - amount, bankBalance: p.bankBalance + amount }));
    addLogMessage(`Deposited $${amount.toLocaleString()} into your account.`);
  };

  const handleWithdraw = (amount: number) => {
    if (amount <= 0 || amount > player.bankBalance) {
      addLogMessage("Invalid withdrawal amount.");
      return;
    }
    setPlayer(p => ({ ...p, cash: p.cash + amount, bankBalance: p.bankBalance - amount }));
    addLogMessage(`Withdrew $${amount.toLocaleString()} from your account.`);
  };

  const handleTakeLoan = () => {
    if (player.loanTaken) return;
    setPlayer(p => ({
      ...p,
      cash: p.cash + LOAN_AMOUNT,
      debt: LOAN_AMOUNT,
      loanTaken: true,
    }));
    addLogMessage(`You took a $${LOAN_AMOUNT.toLocaleString()} loan from Sharky. Better pay it back.`);
    audioService.play('buySell');
  };

  const handleRepayLoan = () => {
    if (player.debt <= 0) return;
    if (player.cash >= player.debt) {
      const debtPaid = player.debt;
      setPlayer(p => ({
        ...p,
        cash: p.cash - p.debt,
        debt: 0,
      }));
      addLogMessage(`You paid off your debt of $${debtPaid.toLocaleString()} to Sharky. He's off your back... for now.`);
      audioService.play('buySell');
    } else {
      addLogMessage("You don't have enough cash to repay your debt.");
    }
  };

  const handleReturnToWelcome = useCallback(() => {
    isInitialMount.current = true;
    setIsGameOver(false);
    setGameOverMessage('');
    setIsBusted(false);
    setBustEventDetails(null);
    setCashLostInBust(0);
    setItemsLostInBust({});
    setDay(0);
    setCurrentCity('');
    setPlayer(getInitialPlayerState());
    setMarketPrices({});
    setLog([]);
    setActiveEvent(null);
    setAllEvents([]);
    setPrefetchedEvents([]);
    localStorage.removeItem(SAVE_GAME_KEY);
    setGameState('welcome');
  }, []);

  const handleEndGame = useCallback(() => {
    setIsEndGameConfirmOpen(true);
  }, []);

  const handleSaveGame = useCallback(() => {
    const saveData = { day, currentCity, player, marketPrices, log, activeEvent, allEvents, prefetchedEvents, maxDays };
    localStorage.setItem(SAVE_GAME_KEY, JSON.stringify(saveData));
    addLogMessage(`Game saved.`);
  }, [day, currentCity, player, marketPrices, log, activeEvent, allEvents, prefetchedEvents, addLogMessage, maxDays]);

  const handleStartGameFromWelcome = (duration: number) => {
    audioService.init(); // Initialize audio on first user interaction
    startNewGame(duration);
  };

  const handleToggleMute = () => {
    const muted = audioService.toggleMute();
    setIsMuted(muted);
  };

  const calculateNetWorth = useCallback((p: PlayerState): number => {
    const inventoryValue = Object.entries(p.inventory).reduce((acc, [itemName, qty]) => {
      const itemPrice = ITEMS.find(i => i.name === itemName)?.basePrice || 0;
      return acc + (qty * itemPrice);
    }, 0);

    const stashValue = p.stashHouses.reduce((totalStashValue, house) => {
      const houseValue = Object.entries(house.contents).reduce((acc, [itemName, qty]) => {
        const itemPrice = ITEMS.find(i => i.name === itemName)?.basePrice || 0;
        return acc + (qty * itemPrice);
      }, 0);
      return totalStashValue + houseValue;
    }, 0);

    return p.cash + p.bankBalance + inventoryValue + stashValue - p.debt;
  }, []);

  const handleAcceptMission = (missionId: string) => {
    if (player.activeMissionId) {
        addLogMessage("You already have an active mission.");
        return;
    }
    const mission = MISSIONS.find(m => m.id === missionId);
    if (mission) {
        setPlayer(p => ({ ...p, activeMissionId: missionId }));
        addLogMessage(`New mission accepted: ${mission.title}.`);
        audioService.play('news');
    }
  };

  const handleAbandonMission = () => {
    if (player.activeMissionId) {
        if (window.confirm('Are you sure you want to abandon this mission?')) {
            const mission = MISSIONS.find(m => m.id === player.activeMissionId);
            setPlayer(p => ({ ...p, activeMissionId: null }));
            if (mission) addLogMessage(`Mission abandoned: ${mission.title}.`);
        }
    }
  };

  const handleCompleteMission = () => {
    if (!player.activeMissionId) return;
    const mission = MISSIONS.find(m => m.id === player.activeMissionId);
    if (!mission) return;

    let isComplete = false;
    let newPlayerState = { ...player };

    if (mission.type === 'ACQUIRE_CASH' && mission.targetCash) {
        if (player.cash >= mission.targetCash) {
            isComplete = true;
        }
    }

    if (mission.type === 'DELIVER' && mission.itemName && mission.quantity && mission.destinationCity) {
        const hasItems = (player.inventory[mission.itemName] || 0) >= mission.quantity;
        const inCity = currentCity === mission.destinationCity;
        if (hasItems && inCity) {
            isComplete = true;
            // Remove items from inventory
            newPlayerState.inventory = { ...newPlayerState.inventory, [mission.itemName]: newPlayerState.inventory[mission.itemName] - mission.quantity };
            newPlayerState.inventoryUsed = newPlayerState.inventoryUsed - mission.quantity;
        }
    }

    if (isComplete) {
        audioService.play('buySell');
        newPlayerState.cash += mission.rewardCash;
        newPlayerState.activeMissionId = null;
        newPlayerState.completedMissionIds = [...newPlayerState.completedMissionIds, mission.id];
        
        setPlayer(newPlayerState);
        addLogMessage(`Mission Complete: ${mission.title}. Reward: $${mission.rewardCash.toLocaleString()}.`);
    } else {
        addLogMessage("Mission objectives not met.");
    }
  };

  const activeMission = player.activeMissionId ? MISSIONS.find(m => m.id === player.activeMissionId) || null : null;


  useEffect(() => {
    handleLoadGame();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Auto-save logic
  useEffect(() => {
    // Don't auto-save on the initial render after loading or starting a new game
    if (isInitialMount.current) {
        isInitialMount.current = false;
        return;
    }

    // Auto-save whenever the memoized save function changes, as long as the game is active.
    if (gameState === 'playing' && !isGameOver) {
      handleSaveGame();
    }
  }, [handleSaveGame, gameState, isGameOver]);

  useEffect(() => {
    if (gameState === 'playing' && prefetchedEvents.length < 5 && allEvents.length > 0) {
        const fetchMoreEvents = async () => {
            const moreEvents = await fetchEventBatch(10);
            if (moreEvents.length > 0) {
                setPrefetchedEvents(prev => [...prev, ...moreEvents]);
                setAllEvents(prev => [...prev, ...moreEvents]);
            }
        };
        fetchMoreEvents();
    }
  }, [prefetchedEvents, allEvents, gameState]);

  if (gameState === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white gap-4">
        <SpinnerIcon />
        <p className="text-lg font-semibold">Loading Game Data...</p>
      </div>
    );
  }

  if (gameState === 'welcome') {
    return <WelcomeScreen onStart={handleStartGameFromWelcome} />;
  }

  return (
    <div className="container mx-auto p-4">
      <ConfirmationModal
        isOpen={isEndGameConfirmOpen}
        title="End Game?"
        message="Are you sure you want to end this game? You will return to the main menu and all unsaved progress will be lost."
        confirmText="End Game"
        onConfirm={() => {
          setIsEndGameConfirmOpen(false);
          handleReturnToWelcome();
        }}
        onCancel={() => setIsEndGameConfirmOpen(false)}
      />
      <BustModal
        isOpen={isBusted}
        event={bustEventDetails}
        cashLost={cashLostInBust}
        itemsLost={itemsLostInBust}
        onClose={() => setIsBusted(false)}
      />
      <GameOverModal isOpen={isGameOver} finalScore={calculateNetWorth(player)} onPlayAgain={() => startNewGame(maxDays)} onMainMenu={handleReturnToWelcome} maxDays={maxDays} message={gameOverMessage} />
      <Header 
        day={day} 
        maxDays={maxDays} 
        cash={player.cash} 
        currentCity={currentCity} 
        inventoryUsed={player.inventoryUsed} 
        inventoryMax={player.inventorySpace}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />
      
      <main className={`mt-4 grid grid-cols-1 xl:grid-cols-4 gap-4 ${isLoading || isBusted ? 'opacity-50 pointer-events-none' : ''}`}>
        
        <div className="xl:col-span-2">
          <Market 
            prices={marketPrices[currentCity] || {}} 
            playerInventory={player.inventory}
            onBuy={handleBuy}
            onSell={handleSell}
            playerCash={player.cash}
            inventorySpaceLeft={player.inventorySpace - player.inventoryUsed}
            playerAlliance={player.playerAlliance}
            currentCity={currentCity}
          />
        </div>

        <div className="space-y-4">
          <Alliances
            currentCity={currentCity}
            playerAlliance={player.playerAlliance}
            playerCash={player.cash}
            onJoinAlliance={handleJoinAlliance}
          />
          <Missions
            currentCity={currentCity}
            missions={MISSIONS}
            player={player}
            onAcceptMission={handleAcceptMission}
          />
          <StashHouseComponent 
              player={player}
              currentCity={currentCity}
              onBuyStashHouse={handleBuyStashHouse}
              onMoveToStash={handleMoveToStash}
              onMoveFromStash={handleMoveFromStash}
              onUpgradeStashHouse={handleUpgradeStashHouse}
          />
           <Upgrades
            playerCash={player.cash}
            currentInventorySpace={player.inventorySpace}
            upgradeLevel={player.inventoryUpgrades || 0}
            onUpgradeInventory={handleUpgradeInventory}
          />
          <Bank
            playerCash={player.cash}
            bankBalance={player.bankBalance}
            onDeposit={handleDeposit}
            onWithdraw={handleWithdraw}
          />
          {currentCity === LOAN_SHARK_CITY && (
            <LoanShark 
                player={player}
                onTakeLoan={handleTakeLoan}
                onRepayLoan={handleRepayLoan}
            />
          )}
        </div>

        <div className="space-y-4">
          <ActiveMission
              activeMission={activeMission}
              player={player}
              currentCity={currentCity}
              onCompleteMission={handleCompleteMission}
              onAbandonMission={handleAbandonMission}
          />
          <PlayerStats player={player} netWorth={calculateNetWorth(player)} />
          <Travel cities={CITIES} currentCity={currentCity} onTravel={travelTo} isLoading={isLoading} />
          <EventLog messages={log} />
           <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg p-4 grid grid-cols-2 gap-2">
            <button onClick={handleSaveGame} className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-500 transition-colors duration-200">Save Game</button>
            <button onClick={handleLoadGame} className="w-full bg-gray-600 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-500 transition-colors duration-200">Load Game</button>
            <button onClick={() => {
              if (window.confirm('Are you sure you want to reset the game? This will start a new game immediately and all saved progress will be lost.')) {
                startNewGame(maxDays);
              }
            }} className="w-full bg-orange-600 text-white font-bold py-2 px-4 rounded-md hover:bg-orange-500 transition-colors duration-200">Reset Game</button>
            <button onClick={handleEndGame} className="w-full bg-red-700 text-white font-bold py-2 px-4 rounded-md hover:bg-red-600 transition-colors duration-200">End Game</button>
          </div>
        </div>

      </main>
    </div>
  );
};

export default App;
