import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, RotateCcw, Sparkles, Trophy, Check, Heart, Star } from 'lucide-react';
import { api } from '../services/api';
import { soundService } from '../services/soundService';

// Catálogo de objetos/hobbies pré-definidos para associação afetiva
const OBJECT_PRESETS = [
  { matchWords: ['PAI', 'PAPAI', 'DAD'], icon: '⚽', name: 'Bola de Futebol', color: '#ea580c' },
  { matchWords: ['MAE', 'MAMAE', 'MOM'], icon: '📚', name: 'Livro de Histórias', color: '#10b981' },
  { matchWords: ['PET', 'CACHORRO', 'GATO', 'CAO', 'REX', 'THOR'], icon: '🦴', name: 'Ossinho & Petisco', color: '#f59e0b' },
  { matchWords: ['VOVO', 'VO', 'GRANDMA', 'GRANDPA'], icon: '☕', name: 'Xícara de Chá / Café', color: '#d97706' },
  { matchWords: ['BEBE', 'BABY', 'IRMAO', 'IRMA'], icon: '🧸', name: 'Ursinho de Pelúcia', color: '#7c3aed' },
  { matchWords: ['LUIZ', 'PEDRO', 'CRIANCA', 'KID'], icon: '🚀', name: 'Foguete Espacial', color: '#ea580c' }
];

const GENERIC_OBJECTS = [
  { icon: '🎨', name: 'Pintura & Desenho', color: '#7c3aed' },
  { icon: '🎸', name: 'Violão Musical', color: '#ea580c' },
  { icon: '🚲', name: 'Bicicleta Divertida', color: '#10b981' },
  { icon: '🧁', name: 'Bolo Gostoso', color: '#f59e0b' },
  { icon: '🌸', name: 'Flor do Jardim', color: '#ca8a04' },
  { icon: '🚗', name: 'Carrinho Veloz', color: '#ea580c' },
  { icon: '🎒', name: 'Mochila de Aventura', color: '#059669' },
  { icon: '⭐', name: 'Estrela Mágica', color: '#f59e0b' }
];

const FALLBACK_FAMILY = [
  { rotulo: 'Papai', urlThumb: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=320&auto=format&fit=crop&q=80' },
  { rotulo: 'Mamãe', urlThumb: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=320&auto=format&fit=crop&q=80' },
  { rotulo: 'Pet Amigo', urlThumb: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=320&auto=format&fit=crop&q=80' },
  { rotulo: 'Você', urlThumb: 'https://images.unsplash.com/photo-1544126592-807ade215a0b?w=320&auto=format&fit=crop&q=80' }
];

export function PairMatchingGame({ currentChild, onBack }) {
  const [fotos, setFotos] = useState([]);
  const [round, setRound] = useState(1);
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  // Pares ativos da rodada
  const [activePairs, setActivePairs] = useState([]); // [{ id, photo, object }]
  const [shuffledObjects, setShuffledObjects] = useState([]); // objetos embaralhados
  const [matchedIds, setMatchedIds] = useState(new Set()); // IDs dos pares resolvidos

  // Seleções do jogador (modo clique)
  const [selectedPersonId, setSelectedPersonId] = useState(null);
  const [selectedObjectId, setSelectedObjectId] = useState(null);

  // Arrastar (drag)
  const [draggedPersonId, setDraggedPersonId] = useState(null);
  const [dragOverObjectId, setDragOverObjectId] = useState(null);

  const PAIRS_PER_ROUND = 3;
  const TOTAL_ROUNDS = 4;

  useEffect(() => {
    loadGameData();
  }, [currentChild]);

  const loadGameData = async () => {
    setLoading(true);
    let list = await api.getFotos(currentChild?.id || 1);
    if (!list || list.length < 3) {
      list = FALLBACK_FAMILY;
    }
    setFotos(list);
    setRound(1);
    setIsFinished(false);
    startRound(list, 1);
    setLoading(false);
  };

  const startRound = (photoPool, roundNum) => {
    const pool = (photoPool && photoPool.length >= 3) ? photoPool : fotos;
    if (pool.length === 0) return;

    setMatchedIds(new Set());
    setSelectedPersonId(null);
    setSelectedObjectId(null);
    setDraggedPersonId(null);
    setDragOverObjectId(null);

    // Seleciona fotos da rodada sem repetição
    const shuffledPhotos = [...pool].sort(() => Math.random() - 0.5);
    const chosenPhotos = shuffledPhotos.slice(0, Math.min(PAIRS_PER_ROUND, shuffledPhotos.length));

    // Associa cada foto a um objeto inteligente ou genérico
    let usedGenericIdx = 0;
    const pairs = chosenPhotos.map((photo, idx) => {
      const upperLabel = (photo.rotulo || '').toUpperCase();
      const preset = OBJECT_PRESETS.find(p => p.matchWords.some(w => upperLabel.includes(w)));
      const obj = preset || GENERIC_OBJECTS[(idx + (roundNum * 2)) % GENERIC_OBJECTS.length];

      return {
        id: `pair-${idx}-${photo.id || idx}`,
        photo,
        object: obj
      };
    });

    setActivePairs(pairs);

    // Embaralha coluna dos objetos para a criança encontrar a combinação
    const objectsForRightCol = pairs.map(p => ({
      pairId: p.id,
      object: p.object
    })).sort(() => Math.random() - 0.5);

    setShuffledObjects(objectsForRightCol);
  };

  // Verifica par correspondente
  const checkMatch = (personPairId, objectPairId) => {
    if (personPairId === objectPairId) {
      // ACERTOU! 🌟
      soundService.playSuccess();
      const nextMatched = new Set(matchedIds);
      nextMatched.add(personPairId);
      setMatchedIds(nextMatched);

      setSelectedPersonId(null);
      setSelectedObjectId(null);

      // Rodada completa?
      if (nextMatched.size === activePairs.length) {
        soundService.playFanfare();
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#10b981', '#f59e0b', '#ea580c', '#fcd34d', '#7c3aed']
        });
      }
    } else {
      // Erro suave
      soundService.playBoop();
      setSelectedPersonId(null);
      setSelectedObjectId(null);
    }
  };

  // Clique na foto (coluna esquerda)
  const handlePersonClick = (pairId) => {
    if (matchedIds.has(pairId)) return;
    soundService.playPop();

    if (selectedObjectId) {
      checkMatch(pairId, selectedObjectId);
    } else {
      setSelectedPersonId(selectedPersonId === pairId ? null : pairId);
    }
  };

  // Clique no objeto (coluna direita)
  const handleObjectClick = (pairId) => {
    if (matchedIds.has(pairId)) return;
    soundService.playPop();

    if (selectedPersonId) {
      checkMatch(selectedPersonId, pairId);
    } else {
      setSelectedObjectId(selectedObjectId === pairId ? null : pairId);
    }
  };

  // Touch Move no Celular para arrastar
  const handleTouchMove = (e) => {
    if (!draggedPersonId) return;
    const touch = e.touches[0];
    const elem = document.elementFromPoint(touch.clientX, touch.clientY);
    const targetElem = elem?.closest('[data-pair-target]');
    if (targetElem) {
      const targetId = targetElem.getAttribute('data-pair-target');
      setDragOverObjectId(targetId);
    } else {
      setDragOverObjectId(null);
    }
  };

  const handleTouchEnd = () => {
    if (draggedPersonId && dragOverObjectId) {
      checkMatch(draggedPersonId, dragOverObjectId);
    }
    setDraggedPersonId(null);
    setDragOverObjectId(null);
  };

  const handleNextRound = () => {
    soundService.playPop();
    if (round >= TOTAL_ROUNDS) {
      setIsFinished(true);
      soundService.playFanfare();
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#f59e0b', '#10b981', '#ea580c', '#fcd34d', '#7c3aed']
      });
    } else {
      const nextR = round + 1;
      setRound(nextR);
      startRound(fotos, nextR);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <span style={{ fontSize: '3rem' }}>🎯</span>
        <h3 style={{ marginTop: '1rem', color: '#b45309' }}>Carregando Associação de Pares...</h3>
      </div>
    );
  }

  // TELA FINAL DE VITÓRIA
  if (isFinished) {
    return (
      <div style={{
        maxWidth: '560px',
        margin: '2rem auto',
        padding: '2rem 1.5rem',
        background: '#fff',
        borderRadius: '2.5rem',
        textAlign: 'center',
        boxShadow: 'var(--card-shadow)',
        border: '4px solid #fde68a'
      }}>
        <div style={{
          width: '90px',
          height: '90px',
          background: 'linear-gradient(135deg, #a7f3d0 0%, #10b981 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem',
          boxShadow: '0 8px 20px rgba(16, 185, 129, 0.35)'
        }}>
          <Trophy size={48} color="#fff" />
        </div>

        <h2 style={{ fontSize: '2rem', color: '#059669', marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>
          Sensacional! Você Ligou Todos os Pares! 🌟
        </h2>
        <p style={{ fontSize: '1.05rem', color: '#475569', marginBottom: '1.5rem' }}>
          Você conhece super bem a turminha e seus hobbies favoritos!
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={loadGameData}
            className="kid-btn"
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              fontSize: '1.05rem',
              padding: '0.75rem 1.75rem'
            }}
          >
            <RotateCcw size={20} />
            <span>Jogar Novamente</span>
          </button>

          <button
            onClick={onBack}
            className="kid-btn"
            style={{
              background: '#f1f5f9',
              color: '#475569',
              fontSize: '1.05rem',
              padding: '0.75rem 1.5rem'
            }}
          >
            <ArrowLeft size={20} />
            <span>Outros Jogos</span>
          </button>
        </div>
      </div>
    );
  }

  const allRoundMatched = matchedIds.size === activePairs.length;

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
          style={{ background: '#f1f5f9', color: '#475569', padding: '0.45rem 0.9rem', fontSize: '0.9rem' }}
        >
          <ArrowLeft size={18} />
          <span>Voltar</span>
        </button>

        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: '#b45309', fontSize: '1rem' }}>
          ASSOCIAÇÃO DE PARES ({round}/{TOTAL_ROUNDS})
        </span>

        <button
          onClick={() => startRound(fotos, round)}
          className="kid-btn"
          style={{ background: '#f1f5f9', color: '#475569', padding: '0.45rem 0.9rem', fontSize: '0.9rem' }}
          title="Reiniciar Rodada"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Instruções */}
      <div style={{
        background: '#fff',
        borderRadius: '1.75rem',
        padding: '1rem 1.25rem',
        textAlign: 'center',
        marginBottom: '1rem',
        boxShadow: 'var(--card-shadow)',
        border: '3px solid #fde68a'
      }}>
        <h3 style={{ fontSize: '1.2rem', color: '#ea580c', margin: '0 0 0.25rem', fontFamily: 'var(--font-display)' }}>
          Ligue cada foto ao seu objeto ou hobby! 🎯
        </h3>
        <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0, fontWeight: 600 }}>
          Toque na foto e depois no objeto (ou arraste de um lado para o outro)!
        </p>
      </div>

      {/* Área das Duas Colunas de Associação */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
        alignItems: 'stretch',
        marginBottom: '1rem'
      }}>
        {/* Coluna 1: Rostos da Família */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{
            fontSize: '0.85rem',
            fontWeight: 800,
            color: '#b45309',
            textAlign: 'center',
            textTransform: 'uppercase'
          }}>
            👤 Quem é?
          </div>

          {activePairs.map((pair) => {
            const isMatched = matchedIds.has(pair.id);
            const isSelected = selectedPersonId === pair.id;
            const isDragging = draggedPersonId === pair.id;

            return (
              <div
                key={pair.id}
                draggable={!isMatched}
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', pair.id);
                  setDraggedPersonId(pair.id);
                }}
                onDragEnd={() => {
                  setDraggedPersonId(null);
                  setDragOverObjectId(null);
                }}
                onTouchStart={() => {
                  if (!isMatched) setDraggedPersonId(pair.id);
                }}
                onClick={() => handlePersonClick(pair.id)}
                style={{
                  background: isMatched
                    ? '#ecfdf5'
                    : isSelected
                    ? '#fef3c7'
                    : '#fff',
                  borderRadius: '1.25rem',
                  padding: '0.65rem 0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  border: isMatched
                    ? '3px solid #10b981'
                    : isSelected
                    ? '3px solid #ea580c'
                    : '2px solid #e2e8f0',
                  boxShadow: isSelected
                    ? '0 0 16px rgba(234, 88, 12, 0.4)'
                    : isMatched
                    ? 'none'
                    : '0 4px 10px rgba(0,0,0,0.06)',
                  cursor: isMatched ? 'default' : 'pointer',
                  opacity: isMatched ? 0.75 : 1,
                  transform: isSelected ? 'scale(1.03)' : isDragging ? 'scale(0.96)' : 'none',
                  transition: 'all 0.2s ease',
                  userSelect: 'none'
                }}
              >
                <div style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  flexShrink: 0,
                  border: isMatched ? '2px solid #10b981' : '2px solid #f59e0b',
                  background: '#fef3c7'
                }}>
                  <img
                    src={pair.photo.urlThumb || pair.photo.urlOriginal}
                    alt={pair.photo.rotulo}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    color: isMatched ? '#059669' : '#1e293b',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {pair.photo.rotulo || 'Turminha'}
                  </div>
                  {isMatched && (
                    <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <Check size={14} /> Conectado!
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Coluna 2: Objetos / Hobbies */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{
            fontSize: '0.85rem',
            fontWeight: 800,
            color: '#b45309',
            textAlign: 'center',
            textTransform: 'uppercase'
          }}>
            ⭐ Objeto / Hobby
          </div>

          {shuffledObjects.map((item) => {
            const isMatched = matchedIds.has(item.pairId);
            const isSelected = selectedObjectId === item.pairId;
            const isTargetedDrag = dragOverObjectId === item.pairId;

            return (
              <div
                key={item.pairId}
                data-pair-target={item.pairId}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                }}
                onDragEnter={(e) => {
                  e.preventDefault();
                  setDragOverObjectId(item.pairId);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  if (dragOverObjectId === item.pairId) setDragOverObjectId(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const sourceId = e.dataTransfer.getData('text/plain') || draggedPersonId;
                  if (sourceId) {
                    checkMatch(sourceId, item.pairId);
                  }
                  setDraggedPersonId(null);
                  setDragOverObjectId(null);
                }}
                onClick={() => handleObjectClick(item.pairId)}
                style={{
                  background: isMatched
                    ? '#ecfdf5'
                    : isSelected
                    ? '#fef3c7'
                    : isTargetedDrag
                    ? '#fed7aa'
                    : '#fff',
                  borderRadius: '1.25rem',
                  padding: '0.65rem 0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  border: isMatched
                    ? '3px solid #10b981'
                    : isSelected || isTargetedDrag
                    ? '3px dashed #ea580c'
                    : '2px solid #e2e8f0',
                  boxShadow: isSelected || isTargetedDrag
                    ? '0 0 16px rgba(234, 88, 12, 0.4)'
                    : isMatched
                    ? 'none'
                    : '0 4px 10px rgba(0,0,0,0.06)',
                  cursor: isMatched ? 'default' : 'pointer',
                  opacity: isMatched ? 0.75 : 1,
                  transform: isSelected || isTargetedDrag ? 'scale(1.03)' : 'none',
                  transition: 'all 0.2s ease',
                  userSelect: 'none'
                }}
              >
                <div style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '1rem',
                  background: isMatched ? '#d1fae5' : '#fef3c7',
                  fontSize: '1.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {item.object.icon}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    color: isMatched ? '#059669' : '#1e293b',
                    lineHeight: 1.2
                  }}>
                    {item.object.name}
                  </div>
                  {isMatched && (
                    <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <Check size={14} /> Combinou!
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Botão de Próxima Rodada ao Conectar Todos */}
      {allRoundMatched && (
        <div style={{
          background: '#fff',
          borderRadius: '1.75rem',
          padding: '1.25rem',
          textAlign: 'center',
          boxShadow: 'var(--card-shadow)',
          border: '3px solid #10b981',
          animation: 'fadeIn 0.3s ease'
        }}>
          <h4 style={{ fontSize: '1.25rem', color: '#059669', margin: '0 0 0.5rem', fontWeight: 800 }}>
            ✨ Perfeito! Todos os pares foram associados! ✨
          </h4>
          <button
            onClick={handleNextRound}
            className="kid-btn"
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              fontSize: '1.05rem',
              padding: '0.75rem 2rem'
            }}
          >
            <span>{round >= TOTAL_ROUNDS ? 'Ver Resultado Final 🏆' : 'Próxima Rodada ➡️'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
