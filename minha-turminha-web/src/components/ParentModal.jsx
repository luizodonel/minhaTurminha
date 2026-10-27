import React, { useState, useEffect } from 'react';
import { X, Lock, Check, Upload, Trash2, Users, Sliders, Image as ImageIcon, Copy, KeyRound } from 'lucide-react';
import { api, getDeviceId, setDeviceId } from '../services/api';
import { soundService } from '../services/soundService';

export function ParentModal({
  isOpen,
  onClose,
  currentChild,
  onSelectChild,
  difficulty,
  onDifficultyChange,
  onPhotosUpdated,
  isPro = false,
  onOpenProModal
}) {
  const [unlocked, setUnlocked] = useState(false);
  const [mathQuestion, setMathQuestion] = useState({ a: 3, b: 4, ans: 7 });
  const [mathInput, setMathInput] = useState('');
  const [mathError, setMathError] = useState(false);

  const [activeTab, setActiveTab] = useState('fotos'); // 'fotos', 'criancas', 'config'
  const [fotos, setFotos] = useState([]);
  const [criancas, setCriancas] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Form de nova foto
  const [novoRotulo, setNovoRotulo] = useState('');
  const [novaCategoria, setNovaCategoria] = useState('FAMILIA');

  // Form de nova criança
  const [novoNome, setNovoNome] = useState('');
  const [novaIdade, setNovaIdade] = useState(4);
  const [novoAvatar, setNovoAvatar] = useState('🦁');

  // Backup / Restauração de Dispositivo
  const [restoreCode, setRestoreCode] = useState('');
  const [copiedDevice, setCopiedDevice] = useState(false);

  // Gera pergunta matemática aleatória ao abrir
  useEffect(() => {
    if (isOpen) {
      generateMathQuestion();
      setUnlocked(false);
      setMathInput('');
      setMathError(false);
    }
  }, [isOpen]);

  // Carrega dados quando desbloqueado
  useEffect(() => {
    if (unlocked && isOpen) {
      loadData();
    }
  }, [unlocked, isOpen, currentChild]);

  const generateMathQuestion = () => {
    const a = Math.floor(Math.random() * 6) + 2;
    const b = Math.floor(Math.random() * 5) + 2;
    setMathQuestion({ a, b, ans: a + b });
  };

  const handleUnlock = (e) => {
    e.preventDefault();
    if (parseInt(mathInput, 10) === mathQuestion.ans) {
      soundService.playSuccess();
      setUnlocked(true);
      setMathError(false);
    } else {
      soundService.playBoop();
      setMathError(true);
      setMathInput('');
      generateMathQuestion();
    }
  };

  const loadData = async () => {
    const criancasData = await api.getCriancas();
    setCriancas(criancasData);

    const childId = currentChild?.id || (criancasData[0] ? criancasData[0].id : null);
    if (childId) {
      const fotosData = await api.getFotos(childId);
      setFotos(fotosData);
    } else {
      setFotos([]);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!currentChild?.id) {
      alert('Primeiro cadastre ou selecione uma criança na aba "Crianças"!');
      return;
    }

    if (!novoRotulo.trim()) {
      alert('Por favor, digite o nome de quem está na foto (Ex: Mamãe, Papai, Vovô)');
      return;
    }

    setUploading(true);
    soundService.playPop();

    try {
      const childId = currentChild.id;
      await api.uploadFoto(childId, novoRotulo.trim(), novaCategoria, file);
      setNovoRotulo('');
      await loadData();
      if (onPhotosUpdated) onPhotosUpdated();
    } catch (_) {
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (fotoId) => {
    if (!currentChild?.id) return;
    soundService.playPop();
    const childId = currentChild.id;
    await api.deleteFoto(childId, fotoId);
    await loadData();
    if (onPhotosUpdated) onPhotosUpdated();
  };

  const handleAddDemoPhotos = async () => {
    if (!currentChild?.id) return;
    soundService.playPop();
    const childId = currentChild.id;
    api.restoreDemoPhotos(childId);
    await loadData();
    if (onPhotosUpdated) onPhotosUpdated();
  };

  const handleCreateChild = async (e) => {
    e.preventDefault();
    if (!novoNome.trim()) return;

    soundService.playPop();
    const created = await api.createCrianca({
      nome: novoNome.trim(),
      idade: parseInt(novaIdade, 10) || 4,
      avatarUrl: novoAvatar
    });

    setNovoNome('');
    await loadData();
    onSelectChild(created);
  };

  const handleDeleteChild = async (e, childId) => {
    e.stopPropagation();
    if (!window.confirm('Tem certeza que deseja remover este perfil e suas fotos?')) return;
    soundService.playPop();
    await api.deleteCrianca(childId);
    const updated = await api.getCriancas();
    setCriancas(updated);
    if (currentChild?.id === childId) {
      onSelectChild(updated[0] || null);
    }
  };

  const handleCopyDeviceId = () => {
    navigator.clipboard?.writeText(getDeviceId());
    setCopiedDevice(true);
    setTimeout(() => setCopiedDevice(false), 2500);
  };

  const handleRestoreDevice = async (e) => {
    e.preventDefault();
    if (!restoreCode.trim()) return;
    if (setDeviceId(restoreCode.trim())) {
      soundService.playSuccess();
      setRestoreCode('');
      const criancasData = await api.getCriancas();
      setCriancas(criancasData);
      onSelectChild(criancasData[0] || null);
      if (onPhotosUpdated) onPhotosUpdated();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Cabeçalho do Modal */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
            <span style={{ fontSize: '1.6rem', flexShrink: 0 }}>👨‍👩‍👧</span>
            <h2 style={{ fontSize: 'clamp(1.05rem, 4vw, 1.35rem)', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Área dos Pais & Responsáveis
            </h2>
          </div>
          <button
            onClick={() => {
              soundService.playPop();
              onClose();
            }}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
              flexShrink: 0
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* 1. Trava Parental (Parental Gate) */}
        {!unlocked ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0.5rem' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#fef3c7',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              fontSize: '1.75rem'
            }}>
              🔒
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.4rem', color: '#0f172a' }}>
              Apenas para Adultos
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Para evitar cliques acidentais das crianças, responda quanto é:
            </p>

            <form onSubmit={handleUnlock} style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '0.9rem', width: '100%', maxWidth: '280px' }}>
              <div style={{
                fontSize: '1.6rem',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                color: '#ea580c',
                background: '#fffbeb',
                padding: '0.65rem 1.75rem',
                borderRadius: '1rem',
                border: '2px dashed #f59e0b',
                width: '100%',
                textAlign: 'center'
              }}>
                {mathQuestion.a} + {mathQuestion.b} = ?
              </div>

              <input
                type="number"
                autoFocus
                placeholder="Resposta"
                value={mathInput}
                onChange={(e) => setMathInput(e.target.value)}
                style={{
                  fontSize: '1.25rem',
                  textAlign: 'center',
                  padding: '0.6rem 1rem',
                  borderRadius: '0.75rem',
                  border: mathError ? '2px solid #ef4444' : '2px solid #cbd5e1',
                  width: '140px',
                  outline: 'none'
                }}
              />

              {mathError && (
                <span style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 600 }}>
                  Resposta incorreta. Tente novamente!
                </span>
              )}

              <button type="submit" className="kid-btn" style={{ background: '#10b981', color: '#fff', padding: '0.65rem 1.8rem', width: '100%' }}>
                Entrar no Painel
              </button>
            </form>
          </div>
        ) : (
          /* 2. Painel Desbloqueado */
          <div>
            {/* Tabs com grid responsivo perfeito no celular */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.4rem',
              marginBottom: '1.25rem',
              borderBottom: '2px solid #f1f5f9',
              paddingBottom: '0.75rem'
            }}>
              <button
                onClick={() => setActiveTab('fotos')}
                className="kid-btn"
                style={{
                  background: activeTab === 'fotos' ? '#ea580c' : '#f1f5f9',
                  color: activeTab === 'fotos' ? '#fff' : '#64748b',
                  padding: '0.5rem 0.25rem',
                  fontSize: '0.8rem',
                  justifyContent: 'center',
                  boxShadow: 'none'
                }}
              >
                <ImageIcon size={15} />
                <span>Fotos ({fotos.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('criancas')}
                className="kid-btn"
                style={{
                  background: activeTab === 'criancas' ? '#10b981' : '#f1f5f9',
                  color: activeTab === 'criancas' ? '#fff' : '#64748b',
                  padding: '0.5rem 0.25rem',
                  fontSize: '0.8rem',
                  justifyContent: 'center',
                  boxShadow: 'none'
                }}
              >
                <Users size={15} />
                <span>Crianças</span>
              </button>

              <button
                onClick={() => setActiveTab('config')}
                className="kid-btn"
                style={{
                  background: activeTab === 'config' ? '#f59e0b' : '#f1f5f9',
                  color: activeTab === 'config' ? '#fff' : '#64748b',
                  padding: '0.5rem 0.25rem',
                  fontSize: '0.8rem',
                  justifyContent: 'center',
                  boxShadow: 'none'
                }}
              >
                <Sliders size={15} />
                <span>Dificuldade</span>
              </button>
            </div>

            {/* TAB FOTOS */}
            {activeTab === 'fotos' && (
              <div>
                {/* Formulário de Envio de Foto */}
                <div style={{
                  background: '#f8fafc',
                  padding: '1rem',
                  borderRadius: '1.25rem',
                  marginBottom: '1.25rem',
                  border: '2px solid #e2e8f0'
                }}>
                  <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', color: '#334155' }}>
                    Adicionar Nova Foto para {currentChild?.nome}
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.6rem', marginBottom: '0.75rem' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                        Nome/Rótulo na foto:
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Papai, Totó..."
                        value={novoRotulo}
                        onChange={(e) => setNovoRotulo(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.55rem 0.75rem',
                          borderRadius: '0.75rem',
                          border: '2px solid #cbd5e1',
                          outline: 'none',
                          fontSize: '0.85rem'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                        Categoria:
                      </label>
                      <select
                        value={novaCategoria}
                        onChange={(e) => setNovaCategoria(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.55rem 0.75rem',
                          borderRadius: '0.75rem',
                          border: '2px solid #cbd5e1',
                          outline: 'none',
                          fontSize: '0.85rem',
                          background: '#fff'
                        }}
                      >
                        <option value="FAMILIA">Família (Pai, Mãe, Irmãos)</option>
                        <option value="PET">Animal de Estimação (Pet)</option>
                        <option value="BRINQUEDO">Brinquedo Favorito</option>
                        <option value="AMIGO">Amiguinho(a) / Escola</option>
                      </select>
                    </div>
                  </div>

                  {/* Input de Arquivo */}
                  <label className="kid-btn" style={{
                    background: '#10b981',
                    color: '#fff',
                    padding: '0.65rem 1rem',
                    cursor: 'pointer',
                    width: '100%',
                    fontSize: '0.9rem'
                  }}>
                    <Upload size={17} />
                    <span>{uploading ? 'Processando Foto...' : 'Escolher Foto do Aparelho'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleFileUpload}
                      disabled={uploading}
                    />
                  </label>
                </div>

                {/* Grade de Fotos Cadastradas */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                  <h4 style={{ fontSize: '0.9rem', color: '#475569' }}>
                    Fotos Cadastradas ({fotos.length})
                  </h4>
                  <button
                    onClick={handleAddDemoPhotos}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#d97706',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    ✨ Restaurar Fotos Demo
                  </button>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(95px, 1fr))',
                  gap: '0.6rem',
                  maxHeight: '240px',
                  overflowY: 'auto',
                  paddingRight: '0.2rem'
                }}>
                  {fotos.map(foto => (
                    <div key={foto.id} style={{
                      position: 'relative',
                      background: '#fff',
                      borderRadius: '1rem',
                      overflow: 'hidden',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                      border: '2px solid #f1f5f9',
                      textAlign: 'center'
                    }}>
                      <img
                        src={foto.urlThumb || foto.urlOriginal}
                        alt={foto.rotulo}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=320&auto=format&fit=crop&q=80';
                        }}
                        style={{ width: '100%', height: '80px', objectFit: 'cover' }}
                      />
                      <div style={{
                        padding: '0.3rem 0.2rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#1e293b',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {foto.rotulo}
                      </div>
                      <button
                        onClick={() => handleDeletePhoto(foto.id)}
                        style={{
                          position: 'absolute',
                          top: '3px',
                          right: '3px',
                          background: 'rgba(239, 68, 68, 0.9)',
                          border: 'none',
                          borderRadius: '50%',
                          width: '24px',
                          height: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          cursor: 'pointer'
                        }}
                        title="Remover foto"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CRIANÇAS */}
            {activeTab === 'criancas' && (
              <div>
                <form onSubmit={handleCreateChild} style={{ background: '#f8fafc', padding: '1rem', borderRadius: '1.25rem', marginBottom: '1.25rem', border: '2px solid #e2e8f0' }}>
                  <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', color: '#334155' }}>Adicionar Novo Perfil</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.6rem', marginBottom: '0.75rem' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Nome da Criança:</label>
                      <input
                        type="text"
                        placeholder="Ex: Luquinhas"
                        value={novoNome}
                        onChange={(e) => setNovoNome(e.target.value)}
                        style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '0.75rem', border: '2px solid #cbd5e1', outline: 'none', fontSize: '0.85rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Avatar:</label>
                      <select
                        value={novoAvatar}
                        onChange={(e) => setNovoAvatar(e.target.value)}
                        style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '0.75rem', border: '2px solid #cbd5e1', outline: 'none', fontSize: '0.85rem', background: '#fff' }}
                      >
                        <option value="🦁">🦁 Leãozinho</option>
                        <option value="🐼">🐼 Ursinho Panda</option>
                        <option value="🚀">🚀 Astronauta</option>
                        <option value="🦄">🦄 Unicórnio</option>
                        <option value="🦖">🦖 Dinossauro</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="kid-btn" style={{ background: '#10b981', color: '#fff', padding: '0.55rem 1rem', width: '100%', fontSize: '0.9rem' }}>
                    Salvar Criança
                  </button>
                </form>

                <h4 style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '0.5rem' }}>
                  Meus Perfis neste Aparelho ({criancas.length}):
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {criancas.length === 0 && (
                    <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem', background: '#f8fafc', borderRadius: '0.85rem' }}>
                      Nenhuma criança cadastrada neste aparelho ainda. Adicione acima!
                    </div>
                  )}
                  {criancas.map(c => (
                    <div
                      key={c.id}
                      onClick={() => onSelectChild(c)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.65rem 1rem',
                        borderRadius: '0.85rem',
                        background: currentChild?.id === c.id ? '#ecfdf5' : '#fff',
                        border: currentChild?.id === c.id ? '2px solid #10b981' : '1px solid #e2e8f0',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span style={{ fontSize: '1.4rem' }}>{c.avatarUrl || '🦁'}</span>
                        <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>{c.nome}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {currentChild?.id === c.id && <Check size={18} color="#10b981" />}
                        <button
                          type="button"
                          onClick={(e) => handleDeleteChild(e, c.id)}
                          style={{
                            background: '#fee2e2',
                            border: 'none',
                            borderRadius: '50%',
                            width: '28px',
                            height: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ef4444',
                            cursor: 'pointer'
                          }}
                          title="Excluir perfil"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONFIG / DIFICULDADE */}
            {activeTab === 'config' && (
              <div>
                {/* Status da Licença PRO */}
                <div style={{
                  background: isPro ? '#ecfdf5' : '#fffbeb',
                  border: isPro ? '2px solid #10b981' : '2px solid #f59e0b',
                  borderRadius: '1rem',
                  padding: '0.85rem 1rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  flexWrap: 'wrap'
                }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>
                      {isPro ? '👑 Minha Turminha PRO Vitalício Ativo' : '🎁 Plano Atual: Gratuito (4 Jogos)'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#475569' }}>
                      {isPro
                        ? 'Todos os 18 jogos educativos estão liberados neste aparelho!'
                        : 'Desbloqueie todos os 18 jogos educativos por apenas R$ 9,90 (pagamento único).'}
                    </div>
                  </div>
                  {!isPro && (
                    <button
                      type="button"
                      onClick={() => {
                        soundService.playPop();
                        onClose();
                        if (onOpenProModal) onOpenProModal(null);
                      }}
                      className="kid-btn"
                      style={{
                        background: '#ea580c',
                        color: '#fff',
                        padding: '0.45rem 0.85rem',
                        fontSize: '0.78rem',
                        boxShadow: 'none'
                      }}
                    >
                      Liberar PRO (R$ 9,90)
                    </button>
                  )}
                </div>

                <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', color: '#1e293b' }}>
                  Dificuldade do Jogo da Memória
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.45rem', marginBottom: '1.25rem' }}>
                  {[
                    { pares: 4, label: 'Fácil (4 Pares)', desc: '2 a 4 anos' },
                    { pares: 6, label: 'Médio (6 Pares)', desc: '4 a 6 anos' },
                    { pares: 8, label: 'Desafio (8 Pares)', desc: '6+ anos' }
                  ].map(lvl => (
                    <div
                      key={lvl.pares}
                      onClick={() => {
                        soundService.playPop();
                        onDifficultyChange(lvl.pares);
                      }}
                      style={{
                        padding: '0.75rem 0.35rem',
                        borderRadius: '0.85rem',
                        border: difficulty === lvl.pares ? '3px solid #f59e0b' : '2px solid #e2e8f0',
                        background: difficulty === lvl.pares ? '#fef3c7' : '#fff',
                        textAlign: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '0.85rem', marginBottom: '0.15rem' }}>{lvl.label}</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{lvl.desc}</div>
                    </div>
                  ))}
                </div>

                {/* Código de Isolamento / Backup do Aparelho */}
                <div style={{
                  background: '#f8fafc',
                  padding: '1rem',
                  borderRadius: '1rem',
                  border: '2px solid #e2e8f0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                    <KeyRound size={16} color="#0f172a" />
                    <h4 style={{ fontSize: '0.9rem', color: '#0f172a' }}>Código Privado deste Aparelho</h4>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.6rem', lineHeight: 1.4 }}>
                    Seus dados são privados e exclusivos deste aparelho. Guarde este código caso queira recuperar suas fotos em outro celular:
                  </p>
                  <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.75rem' }}>
                    <input
                      type="text"
                      readOnly
                      value={getDeviceId()}
                      style={{
                        flex: 1,
                        padding: '0.45rem 0.65rem',
                        borderRadius: '0.6rem',
                        border: '1px solid #cbd5e1',
                        background: '#fff',
                        fontSize: '0.75rem',
                        color: '#334155',
                        fontFamily: 'monospace'
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleCopyDeviceId}
                      className="kid-btn"
                      style={{
                        background: copiedDevice ? '#10b981' : '#334155',
                        color: '#fff',
                        padding: '0.45rem 0.75rem',
                        fontSize: '0.75rem',
                        boxShadow: 'none'
                      }}
                    >
                      <Copy size={13} />
                      <span>{copiedDevice ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>

                  <form onSubmit={handleRestoreDevice} style={{ display: 'flex', gap: '0.4rem' }}>
                    <input
                      type="text"
                      placeholder="Colar código de outro aparelho..."
                      value={restoreCode}
                      onChange={(e) => setRestoreCode(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '0.45rem 0.65rem',
                        borderRadius: '0.6rem',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.75rem'
                      }}
                    />
                    <button
                      type="submit"
                      className="kid-btn"
                      style={{
                        background: '#ea580c',
                        color: '#fff',
                        padding: '0.45rem 0.75rem',
                        fontSize: '0.75rem',
                        boxShadow: 'none'
                      }}
                    >
                      Restaurar
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
