
import { GoogleGenAI, Type } from "@google/genai";
import { GatePass, Item } from "../types";

// Assume process.env.API_KEY is configured in the environment
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const generateReminderMessage = async (gatePass: GatePass, item: Item): Promise<string> => {
  if (!API_KEY) {
    return "AI Service is not available. Please configure the API Key.";
  }

  const model = 'gemini-2.5-flash';

  const dueDate = gatePass.expectedReturnDate ? new Date(gatePass.expectedReturnDate).toLocaleDateString('en-US') : 'N/A';

  const prompt = `
    Please write a polite but firm reminder message in English for an overdue item for an internal corporate system.
    The message must start by addressing the requester as "Dear Sir ${gatePass.requesterName}".
    
    Incorporate the following details into the message body:
    - Item Name: ${item.name}
    - Gate Pass No: ${gatePass.gatePassNo}
    - Department: ${gatePass.department}
    - Original Due Date: ${dueDate}
    
    The tone should be professional and aimed at ensuring the prompt return of company property.
    Do not add any other greetings or sign-offs. The entire output should be just the core message.
  `;

  try {
    const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error generating reminder message:", error);
    return "Sorry, the reminder could not be generated at this time.";
  }
};

interface OverdueSummaryData {
  gatePassNo: string;
  itemName: string;
  requesterName: string;
  department: string;
  dueDate: string;
}

export const generateOverdueSummaryReport = async (itemCount: number, sampleItems: OverdueSummaryData[]): Promise<string> => {
  if (!API_KEY) {
    return "AI Service is not available. Please configure the API Key.";
  }
  const model = 'gemini-2.5-flash';
  
  const prompt = `
    Analyze the following situation regarding overdue and pending returnable items for a company.
    There are a total of ${itemCount} items pending return. Here are a few examples to provide context:
    ${JSON.stringify(sampleItems, null, 2)}

    Please generate a professional summary paragraph in English, addressed to management. 
    The summary should state the total number of pending items and politely urge for necessary action to ensure company assets are returned promptly.
    The tone should be formal and concise. Do not include any greetings or sign-offs, just the main paragraph.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    return response.text.trim();

  } catch (error) {
    console.error("Error generating summary report:", error);
    return "Sorry, the summary could not be generated at this time.";
  }
};
