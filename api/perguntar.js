export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ erro: 'Método não permitido' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { pergunta } = await req.json();

    if (!pergunta) {
      return new Response(JSON.stringify({ erro: 'Pergunta não fornecida' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const resposta = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: pergunta }],
      }),
    });

    const dados = await resposta.json();

    console.log('🔴 Resposta bruta da OpenAI:', JSON.stringify(dados));

    if (dados.error) {
      return new Response(JSON.stringify({ erro: dados.error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const respostaTexto = dados.choices?.[0]?.message?.content || 'Sem resposta.';

    return new Response(JSON.stringify({ resposta: respostaTexto }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (erro) {
    console.error('🔴 Erro no handler:', erro);
    return new Response(JSON.stringify({ erro: 'Erro ao processar a pergunta' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
