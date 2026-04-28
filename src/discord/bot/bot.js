import { Client, Events, GatewayIntentBits } from "discord.js";
import { config } from "dotenv";
config()

import { GroqLLMModels } from "../../brain/llm.js";
import { GroqAPILLM } from "../../brain/llm.js";

const LLM = new GroqAPILLM(process.env.GROQ_API_KEY, GroqLLMModels.LLAMA_70B);

export function activate_discord_bot(){
    const client = new Client({ 
        intents: [
            GatewayIntentBits.MessageContent, 
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.Guilds
        ]
    });

    client.once(Events.ClientReady, (client) => {
        console.log(`Logged in as ${client.user.tag}`);
    });

    client.on(Events.MessageCreate, async (message) => {
        if(!message.content || message.content[0] != ";" || message.author.bot) return;
        console.log(message.content);
        let response = await LLM.generate(message.content);
        response = response.slice(0, 2000);
        console.log(response.slice(0, 2000));
        if(response){
            await message.channel.send(response);
        } else {
            await message.channel.send("uhm");
        }
    });
    
    client.login(process.env.DISCORD_BOT_TOKEN);
}