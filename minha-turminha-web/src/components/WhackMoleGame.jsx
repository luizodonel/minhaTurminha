import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, RotateCcw, Sparkles, Trophy, Heart, Star } from 'lucide-react';
import { api } from '../services/api';
import { soundService } from '../services/soundService';

export function WhackMoleGame({ currentChild, onBack }) {
  const [fotos, setFotos] = useState([]);
  const [holes, setHoles] = useState([null, null, null, null, null, null]); // 6 janelinhas
  const [targetPhoto, setTargetPhoto] = useState(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  const TOTAL_ROUNDS = 8;
  const loopTimerRef = useRef(null);

  useEffect(() => {
    loadFotos();
    return () => clearInterval(loopTimerRef.current);
  }, [currentChild]);

  const loadFotos = async () => {
    setLoading(true);
    const list = await api.getFotos(currentChild?.id || 1);
    setFotos(list);
    setScore(0);
    setRound(1);
    setIsFinished(false);
    setLoading(false);
    if (list.length > 0) {
      startNewRound(list, 1);
    }
  };

  const startNewRound = (poolList, currentRoundNum) => {
    const pool = (poolList && poolList.length > 0) ? poolList : fotos;
    if (pool.length === 0) return;

    // Sorteia o alvo
    const target = pool[Math.floor(Math.random() * pool.length)];
    setTargetPhoto(target);

    // Coloca 2 ou 3 fotos em buracos aleatórios
    const newHoles = [null, null, null, null, null, null];
    const availableHoleIdxs = [0, 1, 2, 3, 4, 5].sort(() => Math.random() - 0.5);

    // O alvo sempre aparece em uma das janelinhas
    const targetHole = availableHoleIdxs[0];
    newHoles[targetHole] = target;

    // Mais 1 ou 2 familiares em outras janelinhas
    const others = pool.filter(f => f.id !== target.id).sort(() => Math.random() - 0.5);
    if (others[0]) newHoles[availableHoleIdxs[1]] = others[0];
    if (others[1]) newHoles[availableHoleIdxs[2]] = others[1];

    setHoles(newHoles);
  };

  const handleHoleClick = (photo, holeIdx) => {
    if (!photo || isFinished) return;

    if (photo.id === targetPhoto.id) {
      // ACERTOU!
      soundService.playSuccess();
      setScore(prev => prev + 1);

      // Animação de acerto
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.6 }
      });

      // Esconde o buraco clicado
      setHoles(prev => {
        const next = [...prev];
        next[holeIdx] = null;
        return next;
      });

      setTimeout(() => {
        if (round >= TOTAL_ROUNDS) {
          setIsFinished(true);
          soundService.playFanfare();
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 }
          });
        } else {
          setRound(r => r + 1);
          startNewRound(fotos, round + 1);
        }
      }, 700);
    } else {
      // Clicou no familiar errado suavemente
      soundService.playBoop();
    }
  };

  if (loading || !targetPhoto) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <span style={{ fontSize: '3rem' }}>🏰</span>
        <h3 style={{ marginTop: '1rem' }}>Preparando as janelinhas...</h3>
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
        marginBottom: '1rem',
        boxShadow: 'var(--card-shadow)',
        border: '3px solid #fed7aa'
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

        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: '#ea580c', fontSize: '1rem' }}>
          RODADA {round} DE {TOTAL_ROUNDS}
        </span>

        <span style={{ background: '#fef3c7', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontWeight: 800, color: '#b45309', fontSize: '1rem' }}>
          ⭐ {score} PONTOS
        </span>
      </div>

      {isFinished ? (
        /* Fim de Jogo */
        <div style={{
          background: '#fff',
          borderRadius: '2rem',
          padding: '3rem 1.5rem',
          textAlign: 'center',
          boxShadow: 'var(--card-shadow)',
          border: '4px solid #fed7aa'
        }}>
          <span style={{ fontSize: '4.5rem', display: 'inline-block', marginBottom: '0.5rem' }}>🏰🌟</span>
          <h2 style={{ fontSize: '2.2rem', color: '#ea580c', marginBottom: '0.4rem', fontFamily: 'var(--font-display)' }}>
            PARABÉNS, {currentChild?.nome?.toUpperCase() || 'CAMPEÃO'}!
          </h2>
          <p style={{ fontSize: '1.2rem', color: '#64748b', marginBottom: '1.5rem' }}>
            Você achou todo mundo nas janelinhas mágicas!
          </p>
          <button
            onClick={() => {
              soundService.playPop();
              loadFotos();
            }}
            className="kid-btn"
            style={{ background: '#ea580c', color: '#fff', padding: '0.85rem 2.2rem', fontSize: '1.15rem' }}
          >
            <RotateCcw size={20} />
            <span>Jogar Novamente</span>
          </button>
        </div>
      ) : (
        <div>
          {/* Instrução Chamativa */}
          <div style={{
            background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
            border: '4px dashed #fb923c',
            borderRadius: '1.75rem',
            padding: '1rem',
            textAlign: 'center',
            marginBottom: '1.5rem',
            boxShadow: '0 6px 18px rgba(251, 146, 60, 0.15)'
          }}>
            <span style={{ fontSize: '0.9rem', color: '#c2410c', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
              ACHE RÁPIDO:
            </span>
            <h2 style={{ fontSize: '2rem', color: '#9a3412', fontFamily: 'var(--font-display)', margin: '0.2rem 0' }}>
              Onde está o(a) <span style={{ color: '#ec4899', textDecoration: 'underline' }}>{targetPhoto.rotulo}</span>? 💖
            </h2>
          </div>

          {/* Grade de 6 Janelinhas (Castelinho) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1.25rem',
            background: '#fed7aa',
            padding: '1.5rem',
            borderRadius: '2rem',
            boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.06)'
          }}>
            {holes.map((foto, idx) => {
              const hasPhoto = Boolean(foto);

              return (
                <div
                  key={idx}
                  onClick={() => handleHoleClick(foto, idx)}
                  style={{
                    aspectRatio: '1',
                    background: '#7c2d12',
                    borderRadius: '1.5rem',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: hasPhoto ? 'pointer' : 'default',
                    border: '5px solid #fff',
                    boxShadow: 'inset 0 8px 12px rgba(0,0,0,0.4)',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center'
                  }}
                >
                  {hasPhoto && (
                    <div style={{
                      width: '88%',
                      height: '88%',
                      borderRadius: '1.2rem',
                      overflow: 'hidden',
                      animation: 'bounceIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      border: '3px solid #fff',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                      background: '#fff'
                    }}>
                      <img
                        src={foto.urlThumb || foto.urlOriginal}
                        alt={foto.rotulo}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=320&auto=format&fit=crop&q=80';
                        }}
                        style={{ width: '100%', height: '70%', objectFit: 'cover', display: 'block' }}
                      />
                      <div style={{
                        height: '30%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        fontFamily: 'var(--font-display)',
                        color: '#1e293b',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        padding: '0 2px'
                      }}>
                        {foto.rotulo}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
