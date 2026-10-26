import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, RotateCcw, Sparkles, Trophy, CheckCircle, Clock } from 'lucide-react';
import { api } from '../services/api';
import { soundService } from '../services/soundService';

const CAUSE_STORIES = [
  {
    id: 'bolo',
    title: '🎂 A Receita do Bolo',
    story: 'Primeiro juntamos os ingredientes, depois misturamos a massa com carinho e por fim o bolo sai quentinho do forno!',
    steps: [
      { order: 1, label: '1. Ingredientes', icon: '🥣', desc: 'Farinha, leite e ovos na mesa' },
      { order: 2, label: '2. Misturando', icon: '🧑‍🍳', desc: 'Batendo a massa na tigela' },
      { order: 3, label: '3. Bolo Pronto!', icon: '🎂', desc: 'Bolo quentinho com velinha' }
    ]
  },
  {
    id: 'planta',
    title: '🌸 A Sementinha que Cresceu',
    story: 'Primeiro plantamos a semente na terra, depois regamos com água e sol, e por fim uma linda flor se abre!',
    steps: [
      { order: 1, label: '1. Sementinha', icon: '🌱', desc: 'Plantando a semente na terra' },
      { order: 2, label: '2. Brotando', icon: '🌿', desc: 'O brotinho crescendo ao sol' },
      { order: 3, label: '3. Flor Aberta!', icon: '🌸', desc: 'A flor perfumada no jardim' }
    ]
  },
  {
    id: 'passeio',
    title: '🚲 Preparando para o Parque',
    story: 'Primeiro acordamos de pijama na caminha, depois vestimos a roupinha e o tênis, e por fim vamos passear no parque!',
    steps: [
      { order: 1, label: '1. Acordando', icon: '🛌', desc: 'Espreguiçando na caminha' },
      { order: 2, label: '2. Vestindo Roupa', icon: '👟', desc: 'Calçando o tênis de passeio' },
      { order: 3, label: '3. Brincando!', icon: '🚲', desc: 'Passeando de bicicleta feliz' }
    ]
  },
  {
    id: 'castelo',
    title: '🏰 Construindo com Blocos',
    story: 'Primeiro espalhamos os blocos no tapete, depois empilhamos um a um com cuidado, e por fim o castelo fica em pé!',
    steps: [
      { order: 1, label: '1. Blocos Soltos', icon: '🧱', desc: 'Peças separadas no chão' },
      { order: 2, label: '2. Empilhando', icon: '🏗️', desc: 'Colocando bloco sobre bloco' },
      { order: 3, label: '3. Castelo Pronto!', icon: '🏰', desc: 'Torre alta e colorida' }
    ]
  },
  {
    id: 'lavar-maos',
    title: '🥪 Lavando as Mãos para o Lanche',
    story: 'Primeiro brincamos bastante e sujamos as mãos, depois lavamos com água e sabão, e por fim comemos o lanche limpinho!',
    steps: [
      { order: 1, label: '1. Mãos Sujas', icon: '🖐️', desc: 'Depois de brincar na terra' },
      { order: 2, label: '2. Água & Sabão', icon: '🧼', desc: 'Ensaboando bem as mãozinhas' },
      { order: 3, label: '3. Hora do Lanche!', icon: '🥪', desc: 'Mãos limpas comendo o sanduíche' }
    ]
  }
];

export function CauseAndEffectGame({ currentChild, onBack }) {
  const [fotos, setFotos] = useState([]);
  const [storyIdx, setStoryIdx] = useState(0);
  const [placedSlots, setPlacedSlots] = useState([null, null, null]); // [card, card, card]
  const [unplacedCards, setUnplacedCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [draggedCard, setDraggedCard] = useState(null);
  const [isWon, setIsWon] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  const currentStory = CAUSE_STORIES[storyIdx];

  useEffect(() => {
    loadGameData();
  }, [currentChild]);

  const loadGameData = async () => {
    setLoading(true);
    const list = await api.getFotos(currentChild?.id || 1);
    setFotos(list || []);
    setStoryIdx(0);
    setIsFinished(false);
    initStory(0);
    setLoading(false);
  };

  const initStory = (idx) => {
    const st = CAUSE_STORIES[idx];
    setPlacedSlots([null, null, null]);
    setSelectedCard(null);
    setDraggedCard(null);
    setIsWon(false);

    // Embaralha as 3 etapas
    const shuffled = [...st.steps].sort(() => Math.random() - 0.5);
    setUnplacedCards(shuffled);
  };

  // Coloca uma carta no slot indicado (0, 1 ou 2)
  const placeInSlot = (card, slotIndex) => {
    soundService.playPop();

    const nextSlots = [...placedSlots];
    const prevInSlot = nextSlots[slotIndex];

    // Se a carta já estava em outro slot, limpa de lá
    const originSlotIdx = nextSlots.findIndex(c => c && c.order === card.order);
    if (originSlotIdx !== -1) {
      nextSlots[originSlotIdx] = null;
    }

    nextSlots[slotIndex] = card;
    setPlacedSlots(nextSlots);

    // Atualiza cartas não alocadas
    let nextUnplaced = unplacedCards.filter(c => c.order !== card.order);
    if (prevInSlot && prevInSlot.order !== card.order) {
      nextUnplaced.push(prevInSlot);
    }
    setUnplacedCards(nextUnplaced);
    setSelectedCard(null);
    setDraggedCard(null);

    // Verifica se os 3 slots foram preenchidos
    if (nextSlots.every(c => c !== null)) {
      checkSequence(nextSlots);
    }
  };

  // Remove do slot de volta para a bandeja
  const removeFromSlot = (slotIndex) => {
    if (isWon) return;
    const card = placedSlots[slotIndex];
    if (!card) return;

    soundService.playPop();
    const nextSlots = [...placedSlots];
    nextSlots[slotIndex] = null;
    setPlacedSlots(nextSlots);
    setUnplacedCards(prev => [...prev, card]);
  };

  // Confere se a ordem causal está correta (1 -> 2 -> 3)
  const checkSequence = (slots) => {
    const isCorrect = slots[0]?.order === 1 && slots[1]?.order === 2 && slots[2]?.order === 3;

    if (isCorrect) {
      setIsWon(true);
      soundService.playSuccess();
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#10b981', '#f59e0b', '#ea580c', '#fcd34d', '#7c3aed']
      });
    } else {
      soundService.playBoop();
    }
  };

  const handleNextStory = () => {
    soundService.playPop();
    if (storyIdx + 1 >= CAUSE_STORIES.length) {
      setIsFinished(true);
      soundService.playFanfare();
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#10b981', '#f59e0b', '#ea580c', '#fcd34d', '#7c3aed']
      });
    } else {
      const nextIdx = storyIdx + 1;
      setStoryIdx(nextIdx);
      initStory(nextIdx);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <span style={{ fontSize: '3rem' }}>⏳</span>
        <h3 style={{ marginTop: '1rem', color: '#b45309' }}>Carregando Causa e Efeito...</h3>
      </div>
    );
  }

  // TELA DE VITÓRIA FINAL
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
          Mestre do Tempo e Causalidade! 🌟
        </h2>
        <p style={{ fontSize: '1.05rem', color: '#475569', marginBottom: '1.5rem' }}>
          Você compreendeu o que acontece antes, durante e depois em todas as historinhas!
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

  const slotLabels = ['1. O que acontece PRIMEIRO? 🌱', '2. O que acontece DEPOIS? 🌿', '3. O FINAL da história! 🌸'];

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '1rem' }}>
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
          CAUSA E EFEITO ({storyIdx + 1}/{CAUSE_STORIES.length})
        </span>

        <button
          onClick={() => initStory(storyIdx)}
          className="kid-btn"
          style={{ background: '#f1f5f9', color: '#475569', padding: '0.45rem 0.9rem', fontSize: '0.9rem' }}
          title="Reiniciar História"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Título da História */}
      <div style={{
        background: '#fff',
        borderRadius: '1.75rem',
        padding: '1.25rem',
        textAlign: 'center',
        marginBottom: '1rem',
        boxShadow: 'var(--card-shadow)',
        border: '3px solid #fde68a'
      }}>
        <h3 style={{ fontSize: '1.3rem', color: '#ea580c', margin: '0 0 0.35rem', fontFamily: 'var(--font-display)' }}>
          {currentStory.title}
        </h3>
        <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0, fontWeight: 600 }}>
          Coloque os cartões na ordem lógica correta: do começo ao fim!
        </p>
      </div>

      {/* ÁREA DOS 3 SLOTS DE ORDEM TEMPORAL (1, 2, 3) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '0.75rem',
        marginBottom: '1.25rem'
      }}>
        {[0, 1, 2].map((slotIdx) => {
          const card = placedSlots[slotIdx];

          return (
            <div
              key={slotIdx}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const cardOrder = parseInt(e.dataTransfer.getData('text/plain'), 10);
                const targetCard = currentStory.steps.find(s => s.order === cardOrder) || draggedCard;
                if (targetCard) {
                  placeInSlot(targetCard, slotIdx);
                }
              }}
              onClick={() => {
                if (selectedCard) {
                  placeInSlot(selectedCard, slotIdx);
                } else if (card) {
                  removeFromSlot(slotIdx);
                }
              }}
              style={{
                background: card ? (isWon ? '#ecfdf5' : '#fff') : '#f8fafc',
                borderRadius: '1.5rem',
                border: card
                  ? (isWon ? '3px solid #10b981' : '3px solid #ea580c')
                  : '3px dashed #cbd5e1',
                padding: '1rem 0.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '160px',
                cursor: 'pointer',
                boxShadow: card ? '0 4px 12px rgba(0,0,0,0.08)' : 'none',
                position: 'relative',
                transition: 'all 0.2s ease',
                textAlign: 'center'
              }}
            >
              {/* Rótulo da Etapa */}
              <div style={{
                position: 'absolute',
                top: '8px',
                fontSize: '0.7rem',
                fontWeight: 800,
                color: '#94a3b8'
              }}>
                Etapa {slotIdx + 1}
              </div>

              {card ? (
                <>
                  <span style={{ fontSize: '3rem', margin: '0.5rem 0 0.3rem' }}>{card.icon}</span>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>
                    {card.label}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, marginTop: '0.2rem' }}>
                    {card.desc}
                  </div>
                </>
              ) : (
                <div style={{ color: '#cbd5e1', fontSize: '0.8rem', fontWeight: 700, padding: '0 0.2rem' }}>
                  Toque para colocar a Etapa {slotIdx + 1}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Explicação da Causalidade ao Vencer */}
      {isWon && (
        <div style={{
          background: '#fff',
          borderRadius: '1.75rem',
          padding: '1.25rem',
          textAlign: 'center',
          boxShadow: 'var(--card-shadow)',
          border: '3px solid #10b981',
          marginBottom: '1rem',
          animation: 'fadeIn 0.25s ease'
        }}>
          <h4 style={{ fontSize: '1.2rem', color: '#059669', margin: '0 0 0.4rem', fontWeight: 800 }}>
            🎉 Sequência Perfeita!
          </h4>
          <p style={{ fontSize: '0.95rem', color: '#334155', margin: '0 0 1rem', fontWeight: 600 }}>
            {currentStory.story}
          </p>
          <button
            onClick={handleNextStory}
            className="kid-btn"
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              fontSize: '1rem',
              padding: '0.65rem 2rem'
            }}
          >
            <span>{storyIdx + 1 >= CAUSE_STORIES.length ? 'Ver Resultado Final 🏆' : 'Próxima História ➡️'}</span>
          </button>
        </div>
      )}

      {/* BANDEJA DE ETAPAS EMBARALHADAS */}
      {!isWon && unplacedCards.length > 0 && (
        <div style={{
          background: '#fff',
          borderRadius: '1.75rem',
          padding: '1rem',
          boxShadow: 'var(--card-shadow)',
          border: '3px solid #e2e8f0',
          textAlign: 'center'
        }}>
          <h4 style={{ fontSize: '0.9rem', color: '#475569', margin: '0 0 0.75rem', fontWeight: 800 }}>
            📦 Cartões da História (Arraste ou Toque):
          </h4>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {unplacedCards.map(cd => {
              const isSelected = selectedCard?.order === cd.order;

              return (
                <div
                  key={cd.order}
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', cd.order.toString());
                    setDraggedCard(cd);
                  }}
                  onDragEnd={() => setDraggedCard(null)}
                  onClick={() => {
                    soundService.playPop();
                    setSelectedCard(isSelected ? null : cd);
                  }}
                  style={{
                    width: '130px',
                    padding: '0.75rem 0.5rem',
                    borderRadius: '1.25rem',
                    background: isSelected ? '#fef3c7' : '#fff',
                    border: isSelected ? '3px solid #ea580c' : '2px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'grab',
                    boxShadow: isSelected ? '0 0 12px rgba(234, 88, 12, 0.4)' : '0 3px 6px rgba(0,0,0,0.08)',
                    transform: isSelected ? 'scale(1.05)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ fontSize: '2.4rem' }}>{cd.icon}</span>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1e293b', marginTop: '0.3rem' }}>
                    {cd.label}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600 }}>
                    {cd.desc}
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
