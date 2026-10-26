import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, RotateCcw, Sparkles, Trophy, Star, CheckCircle } from 'lucide-react';
import { api } from '../services/api';
import { soundService } from '../services/soundService';

export function SequenceGame({ currentChild, onBack }) {
  const [fotos, setFotos] = useState([]);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modo: 'tamanho' ou 'sequencia'
  const [mode, setMode] = useState('tamanho');

  // Estado para Modo Tamanho
  const [sizeTargetPhoto, setSizeTargetPhoto] = useState(null);
  const [sizeCards, setSizeCards] = useState([]); // [ { id, scale, sizeLabel } ]
  const [placedSizes, setPlacedSizes] = useState([null, null, null]); // [small, medium, large]

  // Estado para Modo Sequência
  const [sequencePattern, setSequencePattern] = useState([]); // ex: [A, B, A, B]
  const [missingIdx, setMissingIdx] = useState(4);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [sequenceOptions, setSequenceOptions] = useState([]);

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
    startRound(list, 1);
    setLoading(false);
  };

  const startRound = (poolList, currentRoundNum) => {
    const pool = (poolList && poolList.length >= 2) ? poolList : fotos;
    if (pool.length === 0) return;

    // Alterna modos: rodadas ímpares = tamanho, pares = sequência
    if (currentRoundNum % 2 !== 0) {
      setupSizeMode(pool);
    } else {
      setupSequenceMode(pool);
    }
  };

  // Configura Modo Ordenação de Tamanhos (Pequeno, Médio, Grande)
  const setupSizeMode = (pool) => {
    setMode('tamanho');
    setPlacedSizes([null, null, null]);

    const target = pool[Math.floor(Math.random() * pool.length)];
    setSizeTargetPhoto(target);

    // 3 tamanhos embaralhados
    const cards = [
      { id: 'p', label: 'Pequeno', scale: 0.65, px: 65 },
      { id: 'm', label: 'Médio', scale: 1.0, px: 95 },
      { id: 'g', label: 'Grande', scale: 1.35, px: 130 }
    ].sort(() => Math.random() - 0.5);

    setSizeCards(cards);
  };

  // Configura Modo Sequência Lógica (ABAB)
  const setupSequenceMode = (pool) => {
    setMode('sequencia');

    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const photoA = shuffled[0];
    const photoB = shuffled[1] || shuffled[0];

    // Padrão ABABA: [A, B, A, B, ?]
    const pattern = [photoA, photoB, photoA, photoB];
    const answer = photoA; // O quinto é A

    setSequencePattern(pattern);
    setCorrectAnswer(answer);

    // Opções
    const others = pool.filter(f => f.id !== answer.id).sort(() => Math.random() - 0.5);
    const opts = [answer, ...others.slice(0, 2)].sort(() => Math.random() - 0.5);
    setSequenceOptions(opts);
  };

  // Ao clicar em uma carta de tamanho para colocar no próximo slot vazio
  const handlePlaceSize = (card) => {
    const nextPlaced = [...placedSizes];
    const firstEmpty = nextPlaced.findIndex(s => s === null);
    if (firstEmpty === -1) return;

    soundService.playPop();
    nextPlaced[firstEmpty] = card;
    setPlacedSizes(nextPlaced);

    // Remove da bandeja
    setSizeCards(prev => prev.filter(c => c.id !== card.id));

    // Se preencheu os 3 slots, confere se está na ordem correta: Pequeno -> Médio -> Grande
    if (firstEmpty === 2) {
      const isCorrectOrder =
        nextPlaced[0]?.id === 'p' &&
        nextPlaced[1]?.id === 'm' &&
        nextPlaced[2]?.id === 'g';

      if (isCorrectOrder) {
        soundService.playSuccess();
        setScore(s => s + 1);
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.5 } });
        advanceNextRound();
      } else {
        soundService.playBoop();
        setTimeout(() => {
          setupSizeMode(fotos);
        }, 1200);
      }
    }
  };

  // Ao responder a sequência lógica
  const handleAnswerSequence = (opt) => {
    if (opt.id === correctAnswer.id) {
      soundService.playSuccess();
      setScore(s => s + 1);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.5 } });
      advanceNextRound();
    } else {
      soundService.playBoop();
    }
  };

  const advanceNextRound = () => {
    setTimeout(() => {
      if (round >= TOTAL_ROUNDS) {
        setIsFinished(true);
        soundService.playFanfare();
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      } else {
        setRound(r => r + 1);
        startRound(fotos, round + 1);
      }
    }, 1500);
  };

  if (loading || (!sizeTargetPhoto && !correctAnswer)) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <span style={{ fontSize: '3rem' }}>📏</span>
        <h3 style={{ marginTop: '1rem' }}>Preparando a lógica...</h3>
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
        border: '3px solid #ddd6fe'
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

        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: '#7c3aed', fontSize: '1rem' }}>
          DESAFIO {round} DE {TOTAL_ROUNDS}
        </span>

        <span style={{ background: '#fef3c7', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontWeight: 800, color: '#b45309', fontSize: '1rem' }}>
          ⭐ {score} PONTOS
        </span>
      </div>

      {isFinished ? (
        /* Tela de Vitória */
        <div style={{
          background: '#fff',
          borderRadius: '2rem',
          padding: '3rem 1.5rem',
          textAlign: 'center',
          boxShadow: 'var(--card-shadow)',
          border: '4px solid #c4b5fd'
        }}>
          <span style={{ fontSize: '4.5rem', display: 'inline-block', marginBottom: '0.5rem' }}>🧠🌟</span>
          <h2 style={{ fontSize: '2.2rem', color: '#7c3aed', marginBottom: '0.4rem', fontFamily: 'var(--font-display)' }}>
            SUPER INTELIGENTE!
          </h2>
          <p style={{ fontSize: '1.2rem', color: '#64748b', marginBottom: '1.5rem' }}>
            Você completou todos os desafios lógicos da sua turminha!
          </p>
          <button
            onClick={() => {
              soundService.playPop();
              loadFotos();
            }}
            className="kid-btn"
            style={{ background: '#7c3aed', color: '#fff', padding: '0.85rem 2.2rem', fontSize: '1.15rem' }}
          >
            <RotateCcw size={20} />
            <span>Jogar Novamente</span>
          </button>
        </div>
      ) : mode === 'tamanho' ? (
        /* MODO 1: ORDENAÇÃO DE TAMANHOS */
        <div>
          <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.8rem', color: '#0f172a', fontFamily: 'var(--font-display)', marginBottom: '0.3rem' }}>
              Do Menor para o Maior! 📏
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#64748b' }}>
              Toque nas fotos do(a) <strong>{sizeTargetPhoto?.rotulo}</strong> para colocar na ordem certa!
            </p>
          </div>

          {/* 3 Casinhas de Destino: Pequeno -> Médio -> Grande */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
            background: '#f5f3ff',
            padding: '1.5rem',
            borderRadius: '2rem',
            border: '3px dashed #c4b5fd',
            marginBottom: '1.5rem'
          }}>
            {['1º Menor', '2º Médio', '3º Maior'].map((label, idx) => {
              const placed = placedSizes[idx];

              return (
                <div
                  key={idx}
                  style={{
                    aspectRatio: '1',
                    background: '#fff',
                    borderRadius: '1.5rem',
                    border: '3px solid #ddd6fe',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.5rem',
                    boxShadow: 'var(--card-shadow)',
                    position: 'relative'
                  }}
                >
                  <span style={{ position: 'absolute', top: '8px', fontSize: '0.75rem', fontWeight: 800, color: '#7c3aed' }}>
                    {label}
                  </span>

                  {placed ? (
                    <img
                      src={sizeTargetPhoto?.urlThumb || sizeTargetPhoto?.urlOriginal}
                      alt={sizeTargetPhoto?.rotulo}
                      style={{
                        width: `${placed.px * 0.7}px`,
                        height: `${placed.px * 0.7}px`,
                        borderRadius: '1rem',
                        objectFit: 'cover',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: '2rem', opacity: 0.3 }}>❓</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bandeja de Cartas para Selecionar */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.25rem', minHeight: '150px' }}>
            {sizeCards.map((card) => (
              <div
                key={card.id}
                onClick={() => handlePlaceSize(card)}
                style={{
                  width: `${card.px}px`,
                  height: `${card.px}px`,
                  borderRadius: '1.25rem',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: '4px solid #7c3aed',
                  boxShadow: '0 8px 20px rgba(124, 58, 237, 0.25)',
                  transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <img
                  src={sizeTargetPhoto?.urlThumb || sizeTargetPhoto?.urlOriginal}
                  alt={sizeTargetPhoto?.rotulo}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* MODO 2: SEQUÊNCIA LÓGICA (ABAB) */
        <div>
          <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.8rem', color: '#0f172a', fontFamily: 'var(--font-display)', marginBottom: '0.3rem' }}>
              Quem é o próximo da fila? 🧩
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#64748b' }}>
              Observe o padrão das fotos e escolha quem completa a sequência!
            </p>
          </div>

          {/* Linha da Sequência */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.65rem',
            background: '#f5f3ff',
            padding: '1.25rem 0.75rem',
            borderRadius: '2rem',
            border: '3px solid #ddd6fe',
            marginBottom: '1.75rem',
            overflowX: 'auto'
          }}>
            {sequencePattern.map((p, idx) => (
              <div key={idx} style={{ textAlign: 'center', flexShrink: 0 }}>
                <img
                  src={p.urlThumb || p.urlOriginal}
                  alt={p.rotulo}
                  style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '1rem',
                    objectFit: 'cover',
                    border: '3px solid #fff',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                  }}
                />
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#4b5563', marginTop: '0.2rem' }}>
                  {p.rotulo}
                </div>
              </div>
            ))}

            {/* Ponto de Interrogação */}
            <div style={{
              width: '68px',
              height: '68px',
              borderRadius: '1rem',
              border: '3px dashed #7c3aed',
              background: '#ede9fe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.8rem',
              color: '#7c3aed',
              fontWeight: 800,
              flexShrink: 0
            }}>
              ?
            </div>
          </div>

          {/* Opções de Resposta */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {sequenceOptions.map((opt) => (
              <div
                key={opt.id}
                onClick={() => handleAnswerSequence(opt)}
                style={{
                  background: '#fff',
                  borderRadius: '1.5rem',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: '4px solid #fff',
                  boxShadow: 'var(--card-shadow)',
                  textAlign: 'center',
                  transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
              >
                <img
                  src={opt.urlThumb || opt.urlOriginal}
                  alt={opt.rotulo}
                  style={{ width: '100%', height: '110px', objectFit: 'cover' }}
                />
                <div style={{ padding: '0.5rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: '#1e293b' }}>
                  {opt.rotulo}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
