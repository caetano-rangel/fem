'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';

function ConfirmContent() {
  const [status, setStatus] = useState<'pendente' | 'aprovado' | 'expirado'>('pendente');
  const [dots, setDots] = useState('');
  const [pedido, setPedido] = useState<{ camisaNome: string; nome: string } | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pedidoId = searchParams.get('id');

  /* Animação de pontos */
  useEffect(() => {
    const id = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 500);
    return () => clearInterval(id);
  }, []);

  /* Polling */
  useEffect(() => {
    if (!pedidoId) return;

    const check = async () => {
      const { data, error } = await supabase
        .from('pedidos')
        .select('status, nome, camisa_nome')
        .eq('id', pedidoId)
        .single();

      if (error) { console.error(error); return; }
      if (data) {
        setStatus(data.status);
        setPedido({ nome: data.nome, camisaNome: data.camisa_nome });
      }
    };

    check();
    const interval = setInterval(check, 4000);
    return () => clearInterval(interval);
  }, [pedidoId, router]);

  const aprovado = status === 'aprovado';

  return (
    <div style={{
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      background: '#0a0a0a',
      color: '#f5f0e8',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Montserrat:wght@300;400;500;600&display=swap');
        .sans { font-family: 'Montserrat', sans-serif !important; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse-ring {
          0% { transform: scale(0.85); opacity: 0.7; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
        @keyframes glow { 0%,100% { opacity: 0.3; } 50% { opacity: 0.7; } }
        @keyframes checkIn { from { stroke-dashoffset: 40; opacity: 0; } to { stroke-dashoffset: 0; opacity: 1; } }
      `}</style>

      {/* Glow de fundo */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: 500, height: 500,
        background: `radial-gradient(circle, ${aprovado ? 'rgba(212,160,23,.06)' : 'rgba(212,160,23,.03)'} 0%, transparent 70%)`,
        borderRadius: '50%',
        pointerEvents: 'none',
        transition: 'all 1s ease',
        animation: 'glow 3s ease-in-out infinite',
      }} />

      {/* Card */}
      <div style={{
        background: 'linear-gradient(160deg, #111111, #14140e)',
        border: `1px solid ${aprovado ? 'rgba(212,160,23,.5)' : 'rgba(212,160,23,.2)'}`,
        borderRadius: 4,
        padding: '56px 48px',
        maxWidth: 480,
        width: '100%',
        textAlign: 'center',
        boxShadow: aprovado
          ? '0 20px 80px rgba(212,160,23,.12), inset 0 1px 0 rgba(212,160,23,.1)'
          : '0 8px 40px rgba(0,0,0,.5)',
        transition: 'all 0.8s ease',
        position: 'relative',
        overflow: 'hidden',
      }}>

        {/* Linha dourada topo */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${aprovado ? '#c9a84c' : 'rgba(212,160,23,.3)'}, transparent)`,
          transition: 'all 0.8s ease',
        }} />

        {/* Ícone */}
        <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 36px' }}>
          {!aprovado && (
            <>
              <div style={{
                position: 'absolute', inset: 0,
                borderRadius: '50%',
                background: 'rgba(212,160,23,.08)',
                animation: 'pulse-ring 2s ease-out infinite',
              }} />
              <div style={{
                position: 'relative', width: 80, height: 80,
                borderRadius: '50%',
                background: 'rgba(212,160,23,.05)',
                border: '1px solid rgba(212,160,23,.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg style={{ width: 32, height: 32, animation: 'spin 2s linear infinite' }} viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="rgba(212,160,23,.2)" strokeWidth="2" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="#c9a84c" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
            </>
          )}
          {aprovado && (
            <div style={{
              width: 80, height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(212,160,23,.15), rgba(212,160,23,.05))',
              border: '1px solid rgba(212,160,23,.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <path
                  d="M8 18 L15 25 L28 12"
                  stroke="#c9a84c"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="40"
                  style={{ animation: 'checkIn 0.6s ease forwards' }}
                />
              </svg>
            </div>
          )}
        </div>

        {/* Emoji */}
        <div style={{ fontSize: '2.8rem', marginBottom: 20, animation: 'float 3s ease-in-out infinite' }}>
          {aprovado ? '👑' : '✨'}
        </div>

        {/* Título */}
        <h1 style={{ fontSize: '2rem', fontWeight: 300, marginBottom: 12 }}>
          {aprovado
            ? <>Pedido <em style={{ color: '#c9a84c' }}>confirmado!</em></>
            : <>Aguardando <em style={{ color: '#c9a84c' }}>confirmação</em></>
          }
        </h1>

        {/* Divider */}
        <div style={{ width: 40, height: 1, background: 'linear-gradient(90deg, transparent, #c9a84c, transparent)', margin: '0 auto 20px' }} />

        {/* Texto */}
        {aprovado && pedido ? (
          <>
            <p className="sans" style={{ fontSize: '0.85rem', color: 'rgba(245,240,232,.6)', lineHeight: 1.8, marginBottom: 8 }}>
              Obrigada, <strong style={{ color: '#f5f0e8' }}>{pedido.nome}</strong>!
            </p>
            <p className="sans" style={{ fontSize: '0.85rem', color: 'rgba(245,240,232,.6)', lineHeight: 1.8, marginBottom: 28 }}>
              Seu pedido da <strong style={{ color: '#c9a84c' }}>{pedido.camisaNome}</strong> foi confirmado com sucesso. Entraremos em contato pelo telefone informado.
            </p>
          </>
        ) : (
          <p className="sans" style={{ fontSize: '0.85rem', color: 'rgba(245,240,232,.5)', lineHeight: 1.8, marginBottom: 28 }}>
            Estamos processando seu pagamento{dots}<br />
            <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>Isso pode levar alguns instantes.</span>
          </p>
        )}

        {/* Badge status */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 20px',
          borderRadius: 2,
          background: aprovado ? 'rgba(212,160,23,.1)' : 'rgba(255,255,255,.04)',
          border: `1px solid ${aprovado ? 'rgba(212,160,23,.4)' : 'rgba(212,160,23,.15)'}`,
        }}>
          <div style={{
            width: 7, height: 7,
            borderRadius: '50%',
            background: aprovado ? '#c9a84c' : 'rgba(212,160,23,.5)',
            boxShadow: aprovado ? '0 0 8px #c9a84c' : 'none',
            animation: aprovado ? 'none' : 'glow 1.5s ease-in-out infinite',
          }} />
          <span className="sans" style={{ fontSize: '0.68rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: aprovado ? '#c9a84c' : 'rgba(245,240,232,.4)' }}>
            {aprovado ? 'Pagamento aprovado' : 'Aguardando pagamento'}
          </span>
        </div>

        {aprovado && (
          <div style={{ marginTop: 32 }}>
            <button
              onClick={() => router.push('/')}
              className="sans"
              style={{
                padding: '14px 32px',
                background: 'linear-gradient(135deg, #c9a84c, #f5d676, #b8860b)',
                color: '#0a0a0a',
                border: 'none',
                borderRadius: 3,
                cursor: 'pointer',
                fontSize: '0.72rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                fontWeight: 600,
                transition: 'all 0.3s',
              }}
            >
              Ver mais peças
            </button>
          </div>
        )}
      </div>

      {/* Logo rodapé */}
      <div style={{ marginTop: 40, opacity: 0.4 }}>
        <span style={{ fontSize: '1.1rem', fontWeight: 300 }}>
          <em style={{ color: '#c9a84c' }}>Fem</em> Imports
        </span>
      </div>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a' }}>
        <p style={{ color: '#c9a84c', fontFamily: 'Montserrat, sans-serif' }}>Carregando...</p>
      </div>
    }>
      <ConfirmContent />
    </Suspense>
  );
}
