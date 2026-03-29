'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '../lib/supabaseClient';

type Pedido = {
  nome: string;
  camisa_nome: string;
  tamanho: string;
  preco_centavos: number;
  endereco: string;
  telefone: string;
  status: string;
};

const WHATSAPP_NUMBER = '5511999999999';

function ConfirmContent() {
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [dots, setDots] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();
  const pedidoId = searchParams.get('id');

  useEffect(() => {
    const id = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!pedidoId) return;
    const check = async () => {
      const { data, error } = await supabase
        .from('pedidos')
        .select('status, nome, camisa_nome, tamanho, preco_centavos, endereco, telefone')
        .eq('id', pedidoId)
        .single();
      if (error) { console.error(error); return; }
      if (data) setPedido(data);
    };
    check();
    const interval = setInterval(check, 4000);
    return () => clearInterval(interval);
  }, [pedidoId]);

  const aprovado = pedido?.status === 'aprovado';

  const precoFormatado = pedido
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pedido.preco_centavos / 100)
    : '';

  const whatsappMsg = pedido
    ? encodeURIComponent(
        `Olá! Acabei de realizar um pedido na FEM Imports.\n\n` +
        `👤 Nome: ${pedido.nome}\n` +
        `👕 Camisa: ${pedido.camisa_nome}\n` +
        `📏 Tamanho: ${pedido.tamanho}\n` +
        `💰 Valor: ${precoFormatado}\n` +
        `📦 Endereço: ${pedido.endereco}\n\n` +
        `Aguardo o código de rastreio!`
      )
    : '';

  return (
    <div style={{
      fontFamily: "'Bebas Neue', 'Barlow Condensed', sans-serif",
      background: '#080808',
      color: '#f0ead6',
      minHeight: '100vh',
      overflowX: 'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@300;400;600;700&family=Barlow:wght@300;400;500&display=swap');
        .body-font { font-family: 'Barlow', sans-serif !important; }
        .condensed { font-family: 'Barlow Condensed', sans-serif !important; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .gold-text {
          background: linear-gradient(135deg, #c9a84c, #f0d060, #a07820);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .btn-gold {
          background: linear-gradient(135deg, #b8a030, #e8c84a, #9a8020);
          color: #080808;
          border: none;
          cursor: pointer;
          font-family: 'Bebas Neue', sans-serif;
          letter-spacing: 0.12em;
          transition: all 0.25s ease;
        }
        .btn-gold:hover {
          background: linear-gradient(135deg, #e8c84a, #b8a030);
          box-shadow: 0 6px 28px rgba(184,160,48,.45);
          transform: translateY(-2px);
        }
        .btn-wpp {
          background: linear-gradient(135deg, #1a6e30, #25a244, #157a2a);
          color: #fff;
          border: none;
          cursor: pointer;
          font-family: 'Bebas Neue', sans-serif;
          letter-spacing: 0.12em;
          transition: all 0.25s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .btn-wpp:hover {
          background: linear-gradient(135deg, #25a244, #1a6e30);
          box-shadow: 0 6px 28px rgba(37,162,68,.35);
          transform: translateY(-2px);
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp 0.6s ease forwards; }
        @keyframes pulse-ring {
          0% { transform: scale(0.9); opacity: 0.6; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes glow { 0%,100% { opacity: 0.4; } 50% { opacity: 0.9; } }
        @keyframes checkIn { from { stroke-dashoffset: 50; opacity: 0; } to { stroke-dashoffset: 0; opacity: 1; } }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #080808; }
        ::-webkit-scrollbar-thumb { background: #b8a030; border-radius: 3px; }
      `}</style>

      {/* NAV */}
      <nav style={{
        background: 'rgba(8,8,8,0.97)',
        backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(180,140,30,.2)',
        padding: '0 40px',
        height: 70,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>
          <Image src="/logo.jpeg" alt="FEM Imports" width={46} height={46}
            style={{ borderRadius: 4, objectFit: 'contain' }} />
        </div>
        <div className="condensed" style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(240,234,214,.35)' }}>
          <div style={{ width: 20, height: 1, background: 'rgba(180,140,30,.4)' }} />
          Confirmação do Pedido
          <div style={{ width: 20, height: 1, background: 'rgba(180,140,30,.4)' }} />
        </div>
      </nav>

      {/* HERO */}
      <div style={{
        background: 'linear-gradient(160deg, #0c0c0c, #080808, #0a0900)',
        borderBottom: '1px solid rgba(180,140,30,.12)',
        padding: '52px 40px 44px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 200, background: 'radial-gradient(ellipse, rgba(180,140,30,.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', width: 72, height: 72, margin: '0 auto 28px' }}>
          {!aprovado ? (
            <>
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(180,140,30,.08)', animation: 'pulse-ring 2s ease-out infinite' }} />
              <div style={{ position: 'relative', width: 72, height: 72, borderRadius: '50%', background: 'rgba(180,140,30,.05)', border: '1px solid rgba(180,140,30,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg style={{ width: 30, height: 30, animation: 'spin 2s linear infinite' }} viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="rgba(180,140,30,.2)" strokeWidth="2" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="#c9a84c" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
            </>
          ) : (
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(180,140,30,.1)', border: '1px solid rgba(180,140,30,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="34" height="34" viewBox="0 0 36 36" fill="none">
                <path d="M8 18 L15 25 L28 12" stroke="#c9a84c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="50" style={{ animation: 'checkIn 0.6s ease forwards' }} />
              </svg>
            </div>
          )}
        </div>

        <div className="condensed fade-up" style={{ fontSize: '0.72rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: '#c9a84c', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <div style={{ width: 24, height: 1, background: '#c9a84c' }} />
          {aprovado ? 'Pedido confirmado' : 'Processando pagamento'}
          <div style={{ width: 24, height: 1, background: '#c9a84c' }} />
        </div>

        <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', lineHeight: 1, marginBottom: 12 }}>
          {aprovado
            ? <><span className="gold-text">PAGAMENTO</span> APROVADO</>
            : <>AGUARDANDO <span className="gold-text">CONFIRMAÇÃO</span></>
          }
        </h1>

        {!aprovado && (
          <p className="body-font" style={{ fontSize: '0.85rem', color: 'rgba(240,234,214,.4)', marginTop: 8 }}>
            Verificando seu pagamento{dots}
          </p>
        )}
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '56px 24px 80px' }}>
        {pedido ? (
          <div className="fade-up" style={{
            background: 'linear-gradient(160deg, #101010, #0d0d08)',
            border: '1px solid rgba(180,140,30,.25)',
            borderRadius: 4,
            overflow: 'hidden',
          }}>
            <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${aprovado ? '#c9a84c' : 'rgba(180,140,30,.3)'}, transparent)` }} />
            
            <div style={{ padding: '36px 40px' }}>
              <div style={{ marginBottom: 28 }}>
                <div className="condensed" style={{ fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(240,234,214,.3)', marginBottom: 6 }}>Resumo do Pedido</div>
                <div style={{ width: 36, height: 1, background: 'linear-gradient(90deg, #c9a84c, transparent)' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 32px', marginBottom: 28 }}>
                {[
                  { label: 'Cliente', value: pedido.nome },
                  { label: 'Camisa', value: pedido.camisa_nome },
                  { label: 'Tamanho', value: pedido.tamanho },
                  { label: 'Valor Pago', value: precoFormatado, gold: true },
                ].map((item, idx) => (
                  <div key={idx}>
                    <div className="condensed" style={{ fontSize: '0.6rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(240,234,214,.3)', marginBottom: 4 }}>{item.label}</div>
                    <div style={item.gold ? {
                      fontSize: '1.6rem',
                      lineHeight: 1,
                      background: 'linear-gradient(135deg, #c9a84c, #f0d060, #a07820)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    } : {
                      fontSize: '1.1rem',
                      color: '#f0ead6',
                      fontFamily: "'Barlow', sans-serif",
                    }}>
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: 32 }}>
                <div className="condensed" style={{ fontSize: '0.6rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(240,234,214,.3)', marginBottom: 4 }}>Endereço de Entrega</div>
                <div className="body-font" style={{ fontSize: '0.9rem', color: 'rgba(240,234,214,.7)', lineHeight: 1.6 }}>{pedido.endereco}</div>
              </div>

              <div style={{ height: 1, background: 'linear-gradient(90deg, rgba(180,140,30,.25), transparent)', marginBottom: 28 }} />

              {aprovado && (
                <div style={{ marginBottom: 28, padding: '16px 20px', background: 'rgba(180,140,30,.06)', border: '1px solid rgba(180,140,30,.2)', borderRadius: 3 }}>
                  <p className="body-font" style={{ fontSize: '0.85rem', color: 'rgba(240,234,214,.6)', lineHeight: 1.8 }}>
                    Obrigado, <strong style={{ color: '#f0ead6' }}>{pedido.nome}</strong>! 🎉<br />
                    Seu pedido foi confirmado. Clique abaixo para solicitar o código de rastreio.
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <a 
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMsg}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none' }}
                >
                  <button className="btn-wpp" style={{ width: '100%', padding: '15px 28px', borderRadius: 3, fontSize: '1.05rem' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                    SOLICITAR CÓDIGO DE RASTREIO
                  </button>
                </a>
                <button
                  onClick={() => router.push('/')}
                  className="btn-gold"
                  style={{ width: '100%', padding: '13px 28px', borderRadius: 3, fontSize: '0.95rem' }}
                >
                  VER MAIS CAMISAS
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ background: 'linear-gradient(160deg, #101010, #0d0d08)', border: '1px solid rgba(180,140,30,.15)', borderRadius: 4, padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <svg style={{ width: 20, height: 20, animation: 'spin 1.5s linear infinite' }} viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="rgba(180,140,30,.2)" strokeWidth="2" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="#c9a84c" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="condensed" style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(240,234,214,.3)' }}>Carregando pedido...</span>
          </div>
        )}
      </div>

      <footer style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, borderTop: '1px solid rgba(180,140,30,.1)' }}>
        <Image src="/logo.jpeg" alt="FEM Imports" width={32} height={32} style={{ opacity: 0.4 }} />
        <span className="condensed" style={{ fontSize: '0.7rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(240,234,214,.25)' }}>
          © 2026 FEM Imports · Todos os direitos reservados
        </span>
      </footer>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080808' }}>
        <p style={{ color: '#c9a84c', fontFamily: 'Barlow, sans-serif' }}>Carregando...</p>
      </div>
    }>
      <ConfirmContent />
    </Suspense>
  );
}