import React from 'react';
import { Volume2, VolumeX, Shield } from 'lucide-react';
import { soundService } from '../services/soundService';

export function Navbar({ currentChild, onOpenParents, onSoundToggle, isMuted, onGoHome }) {
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
