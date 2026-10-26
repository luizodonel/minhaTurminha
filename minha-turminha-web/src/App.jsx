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
import { api } from './services/api';
import { soundService } from './services/soundService';

export default function App() {
  const [activeGame, setActiveGame] = useState(null);
  const [currentChild, setCurrentChild] = useState(null);
  const [isParentsOpen, setIsParentsOpen] = useState(false);
  const [difficulty, setDifficulty] = useState(6);
  const [isMuted, setIsMuted] = useState(false);
  const [photosVersion, setPhotosVersion] = useState(0);

  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    const criancas = await api.getCriancas();
    if (criancas && criancas.length > 0) {
      setCurrentChild(criancas[0]);
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
      />

      {/* Conteúdo Principal / Jogos */}
      <main style={{ flex: 1, position: 'relative', zIndex: 10, paddingBottom: '3rem' }}>
        {activeGame === null && (
          <GameSelector
            onSelectGame={(gameId) => setActiveGame(gameId)}
            currentChild={currentChild}
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

      {/* Modal de Gestão dos Pais */}
      <ParentModal
        isOpen={isParentsOpen}
        onClose={() => setIsParentsOpen(false)}
        currentChild={currentChild}
        onSelectChild={(child) => setCurrentChild(child)}
        difficulty={difficulty}
        onDifficultyChange={(newDiff) => setDifficulty(newDiff)}
        onPhotosUpdated={() => setPhotosVersion(prev => prev + 1)}
      />
    </div>
  );
}
