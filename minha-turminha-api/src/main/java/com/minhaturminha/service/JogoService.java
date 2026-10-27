package com.minhaturminha.service;

import com.minhaturminha.dto.CardMemoriaDTO;
import com.minhaturminha.dto.JogoMemoriaSetupDTO;
import com.minhaturminha.dto.PartidaRequestDTO;
import com.minhaturminha.model.Crianca;
import com.minhaturminha.model.FotoPersonalizada;
import com.minhaturminha.model.PartidaJogo;
import com.minhaturminha.repository.CriancaRepository;
import com.minhaturminha.repository.FotoPersonalizadaRepository;
import com.minhaturminha.repository.PartidaJogoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class JogoService {

    private final CriancaRepository criancaRepository;
    private final FotoPersonalizadaRepository fotoRepository;
    private final PartidaJogoRepository partidaRepository;

    private static final String[][] DEMO_PHOTOS = {
        {"Papai", "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=320&auto=format&fit=crop&q=80"},
        {"Mam\u00e3e", "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=320&auto=format&fit=crop&q=80"},
        {"Tot\u00f3 (Pet)", "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=320&auto=format&fit=crop&q=80"},
        {"Vov\u00f3", "https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=320&auto=format&fit=crop&q=80"},
        {"Vov\u00f4", "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=320&auto=format&fit=crop&q=80"},
        {"Bicicleta", "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=320&auto=format&fit=crop&q=80"},
        {"Ursinho", "https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=320&auto=format&fit=crop&q=80"},
        {"Bola", "https://images.unsplash.com/photo-1511886929837-354d827aae26?w=320&auto=format&fit=crop&q=80"}
    };

    @Transactional(readOnly = true)
    public JogoMemoriaSetupDTO gerarJogoMemoria(Long criancaId, int totalParesSolicitados, String deviceId) {
        int totalPares = Math.max(3, Math.min(totalParesSolicitados, 12)); // Entre 3 e 12 pares
        Optional<Crianca> criancaOpt = (deviceId != null && !deviceId.isBlank())
                ? criancaRepository.findByIdAndDeviceId(criancaId, deviceId.trim())
                : Optional.empty();
        String nomeCrianca = criancaOpt.map(Crianca::getNome).orElse("Minha Turminha");

        List<FotoPersonalizada> fotos = criancaOpt.isPresent()
                ? fotoRepository.findByCriancaId(criancaId)
                : Collections.emptyList();
        List<CardMemoriaDTO> cards = new ArrayList<>();

        List<PhotoSource> baseSources = new ArrayList<>();

        for (FotoPersonalizada f : fotos) {
            baseSources.add(new PhotoSource(f.getId(), f.getRotulo(), f.getUrlThumb()));
        }

        // Se a criança tiver menos fotos que o número de pares, complementa com itens lúdicos de demonstração
        int demoIdx = 0;
        long demoIdGen = 10000L;
        while (baseSources.size() < totalPares) {
            String[] demo = DEMO_PHOTOS[demoIdx % DEMO_PHOTOS.length];
            baseSources.add(new PhotoSource(demoIdGen++, demo[0], demo[1]));
            demoIdx++;
        }

        // Embaralha as fontes selecionadas e pega exatamente a quantidade de pares
        Collections.shuffle(baseSources);
        List<PhotoSource> selecionadas = baseSources.subList(0, totalPares);

        // Duplica cada foto para criar os 2 pares
        for (PhotoSource source : selecionadas) {
            cards.add(CardMemoriaDTO.builder()
                    .id(UUID.randomUUID().toString())
                    .parId(source.id)
                    .rotulo(source.rotulo)
                    .urlThumb(source.urlThumb)
                    .build());

            cards.add(CardMemoriaDTO.builder()
                    .id(UUID.randomUUID().toString())
                    .parId(source.id)
                    .rotulo(source.rotulo)
                    .urlThumb(source.urlThumb)
                    .build());
        }

        // Embaralha o tabuleiro final para a criança jogar
        Collections.shuffle(cards);

        return JogoMemoriaSetupDTO.builder()
                .criancaId(criancaId)
                .criancaNome(nomeCrianca)
                .totalPares(totalPares)
                .cards(cards)
                .build();
    }

    @Transactional
    public PartidaJogo registrarPartida(PartidaRequestDTO req, String deviceId) {
        if (deviceId == null || deviceId.isBlank()) {
            throw new IllegalArgumentException("Identificador do dispositivo é obrigatório");
        }
        Crianca crianca = criancaRepository.findByIdAndDeviceId(req.getCriancaId(), deviceId.trim())
                .orElseThrow(() -> new IllegalArgumentException("Criança não encontrada para este dispositivo"));

        PartidaJogo partida = PartidaJogo.builder()
                .crianca(crianca)
                .tipoJogo(req.getTipoJogo() != null ? req.getTipoJogo().toUpperCase() : "MEMORIA")
                .pontuacao(req.getPontuacao() != null ? req.getPontuacao() : 100)
                .tempoSegundos(req.getTempoSegundos() != null ? req.getTempoSegundos() : 0)
                .tentativas(req.getTentativas() != null ? req.getTentativas() : 0)
                .build();

        return partidaRepository.save(partida);
    }

    private static class PhotoSource {
        final Long id;
        final String rotulo;
        final String urlThumb;

        PhotoSource(Long id, String rotulo, String urlThumb) {
            this.id = id;
            this.rotulo = rotulo;
            this.urlThumb = urlThumb;
        }
    }
}
