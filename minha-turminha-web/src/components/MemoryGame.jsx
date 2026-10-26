import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, RotateCcw, Trophy, Sparkles, Star } from 'lucide-react';
import { api } from '../services/api';
import { soundService } from '../services/soundService';

export function MemoryGame({ currentChild, difficulty, onBack }) {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]); // índices virados no momento
  const [matched, setMatched] = useState([]); // parIds já combinados
  const [attempts, setAttempts] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [loading, setLoading] = useState(true);

  // Inicializa o tabuleiro
  useEffect(() => {
    initGame();
  }, [currentChild, difficulty]);

  // Cronômetro do jogo
  useEffect(() => {
    let timer;
    if (startTime && !isWon) {
      timer = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [startTime, isWon]);

  const initGame = async () => {
    setLoading(true);
    setFlipped([]);
    setMatched([]);
    setAttempts(0);
    setIsWon(false);
    setStartTime(null);
    setElapsedTime(0);

    const setup = await api.getJogoMemoriaSetup(currentChild?.id || 1, difficulty || 6);
    setCards(setup.cards || []);
    setLoading(false);
  };

  const handleCardClick = (index) => {
    if (loading || isWon) return;
    if (flipped.length === 2) return;
    if (flipped.includes(index)) return;

    const clickedCard = cards[index];
    if (matched.includes(clickedCard.parId)) return;

    if (!startTime) {
      setStartTime(Date.now());
    }

    soundService.playPop();
    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    // Se virou a segunda carta, confere o par
    if (newFlipped.length === 2) {
      setAttempts(prev => prev + 1);
      const cardA = cards[newFlipped[0]];
      const cardB = cards[newFlipped[1]];

      if (cardA.parId === cardB.parId) {
        // PAR ENCONTRADO! 🎉
        setTimeout(() => {
          soundService.playSuccess();
          const nextMatched = [...matched, cardA.parId];
          setMatched(nextMatched);
          setFlipped([]);

          // Confere se completou todos os pares
          if (nextMatched.length === (difficulty || 6)) {
            handleVictory();
          }
        }, 300);
      } else {
        // Não é par: vira de volta suavemente
        setTimeout(() => {
          soundService.playBoop();
          setFlipped([]);
        }, 1100);
      }
    }
  };

  const handleVictory = () => {
    setIsWon(true);
    soundService.playFanfare();

    // Chuva de confetes festiva
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 }
    });

    // Registra pontuação no backend
    api.salvarPartida({
      criancaId: currentChild?.id || 1,
      tipoJogo: 'MEMORIA',
      pontuacao: 100,
      tempoSegundos: elapsedTime,
      tentativas: attempts + 1
    });
  };

  // Cálculo de estrelas (3 estrelas se poucas tentativas)
  const getStars = () => {
    const perfect = difficulty || 6;
    if (attempts <= perfect + 2) return 3;
    if (attempts <= perfect + 6) return 2;
    return 1;
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', padding: '1rem' }}>
      {/* Barra de Status do Jogo */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#fff',
        padding: '0.75rem 1.25rem',
        borderRadius: '1.5rem',
        marginBottom: '1.25rem',
        boxShadow: 'var(--card-shadow)',
        border: '3px solid #fde68a'
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

        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, display: 'block' }}>TEMPO</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.15rem', color: '#0284c7' }}>
              ⏱️ {formatTime(elapsedTime)}
            </span>
          </div>

          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, display: 'block' }}>PARES</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.15rem', color: '#10b981' }}>
              ⭐ {matched.length} / {difficulty || 6}
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            soundService.playPop();
            initGame();
          }}
          className="kid-btn"
          style={{ background: '#fef3c7', color: '#b45309', padding: '0.45rem 1rem', fontSize: '0.9rem' }}
        >
          <RotateCcw size={18} />
          <span>Reiniciar</span>
        </button>
      </div>

      {/* Tabuleiro do Jogo */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <span style={{ fontSize: '3rem', animation: 'floatBubble 1s infinite ease-in-out', display: 'inline-block' }}>🎈</span>
          <h3 style={{ fontSize: '1.4rem', color: '#475569', marginTop: '1rem' }}>Embaralhando as cartinhas...</h3>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: difficulty <= 4
            ? 'repeat(auto-fit, minmax(130px, 1fr))'
            : difficulty <= 6
              ? 'repeat(auto-fit, minmax(110px, 1fr))'
              : 'repeat(auto-fit, minmax(95px, 1fr))',
          gap: '1rem'
        }}>
          {cards.map((card, idx) => {
            const isCardFlipped = flipped.includes(idx) || matched.includes(card.parId);
            const isCardMatched = matched.includes(card.parId);

            return (
              <div
                key={card.id}
                className="card-container"
                onClick={() => handleCardClick(idx)}
              >
                <div className={`card-inner ${isCardFlipped ? 'is-flipped' : ''} ${isCardMatched ? 'is-matched' : ''}`}>
                  {/* Verso (virada para baixo com balão e estrela) */}
                  <div className="card-back">
                    <span style={{ fontSize: '2.5rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>🎈</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, marginTop: '0.25rem', letterSpacing: '0.5px' }}>
                      TOQUE
                    </span>
                  </div>

                  {/* Frente (foto da família / pet revelada) */}
                  <div className="card-front">
                    <img
                      src={card.urlThumb}
                      alt={card.rotulo}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=320&auto=format&fit=crop&q=80';
                      }}
                      style={{ width: '100%', height: '75%', objectFit: 'cover' }}
                    />
                    <div style={{
                      width: '100%',
                      height: '25%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#fff',
                      fontFamily: 'var(--font-display)',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      color: '#0f172a',
                      padding: '0 0.25rem'
                    }}>
                      {card.rotulo}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal / Card de Vitória */}
      {isWon && (
        <div className="modal-overlay" style={{ zIndex: 120 }}>
          <div className="modal-content" style={{ textAlign: 'center', padding: '2.5rem 1.5rem', maxWidth: '480px' }}>
            <span style={{ fontSize: '4.5rem', display: 'inline-block', marginBottom: '0.5rem' }}>🏆</span>
            <h2 style={{ fontSize: '2rem', color: '#ea580c', marginBottom: '0.5rem' }}>
              PARABÉNS, {currentChild?.nome?.toUpperCase() || 'CAMPEÃO'}!
            </h2>
            <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '1.5rem' }}>
              Você encontrou toda a sua turminha! ✨
            </p>

            {/* Estrelas */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {[1, 2, 3].map(s => (
                <Star
                  key={s}
                  size={42}
                  fill={s <= getStars() ? '#f59e0b' : '#cbd5e1'}
                  color={s <= getStars() ? '#f59e0b' : '#cbd5e1'}
                  style={{ transform: s === 2 ? 'translateY(-6px)' : 'none' }}
                />
              ))}
            </div>

            <div style={{
              background: '#f8fafc',
              borderRadius: '1rem',
              padding: '1rem',
              marginBottom: '1.75rem',
              display: 'flex',
              justifyContent: 'space-around',
              fontWeight: 700
            }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block' }}>TEMPO</span>
                <span style={{ fontSize: '1.2rem', color: '#ea580c' }}>{formatTime(elapsedTime)}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block' }}>TENTATIVAS</span>
                <span style={{ fontSize: '1.2rem', color: '#10b981' }}>{attempts}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  soundService.playPop();
                  initGame();
                }}
                className="kid-btn"
                style={{ background: '#ea580c', color: '#fff', padding: '0.85rem 1.75rem', fontSize: '1.1rem' }}
              >
                <RotateCcw size={22} />
                <span>Jogar de Novo</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
