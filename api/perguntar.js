export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  try {
    const { pergunta } = req.body;

    if (!pergunta) {
      return res.status(400).json({ erro: 'Pergunta não fornecida' });
    }

    const resposta = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: pergunta }],
      }),
    });

    const dados = await resposta.json();

    if (dados.error) {
      console.error('Erro da OpenAI:', dados.error);
      return res.status(500).json({ erro: dados.error.message });
    }

    const respostaTexto = dados.choices?.[0]?.message?.content || 'Sem resposta.';
    return res.status(200).json({ resposta: respostaTexto });
  } catch (erro) {
    console.error('Erro interno:', erro);
    return res.status(500).json({ erro: 'Erro interno no servidor' });
  }
}
