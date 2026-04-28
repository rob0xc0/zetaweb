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
        this.memory = [];
    }

    async generate(prompt){
        if(!prompt){
            throw new TypeError("LLM.generate cannot take null prompt");
        }

        this.memory.push({"role": "user", "content": prompt});
        const context = this.memory.slice(-10); // last 5x2 memories
        context.push({"role": "system", "content": "only reply with short phrases and lower case, talk as calm and rational as you can"}); //main behaviour

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
                "messages": context
            })
        };
        
        //might be null
        let response = await fetch(endpoint, payload);
        let data = await response.json();
        if (data){
            this.memory.push({"role": "assistant", "content": data.choices[0].message.content});
            return data.choices[0].message.content;
        } else {
            return "llm.js generate() return data is empty";
        }
    }
}
