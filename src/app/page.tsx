'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from './lib/supabaseClient';

export type Camisa = {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  precoFormatado: string;
  imagem: string;
  tag?: string;
  cores?: string;
  estoque_p?: number;
  estoque_m?: number;
  estoque_g?: number;
  estoque_gg?: number;
};

export default function Home() {
  const router = useRouter();
  const [hovered, setHovered] = useState<string | null>(null);
  const [camisas, setCamisas] = useState<Camisa[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('camisas')
      .select('*')
      .eq('ativo', true)
      .then(({ data, error }) => {
        if (error) console.error('Erro ao buscar camisas:', error.message);
        if (data) {
          setCamisas(data.map(c => ({
            ...c,
            precoFormatado: new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(c.preco / 100),
          })));
        }
        setLoading(false);
      });
  }, []);

  const handleSelect = (camisa: Camisa) => {
    localStorage.setItem('fem_camisa', JSON.stringify(camisa));
    router.push('/form');
  };

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
        ::selection { background: rgba(180,140,30,.35); }
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
        .card { transition: transform 0.35s cubic-bezier(0.23,1,0.32,1), box-shadow 0.35s ease, border-color 0.35s ease; }
        .card:hover { transform: translateY(-10px); }
        .gold-text {
          background: linear-gradient(135deg, #c9a84c, #f0d060, #a07820);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        @keyframes fadeUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp 0.7s ease forwards; opacity: 0; }
        @keyframes shimmer { 0%{left:-80%} 100%{left:140%} }
        .shimmer-card { position: relative; overflow: hidden; }
        .shimmer-card::after {
          content: '';
          position: absolute; top: 0; left: -80%;
          width: 55%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.03), transparent);
          transform: skewX(-18deg);
          animation: shimmer 6s ease-in-out infinite;
          pointer-events: none;
        }
        @media (max-width: 480px) {
          #camisas { padding: 40px 16px 60px !important; }
        }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #080808; }
        ::-webkit-scrollbar-thumb { background: #b8a030; border-radius: 3px; }
        .nav-link { color: rgba(240,234,214,.4); transition: color 0.2s; cursor: pointer; letter-spacing: 0.15em; font-size: 0.78rem; }
        .nav-link:hover { color: #c9a84c; }
        .tag { font-family: 'Barlow Condensed', sans-serif; font-size: 0.7rem; letter-spacing: 0.18em; text-transform: uppercase; padding: 4px 12px; border-radius: 2px; background: rgba(180,140,30,.15); border: 1px solid rgba(180,140,30,.4); color: #c9a84c; display: inline-block; }
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Image
            src="/logo.jpeg"
            alt="FEM Imports"
            width={46}
            height={46}
            style={{ borderRadius: 4, objectFit: 'contain', width: 46, height: 'auto' }}
          />
        </div>
        <div className="condensed" style={{ display: 'flex', gap: 36, textTransform: 'uppercase' }}>
          <span className="nav-link">Coleção</span>
          <span className="nav-link">Tamanhos</span>
          <span className="nav-link">Contato</span>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        position: 'relative',
        overflow: 'hidden',
        padding: '80px 40px 70px',
        background: 'linear-gradient(160deg, #0c0c0c 0%, #080808 40%, #0a0900 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}>
        <div style={{ position: 'absolute', left: '12%', top: 0, bottom: 0, width: 1, background: 'linear-gradient(180deg, rgba(180,140,30,.25), transparent)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: '12%', top: 0, bottom: 0, width: 1, background: 'linear-gradient(180deg, rgba(180,140,30,.15), transparent)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%)', width: 700, height: 400, background: 'radial-gradient(ellipse, rgba(180,140,30,.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="fade-up" style={{ animationDelay: '0s', position: 'relative', zIndex: 1, marginBottom: 36 }}>
          <Image
            src="/logo-png.png"
            alt="FEM Imports"
            width={220}
            height={220}
            loading="eager"
            priority
            style={{ objectFit: 'contain', width: 220, height: 'auto', filter: 'drop-shadow(0 0 40px rgba(180,140,30,.35))' }}
          />
        </div>

        <div className="fade-up condensed" style={{ animationDelay: '0.1s', fontSize: '0.78rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: '#c9a84c', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14, position: 'relative', zIndex: 1 }}>
          <div style={{ width: 30, height: 1, background: '#c9a84c' }} />
          Importadas · Qualidade Premium · Entrega Garantida
          <div style={{ width: 30, height: 1, background: '#c9a84c' }} />
        </div>

        <p className="fade-up body-font" style={{ animationDelay: '0.2s', fontSize: '1rem', color: 'rgba(240,234,214,.5)', lineHeight: 1.8, maxWidth: 460, marginBottom: 40, position: 'relative', zIndex: 1 }}>
          O site mais brasileiro do mundo, direto de São Paulo! Pra você, que está esperando a convocação do Ney e o Hexa! 🏆
        </p>

        <div className="fade-up" style={{ animationDelay: '0.3s', display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
          <button
            className="btn-gold"
            style={{ padding: '14px 44px', borderRadius: 3, fontSize: '1.1rem' }}
            onClick={() => document.getElementById('camisas')?.scrollIntoView({ behavior: 'smooth' })}
          >
            VER CAMISAS
          </button>
          <div className="condensed" style={{ fontSize: '0.75rem', letterSpacing: '0.15em', color: 'rgba(240,234,214,.3)', textTransform: 'uppercase' }}>
            ↓ Role para ver a coleção
          </div>
        </div>

        <div className="fade-up" style={{ animationDelay: '0.4s', display: 'flex', gap: 48, marginTop: 64, paddingTop: 40, borderTop: '1px solid rgba(180,140,30,.15)', position: 'relative', zIndex: 1 }}>
          {[{ num: '100+', label: 'Modelos' }, { num: '5★', label: 'Avaliação' }, { num: '24h', label: 'Suporte' }].map(s => (
            <div key={s.label}>
              <div style={{ fontSize: '2rem', lineHeight: 1 }} className="gold-text">{s.num}</div>
              <div className="condensed" style={{ fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(240,234,214,.3)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* COLEÇÃO */}
      <section id="camisas" style={{ padding: '60px 20px 80px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ marginBottom: 52 }}>
          <div className="condensed" style={{ fontSize: '0.72rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: '#c9a84c', marginBottom: 14 }}>✦ Coleção Atual</div>
          <h2 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', lineHeight: 1, marginBottom: 16 }}>
            ESCOLHA SUA <span className="gold-text">CAMISA</span>
          </h2>
          <div style={{ width: 50, height: 2, background: 'linear-gradient(90deg, #c9a84c, transparent)' }} />
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
            <p className="body-font" style={{ color: 'rgba(240,234,214,.3)', letterSpacing: '0.1em' }}>Carregando coleção...</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 360px), 1fr))',
            gap: 20,
          }}>
            {camisas.map((camisa, idx) => {
              const temEstoque = (
                (camisa.estoque_p ?? 0) +
                (camisa.estoque_m ?? 0) +
                (camisa.estoque_g ?? 0) +
                (camisa.estoque_gg ?? 0)
              ) > 0;

              return (
                <div
                  key={camisa.id}
                  className="card shimmer-card fade-up"
                  style={{
                    animationDelay: `${idx * 0.12}s`,
                    background: 'linear-gradient(160deg, #101010, #0d0d08)',
                    border: hovered === camisa.id ? '1px solid rgba(180,140,30,.55)' : '1px solid rgba(180,140,30,.18)',
                    borderRadius: 4,
                    overflow: 'hidden',
                    cursor: temEstoque ? 'pointer' : 'default',
                    position: 'relative',
                    boxShadow: hovered === camisa.id ? '0 24px 64px rgba(0,0,0,.7)' : '0 4px 24px rgba(0,0,0,.4)',
                    opacity: temEstoque ? 1 : 0.5,
                  }}
                  onMouseEnter={() => temEstoque && setHovered(camisa.id)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => temEstoque && handleSelect(camisa)}
                >
                  {camisa.tag && (
                    <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 2 }}>
                      <span className="tag">{camisa.tag}</span>
                    </div>
                  )}

                  {!temEstoque && (
                    <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 2 }}>
                      <span className="tag" style={{ borderColor: 'rgba(220,38,38,.4)', color: 'rgba(220,38,38,.7)', background: 'rgba(220,38,38,.1)' }}>Esgotada</span>
                    </div>
                  )}

                  <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', overflow: 'hidden', background: '#0a0a0a' }}>
                    <Image
                      src={camisa.imagem}
                      alt={camisa.nome}
                      fill
                      loading={idx === 0 ? 'eager' : 'lazy'}
                      priority={idx === 0}
                      style={{
                        objectFit: 'cover',
                        transition: 'transform 0.5s ease',
                        transform: hovered === camisa.id ? 'scale(1.06)' : 'scale(1)',
                      }}
                    />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '35%', background: 'linear-gradient(transparent, rgba(10,10,8,.96))', pointerEvents: 'none' }} />
                  </div>

                  <div style={{ padding: '20px 20px 24px' }}>
                    <h3 style={{ fontSize: 'clamp(1.3rem, 4vw, 1.6rem)', letterSpacing: '0.03em', marginBottom: 4, lineHeight: 1 }}>{camisa.nome}</h3>
                    {camisa.cores && (
                      <div className="condensed" style={{ fontSize: '0.7rem', letterSpacing: '0.18em', color: '#c9a84c', textTransform: 'uppercase', marginBottom: 10 }}>{camisa.cores}</div>
                    )}
                    <p className="body-font" style={{ fontSize: '0.84rem', color: 'rgba(240,234,214,.42)', lineHeight: 1.7, marginBottom: 16 }}>{camisa.descricao}</p>

                    {/* Preview tamanhos */}
                    <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
                      {(['p', 'm', 'g', 'gg'] as const).map(tam => {
                        const estoque = (camisa[`estoque_${tam}` as keyof Camisa] as number) ?? 0;
                        return (
                          <span
                            key={tam}
                            className="condensed"
                            style={{
                              padding: '3px 8px',
                              border: `1px solid ${estoque > 0 ? 'rgba(180,140,30,.35)' : 'rgba(180,140,30,.1)'}`,
                              borderRadius: 2,
                              fontSize: '0.65rem',
                              letterSpacing: '0.1em',
                              color: estoque > 0 ? 'rgba(240,234,214,.5)' : 'rgba(240,234,214,.15)',
                              textDecoration: estoque === 0 ? 'line-through' : 'none',
                              textTransform: 'uppercase',
                            }}
                          >
                            {tam}
                          </span>
                        );
                      })}
                    </div>

                    <div style={{ height: 1, background: 'linear-gradient(90deg, rgba(180,140,30,.3), transparent)', marginBottom: 20 }} />

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                      <div>
                        <div className="condensed" style={{ fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(240,234,214,.28)', marginBottom: 2 }}>Preço</div>
                        <div style={{ fontSize: 'clamp(1.4rem, 5vw, 1.8rem)', lineHeight: 1 }} className="gold-text">{camisa.precoFormatado}</div>
                      </div>
                      <button
                        className="btn-gold"
                        style={{ padding: '12px 24px', borderRadius: 3, fontSize: '0.9rem', flexShrink: 0, opacity: temEstoque ? 1 : 0.4, cursor: temEstoque ? 'pointer' : 'not-allowed' }}
                        onClick={e => { e.stopPropagation(); if (temEstoque) handleSelect(camisa); }}
                      >
                        COMPRAR
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* BANNER */}
      <section style={{ borderTop: '1px solid rgba(180,140,30,.12)', borderBottom: '1px solid rgba(180,140,30,.12)', background: 'linear-gradient(135deg, #0a0900, #0d0d0d, #0a0900)', padding: '70px 40px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', marginBottom: 14 }}>
          QUALIDADE QUE VOCÊ <span className="gold-text">SENTE</span>
        </h2>
        <p className="body-font" style={{ fontSize: '0.92rem', color: 'rgba(240,234,214,.42)', maxWidth: 480, margin: '0 auto 36px', lineHeight: 1.8 }}>
          Importadas com cuidado, entregues com excelência. Cada camisa é selecionada para quem leva o futebol a sério.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 48, flexWrap: 'wrap' }}>
          {[{ emoji: '🏆', label: 'Qualidade Premium' }, { emoji: '📦', label: 'Envio Rápido' }, { emoji: '💬', label: 'Atendimento 24h' }].map(f => (
            <div key={f.label}>
              <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>{f.emoji}</div>
              <div className="condensed" style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c9a84c' }}>{f.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '60px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, borderTop: '1px solid rgba(180,140,30,.1)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <Image src="/logo.jpeg" alt="FEM Imports" width={36} height={36} style={{ borderRadius: 4, objectFit: 'contain', width: 'auto', height: 'auto', opacity: 0.5 }} />
          <span className="condensed" style={{ fontSize: '0.75rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(240,234,214,.3)', textAlign: 'center' }}>
            © 2026 FEM Imports · Todos os direitos reservados
          </span>
          <div className="condensed" style={{ fontSize: '0.6rem', letterSpacing: '0.15em', color: 'rgba(240,234,214,.15)', textTransform: 'uppercase', marginTop: 5 }}>
            Qualidade Premium · Tailandesa 1:1
          </div>
        </div>
      </footer>
    </div>
  );
}