export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  const { pergunta } = req.body;

  if (!pergunta || pergunta.trim() === '') {
    return res.status(400).json({ erro: 'Pergunta inválida' });
  }

  try {
    const resposta = await fetch('https://api.openai.com/v1/threads/runs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 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',
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({
        assistant_id: 'asst_dk7R5Q7jPZSSB1imMz2NtfTY',
        thread: {
          messages: [
            {
              role: 'user',
              content: pergunta
            }
          ]
        }
      })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      console.error('Erro da OpenAI:', dados);
      return res.status(500).json({ erro: 'Erro na OpenAI', detalhes: dados });
    }

    const runId = dados.id;
    const threadId = dados.thread_id;

    // Aguarda o processamento do run (pode levar alguns segundos)
    let finalizado = false;
    let resultado = null;

    while (!finalizado) {
      await new Promise(r => setTimeout(r, 2000));

      const statusRes = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer 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',
          'OpenAI-Beta': 'assistants=v2'
        }
      });

      const statusJson = await statusRes.json();
      if (statusJson.status === 'completed') {
        finalizado = true;

        const mensagensRes = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer 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',
            'OpenAI-Beta': 'assistants=v2'
          }
        });

        const mensagensJson = await mensagensRes.json();
        resultado = mensagensJson.data[0]?.content[0]?.text?.value || 'Sem resposta';
      }
    }

    return res.status(200).json({ resposta: resultado });
  } catch (erro) {
    console.error('Erro geral:', erro);
    return res.status(500).json({ erro: 'Erro interno no servidor' });
  }
}
