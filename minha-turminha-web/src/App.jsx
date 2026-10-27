import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { GameSelector } from './components/GameSelector';
import { MemoryGame } from './components/MemoryGame';
import { WhoIsWhoGame } from './components/WhoIsWhoGame';
import { PuzzleGame } from './components/PuzzleGame';
import { ScratchGame } from './components/ScratchGame';
import { ShadowGame } from './components/ShadowGame';
import { BubblePopGame } from './components/BubblePopGame';
import { WhackMoleGame } from './components/WhackMoleGame';
import { SequenceGame } from './components/SequenceGame';
import { StickerAlbumGame } from './components/StickerAlbumGame';
import { SpellingGame } from './components/SpellingGame';
import { PairMatchingGame } from './components/PairMatchingGame';
import { FaceDressUpGame } from './components/FaceDressUpGame';
import { MazeGame } from './components/MazeGame';
import { OddOneOutGame } from './components/OddOneOutGame';
import { SudokuKidsGame } from './components/SudokuKidsGame';
import { BalanceScaleGame } from './components/BalanceScaleGame';
import { MatrixAssociationGame } from './components/MatrixAssociationGame';
import { CauseAndEffectGame } from './components/CauseAndEffectGame';
import { ParentModal } from './components/ParentModal';
import { ProUpgradeModal } from './components/ProUpgradeModal';
import { api } from './services/api';
import { soundService } from './services/soundService';

export default function App() {
  const [activeGame, setActiveGame] = useState(null);
  const [currentChild, setCurrentChild] = useState(null);
  const [isLoadingChild, setIsLoadingChild] = useState(true);
  const [welcomeName, setWelcomeName] = useState('');
  const [welcomeAvatar, setWelcomeAvatar] = useState('🦁');
  const [isCreatingWelcome, setIsCreatingWelcome] = useState(false);
  const [isParentsOpen, setIsParentsOpen] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [selectedLockedGame, setSelectedLockedGame] = useState(null);
  const [difficulty, setDifficulty] = useState(6);
  const [isMuted, setIsMuted] = useState(false);
  const [photosVersion, setPhotosVersion] = useState(0);

  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    setIsLoadingChild(true);
    try {
      const [criancas, proStatus] = await Promise.all([
        api.getCriancas(),
        api.getLicencaStatus()
      ]);
      setIsPro(Boolean(proStatus));
      if (criancas && criancas.length > 0) {
        setCurrentChild(criancas[0]);
      } else {
        setCurrentChild(null);
      }
    } finally {
      setIsLoadingChild(false);
    }
  };

  const handleOpenProModal = (lockedGame = null) => {
    setSelectedLockedGame(lockedGame);
    setIsProModalOpen(true);
  };

  const handleProActivated = (lockedGame) => {
    setIsPro(true);
    if (lockedGame?.id) {
      setActiveGame(lockedGame.id);
    }
  };

  const handleCreateFirstChild = async (e) => {
    e.preventDefault();
    if (!welcomeName.trim() || isCreatingWelcome) return;
    setIsCreatingWelcome(true);
    soundService.playSuccess();
    try {
      const nova = await api.createCrianca({
        nome: welcomeName.trim(),
        idade: 4,
        avatarUrl: welcomeAvatar
      });
      setCurrentChild(nova);
      setWelcomeName('');
    } finally {
      setIsCreatingWelcome(false);
    }
  };

  const handleSoundToggle = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundService.setMuted(nextMuted);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Bolhas decorativas animadas no fundo com cores unisex */}
      <div className="bg-bubbles">
        <div className="bubble" style={{ width: '140px', height: '140px', background: '#10b981', top: '15%', left: '8%' }} />
        <div className="bubble" style={{ width: '220px', height: '220px', background: '#fb923c', top: '55%', right: '5%', animationDelay: '3s' }} />
        <div className="bubble" style={{ width: '160px', height: '160px', background: '#fcd34d', bottom: '10%', left: '20%', animationDelay: '5s' }} />
        <div className="bubble" style={{ width: '110px', height: '110px', background: '#a78bfa', top: '25%', right: '25%', animationDelay: '2s' }} />
      </div>

      {/* Barra de Navegação */}
      <Navbar
        currentChild={currentChild}
        onOpenParents={() => setIsParentsOpen(true)}
        onSoundToggle={handleSoundToggle}
        onGoHome={() => setActiveGame(null)}
        isMuted={isMuted}
        isPro={isPro}
        onOpenProModal={handleOpenProModal}
      />

      {/* Conteúdo Principal / Jogos */}
      <main style={{ flex: 1, position: 'relative', zIndex: 10, paddingBottom: '3rem' }}>
        {activeGame === null && (
          <GameSelector
            onSelectGame={(gameId) => setActiveGame(gameId)}
            currentChild={currentChild}
            isPro={isPro}
            onOpenProModal={handleOpenProModal}
          />
        )}

        {/* 1. Jogo da Memória */}
        {activeGame === 'memoria' && (
          <MemoryGame
            key={`${currentChild?.id}-${difficulty}-${photosVersion}`}
            currentChild={currentChild}
            difficulty={difficulty}
            onBack={() => setActiveGame(null)}
          />
        )}

        {/* 2. Quem é Quem? */}
        {activeGame === 'quem-e-quem' && (
          <WhoIsWhoGame
            key={`${currentChild?.id}-${photosVersion}`}
            currentChild={currentChild}
            onBack={() => setActiveGame(null)}
          />
        )}

        {/* 3. Quebra-Cabeça */}
        {activeGame === 'quebra-cabeca' && (
          <PuzzleGame
            key={`${currentChild?.id}-${photosVersion}`}
            currentChild={currentChild}
            onBack={() => setActiveGame(null)}
          />
        )}

        {/* 4. Raspe e Descubra */}
        {activeGame === 'raspe-descubra' && (
          <ScratchGame
            key={`${currentChild?.id}-${photosVersion}`}
            currentChild={currentChild}
            onBack={() => setActiveGame(null)}
          />
        )}

        {/* 5. Jogo das Sombras */}
        {activeGame === 'sombras' && (
          <ShadowGame
            key={`${currentChild?.id}-${photosVersion}`}
            currentChild={currentChild}
            onBack={() => setActiveGame(null)}
          />
        )}

        {/* 6. Bolinhas de Sabão */}
        {activeGame === 'bolhas' && (
          <BubblePopGame
            key={`${currentChild?.id}-${photosVersion}`}
            currentChild={currentChild}
            onBack={() => setActiveGame(null)}
          />
        )}

        {/* 7. Janelinhas Mágicas */}
        {activeGame === 'janelinhas' && (
          <WhackMoleGame
            key={`${currentChild?.id}-${photosVersion}`}
            currentChild={currentChild}
            onBack={() => setActiveGame(null)}
          />
        )}

        {/* 8. Sequência & Tamanhos */}
        {activeGame === 'sequencia' && (
          <SequenceGame
            key={`${currentChild?.id}-${photosVersion}`}
            currentChild={currentChild}
            onBack={() => setActiveGame(null)}
          />
        )}

        {/* 9. Álbum de Figurinhas */}
        {activeGame === 'figurinhas' && (
          <StickerAlbumGame
            key={`${currentChild?.id}-${photosVersion}`}
            currentChild={currentChild}
            onBack={() => setActiveGame(null)}
          />
        )}

        {/* 10. Soletrando com Fotos (Jogo da Forca Positivo) */}
        {activeGame === 'soletrando' && (
          <SpellingGame
            key={`${currentChild?.id}-${photosVersion}`}
            currentChild={currentChild}
            onBack={() => setActiveGame(null)}
          />
        )}

        {/* 11. Associação de Pares (Rosto & Objeto / Hobby) */}
        {activeGame === 'pares-objetos' && (
          <PairMatchingGame
            key={`${currentChild?.id}-${photosVersion}`}
            currentChild={currentChild}
            onBack={() => setActiveGame(null)}
          />
        )}

        {/* 12. Complete o Rosto / Fantasias & Stickers */}
        {activeGame === 'fantasia-rosto' && (
          <FaceDressUpGame
            key={`${currentChild?.id}-${photosVersion}`}
            currentChild={currentChild}
            onBack={() => setActiveGame(null)}
          />
        )}

        {/* 13. Labirinto dos Encontros (Planejamento de Trajeto) */}
        {activeGame === 'labirinto' && (
          <MazeGame
            key={`${currentChild?.id}-${photosVersion}`}
            currentChild={currentChild}
            onBack={() => setActiveGame(null)}
          />
        )}

        {/* 14. Qual Não Pertence? (Classificação e Exclusão Lógica) */}
        {activeGame === 'qual-nao-pertence' && (
          <OddOneOutGame
            key={`${currentChild?.id}-${photosVersion}`}
            currentChild={currentChild}
            onBack={() => setActiveGame(null)}
          />
        )}

        {/* 15. Sudoku Ilustrado (Mini-Sudoku 3x3 e 4x4) */}
        {activeGame === 'sudoku' && (
          <SudokuKidsGame
            key={`${currentChild?.id}-${photosVersion}`}
            currentChild={currentChild}
            onBack={() => setActiveGame(null)}
          />
        )}

        {/* 16. Balança Lógica / Comparação de Pesos (Equilíbrio) */}
        {activeGame === 'balanca' && (
          <BalanceScaleGame
            key={`${currentChild?.id}-${photosVersion}`}
            currentChild={currentChild}
            onBack={() => setActiveGame(null)}
          />
        )}

        {/* 17. Matriz de Dupla Entrada (Grades de Associação) */}
        {activeGame === 'matriz-dupla' && (
          <MatrixAssociationGame
            key={`${currentChild?.id}-${photosVersion}`}
            currentChild={currentChild}
            onBack={() => setActiveGame(null)}
          />
        )}

        {/* 18. Causa e Efeito (O Que Aconteceu Antes / Depois) */}
        {activeGame === 'causa-efeito' && (
          <CauseAndEffectGame
            key={`${currentChild?.id}-${photosVersion}`}
            currentChild={currentChild}
            onBack={() => setActiveGame(null)}
          />
        )}
      </main>

      {/* Modal de Boas-Vindas (Primeiro Acesso neste Aparelho) */}
      {!isLoadingChild && !currentChild && !isParentsOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '420px', textAlign: 'center' }}>
            <div style={{ fontSize: '3.2rem', marginBottom: '0.5rem' }}>{welcomeAvatar}</div>
            <h2 style={{ fontSize: '1.6rem', color: '#0f172a', marginBottom: '0.35rem', fontFamily: 'var(--font-display)' }}>
              Bem-vindo ao <span style={{ color: '#ea580c' }}>Minha Turminha</span>!
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1.25rem' }}>
              Crie o perfil da criança para personalizar os jogos neste aparelho:
            </p>

            <form onSubmit={handleCreateFirstChild} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ textAlign: 'left' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  Qual é o nome da criança?
                </label>
                <input
                  type="text"
                  autoFocus
                  required
                  placeholder="Ex: Sofia, Miguel, Lucas..."
                  value={welcomeName}
                  onChange={(e) => setWelcomeName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '1rem',
                    border: '2px solid #cbd5e1',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ textAlign: 'left' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  Escolha um mascote favorito:
                </label>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                  {['🦁', '🐼', '🚀', '🦄', '🦖'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        soundService.playPop();
                        setWelcomeAvatar(emoji);
                      }}
                      style={{
                        flex: 1,
                        fontSize: '1.75rem',
                        padding: '0.55rem 0',
                        borderRadius: '1rem',
                        border: welcomeAvatar === emoji ? '3px solid #ea580c' : '2px solid #e2e8f0',
                        background: welcomeAvatar === emoji ? '#fff7ed' : '#f8fafc',
                        cursor: 'pointer'
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isCreatingWelcome}
                className="kid-btn"
                style={{
                  background: '#10b981',
                  color: '#fff',
                  padding: '0.85rem 1.5rem',
                  fontSize: '1.05rem',
                  width: '100%',
                  justifyContent: 'center',
                  marginTop: '0.25rem'
                }}
              >
                {isCreatingWelcome ? 'Criando Perfil...' : 'Começar a Brincar! 🎉'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Gestão dos Pais */}
      <ParentModal
        isOpen={isParentsOpen}
        onClose={() => setIsParentsOpen(false)}
        currentChild={currentChild}
        onSelectChild={(child) => setCurrentChild(child)}
        difficulty={difficulty}
        onDifficultyChange={(newDiff) => setDifficulty(newDiff)}
        onPhotosUpdated={async () => {
          setPhotosVersion(prev => prev + 1);
          const proStatus = await api.getLicencaStatus();
          setIsPro(Boolean(proStatus));
        }}
        isPro={isPro}
        onOpenProModal={handleOpenProModal}
      />

      {/* Modal de Desbloqueio da Versão PRO Vitalícia (R$ 9,90) */}
      <ProUpgradeModal
        isOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
        selectedLockedGame={selectedLockedGame}
        onProActivated={handleProActivated}
      />
    </div>
  );
}
