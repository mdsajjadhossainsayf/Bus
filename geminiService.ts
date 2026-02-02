
import { GoogleGenAI, Type } from "@google/genai";

export const getAIBusSuggestions = async (from: string, to: string, lang: 'bn' | 'en') => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const languagePrompt = lang === 'bn' ? 'Bengali' : 'English';
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide public bus suggestions from "${from}" to "${to}". 
      
      STRICT REQUIREMENTS:
      1. ONLY include buses that definitely reach the destination "${to}".
      2. For each bus, identify its absolute starting point and absolute ending point.
      3. All text fields MUST be in ${languagePrompt}.
      
      Return JSON with: from, to, suggestedBuses (array of {name, startPoint, endPoint}), distance, estimatedFare, travelTime, tips.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            from: { type: Type.STRING },
            to: { type: Type.STRING },
            suggestedBuses: { 
              type: Type.ARRAY,
              items: { 
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  startPoint: { type: Type.STRING },
                  endPoint: { type: Type.STRING }
                }
              }
            },
            distance: { type: Type.STRING },
            estimatedFare: { type: Type.STRING },
            travelTime: { type: Type.STRING },
            tips: { type: Type.STRING }
          }
        }
      }
    });

    const responseText = response.text?.trim(); // Safely access .text and trim
    if (responseText) {
      return JSON.parse(responseText);
    } else {
      console.warn("Gemini API returned no text content.");
      return null;
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
};