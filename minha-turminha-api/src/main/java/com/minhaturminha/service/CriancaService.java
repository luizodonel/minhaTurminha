package com.minhaturminha.service;

import com.minhaturminha.dto.CriancaDTO;
import com.minhaturminha.model.Crianca;
import com.minhaturminha.repository.CriancaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CriancaService {

    private final CriancaRepository criancaRepository;

    @Transactional(readOnly = true)
    public List<CriancaDTO> listarTodas() {
        return criancaRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<Crianca> buscarPorId(Long id) {
        return criancaRepository.findById(id);
    }

    @Transactional
    public Crianca salvar(Crianca crianca) {
        return criancaRepository.save(crianca);
    }

    @Transactional
    public void deletar(Long id) {
        criancaRepository.deleteById(id);
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
