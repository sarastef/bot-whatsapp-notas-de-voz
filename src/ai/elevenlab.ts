import { ElevenLabsClient } from "elevenlabs";
import { createWriteStream } from 'fs';
import { join } from 'path';

const client = new ElevenLabsClient({
    apiKey: process.env.ELEVENLABS_API_KEY
});


export async function toAudio(message: string): Promise<string> {

    const VOICE_ID = "UXzM1LjcOrwxPa73s9Va"

    const response = await client.textToSpeech.convert(VOICE_ID, {
        output_format: "mp3_44100_128",
        text: message,
        model_id: "eleven_multilingual_v2"
    });

    // Crear un nombre de archivo único usando timestamp
    const fileName = `audio_${Date.now()}.mp3`;
    const filePath = join(process.cwd(), 'storage', fileName);

    // Crear un write stream y guardar el audio
    const writeStream = createWriteStream(filePath);
    response.pipe(writeStream);

    // Retornar una promesa que se resuelve cuando se complete la escritura
    return new Promise((resolve, reject) => {
        writeStream.on('finish', () => resolve(filePath));
        writeStream.on('error', reject);
    });

}
