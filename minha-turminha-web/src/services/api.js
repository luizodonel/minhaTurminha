// Client API Service com Isolamento por Dispositivo (X-Device-Id) e Fallback Offline Local

const isCapacitorNative =
  typeof window !== 'undefined' &&
  (window.location.protocol === 'capacitor:' ||
    (window.location.hostname === 'localhost' && !window.location.port));

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (isCapacitorNative ? 'https://minhaturminha.luizodonel.cloud/api' : '/api');
export const BACKEND_URL = API_BASE_URL.replace(/\/api\/?$/, '');

const DEVICE_ID_STORAGE_KEY = 'turminha_device_id';

// Gera ou recupera o identificador único e exclusivo deste aparelho/usuário
export function getDeviceId() {
  let deviceId = localStorage.getItem(DEVICE_ID_STORAGE_KEY);
  if (!deviceId || typeof deviceId !== 'string' || deviceId.trim().length < 8) {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      deviceId = `mt_${crypto.randomUUID()}`;
    } else {
      deviceId = `mt_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 12)}`;
    }
    localStorage.setItem(DEVICE_ID_STORAGE_KEY, deviceId);
  }
  return deviceId.trim();
}

// Permite restaurar o código de outro aparelho caso a família troque de celular
export function setDeviceId(newDeviceId) {
  if (!newDeviceId || typeof newDeviceId !== 'string' || newDeviceId.trim().length < 6) {
    return false;
  }
  localStorage.setItem(DEVICE_ID_STORAGE_KEY, newDeviceId.trim());
  return true;
}

function getDeviceHeaders(extraHeaders = {}) {
  return {
    'X-Device-Id': getDeviceId(),
    ...extraHeaders
  };
}

function getLocalChildrenKey() {
  return `turminha_criancas_${getDeviceId()}`;
}

function getLocalPhotosKey(criancaId) {
  return `turminha_fotos_${getDeviceId()}_${criancaId}`;
}

function getLocalProKey() {
  return `turminha_pro_${getDeviceId()}`;
}

// Os 4 jogos gratuitos liberados para todos os usuários
export const FREE_GAME_IDS = ['memoria', 'quem-e-quem', 'raspe-descubra', 'bolhas'];
export const PRO_PRICE_LABEL = 'R$ 9,90';

// Mapeamento automático das fotos reais antigas (Unsplash) para os novos personagens cartoon 3D
const LEGACY_DEMO_MAP = [
  { match: 'photo-1506794778202', rotulo: 'Papai', url: '/demo/papai.jpg' },
  { match: 'photo-1544005313', rotulo: 'Mamãe', url: '/demo/mamae.jpg' },
  { match: 'photo-1543466835', rotulo: 'Totó (Pet)', url: '/demo/cachorro.jpg' },
  { match: 'photo-1581579438747', rotulo: 'Vovó', url: '/demo/vovo_ela.jpg' },
  { match: 'photo-1472099645785', rotulo: 'Vovô', url: '/demo/vovo.jpg' },
  { match: 'photo-1514888286974', rotulo: 'Gatinho', url: '/demo/gatinho.jpg' },
  { match: 'photo-1559454403', rotulo: 'Ursinho', url: '/demo/ursinho.jpg' },
  { match: 'photo-1485965120184', rotulo: 'Bebê', url: '/demo/bebe.jpg' },
  { match: 'photo-1511886929837', rotulo: 'Bebê', url: '/demo/bebe.jpg' }
];

function migrateLegacyDemoUrl(url, rotulo = '') {
  if (!url || typeof url !== 'string') return url;
  if (url.includes('images.unsplash.com')) {
    const byUrl = LEGACY_DEMO_MAP.find(item => url.includes(item.match));
    if (byUrl) return byUrl.url;

    const r = (rotulo || '').toLowerCase();
    if (r.includes('papai')) return '/demo/papai.jpg';
    if (r.includes('mam')) return '/demo/mamae.jpg';
    if (r.includes('vovó') || r.includes('vovo_ela')) return '/demo/vovo_ela.jpg';
    if (r.includes('vovô') || r.includes('vovo')) return '/demo/vovo.jpg';
    if (r.includes('tot') || r.includes('cachorro') || r.includes('pet')) return '/demo/cachorro.jpg';
    if (r.includes('gat')) return '/demo/gatinho.jpg';
    if (r.includes('urs')) return '/demo/ursinho.jpg';
    return '/demo/bebe.jpg';
  }
  return url;
}

// Normaliza qualquer URL de foto (/uploads/...) para a URL completa do backend
export function getFullMediaUrl(url, rotulo = '') {
  if (!url) return '';
  const migrated = migrateLegacyDemoUrl(url, rotulo);
  if (migrated.startsWith('http://') || migrated.startsWith('https://') || migrated.startsWith('data:')) {
    return migrated;
  }
  const cleanPath = migrated.startsWith('/') ? migrated : `/${migrated}`;
  if (cleanPath.startsWith('/demo/')) {
    return cleanPath;
  }
  return `${BACKEND_URL}${cleanPath}`;
}

export function normalizeFoto(foto) {
  if (!foto) return foto;
  const rawThumb = foto.urlThumb || foto.urlOriginal;
  const rawOrig = foto.urlOriginal || foto.urlThumb;
  return {
    ...foto,
    urlThumb: getFullMediaUrl(rawThumb, foto.rotulo),
    urlOriginal: getFullMediaUrl(rawOrig, foto.rotulo)
  };
}

export const INITIAL_DEMO_PHOTOS = [
  { id: 101, rotulo: 'Papai', categoria: 'FAMILIA', isDemo: true, urlThumb: '/demo/papai.jpg' },
  { id: 102, rotulo: 'Mamãe', categoria: 'FAMILIA', isDemo: true, urlThumb: '/demo/mamae.jpg' },
  { id: 103, rotulo: 'Totó (Pet)', categoria: 'PET', isDemo: true, urlThumb: '/demo/cachorro.jpg' },
  { id: 104, rotulo: 'Vovó', categoria: 'FAMILIA', isDemo: true, urlThumb: '/demo/vovo_ela.jpg' },
  { id: 105, rotulo: 'Vovô', categoria: 'FAMILIA', isDemo: true, urlThumb: '/demo/vovo.jpg' },
  { id: 106, rotulo: 'Gatinho', categoria: 'PET', isDemo: true, urlThumb: '/demo/gatinho.jpg' },
  { id: 107, rotulo: 'Ursinho', categoria: 'BRINQUEDO', isDemo: true, urlThumb: '/demo/ursinho.jpg' },
  { id: 108, rotulo: 'Bebê', categoria: 'FAMILIA', isDemo: true, urlThumb: '/demo/bebe.jpg' }
];

export const api = {
  // Lista apenas as crianças vinculadas a este dispositivo
  async getCriancas() {
    const deviceId = getDeviceId();
    try {
      const res = await fetch(`${API_BASE_URL}/criancas?deviceId=${encodeURIComponent(deviceId)}`, {
        headers: getDeviceHeaders(),
        signal: AbortSignal.timeout(4000)
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          localStorage.setItem(getLocalChildrenKey(), JSON.stringify(data));
          return data;
        }
      }
    } catch (_) {}

    // Fallback Local isolado por dispositivo
    const local = localStorage.getItem(getLocalChildrenKey());
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) return parsed;
      } catch (_) {}
    }
    return [];
  },

  // Cria uma nova criança vinculada a este dispositivo
  async createCrianca(crianca) {
    const deviceId = getDeviceId();
    try {
      const res = await fetch(`${API_BASE_URL}/criancas?deviceId=${encodeURIComponent(deviceId)}`, {
        method: 'POST',
        headers: getDeviceHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(crianca)
      });
      if (res.ok) {
        const created = await res.json();
        const current = JSON.parse(localStorage.getItem(getLocalChildrenKey()) || '[]');
        localStorage.setItem(getLocalChildrenKey(), JSON.stringify([...current, created]));
        return created;
      }
    } catch (_) {}

    // Fallback Local
    const current = await this.getCriancas();
    const nova = {
      ...crianca,
      id: Date.now(),
      deviceId,
      totalFotos: 0,
      avatarUrl: crianca.avatarUrl || '🦁'
    };
    current.push(nova);
    localStorage.setItem(getLocalChildrenKey(), JSON.stringify(current));
    return nova;
  },

  // Remove uma criança vinculada a este dispositivo
  async deleteCrianca(criancaId) {
    const deviceId = getDeviceId();
    try {
      await fetch(`${API_BASE_URL}/criancas/${criancaId}?deviceId=${encodeURIComponent(deviceId)}`, {
        method: 'DELETE',
        headers: getDeviceHeaders()
      });
    } catch (_) {}

    const current = JSON.parse(localStorage.getItem(getLocalChildrenKey()) || '[]');
    const filtradas = current.filter(c => c.id !== criancaId);
    localStorage.setItem(getLocalChildrenKey(), JSON.stringify(filtradas));
    localStorage.removeItem(getLocalPhotosKey(criancaId));
  },

  // Busca fotos da criança (apenas se pertencer a este dispositivo)
  async getFotos(criancaId) {
    if (!criancaId) {
      return INITIAL_DEMO_PHOTOS.map(normalizeFoto);
    }
    const deviceId = getDeviceId();
    try {
      const res = await fetch(`${API_BASE_URL}/criancas/${criancaId}/fotos?deviceId=${encodeURIComponent(deviceId)}`, {
        headers: getDeviceHeaders(),
        signal: AbortSignal.timeout(4000)
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data.map(normalizeFoto);
        }
      }
    } catch (_) {}

    // Fallback Local ou Fotos Demo iniciais para esta criança
    const local = localStorage.getItem(getLocalPhotosKey(criancaId));
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) {
          const hasLegacy = parsed.some(
            f => (f?.urlThumb || '').includes('images.unsplash.com') || (f?.urlOriginal || '').includes('images.unsplash.com')
          );
          const normalized = parsed.map(normalizeFoto);
          if (hasLegacy) {
            localStorage.setItem(getLocalPhotosKey(criancaId), JSON.stringify(normalized));
          }
          return normalized;
        }
      } catch (_) {}
    }
    localStorage.setItem(getLocalPhotosKey(criancaId), JSON.stringify(INITIAL_DEMO_PHOTOS));
    return INITIAL_DEMO_PHOTOS.map(normalizeFoto);
  },

  // Upload de foto vinculada à criança deste dispositivo
  async uploadFoto(criancaId, rotulo, categoria, file) {
    const deviceId = getDeviceId();
    try {
      const formData = new FormData();
      formData.append('rotulo', rotulo);
      formData.append('categoria', categoria);
      formData.append('arquivo', file);

      const res = await fetch(`${API_BASE_URL}/criancas/${criancaId}/fotos?deviceId=${encodeURIComponent(deviceId)}`, {
        method: 'POST',
        headers: getDeviceHeaders(),
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

    // Fallback Local (Base64 para rodar direto no navegador offline)
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target.result;
        const current = JSON.parse(localStorage.getItem(getLocalPhotosKey(criancaId)) || '[]');
        const semDemo = current.filter(f => !f.isDemo);
        const novaFoto = {
          id: Date.now(),
          rotulo: rotulo || 'Amigo',
          categoria: categoria || 'FAMILIA',
          urlOriginal: base64,
          urlThumb: base64
        };
        semDemo.unshift(novaFoto);
        localStorage.setItem(getLocalPhotosKey(criancaId), JSON.stringify(semDemo));
        resolve(normalizeFoto(novaFoto));
      };
      reader.readAsDataURL(file);
    });
  },

  // Deleta foto vinculada a este dispositivo
  async deleteFoto(criancaId, fotoId) {
    const deviceId = getDeviceId();
    try {
      await fetch(`${API_BASE_URL}/fotos/${fotoId}?deviceId=${encodeURIComponent(deviceId)}`, {
        method: 'DELETE',
        headers: getDeviceHeaders()
      });
    } catch (_) {}

    const current = JSON.parse(localStorage.getItem(getLocalPhotosKey(criancaId)) || '[]');
    const filtradas = current.filter(f => f.id !== fotoId);
    localStorage.setItem(getLocalPhotosKey(criancaId), JSON.stringify(filtradas));
  },

  // Restaura as fotos de demonstração localmente para a criança
  restoreDemoPhotos(criancaId) {
    if (!criancaId) return;
    localStorage.setItem(getLocalPhotosKey(criancaId), JSON.stringify(INITIAL_DEMO_PHOTOS));
  },

  // Configura tabuleiro do Jogo da Memória
  async getJogoMemoriaSetup(criancaId, pares = 6) {
    const deviceId = getDeviceId();
    if (criancaId) {
      try {
        const res = await fetch(
          `${API_BASE_URL}/jogos/memoria/setup?criancaId=${criancaId}&pares=${pares}&deviceId=${encodeURIComponent(deviceId)}`,
          {
            headers: getDeviceHeaders(),
            signal: AbortSignal.timeout(4000)
          }
        );
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
    }

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
    if (!partida?.criancaId) return;
    const deviceId = getDeviceId();
    try {
      await fetch(`${API_BASE_URL}/jogos/partida?deviceId=${encodeURIComponent(deviceId)}`, {
        method: 'POST',
        headers: getDeviceHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(partida)
      });
    } catch (_) {}
  },

  // Consulta se este dispositivo possui a licença PRO Vitalícia ativa
  async getLicencaStatus() {
    const deviceId = getDeviceId();
    try {
      const res = await fetch(`${API_BASE_URL}/licenca?deviceId=${encodeURIComponent(deviceId)}`, {
        headers: getDeviceHeaders(),
        signal: AbortSignal.timeout(4000)
      });
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data.isPro === 'boolean') {
          if (data.isPro) {
            localStorage.setItem(getLocalProKey(), 'true');
          }
          return data.isPro;
        }
      }
    } catch (_) {}

    return localStorage.getItem(getLocalProKey()) === 'true';
  },

  // Ativa o acesso PRO Vitalício (R$ 9,90) para este dispositivo
  async ativarPro(purchaseToken = 'PLAYSTORE_LIFETIME_990') {
    const deviceId = getDeviceId();
    localStorage.setItem(getLocalProKey(), 'true');
    try {
      const res = await fetch(`${API_BASE_URL}/licenca/ativar?deviceId=${encodeURIComponent(deviceId)}`, {
        method: 'POST',
        headers: getDeviceHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ purchaseToken })
      });
      if (res.ok) {
        return true;
      }
    } catch (_) {}
    return true;
  }
};
