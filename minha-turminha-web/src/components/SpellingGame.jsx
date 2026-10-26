import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, RotateCcw, Sparkles, Trophy, Star, Volume2, HelpCircle, CheckCircle } from 'lucide-react';
import { api } from '../services/api';
import { soundService } from '../services/soundService';

// Remove acentos e caracteres especiais para comparação
function normalizeLetter(str) {
  return (str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z]/g, '');
}

const FALLBACK_WORDS = [
  { rotulo: 'Papai', urlThumb: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=320&auto=format&fit=crop&q=80' },
  { rotulo: 'Mamae', urlThumb: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=320&auto=format&fit=crop&q=80' },
  { rotulo: 'Bebe', urlThumb: 'https://images.unsplash.com/photo-1544126592-807ade215a0b?w=320&auto=format&fit=crop&q=80' },
  { rotulo: 'Gato', urlThumb: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=320&auto=format&fit=crop&q=80' },
  { rotulo: 'Bola', urlThumb: 'https://images.unsplash.com/photo-1511886929837-354d827aae26?w=320&auto=format&fit=crop&q=80' }
];

const LETTER_COLORS = [
  '#ea580c', '#f59e0b', '#10b981', '#7c3aed', '#d97706', '#059669', '#ca8a04', '#6d28d9'
];

export function SpellingGame({ currentChild, onBack }) {
  const [fotos, setFotos] = useState([]);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  // Palavra e foto da rodada
  const [targetPhoto, setTargetPhoto] = useState(null);
  const [cleanWord, setCleanWord] = useState('');
  const [guessedLetters, setGuessedLetters] = useState(new Set());
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [roundWon, setRoundWon] = useState(false);
  const [keyboardLetters, setKeyboardLetters] = useState([]);

  const MAX_ERRORS = 5;
  const TOTAL_ROUNDS = 5;

  useEffect(() => {
    loadGameData();
  }, [currentChild]);

  const loadGameData = async () => {
    setLoading(true);
    let list = await api.getFotos(currentChild?.id || 1);
    if (!list || list.length === 0) {
      list = FALLBACK_WORDS;
    }
    setFotos(list);
    setRound(1);
    setScore(0);
    setIsFinished(false);
    startRound(list, 1);
    setLoading(false);
  };

  const startRound = (photoPool, roundNum) => {
    const pool = (photoPool && photoPool.length > 0) ? photoPool : fotos;
    if (pool.length === 0) return;

    // Seleciona uma foto aleatória
    const selected = pool[(roundNum - 1) % pool.length];
    setTargetPhoto(selected);

    // Normaliza palavra para soletrar
    const normalized = normalizeLetter(selected.rotulo || 'AMIGO');
    const wordToUse = normalized.length >= 2 ? normalized : 'AMIGO';
    setCleanWord(wordToUse);

    setGuessedLetters(new Set());
    setWrongGuesses(0);
    setRoundWon(false);

    // Gera conjunto de letras para o teclado infantil:
    // Todas as letras necessárias + 4 letras distratoras aleatórias
    const neededLetters = Array.from(new Set(wordToUse.split('')));
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const extraLetters = alphabet
      .filter(l => !neededLetters.includes(l))
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.max(3, 8 - neededLetters.length));

    const finalKeyboard = [...neededLetters, ...extraLetters].sort(() => Math.random() - 0.5);
    setKeyboardLetters(finalKeyboard);
  };

  // Clique em uma letra grandiosa
  const handleGuessLetter = (letter) => {
    if (roundWon || wrongGuesses >= MAX_ERRORS || guessedLetters.has(letter)) {
      return;
    }

    const nextGuessed = new Set(guessedLetters);
    nextGuessed.add(letter);
    setGuessedLetters(nextGuessed);

    if (cleanWord.includes(letter)) {
      // Acertou a letra!
      soundService.playSuccess();
      
      // Verifica se a palavra inteira foi formada
      const allFormed = cleanWord.split('').every(l => nextGuessed.has(l));
      if (allFormed) {
        setRoundWon(true);
        setScore(prev => prev + 1);
        soundService.playFanfare();
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#10b981', '#ea580c', '#fcd34d', '#7c3aed']
        });
      }
    } else {
      // Letra errada (suave)
      soundService.playBoop();
      const nextErrors = wrongGuesses + 1;
      setWrongGuesses(nextErrors);
    }
  };

  // Dica mágica: revela uma letra ainda não adivinhada
  const handleGiveHint = () => {
    if (roundWon) return;
    const missing = cleanWord.split('').find(l => !guessedLetters.has(l));
    if (missing) {
      soundService.playPop();
      handleGuessLetter(missing);
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
        <span style={{ fontSize: '3rem' }}>🔤</span>
        <h3 style={{ marginTop: '1rem', color: '#b45309' }}>Carregando Soletrando com Fotos...</h3>
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
          background: 'linear-gradient(135deg, #fef08a 0%, #f59e0b 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem',
          boxShadow: '0 8px 20px rgba(245, 158, 11, 0.35)'
        }}>
          <Trophy size={48} color="#fff" />
        </div>

        <h2 style={{ fontSize: '2rem', color: '#ea580c', marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>
          Parabéns, Pequeno Mestre das Letras! 🌟
        </h2>
        <p style={{ fontSize: '1.1rem', color: '#475569', marginBottom: '1.5rem' }}>
          Você soletrou as palavrinhas da sua turminha! Acertos: <strong>{score} de {TOTAL_ROUNDS}</strong>!
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
          SOLETRANDO ({round}/{TOTAL_ROUNDS})
        </span>

        <button
          onClick={handleGiveHint}
          disabled={roundWon}
          className="kid-btn"
          style={{
            background: 'linear-gradient(135deg, #fef08a 0%, #f59e0b 100%)',
            color: '#78350f',
            padding: '0.45rem 0.9rem',
            fontSize: '0.9rem'
          }}
          title="Dica Mágica"
        >
          <Sparkles size={16} />
          <span>Dica</span>
        </button>
      </div>

      {/* Card Principal da Foto e Palavra */}
      <div style={{
        background: '#fff',
        borderRadius: '2rem',
        padding: '1.25rem 1rem',
        boxShadow: 'var(--card-shadow)',
        border: '4px solid #fde68a',
        textAlign: 'center',
        marginBottom: '1rem'
      }}>
        {/* Estrelas / Balões de Vida (Tentativas Positivas) */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          {Array.from({ length: MAX_ERRORS }).map((_, idx) => {
            const isLost = idx < wrongGuesses;
            return (
              <span
                key={idx}
                style={{
                  fontSize: '1.3rem',
                  opacity: isLost ? 0.25 : 1,
                  transform: isLost ? 'scale(0.8)' : 'scale(1)',
                  transition: 'all 0.2s ease',
                  filter: isLost ? 'grayscale(1)' : 'none'
                }}
              >
                🎈
              </span>
            );
          })}
        </div>

        {/* Foto da Pessoa ou Objeto */}
        <div style={{
          width: '160px',
          height: '160px',
          margin: '0 auto 1rem',
          borderRadius: '1.5rem',
          overflow: 'hidden',
          border: '4px solid #f59e0b',
          boxShadow: '0 8px 18px rgba(245, 158, 11, 0.25)',
          background: '#fef3c7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {targetPhoto && (
            <img
              src={targetPhoto.urlThumb || targetPhoto.urlOriginal}
              alt={targetPhoto.rotulo}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
        </div>

        {/* Caixas de Letras da Palavra (_ _ _ _ _) */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
          marginBottom: '0.75rem'
        }}>
          {cleanWord.split('').map((letter, idx) => {
            const isRevealed = guessedLetters.has(letter) || roundWon;
            const letterColor = LETTER_COLORS[idx % LETTER_COLORS.length];

            return (
              <div
                key={idx}
                style={{
                  width: '46px',
                  height: '52px',
                  borderRadius: '0.85rem',
                  background: isRevealed ? letterColor : '#f8fafc',
                  border: isRevealed ? `3px solid ${letterColor}` : '3px dashed #cbd5e1',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem',
                  fontWeight: 900,
                  fontFamily: 'var(--font-display)',
                  boxShadow: isRevealed ? '0 4px 10px rgba(0,0,0,0.15)' : 'none',
                  transform: isRevealed ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
              >
                {isRevealed ? letter : ''}
              </div>
            );
          })}
        </div>

        {/* Mensagem de Vitória da Rodada */}
        {roundWon ? (
          <div style={{ marginTop: '0.5rem', animation: 'fadeIn 0.3s ease' }}>
            <p style={{ fontSize: '1.2rem', fontWeight: 800, color: '#059669', margin: '0.4rem 0' }}>
              ✨ Parabéns! Você formou: {targetPhoto?.rotulo || cleanWord}! ✨
            </p>
            <button
              onClick={handleNextRound}
              className="kid-btn"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                fontSize: '1rem',
                padding: '0.65rem 1.75rem',
                marginTop: '0.5rem'
              }}
            >
              <span>{round >= TOTAL_ROUNDS ? 'Ver Resultado Final 🏆' : 'Próxima Palavra ➡️'}</span>
            </button>
          </div>
        ) : wrongGuesses >= MAX_ERRORS ? (
          <div style={{ marginTop: '0.5rem' }}>
            <p style={{ fontSize: '1rem', fontWeight: 700, color: '#ea580c', margin: '0.3rem 0' }}>
              Quase lá! A palavra é: <strong>{targetPhoto?.rotulo || cleanWord}</strong>!
            </p>
            <button
              onClick={handleNextRound}
              className="kid-btn"
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
                color: '#fff',
                fontSize: '0.95rem',
                padding: '0.55rem 1.4rem',
                marginTop: '0.3rem'
              }}
            >
              <span>Continuar Explorando ➡️</span>
            </button>
          </div>
        ) : (
          <p style={{ fontSize: '0.95rem', color: '#64748b', fontWeight: 600, margin: '0.4rem 0 0' }}>
            Toque nas letras grandiosas abaixo para soletrar o nome! 🌟
          </p>
        )}
      </div>

      {/* Teclado Infantil com Letras Grandiosas */}
      <div style={{
        background: '#fff',
        borderRadius: '2rem',
        padding: '1.25rem 0.75rem',
        boxShadow: 'var(--card-shadow)',
        border: '3px solid #e2e8f0'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(54px, 1fr))',
          gap: '0.65rem',
          maxWidth: '520px',
          margin: '0 auto'
        }}>
          {keyboardLetters.map((letter, idx) => {
            const isGuessed = guessedLetters.has(letter);
            const isCorrect = isGuessed && cleanWord.includes(letter);
            const isWrong = isGuessed && !cleanWord.includes(letter);
            const buttonColor = LETTER_COLORS[idx % LETTER_COLORS.length];

            return (
              <button
                key={letter}
                onClick={() => handleGuessLetter(letter)}
                disabled={isGuessed || roundWon || wrongGuesses >= MAX_ERRORS}
                style={{
                  height: '58px',
                  borderRadius: '1rem',
                  fontSize: '1.65rem',
                  fontWeight: 900,
                  fontFamily: 'var(--font-display)',
                  background: isCorrect
                    ? '#10b981'
                    : isWrong
                    ? '#e2e8f0'
                    : buttonColor,
                  color: isWrong ? '#94a3b8' : '#fff',
                  border: 'none',
                  boxShadow: isWrong
                    ? 'none'
                    : '0 5px 0 rgba(0,0,0,0.18)',
                  cursor: isGuessed ? 'default' : 'pointer',
                  opacity: isWrong ? 0.4 : 1,
                  transform: isGuessed ? 'translateY(3px)' : 'none',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {letter}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
