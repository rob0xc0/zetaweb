import { EdgeTTS } from '@andresaya/edge-tts';
import { createWriteStream } from 'fs';

async function streamingExample() {
    const tts = new EdgeTTS();
    const writeStream = createWriteStream('streaming_output.mp3');
    
    const longText = "This is a very long text that will be streamed...";
    
    for await (const chunk of tts.synthesizeStream(longText, 'en-US-AriaNeural')) {
        writeStream.write(chunk);
        console.log(`Streamed ${chunk.length} bytes`);
    }
    
    writeStream.end();
    console.log('Streaming completed!');
}

streamingExample().catch(console.error);