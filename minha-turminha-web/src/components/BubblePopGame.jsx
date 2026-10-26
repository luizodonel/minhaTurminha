import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, RotateCcw, Sparkles, Trophy, Heart } from 'lucide-react';
import { api } from '../services/api';
import { soundService } from '../services/soundService';

export function BubblePopGame({ currentChild, onBack }) {
  const [fotos, setFotos] = useState([]);
  const [bubbles, setBubbles] = useState([]);
  const [score, setScore] = useState(0);
  const [targetPhoto, setTargetPhoto] = useState(null);
  const [isWon, setIsWon] = useState(false);
  const [poppedCount, setPoppedCount] = useState(0);

  const GOAL_POPS = 15;
  const bubbleIdCounter = useRef(1);
  const spawnTimerRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    loadFotos();
    return () => {
      clearInterval(spawnTimerRef.current);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [currentChild]);

  const loadFotos = async () => {
    const list = await api.getFotos(currentChild?.id || 1);
    setFotos(list);
    setScore(0);
    setPoppedCount(0);
    setIsWon(false);
    setBubbles([]);

    if (list.length > 0) {
      // Sorteia um alvo da missão
      const target = list[Math.floor(Math.random() * list.length)];
      setTargetPhoto(target);
    }
  };

  // Gerador contínuo de bolhas subindo
  useEffect(() => {
    if (fotos.length === 0 || isWon) return;

    spawnTimerRef.current = setInterval(() => {
      setBubbles((prev) => {
        if (prev.length >= 8) return prev; // Limite na tela para não sobrecarregar
        const randomPhoto = fotos[Math.floor(Math.random() * fotos.length)];
        const size = Math.floor(Math.random() * 25) + 85; // 85px a 110px
        const left = Math.floor(Math.random() * 75) + 5; // 5% a 80%

        const newBubble = {
          id: bubbleIdCounter.current++,
          photo: randomPhoto,
          size,
          x: left,
          y: 110, // começa abaixo da tela (110%)
          speed: Math.random() * 0.45 + 0.35, // velocidade de subida suave
          drift: Math.sin(Math.random() * Math.PI) * 1.5,
          isPopping: false
        };
        return [...prev, newBubble];
      });
    }, 900);

    // Loop de movimento
    let lastTime = performance.now();
    const updatePositions = (now) => {
      const delta = (now - lastTime) / 16;
      lastTime = now;

      setBubbles((prev) =>
        prev
          .map((b) => ({
            ...b,
            y: b.isPopping ? b.y : b.y - b.speed * delta
          }))
          .filter((b) => b.y > -20) // remove as que passaram do topo
      );

      animationFrameRef.current = requestAnimationFrame(updatePositions);
    };

    animationFrameRef.current = requestAnimationFrame(updatePositions);

    return () => {
      clearInterval(spawnTimerRef.current);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [fotos, isWon]);

  const popBubble = (bubbleId, isTarget) => {
    soundService.playBubblePop();

    setBubbles((prev) =>
      prev.map((b) => (b.id === bubbleId ? { ...b, isPopping: true } : b))
    );

    // Remove após animação
    setTimeout(() => {
      setBubbles((prev) => prev.filter((b) => b.id !== bubbleId));
    }, 250);

    const bonus = isTarget ? 2 : 1;
    setScore((prev) => prev + bonus);

    setPoppedCount((prev) => {
      const nextCount = prev + 1;
      if (nextCount >= GOAL_POPS && !isWon) {
        handleVictory();
      }
      return nextCount;
    });
  };

  const handleVictory = () => {
    setIsWon(true);
    soundService.playFanfare();
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 }
    });
  };

  return (
    <div style={{ maxWidth: '750px', margin: '0 auto', padding: '1rem', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      {/* Barra de Status */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#fff',
        padding: '0.75rem 1.25rem',
        borderRadius: '1.5rem',
        marginBottom: '0.75rem',
        boxShadow: 'var(--card-shadow)',
        border: '3px solid #bae6fd',
        flexShrink: 0
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

        {targetPhoto && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f0fdf4', padding: '0.3rem 0.8rem', borderRadius: '1rem', border: '2px solid #bbf7d0' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#166534' }}>ALVO:</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: '#059669', fontSize: '1rem' }}>
              {targetPhoto.rotulo} 🎯
            </span>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ background: '#fef3c7', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontWeight: 800, color: '#b45309', fontSize: '1rem' }}>
            🫧 {poppedCount} / {GOAL_POPS}
          </span>
        </div>
      </div>

      {/* Tanque do Céu / Arena das Bolhas */}
      <div style={{
        flex: 1,
        position: 'relative',
        background: 'linear-gradient(180deg, #e0f2fe 0%, #f0fdf4 100%)',
        borderRadius: '2rem',
        overflow: 'hidden',
        boxShadow: 'var(--card-shadow)',
        border: '4px solid #fff',
        userSelect: 'none',
        touchAction: 'none'
      }}>
        {/* Nuvens e Brilhos decorativos no fundo */}
        <div style={{ position: 'absolute', top: '15px', left: '20px', fontSize: '2.5rem', opacity: 0.7 }}>☁️</div>
        <div style={{ position: 'absolute', top: '40px', right: '30px', fontSize: '2rem', opacity: 0.6 }}>☁️</div>

        {/* Bolhas Flutuantes */}
        {bubbles.map((b) => {
          const isTarget = targetPhoto && b.photo.id === targetPhoto.id;

          return (
            <div
              key={b.id}
              onClick={() => popBubble(b.id, isTarget)}
              onTouchStart={(e) => {
                e.preventDefault();
                popBubble(b.id, isTarget);
              }}
              style={{
                position: 'absolute',
                left: `${b.x}%`,
                top: `${b.y}%`,
                width: `${b.size}px`,
                height: `${b.size}px`,
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.9) 0%, rgba(186, 230, 253, 0.5) 50%, rgba(56, 189, 248, 0.65) 100%)',
                boxShadow: isTarget
                  ? '0 0 25px rgba(236, 72, 153, 0.8), inset 0 0 15px rgba(255, 255, 255, 0.9)'
                  : '0 8px 20px rgba(56, 189, 248, 0.35), inset 0 0 15px rgba(255, 255, 255, 0.9)',
                border: isTarget ? '3px solid #ec4899' : '2px solid rgba(255, 255, 255, 0.8)',
                transform: b.isPopping ? 'scale(1.4)' : 'scale(1)',
                opacity: b.isPopping ? 0 : 1,
                transition: b.isPopping ? 'all 0.2s ease-out' : 'transform 0.1s ease',
                zIndex: 10
              }}
            >
              {/* Brilho da Bolha */}
              <div style={{
                position: 'absolute',
                top: '12%',
                left: '18%',
                width: '24%',
                height: '16%',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.85)',
                transform: 'rotate(-35deg)',
                pointerEvents: 'none'
              }} />

              {/* Foto Dentro da Bolha */}
              <img
                src={b.photo.urlThumb || b.photo.urlOriginal}
                alt={b.photo.rotulo}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=320&auto=format&fit=crop&q=80';
                }}
                style={{
                  width: `${b.size * 0.68}px`,
                  height: `${b.size * 0.68}px`,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  pointerEvents: 'none',
                  border: '2px solid rgba(255, 255, 255, 0.9)'
                }}
              />
            </div>
          );
        })}

        {/* Modal de Vitória */}
        {isWon && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            zIndex: 50
          }}>
            <div style={{
              background: '#fff',
              borderRadius: '2rem',
              padding: '2.5rem 1.5rem',
              textAlign: 'center',
              boxShadow: 'var(--card-shadow)',
              border: '4px solid #38bdf8',
              maxWidth: '420px',
              width: '100%'
            }}>
              <span style={{ fontSize: '4.5rem', display: 'inline-block', marginBottom: '0.5rem' }}>🫧🎉</span>
              <h2 style={{ fontSize: '2rem', color: '#0284c7', marginBottom: '0.4rem', fontFamily: 'var(--font-display)' }}>
                MUITO BEM!
              </h2>
              <p style={{ fontSize: '1.1rem', color: '#64748b', marginBottom: '1.5rem' }}>
                Você estourou todas as bolhas mágicas da sua turminha!
              </p>
              <button
                onClick={() => {
                  soundService.playPop();
                  loadFotos();
                }}
                className="kid-btn"
                style={{ background: '#0284c7', color: '#fff', padding: '0.85rem 2rem', fontSize: '1.15rem' }}
              >
                <RotateCcw size={20} />
                <span>Estourar Mais Bolhas</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
