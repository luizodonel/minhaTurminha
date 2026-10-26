import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, RotateCcw, Sparkles, Trophy, Heart } from 'lucide-react';
import { api } from '../services/api';
import { soundService } from '../services/soundService';

export function ScratchGame({ currentChild, onBack }) {
  const [fotos, setFotos] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [revealedPercent, setRevealedPercent] = useState(0);
  const [loading, setLoading] = useState(true);

  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const scratchCountRef = useRef(0);

  useEffect(() => {
    loadFotos();
  }, [currentChild]);

  const loadFotos = async () => {
    setLoading(true);
    const list = await api.getFotos(currentChild?.id || 1);
    setFotos(list);
    setCurrentIdx(0);
    setLoading(false);
  };

  const currentPhoto = fotos[currentIdx];

  // Inicializa o Canvas cobrindo a foto
  useEffect(() => {
    if (!currentPhoto) return;
    initCanvas();
  }, [currentIdx, currentPhoto]);

  const initCanvas = () => {
    setIsRevealed(false);
    setRevealedPercent(0);
    scratchCountRef.current = 0;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width || 360;
    canvas.height = rect.height || 360;

    // Fundo dourado/âmbar com estrelinhas
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#fef08a');
    gradient.addColorStop(0.5, '#f59e0b');
    gradient.addColorStop(1, '#10b981');

    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Texto lúdico central
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.font = 'bold 24px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✨ Raspe Aqui! ✨', canvas.width / 2, canvas.height / 2 - 15);

    ctx.font = '16px Nunito, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillText('Passe o dedo ou mouse', canvas.width / 2, canvas.height / 2 + 20);
  };

  const scratch = (clientX, clientY) => {
    if (isRevealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 32, 0, Math.PI * 2);
    ctx.fill();

    scratchCountRef.current += 1;
    if (scratchCountRef.current % 6 === 0) {
      soundService.playPop();
    }

    // Calcula a cada 18 movimentos a porcentagem raspada
    if (scratchCountRef.current % 18 === 0) {
      checkPercentage(ctx, canvas);
    }
  };

  const checkPercentage = (ctx, canvas) => {
    try {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imgData.data;
      let transparent = 0;
      const total = pixels.length / 4;

      // Amostra a cada 4 pixels para máxima performance
      for (let i = 3; i < pixels.length; i += 16) {
        if (pixels[i] < 128) {
          transparent++;
        }
      }

      const percent = Math.min(100, Math.round((transparent / (total / 4)) * 100));
      setRevealedPercent(percent);

      if (percent >= 55 && !isRevealed) {
        completeReveal();
      }
    } catch (_) {}
  };

  const completeReveal = () => {
    setIsRevealed(true);
    setRevealedPercent(100);

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    soundService.playFanfare();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Mouse Handlers
  const handleMouseDown = (e) => {
    isDrawingRef.current = true;
    scratch(e.clientX, e.clientY);
  };

  const handleMouseMove = (e) => {
    if (!isDrawingRef.current) return;
    scratch(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    isDrawingRef.current = false;
  };

  // Touch Handlers
  const handleTouchStart = (e) => {
    isDrawingRef.current = true;
    const touch = e.touches[0];
    scratch(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e) => {
    if (!isDrawingRef.current) return;
    const touch = e.touches[0];
    scratch(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = () => {
    isDrawingRef.current = false;
  };

  const handleNextPhoto = () => {
    soundService.playPop();
    setCurrentIdx((prev) => (prev + 1) % fotos.length);
  };

  if (loading || !currentPhoto) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <span style={{ fontSize: '3rem' }}>🪄</span>
        <h3 style={{ marginTop: '1rem' }}>Preparando as fotos...</h3>
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

        <span style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          color: '#ea580c',
          fontSize: '1.1rem'
        }}>
          FOTO {currentIdx + 1} DE {fotos.length}
        </span>

        <button
          onClick={initCanvas}
          className="kid-btn"
          style={{ background: '#fef3c7', color: '#b45309', padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
        >
          <RotateCcw size={16} />
          <span>Recobrir</span>
        </button>
      </div>

      {/* Título Lúdico */}
      <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.8rem', color: '#0f172a', fontFamily: 'var(--font-display)', marginBottom: '0.3rem' }}>
          Quem está escondido aqui? 🕵️‍♂️✨
        </h2>
        <p style={{ fontSize: '0.95rem', color: '#64748b' }}>
          Raspe com o dedinho ou mouse para revelar a surpresa!
        </p>
      </div>

      {/* Card da Raspadinha */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '380px',
        aspectRatio: '1',
        margin: '0 auto 1.5rem',
        borderRadius: '2rem',
        overflow: 'hidden',
        boxShadow: 'var(--card-shadow)',
        border: isRevealed ? '6px solid #10b981' : '6px solid #fff',
        transition: 'all 0.3s ease',
        touchAction: 'none'
      }}>
        {/* Foto de Fundo Revelada */}
        <img
          src={currentPhoto.urlThumb || currentPhoto.urlOriginal}
          alt={currentPhoto.rotulo}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=320&auto=format&fit=crop&q=80';
          }}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            userSelect: 'none'
          }}
        />

        {/* Camada Canvas Raspável */}
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            cursor: isRevealed ? 'default' : 'crosshair',
            zIndex: 10,
            transition: isRevealed ? 'opacity 0.4s ease' : 'none',
            opacity: isRevealed ? 0 : 1,
            pointerEvents: isRevealed ? 'none' : 'auto'
          }}
        />
      </div>

      {/* Parabéns ao Revelar */}
      {isRevealed && (
        <div style={{
          background: '#fff',
          borderRadius: '1.5rem',
          padding: '1.5rem',
          textAlign: 'center',
          boxShadow: 'var(--card-shadow)',
          border: '4px solid #bbf7d0',
          animation: 'bounceIn 0.5s ease'
        }}>
          <span style={{ fontSize: '2.5rem' }}>💖</span>
          <h3 style={{ fontSize: '1.6rem', color: '#ec4899', margin: '0.3rem 0', fontFamily: 'var(--font-display)' }}>
            É o(a) {currentPhoto.rotulo.toUpperCase()}!
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1rem' }}>
            Parabéns, você descobriu quem estava escondido!
          </p>

          <button
            onClick={handleNextPhoto}
            className="kid-btn"
            style={{
              background: '#10b981',
              color: '#fff',
              padding: '0.75rem 2rem',
              fontSize: '1.1rem',
              boxShadow: '0 6px 16px rgba(16, 185, 129, 0.3)'
            }}
          >
            <Sparkles size={20} />
            <span>Próxima Foto</span>
          </button>
        </div>
      )}
    </div>
  );
}
