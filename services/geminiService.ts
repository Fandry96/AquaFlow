import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY not found in environment variables");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateInspirationPrompt = async (): Promise<string> => {
  const ai = getClient();
  if (!ai) return "Paint a calm blue ocean at sunset.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Generate a short, evocative, artistic painting prompt for a watercolor artist. Keep it under 20 words. Example: 'A lonely lighthouse amidst stormy crashing waves.'",
    });
    return response.text.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "A mysterious forest path in autumn.";
  }
};

export const generateReferenceImage = async (prompt: string): Promise<string | null> => {
   const ai = getClient();
   if (!ai) return null;

   try {
     const response = await ai.models.generateContent({
       model: 'gemini-2.5-flash-image',
       contents: {
         parts: [{ text: `Watercolor painting reference of: ${prompt}` }]
       },
     });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
   } catch (error) {
     console.error("Gemini Image Gen Error:", error);
     return null;
   }
};
