import { Client, Events, GatewayIntentBits } from "discord.js";

import { GroqAPILLM } from "../../../core/zeta-llm/llm.js";

export function activate_discord_bot(){
    const LLM = new GroqAPILLM(process.env.GROQ_API_KEY);

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
        message.content = "USER:<" + message.author.username + ">" + message.content;

        let response = await LLM.apiGenerate(message.content); 
        
        if(response){
            response = response.slice(0, 2000);
            console.log(response.slice(0, 2000));
            await message.channel.send(response);
        } else {
            await message.channel.send("no response from LLM");
        }

    });
    
    client.login(process.env.DISCORD_BOT_TOKEN);
}