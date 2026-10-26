import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, RotateCcw, Sparkles, Trophy, Check, HelpCircle } from 'lucide-react';
import { api } from '../services/api';
import { soundService } from '../services/soundService';

const ACCESSORIES = [
  { id: 'coroa', label: 'Coroa', icon: '👑', color: '#f59e0b' },
  { id: 'oculos', label: 'Óculos', icon: '🕶️', color: '#10b981' },
  { id: 'cartola', label: 'Cartola', icon: '🎩', color: '#7c3aed' }
];

const FALLBACK_ROWS = [
  { id: 0, label: 'Você', icon: '🧒' },
  { id: 1, label: 'Papai', icon: '👨' },
  { id: 2, label: 'Mamãe', icon: '👩' }
];

export function MatrixAssociationGame({ currentChild, onBack }) {
  const [fotos, setFotos] = useState([]);
  const [round, setRound] = useState(1);
  const [matrixState, setMatrixState] = useState([
    [null, null, null],
    [null, null, null],
    [null, null, null]
  ]);
  const [availableCards, setAvailableCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [draggedCard, setDraggedCard] = useState(null);
  const [isWon, setIsWon] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  const TOTAL_ROUNDS = 3;

  useEffect(() => {
    loadGameData();
  }, [currentChild]);

  const loadGameData = async () => {
    setLoading(true);
    const list = await api.getFotos(currentChild?.id || 1);
    setFotos(list || []);
    setRound(1);
    setIsFinished(false);
    initRound(1, list || []);
    setLoading(false);
  };

  const getRowPerson = (rowIdx, photoList) => {
    const pool = (photoList && photoList.length >= 3) ? photoList : fotos;
    if (pool.length > rowIdx) {
      return {
        id: rowIdx,
        label: pool[rowIdx].rotulo,
        url: pool[rowIdx].urlThumb || pool[rowIdx].urlOriginal
      };
    }
    return FALLBACK_ROWS[rowIdx];
  };

  const initRound = (rNum, photoList) => {
    setIsWon(false);
    setSelectedCard(null);
    setDraggedCard(null);

    // Em cada rodada, sorteia quais 4 ou 5 cruzamentos a criança precisa resolver
    const allCells = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        allCells.push({ r, c });
      }
    }

    // Seleciona 4 células como desafio para preencher
    const shuffled = [...allCells].sort(() => Math.random() - 0.5);
    const targets = shuffled.slice(0, 4);

    // Monta o tabuleiro: as outras 5 já estão preenchidas
    const initialGrid = [
      [null, null, null],
      [null, null, null],
      [null, null, null]
    ];

    const cardsToSolve = [];

    allCells.forEach(cell => {
      const isTarget = targets.some(t => t.r === cell.r && t.c === cell.c);
      const person = getRowPerson(cell.r, photoList);
      const accessory = ACCESSORIES[cell.c];
      const cardObj = {
        id: `card-${cell.r}-${cell.c}`,
        r: cell.r,
        c: cell.c,
        person,
        accessory
      };

      if (isTarget) {
        cardsToSolve.push(cardObj);
      } else {
        initialGrid[cell.r][cell.c] = cardObj;
      }
    });

    setMatrixState(initialGrid);
    setAvailableCards(cardsToSolve.sort(() => Math.random() - 0.5));
  };

  // Posiciona carta na célula da matriz
  const placeCard = (card, targetR, targetC) => {
    if (matrixState[targetR][targetC] !== null) return;

    if (card.r === targetR && card.c === targetC) {
      // Cruzamento correto! 🌟
      soundService.playSuccess();
      const nextGrid = matrixState.map(row => [...row]);
      nextGrid[targetR][targetC] = card;
      setMatrixState(nextGrid);

      // Remove da bandeja
      const nextAvailable = availableCards.filter(c => c.id !== card.id);
      setAvailableCards(nextAvailable);
      setSelectedCard(null);
      setDraggedCard(null);

      // Matriz completa?
      if (nextAvailable.length === 0) {
        setIsWon(true);
        soundService.playFanfare();
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#10b981', '#f59e0b', '#ea580c', '#fcd34d', '#7c3aed']
        });
      }
    } else {
      // Cruzamento errado
      soundService.playBoop();
    }
  };

  const handleCellClick = (r, c) => {
    if (selectedCard) {
      placeCard(selectedCard, r, c);
    }
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
        colors: ['#10b981', '#f59e0b', '#ea580c', '#fcd34d', '#7c3aed']
      });
    } else {
      const nextR = round + 1;
      setRound(nextR);
      initRound(nextR, fotos);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <span style={{ fontSize: '3rem' }}>📊</span>
        <h3 style={{ marginTop: '1rem', color: '#b45309' }}>Carregando Matriz de Dupla Entrada...</h3>
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
          Mestre da Tabela Mágica! 🌟
        </h2>
        <p style={{ fontSize: '1.05rem', color: '#475569', marginBottom: '1.5rem' }}>
          Você associou todas as linhas e colunas combinando os atributos perfeitamente!
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
          MATRIZ DE DUPLA ENTRADA ({round}/{TOTAL_ROUNDS})
        </span>

        <button
          onClick={() => initRound(round, fotos)}
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
        borderRadius: '1.5rem',
        padding: '0.75rem 1rem',
        textAlign: 'center',
        marginBottom: '1rem',
        border: '2px solid #fde68a'
      }}>
        <p style={{ fontSize: '0.9rem', color: '#92400e', margin: 0, fontWeight: 700 }}>
          Encontre o cruzamento certo entre a <strong>Pessoa da Linha</strong> e o <strong>Acessório da Coluna</strong>!
        </p>
      </div>

      {/* TABELA / GRADE DE MATRIZ DE DUPLA ENTRADA (4x4 com cabeçalhos) */}
      <div style={{
        background: '#fff',
        borderRadius: '2rem',
        padding: '1.25rem',
        boxShadow: 'var(--card-shadow)',
        border: '4px solid #fde68a',
        marginBottom: '1rem',
        overflowX: 'auto'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '80px repeat(3, 1fr)',
          gap: '0.5rem',
          minWidth: '340px'
        }}>
          {/* Canto Superior Esquerdo */}
          <div style={{
            background: '#fef3c7',
            borderRadius: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem'
          }}>
            🎯
          </div>

          {/* Cabeçalhos das 3 Colunas (Acessórios) */}
          {ACCESSORIES.map(acc => (
            <div
              key={acc.id}
              style={{
                background: '#f8fafc',
                border: `2px solid ${acc.color}`,
                borderRadius: '1rem',
                padding: '0.4rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <span style={{ fontSize: '1.8rem' }}>{acc.icon}</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: acc.color }}>{acc.label}</span>
            </div>
          ))}

          {/* 3 Linhas com Cabeçalho da Pessoa e as 3 Células */}
          {[0, 1, 2].map(r => {
            const person = getRowPerson(r, fotos);

            return (
              <React.Fragment key={r}>
                {/* Cabeçalho da Linha (Pessoa) */}
                <div style={{
                  background: '#f8fafc',
                  border: '2px solid #ea580c',
                  borderRadius: '1rem',
                  padding: '0.4rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    background: '#fef3c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {person.url ? (
                      <img src={person.url} alt={person.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '1.5rem' }}>{person.icon}</span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ea580c', marginTop: '0.2rem' }}>
                    {person.label}
                  </span>
                </div>

                {/* Células de Cruzamento da Linha */}
                {[0, 1, 2].map(c => {
                  const placed = matrixState[r][c];

                  return (
                    <div
                      key={c}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const cardId = e.dataTransfer.getData('text/plain');
                        const targetCard = availableCards.find(cd => cd.id === cardId) || draggedCard;
                        if (targetCard) {
                          placeCard(targetCard, r, c);
                        }
                      }}
                      onClick={() => handleCellClick(r, c)}
                      style={{
                        aspectRatio: '1',
                        background: placed ? '#ecfdf5' : '#f8fafc',
                        border: placed ? '3px solid #10b981' : '2px dashed #cbd5e1',
                        borderRadius: '1.25rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        cursor: placed ? 'default' : 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {placed ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: '1.4rem' }}>{placed.accessory.icon}</span>
                          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#059669' }}>
                            {placed.person.label}
                          </span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '1.2rem', color: '#cbd5e1' }}>+</span>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>

        {/* Notificação de Vitória da Rodada */}
        {isWon && (
          <div style={{ marginTop: '1.25rem', textAlign: 'center', animation: 'fadeIn 0.25s ease' }}>
            <p style={{ fontSize: '1.2rem', color: '#059669', fontWeight: 800, margin: '0 0 0.5rem' }}>
              ✨ Perfeito! Toda a matriz foi combinada com sucesso! ✨
            </p>
            <button
              onClick={handleNextRound}
              className="kid-btn"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                fontSize: '1rem',
                padding: '0.65rem 1.75rem'
              }}
            >
              <span>{round >= TOTAL_ROUNDS ? 'Ver Resultado Final 🏆' : 'Próxima Matriz ➡️'}</span>
            </button>
          </div>
        )}
      </div>

      {/* BANDEJA DE CARTAS PARA ENCAIXAR */}
      {!isWon && availableCards.length > 0 && (
        <div style={{
          background: '#fff',
          borderRadius: '1.75rem',
          padding: '1rem',
          boxShadow: 'var(--card-shadow)',
          border: '3px solid #e2e8f0'
        }}>
          <h4 style={{ fontSize: '0.9rem', color: '#475569', textAlign: 'center', margin: '0 0 0.75rem', fontWeight: 800 }}>
            Toque ou arraste para o cruzamento certo:
          </h4>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {availableCards.map(cd => {
              const isSelected = selectedCard?.id === cd.id;

              return (
                <div
                  key={cd.id}
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', cd.id);
                    setDraggedCard(cd);
                  }}
                  onDragEnd={() => setDraggedCard(null)}
                  onClick={() => {
                    soundService.playPop();
                    setSelectedCard(isSelected ? null : cd);
                  }}
                  style={{
                    padding: '0.65rem 0.85rem',
                    borderRadius: '1.25rem',
                    background: isSelected ? '#fef3c7' : '#fff',
                    border: isSelected ? '3px solid #ea580c' : '2px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'grab',
                    boxShadow: isSelected ? '0 0 12px rgba(234, 88, 12, 0.4)' : '0 3px 6px rgba(0,0,0,0.08)',
                    transform: isSelected ? 'scale(1.05)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ fontSize: '1.6rem' }}>{cd.accessory.icon}</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>{cd.person.label}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>com {cd.accessory.label}</div>
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
