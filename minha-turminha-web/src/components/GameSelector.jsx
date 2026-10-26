import React, { useState } from 'react';
import { Sparkles, Trophy, Heart, Play } from 'lucide-react';
import { soundService } from '../services/soundService';

export function GameSelector({ onSelectGame, currentChild }) {
  const [selectedCategory, setSelectedCategory] = useState('todos');

  const categories = [
    { id: 'todos', label: '🌟 Todos os Jogos' },
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

  const filteredGames = selectedCategory === 'todos'
    ? games
    : games.filter(g => g.category === selectedCategory);

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* Banner de Boas-Vindas */}
      <div style={{
        textAlign: 'center',
        background: '#fff',
        borderRadius: '2.5rem',
        padding: '2rem 1.5rem',
        marginBottom: '1.5rem',
        boxShadow: 'var(--card-shadow)',
        border: '4px solid #fde68a',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <span style={{ fontSize: '3rem', display: 'inline-block', marginBottom: '0.25rem' }}>
          {currentChild?.avatarUrl || '🦁'}
        </span>
        <h2 style={{ fontSize: '2.2rem', color: '#0f172a', marginBottom: '0.4rem', fontFamily: 'var(--font-display)' }}>
          Olá, <span style={{ color: '#ea580c' }}>{currentChild?.nome || 'Luiz Odonel'}</span>!
        </h2>
        <p style={{ fontSize: '1.15rem', color: '#64748b', maxWidth: '520px', margin: '0 auto' }}>
          Qual jogo divertido você quer brincar hoje com a sua turminha?
        </p>
      </div>

      {/* Abas de Categorias */}
      <div style={{
        display: 'flex',
        gap: '0.6rem',
        overflowX: 'auto',
        paddingBottom: '0.75rem',
        marginBottom: '1.5rem',
        justifyContent: 'center'
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
              padding: '0.65rem 1.25rem',
              fontSize: '0.95rem',
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
        {filteredGames.map(game => (
          <div
            key={game.id}
            onClick={() => {
              soundService.playPop();
              onSelectGame(game.id);
            }}
            style={{
              background: '#fff',
              borderRadius: '2rem',
              overflow: 'hidden',
              boxShadow: 'var(--card-shadow)',
              border: '4px solid #fff',
              cursor: 'pointer',
              transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
              display: 'flex',
              flexDirection: 'column'
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
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.08)'
              }}>
                {game.icon}
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

              <button
                className="kid-btn"
                style={{
                  background: game.btnColor,
                  color: '#fff',
                  width: '100%',
                  padding: '0.75rem',
                  fontSize: '1.05rem',
                  boxShadow: `0 6px 14px ${game.btnColor}40`
                }}
              >
                <Play size={18} fill="#fff" />
                <span>Jogar Agora</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
