import { GoogleGenAI, Type } from "@google/genai";

// Fix: Per coding guidelines, initialize GoogleGenAI with process.env.API_KEY.
// This also resolves the TypeScript error on import.meta.env.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const presentationSchema = {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: "A short, engaging title for the entire presentation or poll session, related to the topic."
      },
      questions: {
        type: Type.ARRAY,
        description: "An array of 2-5 multiple-choice poll questions related to the topic.",
        items: {
          type: Type.OBJECT,
          properties: {
            question: {
              type: Type.STRING,
              description: "The poll question.",
            },
            options: {
              type: Type.ARRAY,
              description: "An array of 3-5 strings, each being a plausible option for the poll.",
              items: {
                type: Type.STRING,
              },
            },
          },
          required: ["question", "options"],
        }
      }
    },
    required: ["title", "questions"],
};

export const generatePresentationFromTopic = async (topic: string): Promise<{ title: string; questions: { question: string; options: string[] }[] }> => {
  // Fix: Per coding guidelines, API key availability is assumed. Removed explicit key check.
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a fun and engaging presentation with multiple-choice poll questions about the following topic: "${topic}". The presentation should have a title and between 2 and 5 questions. Each question should have between 3 and 5 plausible options.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: presentationSchema,
      },
    });

    const text = response.text.trim();
    const presentationData = JSON.parse(text);

    if (
      !presentationData.title ||
      !Array.isArray(presentationData.questions) ||
      presentationData.questions.length === 0 ||
      !presentationData.questions[0].question ||
      !Array.isArray(presentationData.questions[0].options)
    ) {
      throw new Error("Invalid format received from Gemini API.");
    }

    return presentationData;
  } catch (error) {
    console.error("Error generating presentation with Gemini:", error);
    throw new Error("Failed to generate presentation. The API may be unavailable or the API key is invalid.");
  }
};
