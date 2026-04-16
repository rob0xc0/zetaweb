const models = Object.freeze({
    //WARNING, THESE MODELS MIGHT CHANGE DEPENDING ON THE AVAILABLE MODELS AT https://console.groq.com/docs/rate-limits
    "LLAMA_8B": "llama-3.1-8b-instant",
    "LLAMA_70B": "llama-3.3-70b-versatile"
})

export class GROQAPILLM {
    constructor(apiKey, model){
        this.apiKey = apiKey;
        if(!Object.keys(models).includes(model)){ throw new Error(`Unavailable model used in LLM: ${model}`); }
        this.model = models[model]; 
    }

    async generate(prompt){
        let endpoint = "https://api.groq.com/openai/v1/chat/completions";
        const payload = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                "model": this.model,
                "messages": [{"role": "user", "content": prompt}]
            })
        };
        
        let response = await fetch(endpoint, payload);
        let data = await response.json();
        return data.choices[0].message.content;
    }
}
