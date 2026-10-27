package com.minhaturminha.service;

import com.minhaturminha.model.Crianca;
import com.minhaturminha.model.FotoPersonalizada;
import com.minhaturminha.repository.CriancaRepository;
import com.minhaturminha.repository.FotoPersonalizadaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FotoService {

    private final FotoPersonalizadaRepository fotoRepository;
    private final CriancaRepository criancaRepository;
    private final FileStorageService fileStorageService;

    @Transactional(readOnly = true)
    public List<FotoPersonalizada> listarPorCrianca(Long criancaId, String deviceId) {
        if (deviceId == null || deviceId.isBlank()) {
            return Collections.emptyList();
        }
        return criancaRepository.findByIdAndDeviceId(criancaId, deviceId.trim())
                .map(c -> fotoRepository.findByCriancaId(c.getId()))
                .orElse(Collections.emptyList());
    }

    @Transactional
    public FotoPersonalizada adicionarFoto(Long criancaId, String deviceId, String rotulo, String categoria, MultipartFile arquivo) throws IOException {
        if (deviceId == null || deviceId.isBlank()) {
            throw new IllegalArgumentException("Identificador do dispositivo (X-Device-Id) é obrigatório");
        }
        Crianca crianca = criancaRepository.findByIdAndDeviceId(criancaId, deviceId.trim())
                .orElseThrow(() -> new IllegalArgumentException("Criança não encontrada para este dispositivo"));

        FileStorageService.StoredFilePaths paths = fileStorageService.storePhoto(arquivo);

        FotoPersonalizada foto = FotoPersonalizada.builder()
                .crianca(crianca)
                .rotulo(rotulo != null && !rotulo.isBlank() ? rotulo.trim() : "Amigo")
                .categoria(categoria != null && !categoria.isBlank() ? categoria.trim().toUpperCase() : "FAMILIA")
                .urlOriginal(paths.originalUrl)
                .urlThumb(paths.thumbUrl)
                .build();

        return fotoRepository.save(foto);
    }

    @Transactional
    public void removerFoto(Long fotoId, String deviceId) {
        if (deviceId == null || deviceId.isBlank()) {
            return;
        }
        fotoRepository.findById(fotoId).ifPresent(foto -> {
            if (foto.getCrianca() != null && deviceId.trim().equals(foto.getCrianca().getDeviceId())) {
                fileStorageService.deletePhoto(foto.getUrlOriginal());
                fileStorageService.deletePhoto(foto.getUrlThumb());
                fotoRepository.delete(foto);
            }
        });
    }
}
