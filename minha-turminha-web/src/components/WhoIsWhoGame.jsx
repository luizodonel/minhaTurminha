import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, RotateCcw, Heart, Star, Sparkles, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { soundService } from '../services/soundService';

export function WhoIsWhoGame({ currentChild, onBack }) {
  const [fotos, setFotos] = useState([]);
  const [targetPhoto, setTargetPhoto] = useState(null);
  const [options, setOptions] = useState([]);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  const TOTAL_ROUNDS = 5;

  useEffect(() => {
    loadGameData();
  }, [currentChild]);

  const loadGameData = async () => {
    setLoading(true);
    const list = await api.getFotos(currentChild?.id || 1);
    setFotos(list);
    setRound(1);
    setScore(0);
    setIsFinished(false);
    nextRound(list);
    setLoading(false);
  };

  const nextRound = (availableList) => {
    const pool = (availableList && availableList.length >= 3) ? availableList : fotos;
    if (pool.length === 0) return;

    setSelectedIdx(null);
    setIsCorrect(null);

    // Seleciona um alvo aleatório
    const target = pool[Math.floor(Math.random() * pool.length)];
    setTargetPhoto(target);

    // Seleciona 2 ou 3 opções adicionais diferentes
    const remaining = pool.filter(f => f.id !== target.id).sort(() => Math.random() - 0.5);
    const roundOptions = [target, ...remaining.slice(0, 2)].sort(() => Math.random() - 0.5);
    setOptions(roundOptions);
  };

  const handleSelectOption = (option, idx) => {
    if (selectedIdx !== null) return;
    setSelectedIdx(idx);

    if (option.id === targetPhoto.id) {
      // ACERTOU! 🌟
      setIsCorrect(true);
      soundService.playSuccess();
      setScore(prev => prev + 1);

      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });

      setTimeout(() => {
        if (round >= TOTAL_ROUNDS) {
          setIsFinished(true);
          soundService.playFanfare();
        } else {
          setRound(prev => prev + 1);
          nextRound(fotos);
        }
      }, 1500);
    } else {
      // Tentativa amigável
      setIsCorrect(false);
      soundService.playBoop();
      setTimeout(() => {
        setSelectedIdx(null);
        setIsCorrect(null);
      }, 1000);
    }
  };

  return (
    <div style={{ maxWidth: '750px', margin: '0 auto', padding: '1rem' }}>
      {/* Barra de Status */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#fff',
        padding: '0.75rem 1.25rem',
        borderRadius: '1.5rem',
        marginBottom: '1.5rem',
        boxShadow: 'var(--card-shadow)',
        border: '3px solid #bbf7d0'
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.15rem', color: '#059669' }}>
            RODADA {round} / {TOTAL_ROUNDS}
          </span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.15rem', color: '#f59e0b' }}>
            ⭐ {score} PONTOS
          </span>
        </div>

        <button
          onClick={() => {
            soundService.playPop();
            loadGameData();
          }}
          className="kid-btn"
          style={{ background: '#fef3c7', color: '#b45309', padding: '0.45rem 1rem', fontSize: '0.9rem' }}
        >
          <RotateCcw size={18} />
          <span>Novo Jogo</span>
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <span style={{ fontSize: '3rem' }}>🔍</span>
          <h3 style={{ marginTop: '1rem' }}>Carregando as fotos...</h3>
        </div>
      ) : isFinished ? (
        /* Tela de Fim do Jogo */
        <div style={{
          background: '#fff',
          borderRadius: '2rem',
          padding: '3rem 1.5rem',
          textAlign: 'center',
          boxShadow: 'var(--card-shadow)',
          border: '4px solid #fde68a'
        }}>
          <span style={{ fontSize: '4.5rem', display: 'inline-block', marginBottom: '0.5rem' }}>🌟</span>
          <h2 style={{ fontSize: '2.2rem', color: '#ea580c', marginBottom: '0.5rem' }}>
            MUITO BEM, {currentChild?.nome?.toUpperCase() || 'AMIGUINHO'}!
          </h2>
          <p style={{ fontSize: '1.2rem', color: '#64748b', marginBottom: '1.5rem' }}>
            Você acertou <strong>{score} de {TOTAL_ROUNDS}</strong> rostos da sua turminha! ⭐
          </p>

          <button
            onClick={() => {
              soundService.playPop();
              loadGameData();
            }}
            className="kid-btn"
            style={{ background: '#10b981', color: '#fff', padding: '0.9rem 2rem', fontSize: '1.15rem' }}
          >
            <RotateCcw size={22} />
            <span>Jogar Mais Uma Vez</span>
          </button>
        </div>
      ) : (
        <div>
          {/* Pergunta Grande Lúdica */}
          <div style={{
            background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
            border: '4px dashed #f59e0b',
            borderRadius: '2rem',
            padding: '1.5rem',
            textAlign: 'center',
            marginBottom: '2rem',
            boxShadow: '0 8px 20px rgba(245, 158, 11, 0.15)'
          }}>
            <span style={{ fontSize: '1rem', color: '#b45309', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
              TOQUE NA FOTO CERTA:
            </span>
            <h2 style={{
              fontSize: '2.2rem',
              color: '#0f172a',
              marginTop: '0.4rem',
              fontFamily: 'var(--font-display)'
            }}>
              Onde está <span style={{ color: '#ea580c', textDecoration: 'underline' }}>{targetPhoto?.rotulo}</span>? ⭐
            </h2>
          </div>

          {/* Opções de Fotos */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.25rem'
          }}>
            {options.map((opt, idx) => {
              const isSelected = selectedIdx === idx;
              let borderStyle = '4px solid #fff';
              let shadowStyle = 'var(--card-shadow)';

              if (isSelected) {
                if (isCorrect === true) {
                  borderStyle = '6px solid #10b981';
                  shadowStyle = '0 0 25px rgba(16, 185, 129, 0.5)';
                } else if (isCorrect === false) {
                  borderStyle = '6px solid #f59e0b';
                }
              }

              return (
                <div
                  key={opt.id}
                  onClick={() => handleSelectOption(opt, idx)}
                  style={{
                    background: '#fff',
                    borderRadius: '2rem',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: borderStyle,
                    boxShadow: shadowStyle,
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
                    style={{ width: '100%', height: '220px', objectFit: 'cover', display: 'block' }}
                  />
                  <div style={{
                    padding: '0.85rem',
                    background: '#fff',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 800,
                    fontSize: '1.25rem',
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
