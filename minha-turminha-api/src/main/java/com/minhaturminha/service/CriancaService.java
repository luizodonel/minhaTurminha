package com.minhaturminha.service;

import com.minhaturminha.dto.CriancaDTO;
import com.minhaturminha.model.Crianca;
import com.minhaturminha.repository.CriancaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CriancaService {

    private final CriancaRepository criancaRepository;
    private final FileStorageService fileStorageService;

    @Transactional(readOnly = true)
    public List<CriancaDTO> listarPorDispositivo(String deviceId) {
        if (deviceId == null || deviceId.isBlank()) {
            return Collections.emptyList();
        }
        return criancaRepository.findByDeviceIdOrderByIdAsc(deviceId.trim()).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<Crianca> buscarPorIdEDispositivo(Long id, String deviceId) {
        if (deviceId == null || deviceId.isBlank()) {
            return Optional.empty();
        }
        return criancaRepository.findByIdAndDeviceId(id, deviceId.trim());
    }

    @Transactional
    public Crianca salvar(Crianca crianca, String deviceId) {
        if (deviceId == null || deviceId.isBlank()) {
            throw new IllegalArgumentException("Identificador do dispositivo (X-Device-Id) é obrigatório");
        }
        crianca.setDeviceId(deviceId.trim());
        return criancaRepository.save(crianca);
    }

    @Transactional
    public Optional<Crianca> atualizar(Long id, Crianca dados, String deviceId) {
        if (deviceId == null || deviceId.isBlank()) {
            return Optional.empty();
        }
        return criancaRepository.findByIdAndDeviceId(id, deviceId.trim()).map(existente -> {
            if (dados.getNome() != null && !dados.getNome().isBlank()) {
                existente.setNome(dados.getNome().trim());
            }
            if (dados.getIdade() != null) {
                existente.setIdade(dados.getIdade());
            }
            if (dados.getAvatarUrl() != null && !dados.getAvatarUrl().isBlank()) {
                existente.setAvatarUrl(dados.getAvatarUrl().trim());
            }
            return criancaRepository.save(existente);
        });
    }

    @Transactional
    public boolean deletar(Long id, String deviceId) {
        if (deviceId == null || deviceId.isBlank()) {
            return false;
        }
        return criancaRepository.findByIdAndDeviceId(id, deviceId.trim()).map(crianca -> {
            if (crianca.getFotos() != null) {
                crianca.getFotos().forEach(foto -> {
                    fileStorageService.deletePhoto(foto.getUrlOriginal());
                    fileStorageService.deletePhoto(foto.getUrlThumb());
                });
            }
            criancaRepository.delete(crianca);
            return true;
        }).orElse(false);
    }

    public CriancaDTO toDTO(Crianca crianca) {
        return CriancaDTO.builder()
                .id(crianca.getId())
                .nome(crianca.getNome())
                .idade(crianca.getIdade())
                .avatarUrl(crianca.getAvatarUrl())
                .totalFotos(crianca.getFotos() != null ? crianca.getFotos().size() : 0)
                .build();
    }
}
