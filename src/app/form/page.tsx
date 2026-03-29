'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { Camisa } from '../page';

type FormData = {
  nome: string;
  telefone: string;
  endereco: string;
};
type FieldErrors = Partial<Record<keyof FormData | 'tamanho', string>>;

function formatTelefone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function FormContent() {
  const router = useRouter();
  const [camisa, setCamisa] = useState<Camisa | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formData, setFormData] = useState<FormData>({ nome: '', telefone: '', endereco: '' });
  const [tamanho, setTamanho] = useState<string>('');

  useEffect(() => {
    const stored = localStorage.getItem('fem_camisa');
    if (!stored) { router.push('/'); return; }
    try { setCamisa(JSON.parse(stored)); } catch { router.push('/'); }
  }, [router]);

  const inputBase: React.CSSProperties = {
    width: '100%',
    padding: '14px 18px',
    background: 'rgba(255,255,255,.03)',
    border: '1px solid rgba(180,140,30,.25)',
    borderRadius: 3,
    fontSize: '0.95rem',
    color: '#f0ead6',
    outline: 'none',
    fontFamily: "'Barlow', sans-serif",
    transition: 'border-color 0.2s, box-shadow 0.2s',
    letterSpacing: '0.02em',
  };
  const inputError: React.CSSProperties = { ...inputBase, border: '1px solid rgba(220,38,38,.5)' };

  const validate = (): boolean => {
    const errs: FieldErrors = {};
    if (!formData.nome.trim()) errs.nome = 'Nome obrigatório';
    if (formData.telefone.replace(/\D/g, '').length < 10) errs.telefone = 'Telefone inválido (com DDD)';
    if (!formData.endereco.trim()) errs.endereco = 'Endereço obrigatório';
    if (!tamanho) errs.tamanho = 'Selecione um tamanho';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const formatted = name === 'telefone' ? formatTelefone(value) : value;
    setFormData(p => ({ ...p, [name]: formatted }));
    setFieldErrors(p => ({ ...p, [name]: undefined }));
  };

  const handleSubmit = async () => {
    if (!validate() || !camisa) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          camisaId: camisa.id,
          camisaNome: camisa.nome,
          preco: camisa.preco,
          nome: formData.nome,
          telefone: formData.telefone,
          endereco: formData.endereco,
          tamanho,
        }),
      });
      const data = await res.json();
      if (data.url) { window.location.href = data.url; }
      else { alert('Erro ao processar pedido: ' + (data.error || 'Erro desconhecido')); }
    } catch (err) {
      console.error(err);
      alert('Erro de conexão. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!camisa) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080808' }}>
      <p style={{ color: '#c9a84c', fontFamily: 'Barlow, sans-serif' }}>Carregando...</p>
    </div>
  );

  return (
    <div style={{ fontFamily: "'Bebas Neue', sans-serif", background: '#080808', color: '#f0ead6', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@300;400;600;700&family=Barlow:wght@300;400;500&display=swap');
        .body-font { font-family: 'Barlow', sans-serif !important; }
        .condensed { font-family: 'Barlow Condensed', sans-serif !important; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input:focus, textarea:focus {
          border-color: rgba(180,140,30,.7) !important;
          box-shadow: 0 0 0 3px rgba(180,140,30,.08) !important;
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
        .btn-gold:hover:not(:disabled) {
          background: linear-gradient(135deg, #e8c84a, #b8a030);
          box-shadow: 0 6px 28px rgba(184,160,48,.45);
          transform: translateY(-2px);
        }
        .btn-gold:disabled { opacity: 0.55; cursor: not-allowed; }
        .gold-text {
          background: linear-gradient(135deg, #c9a84c, #f0d060, #a07820);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .tam-btn:hover:not(:disabled) { border-color: rgba(180,140,30,.6) !important; color: rgba(240,234,214,.9) !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp 0.6s ease forwards; opacity: 0; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #080808; }
        ::-webkit-scrollbar-thumb { background: #b8a030; border-radius: 3px; }
        @media (max-width: 768px) {
          .form-grid { grid-template-columns: 1fr !important; }
          .sticky-card { position: static !important; }
        }
      `}</style>

      {/* NAV */}
      <nav style={{ background: 'rgba(8,8,8,0.97)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(180,140,30,.2)', padding: '0 40px', height: 70, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>
          <Image src="/logo.jpeg" alt="FEM Imports" width={46} height={46} style={{ borderRadius: 4, objectFit: 'contain', width: 46, height: 'auto' }} />
        </div>
        <div className="condensed" style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(240,234,214,.35)' }}>
          <div style={{ width: 20, height: 1, background: 'rgba(180,140,30,.4)' }} />
          Finalizar Pedido
          <div style={{ width: 20, height: 1, background: 'rgba(180,140,30,.4)' }} />
        </div>
      </nav>

      {/* HERO HEADER */}
      <div style={{ background: 'linear-gradient(160deg, #0c0c0c, #080808, #0a0900)', borderBottom: '1px solid rgba(180,140,30,.12)', padding: '52px 40px 44px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 200, background: 'radial-gradient(ellipse, rgba(180,140,30,.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="condensed fade-up" style={{ animationDelay: '0s', fontSize: '0.72rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: '#c9a84c', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <div style={{ width: 24, height: 1, background: '#c9a84c' }} />
          Quase lá
          <div style={{ width: 24, height: 1, background: '#c9a84c' }} />
        </div>
        <h1 className="fade-up" style={{ animationDelay: '0.1s', fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', lineHeight: 1, marginBottom: 12 }}>
          SEUS <span className="gold-text">DADOS</span>
        </h1>
        <p className="fade-up body-font" style={{ animationDelay: '0.2s', fontSize: '0.88rem', color: 'rgba(240,234,214,.4)', letterSpacing: '0.04em' }}>
          Preencha abaixo para finalizar sua compra
        </p>
      </div>

      {/* CONTEÚDO */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '56px 24px 80px' }}>
        <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 40, alignItems: 'start' }}>

          {/* FORMULÁRIO */}
          <div className="fade-up" style={{ animationDelay: '0.1s' }}>

            {/* Nome e Telefone */}
            {([
              { name: 'nome', label: 'Nome Completo', placeholder: 'Seu nome completo', type: 'text' },
              { name: 'telefone', label: 'Telefone com DDD', placeholder: '(11) 99999-9999', type: 'tel' },
            ] as const).map(field => (
              <div key={field.name} style={{ marginBottom: 28 }}>
                <label className="condensed" style={{ display: 'block', fontSize: '0.68rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: fieldErrors[field.name] ? 'rgba(220,38,38,.8)' : '#c9a84c', marginBottom: 10 }}>
                  {field.label}
                </label>
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  style={fieldErrors[field.name] ? inputError : inputBase}
                />
                {fieldErrors[field.name] && (
                  <p className="body-font" style={{ fontSize: '0.72rem', color: 'rgba(220,38,38,.8)', marginTop: 6 }}>{fieldErrors[field.name]}</p>
                )}
              </div>
            ))}

            {/* TAMANHO */}
            <div style={{ marginBottom: 28 }}>
              <label className="condensed" style={{ display: 'block', fontSize: '0.68rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: fieldErrors.tamanho ? 'rgba(220,38,38,.8)' : '#c9a84c', marginBottom: 10 }}>
                Tamanho
              </label>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {(['p', 'm', 'g', 'gg'] as const).map(tam => {
                  const estoque = (camisa[`estoque_${tam}` as keyof Camisa] as number) ?? 0;
                  const esgotado = estoque === 0;
                  const selecionado = tamanho === tam.toUpperCase();
                  return (
                    <button
                      key={tam}
                      type="button"
                      disabled={esgotado}
                      className="tam-btn"
                      onClick={() => {
                        setTamanho(tam.toUpperCase());
                        setFieldErrors(p => ({ ...p, tamanho: undefined }));
                      }}
                      style={{
                        width: 64,
                        height: 56,
                        borderRadius: 3,
                        border: selecionado
                          ? '2px solid #c9a84c'
                          : esgotado
                          ? '1px solid rgba(180,140,30,.1)'
                          : '1px solid rgba(180,140,30,.3)',
                        background: selecionado ? 'rgba(180,140,30,.15)' : 'rgba(255,255,255,.02)',
                        color: selecionado ? '#c9a84c' : esgotado ? 'rgba(240,234,214,.15)' : 'rgba(240,234,214,.6)',
                        fontFamily: "'Bebas Neue', sans-serif",
                        fontSize: '1.15rem',
                        letterSpacing: '0.08em',
                        cursor: esgotado ? 'not-allowed' : 'pointer',
                        position: 'relative',
                        transition: 'all 0.2s',
                        textDecoration: esgotado ? 'line-through' : 'none',
                      }}
                    >
                      {tam.toUpperCase()}
                      {/* Badge "ÚLTIMOS" quando estoque <= 3 */}
                      {!esgotado && estoque <= 3 && (
                        <span style={{
                          position: 'absolute',
                          top: -9, right: -9,
                          fontSize: '0.42rem',
                          fontFamily: "'Barlow Condensed', sans-serif",
                          letterSpacing: '0.08em',
                          background: '#c9a84c',
                          color: '#080808',
                          padding: '2px 5px',
                          borderRadius: 2,
                          fontWeight: 700,
                          textDecoration: 'none',
                          lineHeight: 1.4,
                        }}>
                          ÚLTIMOS
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              {fieldErrors.tamanho && (
                <p className="body-font" style={{ fontSize: '0.72rem', color: 'rgba(220,38,38,.8)', marginTop: 8 }}>{fieldErrors.tamanho}</p>
              )}
            </div>

            {/* Endereço */}
            <div style={{ marginBottom: 36 }}>
              <label className="condensed" style={{ display: 'block', fontSize: '0.68rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: fieldErrors.endereco ? 'rgba(220,38,38,.8)' : '#c9a84c', marginBottom: 10 }}>
                Endereço de Entrega
              </label>
              <textarea
                name="endereco"
                value={formData.endereco}
                onChange={handleChange}
                placeholder="Rua, número, complemento, bairro, cidade — CEP"
                rows={3}
                style={{ ...(fieldErrors.endereco ? inputError : inputBase), resize: 'vertical', minHeight: 88 } as React.CSSProperties}
              />
              {fieldErrors.endereco && (
                <p className="body-font" style={{ fontSize: '0.72rem', color: 'rgba(220,38,38,.8)', marginTop: 6 }}>{fieldErrors.endereco}</p>
              )}
            </div>

            {/* Botões */}
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => router.push('/')}
                className="condensed"
                style={{ padding: '13px 24px', background: 'transparent', border: '1px solid rgba(180,140,30,.3)', borderRadius: 3, color: 'rgba(240,234,214,.4)', cursor: 'pointer', fontSize: '0.82rem', letterSpacing: '0.15em', textTransform: 'uppercase', transition: 'all 0.2s', fontFamily: "'Barlow Condensed', sans-serif" }}
                onMouseEnter={e => { e.currentTarget.style.color = '#c9a84c'; e.currentTarget.style.borderColor = 'rgba(180,140,30,.55)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(240,234,214,.4)'; e.currentTarget.style.borderColor = 'rgba(180,140,30,.3)'; }}
              >
                ← VOLTAR
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="btn-gold"
                style={{ flex: 1, padding: '13px 28px', borderRadius: 3, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                {isSubmitting ? (
                  <>
                    <svg style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <circle cx="12" cy="12" r="10" strokeOpacity=".25" />
                      <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                    </svg>
                    PROCESSANDO...
                  </>
                ) : 'IR PARA PAGAMENTO →'}
              </button>
            </div>

            <p className="body-font" style={{ fontSize: '0.72rem', color: 'rgba(240,234,214,.25)', marginTop: 18, letterSpacing: '0.04em' }}>
              🔒 Pagamento 100% seguro via Stripe · Seus dados são protegidos
            </p>
          </div>

          {/* CAMISA SELECIONADA */}
          <div className="sticky-card fade-up" style={{ animationDelay: '0.2s', background: 'linear-gradient(160deg, #101010, #0d0d08)', border: '1px solid rgba(180,140,30,.3)', borderRadius: 4, overflow: 'hidden', position: 'sticky', top: 90 }}>
            <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', background: '#0a0a0a' }}>
              <Image src={camisa.imagem} alt={camisa.nome} fill style={{ objectFit: 'cover' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(transparent, rgba(13,13,8,.98))', pointerEvents: 'none' }} />
              {camisa.tag && (
                <div style={{ position: 'absolute', top: 14, left: 14 }}>
                  <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '0.68rem', letterSpacing: '0.18em', textTransform: 'uppercase', padding: '4px 12px', borderRadius: 2, background: 'rgba(180,140,30,.2)', border: '1px solid rgba(180,140,30,.45)', color: '#c9a84c' }}>
                    {camisa.tag}
                  </span>
                </div>
              )}
            </div>

            <div style={{ padding: '22px 24px 26px' }}>
              <div className="condensed" style={{ fontSize: '0.62rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(240,234,214,.3)', marginBottom: 8 }}>Seu Pedido</div>
              <h2 style={{ fontSize: '1.5rem', letterSpacing: '0.03em', marginBottom: 4, lineHeight: 1 }}>{camisa.nome}</h2>
              {camisa.cores && (
                <div className="condensed" style={{ fontSize: '0.68rem', letterSpacing: '0.18em', color: '#c9a84c', textTransform: 'uppercase', marginBottom: 8 }}>{camisa.cores}</div>
              )}

              {/* Tamanho selecionado no card */}
              {tamanho && (
                <div style={{ marginBottom: 12 }}>
                  <span className="condensed" style={{ fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(240,234,214,.3)' }}>Tamanho: </span>
                  <span className="condensed" style={{ fontSize: '0.75rem', letterSpacing: '0.15em', color: '#c9a84c', fontWeight: 600 }}>{tamanho}</span>
                </div>
              )}

              <p className="body-font" style={{ fontSize: '0.82rem', color: 'rgba(240,234,214,.38)', lineHeight: 1.6, marginBottom: 18 }}>{camisa.descricao}</p>
              <div style={{ height: 1, background: 'linear-gradient(90deg, rgba(180,140,30,.3), transparent)', marginBottom: 18 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div className="condensed" style={{ fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(240,234,214,.28)', marginBottom: 2 }}>Total</div>
                  <div style={{ fontSize: '1.7rem', lineHeight: 1, background: 'linear-gradient(135deg, #c9a84c, #f0d060, #a07820)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    {camisa.precoFormatado}
                  </div>
                </div>
                <button
                  onClick={() => router.push('/')}
                  className="condensed"
                  style={{ padding: '8px 16px', background: 'transparent', border: '1px solid rgba(180,140,30,.2)', borderRadius: 3, color: 'rgba(240,234,214,.3)', cursor: 'pointer', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', transition: 'all 0.2s', fontFamily: "'Barlow Condensed', sans-serif" }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#c9a84c'; e.currentTarget.style.borderColor = 'rgba(180,140,30,.4)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(240,234,214,.3)'; e.currentTarget.style.borderColor = 'rgba(180,140,30,.2)'; }}
                >
                  TROCAR
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function FormPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080808' }}>
        <p style={{ color: '#c9a84c', fontFamily: 'Barlow, sans-serif' }}>Carregando...</p>
      </div>
    }>
      <FormContent />
    </Suspense>
  );
}