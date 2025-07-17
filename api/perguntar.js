// /api/perguntar.js
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
    const resposta = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: pergunta }],
        temperature: 0.7
      })
    });

    const data = await resposta.json();

    if (!resposta.ok) {
      console.error('Erro da OpenAI:', data);
      return res.status(500).json({ erro: 'Erro na OpenAI', detalhes: data });
    }

    const conteudo = data.choices?.[0]?.message?.content || 'Sem resposta.';
    return res.status(200).json({ resposta: conteudo });

  } catch (err) {
    console.error('Erro interno:', err);
    return res.status(500).json({ erro: 'Erro interno', detalhes: err.message });
  }
}
