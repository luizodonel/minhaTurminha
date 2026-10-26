package com.minhaturminha.repository;

import com.minhaturminha.model.PartidaJogo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PartidaJogoRepository extends JpaRepository<PartidaJogo, Long> {
    List<PartidaJogo> findByCriancaIdOrderByDataPartidaDesc(Long criancaId);
    List<PartidaJogo> findByCriancaIdAndTipoJogoOrderByDataPartidaDesc(Long criancaId, String tipoJogo);
}
