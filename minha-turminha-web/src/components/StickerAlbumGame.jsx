import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, RotateCcw, Sparkles, Trophy, Award, Star } from 'lucide-react';
import { api } from '../services/api';
import { soundService } from '../services/soundService';

const STICKER_THEMES = [
  { id: 'astro', badge: '🚀 Astronauta', frameColor: '#059669', border: '4px solid #047857' },
  { id: 'hero', badge: '🦸 Super-Herói', frameColor: '#ea580c', border: '4px solid #c2410c' },
  { id: 'royalty', badge: '👑 Majestade', frameColor: '#f59e0b', border: '4px solid #d97706' },
  { id: 'safari', badge: '🦁 Safari', frameColor: '#10b981', border: '4px solid #059669' },
  { id: 'rock', badge: '🎸 Estrela do Rock', frameColor: '#7c3aed', border: '4px solid #6d28d9' },
  { id: 'magic', badge: '✨ Mágico(a)', frameColor: '#d97706', border: '4px solid #b45309' }
];

export function StickerAlbumGame({ currentChild, onBack }) {
  const [fotos, setFotos] = useState([]);
  const [stickers, setStickers] = useState([]); // figurinhas para colar
  const [albumSlots, setAlbumSlots] = useState([null, null, null, null, null, null]);
  const [isAlbumComplete, setIsAlbumComplete] = useState(false);
  const [selectedSticker, setSelectedSticker] = useState(null);
  const [draggedSticker, setDraggedSticker] = useState(null);
  const [dragOverSlotIdx, setDragOverSlotIdx] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFotos();
  }, [currentChild]);

  const loadFotos = async () => {
    setLoading(true);
    const list = await api.getFotos(currentChild?.id || 1);
    setFotos(list);
    setAlbumSlots([null, null, null, null, null, null]);
    setIsAlbumComplete(false);
    setSelectedSticker(null);
    setDraggedSticker(null);
    setDragOverSlotIdx(null);

    // Gera 6 figurinhas com temas unisex
    const generated = STICKER_THEMES.map((theme, idx) => {
      const photo = list[idx % list.length] || { rotulo: 'Amigo', urlThumb: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=320&auto=format&fit=crop&q=80' };
      return {
        id: `sticker-${idx}`,
        slotIdx: idx,
        theme,
        photo
      };
    });

    setStickers(generated);
    setLoading(false);
  };

  // Cola a figurinha no slot (usado tanto por clique quanto por arrastar)
  const pasteSticker = (sticker, slotIndex) => {
    if (!sticker || slotIndex === null || slotIndex === undefined) return;

    if (sticker.slotIdx !== slotIndex) {
      soundService.playBoop();
      return;
    }

    soundService.playSparkle();

    const nextSlots = [...albumSlots];
    nextSlots[slotIndex] = sticker;
    setAlbumSlots(nextSlots);

    // Remove das figurinhas soltas
    setStickers(prev => prev.filter(s => s.id !== sticker.id));
    setSelectedSticker(null);
    setDraggedSticker(null);
    setDragOverSlotIdx(null);

    // Confere se completou o álbum
    if (nextSlots.every(slot => slot !== null)) {
      setIsAlbumComplete(true);
      soundService.playFanfare();
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.55 }
      });
    }
  };

  // Clique na figurinha (para modo toque/clique)
  const handleSelectSticker = (sticker) => {
    soundService.playPop();
    if (selectedSticker?.id === sticker.id) {
      setSelectedSticker(null);
    } else {
      setSelectedSticker(sticker);
    }
  };

  // Clique no slot do álbum
  const handleSlotClick = (slotIdx) => {
    if (albumSlots[slotIdx] !== null) return;
    if (selectedSticker) {
      pasteSticker(selectedSticker, slotIdx);
    }
  };

  // Handlers para Touch Drag em Celular / Tablet
  const handleTouchMove = (e) => {
    if (!draggedSticker) return;
    const touch = e.touches[0];
    const elem = document.elementFromPoint(touch.clientX, touch.clientY);
    const slotElem = elem?.closest('[data-slot-idx]');
    if (slotElem) {
      const targetIdx = parseInt(slotElem.getAttribute('data-slot-idx'), 10);
      if (!isNaN(targetIdx)) {
        setDragOverSlotIdx(targetIdx);
      }
    } else {
      setDragOverSlotIdx(null);
    }
  };

  const handleTouchEnd = () => {
    if (draggedSticker && dragOverSlotIdx !== null) {
      pasteSticker(draggedSticker, dragOverSlotIdx);
    }
    setDraggedSticker(null);
    setDragOverSlotIdx(null);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <span style={{ fontSize: '3rem' }}>✨</span>
        <h3 style={{ marginTop: '1rem' }}>Abrindo o álbum de figurinhas...</h3>
      </div>
    );
  }

  const gluedCount = albumSlots.filter(s => s !== null).length;

  return (
    <div
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ maxWidth: '720px', margin: '0 auto', padding: '1rem' }}
    >
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

        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: '#b45309', fontSize: '1rem' }}>
          ÁLBUM DE FIGURINHAS ({gluedCount}/6)
        </span>

        <button
          onClick={() => {
            soundService.playPop();
            loadFotos();
          }}
          className="kid-btn"
          style={{ background: '#fef3c7', color: '#b45309', padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
        >
          <RotateCcw size={16} />
          <span>Recomeçar</span>
        </button>
      </div>

      {/* Página do Álbum */}
      <div style={{
        background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
        borderRadius: '2rem',
        padding: '1.5rem 1rem',
        boxShadow: 'var(--card-shadow)',
        border: '4px solid #f59e0b',
        marginBottom: '1.25rem'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.8rem', color: '#78350f', fontFamily: 'var(--font-display)', margin: 0 }}>
            Turminha dos Sonhos ⭐
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#92400e', margin: '0.3rem 0 0', fontWeight: 600 }}>
            Arraste a figurinha para o espaço (ou toque nela e depois no número)! 🌟
          </p>
        </div>

        {/* Grade com os 6 slots do álbum */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.75rem'
        }}>
          {albumSlots.map((slot, idx) => {
            const theme = STICKER_THEMES[idx];
            const isWaitingSelected = selectedSticker && selectedSticker.slotIdx === idx;
            const isHoveredDrag = dragOverSlotIdx === idx;

            return (
              <div
                key={idx}
                data-slot-idx={idx}
                onClick={() => handleSlotClick(idx)}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                }}
                onDragEnter={(e) => {
                  e.preventDefault();
                  setDragOverSlotIdx(idx);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  if (dragOverSlotIdx === idx) setDragOverSlotIdx(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const stkId = e.dataTransfer.getData('text/plain');
                  const targetStk = stickers.find(s => s.id === stkId) || draggedSticker;
                  if (targetStk) {
                    pasteSticker(targetStk, idx);
                  }
                  setDraggedSticker(null);
                  setDragOverSlotIdx(null);
                }}
                style={{
                  aspectRatio: '0.8',
                  background: slot ? '#fff' : 'rgba(255, 255, 255, 0.75)',
                  borderRadius: '1.25rem',
                  border: slot
                    ? theme.border
                    : isHoveredDrag
                    ? '4px dashed #ea580c'
                    : isWaitingSelected
                    ? '3px dashed #ea580c'
                    : '2px dashed #d97706',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: slot ? 'default' : 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: slot
                    ? '0 8px 18px rgba(0,0,0,0.12)'
                    : isHoveredDrag
                    ? '0 0 20px rgba(234, 88, 12, 0.5)'
                    : 'none',
                  transform: isHoveredDrag || isWaitingSelected ? 'scale(1.02)' : 'none',
                  transition: 'all 0.18s ease'
                }}
              >
                {slot ? (
                  /* Figurinha Colada! */
                  <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div style={{
                      background: theme.frameColor,
                      color: '#fff',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      textAlign: 'center',
                      padding: '0.2rem 0'
                    }}>
                      {theme.badge}
                    </div>
                    <img
                      src={slot.photo.urlThumb || slot.photo.urlOriginal}
                      alt={slot.photo.rotulo}
                      style={{ width: '100%', height: '70%', objectFit: 'cover' }}
                    />
                    <div style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      color: '#1e293b'
                    }}>
                      {slot.photo.rotulo}
                    </div>
                  </div>
                ) : (
                  /* Slot Vazio */
                  <div style={{ textAlign: 'center', padding: '0.4rem', pointerEvents: 'none' }}>
                    <span style={{ fontSize: '1.3rem', color: '#b45309', fontWeight: 800, display: 'block' }}>
                      #{idx + 1}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#92400e', fontWeight: 700 }}>
                      {theme.badge}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Pacotinho de Figurinhas Soltas para Colar ou Arrastar */}
      {stickers.length > 0 ? (
        <div style={{
          background: '#fff',
          borderRadius: '1.75rem',
          padding: '1.25rem 1rem',
          boxShadow: 'var(--card-shadow)',
          border: '3px solid #e2e8f0'
        }}>
          <h4 style={{ fontSize: '0.95rem', color: '#334155', marginBottom: '0.75rem', textAlign: 'center' }}>
            📦 Suas Figurinhas ({stickers.length}) - <em>Arraste ou Toque:</em>
          </h4>

          <div style={{
            display: 'flex',
            gap: '0.75rem',
            overflowX: 'auto',
            paddingBottom: '0.5rem',
            justifyContent: stickers.length <= 3 ? 'center' : 'flex-start',
            touchAction: 'none'
          }}>
            {stickers.map((stk) => {
              const isSelected = selectedSticker?.id === stk.id;
              const isDraggingThis = draggedSticker?.id === stk.id;

              return (
                <div
                  key={stk.id}
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', stk.id);
                    e.dataTransfer.effectAllowed = 'move';
                    setDraggedSticker(stk);
                  }}
                  onDragEnd={() => {
                    setDraggedSticker(null);
                    setDragOverSlotIdx(null);
                  }}
                  onTouchStart={() => {
                    setDraggedSticker(stk);
                  }}
                  onClick={() => handleSelectSticker(stk)}
                  style={{
                    width: '98px',
                    height: '130px',
                    background: '#fff',
                    borderRadius: '1rem',
                    overflow: 'hidden',
                    cursor: 'grab',
                    border: isSelected ? '4px solid #ea580c' : stk.theme.border,
                    transform: isSelected ? 'scale(1.08)' : isDraggingThis ? 'scale(0.95)' : 'none',
                    opacity: isDraggingThis ? 0.5 : 1,
                    boxShadow: isSelected ? '0 0 20px rgba(234, 88, 12, 0.5)' : '0 4px 10px rgba(0,0,0,0.1)',
                    transition: 'all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    flexShrink: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    userSelect: 'none',
                    touchAction: 'none'
                  }}
                >
                  <div style={{
                    background: stk.theme.frameColor,
                    color: '#fff',
                    fontSize: '0.6rem',
                    fontWeight: 800,
                    textAlign: 'center',
                    padding: '0.15rem 0'
                  }}>
                    {stk.theme.badge}
                  </div>
                  <img
                    src={stk.photo.urlThumb || stk.photo.urlOriginal}
                    alt={stk.photo.rotulo}
                    style={{ width: '100%', height: '70px', objectFit: 'cover', pointerEvents: 'none' }}
                  />
                  <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: '#1e293b'
                  }}>
                    {stk.photo.rotulo}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Álbum Completo */
        <div style={{
          background: '#fff',
          borderRadius: '1.75rem',
          padding: '2rem 1.5rem',
          textAlign: 'center',
          boxShadow: 'var(--card-shadow)',
          border: '4px solid #10b981'
        }}>
          <span style={{ fontSize: '3.5rem' }}>🏆🎉</span>
          <h2 style={{ fontSize: '1.8rem', color: '#10b981', margin: '0.4rem 0', fontFamily: 'var(--font-display)' }}>
            ÁLBUM 100% COMPLETO!
          </h2>
          <p style={{ color: '#64748b', fontSize: '1rem', marginBottom: '1.25rem' }}>
            Todas as figurinhas da sua turminha foram coladas com sucesso!
          </p>
          <button
            onClick={() => {
              soundService.playPop();
              loadFotos();
            }}
            className="kid-btn"
            style={{ background: '#f59e0b', color: '#fff', padding: '0.75rem 2rem', fontSize: '1.1rem' }}
          >
            <RotateCcw size={18} />
            <span>Colar Figurinhas de Novo</span>
          </button>
        </div>
      )}
    </div>
  );
}
