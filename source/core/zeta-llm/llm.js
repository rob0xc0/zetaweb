import { readFile } from "node:fs/promises";
import llmConfig from "./../../config/llm-config.json" with { type: "json"};
import path from "path";

const personality = await readFile(path.join(import.meta.dirname, "./../../config/llm-personality.txt"), { encoding: "utf-8" });


//dont include memory inside this, since groqapi can just be one of many LLM sources-
export class GroqAPILLM {
    constructor(apiKey, model=llmConfig.groqModel){
        this.apiKey = apiKey;
        this.model = model;
        this.commands = {
            test: function ({ input }){
                console.log(input);
                return input;
            }
        }

        this.commands_schema = [
            {
                type: "function",
                function: {
                    name: "test",
                    description: "test function that only activates if user mentions test. It takes the user's input text into the this function's input variable, 1 to 1 copy",
                    parameters: {
                        type: "object",
                        properties: {
                            input: { type: "string" }
                        },
                        required: ["input"], 
                        additionalProperties: false
                    },
                    strict: true
                }
            }
        ]

        this.memory = [];
        this.personality = personality;

        //if(!this.apiKey) throw new Error("LLM api key is undefined");
    }

    async apiGenerate(prompt){
        if(!prompt){
            throw new TypeError("LLM.generate cannot take null prompt");
        }

        this.memory.push({"role": "user", "content": prompt});
        const context = this.memory.slice(-30); // last 15x2 memories
        context.push({
            "role": "system", 
            "content": this.personality
        }); //main behaviour

        let endpoint = "https://api.groq.com/openai/v1/chat/completions";
        const payload = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                "model": this.model,
                "messages": context,
                "tools": this.commands_schema
            })
        };
        
        //might be null
        const response = await fetch(endpoint, payload);
        return this.parseResponse(response);
    }

    async parseResponse(response){
        const data = await response.json();

        console.log(data);

        if(data.error){
            console.log(data.error.message);
            console.log(data.error.type);
            console.log(data.error.code); //from API schema

        }else if(data.choices[0].message.tool_calls) {
            const fschem = data.choices[0].message.tool_calls[0].function;
            console.log(fschem); // this would be the command function but constructed as a schema

            return this.commands[fschem.name](JSON.parse(fschem.arguments));
        }else if(data.choices[0].message.content){
            console.log(data.choices[0].message);

            const content = data.choices[0].message.content;
            console.log(content);
            this.memory.push({"role": "assistant", "content": content});
            return content;
        }else{
            return "llm.js generate() return data is empty";
        }
    }
}
