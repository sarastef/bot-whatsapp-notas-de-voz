import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: "Actua como un traductor, tu proposito es devolverme todo el texto en italiano:",
});

const generationConfig = {
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
};

/**
 * esta funcion debe ser llamada cunado se ejecute el flujo de la palabra clave!
 */
export async function toAskGemini(message: string, history: { role: string, parts: { text: string }[] }[]) {
    const chatSession = model.startChat({
        generationConfig,
        history,
    });

    const result = await chatSession.sendMessage(message);
    const italian = result.response.text()
    console.log(`>>>>>>>>>> ${italian}`);
    return italian
}

