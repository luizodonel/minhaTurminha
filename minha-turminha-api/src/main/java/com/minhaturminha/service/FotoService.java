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
import java.util.List;

@Service
@RequiredArgsConstructor
public class FotoService {

    private final FotoPersonalizadaRepository fotoRepository;
    private final CriancaRepository criancaRepository;
    private final FileStorageService fileStorageService;

    @Transactional(readOnly = true)
    public List<FotoPersonalizada> listarPorCrianca(Long criancaId) {
        return fotoRepository.findByCriancaId(criancaId);
    }

    @Transactional
    public FotoPersonalizada adicionarFoto(Long criancaId, String rotulo, String categoria, MultipartFile arquivo) throws IOException {
        Crianca crianca = criancaRepository.findById(criancaId)
                .orElseThrow(() -> new IllegalArgumentException("Criança não encontrada com o ID: " + criancaId));

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
    public void removerFoto(Long fotoId) {
        fotoRepository.findById(fotoId).ifPresent(foto -> {
            fileStorageService.deletePhoto(foto.getUrlOriginal());
            fileStorageService.deletePhoto(foto.getUrlThumb());
            fotoRepository.delete(foto);
        });
    }
}
