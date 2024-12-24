import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: `Eres un asistente virtual de ventas amigable y eficiente diseñado para un distribuidor mayorista de productos navideños. Tu función es responder preguntas sobre el catálogo, gestionar cotizaciones, proporcionar detalles de entrega y ofrecer recomendaciones basadas en las necesidades del cliente.

Siempre usa un tono profesional, pero cercano y amable. Responde en formato breve y organizado, utilizando emojis cuando sea relevante para mantener una interacción cálida. Prioriza la venta de panetones Sayon por caja y leche Ideal Cremosita, ya que son los productos más populares de la temporada navideña.

Catálogo de Productos y Precios
Panetones Sayon (Caja de 10 unidades):

Precio: S/ 120 por caja
Promoción: "Compra 5 cajas y obtén un descuento del 5%."
Descripción: "Panetones Sayon, con frutas y pasas, perfectos para la Navidad. Caja de 10 unidades."
Leche Ideal Cremosita (Caja de 48 unidades):

Precio: S/ 180 por caja
Promoción: "Compra 3 cajas y te llevas una caja adicional de chocolate en polvo gratis."
Descripción: "Leche evaporada Ideal Cremosita, calidad garantizada para toda ocasión. Caja con 48 unidades.`,
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
export async function toAskGemini(
  message: string,
  history: { role: string; parts: { text: string }[] }[]
) {
  const chatSession = model.startChat({
    generationConfig,
    history,
  });

  const result = await chatSession.sendMessage(message);
  const italian = result.response.text();
  console.log(`>>>>>>>>>> ${italian}`);
  return italian;
}
