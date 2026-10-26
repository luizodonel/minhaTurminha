import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  RotateCcw,
  Play,
  Trash2,
  Trophy,
  ArrowUp,
  ArrowDown,
  ArrowLeft as ArrowLeftIcon,
  ArrowRight,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { api } from '../services/api';
import { soundService } from '../services/soundService';

const MAZE_LEVELS = [
  // Nível 1: 4x4 simples
  {
    size: 4,
    start: { r: 0, c: 0 },
    goal: { r: 3, c: 3 },
    obstacles: [
      { r: 0, c: 2, icon: '🌳' },
      { r: 1, c: 0, icon: '🪵' },
      { r: 2, c: 2, icon: '💧' },
      { r: 3, c: 1, icon: '🌳' }
    ]
  },
  // Nível 2: 5x5 intermediário
  {
    size: 5,
    start: { r: 0, c: 0 },
    goal: { r: 4, c: 4 },
    obstacles: [
      { r: 0, c: 3, icon: '🌳' },
      { r: 1, c: 1, icon: '🪵' },
      { r: 1, c: 3, icon: '💧' },
      { r: 2, c: 1, icon: '🌳' },
      { r: 3, c: 3, icon: '🪵' },
      { r: 3, c: 4, icon: '🌳' },
      { r: 4, c: 1, icon: '💧' }
    ]
  },
  // Nível 3: 5x5 com obstáculos lúdicos
  {
    size: 5,
    start: { r: 4, c: 0 },
    goal: { r: 0, c: 4 },
    obstacles: [
      { r: 1, c: 1, icon: '🌳' },
      { r: 1, c: 2, icon: '🌳' },
      { r: 2, c: 4, icon: '🪵' },
      { r: 3, c: 1, icon: '💧' },
      { r: 3, c: 2, icon: '🪵' },
      { r: 4, c: 3, icon: '🌳' }
    ]
  }
];

const FALLBACK_PHOTOS = [
  { rotulo: 'Você', urlThumb: 'https://images.unsplash.com/photo-1544126592-807ade215a0b?w=320&auto=format&fit=crop&q=80' },
  { rotulo: 'Mamãe', urlThumb: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=320&auto=format&fit=crop&q=80' },
  { rotulo: 'Papai', urlThumb: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=320&auto=format&fit=crop&q=80' },
  { rotulo: 'Pet', urlThumb: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=320&auto=format&fit=crop&q=80' }
];

export function MazeGame({ currentChild, onBack }) {
  const [fotos, setFotos] = useState([]);
  const [levelIdx, setLevelIdx] = useState(0);
  const [playerPos, setPlayerPos] = useState({ r: 0, c: 0 });
  const [targetPhoto, setTargetPhoto] = useState(null);
  const [mode, setMode] = useState('livre'); // 'livre' ou 'programar'
  const [commandQueue, setCommandQueue] = useState([]); // ['UP', 'RIGHT', etc.]
  const [isExecuting, setIsExecuting] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  const currentMaze = MAZE_LEVELS[levelIdx];

  useEffect(() => {
    loadGameData();
  }, [currentChild]);

  const loadGameData = async () => {
    setLoading(true);
    let list = await api.getFotos(currentChild?.id || 1);
    if (!list || list.length < 2) {
      list = FALLBACK_PHOTOS;
    }
    setFotos(list);
    setLevelIdx(0);
    setIsFinished(false);
    initLevel(0, list);
    setLoading(false);
  };

  const initLevel = (idx, photoList) => {
    const maze = MAZE_LEVELS[idx];
    setPlayerPos({ ...maze.start });
    setIsWon(false);
    setCommandQueue([]);
    setIsExecuting(false);

    const pool = (photoList && photoList.length > 1) ? photoList : fotos;
    const dest = pool[(idx + 1) % pool.length];
    setTargetPhoto(dest);
  };

  const isObstacle = (r, c) => {
    return currentMaze.obstacles.some(obs => obs.r === r && obs.c === c);
  };

  const getObstacleIcon = (r, c) => {
    const obs = currentMaze.obstacles.find(o => o.r === r && o.c === c);
    return obs ? obs.icon : null;
  };

  // Movimento no modo Livre (toque/botão direto)
  const tryMove = (dr, dc) => {
    if (isWon || isExecuting) return;

    const newR = playerPos.r + dr;
    const newC = playerPos.c + dc;

    // Checa limites do tabuleiro
    if (newR < 0 || newR >= currentMaze.size || newC < 0 || newC >= currentMaze.size) {
      soundService.playBoop();
      return;
    }

    // Checa obstáculo
    if (isObstacle(newR, newC)) {
      soundService.playBoop();
      return;
    }

    soundService.playPop();
    setPlayerPos({ r: newR, c: newC });

    // Checa vitória
    if (newR === currentMaze.goal.r && newC === currentMaze.goal.c) {
      handleLevelVictory();
    }
  };

  // Adiciona comando no modo Programação
  const addCommand = (dir) => {
    if (isExecuting || isWon) return;
    if (commandQueue.length >= 12) return;
    soundService.playPop();
    setCommandQueue(prev => [...prev, dir]);
  };

  // Remove o último comando
  const removeLastCommand = () => {
    if (isExecuting || isWon) return;
    soundService.playPop();
    setCommandQueue(prev => prev.slice(0, -1));
  };

  // Executa os passos programados (pensamento computacional)
  const executeProgram = async () => {
    if (isExecuting || commandQueue.length === 0 || isWon) return;
    setIsExecuting(true);

    let curR = currentMaze.start.r;
    let curC = currentMaze.start.c;
    setPlayerPos({ r: curR, c: curC });

    for (let i = 0; i < commandQueue.length; i++) {
      await new Promise(res => setTimeout(res, 400));
      const cmd = commandQueue[i];
      let dr = 0;
      let dc = 0;
      if (cmd === 'UP') dr = -1;
      if (cmd === 'DOWN') dr = 1;
      if (cmd === 'LEFT') dc = -1;
      if (cmd === 'RIGHT') dc = 1;

      const nextR = curR + dr;
      const nextC = curC + dc;

      if (
        nextR < 0 ||
        nextR >= currentMaze.size ||
        nextC < 0 ||
        nextC >= currentMaze.size ||
        isObstacle(nextR, nextC)
      ) {
        soundService.playBoop();
        setIsExecuting(false);
        return;
      }

      curR = nextR;
      curC = nextC;
      setPlayerPos({ r: curR, c: curC });
      soundService.playPop();
    }

    setIsExecuting(false);

    if (curR === currentMaze.goal.r && curC === currentMaze.goal.c) {
      handleLevelVictory();
    } else {
      soundService.playBoop();
    }
  };

  const handleLevelVictory = () => {
    setIsWon(true);
    soundService.playSuccess();
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#f59e0b', '#ea580c', '#fcd34d']
    });
  };

  const handleNextLevel = () => {
    soundService.playPop();
    if (levelIdx + 1 >= MAZE_LEVELS.length) {
      setIsFinished(true);
      soundService.playFanfare();
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#10b981', '#f59e0b', '#ea580c', '#fcd34d', '#7c3aed']
      });
    } else {
      const nextL = levelIdx + 1;
      setLevelIdx(nextL);
      initLevel(nextL, fotos);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <span style={{ fontSize: '3rem' }}>🧭</span>
        <h3 style={{ marginTop: '1rem', color: '#b45309' }}>Carregando Labirinto dos Encontros...</h3>
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
          Parabéns, Grande Navegador! 🌟
        </h2>
        <p style={{ fontSize: '1.05rem', color: '#475569', marginBottom: '1.5rem' }}>
          Você encontrou todos os caminhos do labirinto e reuniu a turminha com sucesso!
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

  const childPhoto = fotos[0] || FALLBACK_PHOTOS[0];

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
          LABIRINTO ({levelIdx + 1}/{MAZE_LEVELS.length})
        </span>

        <button
          onClick={() => initLevel(levelIdx, fotos)}
          className="kid-btn"
          style={{ background: '#f1f5f9', color: '#475569', padding: '0.45rem 0.9rem', fontSize: '0.9rem' }}
          title="Reiniciar"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Seletor de Modo: Direto (Livre) ou Programação (Robô) */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '0.5rem',
        marginBottom: '1rem'
      }}>
        <button
          onClick={() => {
            soundService.playPop();
            setMode('livre');
          }}
          style={{
            padding: '0.45rem 1rem',
            borderRadius: '1rem',
            border: 'none',
            fontWeight: 800,
            fontSize: '0.85rem',
            cursor: 'pointer',
            background: mode === 'livre' ? '#10b981' : '#fff',
            color: mode === 'livre' ? '#fff' : '#475569',
            boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
          }}
        >
          👆 Modo Direto (Setas)
        </button>

        <button
          onClick={() => {
            soundService.playPop();
            setMode('programar');
          }}
          style={{
            padding: '0.45rem 1rem',
            borderRadius: '1rem',
            border: 'none',
            fontWeight: 800,
            fontSize: '0.85rem',
            cursor: 'pointer',
            background: mode === 'programar' ? '#ea580c' : '#fff',
            color: mode === 'programar' ? '#fff' : '#475569',
            boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
          }}
        >
          🤖 Modo Programar Trajeto
        </button>
      </div>

      {/* Objetivo */}
      <div style={{
        background: '#fff',
        borderRadius: '1.25rem',
        padding: '0.65rem 1rem',
        textAlign: 'center',
        marginBottom: '1rem',
        border: '2px solid #fde68a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem'
      }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#92400e' }}>
          Ajude <strong>{childPhoto.rotulo}</strong> a encontrar <strong>{targetPhoto?.rotulo || 'a família'}</strong>!
        </span>
        <div style={{
          width: '34px',
          height: '34px',
          borderRadius: '50%',
          overflow: 'hidden',
          border: '2px solid #ea580c'
        }}>
          {targetPhoto && (
            <img
              src={targetPhoto.urlThumb || targetPhoto.urlOriginal}
              alt={targetPhoto.rotulo}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
        </div>
      </div>

      {/* TABULEIRO DO LABIRINTO */}
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
          gridTemplateColumns: `repeat(${currentMaze.size}, 1fr)`,
          gap: '0.45rem',
          width: '100%',
          maxWidth: '360px'
        }}>
          {Array.from({ length: currentMaze.size }).map((_, r) =>
            Array.from({ length: currentMaze.size }).map((_, c) => {
              const isPlayer = playerPos.r === r && playerPos.c === c;
              const isGoal = currentMaze.goal.r === r && currentMaze.goal.c === c;
              const obstacleIcon = getObstacleIcon(r, c);

              return (
                <div
                  key={`${r}-${c}`}
                  onClick={() => {
                    // Clicar numa célula vizinha direta anda até ela
                    const dr = r - playerPos.r;
                    const dc = c - playerPos.c;
                    if (Math.abs(dr) + Math.abs(dc) === 1 && mode === 'livre') {
                      tryMove(dr, dc);
                    }
                  }}
                  style={{
                    aspectRatio: '1',
                    background: isGoal
                      ? '#ecfdf5'
                      : isPlayer
                      ? '#fef3c7'
                      : obstacleIcon
                      ? '#f1f5f9'
                      : '#f8fafc',
                    borderRadius: '1rem',
                    border: isGoal
                      ? '3px solid #10b981'
                      : isPlayer
                      ? '3px solid #f59e0b'
                      : '2px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    cursor: mode === 'livre' ? 'pointer' : 'default',
                    overflow: 'hidden'
                  }}
                >
                  {/* Obstáculo */}
                  {obstacleIcon && (
                    <span style={{ fontSize: '1.6rem', userSelect: 'none' }}>
                      {obstacleIcon}
                    </span>
                  )}

                  {/* Chegada / Alvo */}
                  {isGoal && !isPlayer && targetPhoto && (
                    <div style={{
                      width: '85%',
                      height: '85%',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: '2px solid #10b981'
                    }}>
                      <img
                        src={targetPhoto.urlThumb || targetPhoto.urlOriginal}
                        alt="Meta"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  )}

                  {/* Peão do Jogador */}
                  {isPlayer && (
                    <div style={{
                      width: '85%',
                      height: '85%',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: '3px solid #ea580c',
                      boxShadow: '0 0 10px rgba(234, 88, 12, 0.4)',
                      transform: 'scale(1.05)',
                      transition: 'all 0.15s ease'
                    }}>
                      <img
                        src={childPhoto.urlThumb || childPhoto.urlOriginal}
                        alt="Jogador"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Notificação de Vitória do Nível */}
        {isWon && (
          <div style={{ marginTop: '1rem', textAlign: 'center', animation: 'fadeIn 0.25s ease' }}>
            <p style={{ fontSize: '1.15rem', color: '#059669', fontWeight: 800, margin: '0 0 0.5rem' }}>
              🎉 Parabéns! Você chegou ao destino! 🎉
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
              <span>{levelIdx + 1 >= MAZE_LEVELS.length ? 'Ver Resultado Final 🏆' : 'Próximo Labirinto ➡️'}</span>
            </button>
          </div>
        )}
      </div>

      {/* CONTROLES DO JOGO */}
      {!isWon && (
        <div style={{
          background: '#fff',
          borderRadius: '1.75rem',
          padding: '1rem',
          boxShadow: 'var(--card-shadow)',
          border: '3px solid #e2e8f0',
          textAlign: 'center'
        }}>
          {mode === 'livre' ? (
            /* Controles Diretos com D-Pad */
            <div>
              <div style={{ marginBottom: '0.5rem' }}>
                <button
                  onClick={() => tryMove(-1, 0)}
                  className="kid-btn"
                  style={{ background: '#10b981', color: '#fff', width: '56px', height: '52px', padding: 0 }}
                >
                  <ArrowUp size={24} />
                </button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '0.5rem' }}>
                <button
                  onClick={() => tryMove(0, -1)}
                  className="kid-btn"
                  style={{ background: '#10b981', color: '#fff', width: '56px', height: '52px', padding: 0 }}
                >
                  <ArrowLeftIcon size={24} />
                </button>
                <button
                  onClick={() => tryMove(1, 0)}
                  className="kid-btn"
                  style={{ background: '#10b981', color: '#fff', width: '56px', height: '52px', padding: 0 }}
                >
                  <ArrowDown size={24} />
                </button>
                <button
                  onClick={() => tryMove(0, 1)}
                  className="kid-btn"
                  style={{ background: '#10b981', color: '#fff', width: '56px', height: '52px', padding: 0 }}
                >
                  <ArrowRight size={24} />
                </button>
              </div>
            </div>
          ) : (
            /* Controles de Programação (Robô / Algoritmo) */
            <div>
              <p style={{ fontSize: '0.85rem', color: '#475569', margin: '0 0 0.5rem', fontWeight: 600 }}>
                Adicione as setinhas para programar o caminho e clique em <strong>Executar</strong>!
              </p>

              {/* Botões de Direção */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <button onClick={() => addCommand('UP')} className="kid-btn" style={{ background: '#ea580c', color: '#fff', padding: '0.5rem 0.8rem' }}>
                  <ArrowUp size={18} />
                </button>
                <button onClick={() => addCommand('DOWN')} className="kid-btn" style={{ background: '#ea580c', color: '#fff', padding: '0.5rem 0.8rem' }}>
                  <ArrowDown size={18} />
                </button>
                <button onClick={() => addCommand('LEFT')} className="kid-btn" style={{ background: '#ea580c', color: '#fff', padding: '0.5rem 0.8rem' }}>
                  <ArrowLeftIcon size={18} />
                </button>
                <button onClick={() => addCommand('RIGHT')} className="kid-btn" style={{ background: '#ea580c', color: '#fff', padding: '0.5rem 0.8rem' }}>
                  <ArrowRight size={18} />
                </button>
              </div>

              {/* Lista dos Passos Programados */}
              <div style={{
                background: '#f8fafc',
                borderRadius: '1rem',
                padding: '0.5rem',
                minHeight: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                flexWrap: 'wrap',
                marginBottom: '0.75rem',
                border: '1px solid #e2e8f0'
              }}>
                {commandQueue.length === 0 ? (
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Nenhum passo adicionado ainda</span>
                ) : (
                  commandQueue.map((cmd, i) => (
                    <span
                      key={i}
                      style={{
                        background: '#fef3c7',
                        border: '1px solid #f59e0b',
                        borderRadius: '0.5rem',
                        padding: '0.2rem 0.4rem',
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        color: '#b45309'
                      }}
                    >
                      {cmd === 'UP' && '⬆️'}
                      {cmd === 'DOWN' && '⬇️'}
                      {cmd === 'LEFT' && '⬅️'}
                      {cmd === 'RIGHT' && '➡️'}
                    </span>
                  ))
                )}
              </div>

              {/* Ações da Programação */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
                <button
                  onClick={executeProgram}
                  disabled={isExecuting || commandQueue.length === 0}
                  className="kid-btn"
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#fff',
                    padding: '0.55rem 1.4rem',
                    fontSize: '0.95rem'
                  }}
                >
                  <Play size={18} />
                  <span>{isExecuting ? 'Andando...' : 'Executar Trajeto ▶️'}</span>
                </button>

                <button
                  onClick={removeLastCommand}
                  disabled={isExecuting || commandQueue.length === 0}
                  className="kid-btn"
                  style={{
                    background: '#f1f5f9',
                    color: '#64748b',
                    padding: '0.55rem 0.9rem',
                    fontSize: '0.9rem'
                  }}
                  title="Apagar último passo"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
