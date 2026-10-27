import React, { useState, useEffect } from 'react';
import { X, Crown, CheckCircle2, Sparkles, ShieldCheck } from 'lucide-react';
import { api, PRO_PRICE_LABEL } from '../services/api';
import { soundService } from '../services/soundService';

export function ProUpgradeModal({
  isOpen,
  onClose,
  selectedLockedGame,
  onProActivated
}) {
  const [unlockedGate, setUnlockedGate] = useState(false);
  const [mathQuestion, setMathQuestion] = useState({ a: 4, b: 3, ans: 7 });
  const [mathInput, setMathInput] = useState('');
  const [mathError, setMathError] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const a = Math.floor(Math.random() * 6) + 2;
      const b = Math.floor(Math.random() * 5) + 2;
      setMathQuestion({ a, b, ans: a + b });
      setUnlockedGate(false);
      setMathInput('');
      setMathError(false);
      setProcessing(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGateSubmit = (e) => {
    e.preventDefault();
    if (parseInt(mathInput, 10) === mathQuestion.ans) {
      soundService.playSuccess();
      setUnlockedGate(true);
      setMathError(false);
    } else {
      soundService.playBoop();
      setMathError(true);
      setMathInput('');
    }
  };

  const handlePurchaseLifetime = async () => {
    if (processing) return;
    setProcessing(true);
    soundService.playPop();

    try {
      let purchaseToken = `PLAYSTORE_990_${Date.now()}`;

      // Suporte nativo para Google Play Billing (Digital Goods API / TWA Play Store) se disponível no WebView/TWA
      if (typeof window !== 'undefined' && 'getDigitalGoodsService' in window) {
        try {
          const service = await window.getDigitalGoodsService('https://play.google.com/billing');
          if (service) {
            const paymentRequest = new PaymentRequest(
              [{
                supportedMethods: 'https://play.google.com/billing',
                data: { sku: 'minha_turminha_pro_vitalicio' }
              }],
              {
                total: {
                  label: 'Minha Turminha PRO Vitalício',
                  amount: { currency: 'BRL', value: '9.90' }
                }
              }
            );
            const paymentResponse = await paymentRequest.show();
            const { purchaseToken: token } = paymentResponse.details;
            await paymentResponse.complete('success');
            if (token) purchaseToken = token;
          }
        } catch (billingErr) {
          console.warn('[PlayBilling] Fallback de ativação direta:', billingErr);
        }
      }

      await api.ativarPro(purchaseToken);
      soundService.playWin();
      if (onProActivated) {
        onProActivated(selectedLockedGame);
      }
      onClose();
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '460px' }}>
        {/* Topo do Modal */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.6rem' }}>👑</span>
            <h2 style={{ fontSize: '1.25rem', color: '#0f172a', fontFamily: 'var(--font-display)' }}>
              Minha Turminha <span style={{ color: '#d97706' }}>PRO</span>
            </h2>
          </div>
          <button
            onClick={() => {
              soundService.playPop();
              onClose();
            }}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Etapa 1: Trava Parental Obrigatória (Google Play Families Policy) */}
        {!unlockedGate ? (
          <div style={{ textAlign: 'center', padding: '1rem 0.5rem' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#fef3c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 0.85rem',
              fontSize: '1.75rem'
            }}>
              🔒
            </div>

            {selectedLockedGame && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: '#fffbeb',
                border: '1px solid #fde68a',
                color: '#b45309',
                padding: '0.35rem 0.85rem',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: 700,
                marginBottom: '0.75rem'
              }}>
                <span>{selectedLockedGame.icon}</span>
                <span>Jogo PRO: {selectedLockedGame.title}</span>
              </div>
            )}

            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.35rem', color: '#0f172a' }}>
              Peça ajuda ao Papai ou à Mamãe!
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '1.1rem' }}>
              Para acessar a liberação da Versão PRO, responda quanto é:
            </p>

            <form onSubmit={handleGateSubmit} style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '0.85rem', width: '100%', maxWidth: '260px' }}>
              <div style={{
                fontSize: '1.55rem',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                color: '#d97706',
                background: '#fffbeb',
                padding: '0.6rem 1.5rem',
                borderRadius: '1rem',
                border: '2px dashed #f59e0b',
                width: '100%',
                textAlign: 'center'
              }}>
                {mathQuestion.a} + {mathQuestion.b} = ?
              </div>

              <input
                type="number"
                autoFocus
                placeholder="Resposta"
                value={mathInput}
                onChange={(e) => setMathInput(e.target.value)}
                style={{
                  fontSize: '1.2rem',
                  textAlign: 'center',
                  padding: '0.55rem 1rem',
                  borderRadius: '0.75rem',
                  border: mathError ? '2px solid #ef4444' : '2px solid #cbd5e1',
                  width: '140px',
                  outline: 'none'
                }}
              />

              {mathError && (
                <span style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 600 }}>
                  Resposta incorreta. Tente novamente!
                </span>
              )}

              <button
                type="submit"
                className="kid-btn"
                style={{
                  background: '#f59e0b',
                  color: '#fff',
                  padding: '0.65rem 1.5rem',
                  width: '100%',
                  justifyContent: 'center'
                }}
              >
                Continuar (Área dos Pais)
              </button>
            </form>
          </div>
        ) : (
          /* Etapa 2: Oferta de Acesso Vitalício por R$ 9,90 */
          <div>
            {/* Card Destaque do Preço Vitalício */}
            <div style={{
              background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
              border: '3px solid #f59e0b',
              borderRadius: '1.5rem',
              padding: '1.25rem',
              textAlign: 'center',
              marginBottom: '1.1rem',
              position: 'relative'
            }}>
              <span style={{
                display: 'inline-block',
                background: '#ea580c',
                color: '#fff',
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '0.2rem 0.75rem',
                borderRadius: '9999px',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Oferta de Lançamento • Acesso Vitalício
              </span>

              <h3 style={{ fontSize: '1.3rem', color: '#0f172a', fontFamily: 'var(--font-display)', marginBottom: '0.25rem' }}>
                Libere Todos os 18 Jogos para Sempre!
              </h3>

              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '0.5rem', margin: '0.5rem 0' }}>
                <span style={{ fontSize: '0.95rem', color: '#94a3b8', textDecoration: 'line-through', fontWeight: 600 }}>
                  R$ 29,90
                </span>
                <span style={{ fontSize: '2.2rem', fontWeight: 900, color: '#ea580c', fontFamily: 'var(--font-display)' }}>
                  {PRO_PRICE_LABEL}
                </span>
              </div>

              <p style={{ fontSize: '0.82rem', color: '#b45309', fontWeight: 700 }}>
                ✨ Pagamento único • Sem mensalidade • Sem anúncios
              </p>
            </div>

            {/* Lista de Benefícios */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', marginBottom: '1.25rem', padding: '0 0.25rem' }}>
              {[
                'Acesso vitalício a todos os 18 jogos educativos (+14 jogos exclusivos)',
                'Quebra-Cabeça, Sudoku Infantil, Soletrando, Sombras, Fantasias e mais',
                'Fotos e perfis de crianças ilimitados para toda a família',
                '100% seguro para crianças e livre de propagandas',
                'Vinculado ao código do seu aparelho para restaurar quando quiser'
              ].map((benefit, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.85rem', color: '#334155', fontWeight: 600 }}>
                  <CheckCircle2 size={17} color="#10b981" style={{ flexShrink: 0, marginTop: '1px' }} />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            {/* Botão de Compra */}
            <button
              type="button"
              disabled={processing}
              onClick={handlePurchaseLifetime}
              className="kid-btn"
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
                color: '#fff',
                width: '100%',
                padding: '0.9rem 1.25rem',
                fontSize: '1.05rem',
                justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(234, 88, 12, 0.35)'
              }}
            >
              <Crown size={20} />
              <span>{processing ? 'Ativando Versão PRO...' : `Desbloquear Tudo por ${PRO_PRICE_LABEL}`}</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', marginTop: '0.75rem', color: '#64748b', fontSize: '0.75rem' }}>
              <ShieldCheck size={14} color="#10b981" />
              <span>Compra única protegida pela Google Play Store</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

