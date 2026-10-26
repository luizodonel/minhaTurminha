import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Camera,
  Trash2,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  Smile,
  Check
} from 'lucide-react';
import { api } from '../services/api';
import { soundService } from '../services/soundService';

// Catálogo de Corpos / Fantasias base
const COSTUMES = [
  {
    id: 'heroi',
    name: 'Super-Herói',
    icon: '🦸',
    badgeColor: '#ea580c',
    bodyColor: '#ea580c',
    capeColor: '#f59e0b',
    symbol: '⚡'
  },
  {
    id: 'astronauta',
    name: 'Astronauta',
    icon: '🚀',
    badgeColor: '#059669',
    bodyColor: '#10b981',
    capeColor: '#d97706',
    symbol: '🪐'
  },
  {
    id: 'mago',
    name: 'Mago das Estrelas',
    icon: '🧙',
    badgeColor: '#7c3aed',
    bodyColor: '#8b5cf6',
    capeColor: '#f59e0b',
    symbol: '✨'
  },
  {
    id: 'chef',
    name: 'Chef Divertido',
    icon: '🧑‍🍳',
    badgeColor: '#d97706',
    bodyColor: '#f59e0b',
    capeColor: '#ea580c',
    symbol: '🧁'
  },
  {
    id: 'aventura',
    name: 'Aventureiro',
    icon: '🤠',
    badgeColor: '#b45309',
    bodyColor: '#78350f',
    capeColor: '#10b981',
    symbol: '🧭'
  }
];

// Catálogo de Adereços / Stickers
const STICKER_CATALOG = [
  // Chapéus & Cabeça
  { id: 'coroa', type: 'hat', icon: '👑', label: 'Coroa', defaultY: 15, defaultX: 50, scale: 1.3 },
  { id: 'cartola', type: 'hat', icon: '🎩', label: 'Cartola', defaultY: 10, defaultX: 50, scale: 1.3 },
  { id: 'chapeu-festa', type: 'hat', icon: '🥳', label: 'Festa', defaultY: 12, defaultX: 50, scale: 1.2 },
  { id: 'cowboy', type: 'hat', icon: '🤠', label: 'Cowboy', defaultY: 14, defaultX: 50, scale: 1.4 },
  { id: 'chapeu-pirata', type: 'hat', icon: '🏴‍☠️', label: 'Pirata', defaultY: 14, defaultX: 50, scale: 1.4 },

  // Orelhas & Tiaras
  { id: 'gatinho', type: 'ears', icon: '🐱', label: 'Gatinho', defaultY: 18, defaultX: 50, scale: 1.25 },
  { id: 'coelho', type: 'ears', icon: '🐰', label: 'Coelho', defaultY: 12, defaultX: 50, scale: 1.3 },
  { id: 'unicornio', type: 'ears', icon: '🦄', label: 'Unicórnio', defaultY: 15, defaultX: 50, scale: 1.3 },

  // Óculos & Rostos
  { id: 'oculos-sol', type: 'glasses', icon: '😎', label: 'Óculos', defaultY: 38, defaultX: 50, scale: 1.2 },
  { id: 'oculos-grau', type: 'glasses', icon: '👓', label: 'Óculos Intelectual', defaultY: 38, defaultX: 50, scale: 1.15 },
  { id: 'bigode', type: 'glasses', icon: '🥸', label: 'Bigode', defaultY: 48, defaultX: 50, scale: 1.2 },

  // Itens & Mão
  { id: 'varinha', type: 'item', icon: '🪄', label: 'Varinha', defaultY: 65, defaultX: 20, scale: 1.2 },
  { id: 'estrela', type: 'item', icon: '⭐', label: 'Estrela', defaultY: 25, defaultX: 80, scale: 1.2 },
  { id: 'balao', type: 'item', icon: '🎈', label: 'Balão', defaultY: 30, defaultX: 18, scale: 1.3 },
  { id: 'trofeu', type: 'item', icon: '🏆', label: 'Troféu', defaultY: 68, defaultX: 80, scale: 1.2 },
  { id: 'guitarra', type: 'item', icon: '🎸', label: 'Guitarra', defaultY: 72, defaultX: 50, scale: 1.3 }
];

const FALLBACK_CHILD = {
  rotulo: 'Você',
  urlThumb: 'https://images.unsplash.com/photo-1544126592-807ade215a0b?w=320&auto=format&fit=crop&q=80'
};

export function FaceDressUpGame({ currentChild, onBack }) {
  const [fotos, setFotos] = useState([]);
  const [activePhoto, setActivePhoto] = useState(null);
  const [selectedCostumeIdx, setSelectedCostumeIdx] = useState(0);
  const [placedStickers, setPlacedStickers] = useState([]);
  const [selectedPlacedId, setSelectedPlacedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPhotoShootModal, setShowPhotoShootModal] = useState(false);

  // Arrastar novos stickers do catálogo
  const [draggingCatalogSticker, setDraggingCatalogSticker] = useState(null);

  const canvasRef = useRef(null);

  useEffect(() => {
    loadGameData();
  }, [currentChild]);

  const loadGameData = async () => {
    setLoading(true);
    let list = await api.getFotos(currentChild?.id || 1);
    if (!list || list.length === 0) {
      list = [FALLBACK_CHILD];
    }
    setFotos(list);
    setActivePhoto(list[0]);
    setPlacedStickers([]);
    setSelectedPlacedId(null);
    setLoading(false);
  };

  // Adiciona um sticker na tela (seja por clique ou soltando o drag)
  const addSticker = (stickerItem, customX = null, customY = null) => {
    soundService.playPop();
    const newPlaced = {
      instanceId: `placed-${Date.now()}-${Math.random()}`,
      sticker: stickerItem,
      x: customX !== null ? customX : stickerItem.defaultX,
      y: customY !== null ? customY : stickerItem.defaultY,
      scale: stickerItem.scale || 1.2
    };

    setPlacedStickers(prev => [...prev, newPlaced]);
    setSelectedPlacedId(newPlaced.instanceId);
  };

  // Remove um sticker colocado
  const removeSticker = (instanceId) => {
    soundService.playPop();
    setPlacedStickers(prev => prev.filter(s => s.instanceId !== instanceId));
    if (selectedPlacedId === instanceId) {
      setSelectedPlacedId(null);
    }
  };

  // Limpa todos os adereços
  const handleClearAll = () => {
    soundService.playPop();
    setPlacedStickers([]);
    setSelectedPlacedId(null);
  };

  // Troca para o próximo corpinho/fantasia
  const handleNextCostume = () => {
    soundService.playPop();
    setSelectedCostumeIdx(prev => (prev + 1) % COSTUMES.length);
  };

  // Troca para a próxima foto da família
  const handleNextPhoto = () => {
    soundService.playPop();
    const currentIdx = fotos.findIndex(f => f.id === activePhoto?.id);
    const nextIdx = (currentIdx + 1) % fotos.length;
    setActivePhoto(fotos[nextIdx]);
  };

  // Drop no Canvas
  const handleCanvasDrop = (e) => {
    e.preventDefault();
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;

    const percentX = Math.max(10, Math.min(90, ((clientX - rect.left) / rect.width) * 100));
    const percentY = Math.max(10, Math.min(90, ((clientY - rect.top) / rect.height) * 100));

    const stickerId = e.dataTransfer.getData('text/plain');
    const targetStk = STICKER_CATALOG.find(s => s.id === stickerId) || draggingCatalogSticker;
    if (targetStk) {
      addSticker(targetStk, percentX, percentY);
    }
    setDraggingCatalogSticker(null);
  };

  // Touch Move / End no Celular
  const handleTouchEnd = (e) => {
    if (!draggingCatalogSticker || !canvasRef.current) {
      setDraggingCatalogSticker(null);
      return;
    }

    const touch = e.changedTouches[0];
    const rect = canvasRef.current.getBoundingClientRect();

    if (
      touch.clientX >= rect.left &&
      touch.clientX <= rect.right &&
      touch.clientY >= rect.top &&
      touch.clientY <= rect.bottom
    ) {
      const percentX = Math.max(10, Math.min(90, ((touch.clientX - rect.left) / rect.width) * 100));
      const percentY = Math.max(10, Math.min(90, ((touch.clientY - rect.top) / rect.height) * 100));
      addSticker(draggingCatalogSticker, percentX, percentY);
    }
    setDraggingCatalogSticker(null);
  };

  // Tirar Foto Mágica! 📸
  const handleTakePhotoShoot = () => {
    soundService.playFanfare();
    confetti({
      particleCount: 100,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#f59e0b', '#10b981', '#ea580c', '#fcd34d', '#7c3aed']
    });
    setShowPhotoShootModal(true);
  };

  const currentCostume = COSTUMES[selectedCostumeIdx];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <span style={{ fontSize: '3rem' }}>🎭</span>
        <h3 style={{ marginTop: '1rem', color: '#b45309' }}>Carregando Complete o Rosto...</h3>
      </div>
    );
  }

  return (
    <div
      onTouchEnd={handleTouchEnd}
      style={{ maxWidth: '720px', margin: '0 auto', padding: '1rem' }}
    >
      {/* Barra de Ações Superior */}
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
          style={{ background: '#f1f5f9', color: '#475569', padding: '0.45rem 0.9rem', fontSize: '0.9rem' }}
        >
          <ArrowLeft size={18} />
          <span>Voltar</span>
        </button>

        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: '#b45309', fontSize: '1rem' }}>
          COMPLETE O ROSTO 🎭
        </span>

        <button
          onClick={handleTakePhotoShoot}
          className="kid-btn"
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#fff',
            padding: '0.45rem 1rem',
            fontSize: '0.9rem'
          }}
        >
          <Camera size={18} />
          <span>Foto! 📸</span>
        </button>
      </div>

      {/* Controles de Fantasia & Rosto */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '0.75rem',
        marginBottom: '1rem',
        flexWrap: 'wrap'
      }}>
        {/* Trocar Roupinha */}
        <button
          onClick={handleNextCostume}
          className="kid-btn"
          style={{
            background: '#fff',
            color: currentCostume.badgeColor,
            border: `2px solid ${currentCostume.badgeColor}`,
            padding: '0.5rem 1rem',
            fontSize: '0.85rem'
          }}
        >
          <span>Roupinha: <strong>{currentCostume.icon} {currentCostume.name}</strong></span>
          <Shuffle size={14} style={{ marginLeft: '0.4rem' }} />
        </button>

        {/* Trocar Rosto / Foto */}
        {fotos.length > 1 && (
          <button
            onClick={handleNextPhoto}
            className="kid-btn"
            style={{
              background: '#fff',
              color: '#d97706',
              border: '2px solid #f59e0b',
              padding: '0.5rem 1rem',
              fontSize: '0.85rem'
            }}
          >
            <span>Rosto: <strong>{activePhoto?.rotulo || 'Turminha'}</strong></span>
            <Shuffle size={14} style={{ marginLeft: '0.4rem' }} />
          </button>
        )}

        {/* Limpar Adesivos */}
        {placedStickers.length > 0 && (
          <button
            onClick={handleClearAll}
            className="kid-btn"
            style={{
              background: '#fff',
              color: '#dc2626',
              border: '2px solid #fca5a5',
              padding: '0.5rem 0.9rem',
              fontSize: '0.85rem'
            }}
          >
            <Trash2 size={14} />
            <span>Limpar</span>
          </button>
        )}
      </div>

      {/* PALCO CENTRAL: PERSONAGEM COM O ROSTO DA CRIANÇA */}
      <div
        ref={canvasRef}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleCanvasDrop}
        style={{
          width: '100%',
          maxWidth: '420px',
          height: '420px',
          margin: '0 auto 1rem',
          background: 'linear-gradient(180deg, #fef9c3 0%, #fef3c7 60%, #e2e8f0 100%)',
          borderRadius: '2.5rem',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'var(--card-shadow)',
          border: '4px solid #fde68a',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          userSelect: 'none'
        }}
      >
        {/* Nuvens decorativas de fundo */}
        <div style={{ position: 'absolute', top: '15px', left: '20px', fontSize: '2rem', opacity: 0.4 }}>☁️</div>
        <div style={{ position: 'absolute', top: '30px', right: '30px', fontSize: '1.6rem', opacity: 0.4 }}>⭐</div>

        {/* Capa do herói / fantasia (atrás do corpo) */}
        <div style={{
          position: 'absolute',
          top: '190px',
          width: '180px',
          height: '180px',
          background: currentCostume.capeColor,
          borderRadius: '40% 40% 60% 60%',
          opacity: 0.9,
          zIndex: 1,
          transform: 'scaleX(1.1)'
        }} />

        {/* ROSTO RECORTADO DA CRIANÇA */}
        <div style={{
          position: 'absolute',
          top: '70px',
          width: '145px',
          height: '145px',
          borderRadius: '50%',
          overflow: 'hidden',
          border: '5px solid #fff',
          boxShadow: '0 8px 25px rgba(0,0,0,0.18)',
          background: '#fef08a',
          zIndex: 3
        }}>
          {activePhoto && (
            <img
              src={activePhoto.urlThumb || activePhoto.urlOriginal}
              alt={activePhoto.rotulo}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
        </div>

        {/* CORPO ILUSTRADO DO PERSONAGEM */}
        <div style={{
          position: 'absolute',
          top: '195px',
          width: '130px',
          height: '150px',
          background: currentCostume.bodyColor,
          borderRadius: '3rem 3rem 1.5rem 1.5rem',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'inset 0 -10px 0 rgba(0,0,0,0.15)'
        }}>
          {/* Emblema no peito */}
          <div style={{
            width: '42px',
            height: '42px',
            background: '#fff',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem',
            boxShadow: '0 3px 8px rgba(0,0,0,0.15)'
          }}>
            {currentCostume.symbol}
          </div>
          {/* Cinto */}
          <div style={{
            position: 'absolute',
            bottom: '22px',
            width: '100%',
            height: '16px',
            background: '#1e293b'
          }} />
        </div>

        {/* ADEREÇOS / STICKERS COLOCADOS PELO JOGADOR */}
        {placedStickers.map((item) => {
          const isSelected = selectedPlacedId === item.instanceId;

          return (
            <div
              key={item.instanceId}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPlacedId(item.instanceId);
              }}
              style={{
                position: 'absolute',
                left: `${item.x}%`,
                top: `${item.y}%`,
                transform: `translate(-50%, -50%) scale(${item.scale})`,
                fontSize: '3.4rem',
                cursor: 'pointer',
                zIndex: 10,
                filter: isSelected ? 'drop-shadow(0 0 10px #ea580c)' : 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))',
                transition: 'transform 0.15s ease'
              }}
            >
              {item.sticker.icon}

              {/* Botãozinho para excluir este item quando selecionado */}
              {isSelected && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSticker(item.instanceId);
                  }}
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-6px',
                    background: '#ef4444',
                    color: '#fff',
                    border: '2px solid #fff',
                    borderRadius: '50%',
                    width: '22px',
                    height: '22px',
                    fontSize: '12px',
                    fontWeight: 900,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* BANDEJA INFERIOR DE ADEREÇOS / STICKERS */}
      <div style={{
        background: '#fff',
        borderRadius: '2rem',
        padding: '1.25rem 1rem',
        boxShadow: 'var(--card-shadow)',
        border: '3px solid #e2e8f0'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.75rem'
        }}>
          <h4 style={{ fontSize: '0.95rem', color: '#1e293b', margin: 0, fontWeight: 800 }}>
            📦 Escolha e Arraste os Adereços:
          </h4>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
            (ou toque para vestir)
          </span>
        </div>

        {/* Lista de Stickers com rolagem horizontal suave */}
        <div style={{
          display: 'flex',
          gap: '0.65rem',
          overflowX: 'auto',
          paddingBottom: '0.5rem',
          touchAction: 'pan-x'
        }}>
          {STICKER_CATALOG.map((stk) => (
            <div
              key={stk.id}
              draggable={true}
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', stk.id);
                setDraggingCatalogSticker(stk);
              }}
              onTouchStart={() => {
                setDraggingCatalogSticker(stk);
              }}
              onClick={() => addSticker(stk)}
              style={{
                flexShrink: 0,
                width: '72px',
                height: '76px',
                background: '#f8fafc',
                borderRadius: '1.25rem',
                border: '2px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'grab',
                boxShadow: '0 3px 8px rgba(0,0,0,0.06)',
                transition: 'all 0.15s ease'
              }}
            >
              <span style={{ fontSize: '2rem', lineHeight: 1 }}>{stk.icon}</span>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#475569', marginTop: '0.25rem' }}>
                {stk.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL DA FOTO MÁGICA REALIZADA (POLAROID) */}
      {showPhotoShootModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem',
          animation: 'fadeIn 0.25s ease'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '2rem',
            padding: '1.5rem',
            maxWidth: '380px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            border: '4px solid #fde68a'
          }}>
            <h3 style={{ fontSize: '1.4rem', color: '#ea580c', margin: '0 0 0.5rem', fontFamily: 'var(--font-display)' }}>
              📸 Foto Polaroid Tirada!
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b', margin: '0 0 1rem' }}>
              Ficou incrível demais! Que fantasia estilosa! 🌟
            </p>

            {/* Miniatura Polaroid */}
            <div style={{
              background: '#fff',
              border: '10px solid #f8fafc',
              borderRadius: '1rem',
              boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
              padding: '1rem 0.5rem 1.5rem',
              marginBottom: '1.25rem'
            }}>
              <div style={{ fontSize: '3.5rem', margin: '0.5rem 0' }}>
                {currentCostume.icon} ✨
              </div>
              <p style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '1.1rem',
                color: '#1e293b',
                margin: 0
              }}>
                {activePhoto?.rotulo || 'Super Criança'}
              </p>
              <span style={{ fontSize: '0.8rem', color: currentCostume.badgeColor, fontWeight: 700 }}>
                {currentCostume.name}
              </span>
            </div>

            <button
              onClick={() => setShowPhotoShootModal(false)}
              className="kid-btn"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                fontSize: '1rem',
                padding: '0.65rem 1.75rem',
                width: '100%'
              }}
            >
              <span>Continuar Fantasiando! ✨</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
