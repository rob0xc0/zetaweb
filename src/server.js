import express from "express";
import http from 'http';
import { WebSocketServer } from 'ws';

import path from "path"
import { fileURLToPath } from "url";
const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename)

import { configDotenv } from "dotenv";
configDotenv()

import { GROQAPILLM } from "./llm.js";

const LLM = new GROQAPILLM(process.env.GROQ_API_KEY, "LLAMA_8B");

const app = express();
app.use(express.static(`${_dirname}/public`))
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000/');
})

const server = new http.createServer()
const wss = new WebSocketServer({server});

wss.on("connection", (ws) => {
  ws.send("server alive!");

  ws.on("message", async (data) => {
    console.log("received from client!:", data.toString());
    let response = await LLM.generate(data.toString());
    ws.send(response);
  });

  ws.on("error", (err) => {
    console.log("ERROR:", err);
  });

  ws.on("close", () => {
    console.log("socket closed!");
  });
});

server.listen(3001, () => {
  console.log("WebSocketServer is running on http://localhost:3001/");
});


