import "dotenv/config";
import {
  createBot,
  createProvider,
  createFlow,
  addKeyword,
  utils,
  EVENTS,
} from "@builderbot/bot";
import { MemoryDB as Database } from "@builderbot/bot";
import { BaileysProvider as Provider } from "@builderbot/provider-baileys";
import { toAskGemini } from "./ai/gemini";
import { join } from "path";
import { fromAudioToText } from "./ai/groq";
import ffmpeg from "fluent-ffmpeg";
// import { toAudio } from "./ai/elevenlab";
import fs from "fs";

const PORT = process.env.PORT ?? 3008;

/** ¿Cual es la funcionalidad del este fljo?
 *  la funcionalidad es que el bot salude al usuario cuando este en el chat
 *  escribe un mensaje hi, hello, hola, etc.
 *  y el bot responda con un mensaje de bienvenida
 *
 */
const welcomeFlow = addKeyword<Provider, Database>(EVENTS.WELCOME).addAction(
  async (ctx, { flowDynamic }) => {
    const message = ctx.body;
    const italianMessages = await toAskGemini(message, []);
    await flowDynamic(italianMessages);
  }
);

const voiceFlow = addKeyword<Provider, Database>(EVENTS.VOICE_NOTE).addAction(
  async (ctx, { flowDynamic, provider }) => {
    try {
      const dir = "./storage";

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
      const storagePath = join(process.cwd(), "storage");

      const ogaFilePath = await provider.saveFile(ctx, {
        path: storagePath,
      });

      // Crear el nombre del archivo WAV
      const wavFilePath = ogaFilePath.replace(".oga", ".wav");

      // Convertir OGA a WAV usando ffmpeg
      await new Promise((resolve, reject) => {
        ffmpeg(ogaFilePath)
          .toFormat("wav")
          .on("end", () => {
            console.log("Conversión completada");
            resolve(true);
          })
          .on("error", (err: Error) => {
            console.error("Error en la conversión:", err);
            reject(err);
          })
          .save(wavFilePath);
      });

      console.log("Archivo convertido exitosamente:", wavFilePath);

      // Procesar el audio
      const transcription = await fromAudioToText(wavFilePath);
      const responseIA = await toAskGemini(transcription, []);
      await flowDynamic(responseIA);
    } catch (error) {
      console.error("Error en el procesamiento de audio:", error);
      await flowDynamic([
        { body: "Lo siento, hubo un error procesando el audio." },
      ]);
    }
  }
);

/**
 * La funcion principal!
 */
const main = async () => {
  const adapterFlow = createFlow([welcomeFlow, voiceFlow]);
  const adapterProvider = createProvider(Provider);
  const adapterDB = new Database();

  const { handleCtx, httpServer } = await createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  });

  adapterProvider.server.post(
    "/v1/messages",
    handleCtx(async (bot, req, res) => {
      const { number, message, urlMedia } = req.body;
      await bot.sendMessage(number, message, { media: urlMedia ?? null });
      return res.end("sended");
    })
  );

  httpServer(+PORT);
};

main();
