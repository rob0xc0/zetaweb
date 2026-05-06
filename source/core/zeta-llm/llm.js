

export const GroqLLMModels = Object.freeze({
    //WARNING, THESE MODELS MIGHT CHANGE DEPENDING ON THE AVAILABLE MODELS AT https://console.groq.com/docs/rate-limits
    LLAMA_8B: "llama-3.1-8b-instant",
    LLAMA_70B: "llama-3.3-70b-versatile"
})

export class GroqAPILLM {
    constructor(apiKey, model){
        this.apiKey = apiKey;
        if(!Object.values(GroqLLMModels).includes(model)){ throw new Error(`Unavailable model used in LLM: ${model}`); }
        this.model = model; 
        this.commands = [
            {
                type: "function",
                function: {
                    name: "test",
                    description: "a test function that intakes an users input string and returns that same string",
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
            /*,
            {
                type: "function",
                function: {
                    name: "test_again",
                    description: "another test function that intakes the users input and returns that same string, used to try multiple tools",
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
            */
        ]

        this.memory = [];
    }

    async generate(prompt){
        if(!prompt){
            throw new TypeError("LLM.generate cannot take null prompt");
        }

        this.memory.push({"role": "user", "content": prompt});
        const context = this.memory.slice(-30); // last 15x2 memories
        context.push({
            "role": "system", 
            "content": `
                your name is zeta, your creator is rob (old name was lumi)
                only reply with short phrases and lower case, 
                talk as calm and rational as cute as you can,
                use cute effects like ! ?? !!!! :3 :o and other emoticons but not too excessively
            `
        }); //main behaviour

        console.log(context);
        console.log(context.length);
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
                "tools": this.commands
            })
        };
        
        //might be null
        let response = await fetch(endpoint, payload);
        let data = await response.json();

        //console.log(data);

        if (data){
            this.memory.push({"role": "assistant", "content": data.choices[0].message.content});
            console.log(data.choices[0].message);
            //console.log(data.choices[0].message.tool_calls[0].function)
            return data.choices[0].message.content;
        } else {
            return "llm.js generate() return data is empty";
        }
    }
}
