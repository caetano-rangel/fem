export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import stripe from '../../lib/stripe';
import { supabase } from '../../lib/supabaseClient';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { camisaId, camisaNome, preco, nome, telefone, endereco } = body;

    // Validação básica
    if (!camisaId || !camisaNome || !preco || !nome || !telefone || !endereco) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes.' }, { status: 400 });
    }

    // Gera ID do pedido
    const pedidoId = randomUUID();

    // Salva pedido no Supabase com status pendente
    const { error: insertError } = await supabase.from('pedidos').insert([{
      id: pedidoId,
      camisa_id: camisaId,
      camisa_nome: camisaNome,
      preco_centavos: preco,
      nome,
      telefone,
      endereco,
      status: 'pendente',
      created_at: new Date().toISOString(),
    }]);

    if (insertError) {
      console.error('Erro ao salvar pedido:', insertError.message);
      return NextResponse.json({ error: 'Erro ao salvar pedido.' }, { status: 500 });
    }

    // Cria sessão de checkout no Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            unit_amount: preco, // valor em centavos
            product_data: {
              name: `Fem Imports — ${camisaNome}`,
              description: `Pedido de ${nome}`,
            },
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      metadata: {
        pedidoId,
        nome,
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/confirm?id=${pedidoId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/`,
    });

    return NextResponse.json({ url: session.url });

  } catch (error) {
    console.error('Erro ao criar checkout:', error);
    return NextResponse.json({ error: 'Erro ao criar sessão de checkout.' }, { status: 500 });
  }
}
