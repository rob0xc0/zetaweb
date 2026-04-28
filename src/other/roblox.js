import express from "express";

import { configDotenv } from "dotenv";
configDotenv()

import { GROQAPILLM } from "../brain/llm.js";

const LLM = new GROQAPILLM(process.env.GROQ_API_KEY, "LLAMA_8B");

let test = await LLM.generate("hello");
console.log(test);

const app = express();

app.use(express.json());

app.post("/", async (req, res) => {
    console.log(req);
    let response = await LLM.generate(req.body.message);
    res.send(response);
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000/');
})
