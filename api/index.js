// api/index.js
const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());

const GPT_API_KEY = process.env.GPT_API_KEY;
const GPT_ASSISTANT_ID = process.env.GPT_ASSISTANT_ID;

app.post("/perguntar", async (req, res) => {
  const pergunta = req.body.pergunta;

  try {
    // 1. Cria thread
    const threadResp = await fetch("https://api.openai.com/v1/threads", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GPT_API_KEY}`,
        "Content-Type": "application/json",
        "OpenAI-Beta": "assistants=v2"
      }
    });
    const threadData = await threadResp.json();
    const threadId = threadData.id;

    // 2. Adiciona mensagem do usuário
    await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GPT_API_KEY}`,
        "Content-Type": "application/json",
        "OpenAI-Beta": "assistants=v2"
      },
      body: JSON.stringify({ role: "user", content: pergunta })
    });

    // 3. Inicia execução
    const runResp = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GPT_API_KEY}`,
        "Content-Type": "application/json",
        "OpenAI-Beta": "assistants=v2"
      },
      body: JSON.stringify({ assistant_id: GPT_ASSISTANT_ID })
    });
    const runData = await runResp.json();
    const runId = runData.id;

    // 4. Espera até terminar
    let status = "";
    do {
      await new Promise(r => setTimeout(r, 1500));
      const check = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
        headers: {
          "Authorization": `Bearer ${GPT_API_KEY}`,
          "OpenAI-Beta": "assistants=v2"
        }
      });
      status = (await check.json()).status;
    } while (status !== "completed");

    // 5. Busca resposta
    const messages = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      headers: {
        "Authorization": `Bearer ${GPT_API_KEY}`,
        "OpenAI-Beta": "assistants=v2"
      }
    });
    const mensagens = await messages.json();
    const resposta = mensagens.data.find(m => m.role === "assistant")?.content[0]?.text?.value || "❌ Sem resposta.";

    res.json({ resposta });
  } catch (e) {
    console.error("Erro:", e);
    res.status(500).json({ erro: "Erro interno no servidor." });
  }
});

module.exports = app;
