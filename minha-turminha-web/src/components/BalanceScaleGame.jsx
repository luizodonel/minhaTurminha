import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, RotateCcw, Sparkles, Trophy, Check, Scale } from 'lucide-react';
import { api } from '../services/api';
import { soundService } from '../services/soundService';

const BALANCE_CHALLENGES = [
  {
    title: 'Desafio 1: Equilíbrio com Estrelas ⭐',
    instruction: 'O prato esquerdo tem peso 3. Adicione estrelinhas no prato direito até equilibrar!',
    targetWeight: 3,
    initialRightWeight: 1,
    leftCharacter: { label: 'Você', icon: '🧒', baseWeight: 3 },
    rightCharacter: { label: 'Pet Amigo', icon: '🐶', baseWeight: 1 },
    availableWeights: [1, 1, 2]
  },
  {
    title: 'Desafio 2: Equilibrando com Blocos 🧱',
    instruction: 'O Papai tem peso 5. Adicione blocos para igualar os dois pratos!',
    targetWeight: 5,
    initialRightWeight: 2,
    leftCharacter: { label: 'Papai', icon: '👨', baseWeight: 5 },
    rightCharacter: { label: 'Criança', icon: '🧒', baseWeight: 2 },
    availableWeights: [1, 2, 3]
  },
  {
    title: 'Desafio 3: A Grande Gangorra das Frutas 🍎',
    instruction: 'A cesta da esquerda pesa 6. Escolha os pesos certos para zerar a gangorra!',
    targetWeight: 6,
    initialRightWeight: 0,
    leftCharacter: { label: 'Mamãe', icon: '👩', baseWeight: 6 },
    rightCharacter: { label: 'Cesta Vazia', icon: '🧺', baseWeight: 0 },
    availableWeights: [2, 3, 3, 1]
  }
];

export function BalanceScaleGame({ currentChild, onBack }) {
  const [fotos, setFotos] = useState([]);
  const [roundIdx, setRoundIdx] = useState(0);
  const [rightWeights, setRightWeights] = useState([]);
  const [isWon, setIsWon] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  const challenge = BALANCE_CHALLENGES[roundIdx];

  useEffect(() => {
    loadGameData();
  }, [currentChild]);

  const loadGameData = async () => {
    setLoading(true);
    const list = await api.getFotos(currentChild?.id || 1);
    setFotos(list || []);
    setRoundIdx(0);
    setIsFinished(false);
    initChallenge(0);
    setLoading(false);
  };

  const initChallenge = (idx) => {
    const ch = BALANCE_CHALLENGES[idx];
    setRightWeights([]);
    setIsWon(false);
  };

  // Calcula pesos atuais
  const leftTotal = challenge.targetWeight;
  const rightAdded = rightWeights.reduce((a, b) => a + b, 0);
  const rightTotal = challenge.initialRightWeight + rightAdded;

  // Ângulo de inclinação da balança (-12deg a +12deg)
  const diff = rightTotal - leftTotal;
  const tiltAngle = Math.max(-12, Math.min(12, diff * 4));

  // Adiciona peso no prato direito
  const addWeight = (weightVal) => {
    if (isWon) return;
    soundService.playPop();
    const nextWeights = [...rightWeights, weightVal];
    setRightWeights(nextWeights);

    // Checa se equilibrou perfeitamente
    const newTotal = challenge.initialRightWeight + nextWeights.reduce((a, b) => a + b, 0);
    if (newTotal === leftTotal) {
      setIsWon(true);
      soundService.playSuccess();
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#10b981', '#f59e0b', '#ea580c', '#fcd34d']
      });
    } else if (newTotal > leftTotal) {
      soundService.playBoop();
    }
  };

  // Remove um peso colocado
  const removeWeight = (idx) => {
    if (isWon) return;
    soundService.playPop();
    setRightWeights(prev => prev.filter((_, i) => i !== idx));
  };

  const handleNextRound = () => {
    soundService.playPop();
    if (roundIdx + 1 >= BALANCE_CHALLENGES.length) {
      setIsFinished(true);
      soundService.playFanfare();
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#10b981', '#f59e0b', '#ea580c', '#fcd34d', '#7c3aed']
      });
    } else {
      const nextR = roundIdx + 1;
      setRoundIdx(nextR);
      initChallenge(nextR);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <span style={{ fontSize: '3rem' }}>⚖️</span>
        <h3 style={{ marginTop: '1rem', color: '#b45309' }}>Carregando Balança Lógica...</h3>
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
          Equilíbrio Perfeito! 🌟
        </h2>
        <p style={{ fontSize: '1.05rem', color: '#475569', marginBottom: '1.5rem' }}>
          Você dominou o raciocínio matemático e a física da balança com maestria!
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

  const isBalanced = leftTotal === rightTotal;

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
          BALANÇA LÓGICA ({roundIdx + 1}/{BALANCE_CHALLENGES.length})
        </span>

        <button
          onClick={() => initChallenge(roundIdx)}
          className="kid-btn"
          style={{ background: '#f1f5f9', color: '#475569', padding: '0.45rem 0.9rem', fontSize: '0.9rem' }}
          title="Reiniciar Balança"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Instruções do Desafio */}
      <div style={{
        background: '#fff',
        borderRadius: '1.5rem',
        padding: '1rem 1.25rem',
        textAlign: 'center',
        marginBottom: '1rem',
        border: '3px solid #fde68a'
      }}>
        <h3 style={{ fontSize: '1.15rem', color: '#ea580c', margin: '0 0 0.25rem', fontFamily: 'var(--font-display)' }}>
          {challenge.title}
        </h3>
        <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0, fontWeight: 600 }}>
          {challenge.instruction}
        </p>
      </div>

      {/* BALANÇA DE PRATOS VIRTUAL (GANGORRA ILUSTRADA) */}
      <div style={{
        background: '#fff',
        borderRadius: '2rem',
        padding: '2rem 1rem 1rem',
        boxShadow: 'var(--card-shadow)',
        border: '4px solid #fde68a',
        marginBottom: '1rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Status de Equilíbrio */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <span style={{
            background: isBalanced ? '#ecfdf5' : '#fef3c7',
            color: isBalanced ? '#059669' : '#b45309',
            border: isBalanced ? '2px solid #10b981' : '2px solid #f59e0b',
            borderRadius: '1rem',
            padding: '0.35rem 1rem',
            fontWeight: 800,
            fontSize: '0.85rem'
          }}>
            {isBalanced ? '⚖️ EQUILÍBRIO PERFEITO! ✨' : tiltAngle < 0 ? '👈 O lado esquerdo está mais pesado!' : '👉 O lado direito está mais pesado!'}
          </span>
        </div>

        {/* HASTE BASCULANTE DA BALANÇA */}
        <div style={{
          position: 'relative',
          height: '180px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          {/* Barra Horizontal Móvel */}
          <div style={{
            position: 'absolute',
            width: '80%',
            maxWidth: '460px',
            height: '12px',
            background: '#b45309',
            borderRadius: '6px',
            transform: `rotate(${tiltAngle}deg)`,
            transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            {/* Prato Esquerdo */}
            <div style={{
              position: 'absolute',
              left: '-20px',
              top: '12px',
              width: '120px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              {/* Cordas do Prato */}
              <div style={{ width: '80px', height: '35px', borderLeft: '2px solid #94a3b8', borderRight: '2px solid #94a3b8' }} />
              {/* Prato */}
              <div style={{
                width: '100%',
                background: '#fef3c7',
                border: '3px solid #f59e0b',
                borderRadius: '0 0 1.5rem 1.5rem',
                padding: '0.5rem',
                textAlign: 'center',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
              }}>
                <div style={{ fontSize: '2rem' }}>{challenge.leftCharacter.icon}</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#b45309' }}>
                  Peso: {leftTotal} ⭐
                </div>
              </div>
            </div>

            {/* Prato Direito */}
            <div style={{
              position: 'absolute',
              right: '-20px',
              top: '12px',
              width: '120px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              {/* Cordas do Prato */}
              <div style={{ width: '80px', height: '35px', borderLeft: '2px solid #94a3b8', borderRight: '2px solid #94a3b8' }} />
              {/* Prato */}
              <div style={{
                width: '100%',
                background: isBalanced ? '#ecfdf5' : '#f8fafc',
                border: isBalanced ? '3px solid #10b981' : '3px solid #ea580c',
                borderRadius: '0 0 1.5rem 1.5rem',
                padding: '0.5rem',
                textAlign: 'center',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
              }}>
                <div style={{ fontSize: '1.8rem' }}>{challenge.rightCharacter.icon}</div>
                {/* Pesinhos Adicionados */}
                <div style={{ display: 'flex', gap: '0.2rem', justifyContent: 'center', flexWrap: 'wrap', minHeight: '22px' }}>
                  {rightWeights.map((w, idx) => (
                    <span
                      key={idx}
                      onClick={() => removeWeight(idx)}
                      style={{
                        background: '#10b981',
                        color: '#fff',
                        fontSize: '0.7rem',
                        fontWeight: 900,
                        padding: '0.1rem 0.35rem',
                        borderRadius: '0.4rem',
                        cursor: 'pointer'
                      }}
                      title="Toque para remover"
                    >
                      +{w}kg ✕
                    </span>
                  ))}
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ea580c', marginTop: '0.2rem' }}>
                  Total: {rightTotal} ⭐
                </div>
              </div>
            </div>
          </div>

          {/* Triângulo / Pivô Central */}
          <div style={{
            position: 'absolute',
            bottom: '0',
            width: '0',
            height: '0',
            borderLeft: '32px solid transparent',
            borderRight: '32px solid transparent',
            borderBottom: '60px solid #78350f'
          }} />
        </div>

        {/* Notificação de Vitória da Rodada */}
        {isWon && (
          <div style={{ marginTop: '1.5rem', textAlign: 'center', animation: 'fadeIn 0.25s ease' }}>
            <p style={{ fontSize: '1.2rem', color: '#059669', fontWeight: 800, margin: '0 0 0.5rem' }}>
              🎉 Parabéns! Você encontrou a igualdade exata! 🎉
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
              <span>{roundIdx + 1 >= BALANCE_CHALLENGES.length ? 'Ver Resultado Final 🏆' : 'Próxima Balança ➡️'}</span>
            </button>
          </div>
        )}
      </div>

      {/* BANDEJA DE PESOS DISPONÍVEIS */}
      {!isWon && (
        <div style={{
          background: '#fff',
          borderRadius: '1.75rem',
          padding: '1rem',
          boxShadow: 'var(--card-shadow)',
          border: '3px solid #e2e8f0',
          textAlign: 'center'
        }}>
          <h4 style={{ fontSize: '0.9rem', color: '#475569', margin: '0 0 0.75rem', fontWeight: 800 }}>
            Toque nos pesinhos para colocar no prato direito:
          </h4>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {challenge.availableWeights.map((w, idx) => (
              <button
                key={idx}
                onClick={() => addWeight(w)}
                className="kid-btn"
                style={{
                  background: 'linear-gradient(135deg, #fef08a 0%, #f59e0b 100%)',
                  color: '#78350f',
                  fontSize: '1.1rem',
                  fontWeight: 900,
                  padding: '0.75rem 1.4rem',
                  boxShadow: '0 4px 10px rgba(245, 158, 11, 0.3)'
                }}
              >
                <span>⭐ +{w}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
