// Client API Service com Fallback Offline Local para Minha Turminha

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
export const BACKEND_URL = API_BASE_URL.replace(/\/api\/?$/, '');

// Normaliza qualquer URL de foto (/uploads/...) para a URL completa do backend
export function getFullMediaUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${BACKEND_URL}${cleanPath}`;
}

export function normalizeFoto(foto) {
  if (!foto) return foto;
  return {
    ...foto,
    urlThumb: getFullMediaUrl(foto.urlThumb || foto.urlOriginal),
    urlOriginal: getFullMediaUrl(foto.urlOriginal || foto.urlThumb)
  };
}

const DEFAULT_DEMO_CHILD = {
  id: 1,
  nome: 'Luiz Odonel',
  idade: 4,
  avatarUrl: '🦁',
  totalFotos: 6
};


export const INITIAL_DEMO_PHOTOS = [
  { id: 101, rotulo: 'Papai', categoria: 'FAMILIA', urlThumb: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=320&auto=format&fit=crop&q=80' },
  { id: 102, rotulo: 'Mamãe', categoria: 'FAMILIA', urlThumb: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=320&auto=format&fit=crop&q=80' },
  { id: 103, rotulo: 'Totó (Pet)', categoria: 'PET', urlThumb: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=320&auto=format&fit=crop&q=80' },
  { id: 104, rotulo: 'Vovó', categoria: 'FAMILIA', urlThumb: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=320&auto=format&fit=crop&q=80' },
  { id: 105, rotulo: 'Vovô', categoria: 'FAMILIA', urlThumb: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=320&auto=format&fit=crop&q=80' },
  { id: 106, rotulo: 'Bicicleta', categoria: 'BRINQUEDO', urlThumb: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=320&auto=format&fit=crop&q=80' },
  { id: 107, rotulo: 'Ursinho', categoria: 'BRINQUEDO', urlThumb: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=320&auto=format&fit=crop&q=80' },
  { id: 108, rotulo: 'Gatinho', categoria: 'PET', urlThumb: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=320&auto=format&fit=crop&q=80' }
];

export const api = {
  // Lista todas as crianças
  async getCriancas() {
    try {
      const res = await fetch(`${API_BASE_URL}/criancas`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch (_) {}

    // Fallback Local
    const local = localStorage.getItem('turminha_criancas');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        let updated = false;
        const clean = parsed.map(c => {
          if (c.nome === 'Pedro') {
            c.nome = 'Luiz Odonel';
            updated = true;
          }
          return c;
        });
        if (updated) {
          localStorage.setItem('turminha_criancas', JSON.stringify(clean));
        }
        return clean;
      } catch (_) {}
    }
    const initial = [DEFAULT_DEMO_CHILD];
    localStorage.setItem('turminha_criancas', JSON.stringify(initial));
    return initial;
  },

  // Cria uma nova criança
  async createCrianca(crianca) {
    try {
      const res = await fetch(`${API_BASE_URL}/criancas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(crianca)
      });
      if (res.ok) return await res.json();
    } catch (_) {}

    // Fallback Local
    const current = await this.getCriancas();
    const nova = {
      ...crianca,
      id: Date.now(),
      totalFotos: 0,
      avatarUrl: crianca.avatarUrl || '🦁'
    };
    current.push(nova);
    localStorage.setItem('turminha_criancas', JSON.stringify(current));
    return nova;
  },

  // Busca fotos da criança
  async getFotos(criancaId) {
    try {
      const res = await fetch(`${API_BASE_URL}/criancas/${criancaId}/fotos`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data.map(normalizeFoto);
        }
      }
    } catch (_) {}

    // Fallback Local
    const local = localStorage.getItem(`turminha_fotos_${criancaId}`);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        return parsed.map(normalizeFoto);
      } catch (_) {}
    }
    localStorage.setItem(`turminha_fotos_${criancaId}`, JSON.stringify(INITIAL_DEMO_PHOTOS));
    return INITIAL_DEMO_PHOTOS.map(normalizeFoto);
  },

  // Upload de foto
  async uploadFoto(criancaId, rotulo, categoria, file) {
    try {
      const formData = new FormData();
      formData.append('rotulo', rotulo);
      formData.append('categoria', categoria);
      formData.append('arquivo', file);

      const res = await fetch(`${API_BASE_URL}/criancas/${criancaId}/fotos`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        return normalizeFoto(data);
      } else {
        const errText = await res.text();
        console.warn(`[API] Upload falhou no backend (HTTP ${res.status}): ${errText}`);
      }
    } catch (err) {
      console.warn(`[API] Falha de conexão com o backend ao enviar foto: ${err.message}`);
    }

    // Fallback Local (Blob URL para rodar direto no navegador offline)
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target.result;
        const current = JSON.parse(localStorage.getItem(`turminha_fotos_${criancaId}`) || '[]');
        const novaFoto = {
          id: Date.now(),
          rotulo: rotulo || 'Amigo',
          categoria: categoria || 'FAMILIA',
          urlOriginal: base64,
          urlThumb: base64
        };
        current.unshift(novaFoto);
        localStorage.setItem(`turminha_fotos_${criancaId}`, JSON.stringify(current));
        resolve(normalizeFoto(novaFoto));
      };
      reader.readAsDataURL(file);
    });
  },

  // Deleta foto
  async deleteFoto(criancaId, fotoId) {
    try {
      await fetch(`${API_BASE_URL}/fotos/${fotoId}`, { method: 'DELETE' });
    } catch (_) {}

    const current = JSON.parse(localStorage.getItem(`turminha_fotos_${criancaId}`) || '[]');
    const filtradas = current.filter(f => f.id !== fotoId);
    localStorage.setItem(`turminha_fotos_${criancaId}`, JSON.stringify(filtradas));
  },

  // Configura tabuleiro do Jogo da Memória
  async getJogoMemoriaSetup(criancaId, pares = 6) {
    try {
      const res = await fetch(`${API_BASE_URL}/jogos/memoria/setup?criancaId=${criancaId}&pares=${pares}`, {
        signal: AbortSignal.timeout(3000)
      });
      if (res.ok) {
        const setup = await res.json();
        if (setup && Array.isArray(setup.cards)) {
          setup.cards = setup.cards.map(card => ({
            ...card,
            urlThumb: getFullMediaUrl(card.urlThumb)
          }));
        }
        return setup;
      }
    } catch (_) {}

    // Fallback Local Inteligente
    const fotos = await this.getFotos(criancaId);
    let pool = [...fotos];

    // Se tiver menos fotos, complementa
    let idx = 0;
    while (pool.length < pares) {
      pool.push(INITIAL_DEMO_PHOTOS[idx % INITIAL_DEMO_PHOTOS.length]);
      idx++;
    }

    // Embaralha e seleciona os pares
    pool.sort(() => Math.random() - 0.5);
    const selecionadas = pool.slice(0, pares);

    const cards = [];
    selecionadas.forEach((foto, i) => {
      cards.push({
        id: `card-${i}-A-${Math.random()}`,
        parId: foto.id,
        rotulo: foto.rotulo,
        urlThumb: foto.urlThumb || foto.urlOriginal
      });
      cards.push({
        id: `card-${i}-B-${Math.random()}`,
        parId: foto.id,
        rotulo: foto.rotulo,
        urlThumb: foto.urlThumb || foto.urlOriginal
      });
    });

    cards.sort(() => Math.random() - 0.5);

    return {
      criancaId,
      totalPares: pares,
      cards
    };
  },

  // Registra partida / pontuação
  async salvarPartida(partida) {
    try {
      await fetch(`${API_BASE_URL}/jogos/partida`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partida)
      });
    } catch (_) {}
  }
};
