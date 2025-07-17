import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  const { pergunta } = req.body;

  if (!pergunta) {
    return res.status(400).json({ erro: 'Pergunta não fornecida' });
  }

  try {
    console.log("📩 Pergunta recebida:", pergunta);

    const resposta = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
        "OpenAI-Beta": "assistants=v2"
      },
      body: JSON.stringify({
        model: "gpt-4o",
        assistant_id: "asst_dk7R5Q7jPZSSB1imMz2NtfTY",
        messages: [
          { role: "user", content: pergunta }
        ]
      })
    });

    const data = await resposta.json();
    console.log("📤 Resposta bruta da OpenAI:", JSON.stringify(data));

    if (!resposta.ok) {
      return res.status(500).json({
        erro: "Erro na OpenAI",
        detalhes: data.error?.message || data
      });
    }

    const conteudo = data.choices?.[0]?.message?.content || "Sem resposta.";
    return res.status(200).json({ resposta: conteudo });

  } catch (err) {
    console.error("❌ Erro de execução:", err);
    return res.status(500).json({ erro: "Erro interno", detalhes: err.message });
  }
}
