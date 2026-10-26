package com.minhaturminha.repository;

import com.minhaturminha.model.FotoPersonalizada;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FotoPersonalizadaRepository extends JpaRepository<FotoPersonalizada, Long> {
    List<FotoPersonalizada> findByCriancaId(Long criancaId);
    List<FotoPersonalizada> findByCriancaIdAndCategoria(Long criancaId, String categoria);
}
