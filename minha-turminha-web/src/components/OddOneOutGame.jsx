import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, RotateCcw, Sparkles, Trophy, CheckCircle, HelpCircle, Star } from 'lucide-react';
import { api } from '../services/api';
import { soundService } from '../services/soundService';

const LOGICAL_ROUNDS = [
  {
    theme: 'Bichinhos vs Brinquedo',
    hint: 'Três são animais de estimação fofinhos! Qual deles é um brinquedo?',
    explanation: 'Muito bem! Os bichinhos são seres vivos, e a bola é um brinquedo divertido! ⚽',
    cards: [
      { id: 'c1', label: 'Cachorrinho', isOdd: false, icon: '🐶', isRealPhoto: true },
      { id: 'c2', label: 'Gatinho', isOdd: false, icon: '🐱', isRealPhoto: true },
      { id: 'c3', label: 'Bola de Futebol', isOdd: true, icon: '⚽', isRealPhoto: false },
      { id: 'c4', label: 'Coelhinho', isOdd: false, icon: '🐰', isRealPhoto: true }
    ]
  },
  {
    theme: 'Pessoas da Família vs Frutinha',
    hint: 'Três são pessoas queridas da família! Qual é uma frutinha deliciosa?',
    explanation: 'Isso aí! Papai, Mamãe e a Criança são da família, e o morango é uma fruta gostosa! 🍓',
    cards: [
      { id: 'c1', label: 'Papai', isOdd: false, icon: '👨', isRealPhoto: true },
      { id: 'c2', label: 'Moranguinho', isOdd: true, icon: '🍓', isRealPhoto: false },
      { id: 'c3', label: 'Mamãe', isOdd: false, icon: '👩', isRealPhoto: true },
      { id: 'c4', label: 'Você', isOdd: false, icon: '🧒', isRealPhoto: true }
    ]
  },
  {
    theme: 'Dia & Praia vs Hora de Dormir',
    hint: 'Três coisas são para brincar no sol! Qual é da hora de nanar?',
    explanation: 'Excelente! Sol, baldinho e óculos são da praia de dia! A caminha e a lua são da noite! 🌙',
    cards: [
      { id: 'c1', label: 'Sol Brilhante', isOdd: false, icon: '☀️', isRealPhoto: false },
      { id: 'c2', label: 'Baldinho de Praia', isOdd: false, icon: '🏖️', isRealPhoto: false },
      { id: 'c3', label: 'Caminha & Lua', isOdd: true, icon: '🌙', isRealPhoto: false },
      { id: 'c4', label: 'Óculos de Sol', isOdd: false, icon: '🕶️', isRealPhoto: false }
    ]
  },
  {
    theme: 'Brinquedos vs Calçado',
    hint: 'Três são brinquedos para se divertir! Qual é para calçar no pé?',
    explanation: 'Perfeito! O carrinho, ursinho e blocos são brinquedos! O tênis é uma roupinha para os pés! 👟',
    cards: [
      { id: 'c1', label: 'Carrinho', isOdd: false, icon: '🚗', isRealPhoto: false },
      { id: 'c2', label: 'Tênis de Passeio', isOdd: true, icon: '👟', isRealPhoto: false },
      { id: 'c3', label: 'Ursinho', isOdd: false, icon: '🧸', isRealPhoto: false },
      { id: 'c4', label: 'Blocos de Montar', isOdd: false, icon: '🧱', isRealPhoto: false }
    ]
  },
  {
    theme: 'Quem Voa vs Quem Anda na Terra',
    hint: 'Três animais voam com as asinhas no céu! Qual deles anda na terra?',
    explanation: 'Demais! O passarinho, a borboleta e a abelhinha voam! O gatinho anda com as 4 patinhas no chão! 🐾',
    cards: [
      { id: 'c1', label: 'Passarinho', isOdd: false, icon: '🐦', isRealPhoto: false },
      { id: 'c2', label: 'Borboleta', isOdd: false, icon: '🦋', isRealPhoto: false },
      { id: 'c3', label: 'Gatinho', isOdd: true, icon: '🐱', isRealPhoto: true },
      { id: 'c4', label: 'Abelhinha', isOdd: false, icon: '🐝', isRealPhoto: false }
    ]
  }
];

export function OddOneOutGame({ currentChild, onBack }) {
  const [fotos, setFotos] = useState([]);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  const currentRoundData = LOGICAL_ROUNDS[round];

  useEffect(() => {
    loadGameData();
  }, [currentChild]);

  const loadGameData = async () => {
    setLoading(true);
    const list = await api.getFotos(currentChild?.id || 1);
    setFotos(list || []);
    setRound(0);
    setScore(0);
    setIsFinished(false);
    setSelectedCardId(null);
    setIsAnswerCorrect(null);
    setLoading(false);
  };

  const handleCardClick = (card) => {
    if (isAnswerCorrect === true) return;
    setSelectedCardId(card.id);

    if (card.isOdd) {
      // ACERTOU O ELEMENTO DISCREPANTE! 🌟
      soundService.playSuccess();
      setIsAnswerCorrect(true);
      setScore(prev => prev + 1);
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#f59e0b', '#ea580c', '#fcd34d']
      });
    } else {
      // Cartão que pertence ao grupo
      soundService.playBoop();
      setIsAnswerCorrect(false);
    }
  };

  const handleNextRound = () => {
    soundService.playPop();
    if (round + 1 >= LOGICAL_ROUNDS.length) {
      setIsFinished(true);
      soundService.playFanfare();
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#10b981', '#f59e0b', '#ea580c', '#fcd34d', '#7c3aed']
      });
    } else {
      setRound(prev => prev + 1);
      setSelectedCardId(null);
      setIsAnswerCorrect(null);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <span style={{ fontSize: '3rem' }}>🔍</span>
        <h3 style={{ marginTop: '1rem', color: '#b45309' }}>Carregando Qual Não Pertence...</h3>
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
          Gênio da Lógica! 🌟
        </h2>
        <p style={{ fontSize: '1.05rem', color: '#475569', marginBottom: '1.5rem' }}>
          Você descobriu todas as regras secretas e identificou quem não pertencia ao grupo!
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
          QUAL NÃO PERTENCE? ({round + 1}/{LOGICAL_ROUNDS.length})
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#ea580c', fontWeight: 800 }}>
          <Star size={18} fill="#ea580c" />
          <span>{score}</span>
        </div>
      </div>

      {/* Pergunta e Dica Lúdica */}
      <div style={{
        background: '#fff',
        borderRadius: '1.75rem',
        padding: '1.25rem',
        textAlign: 'center',
        marginBottom: '1.25rem',
        boxShadow: 'var(--card-shadow)',
        border: '3px solid #fde68a'
      }}>
        <span style={{
          background: '#fef3c7',
          color: '#b45309',
          fontWeight: 800,
          fontSize: '0.8rem',
          padding: '0.25rem 0.75rem',
          borderRadius: '1rem',
          textTransform: 'uppercase',
          display: 'inline-block',
          marginBottom: '0.5rem'
        }}>
          💡 {currentRoundData.theme}
        </span>
        <h3 style={{ fontSize: '1.25rem', color: '#1e293b', margin: 0, fontFamily: 'var(--font-display)' }}>
          {currentRoundData.hint}
        </h3>
      </div>

      {/* Grade com os 4 Cartões para Comparação */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '1rem',
        marginBottom: '1.25rem'
      }}>
        {currentRoundData.cards.map((card, idx) => {
          const isSelected = selectedCardId === card.id;
          const isSuccess = isSelected && card.isOdd;
          const isFail = isSelected && !card.isOdd;

          // Se a foto for da família e houver foto cadastrada, usa a foto real
          const photoMatch = card.isRealPhoto && fotos.length > 0 ? fotos[idx % fotos.length] : null;

          return (
            <div
              key={card.id}
              onClick={() => handleCardClick(card)}
              style={{
                background: isSuccess ? '#ecfdf5' : isFail ? '#fef2f2' : '#fff',
                borderRadius: '1.75rem',
                padding: '1.25rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: isSuccess
                  ? '4px solid #10b981'
                  : isFail
                  ? '3px solid #f87171'
                  : '3px solid #e2e8f0',
                boxShadow: isSuccess
                  ? '0 0 20px rgba(16, 185, 129, 0.4)'
                  : '0 6px 14px rgba(0,0,0,0.06)',
                cursor: isAnswerCorrect === true ? 'default' : 'pointer',
                transform: isSelected ? 'scale(1.04)' : 'none',
                transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                userSelect: 'none',
                position: 'relative'
              }}
            >
              {/* Imagem / Ícone Grande */}
              <div style={{
                width: '84px',
                height: '84px',
                borderRadius: '1.25rem',
                overflow: 'hidden',
                background: '#fef3c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3rem',
                marginBottom: '0.75rem',
                border: '2px solid #fde68a'
              }}>
                {photoMatch ? (
                  <img
                    src={photoMatch.urlThumb || photoMatch.urlOriginal}
                    alt={card.label}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span>{card.icon}</span>
                )}
              </div>

              {/* Rótulo */}
              <span style={{
                fontSize: '1rem',
                fontWeight: 800,
                color: isSuccess ? '#059669' : '#1e293b',
                textAlign: 'center'
              }}>
                {photoMatch ? photoMatch.rotulo : card.label}
              </span>

              {isSuccess && (
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: '#10b981',
                  color: '#fff',
                  borderRadius: '50%',
                  padding: '4px',
                  display: 'flex'
                }}>
                  <CheckCircle size={18} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Explicação Didática / Raciocínio Lógico Revelado */}
      {isAnswerCorrect === true ? (
        <div style={{
          background: '#fff',
          borderRadius: '1.75rem',
          padding: '1.25rem',
          textAlign: 'center',
          boxShadow: 'var(--card-shadow)',
          border: '3px solid #10b981',
          animation: 'fadeIn 0.25s ease'
        }}>
          <h4 style={{ fontSize: '1.15rem', color: '#059669', margin: '0 0 0.5rem', fontWeight: 800 }}>
            🎉 Você Deduziu a Regra!
          </h4>
          <p style={{ fontSize: '0.95rem', color: '#334155', margin: '0 0 1rem', fontWeight: 600 }}>
            {currentRoundData.explanation}
          </p>
          <button
            onClick={handleNextRound}
            className="kid-btn"
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              fontSize: '1rem',
              padding: '0.65rem 2rem'
            }}
          >
            <span>{round + 1 >= LOGICAL_ROUNDS.length ? 'Ver Resultado Final 🏆' : 'Próximo Desafio ➡️'}</span>
          </button>
        </div>
      ) : isAnswerCorrect === false ? (
        <div style={{
          background: '#fff',
          borderRadius: '1.5rem',
          padding: '0.85rem',
          textAlign: 'center',
          border: '2px solid #fed7aa',
          animation: 'fadeIn 0.2s ease'
        }}>
          <p style={{ fontSize: '0.9rem', color: '#ea580c', margin: 0, fontWeight: 700 }}>
            Ops! Esse cartão combina com os outros dois. Tente encontrar qual é o diferente! 💡
          </p>
        </div>
      ) : null}
    </div>
  );
}
