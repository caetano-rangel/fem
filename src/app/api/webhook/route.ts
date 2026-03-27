export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { supabase } from '../../lib/supabaseClient';
import stripe from '../../lib/stripe';

const secret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!secret || !signature) {
      throw new Error('Missing secret or signature');
    }

    const event = stripe.webhooks.constructEvent(body, signature, secret);

    switch (event.type) {

      /* ── Pagamento aprovado ── */
      case 'checkout.session.completed': {
        const session = event.data.object;
        if (session.payment_status === 'paid') {
          const pedidoId = session.metadata?.pedidoId;

          if (pedidoId) {
            const { error } = await supabase
              .from('pedidos')
              .update({
                status: 'aprovado',
                aprovado_at: new Date().toISOString(),
                stripe_session_id: session.id,
              })
              .eq('id', pedidoId);

            if (error) {
              console.error('Erro ao atualizar pedido:', error);
              return NextResponse.json({ error: 'Erro ao atualizar pedido.' }, { status: 500 });
            }
          }
        }
        break;
      }

      /* ── Sessão expirou sem pagamento ── */
      case 'checkout.session.expired': {
        const expiredId = event.data.object.metadata?.pedidoId;
        if (expiredId) {
          await supabase
            .from('pedidos')
            .update({ status: 'expirado' })
            .eq('id', expiredId);
        }
        break;
      }

      default:
        console.log(`Evento ignorado: ${event.type}`);
    }

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error('Erro no webhook:', error);
    return NextResponse.json({ message: 'Webhook error', ok: false }, { status: 500 });
  }
}
