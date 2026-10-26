import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, RotateCcw, Eye, Sparkles, Trophy } from 'lucide-react';
import { api } from '../services/api';
import { soundService } from '../services/soundService';

export function PuzzleGame({ currentChild, onBack }) {
  const [fotos, setFotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [gridSize, setGridSize] = useState(2); // 2x2 = 4 peças (perfeito para crianças pequenas)
  const [tiles, setTiles] = useState([]); // array de posições atuais
  const [selectedTileIdx, setSelectedTileIdx] = useState(null);
  const [draggedIdx, setDraggedIdx] = useState(null);
  const [overIdx, setOverIdx] = useState(null);
  const [isSolved, setIsSolved] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    loadPhotos();
  }, [currentChild]);

  const loadPhotos = async () => {
    const list = await api.getFotos(currentChild?.id || 1);
    setFotos(list);
    if (list.length > 0) {
      startPuzzle(list[0], gridSize);
    }
  };

  const startPuzzle = (photo, size) => {
    setSelectedPhoto(photo);
    setGridSize(size);
    setIsSolved(false);
    setSelectedTileIdx(null);
    setDraggedIdx(null);
    setOverIdx(null);
    setMoves(0);
    setShowPreview(false);

    const totalTiles = size * size;
    // Cria array [0, 1, 2, 3...]
    let initial = Array.from({ length: totalTiles }, (_, i) => i);

    // Embaralha garantindo que não fique resolvido no início
    do {
      initial.sort(() => Math.random() - 0.5);
    } while (isAlreadySolved(initial));

    setTiles(initial);
  };

  const isAlreadySolved = (arr) => {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] !== i) return false;
    }
    return true;
  };

  // Troca de posição de duas peças (usado tanto por arrastar quanto por clique)
  const swapTiles = (fromIdx, toIdx) => {
    if (fromIdx === toIdx || isSolved) return;

    soundService.playPop();

    const nextTiles = [...tiles];
    const temp = nextTiles[fromIdx];
    nextTiles[fromIdx] = nextTiles[toIdx];
    nextTiles[toIdx] = temp;

    setTiles(nextTiles);
    setSelectedTileIdx(null);
    setDraggedIdx(null);
    setOverIdx(null);
    setMoves(prev => prev + 1);

    // Confere se completou o quebra-cabeça
    if (isAlreadySolved(nextTiles)) {
      setIsSolved(true);
      soundService.playFanfare();
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  };

  // Clique como alternativa acessível ao arrastar
  const handleTileClick = (index) => {
    if (isSolved) return;

    if (selectedTileIdx === null) {
      soundService.playPop();
      setSelectedTileIdx(index);
    } else {
      swapTiles(selectedTileIdx, index);
    }
  };

  // Handlers para Touch em Celulares/Tablets
  const handleTouchStart = (idx) => {
    if (isSolved) return;
    setDraggedIdx(idx);
  };

  const handleTouchMove = (e) => {
    if (draggedIdx === null) return;
    const touch = e.touches[0];
    const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
    const tileElement = targetElement?.closest('[data-tile-idx]');
    if (tileElement) {
      const targetIdx = parseInt(tileElement.getAttribute('data-tile-idx'), 10);
      if (!isNaN(targetIdx)) {
        setOverIdx(targetIdx);
      }
    } else {
      setOverIdx(null);
    }
  };

  const handleTouchEnd = () => {
    if (draggedIdx !== null && overIdx !== null && draggedIdx !== overIdx) {
      swapTiles(draggedIdx, overIdx);
    }
    setDraggedIdx(null);
    setOverIdx(null);
  };


  if (!selectedPhoto) return null;

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

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => {
              soundService.playPop();
              setShowPreview(!showPreview);
            }}
            className="kid-btn"
            style={{
              background: showPreview ? '#10b981' : '#f8fafc',
              color: showPreview ? '#fff' : '#475569',
              padding: '0.45rem 0.85rem',
              fontSize: '0.85rem',
              border: '2px solid #e2e8f0'
            }}
          >
            <Eye size={16} />
            <span>Espiar</span>
          </button>

          <button
            onClick={() => {
              soundService.playPop();
              startPuzzle(selectedPhoto, gridSize);
            }}
            className="kid-btn"
            style={{ background: '#fef3c7', color: '#b45309', padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
          >
            <RotateCcw size={16} />
            <span>Embaralhar</span>
          </button>
        </div>
      </div>

      {/* Seletor de Foto para Montar */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
        {fotos.map(f => (
          <img
            key={f.id}
            src={f.urlThumb || f.urlOriginal}
            alt={f.rotulo}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=320&auto=format&fit=crop&q=80';
            }}
            onClick={() => {
              soundService.playPop();
              startPuzzle(f, gridSize);
            }}
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '0.75rem',
              objectFit: 'cover',
              cursor: 'pointer',
              border: selectedPhoto.id === f.id ? '3px solid #ea580c' : '2px solid #fff',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
              flexShrink: 0
            }}
          />
        ))}
      </div>

      {/* Área do Quebra-Cabeça */}
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.25rem', color: '#1e293b' }}>
          Montando o quebra-cabeça de <strong style={{ color: '#ea580c' }}>{selectedPhoto.rotulo}</strong> ✨
        </h3>
        <p style={{ fontSize: '0.95rem', color: '#64748b', fontWeight: 600 }}>
          🧩 <strong>Arraste</strong> a peça para o lugar certo (ou toque para trocar)!
        </p>
      </div>

      {/* Tabuleiro / Grade de Fatias */}
      <div
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '420px',
          aspectRatio: '1',
          margin: '0 auto',
          borderRadius: '1.5rem',
          overflow: 'hidden',
          boxShadow: 'var(--card-shadow)',
          border: '6px solid #fff',
          display: 'grid',
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gap: '6px',
          background: '#cbd5e1',
          touchAction: 'none',
          userSelect: 'none'
        }}
      >
        {/* Foto Preview caso queira espiar */}
        {showPreview && (
          <img
            src={selectedPhoto.urlOriginal || selectedPhoto.urlThumb}
            alt="Preview"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: 10,
              opacity: 0.95
            }}
          />
        )}

        {tiles.map((tilePos, idx) => {
          // Calcula o offset de background para cada fatia da foto
          const col = tilePos % gridSize;
          const row = Math.floor(tilePos / gridSize);
          const percentX = (col / (gridSize - 1)) * 100;
          const percentY = (row / (gridSize - 1)) * 100;

          const isSelected = selectedTileIdx === idx;
          const isDragging = draggedIdx === idx;
          const isOver = overIdx === idx && draggedIdx !== idx;

          let borderStyle = '2px solid rgba(255,255,255,0.85)';
          let transformStyle = 'none';
          let shadowStyle = 'none';
          let opacityStyle = 1;

          if (isDragging) {
            opacityStyle = 0.45;
            transformStyle = 'scale(1.04)';
            shadowStyle = '0 8px 24px rgba(0,0,0,0.3)';
          } else if (isOver) {
            borderStyle = '4px dashed #ea580c';
            transformStyle = 'scale(0.96)';
            shadowStyle = '0 0 20px rgba(234, 88, 12, 0.6)';
          } else if (isSelected) {
            borderStyle = '4px solid #ea580c';
            transformStyle = 'scale(0.96)';
            shadowStyle = '0 0 16px rgba(234, 88, 12, 0.5)';
          }

          return (
            <div
              key={idx}
              data-tile-idx={idx}
              draggable={!isSolved}
              onDragStart={(e) => {
                if (isSolved) return;
                e.dataTransfer.setData('text/plain', String(idx));
                e.dataTransfer.effectAllowed = 'move';
                setDraggedIdx(idx);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
              }}
              onDragEnter={(e) => {
                e.preventDefault();
                setOverIdx(idx);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                if (overIdx === idx) setOverIdx(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                const fromIdx = parseInt(e.dataTransfer.getData('text/plain'), 10);
                if (!isNaN(fromIdx)) {
                  swapTiles(fromIdx, idx);
                }
                setDraggedIdx(null);
                setOverIdx(null);
              }}
              onDragEnd={() => {
                setDraggedIdx(null);
                setOverIdx(null);
              }}
              onTouchStart={() => handleTouchStart(idx)}
              onClick={() => handleTileClick(idx)}
              style={{
                width: '100%',
                height: '100%',
                backgroundImage: `url(${selectedPhoto.urlOriginal || selectedPhoto.urlThumb})`,
                backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
                backgroundPosition: `${percentX}% ${percentY}%`,
                cursor: isSolved ? 'default' : isDragging ? 'grabbing' : 'grab',
                borderRadius: '0.65rem',
                border: borderStyle,
                transform: transformStyle,
                opacity: opacityStyle,
                boxShadow: shadowStyle,
                transition: isDragging ? 'none' : 'all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)',
                touchAction: 'none'
              }}
            />
          );
        })}
      </div>

      {/* Vitória */}
      {isSolved && (
        <div style={{
          marginTop: '1.5rem',
          background: '#fff',
          borderRadius: '1.5rem',
          padding: '1.5rem',
          textAlign: 'center',
          boxShadow: 'var(--card-shadow)',
          border: '4px solid #bbf7d0'
        }}>
          <span style={{ fontSize: '3rem' }}>🎉</span>
          <h2 style={{ fontSize: '1.75rem', color: '#10b981', margin: '0.25rem 0' }}>
            QUEBRA-CABEÇA COMPLETO!
          </h2>
          <p style={{ color: '#64748b', marginBottom: '1rem' }}>
            Você montou a foto de <strong>{selectedPhoto.rotulo}</strong> em {moves} movimentos!
          </p>
          <button
            onClick={() => {
              soundService.playPop();
              startPuzzle(selectedPhoto, gridSize);
            }}
            className="kid-btn"
            style={{ background: '#ea580c', color: '#fff', padding: '0.75rem 1.75rem' }}
          >
            <RotateCcw size={18} />
            <span>Montar Outra Vez</span>
          </button>
        </div>
      )}
    </div>
  );
}
