import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, RotateCcw, Sparkles, Trophy, Check, HelpCircle } from 'lucide-react';
import { api } from '../services/api';
import { soundService } from '../services/soundService';

// Puzzles 3x3 e 4x4
// 0 representa célula vazia a ser preenchida pelo jogador
const SUDOKU_LEVELS = [
  // Nível 1: 3x3 com 3 espaços vazios
  {
    size: 3,
    title: 'Nível 1 (3x3 - Fácil)',
    initialGrid: [
      [1, 2, 0],
      [0, 1, 2],
      [2, 0, 1]
    ],
    solution: [
      [1, 2, 3],
      [3, 1, 2],
      [2, 3, 1]
    ]
  },
  // Nível 2: 3x3 com 4 espaços vazios
  {
    size: 3,
    title: 'Nível 2 (3x3 - Médio)',
    initialGrid: [
      [0, 3, 1],
      [1, 0, 0],
      [3, 1, 0]
    ],
    solution: [
      [2, 3, 1],
      [1, 2, 3],
      [3, 1, 2]
    ]
  },
  // Nível 3: 4x4 com blocos 2x2
  {
    size: 4,
    title: 'Nível 3 (4x4 - Desafio)',
    initialGrid: [
      [1, 0, 3, 4],
      [3, 4, 1, 0],
      [0, 1, 4, 3],
      [4, 3, 0, 1]
    ],
    solution: [
      [1, 2, 3, 4],
      [3, 4, 1, 2],
      [2, 1, 4, 3],
      [4, 3, 2, 1]
    ]
  }
];

const FALLBACK_ITEMS = [
  { id: 1, label: 'Você', icon: '🧒', color: '#ea580c' },
  { id: 2, label: 'Mamãe', icon: '👩', color: '#10b981' },
  { id: 3, label: 'Papai', icon: '👨', color: '#f59e0b' },
  { id: 4, label: 'Pet Rex', icon: '🐶', color: '#7c3aed' }
];

export function SudokuKidsGame({ currentChild, onBack }) {
  const [fotos, setFotos] = useState([]);
  const [levelIdx, setLevelIdx] = useState(0);
  const [currentGrid, setCurrentGrid] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isWon, setIsWon] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  // Drag state
  const [draggedItemId, setDraggedItemId] = useState(null);

  const levelData = SUDOKU_LEVELS[levelIdx];

  useEffect(() => {
    loadGameData();
  }, [currentChild]);

  const loadGameData = async () => {
    setLoading(true);
    const list = await api.getFotos(currentChild?.id || 1);
    setFotos(list || []);
    setLevelIdx(0);
    setIsFinished(false);
    initLevel(0);
    setLoading(false);
  };

  const initLevel = (idx) => {
    const lvl = SUDOKU_LEVELS[idx];
    setCurrentGrid(lvl.initialGrid.map(row => [...row]));
    setSelectedItem(null);
    setDraggedItemId(null);
    setIsWon(false);
  };

  // Mapeia IDs 1..4 para fotos ou ícones
  const getItemData = (val) => {
    if (!val || val === 0) return null;
    const fallback = FALLBACK_ITEMS[val - 1] || FALLBACK_ITEMS[0];
    const photo = fotos[val - 1];
    return {
      id: val,
      label: photo ? photo.rotulo : fallback.label,
      url: photo ? (photo.urlThumb || photo.urlOriginal) : null,
      icon: fallback.icon,
      color: fallback.color
    };
  };

  // Preenche célula
  const handleCellClick = (r, c) => {
    // Se a célula já era fixa inicial, não mexe
    if (levelData.initialGrid[r][c] !== 0) return;

    soundService.playPop();

    // Se já tinha algo colocado e nenhum item novo selecionado, remove
    if (currentGrid[r][c] !== 0 && !selectedItem) {
      const nextG = currentGrid.map(row => [...row]);
      nextG[r][c] = 0;
      setCurrentGrid(nextG);
      return;
    }

    if (selectedItem) {
      const nextG = currentGrid.map(row => [...row]);
      nextG[r][c] = selectedItem;
      setCurrentGrid(nextG);
      checkSudoku(nextG);
    }
  };

  // Drop no Tabuleiro
  const handleCellDrop = (r, c, itemId) => {
    if (levelData.initialGrid[r][c] !== 0) return;
    soundService.playPop();
    const nextG = currentGrid.map(row => [...row]);
    nextG[r][c] = itemId;
    setCurrentGrid(nextG);
    checkSudoku(nextG);
    setDraggedItemId(null);
  };

  // Validação da solução
  const checkSudoku = (grid) => {
    const isComplete = grid.every(row => row.every(cell => cell !== 0));
    if (!isComplete) return;

    // Checa se bate com a solução
    const isCorrect = grid.every((row, r) =>
      row.every((val, c) => val === levelData.solution[r][c])
    );

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

  const handleNextLevel = () => {
    soundService.playPop();
    if (levelIdx + 1 >= SUDOKU_LEVELS.length) {
      setIsFinished(true);
      soundService.playFanfare();
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#10b981', '#f59e0b', '#ea580c', '#fcd34d', '#7c3aed']
      });
    } else {
      const nextIdx = levelIdx + 1;
      setLevelIdx(nextIdx);
      initLevel(nextIdx);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <span style={{ fontSize: '3rem' }}>🧩</span>
        <h3 style={{ marginTop: '1rem', color: '#b45309' }}>Carregando Sudoku Ilustrado...</h3>
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
          Mestre do Sudoku! 🌟
        </h2>
        <p style={{ fontSize: '1.05rem', color: '#475569', marginBottom: '1.5rem' }}>
          Você completou todas as linhas e colunas sem repetir nenhuma foto da turminha!
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

  const activeChoices = Array.from({ length: levelData.size }, (_, i) => i + 1);

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '1rem' }}>
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
          SUDOKU ILUSTRADO ({levelIdx + 1}/{SUDOKU_LEVELS.length})
        </span>

        <button
          onClick={() => initLevel(levelIdx)}
          className="kid-btn"
          style={{ background: '#f1f5f9', color: '#475569', padding: '0.45rem 0.9rem', fontSize: '0.9rem' }}
          title="Reiniciar Nível"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Regra Visual */}
      <div style={{
        background: '#fff',
        borderRadius: '1.5rem',
        padding: '0.75rem 1rem',
        textAlign: 'center',
        marginBottom: '1rem',
        border: '2px solid #fde68a'
      }}>
        <p style={{ fontSize: '0.9rem', color: '#92400e', margin: 0, fontWeight: 700 }}>
          ⭐ Regra de Ouro: Nenhuma foto pode se repetir na mesma linha ou coluna!
        </p>
      </div>

      {/* TABULEIRO DO SUDOKU */}
      <div style={{
        background: '#fff',
        borderRadius: '2rem',
        padding: '1.25rem',
        boxShadow: 'var(--card-shadow)',
        border: '4px solid #fde68a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${levelData.size}, 1fr)`,
          gap: '0.5rem',
          width: '100%',
          maxWidth: levelData.size === 4 ? '360px' : '300px'
        }}>
          {currentGrid.map((row, r) =>
            row.map((val, c) => {
              const isFixed = levelData.initialGrid[r][c] !== 0;
              const item = getItemData(val);

              return (
                <div
                  key={`${r}-${c}`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const dragId = parseInt(e.dataTransfer.getData('text/plain'), 10) || draggedItemId;
                    if (dragId) handleCellDrop(r, c, dragId);
                  }}
                  onClick={() => handleCellClick(r, c)}
                  style={{
                    aspectRatio: '1',
                    background: isFixed ? '#fef3c7' : item ? '#ecfdf5' : '#f8fafc',
                    borderRadius: '1.25rem',
                    border: isFixed
                      ? '3px solid #f59e0b'
                      : item
                      ? '3px solid #10b981'
                      : '2px dashed #cbd5e1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: isFixed ? 'default' : 'pointer',
                    boxShadow: isFixed ? 'none' : '0 2px 6px rgba(0,0,0,0.05)',
                    transform: item && !isFixed ? 'scale(1.02)' : 'none',
                    transition: 'all 0.15s ease',
                    overflow: 'hidden',
                    position: 'relative'
                  }}
                >
                  {item ? (
                    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      {item.url ? (
                        <img
                          src={item.url}
                          alt={item.label}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <span style={{ fontSize: levelData.size === 4 ? '2rem' : '2.4rem' }}>{item.icon}</span>
                      )}
                    </div>
                  ) : (
                    <span style={{ fontSize: '1.5rem', color: '#cbd5e1' }}>?</span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Notificação de Vitória do Nível */}
        {isWon && (
          <div style={{ marginTop: '1.25rem', textAlign: 'center', animation: 'fadeIn 0.25s ease' }}>
            <p style={{ fontSize: '1.2rem', color: '#059669', fontWeight: 800, margin: '0 0 0.5rem' }}>
              ✨ Perfeito! Sudoku resolvido com lógica impecável! ✨
            </p>
            <button
              onClick={handleNextLevel}
              className="kid-btn"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                fontSize: '1rem',
                padding: '0.65rem 1.75rem'
              }}
            >
              <span>{levelIdx + 1 >= SUDOKU_LEVELS.length ? 'Ver Resultado Final 🏆' : 'Próximo Desafio ➡️'}</span>
            </button>
          </div>
        )}
      </div>

      {/* BANDEJA DE FOTOS/PEÇAS DISPONÍVEIS */}
      {!isWon && (
        <div style={{
          background: '#fff',
          borderRadius: '1.75rem',
          padding: '1rem',
          boxShadow: 'var(--card-shadow)',
          border: '3px solid #e2e8f0'
        }}>
          <h4 style={{ fontSize: '0.9rem', color: '#475569', textAlign: 'center', margin: '0 0 0.75rem', fontWeight: 800 }}>
            Toque ou arraste a foto para a casa vazia:
          </h4>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {activeChoices.map((choiceId) => {
              const item = getItemData(choiceId);
              const isSelected = selectedItem === choiceId;

              return (
                <div
                  key={choiceId}
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', choiceId.toString());
                    setDraggedItemId(choiceId);
                  }}
                  onDragEnd={() => setDraggedItemId(null)}
                  onClick={() => {
                    soundService.playPop();
                    setSelectedItem(isSelected ? null : choiceId);
                  }}
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '1.25rem',
                    background: isSelected ? '#fef3c7' : '#fff',
                    border: isSelected ? '3px solid #ea580c' : '2px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'grab',
                    overflow: 'hidden',
                    boxShadow: isSelected ? '0 0 14px rgba(234, 88, 12, 0.4)' : '0 3px 8px rgba(0,0,0,0.08)',
                    transform: isSelected ? 'scale(1.08)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {item.url ? (
                    <img src={item.url} alt={item.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '2rem' }}>{item.icon}</span>
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
