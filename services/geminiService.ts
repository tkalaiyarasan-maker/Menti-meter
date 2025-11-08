
import { GoogleGenAI, Type } from "@google/genai";

if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const pollSchema = {
  type: Type.OBJECT,
  properties: {
    question: {
      type: Type.STRING,
      description: "The poll question.",
    },
    options: {
      type: Type.ARRAY,
      description: "An array of 4-6 strings, each being a plausible option for the poll.",
      items: {
        type: Type.STRING,
      },
    },
  },
  required: ["question", "options"],
};

export const generatePollFromTopic = async (topic: string): Promise<{ question: string; options: string[] }> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a fun and engaging multiple-choice poll question about the following topic: "${topic}". Provide between 4 and 6 plausible options.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: pollSchema,
      },
    });

    const text = response.text.trim();
    const pollData = JSON.parse(text);

    if (
      !pollData.question ||
      !Array.isArray(pollData.options) ||
      pollData.options.length < 2
    ) {
      throw new Error("Invalid format received from Gemini API.");
    }

    return {
      question: pollData.question,
      options: pollData.options,
    };
  } catch (error) {
    console.error("Error generating poll with Gemini:", error);
    throw new Error("Failed to generate poll. The API may be unavailable or the API key is invalid.");
  }
};
