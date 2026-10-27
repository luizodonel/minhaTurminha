import React, { useState } from 'react';
import { Sparkles, Trophy, Heart, Play, Lock, Crown } from 'lucide-react';
import { soundService } from '../services/soundService';
import { FREE_GAME_IDS, PRO_PRICE_LABEL } from '../services/api';

export function GameSelector({ onSelectGame, currentChild, isPro = false, onOpenProModal }) {
  const [selectedCategory, setSelectedCategory] = useState('todos');

  const categories = [
    { id: 'todos', label: '🌟 Todos os Jogos' },
    { id: 'gratis', label: '🎁 Jogos Grátis (4)' },
    { id: 'logica', label: '🧩 Raciocínio & Lógica' },
    { id: 'percepcao', label: '🔍 Descoberta' },
    { id: 'agilidade', label: '🫧 Agilidade & Sons' },
    { id: 'criatividade', label: '🎨 Criatividade & Letras' }
  ];

  const games = [
    // 0. Raciocínio Lógico & Dedução
    {
      id: 'labirinto',
      category: 'logica',
      title: 'Labirinto dos Encontros',
      subtitle: 'Planeje o trajeto e programe os passos até a chegada!',
      badge: 'Lógica 🧭',
      icon: '🧭',
      bgGradient: 'linear-gradient(135deg, #d1fae5 0%, #10b981 100%)',
      btnColor: '#059669'
    },
    {
      id: 'qual-nao-pertence',
      category: 'logica',
      title: 'Qual Não Pertence?',
      subtitle: 'Descubra a regra secreta e ache o elemento diferente!',
      badge: 'Dedução 🔍',
      icon: '🔍',
      bgGradient: 'linear-gradient(135deg, #fef08a 0%, #f59e0b 100%)',
      btnColor: '#d97706'
    },
    {
      id: 'sudoku',
      category: 'logica',
      title: 'Sudoku Ilustrado',
      subtitle: 'Preencha o tabuleiro sem repetir as fotos da família!',
      badge: 'Desafio 🧩',
      icon: '🧩',
      bgGradient: 'linear-gradient(135deg, #fed7aa 0%, #ea580c 100%)',
      btnColor: '#ea580c'
    },
    {
      id: 'balanca',
      category: 'logica',
      title: 'Balança Lógica',
      subtitle: 'Equilibre os pratos da gangorra somando pesos e estrelas!',
      badge: 'Equilíbrio ⚖️',
      icon: '⚖️',
      bgGradient: 'linear-gradient(135deg, #fef08a 0%, #facc15 100%)',
      btnColor: '#ca8a04'
    },
    {
      id: 'matriz-dupla',
      category: 'logica',
      title: 'Matriz de Dupla Entrada',
      subtitle: 'Combine linhas de pessoas com colunas de acessórios!',
      badge: 'Tabela 📊',
      icon: '📊',
      bgGradient: 'linear-gradient(135deg, #ddd6fe 0%, #8b5cf6 100%)',
      btnColor: '#6d28d9'
    },
    {
      id: 'causa-efeito',
      category: 'logica',
      title: 'Causa e Efeito',
      subtitle: 'Organize o que aconteceu antes, durante e depois!',
      badge: 'Tempo ⏳',
      icon: '⏳',
      bgGradient: 'linear-gradient(135deg, #a7f3d0 0%, #059669 100%)',
      btnColor: '#047857'
    },

    // 1. Descoberta & Percepção Visual
    {
      id: 'memoria',
      category: 'percepcao',
      title: 'Jogo da Memória',
      subtitle: 'Encontre os pares das fotos da sua turminha!',
      badge: 'Clássico ⭐',
      icon: '🃏',
      bgGradient: 'linear-gradient(135deg, #fef08a 0%, #f59e0b 100%)',
      btnColor: '#d97706'
    },
    {
      id: 'quem-e-quem',
      category: 'percepcao',
      title: 'Quem é Quem?',
      subtitle: 'Ache onde está o papai, a mamãe e os pets!',
      badge: 'Divertido 🌟',
      icon: '🔍',
      bgGradient: 'linear-gradient(135deg, #fed7aa 0%, #fb923c 100%)',
      btnColor: '#ea580c'
    },
    {
      id: 'quebra-cabeca',
      category: 'percepcao',
      title: 'Quebra-Cabeça',
      subtitle: 'Arraste as peças para montar a foto da família!',
      badge: 'Desafio 🧩',
      icon: '🧩',
      bgGradient: 'linear-gradient(135deg, #d1fae5 0%, #10b981 100%)',
      btnColor: '#059669'
    },
    {
      id: 'raspe-descubra',
      category: 'percepcao',
      title: 'Raspe e Descubra',
      subtitle: 'Passe o dedinho para raspar e revelar a foto!',
      badge: 'Surpresa ✨',
      icon: '🪄',
      bgGradient: 'linear-gradient(135deg, #fef08a 0%, #facc15 100%)',
      btnColor: '#ca8a04'
    },
    {
      id: 'sombras',
      category: 'percepcao',
      title: 'Jogo das Sombras',
      subtitle: 'Adivinhe quem é o dono da silhueta mágica!',
      badge: 'Mistério 👤',
      icon: '🌑',
      bgGradient: 'linear-gradient(135deg, #ddd6fe 0%, #8b5cf6 100%)',
      btnColor: '#6d28d9'
    },

    // 2. Agilidade, Toque e Sons
    {
      id: 'bolhas',
      category: 'agilidade',
      title: 'Bolinhas de Sabão',
      subtitle: 'Estoure as bolhas flutuantes com fotos dentro!',
      badge: 'Pop Pop 🫧',
      icon: '🫧',
      bgGradient: 'linear-gradient(135deg, #a7f3d0 0%, #34d399 100%)',
      btnColor: '#059669'
    },
    {
      id: 'janelinhas',
      category: 'agilidade',
      title: 'Janelinhas Mágicas',
      subtitle: 'Olhe rápido quem apareceu no castelinho!',
      badge: 'Ágil 🏰',
      icon: '🏰',
      bgGradient: 'linear-gradient(135deg, #fde68a 0%, #f59e0b 100%)',
      btnColor: '#d97706'
    },

    // 3. Raciocínio, Linguagem & Criatividade
    {
      id: 'soletrando',
      category: 'criatividade',
      title: 'Soletrando com Fotos',
      subtitle: 'Descubra as letras grandiosas e forme o nome da foto!',
      badge: 'Alfabeto 🔤',
      icon: '🔤',
      bgGradient: 'linear-gradient(135deg, #fef08a 0%, #f59e0b 100%)',
      btnColor: '#d97706'
    },
    {
      id: 'pares-objetos',
      category: 'criatividade',
      title: 'Associação de Pares',
      subtitle: 'Ligue a foto de cada familiar ao seu objeto favorito!',
      badge: 'Associação 🎯',
      icon: '🎯',
      bgGradient: 'linear-gradient(135deg, #fed7aa 0%, #ea580c 100%)',
      btnColor: '#ea580c'
    },
    {
      id: 'fantasia-rosto',
      category: 'criatividade',
      title: 'Complete o Rosto',
      subtitle: 'Coloque chapéus, óculos e adereços no rostinho!',
      badge: 'Fantasia 🎭',
      icon: '🎭',
      bgGradient: 'linear-gradient(135deg, #d1fae5 0%, #10b981 100%)',
      btnColor: '#059669'
    },
    {
      id: 'sequencia',
      category: 'criatividade',
      title: 'Sequência & Tamanhos',
      subtitle: 'Organize do menor para o maior e complete padrões!',
      badge: 'Raciocínio 📏',
      icon: '🧠',
      bgGradient: 'linear-gradient(135deg, #e9d5ff 0%, #c084fc 100%)',
      btnColor: '#9333ea'
    },
    {
      id: 'figurinhas',
      category: 'criatividade',
      title: 'Álbum de Figurinhas',
      subtitle: 'Cole figurinhas temáticas de astronauta, herói e mais!',
      badge: 'Coleção ⭐',
      icon: '⭐',
      bgGradient: 'linear-gradient(135deg, #fef08a 0%, #84cc16 100%)',
      btnColor: '#65a30d'
    }
  ];

  const filteredGames = (() => {
    let list = games;
    if (selectedCategory === 'gratis') {
      list = games.filter(g => FREE_GAME_IDS.includes(g.id));
    } else if (selectedCategory !== 'todos') {
      list = games.filter(g => g.category === selectedCategory);
    }
    // Na visão geral e categorias, se ainda não for PRO, destaca os gratuitos primeiro
    if (!isPro) {
      return [...list].sort((a, b) => {
        const aFree = FREE_GAME_IDS.includes(a.id) ? 0 : 1;
        const bFree = FREE_GAME_IDS.includes(b.id) ? 0 : 1;
        return aFree - bFree;
      });
    }
    return list;
  })();

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* Banner de Boas-Vindas */}
      <div style={{
        textAlign: 'center',
        background: '#fff',
        borderRadius: '2.5rem',
        padding: '2rem 1.5rem',
        marginBottom: '1.25rem',
        boxShadow: 'var(--card-shadow)',
        border: '4px solid #fde68a',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <span style={{ fontSize: '3rem', display: 'inline-block', marginBottom: '0.25rem' }}>
          {currentChild?.avatarUrl || '🦁'}
        </span>
        <h2 style={{ fontSize: '2.2rem', color: '#0f172a', marginBottom: '0.4rem', fontFamily: 'var(--font-display)' }}>
          Olá, <span style={{ color: '#ea580c' }}>{currentChild?.nome || 'Amiguinho(a)'}</span>!
        </h2>
        <p style={{ fontSize: '1.15rem', color: '#64748b', maxWidth: '520px', margin: '0 auto' }}>
          Qual jogo divertido você quer brincar hoje com a sua turminha?
        </p>
      </div>

      {/* Banner de Oferta Vitalícia PRO (visível apenas para quem ainda está no plano gratuito) */}
      {!isPro && (
        <div
          onClick={() => {
            soundService.playPop();
            if (onOpenProModal) onOpenProModal(null);
          }}
          style={{
            background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
            border: '3px solid #f59e0b',
            borderRadius: '1.75rem',
            padding: '1rem 1.35rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.85rem',
            cursor: 'pointer',
            boxShadow: '0 8px 20px rgba(245, 158, 11, 0.18)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: '#f59e0b',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              flexShrink: 0
            }}>
              👑
            </div>
            <div>
              <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.05rem', fontFamily: 'var(--font-display)' }}>
                Desbloqueie todos os 18 jogos na Versão PRO Vitalícia!
              </div>
              <div style={{ fontSize: '0.85rem', color: '#b45309', fontWeight: 600 }}>
                4 jogos grátis liberados • Libere +14 jogos educativos por apenas <strong>{PRO_PRICE_LABEL}</strong> (pagamento único)
              </div>
            </div>
          </div>

          <button
            type="button"
            className="kid-btn"
            style={{
              background: '#ea580c',
              color: '#fff',
              padding: '0.6rem 1.15rem',
              fontSize: '0.9rem',
              flexShrink: 0
            }}
          >
            <Crown size={16} />
            <span>Liberar Tudo ({PRO_PRICE_LABEL})</span>
          </button>
        </div>
      )}

      {/* Abas de Categorias */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => {
              soundService.playPop();
              setSelectedCategory(cat.id);
            }}
            className="kid-btn"
            style={{
              background: selectedCategory === cat.id ? '#ea580c' : '#fff',
              color: selectedCategory === cat.id ? '#fff' : '#475569',
              padding: '0.55rem 1rem',
              fontSize: '0.88rem',
              border: selectedCategory === cat.id ? '2px solid #c2410c' : '2px solid #e2e8f0',
              boxShadow: selectedCategory === cat.id ? '0 6px 16px rgba(234, 88, 12, 0.35)' : 'var(--card-shadow)',
              flexShrink: 0
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grade de Jogos */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '1.5rem'
      }}>
        {filteredGames.map(game => {
          const isFreeGame = FREE_GAME_IDS.includes(game.id);
          const isLocked = !isPro && !isFreeGame;

          return (
            <div
              key={game.id}
              onClick={() => {
                soundService.playPop();
                if (isLocked) {
                  if (onOpenProModal) onOpenProModal(game);
                } else {
                  onSelectGame(game.id);
                }
              }}
              style={{
                background: '#fff',
                borderRadius: '2rem',
                overflow: 'hidden',
                boxShadow: 'var(--card-shadow)',
                border: isLocked ? '3px solid #fde68a' : '4px solid #fff',
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                display: 'flex',
                flexDirection: 'column',
                opacity: isLocked ? 0.94 : 1
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-6px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
            >
              {/* Topo Colorido do Card */}
              <div style={{
                background: game.bgGradient,
                padding: '1.75rem 1.25rem 1.25rem',
                textAlign: 'center',
                position: 'relative'
              }}>
                {/* Selo Grátis / PRO à esquerda */}
                {!isPro && (
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    background: isLocked ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : '#10b981',
                    color: '#fff',
                    padding: '0.2rem 0.65rem',
                    borderRadius: '9999px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                  }}>
                    {isLocked ? '👑 PRO' : '🎁 GRÁTIS'}
                  </span>
                )}

                <span style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'rgba(255, 255, 255, 0.9)',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: '#1e293b'
                }}>
                  {game.badge}
                </span>
                <div style={{
                  width: '74px',
                  height: '74px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.95)',
                  margin: '0 auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.5rem',
                  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.08)',
                  position: 'relative'
                }}>
                  {game.icon}
                  {isLocked && (
                    <span style={{
                      position: 'absolute',
                      bottom: '-4px',
                      right: '-4px',
                      background: '#f59e0b',
                      color: '#fff',
                      borderRadius: '50%',
                      width: '26px',
                      height: '26px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid #fff'
                    }}>
                      <Lock size={13} />
                    </span>
                  )}
                </div>
              </div>

              {/* Conteúdo do Card */}
              <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1.35rem', color: '#0f172a', marginBottom: '0.35rem', fontFamily: 'var(--font-display)' }}>
                    {game.title}
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.4, marginBottom: '1.25rem' }}>
                    {game.subtitle}
                  </p>
                </div>

                {isLocked ? (
                  <button
                    className="kid-btn"
                    style={{
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      color: '#fff',
                      width: '100%',
                      padding: '0.75rem',
                      fontSize: '0.95rem',
                      boxShadow: '0 6px 14px rgba(217, 119, 6, 0.3)',
                      justifyContent: 'center'
                    }}
                  >
                    <Lock size={16} />
                    <span>Desbloquear PRO ({PRO_PRICE_LABEL})</span>
                  </button>
                ) : (
                  <button
                    className="kid-btn"
                    style={{
                      background: game.btnColor,
                      color: '#fff',
                      width: '100%',
                      padding: '0.75rem',
                      fontSize: '1.05rem',
                      boxShadow: `0 6px 14px ${game.btnColor}40`,
                      justifyContent: 'center'
                    }}
                  >
                    <Play size={18} fill="#fff" />
                    <span>Jogar Agora</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
