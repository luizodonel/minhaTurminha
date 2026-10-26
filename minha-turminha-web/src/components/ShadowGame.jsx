import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, RotateCcw, Sparkles, Star, Trophy, HelpCircle } from 'lucide-react';
import { api } from '../services/api';
import { soundService } from '../services/soundService';

export function ShadowGame({ currentChild, onBack }) {
  const [fotos, setFotos] = useState([]);
  const [targetPhoto, setTargetPhoto] = useState(null);
  const [options, setOptions] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  const TOTAL_ROUNDS = 5;

  useEffect(() => {
    loadFotos();
  }, [currentChild]);

  const loadFotos = async () => {
    setLoading(true);
    const list = await api.getFotos(currentChild?.id || 1);
    setFotos(list);
    setRound(1);
    setScore(0);
    setIsFinished(false);
    nextRound(list, 1);
    setLoading(false);
  };

  const nextRound = (poolList, currentRoundNum) => {
    const pool = (poolList && poolList.length >= 2) ? poolList : fotos;
    if (pool.length === 0) return;

    setSelectedIdx(null);
    setIsCorrect(null);

    // Seleciona um alvo
    const target = pool[Math.floor(Math.random() * pool.length)];
    setTargetPhoto(target);

    // Seleciona opções (alvo + 2 distrações)
    const others = pool.filter(f => f.id !== target.id).sort(() => Math.random() - 0.5);
    const roundOptions = [target, ...others.slice(0, 2)].sort(() => Math.random() - 0.5);
    setOptions(roundOptions);
  };

  const handleSelectOption = (option, idx) => {
    if (selectedIdx !== null || isFinished) return;

    setSelectedIdx(idx);

    if (option.id === targetPhoto.id) {
      // ACERTOU!
      setIsCorrect(true);
      soundService.playSuccess();
      setScore(prev => prev + 1);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.5 }
      });

      setTimeout(() => {
        if (round >= TOTAL_ROUNDS) {
          setIsFinished(true);
          soundService.playFanfare();
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 }
          });
        } else {
          setRound(prev => prev + 1);
          nextRound(fotos, round + 1);
        }
      }, 1600);
    } else {
      // Tente novamente suavemente
      setIsCorrect(false);
      soundService.playBoop();

      setTimeout(() => {
        setSelectedIdx(null);
        setIsCorrect(null);
      }, 1000);
    }
  };

  if (loading || !targetPhoto) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <span style={{ fontSize: '3rem' }}>🌑</span>
        <h3 style={{ marginTop: '1rem' }}>Preparando as sombras...</h3>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '650px', margin: '0 auto', padding: '1rem' }}>
      {/* Barra de Status */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#fff',
        padding: '0.75rem 1.25rem',
        borderRadius: '1.5rem',
        marginBottom: '1.25rem',
        boxShadow: 'var(--card-shadow)',
        border: '3px solid #e2e8f0'
      }}>
        <button
          onClick={() => {
            soundService.playPop();
            onBack();
          }}
          className="kid-btn"
          style={{ background: '#f1f5f9', color: '#475569', padding: '0.45rem 1rem', fontSize: '0.9rem' }}
        >
          <ArrowLeft size={18} />
          <span>Voltar</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: '#6366f1', fontSize: '1rem' }}>
            RODADA {round} / {TOTAL_ROUNDS}
          </span>
          <span style={{ background: '#fef3c7', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontWeight: 800, color: '#b45309', fontSize: '0.9rem' }}>
            ⭐ {score}
          </span>
        </div>

        <button
          onClick={() => {
            soundService.playPop();
            loadFotos();
          }}
          className="kid-btn"
          style={{ background: '#f8fafc', color: '#64748b', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {isFinished ? (
        /* Tela de Fim do Jogo */
        <div style={{
          background: '#fff',
          borderRadius: '2rem',
          padding: '3rem 1.5rem',
          textAlign: 'center',
          boxShadow: 'var(--card-shadow)',
          border: '4px solid #c7d2fe'
        }}>
          <span style={{ fontSize: '4.5rem', display: 'inline-block', marginBottom: '0.5rem' }}>🏆</span>
          <h2 style={{ fontSize: '2.2rem', color: '#6366f1', marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>
            PARABÉNS, {currentChild?.nome?.toUpperCase() || 'AMIGUINHO'}!
          </h2>
          <p style={{ fontSize: '1.2rem', color: '#64748b', marginBottom: '1.5rem' }}>
            Você desvendou <strong>{score} de {TOTAL_ROUNDS}</strong> sombras da sua turminha! ✨
          </p>
          <button
            onClick={() => {
              soundService.playPop();
              loadFotos();
            }}
            className="kid-btn"
            style={{ background: '#6366f1', color: '#fff', padding: '0.85rem 2.2rem', fontSize: '1.15rem' }}
          >
            <RotateCcw size={20} />
            <span>Jogar Novamente</span>
          </button>
        </div>
      ) : (
        <div>
          {/* Instrução */}
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.75rem', color: '#0f172a', fontFamily: 'var(--font-display)', marginBottom: '0.3rem' }}>
              De quem é essa sombra? 👤❓
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#64748b' }}>
              Olhe o formato da silhueta e toque na foto correspondente!
            </p>
          </div>

          {/* Pedestal da Silhueta / Sombra */}
          <div style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
            borderRadius: '2rem',
            padding: '2rem 1rem',
            textAlign: 'center',
            marginBottom: '1.5rem',
            boxShadow: '0 12px 30px rgba(49, 46, 129, 0.25)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Spotlight Glow */}
            <div style={{
              width: '180px',
              height: '180px',
              margin: '0 auto',
              borderRadius: '50%',
              background: isCorrect ? '#ec4899' : 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 70%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px',
              transition: 'all 0.4s ease',
              boxShadow: isCorrect ? '0 0 40px #ec4899' : 'none'
            }}>
              <img
                src={targetPhoto.urlThumb || targetPhoto.urlOriginal}
                alt={targetPhoto.rotulo}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=320&auto=format&fit=crop&q=80';
                }}
                style={{
                  width: '160px',
                  height: '160px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  // Se acertou revela a foto normal, caso contrário fica sombra preta
                  filter: isCorrect ? 'none' : 'brightness(0) contrast(150%) drop-shadow(0 6px 12px rgba(0,0,0,0.5))',
                  transition: 'filter 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.4s ease',
                  transform: isCorrect ? 'scale(1.08)' : 'scale(1)'
                }}
              />
            </div>

            {isCorrect && (
              <div style={{
                marginTop: '1rem',
                color: '#fff',
                fontFamily: 'var(--font-display)',
                fontSize: '1.4rem',
                fontWeight: 800,
                animation: 'bounceIn 0.3s ease'
              }}>
                ✨ É o(a) {targetPhoto.rotulo}! ✨
              </div>
            )}
          </div>

          {/* Opções Coloridas para Associar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem'
          }}>
            {options.map((opt, idx) => {
              const isSelected = selectedIdx === idx;
              let border = '4px solid #fff';
              let shadow = 'var(--card-shadow)';

              if (isSelected) {
                if (isCorrect === true) {
                  border = '5px solid #10b981';
                  shadow = '0 0 25px rgba(16, 185, 129, 0.6)';
                } else if (isCorrect === false) {
                  border = '5px solid #ef4444';
                }
              }

              return (
                <div
                  key={opt.id}
                  onClick={() => handleSelectOption(opt, idx)}
                  style={{
                    background: '#fff',
                    borderRadius: '1.5rem',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border,
                    boxShadow: shadow,
                    transform: isSelected && isCorrect ? 'scale(1.05)' : 'none',
                    transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    textAlign: 'center'
                  }}
                >
                  <img
                    src={opt.urlThumb || opt.urlOriginal}
                    alt={opt.rotulo}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=320&auto=format&fit=crop&q=80';
                    }}
                    style={{ width: '100%', height: '120px', objectFit: 'cover' }}
                  />
                  <div style={{
                    padding: '0.65rem 0.25rem',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    color: '#1e293b'
                  }}>
                    {opt.rotulo}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
