import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const detectDisease = async (base64Image: string, language: string = 'en') => {
  const model = "gemini-3-flash-preview";
  const langText = language === 'hi' ? 'Hindi' : language === 'te' ? 'Telugu' : 'English';
  
  const prompt = `You are an expert plant pathologist. Analyze this plant leaf image and detect any diseases. 
  Provide the result in ${langText}.
  Provide the result in JSON format with the following fields:
  - diseaseName: Name of the disease (or "Healthy" if no disease)
  - severity: "Low" | "Moderate" | "High"
  - recommendation: Recommended treatment and pesticides
  - confidence: Confidence score (0-1)`;

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image
            }
          }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          diseaseName: { type: Type.STRING },
          severity: { type: Type.STRING, enum: ['Low', 'Moderate', 'High'] },
          recommendation: { type: Type.STRING },
          confidence: { type: Type.NUMBER }
        },
        required: ["diseaseName", "severity", "recommendation", "confidence"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

export const analyzeWeeds = async (base64Image: string, language: string = 'en') => {
  const model = "gemini-2.5-flash-preview";
  const langText = language === 'hi' ? 'Hindi' : language === 'te' ? 'Telugu' : 'English';

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: "image/jpeg",
            },
          },
          {
            text: `Detect weeds in this crop field image. 
            Provide the result in ${langText}.
            Return JSON with:
            - totalWeeds: number
            - suggestedAction: "Manual removal" | "Use targeted herbicide"
            - weeds: array of objects with { label: string, box_2d: [ymin, xmin, ymax, xmax] }`,
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          totalWeeds: { type: Type.NUMBER },
          suggestedAction: { type: Type.STRING },
          weeds: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                box_2d: {
                  type: Type.ARRAY,
                  items: { type: Type.NUMBER }
                }
              },
              required: ['label', 'box_2d']
            }
          }
        },
        required: ['totalWeeds', 'suggestedAction', 'weeds']
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

export const getFertilizerRecommendation = async (cropName: string, soilType: string, region: string) => {
  const model = "gemini-3-flash-preview";
  const prompt = `Provide fertilizer and pesticide recommendations for ${cropName} grown in ${soilType} soil in ${region}, India.
  Include:
  - Recommended Fertilizers
  - Recommended Pesticides
  - Application Schedule
  - Safety Instructions`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction: "You are a professional agricultural advisor specializing in Indian farming."
    }
  });

  return response.text;
};

export const getAdvisoryAlerts = async (region: string) => {
  const model = "gemini-3-flash-preview";
  const prompt = `Provide current agricultural advisory alerts for farmers in ${region}, India. 
  Consider seasonal factors, common pests, and market trends.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt
  });

  return response.text;
};

export const analyzeCropHealth = async (base64Image: string, voiceNotes: string, language: string) => {
  const model = "gemini-3.1-pro-preview";
  const langText = language === 'hi' ? 'Hindi' : language === 'te' ? 'Telugu' : 'English';
  
  const prompt = `You are an expert agricultural assistant. Analyze this crop image carefully.
  Additional context from the farmer (voice notes): "${voiceNotes}"
  
  IMPORTANT: Provide the response in ${langText}.
  
  Provide:
  1. Crop/plant name
  2. Plant health condition (MUST be exactly "Healthy" or "Unhealthy" in English for the logic to work)
  3. Possible disease or pest infection
  4. Visible symptoms
  5. Possible cause of the problem
  6. Recommended treatment (organic and chemical solutions)
  7. Preventive measures farmers can take`;

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image
            }
          }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          plantName: { type: Type.STRING },
          healthStatus: { 
            type: Type.STRING,
            enum: ['Healthy', 'Unhealthy']
          },
          disease: { type: Type.STRING, nullable: true },
          symptoms: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          cause: { type: Type.STRING, nullable: true },
          treatment: {
            type: Type.OBJECT,
            properties: {
              organic: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              chemical: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ['organic', 'chemical']
          },
          prevention: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ['plantName', 'healthStatus', 'disease', 'symptoms', 'cause', 'treatment', 'prevention']
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

export const recommendCrops = async (location: string, soilType: string, season: string, language: string = 'en') => {
  const model = "gemini-3-flash-preview";
  const langText = language === 'hi' ? 'Hindi' : language === 'te' ? 'Telugu' : 'English';

  const prompt = `Recommend the top 5 crops to grow in ${location}, India, with ${soilType} soil during the ${season} season.
  Provide the result in ${langText}.
  Return JSON with an array of objects:
  - name: string
  - reason: string (why it's suitable)
  - expectedYield: string
  - duration: string`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            reason: { type: Type.STRING },
            expectedYield: { type: Type.STRING },
            duration: { type: Type.STRING }
          },
          required: ["name", "reason", "expectedYield", "duration"]
        }
      }
    }
  });

  return JSON.parse(response.text || '[]');
};

export const analyzeCropHealthExpert = async (input: { image?: string, description?: string }, language: string = 'en') => {
  const model = "gemini-3-flash-preview";
  const langText = language === 'hi' ? 'Hindi' : language === 'te' ? 'Telugu' : 'English';
  
  const prompt = `You are a helpful agricultural assistant. Your job is to help farmers understand crop problems in very simple language.
  Analyze the following crop input (image and/or description).
  
  Input Description: ${input.description || 'No description provided.'}
  
  Your response MUST be in ${langText} and follow this JSON structure:
  {
    "cropName": "Name of the crop",
    "problem": "Clearly say what the issue is (e.g., calcium deficiency, disease, pest)",
    "explanation": "Explain what is happening to the plant in very simple words (no technical language)",
    "fertilizerRecommendation": {
      "name": "Name of easy-to-find fertilizer or medicine",
      "mixing": "How much to mix (e.g., 2 grams per liter water)",
      "usage": "How to use (spray or soil)",
      "frequency": "How often to use"
    },
    "careTips": {
      "watering": "Simple watering advice",
      "maintenance": "Advice on removing damaged parts",
      "prevention": "Basic tip to prevent this in the future"
    },
    "confidence": 85
  }
  
  Rules:
  - Use very simple English (like talking to a farmer).
  - Keep sentences short.
  - Avoid scientific or difficult words.
  - Give practical, real-world advice.
  - If the problem is nutrient-related, focus on fertilizers.
  - If a disease is present, suggest medicine (fungicide/pesticide).`;

  const contents: any[] = [{ text: prompt }];
  if (input.image) {
    contents.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: input.image
      }
    });
  }

  const response = await ai.models.generateContent({
    model,
    contents: [{ parts: contents }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          cropName: { type: Type.STRING },
          problem: { type: Type.STRING },
          explanation: { type: Type.STRING },
          fertilizerRecommendation: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              mixing: { type: Type.STRING },
              usage: { type: Type.STRING },
              frequency: { type: Type.STRING }
            },
            required: ["name", "mixing", "usage", "frequency"]
          },
          careTips: {
            type: Type.OBJECT,
            properties: {
              watering: { type: Type.STRING },
              maintenance: { type: Type.STRING },
              prevention: { type: Type.STRING }
            },
            required: ["watering", "maintenance", "prevention"]
          },
          confidence: { type: Type.NUMBER }
        },
        required: ["cropName", "problem", "explanation", "fertilizerRecommendation", "careTips", "confidence"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

export const chatWithAssistant = async (message: string, history: any[]) => {
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: "You are AgroVision Assistant, a helpful AI for Indian farmers. You can provide advice on crops, diseases, weather, and market prices. You speak English, Hindi, and Telugu."
    }
  });

  const response = await chat.sendMessage({ message });
  return response.text;
};
