import React from 'react';
import { Volume2, VolumeX, Shield, Crown } from 'lucide-react';
import { soundService } from '../services/soundService';

export function Navbar({ currentChild, onOpenParents, onSoundToggle, isMuted, onGoHome, isPro = false, onOpenProModal }) {
  const handleToggleSound = () => {
    soundService.playPop();
    onSoundToggle();
  };

  const handleLogoClick = () => {
    soundService.playPop();
    if (onGoHome) onGoHome();
  };

  return (
    <header className="nav-header">
      {/* Logo Minha Turminha com link para a Página Inicial */}
      <div
        onClick={handleLogoClick}
        title="Voltar para a Página Inicial"
        className="nav-logo"
      >
        <div className="nav-logo-icon">
          🎈
        </div>
        <div style={{ minWidth: 0 }}>
          <h1 className="nav-title">
            Minha <span style={{ color: '#ea580c' }}>Turminha</span>
          </h1>
          <span className="nav-subtitle">
            Jogos com a sua família ✨
          </span>
        </div>
      </div>

      {/* Perfil da Criança e Controles */}
      <div className="nav-controls">
        {/* Card da Criança Ativa */}
        {currentChild && (
          <div className="nav-child-pill" title={`Criança ativa: ${currentChild.nome}`}>
            <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>{currentChild.avatarUrl || '🦁'}</span>
            <span className="nav-child-name">
              {currentChild.nome}
            </span>
          </div>
        )}

        {/* Botão / Selo Versão PRO */}
        {isPro ? (
          <div
            title="Minha Turminha PRO Vitalício Ativo"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              border: '2px solid #f59e0b',
              color: '#b45309',
              padding: '0.35rem 0.65rem',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              fontWeight: 800
            }}
          >
            <span>👑</span>
            <span>PRO</span>
          </div>
        ) : (
          <button
            onClick={() => {
              soundService.playPop();
              if (onOpenProModal) onOpenProModal(null);
            }}
            className="kid-btn nav-pais-btn"
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
              color: '#fff'
            }}
            title="Desbloquear todos os 18 jogos por R$ 9,90 (Vitalício)"
          >
            <Crown size={16} />
            <span className="nav-pais-text">PRO</span>
          </button>
        )}

        {/* Botão de Som */}
        <button
          onClick={handleToggleSound}
          className="kid-btn nav-btn-icon"
          style={{
            background: isMuted ? '#94a3b8' : '#10b981',
            color: '#fff'
          }}
          title={isMuted ? 'Ativar Sons' : 'Desativar Sons'}
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>

        {/* Botão Área dos Pais */}
        <button
          onClick={() => {
            soundService.playPop();
            onOpenParents();
          }}
          className="kid-btn nav-pais-btn"
          style={{
            background: '#8b5cf6',
            color: '#fff'
          }}
          title="Área dos Pais e Responsáveis"
        >
          <Shield size={17} />
          <span className="nav-pais-text">Pais</span>
        </button>
      </div>
    </header>
  );
}
