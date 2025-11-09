import { GoogleGenAI, Type } from '@google/genai';
import { ITEMS, CITIES } from '../constants';
import type { GeminiEvent, BustEvent } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const eventGenerationSchema = {
  type: Type.OBJECT,
  properties: {
    eventDescription: {
      type: Type.STRING,
      description: 'A short, flavorful description of the market event.'
    },
    affectedItem: {
      type: Type.STRING,
      enum: ITEMS.map(i => i.name),
      description: 'The item whose price is affected.'
    },
    priceModifier: {
      type: Type.NUMBER,
      description: 'The multiplier for the price change. e.g., 1.5 for a 50% increase, 0.5 for a 50% decrease. Must be between 0.2 and 3.0.'
    },
    affectedCity: {
      type: Type.STRING,
      enum: CITIES.map(c => c.name),
      description: 'The city where the event occurs.'
    }
  },
  required: ['eventDescription', 'affectedItem', 'priceModifier', 'affectedCity']
};

const eventBatchGenerationSchema = {
  type: Type.ARRAY,
  items: eventGenerationSchema,
};

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 1000;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchEventBatch = async (count: number): Promise<GeminiEvent[]> => {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const itemNames = ITEMS.map(i => i.name).join(', ');
      const cityNames = CITIES.map(c => c.name).join(', ');

      const prompt = `
      You are a market simulation AI for a "dope wars" style trading game.
      Generate an array of ${count} unique, random market events.
      Each event must impact the price of ONE specific item in ONE specific city.
      Each event description should be brief and flavorful, fitting a gritty, urban crime theme. For example "The Feds just did a massive bust" or "A new shipment just arrived".
      The price modifier must be between 0.2 (an 80% drop) and 3.0 (a 200% increase).
      Do not generate events that make an item free or ridiculously expensive. Keep it plausible for a game.
      
      Available items: ${itemNames}
      Available cities: ${cityNames}

      Provide your response as a JSON array of objects, where each object matches the required event schema.
    `;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: eventBatchGenerationSchema,
        },
      });

      const eventJson = response.text;
      let parsedEvents: GeminiEvent[];
      try {
        parsedEvents = JSON.parse(eventJson);
      } catch (parseError) {
        console.error("Failed to parse Gemini response as JSON:", eventJson, parseError);
        break; // Don't retry on a parse error
      }


      // Validate and filter events to ensure they match the expected structure
      const validEvents = parsedEvents.filter(event => 
        event &&
        typeof event.eventDescription === 'string' &&
        typeof event.affectedItem === 'string' &&
        typeof event.affectedCity === 'string' &&
        typeof event.priceModifier === 'number' &&
        !isNaN(event.priceModifier)
      );

      // Clamp modifiers for all valid events
      return validEvents.map(event => ({
        ...event,
        priceModifier: Math.max(0.2, Math.min(3.0, event.priceModifier)),
      }));

    } catch (error) {
      const errorString = JSON.stringify(error);
      const isRateLimitError = errorString.includes('429') || errorString.includes('RESOURCE_EXHAUSTED');

      if (isRateLimitError && attempt < MAX_RETRIES - 1) {
        const delay = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt);
        console.warn(`Gemini API rate limit exceeded during batch fetch. Retrying in ${delay / 1000}s...`);
        await sleep(delay);
      } else {
        if (isRateLimitError) {
          console.error(`Gemini API rate limit still exceeded after ${MAX_RETRIES} attempts during batch fetch. Proceeding without special events.`, error);
        } else {
          console.error("An unexpected error occurred while fetching event batch from Gemini:", error);
        }
        break; // Break the loop on non-retryable error or final failed attempt
      }
    }
  }
  
  // Fallback if all retries fail or a non-retryable error occurs
  console.log("Falling back to an empty event batch.");
  return [];
};


export const fetchBustEvent = async (cityName: string, playerCash: number, inventoryValue: number, isOverseas: boolean, isInRivalTerritory: boolean, isAlliedTerritory: boolean): Promise<BustEvent | null> => {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const travelRiskPrompt = isOverseas
        ? `This is an international trip. The chance of a bust event should be higher than domestic travel, around 10-15%.`
        : `This is a domestic trip. There is a standard, low chance of a bust event occurring.`;

      let allianceContextPrompt = '';
      if (isAlliedTerritory) {
        allianceContextPrompt = `The player is in a friendly city, home to their alliance. This should provide protection. The chance of a bust should be very low (1-2%). If a bust happens, it should be a minor inconvenience with light penalties. The description should reflect this, e.g., "A local cop on your ally's payroll had to make a show of shaking you down for a 'donation'." or "Your allies smoothed things over, but it cost you a little something."`;
      } else if (isInRivalTerritory) {
        allianceContextPrompt = `CRITICAL: The player is in the home city of a powerful rival faction. This makes the trip exceptionally dangerous. The chance of a bust, ambush, or setup should be high, around 20-25%. The bust description should reflect this, e.g., "You walked right into an ambush set up by your rivals!" or "A tip-off from a rival informant led the cops right to you." The penalty should also be severe.`;
      } else {
        allianceContextPrompt = `The player is in neutral territory. The risk is standard and low (around 3-7%).`;
      }

      const prompt = `
      You are a risk simulation AI for a "dope wars" style trading game.
      The player is traveling to ${cityName}. Their current cash is $${playerCash} and their inventory is worth roughly $${inventoryValue}.
      ${travelRiskPrompt}
      ${allianceContextPrompt}

      If you decide no bust occurs, the "bust" property in your response should be null.
      
      If a bust occurs, provide a JSON object for the "bust" property with the following structure:
      - "bustDescription": A short, flavorful description of how the player got caught, fitting the context (ally, rival, or neutral territory).
      - "penaltyType": The type of penalty. Can be 'cash', 'inventory', or 'both'.
      - "cashPenaltyPercentage": A number between 0.1 (10%) and 0.5 (50%). This is the percentage of cash to be fined. Only relevant if penaltyType is 'cash' or 'both'.
      - "inventoryPenaltyPercentage": A number between 0.2 (20%) and 1.0 (100%). This is the percentage of inventory to be confiscated. Only relevant if penaltyType is 'inventory' or 'both'.

      The severity of the penalty MUST be related to the risk of the trip (allied city = low penalty, rival city = high penalty, neutral = medium penalty).
      Return a valid JSON object matching the schema.
      `;

      const bustGenerationSchema = {
        type: Type.OBJECT,
        properties: {
          bustDescription: { type: Type.STRING },
          penaltyType: { type: Type.STRING, enum: ['cash', 'inventory', 'both'] },
          cashPenaltyPercentage: { type: Type.NUMBER },
          inventoryPenaltyPercentage: { type: Type.NUMBER },
        },
        required: ['bustDescription', 'penaltyType']
      };

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
                bust: {
                    oneOf: [
                        bustGenerationSchema,
                        { type: Type.NULL }
                    ],
                    description: "The bust event object, or null if no bust occurs."
                }
            },
          },
        },
      });
      
      const responseJson = response.text;
      let parsed: { bust: BustEvent | null };

      try {
        parsed = JSON.parse(responseJson);
      } catch(parseError) {
        console.error("Failed to parse Gemini bust event response as JSON:", responseJson, parseError);
        break; // Don't retry on a parse error
      }
      
      if (!parsed || typeof parsed !== 'object' || !('bust' in parsed)) {
        console.error("Invalid bust event structure from Gemini:", responseJson);
        break; // Don't retry on invalid structure
      }

      if (parsed.bust === null) {
          return null; // No bust event occurred
      }
      
      if (typeof parsed.bust !== 'object' || !parsed.bust.penaltyType || !parsed.bust.bustDescription) {
        console.error("Invalid/incomplete bust event from Gemini:", parsed.bust);
        return null; // Treat as no bust
      }

      const bust = parsed.bust as BustEvent;

      if (bust.penaltyType === 'cash' || bust.penaltyType === 'both') {
        bust.cashPenaltyPercentage = Math.max(0.1, Math.min(0.5, bust.cashPenaltyPercentage ?? 0.1));
      } else {
        bust.cashPenaltyPercentage = 0;
      }
      if (bust.penaltyType === 'inventory' || bust.penaltyType === 'both') {
        bust.inventoryPenaltyPercentage = Math.max(0.2, Math.min(1.0, bust.inventoryPenaltyPercentage ?? 0.2));
      } else {
        bust.inventoryPenaltyPercentage = 0;
      }

      return bust;

    } catch (error) {
       const errorString = JSON.stringify(error);
      const isRateLimitError = errorString.includes('429') || errorString.includes('RESOURCE_EXHAUSTED');

      if (isRateLimitError && attempt < MAX_RETRIES - 1) {
        const delay = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt);
        console.warn(`Gemini API rate limit exceeded during bust fetch. Retrying in ${delay / 1000}s...`);
        await sleep(delay);
      } else {
        if (isRateLimitError) {
          console.error(`Gemini API rate limit still exceeded after ${MAX_RETRIES} attempts during bust fetch.`, error);
        } else {
          console.error("An unexpected error occurred while fetching bust event from Gemini:", error);
        }
        break;
      }
    }
  }
  return null;
};
